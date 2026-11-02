import { Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/router/routes'

interface UniversityInfo {
  code: string
  name: string
  marathiName: string
  location: string
  established: number
  theme: {
    cardBg: string
    borderColor: string
    badgeBg: string
    badgeText: string
    accentColor: string
    buttonBg: string
  }
  avatarEmoji: string
  specialties: string[]
  jurisdiction: string
  portalCollegeCode: string
}

const UNIVERSITIES: UniversityInfo[] = [
  {
    code: 'MPKV',
    name: 'Mahatma Phule Krishi Vidyapeeth',
    marathiName: 'महात्मा फुले कृषी विद्यापीठ, राहुरी',
    location: 'Rahuri, Ahmednagar',
    established: 1968,
    theme: {
      cardBg: 'bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40',
      borderColor: 'border-emerald-200/80',
      badgeBg: 'bg-emerald-100/90 text-emerald-900 border-emerald-300/70',
      badgeText: 'text-emerald-800',
      accentColor: 'text-emerald-900',
      buttonBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    },
    avatarEmoji: '🌾',
    specialties: ['Agronomy & Soil Science', 'Plant Breeding & Genetics', 'Ag Biotechnology', 'Horticulture'],
    jurisdiction: 'Western Maharashtra (Pune, Ahmednagar, Solapur, Nashik, Dhule, Jalgaon, Nandurbar)',
    portalCollegeCode: 'MPKV-RAHURI',
  },
  {
    code: 'PDKV',
    name: 'Dr. Panjabrao Deshmukh Krishi Vidyapeeth',
    marathiName: 'डॉ. पंजाबराव देशमुख कृषी विद्यापीठ, अकोला',
    location: 'Akola, Vidarbha',
    established: 1969,
    theme: {
      cardBg: 'bg-gradient-to-br from-amber-50/80 via-white to-orange-50/40',
      borderColor: 'border-amber-200/80',
      badgeBg: 'bg-amber-100/90 text-amber-900 border-amber-300/70',
      badgeText: 'text-amber-800',
      accentColor: 'text-amber-900',
      buttonBg: 'bg-amber-700 hover:bg-amber-800 text-white',
    },
    avatarEmoji: '🌱',
    specialties: ['Cotton & Rainfed Farming', 'Ag Economics & Extension', 'Entomology & Pathology', 'Ag Engineering'],
    jurisdiction: 'Vidarbha Region (Akola, Amravati, Nagpur, Yavatmal, Wardha, Chandrapur, Buldhana, Gadchiroli)',
    portalCollegeCode: 'PDKV-AKOLA',
  },
  {
    code: 'VNMKV',
    name: 'Vasantrao Naik Marathwada Krishi Vidyapeeth',
    marathiName: 'वसंतराव नाईक मराठवाडा कृषी विद्यापीठ, परभणी',
    location: 'Parbhani, Marathwada',
    established: 1972,
    theme: {
      cardBg: 'bg-gradient-to-br from-sky-50/80 via-white to-blue-50/40',
      borderColor: 'border-sky-200/80',
      badgeBg: 'bg-sky-100/90 text-sky-900 border-sky-300/70',
      badgeText: 'text-sky-800',
      accentColor: 'text-sky-900',
      buttonBg: 'bg-sky-700 hover:bg-sky-800 text-white',
    },
    avatarEmoji: '🔬',
    specialties: ['Food Science & Technology', 'Ag Microbiology & Biotech', 'Dryland Crop Management', 'Seed Technology'],
    jurisdiction: 'Marathwada Region (Parbhani, Nanded, Aurangabad, Jalna, Beed, Latur, Osmanabad, Hingoli)',
    portalCollegeCode: 'VNMKV-PARBHANI',
  },
  {
    code: 'BSKKV',
    name: 'Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth',
    marathiName: 'डॉ. बाळासाहेब सावंत कोकण कृषी विद्यापीठ, दापोली',
    location: 'Dapoli, Ratnagiri (Konkan)',
    established: 1972,
    theme: {
      cardBg: 'bg-gradient-to-br from-rose-50/70 via-white to-amber-50/30',
      borderColor: 'border-rose-200/70',
      badgeBg: 'bg-rose-100/90 text-rose-900 border-rose-300/70',
      badgeText: 'text-rose-800',
      accentColor: 'text-rose-900',
      buttonBg: 'bg-rose-700 hover:bg-rose-800 text-white',
    },
    avatarEmoji: '🌴',
    specialties: ['Horticulture & Mango/Cashew', 'Fisheries & Marine Biology', 'Forestry & Ecology', 'Post-Harvest Engg'],
    jurisdiction: 'Konkan Coastal Region (Thane, Palghar, Raigad, Ratnagiri, Sindhudurg, Mumbai)',
    portalCollegeCode: 'BSKKV-DAPOLI',
  },
]

export function UniversityShowcase() {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-1 border-b border-emerald-100">
        <div>
          <div className="inline-flex items-center gap-1.5 text-3xs uppercase tracking-widest font-semibold text-emerald-800 mb-1">
            <span>🏛️</span>
            <span>Participating Institutions</span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
            State Agricultural Universities of Maharashtra
          </h2>
          <p className="text-3xs sm:text-xs text-slate-500 font-normal">
            Ph.D. seats across all 4 accredited universities are allotted through MCAER Pune centralized merit rounds
          </p>
        </div>

        <Link
          to={PUBLIC_ROUTES.searchCollege}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline self-start sm:self-auto cursor-pointer"
        >
          <span>Search Colleges &amp; Faculties</span>
          <span aria-hidden="true">→</span>
        </Link>
      </div>

      {/* 4 Pastel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {UNIVERSITIES.map((univ) => (
          <div
            key={univ.code}
            className={`rounded-2xl p-4 sm:p-5 border ${univ.theme.cardBg} ${univ.theme.borderColor} shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
          >
            <div>
              {/* Top Row: Avatar & Code Badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-white shadow-2xs border border-slate-200/80 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                  {univ.avatarEmoji}
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className={`px-2 py-0.5 rounded-full text-3xs font-bold border ${univ.theme.badgeBg}`}
                  >
                    {univ.code}
                  </span>
                  <span className="text-3xs text-slate-600 mt-0.5 font-medium">Estd. {univ.established}</span>
                </div>
              </div>

              {/* University Title & Location */}
              <h3 className="text-sm font-semibold text-slate-900 leading-snug group-hover:text-emerald-900 transition-colors">
                {univ.name}
              </h3>
              <p className="text-3xs text-emerald-900/80 font-medium font-marathi mt-0.5">
                {univ.marathiName}
              </p>

              <div className="flex items-center gap-1 text-3xs text-slate-600 mt-2 font-medium">
                <span className="text-slate-600">📍</span>
                <span>{univ.location}</span>
              </div>

              {/* Doctoral Disciplines Tags */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 space-y-1.5">
                <span className="text-3xs font-semibold text-slate-600 uppercase tracking-wider block">
                  Key Ph.D. Disciplines:
                </span>
                <div className="flex flex-wrap gap-1">
                  {univ.specialties.map((spec, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-white/90 border border-slate-200/70 text-3xs text-slate-700 font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Jurisdiction & Search Link */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-3xs text-slate-500">
              <span className="truncate max-w-[140px] text-3xs" title={univ.jurisdiction}>
                Jurisdiction: {univ.location.split(',')[1] || univ.location}
              </span>
              <Link
                to={PUBLIC_ROUTES.searchCollege}
                className="font-semibold text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-0.5"
              >
                <span>Colleges</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

