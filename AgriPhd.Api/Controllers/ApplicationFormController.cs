using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// Application Form Wizard endpoints (Batch D).
/// All routes require authentication (JWT cookie).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/application-form")]
public class ApplicationFormController : ControllerBase
{
    private readonly IApplicationFormRepository _repo;
    public ApplicationFormController(IApplicationFormRepository repo) => _repo = repo;

    // ── P2-D-00: Wizard navigation ────────────────────────────────────────────

    [HttpGet("check-url")]
    public async Task<IActionResult> CheckUrl([FromQuery] string pageCode)
    {
        var (cid, lid) = GetCandidateContext();
        var result = await _repo.CheckUrlAsync(cid, lid, pageCode);
        return Ok(result);
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary([FromQuery] long? candidateId = null)
    {
        var (cid, lid) = GetCandidateContext();
        if (candidateId.HasValue && candidateId.Value > 0)
        {
            cid = candidateId.Value;
            lid = candidateId.Value.ToString();
        }
        // NOTE: Legacy ApplicationFormSummary.aspx.cs has SaveWeightageDetails commented out —
        // do NOT call it here. Only call after NAAS paper save/delete (research paper step).
        try
        {
            var data = await _repo.GetFormSummaryAsync(cid, lid);
            return Ok(data);
        }
        catch (Microsoft.Data.SqlClient.SqlException ex) when (ex.Message.Contains("FeeToBePaid") || ex.Message.Contains("@Temp"))
        {
            // SP fnCalculateFee fails when category step not filled yet (brand new candidate).
            // Return a safe default so the summary page loads with all steps unchecked.
            return Ok(new
            {
                status = new {
                    isPersonalDetailsFilled = false,
                    isAddressDetailsFilled = false,
                    isCategoryAndOtherReservationDetailsFilled = false,
                    isQualificationDetailsFilled = false,
                    isSportsDetailsFilled = false,
                    isAppliedForColleges = false,
                    isPhotoAndSignUploaded = false,
                    isAllCompulsoryDocumentsUploaded = false,
                    isApplicationFeePaid = false,
                    isEligible = false,
                    isConfirmed = false,
                    isFeePaid = false,
                    formStatus = "NotStarted",
                    errorMsg = ""
                },
                personal = new { candidateName = "", applicationFormNo = "", mobileNo = "", dob = "" },
                category = new { },
                qualification = new { },
                appliedColleges = new object[0],
                documents = new object[0],
                feeDetails = new object[0],
                researchPapers = new object[0]
            });
        }
    }

    [HttpPost("lock")]
    public async Task<IActionResult> Lock()
    {
        var (cid, lid) = GetCandidateContext();
        var ok = await _repo.LockFormAsync(cid, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false, message = "Data has not been saved. Please try again." });
    }

    [HttpPost("unlock")]
    public async Task<IActionResult> Unlock()
    {
        var (cid, lid) = GetCandidateContext();
        var ok = await _repo.UnlockFormAsync(cid, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false, message = "Unlock failed. Please try again." });
    }

    // ── P2-D-02: Personal ─────────────────────────────────────────────────────

    [HttpGet("personal")]
    public async Task<IActionResult> GetPersonal()
    {
        var (cid, lid) = GetCandidateContext();
        var data = await _repo.GetPersonalDetailsAsync(cid, lid);
        return Ok(data ?? new PersonalDetailsData { CandidateID = cid });
    }

    [HttpPost("personal")]
    public async Task<IActionResult> SavePersonal([FromBody] PersonalDetailsData request)
    {
        var (cid, lid) = GetCandidateContext();
        request.CandidateID = cid;
        var ok = await _repo.SavePersonalDetailsAsync(request, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false, message = "Save failed. Please try again." });
    }

    // ── P2-D-03: Address ──────────────────────────────────────────────────────

    [HttpGet("address")]
    public async Task<IActionResult> GetAddress()
    {
        var (cid, lid) = GetCandidateContext();
        var data = await _repo.GetAddressDetailsAsync(cid, lid);
        return Ok(data ?? new AddressDetailsData { CandidateID = cid });
    }

    [HttpPost("address")]
    public async Task<IActionResult> SaveAddress([FromBody] AddressDetailsData request)
    {
        var (cid, lid) = GetCandidateContext();
        request.CandidateID = cid;
        var ok = await _repo.SaveAddressDetailsAsync(request, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false, message = "Save failed. Please try again." });
    }

    // ── P2-D-04: Category ─────────────────────────────────────────────────────

    [HttpGet("category")]
    public async Task<IActionResult> GetCategory()
    {
        var (cid, lid) = GetCandidateContext();
        var data = await _repo.GetCategoryDetailsAsync(cid, lid);
        return Ok(data ?? new CategoryDetailsData { CandidateID = cid });
    }

    [HttpPost("category")]
    public async Task<IActionResult> SaveCategory([FromBody] CategoryDetailsData request)
    {
        var (cid, lid) = GetCandidateContext();
        request.CandidateID = cid;
        var ok = await _repo.SaveCategoryDetailsAsync(request, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false, message = "Save failed. Please try again." });
    }

    // ── P2-D-05: Qualification ────────────────────────────────────────────────

    [HttpGet("qualification")]
    public async Task<IActionResult> GetQualification()
    {
        var (cid, lid) = GetCandidateContext();
        var data = await _repo.GetQualificationDetailsAsync(cid, lid);
        return Ok(data ?? new QualificationDetailsData { CandidateID = cid });
    }

    [HttpPost("qualification")]
    public async Task<IActionResult> SaveQualification([FromBody] QualificationDetailsData request)
    {
        var (cid, lid) = GetCandidateContext();
        request.CandidateID = cid;
        var ok = await _repo.SaveQualificationDetailsAsync(request, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false, message = "Save failed. Please try again." });
    }

    // ── Eligible faculties + subjects (for Qualification step) ───────────────

    [HttpGet("eligible-faculties")]
    public async Task<IActionResult> GetEligibleFaculties()
    {
        var (cid, lid) = GetCandidateContext();
        // Use available options to get candidate-specific faculties
        var faculties = await _repo.GetAvailableOptionsAsync(cid);
        return Ok(faculties);
    }

    // ── Step 5: Research Papers ───────────────────────────────────────────────

    [HttpGet("research-paper")]
    public async Task<IActionResult> GetResearchPapers()
    {
        var (cid, lid) = GetCandidateContext();
        var data = await _repo.GetResearchPapersAsync(cid, lid);
        return Ok(data);
    }

    [HttpPost("research-paper")]
    public async Task<IActionResult> SaveResearchPaper([FromBody] ResearchPaperSaveRequest req)
    {
        var (cid, lid) = GetCandidateContext();
        var ok = await _repo.SaveResearchPaperAsync(cid, req.NaasDetailId, req.PaperTitle,
            req.NameOfPaper, req.YearOfPublication, req.NaasScore, lid, GetIp());
        // Trigger weightage recalculation
        if (ok) await _repo.SaveWeightageAsync(cid, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    [HttpDelete("research-paper/{naasDetailId}")]
    public async Task<IActionResult> DeleteResearchPaper(long naasDetailId)
    {
        var (cid, lid) = GetCandidateContext();
        await _repo.DeleteResearchPaperAsync(cid, naasDetailId, lid);
        return Ok(new { success = true });
    }

    // ── Step 6: College Preferences ──────────────────────────────────────────

    [HttpGet("available-colleges")]
    public async Task<IActionResult> GetAvailableColleges()
    {
        var (cid, _) = GetCandidateContext();
        var data = await _repo.GetAvailableOptionsAsync(cid);
        return Ok(data);
    }

    [HttpGet("preferences")]
    public async Task<IActionResult> GetPreferences()
    {
        var (cid, _) = GetCandidateContext();
        var data = await _repo.GetPreferencedOptionsAsync(cid);
        return Ok(data);
    }

    [HttpPost("preferences")]
    public async Task<IActionResult> SavePreferences([FromBody] SavePreferencesRequest req)
    {
        var (cid, lid) = GetCandidateContext();
        var ok = await _repo.SavePreferenceDetailsAsync(cid, req.OptionsXml, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    // ── Step 7: Photo & Sign ──────────────────────────────────────────────────

    [HttpGet("photo-sign")]
    public async Task<IActionResult> GetPhotoSign()
    {
        var (cid, lid) = GetCandidateContext();
        var (photoUrl, signUrl) = await _repo.GetPhotoAndSignAsync(cid, lid);
        return Ok(new { photoUrl, signUrl });
    }

    [HttpPost("save-photo-sign")]
    public async Task<IActionResult> SavePhotoSign([FromBody] SavePhotoSignRequest req)
    {
        var (cid, lid) = GetCandidateContext();
        var ok = await _repo.SavePhotoAndSignUrlsAsync(cid, req.PhotoUrl, req.SignUrl, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    // ── Step 8: Required Documents ────────────────────────────────────────────

    [HttpGet("required-documents")]
    public async Task<IActionResult> GetRequiredDocuments()
    {
        var (cid, lid) = GetCandidateContext();
        var data = await _repo.GetRequiredDocumentsAsync(cid, lid);
        return Ok(data);
    }

    [HttpPost("documents/{documentId}")]
    public async Task<IActionResult> SaveDocument(int documentId, [FromBody] SaveDocumentRequest req)
    {
        var (cid, lid) = GetCandidateContext();
        var ok = await _repo.SaveDocumentUploadAsync(cid, documentId, req.UploadedUrl,
            req.DocumentNo, req.IssueDate, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    // ── Step 9: Application Fee ───────────────────────────────────────────────

    [HttpGet("print-data")]
    public async Task<IActionResult> GetPrintData([FromQuery] long? candidateId = null)
    {
        var (cid, lid) = GetCandidateContext();
        if (candidateId.HasValue && candidateId.Value > 0)
        {
            cid = candidateId.Value;
            lid = candidateId.Value.ToString();
        }
        var data = await _repo.GetFormSummaryAsync(cid, lid);
        return Ok(data);
    }
    public async Task<IActionResult> GetApplicationFeeDetails()
    {
        var (cid, lid) = GetCandidateContext();
        var data = await _repo.GetApplicationFeeDetailsAsync(cid, lid);
        return Ok(data);
    }

    [HttpPost("mark-fee-done")]
    public async Task<IActionResult> MarkFeeDone()
    {
        var (cid, lid) = GetCandidateContext();
        var ok = await _repo.MarkFeeAsDoneAsync(cid, lid, GetIp());
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private (long candidateId, string loginId) GetCandidateContext()
    {
        var cid = long.TryParse(User.FindFirst(JwtHelper.ClaimUserId)?.Value, out var v) ? v : 0;
        var lid = User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? string.Empty;
        return (cid, lid);
    }
    private string GetIp() => IpAddressHelper.GetIpAddressString(Request);
}

// ── Request DTOs ─────────────────────────────────────────────────────────────
public record ResearchPaperSaveRequest(long NaasDetailId, string PaperTitle, string NameOfPaper, int YearOfPublication, decimal NaasScore);
public record SavePreferencesRequest(string OptionsXml);
public record SavePhotoSignRequest(string PhotoUrl, string SignUrl);
public record SaveDocumentRequest(string UploadedUrl, string DocumentNo, string IssueDate);
