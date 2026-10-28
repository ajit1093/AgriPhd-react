using AgriPhd.Api.Models;

namespace AgriPhd.Api.Repositories.Interfaces;

public interface IDashboardRepository
{
    Task<LoggedInUserDetails> GetLoggedInUserDetailsAsync(int userTypeId, string userLoginId);
    Task<CandidateDashboardData> GetCandidateDashboardAsync(long candidateId, int userTypeId, string userLoginId, string ipAddress);
    Task<AdminDashboardData> GetAdminDashboardAsync(int userTypeId, string userLoginId);
    Task<CollegeDashboardData> GetCollegeDashboardAsync(long collegeId, int userTypeId, string userLoginId);
    Task<EVerificationDashboardData> GetEVerificationDashboardAsync(long userId, int userTypeId, string userLoginId);
    Task<bool> IsApplicationFormLockedAsync(long candidateId);
    Task<bool> IsEligibleForApplicationFormFillingAsync(long candidateId, string userLoginId);
}
