using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;
using Dapper;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/university")]
public class UniversityController : ControllerBase
{
    private readonly ICollegeRepository _repo;
    private readonly IDbConnection _db;
    private long GetUserId() => long.TryParse(User.FindFirst(JwtHelper.ClaimUserId)?.Value, out var v) ? v : 0;
    private string GetLoginId() => User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? "";

    public UniversityController(ICollegeRepository repo, IDbConnection db)
    {
        _repo = repo;
        _db   = db;
    }

    /// <summary>SP: SpotRound_DynamicVac(@UniversityID, @SubjectID)</summary>
    [HttpGet("vacancies")]
    [AllowAnonymous]
    public async Task<IActionResult> GetVacancies([FromQuery] short universityId = 0, [FromQuery] int subjectId = 0)
    {
        var result = await _repo.GetUniversityVacancyAsync(universityId, subjectId);
        return Ok(result);
    }

    // ── Spot Round admitted candidates list ───────────────────────────────────
    // SP: SpotRound_AllottedCandidateList(@UniversityID)
    [HttpGet("spot-round/allotment-letter")]
    public async Task<IActionResult> AllotmentLetter()
    {
        var universityId = (short)GetUserId();  // UserID = UniversityID for university role
        var p = new DynamicParameters();
        p.Add("@UniversityID", universityId);
        var rows = await _db.QueryAsync<dynamic>("SpotRound_AllottedCandidateList", p, commandType: CommandType.StoredProcedure);
        return Ok(rows);
    }

    // ── Individual allotment letter by ApplicationFormNo ──────────────────────
    // SP: SpotRound_GetAllotmentLetter(@PhaseID, @ApplicationFormNo)
    [HttpGet("spot-round/allotment-letter/{applicationFormNo}")]
    public async Task<IActionResult> GetAllotmentLetterByFormNo(string applicationFormNo, [FromQuery] short phaseId = 0)
    {
        var p = new DynamicParameters();
        p.Add("@PhaseID",           phaseId);
        p.Add("@ApplicationFormNo", applicationFormNo);
        var rows = await _db.QueryAsync<dynamic>("SpotRound_GetAllotmentLetter", p, commandType: CommandType.StoredProcedure);
        var data = rows.FirstOrDefault();
        if (data == null) return Ok(new { found = false });
        var d = (IDictionary<string, object>)data;
        string S(string k) => d.ContainsKey(k) ? Convert.ToString(d[k] ?? "") ?? "" : "";
        return Ok(new {
            found = true,
            applicationId           = S("ApplicationID"),
            applicationFormNo       = S("ApplicationFormNo"),
            candidateName           = S("CandidateName"),
            fatherName              = S("FatherName"),
            motherName              = S("MotherName"),
            gender                  = S("Gender"),
            dob                     = S("DOB"),
            mobileNo                = S("MobileNo"),
            emailId                 = S("EMailID"),
            category                = S("Category"),
            verifiedCategory        = S("VerifiedCategory"),
            isPWD                   = S("IsPWD"),
            isOrphan                = S("IsOrphan"),
            photoUrl                = S("PhotoURL"),
            signUrl                 = S("SignURL"),
            allotmentPhase          = S("AllotmentPhase"),
            allottedCollege         = S("AllottedCollege"),
            allottedCollegeDistrict = S("AllottedCollegeDistrict"),
            allottedFaculty         = S("FacultyName"),
            allottedSubject         = S("SubjectName"),
            allottedCategory        = S("AllottedCategory"),
            allottedQuota           = S("AllottedQuota"),
            allotmentDate           = S("AllotmentDate"),
            roasterSeqNo            = S("RoasterSeqNo"),
            roasterPoint            = S("RoasterPoint"),
            roasterCategory         = S("RoasterCategory"),
            allotedGender           = S("AllotedGender"),
            allottedTypeDisplay     = S("AllottedTypeDisplay"),
            admissionSchedule       = S("AdmissionSchedule"),
            candidateAdmissionLastDate = S("CandidateAdmissionLastDate"),
            nodalOfficerName        = S("AllottedNodalOfficerName"),
            nodalOfficerMobile      = S("AllottedNodalOfficerMobileNo"),
            nodalOfficerEmail       = S("AllottedNodalOfficerEMailID"),
            collegeUniversity       = S("CollegeUniversity"),
            candidateHomeUniversity = S("CandidateHomeUniversity"),
            meritNo                 = S("MeritNo"),
            degreeName              = S("DegreeName"),
        });
    }

    // Spot Round stubs
    [HttpPost("spot-round/check-eligibility")]
    public IActionResult CheckEligibility([FromBody] object _) => Ok(new { success = false, message = "Not implemented" });
    [HttpPost("spot-round/register")]
    public IActionResult Register([FromBody] object _) => Ok(new { success = false });
    [HttpPost("spot-round/admit")]
    public IActionResult Admit([FromBody] object _) => Ok(new { success = false });
    [HttpGet("spot-round/registered-candidates")]
    public IActionResult RegisteredCandidates() => Ok(Array.Empty<object>());
}
