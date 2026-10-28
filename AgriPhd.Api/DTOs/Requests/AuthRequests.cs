using System.ComponentModel.DataAnnotations;

namespace AgriPhd.Api.DTOs.Requests;

public class LoginRequest
{
    [Required]
    public string LoginId { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    // Forwarded from React browser info (for @BrowserName, @BrowserVersion, @IPAddress SP params)
    public string? CaptchaToken { get; set; }
}

public class LogoutRequest
{
    // Body is empty — user info comes from JWT claims
}

public class ForgotPasswordCheckLoginRequest
{
    [Required]
    public string LoginId { get; set; } = string.Empty;
}

public class ForgotPasswordBySecurityQuestionRequest
{
    [Required]
    public string LoginId { get; set; } = string.Empty;
    [Required]
    public short SecurityQuestionId { get; set; }
    [Required]
    public string SecurityAnswer { get; set; } = string.Empty;
}

public class ForgotPasswordByOtpRequest
{
    [Required]
    public string LoginId { get; set; } = string.Empty;
    public string? EmailId { get; set; }
    public string? MobileNo { get; set; }
}

public class VerifyOtpRequest
{
    [Required]
    public string LoginId { get; set; } = string.Empty;
    [Required]
    public string Otp { get; set; } = string.Empty;
    [Required]
    public string Purpose { get; set; } = string.Empty; // "ForgotPassword" | "VerifyMobileNo" etc.
}

public class ResetPasswordRequest
{
    [Required]
    public long UserId { get; set; }
    /// <summary>For unauthenticated forgot-password flow — server resolves userId from this.</summary>
    public string? LoginId { get; set; }
    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
    [Required]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; set; } = string.Empty;
    [Required]
    [MinLength(6)]
    public string NewPassword { get; set; } = string.Empty;
    [Required]
    public string ConfirmPassword { get; set; } = string.Empty;
}

public class ChangeSecurityQuestionRequest
{
    [Required]
    public short SecurityQuestionId { get; set; }
    [Required]
    public string SecurityAnswer { get; set; } = string.Empty;
}

public class ChangeMobileRequest
{
    [Required]
    [RegularExpression(@"^\d{10}$", ErrorMessage = "Mobile number must be exactly 10 digits.")]
    public string NewMobileNo { get; set; } = string.Empty;
    [Required]
    public string Otp { get; set; } = string.Empty;
}

public class ChangeEmailRequest
{
    [Required]
    [EmailAddress]
    public string NewEmailId { get; set; } = string.Empty;
    [Required]
    public string Otp { get; set; } = string.Empty;
}

/// <summary>Request to send OTP during forgot-password flow.</summary>
public class ForgotOtpSendRequest
{
    [Required]
    public string Recipient { get; set; } = string.Empty; // mobile or email
}

/// <summary>Request to verify OTP during forgot-password flow.</summary>
public class ForgotOtpVerifyRequest
{
    [Required]
    public string Recipient { get; set; } = string.Empty;
    [Required]
    [StringLength(6, MinimumLength = 4)]
    public string Otp { get; set; } = string.Empty;
}
