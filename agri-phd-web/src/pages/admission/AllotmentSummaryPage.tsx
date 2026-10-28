import { useQuery } from '@tanstack/react-query'
import { admissionApi } from '@/api/admission'

/**
 * P2-H-04 — Admission/AllotmentSummary.aspx
 * Shows candidate header + per-round allotment status grid.
 * SP: Admission_GetAllotmentSummary(@CandidateID)
 *   ResultSet 1: ApplicationID, CandidateName, ApplicationFormNo
 *   ResultSet 2: PhaseID, Phase, ChoiceCode, CollegeName, FacultyName, SubjectName, CurrentStatus
 */

interface Header {
  ApplicationID:    string
  CandidateName:    string
  ApplicationFormNo: string
}
interface Round {
  PhaseID:       number
  Phase:         string
  ChoiceCode:    string
  CollegeName:   string
  FacultyName:   string | null
  SubjectName:   string | null
  CurrentStatus: string
}
interface SummaryData {
  header: Header
  rounds: Round[]
}

const statusColor = (s: string) => {
  const sl = s.toLowerCase()
  if (sl === 'admitted')                           return '#198754'
  if (sl.includes('not allotted'))                 return '#6c757d'
  if (sl.includes('rejected') || sl.includes('cancelled')) return '#dc3545'
  if (sl.includes('allotment letter downloaded'))  return '#0d6efd'
  return '#15133C'
}

export default function AllotmentSummaryPage() {
  const { data, isLoading, isError } = useQuery<SummaryData>({
    queryKey: ['allotment-summary'],
    queryFn:  admissionApi.getAllotmentSummary as () => Promise<SummaryData>,
  })

  if (isLoading) return <div style={{ padding: '20px', textAlign: 'center' }}>Loading…</div>
  if (isError || !data?.header) return (
    <div style={{ padding: '8px' }}>
      <div className="l-alert l-alert-warning">
        No allotment summary available yet. Allotment data will appear here once the process begins.
      </div>
    </div>
  )

  const { header, rounds = [] } = data

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Allotment / Admission Summary</div>
        <div className="l-card-body">

          {/* ── Candidate header ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '16px' }}>
            <div className="user-details" style={{ flex: '1 1 280px' }}>
              <span className="label-col">Application Form No :</span>
              <span className="value-col" style={{ fontWeight: 600 }}>{header.ApplicationFormNo}</span>
            </div>
            <div className="user-details" style={{ flex: '1 1 280px' }}>
              <span className="label-col">Login ID :</span>
              <span className="value-col">{header.ApplicationID}</span>
            </div>
            <div className="user-details" style={{ flex: '1 1 280px' }}>
              <span className="label-col">Candidate Name :</span>
              <span className="value-col" style={{ fontWeight: 600 }}>{header.CandidateName}</span>
            </div>
          </div>

          {/* ── Rounds grid ──────────────────────────────────────────────── */}
          <div style={{ overflowX: 'auto' }}>
            <table className="grid-view" style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '5%' }}>Sr. No.</th>
                  <th style={{ width: '12%' }}>Round</th>
                  <th style={{ width: '8%' }}>College Code</th>
                  <th style={{ textAlign: 'left', width: '35%' }}>Institute Name</th>
                  <th style={{ textAlign: 'left', width: '15%' }}>Faculty Name</th>
                  <th style={{ textAlign: 'left', width: '15%' }}>Subject Name</th>
                  <th style={{ width: '10%' }}>Current Status</th>
                </tr>
              </thead>
              <tbody>
                {rounds.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '16px', color: '#888' }}>
                      No rounds data available.
                    </td>
                  </tr>
                ) : rounds.map((r, i) => (
                  <tr key={r.PhaseID}
                    style={{ backgroundColor: r.CurrentStatus.toLowerCase() === 'admitted' ? '#d1e7dd' : undefined }}>
                    <td style={{ textAlign: 'center' }}>{i + 1}.</td>
                    <td style={{ textAlign: 'center' }}>{r.Phase?.trim()}</td>
                    <td style={{ textAlign: 'center' }}>{r.ChoiceCode}</td>
                    <td style={{ textAlign: 'left' }}>{r.CollegeName}</td>
                    <td style={{ textAlign: 'left' }}>{r.FacultyName ?? '—'}</td>
                    <td style={{ textAlign: 'left' }}>{r.SubjectName ?? '—'}</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: statusColor(r.CurrentStatus) }}>
                      {r.CurrentStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  )
}
