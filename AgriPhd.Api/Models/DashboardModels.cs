namespace AgriPhd.Api.Models;

/// <summary>Shared user-details row shown on every dashboard header.</summary>
public class LoggedInUserDetails
{
    public string UserLoginID          { get; set; } = string.Empty;
    public string UserType             { get; set; } = string.Empty;
    public string UserName             { get; set; } = string.Empty;
    public string CurrentLoginDateTime { get; set; } = string.Empty;
    public string LastLoginDateTime    { get; set; } = string.Empty;
    public string IPAddress            { get; set; } = string.Empty;
}

/// <summary>Dashboard_GetCandidateDashboard — Tables[0] status row.</summary>
public class CandidateDashboardData
{
    public LoggedInUserDetails  UserDetails               { get; set; } = new();
    public string ApplicationFormStatus                   { get; set; } = string.Empty;
    public string DocumentVerificationStatus              { get; set; } = string.Empty;
    public bool   IsFormLocked                            { get; set; }
    public bool   IsEligibleForFormFilling                { get; set; }
    public IEnumerable<RejectedDocumentRow> RejectedDocs { get; set; } = Enumerable.Empty<RejectedDocumentRow>();
}

public class RejectedDocumentRow
{
    public string Document { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
}

/// <summary>Dashboard_GetAdminDashboard — _1 columns (active).</summary>
public class AdminDashboardData
{
    public LoggedInUserDetails UserDetails       { get; set; } = new();
    public string Registered_1                  { get; set; } = "0";
    public string Locked_1                      { get; set; } = "0";
    public string FullyVerified_1               { get; set; } = "0";
    public string PartiallyVerified_1           { get; set; } = "0";
    public string NoOfColleges_1                { get; set; } = "0";
    public string Intake_1                      { get; set; } = "0";
    public string Admitted_1                    { get; set; } = "0";
    public string Vacancy_1                     { get; set; } = "0";
}

/// <summary>Dashboard_GetCollegeDashboard.</summary>
public class CollegeDashboardData
{
    public LoggedInUserDetails UserDetails { get; set; } = new();
    public string Intake                   { get; set; } = "0";
    public string Admitted                 { get; set; } = "0";
    public string Vacancy                  { get; set; } = "0";
}

/// <summary>Dashboard_GetEVerificationDashboard.</summary>
public class EVerificationDashboardData
{
    public LoggedInUserDetails UserDetails  { get; set; } = new();
    public string Total                     { get; set; } = "0";
    public string FullyVerified             { get; set; } = "0";
    public string PartiallyVerified         { get; set; } = "0";
    public string NotAssigned               { get; set; } = "0";
    public string NotVerified               { get; set; } = "0";
    public string ReUploaded                { get; set; } = "0";
    /// <summary>Only show NotAssigned card when UserTypeID == 41.</summary>
    public bool   ShowNotAssigned           { get; set; }
}
