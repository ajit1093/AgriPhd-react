/**
 * P2-A-05 / P6-THEME-09 — Terms & Conditions
 * Official admissions terms of use and candidate obligations.
 */
export default function TermsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-2xs">
              📜
            </div>
            <div>
              <p className="text-2xs sm:text-xs font-bold text-amber-300 tracking-wide uppercase">
                Admissions Policy &bull; Legal Guidelines
              </p>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                Terms &amp; Conditions
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Centralized Admissions to Ph.D. 2026-27 in Maharashtra SAUs
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Mandatory Compliance
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-6 bg-white text-slate-700 text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
            By registering, logging into, and submitting applications on the AgriPHD Centralized Admissions Portal, candidates and users agree to be legally bound by these terms, conditions, and the provisions of the official MCAER Doctoral Prospectus.
          </div>

          <div className="space-y-5">
            <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1">
                1. Candidate Eligibility &amp; Examination Verification
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Only candidates who satisfy the minimum academic eligibility criteria and have appeared in the requisite Common Entrance Test (CET) / ICAR AICE-JRF/SRF as prescribed by MCAER for the relevant academic discipline are eligible to submit option forms.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1">
                2. Truthfulness &amp; Authenticity of Records
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Candidates are solely and strictly accountable for the precision and veracity of all entered particulars, marks, reservation certificates, and uploaded scans. Any falsification, concealment, or misrepresentation will result in prompt cancellation of candidacy and potential legal forfeiture.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1">
                3. Application Fees &amp; Transaction Policies
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                The centralized application processing fee is non-refundable once paid, except as detailed explicitly in the official Refund Policy for verified duplicate bank transactions.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1">
                4. Mandatory E-Scrutiny &amp; Verification
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                All submitted claims must undergo verification by the assigned E-Verification Center (EVC). An application that remains unverified, incomplete, or rejected during scrutiny will not be considered for centralized merit ranking or allotment rounds.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1">
                5. Merit Allotment &amp; Council Jurisdiction
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seat allocations are computer-automated following declared merit lists, reservation rosters, and college preferences. The determination made by the Maharashtra Council of Agriculture Education and Research shall remain final, conclusive, and binding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
