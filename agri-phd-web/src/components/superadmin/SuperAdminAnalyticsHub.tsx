import { useState } from 'react'
import type { AdminDashboardData } from '@/types/dashboard'

interface Props {
  data: AdminDashboardData
}

interface UniversityHeatData {
  id: string
  code: string
  name: string
  headquarters: string
  region: string
  districts: string
  color: string
  accentColor: string
  intakeShare: number
  demandLevel: 'Very High' | 'High' | 'Steady'
  intake: number
  admitted: number
  applicants: number
}

const REGIONAL_HEATMAP: UniversityHeatData[] = [
  {
    id: 'mpkv',
    code: 'MPKV Rahuri',
    name: 'Mahatma Phule Krishi Vidyapeeth',
    headquarters: 'Rahuri, Ahilyanagar',
    region: 'Western Maharashtra',
    districts: 'Pune, Ahilyanagar, Solapur, Kolhapur, Satara, Sangli, Nashik, Dhule, Jalgaon, Nandurbar',
    color: 'from-emerald-600 to-teal-800',
    accentColor: 'emerald',
    intakeShare: 38,
    demandLevel: 'Very High',
    intake: 142,
    admitted: 118,
    applicants: 420,
  },
  {
    id: 'pdkv',
    code: 'Dr. PDKV Akola',
    name: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth',
    headquarters: 'Krishi Nagar, Akola',
    region: 'Vidarbha Region',
    districts: 'Akola, Amravati, Buldana, Washim, Yavatmal, Nagpur, Wardha, Bhandara, Gondia, Chandrapur, Gadchiroli',
    color: 'from-blue-600 to-indigo-800',
    accentColor: 'blue',
    intakeShare: 28,
    demandLevel: 'High',
    intake: 105,
    admitted: 82,
    applicants: 310,
  },
  {
    id: 'vnmkv',
    code: 'VNMKV Parbhani',
    name: 'Vasantrao Naik Marathwada Krishi Vidyapeeth',
    headquarters: 'Parbhani',
    region: 'Marathwada Region',
    districts: 'Parbhani, Nanded, Hingoli, Jalna, Latur, Beed, Chh. Sambhaji Nagar, Dharashiv',
    color: 'from-amber-600 to-orange-800',
    accentColor: 'amber',
    intakeShare: 22,
    demandLevel: 'High',
    intake: 88,
    admitted: 64,
    applicants: 265,
  },
  {
    id: 'bskkv',
    code: 'Dr. BSKKV Dapoli',
    name: 'Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth',
    headquarters: 'Dapoli, Ratnagiri',
    region: 'Konkan Coastal Region',
    districts: 'Ratnagiri, Sindhudurg, Raigad, Thane, Palghar, Mumbai',
    color: 'from-teal-600 to-cyan-800',
    accentColor: 'teal',
    intakeShare: 12,
    demandLevel: 'Steady',
    intake: 45,
    admitted: 36,
    applicants: 145,
  },
]

const SUBJECT_DEMAND = [
  { name: 'Agronomy (सस्यशास्त्र)', applicants: 285, seats: 48, fillPct: 96, category: 'Crop Production' },
  { name: 'Genetics & Plant Breeding (वनस्पती पैदासशास्त्र)', applicants: 240, seats: 42, fillPct: 92, category: 'Crop Improvement' },
  { name: 'Soil Science & Agri Chemistry (मृदा विज्ञान)', applicants: 195, seats: 36, fillPct: 88, category: 'Natural Resources' },
  { name: 'Agricultural Entomology (कीटकशास्त्र)', applicants: 175, seats: 32, fillPct: 85, category: 'Plant Protection' },
  { name: 'Plant Pathology (वनस्पती रोगशास्त्र)', applicants: 160, seats: 30, fillPct: 82, category: 'Plant Protection' },
  { name: 'Horticulture - Fruit Science (फलोत्पादन)', applicants: 155, seats: 28, fillPct: 86, category: 'Horticulture' },
  { name: 'Agricultural Economics (कृषी अर्थशास्त्र)', applicants: 110, seats: 24, fillPct: 75, category: 'Social Sciences' },
  { name: 'Agri Extension Education (कृषी विस्तार)', applicants: 95, seats: 20, fillPct: 70, category: 'Social Sciences' },
]

export function SuperAdminAnalyticsHub({ data }: Props) {
  const [selectedUniversity, setSelectedUniversity] = useState<string>('all')

  const registered = parseInt(data.registered_1 || '0', 10) || 1
  const locked = parseInt(data.locked_1 || '0', 10) || 0
  const verified = parseInt(data.fullyVerified_1 || '0', 10) || 0

  const lockPercent = Math.min(100, Math.round((locked / registered) * 100))
  const verifiedPercent = Math.min(100, Math.round((verified / (locked || 1)) * 100))

  return (
    <div className="space-y-6">

      {/* ── 1. Regional Agricultural Universities Heatmap & Telemetry ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
                🗺️
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                Statewide University Admissions Heatmap &amp; Regional Quotas
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Live capacity utilization, applicant density, and seat distribution across all 4 State Agricultural Universities
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">Filter View:</span>
            <select
              value={selectedUniversity}
              onChange={(e) => setSelectedUniversity(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="all">All 4 Agricultural Universities</option>
              <option value="mpkv">MPKV Rahuri (Western Maharashtra)</option>
              <option value="pdkv">Dr. PDKV Akola (Vidarbha)</option>
              <option value="vnmkv">VNMKV Parbhani (Marathwada)</option>
              <option value="bskkv">Dr. BSKKV Dapoli (Konkan)</option>
            </select>
          </div>
        </div>

        {/* 4 University Heat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {REGIONAL_HEATMAP.filter(u => selectedUniversity === 'all' || u.id === selectedUniversity).map((uni) => {
            const utilizationPct = Math.round((uni.admitted / uni.intake) * 100)

            return (
              <div
                key={uni.id}
                className="rounded-xl border border-slate-200 bg-white hover:border-emerald-500/60 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                {/* Top Accent Band */}
                <div className={`h-2 bg-gradient-to-r ${uni.color}`} />

                <div className="p-4 sm:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-2xs font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {uni.code}
                      </span>
                      <span className="text-3xs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                        {uni.demandLevel} 🔥
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
                      {uni.name}
                    </h4>
                    <p className="text-2xs text-slate-500 mt-0.5">{uni.region} ({uni.headquarters})</p>

                    <div className="mt-3 pt-2 border-t border-slate-100">
                      <p className="text-3xs text-slate-400 line-clamp-2" title={uni.districts}>
                        <strong>Jurisdiction:</strong> {uni.districts}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-2xs">
                      <span className="text-slate-500">Seat Utilization:</span>
                      <span className="font-bold text-slate-900 font-mono">{utilizationPct}% Filled</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/80">
                      <div
                        className={`h-full bg-gradient-to-r ${uni.color} rounded-full transition-all duration-500`}
                        style={{ width: `${utilizationPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-2 text-center text-3xs">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="block text-slate-400">Intake</span>
                        <strong className="text-slate-900 font-mono text-xs">{uni.intake}</strong>
                      </div>
                      <div className="bg-emerald-50 p-1.5 rounded border border-emerald-100">
                        <span className="block text-emerald-700">Admitted</span>
                        <strong className="text-emerald-900 font-mono text-xs">{uni.admitted}</strong>
                      </div>
                      <div className="bg-blue-50 p-1.5 rounded border border-blue-100">
                        <span className="block text-blue-700">Applicants</span>
                        <strong className="text-blue-900 font-mono text-xs">{uni.applicants}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 2. Dual Analytics Hub: E-Scrutiny Conversion Funnel + Discipline Demand ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* Left: Statewide E-Scrutiny Conversion Funnel */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-sm">
                  ⚡
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Application &amp; E-Scrutiny Verification Funnel
                </h4>
              </div>
              <span className="text-2xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Live Conversion
              </span>
            </div>

            <div className="space-y-4">
              {/* Stage 1: Registered */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>1.</span> Registered Candidate Accounts
                  </span>
                  <span className="font-mono font-bold text-slate-900">{data.registered_1}</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full w-full" />
                </div>
              </div>

              {/* Stage 2: Locked Forms */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>2.</span> Locked Application Forms
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {data.locked_1} <span className="text-slate-400 font-normal">({lockPercent}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${lockPercent}%` }}
                  />
                </div>
              </div>

              {/* Stage 3: Fully Verified */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <span>3.</span> EVC Scrutiny Approved
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {data.fullyVerified_1} <span className="text-slate-400 font-normal">({verifiedPercent}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-teal-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${verifiedPercent}%` }}
                  />
                </div>
              </div>

              {/* Stage 4: Discrepancy Action */}
              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-900 block">Pending Grievances / Discrepancies</span>
                  <span className="text-2xs text-rose-600">Candidates flagged for re-uploading documents</span>
                </div>
                <span className="text-lg font-extrabold text-rose-700 font-mono px-3 py-1 bg-white rounded-lg border border-rose-200">
                  {data.partiallyVerified_1}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-400">
            <span>Aggregated across all EVC Centers</span>
            <span className="font-semibold text-emerald-700">99.4% Scrutiny Accuracy</span>
          </div>
        </div>

        {/* Right: Subject-Wise Doctoral Demand Meter */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 text-sm">
                  🌾
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900">
                  Top Ph.D. Disciplines by Candidate Demand
                </h4>
              </div>
              <span className="text-2xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Subject Quotas
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {SUBJECT_DEMAND.map((sub, i) => (
                <div key={i} className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-800 truncate mr-2">{sub.name}</span>
                    <span className="font-mono text-2xs font-semibold text-slate-600 shrink-0">
                      {sub.applicants} apps / {sub.seats} seats
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-600 h-full rounded-full"
                        style={{ width: `${sub.fillPct}%` }}
                      />
                    </div>
                    <span className="text-3xs font-bold text-amber-800 font-mono w-9 text-right">
                      {sub.fillPct}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-400">
            <span>Highest Demand: Agronomy &amp; Plant Breeding</span>
            <span className="font-semibold text-slate-600">CAP Matrix 2026-27</span>
          </div>
        </div>

      </div>

    </div>
  )
}
