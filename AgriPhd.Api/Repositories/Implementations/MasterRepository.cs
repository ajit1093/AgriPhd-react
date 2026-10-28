using System.Data;
using Dapper;
using AgriPhd.Api.Helpers;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Dapper implementation of IMasterRepository.
/// Exact SP names and parameters from legacy Repository.Base.cs and Repository.Menu.cs.
/// </summary>
public class MasterRepository : IMasterRepository
{
    private readonly IDbConnection _db;

    public MasterRepository(IDbConnection db) => _db = db;

    // ── Generic ──────────────────────────────────────────────────────────────

    public async Task<IEnumerable<DropdownItem>> GetMasterTableListAsync(
        string tableName, string dataValueField, string dataTextField,
        string parentField = "", string parentFieldValue = "", string orderByFields = "")
    {
        var p = new DynamicParameters();
        p.Add("@TableName",        tableName);
        p.Add("@DataValueField",   dataValueField);
        p.Add("@DataTextField",    dataTextField);
        p.Add("@ParentField",      parentField);
        p.Add("@ParentFieldValue", parentFieldValue);
        p.Add("@OrderByFields",    orderByFields);

        var rows = await _db.QueryAsync<dynamic>(
            "Base_GetMasterTableList", p, commandType: CommandType.StoredProcedure);

        // SP returns columns named exactly as @DataValueField / @DataTextField.
        // Read by exact column name passed in; fallback to positional index via IDictionary.
        return rows.Select(r =>
        {
            var dict = (IDictionary<string, object>)r;
            var keys = dict.Keys.ToList();
            var val  = dict.ContainsKey(dataValueField) ? dict[dataValueField]
                     : keys.Count > 0 ? dict[keys[0]] : "";
            var txt  = dict.ContainsKey(dataTextField)  ? dict[dataTextField]
                     : keys.Count > 1 ? dict[keys[1]] : "";
            var grp  = keys.Count > 2 ? dict[keys[2]] : null;
            return new DropdownItem
            {
                Value = Convert.ToString(val  ?? "") ?? "",
                Text  = Convert.ToString(txt  ?? "") ?? "",
                Group = grp == null ? null : Convert.ToString(grp),
            };
        });
    }

    // ── Dedicated SPs ────────────────────────────────────────────────────────

    public Task<IEnumerable<DropdownItem>> GetMasterDistrictAsync()       => SimpleListAsync("Base_GetMasterDistrict");
    public Task<IEnumerable<DropdownItem>> GetMasterTalukaAsync()         => SimpleListAsync("Base_GetMasterTaluka");
    public Task<IEnumerable<DropdownItem>> GetMasterCollegeDistrictAsync()=> SimpleListAsync("Base_GetMasterCollegeDistrict");
    public Task<IEnumerable<DropdownItem>> GetMasterCourseAsync()         => SimpleListAsync("Base_GetMasterCourse");
    public Task<IEnumerable<DropdownItem>> GetMasterFacultyAsync()        => SimpleListAsync("Base_GetMasterFaculty");
    public Task<IEnumerable<DropdownItem>> GetMasterCourseStatusAsync()   => SimpleListAsync("Base_GetMasterCourseStatus");
    public Task<IEnumerable<DropdownItem>> GetMasterCourseTypeAsync()     => SimpleListAsync("Base_GetMasterCourseType");
    public Task<IEnumerable<DropdownItem>> GetMasterCourseSeatTypeAsync() => SimpleListAsync("Base_GetMasterCourseSeatType");
    public Task<IEnumerable<DropdownItem>> GetMasterCourseShiftAsync()    => SimpleListAsync("Base_GetMasterCourseShift");
    public Task<IEnumerable<DropdownItem>> GetMasterSportsRankAsync()     => SimpleListAsync("Base_GetMasterSportsRank");
    public Task<IEnumerable<DropdownItem>> GetMasterPhaseAsync()          => SimpleListAsync("Base_GetMasterPhase");

    public async Task<IEnumerable<DropdownItem>> GetMasterCourseByCandidate(long candidateId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        var rows = await _db.QueryAsync<dynamic>(
            "Base_GetMasterCourseByCandidate", p, commandType: CommandType.StoredProcedure);
        return MapToDropdown(rows);
    }

    public async Task<IEnumerable<DropdownItem>> GetMasterCollegeAsync(int facultyId)
    {
        var p = new DynamicParameters();
        p.Add("@FacultyID", facultyId);
        var rows = await _db.QueryAsync<dynamic>(
            "Base_GetMasterCollege", p, commandType: CommandType.StoredProcedure);
        return MapToDropdown(rows);
    }

    public async Task<IEnumerable<DropdownItem>> GetSpotRoundMasterSubjectAsync(short universityId)
    {
        var p = new DynamicParameters();
        p.Add("@UniversityID", universityId);
        var rows = await _db.QueryAsync<dynamic>(
            "SpotRound_GetMasterSubject", p, commandType: CommandType.StoredProcedure);
        return MapToDropdown(rows);
    }

    // ── Salutation map ────────────────────────────────────────────────────────

    public async Task<IEnumerable<SaluationMapItem>> GetMasterSaluationMapAsync()
    {
        var rows = await _db.QueryAsync<dynamic>(
            "Base_GetMasterSaluation", commandType: CommandType.StoredProcedure);

        return rows.Select(r => new SaluationMapItem
        {
            SaluationId    = Convert.ToInt32(r.SaluationID    ?? 0),
            SaluationMapId = Convert.ToInt32(r.SaluationMapID ?? 0),
            GenderCode     = Convert.ToString(r.GenderCode    ?? "") ?? "",
        });
    }

    // ── Menu ──────────────────────────────────────────────────────────────────

    public async Task<IEnumerable<MenuItem>> GetMenuAsync(short regionId, int userTypeId, string userLoginId)
    {
        var p = new DynamicParameters();
        p.Add("@RegionID",    regionId);
        p.Add("@UserTypeID",  userTypeId);
        p.Add("@UserLoginID", userLoginId);
        p.Add("@Language",    "");

        var rows = await _db.QueryAsync<dynamic>(
            "Menu_GetMenu", p, commandType: CommandType.StoredProcedure);

        // Flat list from SP — build tree in service
        return rows.Select(r => new MenuItem
        {
            MenuId       = Convert.ToInt32(r.MenuID       ?? 0),
            ParentMenuId = r.ParentMenuID == null ? null : (int?)Convert.ToInt32(r.ParentMenuID),
            // SP returns LinkName (not MenuName), LinkURL (not MenuURL) — map correctly
            MenuName     = Convert.ToString(r.LinkName    ?? r.MenuName ?? "") ?? "",
            // Convert legacy ASPX URL to React route
            MenuUrl      = LegacyUrlMapper.ToReactRoute(
                               Convert.ToString(r.LinkURL ?? r.MenuURL ?? "") ?? ""),
            Target       = Convert.ToString(r.Target      ?? "_self") ?? "_self",
            IsNew        = Convert.ToBoolean(r.IsNew      ?? false),
            SeqNo        = Convert.ToInt32(r.SeqNo        ?? 0),
        });
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private async Task<IEnumerable<DropdownItem>> SimpleListAsync(string spName)
    {
        var rows = await _db.QueryAsync<dynamic>(spName, commandType: CommandType.StoredProcedure);
        return MapToDropdown(rows);
    }

    // Reads first two columns by position — handles any SP column naming convention.
    private static IEnumerable<DropdownItem> MapToDropdown(IEnumerable<dynamic> rows) =>
        rows.Select(r =>
        {
            var dict = (IDictionary<string, object>)r;
            var keys = dict.Keys.ToList();
            var val  = keys.Count > 0 ? dict[keys[0]] : "";
            var txt  = keys.Count > 1 ? dict[keys[1]] : "";
            var grp  = keys.Count > 2 ? dict[keys[2]] : null;
            return new DropdownItem
            {
                Value = Convert.ToString(val  ?? "") ?? "",
                Text  = Convert.ToString(txt  ?? "") ?? "",
                Group = grp == null ? null : Convert.ToString(grp),
            };
        });
}
