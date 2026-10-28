import { apiClient } from './client'
import type { AuthUserResponse, LoginResponse, MessageResponse, SecurityQuestionResponse } from '@/types/auth'

export const authApi = {
  login: (data: { loginId: string; password: string; captchaToken?: string }) =>
    apiClient.post<LoginResponse>('/auth/login', data)
      .then(r => r.data)
      .catch(err => {
        // Login endpoint returns 401 with JSON body on bad credentials — extract and return it
        const body = err?.response?.data as LoginResponse | undefined
        if (body && typeof body.success !== 'undefined') return body
        throw err // re-throw only if it's not a credential error
      }),

  logout: () =>
    apiClient.post<MessageResponse>('/auth/logout').then(r => r.data),

  me: () =>
    apiClient.get<AuthUserResponse>('/auth/me').then(r => r.data),

  changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
    apiClient.post<MessageResponse>('/auth/change-password', data).then(r => r.data),

  changeSecurityQuestion: (data: { securityQuestionId: number; securityAnswer: string }) =>
    apiClient.post<MessageResponse>('/auth/change-security-question', data).then(r => r.data),

  resetPassword: (data: { userId: number; loginId?: string; newPassword: string; confirmPassword: string }) =>
    apiClient.post<MessageResponse>('/auth/reset-password', data).then(r => r.data),

  forgotBySecurityQuestion: (data: { loginId: string; securityQuestionId: number; securityAnswer: string }) =>
    apiClient.post<MessageResponse>('/auth/forgot-password/security-question', data).then(r => r.data),

  forgotByOtpLookup: (data: { loginId: string; emailId?: string; mobileNo?: string }) =>
    apiClient.post<MessageResponse>('/auth/forgot-password/otp-lookup', data).then(r => r.data),

  forgotSendMobileOtp: (recipient: string) =>
    apiClient.post<{ success: boolean; message: string; errorMessage?: string }>('/auth/forgot-password/send-mobile-otp', { recipient }).then(r => r.data),

  forgotSendEmailOtp: (recipient: string) =>
    apiClient.post<{ success: boolean; message: string; errorMessage?: string }>('/auth/forgot-password/send-email-otp', { recipient }).then(r => r.data),

  forgotVerifyOtp: (recipient: string, otp: string) =>
    apiClient.post<{ success: boolean; message: string; errorMessage?: string }>('/auth/forgot-password/verify-otp', { recipient, otp }).then(r => r.data),

  getSecurityQuestions: () =>
    apiClient.get<SecurityQuestionResponse[]>('/auth/security-questions').then(r => r.data),

  changeMobile: (data: { newMobileNo: string; otp: string }) =>
    apiClient.post<MessageResponse>('/auth/change-mobile', data).then(r => r.data),

  changeEmail: (data: { newEmailId: string; otp: string }) =>
    apiClient.post<MessageResponse>('/auth/change-email', data).then(r => r.data),
}
