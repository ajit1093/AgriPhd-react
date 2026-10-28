import { describe, it, expect } from 'vitest'
import { loginSchema, changePasswordSchema, changeSecurityQuestionSchema } from '@/schemas/authSchemas'
import { candidateLookupSchema, registerCandidateSchema } from '@/schemas/registrationSchemas'

/**
 * P4-05 — Zod validation schemas: Registration, Login, Change Password,
 *          Security Question, Candidate Lookup
 */

// ── loginSchema ──────────────────────────────────────────────────────────────
describe('loginSchema', () => {
  it('accepts valid login ID and password', () => {
    const result = loginSchema.safeParse({ loginId: '252001005', password: 'Divya@8007' })
    expect(result.success).toBe(true)
  })
  it('rejects empty loginId', () => {
    const result = loginSchema.safeParse({ loginId: '', password: 'password' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.loginId).toBeDefined()
  })
  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ loginId: 'user', password: '' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toBeDefined()
  })
  it('trims loginId whitespace', () => {
    const result = loginSchema.safeParse({ loginId: '  252001005  ', password: 'pass' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.loginId).toBe('252001005')
  })
})

// ── candidateLookupSchema ────────────────────────────────────────────────────
describe('candidateLookupSchema', () => {
  it('accepts valid numeric form no and dob', () => {
    const result = candidateLookupSchema.safeParse({ applicationFormNo: '252001005', dateOfBirth: '2003-10-19' })
    expect(result.success).toBe(true)
  })
  it('rejects non-numeric applicationFormNo', () => {
    const result = candidateLookupSchema.safeParse({ applicationFormNo: 'ABC123', dateOfBirth: '2003-10-19' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.applicationFormNo?.[0]).toMatch(/number/)
  })
  it('rejects empty dateOfBirth', () => {
    const result = candidateLookupSchema.safeParse({ applicationFormNo: '12345', dateOfBirth: '' })
    expect(result.success).toBe(false)
  })
})

// ── registerCandidateSchema ──────────────────────────────────────────────────
describe('registerCandidateSchema', () => {
  const valid = {
    candidateName:      'AJIT BABAR',
    genderCode:         'M',
    mobileNo:           '9356950795',
    emailId:            'ajit@example.com',
    securityQuestionId: 1,
    securityAnswer:     'answer',
    password:           'Pass@123',
    confirmPassword:    'Pass@123',
  }
  it('accepts fully valid registration data', () => {
    expect(registerCandidateSchema.safeParse(valid).success).toBe(true)
  })
  it('rejects invalid mobile (not 10 digits)', () => {
    const result = registerCandidateSchema.safeParse({ ...valid, mobileNo: '12345' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.mobileNo).toBeDefined()
  })
  it('rejects invalid email', () => {
    const result = registerCandidateSchema.safeParse({ ...valid, emailId: 'not-an-email' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.emailId).toBeDefined()
  })
  it('rejects mismatched passwords', () => {
    const result = registerCandidateSchema.safeParse({ ...valid, confirmPassword: 'different' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.confirmPassword?.[0]).toMatch(/do not match/i)
  })
  it('rejects password shorter than 6 chars', () => {
    const result = registerCandidateSchema.safeParse({ ...valid, password: 'ab', confirmPassword: 'ab' })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.password).toBeDefined()
  })
  it('rejects securityQuestionId = 0', () => {
    const result = registerCandidateSchema.safeParse({ ...valid, securityQuestionId: 0 })
    expect(result.success).toBe(false)
  })
  it('lowercases email', () => {
    const result = registerCandidateSchema.safeParse({ ...valid, emailId: 'AJIT@EXAMPLE.COM' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.emailId).toBe('ajit@example.com')
  })
})

// ── changePasswordSchema ─────────────────────────────────────────────────────
describe('changePasswordSchema', () => {
  it('accepts matching passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPass@1', newPassword: 'NewPass@2', confirmPassword: 'NewPass@2',
    })
    expect(result.success).toBe(true)
  })
  it('rejects mismatched new passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old', newPassword: 'new123', confirmPassword: 'different',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.confirmPassword?.[0]).toMatch(/do not match/i)
  })
  it('rejects new password under 6 chars', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old', newPassword: 'abc', confirmPassword: 'abc',
    })
    expect(result.success).toBe(false)
  })
})

// ── changeSecurityQuestionSchema ─────────────────────────────────────────────
describe('changeSecurityQuestionSchema', () => {
  it('accepts valid question id and answer', () => {
    const result = changeSecurityQuestionSchema.safeParse({ securityQuestionId: 3, securityAnswer: 'myAnswer' })
    expect(result.success).toBe(true)
  })
  it('rejects securityQuestionId = 0', () => {
    const result = changeSecurityQuestionSchema.safeParse({ securityQuestionId: 0, securityAnswer: 'ans' })
    expect(result.success).toBe(false)
  })
  it('rejects empty security answer', () => {
    const result = changeSecurityQuestionSchema.safeParse({ securityQuestionId: 1, securityAnswer: '' })
    expect(result.success).toBe(false)
  })
  it('trims security answer whitespace', () => {
    const result = changeSecurityQuestionSchema.safeParse({ securityQuestionId: 1, securityAnswer: '  myAns  ' })
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.securityAnswer).toBe('myAns')
  })
})
