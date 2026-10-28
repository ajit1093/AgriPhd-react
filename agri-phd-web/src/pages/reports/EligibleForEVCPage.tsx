import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Redirects to the unified GenerateReportPage with the correct report ID. */
export default function EligibleForEVCPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/reports/generate?report=eligible-for-everification', { replace: true })
  }, [navigate])
  return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Candidates Eligible For E-Verification…</div>
}
