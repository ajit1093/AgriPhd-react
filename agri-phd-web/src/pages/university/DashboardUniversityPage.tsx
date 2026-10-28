import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { UserDetailsCard } from '@/components/shared/UserDetailsCard'
import { useAuthStore } from '@/store/authStore'

/**
 * P2-C-06 — Dashboard/DashboardUniversity.aspx
 * Card header: no dashboard header — stat cards are commented out in legacy
 * Shows user-details + link to "University User Manual For Spot Round Admission Process"
 * Per-university merit list PDFs linked by UserLoginID (PDKV/BSKKV/MPKV/MKV)
 */
export default function DashboardUniversityPage() {
  const { user } = useAuthStore()
  const { data, isLoading, isError } = useQuery({ queryKey: ['dashboard', 'university'], queryFn: dashboardApi.university })

  if (isLoading) return <div style={{ padding: '20px' }}>Loading dashboard…</div>
  if (isError)   return <div className="l-alert l-alert-danger" style={{ margin: '20px' }}>Failed to load dashboard.</div>
  if (!data)     return null

  // Per-university merit list PDFs from GetUserManualLink() in legacy
  const universityPdfs: Record<string, string> = {
    PDKV:  '/Content/PDFs/SpotRound_PDKVMeritList.pdf',
    BSKKV: '/Content/PDFs/SpotRound_BSKKVMeritList.pdf',
    MPKV:  '/Content/PDFs/SpotRound_MPKVMeritList.pdf',
    MKV:   '/Content/PDFs/SpotRound_MKVMeritList.pdf',
  }
  const loginId = user?.userLoginId?.toUpperCase() ?? ''
  const meritPdf = universityPdfs[loginId] ?? '/Content/PDFs/Default_Admission_Manual.pdf'
  void meritPdf // reserved for future merit list download link

  const extraRow = (
    <div className="user-details" style={{ marginTop: '4px' }}>
      <span className="label-col">University User Manual For Spot Round Admission Process</span>
      <span className="value-col">
        <a href="/Content/PDFs/MCAER_Spot Round_Manual.pdf" target="_blank" rel="noreferrer" style={{ color: '#0d6efd' }}>
          Click Here To Download University User Manual For Spot Round Admission Process
        </a>
      </span>
    </div>
  )

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Dashboard - University</div>
        <div className="l-card-body">
          <UserDetailsCard data={data.userDetails} extraRow={extraRow} />
        </div>
      </div>
    </div>
  )
}
