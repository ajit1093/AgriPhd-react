import { apiClient } from './client'
import type { CandidateDashboardData, AdminDashboardData, CollegeDashboardData, EVerificationDashboardData, LoggedInUserDetails } from '@/types/dashboard'

export const dashboardApi = {
  candidate:    () => apiClient.get<CandidateDashboardData>('/dashboard/candidate').then(r => r.data),
  admin:        () => apiClient.get<AdminDashboardData>('/dashboard/admin').then(r => r.data),
  superAdmin:   () => apiClient.get<AdminDashboardData>('/dashboard/super-admin').then(r => r.data),
  college:      () => apiClient.get<CollegeDashboardData>('/dashboard/college').then(r => r.data),
  eVerification:() => apiClient.get<EVerificationDashboardData>('/dashboard/everification').then(r => r.data),
  university:   () => apiClient.get<CollegeDashboardData>('/dashboard/university').then(r => r.data),
  callCenter:   () => apiClient.get<LoggedInUserDetails>('/dashboard/call-center').then(r => r.data),
}
