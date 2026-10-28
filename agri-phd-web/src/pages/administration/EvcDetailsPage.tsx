import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

/**
 * Administration/EVCDetails.aspx — Add/Edit EVC
 * Fields: EVC Code (read-only auto) | Coordinator Name | Mobile | Email
 */
const schema = z.object({
  evcCode:             z.string().optional(),
  coordinatorName:     z.string().min(1, 'Coordinator Name is required.'),
  coordinatorMobileNo: z.string().regex(/^\d{10}$/, '10 digits required.'),
  coordinatorEMailId:  z.string().email('Valid email required.'),
})
type FormValues = z.infer<typeof schema>

export default function EvcDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id && id !== '0'

  const { data } = useQuery({
    queryKey: ['admin', 'evc-details', id],
    queryFn:  () => apiClient.get(`/admin/evc/${id}`).then(r => r.data),
    enabled:  isEdit,
  })

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (data) reset({
      evcCode:             data.EVCCode ?? data.evcCode ?? '',
      coordinatorName:     data.CoordinatorName ?? data.coordinatorName ?? '',
      coordinatorMobileNo: data.CoordinatorMobileNo ?? data.coordinatorMobileNo ?? '',
      coordinatorEMailId:  data.CoordinatorEMailID ?? data.coordinatorEMailID ?? '',
    })
  }, [data, reset])

  const saveMutation = useMutation({
    mutationFn: (d: FormValues) => apiClient.post('/admin/evc', {
      evcId:               isEdit ? Number(id) : 0,
      evcCode:             d.evcCode ?? '',
      coordinatorName:     d.coordinatorName,
      coordinatorMobileNo: d.coordinatorMobileNo,
      coordinatorEMailId:  d.coordinatorEMailId,
    }).then(r => r.data),
    onSuccess: (d) => {
      if (d.success) { toast.success('EVC saved.'); navigate('/admin/evc') }
      else toast.error(d.message ?? 'Save failed.')
    },
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '560px' }}>
        <div className="l-card-header">{isEdit ? 'Edit e-Verification Center' : 'Add New e-Verification Center'}</div>
        <div className="l-card-body">
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} noValidate>
            {isEdit && (
              <div className="form-group">
                <label className="control-label">EVC Code</label>
                <input type="text" className="l-form-control" disabled style={{ backgroundColor: '#e9ecef' }} {...register('evcCode')} />
              </div>
            )}
            <div className="form-group">
              <label className="control-label">Coordinator Name <span className="required">*</span></label>
              <input type="text" className="l-form-control" {...register('coordinatorName')} />
              {errors.coordinatorName && <span className="required" style={{ fontSize: '90%' }}>{errors.coordinatorName.message}</span>}
            </div>
            <div className="form-group">
              <label className="control-label">Coordinator Mobile No. <span className="required">*</span></label>
              <input type="tel" maxLength={10} className="l-form-control" {...register('coordinatorMobileNo')} />
              {errors.coordinatorMobileNo && <span className="required" style={{ fontSize: '90%' }}>{errors.coordinatorMobileNo.message}</span>}
            </div>
            <div className="form-group">
              <label className="control-label">Coordinator E-Mail ID <span className="required">*</span></label>
              <input type="email" className="l-form-control" {...register('coordinatorEMailId')} />
              {errors.coordinatorEMailId && <span className="required" style={{ fontSize: '90%' }}>{errors.coordinatorEMailId.message}</span>}
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" className="btn-success-legacy" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => navigate('/admin/evc')}
                style={{ padding: '6px 12px', border: '1px solid #dc3545', color: '#dc3545', background: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                &laquo; Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
