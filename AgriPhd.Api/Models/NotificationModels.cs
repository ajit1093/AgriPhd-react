
namespace AgriPhd.Api.Models;

/// <summary>
/// Notification category IDs — from NotificationCategoryID column in DB.
/// Confirmed from Home.aspx.cs dispatch table.
/// </summary>
public static class NotificationCategory
{
    public const int Announcement = 1;   // marquee bar
    public const int News         = 2;   // brochure/news tab
    public const int Notification = 3;   // notifications tab
    public const int Download     = 4;   // downloads tab
    public const int Popup        = 11;  // modal popup (first one only)
    public const int Schedule     = 12;  // admission schedule tab
}

/// <summary>
/// Ported from legacy NotificationEntity.
/// Column names match exactly what Administration_GetNotificationListForDisplay returns.
/// </summary>
public class NotificationItem
{
    public long   NotificationID         { get; set; }
    public int    NotificationCategoryID { get; set; }
    public string NotificationCategory   { get; set; } = string.Empty;
    public string NotificationTitle      { get; set; } = string.Empty;
    public string ContentType            { get; set; } = string.Empty;  // "T" = text, else URL
    public string TextContent            { get; set; } = string.Empty;
    public string FileContentURL         { get; set; } = string.Empty;
    public int    DisplayNewImage        { get; set; }  // 1 = show NEW badge
    public int    OpenInNewPage          { get; set; }
    public DateTime? PublishDateTime     { get; set; }
    public string PublishDateTimeF       { get; set; } = string.Empty;
}

/// <summary>
/// Model for Important Dates / Admission Schedule items fetched from database
/// (Master_ActivityStatus and Master_Phase).
/// </summary>
public class ImportantDateItem
{
    public int Sequence { get; set; }
    public string ActivityCode { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Subtitle { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string StartDateFormatted { get; set; } = string.Empty;
    public string EndDateFormatted { get; set; } = string.Empty;
    public string Status { get; set; } = "Upcoming"; // "Active", "Upcoming", "Completed"
    public bool IsActive { get; set; } = true;
    public string Description { get; set; } = string.Empty;
}

/// <summary>
/// Grouped response returned to React — one object with all five sections.
/// </summary>
public class HomeNotificationsResponse
{
    public IEnumerable<NotificationItem> Announcements { get; set; } = Enumerable.Empty<NotificationItem>();
    public IEnumerable<NotificationItem> News          { get; set; } = Enumerable.Empty<NotificationItem>();
    public IEnumerable<NotificationItem> Notifications { get; set; } = Enumerable.Empty<NotificationItem>();
    public IEnumerable<NotificationItem> Schedule      { get; set; } = Enumerable.Empty<NotificationItem>();
    public IEnumerable<NotificationItem> Downloads     { get; set; } = Enumerable.Empty<NotificationItem>();
    public NotificationItem?             Popup         { get; set; }  // first category-11 row only
    public bool                          RegistrationOpen { get; set; }
    public IEnumerable<ImportantDateItem> ImportantDates { get; set; } = Enumerable.Empty<ImportantDateItem>();
}

