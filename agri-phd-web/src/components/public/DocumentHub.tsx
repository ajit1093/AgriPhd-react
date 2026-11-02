import { useMemo } from 'react'
import type { NotificationItem, ImportantDateItem } from '@/types/notification'

export type TabId = 'notifications' | 'schedule' | 'brochure' | 'downloads'

interface DocumentHubProps {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  tabContent: Record<string, NotificationItem[]>
  importantDates?: ImportantDateItem[]
  isError?: boolean
  dateFilter: 'all' | 'active' | 'upcoming'
  onDateFilterChange: (filter: 'all' | 'active' | 'upcoming') => void
  className?: string
}

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'notifications', label: 'Circulars & Notices', icon: '📢' },
  { id: 'schedule',      label: 'Live Schedule',       icon: '📅' },
  { id: 'brochure',      label: 'Prospectus',          icon: '📘' },
  { id: 'downloads',     label: 'Downloads',           icon: '📥' },
]

function getCategoryBadge(category: string) {
  switch (category?.toLowerCase()) {
    case 'registration':
      return 'bg-emerald-50/80 text-emerald-800 border-emerald-200/60'
    case 'application':
      return 'bg-sky-50/80 text-sky-800 border-sky-200/60'
    case 'verification':
      return 'bg-indigo-50/80 text-indigo-800 border-indigo-200/60'
    case 'merit list':
      return 'bg-purple-50/80 text-purple-800 border-purple-200/60'
    case 'allotment':
      return 'bg-teal-50/80 text-teal-800 border-teal-200/60'
    case 'admission':
      return 'bg-amber-50/80 text-amber-900 border-amber-200/60'
    case 'grievance':
      return 'bg-rose-50/80 text-rose-800 border-rose-200/60'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200/60'
  }
}

function formatScheduleDateTime(dateStr?: string | null, formattedStr?: string) {
  if (formattedStr && formattedStr.trim()) {
    const cleanStr = formattedStr.trim()
    const parts = cleanStr.split(' ')
    if (parts.length >= 1) {
      const datePart = parts[0].split(/[-/]/)
      if (datePart.length === 3 && !isNaN(Number(datePart[0])) && !isNaN(Number(datePart[1]))) {
        const [d, m, y] = datePart
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const mIdx = parseInt(m, 10) - 1
        const monthName = months[mIdx] || m
        const timePart = parts.slice(1).join(' ')
        return {
          date: `${d.padStart(2, '0')} ${monthName} ${y}`,
          time: timePart,
        }
      }
    }
    return { date: cleanStr, time: '' }
  }
  if (dateStr) {
    try {
      const dt = new Date(dateStr)
      if (!isNaN(dt.getTime())) {
        return {
          date: dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
          time: dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
        }
      }
    } catch {
      // fallback
    }
  }
  return { date: formattedStr || 'To be announced', time: '' }
}

function formatNotificationDate(item: NotificationItem) {
  if (item.publishDateTime) {
    try {
      const d = new Date(item.publishDateTime)
      if (!isNaN(d.getTime())) {
        const day = String(d.getDate()).padStart(2, '0')
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
        const monthYear = `${monthNames[d.getMonth()]} ${d.getFullYear()}`
        return { day, monthYear }
      }
    } catch {
      // fallback
    }
  }

  if (item.publishDateTimeF && typeof item.publishDateTimeF === 'string' && item.publishDateTimeF.trim()) {
    const clean = item.publishDateTimeF.trim().split(' ')[0]
    const parts = clean.split(/[-/]/)
    if (parts.length === 3) {
      const [d, m, y] = parts
      const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
      const mIdx = parseInt(m, 10) - 1
      const monthYear = `${monthNames[mIdx] || m} ${y}`
      return { day: d.padStart(2, '0'), monthYear }
    }
  }

  return null
}

function getStatusTheme(status: string) {
  const s = status?.toLowerCase()
  if (s === 'active') {
    return {
      cardBg: 'bg-emerald-50/30 hover:bg-emerald-50/45',
      borderColor: 'border-emerald-200/90',
      accentBorder: 'border-l-[3px] border-l-emerald-600',
      badge: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
      dot: 'bg-emerald-600 animate-pulse',
      label: 'Active',
      dateAccent: 'text-emerald-800 font-semibold',
    }
  }
  if (s === 'upcoming') {
    return {
      cardBg: 'bg-amber-50/30 hover:bg-amber-50/45',
      borderColor: 'border-amber-200/90',
      accentBorder: 'border-l-[3px] border-l-amber-500',
      badge: 'bg-amber-50 text-amber-900 border-amber-200/90',
      dot: 'bg-amber-500',
      label: 'Upcoming',
      dateAccent: 'text-amber-900 font-semibold',
    }
  }
  return {
    cardBg: 'bg-slate-50/40 hover:bg-slate-50/70',
    borderColor: 'border-slate-200',
    accentBorder: 'border-l-[3px] border-l-slate-400',
    badge: 'bg-slate-100 text-slate-600 border-slate-200',
    dot: 'bg-slate-400',
    label: 'Completed',
    dateAccent: 'text-slate-700 font-semibold',
  }
}

export function DocumentHub({
  activeTab,
  onTabChange,
  tabContent,
  importantDates = [],
  isError = false,
  dateFilter,
  onDateFilterChange,
  className,
}: DocumentHubProps) {
  const currentTabItems = tabContent[activeTab] ?? []

  // Keep ONLY Active and Upcoming dates
  const activeAndUpcomingDates: ImportantDateItem[] = useMemo(() => {
    return (importantDates ?? []).filter(
      (d) => d.status.toLowerCase() === 'active' || d.status.toLowerCase() === 'upcoming'
    )
  }, [importantDates])

  const filteredDates = useMemo(() => {
    if (dateFilter === 'all') return activeAndUpcomingDates
    return activeAndUpcomingDates.filter((d) => d.status.toLowerCase() === dateFilter)
  }, [activeAndUpcomingDates, dateFilter])

  const activeCount = useMemo(
    () => activeAndUpcomingDates.filter((d) => d.status.toLowerCase() === 'active').length,
    [activeAndUpcomingDates]
  )
  const upcomingCount = useMemo(
    () => activeAndUpcomingDates.filter((d) => d.status.toLowerCase() === 'upcoming').length,
    [activeAndUpcomingDates]
  )

  return (
    <div className={`rounded-2xl bg-white border border-emerald-100 shadow-xs overflow-hidden flex flex-col h-[600px] ${className ?? ''}`}>
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 px-4 sm:px-5 py-3.5 border-b border-emerald-100 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 text-sm">
            📋
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-slate-900 tracking-tight">
              Official Notice Board &amp; Schedule
            </h3>
            <p className="text-3xs text-emerald-900/80 font-medium font-marathi">
              अधिकृत सूचना फलक व प्रवेश वेळापत्रक
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-3xs bg-white text-emerald-900 px-2 py-0.5 rounded-full font-semibold border border-emerald-200/80 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Notice Board
        </span>
      </div>

      {/* ── Attached Tabs: Aligning Left to Right with Minimum Required Width ── */}
      <div className="bg-[#FAFBF9] border-b border-slate-100 px-3 sm:px-4 py-2 flex items-center justify-start overflow-x-auto shrink-0">
        <div className="inline-flex items-center rounded-xl border border-slate-200/80 bg-white p-0.5 shadow-2xs">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.id
            const count =
              tab.id === 'schedule'
                ? activeAndUpcomingDates.length
                : tabContent[tab.id]?.length ?? 0

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={`shrink-0 w-auto px-2.5 sm:px-3 py-1.5 text-3xs sm:text-2xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer rounded-lg ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <span className="text-xs shrink-0">{tab.icon}</span>
                <span className="shrink-0">{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-3xs font-bold shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Tab Content: Live Schedule View ── */}
      {activeTab === 'schedule' ? (
        <div className="flex-1 min-h-0 flex flex-col p-3 sm:p-4 overflow-hidden">
          {/* Quick Schedule Filter Buttons */}
          <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onDateFilterChange('all')}
                className={`px-2 py-0.5 rounded text-3xs font-semibold transition-colors cursor-pointer ${
                  dateFilter === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                All ({activeAndUpcomingDates.length})
              </button>
              <button
                type="button"
                onClick={() => onDateFilterChange('active')}
                className={`px-2 py-0.5 rounded text-3xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  dateFilter === 'active'
                    ? 'bg-emerald-700 text-white'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active ({activeCount})
              </button>
              <button
                type="button"
                onClick={() => onDateFilterChange('upcoming')}
                className={`px-2 py-0.5 rounded text-3xs font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                  dateFilter === 'upcoming'
                    ? 'bg-amber-700 text-white'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Upcoming ({upcomingCount})
              </button>
            </div>

            <span className="text-3xs text-emerald-800 font-medium hidden sm:inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Live DB
            </span>
          </div>

          {/* Schedule List */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
            {filteredDates.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center text-lg mb-1.5">
                  📅
                </div>
                <p className="text-xs font-semibold text-slate-700">No active or upcoming dates</p>
                <p className="text-3xs text-slate-400">Please refer to the official circulars for upcoming round schedules.</p>
              </div>
            ) : (
              filteredDates.map((item) => {
                const statusTheme = getStatusTheme(item.status)
                const startDt = formatScheduleDateTime(item.startDate, item.startDateFormatted)
                const endDt = formatScheduleDateTime(item.endDate, item.endDateFormatted)
                const isSingleDate =
                  !item.endDate ||
                  item.endDateFormatted === item.startDateFormatted ||
                  (startDt.date === endDt.date && startDt.time === endDt.time)

                return (
                  <div
                    key={`${item.sequence}-${item.activityCode}`}
                    className={`px-3 py-2.5 rounded-lg border transition-all ${statusTheme.cardBg} ${statusTheme.borderColor} ${statusTheme.accentBorder} shadow-2xs`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-xs font-semibold text-slate-900 leading-snug">
                            {item.title}
                          </h4>
                          <span
                            className={`px-1.5 py-0.2 rounded text-3xs font-medium border uppercase tracking-wider ${getCategoryBadge(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                        </div>
                        {item.subtitle && (
                          <p className="text-3xs text-slate-500 mt-0.5 leading-relaxed font-normal">
                            {item.subtitle}
                          </p>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-3xs font-semibold border shrink-0 ${statusTheme.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusTheme.dot}`} />
                        {statusTheme.label}
                      </span>
                    </div>

                    <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-1.5 text-3xs text-slate-600 font-normal">
                      {isSingleDate ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400">Date:</span>
                          <span className={statusTheme.dateAccent}>{startDt.date}</span>
                          {startDt.time && (
                            <span className="text-slate-400 font-mono">({startDt.time})</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">From:</span>
                            <span className="font-semibold text-slate-800">{startDt.date}</span>
                          </div>
                          <span className="text-slate-300">→</span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">To:</span>
                            <span className={statusTheme.dateAccent}>{endDt.date}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        /* ── Tab Content: Document List (Circulars / Prospectus / Downloads) ── */
        <div className="flex-1 min-h-0 p-3 sm:p-4 overflow-y-auto">
          {isError ? (
            <div className="text-center py-12 px-4 text-slate-500 text-xs">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-lg mb-2">
                ⚠️
              </div>
              <p className="text-rose-700 font-semibold mb-1">Unable to load official documents</p>
              <p className="text-3xs text-slate-400">Please refresh the page or check back shortly.</p>
            </div>
          ) : currentTabItems.length === 0 ? (
            <div className="text-center py-12 px-4 text-slate-400">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-400 mx-auto flex items-center justify-center text-xl mb-1.5">
                📄
              </div>
              <p className="text-xs font-semibold text-slate-700">No documents in this section yet</p>
              <p className="text-3xs text-slate-400 mt-0.5">
                Official notices and PDFs will appear here once released by MCAER Pune.
              </p>
            </div>
          ) : (
            <ul className="space-y-2 list-none p-0 m-0">
              {currentTabItems.map((item) => {
                const dateInfo = formatNotificationDate(item)
                return (
                  <li
                    key={item.notificationID}
                    className="p-3 rounded-lg border border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/40 shadow-2xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 group"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      {dateInfo ? (
                        <div className="shrink-0 text-center w-10 bg-slate-50 border border-slate-200 rounded-md overflow-hidden">
                          <span className="block text-3xs font-medium text-slate-500 bg-slate-100 py-0.2 tracking-wider font-mono">
                            {dateInfo.monthYear.split(' ')[0]}
                          </span>
                          <span className="block text-xs font-semibold text-slate-800 py-0.5 font-mono leading-none">
                            {dateInfo.day}
                          </span>
                        </div>
                      ) : (
                        <div className="shrink-0 w-8 h-8 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 text-xs">
                          📄
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <span className="text-3xs font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200/60">
                            Notice #{item.notificationID}
                          </span>
                          {item.displayNewImage === 1 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-rose-50 text-rose-700 border border-rose-200 text-3xs font-semibold rounded-full uppercase tracking-wider">
                              NEW
                            </span>
                          )}
                        </div>

                        {item.contentType === 'T' ? (
                          <p className="text-xs font-normal text-slate-800 leading-relaxed m-0">
                            {item.textContent}
                          </p>
                        ) : (
                          <a
                            href={item.fileContentURL}
                            target={item.openInNewPage === 1 ? '_blank' : '_self'}
                            rel="noreferrer"
                            className="text-xs font-medium text-slate-900 group-hover:text-emerald-800 transition-colors leading-snug block no-underline"
                          >
                            {item.notificationTitle}
                          </a>
                        )}
                      </div>
                    </div>

                    {item.contentType !== 'T' && item.fileContentURL && (
                      <a
                        href={item.fileContentURL}
                        target={item.openInNewPage === 1 ? '_blank' : '_self'}
                        rel="noreferrer"
                        className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-3xs font-medium bg-slate-50 hover:bg-emerald-700 text-slate-700 hover:text-white border border-slate-200 hover:border-emerald-700 transition-colors no-underline cursor-pointer"
                      >
                        <span>PDF</span>
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      )}

      {/* ── Bottom Balance Strip ── */}
      <div className="border-t border-slate-100 bg-[#FAFBF9] px-3 sm:px-4 py-2 flex items-center justify-between text-3xs text-slate-500 shrink-0">
        <span>Published by Admission Authority</span>
        <span className="font-semibold text-emerald-900">Centralized Admissions</span>
      </div>
    </div>
  )
}
