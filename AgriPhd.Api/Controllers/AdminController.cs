using Asp.Versioning;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using AgriPhd.Api.DTOs.Responses;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// Admin management endpoints — notifications, users, phases, EVC, activity status,
/// password generation, search candidate, app settings.
/// Role: SuperAdmin (11) + Admin (12) unless noted.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin")]
public class AdminController : ControllerBase
{
    private readonly IMemoryCache _cache;
    private readonly IAdminRepository _adminRepo;
    private readonly ILogger<AdminController> _logger;

    public AdminController(IMemoryCache cache, IAdminRepository adminRepo, ILogger<AdminController> logger)
    {
        _cache     = cache;
        _adminRepo = adminRepo;
        _logger    = logger;
    }

    private string LoginId => User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? "";
    private string UserTypeId => User.FindFirst(JwtHelper.ClaimUserTypeId)?.Value ?? "";
    private bool IsAdminOrSuperAdmin => UserTypeId is "11" or "12";
    // College (61), EVC (41/42), University (93) also need some lookup endpoints
    private bool IsPrivilegedUser => UserTypeId is "11" or "12" or "41" or "42" or "61" or "93";
    private string GetIp() => Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

    // ── Cache Reset ────────────────────────────────────────────────────────────
    [HttpPost("reset-cache")]
    [ProducesResponseType(typeof(MessageResponse), StatusCodes.Status200OK)]
    public IActionResult ResetCache()
    {
        if (UserTypeId != "11") return Forbid();
        if (_cache is MemoryCache mc) mc.Clear();
        _logger.LogInformation("Application cache cleared by {LoginId}", LoginId);
        return Ok(new MessageResponse { Success = true, Message = "Application cache cleared. Master data reloads on next request." });
    }

    // ── Notifications ─────────────────────────────────────────────────────────
    [HttpGet("notifications")]
    public async Task<IActionResult> GetNotifications()
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var rows = await _adminRepo.GetNotificationListAsync(1);
        return Ok(rows);
    }

    [HttpGet("notifications/{id:long}")]
    public async Task<IActionResult> GetNotificationDetails(long id)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var row = await _adminRepo.GetNotificationDetailsAsync(id);
        return row == null ? NotFound() : Ok(row);
    }

    [HttpPost("notifications")]
    public async Task<IActionResult> SaveNotification([FromBody] SaveNotificationRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.SaveNotificationAsync(req, LoginId, GetIp());
        if (result == "Y")
        {
            _cache.Remove("notifications:home:1");
            return Ok(new MessageResponse { Success = true, Message = "Notification saved." });
        }
        return BadRequest(new MessageResponse { Success = false, Message = result });
    }

    [HttpDelete("notifications/{id:long}")]
    public async Task<IActionResult> DeleteNotification(long id)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.DeleteNotificationAsync(id, LoginId, GetIp());
        if (result == "Y")
        {
            _cache.Remove("notifications:home:1");
            return Ok(new MessageResponse { Success = true, Message = "Notification deleted." });
        }
        return BadRequest(new MessageResponse { Success = false, Message = result });
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int userTypeId = 12)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var rows = await _adminRepo.GetUsersListAsync(userTypeId);
        // Mask passwords — never send to client
        var safe = rows.Select(r =>
        {
            var d = (IDictionary<string, object>)r;
            if (d.ContainsKey("UserPassword")) d["UserPassword"] = "***";
            return d;
        });
        return Ok(safe);
    }

    [HttpGet("users/{id:long}")]
    public async Task<IActionResult> GetUserDetails(long id)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var row = await _adminRepo.GetUserDetailsAsync(id);
        if (row == null) return NotFound();
        var d = (IDictionary<string, object>)row;
        if (d.ContainsKey("UserPassword")) d["UserPassword"] = "***";
        return Ok(d);
    }

    [HttpPost("users")]
    public async Task<IActionResult> SaveUser([FromBody] SaveUserRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.SaveUserAsync(req, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "User saved." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    [HttpPost("users/{id:long}/toggle-active")]
    public async Task<IActionResult> ToggleUserActive(long id)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.ActivateOrDeactivateUserAsync(id, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "User status updated." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    // ── Phases ────────────────────────────────────────────────────────────────
    [HttpGet("phases")]
    public async Task<IActionResult> GetPhases()
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var rows = await _adminRepo.GetPhaseListAsync();
        return Ok(rows);
    }

    [HttpGet("phases/{id:int}")]
    public async Task<IActionResult> GetPhaseDetails(int id)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var row = await _adminRepo.GetPhaseDetailsAsync(id);
        return row == null ? NotFound() : Ok(row);
    }

    [HttpPost("phases")]
    public async Task<IActionResult> SavePhase([FromBody] SavePhaseRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.SavePhaseAsync(req, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "Phase saved." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    [HttpDelete("phases/{id:int}")]
    public async Task<IActionResult> DeletePhase(int id)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.DeletePhaseAsync(id, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "Phase deleted." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    // ── EVC ───────────────────────────────────────────────────────────────────
    [HttpGet("evc")]
    public async Task<IActionResult> GetEvcList([FromQuery] string flag = "")
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var rows = await _adminRepo.GetEvcListAsync(flag);
        return Ok(rows);
    }

    [HttpGet("sub-evc")]
    public async Task<IActionResult> GetSubEvcList([FromQuery] long evcId = 0)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        // Use IMenuAdminRepository or AdminRepository — call GetSubEVCList SP
        var p = new { Flag = "All", EVCID = evcId };
        // Inline Dapper call since this is a simple query
        var conn = HttpContext.RequestServices.GetRequiredService<System.Data.IDbConnection>();
        var dp = new Dapper.DynamicParameters();
        dp.Add("@Flag",  "All");
        dp.Add("@EVCID", evcId);
        var rows = await conn.QueryAsync<dynamic>("Administration_GetSubEVCList", dp, commandType: System.Data.CommandType.StoredProcedure);
        return Ok(rows);
    }
    public async Task<IActionResult> GetEvcDetails(int id)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var row = await _adminRepo.GetEvcDetailsAsync(id);
        return row == null ? NotFound() : Ok(row);
    }

    [HttpPost("evc")]
    public async Task<IActionResult> SaveEvc([FromBody] SaveEvcRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.SaveEvcDetailsAsync(req, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "EVC saved." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    [HttpPost("evc/{id:int}/activate")]
    public async Task<IActionResult> ActivateEvc(int id)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.ActivateDeactivateEvcAsync(id, true, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "EVC activated." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    [HttpPost("evc/{id:int}/deactivate")]
    public async Task<IActionResult> DeactivateEvc(int id)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.ActivateDeactivateEvcAsync(id, false, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "EVC deactivated." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    // ── Activity Status ────────────────────────────────────────────────────────
    [HttpGet("activity-status")]
    public async Task<IActionResult> GetActivityStatus()
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var rows = await _adminRepo.GetActivityStatusListAsync(1);
        return Ok(rows);
    }

    [HttpPost("activity-status")]
    public async Task<IActionResult> SaveActivityStatus([FromBody] SaveActivityRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.SaveActivityStatusAsync(req, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "Activity status saved." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    [HttpGet("admission-activity")]
    public async Task<IActionResult> GetAdmissionActivityStatus()
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var rows = await _adminRepo.GetAdmissionActivityStatusListAsync();
        return Ok(rows);
    }

    [HttpPost("admission-activity")]
    public async Task<IActionResult> SaveAdmissionActivityStatus([FromBody] SaveAdmissionActivityRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var result = await _adminRepo.SaveAdmissionActivityStatusAsync(req, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "Admission activity saved." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    // ── Generate Passwords ────────────────────────────────────────────────────
    [HttpGet("users-for-password-gen")]
    public async Task<IActionResult> GetUsersForPasswordGen([FromQuery] int userTypeId = 21)
    {
        if (UserTypeId != "11") return Forbid();
        var rows = await _adminRepo.GetUserListForPasswordGenerationAsync(userTypeId);
        return Ok(rows);
    }

    [HttpPost("generate-passwords")]
    public async Task<IActionResult> GeneratePasswords([FromBody] GeneratePasswordsRequest req)
    {
        if (UserTypeId != "11") return Forbid();

        // If no specific user IDs, fetch all users of the given type (legacy behavior)
        var targetIds = req.UserIds;
        if (!targetIds.Any() && req.UserTypeId > 0)
        {
            var allUsers = await _adminRepo.GetUserListForPasswordGenerationAsync(req.UserTypeId);
            targetIds = allUsers.Select(u => Convert.ToInt64(((IDictionary<string,object>)u)["UserID"])).ToList();
        }

        int updated = 0;
        foreach (var userId in targetIds)
        {
            var pwd     = PasswordHelper.GenerateRandomPassword();
            var encoded = PasswordHelper.ToBase64(pwd);
            var result  = await _adminRepo.UpdateUserPasswordAsync(userId, encoded, LoginId, GetIp());
            if (result == "Y") updated++;
        }
        return Ok(new MessageResponse { Success = true, Message = $"Passwords Updated Successfully. ({updated} updated)" });
    }

    // ── Search Candidate ──────────────────────────────────────────────────────
    // ── Candidate lookup by LoginID / ApplicationFormNo ──────────────────────
    [HttpGet("candidate-by-login")]
    public async Task<IActionResult> GetCandidateByLogin([FromQuery] string loginId = "", [FromQuery] string searchBy = "L")
    {
        if (!IsPrivilegedUser) return Forbid();
        if (string.IsNullOrWhiteSpace(loginId)) return Ok(new { candidateId = 0 });
        var cid = searchBy == "A"
            ? await _adminRepo.GetCandidateIdByAppFormNoAsync(loginId)
            : await _adminRepo.GetCandidateIdByLoginAsync(loginId);
        return Ok(new { candidateId = cid, found = cid > 0 });
    }

    [HttpGet("search-candidate")]
    public async Task<IActionResult> SearchCandidate([FromQuery] string by = "ApplicationID", [FromQuery] string query = "")
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        if (string.IsNullOrWhiteSpace(query)) return Ok(Array.Empty<object>());
        var rows = await _adminRepo.SearchCandidateAsync(by, query);
        return Ok(rows);
    }

    [HttpPost("candidates/{id:long}/reset-password")]
    public async Task<IActionResult> ResetCandidatePassword(long id, [FromBody] AdminResetPasswordRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var encoded = PasswordHelper.ToBase64(req.NewPassword);
        var result = await _adminRepo.ResetCandidatePasswordAsync(id, encoded, LoginId, GetIp());
        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "Password reset." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    // Admin change candidate mobile (no OTP required for admin)
    [HttpPost("candidates/{id:long}/change-mobile")]
    public async Task<IActionResult> AdminChangeMobile(long id, [FromBody] AdminChangeMobileRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var conn = HttpContext.RequestServices.GetRequiredService<System.Data.IDbConnection>();
        var p = new Dapper.DynamicParameters();
        p.Add("@CandidateID", id);
        p.Add("@MobileNo",    req.MobileNo);
        p.Add("@UserLoginID", LoginId);
        p.Add("@IPAddress",   GetIp());
        var r = await conn.ExecuteScalarAsync<string>("Account_ChangeCandidateMobileNo", p, commandType: System.Data.CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N"
            ? Ok(new MessageResponse { Success = true, Message = "Mobile Number changed successfully." })
            : BadRequest(new MessageResponse { Success = false, Message = "Failed to change mobile number." });
    }

    // Admin change candidate email (no OTP required for admin)
    [HttpPost("candidates/{id:long}/change-email")]
    public async Task<IActionResult> AdminChangeEmail(long id, [FromBody] AdminChangeEmailRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var conn = HttpContext.RequestServices.GetRequiredService<System.Data.IDbConnection>();
        var p = new Dapper.DynamicParameters();
        p.Add("@CandidateID", id);
        p.Add("@EMailID",     req.EMailId);
        p.Add("@UserLoginID", LoginId);
        p.Add("@IPAddress",   GetIp());
        var r = await conn.ExecuteScalarAsync<string>("Account_ChangeCandidateEMailID", p, commandType: System.Data.CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N"
            ? Ok(new MessageResponse { Success = true, Message = "E-Mail ID changed successfully." })
            : BadRequest(new MessageResponse { Success = false, Message = "Failed to change e-mail." });
    }

    // Admin change candidate security question
    [HttpPost("candidates/{id:long}/change-security-question")]
    public async Task<IActionResult> AdminChangeSecurityQuestion(long id, [FromBody] AdminChangeSecurityQuestionRequest req)
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        var conn = HttpContext.RequestServices.GetRequiredService<System.Data.IDbConnection>();
        var p = new Dapper.DynamicParameters();
        p.Add("@UserID",                 id);
        p.Add("@SecurityQuestionID",     req.SecurityQuestionId);
        p.Add("@SecurityQuestionAnswer", req.SecurityQuestionAnswer);
        p.Add("@UserLoginID",            LoginId);
        p.Add("@IPAddress",              GetIp());
        var r = await conn.ExecuteScalarAsync<string>("Account_ResetSecurityQuestion", p, commandType: System.Data.CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N"
            ? Ok(new MessageResponse { Success = true, Message = "Security Question changed successfully." })
            : BadRequest(new MessageResponse { Success = false, Message = "Failed to change security question." });
    }

    // ── App Settings ──────────────────────────────────────────────────────────
    [HttpGet("app-settings")]
    public IActionResult GetAppSettings()
    {
        if (UserTypeId != "11") return Forbid();
        var settings = new[]
        {
            new { key = "Environment",      value = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Production" },
            new { key = "MachineName",      value = Environment.MachineName },
            new { key = "DotNetVersion",    value = Environment.Version.ToString() },
            new { key = "ServerTime (UTC)", value = DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss") },
            new { key = "ServerTime (IST)", value = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, TimeZoneInfo.FindSystemTimeZoneById("India Standard Time")).ToString("yyyy-MM-dd HH:mm:ss") },
        };
        return Ok(settings);
    }

    // ── Reports list ──────────────────────────────────────────────────────────
    [HttpGet("report-config")]
    public IActionResult GetReportConfig()
    {
        if (!IsAdminOrSuperAdmin) return Forbid();
        return Ok(Array.Empty<object>()); // Phase 3 — QuestPDF reports
    }
}

// ── Extra DTOs ────────────────────────────────────────────────────────────────
public class GeneratePasswordsRequest
{
    public List<long> UserIds { get; set; } = new();
    public int UserTypeId { get; set; } = 0; // if UserIds is empty, generate for all of this type
}

public class AdminResetPasswordRequest         { public string NewPassword           { get; set; } = ""; }
public class AdminChangeMobileRequest          { public string MobileNo              { get; set; } = ""; }
public class AdminChangeEmailRequest           { public string EMailId               { get; set; } = ""; }
public class AdminChangeSecurityQuestionRequest
{
    public short  SecurityQuestionId     { get; set; }
    public string SecurityQuestionAnswer { get; set; } = "";
}
