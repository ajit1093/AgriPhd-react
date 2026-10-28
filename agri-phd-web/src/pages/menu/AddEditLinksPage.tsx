import { useSearchParams, useNavigate } from 'react-router-dom'

/** Menu/AddEditLinks.aspx — redirects to ManageLinks with the appropriate directory pre-set */
export default function AddEditLinksPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const directory = params.get('directory') ?? ''
  const linkId = params.get('linkId') ?? '0'

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '500px' }}>
        <div className="l-card-header">{linkId === '0' ? 'Add New Link' : 'Edit Link'}</div>
        <div className="l-card-body">
          <div className="l-alert l-alert-info" style={{ marginBottom: '16px' }}>
            Links are managed through the Manage Links page.
            Select the correct Module/Directory to view and edit links.
          </div>
          {directory && <div style={{ fontSize: '90%', marginBottom: '12px', color: '#555' }}>Directory: {directory}</div>}
          <button type="button" className="btn-special"
            onClick={() => navigate(`/admin/menu-links${directory ? `?directory=${directory}` : ''}`)}>
            Go to Manage Links
          </button>
        </div>
      </div>
    </div>
  )
}
