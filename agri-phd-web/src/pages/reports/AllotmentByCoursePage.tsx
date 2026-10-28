import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/** Redirects to the unified GenerateReportPage with the correct report ID. */
export default function AllotmentByCoursePage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/reports/generate?report=allotment-by-course', { replace: true })
  }, [navigate])
  return <div style={{ padding: '20px', textAlign: 'center' }}>Loading Allotment Report By Course…</div>
}
