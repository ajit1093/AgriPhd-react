import { z } from 'zod'

/** FR-AUTH-01: Login ID + Password required. */
export const loginSchema = z.object({
  loginId: z
    .string()
    .min(1, 'Application Form No / Login ID is required.')
    .trim(),
  password: z
    .string()
    .min(1, 'Password is required.'),
})
export type LoginFormValues = z.infer<typeof loginSchema>

/** FR-AUTH-16: Change password — current + new + confirm. */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>

/** FR-AUTH-15: Change security question. */
export const changeSecurityQuestionSchema = z.object({
  securityQuestionId: z
    .number({ required_error: 'Please select a security question.' })
    .min(1, 'Please select a security question.'),
  securityAnswer: z.string().min(1, 'Security answer is required.').trim(),
})
export type ChangeSecurityQuestionFormValues = z.infer<typeof changeSecurityQuestionSchema>

/** FR-AUTH-14: Reset password (forgot flow). */
export const resetPasswordSchema = z
  .object({
    newPassword:     z.string().min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z.string().min(1, 'Please confirm your new password.'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>
