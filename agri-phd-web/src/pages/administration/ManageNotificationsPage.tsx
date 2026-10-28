import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { useMasterData } from '@/hooks/useMasterData'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface Notification {
  NotificationID: number
  NotificationCategoryID: number
  NotificationCategory: string
  NotificationTitle: string
  NotificationTitleMarathi: string
  DisplayStartDateTime: string
  DisplayEndDateTime: string
  ContentType: string
  FileContentName: string
  FileContentURL: string
  TextContent: string
  IsActive: number
  PublishDateTimeF: string
}

export default function ManageNotificationsPage() {
  const qc = useQueryClient()
  const [editId, setEditId] = useState<number | null>(null)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)

  const { data: categories = [] } = useMasterData('notification-category')
  const { data: rows = [], isLoading } = useQuery<Notification[]>({
    queryKey: ['admin', 'notifications'],
    queryFn: () => apiClient.get('/admin/notifications').then(r => r.data),
  })

  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      notificationId: 0, notificationCategoryId: 0, notificationTitle: '', notificationTitleMarathi: '',
      displayStartDateTime: '', displayEndDateTime: '', publishDateTime: '',
      contentType: 'F', textContent: '', textContentMarathi: '',
      fileContentName: '', fileContentUrl: '', openInNewPage: 1, displayNewImage: 1, isActive: 1,
    }
  })
  const contentType = watch('contentType')

  const saveMutation = useMutation({
    mutationFn: (data: object) => apiClient.post('/admin/notifications', data).then(r => r.data),
    onSuccess: () => {
      toast.success('Notification saved.')
      qc.invalidateQueries({ queryKey: ['admin', 'notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'home'] })
      resetForm()
    },
    onError: () => toast.error('Save failed.'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/admin/notifications/${id}`).then(r => r.data),
    onSuccess: () => {
      toast.success('Notification deleted.')
      qc.invalidateQueries({ queryKey: ['admin', 'notifications'] })
      qc.invalidateQueries({ queryKey: ['notifications', 'home'] })
      setDeleteId(null)
    },
    onError: () => toast.error('Delete failed.'),
  })

  const resetForm = () => { reset(); setEditId(null); setShowForm(false) }

  const onEdit = async (id: number) => {
    const row = rows.find(r => r.NotificationID === id)
    if (!row) return
    setValue('notificationId', row.NotificationID)
    setValue('notificationCategoryId', row.NotificationCategoryID)
    setValue('notificationTitle', row.NotificationTitle)
    setValue('notificationTitleMarathi', row.NotificationTitleMarathi)
    setValue('contentType', row.ContentType)
    setValue('textContent', row.TextContent ?? '')
    setValue('fileContentName', row.FileContentName ?? '')
    setValue('fileContentUrl', row.FileContentURL ?? '')
    setValue('isActive', row.IsActive)
    setEditId(id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Manage Notifications</span>
          <button type="button" className="btn-success-legacy" style={{ fontSize: '90%' }}
            onClick={() => { resetForm(); setShowForm(s => !s) }}>
            {showForm ? 'Cancel' : '+ Add New'}
          </button>
        </div>
        <div className="l-card-body">

          {/* ── Form ─────────────────────────────────────────────────────── */}
          {showForm && (
            <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} style={{ marginBottom: '24px', background: '#f8f9fa', padding: '16px', borderRadius: '4px' }}>
              <input type="hidden" {...register('notificationId')} />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                <div className="form-group" style={{ flex: '1 1 200px' }}>
                  <label className="control-label">Category <span className="required">*</span></label>
                  <select className="l-form-control" {...register('notificationCategoryId', { required: true, valueAsNumber: true })}>
                    <option value={0}>-- Select --</option>
                    {categories.map(c => <option key={c.value} value={Number(c.value)}>{c.text}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: '2 1 300px' }}>
                  <label className="control-label">Title (English) <span className="required">*</span></label>
                  <input type="text" className="l-form-control" {...register('notificationTitle', { required: true })} />
                </div>
                <div className="form-group" style={{ flex: '2 1 300px' }}>
                  <label className="control-label">Title (Marathi)</label>
                  <input type="text" className="l-form-control" {...register('notificationTitleMarathi')} />
                </div>
                <div className="form-group" style={{ flex: '1 1 180px' }}>
                  <label className="control-label">Display Start <span className="required">*</span></label>
                  <input type="datetime-local" className="l-form-control" {...register('displayStartDateTime')} />
                </div>
                <div className="form-group" style={{ flex: '1 1 180px' }}>
                  <label className="control-label">Display End <span className="required">*</span></label>
                  <input type="datetime-local" className="l-form-control" {...register('displayEndDateTime')} />
                </div>
                <div className="form-group" style={{ flex: '1 1 180px' }}>
                  <label className="control-label">Publish Date & Time <span className="required">*</span></label>
                  <input type="datetime-local" className="l-form-control" {...register('publishDateTime')} />
                </div>
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="control-label">Content Type <span className="required">*</span></label>
                  <select className="l-form-control" {...register('contentType')}>
                    <option value="F">File</option>
                    <option value="T">Text</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="control-label">Display New Image <span className="required">*</span></label>
                  <select className="l-form-control" {...register('displayNewImage', { valueAsNumber: true })}>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                {contentType === 'F' && (
                  <>
                    <div className="form-group" style={{ flex: '2 1 300px' }}>
                      <label className="control-label">File URL <span className="required">*</span></label>
                      <input type="text" className="l-form-control" placeholder="Azure Blob URL" {...register('fileContentUrl')} />
                    </div>
                    <div className="form-group" style={{ flex: '1 1 140px' }}>
                      <label className="control-label">Open in New Page <span className="required">*</span></label>
                      <select className="l-form-control" {...register('openInNewPage', { valueAsNumber: true })}>
                        <option value={1}>Yes</option>
                        <option value={0}>No</option>
                      </select>
                    </div>
                  </>
                )}
                {contentType === 'T' && (
                  <>
                    <div className="form-group" style={{ flex: '1 1 100%' }}>
                      <label className="control-label">Text Content (English)</label>
                      <textarea className="l-form-control" rows={3} {...register('textContent')} />
                    </div>
                    <div className="form-group" style={{ flex: '1 1 100%' }}>
                      <label className="control-label">Text Content (Marathi)</label>
                      <textarea className="l-form-control" rows={3} {...register('textContentMarathi')} />
                    </div>
                  </>
                )}
                <div className="form-group" style={{ flex: '1 1 120px' }}>
                  <label className="control-label">Is Active</label>
                  <select className="l-form-control" {...register('isActive', { valueAsNumber: true })}>
                    <option value={1}>Yes</option>
                    <option value={0}>No</option>
                  </select>
                </div>
              </div>
              <div style={{ marginTop: '12px' }}>
                <button type="submit" className="btn-special" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? 'Saving…' : editId ? 'Update' : 'Save'}
                </button>
                <button type="button" style={{ marginLeft: '8px' }} className="btn-outline-legacy" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          )}

          {/* ── Grid ─────────────────────────────────────────────────────── */}
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr><th>Sr.</th><th>Category</th><th style={{ textAlign: 'left' }}>Title</th><th>Type</th><th>Active</th><th>Published</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {isLoading ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px' }}>Loading…</td></tr>
                : rows.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>No notifications found.</td></tr>
                : rows.map((r, i) => (
                  <tr key={r.NotificationID}>
                    <td style={{ textAlign: 'center' }}>{i + 1}</td>
                    <td>{r.NotificationCategory}</td>
                    <td style={{ textAlign: 'left' }}>{r.NotificationTitle}</td>
                    <td style={{ textAlign: 'center' }}>{r.ContentType === 'F' ? 'File' : 'Text'}</td>
                    <td style={{ textAlign: 'center' }}>{r.IsActive ? 'Yes' : 'No'}</td>
                    <td style={{ textAlign: 'center' }}>{r.PublishDateTimeF}</td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <button type="button" onClick={() => onEdit(r.NotificationID)} style={{ color: '#0d6efd', background: 'none', border: 'none', cursor: 'pointer', marginRight: '8px' }}>Edit</button>
                      <button type="button" onClick={() => setDeleteId(r.NotificationID)} style={{ color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmDialog open={deleteId !== null} onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Delete Notification" message="Delete this notification? This cannot be undone."
        confirmLabel="Delete" variant="danger" loading={deleteMutation.isPending} />
    </div>
  )
}

