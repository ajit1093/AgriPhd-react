namespace AgriPhd.Api.Models;

/// <summary>
/// Pre-existing CET candidate record — returned by ApplicationForm_GetRegisteredCandidate.
/// Columns confirmed from RegistrationWorker.GetRegisterCandidateList mapping.
/// </summary>
public class CandidateLookupResult
{
    public string   CandidateName    { get; set; } = string.Empty;
    public string   FacultyName      { get; set; } = string.Empty;
    public long     ApplicationFormNo { get; set; }
    public long     SeatNo           { get; set; }
    public decimal  CETScore         { get; set; }
    /// <summary>Raw string as returned by SP — not converted to DateTime.</summary>
    public string   DOB              { get; set; } = string.Empty;
    /// <summary>True = login already exists for this AppFormNo (block re-registration).</summary>
    public bool     LoginExists      { get; set; }
    public string   MobileNo         { get; set; } = string.Empty;
    public string   EmailId          { get; set; } = string.Empty;
    public string   PGSubjectName    { get; set; } = string.Empty;
}

/// <summary>
/// Email/SMS template returned by Base_GetEMailSMS.
/// Columns confirmed from BaseWorker / EMailOTPValidation.
/// </summary>
public class EmailSmsTemplate
{
    public string EmailId    { get; set; } = string.Empty;
    public string Subject    { get; set; } = string.Empty;
    public string Message    { get; set; } = string.Empty;
    public string MobileNo   { get; set; } = string.Empty;
    public string TemplateId { get; set; } = string.Empty;
    public string Var1       { get; set; } = string.Empty;
    public string Var2       { get; set; } = string.Empty;
    public string Var3       { get; set; } = string.Empty;
    public string Var4       { get; set; } = string.Empty;
    public string Var5       { get; set; } = string.Empty;
}
