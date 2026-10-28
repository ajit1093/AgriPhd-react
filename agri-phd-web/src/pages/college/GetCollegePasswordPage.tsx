import { useState } from 'react'
import { collegeApi } from '@/api/college'

/**
 * P2-I-04 / P6-THEME-12 — College/GetCollegePassword.aspx — Super Admin only
 * Modernized administrative credential lookup card for participating colleges.
 */
export default function GetCollegePasswordPage() {
  const [code, setCode]       = useState('')
  const [result, setResult]   = useState<{ collegeCode: string; password: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSearch = async () => {
    if (!code.trim()) { setError('Please enter a valid College Code.'); return }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const r = await collegeApi.getPassword(code.trim())
      setResult(r)
    } catch {
      setError('No matching college record found for this College Code.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto py-4 sm:py-8">
      <div className="l-card bg-white border border-slate-200/90 rounded-2xl shadow-xl overflow-hidden">
        {/* Card Header */}
        <div className="bg-[#0B1D33] text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-xl shadow-2xs">
              🏫
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                College Credential Inquiry
              </h1>
              <p className="text-xs text-slate-300 mt-0.5">
                Authorized super-administrator college password lookup
              </p>
            </div>
          </div>
          <span className="text-2xs font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full">
            Super Admin
          </span>
        </div>

        {/* Card Body */}
        <div className="p-6 sm:p-8 bg-white space-y-6">
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
            <span className="text-base shrink-0">⚠️</span>
            <span><strong>Strict Confidentiality:</strong> College administrative credentials are encrypted. Access is logged for institutional audit trails.</span>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="col-code-inquiry" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                College Code (Login ID) <span className="text-rose-600 font-extrabold">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base" aria-hidden="true">
                    🏢
                  </span>
                  <input
                    id="col-code-inquiry"
                    type="text"
                    placeholder="Enter College Code (e.g. 11101)"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:ring-3 focus:ring-emerald-500/20 transition-all font-mono shadow-2xs"
                  />
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSearch}
                  className="px-6 h-11 bg-agriculture hover:bg-agriculture-600 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 border border-emerald-400/30 shrink-0"
                >
                  {loading ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Retrieve</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {result && (
              <div className="p-5 rounded-xl bg-emerald-50/80 border-2 border-emerald-300 text-xs space-y-2">
                <span className="text-3xs uppercase font-extrabold text-emerald-800 tracking-wider block">
                  Official Credentials
                </span>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                  <div>
                    <span className="text-slate-500 block text-3xs">College Code</span>
                    <strong className="text-base font-mono text-slate-900">{result.collegeCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-3xs">Current Password</span>
                    <strong className="text-base font-mono text-emerald-900 select-all bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                      {result.password}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
