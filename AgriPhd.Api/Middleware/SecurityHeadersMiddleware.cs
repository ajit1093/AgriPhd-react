namespace AgriPhd.Api.Middleware;

/// <summary>
/// Adds security headers to every response and strips the X-Powered-By header.
/// P3-04: Security headers audit — verified and tightened.
/// </summary>
public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    private readonly IWebHostEnvironment _env;

    public SecurityHeadersMiddleware(RequestDelegate next, IWebHostEnvironment env)
    {
        _next = next;
        _env  = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        // Remove server-identifying headers
        context.Response.Headers.Remove("X-Powered-By");
        context.Response.Headers.Remove("Server");

        // Prevent MIME type sniffing
        context.Response.Headers["X-Content-Type-Options"] = "nosniff";

        // Prevent framing (clickjacking protection)
        context.Response.Headers["X-Frame-Options"] = "DENY";

        // Control referrer info
        context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";

        // XSS filter (legacy browsers)
        context.Response.Headers["X-XSS-Protection"] = "1; mode=block";

        // CSP — tightened for Phase 3:
        //   connect-src includes Azure Blob Storage domain for file uploads/downloads
        //   img-src includes blob: for photo/signature previews
        //   font-src 'self' for any web fonts
        context.Response.Headers["Content-Security-Policy"] =
            "default-src 'self'; " +
            "script-src 'self' https://checkout.razorpay.com https://www.google.com https://www.gstatic.com; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob: https://*.blob.core.windows.net; " +
            "connect-src 'self' https://*.blob.core.windows.net; " +
            "font-src 'self'; " +
            "frame-src https://api.razorpay.com https://www.google.com; " +
            "object-src 'none'; " +
            "base-uri 'self';";

        // Permissions policy — deny sensitive device APIs not used by this app
        context.Response.Headers["Permissions-Policy"] =
            "camera=(), microphone=(), geolocation=(), payment=(), usb=()";

        // HSTS — only in non-development (no HTTPS in dev)
        if (!_env.IsDevelopment())
        {
            context.Response.Headers["Strict-Transport-Security"] =
                "max-age=31536000; includeSubDomains; preload";
        }

        await _next(context);
    }
}
