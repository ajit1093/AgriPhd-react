import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { useMasterData } from '@/hooks/useMasterData'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface UserRow {
  UserID: number
  UserTypeID: number
  UserType: string
  UserLoginID: string
  UserName: string
  UserMobileNo: string
  UserEMailID: string
  IsActive: string
  ActivOrDeactive: string
}

export default function ManageUsersPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [userTypeId, setUserTypeId] = useState(12)
  const [toggleId, setToggleId] = useState<number | null>(null)
  const [toggleName, setToggleName] = useState('')

  const { data: userTypes = [] } = useMasterData('user-type')

  const { data: rows = [], isLoading } = useQuery<UserRow[]>({
    queryKey: ['admin', 'users', userTypeId],
    queryFn: () => apiClient.get(`/admin/users?userTypeId=${userTypeId}`).then(r => r.data),
    enabled: userTypeId > 0,
  })

  const toggleMutation = useMutation({
    mutationFn: (id: number) => apiClient.post(`/admin/users/${id}/toggle-active`).then(r => r.data),
    onSuccess: () => {
      toast.success('User status updated.')
      qc.invalidateQueries({ queryKey: ['admin','users'] })
      setToggleId(null)
    },
    onError: () => toast.error('Update failed.'),
  })

  // Filter out typeIds that admins shouldn't see (0, 91, 11 for non-super-admin shown server-side)
  const filteredTypes = (userTypes ?? []).filter(t => !['0','91'].includes(String(t.value)))

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Manage Users</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn-success-legacy" style={{ fontSize: '90%' }}
              onClick={() => navigate(`/admin/users/add?userTypeId=${userTypeId}`)}>
              + Add New User
            </button>
          </div>
        </div>
        <div className="l-card-body">

          {/* Filter */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '16px', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '0 0 200px' }}>
              <label className="control-label">User Type</label>
              <select className="l-form-control" value={userTypeId}
                onChange={e => setUserTypeId(Number(e.target.value))}>
                <option value={0}>-- Select --</option>
                {filteredTypes.map(t => <option key={t.value} value={Number(t.value)}>{t.text}</option>)}
              </select>
            </div>
            <button type="button" className="btn-primary-legacy"
              onClick={() => qc.invalidateQueries({ queryKey: ['admin','users',userTypeId] })}>
              Refresh
            </button>
          </div>
          <div className="l-alert l-alert-info" style={{ fontSize: '90%', marginBottom: '12px' }}>
            To Send Login ID and Password on Registered Mobile Number, Click On &apos;Send SMS&apos; Button.
          </div>

          {/* Grid */}
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th>Sr.</th>
                  <th>Login ID</th>
                  <th style={{ textAlign: 'left' }}>Name</th>
                  <th>User Type</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                : rows.length === 0 ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No users found.</td></tr>
                : rows.map((r, i) => (
                  <tr key={r.UserID}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{r.UserLoginID}</td>
                    <td style={{ textAlign: 'left' }}>{r.UserName}</td>
                    <td>{r.UserType}</td>
                    <td>{r.UserMobileNo}</td>
                    <td>{r.UserEMailID}</td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ color: r.IsActive === 'Y' ? '#198754' : '#dc3545', fontWeight: 600 }}>
                        {r.IsActive === 'Y' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button type="button" onClick={() => navigate(`/admin/users/edit/${r.UserID}?userTypeId=${userTypeId}`)}
                        style={{ color: '#0d6efd', background: 'none', border: 'none', cursor: 'pointer', marginRight: '6px' }}>
                        Edit
                      </button>
                      {/* Send SMS — sends login credentials to registered mobile */}
                      <button type="button"
                        style={{ color: '#198754', background: 'none', border: 'none', cursor: 'pointer', marginRight: '6px' }}
                        onClick={() => {
                          toast('SMS feature requires MSG91 integration (Phase 3).', { icon: 'ℹ️' })
                        }}>
                        Send SMS
                      </button>
                      <button type="button" onClick={() => { setToggleId(r.UserID); setToggleName(r.UserName) }}
                        style={{ color: r.IsActive === 'Y' ? '#dc3545' : '#198754', background: 'none', border: 'none', cursor: 'pointer' }}>
                        {r.IsActive === 'Y' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: '90%', color: '#666', marginTop: '8px' }}>
            Total: {rows.length} user(s)
          </div>
        </div>
      </div>

      <ConfirmDialog open={toggleId !== null} onClose={() => setToggleId(null)}
        onConfirm={() => toggleId && toggleMutation.mutate(toggleId)}
        title="Change User Status"
        message={`Change status for "${toggleName}"?`}
        confirmLabel="Confirm" variant="danger" loading={toggleMutation.isPending} />
    </div>
  )
}



