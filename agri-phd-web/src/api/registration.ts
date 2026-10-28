import { apiClient } from './client'

export interface CandidateLookupResponse {
  found: boolean
  errorMessage?: string
  candidateName: string
  facultyName: string
  applicationFormNo: number
  dob: string
  loginExists: boolean
  mobileNo: string
  emailId: string
  pgSubjectName: string
}

export interface OtpResponse {
  success: boolean
  errorMessage?: string
  message: string
}

export interface RegisterCandidateResponse {
  success: boolean
  errorMessage?: string
  applicationFormNo: string
}

export const registrationApi = {
  isOpen: () =>
    apiClient.get<{ isOpen: boolean }>('/registration/is-open').then(r => r.data),

  lookup: (data: { applicationFormNo: number; dateOfBirth: string }) =>
    apiClient.post<CandidateLookupResponse>('/registration/lookup', data).then(r => r.data),

  sendMobileOtp: (mobileNo: string, purpose = 'VerifyMobileNo') =>
    apiClient.post<OtpResponse>('/registration/send-mobile-otp', { mobileNo, purpose }).then(r => r.data),

  verifyOtp: (recipient: string, purpose: string, otp: string) =>
    apiClient.post<OtpResponse>('/registration/verify-otp', { recipient, purpose, otp }).then(r => r.data),

  register: (data: {
    applicationFormNo: number
    candidateName: string
    genderCode: string
    dateOfBirth: string
    mobileNo: string
    emailId: string
    securityQuestionId: number
    securityAnswer: string
    password: string
    confirmPassword: string
  }) =>
    apiClient.post<RegisterCandidateResponse>('/registration/register', data).then(r => r.data),
}
