using System.Data;
using System.Linq;
using Asp.Versioning;
using Dapper;
using Microsoft.AspNetCore.Mvc;
using AgriPhd.Api.Helpers;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// Report data endpoints — data preview (QuestPDF PDF generation deferred to Phase 3).
/// All report SPs identified from legacy Reports/ ASPX pages.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/reports")]
public class ReportsController : ControllerBase
{
    private readonly IDbConnection _db;
    private static string S(IDictionary<string, object> d, string k) => d.ContainsKey(k) ? Convert.ToString(d[k] ?? "") ?? "" : "";
    private string LoginId => User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? "";
    private string TypeId  => User.FindFirst(JwtHelper.ClaimUserTypeId)?.Value ?? "0";
    private bool IsAuthorised => TypeId is "11" or "12" or "41" or "42" or "61" or "93";

    public ReportsController(IDbConnection db) => _db = db;

    // ── Allotment Report By College ───────────────────────────────────────────
    // Legacy: Reports/AllotmentReportByCollege.aspx | SP: Report_GetAllotmentReportByCollege(@PhaseID)
    [HttpGet("allotment-by-college/data")]
    public async Task<IActionResult> AllotmentByCollege([FromQuery] short phaseId = 0)
    {
        if (!IsAuthorised) return Forbid();
        var p = new DynamicParameters();
        p.Add("@PhaseID", phaseId);
        var rows = await _db.QueryAsync<dynamic>("Report_GetAllotmentReportByCollege", p, commandType: CommandType.StoredProcedure);
        return Ok(rows);
    }

    // ── Allotment Report By Course ────────────────────────────────────────────
    [HttpGet("allotment-by-course/data")]
    public async Task<IActionResult> AllotmentByCourse([FromQuery] short phaseId = 0, [FromQuery] long collegeId = 0)
    {
        if (!IsAuthorised) return Forbid();
        var p = new DynamicParameters();
        p.Add("@PhaseID",   phaseId);
        p.Add("@CollegeID", collegeId);
        var rows = await _db.QueryAsync<dynamic>("Report_GetAllotmentReportByCourse", p, commandType: CommandType.StoredProcedure);
        return Ok(rows);
    }

    // ── Composite Admission Report By College ────────────────────────────────
    // SP returns 2 result sets: [0]=MaxActivePhaseID, [1]=actual data with dynamic phase columns
    [HttpGet("composite-by-college/data")]
    public async Task<IActionResult> CompositeByCollege([FromQuery] short phaseId = 0)
    {
        if (!IsAuthorised) return Forbid();
        using var multi = await _db.QueryMultipleAsync(
            "Report_GetCompositeAdmissionReportByCollege", commandType: CommandType.StoredProcedure);
        var maxPhase = multi.IsConsumed ? 0 : (await multi.ReadAsync<dynamic>()).FirstOrDefault()?.MaxActivePhaseID ?? 0;
        var rows     = multi.IsConsumed ? Enumerable.Empty<dynamic>() : await multi.ReadAsync<dynamic>();
        return Ok(new { maxActivePhaseId = maxPhase, rows });
    }

    // ── EVC Wise Report ───────────────────────────────────────────────────────
    [HttpGet("evc-summary/data")]
    public async Task<IActionResult> EvcSummary()
    {
        if (!IsAuthorised) return Forbid();
        var rows = await _db.QueryAsync<dynamic>("Report_GetEVCWiseReport", commandType: CommandType.StoredProcedure);
        return Ok(rows);
    }

    // ── EVC Wise Candidate List ───────────────────────────────────────────────
    [HttpGet("evc-candidate-list/data")]
    public async Task<IActionResult> EvcCandidateList([FromQuery] long evcId = 0)
    {
        if (!IsAuthorised) return Forbid();
        var p = new DynamicParameters();
        p.Add("@EVCID", evcId);
        p.Add("@Flag",  "All");
        var rows = await _db.QueryAsync<dynamic>("Report_GetEVCWiseCandidateList", p, commandType: CommandType.StoredProcedure);
        return Ok(rows);
    }

    // ── Candidates Eligible For E-Verification ───────────────────────────────
    [HttpGet("eligible-for-everification/data")]
    public async Task<IActionResult> EligibleForEVerification()
    {
        if (!IsAuthorised) return Forbid();
        var p = new DynamicParameters();
        p.Add("@UserLoginID", LoginId);
        var rows = await _db.QueryAsync<dynamic>("Report_GetCandidatesEligibleForEverification", p, commandType: CommandType.StoredProcedure);
        return Ok(rows);
    }

    // ── Level 2: Courses by College (drill-down from AllotmentByCollege) ────────
    // Since Report_GetAllotmentReportByCourse references broken Master_CourseDetails,
    // we build the course list directly from Master_College + College_AllotmentDetails
    [HttpGet("courses-by-college")]
    public async Task<IActionResult> GetCoursesByCollege([FromQuery] long collegeId, [FromQuery] short phaseId)
    {
        if (!IsAuthorised) return Forbid();
        const string sql = @"
            SELECT
                PhaseID       = @PhaseID,
                CollegeID     = Z.CollegeID,
                ChoiceCode    = Z.CollegeCode,
                CourseName    = CAST(Z.CollegeCode AS VARCHAR) + ' - ' + F.FacultyName,
                Allotment     = (SELECT COUNT(*) FROM College_AllotmentDetails A WITH(NOLOCK) WHERE A.ChoiceCode = Z.CollegeCode AND A.PhaseID = @PhaseID),
                AllotmentLetterDownloaded = (SELECT COUNT(*) FROM College_AllotmentDetails A WITH(NOLOCK) WHERE A.ChoiceCode = Z.CollegeCode AND A.PhaseID = @PhaseID AND A.SeatAcceptanceStatus = 'Y'),
                NotReported   = (SELECT COUNT(*) FROM College_AllotmentDetails A WITH(NOLOCK) WHERE A.ChoiceCode = Z.CollegeCode AND A.PhaseID = @PhaseID AND A.ReportingStatus NOT IN ('Y','R','C','Z')),
                Admitted      = (SELECT COUNT(*) FROM College_AllotmentDetails A WITH(NOLOCK) WHERE A.ChoiceCode = Z.CollegeCode AND A.PhaseID = @PhaseID AND A.ReportingStatus = 'Y'),
                Rejected      = (SELECT COUNT(*) FROM College_AllotmentDetails A WITH(NOLOCK) WHERE A.ChoiceCode = Z.CollegeCode AND A.PhaseID = @PhaseID AND A.ReportingStatus = 'R'),
                Cancelled     = (SELECT COUNT(*) FROM College_AllotmentDetails A WITH(NOLOCK) WHERE A.ChoiceCode = Z.CollegeCode AND A.PhaseID = @PhaseID AND A.ReportingStatus = 'C'),
                Refused       = (SELECT COUNT(*) FROM College_AllotmentDetails A WITH(NOLOCK) WHERE A.ChoiceCode = Z.CollegeCode AND A.PhaseID = @PhaseID AND A.ReportingStatus = 'Z'),
                CollegeName   = CAST(Z.CollegeID AS VARCHAR) + ' - ' + Z.CollegeName
            FROM Master_College Z WITH(NOLOCK)
            INNER JOIN Master_Faculty F WITH(NOLOCK) ON Z.FacultyID = F.FacultyID
            WHERE Z.IsActive = 'Y' AND Z.CollegeID = @CollegeID";
        var p = new DynamicParameters();
        p.Add("@CollegeID", collegeId);
        p.Add("@PhaseID",   phaseId);
        var rows = await _db.QueryAsync<dynamic>(sql, p);

        // Also get college name
        var colName = await _db.QueryFirstOrDefaultAsync<string>(
            "EXEC Report_GetCollegeName @CollegeID", new { CollegeID = collegeId });
        return Ok(new { collegeName = colName ?? "", rows });
    }

    // ── Level 3: Student list (drill-down from courses) ───────────────────────
    // SP: Report_GetAllotmentReport(@ChoiceCode, @PhaseID, @Flag)
    // Flag values: Allotment | AllotmentLetterDownloaded | NotReported | Admitted | Rejected | Cancelled | Refused
    [HttpGet("student-list")]
    public async Task<IActionResult> GetStudentList(
        [FromQuery] long choiceCode, [FromQuery] short phaseId, [FromQuery] string flag = "Admitted")
    {
        if (!IsAuthorised) return Forbid();
        var p = new DynamicParameters();
        p.Add("@ChoiceCode", choiceCode);
        p.Add("@PhaseID",    phaseId);
        p.Add("@Flag",       flag);
        var rows = await _db.QueryAsync<dynamic>("Report_GetAllotmentReport", p, commandType: CommandType.StoredProcedure);
        // Also get college+course name for header
        var colName = await _db.QueryFirstOrDefaultAsync<string>(
            "EXEC Report_GetCollegeName @CollegeID",
            new { CollegeID = choiceCode }); // ChoiceCode = CollegeCode ≈ CollegeID in this DB
        return Ok(new { collegeName = colName ?? "", phaseId, choiceCode, flag, rows });
    }
    [HttpGet("{reportId}/data")]
    public async Task<IActionResult> GetReportData(string reportId, [FromQuery] short phaseId = 0, [FromQuery] long collegeId = 0, [FromQuery] long evcId = 0)
    {
        if (!IsAuthorised) return Forbid();
        return reportId switch
        {
            "allotment"                  => await AllotmentByCollege(phaseId),
            "allotment-by-college"       => await AllotmentByCollege(phaseId),
            "allotment-by-course"        => await AllotmentByCourse(phaseId, collegeId),
            "composite-by-college"       => await CompositeByCollege(phaseId),
            "evc-summary"                => await EvcSummary(),
            "evc-candidate-list"         => await EvcCandidateList(evcId),
            "eligible-for-everification" => await EligibleForEVerification(),
            _                            => Ok(Array.Empty<object>()),
        };
    }
}
