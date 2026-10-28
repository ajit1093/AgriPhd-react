using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// P2-A-08: GET /api/v1/colleges/search        — College_SearchCollege
/// P2-A-09: GET /api/v1/colleges/search-agri   — College_SearchAgriCollege
/// P2-A-10: GET /api/v1/admission/allotment-list — Admission_GetAllotmentList
/// All public (no auth required).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/colleges")]
[AllowAnonymous]
public class CollegeController : ControllerBase
{
    private readonly ICollegeRepository _repo;
    public CollegeController(ICollegeRepository repo) => _repo = repo;

    /// <summary>
    /// Public college search. Mirrors Public/SearchCollege.aspx.
    /// SP: College_SearchCollege(@CourseID, @DistrictID, @CourseStatusID).
    /// Pass 0 for any parameter to mean "All".
    /// </summary>
    [HttpGet("search")]
    [ProducesResponseType(typeof(IEnumerable<CollegeSearchResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] short courseId = 0,
        [FromQuery] int   districtId = 0,
        [FromQuery] short courseStatusId = 0)
    {
        var results = await _repo.SearchCollegeAsync(courseId, districtId, courseStatusId);
        return Ok(results);
    }

    /// <summary>
    /// Agriculture college search. Mirrors Public/SearchAgriCollege.aspx.
    /// SP: College_SearchAgriCollege(@FacultyID, @CollegeUniversityID, @CollegeStatusID).
    /// </summary>
    [HttpGet("search-agri")]
    [ProducesResponseType(typeof(IEnumerable<AgriCollegeSearchResult>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchAgri(
        [FromQuery] short facultyId = 0,
        [FromQuery] int   universityId = 0,
        [FromQuery] short collegeStatusId = 0)
    {
        var results = await _repo.SearchAgriCollegeAsync(facultyId, universityId, collegeStatusId);
        return Ok(results);
    }
    // ── P2-I: College management ──────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetCollegeList(
        [FromQuery] short facultyId = 0, [FromQuery] int districtId = 0,
        [FromQuery] string collegeCode = "", [FromQuery] string collegeName = "")
    {
        var rows = await _repo.GetCollegeListAsync(facultyId, districtId, collegeCode, collegeName);
        return Ok(rows);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetCollegeDetails(long id)
    {
        var data = await _repo.GetCollegeDetailsAsync(id);
        return data == null ? NotFound() : Ok(data);
    }

    [HttpGet("{id}/summary")]
    public async Task<IActionResult> GetCollegeSummary(long id)
    {
        var data = await _repo.GetCollegeSummaryAsync(id);
        return data == null ? NotFound() : Ok(data);
    }

    [HttpPost("{id}")]
    public async Task<IActionResult> SaveCollegeDetails(long id, [FromBody] object body)
    {
        var loginId = User.FindFirst(AgriPhd.Api.Helpers.JwtHelper.ClaimUserLoginId)?.Value ?? "";
        var ip      = AgriPhd.Api.Helpers.IpAddressHelper.GetIpAddressString(Request);
        // Merge id into body
        var dict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(body?.ToString() ?? "{}")!;
        dict["collegeID"] = id;
        var ok = await _repo.SaveCollegeDetailsAsync(dict, loginId, ip);
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    // P2-I-04: Get college password (Super Admin only) — uses Account_GetUserPassword
    [HttpGet("{collegeCode}/password")]
    public async Task<IActionResult> GetCollegePassword(string collegeCode)
    {
        // Uses existing AuthRepository.GetUserPasswordAsync
        var authRepo = HttpContext.RequestServices.GetRequiredService<AgriPhd.Api.Repositories.Interfaces.IAuthRepository>();
        var pwd = await authRepo.GetUserPasswordAsync(collegeCode);
        if (pwd == null) return NotFound();
        // Decrypt Base64 if not bcrypt
        var plain = AgriPhd.Api.Helpers.PasswordHelper.IsBcryptHash(pwd) ? "[bcrypt — cannot display]"
                  : AgriPhd.Api.Helpers.PasswordHelper.FromBase64(pwd);
        return Ok(new { collegeCode, password = plain });
    }

    // P2-I-05: Reset college password — uses Account_ResetPassword
    [HttpPost("{collegeCode}/reset-password")]
    public async Task<IActionResult> ResetCollegePassword(string collegeCode, [FromBody] ResetCollegePasswordDto dto)
    {
        var authRepo  = HttpContext.RequestServices.GetRequiredService<AgriPhd.Api.Repositories.Interfaces.IAuthRepository>();
        var loginId   = User.FindFirst(AgriPhd.Api.Helpers.JwtHelper.ClaimUserLoginId)?.Value ?? "";
        var ip        = AgriPhd.Api.Helpers.IpAddressHelper.GetIpAddressString(Request);
        var userId    = await authRepo.GetUserIdAsync(collegeCode);
        if (userId <= 0) return NotFound(new { message = "College not found." });
        var newHash   = AgriPhd.Api.Helpers.PasswordHelper.HashPassword(dto.NewPassword);
        var ok        = await authRepo.ResetPasswordAsync(userId, newHash, loginId, ip);
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }
}

public record ResetCollegePasswordDto(string NewPassword);
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admission")]
[AllowAnonymous]
public class PublicAdmissionController : ControllerBase
{
    private readonly ICollegeRepository _repo;
    public PublicAdmissionController(ICollegeRepository repo) => _repo = repo;

    /// <summary>
    /// Public allotment list. Mirrors Public/AllotmentList.aspx.
    /// SP: Admission_GetAllotmentList(@CollegeID, @PhaseID).
    /// </summary>
    [HttpGet("allotment-list")]
    [ProducesResponseType(typeof(IEnumerable<AllotmentListItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllotmentList(
        [FromQuery] long collegeId = 0,
        [FromQuery] int  phaseId = 0)
    {
        var results = await _repo.GetAllotmentListAsync(collegeId, phaseId);
        return Ok(results);
    }
}
