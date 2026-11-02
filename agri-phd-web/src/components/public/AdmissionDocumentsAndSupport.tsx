interface AdmissionDocumentsAndSupportProps {
  className?: string
}

export function AdmissionDocumentsAndSupport({ className }: AdmissionDocumentsAndSupportProps) {
  return (
    <div className={`flex flex-col gap-4 ${className ?? ''}`}>
      {/* ── Top Card: Important Documents for Admission (Warm Amber Frame matching screenshot) ── */}
      <div className="flex-1 rounded-2xl border border-amber-300/80 bg-gradient-to-br from-amber-50/40 via-white to-amber-50/15 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-200/70 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg leading-none" aria-hidden="true">
                📋
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
                  Important Documents for Admission
                </h3>
                <p className="text-3xs text-amber-900/80 font-medium font-marathi">
                  प्रवेशासाठी आवश्यक मूळ कागदपत्रे व प्रमाणपत्रे
                </p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-amber-100 text-amber-900 border border-amber-300/80 shadow-2xs">
              Checklist
            </span>
          </div>

          {/* 2-Column Documents Checklist matching user screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-slate-700">
            {/* Left Column */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/80 border border-amber-200/60 shadow-2xs">
                <span className="text-emerald-700 font-bold text-sm shrink-0 leading-none mt-0.5">
                  ☑
                </span>
                <div>
                  <span className="font-semibold text-slate-900 block leading-tight">Ph.D. CET Marksheet / Admit Card</span>
                  <span className="text-3xs text-slate-500 font-normal">Valid score card issued by MAUEB</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/80 border border-amber-200/60 shadow-2xs">
                <span className="text-emerald-700 font-bold text-sm shrink-0 leading-none mt-0.5">
                  ☑
                </span>
                <div>
                  <span className="font-semibold text-slate-900 block leading-tight">UG Degree Certificate</span>
                  <span className="text-3xs text-slate-500 font-normal">Bachelor degree PDC / Convocation Certificate</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/80 border border-amber-200/60 shadow-2xs">
                <span className="text-emerald-700 font-bold text-sm shrink-0 leading-none mt-0.5">
                  ☑
                </span>
                <div>
                  <span className="font-semibold text-slate-900 block leading-tight">Domicile Certificate of Maharashtra</span>
                  <span className="text-3xs text-slate-500 font-normal">Issued by Competent Maharashtra State Authority</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/80 border border-amber-200/60 shadow-2xs">
                <span className="text-emerald-700 font-bold text-sm shrink-0 leading-none mt-0.5">
                  ☑
                </span>
                <div>
                  <span className="font-semibold text-slate-900 block leading-tight">Certificate of PwD / Defence / Orphan</span>
                  <span className="text-3xs text-slate-500 font-normal">From authorized civil surgeon / authority (if applicable)</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/80 border border-amber-200/60 shadow-2xs">
                <span className="text-emerald-700 font-bold text-sm shrink-0 leading-none mt-0.5">
                  ☑
                </span>
                <div>
                  <span className="font-semibold text-slate-900 block leading-tight">PG Degree &amp; Final Marksheet (CGPA)</span>
                  <span className="text-3xs text-slate-500 font-normal">Min. 6.5 CGPA (Open) or 6.0 CGPA (Reserved) on 10 pt scale</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/80 border border-amber-200/60 shadow-2xs">
                <span className="text-emerald-700 font-bold text-sm shrink-0 leading-none mt-0.5">
                  ☑
                </span>
                <div>
                  <span className="font-semibold text-slate-900 block leading-tight">College Leaving / Migration Certificate</span>
                  <span className="text-3xs text-slate-500 font-normal">TC / Migration from last attended agricultural institution</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/80 border border-amber-200/60 shadow-2xs">
                <span className="text-emerald-700 font-bold text-sm shrink-0 leading-none mt-0.5">
                  ☑
                </span>
                <div>
                  <span className="font-semibold text-slate-900 block leading-tight">Caste / Category &amp; Valid Non-Creamy Layer (NCL)</span>
                  <span className="text-3xs text-slate-500 font-normal">Caste Validity Certificate + valid NCL Certificate</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-white/80 border border-amber-200/60 shadow-2xs">
                <span className="text-emerald-700 font-bold text-sm shrink-0 leading-none mt-0.5">
                  ☑
                </span>
                <div>
                  <span className="font-semibold text-slate-900 block leading-tight">No Objection Certificate (NOC)</span>
                  <span className="text-3xs text-slate-500 font-normal">From employer for in-service / sponsored applicants</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Note Banner */}
        <div className="mt-3 pt-2.5 border-t border-amber-200/70 flex items-start gap-2 text-3xs text-amber-950/80 bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50">
          <span className="text-sm shrink-0 leading-none" aria-hidden="true">📌</span>
          <p className="leading-relaxed m-0 font-medium">
            <strong>Mandatory Verification Guideline:</strong> Candidates must upload clear scanned copies during online application. All original credentials along with 2 sets of attested photocopies must be produced during physical verification at the allotted University/College.
          </p>
        </div>
      </div>

      {/* ── Bottom Card: Support & Portal Information (Mint Frame matching screenshot) ── */}
      <div className="rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/15 p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-emerald-200/70 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg leading-none text-slate-700" aria-hidden="true">
                🏛️
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight uppercase">
                  Support &amp; Portal Information
                </h3>
                <p className="text-3xs text-emerald-900/80 font-medium font-marathi">
                  प्रवेश साहाय्य व अधिकृत संपर्क कक्ष
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300/80 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Helpdesk Active
            </span>
          </div>

          {/* Content Rows matching screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            {/* Left Block: Websites */}
            <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-200/70 shadow-2xs space-y-1">
              <span className="text-3xs uppercase tracking-wider font-bold text-emerald-800 block">
                Official Web Portals
              </span>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-500 font-medium">Portal:</span>
                <strong className="text-emerald-900 font-mono font-bold">phd.agrimcaer.in</strong>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-500 font-medium">Council:</span>
                <a
                  href="https://www.mcaer.org"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-800 hover:text-emerald-800 font-semibold underline"
                >
                  www.mcaer.org
                </a>
              </div>
            </div>

            {/* Right Block: Helpline & Email */}
            <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-200/70 shadow-2xs space-y-1">
              <span className="text-3xs uppercase tracking-wider font-bold text-emerald-800 block">
                Candidate Helpdesk
              </span>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-500 font-medium">Helpline:</span>
                <strong className="font-mono text-emerald-900 font-bold text-sm">8806612998</strong>
                <span className="text-3xs text-slate-400">(10:00 AM - 06:00 PM)</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-slate-500 font-medium">Email:</span>
                <a
                  href="mailto:phd.mcaer@gmail.com"
                  className="text-emerald-800 hover:text-emerald-950 font-medium underline"
                >
                  phd.mcaer@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Council Headquarters Address */}
        <div className="mt-3 pt-2 border-t border-emerald-200/70 flex items-center justify-between flex-wrap gap-2 text-3xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-700">📍</span>
            <span>
              <strong>Council Campus:</strong> Maharashtra Council of Agricultural Education &amp; Research, 132/B, Bhamburda, Bhosale Nagar, Pune 411007
            </span>
          </div>
          <span className="text-emerald-800 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded-md border border-emerald-200">
            Government of Maharashtra
          </span>
        </div>
      </div>
    </div>
  )
}
