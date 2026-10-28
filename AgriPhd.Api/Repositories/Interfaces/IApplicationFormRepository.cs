using AgriPhd.Api.Models;

namespace AgriPhd.Api.Repositories.Interfaces;

public interface IApplicationFormRepository
{
    Task<CheckUrlResult> CheckUrlAsync(long candidateId, string userLoginId, string pageCode);
    Task<ApplicationFormSummaryResponse> GetFormSummaryAsync(long candidateId, string userLoginId);
    Task<bool> LockFormAsync(long candidateId, string userLoginId, string ipAddress);
    Task<bool> UnlockFormAsync(long candidateId, string userLoginId, string ipAddress);
    Task SaveWeightageAsync(long candidateId, string userLoginId, string ipAddress);

    Task<PersonalDetailsData?> GetPersonalDetailsAsync(long candidateId, string userLoginId);
    Task<bool> SavePersonalDetailsAsync(PersonalDetailsData data, string userLoginId, string ipAddress);

    Task<AddressDetailsData?> GetAddressDetailsAsync(long candidateId, string userLoginId);
    Task<bool> SaveAddressDetailsAsync(AddressDetailsData data, string userLoginId, string ipAddress);

    Task<CategoryDetailsData?> GetCategoryDetailsAsync(long candidateId, string userLoginId);
    Task<bool> SaveCategoryDetailsAsync(CategoryDetailsData data, string userLoginId, string ipAddress);

    Task<QualificationDetailsData?> GetQualificationDetailsAsync(long candidateId, string userLoginId);
    Task<bool> SaveQualificationDetailsAsync(QualificationDetailsData data, string userLoginId, string ipAddress);

    // Step 5 — Research Papers
    Task<IEnumerable<ResearchPaperRow>> GetResearchPapersAsync(long candidateId, string userLoginId);
    Task<bool> SaveResearchPaperAsync(long candidateId, long naasDetailId, string paperTitle, string nameOfPaper, int yearOfPublication, decimal naasScore, string userLoginId, string ipAddress);
    Task<bool> DeleteResearchPaperAsync(long candidateId, long naasDetailId, string userLoginId);
    Task<bool> SaveNAASParticipationAsync(long candidateId, short isParticipate, string userLoginId, string ipAddress);

    // Step 6 — College Preferences
    Task<IEnumerable<DropdownItem>> GetAvailableOptionsAsync(long candidateId);
    Task<IEnumerable<AppliedCollegeRow>> GetPreferencedOptionsAsync(long candidateId);
    Task<bool> SavePreferenceDetailsAsync(long candidateId, string optionsXml, string userLoginId, string ipAddress);

    // Step 7 — Photo & Sign
    Task<(string photoUrl, string signUrl)> GetPhotoAndSignAsync(long candidateId, string userLoginId);
    Task<bool> SavePhotoAndSignUrlsAsync(long candidateId, string photoUrl, string signUrl, string userLoginId, string ipAddress);

    // Step 8 — Required Documents
    Task<IEnumerable<RequiredDocumentRow>> GetRequiredDocumentsAsync(long candidateId, string userLoginId);
    Task<bool> SaveDocumentUploadAsync(long candidateId, int documentId, string uploadedUrl, string documentNo, string issueDate, string userLoginId, string ipAddress);

    // Step 9 — Application Fee
    Task<ApplicationFeeRow?> GetApplicationFeeDetailsAsync(long candidateId, string userLoginId);
    Task<bool> MarkFeeAsDoneAsync(long candidateId, string userLoginId, string ipAddress);
}
