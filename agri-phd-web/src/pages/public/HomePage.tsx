import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '@/api/notifications'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { NotificationItem, ImportantDateItem } from '@/types/notification'

type TabId = 'notifications' | 'brochure' | 'schedule' | 'downloads'

const TABS: { id: TabId; label: string; icon: string; desc: string }[] = [
  { id: 'notifications', label: 'Notifications & Circulars', icon: '📢', desc: 'Official admission notifications' },
  { id: 'brochure',      label: 'Admission Prospectus',      icon: '📘', desc: 'Rules & seat distributions' },
  { id: 'schedule',      label: 'Admission Schedule',        icon: '📅', desc: 'CAP round key dates' },
  { id: 'downloads',     label: 'Forms & Downloads',         icon: '📥', desc: 'Proformas and annexures' },
]

function getCategoryBadge(category: string) {
  switch (category?.toLowerCase()) {
    case 'registration':
      return 'bg-emerald-50 text-emerald-800 border-emerald-200'
    case 'application':
      return 'bg-blue-50 text-blue-800 border-blue-200'
    case 'verification':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200'
    case 'merit list':
      return 'bg-purple-50 text-purple-800 border-purple-200'
    case 'allotment':
      return 'bg-teal-50 text-teal-800 border-teal-200'
    case 'admission':
      return 'bg-amber-50 text-amber-900 border-amber-200'
    case 'grievance':
      return 'bg-rose-50 text-rose-800 border-rose-200'
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200'
  }
}

function formatScheduleDateTime(dateStr?: string | null, formattedStr?: string) {
  if (formattedStr && formattedStr.trim()) {
    const parts = formattedStr.trim().split(' ')
    if (parts.length >= 2) {
      const [d, m, y] = parts[0].split('-')
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      const mIdx = parseInt(m, 10) - 1
      const monthName = months[mIdx] || m
      return {
        date: `${d} ${monthName} ${y}`,
        time: parts[1],
      }
    }
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
      // ignore
    }
  }
  return { date: formattedStr || 'To be announced', time: '' }
}


const ADMISSION_FLOW_STEPS = [
  {
    step: '01',
    title: 'Candidate Registration',
    desc: 'Register with basic details, mobile & email. Verify using OTP to generate permanent Login ID.',
    icon: (
      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
      </svg>
    ),
  },
  {
    step: '02',
    title: 'Application Form Filling',
    desc: 'Fill personal details, reservation category, academic marks, CGPA, research papers & preferences.',
    icon: (
      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    step: '03',
    title: 'Upload Documents & Pay Fee',
    desc: 'Upload scanned photograph, signature, required marksheets & certificates, then pay fee online.',
    icon: (
      <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
    ),
  },
  {
    step: '04',
    title: 'Online E-Scrutiny Verification',
    desc: 'Assigned E-Verification Center (EVC) officer scrutinizes and verifies uploaded documents.',
    icon: (
      <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    step: '05',
    title: 'Merit Allotment & College Admission',
    desc: 'Provisional & final merit list, Centralized Allotment Process (CAP) rounds, and college admission.',
    icon: (
      <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
]

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

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', 'home'],
    queryFn:  () => notificationApi.getHome(1, false),
    staleTime: 5_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
  })

  const [activeTab, setActiveTab]           = useState<TabId>('notifications')
  const [popupDismissed, setPopupDismissed] = useState(false)
  const [paused, setPaused]                 = useState(false)

  const [dateFilter, setDateFilter] = useState<'all' | 'active' | 'upcoming'>('all')

  // Keep ONLY Active and Upcoming dates — completely exclude past/completed dates
  const activeAndUpcomingDates: ImportantDateItem[] = useMemo(() => {
    return (data?.importantDates ?? []).filter(
      d => d.status.toLowerCase() === 'active' || d.status.toLowerCase() === 'upcoming'
    )
  }, [data?.importantDates])

  const filteredDates = useMemo(() => {
    if (dateFilter === 'all') return activeAndUpcomingDates
    return activeAndUpcomingDates.filter(d => d.status.toLowerCase() === dateFilter)
  }, [activeAndUpcomingDates, dateFilter])

  const activeCount = useMemo(
    () => activeAndUpcomingDates.filter(d => d.status.toLowerCase() === 'active').length,
    [activeAndUpcomingDates]
  )
  const upcomingCount = useMemo(
    () => activeAndUpcomingDates.filter(d => d.status.toLowerCase() === 'upcoming').length,
    [activeAndUpcomingDates]
  )



  const tabContent: Record<TabId, NotificationItem[]> = {
    notifications: data?.notifications ?? [],
    brochure:      data?.news          ?? [],
    schedule:      data?.schedule      ?? [],
    downloads:     data?.downloads     ?? [],
  }

  const currentTabItems = tabContent[activeTab] ?? []

  // Announcements ticker list: Priority to DB announcements, plus active circulars/notices
  const announcementList = useMemo(() => {
    if (data?.announcements && data.announcements.length > 0) {
      return data.announcements
    }
    return [
      ...(data?.notifications ?? []).map(n => ({
        notificationID: n.notificationID,
        notificationTitle: n.notificationTitle,
        contentType: n.contentType,
        textContent: n.textContent || n.notificationTitle,
        fileContentURL: n.fileContentURL,
        openInNewPage: n.openInNewPage,
        displayNewImage: n.displayNewImage,
      })),
      {
        notificationID: 'notice-cap',
        notificationTitle: 'Doctor of Philosophy (Ph.D.) Centralized Admissions 2026-27 is LIVE',
        contentType: 'T',
        textContent: 'Doctor of Philosophy (Ph.D.) Centralized Admissions 2026-27 is LIVE across MPKV Rahuri, PDKV Akola, VNMKV Parbhani & BSKKV Dapoli.',
        displayNewImage: 1,
      },
      {
        notificationID: 'notice-reg',
        notificationTitle: 'Online Registration & Document E-Scrutiny Verification',
        contentType: 'T',
        textContent: 'Candidates can complete New Candidate Registration, application submission, and document e-scrutiny online.',
        displayNewImage: 0,
      },
      {
        notificationID: 'notice-help',
        notificationTitle: 'Official Admission Helpline: 8806612998 (10:00 AM - 06:00 PM)',
        contentType: 'T',
        textContent: 'Official Admission Helpline: 8806612998 | Email: mcaer.admission@gmail.com (10:00 AM - 06:00 PM on Working Days)',
        displayNewImage: 0,
      },
    ]
  }, [data?.announcements, data?.notifications])

  // Repeated announcements so the continuous marquee flows seamlessly on any screen resolution
  const tickerItems = useMemo(() => {
    if (!announcementList || announcementList.length === 0) return []
    const repeatFactor = Math.max(3, Math.ceil(12 / announcementList.length))
    const list: typeof announcementList = []
    for (let i = 0; i < repeatFactor; i++) {
      list.push(...announcementList)
    }
    return list
  }, [announcementList])

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <Spinner size="lg" label="Loading Official Admissions Portal…" />
        <p className="text-slate-500 text-sm font-medium">Connecting to official admissions database…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── 1. Announcement Marquee Ticker (Running continuously above notification box) ── */}
      <section
        aria-label="Important Admissions Announcements"
        className="w-full bg-white border border-slate-300/80 rounded-xl shadow-xs overflow-hidden flex items-center group relative ring-1 ring-slate-100"
      >
        {/* Ticker Badge matching legacy .btn-announcement */}
        <div className="bg-[#0B1D33] text-white px-4 py-2.5 font-bold text-xs flex items-center gap-2 shrink-0 z-10 shadow-sm border-r border-slate-700">
          <span className="text-amber-400 text-sm animate-pulse">📢</span>
          <span className="uppercase tracking-wider font-extrabold hidden sm:inline text-white">Announcements</span>
          <span className="uppercase tracking-wider font-extrabold sm:hidden text-white">News</span>
        </div>

        {/* Scrolling Marquee */}
        <div
          aria-live="polite"
          className="flex-1 overflow-hidden relative h-11 flex items-center px-4"
        >
          <div
            className={[
              'inline-flex gap-12 whitespace-nowrap text-xs sm:text-sm font-medium text-slate-800 transition-all select-none',
              paused ? '[animation-play-state:paused]' : 'animate-marquee group-hover:[animation-play-state:paused]',
            ].join(' ')}
          >
            {tickerItems.map((item, idx) => (
              <AnnouncementTickerItem key={`tk1-${item.notificationID}-${idx}`} item={item} />
            ))}
            {tickerItems.map((item, idx) => (
              <AnnouncementTickerItem key={`tk2-${item.notificationID}-${idx}`} item={item} />
            ))}
          </div>
        </div>

        {/* Play / Pause button matching legacy .marquee-sibling */}
        <div className="px-3 shrink-0 bg-slate-50 border-l border-slate-200 h-11 flex items-center">
          <button
            type="button"
            onClick={() => setPaused(p => !p)}
            aria-label={paused ? 'Resume announcements marquee' : 'Pause announcements marquee'}
            title={paused ? 'Play Marquee' : 'Pause Marquee'}
            className="text-slate-600 hover:text-slate-950 p-1.5 text-base cursor-pointer rounded-lg hover:bg-slate-200 transition-colors"
          >
            {paused ? '▶' : '⏸'}
          </button>
        </div>
      </section>

      {/* ── 2. Official Notice Board & Document Repository Card (Full Width at Top) ── */}
      <div className="l-card shadow-card">
        {/* Card Header */}
        <div className="l-card-header flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </span>
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">
              Official Notifications, Circulars & Documents
            </span>
          </div>
          <span className="text-2xs bg-white/10 text-slate-200 px-3 py-1 rounded-full uppercase tracking-wider font-semibold border border-white/15">
            Official Notice Board
          </span>
        </div>

        {/* Horizontal Category Tabs */}
        <div className="bg-slate-100/90 border-b border-slate-200 p-2 sm:p-3">
          <ul
            role="tablist"
            aria-label="Portal Admission Sections"
            className="grid grid-cols-2 lg:grid-cols-4 gap-2 list-none p-0 m-0"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id
              const count = tabContent[tab.id]?.length ?? 0
              return (
                <li key={tab.id} role="none">
                  <button
                    role="tab"
                    id={`tab-${tab.id}`}
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${tab.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'w-full py-3 px-4 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-between gap-2 transition-all cursor-pointer border text-left',
                      isActive
                        ? 'bg-academic-navy text-white border-academic-navy shadow-sm ring-1 ring-white/10'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900',
                    ].join(' ')}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-base shrink-0" aria-hidden="true">{tab.icon}</span>
                      <span className="truncate">{tab.label}</span>
                    </div>
                    <span
                      className={[
                        'px-2 py-0.5 text-2xs font-extrabold rounded-full shrink-0',
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-100 text-slate-700 border border-slate-200',
                      ].join(' ')}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Tab Panel Content */}
        <div className="p-4 sm:p-6 min-h-[280px]">
          {isError ? (
            <div className="text-center py-16 px-4 text-slate-500 text-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center text-xl mb-3">⚠️</div>
              <p className="text-rose-600 font-bold mb-1">Unable to load official notifications</p>
              <p className="text-xs text-slate-400">Please refresh the page or try again later.</p>
            </div>
          ) : (
            <div
              role="tabpanel"
              id={`tabpanel-${activeTab}`}
              aria-labelledby={`tab-${activeTab}`}
              className="space-y-3"
            >
              {currentTabItems.length === 0 ? (
                <div className="text-center py-16 px-4 text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 mx-auto flex items-center justify-center text-3xl mb-3 shadow-2xs">
                    📋
                  </div>
                  <p className="text-base font-bold text-slate-700">No documents published yet in this section</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                    Official circulars, prospectuses, schedules, or downloads will appear here as soon as published by the Admission Authority.
                  </p>
                </div>
              ) : (
                <ul className="space-y-3 list-none p-0 m-0">
                  {currentTabItems.map(item => (
                    <NotificationRow key={item.notificationID} item={item} />
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Dual Boxes in One Line: Flow Chart + Universities (Below Notification) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* ── Left Box: Ph.D. Admission Process Flow Chart (Fills Box With No Empty Space) ── */}
        <div className="l-card shadow-card flex flex-col">
          <div className="l-card-header flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </span>
              <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                Ph.D. Admission Process Flow Chart
              </span>
            </div>
            <span className="text-2xs bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-white/15">
              5-Stage CAP
            </span>
          </div>

          <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
            {/* 5 Vertical Stages Distributed Evenly To Fill Full Height */}
            <div className="flex-1 flex flex-col justify-between space-y-4">
              {ADMISSION_FLOW_STEPS.map((step, idx) => (
                <div key={step.step} className="relative flex items-start gap-3.5 group">
                  {/* Step Badge with Icon & Connector */}
                  <div className="flex flex-col items-center shrink-0 self-stretch">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs group-hover:border-emerald-500/50 transition-colors">
                      {step.icon}
                    </div>
                    {/* Vertical Connector Line */}
                    {idx < ADMISSION_FLOW_STEPS.length - 1 && (
                      <div className="w-0.5 flex-1 bg-slate-200 my-1" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-2xs font-extrabold px-1.5 py-0.5 rounded bg-academic-navy text-white">
                        {step.step}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 leading-snug">
                        {step.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Balance Strip (Eliminates bottom empty space) */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Processed sequentially via candidate portal
              </span>
              <span className="font-semibold text-slate-600 font-mono">CAP 2026-27</span>
            </div>
          </div>
        </div>

        {/* ── Right Box: Important Dates & Admission Schedule (Active & Upcoming Only) ── */}
        <div className="l-card shadow-card flex flex-col">
          <div className="l-card-header flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <span className="text-sm sm:text-base font-bold tracking-tight text-white">
                Important Dates & Admission Schedule
              </span>
            </div>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-2xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {activeCount} Active Now
                </span>
              )}
              <span className="text-2xs bg-white/10 text-slate-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider font-semibold border border-white/15">
                CAP 2026-27
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
            {/* Quick Status Filter Tabs (Only Active & Upcoming, No Past) */}
            <div className="flex items-center justify-between flex-wrap gap-2 pb-1 border-b border-slate-100">
              <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto text-xs">
                <button
                  type="button"
                  onClick={() => setDateFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-colors cursor-pointer ${
                    dateFilter === 'all'
                      ? 'bg-academic-navy text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({activeAndUpcomingDates.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('active')}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    dateFilter === 'active'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Now ({activeCount})
                </button>
                <button
                  type="button"
                  onClick={() => setDateFilter('upcoming')}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                    dateFilter === 'upcoming'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Upcoming ({upcomingCount})
                </button>
              </div>

              <span className="text-3xs text-slate-600 font-medium hidden sm:inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Database Live
              </span>
            </div>

            {/* Scrollable list of Active & Upcoming Dates (headings with dates) */}
            <div className="overflow-y-auto max-h-[385px] space-y-2.5 pr-1 focus:outline-none">
              {filteredDates.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center text-2xl mb-2">
                    📅
                  </div>
                  <p className="text-xs font-bold text-slate-700">No active or upcoming dates</p>
                  <p className="text-3xs text-slate-500 mt-0.5">Please check official circulars for new announcements.</p>
                </div>
              ) : (
                filteredDates.map((item) => {
                  const isOngoing = item.status.toLowerCase() === 'active'
                  const startDt = formatScheduleDateTime(item.startDate, item.startDateFormatted)
                  const endDt = formatScheduleDateTime(item.endDate, item.endDateFormatted)
                  const isSingleDate = !item.endDate || item.endDateFormatted === item.startDateFormatted || (startDt.date === endDt.date && startDt.time === endDt.time)

                  return (
                    <div
                      key={`${item.sequence}-${item.activityCode}`}
                      className={`p-3 sm:p-3.5 rounded-xl border transition-all duration-200 ${
                        isOngoing
                          ? 'bg-emerald-50/60 border-emerald-300 ring-1 ring-emerald-200/80 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-amber-300 hover:shadow-2xs'
                      }`}
                    >
                      {/* Heading Row: Title, Category & Status Badge */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                              {item.title}
                            </h4>
                            <span className={`px-2 py-0.5 rounded text-3xs font-bold border uppercase tracking-wider ${getCategoryBadge(item.category)}`}>
                              {item.category}
                            </span>
                          </div>
                          {item.subtitle && (
                            <p className="text-3xs text-slate-500 mt-0.5 leading-relaxed">
                              {item.subtitle}
                            </p>
                          )}
                        </div>

                        {/* Status Badge */}
                        {isOngoing ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-extrabold bg-emerald-600 text-white shrink-0 shadow-2xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                            ACTIVE NOW
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                            UPCOMING
                          </span>
                        )}
                      </div>

                      {/* Dates Row (Just Dates with clean icons & times) */}
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between flex-wrap gap-2 text-2xs sm:text-xs">
                        {isSingleDate ? (
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-3xs uppercase font-bold text-slate-400">Date:</span>
                            <span className="font-bold text-slate-900">{startDt.date}</span>
                            {startDt.time && <span className="text-slate-500 font-mono text-3xs">({startDt.time})</span>}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                              <span className="text-3xs uppercase font-bold text-slate-400">From:</span>
                              <span className="font-bold text-slate-900">{startDt.date}</span>
                              {startDt.time && <span className="text-slate-500 font-mono text-3xs">({startDt.time})</span>}
                            </div>
                            <span className="text-slate-300 font-bold hidden sm:inline">→</span>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0"></span>
                              <span className="text-3xs uppercase font-bold text-slate-400">To:</span>
                              <span className="font-bold text-rose-900">{endDt.date}</span>
                              {endDt.time && <span className="text-rose-700 font-mono text-3xs">({endDt.time})</span>}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Bottom Balance Strip */}
            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-3xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Live schedule dates synchronized with MCAER database
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('schedule')
                  window.scrollTo({ top: 380, behavior: 'smooth' })
                }}
                className="font-semibold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
              >
                View Circulars →
              </button>
            </div>
          </div>
        </div>


      </div>

      {/* ── 4. Priority Notice Modal (from DB popup) ─────────────────────────── */}
      {data?.popup && !popupDismissed && (
        <Modal
          open
          onClose={() => setPopupDismissed(true)}
          title={data.popup.notificationTitle}
          maxWidth="max-w-2xl"
        >
          <div className="text-sm text-slate-700 leading-relaxed py-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping"></span>
                OFFICIAL NOTICE / PUBLIC ANNOUNCEMENT
              </span>
              {data.popup.displayNewImage === 1 && <NewBadge />}
            </div>

            {data.popup.textContent && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 text-sm leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                {data.popup.textContent}
              </div>
            )}

            {data.popup.fileContentURL && (
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-2xs font-bold text-emerald-800 uppercase tracking-wider block">Attached Document</span>
                  <span className="text-xs font-semibold text-slate-900 truncate block">Click to view official circular</span>
                </div>
                <a
                  href={data.popup.fileContentURL}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors no-underline"
                >
                  <span>Open PDF</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            )}

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-3xs text-slate-500">
                Notice ID: #{data.popup.notificationID} • Published by Admission Authority
              </span>
              <button
                type="button"
                onClick={() => setPopupDismissed(true)}
                className="px-5 py-2 bg-academic-navy hover:bg-slate-900 text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs hover:shadow transition-all cursor-pointer"
              >
                Close Notice
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  )
}

function AnnouncementTickerItem({
  item,
}: {
  item: {
    notificationID: number | string
    notificationTitle: string
    contentType: string
    textContent: string
    fileContentURL?: string
    openInNewPage?: number
    displayNewImage?: number
  }
}) {
  return (
    <span className="inline-flex items-center gap-3">
      {/* Bullet dot matching legacy <i class='fas fa-circle fa-1x me-1'></i> */}
      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-2xs" aria-hidden="true" />
      {item.contentType === 'T' || !item.fileContentURL ? (
        <span className="font-semibold text-slate-800 hover:text-slate-950 transition-colors">
          {item.textContent || item.notificationTitle}
        </span>
      ) : (
        <a
          href={item.fileContentURL}
          target={item.openInNewPage === 1 ? '_blank' : '_self'}
          rel="noreferrer"
          className="text-primary-900 hover:text-emerald-700 font-bold hover:underline transition-colors inline-flex items-center gap-1.5 no-underline"
        >
          <span>{item.notificationTitle}</span>
          <span className="text-2xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-semibold">PDF ↗</span>
        </a>
      )}
      {item.displayNewImage === 1 && <NewBadge />}
    </span>
  )
}

function NotificationRow({ item }: { item: NotificationItem }) {
  const dateInfo = formatNotificationDate(item)

  return (
    <li className="p-4 sm:p-5 rounded-xl border border-slate-200/90 bg-white hover:border-emerald-500/60 hover:bg-slate-50/70 shadow-2xs hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Date & Title Info */}
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {/* Date Box (matching legacy Notifications.ascx parity) */}
        {dateInfo ? (
          <div className="shrink-0 text-center w-16 bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
            <span className="block text-3xs uppercase font-extrabold text-slate-600 bg-slate-200/90 py-0.5 tracking-wider font-mono">
              {dateInfo.monthYear}
            </span>
            <span className="block text-base font-extrabold text-slate-900 py-1 font-mono leading-none">
              {dateInfo.day}
            </span>
          </div>
        ) : (
          <div className="shrink-0 w-12 h-12 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 text-lg shadow-2xs">
            📄
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Official Document
            </span>
            {item.displayNewImage === 1 && <NewBadge />}
          </div>

          {item.contentType === 'T' ? (
            <p className="text-sm sm:text-base font-medium text-slate-800 leading-relaxed m-0">
              {item.textContent}
            </p>
          ) : (
            <a
              href={item.fileContentURL}
              target={item.openInNewPage === 1 ? '_blank' : '_self'}
              rel="noreferrer"
              className="text-sm sm:text-base font-bold text-slate-900 hover:text-emerald-700 transition-colors leading-snug block no-underline"
            >
              {item.notificationTitle}
            </a>
          )}
        </div>
      </div>

      {/* Action Button */}
      {item.contentType !== 'T' && item.fileContentURL && (
        <div className="shrink-0 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex justify-end">
          <a
            href={item.fileContentURL}
            target={item.openInNewPage === 1 ? '_blank' : '_self'}
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all no-underline cursor-pointer"
          >
            <span>View Document</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      )}
    </li>
  )
}

function NewBadge() {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-600 text-white text-3xs font-extrabold rounded-full uppercase tracking-wider animate-pulse shadow-xs">
      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
      NEW
    </span>
  )
}
