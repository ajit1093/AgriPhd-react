/**
 * P2-A-06 / P6-THEME-09 — Refund & Cancellation Policy
 * Official fee refund, duplicate payment reconciliation, and cancellation policy.
 */
export default function RefundPolicyPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-2xs">
              💳
            </div>
            <div>
              <p className="text-2xs sm:text-xs font-bold text-amber-300 tracking-wide uppercase">
                Payment Guidelines &bull; Financial Terms
              </p>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                Refund &amp; Cancellation Policy
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Centralized Admissions to Ph.D. 2026-27 in Maharashtra SAUs
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Financial Terms
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-6 bg-white text-slate-700 text-sm leading-relaxed">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
            All registration and seat confirmation fee transactions processed through the AgriPHD portal are governed strictly by the following Council regulations.
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span>📝</span>
                <span>Application Form Processing Fees</span>
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                The online application registration fee is <strong>strictly non-refundable and non-transferable</strong> under any circumstances once the candidate successfully pays and submits the form.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span>🔄</span>
                <span>Automatic Reconciliation of Duplicate Payments</span>
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                If a candidate is debited multiple times due to a banking gateway interruption, network latency, or browser timeout for the same Application Form Number, the duplicate excess charge will be refunded automatically to the originating source account within 7 to 10 working days following bank settlement.
              </p>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors">
              <strong className="block text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <span>❌</span>
                <span>Seat Allotment Cancellation &amp; Retained Fees</span>
              </strong>
              <p className="text-xs text-slate-600 leading-relaxed">
                A candidate who officially cancels an accepted provisional admission before the prescribed cut-off deadline announced in the academic timetable will be eligible for a refund minus administrative processing deductions as mandated in the MCAER Doctoral Information Brochure. No refund requests shall be entertained post the institutional closure date.
              </p>
            </div>
          </div>

          {/* Helpdesk Strip */}
          <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span>For unresolved payment queries, email with your UTR / Order No:</span>
            <span className="font-bold text-slate-900 font-mono">mcaer.admission@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}
