import { apiClient } from './client'

export interface MenuItem {
  menuId: number
  parentMenuId: number | null
  menuName: string
  menuUrl: string
  target: string
  isNew: boolean
  seqNo: number
  children: MenuItem[]
}

export const menuApi = {
  getMenu: async (): Promise<MenuItem[]> => {
    const { data } = await apiClient.get<MenuItem[]>('/menu')
    return data
  },
}
