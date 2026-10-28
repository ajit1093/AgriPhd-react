using System.Data;
using Microsoft.Data.SqlClient;

namespace AgriPhd.Api.Extensions;

public static class DatabaseExtensions
{
    /// <summary>
    /// Registers a scoped IDbConnection factory using the DefaultConnection string.
    /// Dapper repositories receive IDbConnection via constructor injection.
    /// The connection is opened lazily when first used by Dapper.
    /// </summary>
    public static IServiceCollection AddDapperSqlConnection(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");

        services.AddScoped<IDbConnection>(_ => new SqlConnection(connectionString));

        return services;
    }
}
