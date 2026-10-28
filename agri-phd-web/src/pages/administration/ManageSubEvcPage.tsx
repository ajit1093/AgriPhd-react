import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface SubEVC {
  evcid: number
  evcCode: string
  coordinatorName: string
  coordinatorMobileNo: string
  coordinatorEMailID: string
  isActive: string
}

export default function ManageSubEvcPage() {
  const qc = useQueryClient()
  const [evcId, setEvcId] = useState(-1)
  const [toggleId, setToggleId] = useState<{ id: number; activate: boolean; name: string } | null>(null)

  const { data: evcs = [] } = useQuery<{ evcid: number; evcCode: string; coordinatorName: string }[]>({
    queryKey: ['admin', 'evc'],
    queryFn: () => apiClient.get('/admin/evc').then(r => r.data),
  })

  const { data: rows = [], isLoading } = useQuery<SubEVC[]>({
    queryKey: ['admin', 'sub-evc', evcId],
    queryFn: () => apiClient.get(`/admin/sub-evc?evcId=${evcId}`).then(r => r.data),
    enabled: evcId > 0,
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
      apiClient.post(`/admin/evc/${id}/${activate ? 'activate' : 'deactivate'}`).then(r => r.data),
    onSuccess: (d, vars) => {
      if (d.success) {
        toast.success(`Sub-EVC ${vars.activate ? 'Activated' : 'Deactivated'} Successfully.`)
        qc.invalidateQueries({ queryKey: ['admin', 'sub-evc'] })
        setToggleId(null)
      } else toast.error(d.message ?? 'Failed.')
    },
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Manage Sub e-Verification Centers</div>
        <div className="l-card-body">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '0 0 260px' }}>
              <label className="control-label">e-Verification Center <span className="required">*</span></label>
              <select className="l-form-control" value={evcId} onChange={e => setEvcId(Number(e.target.value))}>
                <option value={-1}>-- Select EVC --</option>
                {evcs.map(e => <option key={e.evcid} value={e.evcid}>{e.evcCode} — {e.coordinatorName}</option>)}
              </select>
            </div>
          </div>

          {isLoading && <p style={{ textAlign: 'center', padding: '16px' }}>Loading…</p>}
          {evcId > 0 && !isLoading && (
            <div style={{ overflowX: 'auto' }}>
              <table className="grid-view" style={{ width: '100%' }}>
                <thead>
                  <tr>
                    <th>Action</th><th>EVC Code</th>
                    <th style={{ textAlign: 'left' }}>Coordinator Name</th>
                    <th>Mobile No.</th><th style={{ textAlign: 'left' }}>E-Mail ID</th><th>Is Active</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '12px', color: '#888' }}>No sub-EVCs found.</td></tr>
                    : rows.map(r => {
                        const active = r.isActive === 'Y'
                        return (
                          <tr key={r.evcid}>
                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {active && <button type="button" onClick={() => setToggleId({ id: r.evcid, activate: false, name: r.coordinatorName })}
                                style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontSize: '90%' }}>✗ De-Activate</button>}
                              {!active && <button type="button" onClick={() => setToggleId({ id: r.evcid, activate: true, name: r.coordinatorName })}
                                style={{ color: '#198754', background: 'none', border: 'none', cursor: 'pointer', fontSize: '90%' }}>✓ Activate</button>}
                            </td>
                            <td>{r.evcCode}</td>
                            <td style={{ textAlign: 'left' }}>{r.coordinatorName}</td>
                            <td>{r.coordinatorMobileNo}</td>
                            <td style={{ textAlign: 'left' }}>{r.coordinatorEMailID}</td>
                            <td style={{ textAlign: 'center' }}>{r.isActive}</td>
                          </tr>
                        )
                      })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog open={!!toggleId} onClose={() => setToggleId(null)}
        onConfirm={() => toggleId && toggleMutation.mutate({ id: toggleId.id, activate: toggleId.activate })}
        title={toggleId?.activate ? 'Activate Sub-EVC' : 'Deactivate Sub-EVC'}
        message={`${toggleId?.activate ? 'Activate' : 'Deactivate'} Sub-EVC "${toggleId?.name}"?`}
        confirmLabel="Confirm" variant="danger" loading={toggleMutation.isPending} />
    </div>
  )
}
