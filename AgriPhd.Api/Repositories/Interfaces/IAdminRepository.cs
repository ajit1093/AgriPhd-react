using AgriPhd.Api.Models;

namespace AgriPhd.Api.Repositories.Interfaces;

public interface IAdminRepository
{
    // ── Notifications ─────────────────────────────────────────────────────────
    Task<IEnumerable<dynamic>> GetNotificationListAsync(short regionId);
    Task<dynamic?> GetNotificationDetailsAsync(long notificationId);
    Task<string> SaveNotificationAsync(SaveNotificationRequest req, string userLoginId, string ipAddress);
    Task<string> DeleteNotificationAsync(long notificationId, string userLoginId, string ipAddress);

    // ── Users ─────────────────────────────────────────────────────────────────
    Task<IEnumerable<dynamic>> GetUsersListAsync(int userTypeId);
    Task<dynamic?> GetUserDetailsAsync(long userId);
    Task<string> SaveUserAsync(SaveUserRequest req, string userLoginId, string ipAddress);
    Task<string> ActivateOrDeactivateUserAsync(long userId, string modifiedBy, string ipAddress);

    // ── Phases ────────────────────────────────────────────────────────────────
    Task<IEnumerable<dynamic>> GetPhaseListAsync();
    Task<dynamic?> GetPhaseDetailsAsync(int phaseId);
    Task<string> SavePhaseAsync(SavePhaseRequest req, string userLoginId, string ipAddress);
    Task<string> DeletePhaseAsync(int phaseId, string userLoginId, string ipAddress);

    // ── EVC ───────────────────────────────────────────────────────────────────
    Task<IEnumerable<dynamic>> GetEvcListAsync(string flag);
    Task<dynamic?> GetEvcDetailsAsync(int evcId);
    Task<string> SaveEvcDetailsAsync(SaveEvcRequest req, string userLoginId, string ipAddress);
    Task<string> ActivateDeactivateEvcAsync(int evcId, bool activate, string userLoginId, string ipAddress);

    // ── Activity Status ────────────────────────────────────────────────────────
    Task<IEnumerable<dynamic>> GetActivityStatusListAsync(short regionId);
    Task<string> SaveActivityStatusAsync(SaveActivityRequest req, string userLoginId, string ipAddress);
    Task<IEnumerable<dynamic>> GetAdmissionActivityStatusListAsync();
    Task<string> SaveAdmissionActivityStatusAsync(SaveAdmissionActivityRequest req, string userLoginId, string ipAddress);

    // ── Generate Passwords ────────────────────────────────────────────────────
    Task<IEnumerable<dynamic>> GetUserListForPasswordGenerationAsync(int userTypeId);
    Task<string> UpdateUserPasswordAsync(long userId, string newPassword, string userLoginId, string ipAddress);

    // ── Search / Lookup ───────────────────────────────────────────────────────
    Task<IEnumerable<dynamic>> SearchCandidateAsync(string searchBy, string query);
    Task<string> ResetCandidatePasswordAsync(long candidateId, string newPassword, string userLoginId, string ipAddress);
    Task<long> GetCandidateIdByLoginAsync(string loginId);
    Task<long> GetCandidateIdByAppFormNoAsync(string appFormNo);

    // ── App Settings ──────────────────────────────────────────────────────────
    Task<IEnumerable<dynamic>> GetAppSettingsAsync();
}

// ── Request models ────────────────────────────────────────────────────────────
public class SavePhaseRequest
{
    public int PhaseId { get; set; }
    public string Phase { get; set; } = "";
    public string AllotmentDisplayStartDate { get; set; } = "";
    public string AdmissionStartDate { get; set; } = "";
    public string CandidateAdmissionLastDate { get; set; } = "";
    public string CollegeAdmissionLastDate { get; set; } = "";
    public string SystemAdmissionLastDate { get; set; } = "";
    public short IsCurrentPhase { get; set; }
    public short IsActive { get; set; } = 1;
}

public class SaveEvcRequest
{
    public int EvcId { get; set; }
    public string EvcCode { get; set; } = "";
    public string CoordinatorName { get; set; } = "";
    public string CoordinatorMobileNo { get; set; } = "";
    public string CoordinatorEMailId { get; set; } = "";
}

public class SaveNotificationRequest
{
    public long NotificationId { get; set; }
    public int NotificationCategoryId { get; set; }
    public string NotificationTitle { get; set; } = "";
    public string NotificationTitleMarathi { get; set; } = "";
    public string DisplayStartDateTime { get; set; } = "";
    public string DisplayEndDateTime { get; set; } = "";
    public string PublishDateTime { get; set; } = "";
    public string ContentType { get; set; } = "F";
    public string TextContent { get; set; } = "";
    public string TextContentMarathi { get; set; } = "";
    public string FileContentName { get; set; } = "";
    public string FileContentUrl { get; set; } = "";
    public short OpenInNewPage { get; set; } = 1;
    public short DisplayNewImage { get; set; } = 1;
    public short IsActive { get; set; } = 1;
}

public class SaveActivityRequest
{
    public short RegionId { get; set; } = 1;
    public string ActivityName { get; set; } = "";
    public string ActivityStartDateTime { get; set; } = "";
    public string ActivityEndDateTime { get; set; } = "";
}

public class SaveAdmissionActivityRequest
{
    public short PhaseId { get; set; }
    public string AllotmentDisplayStartDate { get; set; } = "";
    public string AdmissionStartDate { get; set; } = "";
    public string CandidateAdmissionLastDate { get; set; } = "";
    public string CollegeAdmissionLastDate { get; set; } = "";
    public string SystemAdmissionLastDate { get; set; } = "";
    public bool IsCurrentPhase { get; set; }
    public bool IsActive { get; set; } = true;
}

public class SaveUserRequest
{
    public long UserId { get; set; }
    public int UserTypeId { get; set; }
    public string UserPassword { get; set; } = "";
    public string UserName { get; set; } = "";
    public string UserMobileNo { get; set; } = "";
    public string UserEMailId { get; set; } = "";
    public int DistrictId { get; set; }
    public short RegionId { get; set; } = 1;
}

// ── Menu Management ────────────────────────────────────────────────────────
public interface IMenuAdminRepository
{
    Task<IEnumerable<dynamic>> GetGroupsListAsync(short regionId, int userTypeId);
    Task<IEnumerable<dynamic>> GetMenusListAsync(short regionId, int userTypeId, int parentMenuId);
    Task<string> SaveMenusActiveStatusAsync(string menusXml);
    Task<IEnumerable<dynamic>> GetLinksListAsync(string directory);
    Task<string> SaveLinksActiveStatusAsync(string linksXml);
    IEnumerable<string> GetAvailableDirectories();
}

public class SaveMenusRequest
{
    public List<MenuItemActiveStatus> Items { get; set; } = new();
}
public class MenuItemActiveStatus
{
    public int  MenuId   { get; set; }
    public bool IsActive { get; set; }
    public int  SeqNo    { get; set; }
}

public class SaveLinksRequest
{
    public List<LinkActiveStatus> Items { get; set; } = new();
}
public class LinkActiveStatus
{
    public int  LinkId   { get; set; }
    public bool IsActive { get; set; }
}
