namespace AgriPhd.Api.DTOs.Responses;

public class CandidateLookupResponse
{
    public bool   Found           { get; set; }
    public string? ErrorMessage   { get; set; }
    public string CandidateName  { get; set; } = string.Empty;
    public string FacultyName    { get; set; } = string.Empty;
    public long   ApplicationFormNo { get; set; }
    public string DOB            { get; set; } = string.Empty;
    public string GenderCode     { get; set; } = string.Empty;
    /// <summary>True = login already exists — block registration (FR-REG-03).</summary>
    public bool   LoginExists    { get; set; }
    /// <summary>Pre-filled mobile for the OTP step.</summary>
    public string MobileNo       { get; set; } = string.Empty;
    public string EmailId        { get; set; } = string.Empty;
    public string PGSubjectName  { get; set; } = string.Empty;
}

public class RegisterCandidateResponse
{
    public bool   Success          { get; set; }
    public string? ErrorMessage    { get; set; }
    /// <summary>The 9-digit Application Form Number returned by SP — becomes the Login ID.</summary>
    public string ApplicationFormNo { get; set; } = string.Empty;
}

public class OtpResponse
{
    public bool   Success        { get; set; }
    public string? ErrorMessage  { get; set; }
    public string Message        { get; set; } = string.Empty;
}
