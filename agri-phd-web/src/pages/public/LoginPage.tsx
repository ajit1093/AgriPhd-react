import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { notificationApi } from '@/api/notifications'
import { useAuth } from '@/hooks/useAuth'
import { loginSchema, type LoginFormValues } from '@/schemas/authSchemas'
import { PUBLIC_ROUTES } from '@/router/routes'

/**
 * P2-B-01 / P6-THEME-10 — Modernized Ph.D. Admissions Login Page
 * Centered, high-contrast, institutional authentication card.
 */
export default function LoginPage() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate                  = useNavigate()
  const { loginMutation }         = useAuth()
  const [showPassword, setShowPassword] = useState(false)

  const { data: openData } = useQuery({
    queryKey: ['registration', 'is-open'],
    queryFn:  () => notificationApi.isRegistrationOpen(),
    staleTime: 0,
  })

  useEffect(() => {
    if (isAuthenticated && user) {
      const legacyToReact: Record<number, string> = {
        91: '/candidate/dashboard',
        11: '/super-admin/dashboard',
        12: '/admin/dashboard',
        61: '/college/dashboard',
        41: '/everification/dashboard',
        42: '/everification/dashboard',
        93: '/university/dashboard',
      }
      const target = legacyToReact[user.userTypeId] ?? '/candidate/dashboard'
      navigate(target, { replace: true })
    }
  }, [isAuthenticated, user, navigate])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  return (
    <div className="w-full max-w-[580px] mx-auto py-8 sm:py-14 px-4">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🔐
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Candidate &amp; Staff Login
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Sign in with your Application No. or Staff ID
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-2.5 py-1 rounded-full border border-white/20">
            Secure Portal
          </span>
        </div>

        {/* Form Body */}
        <div className="p-6 sm:p-8 bg-white">
          <form onSubmit={handleSubmit(v => loginMutation.mutate(v))} noValidate aria-label="Sign In form" className="space-y-5">
            
            {/* Login ID Input */}
            <div>
              <label htmlFor="login-id" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Login ID / Application No. <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  👤
                </span>
                <input
                  id="login-id"
                  type="text"
                  placeholder="e.g. 252001006 or SuperAdmin"
                  autoComplete="username"
                  aria-required="true"
                  aria-invalid={!!errors.loginId}
                  className="w-full h-12 pl-10 pr-4 rounded-xl border border-slate-300 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-medium shadow-2xs"
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

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password <span className="text-rose-600 font-extrabold">*</span>
                </label>
                <Link
                  to={PUBLIC_ROUTES.forgotPassword}
                  className="text-xs text-primary-700 hover:text-primary-900 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>🔑</span>
                  <span>Forgot Password?</span>
                </Link>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                  🔒
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-required="true"
                  aria-invalid={!!errors.password}
                  className="w-full h-12 pl-10 pr-11 rounded-xl border border-slate-300 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono shadow-2xs"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer text-base"
                  tabIndex={-1}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors.password && (
                <p role="alert" className="mt-1.5 text-xs text-rose-600 font-semibold flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-12 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 border border-emerald-400/30 transform hover:-translate-y-0.5"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing In to Portal…</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Portal</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>

            {/* Registration Prompt */}
            {openData?.isOpen !== false ? (
              <div className="pt-4 border-t border-slate-100 text-center">
                <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/60 to-slate-50 border border-emerald-200/80 shadow-2xs">
                  <p className="text-xs text-slate-600 mb-1 font-medium">New Ph.D. Applicant for Academic Session 2026-27?</p>
                  <Link
                    to={PUBLIC_ROUTES.register}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-agriculture hover:text-agriculture-700 hover:underline"
                  >
                    <span>📝</span>
                    <span>Register for Ph.D. Admission Here</span>
                    <span>➔</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-slate-100 text-center">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-2xs text-slate-500">
                  Online candidate registration for session 2026-27 is currently closed.
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Official Helpdesk Footer Note */}
      <div className="mt-5 text-center text-xs text-slate-500">
        <span>Official Helpline: </span>
        <strong className="text-slate-800 font-mono font-semibold">8806612998</strong>
        <span className="text-slate-400"> (10:00 AM – 06:00 PM)</span>
      </div>
    </div>
  )
}
