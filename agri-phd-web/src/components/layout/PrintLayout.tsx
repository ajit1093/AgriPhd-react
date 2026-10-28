import { Outlet } from 'react-router-dom'

/**
 * P1-LAYOUT-03 / P6-THEME-16 — PrintLayout.
 * Official print layout with MCAER official emblem header.
 * Used for allotment letters, admission letters, application form print, and receipts.
 */
export function PrintLayout() {
  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans">
      <header className="border-b-2 border-neutral-300 px-6 sm:px-8 py-3 print:py-2">
        <div className="flex items-center gap-4">
          <img
            src="/mcaer-logo.png"
            alt="MCAER Official Logo"
            className="w-14 h-14 object-contain shrink-0"
          />
          <div>
            <h1 className="font-bold text-neutral-900 text-sm leading-tight">
              महाराष्ट्र कृषी शिक्षण व संशोधन परिषद, पुणे
            </h1>
            <h2 className="font-semibold text-neutral-800 text-xs leading-tight">
              Maharashtra Council of Agriculture Education and Research, Pune
            </h2>
            <p className="text-2xs text-neutral-600 mt-0.5">
              Doctor of Philosophy (Ph.D.) Admissions 2026-27
            </p>
          </div>
        </div>
      </header>

      <main className="px-6 sm:px-8 py-6 print:px-0 print:py-2">
        <Outlet />
      </main>
    </div>
  )
}
