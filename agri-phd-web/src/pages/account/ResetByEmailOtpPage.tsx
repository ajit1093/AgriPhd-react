import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { OTPModal } from '@/components/ui/OTPModal'
import { PUBLIC_ROUTES } from '@/router/routes'

/**
 * P2-B-07 / P6-THEME-10 — ResetPasswordByOTPEMailID.aspx
 * Modernized academic card for resetting password via Email OTP.
 */
const schema = z.object({
  loginId: z.string().min(1, 'Login ID is required.').trim(),
  emailId: z.string().email('Enter a valid email address.').toLowerCase(),
})
type FormValues = z.infer<typeof schema>

export default function ResetByEmailOtpPage() {
  const navigate  = useNavigate()
  const [emailId, setEmailId]   = useState('')
  const [loginId, setLoginId]   = useState('')
  const [otpOpen, setOtpOpen]   = useState(false)
  const [otpError, setOtpError] = useState<string | undefined>()
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const proceedMut = useMutation({
    mutationFn: async (v: FormValues) => {
      const lookup = await authApi.forgotByOtpLookup({ loginId: v.loginId, emailId: v.emailId })
      if (!lookup.success) throw new Error(lookup.message ?? 'Email not found for this account.')
      return authApi.forgotSendEmailOtp(v.emailId)
    },
    onSuccess: (data, v) => {
      if (!data.success) { setApiError(data.errorMessage ?? 'Failed to send OTP.'); return }
      setEmailId(v.emailId)
      setLoginId(v.loginId)
      setOtpOpen(true)
      setOtpError(undefined)
    },
    onError: (err: Error) => setApiError(err.message),
  })

  const verifyMut = useMutation({
    mutationFn: (otp: string) => authApi.forgotVerifyOtp(emailId, otp),
    onSuccess: (data) => {
      if (!data.success) { setOtpError(data.errorMessage ?? 'Invalid OTP.'); return }
      setOtpOpen(false)
      navigate(PUBLIC_ROUTES.resetPassword, { state: { loginId } })
    },
  })

  return (
    <div className="w-full max-w-xl mx-auto py-6 sm:py-12">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              ✉️
            </span>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-tight">
                Reset via Email OTP
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Verify your registered academic email address
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Step 2 of 2
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 bg-white">
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            Enter your Login ID and registered email address. A 4-digit verification code (OTP) will be dispatched to your inbox.
          </p>

          {apiError && (
            <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5" role="alert">
              <span className="text-base">⚠️</span>
              <div>
                <strong className="block font-semibold">Verification Request Failed</strong>
                <span>{apiError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(v => { setApiError(null); proceedMut.mutate(v) })} noValidate className="space-y-5">
            {/* Login ID Input */}
            <div>
              <label htmlFor="email-login-id" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Login ID / Application No. <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  👤
                </span>
                <input
                  id="email-login-id"
                  type="text"
                  placeholder="e.g. 252001006 or SuperAdmin"
                  autoComplete="username"
                  aria-invalid={!!errors.loginId}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-medium shadow-2xs"
                  {...register('loginId')}
                />
              </div>
              {errors.loginId && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.loginId.message}</span>
                </p>
              )}
            </div>

            {/* Registered Email ID Input */}
            <div>
              <label htmlFor="registered-email-id" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registered E-Mail Address <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  ✉️
                </span>
                <input
                  id="registered-email-id"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  aria-invalid={!!errors.emailId}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-medium shadow-2xs"
                  {...register('emailId')}
                />
              </div>
              {errors.emailId && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.emailId.message}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                to={PUBLIC_ROUTES.forgotPassword}
                className="w-full sm:w-auto text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-bold inline-flex items-center justify-center gap-1.5 py-2.5 transition-colors order-2 sm:order-1"
              >
                <span>←</span>
                <span>Choose Different Method</span>
              </Link>
              <button
                type="submit"
                disabled={proceedMut.isPending}
                className="w-full sm:w-auto px-6 h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30 order-1 sm:order-2"
              >
                {proceedMut.isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Sending Email OTP…</span>
                  </>
                ) : (
                  <>
                    <span>Generate &amp; Send OTP</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <OTPModal
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onSubmit={async (otp) => { await verifyMut.mutateAsync(otp) }}
        onResend={async () => { await proceedMut.mutateAsync({ loginId, emailId }) }}
        description={`Enter the 4-digit verification code sent to ${emailId.slice(0, 3)}***${emailId.slice(emailId.indexOf('@'))}`}
        loading={verifyMut.isPending}
        error={otpError}
      />
    </div>
  )
}
