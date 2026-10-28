import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { useMasterData } from '@/hooks/useMasterData'

/**
 * Menu/ManageGroups.aspx — exact parity
 * Dapper dynamic preserves SP column names (PascalCase): MenuID, LinkName, SeqNo, IsActive
 */

interface GroupRow {
  MenuID: number
  LinkName: string
  DisplayStartDateTime: string
  DisplayEndDateTime: string
  SeqNo: number
  IsActive: boolean | string
}

type RowState = GroupRow & { localIsActive: boolean; localSeqNo: number }

export default function ManageGroupsPage() {
  const qc = useQueryClient()
  const [userTypeId, setUserTypeId] = useState(-1)
  const [rows, setRows] = useState<RowState[]>([])

  const { data: userTypes = [] } = useMasterData('user-type')
  const filteredTypes = userTypes.filter(t => !['0'].includes(String(t.value)))

  const { data: groupData, isLoading } = useQuery<GroupRow[]>({
    queryKey: ['menu-admin', 'groups-list', userTypeId],
    queryFn:  () => apiClient.get(`/admin/menu-admin/groups?userTypeId=${userTypeId}`).then(r => r.data),
    enabled:  userTypeId > 0,
  })

  useEffect(() => {
    if (groupData) {
      setRows(groupData.map(r => ({
        ...r,
        localIsActive: r.IsActive === true || String(r.IsActive).toLowerCase() === 'true' || String(r.IsActive) === 'Y',
        localSeqNo:    Number(r.SeqNo) || 0,
      })))
    }
  }, [groupData])

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
        <Link to="/admin/menus"       className="btn-outline-legacy" style={{ textDecoration: 'none', padding: '6px 16px' }}>Manage Menus</Link>
        <Link to="/admin/menu-groups" className="btn-special"        style={{ textDecoration: 'none', padding: '6px 16px' }}>Manage Groups</Link>
        <Link to="/admin/menu-links"  className="btn-outline-legacy" style={{ textDecoration: 'none', padding: '6px 16px' }}>Manage Links</Link>
      </div>

      <div className="l-card">
        <div className="l-card-header">Manage Groups</div>
        <div className="l-card-body">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div className="form-group" style={{ flex: '0 0 180px' }}>
              <label className="control-label">User Type <span className="required">*</span></label>
              <select className="l-form-control" value={userTypeId}
                onChange={e => { setUserTypeId(Number(e.target.value)); setRows([]) }}>
                <option value={-1}>-- Select --</option>
                {filteredTypes.map(t => <option key={t.value} value={Number(t.value)}>{t.text}</option>)}
              </select>
            </div>
            {rows.length > 0 && (
              <>
                <button type="button" className="btn-success-legacy" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : 'Save Groups'}
                </button>
                <button type="button" onClick={() => setRows(r => r.map(x => ({ ...x, localSeqNo: 0 })))}
                  style={{ padding: '6px 12px', border: '1px solid #dc3545', color: '#dc3545', background: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Reset Groups
                </button>
              </>
            )}
          </div>

          {isLoading && <p style={{ textAlign: 'center', padding: '16px' }}>Loading…</p>}

          {rows.length > 0 && (
            <div style={{ overflowX: 'auto' }}>
              <table className="grid-view" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th style={{ width: '5%' }}>Action</th>
                    <th style={{ textAlign: 'left', width: '39%' }}>Group Name</th>
                    <th style={{ width: '17%' }}>Display Start Date Time</th>
                    <th style={{ width: '17%' }}>Display End Date Time</th>
                    <th style={{ width: '8%' }}>Is Active</th>
                    <th style={{ width: '7%' }}>Set Seq</th>
                    <th style={{ width: '7%' }}>Seq No</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <tr key={row.MenuID} style={{ backgroundColor: row.localSeqNo > 0 ? '#C2D69B' : undefined }}>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ color: '#198754', cursor: 'pointer', fontSize: '115%' }} title="Edit">✏️</span>
                      </td>
                      <td style={{ textAlign: 'left' }}>{row.LinkName}</td>
                      <td style={{ textAlign: 'center', fontSize: '85%' }}>{row.DisplayStartDateTime}</td>
                      <td style={{ textAlign: 'center', fontSize: '85%' }}>{row.DisplayEndDateTime}</td>
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

          {userTypeId > 0 && !isLoading && rows.length === 0 && (
            <div className="l-alert l-alert-warning">No groups found.</div>
          )}
        </div>
      </div>
    </div>
  )
}
