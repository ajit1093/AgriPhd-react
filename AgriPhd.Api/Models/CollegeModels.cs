namespace AgriPhd.Api.Models;

/// <summary>Ported from legacy DataTable columns returned by College_SearchCollege SP.</summary>
public class CollegeSearchResult
{
    public string CollegeCode    { get; set; } = string.Empty;
    public string District       { get; set; } = string.Empty;
    public string CollegeName    { get; set; } = string.Empty;
    public string Course         { get; set; } = string.Empty;
    public string CourseStatus   { get; set; } = string.Empty;
    public string Intake         { get; set; } = string.Empty;
}

/// <summary>Ported from DataTable columns returned by College_SearchAgriCollege SP.</summary>
public class AgriCollegeSearchResult
{
    public string CollegeCode    { get; set; } = string.Empty;
    public string District       { get; set; } = string.Empty;
    public string CollegeName    { get; set; } = string.Empty;
    public string CollegeAddress { get; set; } = string.Empty;
    public string PhdFacultyName { get; set; } = string.Empty;
    public string CollegeStatus  { get; set; } = string.Empty;
    public string SubjectName    { get; set; } = string.Empty;
}

/// <summary>Ported from Admission_GetAllotmentList SP columns.</summary>
public class AllotmentListItem
{
    public string ApplicationID             { get; set; } = string.Empty;
    public string ApplicationFormNo         { get; set; } = string.Empty;
    public string CandidateName             { get; set; } = string.Empty;
    public string StudentCategoryDisplay    { get; set; } = string.Empty;
    public string AllottedCategoryDisplay   { get; set; } = string.Empty;
    public string RoasterSeqNo              { get; set; } = string.Empty;
    public string RoasterPoint              { get; set; } = string.Empty;
}

/// <summary>
/// University vacancy response — SpotRound_DynamicVac returns a DataSet with 3 tables.
/// Tables[0] = college-wise vacancy, Tables[1] = subject-wise, Tables[2] = roster details.
/// </summary>
public class UniversityVacancyResponse
{
    public IEnumerable<CollegeVacancyRow>  CollegeWise { get; set; } = Enumerable.Empty<CollegeVacancyRow>();
    public IEnumerable<SubjectVacancyRow>  SubjectWise { get; set; } = Enumerable.Empty<SubjectVacancyRow>();
    public IEnumerable<RosterVacancyRow>   RosterDetails { get; set; } = Enumerable.Empty<RosterVacancyRow>();
}

public class CollegeVacancyRow
{
    public string SubjectName  { get; set; } = string.Empty;
    public string Quota        { get; set; } = string.Empty;
    public string Category     { get; set; } = string.Empty;
    public string GenderType   { get; set; } = string.Empty;
    public string AllottedType { get; set; } = string.Empty;
    public string Vac          { get; set; } = string.Empty;
}

public class SubjectVacancyRow
{
    public string CollegeCode    { get; set; } = string.Empty;
    public string CollegeName    { get; set; } = string.Empty;
    public string PHDCollegeCode { get; set; } = string.Empty;
    public string SubjectName    { get; set; } = string.Empty;
    public string Quota          { get; set; } = string.Empty;
    public string Vac            { get; set; } = string.Empty;
}

public class RosterVacancyRow
{
    public string RosterSrNo    { get; set; } = string.Empty;
    public string RosterPoints  { get; set; } = string.Empty;
    public string CategoryName  { get; set; } = string.Empty;
    public string Vac           { get; set; } = string.Empty;
}
