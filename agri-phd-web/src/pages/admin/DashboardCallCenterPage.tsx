import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { UserDetailsCard } from '@/components/shared/UserDetailsCard'

/**
 * P2-C-07 — Dashboard/DashboardCallCenter.aspx
 * Shows user-details card only — no SP dashboard call in legacy.
 */
export default function DashboardCallCenterPage() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard', 'call-center'], queryFn: dashboardApi.callCenter })
  if (isLoading) return <div style={{ padding: '20px' }}>Loading dashboard…</div>
  if (isError)   return <div className="l-alert l-alert-danger" style={{ margin: '20px' }}>Failed to load dashboard.</div>
  if (!data)     return null
  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Dashboard - Call Center</div>
        <div className="l-card-body">
          <UserDetailsCard data={data} />
        </div>
      </div>
    </div>
  )
}
