import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/api/auth'
import { useMasterData } from '@/hooks/useMasterData'
import { PUBLIC_ROUTES } from '@/router/routes'

/**
 * P2-B-05 / P6-THEME-10 — ResetPasswordBySecurityQuestion.aspx
 * Modernized academic card for resetting password via Security Question & Answer.
 */
const schema = z.object({
  loginId:            z.string().min(1, 'Login ID is required.').trim(),
  securityQuestionId: z.number().min(1, 'Please select a security question.'),
  securityAnswer:     z.string().min(1, "Security Question's Answer is required."),
})
type FormValues = z.infer<typeof schema>

export default function ResetBySecurityQuestionPage() {
  const navigate = useNavigate()
  const { data: secQs, isLoading: isLoadingQs } = useMasterData('security-question')
  const [apiError, setApiError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { securityQuestionId: 0 },
  })

  const mutation = useMutation({
    mutationFn: (v: FormValues) =>
      authApi.forgotBySecurityQuestion({
        loginId: v.loginId,
        securityQuestionId: v.securityQuestionId,
        securityAnswer: v.securityAnswer,
      }),
    onSuccess: (data, v) => {
      if (!data.success) {
        setApiError(data.message ?? 'Verification failed. Please check your credentials and try again.')
        return
      }
      navigate(PUBLIC_ROUTES.resetPassword, { state: { loginId: v.loginId } })
    },
    onError: () => setApiError('Unable to connect to verification server. Please try again.'),
  })

  return (
    <div className="w-full max-w-xl mx-auto py-6 sm:py-12">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              ❓
            </span>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-tight">
                Reset via Security Question
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Answer the secret question set during registration
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
            Provide your Login ID along with the security question and exact answer configured during your candidate registration.
          </p>

          {apiError && (
            <div className="p-4 mb-6 rounded-xl bg-rose-50 border border-rose-200 text-xs sm:text-sm text-rose-800 flex items-start gap-2.5" role="alert">
              <span className="text-base">⚠️</span>
              <div>
                <strong className="block font-semibold">Verification Failed</strong>
                <span>{apiError}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(v => { setApiError(null); mutation.mutate(v) })} noValidate className="space-y-5">
            {/* Login ID Input */}
            <div>
              <label htmlFor="sec-login-id" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Login ID / Application No. <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  👤
                </span>
                <input
                  id="sec-login-id"
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

            {/* Security Question Select */}
            <div>
              <label htmlFor="sec-question" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Security Question <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <select
                id="sec-question"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs cursor-pointer bg-white"
                {...register('securityQuestionId', { valueAsNumber: true })}
                aria-invalid={!!errors.securityQuestionId}
              >
                <option value={0}>{isLoadingQs ? 'Loading Questions…' : '— Select Your Security Question —'}</option>
                {(secQs ?? []).map(q => (
                  <option key={q.value} value={Number(q.value)}>
                    {q.text}
                  </option>
                ))}
              </select>
              {errors.securityQuestionId && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.securityQuestionId.message}</span>
                </p>
              )}
            </div>

            {/* Security Answer Input */}
            <div>
              <label htmlFor="sec-answer" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Security Question&apos;s Answer <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  💬
                </span>
                <input
                  id="sec-answer"
                  type="text"
                  maxLength={50}
                  placeholder="Enter your security answer"
                  autoComplete="off"
                  aria-invalid={!!errors.securityAnswer}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs"
                  {...register('securityAnswer')}
                />
              </div>
              {errors.securityAnswer && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.securityAnswer.message}</span>
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
                disabled={mutation.isPending}
                className="w-full sm:w-auto px-6 h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30 order-1 sm:order-2"
              >
                {mutation.isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Verifying Security Answer…</span>
                  </>
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <span>➔</span>
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
