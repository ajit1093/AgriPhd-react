import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { UserDetailsCard } from '@/components/shared/UserDetailsCard'
import { StatCard } from '@/components/shared/StatCard'

/**
 * P2-C-05 / P6-THEME-18 — Dashboard/DashboardEVerification.aspx
 * Modernized E-Verification Officer Workspace Dashboard.
 */
export default function DashboardEVerificationPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'everification'],
    queryFn: dashboardApi.eVerification,
  })

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading E-Verification Dashboard…</span>
      </div>
    )
  }
  if (isError) return <div className="l-alert l-alert-danger my-4">Failed to load dashboard.</div>
  if (!data) return null

  return (
    <div className="space-y-6 w-full">
      {/* Executive Command Hub Hero Card */}
      <UserDetailsCard data={data.userDetails} />

      {/* Scrutiny Metrics Hub */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📑</span>
              <span>Documents E-Verification Workqueue Metrics</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live document scrutiny status for assigned candidates at this EVC scrutiny center
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-primary-50 text-primary-800 border border-primary-200 self-start sm:self-auto">
            EVC Centre Scrutiny
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Assigned"
            value={data.total}
            color="blue"
            icon="📁"
            subtext="All Assigned"
          />
          <StatCard
            label="Fully Verified"
            value={data.fullyVerified}
            color="green"
            icon="✓"
            subtext="Accepted"
          />
          <StatCard
            label="Discrepancy / Hold"
            value={data.partiallyVerified}
            color="yellow"
            icon="⚠️"
            subtext="Query Raised"
          />
          {data.showNotAssigned && (
            <StatCard
              label="Not Assigned"
              value={data.notAssigned}
              color="pink"
              icon="⏳"
              subtext="Unassigned"
            />
          )}
          <StatCard
            label="Pending Scrutiny"
            value={data.notVerified}
            color="blue"
            icon="⏱️"
            subtext="In Queue"
          />
          <StatCard
            label="Re-Uploaded Docs"
            value={data.reUploaded}
            color="green"
            icon="🔄"
            subtext="Awaiting Re-check"
          />
        </div>
      </div>
    </div>
  )
}
