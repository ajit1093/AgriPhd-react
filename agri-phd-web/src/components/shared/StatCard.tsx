type StatCardColor = 'blue' | 'green' | 'yellow' | 'pink'

interface StatCardProps {
  label: string
  value: string | number
  color: StatCardColor
  icon?: string
  subtext?: string
}

const colorConfig: Record<StatCardColor, {
  borderAccent: string
  iconBg: string
  iconColor: string
  badgeBg: string
  badgeText: string
  defaultIcon: string
}> = {
  blue: {
    borderAccent: 'border-l-blue-600 hover:border-l-blue-700',
    iconBg: 'bg-blue-50 group-hover:bg-blue-100/80',
    iconColor: 'text-blue-600',
    badgeBg: 'bg-blue-50/80 border-blue-200/60',
    badgeText: 'text-blue-700',
    defaultIcon: '👥',
  },
  green: {
    borderAccent: 'border-l-emerald-600 hover:border-l-emerald-700',
    iconBg: 'bg-emerald-50 group-hover:bg-emerald-100/80',
    iconColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50/80 border-emerald-200/60',
    badgeText: 'text-emerald-700',
    defaultIcon: '🔒',
  },
  yellow: {
    borderAccent: 'border-l-amber-500 hover:border-l-amber-600',
    iconBg: 'bg-amber-50 group-hover:bg-amber-100/80',
    iconColor: 'text-amber-600',
    badgeBg: 'bg-amber-50/80 border-amber-200/60',
    badgeText: 'text-amber-800',
    defaultIcon: '🛡️',
  },
  pink: {
    borderAccent: 'border-l-rose-600 hover:border-l-rose-700',
    iconBg: 'bg-rose-50 group-hover:bg-rose-100/80',
    iconColor: 'text-rose-600',
    badgeBg: 'bg-rose-50/80 border-rose-200/60',
    badgeText: 'text-rose-700',
    defaultIcon: '📊',
  },
}

/**
 * P6-THEME-17 — Executive Modern KPI Metric StatCard
 * Elevated card design with crisp typography, icon accents, and responsive layout.
 */
export function StatCard({ label, value, color, icon, subtext }: StatCardProps) {
  const conf = colorConfig[color]
  const displayIcon = icon || conf.defaultIcon

  return (
    <div
      className={`group bg-white rounded-xl border border-slate-200/90 border-l-[5px] ${conf.borderAccent} p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between relative overflow-hidden`}
    >
      {/* Top row: Label and Icon Pill */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <h6 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-700 transition-colors">
          {label}
        </h6>
        <div
          className={`w-10 h-10 rounded-lg ${conf.iconBg} flex items-center justify-center text-lg shrink-0 transition-colors shadow-2xs`}
        >
          {displayIcon}
        </div>
      </div>

      {/* Middle row: Big Bold Value */}
      <div className="mb-2">
        <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
          {value !== undefined && value !== null ? value : '0'}
        </div>
      </div>

      {/* Bottom row: Live Status Pill */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs">
        <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded border ${conf.badgeBg} ${conf.badgeText}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span>{subtext || 'Live Synchronized'}</span>
        </span>
        <span className="text-slate-400 font-medium">Session 2026-27</span>
      </div>
    </div>
  )
}
