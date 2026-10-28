using AgriPhd.Api.Models;

namespace AgriPhd.Api.Repositories.Interfaces;

/// <summary>
/// Mirrors IBase (master data) and Repository.Menu from the legacy codebase.
/// Every SP name preserved exactly.
/// </summary>
public interface IMasterRepository
{
    // ── Generic master table list (Base_GetMasterTableList) ──────────────────
    Task<IEnumerable<DropdownItem>> GetMasterTableListAsync(
        string tableName, string dataValueField, string dataTextField,
        string parentField = "", string parentFieldValue = "", string orderByFields = "");

    // ── Dedicated SPs (no parameters) ────────────────────────────────────────
    Task<IEnumerable<DropdownItem>> GetMasterDistrictAsync();
    Task<IEnumerable<DropdownItem>> GetMasterTalukaAsync();
    Task<IEnumerable<DropdownItem>> GetMasterCollegeDistrictAsync();
    Task<IEnumerable<DropdownItem>> GetMasterCourseAsync();
    Task<IEnumerable<DropdownItem>> GetMasterFacultyAsync();
    Task<IEnumerable<DropdownItem>> GetMasterCourseStatusAsync();
    Task<IEnumerable<DropdownItem>> GetMasterCourseTypeAsync();
    Task<IEnumerable<DropdownItem>> GetMasterCourseSeatTypeAsync();
    Task<IEnumerable<DropdownItem>> GetMasterCourseShiftAsync();
    Task<IEnumerable<DropdownItem>> GetMasterSportsRankAsync();
    Task<IEnumerable<DropdownItem>> GetMasterPhaseAsync();

    // ── Dedicated SPs with parameters ────────────────────────────────────────
    Task<IEnumerable<DropdownItem>> GetMasterCourseByCandidate(long candidateId);
    Task<IEnumerable<DropdownItem>> GetMasterCollegeAsync(int facultyId);
    Task<IEnumerable<DropdownItem>> GetSpotRoundMasterSubjectAsync(short universityId);

    // ── Salutation map (Base_GetMasterSaluation) ─────────────────────────────
    Task<IEnumerable<SaluationMapItem>> GetMasterSaluationMapAsync();

    // ── Menu (Menu_GetMenu) ───────────────────────────────────────────────────
    Task<IEnumerable<MenuItem>> GetMenuAsync(short regionId, int userTypeId, string userLoginId);
}
