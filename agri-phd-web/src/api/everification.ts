import { apiClient } from './client'

// /candidates endpoint — controller maps to camelCase anonymous object
export interface EVCandidateRow {
  candidateId: number
  applicationId: string
  applicationFormNo: string
  candidateName: string
  category: string
  assignedTo: string
}

// /documents/:id endpoint — returns raw Dapper dynamic (PascalCase SP columns)
export interface EVDocumentRow {
  DocumentID: number
  DocumentName: string
  IsDocumentCompulsory: boolean
  IsDocumentUploaded: boolean
  DocumentUploadedURL: string
  DocumentVerificationStatus: string
  DocumentVerificationComments: string
}

export const evApi = {
  getCandidates: (filter = '-1') =>
    apiClient.get<EVCandidateRow[]>(`/everification/candidates?filter=${filter}`).then(r => r.data),
  getCandidateDocuments: (candidateId: number) =>
    apiClient.get<{ documents: EVDocumentRow[] }>(`/everification/documents/${candidateId}`).then(r => r.data),
  saveVerification: (candidateId: number, docs: { documentId: number; status: string; comments: string }[]) =>
    apiClient.post<{ success: boolean }>('/everification/verify', { candidateId, documents: docs }).then(r => r.data),
}
