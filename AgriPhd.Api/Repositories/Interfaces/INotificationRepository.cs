using AgriPhd.Api.Models;

namespace AgriPhd.Api.Repositories.Interfaces;

public interface INotificationRepository
{
    /// <summary>
    /// SP: Administration_GetNotificationListForDisplay(@RegionID, @Language)
    /// Returns all active notification rows for the homepage — all categories in one call.
    /// </summary>
    Task<IEnumerable<NotificationItem>> GetNotificationListForDisplayAsync(short regionId, string language = "");

    /// <summary>
    /// SP: Base_IsNewCandidateRegistrationStarted — no parameters, returns bool.
    /// Controls whether the "Register" button is shown on homepage/login.
    /// </summary>
    Task<bool> IsNewCandidateRegistrationStartedAsync();

    /// <summary>
    /// Fetches all key admission dates from database (Master_ActivityStatus and Master_Phase)
    /// to display in the homepage Centralized Admission Schedule / Important Dates card.
    /// </summary>
    Task<IEnumerable<ImportantDateItem>> GetImportantDatesAsync(short regionId = 1);
}

