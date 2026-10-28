import { useState, useRef, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { apiClient } from '@/api/client'
import toast from 'react-hot-toast'
import { PUBLIC_ROUTES } from '@/router/routes'
import { useMenu } from '@/hooks/useMenu'
import type { MenuItem } from '@/api/menu'

import { AiChatWidget } from '@/components/ai/AiChatWidget'

const roleNameMap: Record<number, string> = {
  11: 'Super Admin',
  12: 'Admin',
  41: 'EVC Admin',
  42: 'EVC Coordinator',
  61: 'College',
  91: 'Candidate',
  93: 'University',
}

/**
 * P6-THEME-08 — Modernized Executive Authenticated Layout Shell
 * MCAER Pune — Doctor of Philosophy (Ph.D.) Admissions 2026-27
 */
export function AuthLayout() {
  const { user, clearUser } = useAuthStore()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [avatarOpen, setAvatarOpen] = useState(false)
  const avatarRef = useRef<HTMLDivElement>(null)
  const avatarBtnRef = useRef<HTMLButtonElement>(null)

  const { data: menuItems = [] } = useMenu()

  // Close avatar dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node))
        setAvatarOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close avatar dropdown on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && avatarOpen) {
        setAvatarOpen(false)
        avatarBtnRef.current?.focus()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [avatarOpen])

  const handleSignOut = async () => {
    try { await apiClient.post('/auth/logout') } catch { /* best effort */ }
    clearUser()
    toast.success('Signed out successfully.')
    navigate(PUBLIC_ROUTES.login, { replace: true })
  }

  const dashboardPath = user?.dashboardPath ?? '/'
  const roleName = roleNameMap[user?.userTypeId ?? 0] ?? 'Authorized User'

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800 font-sans">

      {/* Accessibility shortcut */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-academic-navy focus:text-white focus:rounded-md focus:shadow-md"
      >
        Skip to main content
      </a>

      {/* ── Top Institutional Header ────────────────────────────────────────── */}
      <header className="bg-white border-b border-slate-200/90 shadow-2xs no-print" role="banner">
        {/* Tri-color Academic Accent Line */}
        <div className="h-1 bg-gradient-to-r from-academic-navy via-amber-500 to-agriculture" />

        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-6">

          {/* Institutional Insignia & Bilingual Identity */}
          <div className="flex items-center gap-4">
            <img
              src="/mcaer-logo.png"
              alt="MCAER Logo"
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

          {/* Right Header Controls: Live Pulse & User Profile Menu */}
          <div className="flex items-center gap-4">

            {/* Live Session Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>Live Academic Session</span>
            </div>

            {/* User Profile Pill & Dropdown */}
            <div ref={avatarRef} className="relative shrink-0">
              <button
                ref={avatarBtnRef}
                type="button"
                onClick={() => setAvatarOpen(o => !o)}
                aria-haspopup="true"
                aria-expanded={avatarOpen}
                aria-label={`User menu for ${user?.userName ?? 'user'}`}
                className="flex items-center gap-3 p-1.5 pl-3 rounded-full border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs group"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.userName || 'SuperAdmin'}
                  </p>
                  <p className="text-3xs font-semibold text-primary-700 uppercase tracking-wider">
                    {roleName}
                  </p>
                </div>

                <div className="relative">
                  <img
                    src="/dummy-user.png"
                    alt=""
                    aria-hidden="true"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-500/80 shadow-xs"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors pr-1">
                  ▾
                </span>
              </button>

              {/* Profile Dropdown Menu */}
              {avatarOpen && (
                <div
                  role="menu"
                  aria-label="User options"
                  className="absolute right-0 top-14 bg-white border border-slate-200 rounded-xl shadow-dropdown min-w-64 z-50 p-3 text-left animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="border-b border-slate-100 pb-3 mb-2 px-1">
                    <p className="text-sm font-bold text-slate-900 truncate">{user?.userName}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {user?.userLoginId}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-2xs font-bold bg-primary-50 text-primary-800 border border-primary-200">
                        {roleName}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Link
                      to={dashboardPath}
                      onClick={() => setAvatarOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-lg font-medium flex items-center gap-2 transition-colors no-underline"
                    >
                      <span>📊</span>
                      <span>Dashboard Home</span>
                    </Link>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer border-0 bg-transparent"
                    >
                      <span>🚪</span>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ── Main Navigation Bar ────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-40 bg-[#0B1D33] border-b border-slate-800/80 shadow-md backdrop-blur-md no-print"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between min-h-12">
          {/* Navigation Links */}
          <ul
            className="flex items-center flex-wrap gap-1 py-1 list-none m-0 p-0"
            role="menubar"
            aria-label="Navigation menu"
          >
            <AuthNavItem to={dashboardPath} label="Dashboard" currentPath={pathname} />
            {menuItems.map(item =>
              item.children.length > 0
                ? <DropdownNavItem key={item.menuId} item={item} currentPath={pathname} />
                : <AuthNavItem key={item.menuId} to={item.menuUrl} label={item.menuName} currentPath={pathname} isNew={item.isNew} target={item.target} />
            )}
          </ul>

          {/* Quick Sign Out Action */}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign Out"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shrink-0 transition-all shadow-xs cursor-pointer ml-4"
          >
            <span>🚪</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </nav>

      {/* ── Main Content Area ──────────────────────────────────────────────── */}
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8"
      >
        <Outlet />
      </main>

      {/* ── Institutional Footer ───────────────────────────────────────────── */}
      <footer className="bg-slate-900 text-slate-400 py-6 text-xs border-t border-slate-800 mt-auto no-print" role="contentinfo">
        <div className="w-full max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <img src="/mcaer-logo.png" alt="" className="h-6 w-6 object-contain opacity-70" />
            <span className="font-semibold text-slate-300">
              Maharashtra Council of Agriculture Education and Research (MCAER), Pune
            </span>
          </div>
          <span>© 2026-27 All Rights Reserved. Online Ph.D. Centralized Admissions Portal</span>
        </div>
      </footer>

      {/* Multilingual AI Admission Copilot */}
      <div className="no-print">
        <AiChatWidget />
      </div>
    </div>
  )
}

function AuthNavItem({ to, label, currentPath, isNew = false, target = '_self' }: {
  to: string; label: string; currentPath: string; isNew?: boolean; target?: string
}) {
  const isActive = currentPath === to

  return (
    <li role="none">
      <Link
        to={to}
        target={target}
        rel={target === '_blank' ? 'noopener noreferrer' : undefined}
        aria-current={isActive ? 'page' : undefined}
        role="menuitem"
        className={[
          'px-3.5 py-2 rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-1.5 no-underline',
          isActive
            ? 'bg-white/20 text-white shadow-xs ring-1 ring-white/25'
            : 'text-slate-200 hover:text-white hover:bg-white/10',
        ].join(' ')}
      >
        <span>{label}</span>
        {isNew && (
          <span className="inline-block px-1.5 py-0.5 bg-rose-500 text-white text-3xs font-extrabold rounded uppercase tracking-wider animate-pulse">
            NEW
          </span>
        )}
      </Link>
    </li>
  )
}

function DropdownNavItem({ item, currentPath }: { item: MenuItem; currentPath: string }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLLIElement>(null)
  const location = useLocation()

  const currentFullPath = location.pathname + location.search

  useEffect(() => {
    setOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const childActive = item.children.some(c =>
    currentFullPath === c.menuUrl ||
    (!c.menuUrl.includes('?') && currentPath === c.menuUrl)
  )

  return (
    <li ref={ref} role="none" className="relative">
      <button
        type="button"
        role="menuitem"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className={[
          'px-3.5 py-2 rounded-lg text-sm font-semibold transition-all inline-flex items-center gap-1.5 cursor-pointer border-0 bg-transparent',
          childActive || open
            ? 'bg-white/20 text-white shadow-xs ring-1 ring-white/25'
            : 'text-slate-200 hover:text-white hover:bg-white/10',
        ].join(' ')}
      >
        <span>{item.menuName}</span>
        <span aria-hidden="true" className="text-xs opacity-75">▾</span>
      </button>

      {open && (
        <ul
          role="menu"
          aria-label={item.menuName}
          className="absolute top-full left-0 mt-1.5 bg-[#0B1D33] border border-slate-700/90 rounded-xl shadow-dropdown min-w-56 py-2 z-50 list-none m-0 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100"
        >
          {item.children.map(child => {
            const isItemActive = currentFullPath === child.menuUrl || (!child.menuUrl.includes('?') && currentPath === child.menuUrl)
            return (
              <li key={child.menuId} role="none">
                <Link
                  to={child.menuUrl === '#' ? '.' : child.menuUrl}
                  role="menuitem"
                  aria-current={isItemActive ? 'page' : undefined}
                  onClick={e => {
                    setOpen(false)
                    if (child.menuUrl === '#') e.preventDefault()
                  }}
                  className={[
                    'flex items-center justify-between px-4 py-2.5 text-sm transition-colors no-underline whitespace-nowrap',
                    isItemActive
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-slate-200 hover:text-white hover:bg-white/10 font-medium',
                  ].join(' ')}
                >
                  <span>{child.menuName}</span>
                  {child.isNew && (
                    <span className="ml-2 px-1.5 py-0.5 bg-rose-500 text-white text-3xs font-extrabold rounded uppercase">
                      NEW
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </li>
  )
}
