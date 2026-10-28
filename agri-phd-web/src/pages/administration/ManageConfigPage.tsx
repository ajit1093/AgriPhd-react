export default function ManageConfigPage() {
  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Manage Project Configuration</div>
        <div className="l-card-body">
          <div className="l-alert l-alert-warning">
            Project configuration is stored in <strong>appsettings.json</strong> / environment variables.
            Direct DB-based configuration editing is pending OQ-01 resolution (table name unconfirmed).
            Contact system administrator to change configuration values.
          </div>
          <div className="l-alert l-alert-info" style={{ marginTop: '8px' }}>
            For server environment details, see <strong>Check App Settings</strong> in this menu.
          </div>
        </div>
      </div>
    </div>
  )
}
