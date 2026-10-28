import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

/**
 * Administration/ManageActivityStatus.aspx — exact parity
 * SP cols (PascalCase, Dapper dynamic): ActivityName, ActivityDetails,
 * ActivityStartDateTimeF, ActivityEndDateTimeF
 */

interface ActivityRow {
  ActivityName: string
  ActivityDetails: string
  ActivityStartDateTimeF: string
  ActivityEndDateTimeF: string
}

function toInputDatetime(s: string) {
  // "dd-MM-yyyy HH:mm" → "yyyy-MM-ddTHH:mm"
  if (!s?.trim()) return ''
  const [date, time] = s.trim().split(' ')
  const [dd, mm, yyyy] = (date ?? '').split('-')
  if (!dd || !mm || !yyyy) return ''
  return `${yyyy}-${mm}-${dd}T${time ?? '00:00'}`
}

function fromInputDatetime(s: string) {
  // "yyyy-MM-ddTHH:mm" → "dd-MM-yyyy HH:mm"
  if (!s) return ''
  const [date, time] = s.split('T')
  const [yyyy, mm, dd] = (date ?? '').split('-')
  if (!yyyy) return ''
  return `${dd}-${mm}-${yyyy} ${time ?? '00:00'}`
}

export default function ManageActivityStatusPage() {
  const qc = useQueryClient()
  const [selected, setSelected] = useState<ActivityRow | null>(null)
  const [startDT, setStartDT] = useState('')
  const [endDT,   setEndDT]   = useState('')

  const { data: rows = [], isLoading } = useQuery<ActivityRow[]>({
    queryKey: ['admin', 'activity-status'],
    queryFn:  () => apiClient.get('/admin/activity-status').then(r => r.data),
  })

  const saveMutation = useMutation({
    mutationFn: () => apiClient.post('/admin/activity-status', {
      regionId:              1,
      activityName:          selected!.ActivityName,
      activityStartDateTime: fromInputDatetime(startDT),
      activityEndDateTime:   fromInputDatetime(endDT),
    }).then(r => r.data),
    onSuccess: (d) => {
      if (d.success) {
        toast.success('Information Saved Successfully.')
        qc.invalidateQueries({ queryKey: ['admin', 'activity-status'] })
        setSelected(null)
      } else {
        toast.error(d.message ?? 'There is some problem in Data Saving. Please try again.')
      }
    },
    onError: () => toast.error('There is some problem in Data Saving. Please try again.'),
  })

  const onEdit = (row: ActivityRow) => {
    setSelected(row)
    setStartDT(toInputDatetime(row.ActivityStartDateTimeF))
    setEndDT(toInputDatetime(row.ActivityEndDateTimeF))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onCancel = () => { setSelected(null); setStartDT(''); setEndDT('') }

  return (
    <div style={{ padding: '8px' }}>

      {/* ── Top card: edit form ─────────────────────────────────────────── */}
      {selected && (
        <div className="l-card" style={{ marginBottom: '12px' }}>
          <div className="l-card-header">Activity Status Details</div>
          <div className="l-card-body">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
              <div className="form-group" style={{ flex: '1 1 300px' }}>
                <label className="control-label">Activity</label>
                <input type="text" className="l-form-control" value={selected.ActivityDetails} disabled
                  style={{ backgroundColor: '#e9ecef' }} />
              </div>
              <div className="form-group" style={{ flex: '1 1 220px' }}>
                <label className="control-label">Activity Start Date Time <span className="required">*</span></label>
                <input type="datetime-local" className="l-form-control" value={startDT}
                  onChange={e => setStartDT(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: '1 1 220px' }}>
                <label className="control-label">Activity End Date Time <span className="required">*</span></label>
                <input type="datetime-local" className="l-form-control" value={endDT}
                  onChange={e => setEndDT(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="l-card-footer" style={{ display: 'flex', gap: '8px', padding: '8px' }}>
            <button type="button" className="btn-success-legacy"
              onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : 'Update'}
            </button>
            <button type="button" onClick={onCancel}
              style={{ padding: '6px 12px', border: '1px solid #dc3545', color: '#dc3545', background: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom card: list ───────────────────────────────────────────── */}
      <div className="l-card">
        <div className="l-card-header">Activity Status List</div>
        <div className="l-card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Sr. No.</th>
                  <th style={{ width: '28%', textAlign: 'left' }}>Activity</th>
                  <th>Activity Start Date Time</th>
                  <th>Activity End Date Time</th>
                  <th style={{ width: '60px' }}>Edit</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                  : rows.length === 0
                    ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No records found.</td></tr>
                    : rows.map((row, i) => (
                      <tr key={row.ActivityName}
                        style={{ backgroundColor: selected?.ActivityName === row.ActivityName ? '#dff0d8' : undefined }}>
                        <td style={{ textAlign: 'center' }}>{i + 1}.</td>
                        <td style={{ textAlign: 'left' }}>{row.ActivityDetails}</td>
                        <td style={{ textAlign: 'center' }}>{row.ActivityStartDateTimeF}</td>
                        <td style={{ textAlign: 'center' }}>{row.ActivityEndDateTimeF}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button type="button" onClick={() => onEdit(row)}
                            title="Edit" aria-label={`Edit ${row.ActivityDetails}`}
                            style={{ color: '#198754', background: 'none', border: 'none', cursor: 'pointer', fontSize: '115%' }}>
                            ✏️
                          </button>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
