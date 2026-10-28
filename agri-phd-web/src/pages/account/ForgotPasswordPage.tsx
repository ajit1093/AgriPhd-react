import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PUBLIC_ROUTES } from '@/router/routes'

const schema = z.object({
  method: z.enum(['1', '2', '3'], { required_error: 'Please select an account recovery method.' }),
})
type FormValues = z.infer<typeof schema>

/**
 * P2-B-04 / P6-THEME-10 — Account Recovery Option Selection
 * Modernized academic card with crystal clear selection pills.
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { method: '1' },
  })

  const onSubmit = (v: FormValues) => {
    const routes: Record<string, string> = {
      '1': PUBLIC_ROUTES.resetByQuestion,
      '2': PUBLIC_ROUTES.resetByEmail,
      '3': PUBLIC_ROUTES.resetByMobile,
    }
    navigate(routes[v.method])
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-12">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🔑
            </span>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-tight">
                Account Password Recovery
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Select your preferred identity verification method
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Step 1 of 2
          </span>
        </div>

        <div className="p-6 sm:p-8 bg-white">
          <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
            Please choose how you would like to verify your identity to reset your Ph.D. portal password:
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-3.5 mb-6">
              {[
                {
                  value: '1',
                  icon: '❓',
                  title: 'Security Question & Answer',
                  desc: 'Answer the security question chosen during your initial candidate registration',
                  tag: 'Instant',
                },
                {
                  value: '2',
                  icon: '✉️',
                  title: 'Email OTP Verification',
                  desc: 'Receive a secure 4-digit verification code on your registered email address',
                  tag: 'Via Email',
                },
                {
                  value: '3',
                  icon: '📱',
                  title: 'Mobile OTP Verification',
                  desc: 'Receive a secure 4-digit verification code on your registered mobile number',
                  tag: 'Via SMS',
                },
              ].map(opt => (
                <label
                  key={opt.value}
                  htmlFor={`method-${opt.value}`}
                  className="flex items-start gap-4 p-4 rounded-xl border-2 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition-all cursor-pointer group shadow-2xs"
                >
                  <input
                    type="radio"
                    id={`method-${opt.value}`}
                    value={opt.value}
                    {...register('method')}
                    className="mt-1 text-emerald-600 focus:ring-emerald-500 cursor-pointer w-4 h-4"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-900 flex items-center gap-1.5">
                        <span>{opt.icon}</span>
                        <span>{opt.title}</span>
                      </span>
                      <span className="text-3xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                        {opt.tag}
                      </span>
                    </div>
                    <span className="block text-xs text-slate-500 mt-1 leading-relaxed">
                      {opt.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>

            {errors.method && (
              <p className="text-xs text-rose-600 font-semibold mb-4 flex items-center gap-1">
                <span>⚠️</span>
                <span>{errors.method.message}</span>
              </p>
            )}

            <div className="flex items-center justify-between pt-5 border-t border-slate-100">
              <Link
                to={PUBLIC_ROUTES.login}
                className="text-xs sm:text-sm text-slate-600 hover:text-slate-900 font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <span>←</span>
                <span>Back to Sign In</span>
              </Link>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 bg-agriculture hover:bg-agriculture-600 text-white font-bold px-7 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all text-xs sm:text-sm cursor-pointer border border-emerald-400/30 transform hover:-translate-y-0.5"
              >
                <span>Continue Recovery</span>
                <span>➔</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
