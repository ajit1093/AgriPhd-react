using System.Data;
using Dapper;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Exact SP names and @parameters from Repository.Dashboard.cs + Repository.Account.cs (legacy).
/// </summary>
public class DashboardRepository : IDashboardRepository
{
    private readonly IDbConnection _db;
    public DashboardRepository(IDbConnection db) => _db = db;

    public async Task<LoggedInUserDetails> GetLoggedInUserDetailsAsync(int userTypeId, string userLoginId)
    {
        var p = new DynamicParameters();
        p.Add("@UserTypeID",  userTypeId);
        p.Add("@UserLoginID", userLoginId);
        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "Account_GetLoggedInUserDetails", p, commandType: CommandType.StoredProcedure);
        if (row == null) return new LoggedInUserDetails();
        return new LoggedInUserDetails
        {
            UserLoginID          = S(row.UserLoginID),
            UserType             = S(row.UserType),
            UserName             = S(row.UserName),
            CurrentLoginDateTime = FormatDate(row.CurrentLoginDateTime),
            LastLoginDateTime    = FormatDate(row.LastLoginDateTime),
        };
    }

    public async Task<CandidateDashboardData> GetCandidateDashboardAsync(
        long candidateId, int userTypeId, string userLoginId, string ipAddress)
    {
        var userDetails = await GetLoggedInUserDetailsAsync(userTypeId, userLoginId);
        userDetails.IPAddress = ipAddress;

        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        // SP returns DataSet with 2 tables — use QueryMultipleAsync
        using var multi = await _db.QueryMultipleAsync(
            "Dashboard_GetCandidateDashboard", p, commandType: CommandType.StoredProcedure);

        var t0 = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
        var t1 = multi.IsConsumed ? Enumerable.Empty<dynamic>() : await multi.ReadAsync<dynamic>();

        var isLocked    = await IsApplicationFormLockedAsync(candidateId);
        var isEligible  = await IsEligibleForApplicationFormFillingAsync(candidateId, userLoginId);

        return new CandidateDashboardData
        {
            UserDetails                  = userDetails,
            ApplicationFormStatus        = t0 != null ? S(t0.ApplicationFormStatus) : "",
            DocumentVerificationStatus   = t0 != null ? S(t0.DocumentVerificationStatus) : "",
            IsFormLocked                 = isLocked,
            IsEligibleForFormFilling     = isEligible,
            RejectedDocs = t1.Select(r => new RejectedDocumentRow
            {
                Document = S(r.Document),
                Comments = S(r.Comments),
            }),
        };
    }

    public async Task<AdminDashboardData> GetAdminDashboardAsync(int userTypeId, string userLoginId)
    {
        var userDetails = await GetLoggedInUserDetailsAsync(userTypeId, userLoginId);
        var p = new DynamicParameters();
        p.Add("@UserTypeID",  userTypeId);
        p.Add("@UserLoginID", userLoginId);
        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "Dashboard_GetAdminDashboard", p, commandType: CommandType.StoredProcedure);

        return new AdminDashboardData
        {
            UserDetails       = userDetails,
            Registered_1      = row != null ? S(row.Registered_1)      : "0",
            Locked_1          = row != null ? S(row.Locked_1)           : "0",
            FullyVerified_1   = row != null ? S(row.FullyVerified_1)    : "0",
            PartiallyVerified_1 = row != null ? S(row.PartiallyVerified_1) : "0",
            NoOfColleges_1    = row != null ? S(row.NoOfColleges_1)     : "0",
            Intake_1          = row != null ? S(row.Intake_1)           : "0",
            Admitted_1        = row != null ? S(row.Admitted_1)         : "0",
            Vacancy_1         = row != null ? S(row.Vacancy_1)          : "0",
        };
    }

    public async Task<CollegeDashboardData> GetCollegeDashboardAsync(long collegeId, int userTypeId, string userLoginId)
    {
        var userDetails = await GetLoggedInUserDetailsAsync(userTypeId, userLoginId);
        var p = new DynamicParameters();
        p.Add("@CollegeID", collegeId);
        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "Dashboard_GetCollegeDashboard", p, commandType: CommandType.StoredProcedure);

        return new CollegeDashboardData
        {
            UserDetails = userDetails,
            Intake      = row != null ? S(row.Intake)   : "0",
            Admitted    = row != null ? S(row.Admitted) : "0",
            Vacancy     = row != null ? S(row.Vacancy)  : "0",
        };
    }

    public async Task<EVerificationDashboardData> GetEVerificationDashboardAsync(
        long userId, int userTypeId, string userLoginId)
    {
        var userDetails = await GetLoggedInUserDetailsAsync(userTypeId, userLoginId);
        var p = new DynamicParameters();
        p.Add("@UserID", userId);
        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "Dashboard_GetEVerificationDashboard", p, commandType: CommandType.StoredProcedure);

        return new EVerificationDashboardData
        {
            UserDetails        = userDetails,
            Total              = row != null ? S(row.Total)              : "0",
            FullyVerified      = row != null ? S(row.FullyVerified)      : "0",
            PartiallyVerified  = row != null ? S(row.PartiallyVerified)  : "0",
            NotAssigned        = row != null ? S(row.NotAssigned)        : "0",
            NotVerified        = row != null ? S(row.NotVerified)        : "0",
            ReUploaded         = row != null ? S(row.ReUploaded)         : "0",
            ShowNotAssigned    = userTypeId == 41,
        };
    }

    public async Task<bool> IsApplicationFormLockedAsync(long candidateId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        var r = await _db.ExecuteScalarAsync<object>(
            "Base_IsApplicationFormLocked", p, commandType: CommandType.StoredProcedure);
        return Convert.ToBoolean(r);
    }

    public async Task<bool> IsEligibleForApplicationFormFillingAsync(long candidateId, string userLoginId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",  candidateId);
        p.Add("@UserLoginID",  userLoginId);
        var r = await _db.ExecuteScalarAsync<object>(
            "Base_IsEligibleForApplicationFormFilling", p, commandType: CommandType.StoredProcedure);
        return Convert.ToBoolean(r);
    }

    private static string S(object? v) => Convert.ToString(v ?? "") ?? "";
    private static string FormatDate(object? v)
    {
        if (v == null) return "";
        if (DateTime.TryParse(v.ToString(), out var dt))
            return dt.ToString("dd/MM/yyyy") + " " + dt.ToString("hh:mm:ss tt");
        return v.ToString() ?? "";
    }
}
