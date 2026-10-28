/** Mirrors AuthUserResponse DTO from AgriPhd.Api */
export interface AuthUserResponse {
  userId: number
  userTypeId: number
  userLoginId: string
  userName: string
  dashboardPath: string
  photoPath: string
  sessionId: number
  isAdmin: boolean
  securityQuestionSet: boolean
}

export interface LoginResponse {
  success: boolean
  errorMessage?: string
  user?: AuthUserResponse
  requiresSecurityQuestion: boolean
}

export interface MessageResponse {
  success: boolean
  message: string
}

export interface SecurityQuestionResponse {
  securityQuestionId: number
  securityQuestionText: string
}
