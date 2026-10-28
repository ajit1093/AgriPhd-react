import { apiClient } from './client'
import type { HomeNotificationsResponse, ImportantDateItem } from '@/types/notification'

export const notificationApi = {
  getHome: (regionId = 1, refresh = false) =>
    apiClient
      .get<HomeNotificationsResponse>('/notifications/home', {
        params: { regionId, refresh, _t: Date.now() },
      })
      .then(r => r.data),

  getImportantDates: (regionId = 1, refresh = false) =>
    apiClient
      .get<ImportantDateItem[]>('/notifications/important-dates', {
        params: { regionId, refresh, _t: Date.now() },
      })
      .then(r => r.data),

  isRegistrationOpen: () =>
    apiClient.get<{ isOpen: boolean }>('/notifications/registration-open', {
      params: { _t: Date.now() },
    }).then(r => r.data),
}

