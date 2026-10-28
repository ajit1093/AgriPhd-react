import { useSearchParams } from 'react-router-dom'
/** P2-H-10/11 — Admission/AdmissionRejectionLetter + Print */
export default function RejectionLetterPage() {
  const [params] = useSearchParams()
  return (
    <div style={{ padding: '20px', fontFamily: 'Verdana, sans-serif', fontSize: '12px' }}>
      <div className="no-print" style={{ marginBottom: '16px' }}>
        <button type="button" className="btn-special" onClick={() => window.print()}>Print</button>
      </div>
      <div style={{ border: '2px solid #000', padding: '20px' }}>
        <h3 style={{ textAlign: 'center', margin: '0 0 16px' }}>REJECTION LETTER — MCAER Pune 2026-27</h3>
        <p>Your admission to the allotted college has been rejected. Please contact MCAER for further information.</p>
        <p>Application Form No: <strong>{params.get('applicationFormNo') ?? '—'}</strong></p>
      </div>
      <style>{`@media print { .no-print { display: none !important; } }`}</style>
    </div>
  )
}
