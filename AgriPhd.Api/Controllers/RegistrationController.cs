using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using AgriPhd.Api.DTOs.Requests;
using AgriPhd.Api.DTOs.Responses;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;
using AgriPhd.Api.Services.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// P2-B-02 / P2-B-03: Candidate registration endpoints.
///
/// GET  /api/v1/registration/is-open           — Base_IsNewCandidateRegistrationStarted
/// POST /api/v1/registration/lookup            — ApplicationForm_GetRegisteredCandidate (FR-REG-02)
/// POST /api/v1/registration/send-mobile-otp   — Base_GetOTP (FR-REG-05)
/// POST /api/v1/registration/verify-otp        — Base_SaveOTPVerificationStatus
/// POST /api/v1/registration/register          — ApplicationForm_RegisterCandidate (FR-REG-09)
/// POST /api/v1/registration/send-email-otp    — for account recovery email OTP
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/registration")]
[AllowAnonymous]
public class RegistrationController : ControllerBase
{
    private readonly IRegistrationService   _service;
    private readonly INotificationRepository _notifRepo;
    private readonly AppSettings            _settings;
    private readonly IMemoryCache           _memCache;

    public RegistrationController(
        IRegistrationService service,
        INotificationRepository notifRepo,
        IOptions<AppSettings> settings,
        IMemoryCache memCache)
    {
        _service   = service;
        _notifRepo = notifRepo;
        _settings  = settings.Value;
        _memCache  = memCache;
    }

    // ── GET /registration/is-open ─────────────────────────────────────────────

    /// <summary>
    /// FR-REG-01: Returns whether registration is open.
    /// SP: Base_IsNewCandidateRegistrationStarted (no params).
    /// </summary>
    [HttpGet("is-open")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> IsOpen()
    {
        const string key = "registration:is-open";
        if (_memCache.TryGetValue(key, out bool cached))
            return Ok(new { isOpen = cached });

        var isOpen = await _notifRepo.IsNewCandidateRegistrationStartedAsync();
        _memCache.Set(key, isOpen, TimeSpan.FromHours(1));
        return Ok(new { isOpen });
    }

    // ── POST /registration/lookup ─────────────────────────────────────────────

    /// <summary>
    /// FR-REG-02: Look up pre-existing CET candidate record.
    /// Input: ApplicationFormNo + DateOfBirth (raw string).
    /// </summary>
    [HttpPost("lookup")]
    [ProducesResponseType(typeof(CandidateLookupResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CandidateLookupResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Lookup([FromBody] CandidateLookupRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.LookupCandidateAsync(request);

        if (!result.Found)
            return NotFound(result);

        return Ok(result);
    }

    // ── POST /registration/send-mobile-otp ───────────────────────────────────

    /// <summary>
    /// FR-REG-05: Send 4-digit OTP to candidate's mobile.
    /// Skipped when DevEnvironment=YES (auto-verified on client side).
    /// </summary>
    [HttpPost("send-mobile-otp")]
    [EnableRateLimiting("otp")]
    [ProducesResponseType(typeof(OtpResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> SendMobileOtp([FromBody] SendOtpRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // In dev mode, skip actual SMS — client auto-marks OTP as verified
        if (_settings.IsDevEnvironment)
            return Ok(new OtpResponse { Success = true, Message = "[DEV] OTP skipped — DevEnvironment=YES." });

        var result = await _service.SendMobileOtpAsync(request.MobileNo, request.Purpose);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ── POST /registration/send-email-otp ────────────────────────────────────

    [HttpPost("send-email-otp")]
    [EnableRateLimiting("otp")]
    [ProducesResponseType(typeof(OtpResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> SendEmailOtp([FromBody] SendOtpRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var result = await _service.SendEmailOtpAsync(request.MobileNo, request.Purpose);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ── POST /registration/verify-otp ────────────────────────────────────────

    /// <summary>
    /// Verify OTP entered by candidate.
    /// SP: Base_SaveOTPVerificationStatus(@MobileNo, @Purpose, @OTP).
    /// Same SP used for both mobile and email OTPs.
    /// </summary>
    [HttpPost("verify-otp")]
    [ProducesResponseType(typeof(OtpResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyRegistrationOtpRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        var result = await _service.VerifyOtpAsync(request.Recipient, request.Purpose, request.Otp);
        return result.Success ? Ok(result) : BadRequest(result);
    }

    // ── POST /registration/register ───────────────────────────────────────────

    /// <summary>
    /// FR-REG-04..12: Complete candidate registration.
    /// Returns 9-digit Application Form No on success (FR-REG-09 / FR-REG-11).
    /// </summary>
    [HttpPost("register")]
    [ProducesResponseType(typeof(RegisterCandidateResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(RegisterCandidateResponse), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterCandidateRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        // FR-REG-01: Guard — registration must be open
        var isOpen = await _notifRepo.IsNewCandidateRegistrationStartedAsync();
        if (!isOpen)
            return BadRequest(new RegisterCandidateResponse
            {
                Success = false,
                ErrorMessage = "Registration is currently closed. Please visit the homepage for updates."
            });

        var ipAddress = IpAddressHelper.GetIpAddressString(Request);
        var result    = await _service.RegisterAsync(request, ipAddress, _settings.IsDevEnvironment);

        return result.Success ? Ok(result) : BadRequest(result);
    }
}
