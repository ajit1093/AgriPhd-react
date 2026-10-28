using System.Data;
using Dapper;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;
namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Exact SP names and @parameter names from legacy Repository.ApplicationForm.cs,
/// Repository.Personal.cs, Repository.Address.cs, Repository.CategoryAndOtherReservation.cs,
/// Repository.Qualification.cs.
/// </summary>
public class ApplicationFormRepository : IApplicationFormRepository
{
    private readonly IDbConnection _db;
    private readonly ILogger<ApplicationFormRepository>? _logger;
    public ApplicationFormRepository(IDbConnection db, ILogger<ApplicationFormRepository>? logger = null)
    {
        _db = db;
        _logger = logger;
    }

    // ── Wizard navigation ─────────────────────────────────────────────────────

    public async Task<CheckUrlResult> CheckUrlAsync(long candidateId, string userLoginId, string pageCode)
    {
        var p = P(candidateId, userLoginId, pageCode);
        var row = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "ApplicationForm_CheckURL", p, commandType: CommandType.StoredProcedure);
        return new CheckUrlResult
        {
            IsRightURL = row != null && Convert.ToBoolean(row.IsRightUrl ?? false),
            RightURL   = row != null ? S(row.RightUrl) : string.Empty,
        };
    }

    public async Task<ApplicationFormSummaryResponse> GetFormSummaryAsync(
        long candidateId, string userLoginId)
    {
        var p = P(candidateId, userLoginId, "ApplicationFormSummary");

        // SP returns DataSet with 13 tables — use QueryMultipleAsync
        using var multi = await _db.QueryMultipleAsync(
            "ApplicationForm_GetFormSummary", p, commandType: CommandType.StoredProcedure);

        // SP returns 13 result sets — exact table layout from DB inspection:
        // T1  = status flags (IsPersonalDetailsFilled, etc.)
        // T2  = personal details (CandidateName, DOB, MobileNo, ApplicationFormNo, etc.)
        // T3  = address details
        // T4  = category & reservation details
        // T5  = qualification details (Faculty, SubjectName, CollegeName, CGPAScore, etc.)
        // T6  = applied college preferences (PreferenceNo, CollegeCode, CollegeName, etc.)
        // T7  = photo & sign URLs (PhotoUploadedURL, SignUploadedURL)
        // T8  = required documents list (DocumentID, DocumentName, IsUploaded, etc.)
        // T9  = fee payment list (TransactionID, FeeAmount, PaymentDate, BankReferenceNo, etc.)
        // T10 = seat/faculty basic (CandidateID, SeatNo, FacultyName, CETScore) — skip
        // T11 = research papers (PaperTitle, NameOfPaper, YearOfPublication, NAASScore, etc.)
        // T12 = weightage summary (WeightageDescription, Weightage) — skip
        // T13 = faculty eligibility grid (FacultyName, CETScore, CGPA30Per, TotalScore, Eligible, etc.)

        // Read all 13 result sets in strict order — no IsConsumed checks needed
        // since SP always returns exactly 13 tables for any valid candidate.
        // Wrap in try-catch to handle edge cases (candidate with no data yet).
        dynamic? t1 = null; dynamic? t2 = null; dynamic? t3 = null; dynamic? t4 = null;
        dynamic? t5 = null; List<dynamic> t6 = new(); dynamic? t7 = null;
        List<dynamic> t8 = new(); List<dynamic> t9 = new();
        List<dynamic> t11 = new(); List<dynamic> t13 = new();
        try
        {
            t1  = (await multi.ReadAsync<dynamic>()).FirstOrDefault();  // T1 status flags
            t2  = (await multi.ReadAsync<dynamic>()).FirstOrDefault();  // T2 personal
            t3  = (await multi.ReadAsync<dynamic>()).FirstOrDefault();  // T3 address
            t4  = (await multi.ReadAsync<dynamic>()).FirstOrDefault();  // T4 category
            t5  = (await multi.ReadAsync<dynamic>()).FirstOrDefault();  // T5 qualification
            t6  = (await multi.ReadAsync<dynamic>()).ToList();          // T6 colleges
            t7  = (await multi.ReadAsync<dynamic>()).FirstOrDefault();  // T7 photo/sign
            t8  = (await multi.ReadAsync<dynamic>()).ToList();          // T8 documents
            t9  = (await multi.ReadAsync<dynamic>()).ToList();          // T9 fees
            await multi.ReadAsync<dynamic>();                           // T10 skip (seat/faculty)
            t11 = (await multi.ReadAsync<dynamic>()).ToList();          // T11 research papers
            await multi.ReadAsync<dynamic>();                           // T12 skip (weightage)
            t13 = (await multi.ReadAsync<dynamic>()).ToList();          // T13 faculty eligibility
        }
        catch (Exception ex)
        {
            // Log and continue — partial data is better than a 500 error
            _logger?.LogWarning(ex, "GetFormSummaryAsync: partial result set read (candidate may have incomplete data)");
        }

        var researchPapers = t11.Select(r => new ResearchPaperRow
        {
            PaperTitle        = S(r.PaperTitle),
            NameOfPaper       = S(r.NameOfPaper),
            YearOfPublication = S(r.YearOfPublication),
            NAASScore         = S(r.NAASScore),
            Weightages        = S(r.Weightages),
        }).ToList();

        var facultyEligibility = t13.Select(r => new FacultyEligibilityRow
        {
            FacultyName          = S(r.FacultyName),
            CETScore             = S(r.CETScore),
            CET70Per             = S(r.CET70Per),
            CGPAScore            = S(r.CGPAScore),
            CGPA30Per            = S(r.CGPA30Per),
            TotalScore           = S(r.TotalScore),
            Weightage            = S(r.Weightage),
            CappedWeightage      = S(r.CappedWeightage),
            TotalProvisionalScore = S(r.TotalProvisinalScore),
            Eligible             = S(r.Eligible),
            EligibilityDescription = S(r.EligibilityDescription),
            SubjectName          = S(r.SubjectName),
        }).ToList();

        return new ApplicationFormSummaryResponse
        {
            Status = t1 == null ? new() : new ApplicationStatusSummary
            {
                IsPersonalDetailsFilled                    = CB(t1.IsPersonalDetailsFilled),
                IsAddressDetailsFilled                     = CB(t1.IsAddressDetailsFilled),
                IsCategoryAndOtherReservationDetailsFilled = CB(t1.IsCategoryAndOtherReservationDetailsFilled),
                IsQualificationDetailsFilled               = CB(t1.IsQualificationDetailsFilled),
                IsAppliedForColleges                       = CB(t1.IsAppliedForColleges),
                IsPhotoAndSignUploaded                     = CB(t1.IsPhotoAndSignUploaded),
                IsSportsDetailsFilled                      = CB(t1.IsSportsDetailsFilled),
                IsAllCompulsoryDocumentsUploaded           = CB(t1.IsAllCompulsoryDocumentsUploaded),
                IsApplicationFeePaid                       = CB(t1.IsApplicationFeePaid),
                IsEligible                                 = CB(t1.IsEligible),
                ErrorMsg                                   = S(t1.ErrorMsg),
                FormStatus                                 = S(t1.FormStatus),
            },
            Personal = t2 == null ? new() : new PersonalSummary
            {
                ApplicationFormNo  = S(t2.ApplicationFormNo),
                CandidateName      = S(t2.CandidateName),
                FatherName         = S(t2.FatherName),
                Gender             = S(t2.Gender),
                DOB                = S(t2.DOB),
                Age                = S(t2.Age),
                MobileNo           = S(t2.MobileNo),
                EMailID            = S(t2.EMailID),
                MotherPresentName  = S(t2.MotherPresentName),
                MotherMaidanName   = S(t2.MotherMaidanName),
                FathersOccupation  = S(t2.FathersOccupation),
                PhotoUploadedURL   = t7 != null ? S(t7.PhotoUploadedURL) : "",
                SignUploadedURL    = t7 != null ? S(t7.SignUploadedURL)  : "",
            },
            Address = t3 == null ? new() : new AddressSummary
            {
                AddressLine1 = S(t3.AddressLine1), AddressLine2 = S(t3.AddressLine2),
                State = S(t3.State), District = S(t3.District), Taluka = S(t3.Taluka),
                City = S(t3.City), Pincode = S(t3.Pincode),
            },
            Category = t4 == null ? new() : new CategorySummary
            {
                Category           = S(t4.Category),
                FinalCategory      = S(t4.FinalCategory),
                Caste              = S(t4.Caste),
                Domicile           = S(t4.Domicile),
                DomicileType       = S(t4.DomicileType),
                HasCasteCertificate = CB(t4.HasCasteCertificate),
                HasEWSCertificate   = CB(t4.HasEWSCertificate),
                IsOrphan            = CB(t4.IsOrphan),
                IsPWD               = CB(t4.IsPWD),
                IsExServiceman      = CB(t4.IsExServiceman),
                IsIncomeSourceAgriculture = CB(t4.IsIncomeSourceAgriculture),
                HasNCLCertificate   = CB(t4.HasNCLCertificate),
                HasCasteValidity    = CB(t4.HasCasteValidity),
                IsFreedomFighter    = CB(t4.IsFreedomFighter),
                IsProjectAffected   = CB(t4.IsProjectAffected),
                Religion            = S(t4.Religion),
                PreviousCategory    = S(t4.PreviousCategory),
            },
            Qualification = t5 == null ? new() : new QualificationSummary
            {
                Faculty             = S(t5.Faculty),
                SubjectName         = S(t5.SubjectName),
                CollegeName         = S(t5.CollegeName),
                CollegeCity         = S(t5.CollegeCity),
                State               = S(t5.State),
                District            = S(t5.District),
                QualifyingDegree    = S(t5.QualifyingDegree),
                CGPAScore           = S(t5.CGPAScore),
                NoOfYearsToComplete = S(t5.NoOfYearsToComplete),
                AreYouEmployed      = S(t5.AreYouEmployed),
            },
            Colleges = t6.Select(r => new AppliedCollegeRow
            {
                PreferenceNo = Convert.ToInt32(r.PreferenceNo ?? 0),
                CollegeCode  = S(r.CollegeCode),
                CollegeName  = S(r.CollegeName),
                District     = S(r.District),
                FacultyName  = S(r.FacultyName),
                SubjectName  = S(r.SubjectName),
            }),
            Documents = t8.Select(r => new RequiredDocumentRow
            {
                DocumentID                   = Convert.ToInt32(r.DocumentID ?? 0),
                DocumentName                 = S(r.DocumentName),
                IsDocumentCompulsory         = CB(r.IsDocumentCompulsory),
                IsDocumentUploaded           = CB(r.IsDocumentUploaded),
                DocumentUploadedURL          = S(r.DocumentUploadedURL),
                DocumentVerificationStatus   = S(r.DocumentVerificationStatus),
                DocumentVerificationComments = S(r.DocumentVerificationComments),
            }),
            Fees = t9.Select(r => new ApplicationFeeRow
            {
                TransactionID   = S(r.TransactionID),
                FeeAmount       = S(r.FeeAmount),
                TransactionDate = S(r.TransactionDate),
                PaymentDate     = S(r.PaymentDate),
                BankReferenceNo = S(r.BankReferenceNo),
                Purpose         = S(r.Purpose),
                PaidStatus      = S(r.PaidStatus),
            }),
            ResearchPapers      = researchPapers,
            FacultyEligibility  = facultyEligibility,
            IsEligible = t1 != null && CB(t1.IsEligible),
        };
    }

    public async Task<bool> LockFormAsync(long candidateId, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        p.Add("@UserLoginID", userLoginId);
        p.Add("@IPAddress",   ipAddress);
        p.Add("@PageCode",    "ApplicationFormSummary");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_LockForm", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() == "Y";
    }

    public async Task<bool> UnlockFormAsync(long candidateId, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        p.Add("@UserLoginID", userLoginId);
        p.Add("@IPAddress",   ipAddress);
        p.Add("@PageCode",    "ApplicationFormSummary");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_UnlockForm", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() == "Y";
    }

    public async Task SaveWeightageAsync(long candidateId, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        p.Add("@UserLoginID", userLoginId);
        p.Add("@IPAddress",   ipAddress);
        p.Add("@PageCode",    "ApplicationFormSummary");
        p.Add("@WeightageID", 0);   // SP requires this param; pass 0 to auto-resolve
        p.Add("@IsOk",        true, DbType.Boolean, ParameterDirection.InputOutput);
        await _db.ExecuteAsync(
            "ApplicationForm_SaveWeightage", p, commandType: CommandType.StoredProcedure);
    }

    // ── Step 1 Personal ───────────────────────────────────────────────────────

    public async Task<PersonalDetailsData?> GetPersonalDetailsAsync(long candidateId, string userLoginId)
    {
        var p = P(candidateId, userLoginId, "Personal");
        var r = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "ApplicationForm_GetPersonalDetails", p, commandType: CommandType.StoredProcedure);
        if (r == null) return null;
        return new PersonalDetailsData
        {
            CandidateID       = candidateId,
            AppliedCourseID   = Convert.ToInt32(r.AppliedCourseID   ?? 0),
            SaluationID       = Convert.ToInt32(r.SaluationID       ?? 0),
            CandidateName     = S(r.CandidateName),
            FatherName        = S(r.FatherName),
            GenderCode        = S(r.GenderCode),
            DOB               = S(r.DOB),
            MobileNo          = S(r.MobileNo),
            AlternateMobileNo = S(r.AlternateMobile ?? r.AlternateMobileNo),
            EMailID           = S(r.EMailID),
            FathersOccupation = S(r.FathersOccupation),
            MotherMaidanName  = S(r.MotherMaidanName),
            MotherPresentName = S(r.MotherPresentName),
        };
    }

    public async Task<bool> SavePersonalDetailsAsync(
        PersonalDetailsData data, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",      data.CandidateID);
        p.Add("@AppliedCourseID",  data.AppliedCourseID);
        p.Add("@SaluationID",      data.SaluationID);
        p.Add("@CandidateName",    data.CandidateName);
        p.Add("@FatherName",       data.FatherName);
        p.Add("@GenderCode",       data.GenderCode);
        p.Add("@DOB",              data.DOB);
        p.Add("@MobileNo",         data.MobileNo);
        p.Add("@AlternateMobile",  data.AlternateMobileNo);
        p.Add("@EMailID",          data.EMailID);
        p.Add("@FathersOccupation",data.FathersOccupation);
        p.Add("@MotherMaidanName", data.MotherMaidanName);
        p.Add("@MotherPresentName",data.MotherPresentName);
        p.Add("@UserLoginID",      userLoginId);
        p.Add("@IPAddress",        ipAddress);
        p.Add("@PageCode",         "Personal");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SavePersonalDetails", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    // ── Step 2 Address ────────────────────────────────────────────────────────

    public async Task<AddressDetailsData?> GetAddressDetailsAsync(long candidateId, string userLoginId)
    {
        var p = P(candidateId, userLoginId, "Address");
        var r = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "ApplicationForm_GetAddressDetails", p, commandType: CommandType.StoredProcedure);
        if (r == null) return null;
        return new AddressDetailsData
        {
            CandidateID  = candidateId,
            AddressLine1 = S(r.AddressLine1),
            AddressLine2 = S(r.AddressLine2),
            StateID      = Convert.ToInt16(r.StateID    ?? 0),
            DistrictID   = Convert.ToInt32(r.DistrictID ?? 0),
            City         = S(r.City),
            TalukaID     = Convert.ToInt32(r.TalukaID   ?? 0),
            Taluka       = S(r.Taluka),
            Pincode      = S(r.Pincode),
        };
    }

    public async Task<bool> SaveAddressDetailsAsync(
        AddressDetailsData data, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",  data.CandidateID);
        p.Add("@AddressLine1", data.AddressLine1);
        p.Add("@AddressLine2", data.AddressLine2);
        p.Add("@StateID",      data.StateID);
        p.Add("@DistrictID",   data.DistrictID);
        p.Add("@City",         data.City);
        p.Add("@TalukaID",     data.TalukaID);
        p.Add("@Taluka",       data.Taluka);
        p.Add("@Pincode",      data.Pincode);
        p.Add("@UserLoginID",  userLoginId);
        p.Add("@IPAddress",    ipAddress);
        p.Add("@PageCode",     "Address");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SaveAddressDetails", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    // ── Step 3 Category ───────────────────────────────────────────────────────

    public async Task<CategoryDetailsData?> GetCategoryDetailsAsync(long candidateId, string userLoginId)
    {
        var p = P(candidateId, userLoginId, "CategoryAndOtherReservation");
        var r = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "ApplicationForm_GetCategoryAndOtherReservationDetails", p,
            commandType: CommandType.StoredProcedure);
        if (r == null) return null;
        return new CategoryDetailsData
        {
            CandidateID                = candidateId,
            Domicile                   = S(r.Domicile),
            DomicileTypeID             = Convert.ToInt16(r.DomicileTypeID ?? 0),
            ReligionID                 = Convert.ToInt16(r.ReligionID     ?? 0),
            CategoryID                 = Convert.ToInt16(r.CategoryID     ?? 0),
            FinalCategoryID            = Convert.ToInt16(r.FinalCategoryID ?? 0),
            PreviousCategoryID         = Convert.ToInt16(r.PreviousCategoryID ?? 0),
            Caste                      = S(r.Caste),
            HasCasteCertificate        = Convert.ToInt16(r.HasCasteCertificate        ?? 0),
            HasNCLCertificate          = Convert.ToInt16(r.HasNCLCertificate          ?? 0),
            HasEWSCertificate          = Convert.ToInt16(r.HasEWSCertificate          ?? 0),
            HasCasteValidityCertificate= Convert.ToInt16(r.HasCasteValidityCertificate ?? 0),
            HasCasteValidityReceipt    = Convert.ToInt16(r.HasCasteValidityReceipt    ?? 0),
            IsOrphan                   = Convert.ToInt16(r.IsOrphan                   ?? 0),
            IsPWD                      = Convert.ToInt16(r.IsPWD                      ?? 0),
            IsExServiceman             = Convert.ToInt16(r.IsExServiceman             ?? 0),
            IsFreedomFighter           = Convert.ToInt16(r.IsFreedomFighter           ?? 0),
            IsProjectAffected          = Convert.ToInt16(r.IsProjectAffected          ?? 0),
            IsIncomeSourceAgriculture  = Convert.ToInt16(r.IsIncomeSourceAgriculture  ?? 0),
        };
    }

    public async Task<bool> SaveCategoryDetailsAsync(
        CategoryDetailsData data, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",                 data.CandidateID);
        p.Add("@Domicile",                    data.Domicile);
        p.Add("@DomicileType",                data.DomicileTypeID);
        p.Add("@ReligionID",                  data.ReligionID);
        p.Add("@CategoryID",                  data.CategoryID);
        p.Add("@FinalCategoryID",             data.FinalCategoryID);
        p.Add("@Caste",                       data.Caste);
        p.Add("@HasCasteCertificate",         data.HasCasteCertificate);
        p.Add("@HasNCLCertificate",           data.HasNCLCertificate);
        p.Add("@HasEWSCertificate",           data.HasEWSCertificate);
        p.Add("@HasCasteValidityCertificate", data.HasCasteValidityCertificate);
        p.Add("@HasCasteValidityReceipt",     data.HasCasteValidityReceipt);
        p.Add("@IsOrphan",                    data.IsOrphan);
        p.Add("@IsPWD",                       data.IsPWD);
        p.Add("@IsExServiceman",              data.IsExServiceman);
        p.Add("@IsFreedomFighter",            data.IsFreedomFighter);
        p.Add("@IsProjectAffected",           data.IsProjectAffected);
        p.Add("@IsIncomeSourceAgriculture",   data.IsIncomeSourceAgriculture);
        p.Add("@UserLoginID",                 userLoginId);
        p.Add("@IPAddress",                   ipAddress);
        p.Add("@PageCode",                    "CategoryAndOtherReservation");
        p.Add("@PreviousCategoryID",          data.PreviousCategoryID);
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SaveCategoryAndOtherReservationDetails", p,
            commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    // ── Step 4 Qualification ─────────────────────────────────────────────────

    public async Task<QualificationDetailsData?> GetQualificationDetailsAsync(
        long candidateId, string userLoginId)
    {
        var p = P(candidateId, userLoginId, "Qualification");
        var r = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "ApplicationForm_GetQualificationDetails", p, commandType: CommandType.StoredProcedure);
        if (r == null) return null;
        return new QualificationDetailsData
        {
            CandidateID         = candidateId,
            NameOfCollege       = S(r.NameOfCollege   ?? r.CollegeName),
            CollegeStateID      = Convert.ToInt16(r.CollegeStateID    ?? 0),
            CollegeDistrictID   = Convert.ToInt32(r.CollegeDistrictID ?? 0),
            CollegeTalukaID     = Convert.ToInt32(r.CollegeTalukaID   ?? 0),
            CollegeTaluka       = S(r.CollegeTaluka),
            CollegeCity         = S(r.CollegeCity),
            CollegePinCode      = S(r.CollegePinCode  ?? r.CollegePincode),
            BachlorDegreeID     = Convert.ToInt16(r.BachlorDegreeID   ?? 0),
            CGPA                = Convert.ToDecimal(r.CGPA             ?? r.CGPAScore ?? 0m),
            NoOfYearsToComplete = Convert.ToInt16(r.NoOfYearsToComplete ?? 0),
            IsEmployed          = Convert.ToInt16(r.IsEmployed         ?? 0),
            FacultyID           = Convert.ToInt16(r.FacultyID          ?? 0),
            SubjectID           = Convert.ToInt16(r.SubjectID          ?? 0),
        };
    }

    public async Task<bool> SaveQualificationDetailsAsync(
        QualificationDetailsData data, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",          data.CandidateID);
        p.Add("@NameOfCollege",        data.NameOfCollege);
        p.Add("@CollegeStateID",       data.CollegeStateID);
        p.Add("@CollegeDistrictID",    data.CollegeDistrictID);
        p.Add("@CollegeTalukaID",      data.CollegeTalukaID);
        p.Add("@CollegeTaluka",        data.CollegeTaluka);
        p.Add("@CollegeCity",          data.CollegeCity);
        p.Add("@CollegePinCode",       data.CollegePinCode);
        p.Add("@BachlorDegreeID",      data.BachlorDegreeID);
        p.Add("@CGPA",                 data.CGPA);
        p.Add("@NoOfYearsToComplete",  data.NoOfYearsToComplete);
        p.Add("@IsEmployed",           data.IsEmployed);
        p.Add("@FacultyID",            data.FacultyID);
        p.Add("@SubjectID",            data.SubjectID);
        p.Add("@UserLoginID",          userLoginId);
        p.Add("@IPAddress",            ipAddress);
        p.Add("@PageCode",             "Qualification");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SaveQualificationDetails", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static DynamicParameters P(long candidateId, string userLoginId, string pageCode)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",  candidateId);
        p.Add("@UserLoginID",  userLoginId);
        p.Add("@PageCode",     pageCode);
        return p;
    }
    private static string S(object? v) => Convert.ToString(v ?? "") ?? "";
    /// <summary>
    /// Convert to bool — handles SQL bit (0/1), string "True"/"False", and legacy "Y"/"N"/"YES"/"NO" values.
    /// </summary>
    private static bool CB(object? v)
    {
        if (v == null) return false;
        if (v is bool b) return b;
        var s = v.ToString()!.Trim().ToUpperInvariant();
        return s is "1" or "TRUE" or "YES" or "Y";
    }

    // ── Step 5 Research Papers ────────────────────────────────────────────────

    public async Task<IEnumerable<ResearchPaperRow>> GetResearchPapersAsync(long candidateId, string userLoginId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        var rows = await _db.QueryAsync<dynamic>(
            "ApplicationForm_GetNAASDetails", p, commandType: CommandType.StoredProcedure);
        return rows.Select(r => new ResearchPaperRow
        {
            PaperTitle        = S(r.PaperTitle),
            NameOfPaper       = S(r.NameOfPaper),
            YearOfPublication = S(r.YearOfPublication),
            NAASScore         = S(r.NAASScore),
            Weightages        = S(r.Weightages),
        });
    }

    public async Task<bool> SaveResearchPaperAsync(long candidateId, long naasDetailId,
        string paperTitle, string nameOfPaper, int yearOfPublication, decimal naasScore,
        string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",       candidateId);
        p.Add("@NAASDetailID",      naasDetailId);
        p.Add("@PaperTitle",        paperTitle);
        p.Add("@NameOfPaper",       nameOfPaper);
        p.Add("@NAASScore",         naasScore);
        p.Add("@YearOfPublication", yearOfPublication);
        p.Add("@UserLoginID",       userLoginId);
        p.Add("@IPAddress",         ipAddress);
        p.Add("@PageCode",          "ApplicationFormResearchPaper");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SaveNAASDetails", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    public async Task<bool> DeleteResearchPaperAsync(long candidateId, long naasDetailId, string userLoginId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",  candidateId);
        p.Add("@NAASDetailID", naasDetailId);
        p.Add("@UserLoginID",  userLoginId);
        await _db.ExecuteAsync("ApplicationForm_DeleteNAASDetails", p, commandType: CommandType.StoredProcedure);
        return true;
    }

    public async Task<bool> SaveNAASParticipationAsync(long candidateId, short isParticipate,
        string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",           candidateId);
        p.Add("@WheatherParticipatedNAAS", isParticipate);
        p.Add("@UserLoginID",           userLoginId);
        p.Add("@IPAddress",             ipAddress);
        p.Add("@PageCode",              "ApplicationFormResearchPaper");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SaveNAASParticipationDetails", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    // ── Step 6 College Preferences ────────────────────────────────────────────

    public async Task<IEnumerable<DropdownItem>> GetAvailableOptionsAsync(long candidateId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        var rows = await _db.QueryAsync<dynamic>(
            "ApplicationForm_GetAvailableOptionsListAgri", p, commandType: CommandType.StoredProcedure);
        return rows.Select(r =>
        {
            var dict = (IDictionary<string, object>)r;
            var keys = dict.Keys.ToList();
            return new DropdownItem
            {
                Value = Convert.ToString(keys.Count > 0 ? dict[keys[0]] : "") ?? "",
                Text  = Convert.ToString(keys.Count > 1 ? dict[keys[1]] : "") ?? "",
            };
        });
    }

    public async Task<IEnumerable<AppliedCollegeRow>> GetPreferencedOptionsAsync(long candidateId)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        var rows = await _db.QueryAsync<dynamic>(
            "ApplicationForm_GetPreferancedOptionsList", p, commandType: CommandType.StoredProcedure);
        return rows.Select(r => new AppliedCollegeRow
        {
            PreferenceNo = Convert.ToInt32(r.PreferenceNo ?? 0),
            CollegeCode  = S(r.CollegeCode),
            CollegeName  = S(r.CollegeName),
            District     = S(r.District),
            FacultyName  = S(r.FacultyName ?? r.PHDFacultyName),
            SubjectName  = S(r.SubjectName),
        });
    }

    public async Task<bool> SavePreferenceDetailsAsync(long candidateId, string optionsXml,
        string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID", candidateId);
        p.Add("@OptionsXML",  optionsXml);
        p.Add("@UserLoginID", userLoginId);
        p.Add("@IPAddress",   ipAddress);
        p.Add("@PageCode",    "ShortListOptions");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SavePreferenceDetails", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    // ── Step 7 Photo & Sign ───────────────────────────────────────────────────

    public async Task<(string photoUrl, string signUrl)> GetPhotoAndSignAsync(long candidateId, string userLoginId)
    {
        var p = P(candidateId, userLoginId, "UploadPhotoAndSign");
        var r = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "ApplicationForm_GetPhotoAndSignDetails", p, commandType: CommandType.StoredProcedure);
        return (S(r?.PhotoUploadedURL), S(r?.SignUploadedURL));
    }

    public async Task<bool> SavePhotoAndSignUrlsAsync(long candidateId, string photoUrl,
        string signUrl, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",      candidateId);
        p.Add("@PhotoUploadedURL", photoUrl);
        p.Add("@SignUploadedURL",  signUrl);
        p.Add("@UserLoginID",      userLoginId);
        p.Add("@IPAddress",        ipAddress);
        p.Add("@PageCode",         "UploadPhotoAndSign");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SavePhotoAndSignUploadStatus", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    // ── Step 8 Required Documents ─────────────────────────────────────────────

    public async Task<IEnumerable<RequiredDocumentRow>> GetRequiredDocumentsAsync(long candidateId, string userLoginId)
    {
        var p = P(candidateId, userLoginId, "UploadRequiredDocuments");
        var rows = await _db.QueryAsync<dynamic>(
            "ApplicationForm_GetRequiredDocumentsList", p, commandType: CommandType.StoredProcedure);
        return rows.Select(r => new RequiredDocumentRow
        {
            DocumentID                   = Convert.ToInt32(r.DocumentID ?? 0),
            DocumentName                 = S(r.DocumentName),
            IsDocumentCompulsory         = CB(r.IsDocumentCompulsory),
            IsDocumentUploaded           = CB(r.IsDocumentUploaded),
            DocumentUploadedURL          = S(r.DocumentUploadedURL),
            DocumentVerificationStatus   = S(r.DocumentVerificationStatus),
            DocumentVerificationComments = S(r.DocumentVerificationComments),
        });
    }

    public async Task<bool> SaveDocumentUploadAsync(long candidateId, int documentId,
        string uploadedUrl, string documentNo, string issueDate, string userLoginId, string ipAddress)
    {
        var p = new DynamicParameters();
        p.Add("@CandidateID",                     candidateId);
        p.Add("@DocumentID",                      documentId);
        p.Add("@DocumentUploadedURL",             uploadedUrl);
        p.Add("@DocumentNo",                      documentNo);
        p.Add("@DocumentIssueDate",               issueDate);
        p.Add("@DocumentValidityReceiptDistrict", "");
        p.Add("@Action",                          "Save");
        p.Add("@UserLoginID",                     userLoginId);
        p.Add("@IPAddress",                       ipAddress);
        p.Add("@PageCode",                        "UploadRequiredDocuments");
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SaveRequiredDocumentUploadStatus", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }

    // ── Step 9 Application Fee ────────────────────────────────────────────────

    public async Task<ApplicationFeeRow?> GetApplicationFeeDetailsAsync(long candidateId, string userLoginId)
    {
        var p = P(candidateId, userLoginId, "PayApplicationFee");
        var r = await _db.QueryFirstOrDefaultAsync<dynamic>(
            "ApplicationForm_GetApplicationFeeDetails", p, commandType: CommandType.StoredProcedure);
        if (r == null) return null;
        return new ApplicationFeeRow
        {
            FeeAmount    = S(r.FeeToBePaid ?? r.FeeAmount),
            Purpose      = S(r.Purpose),
            PaidStatus   = CB(r.IsApplicationFeePaid ?? r.IsPaid) ? "Paid" : "Pending",
        };
    }

    public async Task<bool> MarkFeeAsDoneAsync(long candidateId, string userLoginId, string ipAddress)
    {
        var p = P(candidateId, userLoginId, "PayApplicationFee");
        p.Add("@IPAddress", ipAddress);
        var r = await _db.ExecuteScalarAsync<string>(
            "ApplicationForm_SaveApplicationFeeDetails", p, commandType: CommandType.StoredProcedure);
        return r?.ToUpperInvariant() != "N";
    }
}
