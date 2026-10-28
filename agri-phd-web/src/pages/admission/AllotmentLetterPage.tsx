import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useReactToPrint } from 'react-to-print'
import { admissionApi, type AllotmentLetterData } from '@/api/admission'

/**
 * P2-H-03 — Admission/DownloadAllotmentLetterRoundWise.aspx
 * Phase dropdown → load allotment letter → print with react-to-print.
 * SP: Admission_GetPhaseListRoundWise + SpotRound_GetAllotmentLetter
 */
export default function AllotmentLetterPage() {
  const [selectedPhase, setSelectedPhase] = useState<number>(0)
  const printRef = useRef<HTMLDivElement>(null)

  // Load available phases
  const { data: phases = [], isLoading: phasesLoading } = useQuery({
    queryKey: ['allotment-letter-phases'],
    queryFn:  admissionApi.getAllotmentLetterPhases,
  })

  // Load letter when phase selected
  const { data, isLoading: letterLoading } = useQuery<AllotmentLetterData>({
    queryKey: ['allotment-letter', selectedPhase],
    queryFn:  () => admissionApi.getAllotmentLetterByPhase(selectedPhase),
    enabled:  selectedPhase > 0,
  })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Allotment_Letter_${data?.applicationFormNo ?? 'MCAER'}`,
    pageStyle: `
      @page { size: A4 portrait; margin: 12mm 10mm; }
      @media print {
        body { margin: 0; font-family: Verdana, sans-serif; font-size: 11px; color: #000; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      }
    `,
  })

  return (
    <div style={{ padding: '8px', fontFamily: 'Verdana, sans-serif', fontSize: '12px' }}>

      {/* Phase selector + print button */}
      <div className="l-card" style={{ marginBottom: '12px' }}>
        <div className="l-card-header">Download Allotment Letter</div>
        <div className="l-card-body">
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: '0 0 250px' }}>
              <label className="control-label">Select Round <span className="required">*</span></label>
              <select className="l-form-control"
                value={selectedPhase}
                onChange={e => setSelectedPhase(Number(e.target.value))}>
                <option value={0}>-- Select --</option>
                {phasesLoading
                  ? <option disabled>Loading…</option>
                  : phases.map(p => (
                    <option key={p.value} value={Number(p.value)}>{p.text?.trim()}</option>
                  ))}
              </select>
            </div>
            {data?.found && (
              <button type="button" className="btn-success-legacy"
                onClick={() => handlePrint()}>
                🖨️ Print / Download Letter
              </button>
            )}
          </div>

          {selectedPhase > 0 && letterLoading && (
            <p style={{ marginTop: '12px', color: '#666' }}>Loading allotment letter…</p>
          )}
          {selectedPhase > 0 && !letterLoading && !data?.found && (
            <div className="l-alert l-alert-warning" style={{ marginTop: '12px' }}>
              No allotment letter found for the selected round.
            </div>
          )}
        </div>
      </div>

      {/* Letter content (shown on screen + sent to printer) */}
      {data?.found && (
        <div ref={printRef}>
          <style>{`
            .al-wrap { max-width: 780px; margin: 0 auto; font-family: Verdana,sans-serif; font-size: 11px; color:#000; }
            .al-header { text-align:center; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:12px; }
            .al-section { border:1px solid #888; padding:8px; margin-bottom:10px; }
            .al-section-title { font-weight:700; text-align:center; border-bottom:1px solid #ccc; padding-bottom:4px; margin-bottom:8px; }
            .al-row { display:flex; margin-bottom:3px; }
            .al-label { min-width:210px; font-weight:600; color:#333; flex-shrink:0; }
            .al-value { color:#000; }
            .al-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px 16px; }
            .al-photo-row { display:flex; gap:16px; }
            .al-photo-col { flex:1; }
            .al-photo-box { text-align:center; flex-shrink:0; }
            .al-alert { background:#fff3cd; border:1px solid #ffc107; padding:8px; margin-bottom:10px; border-radius:4px; font-weight:600; }
            .al-footer { display:flex; justify-content:space-between; margin-top:16px; font-size:10px; color:#555; }
            @media print { .no-print { display:none !important; } .al-wrap { max-width:100%; } }
          `}</style>

          <div className="al-wrap">

            {/* Header */}
            <div className="al-header">
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', marginBottom:'6px' }}>
                <img src="/mcaer-logo.png" alt="MCAER" style={{ width:'50px', height:'50px', objectFit:'contain' }} />
                <div>
                  <p style={{ margin:0, fontWeight:700, fontSize:'113%' }}>महाराष्ट्र कृषी शिक्षण व संशोधन परिषद, पुणे</p>
                  <p style={{ margin:'2px 0 0', fontWeight:700, fontSize:'108%' }}>Maharashtra Council of Agriculture Education and Research, Pune</p>
                  <p style={{ margin:'2px 0 0', fontWeight:600 }}>Online Agriculture Ph.D. Admissions — 2026-27</p>
                </div>
              </div>
              <p style={{ margin:'6px 0 0', fontWeight:700, fontSize:'118%', textDecoration:'underline', letterSpacing:'1px' }}>
                ALLOTMENT LETTER
              </p>
            </div>

            {/* Admission schedule alert */}
            {data.admissionSchedule && (
              <div className="al-alert">
                Admission Schedule: {data.admissionSchedule}
                {data.candidateAdmissionLastDate && (
                  <><br/>Last Date for Candidate Admission: <strong>{data.candidateAdmissionLastDate}</strong></>
                )}
              </div>
            )}

            {/* Candidate + photo */}
            <div className="al-section">
              <div className="al-photo-row">
                <div className="al-photo-col">
                  <ARow label="Login ID"             value={data.applicationId} />
                  <ARow label="Application Form No." value={data.applicationFormNo} bold />
                  <ARow label="Candidate's Name"     value={data.candidateName} bold />
                  <ARow label="Father's Name"        value={data.fatherName} />
                  <ARow label="Mother's Name"        value={data.motherName} />
                  <ARow label="Gender"               value={data.gender} />
                  <ARow label="Date of Birth"        value={data.dob} />
                  <ARow label="E-Mail ID"            value={data.emailId} />
                  <ARow label="Mobile Number"        value={data.mobileNo} />
                  <ARow label="Category"             value={data.category} />
                  <ARow label="Verified Category"    value={data.verifiedCategory} />
                  <ARow label="Home University"      value={data.candidateHomeUniversity} />
                  <ARow label="Physical Handicapped" value={data.isPWD} />
                  <ARow label="Orphan"               value={data.isOrphan} />
                  <ARow label="Merit No."            value={data.meritNo} />
                </div>
                <div className="al-photo-box">
                  {data.photoUrl
                    ? <img src={data.photoUrl} alt="Photo" style={{ width:'80px', height:'100px', border:'1px solid #000', objectFit:'cover', display:'block' }} />
                    : <div style={{ width:'80px', height:'100px', border:'1px solid #000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'#999' }}>No Photo</div>
                  }
                  <div style={{ fontSize:'9px', textAlign:'center', marginTop:'2px', marginBottom:'8px' }}>Photograph</div>
                  {data.signUrl
                    ? <img src={data.signUrl} alt="Signature" style={{ width:'130px', height:'45px', border:'1px solid #000', objectFit:'contain', display:'block' }} />
                    : <div style={{ width:'130px', height:'45px', border:'1px solid #000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'#999' }}>No Signature</div>
                  }
                  <div style={{ fontSize:'9px', textAlign:'center', marginTop:'2px' }}>Signature</div>
                </div>
              </div>
            </div>

            {/* Allotment details */}
            <div className="al-section">
              <div className="al-section-title">
                Seat Allotment Details — {data.allotmentPhase?.trim()} ({data.allotmentDate})
              </div>
              <div className="al-grid">
                <ARow label="Name of College"      value={data.allottedCollege} bold />
                <ARow label="District"             value={data.allottedCollegeDistrict} />
                <ARow label="University"           value={data.collegeUniversity} />
                <ARow label="Degree"               value={data.degreeName} />
                <ARow label="Faculty"              value={data.allottedFaculty} />
                <ARow label="Subject"              value={data.allottedSubject} bold />
                <ARow label="Allotted Category"    value={data.allottedCategory} />
                <ARow label="Allotted Quota"       value={data.allottedQuota} />
                <ARow label="Allotted Type"        value={data.allottedTypeDisplay} />
                <ARow label="Roster Seq. No."      value={data.roasterSeqNo} />
                <ARow label="Roster Point"         value={data.roasterPoint} />
                <ARow label="Roster Category"      value={data.roasterCategory} />
                <ARow label="Allotted Gender"      value={data.allotedGender} />
              </div>
            </div>

            {/* Nodal officer */}
            <div className="al-section">
              <div className="al-section-title">Admission / Nodal Officer Details</div>
              <ARow label="Name"           value={data.nodalOfficerName} />
              <ARow label="Mobile No."     value={data.nodalOfficerMobile} />
              <ARow label="E-Mail ID"      value={data.nodalOfficerEmail} />
            </div>

            {/* Instructions */}
            <div className="al-section" style={{ fontSize:'10px', lineHeight:1.7 }}>
              <p style={{ fontWeight:700, margin:'0 0 4px' }}>Important Instructions:</p>
              <ol style={{ margin:0, paddingLeft:'16px' }}>
                <li>Please report to the allotted college within the prescribed schedule.</li>
                <li>Carry this allotment letter and all original documents at the time of admission.</li>
                <li>Failure to report within the stipulated time will result in forfeiture of your allotment.</li>
                <li>This is a computer generated letter and does not require a signature.</li>
              </ol>
            </div>

            <div className="al-footer">
              <span>Generated by: MCAER Online Admission Portal</span>
              <span style={{ color:'#dc3545', fontWeight:600 }}>Computer generated letter — No signature required.</span>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}

function ARow({ label, value, bold = false }: { label: string; value?: string | null; bold?: boolean }) {
  return (
    <div className="al-row">
      <span className="al-label">{label} :</span>
      <span className="al-value" style={{ fontWeight: bold ? 700 : 400 }}>{value || '—'}</span>
    </div>
  )
}
