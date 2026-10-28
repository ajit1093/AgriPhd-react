import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { authApi } from '@/api/auth'
import { useMasterData } from '@/hooks/useMasterData'
import { useAuthStore } from '@/store/authStore'
import { changeSecurityQuestionSchema, type ChangeSecurityQuestionFormValues } from '@/schemas/authSchemas'

/**
 * P2-E-02 / P6-THEME-12 — Candidate/ChangeSecurityQuestion.aspx
 * Modernized academic card for updating security question and secret answer.
 */
export default function ChangeSecurityQuestionPage() {
  const { user } = useAuthStore()
  const navigate  = useNavigate()
  const { data: secQs, isLoading: isLoadingQs } = useMasterData('security-question')

  const { register, handleSubmit, formState: { errors } } = useForm<ChangeSecurityQuestionFormValues>({
    resolver: zodResolver(changeSecurityQuestionSchema),
    defaultValues: { securityQuestionId: 0 },
  })

  const mutation = useMutation({
    mutationFn: authApi.changeSecurityQuestion,
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Security question updated successfully.')
        const legacyToReact: Record<number, string> = {
          91: '/candidate/dashboard',
          11: '/super-admin/dashboard',
          12: '/admin/dashboard',
          61: '/college/dashboard',
          41: '/everification/dashboard',
          42: '/everification/dashboard',
          93: '/university/dashboard',
        }
        navigate(legacyToReact[user?.userTypeId ?? 91] ?? '/candidate/dashboard', { replace: true })
      } else {
        toast.error(r.message ?? 'Failed to update security question.')
      }
    },
    onError: () => toast.error('Unable to connect to server. Please try again.'),
  })

  return (
    <div className="w-full max-w-xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🛡️
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Update Security Question
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Set verification question used for self-service account recovery
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Account Recovery
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 bg-white space-y-6">
          {!user?.userTypeId && (
            <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-2.5">
              <span className="text-base shrink-0">ℹ️</span>
              <span>Please configure your secret security question before accessing the portal dashboard.</span>
            </div>
          )}

          <form onSubmit={handleSubmit(v => mutation.mutate(v))} noValidate className="space-y-5">
            {/* Security Question Select */}
            <div>
              <label htmlFor="cand-sec-q" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Security Question <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <select
                id="cand-sec-q"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs cursor-pointer bg-white"
                {...register('securityQuestionId', { valueAsNumber: true })}
                aria-invalid={!!errors.securityQuestionId}
              >
                <option value={0}>{isLoadingQs ? 'Loading Questions…' : '— Select a Question —'}</option>
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
              <label htmlFor="cand-sec-ans" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Security Answer <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  💬
                </span>
                <input
                  id="cand-sec-ans"
                  type="text"
                  maxLength={50}
                  placeholder="Enter your security answer"
                  autoComplete="off"
                  aria-invalid={!!errors.securityAnswer}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all shadow-2xs font-medium"
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

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30"
              >
                {mutation.isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Saving Security Question…</span>
                  </>
                ) : (
                  <>
                    <span>Save Security Question</span>
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
