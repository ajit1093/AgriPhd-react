import { useSearchParams, useNavigate } from 'react-router-dom'

/** Menu/AddEditMenus.aspx — redirects to ManageMenus with the appropriate filter pre-set */
export default function AddEditMenuPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const userTypeId = params.get('userTypeId') ?? ''
  const parentMenuId = params.get('parentMenuId') ?? ''
  const menuId = params.get('menuId') ?? '0'

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '500px' }}>
        <div className="l-card-header">{menuId === '0' ? 'Add New Menu' : 'Edit Menu'}</div>
        <div className="l-card-body">
          <div className="l-alert l-alert-info" style={{ marginBottom: '16px' }}>
            Menu items are managed through the Manage Menus page.
            Select the correct User Type and Group to view and edit menu items.
          </div>
          <div style={{ fontSize: '90%', marginBottom: '12px', color: '#555' }}>
            {userTypeId && <div>User Type ID: {userTypeId}</div>}
            {parentMenuId && <div>Parent Menu ID: {parentMenuId}</div>}
            {menuId !== '0' && <div>Menu ID: {menuId}</div>}
          </div>
          <button type="button" className="btn-special"
            onClick={() => navigate(`/admin/menus${userTypeId ? `?userTypeId=${userTypeId}` : ''}`)}>
            Go to Manage Menus
          </button>
        </div>
      </div>
    </div>
  )
}
