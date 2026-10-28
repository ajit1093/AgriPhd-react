namespace AgriPhd.Api.Models;

public class CheckUrlResult
{
    public bool   IsRightURL { get; set; }
    public string RightURL   { get; set; } = string.Empty;
}

// ── Summary (Tables[0]) ─────────────────────────────────────────────────────
public class ApplicationStatusSummary
{
    public bool   IsPersonalDetailsFilled                     { get; set; }
    public bool   IsAddressDetailsFilled                      { get; set; }
    public bool   IsCategoryAndOtherReservationDetailsFilled  { get; set; }
    public bool   IsQualificationDetailsFilled                { get; set; }
    public bool   IsAppliedForColleges                        { get; set; }
    public bool   IsPhotoAndSignUploaded                      { get; set; }
    public bool   IsSportsDetailsFilled                       { get; set; }
    public bool   IsAllCompulsoryDocumentsUploaded            { get; set; }
    public bool   IsApplicationFeePaid                        { get; set; }
    public bool   IsEligible                                  { get; set; }
    public string ErrorMsg                                    { get; set; } = string.Empty;
    public string FormStatus                                  { get; set; } = string.Empty;
}

// ── Personal (Tables[1]) ────────────────────────────────────────────────────
public class PersonalSummary
{
    public string ApplicationFormNo   { get; set; } = string.Empty;
    public string CandidateName       { get; set; } = string.Empty;
    public string FatherName          { get; set; } = string.Empty;
    public string Gender              { get; set; } = string.Empty;
    public string DOB                 { get; set; } = string.Empty;
    public string Age                 { get; set; } = string.Empty;
    public string MobileNo            { get; set; } = string.Empty;
    public string EMailID             { get; set; } = string.Empty;
    public string MotherPresentName   { get; set; } = string.Empty;
    public string MotherMaidanName    { get; set; } = string.Empty;
    public string FathersOccupation   { get; set; } = string.Empty;
    public string PhotoUploadedURL    { get; set; } = string.Empty;
    public string SignUploadedURL     { get; set; } = string.Empty;
}

// ── Address (Tables[2]) ─────────────────────────────────────────────────────
public class AddressSummary
{
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public string State        { get; set; } = string.Empty;
    public string District     { get; set; } = string.Empty;
    public string Taluka       { get; set; } = string.Empty;
    public string City         { get; set; } = string.Empty;
    public string Pincode      { get; set; } = string.Empty;
}

// ── Category (Tables[3]) ────────────────────────────────────────────────────
public class CategorySummary
{
    public string Category              { get; set; } = string.Empty;
    public string FinalCategory         { get; set; } = string.Empty;
    public string Caste                 { get; set; } = string.Empty;
    public string Domicile              { get; set; } = string.Empty;
    public string DomicileType          { get; set; } = string.Empty;
    public string Religion              { get; set; } = string.Empty;
    public string PreviousCategory      { get; set; } = string.Empty;
    public bool   HasCasteCertificate   { get; set; }
    public bool   HasNCLCertificate     { get; set; }
    public bool   HasCasteValidity      { get; set; }
    public bool   HasEWSCertificate     { get; set; }
    public bool   IsOrphan              { get; set; }
    public bool   IsPWD                 { get; set; }
    public bool   IsExServiceman        { get; set; }
    public bool   IsFreedomFighter      { get; set; }
    public bool   IsProjectAffected     { get; set; }
    public bool   IsIncomeSourceAgriculture { get; set; }
}

// ── Qualification (Tables[4]) ───────────────────────────────────────────────
public class QualificationSummary
{
    public string Faculty             { get; set; } = string.Empty;
    public string SubjectName         { get; set; } = string.Empty;
    public string CollegeName         { get; set; } = string.Empty;
    public string CollegeCity         { get; set; } = string.Empty;
    public string State               { get; set; } = string.Empty;
    public string District            { get; set; } = string.Empty;
    public string QualifyingDegree    { get; set; } = string.Empty;
    public string CGPAScore           { get; set; } = string.Empty;
    public string NoOfYearsToComplete { get; set; } = string.Empty;
    public string AreYouEmployed      { get; set; } = string.Empty;
}

// ── Applied Colleges (Tables[5]) ────────────────────────────────────────────
public class AppliedCollegeRow
{
    public int    PreferenceNo { get; set; }
    public string CollegeCode  { get; set; } = string.Empty;
    public string CollegeName  { get; set; } = string.Empty;
    public string District     { get; set; } = string.Empty;
    public string FacultyName  { get; set; } = string.Empty;
    public string SubjectName  { get; set; } = string.Empty;
}

// ── Research Papers (Tables[10]) ────────────────────────────────────────────
public class ResearchPaperRow
{
    public string PaperTitle         { get; set; } = string.Empty;
    public string NameOfPaper        { get; set; } = string.Empty;
    public string YearOfPublication  { get; set; } = string.Empty;
    public string NAASScore          { get; set; } = string.Empty;
    public string Weightages         { get; set; } = string.Empty;
}

// ── Fee (Tables[8]) ─────────────────────────────────────────────────────────
public class ApplicationFeeRow
{
    public string TransactionID    { get; set; } = string.Empty;
    public string FeeAmount        { get; set; } = string.Empty;
    public string TransactionDate  { get; set; } = string.Empty;
    public string PaymentDate      { get; set; } = string.Empty;
    public string BankReferenceNo  { get; set; } = string.Empty;
    public string Purpose          { get; set; } = string.Empty;
    public string PaidStatus       { get; set; } = string.Empty;
}

// ── Required Documents (Tables[7]) ──────────────────────────────────────────
public class RequiredDocumentRow
{
    public int    DocumentID                     { get; set; }
    public string DocumentName                   { get; set; } = string.Empty;
    public bool   IsDocumentCompulsory           { get; set; }
    public bool   IsDocumentUploaded             { get; set; }
    public string DocumentUploadedURL            { get; set; } = string.Empty;
    public string DocumentVerificationStatus     { get; set; } = string.Empty;
    public string DocumentVerificationComments   { get; set; } = string.Empty;
}

// ── Aggregate response ───────────────────────────────────────────────────────
public class FacultyEligibilityRow
{
    public string FacultyName           { get; set; } = string.Empty;
    public string SubjectName           { get; set; } = string.Empty;
    public string CETScore              { get; set; } = string.Empty;
    public string CET70Per              { get; set; } = string.Empty;
    public string CGPAScore             { get; set; } = string.Empty;
    public string CGPA30Per             { get; set; } = string.Empty;
    public string TotalScore            { get; set; } = string.Empty;
    public string Weightage             { get; set; } = string.Empty;
    public string CappedWeightage       { get; set; } = string.Empty;
    public string TotalProvisionalScore { get; set; } = string.Empty;
    public string Eligible              { get; set; } = string.Empty;
    public string EligibilityDescription { get; set; } = string.Empty;
}

public class ApplicationFormSummaryResponse
{
    public ApplicationStatusSummary  Status              { get; set; } = new();
    public PersonalSummary           Personal             { get; set; } = new();
    public AddressSummary            Address              { get; set; } = new();
    public CategorySummary           Category             { get; set; } = new();
    public QualificationSummary      Qualification        { get; set; } = new();
    public IEnumerable<AppliedCollegeRow>      Colleges           { get; set; } = Enumerable.Empty<AppliedCollegeRow>();
    public IEnumerable<ResearchPaperRow>       ResearchPapers     { get; set; } = Enumerable.Empty<ResearchPaperRow>();
    public IEnumerable<ApplicationFeeRow>      Fees               { get; set; } = Enumerable.Empty<ApplicationFeeRow>();
    public IEnumerable<RequiredDocumentRow>    Documents          { get; set; } = Enumerable.Empty<RequiredDocumentRow>();
    public IEnumerable<FacultyEligibilityRow>  FacultyEligibility { get; set; } = Enumerable.Empty<FacultyEligibilityRow>();
    public bool IsEligible { get; set; }
}

// ── Personal form data ───────────────────────────────────────────────────────
public class PersonalDetailsData
{
    public long   CandidateID        { get; set; }
    public int    AppliedCourseID    { get; set; }
    public int    SaluationID        { get; set; }
    public string CandidateName      { get; set; } = string.Empty;
    public string FatherName         { get; set; } = string.Empty;
    public string GenderCode         { get; set; } = string.Empty;
    public string DOB                { get; set; } = string.Empty;
    public string MobileNo           { get; set; } = string.Empty;
    public string AlternateMobileNo  { get; set; } = string.Empty;
    public string EMailID            { get; set; } = string.Empty;
    public string FathersOccupation  { get; set; } = string.Empty;
    public string MotherMaidanName   { get; set; } = string.Empty;
    public string MotherPresentName  { get; set; } = string.Empty;
}

// ── Address form data ────────────────────────────────────────────────────────
public class AddressDetailsData
{
    public long   CandidateID  { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string AddressLine2 { get; set; } = string.Empty;
    public short  StateID      { get; set; }
    public int    DistrictID   { get; set; }
    public string City         { get; set; } = string.Empty;
    public int    TalukaID     { get; set; }
    public string Taluka       { get; set; } = string.Empty;
    public string Pincode      { get; set; } = string.Empty;
}

// ── Category form data ───────────────────────────────────────────────────────
public class CategoryDetailsData
{
    public long   CandidateID                 { get; set; }
    public string Domicile                    { get; set; } = string.Empty;
    public short  DomicileTypeID              { get; set; }
    public short  ReligionID                  { get; set; }
    public short  CategoryID                  { get; set; }
    public short  FinalCategoryID             { get; set; }
    public short  PreviousCategoryID          { get; set; }
    public string Caste                       { get; set; } = string.Empty;
    public short  HasCasteCertificate         { get; set; }
    public short  HasNCLCertificate           { get; set; }
    public short  HasEWSCertificate           { get; set; }
    public short  HasCasteValidityCertificate { get; set; }
    public short  HasCasteValidityReceipt     { get; set; }
    public short  IsOrphan                    { get; set; }
    public short  IsPWD                       { get; set; }
    public short  IsExServiceman              { get; set; }
    public short  IsFreedomFighter            { get; set; }
    public short  IsProjectAffected           { get; set; }
    public short  IsIncomeSourceAgriculture   { get; set; }
}

// ── Qualification form data ──────────────────────────────────────────────────
public class QualificationDetailsData
{
    public long    CandidateID         { get; set; }
    public string  NameOfCollege       { get; set; } = string.Empty;
    public short   CollegeStateID      { get; set; }
    public int     CollegeDistrictID   { get; set; }
    public int     CollegeTalukaID     { get; set; }
    public string  CollegeTaluka       { get; set; } = string.Empty;
    public string  CollegeCity         { get; set; } = string.Empty;
    public string  CollegePinCode      { get; set; } = string.Empty;
    public short   BachlorDegreeID     { get; set; }
    public decimal CGPA                { get; set; }
    public short   NoOfYearsToComplete { get; set; }
    public short   IsEmployed          { get; set; }
    public short   FacultyID           { get; set; }
    public short   SubjectID           { get; set; }
}
