using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;

namespace AgriPhd.Api.Extensions;

/// <summary>
/// P3-05: Rate limiting using .NET 8 built-in Microsoft.AspNetCore.RateLimiting.
/// Policies applied via [EnableRateLimiting("...")] attributes on controllers/endpoints.
///
/// Policies:
///   "login"   — max 10 requests / 1 min per IP  (brute-force protection on auth/login)
///   "otp"     — max 5  requests / 5 min per IP  (OTP send throttle — mobile + email)
///   "api"     — max 200 requests / 1 min per IP (general API throttle)
/// </summary>
public static class RateLimitExtensions
{
    public static IServiceCollection AddApiRateLimiting(this IServiceCollection services)
    {
        services.AddRateLimiter(options =>
        {
            // Rejection response: 429 Too Many Requests with JSON body
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.OnRejected = async (ctx, token) =>
            {
                ctx.HttpContext.Response.ContentType = "application/json";
                await ctx.HttpContext.Response.WriteAsync(
                    """{"title":"Too Many Requests","status":429,"detail":"You have exceeded the rate limit. Please wait before trying again."}""",
                    token);
            };

            // ── login: 10 req / 1 min per IP ──────────────────────────────────
            options.AddPolicy("login", ctx =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetIp(ctx),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit       = 10,
                        Window            = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit        = 0,
                    }));

            // ── otp-send: 5 req / 5 min per IP ───────────────────────────────
            options.AddPolicy("otp", ctx =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetIp(ctx),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit       = 5,
                        Window            = TimeSpan.FromMinutes(5),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit        = 0,
                    }));

            // ── api: 200 req / 1 min per IP (general guard) ───────────────────
            options.AddPolicy("api", ctx =>
                RateLimitPartition.GetFixedWindowLimiter(
                    partitionKey: GetIp(ctx),
                    factory: _ => new FixedWindowRateLimiterOptions
                    {
                        PermitLimit       = 200,
                        Window            = TimeSpan.FromMinutes(1),
                        QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                        QueueLimit        = 0,
                    }));
        });

        return services;
    }

    /// <summary>
    /// Extract real client IP — handles X-Forwarded-For from reverse proxies.
    /// Falls back to RemoteIpAddress when header is absent (direct connection).
    /// </summary>
    private static string GetIp(HttpContext ctx)
    {
        // X-Forwarded-For may contain a comma-separated list; take the first (original client IP)
        var forwarded = ctx.Request.Headers["X-Forwarded-For"].FirstOrDefault();
        if (!string.IsNullOrEmpty(forwarded))
            return forwarded.Split(',')[0].Trim();

        return ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown";
    }
}
