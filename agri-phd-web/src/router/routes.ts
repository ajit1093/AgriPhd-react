/**
 * Route constants — single source of truth for all application paths.
 * Mirrors the DashBoardPath values returned by Account_CheckUserExists SP.
 */

export const PUBLIC_ROUTES = {
  home:           '/',
  login:          '/login',
  register:       '/register',
  about:          '/about',
  disclaimer:     '/disclaimer',
  privacyPolicy:  '/privacy-policy',
  terms:          '/terms',
  refundPolicy:   '/refund-policy',
  searchCollege:  '/search-college',
  searchAgri:     '/search-agri-college',
  allotmentList:  '/allotment-list',
  universityVacancy: '/university-vacancy',
  forgotPassword: '/forgot-password',
  resetByQuestion:   '/reset-by-question',
  resetByMobile:     '/reset-by-mobile',
  resetByEmail:      '/reset-by-email',
  resetPassword:     '/reset-password',
  registrationSuccess: '/registration-success',
} as const

export const CANDIDATE_ROUTES = {
  dashboard:          '/candidate/dashboard',
  personal:           '/candidate/application-form/personal',
  address:            '/candidate/application-form/address',
  category:           '/candidate/application-form/category',
  qualification:      '/candidate/application-form/qualification',
  researchPaper:      '/candidate/application-form/research-paper',
  shortlist:          '/candidate/application-form/shortlist',
  uploadPhotoSign:    '/candidate/application-form/photo-sign',
  uploadDocuments:    '/candidate/application-form/documents',
  payFee:             '/candidate/application-form/pay-fee',
  formSummary:        '/candidate/application-form/summary',
  formPrint:          '/candidate/application-form/print',
  appendixD:          '/candidate/application-form/appendix-d',
  changePassword:     '/candidate/change-password',
  changeSecQuestion:  '/candidate/change-security-question',
  changeMobileEmail:  '/candidate/change-mobile-email',
} as const

export const ADMIN_ROUTES = {
  dashboard: '/admin/dashboard',
} as const

export const SUPER_ADMIN_ROUTES = {
  dashboard: '/super-admin/dashboard',
} as const

export const COLLEGE_ROUTES = {
  dashboard: '/college/dashboard',
} as const

export const EVC_ROUTES = {
  dashboard: '/everification/dashboard',
} as const

export const UNIVERSITY_ROUTES = {
  dashboard: '/university/dashboard',
} as const

export const CALL_CENTER_ROUTES = {
  dashboard: '/call-center/dashboard',
} as const

export const ERROR_ROUTES = {
  accessDenied: '/access-denied',
  forbidden:    '/forbidden',
  notFound:     '/not-found',
  serverError:  '/error',
} as const

// UserTypeID → dashboard path map (matches SP DashBoardPath convention)
// DB Master_UserType: 11=SuperAdmin, 12=Admin, 41=EVCAdmin, 42=EVCCoordinator,
//                     61=College, 91=Candidate, 93=University
export const ROLE_DASHBOARDS: Record<number, string> = {
  91: CANDIDATE_ROUTES.dashboard,
  11: SUPER_ADMIN_ROUTES.dashboard,
  12: ADMIN_ROUTES.dashboard,
  61: COLLEGE_ROUTES.dashboard,
  41: EVC_ROUTES.dashboard,
  42: EVC_ROUTES.dashboard,
  93: UNIVERSITY_ROUTES.dashboard,
}
