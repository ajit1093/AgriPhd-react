namespace AgriPhd.Api.Repositories.Interfaces;

public interface IEVerificationRepository
{
    /// <summary>EV_GetCandidateListForEVerification(@ApplicationStatus, @UserLoginID)</summary>
    Task<IEnumerable<dynamic>> GetCandidateListAsync(string applicationStatus, string userLoginId);
    /// <summary>EV_GetCandidateDetailsForEVerification(@CandidateID) — returns DataSet</summary>
    Task<dynamic?> GetCandidateDetailsAsync(long candidateId);
    /// <summary>EV_SaveDocumentsEVerificationStatus(@CandidateID, @DocumentsVerifiedXML, @UserLoginID, @IPAddress)</summary>
    Task<bool> SaveVerificationStatusAsync(long candidateId, string documentsXml, string userLoginId, string ipAddress);
}
