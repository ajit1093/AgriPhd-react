import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

interface Setting { key: string; value: string }

export default function CheckAppSettingsPage() {
  const { data: settings = [], isLoading } = useQuery<Setting[]>({
    queryKey: ['admin', 'app-settings'],
    queryFn: () => apiClient.get('/admin/app-settings').then(r => r.data),
    staleTime: 30_000,
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Check App Settings</div>
        <div className="l-card-body" style={{ padding: 0 }}>
          <table className="grid-view" style={{ width: '100%' }}>
            <thead>
              <tr><th style={{ textAlign: 'left', width: '40%' }}>Setting</th><th style={{ textAlign: 'left' }}>Value</th></tr>
            </thead>
            <tbody>
              {isLoading
                ? <tr><td colSpan={2} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                : settings.map(s => (
                  <tr key={s.key}>
                    <td style={{ textAlign: 'left', fontWeight: 600 }}>{s.key}</td>
                    <td style={{ textAlign: 'left' }}>{s.value}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
