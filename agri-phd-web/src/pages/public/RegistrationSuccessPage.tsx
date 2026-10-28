import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/router/routes'
import toast from 'react-hot-toast'

/**
 * P2-B-03 / P6-THEME-10 — RegistrationSuccessPage
 * Executive Ph.D. candidate registration confirmation card.
 */
export default function RegistrationSuccessPage() {
  const location  = useLocation()
  const appFormNo = (location.state as { applicationFormNo?: string } | null)?.applicationFormNo
  const [copied, setCopied] = useState(false)

  const handlePrint = () => window.print()

  const handleCopy = () => {
    if (appFormNo) {
      navigator.clipboard.writeText(appFormNo)
      setCopied(true)
      toast.success('Login ID copied to clipboard!')
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-6 sm:py-12">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🎉
            </span>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-white tracking-tight leading-tight">
                Registration Successful
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Centralized Admissions to Ph.D. 2026-27
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
            Registered
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 bg-white">
          {/* Success Banner */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border border-emerald-200/90 rounded-2xl p-6 mb-7 text-center">
            <span className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl mx-auto shadow-md mb-3">
              ✓
            </span>
            <h2 className="text-base sm:text-lg font-extrabold text-emerald-950 mb-1">
              Ph.D. Candidate Account Created Successfully!
            </h2>
            <p className="text-xs text-emerald-800 mb-5 max-w-md mx-auto">
              Your registration has been officially recorded. Please securely store your official Login ID below.
            </p>

            {/* Prominent Login ID badge */}
            <div className="inline-flex flex-col sm:flex-row items-center gap-3.5 bg-white border-2 border-emerald-500 rounded-xl px-5 py-3 shadow-sm">
              <div className="text-center sm:text-left">
                <span className="block text-3xs uppercase font-extrabold text-slate-500 tracking-wider">
                  Official Portal Login ID / App Form No.
                </span>
                <span className="text-2xl sm:text-3xl font-mono font-extrabold text-primary-950 select-all tracking-wider">
                  {appFormNo ?? '—'}
                </span>
              </div>
              {appFormNo && (
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <span>✓</span>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <span>📋</span>
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Important Instructions */}
          <div className="mb-7">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 border-b border-slate-200 pb-2.5 mb-3 flex items-center gap-2">
              <span>📌</span>
              <span>Important Instructions for Candidate</span>
            </h3>
            <ol className="space-y-2 text-xs text-slate-600 list-decimal pl-5 leading-relaxed">
              <li>
                Note down your <strong>LOGIN ID</strong> carefully. It will be required for every step of the Ph.D. admission process.
              </li>
              <li>
                Do not disclose your login credentials or password to unauthorized persons.
              </li>
              <li>
                You can change your password anytime after logging in via the <em>Change Password</em> menu.
              </li>
              <li>
                Ensure your registered mobile number and email ID remain active to receive critical updates and OTPs.
              </li>
              <li>
                Proceed to log in now to begin completing your 10-step Ph.D. Online Application Form.
              </li>
            </ol>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-100 no-print">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto px-5 h-11 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-bold shadow-2xs transition-colors cursor-pointer inline-flex items-center justify-center gap-2 order-2 sm:order-1"
            >
              <span>🖨️</span>
              <span>Print Acknowledgment Slip</span>
            </button>
            <Link
              to={PUBLIC_ROUTES.login}
              className="w-full sm:w-auto px-7 h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-400/30 order-1 sm:order-2"
            >
              <span>Proceed to Candidate Login</span>
              <span>➔</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
