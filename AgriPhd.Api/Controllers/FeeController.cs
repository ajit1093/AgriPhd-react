using Asp.Versioning;
using System.Data;
using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// Batch F — Fee Administration endpoints.
/// P2-F-01  GET  /api/v1/fee/history
/// P2-F-06  POST /api/v1/fee/razorpay-response   (HMAC verify)
/// P2-F-07  GET  /api/v1/fee/failed-transactions
/// P2-F-09  GET  /api/v1/fee/refundable
/// P2-F-11  POST /api/v1/fee/nsdl-*              (501 stubs)
/// P2-F-12  POST /api/v1/fee/billdesk-*          (501 stubs)
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/fee")]
public class FeeController : ControllerBase
{
    private readonly IFeeRepository _repo;
    private readonly System.Data.IDbConnection _db;

    public FeeController(IFeeRepository repo, System.Data.IDbConnection db)
    {
        _repo = repo;
        _db   = db;
    }

    // ── P2-F-01: Payment History ──────────────────────────────────────────────
    // Admin can pass ?candidateId= to view another candidate's history
    [HttpGet("history")]
    public async Task<IActionResult> GetHistory([FromQuery] long candidateId = 0)
    {
        // Use provided candidateId (admin viewing candidate) or logged-in user's own ID
        var payeeId = candidateId > 0 ? candidateId : GetUserId();
        var rows    = await _repo.GetTransactionHistoryAsync(payeeId);
        return Ok(rows.Select(r => new
        {
            transactionId  = S(r.TransactionID),
            feeAmount      = S(r.FeeAmount),
            transactionDate= S(r.TransactionDate),
            paymentDate    = S(r.PaymentDate),
            bankReferenceNo= S(r.BankReferenceNo),
            purpose        = S(r.Purpose),
            isPaid         = Convert.ToBoolean(r.IsPaid ?? false),
            paidStatus     = S(r.PaidStatus),
        }));
    }

    // ── P2-F-02: Receipt (placeholder — QuestPDF in Phase 3) ─────────────────
    [HttpGet("receipt/{transactionId}")]
    public async Task<IActionResult> GetReceipt(long transactionId)
    {
        var tx = await _repo.GetTransactionDetailsAsync(transactionId);
        if (tx == null) return NotFound();
        // Full QuestPDF receipt in Phase 3 — return JSON for now
        return Ok(tx);
    }

    // ── P2-F-06: Razorpay response handler (HMAC verify) ─────────────────────
    [HttpPost("razorpay-response")]
    [AllowAnonymous] // Called from Razorpay callback
    public async Task<IActionResult> RazorpayResponse([FromBody] RazorpayResponseDto dto)
    {
        // HMAC-SHA256 verification (FR-FEE-06)
        var razorpaySecret = HttpContext.RequestServices
            .GetRequiredService<IConfiguration>()["Razorpay:SecretKey"] ?? "";

        var expectedSignature = ComputeHmacSha256(
            $"{dto.RazorpayOrderId}|{dto.RazorpayPaymentId}", razorpaySecret);

        if (!string.Equals(expectedSignature, dto.RazorpaySignature, StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { success = false, message = "Payment signature verification failed." });
        }

        var loginId = GetLoginId();
        var ip      = IpAddressHelper.GetIpAddressString(Request);

        var ok = await _repo.SetFeeTransactionResponseAsync(
            dto.TransactionId, dto.RazorpayPaymentId, dto.RazorpayOrderId,
            dto.RazorpaySignature, dto.RazorpayPaymentId, "Success", loginId, ip);

        return ok
            ? Ok(new { success = true })
            : BadRequest(new { success = false, message = "Failed to record payment." });
    }

    // ── P2-F-07: Failed transactions (Admin) ─────────────────────────────────
    [HttpGet("failed-transactions")]
    public async Task<IActionResult> GetFailedTransactions()
    {
        var payeeId = GetUserId();
        var rows    = await _repo.GetFailedTransactionsForApiCheckAsync(payeeId);
        return Ok(rows);
    }

    // ── P2-F-09: Refundable transactions (Admin) ─────────────────────────────
    [HttpGet("refundable")]
    public async Task<IActionResult> GetRefundable([FromQuery] string input = "")
    {
        var rows = await _repo.GetTransactionsForRefundAsync(input);
        return Ok(rows);
    }

    // ── Duplicate Transactions List ────────────────────────────────────────────
    [HttpGet("duplicate-transactions")]
    public async Task<IActionResult> GetDuplicateTransactions()
    {
        var rows = await _db.QueryAsync<dynamic>(
            "Fee_GetDuplicateTransactionsList", commandType: CommandType.StoredProcedure);
        return Ok(rows);
    }

    // ── Initiate Refund (from duplicate list) ─────────────────────────────────
    [HttpPost("initiate-refund/{transactionId:long}")]
    public async Task<IActionResult> InitiateRefund(long transactionId)
    {
        var loginId = GetLoginId();
        var ip      = IpAddressHelper.GetIpAddressString(Request);
        var p       = new Dapper.DynamicParameters();
        p.Add("@TransactionID",          transactionId);
        p.Add("@RefundRequestID",        "");
        p.Add("@RefundPayGateID",        "");
        p.Add("@RefundBankRRN",          "");
        p.Add("@RefundInitiatedDateTime", 0L);
        p.Add("@CommandName",            "InitiateRefund");
        p.Add("@UserLoginID",            loginId);
        p.Add("@IPAddress",              ip);
        await _db.ExecuteAsync("Fee_UpdateRefundStatus", p, commandType: CommandType.StoredProcedure);
        return Ok(new { success = true, message = "Refund initiated." });
    }

    [HttpPost("refund/{transactionId}")]
    public async Task<IActionResult> Refund(long transactionId, [FromBody] RefundDto dto)
    {
        var ok = await _repo.UpdateRefundStatusAsync(
            transactionId, dto.RefundId, dto.Status, GetLoginId(), IpAddressHelper.GetIpAddressString(Request));
        return ok ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    // ── P2-F-11: NSDL stubs (501 Not Implemented) ────────────────────────────
    [HttpPost("nsdl-request")]
    [HttpPost("nsdl-response")]
    [HttpPost("nsdl-push")]
    [AllowAnonymous]
    public IActionResult NsdlStub() =>
        StatusCode(501, new { message = "NSDL gateway not active." });

    // ── P2-F-12: BillDesk stubs (501) ────────────────────────────────────────
    [HttpPost("billdesk-request")]
    [HttpPost("billdesk-response")]
    [AllowAnonymous]
    public IActionResult BillDeskStub() =>
        StatusCode(501, new { message = "BillDesk gateway not active." });

    // ── Helpers ───────────────────────────────────────────────────────────────
    private long   GetUserId()  => long.TryParse(User.FindFirst(JwtHelper.ClaimUserId)?.Value, out var v) ? v : 0;
    private string GetLoginId() => User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? "";
    private static string S(object? v) => Convert.ToString(v ?? "") ?? "";

    private static string ComputeHmacSha256(string data, string key)
    {
        using var hmac = new System.Security.Cryptography.HMACSHA256(
            System.Text.Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}

public record RazorpayResponseDto(long TransactionId, string RazorpayPaymentId, string RazorpayOrderId, string RazorpaySignature);
public record RefundDto(string RefundId, string Status);
