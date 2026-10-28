/** Mirrors NotificationItem model from AgriPhd.Api */
export interface NotificationItem {
  notificationID: number
  notificationCategoryID: number
  notificationCategory: string
  notificationTitle: string
  /** "T" = plain text; anything else = link with FileContentURL */
  contentType: string
  textContent: string
  fileContentURL: string
  /** 1 = show NEW badge */
  displayNewImage: number
  openInNewPage: number
  publishDateTime: string | null
  publishDateTimeF: string
}

/** Mirrors ImportantDateItem model from AgriPhd.Api */
export interface ImportantDateItem {
  sequence: number
  activityCode: string
  title: string
  subtitle: string
  category: string
  startDate: string | null
  endDate: string | null
  startDateFormatted: string
  endDateFormatted: string
  status: 'Active' | 'Upcoming' | 'Completed' | string
  isActive: boolean
  description: string
}

/** Mirrors HomeNotificationsResponse DTO */
export interface HomeNotificationsResponse {
  announcements: NotificationItem[]
  news: NotificationItem[]
  notifications: NotificationItem[]
  schedule: NotificationItem[]
  downloads: NotificationItem[]
  popup: NotificationItem | null
  registrationOpen: boolean
  importantDates?: ImportantDateItem[]
}

