using Asp.Versioning;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Controllers;

/// <summary>
/// P2-A-01: GET /api/v1/notifications/home
/// Returns all homepage notification data grouped by category in one call.
/// Cached in IMemoryCache with a short TTL (5s) so admin updates are immediately live.
/// </summary>
[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/notifications")]
[AllowAnonymous]
public class NotificationController : ControllerBase
{
    private readonly INotificationRepository _repo;
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan CACHE_TTL = TimeSpan.FromSeconds(5);
    private const short DEFAULT_REGION_ID = 1;

    public NotificationController(INotificationRepository repo, IMemoryCache cache)
    {
        _repo  = repo;
        _cache = cache;
    }

    /// <summary>
    /// Returns all homepage sections in one response:
    /// announcements (marquee), news, notifications, schedule, downloads, popup, registrationOpen.
    /// regionId defaults to 1 (matches legacy AppSettings["RegionID"]).
    /// </summary>
    [HttpGet("home")]
    [ProducesResponseType(typeof(HomeNotificationsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetHome([FromQuery] short regionId = DEFAULT_REGION_ID, [FromQuery] bool refresh = false)
    {
        var key = $"notifications:home:{regionId}";

        if (!refresh && _cache.TryGetValue(key, out HomeNotificationsResponse? cached) && cached != null)
            return Ok(cached);

        var allItems = (await _repo.GetNotificationListForDisplayAsync(regionId)).ToList();
        var regOpen  = await _repo.IsNewCandidateRegistrationStartedAsync();
        var dates    = (await _repo.GetImportantDatesAsync(regionId)).ToList();

        // Replicate exact dispatch from Home.aspx.cs GetNotificationList()
        var response = new HomeNotificationsResponse
        {
            Announcements    = allItems.Where(n => n.NotificationCategoryID == NotificationCategory.Announcement),
            News             = allItems.Where(n => n.NotificationCategoryID == NotificationCategory.News),
            Notifications    = allItems.Where(n => n.NotificationCategoryID == NotificationCategory.Notification),
            Schedule         = allItems.Where(n => n.NotificationCategoryID == NotificationCategory.Schedule),
            Downloads        = allItems.Where(n => n.NotificationCategoryID == NotificationCategory.Download),
            // Only the FIRST popup row shown — matches legacy guard: if (lblPopupHeader.Text.Length == 0)
            Popup            = allItems.FirstOrDefault(n => n.NotificationCategoryID == NotificationCategory.Popup),
            RegistrationOpen = regOpen,
            ImportantDates   = dates,
        };

        _cache.Set(key, response, CACHE_TTL);
        return Ok(response);
    }

    /// <summary>
    /// Returns the live Centralized Admission Schedule / Important Dates from database.
    /// Fetches from Master_ActivityStatus & Master_Phase.
    /// </summary>
    [HttpGet("important-dates")]
    [ProducesResponseType(typeof(IEnumerable<ImportantDateItem>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetImportantDates([FromQuery] short regionId = DEFAULT_REGION_ID, [FromQuery] bool refresh = false)
    {
        var key = $"notifications:dates:{regionId}";
        if (!refresh && _cache.TryGetValue(key, out IEnumerable<ImportantDateItem>? cached) && cached != null)
            return Ok(cached);

        var dates = await _repo.GetImportantDatesAsync(regionId);
        _cache.Set(key, dates, CACHE_TTL);
        return Ok(dates);
    }

    /// <summary>
    /// Registration open check — also used by Login page and Registration page guard.
    /// SP: Base_IsNewCandidateRegistrationStarted (no parameters).
    /// </summary>
    [HttpGet("registration-open")]
    [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
    public async Task<IActionResult> IsRegistrationOpen([FromQuery] bool refresh = false)
    {
        const string key = "registration:is-open";
        if (!refresh && _cache.TryGetValue(key, out bool cached))
            return Ok(new { isOpen = cached });

        var isOpen = await _repo.IsNewCandidateRegistrationStartedAsync();
        _cache.Set(key, isOpen, CACHE_TTL);
        return Ok(new { isOpen });
    }
}

