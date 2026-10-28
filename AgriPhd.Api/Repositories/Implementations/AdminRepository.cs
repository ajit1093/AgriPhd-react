using System.Data;
using System.Globalization;
using Dapper;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Admin management repository — notifications, users, phases, EVC, activity status,
/// password generation, search candidate. Mirrors legacy Administration/ worker/data layers.
/// </summary>
public class AdminRepository : IAdminRepository
{
    private readonly IDbConnection _db;
    public AdminRepository(IDbConnection db) => _db = db;

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static string S(object? v) => Convert.ToString(v ?? "") ?? "";
    private static DateTime? ParseDate(string? s)
    {
        if (string.IsNullOrWhiteSpace(s)) return null;
        if (DateTime.TryParseExact(s.Trim(), "dd-MM-yyyy HH:mm", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dt)) return dt;
        if (DateTime.TryParse(s.Trim(), out var dt2)) return dt2;
        return null;
    }

    // ── Notifications ─────────────────────────────────────────────────────────
    public async Task<IEnumerable<dynamic>> GetNotificationListAsync(short regionId)
    {
        var p = new DynamicParameters();
        p.Add("@RegionID", regionId);
        return await _db.QueryAsync<dynamic>("Administration_GetNotificationList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<dynamic?> GetNotificationDetailsAsync(long notificationId)
    {
        var p = new DynamicParameters();
        p.Add("@NotificationID", notificationId);
        return await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_GetNotificationDetails", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<string> SaveNotificationAsync(SaveNotificationRequest req, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@NotificationID",           req.NotificationId);
        p.Add("@NotificationCategoryID",   req.NotificationCategoryId);
        p.Add("@NotificationTitle",        req.NotificationTitle);
        p.Add("@NotificationTitleMarathi", req.NotificationTitleMarathi);
        p.Add("@DisplayStartDateTime",     ParseDate(req.DisplayStartDateTime));
        p.Add("@DisplayEndDateTime",       ParseDate(req.DisplayEndDateTime));
        p.Add("@PublishDateTime",          ParseDate(req.PublishDateTime));
        p.Add("@ContentType",              req.ContentType);
        p.Add("@TextContent",              req.TextContent);
        p.Add("@TextContentMarathi",       req.TextContentMarathi ?? "");
        p.Add("@FileContentName",          req.FileContentName);
        p.Add("@FileContentURL",           req.FileContentUrl);
        p.Add("@OpenInNewPage",            req.OpenInNewPage);
        p.Add("@DisplayNewImage",          req.DisplayNewImage);
        p.Add("@IsActive",                 req.IsActive);
        p.Add("@RegionID",                 (short)1);
        p.Add("@UserLoginID",              userLoginId);
        p.Add("@IPAddress",                ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "Administration_SaveNotification", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    public async Task<string> DeleteNotificationAsync(long notificationId, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@NotificationID", (int)notificationId);
        p.Add("@UserLoginID",    userLoginId);
        p.Add("@IPAddress",      ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_DeleteNotification", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    // ── Users ─────────────────────────────────────────────────────────────────
    public async Task<IEnumerable<dynamic>> GetUsersListAsync(int userTypeId)
    {
        var p = new DynamicParameters();
        p.Add("@UserTypeID", userTypeId);
        return await _db.QueryAsync<dynamic>("Administration_GetUsersList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<dynamic?> GetUserDetailsAsync(long userId)
    {
        var p = new DynamicParameters();
        p.Add("@UserID", userId);
        return await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_GetUserDetails", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<string> SaveUserAsync(SaveUserRequest req, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@UserID",     req.UserId);
        p.Add("@UserTypeID", req.UserTypeId);
        p.Add("@UserPassword", string.IsNullOrEmpty(req.UserPassword) ? "" : Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(req.UserPassword)));
        p.Add("@UserName",   req.UserName);
        p.Add("@UserMobileNo", req.UserMobileNo);
        p.Add("@UserEMailID",  req.UserEMailId);
        p.Add("@DistrictID", req.DistrictId);
        p.Add("@RegionID",   req.RegionId);
        p.Add("@ModifiedBy",          userLoginId);
        p.Add("@ModifiedByIPAddress", ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_SaveUser", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    public async Task<string> ActivateOrDeactivateUserAsync(long userId, string modifiedBy, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@UserID",               userId);
        p.Add("@ModifiedBy",           modifiedBy);
        p.Add("@ModifiedByIPAddress",  ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_ActivateOrDeactivateUser", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    // ── Phases ────────────────────────────────────────────────────────────────
    public async Task<IEnumerable<dynamic>> GetPhaseListAsync()
    {
        return await _db.QueryAsync<dynamic>("Administration_GetPhaseList", commandType: CommandType.StoredProcedure);
    }

    public async Task<dynamic?> GetPhaseDetailsAsync(int phaseId)
    {
        var p = new DynamicParameters();
        p.Add("@PhaseID", phaseId);
        return await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_GetPhaseDetails", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<string> SavePhaseAsync(SavePhaseRequest req, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@PhaseID",                    req.PhaseId);
        p.Add("@Phase",                      req.Phase);
        p.Add("@AllotmentDisplayStartDate",  ParseDate(req.AllotmentDisplayStartDate));
        p.Add("@AdmissionStartDate",         ParseDate(req.AdmissionStartDate));
        p.Add("@CandidateAdmissionLastDate", ParseDate(req.CandidateAdmissionLastDate));
        p.Add("@CollegeAdmissionLastDate",   ParseDate(req.CollegeAdmissionLastDate));
        p.Add("@SystemAdmissionLastDate",    ParseDate(req.SystemAdmissionLastDate));
        p.Add("@IsCurrentPhase",             req.IsCurrentPhase);
        p.Add("@IsActive",                   req.IsActive);
        p.Add("@UserLoginID",                userLoginId);
        p.Add("@IPAddress",                  ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_SavePhase", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    public async Task<string> DeletePhaseAsync(int phaseId, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@PhaseID",    phaseId);
        p.Add("@UserLoginID", userLoginId);
        p.Add("@IPAddress",   ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_DeletePhase", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    // ── EVC ───────────────────────────────────────────────────────────────────
    public async Task<IEnumerable<dynamic>> GetEvcListAsync(string flag)
    {
        var p = new DynamicParameters();
        p.Add("@Flag", flag);
        return await _db.QueryAsync<dynamic>("Administration_GetEVCList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<dynamic?> GetEvcDetailsAsync(int evcId)
    {
        var p = new DynamicParameters();
        p.Add("@EVCID", evcId);
        return await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_GetEVCDetails", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<string> SaveEvcDetailsAsync(SaveEvcRequest req, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@EVCID",               req.EvcId);
        p.Add("@EVCCode",             req.EvcCode);
        p.Add("@CoordinatorName",     req.CoordinatorName);
        p.Add("@CoordinatorMobileNo", req.CoordinatorMobileNo);
        p.Add("@CoordinatorEMailID",  req.CoordinatorEMailId);
        p.Add("@UserLoginID",         userLoginId);
        p.Add("@IPAddress",           ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_SaveEVCDetails", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    public async Task<string> ActivateDeactivateEvcAsync(int evcId, bool activate, string userLoginId, string ipAddress)
    {
        var spName = activate ? "Administration_ActivateEVC" : "Administration_DeactivateEVC";
        var p = new DynamicParameters();
        p.Add("@EVCID",      evcId);
        p.Add("@UserLoginID", userLoginId);
        p.Add("@IPAddress",   ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>(spName, p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    // ── Activity Status ────────────────────────────────────────────────────────
    public async Task<IEnumerable<dynamic>> GetActivityStatusListAsync(short regionId)
    {
        var p = new DynamicParameters();
        p.Add("@RegionID", regionId);
        return await _db.QueryAsync<dynamic>("Administration_GetActivityStatusList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<string> SaveActivityStatusAsync(SaveActivityRequest req, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@RegionID",             req.RegionId);
        p.Add("@ActivityName",         req.ActivityName);
        p.Add("@ActivityStartDateTime", ParseDate(req.ActivityStartDateTime));
        p.Add("@ActivityEndDateTime",   ParseDate(req.ActivityEndDateTime));
        p.Add("@ModifiedBy",           userLoginId);
        p.Add("@ModifiedByIPAddress",  ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_SaveActivityStatusDetails", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    public async Task<IEnumerable<dynamic>> GetAdmissionActivityStatusListAsync()
    {
        return await _db.QueryAsync<dynamic>("Administration_GetAdmissionActivityStatusList", commandType: CommandType.StoredProcedure);
    }

    public async Task<string> SaveAdmissionActivityStatusAsync(SaveAdmissionActivityRequest req, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@PhaseID",                    req.PhaseId);
        p.Add("@AllotmentDisplayStartDate",  ParseDate(req.AllotmentDisplayStartDate));
        p.Add("@AdmissionStartDate",         ParseDate(req.AdmissionStartDate));
        p.Add("@CandidateAdmissionLastDate", ParseDate(req.CandidateAdmissionLastDate));
        p.Add("@CollegeAdmissionLastDate",   ParseDate(req.CollegeAdmissionLastDate));
        p.Add("@SystemAdmissionLastDate",    ParseDate(req.SystemAdmissionLastDate));
        p.Add("@IsCurrentPhase",             req.IsCurrentPhase);
        p.Add("@IsActive",                   req.IsActive);
        p.Add("@ModifiedBy",                 userLoginId);
        p.Add("@ModifiedByIPAddress",        ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Administration_SaveAdmissionActivityStatusDetails", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    // ── Generate Passwords ────────────────────────────────────────────────────
    public async Task<IEnumerable<dynamic>> GetUserListForPasswordGenerationAsync(int userTypeId)
    {
        var p = new DynamicParameters();
        p.Add("@UserTypeID", userTypeId);
        return await _db.QueryAsync<dynamic>("Account_GetUserListForPasswordGeneration", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<string> UpdateUserPasswordAsync(long userId, string newPassword, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@UserID",    userId);
        p.Add("@Password",  newPassword);
        p.Add("@ModifiedBy",          userLoginId);
        p.Add("@ModifiedByIPAddress", ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Account_UpdateUserPassword", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    // ── Search Candidate ──────────────────────────────────────────────────────
    // SP: Base_SearchCandidate(@SearchCandidateBy, @SearchQuery)
    // @SearchQuery is a raw SQL WHERE clause — exactly how legacy passes it
    public async Task<IEnumerable<dynamic>> SearchCandidateAsync(string searchBy, string query)
    {
        // Build WHERE clause matching legacy SearchCandidate.aspx.cs exactly
        string whereClause = searchBy switch
        {
            "ApplicationID"   => $"ApplicationID = '{query.Replace("'", "''")}'",
            "ApplicationFormNo" => $"ApplicationID = '{query.Replace("'", "''")}'",
            "CandidateName"   => string.Join(" AND ",
                query.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                     .Select(w => $"CandidateName LIKE '%{w.Replace("'", "''")}%'")),
            "MobileNo"        => $"MobileNo = '{query.Replace("'", "''")}'",
            "EMailID"         => $"EMailID = '{query.Replace("'", "''")}'",
            _                 => $"ApplicationID = '{query.Replace("'", "''")}'",
        };

        if (string.IsNullOrWhiteSpace(whereClause)) return Enumerable.Empty<dynamic>();

        var p = new DynamicParameters();
        p.Add("@SearchCandidateBy", searchBy);
        p.Add("@SearchQuery",       whereClause);
        try
        {
            return await _db.QueryAsync<dynamic>("Base_SearchCandidate", p, commandType: CommandType.StoredProcedure);
        }
        catch (Exception ex)
        {
            // Log and return empty — SP has dynamic SQL that may error on edge cases
            Console.Error.WriteLine($"SearchCandidate error: {ex.Message}");
            return Enumerable.Empty<dynamic>();
        }
    }

    public async Task<string> ResetCandidatePasswordAsync(long candidateId, string newPassword, string userLoginId, string ipAddress)
    {
        // Reuse Account_ResetPassword SP
        var p = new DynamicParameters();
        p.Add("@UserID",    candidateId);
        p.Add("@Password",  newPassword);
        p.Add("@UserLoginID", userLoginId);
        p.Add("@IPAddress",   ipAddress);
        var result = await _db.QueryFirstOrDefaultAsync<dynamic>("Account_ResetPassword", p, commandType: CommandType.StoredProcedure);
        return S(result?.Result ?? result?.ReturnValue ?? "Y");
    }

    // ── Lookup CandidateID by LoginID or ApplicationFormNo ────────────────────
    public async Task<long> GetCandidateIdByLoginAsync(string loginId)
    {
        var p = new DynamicParameters();
        p.Add("@SearText", loginId);   // Note: SP has typo — @SearText not @SearchText
        p.Add("@SearchBy", "L");       // L = LoginID
        var result = await _db.QueryFirstOrDefaultAsync<long?>("Base_GetCandidateIDByType", p, commandType: CommandType.StoredProcedure);
        return result ?? 0;
    }

    public async Task<long> GetCandidateIdByAppFormNoAsync(string appFormNo)
    {
        var p = new DynamicParameters();
        p.Add("@SearText", appFormNo);
        p.Add("@SearchBy", "A");       // A = ApplicationFormNo
        var result = await _db.QueryFirstOrDefaultAsync<long?>("Base_GetCandidateIDByType", p, commandType: CommandType.StoredProcedure);
        return result ?? 0;
    }

    // ── App Settings ──────────────────────────────────────────────────────────
    public async Task<IEnumerable<dynamic>> GetAppSettingsAsync()
    {
        // Returns environment/config info — no DB call, built in controller
        return await Task.FromResult(Enumerable.Empty<dynamic>());
    }
}
