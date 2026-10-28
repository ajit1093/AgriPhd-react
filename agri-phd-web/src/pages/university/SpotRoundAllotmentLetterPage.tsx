import { useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useReactToPrint } from 'react-to-print'
import { apiClient } from '@/api/client'
import type { AllotmentLetterData } from '@/api/admission'

/**
 * P2-J-04 — University/SpotRoundAllotmentLetter.aspx
 * Lists all admitted candidates for this university.
 * Click "Download" on any row → loads full allotment letter → print with react-to-print.
 */
interface CandidateRow {
  PhaseID:                  number
  FormNo:                   string
  CandidateID:              number
  CollegeName:              string
  SubjectName:              string
  AllottedQuota:            string
  AllottedCategoryDisplay:  string
  StudentCategoryDisplay:   string
  RoasterPoint:             string
  RosterSeqNo:              string
}

export default function SpotRoundAllotmentLetterPage() {
  const [selectedFormNo, setSelectedFormNo] = useState<string | null>(null)
  const [selectedPhase, setSelectedPhase]   = useState<number>(0)
  const printRef = useRef<HTMLDivElement>(null)

  // List of admitted candidates
  const { data: candidates = [], isLoading } = useQuery<CandidateRow[]>({
    queryKey: ['university-allotment-list'],
    queryFn:  () => apiClient.get<CandidateRow[]>('/university/spot-round/allotment-letter').then(r => r.data),
  })

  // Letter for selected candidate
  const { data: letter, isLoading: letterLoading } = useQuery<AllotmentLetterData>({
    queryKey: ['university-allotment-letter', selectedFormNo, selectedPhase],
    queryFn:  () => apiClient.get<AllotmentLetterData>(
      `/university/spot-round/allotment-letter/${encodeURIComponent(selectedFormNo!)}?phaseId=${selectedPhase}`
    ).then(r => r.data),
    enabled: !!selectedFormNo,
  })

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Allotment_Letter_${letter?.applicationFormNo ?? 'MCAER'}`,
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

      {/* ── Candidate list ─────────────────────────────────────────────── */}
      {!selectedFormNo && (
        <div className="l-card">
          <div className="l-card-header">Admitted Candidates — Spot Round Allotment Letter</div>
          <div className="l-card-body">
            {isLoading ? (
              <p style={{ textAlign: 'center', padding: '16px' }}>Loading…</p>
            ) : candidates.length === 0 ? (
              <div className="l-alert l-alert-info">No admitted candidates found for this university.</div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="grid-view" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>Sr.</th>
                      <th>Round</th>
                      <th>Application Form No.</th>
                      <th style={{ textAlign: 'left' }}>College Name</th>
                      <th style={{ textAlign: 'left' }}>Subject Name</th>
                      <th>Quota</th>
                      <th>Allotted Category</th>
                      <th>Student Category</th>
                      <th>Roster Sr. No.</th>
                      <th>Roster Point</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c, i) => (
                      <tr key={`${c.CandidateID}-${c.PhaseID}`}>
                        <td style={{ textAlign: 'center' }}>{i + 1}.</td>
                        <td style={{ textAlign: 'center' }}>{c.PhaseID}</td>
                        <td>{c.FormNo}</td>
                        <td style={{ textAlign: 'left' }}>{c.CollegeName}</td>
                        <td style={{ textAlign: 'left' }}>{c.SubjectName}</td>
                        <td style={{ textAlign: 'center' }}>{c.AllottedQuota}</td>
                        <td>{c.AllottedCategoryDisplay}</td>
                        <td>{c.StudentCategoryDisplay}</td>
                        <td style={{ textAlign: 'center' }}>{c.RosterSeqNo}</td>
                        <td style={{ textAlign: 'center' }}>{c.RoasterPoint}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button type="button"
                            className="btn-success-legacy"
                            style={{ fontSize: '85%', padding: '2px 10px' }}
                            onClick={() => { setSelectedFormNo(c.FormNo); setSelectedPhase(c.PhaseID) }}>
                            Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Individual letter ──────────────────────────────────────────── */}
      {selectedFormNo && (
        <div>
          <div style={{ marginBottom: '12px', display: 'flex', gap: '12px' }} className="no-print">
            <button type="button" className="btn-outline-legacy"
              onClick={() => setSelectedFormNo(null)}>
              ← Back to List
            </button>
            {letter?.found && (
              <button type="button" className="btn-success-legacy"
                onClick={() => handlePrint()}>
                🖨️ Print / Download Letter
              </button>
            )}
          </div>

          {letterLoading && <p style={{ padding: '16px', textAlign: 'center' }}>Loading letter…</p>}

          {!letterLoading && !letter?.found && (
            <div className="l-alert l-alert-warning">No allotment letter found for {selectedFormNo}.</div>
          )}

          {letter?.found && (
            <div ref={printRef}>
              <style>{`
                .al-wrap { max-width: 780px; margin: 0 auto; font-family: Verdana,sans-serif; font-size: 11px; color:#000; }
                .al-header { text-align:center; border-bottom:2px solid #000; padding-bottom:8px; margin-bottom:12px; }
                .al-section { border:1px solid #888; padding:8px; margin-bottom:10px; }
                .al-section-title { font-weight:700; text-align:center; border-bottom:1px solid #ccc; padding-bottom:4px; margin-bottom:8px; }
                .al-row { display:flex; margin-bottom:3px; }
                .al-label { min-width:210px; font-weight:600; color:#333; flex-shrink:0; }
                .al-grid { display:grid; grid-template-columns:1fr 1fr; gap:2px 16px; }
                .al-photo-row { display:flex; gap:16px; }
                .al-photo-col { flex:1; }
                .al-photo-box { text-align:center; flex-shrink:0; }
                .al-footer { display:flex; justify-content:space-between; margin-top:16px; font-size:10px; color:#555; }
                @media print { .no-print { display:none !important; } .al-wrap { max-width:100%; } }
              `}</style>
              <div className="al-wrap">
                <div className="al-header">
                  <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'6px' }}>
                    <img src="/mcaer-logo.png" alt="MCAER" style={{ width:'50px',height:'50px',objectFit:'contain' }} />
                    <div>
                      <p style={{ margin:0,fontWeight:700,fontSize:'113%' }}>महाराष्ट्र कृषी शिक्षण व संशोधन परिषद, पुणे</p>
                      <p style={{ margin:'2px 0 0',fontWeight:700,fontSize:'108%' }}>Maharashtra Council of Agriculture Education and Research, Pune</p>
                      <p style={{ margin:'2px 0 0',fontWeight:600 }}>Online Agriculture Ph.D. Admissions — 2026-27</p>
                    </div>
                  </div>
                  <p style={{ margin:'6px 0 0',fontWeight:700,fontSize:'118%',textDecoration:'underline',letterSpacing:'1px' }}>
                    ALLOTMENT LETTER
                  </p>
                </div>

                {letter.admissionSchedule && (
                  <div style={{ background:'#fff3cd',border:'1px solid #ffc107',padding:'8px',marginBottom:'10px',borderRadius:'4px',fontWeight:600 }}>
                    Admission Schedule: {letter.admissionSchedule}
                    {letter.candidateAdmissionLastDate && <><br/>Last Date: <strong>{letter.candidateAdmissionLastDate}</strong></>}
                  </div>
                )}

                <div className="al-section">
                  <div className="al-photo-row">
                    <div className="al-photo-col">
                      <ARow label="Login ID"             value={letter.applicationId} />
                      <ARow label="Application Form No." value={letter.applicationFormNo} bold />
                      <ARow label="Candidate's Name"     value={letter.candidateName} bold />
                      <ARow label="Father's Name"        value={letter.fatherName} />
                      <ARow label="Mother's Name"        value={letter.motherName} />
                      <ARow label="Gender"               value={letter.gender} />
                      <ARow label="Date of Birth"        value={letter.dob} />
                      <ARow label="E-Mail ID"            value={letter.emailId} />
                      <ARow label="Mobile Number"        value={letter.mobileNo} />
                      <ARow label="Category"             value={letter.category} />
                      <ARow label="Verified Category"    value={letter.verifiedCategory} />
                      <ARow label="Home University"      value={letter.candidateHomeUniversity} />
                      <ARow label="Merit No."            value={letter.meritNo} />
                    </div>
                    <div className="al-photo-box">
                      {letter.photoUrl
                        ? <img src={letter.photoUrl} alt="Photo" style={{ width:'80px',height:'100px',border:'1px solid #000',objectFit:'cover',display:'block' }} />
                        : <div style={{ width:'80px',height:'100px',border:'1px solid #000',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',color:'#999' }}>No Photo</div>
                      }
                      <div style={{ fontSize:'9px',textAlign:'center',marginTop:'2px',marginBottom:'8px' }}>Photograph</div>
                      {letter.signUrl
                        ? <img src={letter.signUrl} alt="Signature" style={{ width:'130px',height:'45px',border:'1px solid #000',objectFit:'contain',display:'block' }} />
                        : <div style={{ width:'130px',height:'45px',border:'1px solid #000',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',color:'#999' }}>No Signature</div>
                      }
                      <div style={{ fontSize:'9px',textAlign:'center',marginTop:'2px' }}>Signature</div>
                    </div>
                  </div>
                </div>

                <div className="al-section">
                  <div className="al-section-title">Seat Allotment Details — {letter.allotmentPhase?.trim()} ({letter.allotmentDate})</div>
                  <div className="al-grid">
                    <ARow label="Name of College"    value={letter.allottedCollege} bold />
                    <ARow label="District"           value={letter.allottedCollegeDistrict} />
                    <ARow label="University"         value={letter.collegeUniversity} />
                    <ARow label="Degree"             value={letter.degreeName} />
                    <ARow label="Faculty"            value={letter.allottedFaculty} />
                    <ARow label="Subject"            value={letter.allottedSubject} bold />
                    <ARow label="Allotted Category"  value={letter.allottedCategory} />
                    <ARow label="Allotted Quota"     value={letter.allottedQuota} />
                    <ARow label="Roster Seq. No."    value={letter.roasterSeqNo} />
                    <ARow label="Roster Point"       value={letter.roasterPoint} />
                    <ARow label="Roster Category"    value={letter.roasterCategory} />
                    <ARow label="Allotted Gender"    value={letter.allotedGender} />
                  </div>
                </div>

                <div className="al-section">
                  <div className="al-section-title">Admission / Nodal Officer Details</div>
                  <ARow label="Name"       value={letter.nodalOfficerName} />
                  <ARow label="Mobile No." value={letter.nodalOfficerMobile} />
                  <ARow label="E-Mail ID"  value={letter.nodalOfficerEmail} />
                </div>

                <div className="al-section" style={{ fontSize:'10px',lineHeight:1.7 }}>
                  <p style={{ fontWeight:700,margin:'0 0 4px' }}>Important Instructions:</p>
                  <ol style={{ margin:0,paddingLeft:'16px' }}>
                    <li>Please report to the allotted college within the prescribed schedule.</li>
                    <li>Carry this allotment letter and all original documents at the time of admission.</li>
                    <li>Failure to report within the stipulated time will result in forfeiture of your allotment.</li>
                    <li>This is a computer generated letter and does not require a signature.</li>
                  </ol>
                </div>

                <div className="al-footer">
                  <span>Generated by: MCAER Online Admission Portal</span>
                  <span style={{ color:'#dc3545',fontWeight:600 }}>Computer generated — No signature required.</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ARow({ label, value, bold = false }: { label: string; value?: string | null; bold?: boolean }) {
  return (
    <div className="al-row">
      <span className="al-label">{label} :</span>
      <span style={{ fontWeight: bold ? 700 : 400, color: '#000' }}>{value || '—'}</span>
    </div>
  )
}
