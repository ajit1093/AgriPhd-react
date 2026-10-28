import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { registrationApi } from '@/api/registration'
import { OTPModal } from '@/components/ui/OTPModal'

/**
 * P2-E-03 / P6-THEME-12 — Candidate/ChangeMobileEMail.aspx
 * Modernized academic card for updating candidate mobile number or email ID with OTP verification.
 */
const mobileSchema = z.object({
  newMobileNo: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit mobile number without +91 or 0.'),
})
const emailSchema = z.object({
  newEmailId: z.string().email('Enter a valid email address.').toLowerCase(),
})

type MobileFormValues = z.infer<typeof mobileSchema>
type EmailFormValues = z.infer<typeof emailSchema>

export default function ChangeMobileEmailPage() {
  const [activeTab, setActiveTab]   = useState<'mobile' | 'email'>('mobile')
  const [otpOpen, setOtpOpen]       = useState(false)
  const [otpError, setOtpError]     = useState<string | undefined>()
  const [pendingMobile, setPendingMobile] = useState('')
  const [pendingEmail,  setPendingEmail]  = useState('')

  // Mobile form
  const mobileForm = useForm<MobileFormValues>({ resolver: zodResolver(mobileSchema) })
  const sendMobileOtp = useMutation({
    mutationFn: (v: MobileFormValues) => registrationApi.sendMobileOtp(v.newMobileNo, 'ChangeMobile'),
    onSuccess: (r, v) => {
      if (r.success) {
        setPendingMobile(v.newMobileNo)
        setOtpOpen(true)
        setOtpError(undefined)
      } else {
        toast.error(r.errorMessage ?? 'Failed to send verification OTP.')
      }
    },
    onError: () => toast.error('Error sending OTP. Please try again.'),
  })

  const saveMobile = useMutation({
    mutationFn: (otp: string) => authApi.changeMobile({ newMobileNo: pendingMobile, otp }),
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Mobile number updated successfully.')
        setOtpOpen(false)
        mobileForm.reset()
      } else {
        setOtpError(r.message ?? 'Invalid OTP.')
      }
    },
  })

  // Email form
  const emailForm = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema) })
  const sendEmailOtp = useMutation({
    mutationFn: (v: EmailFormValues) => registrationApi.sendMobileOtp(v.newEmailId, 'ChangeEmail'),
    onSuccess: (r, v) => {
      if (r.success) {
        setPendingEmail(v.newEmailId)
        setOtpOpen(true)
        setOtpError(undefined)
      } else {
        toast.error(r.errorMessage ?? 'Failed to send verification OTP.')
      }
    },
    onError: () => toast.error('Error sending OTP. Please try again.'),
  })

  const saveEmail = useMutation({
    mutationFn: (otp: string) => authApi.changeEmail({ newEmailId: pendingEmail, otp }),
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Email address updated successfully.')
        setOtpOpen(false)
        emailForm.reset()
      } else {
        setOtpError(r.message ?? 'Invalid OTP.')
      }
    },
  })

  return (
    <div className="w-full max-w-xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              📱
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Update Contact Information
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Change your registered mobile phone or academic email
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            OTP Verified
          </span>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('mobile')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'mobile'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <span>📱</span>
            <span>Update Mobile Number</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('email')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'email'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <span>✉️</span>
            <span>Update E-Mail ID</span>
          </button>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 bg-white">
          {/* Mobile tab */}
          {activeTab === 'mobile' && (
            <form onSubmit={mobileForm.handleSubmit(v => sendMobileOtp.mutate(v))} noValidate className="space-y-5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your new 10-digit mobile number. An instant SMS OTP verification code will be dispatched to confirm ownership.
              </p>

              <div>
                <label htmlFor="new-mobile-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Mobile Number <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <div className="relative flex rounded-xl shadow-2xs">
                  <span className="inline-flex items-center px-3.5 rounded-l-xl border border-r-0 border-slate-300 bg-slate-50 text-slate-600 font-bold text-xs select-none">
                    🇮🇳 +91
                  </span>
                  <input
                    id="new-mobile-input"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    className="flex-1 h-11 px-3.5 rounded-r-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono"
                    {...mobileForm.register('newMobileNo')}
                    aria-invalid={!!mobileForm.formState.errors.newMobileNo}
                  />
                </div>
                {mobileForm.formState.errors.newMobileNo && (
                  <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{mobileForm.formState.errors.newMobileNo.message}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sendMobileOtp.isPending}
                  className="w-full h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30"
                >
                  {sendMobileOtp.isPending ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Sending Verification OTP…</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP &amp; Verify Mobile</span>
                      <span>➔</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Email tab */}
          {activeTab === 'email' && (
            <form onSubmit={emailForm.handleSubmit(v => sendEmailOtp.mutate(v))} noValidate className="space-y-5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your new active email address. A 4-digit verification code will be dispatched to verify your address.
              </p>

              <div>
                <label htmlFor="new-email-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New E-Mail Address <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                    ✉️
                  </span>
                  <input
                    id="new-email-input"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-medium shadow-2xs"
                    {...emailForm.register('newEmailId')}
                    aria-invalid={!!emailForm.formState.errors.newEmailId}
                  />
                </div>
                {emailForm.formState.errors.newEmailId && (
                  <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{emailForm.formState.errors.newEmailId.message}</span>
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={sendEmailOtp.isPending}
                  className="w-full h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30"
                >
                  {sendEmailOtp.isPending ? (
                    <>
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Sending Verification OTP…</span>
                    </>
                  ) : (
                    <>
                      <span>Send OTP &amp; Verify Email</span>
                      <span>➔</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <OTPModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onSubmit={async (otp) => {
          if (activeTab === 'mobile') await saveMobile.mutateAsync(otp)
          else await saveEmail.mutateAsync(otp)
        }}
        onResend={async () => {
          if (activeTab === 'mobile') await sendMobileOtp.mutateAsync({ newMobileNo: pendingMobile })
          else await sendEmailOtp.mutateAsync({ newEmailId: pendingEmail })
        }}
        description={
          activeTab === 'mobile'
            ? `Enter the 4-digit code sent to +91 XXXXXX${pendingMobile.slice(-4)}`
            : `Enter the 4-digit code sent to ${pendingEmail}`
        }
        loading={activeTab === 'mobile' ? saveMobile.isPending : saveEmail.isPending}
        error={otpError}
      />
    </div>
  )
}
