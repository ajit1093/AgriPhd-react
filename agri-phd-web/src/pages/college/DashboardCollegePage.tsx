import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { UserDetailsCard } from '@/components/shared/UserDetailsCard'
import { StatCard } from '@/components/shared/StatCard'

export default function DashboardCollegePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard', 'college'],
    queryFn: dashboardApi.college,
  })

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading College Dashboard…</span>
      </div>
    )
  }
  if (isError) return <div className="l-alert l-alert-danger my-4">Failed to load college dashboard.</div>
  if (!data) return null

  const extraRow = (
    <div className="flex items-center justify-between flex-wrap gap-3 bg-white/10 rounded-xl p-3 border border-white/15">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
        <span className="text-amber-300">📘</span>
        <span>College Admission Process Guidelines</span>
      </div>
      <a
        href="/Content/PDFs/MCAER_College Admission Manual.pdf"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold transition-all no-underline shadow-xs"
      >
        <span>📥 Download College User Manual (PDF)</span>
      </a>
    </div>
  )

  return (
    <div className="space-y-6 w-full">
      {/* Executive Command Hub Hero Card */}
      <UserDetailsCard data={data.userDetails} extraRow={extraRow} />

      {/* College Capacity & Allotment Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>📊</span>
              <span>College Seat Intake &amp; Admission Metrics</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live capacity utilization, admitted candidates, and open quota vacancies for this college
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            College Level CAP Round
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            label="Total Approved Intake"
            value={data.intake}
            color="green"
            icon="📊"
            subtext="Approved Seats"
          />
          <StatCard
            label="Confirmed Admitted"
            value={data.admitted}
            color="yellow"
            icon="🎓"
            subtext="Admitted Candidates"
          />
          <StatCard
            label="Available Vacancy"
            value={data.vacancy}
            color="pink"
            icon="🪑"
            subtext="Open for Spot/CAP"
          />
        </div>
      </div>
    </div>
  )
}
