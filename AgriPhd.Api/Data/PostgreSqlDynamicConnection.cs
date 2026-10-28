using System.Collections;
using System.Data;
using System.Data.Common;
using System.Text;
using Npgsql;

namespace AgriPhd.Api.Data;

/// <summary>
/// A transparent DbConnection wrapper around NpgsqlConnection that translates
/// CommandType.StoredProcedure into PostgreSQL function invocations (SELECT * FROM func(...)).
/// This allows existing Dapper repositories written for SQL Server stored procedures
/// to execute against PostgreSQL without modifying any repository code.
/// </summary>
public class PostgreSqlDynamicConnection : DbConnection
{
    private readonly NpgsqlConnection _inner;

    public PostgreSqlDynamicConnection(string connectionString)
    {
        _inner = new NpgsqlConnection(connectionString);
    }

    public PostgreSqlDynamicConnection(NpgsqlConnection inner)
    {
        _inner = inner;
    }

    public NpgsqlConnection InnerConnection => _inner;

    public override string ConnectionString
    {
        get => _inner.ConnectionString;
        set => _inner.ConnectionString = value ?? string.Empty;
    }

    public override string Database => _inner.Database;
    public override string DataSource => _inner.DataSource;
    public override string ServerVersion => _inner.ServerVersion;
    public override ConnectionState State => _inner.State;

    public override void ChangeDatabase(string databaseName) => _inner.ChangeDatabase(databaseName);
    public override void Close() => _inner.Close();
    public override void Open() => _inner.Open();
    public override Task OpenAsync(CancellationToken cancellationToken) => _inner.OpenAsync(cancellationToken);

    protected override DbTransaction BeginDbTransaction(IsolationLevel isolationLevel) => _inner.BeginTransaction(isolationLevel);

    protected override DbCommand CreateDbCommand()
    {
        var innerCmd = _inner.CreateCommand();
        return new PostgreSqlDynamicCommand(innerCmd, this);
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _inner.Dispose();
        }
        base.Dispose(disposing);
    }

    public override async ValueTask DisposeAsync()
    {
        await _inner.DisposeAsync();
        await base.DisposeAsync();
    }
}

public class PostgreSqlDynamicCommand : DbCommand
{
    private readonly NpgsqlCommand _inner;
    private DbConnection? _connection;

    public PostgreSqlDynamicCommand(NpgsqlCommand inner, DbConnection connection)
    {
        _inner = inner;
        _connection = connection;
    }

    public override string CommandText
    {
        get => _inner.CommandText;
        set => _inner.CommandText = value ?? string.Empty;
    }

    public override int CommandTimeout
    {
        get => _inner.CommandTimeout;
        set => _inner.CommandTimeout = value;
    }

    public override CommandType CommandType
    {
        get => _inner.CommandType;
        set => _inner.CommandType = value;
    }

    protected override DbConnection? DbConnection
    {
        get => _connection;
        set
        {
            _connection = value;
            if (value is PostgreSqlDynamicConnection dynamicConn)
            {
                _inner.Connection = dynamicConn.InnerConnection;
            }
            else if (value is NpgsqlConnection npgsqlConn)
            {
                _inner.Connection = npgsqlConn;
            }
        }
    }

    protected override DbParameterCollection DbParameterCollection => _inner.Parameters;
    protected override DbTransaction? DbTransaction
    {
        get => _inner.Transaction;
        set => _inner.Transaction = (NpgsqlTransaction?)value;
    }

    public override bool DesignTimeVisible
    {
        get => _inner.DesignTimeVisible;
        set => _inner.DesignTimeVisible = value;
    }

    public override UpdateRowSource UpdatedRowSource
    {
        get => _inner.UpdatedRowSource;
        set => _inner.UpdatedRowSource = value;
    }

    public override void Cancel() => _inner.Cancel();
    public override void Prepare() => _inner.Prepare();
    protected override DbParameter CreateDbParameter() => _inner.CreateParameter();

    private void PrepareCommandForPostgreSql()
    {
        if (CommandType == CommandType.StoredProcedure)
        {
            string procName = CommandText.Trim();
            // Remove schema prefix if present e.g. dbo.ProcedureName -> ProcedureName
            if (procName.StartsWith("dbo.", StringComparison.OrdinalIgnoreCase))
            {
                procName = procName.Substring(4);
            }
            procName = procName.Replace("[", "").Replace("]", "").ToLowerInvariant();

            var sb = new StringBuilder();
            sb.Append("SELECT * FROM ");
            sb.Append(procName);
            sb.Append('(');

            var paramPlaceholders = new List<string>();
            foreach (DbParameter param in Parameters)
            {
                string pName = param.ParameterName;
                if (!pName.StartsWith('@') && !pName.StartsWith(':'))
                {
                    pName = "@" + pName;
                }
                paramPlaceholders.Add(pName);
            }

            sb.Append(string.Join(", ", paramPlaceholders));
            sb.Append(')');

            CommandText = sb.ToString();
            CommandType = CommandType.Text;
        }
    }

    public override int ExecuteNonQuery()
    {
        PrepareCommandForPostgreSql();
        return _inner.ExecuteNonQuery();
    }

    public override async Task<int> ExecuteNonQueryAsync(CancellationToken cancellationToken)
    {
        PrepareCommandForPostgreSql();
        return await _inner.ExecuteNonQueryAsync(cancellationToken);
    }

    public override object? ExecuteScalar()
    {
        PrepareCommandForPostgreSql();
        return _inner.ExecuteScalar();
    }

    public override async Task<object?> ExecuteScalarAsync(CancellationToken cancellationToken)
    {
        PrepareCommandForPostgreSql();
        return await _inner.ExecuteScalarAsync(cancellationToken);
    }

    protected override DbDataReader ExecuteDbDataReader(CommandBehavior behavior)
    {
        PrepareCommandForPostgreSql();
        var reader = _inner.ExecuteReader(behavior);
        return new PostgreSqlDynamicDataReader(reader);
    }

    protected override async Task<DbDataReader> ExecuteDbDataReaderAsync(CommandBehavior behavior, CancellationToken cancellationToken)
    {
        PrepareCommandForPostgreSql();
        var reader = await _inner.ExecuteReaderAsync(behavior, cancellationToken);
        return new PostgreSqlDynamicDataReader(reader);
    }
}

/// <summary>
/// Wraps DbDataReader to map column names to PascalCase expected by legacy Dapper models and dynamic objects.
/// </summary>
public class PostgreSqlDynamicDataReader : DbDataReader
{
    private readonly DbDataReader _inner;

    private static readonly Dictionary<string, string> StandardColumnMap = new(StringComparer.OrdinalIgnoreCase)
    {
        ["userid"] = "UserID",
        ["usertypeid"] = "UserTypeID",
        ["userloginid"] = "UserLoginID",
        ["username"] = "UserName",
        ["dashboardpath"] = "DashBoardPath",
        ["photopath"] = "PhotoPath",
        ["loggedinsessionid"] = "LoggedInSessionID",
        ["isadmin"] = "IsAdmin",
        ["ismultipleloginallowed"] = "IsMultipleLoginAllowed",
        ["lastloggedinsessionid"] = "LastLoggedInSessionID",
        ["securityquestionid"] = "SecurityQuestionID",
        ["isloginallowed"] = "IsLoginAllowed",
        ["errormessage"] = "ErrorMessage",
        ["linkid"] = "LinkID",
        ["linkname"] = "LinkName",
        ["linkdescription"] = "LinkDescription",
        ["linkurl"] = "LinkURL",
        ["menuid"] = "MenuID",
        ["parentmenuid"] = "ParentMenuID",
        ["cssclass"] = "CSSClass",
        ["groupname"] = "GroupName",
        ["target"] = "Target",
        ["seqno"] = "SeqNo",
        ["isnew"] = "IsNew",
        ["isactive"] = "IsActive",
        ["collegeid"] = "CollegeID",
        ["collegename"] = "CollegeName",
        ["collegecode"] = "CollegeCode",
        ["currentlogindatetime"] = "CurrentLoginDateTime",
        ["lastlogindatetime"] = "LastLoginDateTime",
        ["datavaluefield"] = "DataValueField",
        ["datatextfield"] = "DataTextField",
        ["group"] = "Group",
        ["notificationid"] = "NotificationID",
        ["notificationcategoryid"] = "NotificationCategoryID",
        ["notificationcategory"] = "NotificationCategory",
        ["notificationtitle"] = "NotificationTitle",
        ["displaystartdatetime"] = "DisplayStartDateTime",
        ["displayenddatetime"] = "DisplayEndDateTime",
        ["publishdatetime"] = "PublishDateTime",
        ["contenttype"] = "ContentType",
        ["textcontent"] = "TextContent",
        ["filecontentname"] = "FileContentName",
        ["filecontenturl"] = "FileContentURL",
        ["openinnewpage"] = "OpenInNewPage",
        ["displaynewimage"] = "DisplayNewImage",
        ["activityname"] = "ActivityName",
        ["activitydetails"] = "ActivityDetails",
        ["activitystartdatetime"] = "ActivityStartDateTime",
        ["activityenddatetime"] = "ActivityEndDateTime",
        ["activitystartdatetimef"] = "ActivityStartDateTimeF",
        ["activityenddatetimef"] = "ActivityEndDateTimeF",
        ["srno"] = "SrNo"
    };

    public PostgreSqlDynamicDataReader(DbDataReader inner)
    {
        _inner = inner;
    }

    public override string GetName(int ordinal)
    {
        var rawName = _inner.GetName(ordinal);
        return StandardColumnMap.TryGetValue(rawName, out var mapped) ? mapped : rawName;
    }

    public override int GetOrdinal(string name)
    {
        try
        {
            return _inner.GetOrdinal(name);
        }
        catch
        {
            // Fallback case-insensitive search
            for (int i = 0; i < FieldCount; i++)
            {
                if (string.Equals(GetName(i), name, StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(_inner.GetName(i), name, StringComparison.OrdinalIgnoreCase))
                {
                    return i;
                }
            }
            throw;
        }
    }

    public override object this[int ordinal] => _inner[ordinal];
    public override object this[string name] => _inner[GetOrdinal(name)];
    public override int Depth => _inner.Depth;
    public override int FieldCount => _inner.FieldCount;
    public override bool HasRows => _inner.HasRows;
    public override bool IsClosed => _inner.IsClosed;
    public override int RecordsAffected => _inner.RecordsAffected;

    public override bool GetBoolean(int ordinal) => _inner.GetBoolean(ordinal);
    public override byte GetByte(int ordinal) => _inner.GetByte(ordinal);
    public override long GetBytes(int ordinal, long dataOffset, byte[]? buffer, int bufferOffset, int length) =>
        _inner.GetBytes(ordinal, dataOffset, buffer, bufferOffset, length);
    public override char GetChar(int ordinal) => _inner.GetChar(ordinal);
    public override long GetChars(int ordinal, long dataOffset, char[]? buffer, int bufferOffset, int length) =>
        _inner.GetChars(ordinal, dataOffset, buffer, bufferOffset, length);
    public override string GetDataTypeName(int ordinal) => _inner.GetDataTypeName(ordinal);
    public override DateTime GetDateTime(int ordinal) => _inner.GetDateTime(ordinal);
    public override decimal GetDecimal(int ordinal) => _inner.GetDecimal(ordinal);
    public override double GetDouble(int ordinal) => _inner.GetDouble(ordinal);
    public override IEnumerator GetEnumerator() => _inner.GetEnumerator();
    public override Type GetFieldType(int ordinal) => _inner.GetFieldType(ordinal);
    public override float GetFloat(int ordinal) => _inner.GetFloat(ordinal);
    public override Guid GetGuid(int ordinal) => _inner.GetGuid(ordinal);
    public override short GetInt16(int ordinal) => _inner.GetInt16(ordinal);
    public override int GetInt32(int ordinal) => _inner.GetInt32(ordinal);
    public override long GetInt64(int ordinal) => _inner.GetInt64(ordinal);
    public override string GetString(int ordinal) => _inner.GetString(ordinal);
    public override object GetValue(int ordinal) => _inner.GetValue(ordinal);
    public override int GetValues(object[] values) => _inner.GetValues(values);
    public override bool IsDBNull(int ordinal) => _inner.IsDBNull(ordinal);
    public override bool NextResult() => _inner.NextResult();
    public override Task<bool> NextResultAsync(CancellationToken cancellationToken) => _inner.NextResultAsync(cancellationToken);
    public override bool Read() => _inner.Read();
    public override Task<bool> ReadAsync(CancellationToken cancellationToken) => _inner.ReadAsync(cancellationToken);
    public override void Close() => _inner.Close();
    public override Task CloseAsync() => _inner.CloseAsync();
    public override DataTable? GetSchemaTable() => _inner.GetSchemaTable();

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _inner.Dispose();
        }
        base.Dispose(disposing);
    }

    public override async ValueTask DisposeAsync()
    {
        await _inner.DisposeAsync();
        await base.DisposeAsync();
    }
}
