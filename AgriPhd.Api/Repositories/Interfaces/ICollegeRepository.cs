using AgriPhd.Api.Models;

namespace AgriPhd.Api.Repositories.Interfaces;

public interface ICollegeRepository
{
    /// <summary>SP: College_SearchCollege(@CourseID, @DistrictID, @CourseStatusID)</summary>
    Task<IEnumerable<CollegeSearchResult>> SearchCollegeAsync(short courseId, int districtId, short courseStatusId);

    /// <summary>SP: College_SearchAgriCollege(@FacultyID, @CollegeUniversityID, @CollegeStatusID)</summary>
    Task<IEnumerable<AgriCollegeSearchResult>> SearchAgriCollegeAsync(short facultyId, int universityId, short collegeStatusId);

    /// <summary>SP: Admission_GetAllotmentList(@CollegeID, @PhaseID)</summary>
    Task<IEnumerable<AllotmentListItem>> GetAllotmentListAsync(long collegeId, int phaseId);

    /// <summary>SP: SpotRound_DynamicVac(@UniversityID, @SubjectID) — returns 3-table DataSet</summary>
    Task<UniversityVacancyResponse> GetUniversityVacancyAsync(short universityId, int subjectId);

    // ── Batch I additions ─────────────────────────────────────────────────────
    /// <summary>SP: College_GetCollegeList(@FacultyID, @DistrictID, @CollegeCode, @CollegeName)</summary>
    Task<IEnumerable<dynamic>> GetCollegeListAsync(short facultyId, int districtId, string collegeCode, string collegeName);
    /// <summary>SP: College_GetCollegeDetails(@CollegeID)</summary>
    Task<dynamic?> GetCollegeDetailsAsync(long collegeId);
    /// <summary>SP: College_GetCollegeSummary(@CollegeID)</summary>
    Task<dynamic?> GetCollegeSummaryAsync(long collegeId);
    /// <summary>SP: College_SaveCollegeDetails — 22 @params</summary>
    Task<bool> SaveCollegeDetailsAsync(dynamic entity, string userLoginId, string ipAddress);
}
