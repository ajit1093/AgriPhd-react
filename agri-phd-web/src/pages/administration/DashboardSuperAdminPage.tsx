import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { UserDetailsCard } from '@/components/shared/UserDetailsCard'
import { StatCard } from '@/components/shared/StatCard'
import { SuperAdminAnalyticsHub } from '@/components/superadmin/SuperAdminAnalyticsHub'

export default function DashboardSuperAdminPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'super-admin'],
    queryFn: dashboardApi.superAdmin,
  })

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading Super Administrator Dashboard…</span>
      </div>
    )
  }
  if (isError) return <div className="l-alert l-alert-danger my-4">Failed to load dashboard metrics.</div>
  if (!data) return null

  return (
    <div className="space-y-6 w-full">
      {/* Executive Command Hub Hero Card */}
      <UserDetailsCard data={data.userDetails} />

      {/* Main Analytics Hub */}
      <div className="space-y-6">

        {/* Section 1: Candidate Applications & E-Scrutiny Telemetry */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>📝</span>
                <span>Applicant Registration &amp; E-Verification Progress</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time tracking of doctoral candidate registration, locked forms, and document verification across centers
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary-50 text-primary-800 border border-primary-200 self-start sm:self-auto">
              Statewide E-Scrutiny
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              label="Registered Applicants"
              value={data.registered_1}
              color="blue"
              icon="👥"
              subtext="Total Signups"
            />
            <StatCard
              label="Locked Application Forms"
              value={data.locked_1}
              color="green"
              icon="🔒"
              subtext="Submitted & Ready"
            />
            <StatCard
              label="Fully Verified Candidates"
              value={data.fullyVerified_1}
              color="yellow"
              icon="✓"
              subtext="Eligible for Merit"
            />
            <StatCard
              label="Discrepancy / Partially Verified"
              value={data.partiallyVerified_1}
              color="pink"
              icon="⚠️"
              subtext="Action Required"
            />
          </div>
        </div>

        {/* Section 2: Seat Matrix, Intake & Admission Telemetry */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <span>🏛️</span>
                <span>Colleges, Seat Matrix &amp; Admission Capacity</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Institutional seat capacities, confirmed admissions, and vacant seats across Maharashtra Agricultural Universities
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
              CAP Round Telemetry
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            <StatCard
              label="Participating Colleges"
              value={data.noOfColleges_1}
              color="pink"
              icon="🏫"
              subtext="4 SAUs"
            />
            <StatCard
              label="Total Approved Intake"
              value={data.intake_1}
              color="yellow"
              icon="📊"
              subtext="Ph.D. Sanctioned Seats"
            />
            <StatCard
              label="Confirmed Admissions"
              value={data.admitted_1}
              color="green"
              icon="🎓"
              subtext="Seats Confirmed"
            />
            <StatCard
              label="Current Vacant Seats"
              value={data.vacancy_1}
              color="blue"
              icon="🪑"
              subtext="Available for Allotment"
            />
          </div>
        </div>

        {/* Section 3: Statewide Regional University Heatmap & Subject Demand Hub */}
        <SuperAdminAnalyticsHub data={data} />

      </div>
    </div>
  )
}
