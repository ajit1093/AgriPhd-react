import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { appFormApi } from '@/api/applicationForm'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { CANDIDATE_ROUTES } from '@/router/routes'

import { WizardHeader } from '@/components/candidate/WizardHeader'

export default function ApplicationFormSummaryPage() {
  const navigate = useNavigate()
  const [declared, setDeclared]     = useState(false)
  const [lockConfirm, setLockConfirm] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['application-form', 'summary'],
    queryFn:  appFormApi.getSummary,
  })

  const lockMut = useMutation({
    mutationFn: appFormApi.lock,
    onSuccess: (r) => {
      if (r.success) {
        toast.success('Application Form Locked and Submitted Successfully.')
        navigate(CANDIDATE_ROUTES.dashboard)
      } else {
        toast.error(r.message ?? 'Lock failed.')
      }
    },
  })

  if (isLoading) return <div className="py-12 text-center text-sm text-neutral-500">Loading Application Summary…</div>
  if (isError)   return <div className="l-alert l-alert-danger my-4">Failed to load summary details. Please refresh.</div>
  if (!data)     return null

  const s = data.status ?? {}
  const p = data.personal   ?? {}
  const c = data.category   ?? {}
  const q = data.qualification ?? {}

  const steps = [
    { label: 'Personal Details',              done: s.isPersonalDetailsFilled,                      route: CANDIDATE_ROUTES.personal },
    { label: 'Address Details',               done: s.isAddressDetailsFilled,                       route: CANDIDATE_ROUTES.address },
    { label: 'Category & Other Reservation',  done: s.isCategoryAndOtherReservationDetailsFilled,   route: CANDIDATE_ROUTES.category },
    { label: 'Qualification Details',         done: s.isQualificationDetailsFilled,                 route: CANDIDATE_ROUTES.qualification },
    { label: 'Research Paper Details',        done: s.isSportsDetailsFilled,                        route: CANDIDATE_ROUTES.researchPaper },
    { label: 'Shortlist College Preferences', done: s.isAppliedForColleges,                         route: CANDIDATE_ROUTES.shortlist },
    { label: 'Photo & Signature Upload',      done: s.isPhotoAndSignUploaded,                       route: CANDIDATE_ROUTES.uploadPhotoSign },
    { label: 'Required Documents Upload',     done: s.isAllCompulsoryDocumentsUploaded,             route: CANDIDATE_ROUTES.uploadDocuments },
    { label: 'Pay Application Fee',           done: s.isApplicationFeePaid,                         route: CANDIDATE_ROUTES.payFee },
  ]
  const allDone = steps.every(st => st.done)

  return (
    <div className="w-full max-w-[1680px] mx-auto space-y-6">
      <WizardHeader currentStep={10} />
      <div className="l-card shadow-card">
        <div className="l-card-header">
          <span className="flex items-center gap-2">
            <span>📋</span>
            <span>Application Form Review &amp; Lock</span>
          </span>
          <span className="text-2xs bg-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
            Final Step
          </span>
        </div>

        <div className="l-card-body p-5 space-y-6">

          {/* ── Step completion status ─────────────────────────────────────── */}
          <Section title="Application Form Steps Completion Progress">
            <div className="overflow-x-auto">
              <table className="grid-view">
                <thead>
                  <tr>
                    <th className="w-14 text-center">Sr. No.</th>
                    <th className="text-left">Application Form Step</th>
                    <th className="w-32 text-center">Completion Status</th>
                    <th className="w-24 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {steps.map((step, i) => (
                    <tr key={i}>
                      <td className="text-center font-semibold text-neutral-500">{i + 1}</td>
                      <td className="text-left font-medium text-neutral-900">{step.label}</td>
                      <td className="text-center">
                        <span className={[
                          'inline-flex items-center px-2 py-0.5 rounded text-2xs font-semibold',
                          step.done
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200',
                        ].join(' ')}>
                          {step.done ? '✓ Completed' : '✗ Pending'}
                        </span>
                      </td>
                      <td className="text-center">
                        <Link
                          to={step.route}
                          className="text-xs font-semibold text-primary-800 hover:text-primary-600 underline"
                        >
                          {step.done ? 'Edit' : 'Fill Now'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── Personal Details ───────────────────────────────────────────── */}
          {p.candidateName && (
            <Section title="Personal Details">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <InfoRow label="Application Form No"   value={p.applicationFormNo} />
                  <InfoRow label="Candidate's Full Name" value={p.candidateName} />
                  <InfoRow label="Father's Full Name"    value={p.fatherName} />
                  <InfoRow label="Father's Occupation"   value={p.fathersOccupation} />
                  <InfoRow label="Mother's Maiden Name"  value={p.motherMaidanName} />
                  <InfoRow label="Mother's Present Name" value={p.motherPresentName} />
                  <InfoRow label="Gender"                value={p.gender} />
                  <InfoRow label="Date of Birth"         value={p.dOB} />
                  <InfoRow label="Age"                   value={p.age} />
                  <InfoRow label="Mobile Number"         value={p.mobileNo} />
                  <InfoRow label="E-Mail ID"             value={p.eMailID} />
                </div>
                {/* Photo + Signature */}
                {(p.photoUploadedURL || p.signUploadedURL) && (
                  <div className="shrink-0 flex sm:flex-col gap-4 p-3 bg-neutral-50 rounded-lg border border-neutral-200 items-center">
                    {p.photoUploadedURL && (
                      <div className="text-center">
                        <span className="block text-3xs uppercase font-bold text-neutral-500 mb-1">Photo</span>
                        <img
                          src={p.photoUploadedURL}
                          alt="Candidate Photo"
                          className="w-24 h-28 object-cover border border-neutral-300 rounded shadow-2xs"
                        />
                      </div>
                    )}
                    {p.signUploadedURL && (
                      <div className="text-center">
                        <span className="block text-3xs uppercase font-bold text-neutral-500 mb-1">Signature</span>
                        <img
                          src={p.signUploadedURL}
                          alt="Signature"
                          className="w-24 h-10 object-contain border border-neutral-300 rounded bg-white shadow-2xs"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* ── Address Details ────────────────────────────────────────────── */}
          {data.address?.addressLine1 && (
            <Section title="Address Details">
              <InfoRow
                label="Full Residential Address"
                value={[data.address.addressLine1, data.address.addressLine2, data.address.city, data.address.taluka, data.address.district, data.address.state, data.address.pincode].filter(Boolean).join(', ')}
              />
            </Section>
          )}

          {/* ── Category & Reservation ─────────────────────────────────────── */}
          {c.category && (
            <Section title="Category &amp; Other Reservation Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <InfoRow label="Domicile"                       value={c.domicile} />
                <InfoRow label="Domicile Type"                  value={c.domicileType} />
                <InfoRow label="Religion"                       value={c.religion} />
                <InfoRow label="Applied Category"               value={c.category} />
                <InfoRow label="Category for Admission"         value={c.finalCategory} />
                <InfoRow label="Previous Category"              value={c.previousCategory} />
                <InfoRow label="Caste"                          value={c.caste} />
                <InfoRow label="Caste Certificate"              value={c.hasCasteCertificate} />
                <InfoRow label="Caste Validity Certificate"     value={c.hasCasteValidity} />
                <InfoRow label="NCL Certificate"                value={c.hasNCLCertificate} />
                <InfoRow label="EWS Certificate"                value={c.hasEWSCertificate} />
                <InfoRow label="Orphan"                         value={c.isOrphan} />
                <InfoRow label="Person with Disability (PWD)"   value={c.isPWD} />
                <InfoRow label="Ex-Serviceman Ward"             value={c.isExServiceman} />
                <InfoRow label="Freedom Fighter Ward"           value={c.isFreedomFighter} />
                <InfoRow label="Project Affected Person"        value={c.isProjectAffected} />
                <InfoRow label="Agriculture Income Source"      value={c.isIncomeSourceAgriculture} />
              </div>
            </Section>
          )}

          {/* ── Research Paper Details ─────────────────────────────────────── */}
          {(data.researchPapers?.length ?? 0) > 0 && (
            <Section title="Published Research Papers Details (NAAS Rated)">
              <div className="overflow-x-auto">
                <table className="grid-view">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">Sr.</th>
                      <th className="text-left">Research Paper Title</th>
                      <th className="text-left">Name of Journal</th>
                      <th className="w-24 text-center">Year</th>
                      <th className="w-24 text-center">NAAS Score</th>
                      <th className="w-24 text-center">Weightage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.researchPapers.map((r, i) => (
                      <tr key={i}>
                        <td className="text-center font-semibold text-neutral-500">{i + 1}</td>
                        <td className="text-left font-medium text-neutral-900">{r.paperTitle}</td>
                        <td className="text-left">{r.nameOfPaper}</td>
                        <td className="text-center font-mono">{r.yearOfPublication}</td>
                        <td className="text-center font-mono font-bold text-academic-navy">{r.nAASScore}</td>
                        <td className="text-center font-mono font-bold text-agriculture-700">{r.weightages}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ── Faculty Eligibility Details ────────────────────────────────── */}
          {data.facultyEligibility && data.facultyEligibility.length > 0 && (
            <Section title="Faculty Eligibility &amp; Merit Score Calculation">
              <div className="overflow-x-auto">
                <table className="grid-view">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">Sr.</th>
                      <th className="text-left">Faculty</th>
                      <th className="text-left">Subject</th>
                      <th className="text-center">CET</th>
                      <th className="text-center">70% CET</th>
                      <th className="text-center">CGPA</th>
                      <th className="text-center">30% CGPA</th>
                      <th className="text-center">Subtotal</th>
                      <th className="text-center">Weightage</th>
                      <th className="text-center">Final Score</th>
                      <th className="text-center">Eligible</th>
                      <th className="text-left">Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.facultyEligibility.map((r, i) => (
                      <tr key={i}>
                        <td className="text-center font-semibold text-neutral-500">{i + 1}</td>
                        <td className="text-left font-medium text-neutral-900">{r.facultyName}</td>
                        <td className="text-left">{r.subjectName}</td>
                        <td className="text-center font-mono">{r.cETScore}</td>
                        <td className="text-center font-mono">{r.cET70Per}</td>
                        <td className="text-center font-mono">{r.cGPAScore}</td>
                        <td className="text-center font-mono">{r.cGPA30Per}</td>
                        <td className="text-center font-mono">{r.totalScore}</td>
                        <td className="text-center font-mono">{r.weightage}</td>
                        <td className="text-center font-mono font-extrabold text-academic-navy">{r.totalProvisionalScore}</td>
                        <td className="text-center">
                          <span className={r.eligible === 'Yes' ? 'text-agriculture-700 font-bold' : 'text-danger font-bold'}>
                            {r.eligible}
                          </span>
                        </td>
                        <td className="text-left text-2xs text-neutral-600">{r.eligibilityDescription}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ── Postgraduate Examination Details ──────────────────────────── */}
          {q.faculty && (
            <Section title="Postgraduate Qualification Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <InfoRow label="Qualifying Degree"        value={q.qualifyingDegree} />
                <InfoRow label="Faculty"                  value={q.faculty} />
                <InfoRow label="Subject Name"             value={q.subjectName} />
                <InfoRow label="CGPA Score"               value={q.cGPAScore} />
                <InfoRow label="College Name"             value={q.collegeName} />
                <InfoRow label="College City"             value={q.collegeCity} />
                <InfoRow label="Years to Complete"        value={q.noOfYearsToComplete} />
                <InfoRow label="Currently Employed?"      value={q.areYouEmployed} />
              </div>
            </Section>
          )}

          {/* ── Applied Colleges ───────────────────────────────────────────── */}
          {(data.colleges?.length ?? 0) > 0 && (
            <Section title="Submitted College &amp; Subject Preferences">
              <div className="overflow-x-auto">
                <table className="grid-view">
                  <thead>
                    <tr>
                      <th className="w-20 text-center">Pref. No</th>
                      <th className="w-24 text-center">Subject Code</th>
                      <th className="text-left">College Name</th>
                      <th>District</th>
                      <th>Faculty</th>
                      <th>Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.colleges.map((col, i) => (
                      <tr key={i}>
                        <td className="text-center font-mono font-bold text-academic-navy">#{col.preferenceNo}</td>
                        <td className="text-center font-mono">{col.collegeCode}</td>
                        <td className="text-left font-medium text-neutral-900">{col.collegeName}</td>
                        <td>{col.district}</td>
                        <td>{col.facultyName}</td>
                        <td>{col.subjectName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ── Fee Payment List ──────────────────────────────────────────── */}
          {(data.fees?.length ?? 0) > 0 && (
            <Section title="Application Fee Payment Transactions">
              <div className="overflow-x-auto">
                <table className="grid-view">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">Sr.</th>
                      <th>Transaction ID</th>
                      <th className="text-right">Fee Amount</th>
                      <th>Transaction Date</th>
                      <th>Bank Ref. No.</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.fees.map((f, i) => (
                      <tr key={i}>
                        <td className="text-center font-semibold text-neutral-500">{i + 1}</td>
                        <td className="font-mono text-2xs">{f.transactionID}</td>
                        <td className="text-right font-mono font-bold text-neutral-900">₹{f.feeAmount}</td>
                        <td className="text-2xs">{f.transactionDate}</td>
                        <td className="font-mono text-2xs">{f.bankReferenceNo}</td>
                        <td>
                          <span className={[
                            'inline-block px-2 py-0.5 rounded text-2xs font-semibold',
                            f.paidStatus === '1' || f.paidStatus?.toLowerCase() === 'paid'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200',
                          ].join(' ')}>
                            {f.paidStatus === '1' ? 'Success' : f.paidStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ── Required Documents List ────────────────────────────────────── */}
          {(data.documents?.length ?? 0) > 0 && (
            <Section title="Uploaded Required Documents Checklist">
              <div className="overflow-x-auto">
                <table className="grid-view">
                  <thead>
                    <tr>
                      <th className="w-12 text-center">Sr.</th>
                      <th className="text-left">Document Title</th>
                      <th className="w-24 text-center">Compulsory</th>
                      <th className="w-24 text-center">Uploaded</th>
                      <th className="w-32 text-center">Status</th>
                      <th className="w-20 text-center">View</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.documents.map((d, i) => (
                      <tr key={i}>
                        <td className="text-center font-semibold text-neutral-500">{i + 1}</td>
                        <td className="text-left font-medium text-neutral-900">{d.documentName}</td>
                        <td className="text-center">
                          <span className={d.isDocumentCompulsory ? 'text-danger font-semibold' : 'text-neutral-500'}>
                            {d.isDocumentCompulsory ? 'Compulsory' : 'Optional'}
                          </span>
                        </td>
                        <td className="text-center">
                          <span className={d.isDocumentUploaded ? 'text-agriculture-700 font-bold' : 'text-danger font-bold'}>
                            {d.isDocumentUploaded ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="text-center text-2xs font-medium">{d.documentVerificationStatus || 'Pending'}</td>
                        <td className="text-center">
                          {d.documentUploadedURL && (
                            <a
                              href={d.documentUploadedURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary-800 hover:text-primary-600 font-semibold underline text-xs"
                            >
                              View
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>
          )}

          {/* ── Eligibility Error ──────────────────────────────────────────── */}
          {!s.isEligible && s.errorMsg && (
            <div className="l-alert l-alert-danger" role="alert">
              <span>{s.errorMsg}</span>
            </div>
          )}

          {/* ── Declaration & Lock Card ────────────────────────────────────── */}
          {s.isEligible && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-5 shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900 mb-2">
                Candidate Declaration &amp; Submission
              </h3>
              <label className="flex items-start gap-3 cursor-pointer text-xs text-neutral-700 leading-relaxed mb-4">
                <input
                  type="checkbox"
                  checked={declared}
                  onChange={e => setDeclared(e.target.checked)}
                  className="mt-0.5 rounded border-neutral-300 text-academic-navy focus:ring-academic-accent cursor-pointer"
                />
                <span>
                  I hereby declare that all information furnished by me in this online application form is true, complete, and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect at any stage, my candidature and admission to the Ph.D. degree programme is liable to be cancelled immediately.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  className="btn-special px-6 py-2.5 text-xs font-bold rounded-md shadow-xs cursor-pointer w-full sm:w-auto"
                  disabled={!declared || !allDone || lockMut.isPending}
                  onClick={() => setLockConfirm(true)}
                >
                  {lockMut.isPending ? 'Locking Application…' : '🔒 Submit & Lock Application Form'}
                </button>
                {!allDone && (
                  <p className="text-xs text-danger font-medium">
                    ⚠️ Complete all pending steps before locking your application.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={lockConfirm}
        onClose={() => setLockConfirm(false)}
        onConfirm={() => { setLockConfirm(false); lockMut.mutate() }}
        title="Lock Application Form Confirmation"
        message="Are you sure you want to lock and submit your Ph.D. application form? Once locked, you will not be able to edit any details or upload documents without official administrator approval."
        confirmLabel="Yes, Lock &amp; Submit Form"
        variant="primary"
      />
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden bg-white shadow-2xs">
      <div className="l-card-header-sm">
        <span>{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value?: string | boolean }) {
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || '—')
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-xs py-1 border-b border-neutral-100 last:border-b-0">
      <span className="font-semibold text-neutral-500 sm:w-44 shrink-0">{label}:</span>
      <span className="font-medium text-neutral-900 break-words">{display}</span>
    </div>
  )
}
