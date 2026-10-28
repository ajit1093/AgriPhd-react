using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using AgriPhd.Api.DTOs.Requests;
using AgriPhd.Api.DTOs.Responses;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;
using AgriPhd.Api.Services.Interfaces;
namespace AgriPhd.Api.Controllers;

/// <summary>
/// Authentication endpoints.
/// P1-AUTH-03: POST /api/v1/auth/login
/// P1-AUTH-04: POST /api/v1/auth/logout
/// P1-AUTH-05: GET  /api/v1/auth/me
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IAuthRepository _authRepository;
    private readonly IRegistrationService _registrationService;
    private readonly JwtHelper _jwtHelper;
    private readonly JwtSettings _jwtSettings;
    private readonly ILogger<AuthController> _logger;
    private readonly IWebHostEnvironment _env;

    // Cookie names — must match what React reads
    private const string JWT_COOKIE_NAME  = "agri-jwt";
    private const string CSRF_COOKIE_NAME = "csrf-token";

    public AuthController(
        IAuthService authService,
        IAuthRepository authRepository,
        IRegistrationService registrationService,
        JwtHelper jwtHelper,
        IOptions<JwtSettings> jwtSettings,
        ILogger<AuthController> logger,
        IWebHostEnvironment env)
    {
        _authService         = authService;
        _authRepository      = authRepository;
        _registrationService = registrationService;
        _jwtHelper           = jwtHelper;
        _jwtSettings         = jwtSettings.Value;
        _logger              = logger;
        _env                 = env;
    }

    // Secure flag: true in Production/Staging (HTTPS only), false in Development (HTTP localhost)
    private bool SecureCookie => !_env.IsDevelopment();

    // ─── POST /api/v1/auth/login ──────────────────────────────────────────────

    /// <summary>
    /// Validates credentials and issues JWT in an httpOnly cookie plus a CSRF token.
    /// </summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var browserName    = (Request.Headers["User-Agent"].FirstOrDefault() ?? "Unknown")[..Math.Min(50, (Request.Headers["User-Agent"].FirstOrDefault() ?? "Unknown").Length)];
        var browserVersion = "1.0";
        var ipAddress      = IpAddressHelper.GetIpAddressString(Request);

        var (user, errorMessage) = await _authService.LoginAsync(
            request, browserName, browserVersion, ipAddress);

        if (user == null)
        {
            return Unauthorized(new LoginResponse
            {
                Success = false,
                ErrorMessage = errorMessage
            });
        }

        // Issue JWT token
        var token = _jwtHelper.GenerateToken(user);
        var csrfToken = JwtHelper.GenerateCsrfToken();

        // httpOnly JWT cookie — not readable by JavaScript (XSS protection)
        Response.Cookies.Append(JWT_COOKIE_NAME, token, new CookieOptions
        {
            HttpOnly  = true,
            Secure    = SecureCookie,
            SameSite  = SameSiteMode.Strict,
            Expires   = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryMinutes),
            Path      = "/"
        });

        // Readable CSRF cookie — React reads this and sends as X-CSRF-Token header
        Response.Cookies.Append(CSRF_COOKIE_NAME, csrfToken, new CookieOptions
        {
            HttpOnly  = false, // Must be readable by JS
            Secure    = SecureCookie,
            SameSite  = SameSiteMode.Strict,
            Expires   = DateTimeOffset.UtcNow.AddMinutes(_jwtSettings.AccessTokenExpiryMinutes),
            Path      = "/"
        });

        var userResponse = MapToUserResponse(user);

        return Ok(new LoginResponse
        {
            Success  = true,
            User     = userResponse,
            RequiresSecurityQuestion = user.SecurityQuestionID <= 0
        });
    }

    // ─── POST /api/v1/auth/logout ─────────────────────────────────────────────

    /// <summary>
    /// Clears the JWT and CSRF cookies and records logout in DB.
    /// </summary>
    [HttpPost("logout")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Logout()
    {
        var userId    = GetClaimLong(JwtHelper.ClaimUserId);
        var sessionId = GetClaimLong(JwtHelper.ClaimSessionId);

        if (userId > 0)
            await _authService.LogoutAsync(userId, sessionId);

        // Clear both cookies
        var expiredOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure   = SecureCookie,
            SameSite = SameSiteMode.Strict,
            Expires  = DateTimeOffset.UnixEpoch,
            Path     = "/"
        };
        Response.Cookies.Append(JWT_COOKIE_NAME, string.Empty, expiredOptions);
        Response.Cookies.Append(CSRF_COOKIE_NAME, string.Empty, new CookieOptions
        {
            HttpOnly = false,
            Secure   = SecureCookie,
            SameSite = SameSiteMode.Strict,
            Expires  = DateTimeOffset.UnixEpoch,
            Path     = "/"
        });

        return Ok(new MessageResponse { Success = true, Message = "Logged out successfully." });
    }

    // ─── GET /api/v1/auth/me ──────────────────────────────────────────────────

    /// <summary>
    /// Returns current user info from JWT claims (no DB call).
    /// React App.tsx calls this on load to restore the auth state.
    /// Returns 401 if no valid JWT cookie present.
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(AuthUserResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public IActionResult Me()
    {
        var token = Request.Cookies[JWT_COOKIE_NAME];
        if (string.IsNullOrEmpty(token))
            return Unauthorized();

        var principal = _jwtHelper.ValidateToken(token);
        if (principal == null)
            return Unauthorized();

        var user = new AuthUserResponse
        {
            UserId            = GetClaimLong(JwtHelper.ClaimUserId, principal),
            UserTypeId        = (int)GetClaimLong(JwtHelper.ClaimUserTypeId, principal),
            UserLoginId       = GetClaim(JwtHelper.ClaimUserLoginId, principal),
            UserName          = GetClaim(JwtHelper.ClaimUserName, principal),
            DashboardPath     = GetClaim(JwtHelper.ClaimDashboardPath, principal),
            SessionId         = GetClaimLong(JwtHelper.ClaimSessionId, principal),
            IsAdmin           = GetClaim(JwtHelper.ClaimIsAdmin, principal) == "True",
            SecurityQuestionSet = GetClaim(JwtHelper.ClaimSecurityQSet, principal) == "True",
        };

        return Ok(user);
    }

    // ─── Password & Account Recovery ─────────────────────────────────────────

    [HttpPost("change-password")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId    = GetClaimLong(JwtHelper.ClaimUserId);
        var loginId   = GetClaim(JwtHelper.ClaimUserLoginId);
        var ipAddress = IpAddressHelper.GetIpAddressString(Request);

        var (success, message) = await _authService.ChangePasswordAsync(
            userId, loginId, request, ipAddress);

        return success ? Ok(new MessageResponse { Success = true, Message = message })
                       : BadRequest(new MessageResponse { Success = false, Message = message });
    }

    [HttpPost("change-security-question")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ChangeSecurityQuestion([FromBody] ChangeSecurityQuestionRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId    = GetClaimLong(JwtHelper.ClaimUserId);
        var loginId   = GetClaim(JwtHelper.ClaimUserLoginId);
        var ipAddress = IpAddressHelper.GetIpAddressString(Request);

        var (success, message) = await _authService.ChangeSecurityQuestionAsync(
            userId, loginId, request, ipAddress);

        return success ? Ok(new MessageResponse { Success = true, Message = message })
                       : BadRequest(new MessageResponse { Success = false, Message = message });
    }

    [HttpPost("reset-password")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (request.NewPassword != request.ConfirmPassword)
            return BadRequest(new MessageResponse { Success = false, Message = "Passwords do not match." });

        // For unauthenticated forgot-password resets, loginId is provided instead of userId.
        // Resolve userId from loginId via Account_GetUserID SP.
        long userId = request.UserId;
        string loggedInLoginId = GetClaim(JwtHelper.ClaimUserLoginId);

        if (userId <= 0 && !string.IsNullOrEmpty(request.LoginId))
        {
            userId = await _authRepository.GetUserIdAsync(request.LoginId);
            loggedInLoginId = request.LoginId;
        }

        if (userId <= 0)
            return BadRequest(new MessageResponse { Success = false, Message = "User not found." });

        var ipAddress = IpAddressHelper.GetIpAddressString(Request);
        var resolvedRequest = new ResetPasswordRequest
        {
            UserId          = userId,
            LoginId         = loggedInLoginId,
            NewPassword     = request.NewPassword,
            ConfirmPassword = request.ConfirmPassword,
        };

        var (success, message) = await _authService.ResetPasswordAsync(resolvedRequest, loggedInLoginId, ipAddress);

        return success ? Ok(new MessageResponse { Success = true, Message = message })
                       : BadRequest(new MessageResponse { Success = false, Message = message });
    }

    [HttpPost("forgot-password/security-question")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotBySecurityQuestion(
        [FromBody] ForgotPasswordBySecurityQuestionRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (success, errorMessage) = await _authService.ForgotPasswordBySecurityQuestionAsync(request);

        return success
            ? Ok(new MessageResponse { Success = true, Message = "Identity verified." })
            : BadRequest(new MessageResponse { Success = false, Message = errorMessage });
    }

    [HttpPost("forgot-password/otp-lookup")]
    [AllowAnonymous]
    [EnableRateLimiting("login")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotByOtpLookup(
        [FromBody] ForgotPasswordByOtpRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var (found, _, errorMessage) = await _authService.ForgotPasswordOtpLookupAsync(request);

        return found
            ? Ok(new MessageResponse { Success = true, Message = "Account found. OTP will be sent." })
            : BadRequest(new MessageResponse { Success = false, Message = errorMessage });
    }

    [HttpGet("security-questions")]
    [ProducesResponseType(typeof(IEnumerable<SecurityQuestionResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSecurityQuestions()
    {
        var userId = GetClaimLong(JwtHelper.ClaimUserId);
        if (userId <= 0) return Unauthorized();

        var questions = await _authService.GetSecurityQuestionsAsync(userId);
        return Ok(questions);
    }

    // ─── Mobile & Email change ────────────────────────────────────────────────

    [HttpPost("change-mobile")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ChangeMobile([FromBody] ChangeMobileRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId    = GetClaimLong(JwtHelper.ClaimUserId);
        var loginId   = GetClaim(JwtHelper.ClaimUserLoginId);
        var ipAddress = IpAddressHelper.GetIpAddressString(Request);

        // CandidateID == UserID for candidates (UserTypeID = 91)
        var (success, message) = await _authService.ChangeCandidateMobileNoAsync(
            userId, loginId, request, ipAddress);

        return success ? Ok(new MessageResponse { Success = true, Message = message })
                       : BadRequest(new MessageResponse { Success = false, Message = message });
    }

    [HttpPost("change-email")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId    = GetClaimLong(JwtHelper.ClaimUserId);
        var loginId   = GetClaim(JwtHelper.ClaimUserLoginId);
        var ipAddress = IpAddressHelper.GetIpAddressString(Request);

        var (success, message) = await _authService.ChangeCandidateEmailAsync(
            userId, loginId, request, ipAddress);

        return success ? Ok(new MessageResponse { Success = true, Message = message })
                       : BadRequest(new MessageResponse { Success = false, Message = message });
    }

    // ─── Forgot-password OTP send/verify ─────────────────────────────────────

    /// <summary>
    /// P2-B-06: Send mobile OTP for forgot-password flow.
    /// SP: Base_GetOTP(@MobileNo, @Purpose, @OTP).
    /// </summary>
    [HttpPost("forgot-password/send-mobile-otp")]
    [AllowAnonymous]
    [EnableRateLimiting("otp")]
    [ProducesResponseType(typeof(OtpApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotSendMobileOtp([FromBody] ForgotOtpSendRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _registrationService.SendMobileOtpAsync(request.Recipient, "ResetPassword");
        return result.Success
            ? Ok(new OtpApiResponse { Success = true, Message = result.Message })
            : BadRequest(new OtpApiResponse { Success = false, ErrorMessage = result.ErrorMessage });
    }

    /// <summary>
    /// P2-B-07: Send email OTP for forgot-password flow.
    /// SP: Base_GetOTP(@MobileNo=emailAddress, @Purpose, @OTP).
    /// </summary>
    [HttpPost("forgot-password/send-email-otp")]
    [AllowAnonymous]
    [EnableRateLimiting("otp")]
    [ProducesResponseType(typeof(OtpApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotSendEmailOtp([FromBody] ForgotOtpSendRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _registrationService.SendEmailOtpAsync(request.Recipient, "ResetPassword");
        return result.Success
            ? Ok(new OtpApiResponse { Success = true, Message = result.Message })
            : BadRequest(new OtpApiResponse { Success = false, ErrorMessage = result.ErrorMessage });
    }

    /// <summary>
    /// P2-B-06/07: Verify OTP (mobile or email — same SP).
    /// SP: Base_SaveOTPVerificationStatus(@MobileNo, @Purpose, @OTP).
    /// </summary>
    [HttpPost("forgot-password/verify-otp")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(OtpApiResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> ForgotVerifyOtp([FromBody] ForgotOtpVerifyRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _registrationService.VerifyOtpAsync(request.Recipient, "ResetPassword", request.Otp);
        return result.Success
            ? Ok(new OtpApiResponse { Success = true, Message = result.Message })
            : BadRequest(new OtpApiResponse { Success = false, ErrorMessage = result.ErrorMessage });
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private static AuthUserResponse MapToUserResponse(LoggedInUser user) => new()
    {
        UserId              = user.UserID,
        UserTypeId          = user.UserTypeID,
        UserLoginId         = user.UserLoginID,
        UserName            = user.UserName,
        DashboardPath       = user.DashBoardPath,
        PhotoPath           = user.PhotoPath,
        SessionId           = user.LoggedInSessionID,
        IsAdmin             = user.IsAdmin,
        SecurityQuestionSet = user.SecurityQuestionID > 0,
    };

    private long GetClaimLong(string claimType, System.Security.Claims.ClaimsPrincipal? principal = null)
    {
        var p = principal ?? User;
        var val = p.FindFirst(claimType)?.Value;
        return long.TryParse(val, out var result) ? result : 0;
    }

    private string GetClaim(string claimType, System.Security.Claims.ClaimsPrincipal? principal = null)
    {
        var p = principal ?? User;
        return p.FindFirst(claimType)?.Value ?? string.Empty;
    }
}
