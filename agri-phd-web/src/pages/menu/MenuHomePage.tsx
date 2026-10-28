import { Link } from 'react-router-dom'

/** Menu/MenuHome.aspx — hub page with links to the three menu management sections */
export default function MenuHomePage() {
  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '500px' }}>
        <div className="l-card-header">Menu Management</div>
        <div className="l-card-body">
          <p style={{ marginBottom: '16px', color: '#555' }}>
            Manage navigation menus, groups, and links for all user roles.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/admin/menus"       className="btn-special"        style={{ textDecoration: 'none', padding: '10px 20px', textAlign: 'center' }}>📋 Manage Menus</Link>
            <Link to="/admin/menu-groups" className="btn-success-legacy" style={{ textDecoration: 'none', padding: '10px 20px', textAlign: 'center' }}>📁 Manage Groups</Link>
            <Link to="/admin/menu-links"  className="btn-outline-legacy" style={{ textDecoration: 'none', padding: '10px 20px', textAlign: 'center' }}>🔗 Manage Links</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
