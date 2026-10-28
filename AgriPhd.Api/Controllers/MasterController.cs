using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// Master data endpoints.
/// P1-MASTER-02: GET /api/v1/master/{tableName}  — generic dropdown
/// P1-MASTER-03: POST /api/v1/admin/reset-cache   — Super Admin cache invalidation
///
/// All responses are cached in IMemoryCache for 1 hour (matching legacy Global.asax TTL).
/// Cache keys are prefixed "master:" so they can all be cleared atomically.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/master")]
public class MasterController : ControllerBase
{
    private readonly IMasterRepository _repo;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CACHE_TTL = TimeSpan.FromHours(1);

    public MasterController(IMasterRepository repo, IMemoryCache cache)
    {
        _repo  = repo;
        _cache = cache;
    }

    // ── Generic endpoint — drives all simple dropdown lists ──────────────────

    /// <summary>
    /// Returns a dropdown list for the named master table.
    /// Supported names: gender, category, state, district, taluka, religion, domicile-type,
    /// qualification, course, faculty, saluation, sports-name, sports-rank, university,
    /// security-question, payment-gateway, course-status, college-district, college-status,
    /// course-type, course-seat-type, course-shift, phase.
    /// </summary>
    [HttpGet("{tableName}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<DropdownItem>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Get(string tableName)
    {
        var key = $"master:{tableName.ToLowerInvariant()}";

        if (_cache.TryGetValue(key, out IEnumerable<DropdownItem>? cached) && cached != null)
            return Ok(cached);

        var items = await FetchMasterDataAsync(tableName);
        if (items == null)
            return BadRequest(new { message = $"Unknown master table: {tableName}" });

        _cache.Set(key, items, CACHE_TTL);
        return Ok(items);
    }

    /// <summary>
    /// Returns the salutation → gender mapping used on the Personal Details form.
    /// </summary>
    [HttpGet("saluation-map")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<SaluationMapItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSaluationMap()
    {
        const string key = "master:saluation-map";
        if (_cache.TryGetValue(key, out IEnumerable<SaluationMapItem>? cached) && cached != null)
            return Ok(cached);

        var items = await _repo.GetMasterSaluationMapAsync();
        _cache.Set(key, items, CACHE_TTL);
        return Ok(items);
    }

    /// <summary>Colleges filtered by faculty — not cached (depends on facultyId param).</summary>
    [HttpGet("colleges")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<DropdownItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetColleges([FromQuery] int facultyId)
    {
        var key = $"master:colleges:{facultyId}";
        if (_cache.TryGetValue(key, out IEnumerable<DropdownItem>? cached) && cached != null)
            return Ok(cached);

        var items = await _repo.GetMasterCollegeAsync(facultyId);
        _cache.Set(key, items, CACHE_TTL);
        return Ok(items);
    }

    /// <summary>Spot-round subjects filtered by university.</summary>
    [HttpGet("spot-round-subjects")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<DropdownItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSpotRoundSubjects([FromQuery] short universityId)
    {
        var items = await _repo.GetSpotRoundMasterSubjectAsync(universityId);
        return Ok(items);
    }

    // ── Private routing ───────────────────────────────────────────────────────

    private async Task<IEnumerable<DropdownItem>?> FetchMasterDataAsync(string tableName) =>
        tableName.ToLowerInvariant() switch
        {
            // Dedicated SPs
            "district"         => await _repo.GetMasterDistrictAsync(),
            "taluka"           => await _repo.GetMasterTalukaAsync(),
            "college-district" => await _repo.GetMasterCollegeDistrictAsync(),
            "course"           => await _repo.GetMasterCourseAsync(),
            "faculty"          => await _repo.GetMasterFacultyAsync(),
            "course-status"    => await _repo.GetMasterCourseStatusAsync(),
            "course-type"      => await _repo.GetMasterCourseTypeAsync(),
            "course-seat-type" => await _repo.GetMasterCourseSeatTypeAsync(),
            "course-shift"     => await _repo.GetMasterCourseShiftAsync(),
            "sports-rank"      => await _repo.GetMasterSportsRankAsync(),
            "phase"            => await _repo.GetMasterPhaseAsync(),

            // Generic Base_GetMasterTableList SPs
            "gender"           => await _repo.GetMasterTableListAsync("Master_Gender",           "GenderCode",        "Gender",          orderByFields: "GenderCode"),
            "category"         => await _repo.GetMasterTableListAsync("Master_Category",          "CategoryID",        "Category",        orderByFields: "SeqNo"),
            "state"            => await _repo.GetMasterTableListAsync("Master_State",             "StateID",           "State",           orderByFields: "State"),
            "religion"         => await _repo.GetMasterTableListAsync("Master_Religion",          "ReligionID",        "Religion",        orderByFields: "SeqNo"),
            "domicile-type"    => await _repo.GetMasterTableListAsync("Master_DomicileType",      "DomicileTypeID",    "DomicileType",    orderByFields: "SeqNo"),
            "qualification"    => await _repo.GetMasterTableListAsync("Master_Qualification",     "QualificationID",   "Qualification",   orderByFields: "QualificationID"),
            "saluation"        => await _repo.GetMasterTableListAsync("Master_Saluation",         "SaluationID",       "Saluation",       orderByFields: "SeqNo"),
            "sports-name"      => await _repo.GetMasterTableListAsync("Master_Sports",            "SportsID",          "SportsName",      orderByFields: "SeqNo"),
            "university"       => await _repo.GetMasterTableListAsync("Master_University",        "UniversityID",      "UniversityName",  orderByFields: "UniversityName"),
            "security-question"=> await _repo.GetMasterTableListAsync("Master_SecurityQuestion",  "SecurityQuestionID","SecurityQuestion",orderByFields: "SecurityQuestion"),
            "payment-gateway"  => await _repo.GetMasterTableListAsync("Master_PaymentGateway",    "PaymentGatewayID",  "PaymentGateway",  orderByFields: "PaymentGatewayID"),
            "college-status"   => await _repo.GetMasterTableListAsync("Master_CollegeStatus",     "CollegeStatusID",   "CollegeStatus",   orderByFields: "CollegeStatusID"),
            "notification-category" => await _repo.GetMasterTableListAsync("Master_NotificationCategory", "NotificationCategoryID", "NotificationCategory", orderByFields: "NotificationCategory"),
            "user-type"        => await _repo.GetMasterTableListAsync("Master_UserType",          "UserTypeID",        "UserType",        orderByFields: "UserTypeID"),

            _ => null
        };
}
