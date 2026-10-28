using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// Batch G — E-Verification endpoints.
/// P2-G-01  GET  /api/v1/everification/candidates?filter=
/// P2-G-02  GET  /api/v1/everification/documents/{candidateId}
///          POST /api/v1/everification/verify
/// P2-G-03  GET  /api/v1/candidates/lookup?applicationId=
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/everification")]
public class EVerificationController : ControllerBase
{
    private readonly IEVerificationRepository _repo;
    public EVerificationController(IEVerificationRepository repo) => _repo = repo;

    /// <summary>
    /// P2-G-01: Candidate list for EVC.
    /// filter values: -1=All, N=Not Verified, H=Hold, R=Partially Verified, P=Re-Uploaded, F=Fully Verified
    /// SP: EV_GetCandidateListForEVerification(@ApplicationStatus, @UserLoginID)
    /// </summary>
    [HttpGet("candidates")]
    public async Task<IActionResult> GetCandidates([FromQuery] string filter = "-1")
    {
        var loginId = User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? "";
        var rows    = await _repo.GetCandidateListAsync(filter, loginId);
        return Ok(rows.Select(r => new
        {
            candidateId     = Convert.ToInt64(((IDictionary<string, object>)r).ContainsKey("CandidateID") ? ((IDictionary<string, object>)r)["CandidateID"] : 0L),
            applicationId   = S(r.ApplicationID),
            applicationFormNo = S(r.ApplicationFormNo),
            candidateName   = S(r.CandidateName),
            category        = S(r.Category),
            assignedTo      = S(r.AssignedTo),
        }));
    }

    /// <summary>
    /// P2-G-02: Candidate details + document list for verification.
    /// SP: EV_GetCandidateDetailsForEVerification(@CandidateID)
    /// </summary>
    [HttpGet("documents/{candidateId}")]
    public async Task<IActionResult> GetDocuments(long candidateId)
    {
        var data = await _repo.GetCandidateDetailsAsync(candidateId);
        return data == null ? NotFound() : Ok(data);
    }

    /// <summary>
    /// P2-G-02: Save verification status for all documents.
    /// SP: EV_SaveDocumentsEVerificationStatus(@CandidateID, @DocumentsVerifiedXML, @UserLoginID, @IPAddress)
    /// XML format: <Documents><Document DocumentID="1" IsVerified="Y" Comments="OK" /></Documents>
    /// </summary>
    [HttpPost("verify")]
    public async Task<IActionResult> SaveVerification([FromBody] VerifyRequest req)
    {
        var loginId = User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? "";
        var ip      = IpAddressHelper.GetIpAddressString(Request);

        // Build XML from document list
        var xml = "<Documents>" +
            string.Join("", req.Documents.Select(d =>
                $"<Document DocumentID=\"{d.DocumentId}\" IsVerified=\"{d.Status}\" Comments=\"{System.Security.SecurityElement.Escape(d.Comments)}\" />")) +
            "</Documents>";

        var ok = await _repo.SaveVerificationStatusAsync(req.CandidateId, xml, loginId, ip);
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    /// <summary>P2-G-03: EVC can look up any candidate by Application ID.</summary>
    [HttpGet("~/api/v{version:apiVersion}/candidates/lookup")]
    public async Task<IActionResult> LookupCandidate([FromQuery] string applicationId)
    {
        if (string.IsNullOrWhiteSpace(applicationId))
            return BadRequest(new { message = "applicationId is required." });

        var loginId = User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? "";
        var rows = await _repo.GetCandidateListAsync("-1", loginId);

        dynamic? match = null;
        foreach (var r in rows)
        {
            var dict2 = (IDictionary<string, object>)r;
            var formNo = dict2.ContainsKey("ApplicationFormNo") ? Convert.ToString(dict2["ApplicationFormNo"] ?? "") : "";
            var appId2 = dict2.ContainsKey("ApplicationID")     ? Convert.ToString(dict2["ApplicationID"]     ?? "") : "";
            if (string.Equals(formNo, applicationId, StringComparison.OrdinalIgnoreCase) ||
                string.Equals(appId2, applicationId, StringComparison.OrdinalIgnoreCase))
            {
                match = r; break;
            }
        }

        if (match == null) return NotFound(new { message = "Candidate not found." });

        var dict = (IDictionary<string, object>)match;
        return Ok(new { candidateId = Convert.ToInt64(dict.ContainsKey("CandidateID") ? dict["CandidateID"] : 0L) });
    }

    private static string S(object? v) => Convert.ToString(v ?? "") ?? "";

public record VerifyRequest(long CandidateId, IEnumerable<DocumentVerifyItem> Documents);
public record DocumentVerifyItem(int DocumentId, string Status, string Comments);
}
