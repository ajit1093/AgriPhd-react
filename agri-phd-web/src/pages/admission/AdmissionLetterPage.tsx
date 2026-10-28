import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useReactToPrint } from 'react-to-print'
import { admissionApi, type AdmissionLetter } from '@/api/admission'

/**
 * P2-H-08 — Admission/AdmissionLetter.aspx
 * SP: Admission_GetAdmissionSummary(@ReportingStatus='Y', @Flag='PrintAdmissionLetter')
 * Uses react-to-print to print ONLY the letter content — no nav/header/sidebars.
 */
export default function AdmissionLetterPage() {
  const printRef = useRef<HTMLDivElement>(null)

  const { data, isLoading, isError } = useQuery<AdmissionLetter>({
    queryKey: ['admission-letter'],
    queryFn:  () => admissionApi.getAdmissionLetter(),
  })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Admission_Letter_${data?.applicationFormNo ?? 'MCAER'}`,
    pageStyle: `
      @page {
        size: A4 portrait;
        margin: 12mm 10mm;
      }
      @media print {
        body { margin: 0; font-family: Verdana, sans-serif; font-size: 11px; color: #000; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `,
  })

  if (isLoading) return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <p>Loading admission letter…</p>
    </div>
  )

  if (isError || !data?.found) return (
    <div style={{ padding: '8px' }}>
      <div className="l-alert l-alert-warning">
        Admission letter is not available. Your admission may not have been confirmed by the college yet.
      </div>
    </div>
  )

  return (
    <div style={{ padding: '8px', fontFamily: 'Verdana, sans-serif', fontSize: '12px' }}>

      {/* ── Print button (hidden on print) ──────────────────────────── */}
      <div style={{ marginBottom: '12px' }} className="no-print">
        <button type="button" className="btn-success-legacy" onClick={() => handlePrint()}>
          🖨️ Print Admission Letter
        </button>
      </div>

      {/* ── Printable letter content ─────────────────────────────────── */}
      <div ref={printRef}>
        <style>{`
          .letter-wrap { max-width: 780px; margin: 0 auto; font-family: Verdana, sans-serif; font-size: 11px; color: #000; }
          .letter-header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px; }
          .letter-section { border: 1px solid #888; padding: 8px; margin-bottom: 10px; }
          .letter-section-title { font-weight: 700; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; font-size: 11px; }
          .letter-row { display: flex; margin-bottom: 3px; }
          .letter-label { min-width: 220px; font-weight: 600; color: #333; flex-shrink: 0; }
          .letter-value { font-weight: 400; color: #000; }
          .letter-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 16px; }
          .letter-photo-row { display: flex; gap: 16px; }
          .letter-photo-col { flex: 1; }
          .letter-photo-box { text-align: center; flex-shrink: 0; }
          .letter-footer { display: flex; justify-content: space-between; margin-top: 16px; font-size: 10px; color: #555; }
          .no-print { display: block; }
          @media print { .no-print { display: none !important; } .letter-wrap { max-width: 100%; } }
        `}</style>

        <div className="letter-wrap">

          {/* Header */}
          <div className="letter-header">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '6px' }}>
              <img src="/mcaer-logo.png" alt="MCAER" style={{ width: '50px', height: '50px', objectFit: 'contain' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '113%' }}>महाराष्ट्र कृषी शिक्षण व संशोधन परिषद, पुणे</p>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '108%' }}>Maharashtra Council of Agriculture Education and Research, Pune</p>
                <p style={{ margin: '2px 0 0', fontWeight: 600, fontSize: '100%' }}>Online Agriculture Ph.D. Admissions — 2026-27</p>
              </div>
            </div>
            <p style={{ margin: '6px 0 0', fontWeight: 700, fontSize: '118%', textDecoration: 'underline', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Admission Letter
            </p>
          </div>

          {/* Candidate + Photo */}
          <div className="letter-section">
            <div className="letter-photo-row">
              <div className="letter-photo-col">
                <LRow label="Login ID"               value={data.applicationId} />
                <LRow label="Application Form No."   value={data.applicationFormNo} bold />
                <LRow label="Candidate's Name"       value={data.candidateName} bold />
                <LRow label="Father's Name"          value={data.fatherName} />
                <LRow label="Mother's Name"          value={data.motherName} />
                <LRow label="Gender"                 value={data.gender} />
                <LRow label="Date of Birth"          value={data.dob} />
                <LRow label="E-Mail ID"              value={data.emailId} />
                <LRow label="Mobile Number"          value={data.mobileNo} />
                <LRow label="Category"               value={data.category} />
                <LRow label="Home University"        value={data.candidateHomeUniversity} />
                <LRow label="Physical Handicapped"   value={data.isPWD} />
                <LRow label="Orphan"                 value={data.isOrphan} />
              </div>
              <div className="letter-photo-box">
                {data.photoUrl ? (
                  <img src={data.photoUrl} alt="Photo"
                    style={{ width: '80px', height: '100px', border: '1px solid #000', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <div style={{ width: '80px', height: '100px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#999' }}>No Photo</div>
                )}
                <div style={{ fontSize: '9px', textAlign: 'center', marginTop: '2px', marginBottom: '8px' }}>Photograph</div>
                {data.signUrl ? (
                  <img src={data.signUrl} alt="Signature"
                    style={{ width: '130px', height: '45px', border: '1px solid #000', objectFit: 'contain', display: 'block' }} />
                ) : (
                  <div style={{ width: '130px', height: '45px', border: '1px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#999' }}>No Signature</div>
                )}
                <div style={{ fontSize: '9px', textAlign: 'center', marginTop: '2px' }}>Signature</div>
              </div>
            </div>
          </div>

          {/* Allotment details */}
          <div className="letter-section">
            <div className="letter-section-title">
              Current Seat Allotment Status ({data.allotmentPhase?.trim()})
            </div>
            <div className="letter-grid">
              <LRow label="Name of the College"        value={data.allottedCollege} bold />
              <LRow label="District"                   value={data.allottedCollegeDistrict} />
              <LRow label="Faculty Name"               value={data.allottedFaculty} />
              <LRow label="Subject Name"               value={data.allottedSubject} bold />
              <LRow label="Allotted Category"          value={data.allottedCategory} />
              <LRow label="Allotted Quota"             value={data.allottedQuota} />
              <LRow label="Roster Sequence No."        value={data.roasterSeqNo} />
              <LRow label="Roster Point"               value={data.roasterPoint} />
              <LRow label="Roster Category"            value={data.roasterCategory} />
              <LRow label="Allotted Gender"            value={data.allotedGender} />
              <LRow label="College Allotted Type"      value={data.collegeAllottedType} />
              <LRow label="Allotment Date"             value={data.allotmentDate} />
            </div>
          </div>

          {/* Nodal officer */}
          <div className="letter-section">
            <div className="letter-section-title">Admission / Nodal Officer Details</div>
            <LRow label="Name"          value={data.nodalOfficerName} />
            <LRow label="Mobile / Contact No." value={data.nodalOfficerMobile} />
            <LRow label="E-Mail ID"     value={data.nodalOfficerEmail} />
          </div>

          {/* Admission status */}
          <div className="letter-section">
            <div className="letter-section-title">Admission Status</div>
            <LRow label="Reporting Status" value={data.reportingStatus} bold />
            <LRow label="Reported On"      value={data.reportedOn} />
            {data.admissionComments && <LRow label="Comments" value={data.admissionComments} />}
          </div>

          {/* Footer */}
          <div className="letter-footer">
            <span>Printed On: {data.printedOn}</span>
            <span style={{ color: '#dc3545', fontWeight: 600 }}>
              This is a computer generated letter. No signature required.
            </span>
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Row helper ──────────────────────────────────────────────────────────────
function LRow({ label, value, bold = false }: { label: string; value?: string | null; bold?: boolean }) {
  return (
    <div className="letter-row">
      <span className="letter-label">{label} :</span>
      <span className="letter-value" style={{ fontWeight: bold ? 700 : 400 }}>{value || '—'}</span>
    </div>
  )
}
