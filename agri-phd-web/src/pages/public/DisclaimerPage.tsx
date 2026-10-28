/**
 * P2-A-03 / P6-THEME-09 — Disclaimer
 * Official admissions portal legal disclaimer.
 */
export default function DisclaimerPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-2xs">
              ⚖️
            </div>
            <div>
              <p className="text-2xs sm:text-xs font-bold text-amber-300 tracking-wide uppercase">
                Legal Notice &bull; Portal Information
              </p>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                Disclaimer
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Terms of informational reliance for Ph.D. Admissions 2026-27
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Legal Notice
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-6 bg-white text-slate-700 text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            The data, schedules, circulars, and notices hosted on this portal are primarily intended for facilitating centralized online admissions. Users are strongly recommended to cross-refer to physical gazette publications and official signed circulars from MCAER Pune.
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1">
                Accuracy &amp; Content Reliability
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                While diligent precautions are observed to maintain current and precise information, MCAER does not warrant the absolute completeness, accuracy, or suitability of details displayed herein for any individual legal contingency.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1">
                Official Notification Precedence
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                In case of any inadvertent inconsistency between information represented on this electronic portal and the official Ph.D. Information Brochure / Gazette Notifications issued by MCAER, the printed official prospectus notification shall indisputably prevail.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1">
                Third-Party Gateways &amp; Network Resilience
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                MCAER assumes no liability for intermittent transmission interruptions, external banking payment gateway timeouts, or ISP outages. Candidates are strictly advised to conclude registrations well before cutoff deadlines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
