import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { useMasterData } from '@/hooks/useMasterData'

/**
 * Reports drill-down matching legacy exactly:
 * Level 1: AllotmentReportByCollege — college list, click college name → Level 2
 * Level 2: AllotmentReportByCourse  — course list, click count → Level 3
 * Level 3: AllotmentReport          — student list (Admitted/Rejected/etc)
 */

const FLAG_LABELS: Record<string, string> = {
  Allotment: 'Allotment', AllotmentLetterDownloaded: 'Allotment Letter Downloaded',
  NotReported: 'Not Reported', Admitted: 'Admitted', Rejected: 'Rejected',
  Cancelled: 'Cancelled', Refused: 'Refused',
}

const phaseLabel = (n: number) => {
  const m: Record<number,string> = {
    1:'Round-I',2:'Round-II',3:'Round-III',4:'Phase-IV',5:'Phase-V',
    6:'Phase-VI',7:'Phase-VII',8:'Phase-VIII',9:'Phase-IX',10:'Phase-X'
  }
  return m[n] ?? `Phase-${n}`
}

const now = () => new Date().toLocaleString('en-IN', {
  timeZone:'Asia/Kolkata', day:'2-digit', month:'2-digit', year:'numeric',
  hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:true
})

const exportToExcel = (id: string, name: string) => {
  const t = document.getElementById(id)
  if (!t) return
  const b = new Blob(['<table>'+t.innerHTML+'</table>'], {type:'application/vnd.ms-excel'})
  const u = URL.createObjectURL(b)
  const a = document.createElement('a'); a.href=u; a.download=name+'.xls'; a.click()
  URL.revokeObjectURL(u)
}

// ── Row type helpers ──────────────────────────────────────────────────────────
type Row = Record<string, unknown>
const V = (r: Row, k: string) => String(r[k] ?? r[k.toLowerCase()] ?? '0')

// ── Level 3: Student list ────────────────────────────────────────────────────
function StudentList({ phaseId, choiceCode, flag, onBack }: {
  phaseId: number; choiceCode: number; flag: string; onBack: () => void
}) {
  const { data, isLoading } = useQuery({
    queryKey: ['report','students', phaseId, choiceCode, flag],
    queryFn: () => apiClient.get<{collegeName:string;rows:Row[]}>(
      `/reports/student-list?phaseId=${phaseId}&choiceCode=${choiceCode}&flag=${flag}`
    ).then(r => r.data),
    staleTime: 0,
  })
  const rows = data?.rows ?? []
  const ts = now()

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
        <button type="button" className="btn-special" onClick={onBack}>
          &laquo;&laquo;&laquo; Back
        </button>
        {rows.length > 0 && (
          <button type="button" className="btn-success-legacy" onClick={() => exportToExcel('l3-table','StudentList')}>
            Export to Excel
          </button>
        )}
      </div>
      {isLoading ? <p style={{textAlign:'center',padding:'16px'}}>Loading…</p> : (
        <div style={{overflowX:'auto'}}>
          <table id="l3-table" className="grid-view" style={{width:'100%'}}>
            <thead>
              <tr>
                <td className="grid-view-top-header" colSpan={10} style={{fontWeight:700,fontSize:'80%',textAlign:'left'}}>
                  Printed On : {ts}
                </td>
              </tr>
              <tr>
                <td className="grid-view-top-header" colSpan={10} style={{textAlign:'center',fontWeight:700}}>
                  {FLAG_LABELS[flag] ?? flag} Candidate List (Round-{phaseId})
                </td>
              </tr>
              {data?.collegeName && (
                <tr>
                  <td className="grid-view-top-header" colSpan={10} style={{textAlign:'center',fontWeight:700}}>
                    {data.collegeName}
                  </td>
                </tr>
              )}
              <tr>
                <th>Sr. No.</th>
                <th>Application Form No</th>
                <th style={{textAlign:'left'}}>Candidate Name</th>
                <th style={{textAlign:'left'}}>Subject Name</th>
                <th>Mobile No.</th>
                <th>Candidate Home University</th>
                <th>Total Score</th>
                <th>Candidate Category/Special Category</th>
                <th>Allotted Category/Special Category</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={10} style={{textAlign:'center',padding:'12px',color:'#888'}}>No records found.</td></tr>
                : rows.map((r,i) => (
                  <tr key={i}>
                    <td style={{textAlign:'center'}}>{i+1}.</td>
                    <td>{V(r,'ApplicationFormNo')}</td>
                    <td style={{textAlign:'left',fontWeight:600}}>{V(r,'CandidateName')}</td>
                    <td style={{textAlign:'left'}}>{V(r,'SubjectName')}</td>
                    <td>{V(r,'MobileNo')}</td>
                    <td>{V(r,'CandidateUniversity')}</td>
                    <td style={{textAlign:'center'}}>{V(r,'TotalScore')}</td>
                    <td>{V(r,'CandidateCategoryDisplay')}</td>
                    <td>{V(r,'AllottedCategoryDisplay')}</td>
                    <td style={{color: V(r,'CurrentStatus')==='Admitted'?'#0d6efd':'#dc3545'}}>
                      {V(r,'CurrentStatus')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {rows.length > 0 && <div style={{fontSize:'90%',color:'#666',marginTop:'4px'}}>Total: {rows.length}</div>}
        </div>
      )}
    </div>
  )
}

// ── Level 2: Courses by college ───────────────────────────────────────────────
function CoursesByCollege({ phaseId, collegeId, collegeName: nameFromParent, onBack }: {
  phaseId: number; collegeId: number; collegeName: string; onBack: () => void
}) {
  const [drill, setDrill] = useState<{choiceCode:number;flag:string}|null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['report','courses', phaseId, collegeId],
    queryFn: () => apiClient.get<{collegeName:string;rows:Row[]}>(
      `/reports/courses-by-college?collegeId=${collegeId}&phaseId=${phaseId}`
    ).then(r => r.data),
    staleTime: 0,
  })

  if (drill) return (
    <StudentList phaseId={phaseId} choiceCode={drill.choiceCode} flag={drill.flag}
      onBack={() => setDrill(null)} />
  )

  const rows = data?.rows ?? []
  const colName = data?.collegeName || nameFromParent
  const ts = now()

  const totals = ['Allotment','AllotmentLetterDownloaded','NotReported','Admitted','Rejected','Cancelled','Refused']
    .reduce((acc, f) => ({ ...acc, [f]: rows.reduce((s,r) => s + Number(V(r,f)||0), 0) }), {} as Record<string,number>)

  const ClickCell = ({ r, field }: { r: Row; field: string }) => {
    const val = Number(V(r, field) || 0)
    return val > 0
      ? <button type="button" onClick={() => setDrill({ choiceCode: Number(V(r,'ChoiceCode')), flag: field })}
          style={{color:'#0d6efd',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>
          {val}
        </button>
      : <span>0</span>
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
        <button type="button" className="btn-special" onClick={onBack}>&laquo;&laquo;&laquo; Back</button>
        {rows.length > 0 && (
          <button type="button" className="btn-success-legacy" onClick={() => exportToExcel('l2-table','CourseReport')}>
            Export to Excel
          </button>
        )}
      </div>
      {isLoading ? <p style={{textAlign:'center',padding:'16px'}}>Loading…</p> : (
        <div style={{overflowX:'auto'}}>
          <table id="l2-table" className="grid-view" style={{width:'100%'}}>
            <thead>
              <tr>
                <td className="grid-view-top-header" colSpan={9} style={{fontWeight:700,fontSize:'80%',textAlign:'left'}}>
                  Printed On : {ts}
                </td>
              </tr>
              <tr>
                <td className="grid-view-top-header" colSpan={9} style={{textAlign:'center',fontWeight:700}}>
                  Allotment Report (Round-{phaseId})
                </td>
              </tr>
              <tr>
                <td className="grid-view-top-header" colSpan={9} style={{textAlign:'center',fontWeight:700}}>
                  {colName}
                </td>
              </tr>
              <tr>
                <th>Sr. No.</th>
                <th style={{textAlign:'left',width:'60%'}}>Faculty Name</th>
                <th>Allotment</th>
                <th>Allotment<br/>Letter<br/>Downloaded</th>
                <th>Not Reported</th>
                <th>Admitted</th>
                <th>Rejected</th>
                <th>Cancelled</th>
                <th>Refused</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0
                ? <tr><td colSpan={9} style={{textAlign:'center',padding:'12px',color:'#888'}}>No courses found.</td></tr>
                : rows.map((r,i) => (
                  <tr key={i}>
                    <td style={{textAlign:'center'}}>{i+1}.</td>
                    <td style={{textAlign:'left'}}>{V(r,'CourseName')}</td>
                    <td style={{textAlign:'center'}}><ClickCell r={r} field="Allotment"/></td>
                    <td style={{textAlign:'center'}}><ClickCell r={r} field="AllotmentLetterDownloaded"/></td>
                    <td style={{textAlign:'center'}}><ClickCell r={r} field="NotReported"/></td>
                    <td style={{textAlign:'center'}}><ClickCell r={r} field="Admitted"/></td>
                    <td style={{textAlign:'center'}}><ClickCell r={r} field="Rejected"/></td>
                    <td style={{textAlign:'center'}}><ClickCell r={r} field="Cancelled"/></td>
                    <td style={{textAlign:'center'}}><ClickCell r={r} field="Refused"/></td>
                  </tr>
                ))}
            </tbody>
            {rows.length > 0 && (
              <tfoot>
                <tr style={{backgroundColor:'#D5CEA3',fontWeight:700}}>
                  <td colSpan={2} style={{textAlign:'right',padding:'5px'}}>Total</td>
                  {['Allotment','AllotmentLetterDownloaded','NotReported','Admitted','Rejected','Cancelled','Refused']
                    .map(f => <td key={f} style={{textAlign:'center',padding:'5px'}}>{totals[f]}</td>)}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  )
}

// ── Level 1: Allotment By College ─────────────────────────────────────────────
function AllotmentByCollegeReport({ phaseId, rows }: { phaseId: number; rows: Row[] }) {
  const [drill, setDrill] = useState<{collegeId:number;collegeName:string}|null>(null)

  if (drill) return (
    <CoursesByCollege phaseId={phaseId} collegeId={drill.collegeId}
      collegeName={drill.collegeName} onBack={() => setDrill(null)} />
  )

  const totals = ['Allotment','AllotmentLetterDownloaded','NotReported','Admitted','Rejected','Cancelled','Refused']
    .reduce((acc,f) => ({...acc,[f]: rows.reduce((s,r) => s+Number(V(r,f)||0),0)}),{} as Record<string,number>)

  return (
    <div style={{overflowX:'auto'}}>
      <table id="report-table" className="grid-view" style={{width:'100%'}}>
        <thead>
          <tr>
            <td className="grid-view-top-header" colSpan={9} style={{textAlign:'center',fontWeight:700}}>
              Allotment Report (Round-{phaseId})
            </td>
          </tr>
          <tr>
            <th>Sr. No.</th>
            <th style={{textAlign:'left',width:'55%'}}>Institute Name</th>
            <th>Allotment</th>
            <th>Allotment<br/>Letter<br/>Downloaded</th>
            <th>Not Reported</th>
            <th>Admitted</th>
            <th>Rejected</th>
            <th>Cancelled</th>
            <th>Refused</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={i}>
              <td style={{textAlign:'center'}}>{i+1}.</td>
              <td style={{textAlign:'left'}}>
                {/* Clickable college name → Level 2 */}
                <button type="button"
                  onClick={() => setDrill({ collegeId: Number(V(r,'CollegeID')), collegeName: V(r,'CollegeName') })}
                  style={{color:'#0d6efd',background:'none',border:'none',cursor:'pointer',textAlign:'left',textDecoration:'underline',padding:0}}>
                  {V(r,'CollegeName')}
                </button>
              </td>
              <td style={{textAlign:'center'}}>{V(r,'Allotment')}</td>
              <td style={{textAlign:'center'}}>{V(r,'AllotmentLetterDownloaded')}</td>
              <td style={{textAlign:'center'}}>{V(r,'NotReported')}</td>
              <td style={{textAlign:'center'}}>{V(r,'Admitted')}</td>
              <td style={{textAlign:'center'}}>{V(r,'Rejected')}</td>
              <td style={{textAlign:'center'}}>{V(r,'Cancelled')}</td>
              <td style={{textAlign:'center'}}>{V(r,'Refused')}</td>
            </tr>
          ))}
        </tbody>
        {rows.length > 0 && (
          <tfoot>
            <tr style={{backgroundColor:'#D5CEA3',fontWeight:700}}>
              <td colSpan={2} style={{textAlign:'right',padding:'5px'}}>Total</td>
              {['Allotment','AllotmentLetterDownloaded','NotReported','Admitted','Rejected','Cancelled','Refused']
                .map(f => <td key={f} style={{textAlign:'center',padding:'5px'}}>{totals[f]}</td>)}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}

// ── Composite Admission Report ────────────────────────────────────────────────
function CompositeByCollegeReport({ data }: {
  data: { maxActivePhaseId: number; rows: Row[] }
}) {
  const [drill, setDrill] = useState<{collegeId:number;collegeName:string}|null>(null)
  const { maxActivePhaseId, rows } = data
  const phaseCount = Math.max(maxActivePhaseId, 2)
  const phases = Array.from({ length: phaseCount }, (_,i) => i+1)

  if (drill) return (
    <CoursesByCollege phaseId={1} collegeId={drill.collegeId}
      collegeName={drill.collegeName} onBack={() => setDrill(null)} />
  )

  return (
    <div style={{overflowX:'auto'}}>
      <table id="report-table" className="grid-view" style={{width:'100%'}}>
        <thead>
          <tr>
            <td className="grid-view-top-header" colSpan={4+phaseCount}
              style={{textAlign:'center',fontWeight:700}}>
              Composite Admission Report
            </td>
          </tr>
          <tr>
            <th rowSpan={2}>Sr. No.</th>
            <th style={{textAlign:'left'}} rowSpan={2}>Institute Name</th>
            <th rowSpan={2}>Intake</th>
            <th colSpan={phaseCount+1}>Admitted</th>
            <th rowSpan={2}>Vacancy</th>
          </tr>
          <tr>
            {phases.map(n => <th key={n}>{phaseLabel(n)}</th>)}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={4+phaseCount} style={{textAlign:'center',padding:'12px',color:'#888'}}>No data found.</td></tr>
            : rows.map((r,i) => (
              <tr key={i}>
                <td style={{textAlign:'center'}}>{i+1}.</td>
                <td style={{textAlign:'left'}}>
                  <button type="button"
                    onClick={() => setDrill({ collegeId: Number(V(r,'CollegeID')), collegeName: V(r,'CollegeName') })}
                    style={{color:'#0d6efd',background:'none',border:'none',cursor:'pointer',textDecoration:'underline',padding:0,textAlign:'left'}}>
                    {V(r,'CollegeName')}
                  </button>
                </td>
                <td style={{textAlign:'center'}}>{V(r,'Intake')}</td>
                {phases.map(n => (
                  <td key={n} style={{textAlign:'center'}}>{V(r,`AdmittedPhase${n}`)}</td>
                ))}
                <td style={{textAlign:'center',fontWeight:600}}>{V(r,'TotalAdmitted')}</td>
                <td style={{textAlign:'center'}}>{V(r,'Vacancy')}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

// ── EVC Wise Report ───────────────────────────────────────────────────────────
function EvcSummaryReport({ rows }: { rows: Row[] }) {
  return (
    <table id="report-table" className="grid-view" style={{width:'100%'}}>
      <thead>
        <tr><td className="grid-view-top-header" colSpan={7} style={{textAlign:'center',fontWeight:700}}>EVC Wise Report</td></tr>
        <tr>
          <th>Sr. No.</th><th>EVC Code</th><th>Total Forms</th>
          <th>Fully Verified</th><th>Not Verified</th><th>Partially Verified</th><th>Re-Uploaded</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i) => (
          <tr key={i}>
            <td style={{textAlign:'center'}}>{i+1}.</td>
            <td>{V(r,'EVCCode')}</td>
            <td style={{textAlign:'center'}}>{V(r,'TotalForms')}</td>
            <td style={{textAlign:'center'}}>{V(r,'FullyVerifiedForms')}</td>
            <td style={{textAlign:'center'}}>{V(r,'NotVerifiedForms')}</td>
            <td style={{textAlign:'center'}}>{V(r,'PartiallyVerifiedForms')}</td>
            <td style={{textAlign:'center'}}>{V(r,'ReUploadedForms')}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Generic table ─────────────────────────────────────────────────────────────
function GenericReport({ title, rows }: { title: string; rows: Row[] }) {
  if (rows.length === 0) return <div className="l-alert l-alert-warning">No data found.</div>
  const cols = Object.keys(rows[0])
  return (
    <div style={{overflowX:'auto'}}>
      <table id="report-table" className="grid-view" style={{width:'100%'}}>
        <thead>
          <tr><td className="grid-view-top-header" colSpan={cols.length+1} style={{textAlign:'center',fontWeight:700}}>{title}</td></tr>
          <tr>
            <th>Sr. No.</th>
            {cols.map(c => <th key={c} style={{textAlign:'left',whiteSpace:'nowrap'}}>{c}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i) => (
            <tr key={i}>
              <td style={{textAlign:'center'}}>{i+1}.</td>
              {cols.map(c => <td key={c}>{String(r[c]??'')}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function GenerateReportPage() {
  const [params]   = useSearchParams()
  const reportId   = params.get('report') ?? 'allotment-by-college'
  const [phaseId, setPhaseId] = useState(0)
  const [generate, setGenerate] = useState(false)

  const { data: phases = [] } = useMasterData('phase')
  const needsPhase = ['allotment','allotment-by-college','allotment-by-course'].includes(reportId)

  const { data, isLoading } = useQuery<unknown>({
    queryKey: ['report', reportId, phaseId],
    queryFn:  () => apiClient.get(`/reports/${reportId}/data?phaseId=${phaseId}`).then(r => r.data),
    enabled:  generate,
    staleTime: 0,
  })

  const ts = now()
  const TITLES: Record<string,string> = {
    'allotment':                 'Allotment Report',
    'allotment-by-college':      'Allotment Report',
    'allotment-by-course':       'Allotment Report By Course',
    'composite-by-college':      'Composite Admission Report',
    'evc-summary':               'EVC Wise Report',
    'evc-candidate-list':        'EVC Wise Candidate List',
    'eligible-for-everification':'Candidates Eligible For E-Verification',
  }
  const title = TITLES[reportId] ?? 'Report'

  const rows = Array.isArray(data) ? data as Row[] : []
  const compositeData = data && typeof data==='object' && 'rows' in (data as object)
    ? data as { maxActivePhaseId:number; rows:Row[] } : null
  const hasData = compositeData ? compositeData.rows.length > 0 : rows.length > 0

  return (
    <div style={{padding:'8px'}}>
      <div className="l-card">
        <div className="l-card-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <span>{title}</span>
          {generate && hasData && (
            <button type="button" className="btn-success-legacy" style={{fontSize:'90%'}}
              onClick={() => exportToExcel('report-table', title.replace(/\s+/g,'_'))}>
              Export to Excel
            </button>
          )}
        </div>
        <div className="l-card-body">
          {/* Filters */}
          <div style={{display:'flex',gap:'12px',alignItems:'flex-end',flexWrap:'wrap',marginBottom:'16px'}}>
            {needsPhase && (
              <div className="form-group" style={{flex:'0 0 200px'}}>
                <label className="control-label">Select Round :</label>
                <select className="l-form-control" value={phaseId}
                  onChange={e => { setPhaseId(Number(e.target.value)); setGenerate(false) }}>
                  <option value={0}>-- All Rounds --</option>
                  {phases.map(p => <option key={p.value} value={Number(p.value)}>{p.text}</option>)}
                </select>
              </div>
            )}
            <button type="button" className="btn-success-legacy" onClick={() => setGenerate(true)}>
              Generate Report
            </button>
          </div>

          {/* Printed On */}
          {generate && !isLoading && hasData && (
            <div style={{fontSize:'90%',fontWeight:600,marginBottom:'8px',color:'#333'}}>
              Printed On : {ts}
            </div>
          )}

          {isLoading && <p style={{textAlign:'center',padding:'16px'}}>Loading report…</p>}

          {generate && !isLoading && (
            <>
              {(reportId==='allotment'||reportId==='allotment-by-college') ? (
                rows.length===0
                  ? <div className="l-alert l-alert-warning">No data found.</div>
                  : <AllotmentByCollegeReport phaseId={phaseId} rows={rows} />
              ) : reportId==='composite-by-college' && compositeData ? (
                <CompositeByCollegeReport data={compositeData} />
              ) : reportId==='evc-summary' ? (
                rows.length===0
                  ? <div className="l-alert l-alert-warning">No data found.</div>
                  : <EvcSummaryReport rows={rows} />
              ) : (
                rows.length===0
                  ? <div className="l-alert l-alert-warning">No data found.</div>
                  : <GenericReport title={title} rows={rows} />
              )}
              {hasData && (
                <div style={{fontSize:'90%',color:'#666',marginTop:'8px'}}>
                  Total: {compositeData ? compositeData.rows.length : rows.length} row(s)
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
