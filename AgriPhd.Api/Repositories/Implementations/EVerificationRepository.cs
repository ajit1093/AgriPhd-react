using System.Data;
using Dapper;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

public class EVerificationRepository : IEVerificationRepository
{
    private readonly IDbConnection _db;
    public EVerificationRepository(IDbConnection db) => _db = db;

    public async Task<IEnumerable<dynamic>> GetCandidateListAsync(string applicationStatus, string userLoginId)
    {
        var p = new DynamicParameters();
        p.Add("@ApplicationStatus", applicationStatus);
        p.Add("@UserLoginID",       userLoginId);
        return await _db.QueryAsync<dynamic>(
            "EV_GetCandidateListForEVerification", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<dynamic?> GetCandidateDetailsAsync(long candidateId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        // SP returns DataSet — use QueryMultiple, take Tables[0] (document list)
        using var multi = await _db.QueryMultipleAsync(
            "EV_GetCandidateDetailsForEVerification", p, commandType: CommandType.StoredProcedure);
        var docs = (await multi.ReadAsync<dynamic>()).ToList();
        return new { documents = docs };
    }

    public async Task<bool> SaveVerificationStatusAsync(
        long candidateId, string documentsXml, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",          candidateId);
        p.Add("@DocumentsVerifiedXML", documentsXml);
        p.Add("@UserLoginID",          userLoginId);
        p.Add("@IPAddress",            ipAddress);
        var r = await _db.ExecuteScalarAsync<string>(
            "EV_SaveDocumentsEVerificationStatus", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }
}
