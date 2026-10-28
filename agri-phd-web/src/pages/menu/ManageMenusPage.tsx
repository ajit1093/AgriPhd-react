import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { useMasterData } from '@/hooks/useMasterData'

/**
 * Menu/ManageMenus.aspx — exact parity
 * Dapper dynamic preserves SP column names (PascalCase): MenuID, LinkName, SeqNo, IsActive
 */

interface MenuRow {
  MenuID: number
  LinkName: string
  DisplayStartDateTime: string
  DisplayEndDateTime: string
  SeqNo: number
  IsActive: boolean | string
}

interface GroupRow {
  MenuID: number
  LinkName: string
}

type RowState = MenuRow & { localIsActive: boolean; localSeqNo: number }

export default function ManageMenusPage() {
  const qc = useQueryClient()
  const [userTypeId, setUserTypeId]   = useState(-1)
  const [parentMenuId, setParentMenuId] = useState(-1)
  const [rows, setRows] = useState<RowState[]>([])

  const { data: userTypes = [] } = useMasterData('user-type')
  const filteredTypes = userTypes.filter(t => !['0'].includes(String(t.value)))

  const { data: groups = [], isLoading: groupsLoading } = useQuery<GroupRow[]>({
    queryKey: ['menu-admin', 'groups', userTypeId],
    queryFn:  () => apiClient.get(`/admin/menu-admin/groups?userTypeId=${userTypeId}`).then(r => r.data),
    enabled:  userTypeId > 0,
  })

  const { data: menuData, isLoading: menusLoading } = useQuery<MenuRow[]>({
    queryKey: ['menu-admin', 'menus', userTypeId, parentMenuId],
    queryFn:  () => apiClient.get(`/admin/menu-admin/menus?userTypeId=${userTypeId}&parentMenuId=${parentMenuId}`).then(r => r.data),
    enabled:  userTypeId > 0 && parentMenuId > 0,
  })

  useEffect(() => {
    if (menuData) {
      setRows(menuData.map(r => ({
        ...r,
        localIsActive: r.IsActive === true || String(r.IsActive).toLowerCase() === 'true' || String(r.IsActive) === 'Y',
        localSeqNo:    Number(r.SeqNo) || 0,
      })))
    }
  }, [menuData])

  const saveMutation = useMutation({
    mutationFn: () => apiClient.post('/admin/menu-admin/menus/save', {
      items: rows.map(r => ({ menuId: r.MenuID, isActive: r.localIsActive, seqNo: r.localSeqNo }))
    }).then(r => r.data),
    onSuccess: (d) => {
      if (d.success) {
        toast.success('Data Saved Successfully.')
        qc.invalidateQueries({ queryKey: ['menu'] })
        qc.invalidateQueries({ queryKey: ['menu-admin'] })
      } else toast.error(d.message ?? 'Save failed.')
    },
    onError: () => toast.error('Save failed.'),
  })

  const toggleIsActive = (idx: number) =>
    setRows(r => r.map((row, i) => i === idx ? { ...row, localIsActive: !row.localIsActive } : row))

  const toggleSeq = (idx: number, checked: boolean) => {
    setRows(prev => {
      const updated = [...prev]
      if (checked) {
        const maxSeq = Math.max(0, ...updated.map(r => r.localSeqNo))
        updated[idx] = { ...updated[idx], localSeqNo: maxSeq + 1 }
      } else {
        const removedSeq = updated[idx].localSeqNo
        updated[idx] = { ...updated[idx], localSeqNo: 0 }
        for (let i = 0; i < updated.length; i++)
          if (updated[i].localSeqNo > removedSeq)
            updated[i] = { ...updated[i], localSeqNo: updated[i].localSeqNo - 1 }
      }
      return updated
    })
  }

  return (
    <div style={{ padding: '8px' }}>
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '12px' }}>
        <Link to="/admin/menus"       className="btn-special"        style={{ textDecoration: 'none', padding: '6px 16px' }}>Manage Menus</Link>
        <Link to="/admin/menu-groups" className="btn-outline-legacy" style={{ textDecoration: 'none', padding: '6px 16px' }}>Manage Groups</Link>
        <Link to="/admin/menu-links"  className="btn-outline-legacy" style={{ textDecoration: 'none', padding: '6px 16px' }}>Manage Links</Link>
      </div>

      <div className="l-card">
        <div className="l-card-header">Manage Menus</div>
        <div className="l-card-body">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: '0 0 180px' }}>
              <label className="control-label">User Type <span className="required">*</span></label>
              <select className="l-form-control" value={userTypeId}
                onChange={e => { setUserTypeId(Number(e.target.value)); setParentMenuId(-1); setRows([]) }}>
                <option value={-1}>-- Select --</option>
                {filteredTypes.map(t => <option key={t.value} value={Number(t.value)}>{t.text}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ flex: '0 0 220px' }}>
              <label className="control-label">Group <span className="required">*</span></label>
              <select className="l-form-control" value={parentMenuId}
                onChange={e => { setParentMenuId(Number(e.target.value)); setRows([]) }}
                disabled={userTypeId <= 0 || groupsLoading}>
                <option value={-1}>-- Select --</option>
                {groups.map(g => <option key={g.MenuID} value={g.MenuID}>{g.LinkName}</option>)}
              </select>
            </div>
            {rows.length > 0 && (
              <>
                <button type="button" className="btn-special" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : 'Save Menus'}
                </button>
                <button type="button" onClick={() => setRows(r => r.map(x => ({ ...x, localSeqNo: 0 })))}
                  style={{ padding: '6px 12px', border: '1px solid #dc3545', color: '#dc3545', background: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Reset Menus
                </button>
              </>
            )}
          </div>

          {menusLoading && <p style={{ textAlign: 'center', padding: '16px' }}>Loading…</p>}

          {rows.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="grid-view" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Sr.</th>
                    <th style={{ textAlign: 'left' }}>Menu Name</th>
                    <th>Display Start Date Time</th>
                    <th>Display End Date Time</th>
                    <th style={{ width: '70px' }}>Is Active</th>
                    <th style={{ width: '70px' }}>Set Seq</th>
                    <th style={{ width: '80px' }}>Seq No</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.MenuID} style={{ backgroundColor: row.localSeqNo > 0 ? '#C2D69B' : undefined }}>
                      <td style={{ textAlign: 'center' }}>{i + 1}.</td>
                      <td style={{ textAlign: 'left' }}>{row.LinkName}</td>
                      <td style={{ textAlign: 'center' }}>{row.DisplayStartDateTime}</td>
                      <td style={{ textAlign: 'center' }}>{row.DisplayEndDateTime}</td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={row.localIsActive} onChange={() => toggleIsActive(i)}
                          style={{ width: '20px', transform: 'scale(1.3)' }} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="checkbox" checked={row.localSeqNo > 0} onChange={e => toggleSeq(i, e.target.checked)}
                          style={{ width: '20px', transform: 'scale(1.3)' }} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input type="number" min={0} value={row.localSeqNo}
                          onChange={e => setRows(r => r.map((x, j) => j === i ? { ...x, localSeqNo: Number(e.target.value) } : x))}
                          style={{ width: '56px', textAlign: 'center', border: '1px solid #ced4da', borderRadius: '4px', padding: '2px 4px', fontSize: '13px' }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {parentMenuId > 0 && !menusLoading && rows.length === 0 && (
            <div className="l-alert l-alert-warning">No menus found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
