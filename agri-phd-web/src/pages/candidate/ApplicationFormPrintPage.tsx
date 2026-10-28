import { useQuery } from '@tanstack/react-query'
import { appFormApi } from '@/api/applicationForm'

/**
 * P2-D-11 / P6-THEME-16 — Candidate/ApplicationFormPrint.aspx → ApplicationFormPrintPage
 * Modernized Academic Print Layout for Ph.D. Admissions.
 * Clean, high-resolution official document ready for print & download.
 */
export default function ApplicationFormPrintPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['print-data'],
    queryFn: () => appFormApi.getSummary(),
  })

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />
        <span>Generating Print-Ready Application Form…</span>
      </div>
    )
  }
  if (!data) return null

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 print:p-0 print:bg-white text-slate-900 font-sans">
      {/* Floating Action Bar — Hidden in Print */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between no-print bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="p-2 bg-primary-50 rounded-lg text-primary-700 font-bold">🖨️</span>
          <div>
            <h1 className="text-sm font-bold text-slate-900">Application Form Preview</h1>
            <p className="text-2xs text-slate-500">Official Doctor of Philosophy (Ph.D.) Admission Form</p>
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
            <span>Print Application Form</span>
          </button>
        </div>
      </div>

      {/* Official Sheet Container (A4 Printable Layout) */}
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-xl border border-slate-200/90 shadow-card print:border-0 print:shadow-none print:p-0 print:max-w-none">

        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-5 mb-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-3">
            <img src="/mcaer-logo.png" alt="MCAER Logo" className="h-16 w-16 object-contain" />
            <div>
              <p className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                Maharashtra Council of Agriculture Education and Research, Pune
              </p>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-950 mt-0.5">
                Centralized Admissions to Doctor of Philosophy (Ph.D.) 2026-27
              </h2>
              <p className="text-2xs font-semibold text-slate-600 uppercase tracking-widest mt-0.5">
                Government of Maharashtra State
              </p>
            </div>
          </div>
          <div className="inline-block bg-slate-900 text-white font-bold text-xs uppercase tracking-widest px-4 py-1 rounded">
            Official Application Form
          </div>
        </div>

        {/* Personal Details */}
        <PrintSection title="1. Personal Information">
          <div className="relative">
            {data.personal.photoUploadedURL && (
              <div className="absolute right-0 top-0 text-center">
                <img
                  src={data.personal.photoUploadedURL}
                  alt="Candidate"
                  className="w-24 h-32 object-cover border-2 border-slate-900 rounded shadow-2xs"
                />
                <span className="text-3xs uppercase font-bold text-slate-500 block mt-1">Photo</span>
              </div>
            )}
            <div className="space-y-1.5 pr-32">
              <PrintRow label="Application Form No" value={data.personal.applicationFormNo} bold />
              <PrintRow label="Candidate's Full Name" value={data.personal.candidateName} bold />
              <PrintRow label="Father's / Husband's Full Name" value={data.personal.fatherName} />
              <PrintRow label="Gender" value={data.personal.gender} />
              <PrintRow label="Date of Birth" value={data.personal.dOB} />
              <PrintRow label="Mobile Number" value={data.personal.mobileNo} />
              <PrintRow label="E-Mail ID" value={data.personal.eMailID} />
            </div>
          </div>
        </PrintSection>

        {/* Address */}
        <PrintSection title="2. Address for Correspondence">
          <PrintRow
            label="Full Postal Address"
            value={[
              data.address.addressLine1,
              data.address.addressLine2,
              data.address.city,
              data.address.taluka,
              data.address.district,
              data.address.state,
              data.address.pincode,
            ].filter(Boolean).join(', ')}
          />
        </PrintSection>

        {/* Category */}
        <PrintSection title="3. Social Category & Reservation">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <PrintRow label="Claimed Category" value={data.category.category} />
            <PrintRow label="Allotment / Final Category" value={data.category.finalCategory} bold />
            <PrintRow label="Caste" value={data.category.caste} />
            <PrintRow label="Domicile" value={data.category.domicile} />
          </div>
        </PrintSection>

        {/* Qualification */}
        <PrintSection title="4. Qualifying Degree & Examination">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <PrintRow label="Faculty" value={data.qualification.faculty} />
            <PrintRow label="Subject" value={data.qualification.subjectName} />
            <PrintRow label="College Name" value={data.qualification.collegeName} />
            <PrintRow label="CGPA Score" value={data.qualification.cGPAScore} bold />
          </div>
        </PrintSection>

        {/* Applied Colleges */}
        {data.colleges.length > 0 && (
          <PrintSection title="5. College Preference Choices">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 text-slate-900 border-b border-slate-300">
                  <tr>
                    <th className="py-1.5 px-2 text-center border-r border-slate-300 font-bold w-12">Pref</th>
                    <th className="py-1.5 px-2 border-r border-slate-300 font-bold">College Name</th>
                    <th className="py-1.5 px-2 border-r border-slate-300 font-bold">District</th>
                    <th className="py-1.5 px-2 border-r border-slate-300 font-bold">Faculty</th>
                    <th className="py-1.5 px-2 font-bold">Subject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {data.colleges.map((c, i) => (
                    <tr key={i}>
                      <td className="py-1 px-2 text-center border-r border-slate-300 font-bold font-mono">
                        #{c.preferenceNo}
                      </td>
                      <td className="py-1 px-2 border-r border-slate-300">{c.collegeName}</td>
                      <td className="py-1 px-2 border-r border-slate-300">{c.district}</td>
                      <td className="py-1 px-2 border-r border-slate-300">{c.facultyName}</td>
                      <td className="py-1 px-2">{c.subjectName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PrintSection>
        )}

        {/* Payment Details */}
        {data.fees.length > 0 && (
          <PrintSection title="6. Application Processing Fee">
            {data.fees.map((f, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <PrintRow label="Amount Paid" value={`₹${f.feeAmount}`} bold />
                <PrintRow label="Status" value={f.paidStatus} bold />
                <PrintRow label="Transaction Date" value={f.paymentDate || f.transactionDate} />
              </div>
            ))}
          </PrintSection>
        )}

        {/* Declaration & Undertaking */}
        <PrintSection title="7. Candidate Declaration">
          <p className="text-xs text-slate-700 leading-relaxed text-justify mb-8">
            I hereby declare that the particulars furnished by me in this application form are true, correct, and complete to the best of my knowledge and belief. I have read all the rules governing the admission process of MCAER Pune. In case any of the information is found to be false or incorrect at any stage, my candidature/admission shall be liable to be cancelled forthwith.
          </p>

          <div className="flex justify-between items-end pt-6 border-t border-slate-300 text-xs">
            <div className="space-y-1.5">
              <p>Place: ______________________</p>
              <p>Date: ______________________</p>
            </div>
            <div className="text-center space-y-2">
              {data.personal.signUploadedURL ? (
                <img
                  src={data.personal.signUploadedURL}
                  alt="Candidate Signature"
                  className="h-10 w-36 object-contain mx-auto border-b border-slate-400"
                />
              ) : (
                <div className="h-10 w-36 border-b border-slate-400 mx-auto" />
              )}
              <p className="font-bold text-slate-900">Signature of Applicant</p>
              <p className="text-3xs text-slate-600 font-mono">({data.personal.candidateName})</p>
            </div>
          </div>
        </PrintSection>

      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff !important; }
          @page { margin: 15mm 12mm; }
        }
      `}</style>
    </div>
  )
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <div className="bg-slate-100 text-slate-900 font-bold px-3 py-1.5 text-xs uppercase tracking-wider border-l-4 border-slate-900 mb-2">
        {title}
      </div>
      <div className="px-2">{children}</div>
    </div>
  )
}

function PrintRow({ label, value, bold }: { label: string; value?: string; bold?: boolean }) {
  return (
    <div className="flex items-baseline text-xs mb-1">
      <span className="font-semibold text-slate-600 w-52 shrink-0">{label}:</span>
      <span className={`text-slate-900 ${bold ? 'font-bold' : ''}`}>{value || '—'}</span>
    </div>
  )
}
