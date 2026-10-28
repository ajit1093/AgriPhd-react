import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { changePasswordSchema, type ChangePasswordFormValues } from '@/schemas/authSchemas'

/**
 * P2-E-01 / P6-THEME-12 — Candidate/ChangePassword.aspx
 * Modern executive security settings card for changing candidate account password.
 */
export default function ChangePasswordPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword]         = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
  })

  const mutation = useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: (r) => {
      if (r.success) {
        toast.success(r.message ?? 'Password changed successfully.')
        reset()
      } else {
        toast.error(r.message ?? 'Change password failed. Please check your current password.')
      }
    },
    onError: () => toast.error('Unable to connect to authentication server. Please try again.'),
  })

  return (
    <div className="w-full max-w-xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🔑
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Change Account Password
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Update your security credentials for portal access
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Account Security
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 bg-white space-y-6">
          {/* Policy Guidance */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="text-base shrink-0">🛡️</span>
            <div>
              <strong className="block font-bold mb-0.5">Password Policy Rules:</strong>
              <span>Minimum 8 and maximum 15 characters, containing at least 1 uppercase letter, 1 lowercase letter, 1 numeric digit, and 1 special symbol.</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(v => mutation.mutate(v))} noValidate className="space-y-5">
            {/* Current Password */}
            <div>
              <label htmlFor="current-pwd" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Current Password <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  🔒
                </span>
                <input
                  id="current-pwd"
                  type={showCurrentPassword ? 'text' : 'password'}
                  maxLength={15}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.currentPassword}
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono shadow-2xs"
                  {...register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(s => !s)}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer text-base"
                  tabIndex={-1}
                >
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.currentPassword && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.currentPassword.message}</span>
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-pwd" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New Password <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  🔑
                </span>
                <input
                  id="new-pwd"
                  type={showNewPassword ? 'text' : 'password'}
                  maxLength={15}
                  placeholder="Enter strong new password"
                  autoComplete="new-password"
                  aria-invalid={!!errors.newPassword}
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono shadow-2xs"
                  {...register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(s => !s)}
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
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
              <label htmlFor="confirm-new-pwd" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  🔐
                </span>
                <input
                  id="confirm-new-pwd"
                  type={showConfirmPassword ? 'text' : 'password'}
                  maxLength={15}
                  placeholder="Re-type new password"
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

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30"
              >
                {mutation.isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving New Password…</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
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
