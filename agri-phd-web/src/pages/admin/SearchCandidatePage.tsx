import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/api/client'

/**
 * Admin/SearchCandidate.aspx — exact parity
 *
 * Search options exactly match legacy ddlSearchCandidateBy:
 *   ApplicationID | CandidateName | MobileNo | EMailID
 *
 * SP: Base_SearchCandidate(@SearchCandidateBy, @SearchQuery)
 * SP returns: ApplicationID, CandidateName, Gender, DOB, MobileNo, EMailID
 * (all PascalCase — Dapper dynamic from raw SQL result)
 *
 * Grid columns: Sr. No. | Application No. | Candidate Name | Gender | DOB | Mobile No. | E-Mail ID
 */

const SEARCH_OPTIONS = [
  { value: 'ApplicationID',  label: 'Application ID' },
  { value: 'CandidateName',  label: 'Candidate Name' },
  { value: 'MobileNo',       label: 'Mobile No.' },
  { value: 'EMailID',        label: 'E-Mail ID' },
]

const PLACEHOLDER: Record<string, string> = {
  ApplicationID: 'Enter Application ID',
  CandidateName: 'Enter Candidate Name',
  MobileNo:      'Enter Registered Mobile No.',
  EMailID:       'Enter Registered E-Mail ID',
}

interface CandidateRow {
  ApplicationID: string
  CandidateName: string
  Gender: string
  DOB: string
  MobileNo: string
  EMailID: string
}

export default function SearchCandidatePage() {
  const navigate = useNavigate()
  const [searchBy,   setSearchBy]   = useState('ApplicationID')
  const [queryText,  setQueryText]  = useState('')
  const [submitted,  setSubmitted]  = useState(false)

  const { data: rows = [], isLoading, isFetching } = useQuery<CandidateRow[]>({
    queryKey: ['admin', 'search-candidate', searchBy, queryText],
    queryFn:  () => apiClient.get<CandidateRow[]>(
      `/admin/search-candidate?by=${searchBy}&query=${encodeURIComponent(queryText)}`
    ).then(r => r.data),
    enabled:  submitted && queryText.trim().length > 0,
    staleTime: 0,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (queryText.trim()) setSubmitted(true)
  }

  return (
    <div style={{ padding: '8px' }}>
      <div className="l-card">
        <div className="l-card-header">Search Candidate</div>
        <div className="l-card-body">

          {/* Search form — matches legacy layout */}
          <form onSubmit={handleSearch}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <label className="control-label">Search Student By</label>
                <select className="l-form-control" style={{ width: '200px' }}
                  value={searchBy}
                  onChange={e => { setSearchBy(e.target.value); setSubmitted(false) }}>
                  {SEARCH_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <label className="control-label">
                  {PLACEHOLDER[searchBy]} <span className="required">*</span>
                </label>
                <input type="text" className="l-form-control" style={{ width: '280px' }}
                  placeholder={PLACEHOLDER[searchBy]}
                  value={queryText}
                  onChange={e => { setQueryText(e.target.value); setSubmitted(false) }} />
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <button type="submit" className="btn-success-legacy"
                disabled={!queryText.trim() || isFetching}
                style={{ minWidth: '100px' }}>
                {isFetching ? 'Searching…' : 'Search'}
              </button>
            </div>
          </form>

          {/* Results — Candidate List */}
          {submitted && (
            <div>
              <div className="l-card-header l-card-header-sm" style={{ marginBottom: '0' }}>
                Candidate List
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="grid-view" style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '5%' }}>Sr. No.</th>
                      <th style={{ width: '12%' }}>Application No.</th>
                      <th style={{ textAlign: 'left', width: '35%' }}>Candidate Name</th>
                      <th style={{ width: '8%' }}>Gender</th>
                      <th style={{ width: '12%' }}>DOB</th>
                      <th style={{ width: '12%' }}>Mobile No.</th>
                      <th style={{ textAlign: 'left' }}>E-Mail ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading || isFetching
                      ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '16px' }}>Searching…</td></tr>
                      : rows.length === 0
                        ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '12px', color: '#888' }}>
                            No Records Found.
                          </td></tr>
                        : rows.map((r, i) => (
                          <tr key={r.ApplicationID + i}>
                            <td style={{ textAlign: 'center' }}>{i + 1}.</td>
                            <td>{r.ApplicationID}</td>
                            <td style={{ textAlign: 'left', fontWeight: 600 }}>
                              <button type="button"
                                onClick={() => navigate(`/admin/check-application-id?id=${r.ApplicationID}`)}
                                style={{ color: '#0d6efd', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0, textAlign: 'left', fontWeight: 600 }}>
                                {r.CandidateName}
                              </button>
                            </td>
                            <td style={{ textAlign: 'center' }}>{r.Gender}</td>
                            <td style={{ textAlign: 'center' }}>{r.DOB}</td>
                            <td>{r.MobileNo}</td>
                            <td style={{ textAlign: 'left' }}>{r.EMailID}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
