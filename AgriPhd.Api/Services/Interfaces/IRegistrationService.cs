using AgriPhd.Api.DTOs.Requests;
using AgriPhd.Api.DTOs.Responses;

namespace AgriPhd.Api.Services.Interfaces;

public interface IRegistrationService
{
    /// <summary>FR-REG-02: Look up pre-existing CET candidate record.</summary>
    Task<CandidateLookupResponse> LookupCandidateAsync(CandidateLookupRequest request);

    /// <summary>FR-REG-05: Send mobile OTP for verification.</summary>
    Task<OtpResponse> SendMobileOtpAsync(string mobileNo, string purpose = "VerifyMobileNo");

    /// <summary>Send email OTP (used in account recovery).</summary>
    Task<OtpResponse> SendEmailOtpAsync(string emailId, string purpose = "ResetPassword");

    /// <summary>Verify any OTP (mobile or email — same SP).</summary>
    Task<OtpResponse> VerifyOtpAsync(string recipient, string purpose, string otp);

    /// <summary>
    /// FR-REG-04..12: Complete registration.
    /// Validates duplicates, calls SP, sends welcome email + SMS.
    /// </summary>
    Task<RegisterCandidateResponse> RegisterAsync(
        RegisterCandidateRequest request, string ipAddress, bool devEnvironment);
}
