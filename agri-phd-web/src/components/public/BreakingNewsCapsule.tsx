import { useState, useMemo } from 'react'
import type { NotificationItem } from '@/types/notification'

interface BreakingNewsCapsuleProps {
  announcements?: NotificationItem[]
  notifications?: NotificationItem[]
}

export function BreakingNewsCapsule({ announcements, notifications }: BreakingNewsCapsuleProps) {
  const [paused, setPaused] = useState(false)

  const items = useMemo(() => {
    if (announcements && announcements.length > 0) {
      return announcements
    }
    if (notifications && notifications.length > 0) {
      return notifications
    }
    return [
      {
        notificationID: 101,
        notificationCategoryID: 1,
        notificationCategory: 'Admissions',
        notificationTitle: 'Doctor of Philosophy (Ph.D.) Centralized Admissions is LIVE',
        contentType: 'T',
        textContent:
          'Doctor of Philosophy (Ph.D.) Centralized Admissions is LIVE across MPKV Rahuri, PDKV Akola, VNMKV Parbhani & BSKKV Dapoli.',
        fileContentURL: '',
        displayNewImage: 1,
        openInNewPage: 0,
        publishDateTime: null,
        publishDateTimeF: '',
      },
      {
        notificationID: 102,
        notificationCategoryID: 1,
        notificationCategory: 'Registration',
        notificationTitle: 'Online Registration & Document E-Scrutiny Verification Portal Active',
        contentType: 'T',
        textContent:
          'Candidates can complete New Candidate Registration, application submission, and document e-scrutiny online.',
        fileContentURL: '',
        displayNewImage: 0,
        openInNewPage: 0,
        publishDateTime: null,
        publishDateTimeF: '',
      },
      {
        notificationID: 103,
        notificationCategoryID: 1,
        notificationCategory: 'Helpline',
        notificationTitle: 'Official Admission Helpline: 8806612998 (10:00 AM - 06:00 PM)',
        contentType: 'T',
        textContent:
          'Official Admission Helpline: 8806612998 | Email: phd.mcaer@gmail.com (10:00 AM - 06:00 PM on Working Days)',
        fileContentURL: '',
        displayNewImage: 0,
        openInNewPage: 0,
        publishDateTime: null,
        publishDateTimeF: '',
      },
    ] as NotificationItem[]
  }, [announcements, notifications])

  const tickerItems = useMemo(() => {
    if (items.length === 0) return []
    const repeatFactor = Math.max(3, Math.ceil(12 / items.length))
    const list: NotificationItem[] = []
    for (let i = 0; i < repeatFactor; i++) {
      list.push(...items)
    }
    return list
  }, [items])

  return (
    <section
      aria-label="Important Admissions Announcements"
      className="w-full bg-white/95 rounded-2xl border border-emerald-200/70 shadow-xs overflow-hidden flex items-center group relative backdrop-blur-xs"
    >
      {/* Pastel Capsule Badge */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-800 text-white px-4 py-2.5 text-xs font-semibold flex items-center gap-2 shrink-0 z-10 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
        <span className="uppercase tracking-wider text-3xs sm:text-2xs font-bold hidden sm:inline">
          Announcements
        </span>
        <span className="uppercase tracking-wider text-3xs font-bold sm:hidden">News</span>
      </div>

      {/* Scrolling Marquee */}
      <div aria-live="polite" className="flex-1 overflow-hidden relative h-10 sm:h-11 flex items-center px-4">
        <div
          className={[
            'inline-flex gap-10 whitespace-nowrap text-xs font-medium text-slate-700 transition-all select-none',
            paused ? '[animation-play-state:paused]' : 'animate-marquee group-hover:[animation-play-state:paused]',
          ].join(' ')}
        >
          {tickerItems.map((item, idx) => (
            <TickerItem key={`tk1-${item.notificationID}-${idx}`} item={item} />
          ))}
          {tickerItems.map((item, idx) => (
            <TickerItem key={`tk2-${item.notificationID}-${idx}`} item={item} />
          ))}
        </div>
      </div>

      {/* Play / Pause Toggle Button */}
      <div className="px-3 shrink-0 bg-stone-50/80 border-l border-emerald-100 h-10 sm:h-11 flex items-center">
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Resume announcements marquee' : 'Pause announcements marquee'}
          title={paused ? 'Play Marquee' : 'Pause Marquee'}
          className="text-slate-500 hover:text-emerald-800 p-1.5 text-xs sm:text-sm cursor-pointer rounded-lg hover:bg-emerald-50 transition-colors"
        >
          {paused ? '▶' : '⏸'}
        </button>
      </div>
    </section>
  )
}

function TickerItem({ item }: { item: NotificationItem }) {
  const isPlain = item.contentType === 'T' || !item.fileContentURL

  return (
    <span className="inline-flex items-center gap-2.5">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" aria-hidden="true" />
      {isPlain ? (
        <span className="font-medium text-slate-800 hover:text-emerald-900 transition-colors">
          {item.textContent || item.notificationTitle}
        </span>
      ) : (
        <a
          href={item.fileContentURL}
          target={item.openInNewPage === 1 ? '_blank' : '_self'}
          rel="noreferrer"
          className="text-emerald-800 hover:text-emerald-950 font-semibold hover:underline inline-flex items-center gap-1.5 no-underline"
        >
          <span>{item.notificationTitle}</span>
          <span className="text-3xs bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-1.5 py-0.2 rounded font-semibold">
            PDF ↗
          </span>
        </a>
      )}
      {item.displayNewImage === 1 && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-rose-500 text-white text-3xs font-bold rounded-full uppercase tracking-wider animate-pulse">
          NEW
        </span>
      )}
    </span>
  )
}

