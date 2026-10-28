using System.Data;
using AgriPhd.Api.Data;
using Microsoft.Data.SqlClient;

namespace AgriPhd.Api.Extensions;

public static class DatabaseExtensions
{
    /// <summary>
    /// Registers a scoped IDbConnection factory dynamically resolving either SQL Server or PostgreSQL
    /// based on the "DatabaseProvider" setting in appsettings ("SqlServer" or "PostgreSql").
    /// Dapper repositories receive IDbConnection via constructor injection.
    /// </summary>
    public static IServiceCollection AddDynamicDbConnection(this IServiceCollection services, IConfiguration configuration)
    {
        var providerSetting = configuration["DatabaseProvider"] ?? "SqlServer";
        var isPostgreSql = providerSetting.Equals("PostgreSql", StringComparison.OrdinalIgnoreCase) ||
                           providerSetting.Equals("Postgres", StringComparison.OrdinalIgnoreCase);

        if (isPostgreSql)
        {
            var pgConnStr = configuration.GetConnectionString("PostgreSqlConnection")
                ?? configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("PostgreSQL connection string is not configured.");

            services.AddSingleton(new DatabaseProviderInfo(DatabaseProvider.PostgreSql));
            services.AddScoped<IDbConnection>(_ => new PostgreSqlDynamicConnection(pgConnStr));
        }
        else
        {
            var sqlConnStr = configuration.GetConnectionString("SqlServerConnection")
                ?? configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("SQL Server connection string is not configured.");

            services.AddSingleton(new DatabaseProviderInfo(DatabaseProvider.SqlServer));
            services.AddScoped<IDbConnection>(_ => new SqlConnection(sqlConnStr));
        }

        return services;
    }

    /// <summary>
    /// Backward-compatible alias for AddDynamicDbConnection.
    /// </summary>
    public static IServiceCollection AddDapperSqlConnection(this IServiceCollection services, IConfiguration configuration)
    {
        return services.AddDynamicDbConnection(configuration);
    }
}
