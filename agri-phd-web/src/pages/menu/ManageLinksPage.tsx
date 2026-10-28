import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

/**
 * Menu/ManageLinks.aspx — exact parity
 * Dapper dynamic objects serialize with ORIGINAL PascalCase column names (not camelCase).
 * SP columns: LinkID, LinkName, LinkURL, IsActive
 */

interface LinkRow {
  LinkID:   number    // PascalCase — Dapper dynamic preserves SP column names
  LinkName: string
  LinkURL:  string
  IsActive: boolean | string
}

type RowState = LinkRow & { localIsActive: boolean }

export default function ManageLinksPage() {
  const qc = useQueryClient()
  const [directory, setDirectory] = useState('')
  const [rows, setRows] = useState<RowState[]>([])

  const { data: directories = [] } = useQuery<string[]>({
    queryKey: ['menu-admin', 'directories'],
    queryFn:  () => apiClient.get('/admin/menu-admin/directories').then(r => r.data),
    staleTime: 3_600_000,
  })

  const { data: linkData, isLoading } = useQuery<LinkRow[]>({
    queryKey: ['menu-admin', 'links', directory],
    queryFn:  () => apiClient.get(`/admin/menu-admin/links?directory=${encodeURIComponent(directory)}`).then(r => r.data),
    enabled:  !!directory,
  })

  useEffect(() => {
    if (linkData) {
      setRows(linkData.map(r => ({
        ...r,
        localIsActive: r.IsActive === true || String(r.IsActive).toLowerCase() === 'true' || String(r.IsActive) === 'Y',
      })))
    }
  }, [linkData])

  const saveMutation = useMutation({
    mutationFn: () => apiClient.post('/admin/menu-admin/links/save', {
      items: rows.map(r => ({ linkId: r.LinkID, isActive: r.localIsActive }))
    }).then(r => r.data),
    onSuccess: (d) => {
      if (d.success) {
        toast.success('Data Saved Successfully.')
        qc.invalidateQueries({ queryKey: ['menu'] })
        qc.invalidateQueries({ queryKey: ['menu-admin', 'links', directory] })
      } else toast.error(d.message ?? 'Save failed.')
    },
    onError: () => toast.error('Save failed.'),
  })

  return (
    <div style={{ padding: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
        <Link to="/admin/menus"       className="btn-outline-legacy" style={{ textDecoration: 'none', padding: '6px 16px' }}>Manage Menus</Link>
        <Link to="/admin/menu-groups" className="btn-outline-legacy" style={{ textDecoration: 'none', padding: '6px 16px' }}>Manage Groups</Link>
        <Link to="/admin/menu-links"  className="btn-special"        style={{ textDecoration: 'none', padding: '6px 16px' }}>Manage Links</Link>
      </div>

      <div className="l-card">
        <div className="l-card-header">Manage Links</div>
        <div className="l-card-body">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: '0 0 240px' }}>
              <label className="control-label">Module <span className="required">*</span></label>
              <select className="l-form-control" value={directory}
                onChange={e => { setDirectory(e.target.value); setRows([]) }}>
                <option value="">-- Select Module --</option>
                {directories.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            {rows.length > 0 && (
              <button type="button" className="btn-success-legacy" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : 'Save Links'}
              </button>
            )}
          </div>

          {isLoading && <p style={{ textAlign: 'center', padding: '16px' }}>Loading…</p>}

          {rows.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="grid-view" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>Sr. No.</th>
                    <th style={{ textAlign: 'left' }}>Link Name</th>
                    <th style={{ textAlign: 'left' }}>Link URL</th>
                    <th style={{ width: '80px' }}>Is Active</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.LinkID} style={{ backgroundColor: row.localIsActive ? '#C2D69B' : undefined }}>
                      <td style={{ textAlign: 'center' }}>{i + 1}.</td>
                      <td style={{ textAlign: 'left' }}>{row.LinkName}</td>
                      <td style={{ textAlign: 'left', fontSize: '85%', color: '#555' }}>{row.LinkURL}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={row.localIsActive}
                          onChange={() => setRows(r => r.map((x, j) => j === i ? { ...x, localIsActive: !x.localIsActive } : x))}
                          style={{ width: '20px', transform: 'scale(1.3)' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {directory && !isLoading && rows.length === 0 && (
            <div className="l-alert l-alert-warning">No links found for module: {directory}</div>
          )}
        </div>
      </div>
    </div>
  )
}
