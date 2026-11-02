import { Link } from 'react-router-dom'
import { PUBLIC_ROUTES } from '@/router/routes'

interface HomeHeroSectionProps {
  onBrochureClick?: () => void
}

export function HomeHeroSection({ onBrochureClick }: HomeHeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F4F9F5] via-[#FCFDFC] to-[#FDF8F3] border border-emerald-100/90 p-6 sm:p-8 lg:p-10 shadow-xs">
      {/* Decorative soft pastel background circles */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-emerald-100/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-20 w-80 h-80 rounded-full bg-amber-100/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 right-1/3 w-64 h-64 rounded-full bg-sky-100/30 blur-2xl"
        aria-hidden="true"
      />

      <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Narrative, Badges & CTAs */}
        <div className="lg:col-span-7 space-y-5 text-left">
          {/* Eyebrow Institutional Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-emerald-200/80 text-emerald-900 text-3xs sm:text-2xs font-semibold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span className="tracking-wide">GOVERNMENT OF MAHARASHTRA • MCAER PUNE</span>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-3xl lg:text-[2.2rem] font-semibold text-slate-900 tracking-tight leading-snug">
              Doctor of Philosophy <span className="text-emerald-800 font-bold">(Ph.D.)</span> Admissions
            </h1>
            <p className="text-xs sm:text-sm font-medium text-emerald-900/90 leading-relaxed font-marathi">
              महाराष्ट्र राज्य कृषी विद्यापीठे आचार्य (Ph.D.) पदवी केंद्रीय प्रवेश प्रक्रिया
            </p>
          </div>

          {/* Body Prose - Refined & Subtle */}
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl font-normal">
            Welcome to the centralized single-window admissions portal for Maharashtra&apos;s four State Agricultural
            Universities. Offering doctoral research fellowships across Agriculture, Horticulture, Agricultural
            Engineering, and Allied Sciences through a transparent 100% online scrutiny and seat allocation process.
          </p>

          {/* Quick Key Facts Pills - Colorful Pastel Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-3xs sm:text-2xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200/80">
              <span>🏛️</span>
              <span>4 State Agri Universities</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-3xs sm:text-2xs font-medium bg-amber-50 text-amber-900 border border-amber-200/80">
              <span>⚖️</span>
              <span>70:30 Merit Criteria (CET + CGPA)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-3xs sm:text-2xs font-medium bg-sky-50 text-sky-900 border border-sky-200/80">
              <span>💻</span>
              <span>100% Online E-Scrutiny</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-3xs sm:text-2xs font-medium bg-purple-50 text-purple-900 border border-purple-200/80">
              <span>🎓</span>
              <span>Centralized CAP Rounds</span>
            </span>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to={PUBLIC_ROUTES.register}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 no-underline cursor-pointer"
            >
              <span>Register for Ph.D. Admissions</span>
              <span aria-hidden="true">→</span>
            </Link>

            <Link
              to={PUBLIC_ROUTES.login}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium bg-white hover:bg-emerald-50/60 text-slate-800 hover:text-emerald-900 border border-slate-300/80 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all duration-200 no-underline cursor-pointer"
            >
              <span>Candidate &amp; Staff Login</span>
              <span aria-hidden="true">🔐</span>
            </Link>

            {onBrochureClick && (
              <button
                type="button"
                onClick={onBrochureClick}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium text-amber-900 bg-amber-50/80 hover:bg-amber-100/90 border border-amber-200/80 transition-all cursor-pointer"
              >
                <span>📘</span>
                <span>Prospectus</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Hero Illustration Artwork (Clean & Enlarged) */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="relative w-full max-w-lg lg:max-w-full group">
            {/* Soft Pastel Aura behind image */}
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-200/40 via-teal-100/30 to-amber-200/40 rounded-3xl blur-xl transition-all duration-300 group-hover:blur-2xl" />

            {/* Illustration Frame */}
            <div className="relative rounded-2xl overflow-hidden border border-emerald-200/80 shadow-md bg-white">
              <img
                src="/hero-illustration.jpg"
                alt="Maharashtra Agricultural Universities Ph.D. Research and Admissions"
                className="w-full h-auto max-h-[440px] sm:max-h-[480px] object-cover object-center transform transition duration-500 group-hover:scale-[1.02]"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

