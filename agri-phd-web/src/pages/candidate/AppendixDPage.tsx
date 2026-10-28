import { useQuery } from '@tanstack/react-query'
import { appFormApi } from '@/api/applicationForm'

/**
 * P2-D-12 / P6-THEME-16 — Candidate/AppendixD.aspx → AppendixDPage
 * Modernized Academic Print Layout for Appendix D (Undertaking).
 */
export default function AppendixDPage() {
  const { data } = useQuery({
    queryKey: ['print-data'],
    queryFn: appFormApi.getSummary,
  })

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Action Bar */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-primary-50 rounded-lg text-primary-700 font-bold">📄</span>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Appendix — D Preview</h1>
            <p className="text-2xs text-slate-500">Official Candidate Undertaking</p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-md text-xs font-semibold transition-colors cursor-pointer"
            onClick={() => window.history.back()}
          >
            ← Back
          </button>
          <button
            type="button"
            className="btn-special inline-flex items-center gap-2 bg-academic-navy hover:bg-primary-900 text-white font-semibold px-5 py-2 rounded-md shadow-sm transition-all hover:shadow cursor-pointer text-xs"
            onClick={() => window.print()}
          >
            <span>Print Appendix D</span>
          </button>
        </div>
      </div>

      {/* Official Document Sheet */}
      <div className="max-w-3xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-slate-200/90 shadow-card print:border-0 print:shadow-none print:p-0 print:max-w-none">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-900 pb-5 mb-8">
          <img src="/mcaer-logo.png" alt="MCAER Logo" className="h-16 w-16 object-contain mx-auto mb-2" />
          <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Maharashtra Council of Agriculture Education and Research, Pune
          </p>
          <h2 className="text-lg font-extrabold text-slate-950 mt-1">
            APPENDIX — D
          </h2>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest mt-0.5">
            Undertaking by the Candidate for Ph.D. Admission 2026-27
          </h3>
        </div>

        {/* Declaration body */}
        <div className="space-y-4 text-xs leading-relaxed text-slate-800 text-justify">
          <p className="text-sm leading-relaxed">
            I, <strong className="font-bold underline decoration-slate-400">{data?.personal?.candidateName ?? '___________________________'}</strong>,
            bearing Application Form No. <strong className="font-mono font-bold">{data?.personal?.applicationFormNo ?? '___________'}</strong>,
            do hereby solemnly declare and affirm that:
          </p>

          <ol className="list-decimal list-outside space-y-3 pl-5 text-slate-700">
            <li>
              All information, qualifications, and credentials provided in my Ph.D. admission application form are true, correct, and complete to the best of my knowledge and belief.
            </li>
            <li>
              I have not suppressed any material information or submitted fraudulent/forged documents or certificates in support of my candidature.
            </li>
            <li>
              I am fully aware that if any particulars or certificates provided by me are discovered to be false, manipulated, or incorrect at any stage before or after admission, my candidature/admission shall stand cancelled forthwith without any refund of fees, and I will be liable to legal action under applicable laws.
            </li>
            <li>
              I have read, understood, and accept all the admission prospectus rules, seat distribution norms, and regulations governing the Ph.D. admissions process of MCAER, Pune, and I agree to abide by them unconditionally.
            </li>
            <li>
              I have not applied for or claimed admission under any reservation or category to which I am not lawfully entitled under Maharashtra Government rules.
            </li>
            <li>
              All document uploads submitted during the online process are authentic representations of original certificates, and I undertake to present the originals during physical scrutiny whenever required.
            </li>
          </ol>
        </div>

        {/* Signature Blocks */}
        <div className="mt-12 pt-8 border-t border-slate-300 flex justify-between items-end text-xs">
          <div className="space-y-2">
            <p>Place: ______________________</p>
            <p>Date: ______________________</p>
          </div>
          <div className="text-center space-y-2">
            {data?.personal?.signUploadedURL ? (
              <img
                src={data.personal.signUploadedURL}
                alt="Signature"
                className="h-10 w-36 object-contain mx-auto border-b border-slate-400"
              />
            ) : (
              <div className="h-12 w-44 border-b border-slate-400 mx-auto" />
            )}
            <p className="font-bold text-slate-900">Signature of Candidate</p>
            <p className="text-3xs text-slate-600 font-mono">({data?.personal?.candidateName ?? ''})</p>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          @page { margin: 20mm 15mm; }
        }
      `}</style>
    </div>
  )
}
