using System;
using System.Collections.Generic;
using System.Data;
using System.Diagnostics;
using Microsoft.Data.SqlClient;
using Npgsql;
using NpgsqlTypes;

namespace AgriPhd.Migrator;

public class Program
{
    private const string SqlServerConnStr = "Data Source=localhost\\SQLEXPRESS;Initial Catalog=2025_AgriPHD_Live;Integrated Security=True;TrustServerCertificate=True;Connection Timeout=60;";
    private const string PostgresConnStr = "Host=localhost;Port=5432;Database=agri_phd_live;Username=postgres;Password=postgres_dev_password_2026;Include Error Detail=true;Timeout=60;Command Timeout=300;";

    public static async Task<int> Main(string[] args)
    {
        Console.WriteLine("=================================================================");
        Console.WriteLine("  AgriPHD 2026 — SQL Server to PostgreSQL Data & Schema Migrator");
        Console.WriteLine("=================================================================\n");

        var sw = Stopwatch.StartNew();

        try
        {
            Console.WriteLine("1. Testing connections...");
            using (var sqlTest = new SqlConnection(SqlServerConnStr))
            {
                await sqlTest.OpenAsync();
                Console.WriteLine("   [OK] Connected to SQL Server (2025_AgriPHD_Live).");
            }

            using (var pgTest = new NpgsqlConnection(PostgresConnStr))
            {
                await pgTest.OpenAsync();
                Console.WriteLine("   [OK] Connected to PostgreSQL in Docker (agri_phd_live).");
            }

            // 2. Retrieve table list
            var tables = await GetTableListAsync();
            Console.WriteLine($"\n2. Discovered {tables.Count} user tables to migrate.");

            using var pgCon = new NpgsqlConnection(PostgresConnStr);
            await pgCon.OpenAsync();

            // Disable triggers / FK enforcement during data load
            using (var cmd = new NpgsqlCommand("SET session_replication_role = 'replica';", pgCon))
            {
                await cmd.ExecuteNonQueryAsync();
            }

            int successCount = 0;
            int failureCount = 0;
            long totalRowsMigrated = 0;
            var mismatchedTables = new List<(string Table, long SqlRows, long PgRows)>();

            Console.WriteLine("\n3. Migrating Schema and Data table-by-table...\n");

            foreach (var table in tables)
            {
                try
                {
                    // A. Extract Schema
                    var cols = await GetColumnsAsync(table);
                    var pks = await GetPrimaryKeysAsync(table);

                    // B. Create Table in PostgreSQL
                    await CreatePgTableAsync(pgCon, table, cols, pks);

                    // C. Copy Data
                    long rows = await CopyTableDataAsync(table, cols, pgCon);
                    totalRowsMigrated += rows;

                    // D. Resync sequences
                    await ResyncSequencesAsync(pgCon, table, cols);

                    // E. Verify Row Count
                    long sqlCount = await GetSqlRowCountAsync(table);
                    long pgCount = await GetPgRowCountAsync(pgCon, table);

                    if (sqlCount == pgCount)
                    {
                        Console.WriteLine($"   [OK] {table,-45} | Migrated {pgCount,6} rows");
                        successCount++;
                    }
                    else
                    {
                        Console.ForegroundColor = ConsoleColor.Yellow;
                        Console.WriteLine($"   [WARN] {table,-43} | Mismatch: SQL={sqlCount}, PG={pgCount}");
                        Console.ResetColor();
                        mismatchedTables.Add((table, sqlCount, pgCount));
                        successCount++;
                    }
                }
                catch (Exception ex)
                {
                    Console.ForegroundColor = ConsoleColor.Red;
                    Console.WriteLine($"   [FAIL] {table,-43} | Error: {ex.Message}");
                    Console.ResetColor();
                    failureCount++;
                }
            }

            // Re-enable triggers / FK enforcement
            using (var cmd = new NpgsqlCommand("SET session_replication_role = 'origin';", pgCon))
            {
                await cmd.ExecuteNonQueryAsync();
            }

            sw.Stop();

            Console.WriteLine("\n=================================================================");
            Console.WriteLine($"  MIGRATION SUMMARY:");
            Console.WriteLine($"  Total Tables Attempted: {tables.Count}");
            Console.WriteLine($"  Successful:             {successCount}");
            Console.WriteLine($"  Failed:                 {failureCount}");
            Console.WriteLine($"  Total Rows Migrated:    {totalRowsMigrated:N0}");
            Console.WriteLine($"  Elapsed Time:           {sw.Elapsed.TotalSeconds:F2} seconds");
            Console.WriteLine("=================================================================");

            if (mismatchedTables.Count > 0)
            {
                Console.WriteLine("\nMismatched Tables:");
                foreach (var item in mismatchedTables)
                {
                    Console.WriteLine($"  - {item.Table}: SQL={item.SqlRows}, PG={item.PgRows}");
                }
            }

            return failureCount == 0 ? 0 : 1;
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"\n[FATAL] Migration aborted: {ex.Message}\n{ex.StackTrace}");
            Console.ResetColor();
            return 2;
        }
    }

    private static async Task<List<string>> GetTableListAsync()
    {
        var list = new List<string>();
        using var con = new SqlConnection(SqlServerConnStr);
        await con.OpenAsync();
        using var cmd = con.CreateCommand();
        cmd.CommandText = "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' AND TABLE_NAME <> 'sysdiagrams' ORDER BY TABLE_NAME";
        using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            list.Add(r.GetString(0));
        }
        return list;
    }

    private static async Task<List<ColumnInfo>> GetColumnsAsync(string tableName)
    {
        var list = new List<ColumnInfo>();
        using var con = new SqlConnection(SqlServerConnStr);
        await con.OpenAsync();
        using var cmd = con.CreateCommand();
        cmd.CommandText = @"
            SELECT 
                c.COLUMN_NAME, 
                c.DATA_TYPE, 
                c.CHARACTER_MAXIMUM_LENGTH, 
                c.NUMERIC_PRECISION, 
                c.NUMERIC_SCALE, 
                c.IS_NULLABLE,
                COLUMNPROPERTY(object_id(c.TABLE_SCHEMA + '.' + c.TABLE_NAME), c.COLUMN_NAME, 'IsIdentity') as IsIdentity
            FROM INFORMATION_SCHEMA.COLUMNS c
            WHERE c.TABLE_NAME = @TableName
            ORDER BY c.ORDINAL_POSITION";
        cmd.Parameters.AddWithValue("@TableName", tableName);
        using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            list.Add(new ColumnInfo
            {
                Name = r.GetString(0),
                DataType = r.GetString(1).ToLowerInvariant(),
                MaxLength = r.IsDBNull(2) ? null : r.GetInt32(2),
                Precision = r.IsDBNull(3) ? null : Convert.ToInt32(r[3]),
                Scale = r.IsDBNull(4) ? null : Convert.ToInt32(r[4]),
                IsNullable = r.GetString(5).Equals("YES", StringComparison.OrdinalIgnoreCase),
                IsIdentity = !r.IsDBNull(6) && Convert.ToInt32(r[6]) == 1
            });
        }
        return list;
    }

    private static async Task<List<string>> GetPrimaryKeysAsync(string tableName)
    {
        var list = new List<string>();
        using var con = new SqlConnection(SqlServerConnStr);
        await con.OpenAsync();
        using var cmd = con.CreateCommand();
        cmd.CommandText = @"
            SELECT kcu.COLUMN_NAME
            FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
            JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu 
              ON tc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
            WHERE tc.CONSTRAINT_TYPE = 'PRIMARY KEY' AND tc.TABLE_NAME = @TableName
            ORDER BY kcu.ORDINAL_POSITION";
        cmd.Parameters.AddWithValue("@TableName", tableName);
        using var r = await cmd.ExecuteReaderAsync();
        while (await r.ReadAsync())
        {
            list.Add(r.GetString(0));
        }
        return list;
    }

    private static async Task CreatePgTableAsync(NpgsqlConnection pgCon, string tableName, List<ColumnInfo> columns, List<string> pks)
    {
        // Drop if exists first to allow clean reruns
        using (var dropCmd = new NpgsqlCommand($"DROP TABLE IF EXISTS \"{tableName.ToLowerInvariant()}\" CASCADE;", pgCon))
        {
            await dropCmd.ExecuteNonQueryAsync();
        }

        var colDefs = new List<string>();
        foreach (var col in columns)
        {
            string pgType = MapToPgType(col);
            string nullability = col.IsNullable ? "NULL" : "NOT NULL";
            string identity = col.IsIdentity ? "GENERATED BY DEFAULT AS IDENTITY" : "";
            colDefs.Add($"\"{col.Name.ToLowerInvariant()}\" {pgType} {identity} {nullability}".Trim());
        }

        if (pks.Count > 0)
        {
            var pkCols = string.Join(", ", pks.Select(p => $"\"{p.ToLowerInvariant()}\""));
            colDefs.Add($"CONSTRAINT \"pk_{tableName.ToLowerInvariant()}\" PRIMARY KEY ({pkCols})");
        }

        string ddl = $"CREATE TABLE \"{tableName.ToLowerInvariant()}\" (\n    " + string.Join(",\n    ", colDefs) + "\n);";
        using (var createCmd = new NpgsqlCommand(ddl, pgCon))
        {
            await createCmd.ExecuteNonQueryAsync();
        }
    }

    private static string MapToPgType(ColumnInfo col)
    {
        return col.DataType switch
        {
            "bigint" => "BIGINT",
            "int" => "INTEGER",
            "smallint" => "SMALLINT",
            "tinyint" => "SMALLINT",
            "bit" => "BOOLEAN",
            "decimal" or "numeric" => col.Precision.HasValue && col.Scale.HasValue
                ? $"NUMERIC({col.Precision.Value},{col.Scale.Value})"
                : "NUMERIC",
            "money" or "smallmoney" => "NUMERIC(19,4)",
            "float" => "DOUBLE PRECISION",
            "real" => "REAL",
            "datetime" or "datetime2" or "smalldatetime" => "TIMESTAMP WITHOUT TIME ZONE",
            "date" => "DATE",
            "time" => "TIME",
            "char" or "nchar" => col.MaxLength.HasValue && col.MaxLength.Value > 0 && col.MaxLength.Value <= 8000
                ? $"CHAR({col.MaxLength.Value})"
                : "CHAR(1)",
            "varchar" or "nvarchar" => col.MaxLength.HasValue && col.MaxLength.Value > 0 && col.MaxLength.Value <= 8000
                ? $"VARCHAR({col.MaxLength.Value})"
                : "TEXT",
            "text" or "ntext" => "TEXT",
            "uniqueidentifier" => "UUID",
            "varbinary" or "binary" or "image" => "BYTEA",
            _ => "TEXT"
        };
    }

    private static async Task<long> CopyTableDataAsync(string tableName, List<ColumnInfo> columns, NpgsqlConnection pgCon)
    {
        using var sqlCon = new SqlConnection(SqlServerConnStr);
        await sqlCon.OpenAsync();

        using var sqlCmd = sqlCon.CreateCommand();
        sqlCmd.CommandTimeout = 300;
        sqlCmd.CommandText = $"SELECT * FROM [{tableName}]";

        using var reader = await sqlCmd.ExecuteReaderAsync();
        if (!reader.HasRows) return 0;

        string colList = string.Join(", ", columns.Select(c => $"\"{c.Name.ToLowerInvariant()}\""));
        string copySql = $"COPY \"{tableName.ToLowerInvariant()}\" ({colList}) FROM STDIN (FORMAT BINARY)";

        using var importer = await pgCon.BeginBinaryImportAsync(copySql);
        long count = 0;

        while (await reader.ReadAsync())
        {
            await importer.StartRowAsync();
            for (int i = 0; i < columns.Count; i++)
            {
                var col = columns[i];
                if (reader.IsDBNull(i))
                {
                    await importer.WriteNullAsync();
                    continue;
                }

                object val = reader.GetValue(i);
                await WriteTypedValueAsync(importer, col, val);
            }
            count++;
        }

        await importer.CompleteAsync();
        return count;
    }

    private static async Task WriteTypedValueAsync(NpgsqlBinaryImporter importer, ColumnInfo col, object val)
    {
        switch (col.DataType)
        {
            case "bigint":
                await importer.WriteAsync(Convert.ToInt64(val), NpgsqlDbType.Bigint);
                break;
            case "int":
                await importer.WriteAsync(Convert.ToInt32(val), NpgsqlDbType.Integer);
                break;
            case "smallint":
                await importer.WriteAsync(Convert.ToInt16(val), NpgsqlDbType.Smallint);
                break;
            case "tinyint":
                await importer.WriteAsync((short)Convert.ToByte(val), NpgsqlDbType.Smallint);
                break;
            case "bit":
                await importer.WriteAsync(Convert.ToBoolean(val), NpgsqlDbType.Boolean);
                break;
            case "decimal":
            case "numeric":
            case "money":
            case "smallmoney":
                await importer.WriteAsync(Convert.ToDecimal(val), NpgsqlDbType.Numeric);
                break;
            case "float":
                await importer.WriteAsync(Convert.ToDouble(val), NpgsqlDbType.Double);
                break;
            case "real":
                await importer.WriteAsync(Convert.ToSingle(val), NpgsqlDbType.Real);
                break;
            case "datetime":
            case "datetime2":
            case "smalldatetime":
                await importer.WriteAsync(Convert.ToDateTime(val), NpgsqlDbType.Timestamp);
                break;
            case "date":
                await importer.WriteAsync(DateOnly.FromDateTime(Convert.ToDateTime(val)), NpgsqlDbType.Date);
                break;
            case "time":
                await importer.WriteAsync((TimeSpan)val, NpgsqlDbType.Time);
                break;
            case "uniqueidentifier":
                await importer.WriteAsync((Guid)val, NpgsqlDbType.Uuid);
                break;
            case "varbinary":
            case "binary":
            case "image":
                await importer.WriteAsync((byte[])val, NpgsqlDbType.Bytea);
                break;
            default:
                await importer.WriteAsync(Convert.ToString(val) ?? string.Empty, NpgsqlDbType.Text);
                break;
        }
    }

    private static async Task ResyncSequencesAsync(NpgsqlConnection pgCon, string tableName, List<ColumnInfo> columns)
    {
        foreach (var col in columns.Where(c => c.IsIdentity))
        {
            string seqSql = $@"
                SELECT setval(
                    pg_get_serial_sequence('""{tableName.ToLowerInvariant()}""', '""{col.Name.ToLowerInvariant()}""'),
                    COALESCE((SELECT MAX(""{col.Name.ToLowerInvariant()}"") FROM ""{tableName.ToLowerInvariant()}""), 1)
                );";
            try
            {
                using var cmd = new NpgsqlCommand(seqSql, pgCon);
                await cmd.ExecuteNonQueryAsync();
            }
            catch
            {
                // Ignore if no identity sequence created
            }
        }
    }

    private static async Task<long> GetSqlRowCountAsync(string tableName)
    {
        using var con = new SqlConnection(SqlServerConnStr);
        await con.OpenAsync();
        using var cmd = con.CreateCommand();
        cmd.CommandText = $"SELECT COUNT_BIG(*) FROM [{tableName}]";
        var res = await cmd.ExecuteScalarAsync();
        return Convert.ToInt64(res);
    }

    private static async Task<long> GetPgRowCountAsync(NpgsqlConnection pgCon, string tableName)
    {
        using var cmd = new NpgsqlCommand($"SELECT COUNT(*) FROM \"{tableName.ToLowerInvariant()}\"", pgCon);
        var res = await cmd.ExecuteScalarAsync();
        return Convert.ToInt64(res);
    }
}

public class ColumnInfo
{
    public string Name { get; set; } = string.Empty;
    public string DataType { get; set; } = string.Empty;
    public int? MaxLength { get; set; }
    public int? Precision { get; set; }
    public int? Scale { get; set; }
    public bool IsNullable { get; set; }
    public bool IsIdentity { get; set; }
}

