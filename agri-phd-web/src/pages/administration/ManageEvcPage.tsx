import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

/**
 * Administration/ManageEVC.aspx — exact parity
 * SP columns (PascalCase, Dapper dynamic): EVCID, EVCCode, CoordinatorName,
 * CoordinatorMobileNo, CoordinatorEMailID, IsActive
 */
interface EVC {
  EVCID: number
  EVCCode: string
  CoordinatorName: string
  CoordinatorMobileNo: string
  CoordinatorEMailID: string
  IsActive: string
}

export default function ManageEvcPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [toggleId, setToggleId] = useState<{ id: number; activate: boolean; name: string } | null>(null)

  const { data: rows = [], isLoading } = useQuery<EVC[]>({
    queryKey: ['admin', 'evc'],
    queryFn: () => apiClient.get('/admin/evc').then(r => r.data),
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, activate }: { id: number; activate: boolean }) =>
      apiClient.post(`/admin/evc/${id}/${activate ? 'activate' : 'deactivate'}`).then(r => r.data),
    onSuccess: (d, vars) => {
      if (d.success) {
        toast.success(`EVC ${vars.activate ? 'Activated' : 'Deactivated'} Successfully.`)
        qc.invalidateQueries({ queryKey: ['admin', 'evc'] })
        setToggleId(null)
      } else toast.error(d.message ?? 'Operation failed.')
    },
    onError: () => toast.error('Operation failed.'),
  })

  const exportToExcel = () => {
    let html = '<table><tr><th>EVC Code</th><th>Co-Ordinator Name</th><th>Mobile No.</th><th>E-Mail ID</th><th>Is Active</th></tr>'
    rows.forEach(r => {
      html += `<tr><td>${r.EVCCode}</td><td>${r.CoordinatorName}</td><td>${r.CoordinatorMobileNo}</td><td>${r.CoordinatorEMailID}</td><td>${r.IsActive}</td></tr>`
    })
    html += '</table>'
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'EVCList.xls'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>e-Verification Centers List</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-success-legacy" style={{ fontSize: '90%' }} onClick={exportToExcel}>Export to Excel</button>
            <button type="button" className="btn-special" style={{ fontSize: '90%' }} onClick={() => navigate('/admin/evc/0')}>
              Add New e-Verification Center
            </button>
          </div>
        </div>
        <div className="l-card-body" style={{ padding: 0 }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>EVC Code</th>
                  <th style={{ textAlign: 'left' }}>Co-Ordinator Name</th>
                  <th>Co-Ordinator Mobile No.</th>
                  <th style={{ textAlign: 'left' }}>Co-Ordinator E-Mail ID</th>
                  <th>Is Active</th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                  : rows.length === 0
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No EVCs found.</td></tr>
                    : rows.map(r => {
                        const active = r.IsActive === 'Y'
                        return (
                          <tr key={r.EVCID}>
                            <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                              {active && (
                                <button type="button" onClick={() => navigate(`/admin/evc/${r.EVCID}`)}
                                  style={{ color: '#0d6efd', background: 'none', border: 'none', cursor: 'pointer', marginRight: '4px', fontSize: '90%' }}>
                                  ✏️ Edit
                                </button>
                              )}
                              {!active && (
                                <button type="button" onClick={() => setToggleId({ id: r.EVCID, activate: true, name: r.CoordinatorName })}
                                  style={{ color: '#198754', background: 'none', border: 'none', cursor: 'pointer', marginRight: '4px', fontSize: '90%' }}>
                                  ✓ Activate
                                </button>
                              )}
                              {active && (
                                <button type="button" onClick={() => setToggleId({ id: r.EVCID, activate: false, name: r.CoordinatorName })}
                                  style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontSize: '90%' }}>
                                  ✗ De-Activate
                                </button>
                              )}
                            </td>
                            <td style={{ whiteSpace: 'nowrap' }}>{r.EVCCode}</td>
                            <td style={{ textAlign: 'left' }}>{r.CoordinatorName}</td>
                            <td>{r.CoordinatorMobileNo}</td>
                            <td style={{ textAlign: 'left' }}>{r.CoordinatorEMailID}</td>
                            <td style={{ textAlign: 'center' }}>{r.IsActive}</td>
                          </tr>
                        )
                      })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog open={!!toggleId} onClose={() => setToggleId(null)}
        onConfirm={() => toggleId && toggleMutation.mutate({ id: toggleId.id, activate: toggleId.activate })}
        title={toggleId?.activate ? 'Activate EVC' : 'Deactivate EVC'}
        message={`${toggleId?.activate ? 'Activate' : 'Deactivate'} EVC "${toggleId?.name}"?`}
        confirmLabel="Confirm" variant="danger" loading={toggleMutation.isPending} />
    </div>
  )
}
