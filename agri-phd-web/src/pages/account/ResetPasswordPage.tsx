import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { resetPasswordSchema, type ResetPasswordFormValues } from '@/schemas/authSchemas'
import { PUBLIC_ROUTES } from '@/router/routes'

/**
 * P2-B-08 / P6-THEME-10 — ResetPassword.aspx → ResetPasswordPage
 * Modernized password change screen with policy requirements checklist and visibility toggles.
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const loginId  = (location.state as { loginId?: string } | null)?.loginId ?? ''
  const [apiError, setApiError] = useState<string | null>(null)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: (v: ResetPasswordFormValues) =>
      authApi.resetPassword({ userId: 0, loginId, newPassword: v.newPassword, confirmPassword: v.confirmPassword }),
    onSuccess: (data) => {
      if (!data.success) {
        setApiError(data.message ?? 'Password update failed. Please try again.')
        return
      }
      toast.success('Your password has been changed successfully! Please log in.')
      navigate(PUBLIC_ROUTES.login)
    },
    onError: () => setApiError('An unexpected server error occurred. Please try again later.'),
  })

  if (!loginId) {
    return (
      <div className="w-full max-w-lg mx-auto py-12 px-4 text-center">
        <div className="p-6 rounded-2xl bg-white border border-rose-200 shadow-lg text-center space-y-4">
          <span className="text-4xl block">⏳</span>
          <h2 className="text-lg font-bold text-slate-800">Verification Session Expired</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            For security reasons, your verification session has expired or no account was selected. Please initiate password recovery again.
          </p>
          <div className="pt-2">
            <Link
              to={PUBLIC_ROUTES.forgotPassword}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-agriculture text-white font-bold text-sm shadow hover:bg-agriculture-600 transition-colors"
            >
              <span>🔑</span>
              <span>Start Password Recovery</span>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-xl mx-auto py-6 sm:py-12">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🔒
            </span>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-tight">
                Create New Password
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Set a strong, secure password for your account
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Final Step
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 bg-white">
          {/* Official Security Policy Guidance */}
          <div className="p-4 mb-6 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="text-base shrink-0">🛡️</span>
            <div>
              <strong className="block font-bold mb-0.5">Password Policy Requirements:</strong>
              <span>Must be between 8 and 15 characters long, and contain at least 1 uppercase letter, 1 lowercase letter, 1 numeric digit, and 1 special symbol (e.g. @, #, $, !).</span>
            </div>
          </div>

          {apiError && (
            <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5" role="alert">
              <span className="text-base">⚠️</span>
              <div>
                <strong className="block font-semibold">Error Updating Password</strong>
                <span>{apiError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(v => { setApiError(null); mutation.mutate(v) })} noValidate className="space-y-5">
            {/* Account Login ID (Verified & Read-only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Verified Account Login ID
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 text-base" aria-hidden="true">
                  ✓
                </span>
                <input
                  type="text"
                  value={loginId}
                  disabled
                  readOnly
                  aria-label="Verified Login ID"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-100 text-sm font-mono font-bold text-slate-700 cursor-not-allowed select-all"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  🔑
                </span>
                <input
                  id="new-password-input"
                  type={showNewPassword ? 'text' : 'password'}
                  maxLength={15}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono shadow-2xs"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(s => !s)}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer text-base"
                  tabIndex={-1}
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.newPassword && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.newPassword.message}</span>
                </p>
              )}
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirm-password-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  🔐
                </span>
                <input
                  id="confirm-password-input"
                  type={showConfirmPassword ? 'text' : 'password'}
                  maxLength={15}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.confirmPassword}
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono shadow-2xs"
                  {...register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(s => !s)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer text-base"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.confirmPassword && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.confirmPassword.message}</span>
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <Link
                to={PUBLIC_ROUTES.login}
                className="w-full sm:w-auto text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-bold inline-flex items-center justify-center gap-1.5 py-2.5 transition-colors order-2 sm:order-1"
              >
                <span>←</span>
                <span>Back to Sign In</span>
              </Link>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full sm:w-auto px-7 h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30 order-1 sm:order-2"
              >
                {mutation.isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving Password…</span>
                  </>
                ) : (
                  <>
                    <span>Change Password &amp; Login</span>
                    <span>✓</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
