import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi } from '@/api/applicationForm'
import { apiClient } from '@/api/client'
import { CANDIDATE_ROUTES } from '@/router/routes'
import { WizardHeader } from '@/components/candidate/WizardHeader'

/**
 * P2-D-08 / P6-THEME-15 — Candidate/UploadPhotoAndSign.aspx → UploadPhotoSignPage
 * Modernized Academic Ph.D. Admissions Theme.
 *
 * Upload photo (JPG/PNG, max 100KB) and signature (max 50KB) to Blob storage.
 */
export default function UploadPhotoSignPage() {
  const navigate = useNavigate()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [signFile,  setSignFile]  = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const { data: existing, isLoading } = useQuery({
    queryKey: ['photo-sign'],
    queryFn: appFormApi.getPhotoSign,
  })

  const saveMut = useMutation({
    mutationFn: (urls: { photoUrl: string; signUrl: string }) =>
      appFormApi.savePhotoSign(urls.photoUrl, urls.signUrl),
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Photograph & signature saved successfully.')
        navigate(CANDIDATE_ROUTES.uploadDocuments)
      } else {
        toast.error(r.message ?? 'Save failed.')
      }
    },
  })

  const handleUploadAndSave = async () => {
    setUploading(true)
    try {
      let photoUrl = existing?.photoUrl ?? ''
      let signUrl  = existing?.signUrl  ?? ''

      if (photoFile) {
        const fd = new FormData()
        fd.append('file', photoFile)
        fd.append('type', 'photo')
        const r = await apiClient.post<{ url: string }>('/application-form/photo', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        photoUrl = r.data.url
      }
      if (signFile) {
        const fd = new FormData()
        fd.append('file', signFile)
        fd.append('type', 'sign')
        const r = await apiClient.post<{ url: string }>('/application-form/sign', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        signUrl = r.data.url
      }
      if (photoUrl && signUrl) {
        saveMut.mutate({ photoUrl, signUrl })
      } else {
        toast.error('Please upload both candidate photograph and signature.')
      }
    } catch {
      toast.error('Upload failed. Please ensure file sizes comply with specifications.')
    } finally {
      setUploading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Loading Photo &amp; Signature…</span>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={7} />

      <div className="l-card bg-white border border-slate-200/90 rounded-xl shadow-card overflow-hidden">
        {/* Card Header */}
        <div className="l-card-header bg-gradient-to-r from-academic-navy to-primary-900 text-white font-semibold text-base py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-300">📷</span>
            <span>Upload Photo &amp; Signature (Step 7 of 10)</span>
          </div>
          <span className="text-xs text-white/80 font-normal hidden sm:inline">
            Official Biometric Identification
          </span>
        </div>

        <div className="l-card-body p-6 space-y-6">

          {/* Guidelines notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>📋</span>
              <span>Image Upload Specifications:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
              <li><strong>Photograph:</strong> Recent passport-size color photo with white background (JPG/PNG, Max 100 KB, 3.5cm × 4.5cm).</li>
              <li><strong>Signature:</strong> Sign on white paper with black/blue ink (JPG/PNG, Max 50 KB, 3.5cm × 1.5cm).</li>
            </ul>
          </div>

          {/* Upload Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Photo upload card */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>👤</span>
                  <span>Candidate Photograph <span className="text-rose-600">*</span></span>
                </span>
                {(existing?.photoUrl || photoFile) ? (
                  <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ Available
                  </span>
                ) : (
                  <span className="text-2xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    Pending
                  </span>
                )}
              </div>

              {/* Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 min-h-[160px]">
                {(existing?.photoUrl || photoFile) ? (
                  <img
                    src={photoFile ? URL.createObjectURL(photoFile) : existing?.photoUrl}
                    alt="Candidate Photograph Preview"
                    className="w-[110px] h-[140px] object-cover rounded shadow-2xs border-2 border-white ring-1 ring-slate-200"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <span className="text-3xl block mb-1">📷</span>
                    <span className="text-xs">No photograph selected</span>
                  </div>
                )}
              </div>

              <div>
                <label className="control-label block text-xs font-semibold text-slate-700 mb-1">
                  Choose Photo File (.jpg, .jpeg, .png)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="l-form-control w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  onChange={e => setPhotoFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

            {/* Signature upload card */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <span>✍️</span>
                  <span>Candidate Signature <span className="text-rose-600">*</span></span>
                </span>
                {(existing?.signUrl || signFile) ? (
                  <span className="text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    ✓ Available
                  </span>
                ) : (
                  <span className="text-2xs font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                    Pending
                  </span>
                )}
              </div>

              {/* Preview */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border border-dashed border-slate-300 min-h-[160px]">
                {(existing?.signUrl || signFile) ? (
                  <img
                    src={signFile ? URL.createObjectURL(signFile) : existing?.signUrl}
                    alt="Candidate Signature Preview"
                    className="w-[180px] h-[65px] object-contain rounded bg-white p-1 border-2 border-white ring-1 ring-slate-200 shadow-2xs"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <span className="text-3xl block mb-1">✒️</span>
                    <span className="text-xs">No signature selected</span>
                  </div>
                )}
              </div>

              <div>
                <label className="control-label block text-xs font-semibold text-slate-700 mb-1">
                  Choose Signature File (.jpg, .jpeg, .png)
                </label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  className="l-form-control w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                  onChange={e => setSignFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>

          </div>

          {/* Navigation Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(CANDIDATE_ROUTES.shortlist)}
              className="btn-outline-legacy inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              <span>&lt;&lt;&lt; Back to Preferences</span>
            </button>

            <button
              type="button"
              className="btn-special inline-flex items-center gap-2 bg-academic-navy hover:bg-primary-900 text-white font-medium px-6 py-2.5 rounded-md shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50 text-sm"
              disabled={uploading || saveMut.isPending}
              onClick={handleUploadAndSave}
            >
              {uploading || saveMut.isPending ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Uploading Files…</span>
                </>
              ) : (
                <>
                  <span>Save &amp; Next</span>
                  <span>&gt;&gt;&gt;</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
