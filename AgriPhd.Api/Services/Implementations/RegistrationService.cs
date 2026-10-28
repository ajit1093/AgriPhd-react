using AgriPhd.Api.DTOs.Requests;
using AgriPhd.Api.DTOs.Responses;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;
using AgriPhd.Api.Services.Interfaces;
using Microsoft.Extensions.Options;

namespace AgriPhd.Api.Services.Implementations;

/// <summary>
/// Registration business logic ported from legacy NewRegistration.aspx.cs
/// and RegistrationWorker.cs. All SP call sequences preserved exactly.
/// </summary>
public class RegistrationService : IRegistrationService
{
    private readonly IRegistrationRepository _repo;
    private readonly AppSettings             _settings;
    private readonly ILogger<RegistrationService> _logger;

    // Msg91 / SendGrid services injected when available; skipped if not configured
    private readonly IHttpClientFactory _httpClientFactory;

    public RegistrationService(
        IRegistrationRepository repo,
        IOptions<AppSettings> settings,
        ILogger<RegistrationService> logger,
        IHttpClientFactory httpClientFactory)
    {
        _repo             = repo;
        _settings         = settings.Value;
        _logger           = logger;
        _httpClientFactory = httpClientFactory;
    }

    public async Task<CandidateLookupResponse> LookupCandidateAsync(CandidateLookupRequest request)
    {
        // SP ApplicationForm_GetRegisteredCandidate expects @DOB in DD/MM/YYYY format.
        // React <input type="date"> sends ISO format YYYY-MM-DD — convert before passing to SP.
        string dobForSp = request.DateOfBirth;
        if (DateTime.TryParse(request.DateOfBirth, out var parsedDob))
            dobForSp = parsedDob.ToString("dd'/'MM'/'yyyy"); // literal '/' — avoid culture-specific date separator

        var candidate = await _repo.GetRegisteredCandidateAsync(
            request.ApplicationFormNo, dobForSp);

        if (candidate == null)
            return new CandidateLookupResponse { Found = false, ErrorMessage = "No matching records found. Please check your Application Form No and Date of Birth." };

        return new CandidateLookupResponse
        {
            Found             = true,
            CandidateName     = candidate.CandidateName,
            FacultyName       = candidate.FacultyName,
            ApplicationFormNo = candidate.ApplicationFormNo,
            DOB               = candidate.DOB,
            LoginExists       = candidate.LoginExists,
            MobileNo          = candidate.MobileNo,
            EmailId           = candidate.EmailId,
            PGSubjectName     = candidate.PGSubjectName,
        };
    }

    public async Task<OtpResponse> SendMobileOtpAsync(string mobileNo, string purpose = "VerifyMobileNo")
    {
        try
        {
            var otp = OtpHelper.GenerateOtp(4);

            // Persist OTP to DB — SP: Base_GetOTP(@MobileNo, @Purpose, @OTP)
            await _repo.GetOtpAsync(mobileNo, purpose, otp);

            // Fetch SMS template — SP: Base_GetEMailSMS(@Purpose, "S")
            var template = await _repo.GetEmailSmsTemplateAsync(purpose, "S");

            // Send SMS via Msg91 HTTP API (fire-and-forget; error doesn't block registration)
            if (template != null && !string.IsNullOrEmpty(template.TemplateId))
            {
                await SendSmsAsync("91" + mobileNo, template.TemplateId, otp,
                    template.Var2, template.Var3, template.Var4, template.Var5);
            }

            _logger.LogInformation("OTP sent to mobile {Mobile} for purpose {Purpose}", mobileNo, purpose);

            // In dev mode, log OTP to help with testing (never in production)
            if (_settings.IsDevEnvironment)
                _logger.LogWarning("[DEV] OTP for {Mobile} = {Otp}", mobileNo, otp);

            return new OtpResponse { Success = true, Message = $"OTP sent to {MaskMobile(mobileNo)}." };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send mobile OTP to {Mobile}", mobileNo);
            return new OtpResponse { Success = false, ErrorMessage = "Failed to send OTP. Please try again." };
        }
    }

    public async Task<OtpResponse> SendEmailOtpAsync(string emailId, string purpose = "ResetPassword")
    {
        try
        {
            var otp = OtpHelper.GenerateOtp(4);

            // @MobileNo param accepts email address — confirmed from legacy EMailOTPValidation.ascx.cs
            await _repo.GetOtpAsync(emailId, purpose, otp);

            var template = await _repo.GetEmailSmsTemplateAsync(purpose, "E");

            if (template != null && !string.IsNullOrEmpty(template.Subject))
            {
                var body = template.Message.Replace("##OTP##", otp);
                await SendEmailAsync(emailId, template.Subject, body);
            }

            _logger.LogInformation("OTP sent to email {Email} for purpose {Purpose}", emailId, purpose);

            if (_settings.IsDevEnvironment)
                _logger.LogWarning("[DEV] OTP for {Email} = {Otp}", emailId, otp);

            return new OtpResponse { Success = true, Message = $"OTP sent to {MaskEmail(emailId)}." };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email OTP to {Email}", emailId);
            return new OtpResponse { Success = false, ErrorMessage = "Failed to send OTP. Please try again." };
        }
    }

    public async Task<OtpResponse> VerifyOtpAsync(string recipient, string purpose, string otp)
    {
        var valid = await _repo.VerifyOtpAsync(recipient, purpose, otp);
        return valid
            ? new OtpResponse { Success = true, Message = "OTP verified successfully." }
            : new OtpResponse { Success = false, ErrorMessage = "Invalid or expired OTP. Please try again." };
    }

    public async Task<RegisterCandidateResponse> RegisterAsync(
        RegisterCandidateRequest request, string ipAddress, bool devEnvironment)
    {
        // FR-REG-04: Passwords must match
        if (request.Password != request.ConfirmPassword)
            return Fail("Password and Confirm Password do not match.");

        // FR-REG-07: Duplicate mobile check
        if (_settings.DuplicateMobileCheck)
        {
            if (await _repo.IsMobileAlreadyRegisteredAsync(request.MobileNo))
                return Fail("A registration with this mobile number already exists.");
        }

        // FR-REG-08: Duplicate email check
        if (_settings.DuplicateEmailCheck)
        {
            if (await _repo.IsEmailAlreadyRegisteredAsync(request.EmailId.ToLowerInvariant()))
                return Fail("A registration with this email address already exists.");
        }

        // Encode password as Base64 — matches legacy CommonHelper.Base64Encrypt()
        var passwordBase64 = PasswordHelper.ToBase64(request.Password);

        // FR-REG-09: Call ApplicationForm_RegisterCandidate — returns 9-digit AppFormNo or "N"
        // @DOB param is type `date` — parse and reformat to ensure clean date (no time component)
        string dobForRegister = request.DateOfBirth;
        if (DateTime.TryParse(request.DateOfBirth, out var parsedRegDob))
            dobForRegister = parsedRegDob.ToString("yyyy-MM-dd"); // SQL date type accepts ISO yyyy-MM-dd

        var result = await _repo.RegisterCandidateAsync(
            applicationFormNo:    request.ApplicationFormNo,
            candidateName:        request.CandidateName.Trim().ToUpperInvariant(),
            fatherName:           "",   // always empty — confirmed from legacy
            genderCode:           request.GenderCode,
            dob:                  dobForRegister,
            mobileNo:             request.MobileNo.Trim(),
            emailId:              request.EmailId.Trim().ToLowerInvariant(),
            securityQuestionId:   request.SecurityQuestionId,
            securityAnswer:       request.SecurityAnswer.Trim().ToUpperInvariant(),
            passwordBase64:       passwordBase64,
            ipAddress:            ipAddress);

        // SP returns "N" or error message on failure; 9-digit string on success
        if (result == "N" || result.Length != 9)
        {
            var errorMsg = result == "N"
                ? "Registration failed. Please check your details and try again."
                : result;
            return Fail(errorMsg);
        }

        // FR-REG-10: Send welcome email + SMS asynchronously (failures don't block the response)
        _ = SendWelcomeMessagesAsync(result, request.MobileNo, request.EmailId, request.Password);

        _logger.LogInformation(
            "Candidate registered successfully. AppFormNo={AppFormNo}", result);

        return new RegisterCandidateResponse { Success = true, ApplicationFormNo = result };
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private async Task SendWelcomeMessagesAsync(
        string appFormNo, string mobileNo, string emailId, string plainPassword)
    {
        try
        {
            // Email template — Base_GetEMailSMS("NewCandidateRegistration", "E", appFormNo)
            var emailTemplate = await _repo.GetEmailSmsTemplateAsync(
                "NewCandidateRegistration", "E", appFormNo);
            if (emailTemplate != null && !string.IsNullOrEmpty(emailTemplate.Subject))
            {
                var body = emailTemplate.Message.Replace("##Password##", plainPassword);
                await SendEmailAsync(emailId, emailTemplate.Subject, body);
            }

            // SMS template — Base_GetEMailSMS("NewCandidateRegistration", "S", appFormNo)
            var smsTemplate = await _repo.GetEmailSmsTemplateAsync(
                "NewCandidateRegistration", "S", appFormNo);
            if (smsTemplate != null && !string.IsNullOrEmpty(smsTemplate.TemplateId))
            {
                await SendSmsAsync("91" + mobileNo, smsTemplate.TemplateId,
                    smsTemplate.Var1, plainPassword,
                    smsTemplate.Var3, smsTemplate.Var4, smsTemplate.Var5);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome messages for AppFormNo={AppFormNo}", appFormNo);
        }
    }

    /// <summary>
    /// Sends SMS via MSG91 HTTP API.
    /// Stub — full MSG91 integration in Phase 3 cross-cutting.
    /// Logs in dev mode for testing.
    /// </summary>
    private async Task SendSmsAsync(string mobileWithCode, string templateId,
        string var1, string var2 = "", string var3 = "", string var4 = "", string var5 = "")
    {
        _logger.LogInformation(
            "[SMS] To={Mobile} TemplateID={Template} Var1={V1}",
            mobileWithCode, templateId, var1);
        await Task.CompletedTask;
    }

    /// <summary>
    /// Sends email via SendGrid SDK.
    /// Stub — full SendGrid integration in Phase 3.
    /// Logs in dev mode for testing.
    /// </summary>
    private async Task SendEmailAsync(string to, string subject, string htmlBody)
    {
        _logger.LogInformation("[EMAIL] To={To} Subject={Subject}", to, subject);
        await Task.CompletedTask;
    }

    private static RegisterCandidateResponse Fail(string message) =>
        new() { Success = false, ErrorMessage = message };

    private static string MaskMobile(string mobile) =>
        mobile.Length >= 10 ? $"XXXXXX{mobile[^4..]}" : "XXXXXX";

    private static string MaskEmail(string email)
    {
        var at = email.IndexOf('@');
        return at > 2 ? $"{email[..2]}***{email[at..]}" : "***";
    }
}
