import { apiClient } from './client'
import type { DropdownItem, SaluationMapItem, MenuItem } from '@/types/master'

export const masterApi = {
  getList: (tableName: string) =>
    apiClient.get<DropdownItem[]>(`/master/${tableName}`).then(r => r.data),

  getSaluationMap: () =>
    apiClient.get<SaluationMapItem[]>('/master/saluation-map').then(r => r.data),

  getColleges: (facultyId: number) =>
    apiClient.get<DropdownItem[]>(`/master/colleges?facultyId=${facultyId}`).then(r => r.data),

  getSpotRoundSubjects: (universityId: number) =>
    apiClient.get<DropdownItem[]>(`/master/spot-round-subjects?universityId=${universityId}`).then(r => r.data),

  getMenu: () =>
    apiClient.get<MenuItem[]>('/menu').then(r => r.data),

  getPublicMenu: () =>
    apiClient.get<MenuItem[]>('/menu/public').then(r => r.data),
}
