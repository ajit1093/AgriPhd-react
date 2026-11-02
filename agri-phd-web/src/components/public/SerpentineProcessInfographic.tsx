import { useState } from 'react'

interface Milestone {
  number: number
  title: string
  marathiTitle: string
  keyRule: string
  chips: string[]
  color: {
    ribbon: string
    nodeBg: string
    nodeRing: string
    titleColor?: string
    badgeBg: string
    badgeBorder: string
    badgeText: string
    auraBg?: string
  }
  illustration: React.ReactNode
}

const MILESTONES: Milestone[] = [
  {
    number: 1,
    title: 'ELIGIBILITY CHECK',
    marathiTitle: 'पात्रता पडताळणी',
    keyRule: "Master's Degree (PG) in relevant agricultural field on a 10-point scale.",
    chips: ['Open: Min. 65%', 'Reserved: Min. 60%', '10-Pt. Scale'],
    color: {
      ribbon: '#D97706',
      nodeBg: 'bg-amber-500',
      nodeRing: 'ring-amber-200',
      titleColor: 'text-amber-950',
      badgeBg: 'bg-amber-50',
      badgeBorder: 'border-amber-300',
      badgeText: 'text-amber-900',
      auraBg: 'from-amber-100/60 to-yellow-50/20',
    },
    illustration: (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-sm" viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2.5" />
        {/* Smiling Student with Graduation Cap / Degree */}
        <circle cx="34" cy="34" r="11" fill="#FBBF24" />
        <circle cx="34" cy="32" r="9" fill="#FDE68A" />
        <path d="M18 58C18 48 24 44 34 44C44 44 50 48 50 58" fill="#047857" />
        {/* Degree Certificate */}
        <rect x="46" y="24" width="28" height="38" rx="2" fill="#FFFFFF" stroke="#D97706" strokeWidth="2" />
        <rect x="50" y="30" width="10" height="12" rx="1" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1" />
        <line x1="64" y1="32" x2="70" y2="32" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="64" y1="37" x2="69" y2="37" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="46" x2="68" y2="46" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="50" y1="52" x2="65" y2="52" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="64" cy="54" r="3.5" fill="#DC2626" />
      </svg>
    ),
  },
  {
    number: 2,
    title: 'Ph.D. CET EXAM',
    marathiTitle: 'सीईटी परीक्षा',
    keyRule: 'Common Entrance Test conducted by MAUEB Pune for doctoral admissions.',
    chips: ['PhD-CET Required', 'Conducted by MAUEB', 'Mandatory'],
    color: {
      ribbon: '#EA580C',
      nodeBg: 'bg-orange-500',
      nodeRing: 'ring-orange-200',
      titleColor: 'text-orange-950',
      badgeBg: 'bg-orange-50',
      badgeBorder: 'border-orange-300',
      badgeText: 'text-orange-900',
      auraBg: 'from-orange-100/60 to-amber-50/20',
    },
    illustration: (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-sm" viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" fill="#FFEDD5" stroke="#FB923C" strokeWidth="2.5" />
        {/* Candidate writing exam */}
        <circle cx="45" cy="30" r="11" fill="#FB923C" />
        <circle cx="45" cy="28" r="9" fill="#FED7AA" />
        <path d="M38 24C38 20 52 20 52 24C52 28 45 32 45 32C45 32 38 28 38 24Z" fill="#7C2D12" />
        <path d="M30 54C30 46 37 42 45 42C53 42 60 46 60 54" fill="#D97706" />
        {/* Exam Paper on desk */}
        <rect x="46" y="40" width="28" height="36" rx="2" fill="#FFFFFF" stroke="#EA580C" strokeWidth="2" />
        <line x1="52" y1="46" x2="68" y2="46" stroke="#C2410C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="52" y1="52" x2="66" y2="52" stroke="#C2410C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="52" y1="58" x2="64" y2="58" stroke="#C2410C" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="52" y1="64" x2="68" y2="64" stroke="#C2410C" strokeWidth="1.5" strokeLinecap="round" />
        {/* Pencil */}
        <line x1="38" y1="46" x2="48" y2="54" stroke="#7C2D12" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    number: 3,
    title: 'ONLINE APPLICATION',
    marathiTitle: 'ऑनलाइन अर्ज नोंदणी',
    keyRule: 'Candidate portal registration, 10-step wizard form, and document upload.',
    chips: ['phd.agrimcaer.in', 'Document Upload', 'Fee Payment'],
    color: {
      ribbon: '#0D9488',
      nodeBg: 'bg-teal-600',
      nodeRing: 'ring-teal-200',
      badgeBg: 'bg-teal-50',
      badgeBorder: 'border-teal-300',
      badgeText: 'text-teal-900',
      auraBg: 'from-teal-100/60 to-emerald-50/20',
    },
    illustration: (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-sm" viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" fill="#CCFBF1" stroke="#2DD4BF" strokeWidth="2.5" />
        {/* Desktop Workstation */}
        <rect x="20" y="24" width="50" height="34" rx="3" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2" />
        <rect x="24" y="28" width="42" height="26" rx="1" fill="#E6FFFA" />
        {/* Web Portal Header */}
        <rect x="24" y="28" width="42" height="6" fill="#0D9488" />
        <circle cx="28" cy="31" r="1" fill="#FFFFFF" />
        <circle cx="32" cy="31" r="1" fill="#FFFFFF" />
        <circle cx="36" cy="31" r="1" fill="#FFFFFF" />
        {/* Form lines & Candidate Icon */}
        <rect x="28" y="38" width="16" height="3" rx="0.5" fill="#0F766E" />
        <rect x="28" y="44" width="22" height="3" rx="0.5" fill="#0F766E" />
        <rect x="52" y="37" width="10" height="11" rx="1" fill="#99F6E4" stroke="#0D9488" strokeWidth="1" />
        {/* Monitor Stand */}
        <path d="M41 58H49V63H41V58Z" fill="#0F766E" />
        <rect x="34" y="63" width="22" height="3" rx="1" fill="#0F766E" />
      </svg>
    ),
  },
  {
    number: 4,
    title: 'MERIT LIST & REJECTION',
    marathiTitle: 'गुणवत्ता यादी व छाननी',
    keyRule: 'Online E-scrutiny by EVC officers. Incomplete or unverified submissions will not progress.',
    chips: ['Online E-Scrutiny', 'Provisional List', 'Grievance Redressal'],
    color: {
      ribbon: '#16A34A',
      nodeBg: 'bg-emerald-600',
      nodeRing: 'ring-emerald-200',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-300',
      badgeText: 'text-emerald-900',
      auraBg: 'from-emerald-100/60 to-green-50/20',
    },
    illustration: (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-sm" viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" fill="#DCFCE7" stroke="#4ADE80" strokeWidth="2.5" />
        {/* Verified Dossier Clipboard */}
        <rect x="26" y="20" width="38" height="50" rx="3" fill="#FFFFFF" stroke="#15803D" strokeWidth="2" />
        <rect x="35" y="16" width="20" height="7" rx="2" fill="#15803D" />
        {/* Checklist Rows */}
        <circle cx="34" cy="32" r="3" fill="#22C55E" />
        <line x1="42" y1="32" x2="56" y2="32" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        <circle cx="34" cy="41" r="3" fill="#22C55E" />
        <line x1="42" y1="41" x2="54" y2="41" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        <circle cx="34" cy="50" r="3" fill="#22C55E" />
        <line x1="42" y1="50" x2="57" y2="50" stroke="#166534" strokeWidth="2" strokeLinecap="round" />
        {/* Large Verified Stamp Seal */}
        <circle cx="53" cy="56" r="9" fill="#16A34A" />
        <path d="M49 56L52 59L58 53" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    number: 5,
    title: 'ONLINE OPTION FORM',
    marathiTitle: 'महाविद्यालय पसंतीक्रम',
    keyRule: 'Select and rank doctoral colleges, faculties, and subjects across Maharashtra State Agricultural Universities.',
    chips: ['College Preferences', 'Subject Priority', 'Form Locking'],
    color: {
      ribbon: '#0284C7',
      nodeBg: 'bg-sky-600',
      nodeRing: 'ring-sky-200',
      titleColor: 'text-sky-950',
      badgeBg: 'bg-sky-50',
      badgeBorder: 'border-sky-300',
      badgeText: 'text-sky-900',
      auraBg: 'from-sky-100/60 to-blue-50/20',
    },
    illustration: (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-sm" viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="2.5" />
        {/* Central University Network Hub */}
        <circle cx="45" cy="45" r="14" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
        <circle cx="45" cy="45" r="12" fill="#BAE6FD" />
        <circle cx="45" cy="45" r="4" fill="#0284C7" />
        {/* 4 Connected College Nodes (MPKV, PDKV, VNMKV, BSKKV) */}
        <circle cx="24" cy="30" r="7" fill="#0284C7" />
        <circle cx="66" cy="30" r="7" fill="#0284C7" />
        <circle cx="24" cy="60" r="7" fill="#0284C7" />
        <circle cx="66" cy="60" r="7" fill="#0284C7" />
        {/* Directional Network Arrows */}
        <line x1="29" y1="34" x2="37" y2="39" stroke="#0369A1" strokeWidth="1.5" strokeDasharray="3,2" />
        <line x1="61" y1="34" x2="53" y2="39" stroke="#0369A1" strokeWidth="1.5" strokeDasharray="3,2" />
        <line x1="29" y1="56" x2="37" y2="51" stroke="#0369A1" strokeWidth="1.5" strokeDasharray="3,2" />
        <line x1="61" y1="56" x2="53" y2="51" stroke="#0369A1" strokeWidth="1.5" strokeDasharray="3,2" />
      </svg>
    ),
  },
  {
    number: 6,
    title: 'CAP ROUNDS (ALLOTMENT)',
    marathiTitle: 'जागा वाटप (कॅप फेऱ्या)',
    keyRule: 'Seat allotment based on 70% CET Score + 30% PG CGPA weightage, reservation quota, and choices.',
    chips: ['70% CET + 30% CGPA', 'Reservation Quota', 'Allotment Letter'],
    color: {
      ribbon: '#7C3AED',
      nodeBg: 'bg-purple-600',
      nodeRing: 'ring-purple-200',
      titleColor: 'text-purple-950',
      badgeBg: 'bg-purple-50',
      badgeBorder: 'border-purple-300',
      badgeText: 'text-purple-900',
      auraBg: 'from-purple-100/60 to-indigo-50/20',
    },
    illustration: (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-sm" viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" fill="#EDE9FE" stroke="#A78BFA" strokeWidth="2.5" />
        {/* Allotment Terminal */}
        <rect x="22" y="24" width="46" height="32" rx="3" fill="#FFFFFF" stroke="#6D28D9" strokeWidth="2" />
        {/* University Allotment Red Stamp Banner */}
        <rect x="25" y="30" width="40" height="18" rx="2" fill="#FEE2E2" stroke="#DC2626" strokeWidth="1.5" strokeDasharray="3,1.5" />
        <text x="29" y="42" fill="#DC2626" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">
          ALLOTMENT
        </text>
        {/* Wooden Stamp Handle */}
        <path d="M26 62L34 50L38 54L30 66Z" fill="#92400E" />
        <rect x="36" y="56" width="18" height="4" rx="1" fill="#6D28D9" />
      </svg>
    ),
  },
  {
    number: 7,
    title: 'REPORTING & ADMISSION',
    marathiTitle: 'प्रवेश निश्चिती',
    keyRule: 'In-person verification of original certificates and payment of fees at the allotted Agricultural College.',
    chips: ['Original Verification', 'College Fee Payment', 'Admission Receipt'],
    color: {
      ribbon: '#059669',
      nodeBg: 'bg-emerald-700',
      nodeRing: 'ring-emerald-300',
      titleColor: 'text-emerald-950',
      badgeBg: 'bg-emerald-50',
      badgeBorder: 'border-emerald-300',
      badgeText: 'text-emerald-900',
      auraBg: 'from-emerald-100/60 to-teal-50/20',
    },
    illustration: (
      <svg className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 drop-shadow-sm" viewBox="0 0 90 90" fill="none">
        <circle cx="45" cy="45" r="42" fill="#D1FAE5" stroke="#34D399" strokeWidth="2.5" />
        {/* Faculty and Candidate Handover */}
        <circle cx="31" cy="30" r="8" fill="#FBBF24" />
        <path d="M19 54C19 44 24 40 31 40C38 40 43 44 43 54" fill="#047857" />
        <circle cx="59" cy="30" r="8" fill="#FBBF24" />
        <path d="M47 54C47 44 52 40 59 40C66 40 71 44 71 54" fill="#1E3A8A" />
        {/* Official Admission Letter */}
        <rect x="38" y="34" width="14" height="22" rx="1.5" fill="#FFFFFF" stroke="#059669" strokeWidth="1.5" />
        <line x1="41" y1="39" x2="49" y2="39" stroke="#047857" strokeWidth="1.5" />
        <line x1="41" y1="44" x2="48" y2="44" stroke="#047857" strokeWidth="1.5" />
        <circle cx="45" cy="50" r="2" fill="#10B981" />
      </svg>
    ),
  },
]

interface SerpentineProcessInfographicProps {
  className?: string
}

export function SerpentineProcessInfographic({ className }: SerpentineProcessInfographicProps = {}) {
  const [viewMode, setViewMode] = useState<'roadmap' | 'poster'>('roadmap')

  return (
    <div className={`w-full h-full flex flex-col justify-between ${className ?? ''}`}>
      {/* ── Section Header with Mode Toggle ── */}
      <div className="border-b border-emerald-200/80 pb-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 text-3xs font-semibold uppercase tracking-wider mb-1">
            <span>🌿</span>
            <span>MCAER Pune Candidate Guide</span>
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-snug">
            Ph.D. Admission Process Roadmap
          </h2>
          <p className="text-3xs sm:text-2xs text-emerald-900/90 font-medium font-marathi">
            आचार्य पदवी प्रवेश प्रक्रिया — सचित्र मार्गदर्शक
          </p>
        </div>

        {/* View Mode Toggle: Interactive Roadmap vs Official Poster */}
        <div className="inline-flex rounded-xl border border-emerald-200/90 bg-white p-0.5 shadow-2xs text-3xs font-semibold">
          <button
            type="button"
            onClick={() => setViewMode('roadmap')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${viewMode === 'roadmap'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <span>🧭</span>
            <span>Roadmap</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('poster')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${viewMode === 'poster'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
          >
            <span>🖼️</span>
            <span>Poster</span>
          </button>
        </div>
      </div>

      {/* ── View 1: Full Official Infographic Poster ── */}
      {viewMode === 'poster' ? (
        <div className="flex-1 min-h-0 mt-3 rounded-2xl overflow-hidden border border-emerald-200 shadow-sm bg-white p-2 text-center group flex flex-col justify-between">
          <div className="relative flex-1 min-h-0 overflow-hidden rounded-xl bg-stone-50 flex items-center justify-center">
            <img
              src="/admission-process-poster.jpg"
              alt="MCAER Ph.D. Admission Process for Candidates Official Poster"
              className="w-full h-auto object-contain max-h-[720px] mx-auto transform transition duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
          <div className="pt-2 text-3xs text-slate-500 flex items-center justify-between px-1 shrink-0">
            <span>Official MCAER Pune Admission Poster</span>
            <a
              href="/admission-process-poster.jpg"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-800 hover:text-emerald-950 font-semibold underline inline-flex items-center gap-0.5"
            >
              <span>Open High-Res ↗</span>
            </a>
          </div>
        </div>
      ) : (
        /* ── View 2: Image-Based Informative Multicolored Roadmap (Free from Box Outlines) ── */
        <div className="flex-1 min-h-0 flex flex-col justify-between pt-3">
          {/* Serpentine Timeline Flow */}
          <div className="relative pl-2 pr-1 flex-1 min-h-0 flex flex-col justify-between">
            {MILESTONES.map((step, idx) => (
              <div key={step.number} className="relative flex items-start gap-3 sm:gap-4 group">
                {/* ── Left Column: Winding Serpentine Connecting Ribbon & Numbered Node ── */}
                <div className="flex flex-col items-center shrink-0 self-stretch pt-2">
                  {/* Multicolored Number Node */}
                  <div
                    className={`w-8 h-8 rounded-full ${step.color.nodeBg} text-white text-xs font-black flex items-center justify-center shadow-xs ring-4 ${step.color.nodeRing} shrink-0 group-hover:scale-110 transition-transform duration-200 z-10`}
                  >
                    {step.number}
                  </div>

                  {/* Gradient Winding Ribbon to Next Step */}
                  {idx < MILESTONES.length - 1 && (
                    <div
                      className="w-1.5 flex-1 my-1 rounded-full transition-all duration-300"
                      style={{
                        background: `linear-gradient(to bottom, ${step.color.ribbon}, ${MILESTONES[idx + 1].color.ribbon})`,
                      }}
                    />
                  )}
                </div>

                {/* ── Right Column: Large Illustrated Artwork + Informative Chips (Free-Form) ── */}
                <div className="flex-1 min-w-0 pb-0">
                  {/* Top: Large Illustrated Art Vignette + Title */}
                  <div className="flex items-center gap-3">
                    {/* Large Circular Art Vignette */}
                    <div className="shrink-0 transform group-hover:scale-105 transition-transform duration-300">
                      {step.illustration}
                    </div>

                    {/* Milestone Title & Marathi Tag */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-3xs uppercase tracking-wider font-extrabold text-slate-400">
                          STAGE 0{step.number}
                        </span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight leading-snug">
                        {step.title}
                      </h3>
                      <p className="text-3xs text-emerald-900/90 font-medium font-marathi mt-0.5">
                        {step.marathiTitle}
                      </p>
                    </div>
                  </div>

                  {/* Concise Key Rule */}
                  <p className="text-3xs sm:text-2xs text-slate-600 mt-1.5 leading-relaxed font-normal">
                    {step.keyRule}
                  </p>

                  {/* Informative Visual Chips (No dense paragraphs) */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                    {step.chips.map((chip, cIdx) => (
                      <span
                        key={cIdx}
                        className={`px-2 py-0.5 rounded-md text-3xs font-semibold border ${step.color.badgeBg} ${step.color.badgeBorder} ${step.color.badgeText} shadow-2xs`}
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
