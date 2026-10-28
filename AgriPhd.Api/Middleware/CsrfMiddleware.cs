namespace AgriPhd.Api.Middleware;

/// <summary>
/// CSRF double-submit cookie validation (P1-AUTH-07).
/// On all mutating requests (POST/PUT/DELETE/PATCH), verifies that:
///   Request.Headers["X-CSRF-Token"] == Request.Cookies["csrf-token"]
///
/// Requests without a valid CSRF token are rejected with 403.
/// Anonymous (AllowAnonymous) endpoints are exempt from CSRF validation.
/// </summary>
public class CsrfMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<CsrfMiddleware> _logger;

    private static readonly HashSet<string> _mutatingMethods =
        new(StringComparer.OrdinalIgnoreCase) { "POST", "PUT", "DELETE", "PATCH" };

    private const string CSRF_HEADER_NAME = "X-CSRF-Token";
    private const string CSRF_COOKIE_NAME = "csrf-token";

    // Endpoints exempt from CSRF: login (no session yet), anonymous registration endpoints, and Swagger
    private static readonly string[] _csrfExemptPaths =
    {
        "/api/v1/auth/login",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password",
        "/api/v1/registration/lookup",
        "/api/v1/registration/register",
        "/api/v1/registration/send-mobile-otp",
        "/api/v1/registration/verify-otp",
        "/api/v1/ai",
        "/swagger",
        "/health"
    };

    public CsrfMiddleware(RequestDelegate next, ILogger<CsrfMiddleware> logger)
    {
        _next   = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        if (_mutatingMethods.Contains(context.Request.Method))
        {
            var path = context.Request.Path.Value ?? string.Empty;

            // Skip CSRF for exempt paths (login, forgot-password, swagger)
            bool exempt = _csrfExemptPaths.Any(p => path.StartsWith(p, StringComparison.OrdinalIgnoreCase));

            if (!exempt)
            {
                var csrfHeader = context.Request.Headers[CSRF_HEADER_NAME].FirstOrDefault();
                var csrfCookie = context.Request.Cookies[CSRF_COOKIE_NAME];

                if (string.IsNullOrEmpty(csrfHeader) ||
                    string.IsNullOrEmpty(csrfCookie) ||
                    !string.Equals(csrfHeader, csrfCookie, StringComparison.Ordinal))
                {
                    _logger.LogWarning(
                        "CSRF token mismatch on {Method} {Path}",
                        context.Request.Method, path);

                    context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    await context.Response.WriteAsJsonAsync(new
                    {
                        status = 403,
                        title  = "CSRF token validation failed.",
                        type   = "https://tools.ietf.org/html/rfc7807"
                    });
                    return;
                }
            }
        }

        await _next(context);
    }
}
