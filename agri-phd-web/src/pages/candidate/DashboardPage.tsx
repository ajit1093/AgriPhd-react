import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { dashboardApi } from '@/api/dashboard'
import { UserDetailsCard } from '@/components/shared/UserDetailsCard'
import { ApplicationTrackerStepper } from '@/components/candidate/ApplicationTrackerStepper'
import { CANDIDATE_ROUTES } from '@/router/routes'

/**
 * P2-C-01 / P6-THEME-12 — Dashboard/DashboardCandidate.aspx → CandidateDashboardPage
 * Modern, cohesive academic candidate dashboard.
 */
export default function CandidateDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'candidate'],
    queryFn:  dashboardApi.candidate,
  })

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading Candidate Dashboard…</span>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="l-alert l-alert-danger my-4">
        <span>Failed to load dashboard details. Please refresh the page.</span>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-6 w-full">
      {/* Executive Command Hub Hero Card */}
      <UserDetailsCard data={data.userDetails} />

      {/* Visual Live Courier-Style Application Tracker Stepper */}
      <ApplicationTrackerStepper data={data} />

      {/* Main Candidate Application & Admission Status Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📊</span>
              <span>Application &amp; Admission Status Overview</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Current progress through Ph.D. centralized admission steps and verification
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-50 text-primary-800 border border-primary-200 self-start sm:self-auto">
            Session 2026-27
          </span>
        </div>

        {/* Key Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Application Form Status Card */}
          <div className="bg-gradient-to-br from-slate-900 to-primary-950 text-white p-6 rounded-xl shadow-sm border border-slate-800 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-block text-2xs uppercase tracking-wider font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20 mb-2">
                Step 1: Application Form
              </span>
              <p className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                {data.applicationFormStatus || 'Not Submitted'}
              </p>
              <p className="text-xs text-slate-300 mt-1">
                Entrance Form &amp; Option Preferences Status
              </p>
            </div>
            <div className="relative z-10 mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-300">Registration: <strong className="text-emerald-400">Active</strong></span>
              <span className="text-slate-400">MCAER Pune</span>
            </div>
          </div>

          {/* Document Verification Status Card */}
          {data.isFormLocked ? (
            <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white p-6 rounded-xl shadow-sm border border-emerald-800 flex flex-col justify-between relative overflow-hidden">
              <div className="relative z-10">
                <span className="inline-block text-2xs uppercase tracking-wider font-bold text-emerald-300 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20 mb-2">
                  Step 2: E-Verification
                </span>
                <p className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
                  {data.documentVerificationStatus || 'Under E-Scrutiny'}
                </p>
                <p className="text-xs text-emerald-200 mt-1">
                  Document verification at assigned EVC center
                </p>
              </div>
              <div className="relative z-10 mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-emerald-200">EVC Scrutiny: <strong className="text-white">In Progress</strong></span>
                <span className="text-emerald-300">Verified by Committee</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-xl flex flex-col justify-between">
              <div>
                <span className="inline-block text-2xs uppercase tracking-wider font-semibold text-slate-500 bg-slate-200 px-2.5 py-0.5 rounded-full mb-2">
                  Step 2: E-Verification
                </span>
                <p className="text-base font-bold text-slate-700 mt-1">
                  Awaiting Form Submission
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  E-Verification will activate as soon as you review and lock your 10-step application form.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-2xs text-slate-400">
                Lock Application to initiate document scrutiny
              </div>
            </div>
          )}
        </div>

        {/* Rejected documents GridView — shown when discrepancies exist */}
        {data.rejectedDocs.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <span>⚠️</span>
              <span>Action Required: Discrepancy Found in Uploaded Documents</span>
            </div>
            <p className="text-xs text-rose-700">
              The E-Verification committee has raised discrepancies on the following documents. Please review the comments and re-upload authentic copies.
            </p>

            <div className="overflow-x-auto rounded-lg border border-rose-200 bg-white">
              <table className="grid-view w-full text-left text-xs sm:text-sm">
                <thead className="bg-rose-100/60 text-rose-900 border-b border-rose-200">
                  <tr>
                    <th className="w-16 py-2.5 px-3 text-center font-bold">Sr. No.</th>
                    <th className="py-2.5 px-3 font-bold">Document Name</th>
                    <th className="py-2.5 px-3 font-bold">Verification Officer Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-100 text-slate-800">
                  {data.rejectedDocs.map((doc, i) => (
                    <tr key={i} className="hover:bg-rose-50/40">
                      <td className="py-2.5 px-3 text-center font-semibold text-slate-500">{i + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{doc.document}</td>
                      <td className="py-2.5 px-3 text-rose-700 font-medium">{doc.comments}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Proceed button — shown when eligible for filling */}
        {data.isEligibleForFormFilling && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-bold text-slate-900">Ready to complete your submission?</p>
              <p className="text-xs text-slate-500">Ensure all 10 steps of the Ph.D. application wizard are completed and locked.</p>
            </div>
            <Link
              to={CANDIDATE_ROUTES.formSummary}
              className="btn-success-legacy inline-flex items-center gap-2 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm px-6 py-3 rounded-lg shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <span>Proceed to Fill Application Form</span>
              <span>&gt;&gt;&gt;</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
