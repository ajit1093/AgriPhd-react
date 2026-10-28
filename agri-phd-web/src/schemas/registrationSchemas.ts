import { z } from 'zod'

/** Step 1 — look up CET record. FR-REG-02. */
export const candidateLookupSchema = z.object({
  applicationFormNo: z
    .string()
    .min(1, 'Application Form No is required.')
    .regex(/^\d+$/, 'Must be a number.'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of Birth is required.'),
})
export type CandidateLookupValues = z.infer<typeof candidateLookupSchema>

/** Step 3 — complete registration form. FR-REG-04, FR-REG-12. */
export const registerCandidateSchema = z
  .object({
    candidateName: z
      .string()
      .min(1, 'Candidate name is required.'),
    genderCode: z
      .string()
      .min(1, 'Please select gender.'),
    mobileNo: z
      .string()
      .regex(/^\d{10}$/, 'Mobile number must be exactly 10 digits.'),
    alternativeMobileNo: z.string().optional(),
    emailId: z
      .string()
      .email('Please enter a valid email address.')
      .toLowerCase(),
    securityQuestionId: z
      .number({ invalid_type_error: 'Please select a security question.' })
      .min(1, 'Please select a security question.'),
    securityAnswer: z
      .string()
      .min(1, 'Security answer is required.'),
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters.'),
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password.'),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type RegisterCandidateValues = z.infer<typeof registerCandidateSchema>
