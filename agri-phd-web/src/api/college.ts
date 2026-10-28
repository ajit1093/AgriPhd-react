import { apiClient } from './client'
import type { CollegeSearchResult, AgriCollegeSearchResult, AllotmentListItem, UniversityVacancyResponse } from '@/types/college'

export const collegeApi = {
  // Public search (existing)
  search: (params: { courseId?: number; districtId?: number; courseStatusId?: number }) =>
    apiClient.get<CollegeSearchResult[]>('/colleges/search', { params }).then(r => r.data),
  searchAgri: (params: { facultyId?: number; universityId?: number; collegeStatusId?: number }) =>
    apiClient.get<AgriCollegeSearchResult[]>('/colleges/search-agri', { params }).then(r => r.data),
  getAllotmentList: (params: { collegeId?: number; phaseId?: number }) =>
    apiClient.get<AllotmentListItem[]>('/admission/allotment-list', { params }).then(r => r.data),
  getUniversityVacancies: (params: { universityId?: number; subjectId?: number }) =>
    apiClient.get<UniversityVacancyResponse>('/university/vacancies', { params }).then(r => r.data),

  // Batch I — College management
  list: (params: { facultyId?: number; districtId?: number; collegeCode?: string; collegeName?: string }) =>
    apiClient.get<Record<string, unknown>[]>('/colleges', { params }).then(r => r.data),
  getDetails: (id: number) =>
    apiClient.get<Record<string, unknown>>(`/colleges/${id}`).then(r => r.data),
  getSummary: (id: number) =>
    apiClient.get<Record<string, unknown>>(`/colleges/${id}/summary`).then(r => r.data),
  saveDetails: (id: number, data: Record<string, unknown>) =>
    apiClient.post<{ success: boolean }>(`/colleges/${id}`, data).then(r => r.data),
  getPassword: (collegeCode: string) =>
    apiClient.get<{ collegeCode: string; password: string }>(`/colleges/${collegeCode}/password`).then(r => r.data),
  resetPassword: (collegeCode: string, newPassword: string) =>
    apiClient.post<{ success: boolean }>(`/colleges/${collegeCode}/reset-password`, { newPassword }).then(r => r.data),
}
