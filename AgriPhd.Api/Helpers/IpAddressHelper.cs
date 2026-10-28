namespace AgriPhd.Api.Helpers;

/// <summary>
/// Builds the composite @IPAddress string passed to all SP calls.
/// Legacy format: "{Y|N}/{ClientIP}/{Browser}/{Platform}" truncated to 50 chars.
/// The SP column is varchar(50) — must never exceed that.
/// </summary>
public static class IpAddressHelper
{
    public static string GetIpAddressString(HttpRequest request, bool isMobile = false)
    {
        var ip = GetClientIp(request);
        var mobileFlag = isMobile ? "Y" : "N";

        // Build short composite — IP address only, flag, truncated to 50 chars
        var composite = $"{mobileFlag}/{ip}";

        // Hard truncate to 50 chars — SP varchar(50) limit
        return composite.Length > 50 ? composite[..50] : composite;
    }

    private static string GetClientIp(HttpRequest request)
    {
        var forwarded = request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwarded))
            return forwarded.Split(',')[0].Trim();

        return request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
    }
}
