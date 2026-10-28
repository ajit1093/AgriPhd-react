using System.ComponentModel.DataAnnotations;

namespace AgriPhd.Api.DTOs.Requests;

/// <summary>Step 1 — lookup pre-existing CET record. FR-REG-02.</summary>
public class CandidateLookupRequest
{
    [Required]
    public long   ApplicationFormNo { get; set; }
    [Required]
    public string DateOfBirth       { get; set; } = string.Empty; // raw string — SP expects string
}

/// <summary>Step 2 — send mobile OTP. FR-REG-05.</summary>
public class SendOtpRequest
{
    [Required]
    [RegularExpression(@"^\d{10}$", ErrorMessage = "Mobile number must be 10 digits.")]
    public string MobileNo { get; set; } = string.Empty;
    [Required]
    public string Purpose  { get; set; } = "VerifyMobileNo";
}

/// <summary>Step 2b — verify OTP entered by candidate.</summary>
public class VerifyRegistrationOtpRequest
{
    [Required]
    public string Recipient { get; set; } = string.Empty; // mobile or email address
    [Required]
    public string Purpose   { get; set; } = string.Empty;
    [Required]
    [StringLength(6, MinimumLength = 4)]
    public string Otp       { get; set; } = string.Empty;
}

/// <summary>Step 3 — final registration. FR-REG-04, FR-REG-09.</summary>
public class RegisterCandidateRequest
{
    [Required]
    public long   ApplicationFormNo     { get; set; }
    [Required]
    public string CandidateName         { get; set; } = string.Empty;
    [Required]
    public string GenderCode            { get; set; } = string.Empty;
    [Required]
    public string DateOfBirth           { get; set; } = string.Empty;
    [Required]
    [RegularExpression(@"^\d{10}$")]
    public string MobileNo              { get; set; } = string.Empty;
    [Required]
    [EmailAddress]
    public string EmailId               { get; set; } = string.Empty;
    [Required]
    public short  SecurityQuestionId    { get; set; }
    [Required]
    public string SecurityAnswer        { get; set; } = string.Empty;
    [Required]
    [MinLength(6)]
    public string Password              { get; set; } = string.Empty;
    [Required]
    public string ConfirmPassword       { get; set; } = string.Empty;
}
