using AgriPhd.Api.Models;

namespace AgriPhd.Api.Repositories.Interfaces;

/// <summary>
/// Registration data layer — ported from legacy Repository.Registration.cs + Repository.Base.cs.
/// Every SP name and @parameter name preserved exactly.
/// </summary>
public interface IRegistrationRepository
{
    /// <summary>SP: ApplicationForm_GetRegisteredCandidate(@ApplicationFormNo, @DOB)</summary>
    Task<CandidateLookupResult?> GetRegisteredCandidateAsync(long applicationFormNo, string dob);

    /// <summary>
    /// SP: ApplicationForm_IsApplicationFormAlreadyRegisteredUsingThisMobileNo(@CandidateID, @MobileNo)
    /// Returns true if mobile already registered (FR-REG-07).
    /// </summary>
    Task<bool> IsMobileAlreadyRegisteredAsync(string mobileNo);

    /// <summary>
    /// SP: ApplicationForm_IsApplicationFormAlreadyRegisteredUsingThisEMailID(@CandidateID, @EMailID)
    /// Returns true if email already registered (FR-REG-08).
    /// </summary>
    Task<bool> IsEmailAlreadyRegisteredAsync(string emailId);

    /// <summary>
    /// SP: ApplicationForm_RegisterCandidate — all params confirmed from Repository.Registration.cs.
    /// Returns 9-digit AppFormNo string on success, "N" on failure.
    /// </summary>
    Task<string> RegisterCandidateAsync(
        long   applicationFormNo, string candidateName, string fatherName,
        string genderCode, string dob, string mobileNo, string emailId,
        short  securityQuestionId, string securityAnswer,
        string passwordBase64, string ipAddress);

    /// <summary>
    /// SP: Base_GetOTP(@MobileNo, @Purpose, @OTP)
    /// Persists and returns OTP. @MobileNo is used as recipient key — also accepts email address.
    /// </summary>
    Task<string> GetOtpAsync(string recipient, string purpose, string otp);

    /// <summary>
    /// SP: Base_SaveOTPVerificationStatus(@MobileNo, @Purpose, @OTP)
    /// Returns "Y" if OTP matches, "N" otherwise.
    /// </summary>
    Task<bool> VerifyOtpAsync(string recipient, string purpose, string otp);

    /// <summary>
    /// SP: Base_GetEMailSMS(@Purpose, @MessageType, @Param1..@Param5)
    /// Returns email/SMS template. MessageType: "E" = email, "S" = SMS.
    /// </summary>
    Task<EmailSmsTemplate?> GetEmailSmsTemplateAsync(
        string purpose, string messageType, string param1 = "", string param2 = "",
        string param3 = "", string param4 = "", string param5 = "");
}
