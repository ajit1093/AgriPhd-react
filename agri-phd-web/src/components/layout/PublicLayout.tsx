import { Link, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '@/api/notifications'
import { PUBLIC_ROUTES } from '@/router/routes'
import { AiChatWidget } from '@/components/ai/AiChatWidget'

/**
 * P6-THEME-07 — Modernized Public Layout Shell
 * MCAER Pune — Doctoral Admissions
 */
export function PublicLayout() {
  const { pathname } = useLocation()

  const { data: openData } = useQuery({
    queryKey: ['registration', 'is-open'],
    queryFn:  () => notificationApi.isRegistrationOpen(),
    staleTime: 0,
  })
  const registrationOpen = openData?.isOpen ?? false

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800 font-sans">

      {/* ── Top Institutional Header ────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200/90 shadow-2xs no-print">
        {/* Subtle academic top accent band */}
        <div className="h-1 bg-gradient-to-r from-academic-navy via-amber-500 to-agriculture" />

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="/mcaer-logo.png"
              alt="MCAER Official Logo"
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain shrink-0 drop-shadow-2xs"
            />
            <div>
              <p className="text-base sm:text-lg font-bold text-slate-950 leading-tight tracking-tight">
                महाराष्ट्र कृषी शिक्षण व संशोधन परिषद, पुणे
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-tight mt-0.5">
                Maharashtra Council of Agriculture Education and Research, Pune
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-academic-navy to-primary-900 text-white shadow-2xs tracking-wide uppercase">
                  Doctor of Philosophy (Ph.D.) Admissions 2026-27
                </span>
                <span className="text-xs text-slate-500 font-medium hidden md:inline">
                  State Agricultural Universities of Maharashtra
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Contacts */}
          <div className="hidden lg:flex flex-col items-end text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Official Helpline</span>
            <span className="font-bold text-primary-900 text-sm font-mono">8806612998</span>
            <span className="text-3xs text-emerald-700 font-semibold">10:00 AM - 06:00 PM (Working Days)</span>
          </div>
        </div>
      </header>

      {/* ── Main Navigation Bar ────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 bg-[#0B1D33] border-b border-slate-800/80 shadow-md backdrop-blur-md no-print"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-12">
          {/* Left Nav items */}
          <ul className="flex items-center space-x-1 list-none m-0 p-0" role="menubar">
            <NavItem to={PUBLIC_ROUTES.home} current={pathname} label="Home" />
            <NavItem to={PUBLIC_ROUTES.searchCollege} current={pathname} label="Search College" />
          </ul>

          {/* Right Action buttons */}
          <div className="flex items-center gap-3">
            {registrationOpen ? (
              <>
                <Link
                  to={PUBLIC_ROUTES.register}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-agriculture hover:bg-agriculture-600 text-white shadow-xs transition-all hover:shadow"
                >
                  <span>📝</span>
                  <span>New Registration</span>
                </Link>
                <Link
                  to={PUBLIC_ROUTES.login}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/25 transition-all"
                >
                  <span>🔐</span>
                  <span>Log In</span>
                </Link>
              </>
            ) : (
              <Link
                to={PUBLIC_ROUTES.login}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-primary-600 hover:bg-primary-700 text-white shadow-xs transition-all"
              >
                <span>🔐</span>
                <span>Log In</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ── Page Content Container ────────────────────────────────────────── */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8" id="main-content">
        <Outlet />
      </main>

      {/* ── Institutional Footer ─────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800 no-print" role="contentinfo">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Column 1: Contact Us */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
                Contact Us
              </h3>
              <address className="not-italic text-xs leading-relaxed text-slate-300">
                <strong className="text-white text-sm">Maharashtra Council of Agriculture Education and Research</strong><br />
                132/B, Bhamburda, Bhosale Nagar,<br />
                Pune, Maharashtra 411007
              </address>
            </div>

            {/* Column 2: Important Links */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
                Important Links
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <ul className="space-y-2 list-none p-0 m-0">
                  <li>
                    <Link to={PUBLIC_ROUTES.about} className="hover:text-white transition-colors text-slate-300 no-underline font-medium">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link to={PUBLIC_ROUTES.privacyPolicy} className="hover:text-white transition-colors text-slate-300 no-underline font-medium">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link to={PUBLIC_ROUTES.disclaimer} className="hover:text-white transition-colors text-slate-300 no-underline font-medium">
                      Disclaimer
                    </Link>
                  </li>
                </ul>
                <ul className="space-y-2 list-none p-0 m-0">
                  <li>
                    <Link to={PUBLIC_ROUTES.terms} className="hover:text-white transition-colors text-slate-300 no-underline font-medium">
                      Terms &amp; Conditions
                    </Link>
                  </li>
                  <li>
                    <Link to={PUBLIC_ROUTES.refundPolicy} className="hover:text-white transition-colors text-slate-300 no-underline font-medium">
                      Refund Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 3: Helpdesk */}
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-3">
                Admission Helpdesk
              </h3>
              <p className="text-xs leading-relaxed text-slate-300">
                Helpline: <strong className="text-white text-sm font-mono">8806612998</strong><br />
                Timings: 10:00 AM to 06:00 PM (All Working Days)<br />
                Email: <span className="text-sky-300 font-medium">mcaer.admission@gmail.com</span>
              </p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>© MCAER Pune. All Rights Reserved.</span>
            <span>Online Ph.D. Agriculture Centralized Admissions Portal 2026-27</span>
          </div>
        </div>
      </footer>

      {/* Multilingual AI Admission Copilot */}
      <div className="no-print">
        <AiChatWidget />
      </div>
    </div>
  )
}

function NavItem({ to, current, label }: { to: string; current: string; label: string }) {
  const isActive = current === to || (to !== '/' && current.startsWith(to))
  return (
    <li role="none">
      <Link
        to={to}
        aria-current={isActive ? 'page' : undefined}
        role="menuitem"
        className={[
          'px-4 py-2 rounded-lg text-sm font-semibold transition-all inline-block no-underline',
          isActive
            ? 'bg-white/20 text-white shadow-xs ring-1 ring-white/25'
            : 'text-slate-200 hover:text-white hover:bg-white/10',
        ].join(' ')}
      >
        {label}
      </Link>
    </li>
  )
}
