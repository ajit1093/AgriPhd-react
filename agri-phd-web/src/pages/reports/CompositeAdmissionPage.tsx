import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Redirects to the unified GenerateReportPage with the correct report ID. */
export default function CompositeAdmissionPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/reports/generate?report=composite-admission', { replace: true })
  }, [navigate])
  return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Composite Admission Report…</div>
}
