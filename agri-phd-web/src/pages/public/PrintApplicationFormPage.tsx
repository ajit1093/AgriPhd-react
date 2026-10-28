import { useSearchParams, Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/router/routes'

/**
 * P2-A-14 — Public/PrintApplicationForm.aspx
 * Print-ready view of the application form for public portal access.
 */
export default function PrintApplicationFormPage() {
  const [params] = useSearchParams()
  const candidateId = params.get('candidateId')

  return (
    <div className="w-full max-w-2xl mx-auto py-8 sm:py-12">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🖨️
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Application Form Print Preview
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Centralized Admissions to Ph.D. 2026-27
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Print Slip
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 bg-white text-center space-y-5">
          {candidateId ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 inline-block text-left">
                <span className="block text-3xs uppercase font-extrabold text-slate-500 tracking-wider">
                  Target Candidate ID
                </span>
                <span className="text-xl font-mono font-bold text-slate-900 select-all">
                  {candidateId}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                To generate the complete 10-step Ph.D. application PDF document with verified photo and signature, please log in to your candidate account.
              </p>
              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-5 h-11 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Print Page</span>
                </button>
                <Link
                  to={PUBLIC_ROUTES.login}
                  className="px-6 h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-emerald-400/30"
                >
                  <span>Candidate Sign In</span>
                  <span>➔</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <span className="text-4xl block">📄</span>
              <p className="text-sm font-semibold text-slate-700">No Candidate ID Specified</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Please provide a valid application or candidate ID or sign in to access your completed admission form.
              </p>
              <div className="pt-2">
                <Link
                  to={PUBLIC_ROUTES.login}
                  className="inline-flex items-center gap-2 px-6 h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow transition-colors"
                >
                  <span>Go to Login</span>
                  <span>➔</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
