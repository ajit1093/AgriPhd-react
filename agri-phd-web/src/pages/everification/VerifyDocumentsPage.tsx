import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { evApi, type EVDocumentRow } from '@/api/everification'

/**
 * P2-G-02 — EVerification/EVerifyDocuments.aspx
 * SP: EV_GetCandidateDetailsForEVerification(@CandidateID)
 *     EV_SaveDocumentsEVerificationStatus(@CandidateID, @DocumentsVerifiedXML, @UserLoginID, @IPAddress)
 *
 * For each document: View link | Document Name | Verification Status dropdown | Comments
 * Status values: Y=Verified, H=Hold, N=Not Verified
 */
interface DocState { status: string; comments: string }

const VERIFY_OPTIONS = [
  { value: '-1', label: '-- Select --' },
  { value: 'Y',  label: 'Verified' },
  { value: 'H',  label: 'Hold' },
  { value: 'N',  label: 'Not Verified' },
]

export default function VerifyDocumentsPage() {
  const { candidateId } = useParams<{ candidateId: string }>()
  const navigate        = useNavigate()
  const cid             = parseInt(candidateId ?? '0')

  const { data, isLoading } = useQuery({
    queryKey: ['evc', 'docs', cid],
    queryFn: () => evApi.getCandidateDocuments(cid),
    enabled: cid > 0,
  })

  const [docStates, setDocStates] = useState<Record<number, DocState>>({})

  useEffect(() => {
    if (data?.documents) {
      const initial: Record<number, DocState> = {}
      data.documents.forEach(d => {
        initial[d.DocumentID] = {
          status:   d.DocumentVerificationStatus || '-1',
          comments: d.DocumentVerificationComments || '',
        }
      })
      setDocStates(initial)
    }
  }, [data])

  const saveMut = useMutation({
    mutationFn: () => {
      const docs = (data?.documents ?? []).map(d => ({
        documentId: d.DocumentID,
        status:     docStates[d.DocumentID]?.status ?? '-1',
        comments:   docStates[d.DocumentID]?.comments ?? '',
      })).filter(d => d.status !== '-1')
      return evApi.saveVerification(cid, docs)
    },
    onSuccess: (r) => {
      if (r.success) { toast.success('Verification status saved.'); navigate('/everification/dashboard') }
      else toast.error('Save failed.')
    },
  })

  if (isLoading) {
    return (
      <div className="w-full max-w-[1720px] mx-auto py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-emerald-600 border-t-transparent mb-3"></div>
        <p className="text-slate-600 font-medium text-base">Loading uploaded candidate documents…</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1720px] mx-auto py-2">
      <div className="l-card shadow-sm border border-slate-200/80 rounded-xl overflow-hidden bg-white">
        <div className="l-card-header bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <span className="text-lg font-bold tracking-tight">E-Verify Documents</span>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700/60">
              Candidate ID: #{cid}
            </span>
          </div>
          <button
            type="button"
            className="text-xs font-semibold px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-700"
            onClick={() => navigate('/everification/candidates')}
          >
            ← Back to Candidate Queue
          </button>
        </div>

        <div className="p-6">
          <div className="overflow-x-auto rounded-lg border border-slate-200 mb-6">
            <table className="w-full min-w-[650px] text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-16">Sr.</th>
                  <th className="py-3 px-4 text-left">Document Name</th>
                  <th className="py-3 px-4 text-center w-28">Uploaded File</th>
                  <th className="py-3 px-4 text-left w-52">Verification Status</th>
                  <th className="py-3 px-4 text-left w-72">Remarks / Scrutiny Comments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {!data?.documents?.length ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No documents found for this candidate.
                    </td>
                  </tr>
                ) : data.documents.map((doc: EVDocumentRow, i: number) => (
                  <tr key={doc.DocumentID} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 text-center font-mono font-medium text-slate-600">{i + 1}</td>
                    <td className="py-3 px-4 text-left font-medium text-slate-900">
                      {doc.DocumentName}
                      {doc.IsDocumentCompulsory && <span className="text-rose-600 font-bold ml-1">*</span>}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {doc.IsDocumentUploaded && doc.DocumentUploadedURL ? (
                        <a
                          href={`/api/v1/files/view?url=${encodeURIComponent(doc.DocumentUploadedURL)}&fileName=${encodeURIComponent(doc.DocumentName)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View File
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium italic">Not uploaded</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                        value={docStates[doc.DocumentID]?.status ?? '-1'}
                        onChange={e => setDocStates(prev => ({
                          ...prev,
                          [doc.DocumentID]: { ...prev[doc.DocumentID], status: e.target.value }
                        }))}
                      >
                        {VERIFY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        maxLength={250}
                        placeholder="Remarks (mandatory if rejecting/hold)"
                        value={docStates[doc.DocumentID]?.comments ?? ''}
                        onChange={e => setDocStates(prev => ({
                          ...prev,
                          [doc.DocumentID]: { ...prev[doc.DocumentID], comments: e.target.value }
                        }))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
            <button
              type="button"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-400 text-white font-bold text-sm rounded-lg shadow-sm transition-all duration-150 flex items-center gap-2"
              disabled={saveMut.isPending}
              onClick={() => saveMut.mutate()}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {saveMut.isPending ? 'Saving Decisions…' : 'Save Verification Status'}
            </button>
            <button
              type="button"
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-sm rounded-lg transition-colors"
              onClick={() => navigate('/everification/candidates')}
            >
              Back to Candidates
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

