import { useNavigate } from 'react-router-dom'

const REPORTS = [
  { id: 'allotment',              title: 'Allotment Report' },
  { id: 'allotment-by-college',   title: 'Allotment Report By College' },
  { id: 'allotment-by-course',    title: 'Allotment Report By Course' },
  { id: 'composite-admission',    title: 'Composite Admission Report' },
  { id: 'composite-by-college',   title: 'Composite Admission Report By College' },
  { id: 'composite-by-course',    title: 'Composite Admission Report By Course' },
  { id: 'evc-candidate-list',     title: 'EVC Wise Candidate List' },
  { id: 'evc-summary',            title: 'EVC Wise Report' },
  { id: 'eligible-for-everification', title: 'Candidates Eligible For E-Verification' },
]

export default function ManageReportsPage() {
  const navigate = useNavigate()
  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Manage Reports</div>
        <div className="l-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {REPORTS.map(r => (
              <div key={r.id}
                onClick={() => navigate(`/reports/generate?report=${r.id}`)}
                style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '12px 16px', cursor: 'pointer', backgroundColor: '#fff' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}>
                <div style={{ fontWeight: 600, color: '#15133C', marginBottom: '4px' }}>📊 {r.title}</div>
                <div style={{ fontSize: '85%', color: '#0d6efd' }}>Generate →</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
