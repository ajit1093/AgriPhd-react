import { apiClient } from './client'

export interface CheckUrlResult  { isRightURL: boolean; rightURL: string }
export interface SaveResult      { success: boolean; message?: string }

export interface ApplicationFormSummaryResponse {
  status: {
    isPersonalDetailsFilled: boolean
    isAddressDetailsFilled: boolean
    isCategoryAndOtherReservationDetailsFilled: boolean
    isQualificationDetailsFilled: boolean
    isAppliedForColleges: boolean
    isPhotoAndSignUploaded: boolean
    isSportsDetailsFilled: boolean
    isAllCompulsoryDocumentsUploaded: boolean
    isApplicationFeePaid: boolean
    isEligible: boolean
    errorMsg: string
    formStatus: string
  }
  personal: {
    applicationFormNo: string; candidateName: string; fatherName: string
    fathersOccupation: string; motherMaidanName: string; motherPresentName: string
    gender: string; dOB: string; age: string; mobileNo: string; eMailID: string
    photoUploadedURL: string; signUploadedURL: string
  }
  address: { addressLine1: string; addressLine2: string; state: string; district: string; taluka: string; city: string; pincode: string }
  category: {
    category: string; finalCategory: string; caste: string; domicile: string; domicileType: string
    religion: string; previousCategory: string
    hasCasteCertificate: boolean; hasNCLCertificate: boolean; hasCasteValidity: boolean
    hasEWSCertificate: boolean; isOrphan: boolean; isPWD: boolean
    isExServiceman: boolean; isFreedomFighter: boolean; isProjectAffected: boolean
    isIncomeSourceAgriculture: boolean
  }
  qualification: {
    faculty: string; subjectName: string; collegeName: string; collegeCity: string
    state: string; district: string; qualifyingDegree: string; cGPAScore: string
    noOfYearsToComplete: string; areYouEmployed: string
  }
  colleges: { preferenceNo: number; collegeCode: string; collegeName: string; district: string; facultyName: string; subjectName: string }[]
  researchPapers: { paperTitle: string; nameOfPaper: string; yearOfPublication: string; nAASScore: string; weightages: string }[]
  facultyEligibility: {
    facultyName: string; subjectName: string; cETScore: string; cET70Per: string
    cGPAScore: string; cGPA30Per: string; totalScore: string; weightage: string
    cappedWeightage: string; totalProvisionalScore: string; eligible: string; eligibilityDescription: string
  }[]
  fees: {
    transactionID: string; feeAmount: string; transactionDate: string
    paymentDate: string; bankReferenceNo: string; purpose: string; paidStatus: string
  }[]
  documents: {
    documentID: number; documentName: string; isDocumentCompulsory: boolean
    isDocumentUploaded: boolean; documentUploadedURL: string
    documentVerificationStatus: string; documentVerificationComments: string
  }[]
  isEligible: boolean
}

export interface PersonalDetailsData {
  candidateID?: number; appliedCourseID?: number; saluationID?: number
  candidateName?: string; fatherName?: string; genderCode?: string; dOB?: string
  mobileNo?: string; alternateMobileNo?: string; eMailID?: string
  fathersOccupation?: string; motherMaidanName?: string; motherPresentName?: string
}

export interface AddressDetailsData {
  candidateID?: number; addressLine1?: string; addressLine2?: string
  stateID?: number; districtID?: number; city?: string
  talukaID?: number; taluka?: string; pincode?: string
}

export interface CategoryDetailsData {
  candidateID?: number; domicile?: string; domicileTypeID?: number; religionID?: number
  categoryID?: number; finalCategoryID?: number; previousCategoryID?: number; caste?: string
  hasCasteCertificate?: number; hasNCLCertificate?: number; hasEWSCertificate?: number
  hasCasteValidityCertificate?: number; hasCasteValidityReceipt?: number
  isOrphan?: number; isPWD?: number; isExServiceman?: number
  isFreedomFighter?: number; isProjectAffected?: number; isIncomeSourceAgriculture?: number
}

export interface QualificationDetailsData {
  candidateID?: number; nameOfCollege?: string; collegeStateID?: number
  collegeDistrictID?: number; collegeTalukaID?: number; collegeTaluka?: string
  collegeCity?: string; collegePinCode?: string; bachlorDegreeID?: number
  cGPA?: number; noOfYearsToComplete?: number; isEmployed?: number
  facultyID?: number; subjectID?: number
}

export const appFormApi = {
  checkUrl:        (pageCode: string)        => apiClient.get<CheckUrlResult>(`/application-form/check-url?pageCode=${pageCode}`).then(r => r.data),
  getSummary:      ()                        => apiClient.get<ApplicationFormSummaryResponse>('/application-form/summary').then(r => r.data),
  lock:            ()                        => apiClient.post<SaveResult>('/application-form/lock').then(r => r.data),
  unlock:          ()                        => apiClient.post<SaveResult>('/application-form/unlock').then(r => r.data),
  getPersonal:     ()                        => apiClient.get<PersonalDetailsData>('/application-form/personal').then(r => r.data),
  savePersonal:    (d: PersonalDetailsData)  => apiClient.post<SaveResult>('/application-form/personal', d).then(r => r.data),
  getAddress:      ()                        => apiClient.get<AddressDetailsData>('/application-form/address').then(r => r.data),
  saveAddress:     (d: AddressDetailsData)   => apiClient.post<SaveResult>('/application-form/address', d).then(r => r.data),
  getCategory:     ()                        => apiClient.get<CategoryDetailsData>('/application-form/category').then(r => r.data),
  saveCategory:    (d: CategoryDetailsData)  => apiClient.post<SaveResult>('/application-form/category', d).then(r => r.data),
  getQualification:()                        => apiClient.get<QualificationDetailsData>('/application-form/qualification').then(r => r.data),
  saveQualification:(d: QualificationDetailsData) => apiClient.post<SaveResult>('/application-form/qualification', d).then(r => r.data),

  // Step 5 — Research Papers
  getResearchPapers: ()  => apiClient.get<ResearchPaperApiRow[]>('/application-form/research-paper').then(r => r.data),
  saveResearchPaper: (d: { naasDetailId: number; paperTitle: string; nameOfPaper: string; yearOfPublication: number; naasScore: number }) =>
    apiClient.post<SaveResult>('/application-form/research-paper', d).then(r => r.data),
  deleteResearchPaper: (naasDetailId: number) =>
    apiClient.delete<SaveResult>(`/application-form/research-paper/${naasDetailId}`).then(r => r.data),
  saveWeightage: () => apiClient.post<SaveResult>('/application-form/lock').then(r => r.data), // triggers weightage on summary load

  // Step 6 — College Preferences
  getAvailableColleges: () => apiClient.get<{ value: string; text: string }[]>('/application-form/available-colleges').then(r => r.data),
  getPreferences:       () => apiClient.get<PreferenceRow[]>('/application-form/preferences').then(r => r.data),
  savePreferences: (optionsXml: string) => apiClient.post<SaveResult>('/application-form/preferences', { optionsXml }).then(r => r.data),

  // Step 7 — Photo & Sign
  getPhotoSign: () => apiClient.get<{ photoUrl: string; signUrl: string }>('/application-form/photo-sign').then(r => r.data),
  savePhotoSign: (photoUrl: string, signUrl: string) =>
    apiClient.post<SaveResult>('/application-form/save-photo-sign', { photoUrl, signUrl }).then(r => r.data),

  // Step 8 — Required Documents
  getRequiredDocuments: () => apiClient.get<RequiredDocumentApiRow[]>('/application-form/required-documents').then(r => r.data),
  saveDocument: (documentId: number, uploadedUrl: string, documentNo: string, issueDate: string) =>
    apiClient.post<SaveResult>(`/application-form/documents/${documentId}`, { uploadedUrl, documentNo, issueDate }).then(r => r.data),

  // Step 9 — Application Fee
  getApplicationFeeDetails: () => apiClient.get<FeeDetailsApiRow>('/application-form/application-fee-details').then(r => r.data),
  markFeeDone: () => apiClient.post<SaveResult>('/application-form/mark-fee-done').then(r => r.data),
}

export interface ResearchPaperApiRow { paperTitle: string; nameOfPaper: string; yearOfPublication: string; nAASScore: string; weightages: string }
export interface PreferenceRow { preferenceNo: number; collegeCode: string; collegeName: string; district: string; facultyName: string; subjectName: string }
export interface RequiredDocumentApiRow { documentID: number; documentName: string; isDocumentCompulsory: boolean; isDocumentUploaded: boolean; documentUploadedURL: string; documentVerificationStatus: string; documentVerificationComments: string }
export interface FeeDetailsApiRow { feeAmount: string; purpose: string; paidStatus: string }
