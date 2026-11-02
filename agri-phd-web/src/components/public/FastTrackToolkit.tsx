export function FastTrackToolkit() {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="border-b border-emerald-100 pb-2">
        <div className="inline-flex items-center gap-1.5 text-3xs uppercase tracking-widest font-semibold text-emerald-800 mb-0.5">
          <span>🛠️</span>
          <span>Candidate Support &amp; Tools</span>
        </div>
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
          Applicant Fast-Track Toolkit &amp; Helpdesk
        </h2>
        <p className="text-3xs sm:text-xs text-slate-500 font-normal">
          Key guidelines, helpline contacts, and mandatory document compliance for Ph.D. candidates
        </p>
      </div>

      {/* 3 Pastel Action & Guidance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Eligibility & Weightage Quick Matrix */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/30 border border-emerald-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center text-sm shadow-2xs">
                ⚖️
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Eligibility &amp; Merit Formula
                </h3>
                <span className="text-3xs text-emerald-800 font-medium">MCAER Admission Criteria</span>
              </div>
            </div>

            <ul className="space-y-2 text-3xs sm:text-2xs text-slate-600 list-none p-0 mt-3 font-normal">
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>
                  <strong>Master&apos;s Degree (PG):</strong> Minimum 6.5 CGPA (65%) for Open category or 6.0 CGPA (60%) for Reserved categories on a 10-point scale.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>
                  <strong>Entrance Exam:</strong> Valid PhD-CET conducted by MAUEB (Common Entrance Test).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>
                  <strong>Merit Weightage:</strong> 70% CET Score + 30% PG CGPA + applicable institutional &amp; state weightages.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-emerald-100 text-3xs text-emerald-800 font-medium flex items-center justify-between">
            <span>Standardized across all faculties</span>
            <span>Centralized Admissions</span>
          </div>
        </div>

        {/* Card 2: Essential Document Checklist */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-sky-50/70 via-white to-blue-50/30 border border-sky-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-900 flex items-center justify-center text-sm shadow-2xs">
                📑
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Mandatory Scrutiny Uploads
                </h3>
                <span className="text-3xs text-sky-800 font-medium">Keep ready before registration</span>
              </div>
            </div>

            <ul className="space-y-1.5 text-3xs sm:text-2xs text-slate-600 list-none p-0 mt-3 font-normal">
              <li className="flex items-center gap-2">
                <span className="text-sky-700 font-semibold">1.</span>
                <span>Ph.D. CET Marksheet &amp; Admit Card</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-700 font-semibold">2.</span>
                <span>Master&apos;s Degree &amp; PDC / Final CGPA Transcript</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-700 font-semibold">3.</span>
                <span>Bachelor&apos;s (UG) Degree Certificate</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-700 font-semibold">4.</span>
                <span>College Leaving / Transfer Certificate</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-sky-700 font-semibold">5.</span>
                <span>Domicile &amp; Caste/Validity/NCL (if applicable)</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-sky-100 text-3xs text-sky-800 font-medium flex items-center justify-between">
            <span>Clear color scans (PDF / JPG format)</span>
            <span>Max 500 KB each</span>
          </div>
        </div>

        {/* Card 3: Official Helpdesk & Candidate Redressal */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 via-white to-orange-50/30 border border-amber-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center text-sm shadow-2xs">
                📞
              </span>
              <div>
                <h3 className="text-xs sm:text-sm font-semibold text-slate-900">
                  Admissions Helpline &amp; Support
                </h3>
                <span className="text-3xs text-amber-900 font-medium">MCAER Admission Directorate</span>
              </div>
            </div>

            <div className="space-y-2 text-3xs sm:text-2xs text-slate-700 mt-3 font-normal">
              <div className="flex items-center gap-2">
                <span className="text-amber-700 font-semibold">Helpline:</span>
                <strong className="font-mono text-slate-900 text-xs sm:text-sm">8806612998</strong>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-amber-700 font-semibold">Email:</span>
                <a href="mailto:phd.mcaer@gmail.com" className="text-emerald-800 font-medium underline">
                  phd.mcaer@gmail.com
                </a>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-amber-700 font-semibold shrink-0">Address:</span>
                <span>MCAER, 132-B, Bhamburda, Bhosale Nagar, Pune 411007</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-amber-100 text-3xs text-amber-900 font-medium flex items-center justify-between">
            <span>Mon–Sat: 10:00 AM – 06:00 PM</span>
            <span>Closed on Public Holidays</span>
          </div>
        </div>
      </div>
    </section>
  )
}

