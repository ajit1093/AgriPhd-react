namespace AgriPhd.Api.Repositories.Interfaces;

public interface IAdmissionRepository
{
    Task<IEnumerable<dynamic>> GetPhaseListAsync(int userTypeId, string flag, string userLoginId);
    Task<short> GetCurrentPhaseIdAsync();
    Task<dynamic?> GetAllotmentStatusAsync(short phaseId, long candidateId);
    Task<dynamic?> GetAllotmentSummaryAsync(long candidateId);
    Task<IEnumerable<dynamic>> GetAllottedStudentsAsync(int faculty, short subjectId, int phaseId, int collegeId, string reportStatus);
    Task<dynamic?> GetAdmissionSummaryAsync(long candidateId, long pgCollegeCode, short phaseId, string userLoginId, string reportingStatus, string flag);
    Task<long> GetConfirmedChoiceCodeAsync(long candidateId, short phaseId);
    Task<IEnumerable<dynamic>> GetPhaseListRoundWiseAsync(long candidateId, int userTypeId, string flag, string userLoginId);
    Task<dynamic?> GetAllotmentLetterAsync(long candidateId, short phaseId, string userLoginId);
    Task SaveAllotmentLetterDownloadedAsync(long candidateId, short phaseId, string userLoginId, string ipAddress);
    Task<bool> SaveAllotmentLetterStatusAsync(short phaseId, long candidateId, long choiceCode, bool isAccepted, bool isRefused, string refusalReason, string userLoginId, string ipAddress);
    Task<bool> ConfirmAdmissionAsync(long candidateId, long choiceCode, short phaseId, string comments, string confirmedBy, string ipAddress);
    Task<bool> RejectAdmissionAsync(long candidateId, long choiceCode, short phaseId, string comments, string rejectedBy, string ipAddress);
    Task<bool> CancelAdmissionAsync(long candidateId, long choiceCode, short phaseId, string comments, string cancelledBy, string ipAddress);
}
