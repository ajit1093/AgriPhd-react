import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi, type RequiredDocumentApiRow } from '@/api/applicationForm'
import { apiClient } from '@/api/client'
import { CANDIDATE_ROUTES } from '@/router/routes'
import { WizardHeader } from '@/components/candidate/WizardHeader'

/**
 * P2-D-09 / P6-THEME-15 — Candidate/UploadRequiredDocuments.aspx → UploadDocumentsPage
 * Modernized Academic Ph.D. Admissions Theme.
 *
 * Dynamic checklist of certificates, degrees, and reservation documents.
 */
export default function UploadDocumentsPage() {
  const navigate                    = useNavigate()
  const qc                          = useQueryClient()
  const [uploading, setUploading]   = useState<number | null>(null)
  const [issueDates, setIssueDates] = useState<Record<number, string>>({})
  const [docNos,     setDocNos]     = useState<Record<number, string>>({})

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['required-docs'],
    queryFn: appFormApi.getRequiredDocuments,
  })

  const handleUpload = async (doc: RequiredDocumentApiRow, file: File) => {
    setUploading(doc.documentID)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('documentId', String(doc.documentID))
      const r = await apiClient.post<{ url: string }>(`/application-form/documents/${doc.documentID}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const url = r.data.url
      const issueDate = issueDates[doc.documentID] ?? ''
      const docNo     = docNos[doc.documentID] ?? ''
      const ok = await appFormApi.saveDocument(doc.documentID, url, docNo, issueDate)
      if (ok.success) {
        toast.success(`${doc.documentName} uploaded successfully.`)
        qc.invalidateQueries({ queryKey: ['required-docs'] })
      } else {
        toast.error('Failed to save document details.')
      }
    } catch {
      toast.error('Upload failed. Please check file format and size.')
    } finally {
      setUploading(null)
    }
  }

  const allCompulsoryDone = docs.filter(d => d.isDocumentCompulsory).every(d => d.isDocumentUploaded)

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={8} />

      <div className="l-card bg-white border border-slate-200/90 rounded-xl shadow-card overflow-hidden">
        {/* Card Header */}
        <div className="l-card-header bg-gradient-to-r from-academic-navy to-primary-900 text-white font-semibold text-base py-3.5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-amber-300">📁</span>
            <span>Upload Required Documents (Step 8 of 10)</span>
          </div>
          <span className="text-xs text-white/80 font-normal hidden sm:inline">
            Mandatory Documents for E-Verification
          </span>
        </div>

        <div className="l-card-body p-6 space-y-5">

          {/* Document criteria guidelines */}
          <div className="bg-primary-50/70 border border-primary-200 rounded-lg p-4 text-xs text-primary-950 flex items-start gap-3">
            <span className="text-base text-primary-700 shrink-0">ℹ️</span>
            <div>
              <p className="font-semibold text-primary-950">Document Guidelines for E-Scrutiny:</p>
              <p className="text-slate-600 mt-0.5">
                Upload clear scanned copies of original documents in <strong>PDF, JPG, or PNG</strong> format (Max size 500 KB per document). Documents marked <strong>Compulsory</strong> must be uploaded to proceed.
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
              <span>Loading Required Documents Checklist…</span>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-2xs">
              <table className="grid-view w-full min-w-[720px] text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-center w-12">Sr. No.</th>
                    <th className="py-2.5 px-3 font-semibold">Document Name</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-28">Type</th>
                    <th className="py-2.5 px-3 font-semibold w-36">Document No</th>
                    <th className="py-2.5 px-3 font-semibold w-36">Issue Date</th>
                    <th className="py-2.5 px-3 font-semibold text-center w-28">Status</th>
                    <th className="py-2.5 px-3 font-semibold w-48">Upload File</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {docs.map((doc, i) => (
                    <tr key={doc.documentID} className="hover:bg-slate-50/60">
                      <td className="py-2.5 px-3 text-center text-slate-500">{i + 1}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">{doc.documentName}</td>
                      <td className="py-2.5 px-3 text-center">
                        {doc.isDocumentCompulsory ? (
                          <span className="inline-block bg-rose-50 text-rose-700 border border-rose-200 text-2xs font-bold px-2 py-0.5 rounded">
                            Compulsory
                          </span>
                        ) : (
                          <span className="inline-block bg-slate-100 text-slate-600 border border-slate-200 text-2xs font-semibold px-2 py-0.5 rounded">
                            Optional
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          placeholder="Doc / Cert No."
                          className="l-form-control w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-primary-600 focus:ring-1 focus:ring-primary-600/20"
                          value={docNos[doc.documentID] ?? ''}
                          onChange={e => setDocNos(p => ({ ...p, [doc.documentID]: e.target.value }))}
                        />
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="date"
                          className="l-form-control w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-primary-600 focus:ring-1 focus:ring-primary-600/20"
                          value={issueDates[doc.documentID] ?? ''}
                          onChange={e => setIssueDates(p => ({ ...p, [doc.documentID]: e.target.value }))}
                        />
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {doc.isDocumentUploaded ? (
                          <span className="inline-flex items-center gap-1 text-2xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            ✓ Uploaded
                          </span>
                        ) : (
                          <span className="inline-block text-2xs font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                            Pending
                          </span>
                        )}
                        {doc.documentVerificationStatus && (
                          <span
                            className={`block mt-1 text-2xs font-bold ${
                              doc.documentVerificationStatus === 'Rejected'
                                ? 'text-rose-600'
                                : 'text-emerald-700'
                            }`}
                          >
                            {doc.documentVerificationStatus}
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          disabled={uploading === doc.documentID}
                          className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer disabled:opacity-50"
                          onChange={e => e.target.files?.[0] && handleUpload(doc, e.target.files[0])}
                        />
                        {uploading === doc.documentID && (
                          <span className="text-2xs text-primary-700 font-semibold block mt-0.5">
                            Uploading…
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!allCompulsoryDone && (
            <div className="l-alert l-alert-warning bg-amber-50 border-l-4 border-amber-500 text-amber-900 p-3.5 rounded-r-lg text-xs leading-relaxed flex items-center gap-2">
              <span className="text-amber-700 text-base shrink-0">⚠️</span>
              <span>Please upload all <strong>Compulsory</strong> documents marked in red before proceeding to fee payment.</span>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => navigate(CANDIDATE_ROUTES.uploadPhotoSign)}
              className="btn-outline-legacy inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              <span>&lt;&lt;&lt; Back to Photo &amp; Sign</span>
            </button>

            <button
              type="button"
              className="btn-special inline-flex items-center gap-2 bg-academic-navy hover:bg-primary-900 text-white font-medium px-6 py-2.5 rounded-md shadow-sm transition-all hover:shadow cursor-pointer disabled:opacity-50 text-sm"
              disabled={!allCompulsoryDone}
              onClick={() => navigate(CANDIDATE_ROUTES.payFee)}
            >
              <span>Save &amp; Next</span>
              <span>&gt;&gt;&gt;</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}
