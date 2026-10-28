using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Middleware;

/// <summary>
/// Action filter applied to every authenticated endpoint.
/// Calls Account_IsCurrentLoginValid SP to detect concurrent session invalidation.
/// Maps to legacy Helper.IsLoginValid() called on every protected page load.
///
/// Usage: applied globally in Program.cs via AddControllers().AddMvcOptions()
/// or per-controller via [ServiceFilter(typeof(SessionValidationFilter))].
/// </summary>
public class SessionValidationFilter : IAsyncActionFilter
{
    private readonly IAuthRepository _authRepo;
    private readonly JwtHelper _jwtHelper;
    private readonly ILogger<SessionValidationFilter> _logger;

    private const string JWT_COOKIE_NAME = "agri-jwt";

    public SessionValidationFilter(
        IAuthRepository authRepo,
        JwtHelper jwtHelper,
        ILogger<SessionValidationFilter> logger)
    {
        _authRepo  = authRepo;
        _jwtHelper = jwtHelper;
        _logger    = logger;
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Skip validation for anonymous endpoints
        var endpoint = context.HttpContext.GetEndpoint();
        var allowAnon = endpoint?.Metadata.GetMetadata<Microsoft.AspNetCore.Authorization.AllowAnonymousAttribute>();
        if (allowAnon != null)
        {
            await next();
            return;
        }

        var token = context.HttpContext.Request.Cookies[JWT_COOKIE_NAME];
        if (string.IsNullOrEmpty(token))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        var principal = _jwtHelper.ValidateToken(token);
        if (principal == null)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (!long.TryParse(principal.FindFirst(JwtHelper.ClaimUserId)?.Value, out var userId) || userId <= 0)
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        if (!long.TryParse(principal.FindFirst(JwtHelper.ClaimSessionId)?.Value, out var sessionId))
        {
            context.Result = new UnauthorizedResult();
            return;
        }

        // DB check — detects concurrent login invalidation (IsMultipleLoginAllowed = false)
        var isValid = await _authRepo.IsCurrentLoginValidAsync(userId, sessionId);
        if (!isValid)
        {
            _logger.LogWarning(
                "Session invalidated for UserID={UserId} SessionID={SessionId} — concurrent login detected",
                userId, sessionId);
            context.Result = new UnauthorizedObjectResult(new { message = "Your session has been invalidated. Please log in again." });
            return;
        }

        await next();
    }
}
