import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { collegeApi } from '@/api/college'

const schema = z.object({
  collegeCode:     z.string().min(1, 'College Code is required.').trim(),
  newPassword:     z.string().min(6, 'Password must be at least 6 characters.'),
  confirmPassword: z.string().min(1, 'Please confirm the new password.'),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})
type FormValues = z.infer<typeof schema>

/**
 * P2-I-05 / P6-THEME-12 — College/ResetCollegePassword.aspx
 * Modernized administrative password reset form for college institutional accounts.
 */
export default function ResetCollegePasswordPage() {
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      collegeApi.resetPassword(v.collegeCode, v.newPassword),
    onSuccess: r => {
      if (r.success) {
        toast.success('College password reset successfully.')
        reset()
      } else {
        toast.error('Password reset failed.')
      }
    },
    onError: () => toast.error('Server error resetting password. Please try again.'),
  })

  return (
    <div className="w-full max-w-xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🔐
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Reset College Password
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Administrative password reassignment for participating college logins
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full">
            Admin Action
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 bg-white">
          <form onSubmit={handleSubmit(v => mutation.mutate(v))} noValidate className="space-y-5">
            {/* College Code */}
            <div>
              <label htmlFor="col-reset-code" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Code (Login ID) <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  🏢
                </span>
                <input
                  id="col-reset-code"
                  type="text"
                  placeholder="e.g. 11101"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono shadow-2xs"
                  {...register('collegeCode')}
                  aria-invalid={!!errors.collegeCode}
                />
              </div>
              {errors.collegeCode && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.collegeCode.message}</span>
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="col-new-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                New College Password <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  🔑
                </span>
                <input
                  id="col-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters"
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono shadow-2xs"
                  {...register('newPassword')}
                  aria-invalid={!!errors.newPassword}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer text-base"
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.newPassword && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.newPassword.message}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="col-confirm-pwd" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Confirm New Password <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  🔐
                </span>
                <input
                  id="col-confirm-pwd"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono shadow-2xs"
                  {...register('confirmPassword')}
                  aria-invalid={!!errors.confirmPassword}
                />
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
                    <span>Resetting Password…</span>
                  </>
                ) : (
                  <>
                    <span>Reset College Password</span>
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
