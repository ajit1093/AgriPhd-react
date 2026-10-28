/**
 * P2-A-04 / P6-THEME-09 — Privacy Policy
 * Official data protection and privacy policy.
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-2xs">
              🛡️
            </div>
            <div>
              <p className="text-2xs sm:text-xs font-bold text-amber-300 tracking-wide uppercase">
                Data Protection &bull; Security Commitment
              </p>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                Privacy Policy
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Safeguarding personal, academic, and biometric credentials
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Confidential
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-6 bg-white text-slate-700 text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            MCAER Pune is dedicated to ensuring the highest benchmarks of digital privacy and data protection for all doctoral applicants, verifiers, and participating university staff.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xl block">📂</span>
              <strong className="block text-sm font-bold text-slate-900">Information We Collect</strong>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li>Full name, date of birth, category, and domicile status</li>
                <li>PG degree marks, transcripts, CGPA, and CET scorecards</li>
                <li>Digital photo, signature, and identity documents</li>
                <li>Payment transaction tokens and verification logs</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-xl block">⚙️</span>
              <strong className="block text-sm font-bold text-slate-900">How Information Is Utilized</strong>
              <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                <li>Evaluating eligibility and compiling centralized merit ranks</li>
                <li>Conducting E-Scrutiny verification by authorized committees</li>
                <li>Issuing provisional allotment letters and admission slips</li>
                <li>Statutory statistical reporting to State Government bodies</li>
              </ul>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <strong className="block text-sm font-bold text-emerald-950 flex items-center gap-2">
              <span>🔒</span>
              <span>Data Protection &amp; Cryptographic Storage</span>
            </strong>
            <p className="text-xs text-emerald-900 leading-relaxed">
              All credentials are cryptographically protected. User passwords are salted and hashed (never stored in plain text). Uploaded certificates and PDFs are stored in private cloud storage accessible strictly by authenticated verification personnel.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
