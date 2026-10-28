using Asp.Versioning;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using AgriPhd.Api.DTOs.Responses;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Repositories.Implementations;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// Menu administration endpoints — ManageMenus.aspx + ManageLinks.aspx equivalents.
/// Role: SuperAdmin (11) + Admin (12).
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/menu-admin")]
public class MenuAdminController : ControllerBase
{
    private readonly IMenuAdminRepository _repo;
    private readonly IMemoryCache _cache;
    private readonly ILogger<MenuAdminController> _logger;

    public MenuAdminController(IMenuAdminRepository repo, IMemoryCache cache, ILogger<MenuAdminController> logger)
    {
        _repo   = repo;
        _cache  = cache;
        _logger = logger;
    }

    private string LoginId   => User.FindFirst(JwtHelper.ClaimUserLoginId)?.Value ?? "";
    private string UserTypeId => User.FindFirst(JwtHelper.ClaimUserTypeId)?.Value ?? "";
    private bool IsAdmin => UserTypeId is "11" or "12";
    private string GetIp() => Request.HttpContext.Connection.RemoteIpAddress?.ToString() ?? "";

    // ── ManageMenus endpoints ─────────────────────────────────────────────────

    [HttpGet("groups")]
    public async Task<IActionResult> GetGroups([FromQuery] int userTypeId = 11)
    {
        if (!IsAdmin) return Forbid();
        var rows = await _repo.GetGroupsListAsync(1, userTypeId);
        return Ok(rows);
    }

    [HttpGet("menus")]
    public async Task<IActionResult> GetMenus([FromQuery] int userTypeId = 11, [FromQuery] int parentMenuId = -1)
    {
        if (!IsAdmin) return Forbid();
        var rows = await _repo.GetMenusListAsync(1, userTypeId, parentMenuId);
        return Ok(rows);
    }

    [HttpPost("menus/save")]
    public async Task<IActionResult> SaveMenus([FromBody] SaveMenusRequest req)
    {
        if (!IsAdmin) return Forbid();
        var xml = MenuAdminRepository.BuildMenusXml(req.Items, LoginId, GetIp());
        var result = await _repo.SaveMenusActiveStatusAsync(xml);

        // Clear menu cache so nav rebuilds with new seq/active state
        _cache.Remove($"menu:role:{req.Items.FirstOrDefault()?.MenuId ?? 0}");
        if (_cache is MemoryCache mc) mc.Clear(); // simplest: clear all menu caches

        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "Menu settings saved." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }

    // ── ManageLinks endpoints ─────────────────────────────────────────────────

    [HttpGet("directories")]
    public IActionResult GetDirectories()
    {
        if (!IsAdmin) return Forbid();
        return Ok(_repo.GetAvailableDirectories());
    }

    [HttpGet("links")]
    public async Task<IActionResult> GetLinks([FromQuery] string directory = "Administration")
    {
        if (!IsAdmin) return Forbid();
        var rows = await _repo.GetLinksListAsync(directory);
        return Ok(rows);
    }

    [HttpPost("links/save")]
    public async Task<IActionResult> SaveLinks([FromBody] SaveLinksRequest req)
    {
        if (!IsAdmin) return Forbid();
        var xml = MenuAdminRepository.BuildLinksXml(req.Items, LoginId, GetIp());
        var result = await _repo.SaveLinksActiveStatusAsync(xml);

        if (_cache is MemoryCache mc) mc.Clear(); // clear menu cache

        return result == "Y"
            ? Ok(new MessageResponse { Success = true, Message = "Links saved." })
            : BadRequest(new MessageResponse { Success = false, Message = result });
    }
}
