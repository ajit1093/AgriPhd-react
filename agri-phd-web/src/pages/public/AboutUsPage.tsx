/**
 * P2-A-02 / P6-THEME-09 — Public/AboutUs.aspx → AboutUsPage
 * Official institutional information for MCAER & MAUEB.
 */
export default function AboutUsPage() {
  return (
    <div className="w-full max-w-5xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-6 sm:p-8 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-2xl shadow-2xs">
              🏛️
            </div>
            <div>
              <p className="text-2xs sm:text-xs font-bold text-amber-300 tracking-wide uppercase">
                महाराष्ट्र शासन &bull; कृषी शिक्षण व संशोधन परिषद
              </p>
              <h1 className="text-lg sm:text-2xl font-extrabold text-white tracking-tight leading-tight">
                About MCAER &amp; MAUEB, Pune
              </h1>
              <p className="text-xs text-slate-300 mt-1">
                Apex Statutory Coordinating Body for Agricultural Education in Maharashtra
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-2xs font-bold uppercase tracking-wider bg-white/15 text-white px-3 py-1 rounded-full border border-white/20">
            Statutory Council
          </span>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 bg-white text-slate-700">
          {/* Statutory Mandate Overview */}
          <div className="space-y-4 text-sm sm:text-base leading-relaxed">
            <p className="text-justify">
              The <strong>Maharashtra Council of Agricultural Education and Research (MCAER)</strong>, Pune is a statutory body constituted under Section 12 of the <em>Maharashtra Agricultural Universities (Krishi Vidyapeeth) Act, 1983</em>. The Council functions as the apex coordinating organization for agricultural education, research, and extension activities across Maharashtra.
            </p>
            <p className="text-justify">
              The <strong>Maharashtra Agricultural Universities Examination Board (MAUEB)</strong>, Pune conducts the centralized Common Entrance Test (CET) and directs centralized doctoral admissions for various Ph.D. degree programs across the four State Agricultural Universities (SAUs).
            </p>
          </div>

          {/* Key Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-2xl block">🎯</span>
              <h3 className="text-sm font-bold text-slate-900">Merit &amp; Transparency</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Centralized admissions ensure 100% merit-based seat allotments strictly evaluating PG CGPA and CET scores.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-2xl block">🌐</span>
              <h3 className="text-sm font-bold text-slate-900">Digital Governance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Seamless online workflow comprising digital registration, e-verification scrutiny, and spot rounds.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs space-y-2">
              <span className="text-2xl block">🌾</span>
              <h3 className="text-sm font-bold text-slate-900">Agricultural Excellence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fostering advanced research and doctoral dissertations tackling critical challenges in agriculture and allied sciences.
              </p>
            </div>
          </div>

          {/* SAUs Section */}
          <div className="pt-2 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-4">
              Participating State Agricultural Universities (SAUs)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center font-mono">1</span>
                <div>
                  <strong className="block text-xs font-bold text-slate-900">MPKV Rahuri</strong>
                  <span className="text-3xs text-slate-500">Mahatma Phule Krishi Vidyapeeth, Rahuri (Dist. Ahilyanagar)</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">2</span>
                <div>
                  <strong className="block text-xs font-bold text-slate-900">Dr. PDKV Akola</strong>
                  <span className="text-3xs text-slate-500">Dr. Panjabrao Deshmukh Krishi Vidyapeeth, Akola</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold text-xs flex items-center justify-center font-mono">3</span>
                <div>
                  <strong className="block text-xs font-bold text-slate-900">VNMKV Parbhani</strong>
                  <span className="text-3xs text-slate-500">Vasantrao Naik Marathwada Krishi Vidyapeeth, Parbhani</span>
                </div>
              </div>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold text-xs flex items-center justify-center font-mono">4</span>
                <div>
                  <strong className="block text-xs font-bold text-slate-900">Dr. BSKKV Dapoli</strong>
                  <span className="text-3xs text-slate-500">Dr. Balasaheb Sawant Konkan Krishi Vidyapeeth, Dapoli (Dist. Ratnagiri)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Strip */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-[#0B1D33] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <strong className="block text-sm font-bold text-white">Admissions &amp; Academic Inquiries</strong>
              <p className="text-xs text-slate-300">132-B, Bhamburda, Bhamburda Bhosale Nagar, Pune, Maharashtra 411007</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/15 text-white font-mono">
                📞 8806612998
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
