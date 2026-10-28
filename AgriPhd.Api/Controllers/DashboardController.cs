using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// Dashboard endpoints for all 7 roles.
/// All return UserDetails + role-specific stat data in one response.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/dashboard")]
public class DashboardController : ControllerBase
{
    private readonly IDashboardRepository _repo;
    public DashboardController(IDashboardRepository repo) => _repo = repo;

    // P2-C-01 — Candidate
    [HttpGet("candidate")]
    [ProducesResponseType(typeof(CandidateDashboardData), 200)]
    public async Task<IActionResult> Candidate()
    {
        var userId    = GetLong(JwtHelper.ClaimUserId);
        var userTypeId= (int)GetLong(JwtHelper.ClaimUserTypeId);
        var loginId   = GetStr(JwtHelper.ClaimUserLoginId);
        var ip        = IpAddressHelper.GetIpAddressString(Request);
        var data      = await _repo.GetCandidateDashboardAsync(userId, userTypeId, loginId, ip);
        return Ok(data);
    }

    // P2-C-02 — Admin
    [HttpGet("admin")]
    [ProducesResponseType(typeof(AdminDashboardData), 200)]
    public async Task<IActionResult> Admin()
    {
        var data = await _repo.GetAdminDashboardAsync(
            (int)GetLong(JwtHelper.ClaimUserTypeId), GetStr(JwtHelper.ClaimUserLoginId));
        return Ok(data);
    }

    // P2-C-03 — SuperAdmin (same SP, different UserTypeID)
    [HttpGet("super-admin")]
    [ProducesResponseType(typeof(AdminDashboardData), 200)]
    public async Task<IActionResult> SuperAdmin()
    {
        var data = await _repo.GetAdminDashboardAsync(
            (int)GetLong(JwtHelper.ClaimUserTypeId), GetStr(JwtHelper.ClaimUserLoginId));
        return Ok(data);
    }

    // P2-C-04 — College
    [HttpGet("college")]
    [ProducesResponseType(typeof(CollegeDashboardData), 200)]
    public async Task<IActionResult> College()
    {
        var data = await _repo.GetCollegeDashboardAsync(
            GetLong(JwtHelper.ClaimUserId),
            (int)GetLong(JwtHelper.ClaimUserTypeId),
            GetStr(JwtHelper.ClaimUserLoginId));
        return Ok(data);
    }

    // P2-C-05 — EVerification
    [HttpGet("everification")]
    [ProducesResponseType(typeof(EVerificationDashboardData), 200)]
    public async Task<IActionResult> EVerification()
    {
        var data = await _repo.GetEVerificationDashboardAsync(
            GetLong(JwtHelper.ClaimUserId),
            (int)GetLong(JwtHelper.ClaimUserTypeId),
            GetStr(JwtHelper.ClaimUserLoginId));
        return Ok(data);
    }

    // P2-C-06 — University (same SP as College; stat bindings commented out in legacy)
    [HttpGet("university")]
    [ProducesResponseType(typeof(CollegeDashboardData), 200)]
    public async Task<IActionResult> University()
    {
        var data = await _repo.GetCollegeDashboardAsync(
            GetLong(JwtHelper.ClaimUserId),
            (int)GetLong(JwtHelper.ClaimUserTypeId),
            GetStr(JwtHelper.ClaimUserLoginId));
        return Ok(data);
    }

    // P2-C-07 — CallCenter (user details only — no dashboard SP)
    [HttpGet("call-center")]
    [ProducesResponseType(typeof(LoggedInUserDetails), 200)]
    public async Task<IActionResult> CallCenter()
    {
        var data = await _repo.GetLoggedInUserDetailsAsync(
            (int)GetLong(JwtHelper.ClaimUserTypeId),
            GetStr(JwtHelper.ClaimUserLoginId));
        data.IPAddress = IpAddressHelper.GetIpAddressString(Request);
        return Ok(data);
    }

    private long GetLong(string claim) =>
        long.TryParse(User.FindFirst(claim)?.Value, out var v) ? v : 0;
    private string GetStr(string claim) =>
        User.FindFirst(claim)?.Value ?? string.Empty;
}
