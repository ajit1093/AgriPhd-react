import type { CandidateDashboardData } from '@/types/dashboard'
import { Link } from 'react-router-dom'
import { CANDIDATE_ROUTES } from '@/router/routes'

interface Props {
  data: CandidateDashboardData
}

export type StepState = 'completed' | 'current' | 'warning' | 'upcoming'

interface TrackerStep {
  id: number
  title: string
  subtitle: string
  dateLabel?: string
  state: StepState
  badgeText: string
  details: string
  actionUrl?: string
  actionText?: string
}

export function ApplicationTrackerStepper({ data }: Props) {
  const hasDiscrepancy = data.rejectedDocs && data.rejectedDocs.length > 0
  const isLocked = data.isFormLocked
  const isVerified = (data.documentVerificationStatus || '').toLowerCase().includes('verified') && !hasDiscrepancy

  // Compute states for the 6 admission milestones
  const steps: TrackerStep[] = [
    {
      id: 1,
      title: 'Online Registration',
      subtitle: 'Account & Permanent Login ID',
      state: 'completed',
      badgeText: 'Completed',
      details: `Registered with Login ID: ${data.userDetails?.userLoginID || 'Active'}. Mobile & email OTP authenticated.`,
    },
    {
      id: 2,
      title: 'Application Form Submission',
      subtitle: '10-Stage Wizard & Preferences',
      state: isLocked ? 'completed' : 'current',
      badgeText: isLocked ? 'Locked & Submitted' : 'In Progress',
      details: isLocked
        ? 'Application form locked and submitted successfully. Fee transaction confirmed.'
        : 'Please complete all steps (Personal, Academic, Papers, Shortlist) and lock your form.',
      actionUrl: isLocked ? undefined : CANDIDATE_ROUTES.formSummary,
      actionText: isLocked ? undefined : 'Continue Form Filling →',
    },
    {
      id: 3,
      title: 'E-Scrutiny Verification',
      subtitle: 'Assigned University EVC Center',
      state: !isLocked
        ? 'upcoming'
        : hasDiscrepancy
        ? 'warning'
        : isVerified
        ? 'completed'
        : 'current',
      badgeText: !isLocked
        ? 'Awaiting Form Lock'
        : hasDiscrepancy
        ? 'Action Required'
        : isVerified
        ? 'Verified & Approved'
        : 'Under EVC Scrutiny',
      details: !isLocked
        ? 'Verification activates once your application form is locked and submitted.'
        : hasDiscrepancy
        ? `${data.rejectedDocs.length} document(s) flagged with discrepancies. Please re-upload corrected copies.`
        : isVerified
        ? 'All uploaded documents verified and approved by the E-Verification Committee.'
        : 'Assigned E-Verification Center (EVC) is currently scrutinizing your uploaded certificates.',
      actionUrl: hasDiscrepancy ? CANDIDATE_ROUTES.uploadDocuments : undefined,
      actionText: hasDiscrepancy ? 'Re-Upload Documents →' : undefined,
    },
    {
      id: 4,
      title: 'Merit List Publication',
      subtitle: 'Statewide Ph.D. General Merit Rank',
      state: isVerified ? 'current' : 'upcoming',
      badgeText: isVerified ? 'Scheduled' : 'Upcoming',
      details: isVerified
        ? 'Eligible for Merit Ranking. Provisional Merit List will be published as per official CAP schedule.'
        : 'Merit rank is generated after document e-scrutiny verification is successfully completed.',
    },
    {
      id: 5,
      title: 'CAP Seat Allotment',
      subtitle: 'Centralized Round 1 / Round 2',
      state: 'upcoming',
      badgeText: 'Upcoming',
      details: 'Allotment is processed based on your M.Sc. CGPA, merit score, and preferred university options.',
    },
    {
      id: 6,
      title: 'Admission Confirmation',
      subtitle: 'Provisional Letter & University Reporting',
      state: 'upcoming',
      badgeText: 'Upcoming',
      details: 'Download Provisional Allotment Letter, pay university admission fee, and report to allotted institute.',
    },
  ]

  const progressPercent = Math.min(100, Math.round(((isVerified ? 3 : isLocked ? 2 : 1) / 6) * 100))

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs space-y-6">
      {/* Tracker Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm">
              🚚
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Track My Ph.D. Admission Journey
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time stage tracking of your application from registration to final college admission confirmation
          </p>
        </div>

        {/* Live Progress Pill */}
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <div className="text-right hidden sm:block">
            <span className="text-2xs uppercase tracking-wider font-bold text-slate-400 block">Overall Progress</span>
            <span className="text-xs font-bold text-slate-800 font-mono">{progressPercent}% Completed</span>
          </div>
          <div className="w-24 sm:w-28 bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Stepper Flow Cards */}
      <div className="relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {steps.map((step) => {
            const isCompleted = step.state === 'completed'
            const isCurrent = step.state === 'current'
            const isWarning = step.state === 'warning'
            const isUpcoming = step.state === 'upcoming'

            return (
              <div
                key={step.id}
                className={[
                  'rounded-xl p-4 border transition-all relative flex flex-col justify-between',
                  isCompleted
                    ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                    : isCurrent
                    ? 'bg-blue-50/50 border-blue-300 shadow-xs ring-1 ring-blue-400/30'
                    : isWarning
                    ? 'bg-rose-50/70 border-rose-300 shadow-xs ring-1 ring-rose-400/30'
                    : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-80',
                ].join(' ')}
              >
                {/* Step Top Bar */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={[
                          'w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs',
                          isCompleted
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white animate-pulse'
                            : isWarning
                            ? 'bg-rose-600 text-white animate-bounce'
                            : 'bg-slate-200 text-slate-500',
                        ].join(' ')}
                      >
                        {isCompleted ? '✓' : isWarning ? '!' : step.id}
                      </span>
                      <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-500">
                        Stage {step.id}
                      </span>
                    </div>

                    {/* Badge */}
                    <span
                      className={[
                        'text-3xs font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider',
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : isCurrent
                          ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                          : isWarning
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200',
                      ].join(' ')}
                    >
                      {step.badgeText}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h4
                    className={[
                      'text-sm font-bold leading-tight',
                      isUpcoming ? 'text-slate-600' : 'text-slate-900',
                    ].join(' ')}
                  >
                    {step.title}
                  </h4>
                  <p className="text-2xs text-slate-500 mt-0.5">{step.subtitle}</p>

                  {/* Description */}
                  <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                    {step.details}
                  </p>
                </div>

                {/* Action Link if needed */}
                {step.actionUrl && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60">
                    <Link
                      to={step.actionUrl}
                      className={[
                        'inline-flex items-center gap-1 text-xs font-bold transition-colors no-underline',
                        isWarning
                          ? 'text-rose-700 hover:text-rose-900 underline'
                          : 'text-primary-700 hover:text-primary-900 hover:underline',
                      ].join(' ')}
                    >
                      <span>{step.actionText}</span>
                    </Link>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
