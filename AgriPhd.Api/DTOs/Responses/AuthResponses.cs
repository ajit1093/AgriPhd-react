namespace AgriPhd.Api.DTOs.Responses;

/// <summary>
/// Returned by POST /api/v1/auth/login and GET /api/v1/auth/me.
/// Contains everything the React authStore needs.
/// </summary>
public class AuthUserResponse
{
    public long UserId { get; set; }
    public int UserTypeId { get; set; }
    public string UserLoginId { get; set; } = string.Empty;
    public string UserName { get; set; } = string.Empty;
    public string DashboardPath { get; set; } = string.Empty;
    public string PhotoPath { get; set; } = string.Empty;
    public long SessionId { get; set; }
    public bool IsAdmin { get; set; }

    /// <summary>
    /// When false, force-redirect to /change-security-question before dashboard.
    /// </summary>
    public bool SecurityQuestionSet { get; set; }
}

public class LoginResponse
{
    public bool Success { get; set; }
    public string? ErrorMessage { get; set; }
    public AuthUserResponse? User { get; set; }

    /// <summary>
    /// When true, React must redirect to /change-security-question before the dashboard.
    /// </summary>
    public bool RequiresSecurityQuestion { get; set; }
}

public class ForgotPasswordLookupResponse
{
    public bool Found { get; set; }
    public string? ErrorMessage { get; set; }
    public string? UserLoginId { get; set; }
    /// <summary>
    /// Available recovery methods for this account.
    /// </summary>
    public bool HasSecurityQuestion { get; set; }
    public bool HasMobileNo { get; set; }
    public bool HasEmailId { get; set; }
}

public class SecurityQuestionResponse
{
    public short SecurityQuestionId { get; set; }
    public string SecurityQuestionText { get; set; } = string.Empty;
}

public class MessageResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
}

/// <summary>OTP send/verify response used by forgot-password endpoints.</summary>
public class OtpApiResponse
{
    public bool    Success      { get; set; }
    public string? ErrorMessage { get; set; }
    public string  Message      { get; set; } = string.Empty;
}
