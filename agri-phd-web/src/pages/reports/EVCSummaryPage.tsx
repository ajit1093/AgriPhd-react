import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Redirects to the unified GenerateReportPage with the correct report ID. */
export default function EVCSummaryPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/reports/generate?report=evc-summary', { replace: true })
  }, [navigate])
  return <div style={{ padding: '20px', textAlign: 'center' }}>Loading EVC Wise Report…</div>
}
