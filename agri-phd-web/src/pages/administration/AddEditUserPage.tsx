import { useEffect } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { apiClient } from '@/api/client'

/**
 * Administration/AddEditUsers.aspx — exact parity
 * Fields: User Name (uppercase) | User Mobile Number (10 digits, starts 6-9) | User E-Mail ID
 * Password is auto-generated server-side (8 chars, Base64-encoded) — not shown in form
 * Save → Administration_SaveUser SP → redirect back to ManageUsers
 */

const schema = z.object({
  userName:     z.string().min(1, 'User Name is required.').transform(s => s.toUpperCase()),
  userMobileNo: z.string()
    .min(10, 'Mobile Number must be 10 digits.')
    .max(10, 'Mobile Number must be 10 digits.')
    .regex(/^[6-9]\d{9}$/, 'Mobile No. must start with 6-9 and be 10 digits.'),
  userEMailId:  z.string().email('Please enter a valid E-Mail ID.').transform(s => s.toLowerCase()),
})
type FormValues = z.infer<typeof schema>

export default function AddEditUserPage() {
  const { id } = useParams<{ id?: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const isEdit = !!id && id !== '0'
  const userTypeId = Number(searchParams.get('userTypeId') ?? 12)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { userName: '', userMobileNo: '', userEMailId: '' },
  })

  // Load existing user for edit
  const { data: existing } = useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => apiClient.get(`/admin/users/${id}`).then(r => r.data),
    enabled: isEdit,
  })

  useEffect(() => {
    if (existing) {
      reset({
        userName:     (existing.userName ?? '').toUpperCase(),
        userMobileNo: existing.userMobileNo ?? '',
        userEMailId:  (existing.userEMailID ?? existing.userEMailId ?? '').toLowerCase(),
      })
    }
  }, [existing, reset])

  const saveMutation = useMutation({
    mutationFn: (data: FormValues) => apiClient.post('/admin/users', {
      userId:       isEdit ? Number(id) : 0,
      userTypeId,
      userPassword: '', // auto-generated server-side (8-char random, Base64-encoded)
      userName:     data.userName,
      userMobileNo: data.userMobileNo,
      userEMailId:  data.userEMailId,
      districtId:   -1,
      regionId:     1,
    }).then(r => r.data),
    onSuccess: (d) => {
      if (d.success) {
        toast.success(isEdit ? 'User updated successfully.' : 'User saved successfully.')
        navigate(`/admin/users?userTypeId=${userTypeId}`)
      } else {
        toast.error(d.message ?? 'Save failed.')
      }
    },
    onError: () => toast.error('Save failed.'),
  })

  const onBack = () => navigate(`/admin/users?userTypeId=${userTypeId}`)

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card" style={{ maxWidth: '600px' }}>
        <div className="l-card-header">Add / Edit Users</div>
        <div className="l-card-body">
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} noValidate>

            <div className="form-group">
              <label className="control-label" htmlFor="userName">
                User Name <span className="required">*</span>
              </label>
              <input
                id="userName"
                type="text"
                className="l-form-control"
                maxLength={150}
                placeholder="Enter full name"
                style={{ textTransform: 'uppercase' }}
                aria-required="true"
                aria-invalid={!!errors.userName}
                aria-describedby={errors.userName ? 'userName-error' : undefined}
                {...register('userName')}
              />
              {errors.userName && (
                <span id="userName-error" role="alert" className="required" style={{ fontSize: '90%' }}>
                  {errors.userName.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="control-label" htmlFor="userMobileNo">
                User Mobile Number <span className="required">*</span>
              </label>
              <input
                id="userMobileNo"
                type="tel"
                inputMode="numeric"
                className="l-form-control"
                maxLength={10}
                placeholder="10-digit mobile (starts with 6-9)"
                aria-required="true"
                aria-invalid={!!errors.userMobileNo}
                aria-describedby={errors.userMobileNo ? 'mobile-error' : undefined}
                {...register('userMobileNo')}
              />
              {errors.userMobileNo && (
                <span id="mobile-error" role="alert" className="required" style={{ fontSize: '90%' }}>
                  {errors.userMobileNo.message}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="control-label" htmlFor="userEmail">
                User E-Mail ID <span className="required">*</span>
              </label>
              <input
                id="userEmail"
                type="email"
                className="l-form-control"
                maxLength={100}
                placeholder="user@example.com"
                aria-required="true"
                aria-invalid={!!errors.userEMailId}
                aria-describedby={errors.userEMailId ? 'email-error' : undefined}
                {...register('userEMailId')}
              />
              {errors.userEMailId && (
                <span id="email-error" role="alert" className="required" style={{ fontSize: '90%' }}>
                  {errors.userEMailId.message}
                </span>
              )}
            </div>

            {!isEdit && (
              <div className="l-alert l-alert-info" style={{ fontSize: '90%', marginBottom: '12px' }}>
                Password will be auto-generated (8 characters) and stored. Use Generate Password or Send SMS to share with the user.
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="submit" className="btn-success-legacy" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </button>
              <button type="button"
                style={{ padding: '6px 12px', border: '1px solid #dc3545', color: '#dc3545', background: 'none', borderRadius: '4px', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={onBack}>
                &laquo;&laquo;&laquo; Back
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
