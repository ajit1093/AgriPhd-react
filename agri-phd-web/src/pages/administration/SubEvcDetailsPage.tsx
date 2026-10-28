import { useNavigate } from 'react-router-dom'

/** Sub-EVC Add/Edit — redirects to Sub-EVC list (add is handled from ManageSubEvcPage) */
export default function SubEvcDetailsPage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '400px' }}>
        <div className="l-card-header">Sub e-Verification Center Details</div>
        <div className="l-card-body">
          <div className="l-alert l-alert-info">Sub-EVC management is handled from the Manage Sub-EVC page.</div>
          <button type="button" className="btn-special" onClick={() => navigate('/admin/sub-evc')}>
            Go to Manage Sub-EVC
          </button>
        </div>
      </div>
    </div>
  )
}
