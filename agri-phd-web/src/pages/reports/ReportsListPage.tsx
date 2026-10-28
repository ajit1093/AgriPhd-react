import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

interface ReportDef { id: string; title: string; description: string; roles: number[] }

const REPORTS: ReportDef[] = [
  { id: 'allotment-by-college',        title: 'Allotment Report By College',            description: 'College-wise allotment with admission status',     roles: [11,12,21] },
  { id: 'allotment-by-course',         title: 'Allotment Report By Course',             description: 'Course-wise allotment details',                    roles: [11,12] },
  { id: 'composite-by-college',        title: 'Composite Admission Report By College',  description: 'College-wise composite admission summary',          roles: [11,12,21] },
  { id: 'evc-summary',                 title: 'EVC Wise Report',                        description: 'EVC-wise verification summary',                    roles: [11,12,41] },
  { id: 'evc-candidate-list',          title: 'EVC Wise Candidate List',                description: 'Candidates assigned to each EVC',                  roles: [11,12,41] },
  { id: 'eligible-for-everification',  title: 'Eligible For E-Verification',            description: 'Candidates eligible for document verification',     roles: [11,12,41] },
]

export default function ReportsListPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const typeId   = user?.userTypeId ?? 0
  const visible  = REPORTS.filter(r => r.roles.includes(typeId))

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Reports</div>
        <div className="l-card-body">
          {visible.length === 0
            ? <div className="l-alert l-alert-info">No reports available for your role.</div>
            : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {visible.map(r => (
                  <div key={r.id}
                    onClick={() => navigate(`/reports/generate?report=${r.id}`)}
                    style={{ border: '1px solid #dee2e6', borderRadius: '6px', padding: '14px 16px', cursor: 'pointer', background: '#fff' }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
                    role="button" tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/reports/generate?report=${r.id}`)}>
                    <div style={{ fontWeight: 600, color: '#15133C', marginBottom: '4px' }}>📊 {r.title}</div>
                    <div style={{ fontSize: '88%', color: '#6c757d', marginBottom: '8px' }}>{r.description}</div>
                    <div style={{ textAlign: 'right', fontSize: '82%', color: '#0d6efd' }}>Generate →</div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
