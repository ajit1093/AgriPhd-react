using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admission")]
public class AdmissionController : ControllerBase
{
    private readonly IAdmissionRepository _repo;
    public AdmissionController(IAdmissionRepository repo) => _repo = repo;

    [HttpGet("phases")]
    public async Task<IActionResult> GetPhases([FromQuery] string flag = "AllotmentDisplay")
    {
        var lid = GetLoginId(); var uid = (int)GetUserId();
        var rows = await _repo.GetPhaseListAsync(uid, flag, lid);
        return Ok(rows.Select(r =>
        {
            var d = (IDictionary<string, object>)r;
            var vals = d.Values.ToList();
            return new { value = Convert.ToString(vals.Count > 0 ? vals[0] : ""), text = Convert.ToString(vals.Count > 1 ? vals[1] : "") };
        }));
    }

    [HttpGet("current-phase")]
    public async Task<IActionResult> GetCurrentPhase() => Ok(new { phaseId = await _repo.GetCurrentPhaseIdAsync() });

    // P2-H-01
    [HttpGet("allotment-status")]
    public async Task<IActionResult> GetAllotmentStatus([FromQuery] short phaseId = 0)
    {
        if (phaseId == 0) phaseId = await _repo.GetCurrentPhaseIdAsync();
        var data = await _repo.GetAllotmentStatusAsync(phaseId, GetUserId());
        if (data == null) return Ok(new { found = false });
        var d = (IDictionary<string, object>)data;
        return Ok(new
        {
            found             = true,
            candidateName     = S(d, "CandidateName"),
            applicationFormNo = S(d, "ApplicationFormNo"),
            allottedCollege   = S(d, "AllottedCollege"),
            allottedCollegeCode = S(d, "AllottedCollegeCode"),
            allottedCategory  = S(d, "AllottedCategory"),
            allottedQuota     = S(d, "AllottedQuota"),
            facultyName       = S(d, "FacultyName"),
            subjectName       = S(d, "SubjectName"),
            allotmentPhase    = S(d, "AllotmentPhase"),
            district          = S(d, "AllottedCollegeDistrict"),
            reportingStatus   = S(d, "ReportingStatus"),
            isAccepted        = CB(d, "IsAccepted"),
            isRefused         = CB(d, "IsRefused"),
            refusalReason     = S(d, "RefusalReason"),
            isEligibleToDownload = CB(d, "IsEligibleToDownloadAllotmentLetter"),
            isAllotmentLetterDownloaded = CB(d, "IsAllotmentLetterDownloaded"),
            roasterSeqNo      = S(d, "RoasterSeqNo"),
            roasterPoint      = S(d, "RoasterPoint"),
        });
    }

    // P2-H-02: Accept / Refuse allotment
    [HttpPost("save-allotment-response")]
    public async Task<IActionResult> SaveAllotmentResponse([FromBody] AllotmentResponseDto dto)
    {
        var ok = await _repo.SaveAllotmentLetterStatusAsync(
            dto.PhaseId, GetUserId(), dto.ChoiceCode,
            dto.IsAccepted, dto.IsRefused, dto.RefusalReason ?? "",
            GetLoginId(), IpAddressHelper.GetIpAddressString(Request));
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    // P2-H-04
    [HttpGet("allotment-summary")]
    public async Task<IActionResult> GetAllotmentSummary()
    {
        var data = await _repo.GetAllotmentSummaryAsync(GetUserId());
        return Ok(data);
    }

    // P2-H-06: Allotted students (College role)
    [HttpGet("allotted-students")]
    public async Task<IActionResult> GetAllottedStudents(
        [FromQuery] int faculty = 0, [FromQuery] short subjectId = 0,
        [FromQuery] int phaseId = 0, [FromQuery] string reportStatus = "")
    {
        var collegeId = (int)GetUserId();
        var rows = await _repo.GetAllottedStudentsAsync(faculty, subjectId, phaseId, collegeId, reportStatus);
        return Ok(rows);
    }

    // P2-H-03: Allotment letter phases available for download
    [HttpGet("allotment-letter-phases")]
    public async Task<IActionResult> GetAllotmentLetterPhases()
    {
        var candidateId = GetUserId();
        var loginId     = GetLoginId();
        var userTypeId  = (int)(long.TryParse(User.FindFirst(JwtHelper.ClaimUserTypeId)?.Value, out var ut) ? ut : 0);
        var phases = await _repo.GetPhaseListRoundWiseAsync(candidateId, userTypeId, "DownloadAllotmentLetterRoundwise", loginId);
        return Ok(phases.Select(r =>
        {
            var d = (IDictionary<string, object>)r;
            var vals = d.Values.ToList();
            return new { value = Convert.ToString(vals.Count > 0 ? vals[0] : ""), text = Convert.ToString(vals.Count > 1 ? vals[1] : "") };
        }));
    }

    // P2-H-03: Allotment letter data for a specific phase
    [HttpGet("allotment-letter/{phaseId}")]
    public async Task<IActionResult> GetAllotmentLetter(short phaseId)
    {
        var candidateId = GetUserId();
        var loginId     = GetLoginId();
        var data = await _repo.GetAllotmentLetterAsync(candidateId, phaseId, loginId);
        if (data == null) return Ok(new { found = false });
        var d = (IDictionary<string, object>)data;
        // Mark as downloaded
        _ = _repo.SaveAllotmentLetterDownloadedAsync(candidateId, phaseId, loginId, IpAddressHelper.GetIpAddressString(Request));
        return Ok(new {
            found                        = true,
            applicationId                = S(d, "ApplicationID"),
            applicationFormNo            = S(d, "ApplicationFormNo"),
            candidateName                = S(d, "CandidateName"),
            fatherName                   = S(d, "FatherName"),
            motherName                   = S(d, "MotherName"),
            gender                       = S(d, "Gender"),
            dob                          = S(d, "DOB"),
            mobileNo                     = S(d, "MobileNo"),
            emailId                      = S(d, "EMailID"),
            category                     = S(d, "Category"),
            verifiedCategory             = S(d, "VerifiedCategory"),
            isPWD                        = S(d, "IsPWD"),
            isOrphan                     = S(d, "IsOrphan"),
            photoUrl                     = S(d, "PhotoURL"),
            signUrl                      = S(d, "SignURL"),
            allotmentPhase               = S(d, "AllotmentPhase"),
            allottedCollege              = S(d, "AllottedCollege"),
            allottedCollegeDistrict      = S(d, "AllottedCollegeDistrict"),
            allottedFaculty              = S(d, "FacultyName"),
            allottedSubject              = S(d, "SubjectName"),
            allottedCategory             = S(d, "AllottedCategory"),
            allottedQuota                = S(d, "AllottedQuota"),
            allotmentDate                = S(d, "AllotmentDate"),
            roasterSeqNo                 = S(d, "RoasterSeqNo"),
            roasterPoint                 = S(d, "RoasterPoint"),
            roasterCategory              = S(d, "RoasterCategory"),
            allotedGender                = S(d, "AllotedGender"),
            allottedTypeDisplay          = S(d, "AllottedTypeDisplay"),
            admissionSchedule            = S(d, "AdmissionSchedule"),
            candidateAdmissionLastDate   = S(d, "CandidateAdmissionLastDate"),
            nodalOfficerName             = S(d, "AllottedNodalOfficerName"),
            nodalOfficerMobile           = S(d, "AllottedNodalOfficerMobileNo"),
            nodalOfficerEmail            = S(d, "AllottedNodalOfficerEMailID"),
            collegeUniversity            = S(d, "CollegeUniversity"),
            candidateHomeUniversity      = S(d, "CandidateHomeUniversity"),
            meritNo                      = S(d, "MeritNo"),
            degreeName                   = S(d, "DegreeName"),
        });
    }

    // P2-H-08: Admission Letter (candidate view)
    [HttpGet("admission-letter")]
    public async Task<IActionResult> GetAdmissionLetter([FromQuery] short phaseId = 0)
    {
        var candidateId = GetUserId();
        var loginId     = GetLoginId();
        if (phaseId == 0) phaseId = await _repo.GetCurrentPhaseIdAsync();

        // Get PHDCollegeCode directly from College_AllotmentDetails (confirmed admission)
        var choiceCode = await _repo.GetConfirmedChoiceCodeAsync(candidateId, phaseId);
        if (choiceCode == 0)
        {
            // Try all phases if current phase has no confirmed admission
            choiceCode = await _repo.GetConfirmedChoiceCodeAsync(candidateId, 0);
        }
        if (choiceCode == 0) return Ok(new { found = false });

        var data = await _repo.GetAdmissionSummaryAsync(candidateId, choiceCode, phaseId, loginId, "Y", "PrintAdmissionLetter");
        if (data == null) return Ok(new { found = false });
        var d = (IDictionary<string, object>)data;
        return Ok(new {
            found                   = true,
            applicationId           = S(d, "ApplicationID"),
            applicationFormNo       = S(d, "ApplicationFormNo"),
            candidateName           = S(d, "CandidateName"),
            fatherName              = S(d, "FatherName"),
            motherName              = S(d, "MotherName"),
            gender                  = S(d, "Gender"),
            dob                     = S(d, "DOB"),
            mobileNo                = S(d, "MobileNo"),
            emailId                 = S(d, "EMailID"),
            category                = S(d, "Category"),
            isPWD                   = S(d, "IsPWD"),
            isOrphan                = S(d, "IsOrphan"),
            photoUrl                = S(d, "PhotoURL"),
            signUrl                 = S(d, "SignURL"),
            allotmentPhase          = S(d, "AllotmentPhase"),
            allottedCollege         = S(d, "AllottedCollege"),
            allottedCollegeDistrict = S(d, "AllottedCollegeDistrict"),
            allottedFaculty         = S(d, "AllottedFaculty"),
            allottedSubject         = S(d, "AllottedSubject"),
            allottedCategory        = S(d, "AllottedCategory"),
            allottedQuota           = S(d, "AllottedQuota"),
            allotmentDate           = S(d, "AllotmentDate"),
            roasterSeqNo            = S(d, "RoasterSeqNo"),
            roasterPoint            = S(d, "RoasterPoint"),
            roasterCategory         = S(d, "RoasterCategory"),
            allotedGender           = S(d, "AllotedGender"),
            collegeAllottedType     = S(d, "CollegeAllottedType"),
            nodalOfficerName        = S(d, "AllottedNodalOfficerName"),
            nodalOfficerMobile      = S(d, "AllottedNodalOfficerMobileNo"),
            nodalOfficerEmail       = S(d, "AllottedNodalOfficerEMailID"),
            candidateHomeUniversity = S(d, "CandidateHomeUniversity"),
            reportingStatus         = S(d, "ReportingStatus"),
            reportedOn              = S(d, "ReportedOn"),
            admissionComments       = S(d, "AdmissionComments"),
            printedOn               = S(d, "PrintedOn"),
        });
    }

    // P2-H-07: Get admission summary for a candidate (College view)
    [HttpGet("admission-summary/{candidateId}")]
    public async Task<IActionResult> GetAdmissionSummary(long candidateId, [FromQuery] short phaseId = 0)
    {
        if (phaseId == 0) phaseId = await _repo.GetCurrentPhaseIdAsync();
        var loginId = GetLoginId();
        var data = await _repo.GetAdmissionSummaryAsync(candidateId, 0, phaseId, loginId, "N", "ConfirmAdmission");
        if (data == null) return Ok(new { found = false });
        var d = (IDictionary<string, object>)data;
        return Ok(new {
            found                       = true,
            candidateId                 = candidateId,
            phaseId                     = phaseId,
            applicationFormNo           = S(d, "ApplicationFormNo"),
            candidateName               = S(d, "CandidateName"),
            fatherName                  = S(d, "FatherName"),
            motherName                  = S(d, "MotherName"),
            gender                      = S(d, "Gender"),
            dob                         = S(d, "DOB"),
            emailId                     = S(d, "EMailID"),
            mobileNo                    = S(d, "MobileNo"),
            category                    = S(d, "Category"),
            isPWD                       = S(d, "IsPWD"),
            isOrphan                    = S(d, "IsOrphan"),
            photoUrl                    = S(d, "PhotoURL"),
            signUrl                     = S(d, "SignURL"),
            allotmentPhase              = S(d, "AllotmentPhase"),
            allottedCollege             = S(d, "AllottedCollege"),
            allottedCollegeCode         = S(d, "AllottedCollegeCode"),
            allottedCollegeId           = Convert.ToInt64(d.ContainsKey("AllottedCollegeID") ? d["AllottedCollegeID"] ?? 0L : 0L),
            phdCollegeCode              = Convert.ToInt64(d.ContainsKey("AllottedCollegeCode") ? d["AllottedCollegeCode"] ?? 0L : 0L),
            allottedFaculty             = S(d, "AllottedFaculty"),
            allottedSubject             = S(d, "AllottedSubject"),
            allottedCategory            = S(d, "AllottedCategory"),
            allottedQuota               = S(d, "AllottedQuota"),
            collegeCode                 = S(d, "CollegeCode"),
            subjectCode                 = S(d, "SubjectCode"),
            roasterSeqNo                = S(d, "RoasterSeqNo"),
            roasterPoint                = S(d, "RoasterPoint"),
            roasterCategory             = S(d, "RoasterCategory"),
            allotedGender               = S(d, "AllotedGender"),
            collegeAllotedType          = S(d, "CollegeAllottedType"),
            candidateHomeUniversity     = S(d, "CandidateHomeUniversity"),
            nodalOfficerName            = S(d, "AllottedNodalOfficerName"),
            nodalOfficerMobile          = S(d, "AllottedNodalOfficerMobileNo"),
            nodalOfficerEmail           = S(d, "AllottedNodalOfficerEMailID"),
        });
    }

    // P2-H-07: Confirm Admission (College)
    [HttpPost("confirm")]
    public async Task<IActionResult> ConfirmAdmission([FromBody] AdmissionActionDto dto)
    {
        var ok = await _repo.ConfirmAdmissionAsync(dto.CandidateId, dto.ChoiceCode, dto.PhaseId,
            dto.Comments ?? "", GetLoginId(), IpAddressHelper.GetIpAddressString(Request));
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false, message = "Confirmation failed." });
    }

    [HttpPost("reject")]
    public async Task<IActionResult> RejectAdmission([FromBody] AdmissionActionDto dto)
    {
        var ok = await _repo.RejectAdmissionAsync(dto.CandidateId, dto.ChoiceCode, dto.PhaseId,
            dto.Comments ?? "", GetLoginId(), IpAddressHelper.GetIpAddressString(Request));
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    // P2-H-14: Cancel Admission (Admin)
    [HttpPost("cancel")]
    public async Task<IActionResult> CancelAdmission([FromBody] AdmissionActionDto dto)
    {
        var ok = await _repo.CancelAdmissionAsync(dto.CandidateId, dto.ChoiceCode, dto.PhaseId,
            dto.Comments ?? "", GetLoginId(), IpAddressHelper.GetIpAddressString(Request));
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    // P2-H-10/12: Letter data (reuses allotment status)
    [HttpGet("letter/{candidateId}")]
    public async Task<IActionResult> GetLetter(long candidateId, [FromQuery] short phaseId = 0)
    {
        if (phaseId == 0) phaseId = await _repo.GetCurrentPhaseIdAsync();
        var data = await _repo.GetAllotmentStatusAsync(phaseId, candidateId);
        return data == null ? NotFound() : Ok(data);
    }

    private long   GetUserId()  => long.TryParse(User.FindFirst(JwtHelper.ClaimUserId)?.Value, out var v) ? v : 0;
    private string GetLoginId() => User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? "";
    private static string S(IDictionary<string, object> d, string key) => d.ContainsKey(key) ? Convert.ToString(d[key] ?? "") ?? "" : "";
    private static bool   CB(IDictionary<string, object> d, string key) => d.ContainsKey(key) && Convert.ToBoolean(d[key]);
}

public record AllotmentResponseDto(short PhaseId, long ChoiceCode, bool IsAccepted, bool IsRefused, string? RefusalReason);
public record AdmissionActionDto(long CandidateId, long ChoiceCode, short PhaseId, string? Comments);
