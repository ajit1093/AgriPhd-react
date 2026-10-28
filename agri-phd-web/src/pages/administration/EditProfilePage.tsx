import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'
import { useAuthStore } from '@/store/authStore'

/**
 * Administration/EditUserProfile.aspx — Edit own profile
 * Updates: User Name | Mobile No. | E-Mail ID
 */
const schema = z.object({
  userName:     z.string().min(1, 'Name is required.').transform(s => s.toUpperCase()),
  userMobileNo: z.string().regex(/^\d{10}$/, '10-digit mobile required.'),
  userEMailId:  z.string().email('Valid email required.').transform(s => s.toLowerCase()),
})
type FormValues = z.infer<typeof schema>

export default function EditProfilePage() {
  const { user } = useAuthStore()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { userName: user?.userName ?? '', userMobileNo: '', userEMailId: '' },
  })

  useEffect(() => {
    if (user) reset({ userName: user.userName ?? '', userMobileNo: '', userEMailId: '' })
  }, [user, reset])

  const saveMutation = useMutation({
    mutationFn: (d: FormValues) => apiClient.put('/admin/profile', d).then(r => r.data),
    onSuccess: (d) => {
      if (d.success) toast.success('Profile updated successfully.')
      else toast.error(d.message ?? 'Update failed.')
    },
  })

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '560px' }}>
        <div className="l-card-header">Edit User Profile</div>
        <div className="l-card-body">
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} noValidate>
            <div className="form-group">
              <label className="control-label">User Name <span className="required">*</span></label>
              <input type="text" className="l-form-control" style={{ textTransform: 'uppercase' }} {...register('userName')} />
              {errors.userName && <span className="required" style={{ fontSize: '90%' }}>{errors.userName.message}</span>}
            </div>
            <div className="form-group">
              <label className="control-label">Mobile No. <span className="required">*</span></label>
              <input type="tel" maxLength={10} className="l-form-control" {...register('userMobileNo')} />
              {errors.userMobileNo && <span className="required" style={{ fontSize: '90%' }}>{errors.userMobileNo.message}</span>}
            </div>
            <div className="form-group">
              <label className="control-label">E-Mail ID <span className="required">*</span></label>
              <input type="email" className="l-form-control" {...register('userEMailId')} />
              {errors.userEMailId && <span className="required" style={{ fontSize: '90%' }}>{errors.userEMailId.message}</span>}
            </div>
            <button type="submit" className="btn-success-legacy" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving…' : 'Save'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
