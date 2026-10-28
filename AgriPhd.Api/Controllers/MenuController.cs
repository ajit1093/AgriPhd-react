using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// P1-LAYOUT-04: GET /api/v1/menu
/// Returns the nav tree for the authenticated user's role.
/// Cached per UserTypeID (nav is identical for all users of the same role).
/// Maps to legacy Menu_GetMenu SP called in AuthLayout.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/menu")]
[Authorize]
public class MenuController : ControllerBase
{
    private readonly IMasterRepository _repo;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CACHE_TTL = TimeSpan.FromHours(1);
    private const short REGION_ID = 1; // Default region — matches legacy AppSettings["RegionID"]

    public MenuController(IMasterRepository repo, IMemoryCache cache)
    {
        _repo  = repo;
        _cache = cache;
    }

    /// <summary>
    /// Returns the hierarchical menu for the calling user's role.
    /// Returns empty array for unauthenticated callers (public menu handled separately).
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<MenuItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMenu()
    {
        var userTypeId  = (int)GetClaimLong(JwtHelper.ClaimUserTypeId);
        var userLoginId = GetClaim(JwtHelper.ClaimUserLoginId);

        // Cache key per role (login ID excluded — menu is role-level, not user-level)
        var key = $"menu:role:{userTypeId}";
        if (_cache.TryGetValue(key, out IEnumerable<MenuItem>? cached) && cached != null)
            return Ok(cached);

        var flat = await _repo.GetMenuAsync(REGION_ID, userTypeId, userLoginId);
        var tree = BuildTree(flat);

        _cache.Set(key, tree, CACHE_TTL);
        return Ok(tree);
    }

    /// <summary>Public menu (UserTypeID = 0, no auth required).</summary>
    [HttpGet("public")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(IEnumerable<MenuItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPublicMenu()
    {
        const string key = "menu:public";
        if (_cache.TryGetValue(key, out IEnumerable<MenuItem>? cached) && cached != null)
            return Ok(cached);

        var flat = await _repo.GetMenuAsync(REGION_ID, 0, "");
        var tree = BuildTree(flat);
        _cache.Set(key, tree, CACHE_TTL);
        return Ok(tree);
    }

    // ── Build nested tree from flat SP result ─────────────────────────────────

    private static IEnumerable<MenuItem> BuildTree(IEnumerable<MenuItem> flat)
    {
        var list = flat.ToList();;
        var lookup = list.ToLookup(m => m.ParentMenuId ?? 0);

        foreach (var item in list)
            item.Children = lookup[item.MenuId].OrderBy(c => c.SeqNo).ToList();

        // Top-level items have ParentMenuId = null or 0
        return lookup[0].OrderBy(m => m.SeqNo);
    }

    private long GetClaimLong(string claimType)
    {
        var val = User.FindFirst(claimType)?.Value;
        return long.TryParse(val, out var r) ? r : 0;
    }

    private string GetClaim(string claimType) =>
        User.FindFirst(claimType)?.Value ?? string.Empty;
}
