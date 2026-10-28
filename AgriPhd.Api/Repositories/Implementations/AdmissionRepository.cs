using System.Data;
using Dapper;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

public class AdmissionRepository : IAdmissionRepository
{
    private readonly IDbConnection _db;
    public AdmissionRepository(IDbConnection db) => _db = db;

    public async Task<IEnumerable<dynamic>> GetPhaseListAsync(int userTypeId, string flag, string userLoginId)
    {
        var p = new DynamicParameters();
        p.Add("@UserTypeID",  userTypeId);
        p.Add("@Flag",        flag);
        p.Add("@UserLoginID", userLoginId);
        return await _db.QueryAsync<dynamic>("Admission_GetPhaseList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<short> GetCurrentPhaseIdAsync()
    {
        var r = await _db.ExecuteScalarAsync<object>("Admission_GetCurrentPhaseID", commandType: CommandType.StoredProcedure);
        return Convert.ToInt16(r ?? 0);
    }

    public async Task<dynamic?> GetAllotmentStatusAsync(short phaseId, long candidateId)
    {
        var p = new DynamicParameters();
        p.Add("@PhaseID",     phaseId);
        p.Add("@CandidateID", candidateId);
        // SP returns DataSet — use QueryMultiple, read Tables[0] first row
        using var multi = await _db.QueryMultipleAsync("Admission_GetAllotmentStatus_AgriPG", p, commandType: CommandType.StoredProcedure);
        return (await multi.ReadAsync<dynamic>()).FirstOrDefault();
    }

    public async Task<dynamic?> GetAllotmentSummaryAsync(long candidateId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        using var multi = await _db.QueryMultipleAsync("Admission_GetAllotmentSummary", p, commandType: CommandType.StoredProcedure);
        var header = (await multi.ReadAsync<dynamic>()).FirstOrDefault();
        var rounds = multi.IsConsumed ? Enumerable.Empty<dynamic>() : await multi.ReadAsync<dynamic>();
        return new { header, rounds };
    }

    public async Task<IEnumerable<dynamic>> GetAllottedStudentsAsync(int faculty, short subjectId, int phaseId, int collegeId, string reportStatus)
    {
        var p = new DynamicParameters();
        p.Add("@Faculty",      faculty);
        p.Add("@SubjectID",    subjectId);
        p.Add("@PhaseID",      phaseId);
        p.Add("@CollegeID",    collegeId);
        p.Add("@ReportStatus", reportStatus);
        return await _db.QueryAsync<dynamic>("Admission_GetAllotedStudentList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<long> GetConfirmedChoiceCodeAsync(long candidateId, short phaseId)
    {
        // Get PHDCollegeCode from confirmed admission row (ReportingStatus = 'Y' = Admitted)
        string sql;
        object param;
        if (phaseId > 0)
        {
            sql   = "SELECT TOP 1 PHDCollegeCode FROM College_AllotmentDetails WHERE CandidateID = @CandidateID AND PhaseID = @PhaseID AND ReportingStatus = 'Y'";
            param = new { CandidateID = candidateId, PhaseID = phaseId };
        }
        else
        {
            sql   = "SELECT TOP 1 PHDCollegeCode FROM College_AllotmentDetails WHERE CandidateID = @CandidateID AND ReportingStatus = 'Y' ORDER BY PhaseID DESC";
            param = new { CandidateID = candidateId };
        }
        var result = await _db.ExecuteScalarAsync<long?>(sql, param);
        return result ?? 0;
    }

    public async Task<dynamic?> GetAdmissionSummaryAsync(long candidateId, long pgCollegeCode, short phaseId, string userLoginId, string reportingStatus, string flag)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",  candidateId);
        p.Add("@PGCollegeCode",pgCollegeCode);
        p.Add("@PhaseID",      phaseId);
        p.Add("@UserLoginID",  userLoginId);
        p.Add("@ReportingStatus", reportingStatus);
        p.Add("@Flag",         flag);
        using var multi = await _db.QueryMultipleAsync("Admission_GetAdmissionSummary", p, commandType: CommandType.StoredProcedure);
        return (await multi.ReadAsync<dynamic>()).FirstOrDefault();
    }

    public async Task<IEnumerable<dynamic>> GetPhaseListRoundWiseAsync(long candidateId, int userTypeId, string flag, string userLoginId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",  candidateId);
        p.Add("@UserTypeID",   userTypeId);
        p.Add("@Flag",         flag);
        p.Add("@UserLoginID",  userLoginId);
        return await _db.QueryAsync<dynamic>("Admission_GetPhaseListRoundWise", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<dynamic?> GetAllotmentLetterAsync(long candidateId, short phaseId, string userLoginId)
    {
        // Get ApplicationFormNo first
        var appFormNo = await _db.ExecuteScalarAsync<string?>(
            "SELECT TOP 1 ApplicationFormNo FROM ApplicationForm_RegistrationDetails WHERE CandidateID = @CandidateID",
            new { CandidateID = candidateId });
        if (string.IsNullOrEmpty(appFormNo)) return null;

        var p = new DynamicParameters();
        p.Add("@PhaseID",           phaseId);
        p.Add("@ApplicationFormNo", appFormNo);
        var rows = await _db.QueryAsync<dynamic>("SpotRound_GetAllotmentLetter", p, commandType: CommandType.StoredProcedure);
        return rows.FirstOrDefault();
    }

    public async Task SaveAllotmentLetterDownloadedAsync(long candidateId, short phaseId, string userLoginId, string ipAddress)
    {
        try
        {
            var p = new DynamicParameters();
            p.Add("@CandidateID",  candidateId);
            p.Add("@PhaseID",      phaseId);
            p.Add("@UserLoginID",  userLoginId);
            p.Add("@IPAddress",    ipAddress);
            await _db.ExecuteAsync("Admission_SaveDownloadAllotmentLetterStatus", p, commandType: CommandType.StoredProcedure);
        }
        catch { /* best-effort, don't fail the download */ }
    }

    public async Task<bool> SaveAllotmentLetterStatusAsync(short phaseId, long candidateId, long choiceCode,
        bool isAccepted, bool isRefused, string refusalReason, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@PhaseID",       phaseId);
        p.Add("@CandidateID",   candidateId);
        p.Add("@ChoiceCode",    choiceCode);
        p.Add("@IsAccepted",    isAccepted);
        p.Add("@IsRefused",     isRefused);
        p.Add("@RefusalReason", refusalReason);
        p.Add("@IsLoad",        "N");
        p.Add("@UserLoginID",   userLoginId);
        p.Add("@IPAddress",     ipAddress);
        var r = await _db.ExecuteScalarAsync<string>("Admission_SaveDownloadAllotmentLetterStatus", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    public async Task<bool> ConfirmAdmissionAsync(long candidateId, long choiceCode, short phaseId,
        string comments, string confirmedBy, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",          candidateId);
        p.Add("@ChoiceCode",           choiceCode);
        p.Add("@PhaseID",              phaseId);
        p.Add("@AdmissionComments",    comments);
        p.Add("@ReportedBy",           confirmedBy);
        p.Add("@ReportedByIPAddress",  ipAddress);
        var r = await _db.ExecuteScalarAsync<string>("Admission_ConfirmAdmission", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() == "Y";
    }

    public async Task<bool> RejectAdmissionAsync(long candidateId, long choiceCode, short phaseId,
        string comments, string rejectedBy, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",          candidateId);
        p.Add("@ChoiceCode",           choiceCode);
        p.Add("@PhaseID",              phaseId);
        p.Add("@RejectionComments",    comments);
        p.Add("@RejectedBy",           rejectedBy);
        p.Add("@RejectedByIPAddress",  ipAddress);
        var r = await _db.ExecuteScalarAsync<string>("Admission_RejectAdmission", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() == "Y";
    }

    public async Task<bool> CancelAdmissionAsync(long candidateId, long choiceCode, short phaseId,
        string comments, string cancelledBy, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",           candidateId);
        p.Add("@ChoiceCode",            choiceCode);
        p.Add("@PhaseID",               phaseId);
        p.Add("@CancellationComments",  comments);
        p.Add("@CancelledBy",           cancelledBy);
        p.Add("@CancelledByIPAddress",  ipAddress);
        var r = await _db.ExecuteScalarAsync<string>("Admission_CancelAdmission", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() == "Y";
    }
}
