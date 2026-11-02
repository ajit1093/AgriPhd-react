import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { notificationApi } from '@/api/notifications'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { BreakingNewsCapsule } from '@/components/public/BreakingNewsCapsule'
import { HomeHeroSection } from '@/components/public/HomeHeroSection'
import { SerpentineProcessInfographic } from '@/components/public/SerpentineProcessInfographic'
import { DocumentHub, type TabId } from '@/components/public/DocumentHub'
import { AdmissionDocumentsAndSupport } from '@/components/public/AdmissionDocumentsAndSupport'
import { UniversityShowcase } from '@/components/public/UniversityShowcase'
import { FastTrackToolkit } from '@/components/public/FastTrackToolkit'

export default function HomePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['notifications', 'home'],
    queryFn: () => notificationApi.getHome(1, false),
    staleTime: 5_000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 15_000,
  })

  const [activeTab, setActiveTab] = useState<TabId>('notifications')
  const [popupDismissed, setPopupDismissed] = useState(false)
  const [dateFilter, setDateFilter] = useState<'all' | 'active' | 'upcoming'>('all')

  const tabContent = {
    notifications: data?.notifications ?? [],
    schedule: data?.schedule ?? [],
    brochure: data?.news ?? [],
    downloads: data?.downloads ?? [],
  }

  const handleBrochureClick = () => {
    setActiveTab('brochure')
    const docSection = document.getElementById('documents-hub')
    if (docSection) {
      docSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center py-24 gap-4">
        <Spinner size="lg" label="Loading Official Admissions Portal…" />
        <p className="text-slate-500 text-sm font-medium">Connecting to official admissions database…</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* ── 1. Announcements Marquee Capsule (On top of Hero Section) ── */}
      <BreakingNewsCapsule
        announcements={data?.announcements}
        notifications={data?.notifications}
      />

      {/* ── 2. Hero Banner with Modern Pastel Aesthetic & Artwork ── */}
      <HomeHeroSection onBrochureClick={handleBrochureClick} />

      {/* ── 3. Dual Section (40% Process Roadmap | 60% Notice Board & Support) ── */}
      <section
        aria-label="Admissions Process Roadmap and Official Notice Board"
        className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch"
      >
        {/* Left Column (40% Width): Image-Based Informative Multicolored Process Roadmap */}
        <div className="lg:col-span-2 w-full flex flex-col h-full">
          <SerpentineProcessInfographic className="h-full flex flex-col justify-between" />
        </div>

        {/* Right Column (60% Width): Notice Board (Untouched Fixed Height) + Documents & Support matching Process Section Height */}
        <div className="lg:col-span-3 w-full flex flex-col gap-4 h-full">
          <div id="documents-hub" className="scroll-mt-6 shrink-0">
            <DocumentHub
              activeTab={activeTab}
              onTabChange={setActiveTab}
              tabContent={tabContent}
              importantDates={data?.importantDates}
              isError={isError}
              dateFilter={dateFilter}
              onDateFilterChange={setDateFilter}
            />
          </div>

          {/* Important Documents for Admission & Support Information (Enlarged to match Process section on left) */}
          <AdmissionDocumentsAndSupport className="flex-1 min-h-0 flex flex-col justify-between" />
        </div>
      </section>

      {/* ── 4. 4 State Agricultural Universities (Illustrated Campus Cards) ── */}
      <UniversityShowcase />

      {/* ── 5. Candidate Fast-Track Toolkit & Helpdesk ── */}
      <FastTrackToolkit />

      {/* ── 6. Priority Notice Modal (from DB popup) ── */}
      {data?.popup && !popupDismissed && (
        <Modal
          open
          onClose={() => setPopupDismissed(true)}
          title={data.popup.notificationTitle}
          maxWidth="max-w-2xl"
        >
          <div className="text-sm text-slate-700 leading-relaxed py-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-amber-50 text-amber-900 border border-amber-300">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                OFFICIAL NOTICE / PUBLIC ANNOUNCEMENT
              </span>
              {data.popup.displayNewImage === 1 && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 bg-rose-500 text-white text-3xs font-bold rounded-full uppercase tracking-wider animate-pulse">
                  NEW
                </span>
              )}
            </div>

            {data.popup.textContent && (
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-800 text-xs sm:text-sm leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                {data.popup.textContent}
              </div>
            )}

            {data.popup.fileContentURL && (
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-3xs font-bold text-emerald-800 uppercase tracking-wider block">
                    Attached Document
                  </span>
                  <span className="text-xs font-semibold text-slate-900 truncate block">
                    Click to view official circular
                  </span>
                </div>
                <a
                  href={data.popup.fileContentURL}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors no-underline"
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
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs sm:text-sm font-semibold shadow-2xs transition-all cursor-pointer"
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
