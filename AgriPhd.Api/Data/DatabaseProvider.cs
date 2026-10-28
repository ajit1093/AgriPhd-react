namespace AgriPhd.Api.Data;

public enum DatabaseProvider
{
    SqlServer,
    PostgreSql
}

public class DatabaseProviderInfo
{
    public DatabaseProvider Provider { get; }

    public DatabaseProviderInfo(DatabaseProvider provider)
    {
        Provider = provider;
    }

    public override string ToString() => Provider.ToString();
}
