import { apiClient } from './client'

export interface PhaseItem { value: string; text: string }
export interface AllotmentStatus {
  found: boolean; candidateName?: string; applicationFormNo?: string
  allottedCollege?: string; allottedCollegeCode?: string
  allottedCategory?: string; allottedQuota?: string
  facultyName?: string; subjectName?: string; allotmentPhase?: string
  district?: string; reportingStatus?: string
  isAccepted?: boolean; isRefused?: boolean; refusalReason?: string
  isEligibleToDownload?: boolean; isAllotmentLetterDownloaded?: boolean
  roasterSeqNo?: string; roasterPoint?: string
}

export interface AdmissionSummary {
  found: boolean
  candidateId: number
  phaseId: number
  applicationFormNo: string
  candidateName: string
  fatherName: string
  motherName: string
  gender: string
  dob: string
  emailId: string
  mobileNo: string
  category: string
  isPWD: string
  isOrphan: string
  photoUrl: string
  signUrl: string
  allotmentPhase: string
  allottedCollege: string
  allottedCollegeCode: string
  allottedCollegeId: number
  phdCollegeCode: number
  allottedFaculty: string
  allottedSubject: string
  allottedCategory: string
  allottedQuota: string
  collegeCode: string
  subjectCode: string
  roasterSeqNo: string
  roasterPoint: string
  roasterCategory: string
  allotedGender: string
  collegeAllotedType: string
  candidateHomeUniversity: string
  nodalOfficerName: string
  nodalOfficerMobile: string
  nodalOfficerEmail: string
}

export interface AllotmentLetterData {
  found: boolean
  applicationId: string
  applicationFormNo: string
  candidateName: string
  fatherName: string
  motherName: string
  gender: string
  dob: string
  mobileNo: string
  emailId: string
  category: string
  verifiedCategory: string
  isPWD: string
  isOrphan: string
  photoUrl: string
  signUrl: string
  allotmentPhase: string
  allottedCollege: string
  allottedCollegeDistrict: string
  allottedFaculty: string
  allottedSubject: string
  allottedCategory: string
  allottedQuota: string
  allotmentDate: string
  roasterSeqNo: string
  roasterPoint: string
  roasterCategory: string
  allotedGender: string
  allottedTypeDisplay: string
  admissionSchedule: string
  candidateAdmissionLastDate: string
  nodalOfficerName: string
  nodalOfficerMobile: string
  nodalOfficerEmail: string
  collegeUniversity: string
  candidateHomeUniversity: string
  meritNo: string
  degreeName: string
}

export interface AdmissionLetter {
  found: boolean
  applicationId: string
  applicationFormNo: string
  candidateName: string
  fatherName: string
  motherName: string
  gender: string
  dob: string
  mobileNo: string
  emailId: string
  category: string
  isPWD: string
  isOrphan: string
  photoUrl: string
  signUrl: string
  allotmentPhase: string
  allottedCollege: string
  allottedCollegeDistrict: string
  allottedFaculty: string
  allottedSubject: string
  allottedCategory: string
  allottedQuota: string
  allotmentDate: string
  roasterSeqNo: string
  roasterPoint: string
  roasterCategory: string
  allotedGender: string
  collegeAllottedType: string
  nodalOfficerName: string
  nodalOfficerMobile: string
  nodalOfficerEmail: string
  candidateHomeUniversity: string
  reportingStatus: string
  reportedOn: string
  admissionComments: string
  printedOn: string
}

export const admissionApi = {
  getPhases:          (flag = 'AllotmentDisplay') => apiClient.get<PhaseItem[]>(`/admission/phases?flag=${flag}`).then(r => r.data),
  getCurrentPhase:    () => apiClient.get<{ phaseId: number }>('/admission/current-phase').then(r => r.data),
  getAllotmentStatus:  (phaseId: number) => apiClient.get<AllotmentStatus>(`/admission/allotment-status?phaseId=${phaseId}`).then(r => r.data),
  getAllotmentSummary: () => apiClient.get<object>('/admission/allotment-summary').then(r => r.data),
  getAdmissionSummary:(candidateId: number, phaseId?: number) =>
    apiClient.get<AdmissionSummary>(`/admission/admission-summary/${candidateId}${phaseId ? `?phaseId=${phaseId}` : ''}`).then(r => r.data),
  saveAllotmentResponse: (phaseId: number, choiceCode: string, isAccepted: boolean, isRefused: boolean, refusalReason?: string) =>
    apiClient.post<{ success: boolean }>('/admission/save-allotment-response', { phaseId, choiceCode, isAccepted, isRefused, refusalReason }).then(r => r.data),
  getAllottedStudents: (params: { faculty?: number; subjectId?: number; phaseId?: number; reportStatus?: string }) =>
    apiClient.get<object[]>('/admission/allotted-students', { params }).then(r => r.data),
  confirmAdmission:   (candidateId: number, choiceCode: number, phaseId: number, comments: string) =>
    apiClient.post<{ success: boolean }>('/admission/confirm', { candidateId, choiceCode, phaseId, comments }).then(r => r.data),
  rejectAdmission:    (candidateId: number, choiceCode: number, phaseId: number, comments: string) =>
    apiClient.post<{ success: boolean }>('/admission/reject', { candidateId, choiceCode, phaseId, comments }).then(r => r.data),
  cancelAdmission:    (candidateId: number, choiceCode: number, phaseId: number, comments: string) =>
    apiClient.post<{ success: boolean }>('/admission/cancel', { candidateId, choiceCode, phaseId, comments }).then(r => r.data),
  getAdmissionLetter: (phaseId?: number) =>
    apiClient.get<AdmissionLetter>(`/admission/admission-letter${phaseId ? `?phaseId=${phaseId}` : ''}`).then(r => r.data),
  getAllotmentLetterPhases: () =>
    apiClient.get<{value:string;text:string}[]>('/admission/allotment-letter-phases').then(r => r.data),
  getAllotmentLetterByPhase: (phaseId: number) =>
    apiClient.get<AllotmentLetterData>(`/admission/allotment-letter/${phaseId}`).then(r => r.data),
}
