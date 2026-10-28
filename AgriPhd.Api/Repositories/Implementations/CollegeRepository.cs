using System.Data;
using Dapper;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Exact SP names and @parameter names from legacy Repository.College.cs.
/// Note: SearchAgriCollege uses @FacultyID (not @CourseID) despite CollegeWorker naming.
/// SpotRound_DynamicVac returns multiple result sets — handled via QueryMultipleAsync.
/// </summary>
public class CollegeRepository : ICollegeRepository
{
    private readonly IDbConnection _db;
    public CollegeRepository(IDbConnection db) => _db = db;

    public async Task<IEnumerable<CollegeSearchResult>> SearchCollegeAsync(
        short courseId, int districtId, short courseStatusId)
    {
        var p = new DynamicParameters();
        p.Add("@CourseID",       courseId);
        p.Add("@DistrictID",     districtId);
        p.Add("@CourseStatusID", courseStatusId);

        var rows = await _db.QueryAsync<dynamic>(
            "College_SearchCollege", p, commandType: CommandType.StoredProcedure);

        return rows.Select(r => new CollegeSearchResult
        {
            CollegeCode  = S(r.CollegeCode),
            District     = S(r.District),
            CollegeName  = S(r.CollegeName),
            Course       = S(r.Course),
            CourseStatus = S(r.CourseStatus),
            Intake       = S(r.Intake),
        });
    }

    public async Task<IEnumerable<AgriCollegeSearchResult>> SearchAgriCollegeAsync(
        short facultyId, int universityId, short collegeStatusId)
    {
        var p = new DynamicParameters();
        // Confirmed from Repository.College.cs — param is @FacultyID, not @CourseID
        p.Add("@FacultyID",          facultyId);
        p.Add("@CollegeUniversityID", universityId);
        p.Add("@CollegeStatusID",    collegeStatusId);

        var rows = await _db.QueryAsync<dynamic>(
            "College_SearchAgriCollege", p, commandType: CommandType.StoredProcedure);

        return rows.Select(r => new AgriCollegeSearchResult
        {
            CollegeCode    = S(r.CollegeCode),
            District       = S(r.District),
            CollegeName    = S(r.CollegeName),
            CollegeAddress = S(r.CollegeAddress),
            PhdFacultyName = S(r.PhdFacultyName),
            CollegeStatus  = S(r.CollegeStatus),
            SubjectName    = S(r.SubjectName),
        });
    }

    public async Task<IEnumerable<AllotmentListItem>> GetAllotmentListAsync(long collegeId, int phaseId)
    {
        var p = new DynamicParameters();
        p.Add("@CollegeID", collegeId);
        p.Add("@PhaseID",   phaseId);

        var rows = await _db.QueryAsync<dynamic>(
            "Admission_GetAllotmentList", p, commandType: CommandType.StoredProcedure);

        return rows.Select(r => new AllotmentListItem
        {
            ApplicationID           = S(r.ApplicationID),
            ApplicationFormNo       = S(r.ApplicationFormNo),
            CandidateName           = S(r.CandidateName),
            StudentCategoryDisplay  = S(r.StudentCategoryDisplay),
            AllottedCategoryDisplay = S(r.AllottedCategoryDisplay),
            RoasterSeqNo            = S(r.RoasterSeqNo),
            RoasterPoint            = S(r.RoasterPoint),
        });
    }

    public async Task<UniversityVacancyResponse> GetUniversityVacancyAsync(short universityId, int subjectId)
    {
        var p = new DynamicParameters();
        p.Add("@UniversityID", universityId);
        p.Add("@SubjectID",    subjectId);

        // SpotRound_DynamicVac returns 3 result sets (Tables[0], [1], [2])
        using var multi = await _db.QueryMultipleAsync(
            "SpotRound_DynamicVac", p, commandType: CommandType.StoredProcedure);

        var table0 = (await multi.ReadAsync<dynamic>()).ToList();
        var table1 = multi.IsConsumed ? Enumerable.Empty<dynamic>() : (await multi.ReadAsync<dynamic>()).ToList();
        var table2 = multi.IsConsumed ? Enumerable.Empty<dynamic>() : (await multi.ReadAsync<dynamic>()).ToList();

        return new UniversityVacancyResponse
        {
            CollegeWise = table0.Select(r => new CollegeVacancyRow
            {
                SubjectName  = S(r.SubjectName),
                Quota        = S(r.Quota),
                Category     = S(r.Category),
                GenderType   = S(r.GenderType),
                AllottedType = S(r.AllottedType),
                Vac          = S(r.Vac),
            }),
            SubjectWise = table1.Select(r => new SubjectVacancyRow
            {
                CollegeCode    = S(r.CollegeCode),
                CollegeName    = S(r.CollegeName),
                PHDCollegeCode = S(r.PHDCollegeCode),
                SubjectName    = S(r.SubjectName),
                Quota          = S(r.Quota),
                Vac            = S(r.Vac),
            }),
            RosterDetails = table2.Select(r => new RosterVacancyRow
            {
                RosterSrNo   = S(r.RosterSrNo),
                RosterPoints = S(r.RosterPoints),
                CategoryName = S(r.CategoryName),
                Vac          = S(r.Vac),
            }),
        };
    }

    private static string S(object? val) => Convert.ToString(val ?? "") ?? "";

    // ── Batch I additions ─────────────────────────────────────────────────────

    public async Task<IEnumerable<dynamic>> GetCollegeListAsync(short facultyId, int districtId, string collegeCode, string collegeName)
    {
        var p = new DynamicParameters();
        p.Add("@FacultyID",   facultyId);
        p.Add("@DistrictID",  districtId);
        p.Add("@CollegeCode", collegeCode);
        p.Add("@CollegeName", collegeName);
        return await _db.QueryAsync<dynamic>("College_GetCollegeList", p, commandType: CommandType.StoredProcedure);
    }

    public async Task<dynamic?> GetCollegeDetailsAsync(long collegeId)
    {
        var p = new DynamicParameters();
        p.Add("@CollegeID", collegeId);
        using var multi = await _db.QueryMultipleAsync("College_GetCollegeDetails", p, commandType: CommandType.StoredProcedure);
        return (await multi.ReadAsync<dynamic>()).FirstOrDefault();
    }

    public async Task<dynamic?> GetCollegeSummaryAsync(long collegeId)
    {
        var p = new DynamicParameters();
        p.Add("@CollegeID", collegeId);
        using var multi = await _db.QueryMultipleAsync("College_GetCollegeSummary", p, commandType: CommandType.StoredProcedure);
        return (await multi.ReadAsync<dynamic>()).FirstOrDefault();
    }

    public async Task<bool> SaveCollegeDetailsAsync(dynamic entity, string userLoginId, string ipAddress)
    {
        var d = (IDictionary<string, object>)entity;
        var p = new DynamicParameters();
        string G(string k) => d.ContainsKey(k) ? Convert.ToString(d[k] ?? "") ?? "" : "";
        p.Add("@CollegeID",                  d.ContainsKey("collegeID")   ? Convert.ToInt64(d["collegeID"]) : 0L);
        p.Add("@CollegeCode",                G("collegeCode"));
        p.Add("@CollegeName",                G("collegeName"));
        p.Add("@CollegeAddress",             G("collegeAddress"));
        p.Add("@DistrictID",                 d.ContainsKey("districtID")  ? Convert.ToInt32(d["districtID"]) : 0);
        p.Add("@Taluka",                     G("taluka"));
        p.Add("@City",                       G("city"));
        p.Add("@Pincode",                    G("pincode"));
        p.Add("@MobileNo",                   G("mobileNo"));
        p.Add("@EMailID",                    G("eMailID"));
        p.Add("@CourseID",                   d.ContainsKey("courseID")    ? Convert.ToInt16(d["courseID"]) : (short)0);
        p.Add("@CourseStatusID",             d.ContainsKey("courseStatusID") ? Convert.ToInt16(d["courseStatusID"]) : (short)0);
        p.Add("@Intake",                     d.ContainsKey("intake")      ? Convert.ToInt32(d["intake"]) : 0);
        p.Add("@HasManagementQuota",         d.ContainsKey("hasManagementQuota") ? Convert.ToInt16(d["hasManagementQuota"]) : (short)0);
        p.Add("@PrincipalName",              G("principalName"));
        p.Add("@PrincipalEMailID",           G("principalEMailID"));
        p.Add("@PrincipalMobileNo",          G("principalMobileNo"));
        p.Add("@AdmissionInchargeName",      G("admissionInchargeName"));
        p.Add("@AdmissionInchargeEMailID",   G("admissionInchargeEMailID"));
        p.Add("@AdmissionInchargeMobileNo",  G("admissionInchargeMobileNo"));
        p.Add("@UserLoginID",                userLoginId);
        p.Add("@IPAddress",                  ipAddress);
        var r = await _db.ExecuteScalarAsync<string>("College_SaveCollegeDetails", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }
}
