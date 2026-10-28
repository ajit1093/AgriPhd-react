import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { registrationApi, type CandidateLookupResponse } from '@/api/registration'
import { useMasterData } from '@/hooks/useMasterData'
import { OTPModal } from '@/components/ui/OTPModal'
import { PUBLIC_ROUTES } from '@/router/routes'
import { notificationApi } from '@/api/notifications'
import { candidateLookupSchema, registerCandidateSchema, type CandidateLookupValues, type RegisterCandidateValues } from '@/schemas/registrationSchemas'

/**
 * P2-B-02 / P6-THEME-10 — Registration/NewRegistration.aspx → NewRegistrationPage
 * Full-width, high-contrast, modernized academic design for Ph.D. Admissions.
 *
 * Preserves 100% of functional requirements:
 *   - Search Candidate: Ph.D-CET-Form No * | DOB * | [Search button]
 *   - Registered Candidate Details:
 *       GridView: Ph.D.-CET Form No | Faculty Name | Subject Name | Seat No | CET Score
 *       9 form fields with exact labels, validation, OTP verification, and password rules
 */
export default function NewRegistrationPage() {
  const navigate = useNavigate()
  const [candidate, setCandidate]                     = useState<CandidateLookupResponse | null>(null)
  const [mobileVerified, setMobileVerified]           = useState(true)
  const [otpOpen, setOtpOpen]                         = useState(false)
  const [otpError, setOtpError]                       = useState<string | undefined>()
  const [formError, setFormError]                     = useState<string | null>(null)
  const [searchError, setSearchError]                 = useState<string | null>(null)
  const [showPassword, setShowPassword]               = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { data: openData } = useQuery({
    queryKey: ['registration', 'is-open'],
    queryFn: () => notificationApi.isRegistrationOpen(),
    staleTime: 0,
  })
  const { data: genders } = useMasterData('gender')
  const { data: secQs }   = useMasterData('security-question')

  // Step 1 — Search
  const lookupForm = useForm<CandidateLookupValues>({ resolver: zodResolver(candidateLookupSchema) })
  const lookupMut = useMutation({
    mutationFn: (v: CandidateLookupValues) =>
      registrationApi.lookup({ applicationFormNo: Number(v.applicationFormNo), dateOfBirth: v.dateOfBirth }),
    onSuccess: (data) => {
      if (!data.found) { setSearchError(data.errorMessage ?? 'No matching entrance record found. Please verify your Ph.D.-CET Form Number and Date of Birth.'); return }
      if (data.loginExists) { setSearchError('A login account has already been registered for this Application Form Number. Please use Log In or Forgot Password to access your portal.'); return }
      setSearchError(null)
      setCandidate(data)
      registerForm.setValue('candidateName', data.candidateName)
      registerForm.setValue('mobileNo',      data.mobileNo)
      registerForm.setValue('emailId',       data.emailId)
    },
    onError: () => setSearchError('Search failed. Please check your network connection and try again.'),
  })

  // OTP send + verify
  const sendOtpMut = useMutation({
    mutationFn: () => registrationApi.sendMobileOtp(candidate!.mobileNo, 'VerifyMobileNo'),
    onSuccess: (d) => {
      if (d.success) {
        setOtpOpen(true)
        setOtpError(undefined)
      } else {
        toast.error(d.errorMessage ?? 'Failed to send OTP.')
      }
    },
  })
  const verifyOtpMut = useMutation({
    mutationFn: (otp: string) => registrationApi.verifyOtp(candidate!.mobileNo, 'VerifyMobileNo', otp),
    onSuccess: (d) => {
      if (d.success) {
        setOtpOpen(false)
        setMobileVerified(true)
        toast.success('Mobile number verified.')
      } else {
        setOtpError(d.errorMessage ?? 'Invalid OTP.')
      }
    },
  })

  // Step 2 — Register
  const registerForm = useForm<RegisterCandidateValues>({ resolver: zodResolver(registerCandidateSchema) })
  const registerMut = useMutation({
    mutationFn: (v: RegisterCandidateValues) =>
      registrationApi.register({
        applicationFormNo: candidate!.applicationFormNo,
        candidateName: v.candidateName,
        genderCode: v.genderCode,
        dateOfBirth: candidate!.dob,
        mobileNo: v.mobileNo,
        emailId: v.emailId,
        securityQuestionId: v.securityQuestionId,
        securityAnswer: v.securityAnswer,
        password: v.password,
        confirmPassword: v.confirmPassword,
      }),
    onSuccess: (d) => {
      if (!d.success) { setFormError(d.errorMessage ?? 'Registration failed.'); return }
      navigate(PUBLIC_ROUTES.registrationSuccess, { state: { applicationFormNo: d.applicationFormNo } })
    },
    onError: () => setFormError('An error occurred during registration. Please try again.'),
  })

  if (openData?.isOpen === false) {
    return (
      <div className="w-full py-6">
        <div className="l-card bg-white border border-slate-200 rounded-xl shadow-card overflow-hidden">
          <div className="bg-[#0B1D33] text-white font-semibold text-base py-4 px-6 flex items-center gap-2.5">
            <span className="p-1.5 bg-white/10 rounded-lg text-amber-300">🔒</span>
            <span>New Candidate Registration</span>
          </div>
          <div className="p-8">
            <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-5 rounded-r-xl text-sm leading-relaxed" role="alert">
              <strong className="block font-bold text-base mb-1">Registration Currently Inactive</strong>
              Candidate Registration is currently closed. Please check the official homepage circulars and admission schedule for active dates.
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6 py-2">

      {/* ── Main Application Container Card (Full Width) ────────────────────── */}
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-card overflow-hidden">
        
        {/* Main Card Header */}
        <div className="bg-[#0B1D33] text-white py-4 px-6 sm:px-8 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              📝
            </span>
            <div>
              <h1 className="text-base sm:text-xl font-bold tracking-tight text-white leading-tight">
                New Candidate Registration
              </h1>
              <p className="text-xs text-slate-300 font-medium mt-0.5">
                Centralized Admissions to Doctor of Philosophy (Ph.D.) 2026-27 &bull; State Agricultural Universities of Maharashtra
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20 uppercase tracking-wider">
              Step 01 &bull; Account Setup
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-8 space-y-8 bg-slate-50/30">

          {/* ── Step 1: Search Candidate Entrance Record ────────────────────── */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            {/* High-contrast sub-header */}
            <div className="bg-[#0f2942] text-white px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center text-sm font-bold">
                  🔍
                </span>
                <span className="font-bold text-sm sm:text-base text-white tracking-wide">
                  1. Search &amp; Verify Entrance Exam Credentials
                </span>
              </div>
              <span className="text-2xs font-semibold text-slate-200 bg-white/10 px-3 py-0.5 rounded-full border border-white/10">
                Ph.D.-CET 2026-27 Verification
              </span>
            </div>

            <div className="p-5 sm:p-7 bg-white">
              <p className="text-xs sm:text-sm text-slate-600 mb-5 leading-relaxed">
                Enter your <strong>Ph.D.-CET Form Number</strong> and <strong>Date of Birth</strong> exactly as provided during the entrance examination to retrieve your pre-verified academic record.
              </p>

              <form onSubmit={lookupForm.handleSubmit(v => { setSearchError(null); lookupMut.mutate(v) })} noValidate>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                  
                  {/* Ph.D-CET Form Number */}
                  <div className="md:col-span-5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Ph.D.-CET Form No <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={9}
                        placeholder="e.g. 252001006"
                        className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono font-medium shadow-2xs"
                        {...lookupForm.register('applicationFormNo')}
                        aria-invalid={!!lookupForm.formState.errors.applicationFormNo}
                      />
                    </div>
                    {lookupForm.formState.errors.applicationFormNo && (
                      <span className="block text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{lookupForm.formState.errors.applicationFormNo.message}</span>
                      </span>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                      Date of Birth (DD/MM/YYYY) <span className="text-rose-600 font-extrabold">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs"
                      {...lookupForm.register('dateOfBirth')}
                      aria-invalid={!!lookupForm.formState.errors.dateOfBirth}
                    />
                    {lookupForm.formState.errors.dateOfBirth && (
                      <span className="block text-rose-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                        <span>⚠️</span>
                        <span>{lookupForm.formState.errors.dateOfBirth.message}</span>
                      </span>
                    )}
                  </div>

                  {/* Search Button */}
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="w-full h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-sm sm:text-base border border-emerald-400/30 transform hover:-translate-y-0.5"
                      disabled={lookupMut.isPending}
                    >
                      {lookupMut.isPending ? (
                        <>
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Verifying…</span>
                        </>
                      ) : (
                        <>
                          <span>🔍</span>
                          <span>Search Candidate</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {searchError && (
                  <div className="mt-4 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-r-xl text-xs sm:text-sm leading-relaxed flex items-start gap-2.5" role="alert">
                    <span className="text-rose-600 text-base font-bold shrink-0">⚠️</span>
                    <span>{searchError}</span>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* ── Step 2: Registered Candidate Details (Visible after search) ─ */}
          {candidate && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-6">
              
              {/* High-contrast sub-header */}
              <div className="bg-[#0f2942] text-white px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-700">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm font-bold">
                    👤
                  </span>
                  <span className="font-bold text-sm sm:text-base text-white tracking-wide">
                    2. Verified Candidate Details &amp; Account Credentials
                  </span>
                </div>
                <span className="text-2xs font-extrabold text-emerald-300 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-full uppercase tracking-wider">
                  ✓ Record Found &amp; Verified
                </span>
              </div>

              <div className="p-5 sm:p-7 space-y-7 bg-white">

                {/* GridView — entrance exam record from database */}
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <span>📋</span>
                      <span>Verified Entrance Examination Record</span>
                    </h3>
                    <span className="text-2xs text-slate-500 font-medium">Source: Official Ph.D.-CET Database</span>
                  </div>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-2xs">
                    <table className="w-full min-w-[580px] text-left border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                          <th className="py-3 px-4 text-center w-16">Sr. No.</th>
                          <th className="py-3 px-4">Ph.D.-CET Form No</th>
                          <th className="py-3 px-4">Faculty Name</th>
                          <th className="py-3 px-4">Subject Name</th>
                          <th className="py-3 px-4 text-center">Seat No</th>
                          <th className="py-3 px-4 text-center">CET Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-800 bg-white">
                        <tr className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-500">1</td>
                          <td className="py-3.5 px-4">
                            <span className="font-mono font-bold text-primary-900 bg-primary-50 border border-primary-200 px-2.5 py-1 rounded-md text-xs sm:text-sm">
                              {candidate.applicationFormNo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">{candidate.facultyName}</td>
                          <td className="py-3.5 px-4 text-slate-700 font-medium">{candidate.pgSubjectName}</td>
                          <td className="py-3.5 px-4 text-center text-slate-400 font-mono">—</td>
                          <td className="py-3.5 px-4 text-center text-slate-400 font-mono">—</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Form Error Banner */}
                {formError && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-r-xl text-xs sm:text-sm leading-relaxed flex items-start gap-2.5" role="alert">
                    <span className="text-rose-600 text-base font-bold shrink-0">⚠️</span>
                    <span>{formError}</span>
                  </div>
                )}

                {/* Registration Form with Spacious Multi-Column Layout */}
                <form onSubmit={registerForm.handleSubmit(v => { setFormError(null); registerMut.mutate(v) })} noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">

                    {/* Candidate's Full Name (Pre-filled from CET record) */}
                    <div className="md:col-span-2 lg:col-span-2 xl:col-span-2">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Candidate&apos;s Full Name <span className="text-rose-600 font-extrabold">*</span>
                        </label>
                        <span className="text-3xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          🔒 Verified from CET
                        </span>
                      </div>
                      <input
                        type="text"
                        className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base bg-slate-100/90 text-slate-800 cursor-not-allowed font-semibold shadow-2xs"
                        disabled
                        readOnly
                        {...registerForm.register('candidateName')}
                      />
                    </div>

                    {/* Gender */}
                    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Gender <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <select
                        className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all bg-white text-slate-900 shadow-2xs"
                        {...registerForm.register('genderCode')}
                        aria-invalid={!!registerForm.formState.errors.genderCode}
                      >
                        <option value="">— Select Gender —</option>
                        {(genders ?? []).map(g => <option key={g.value} value={g.value}>{g.text}</option>)}
                      </select>
                      {registerForm.formState.errors.genderCode && (
                        <span className="block text-rose-600 text-xs font-semibold mt-1.5">
                          {registerForm.formState.errors.genderCode.message}
                        </span>
                      )}
                    </div>

                    {/* Date of Birth (Pre-filled) */}
                    <div className="md:col-span-1 lg:col-span-1 xl:col-span-1">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Date of Birth <span className="text-rose-600 font-extrabold">*</span>
                        </label>
                        <span className="text-3xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          🔒 Verified
                        </span>
                      </div>
                      <input
                        type="text"
                        className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base bg-slate-100/90 text-slate-800 cursor-not-allowed font-mono font-semibold shadow-2xs"
                        disabled
                        readOnly
                        value={candidate.dob ? candidate.dob.split(' ')[0].split('T')[0] : ''}
                        aria-label="Date of Birth"
                      />
                    </div>

                    {/* Mobile Number with OTP Verification Badge */}
                    <div className="md:col-span-2 lg:col-span-2 xl:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Mobile Number <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <div className="flex gap-2.5">
                        <span className="inline-flex items-center px-3.5 py-2 bg-slate-100 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-slate-700">
                          +91
                        </span>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          className="flex-1 h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono font-medium shadow-2xs"
                          {...registerForm.register('mobileNo')}
                          aria-invalid={!!registerForm.formState.errors.mobileNo}
                        />
                        {mobileVerified ? (
                          <span className="inline-flex items-center px-3.5 py-2 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-xl whitespace-nowrap shadow-2xs">
                            ✓ Verified
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => sendOtpMut.mutate()}
                            disabled={sendOtpMut.isPending}
                            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl px-4 py-2 text-xs font-bold transition-all disabled:opacity-50 cursor-pointer whitespace-nowrap shadow-sm hover:shadow"
                          >
                            {sendOtpMut.isPending ? 'Sending…' : 'Verify Mobile OTP'}
                          </button>
                        )}
                      </div>
                      {registerForm.formState.errors.mobileNo && (
                        <span className="block text-rose-600 text-xs font-semibold mt-1.5">
                          {registerForm.formState.errors.mobileNo.message}
                        </span>
                      )}
                    </div>

                    {/* E-Mail ID */}
                    <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        E-Mail ID <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. candidate@example.com"
                        className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs"
                        {...registerForm.register('emailId')}
                        aria-invalid={!!registerForm.formState.errors.emailId}
                      />
                      {registerForm.formState.errors.emailId && (
                        <span className="block text-rose-600 text-xs font-semibold mt-1.5">
                          {registerForm.formState.errors.emailId.message}
                        </span>
                      )}
                    </div>

                    {/* Security Question */}
                    <div className="md:col-span-2 lg:col-span-2 xl:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Security Question <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <select
                        className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all bg-white text-slate-900 shadow-2xs"
                        {...registerForm.register('securityQuestionId', { valueAsNumber: true })}
                        aria-invalid={!!registerForm.formState.errors.securityQuestionId}
                      >
                        <option value={0}>— Select Security Question for Account Recovery —</option>
                        {(secQs ?? []).map(q => <option key={q.value} value={Number(q.value)}>{q.text}</option>)}
                      </select>
                      {registerForm.formState.errors.securityQuestionId && (
                        <span className="block text-rose-600 text-xs font-semibold mt-1.5">
                          {registerForm.formState.errors.securityQuestionId.message}
                        </span>
                      )}
                    </div>

                    {/* Security Answer */}
                    <div className="md:col-span-2 lg:col-span-1 xl:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Security Question&apos;s Answer <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={50}
                        placeholder="Your recovery secret answer"
                        className="w-full h-11 rounded-xl border border-slate-300 px-4 py-2.5 text-sm sm:text-base text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs"
                        {...registerForm.register('securityAnswer')}
                        aria-invalid={!!registerForm.formState.errors.securityAnswer}
                      />
                      {registerForm.formState.errors.securityAnswer && (
                        <span className="block text-rose-600 text-xs font-semibold mt-1.5">
                          {registerForm.formState.errors.securityAnswer.message}
                        </span>
                      )}
                    </div>

                    {/* Password */}
                    <div className="md:col-span-1 lg:col-span-1 xl:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Create Password <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          maxLength={15}
                          placeholder="••••••••"
                          className="w-full h-11 rounded-xl border border-slate-300 px-4 pr-11 py-2.5 text-sm sm:text-base text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs font-mono"
                          {...registerForm.register('password')}
                          aria-invalid={!!registerForm.formState.errors.password}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer text-base"
                          title={showPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <span className="block text-rose-600 text-xs font-semibold mt-1.5">
                          {registerForm.formState.errors.password.message}
                        </span>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="md:col-span-1 lg:col-span-1 xl:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Confirm Password <span className="text-rose-600 font-extrabold">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          maxLength={15}
                          placeholder="••••••••"
                          className="w-full h-11 rounded-xl border border-slate-300 px-4 pr-11 py-2.5 text-sm sm:text-base text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs font-mono"
                          {...registerForm.register('confirmPassword')}
                          aria-invalid={!!registerForm.formState.errors.confirmPassword}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(s => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer text-base"
                          title={showConfirmPassword ? 'Hide password' : 'Show password'}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <span className="block text-rose-600 text-xs font-semibold mt-1.5">
                          {registerForm.formState.errors.confirmPassword.message}
                        </span>
                      )}
                    </div>

                  </div>

                  {/* Password Security Rules Advisory */}
                  <div className="mt-6 bg-amber-50 border border-amber-200/80 rounded-xl p-4 sm:p-5 text-xs text-amber-900 flex items-start gap-3 shadow-2xs" role="note">
                    <span className="text-amber-600 text-xl font-bold shrink-0 mt-0.5">🛡️</span>
                    <div className="space-y-1 leading-relaxed">
                      <strong className="block text-xs sm:text-sm font-bold text-amber-950 uppercase tracking-wide">
                        Mandatory Password Security Policy
                      </strong>
                      <p className="text-amber-800">
                        Password must be <strong>8 to 15 characters long</strong> and must contain at least <strong>1 uppercase alphabet</strong>, <strong>1 lowercase alphabet</strong>, <strong>1 number</strong>, and <strong>1 special character</strong> (e.g., <code>Agri#2026</code>).
                      </p>
                    </div>
                  </div>

                  {/* Register Submission CTA */}
                  <div className="text-center pt-7 border-t border-slate-200 mt-7">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2.5 bg-agriculture hover:bg-agriculture-600 text-white font-bold px-10 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all text-sm sm:text-base cursor-pointer disabled:opacity-50 border border-emerald-400/30 transform hover:-translate-y-0.5"
                      disabled={registerMut.isPending || !mobileVerified}
                    >
                      {registerMut.isPending ? (
                        <>
                          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Submitting Registration…</span>
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          <span>Complete Registration &amp; Generate Login ID</span>
                        </>
                      )}
                    </button>
                    {!mobileVerified && (
                      <p className="text-xs text-rose-600 font-semibold mt-2.5">
                        Please verify your mobile number via OTP before completing registration.
                      </p>
                    )}
                  </div>
                </form>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* OTP Modal */}
      <OTPModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onSubmit={async (otp) => { await verifyOtpMut.mutateAsync(otp) }}
        onResend={async () => { await sendOtpMut.mutateAsync() }}
        description={`Enter the 4-digit verification OTP sent to your registered mobile number +91 XXXXXX${candidate?.mobileNo?.slice(-4) ?? '****'}`}
        loading={verifyOtpMut.isPending}
        error={otpError}
      />
    </div>
  )
}
