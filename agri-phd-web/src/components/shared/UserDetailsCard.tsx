import type { LoggedInUserDetails } from '@/types/dashboard'

interface Props {
  data: LoggedInUserDetails
  /** Extra row shown on College and University dashboards */
  extraRow?: React.ReactNode
}

/**
 * P6-THEME-17 — Executive User Session Card
 * Modernized command center profile and session telemetry.
 */
export function UserDetailsCard({ data, extraRow }: Props) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-primary-950 to-academic-navy text-white rounded-2xl p-4 sm:p-6 shadow-card mb-6 border border-slate-800 relative overflow-hidden">
      {/* Subtle background ambient graphic */}
      <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">

        {/* Left Side: User Profile & Authority Spotlight */}
        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border-2 border-white/20 shadow-md flex items-center justify-center text-xl sm:text-2xl shrink-0 backdrop-blur-xs">
            🏛️
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-3xs sm:text-2xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30">
                {data.userType || 'Administrator'}
              </span>
              <span className="text-3xs sm:text-xs font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded">
                Login ID: {data.userLoginID || '—'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white tracking-tight truncate">
              {data.userName || 'Authorized Official'}
            </h2>
            <p className="text-3xs sm:text-xs text-slate-300 mt-0.5 truncate">
              Doctor of Philosophy (Ph.D.) Central Admissions Session 2026-27
            </p>
          </div>
        </div>

        {/* Right Side: 3 Session Telemetry Tiles (Fully fluid & responsive) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
          {/* IP Address */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 flex flex-col justify-between w-full min-w-0">
            <div className="flex items-center justify-between text-3xs sm:text-2xs text-slate-300 font-semibold uppercase tracking-wider mb-1">
              <span>Security &amp; IP</span>
              <span className="text-emerald-400">🛡️</span>
            </div>
            <div className="text-xs sm:text-sm font-bold font-mono text-white truncate">
              {data.iPAddress && data.iPAddress !== '—' ? data.iPAddress : 'Secure Connection'}
            </div>
            <div className="text-3xs text-emerald-300 font-medium mt-1">
              ● Verified Session
            </div>
          </div>

          {/* Current Login Time */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 flex flex-col justify-between w-full min-w-0">
            <div className="flex items-center justify-between text-3xs sm:text-2xs text-slate-300 font-semibold uppercase tracking-wider mb-1">
              <span>Current Login</span>
              <span className="text-sky-300">🕒</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white font-mono truncate">
              {data.currentLoginDateTime || '—'}
            </div>
            <div className="text-3xs text-sky-200 font-medium mt-1">
              Active Session
            </div>
          </div>

          {/* Previous Login Time */}
          <div className="bg-white/10 backdrop-blur-xs border border-white/10 rounded-xl p-3 flex flex-col justify-between w-full min-w-0 sm:col-span-2 md:col-span-1">
            <div className="flex items-center justify-between text-3xs sm:text-2xs text-slate-300 font-semibold uppercase tracking-wider mb-1">
              <span>Previous Login</span>
              <span className="text-amber-300">📜</span>
            </div>
            <div className="text-xs sm:text-sm font-semibold text-white font-mono truncate">
              {data.lastLoginDateTime || '—'}
            </div>
            <div className="text-3xs text-slate-300 font-medium mt-1">
              Last Recorded Access
            </div>
          </div>
        </div>

      </div>

      {/* Extra Row if provided (e.g. for University or College Dashboards) */}
      {extraRow && (
        <div className="mt-4 pt-4 border-t border-white/15">
          {extraRow}
        </div>
      )}
    </div>
  )
}
