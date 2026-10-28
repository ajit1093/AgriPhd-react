  import { lazy, Suspense } from 'react'
  import { Routes, Route } from 'react-router-dom'
  import { useAuthStore } from '@/store/authStore'
  import { ProtectedRoute } from './ProtectedRoute'
  import { PUBLIC_ROUTES, ERROR_ROUTES } from './routes'

  // ─── Layouts ─────────────────────────────────────────────────────────────────
  import { PublicLayout } from '@/components/layout/PublicLayout'
  import { AuthLayout } from '@/components/layout/AuthLayout'

  // ─── Public pages ─────────────────────────────────────────────────────────────
  const HomePage = lazy(() => import('@/pages/public/HomePage'))
  const LoginPage = lazy(() => import('@/pages/public/LoginPage'))
  const NewRegistrationPage = lazy(() => import('@/pages/public/NewRegistrationPage'))
  const RegistrationSuccessPage = lazy(() => import('@/pages/public/RegistrationSuccessPage'))
  const AboutUsPage = lazy(() => import('@/pages/public/AboutUsPage'))
  const DisclaimerPage = lazy(() => import('@/pages/public/DisclaimerPage'))
  const PrivacyPolicyPage = lazy(() => import('@/pages/public/PrivacyPolicyPage'))
  const TermsPage = lazy(() => import('@/pages/public/TermsPage'))
  const RefundPolicyPage = lazy(() => import('@/pages/public/RefundPolicyPage'))
  const ForgotPasswordPage = lazy(() => import('@/pages/account/ForgotPasswordPage'))
  const ResetBySecurityQuestionPage = lazy(() => import('@/pages/account/ResetBySecurityQuestionPage'))
  const ResetByMobileOtpPage = lazy(() => import('@/pages/account/ResetByMobileOtpPage'))
  const ResetByEmailOtpPage = lazy(() => import('@/pages/account/ResetByEmailOtpPage'))
  const ResetPasswordPage = lazy(() => import('@/pages/account/ResetPasswordPage'))
  const SearchCollegePage = lazy(() => import('@/pages/public/SearchCollegePage'))
  const SearchAgriCollegePage = lazy(() => import('@/pages/public/SearchAgriCollegePage'))
  const AllotmentListPage = lazy(() => import('@/pages/public/AllotmentListPage'))
  const UniversityVacancyPage = lazy(() => import('@/pages/public/UniversityVacancyPage'))
  const PrintApplicationFormPage = lazy(() => import('@/pages/public/PrintApplicationFormPage'))

  // ─── Error pages ─────────────────────────────────────────────────────────────
  const AccessDeniedPage = lazy(() => import('@/pages/error/AccessDeniedPage'))
  const ForbiddenPage = lazy(() => import('@/pages/error/ForbiddenPage'))
  const NotFoundPage = lazy(() => import('@/pages/error/NotFoundPage'))
  const InternalErrorPage = lazy(() => import('@/pages/error/InternalErrorPage'))
  const GeneralErrorPage = lazy(() => import('@/pages/error/GeneralErrorPage'))

  // ─── Candidate pages ──────────────────────────────────────────────────────────
  const CandidateDashboardPage = lazy(() => import('@/pages/candidate/DashboardPage'))
  const ApplicationFormSummaryPage = lazy(() => import('@/pages/candidate/ApplicationFormSummaryPage'))
  const PersonalPage = lazy(() => import('@/pages/candidate/PersonalPage'))
  const AddressPage = lazy(() => import('@/pages/candidate/AddressPage'))
  const CategoryPage = lazy(() => import('@/pages/candidate/CategoryPage'))
  const QualificationPage = lazy(() => import('@/pages/candidate/QualificationPage'))
  const ResearchPaperPage = lazy(() => import('@/pages/candidate/ResearchPaperPage'))
  const ShortlistOptionsPage = lazy(() => import('@/pages/candidate/ShortlistOptionsPage'))
  const UploadPhotoSignPage = lazy(() => import('@/pages/candidate/UploadPhotoSignPage'))
  const UploadDocumentsPage = lazy(() => import('@/pages/candidate/UploadDocumentsPage'))
  const PayApplicationFeePage = lazy(() => import('@/pages/candidate/PayApplicationFeePage'))
  const ApplicationFormPrintPage = lazy(() => import('@/pages/candidate/ApplicationFormPrintPage'))
  const AppendixDPage = lazy(() => import('@/pages/candidate/AppendixDPage'))
  const ApplicationFormUnlockPage = lazy(() => import('@/pages/candidate/ApplicationFormUnlockPage'))
  const ChangePasswordPage = lazy(() => import('@/pages/candidate/ChangePasswordPage'))
  const ChangeSecurityQuestionPage = lazy(() => import('@/pages/candidate/ChangeSecurityQuestionPage'))
  const ChangeMobileEmailPage = lazy(() => import('@/pages/candidate/ChangeMobileEmailPage'))

  // ─── Fee pages ────────────────────────────────────────────────────────────────
  const PaymentHistoryPage = lazy(() => import('@/pages/fee/PaymentHistoryPage'))
  const PaymentSuccessPage = lazy(() => import('@/pages/fee/PaymentSuccessPage'))
  const PaymentFailedPage = lazy(() => import('@/pages/fee/PaymentFailedPage'))
  const PaymentErrorPage = lazy(() => import('@/pages/fee/PaymentErrorPage'))
  const CheckFailedTransactionsPage = lazy(() => import('@/pages/fee/CheckFailedTransactionsPage'))
  const RefundTransactionPage = lazy(() => import('@/pages/fee/RefundTransactionPage'))
  const RefundDuplicateTransactionsPage = lazy(() => import('@/pages/fee/RefundDuplicateTransactionsPage'))

  // ─── Admission pages ──────────────────────────────────────────────────────────
  const CheckAllotmentStatusPage = lazy(() => import('@/pages/admission/CheckAllotmentStatusPage'))
  const AllotmentLetterPage = lazy(() => import('@/pages/admission/AllotmentLetterPage'))
  const AllotmentSummaryPage = lazy(() => import('@/pages/admission/AllotmentSummaryPage'))
  const AdmissionLetterPage = lazy(() => import('@/pages/admission/AdmissionLetterPage'))
  const RejectionLetterPage = lazy(() => import('@/pages/admission/RejectionLetterPage'))
  const CancellationLetterPage = lazy(() => import('@/pages/admission/CancellationLetterPage'))
  const CancelAdmissionPage = lazy(() => import('@/pages/admission/CancelAdmissionPage'))

  // ─── Admin / SuperAdmin pages (Batch K, L) ────────────────────────────────────
  const DashboardAdminPage = lazy(() => import('@/pages/administration/DashboardAdminPage'))
  const DashboardSuperAdminPage = lazy(() => import('@/pages/administration/DashboardSuperAdminPage'))
  const ManageActivityStatusPage = lazy(() => import('@/pages/administration/ManageActivityStatusPage'))
  const ManageAdmissionActivityStatusPage = lazy(() => import('@/pages/administration/ManageAdmissionActivityStatusPage'))
  const ManagePhasePage = lazy(() => import('@/pages/administration/ManagePhasePage'))
  const ManageNotificationsPage = lazy(() => import('@/pages/administration/ManageNotificationsPage'))
  const ManageUsersPage = lazy(() => import('@/pages/administration/ManageUsersPage'))
  const AddEditUserPage = lazy(() => import('@/pages/administration/AddEditUserPage'))
  const EditProfilePage = lazy(() => import('@/pages/administration/EditProfilePage'))
  const ManageEvcPage = lazy(() => import('@/pages/administration/ManageEvcPage'))
  const EvcDetailsPage = lazy(() => import('@/pages/administration/EvcDetailsPage'))
  const ManageSubEvcPage = lazy(() => import('@/pages/administration/ManageSubEvcPage'))
  const SubEvcDetailsPage = lazy(() => import('@/pages/administration/SubEvcDetailsPage'))
  const GeneratePasswordPage = lazy(() => import('@/pages/administration/GeneratePasswordPage'))
  const ManageConfigPage = lazy(() => import('@/pages/administration/ManageConfigPage'))
  const ResetCachePage = lazy(() => import('@/pages/administration/ResetCachePage'))
  const ManageReportsAdminPage = lazy(() => import('@/pages/administration/ManageReportsPage'))
  const CheckAppSettingsPage = lazy(() => import('@/pages/administration/CheckAppSettingsPage'))
  const SearchCandidatePage = lazy(() => import('@/pages/admin/SearchCandidatePage'))
  const CheckApplicationIdAdminPage = lazy(() => import('@/pages/admin/CheckApplicationIdAdminPage'))
  const DocumentVerificationStatusPage = lazy(() => import('@/pages/admin/DocumentVerificationStatusPage'))
  const CheckPgcetPage = lazy(() => import('@/pages/admin/CheckPgcetPage'))
  const ResetCandidatePasswordPage = lazy(() => import('@/pages/admin/ResetCandidatePasswordPage'))

  // ─── College pages ────────────────────────────────────────────────────────────
  const DashboardCollegePage = lazy(() => import('@/pages/college/DashboardCollegePage'))
  const AllottedStudentsPage = lazy(() => import('@/pages/college/AllottedStudentsPage'))
  const ConfirmAdmissionPage = lazy(() => import('@/pages/college/ConfirmAdmissionPage'))
  const CollegeListPage = lazy(() => import('@/pages/college/CollegeListPage'))
  const EditCollegePage = lazy(() => import('@/pages/college/EditCollegePage'))
  const CollegeSummaryPage = lazy(() => import('@/pages/college/CollegeSummaryPage'))
  const GetCollegePasswordPage = lazy(() => import('@/pages/college/GetCollegePasswordPage'))
  const ResetCollegePasswordPage = lazy(() => import('@/pages/college/ResetCollegePasswordPage'))

  // ─── EVerification pages ──────────────────────────────────────────────────────
  const DashboardEVerificationPage = lazy(() => import('@/pages/everification/DashboardEVerificationPage'))
  const CandidateListPage = lazy(() => import('@/pages/everification/CandidateListPage'))
  const VerifyDocumentsPage = lazy(() => import('@/pages/everification/VerifyDocumentsPage'))
  const EVCCheckApplicationIdPage = lazy(() => import('@/pages/everification/CheckApplicationIdPage'))

  // ─── University pages ─────────────────────────────────────────────────────────
  const DashboardUniversityPage = lazy(() => import('@/pages/university/DashboardUniversityPage'))
  const SpotRoundRegistrationPage = lazy(() => import('@/pages/university/SpotRoundRegistrationPage'))
  const SpotRoundConfirmAdmissionPage = lazy(() => import('@/pages/university/SpotRoundConfirmAdmissionPage'))
  const RegisteredCandidatesPage = lazy(() => import('@/pages/university/RegisteredCandidatesPage'))
  const SpotRoundAllotmentLetterPage = lazy(() => import('@/pages/university/SpotRoundAllotmentLetterPage'))


  // ─── Reports / Menu management ────────────────────────────────────────────────
  const ReportsListPage = lazy(() => import('@/pages/reports/ReportsListPage'))
  const GenerateReportPage = lazy(() => import('@/pages/reports/GenerateReportPage'))
  const ManageMenusPage = lazy(() => import('@/pages/menu/ManageMenusPage'))
  const ManageGroupsPage = lazy(() => import('@/pages/menu/ManageGroupsPage'))
  const ManageLinksPage = lazy(() => import('@/pages/menu/ManageLinksPage'))

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  function SuspenseWrapper({ children }: { children: React.ReactNode }) {
    return (
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" role="status" aria-label="Loading page" />
          </div>
        }
      >
        {children}
      </Suspense>
    )
  }

  function LoadingScreen() {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" role="status" aria-label="Loading" />
          <p className="mt-3 text-sm text-neutral-500">Loading…</p>
        </div>
      </div>
    )
  }

  /**
   * AppRouter — role-based route tree.
   *
   * IMPORTANT: Routes shared across multiple roles (e.g. /fee/history accessible
   * to both candidate and admin) are duplicated in each role's block rather than
   * using a single shared block, so ProtectedRoute can enforce role correctly.
   *
   * Role UserTypeIDs: 91=Candidate, 11=SuperAdmin, 12=Admin,
   *                   61=College, 41=EVCAdmin, 42=EVCCoordinator, 93=University
   */
  export function AppRouter() {
    const { isLoading } = useAuthStore()
    if (isLoading) return <LoadingScreen />

    return (
      <SuspenseWrapper>
        <Routes>

          {/* ── Public routes ───────────────────────────────────────────────── */}
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path={PUBLIC_ROUTES.home} element={<HomePage />} />
            <Route path={PUBLIC_ROUTES.login} element={<LoginPage />} />
            <Route path={PUBLIC_ROUTES.register} element={<NewRegistrationPage />} />
            <Route path={PUBLIC_ROUTES.registrationSuccess} element={<RegistrationSuccessPage />} />
            <Route path={PUBLIC_ROUTES.about} element={<AboutUsPage />} />
            <Route path={PUBLIC_ROUTES.disclaimer} element={<DisclaimerPage />} />
            <Route path={PUBLIC_ROUTES.privacyPolicy} element={<PrivacyPolicyPage />} />
            <Route path={PUBLIC_ROUTES.terms} element={<TermsPage />} />
            <Route path={PUBLIC_ROUTES.refundPolicy} element={<RefundPolicyPage />} />
            <Route path={PUBLIC_ROUTES.forgotPassword} element={<ForgotPasswordPage />} />
            <Route path={PUBLIC_ROUTES.resetByQuestion} element={<ResetBySecurityQuestionPage />} />
            <Route path={PUBLIC_ROUTES.resetByMobile} element={<ResetByMobileOtpPage />} />
            <Route path={PUBLIC_ROUTES.resetByEmail} element={<ResetByEmailOtpPage />} />
            <Route path={PUBLIC_ROUTES.resetPassword} element={<ResetPasswordPage />} />
            <Route path={PUBLIC_ROUTES.searchCollege} element={<SearchCollegePage />} />
            <Route path={PUBLIC_ROUTES.searchAgri} element={<SearchAgriCollegePage />} />
            <Route path={PUBLIC_ROUTES.allotmentList} element={<AllotmentListPage />} />
            <Route path={PUBLIC_ROUTES.universityVacancy} element={<UniversityVacancyPage />} />
            <Route path="/print-application" element={<PrintApplicationFormPage />} />
          </Route>

          {/* ── Shared — any authenticated role (admission letters, fee, self-service) ── */}
          <Route element={<ProtectedRoute allowedRoles={[11, 12, 61, 41, 42, 93, 91]} />}>
            <Route element={<AuthLayout />}>
              {/* Admission — viewable by all authenticated roles */}
              <Route path="/admission/allotment-status" element={<CheckAllotmentStatusPage />} />
              <Route path="/admission/allotment-letter" element={<AllotmentLetterPage />} />
              <Route path="/admission/allotment-summary" element={<AllotmentSummaryPage />} />
              <Route path="/admission/letter" element={<AdmissionLetterPage />} />
              <Route path="/admission/rejection-letter" element={<RejectionLetterPage />} />
              <Route path="/admission/cancellation-letter" element={<CancellationLetterPage />} />
              {/* Fee history — viewable by all */}
              <Route path="/fee/history" element={<PaymentHistoryPage />} />
              <Route path="/fee/success" element={<PaymentSuccessPage />} />
              <Route path="/fee/failed" element={<PaymentFailedPage />} />
              <Route path="/fee/error" element={<PaymentErrorPage />} />
              {/* Self-service — password/security/contact changes (all roles) */}
              <Route path="/account/change-password" element={<ChangePasswordPage />} />
              <Route path="/account/change-security-question" element={<ChangeSecurityQuestionPage />} />
              <Route path="/account/change-mobile-email" element={<ChangeMobileEmailPage />} />
              {/* Legacy /candidate/ paths — keep working for bookmarks/menu links */}
              <Route path="/candidate/change-password" element={<ChangePasswordPage />} />
              <Route path="/candidate/change-security-question" element={<ChangeSecurityQuestionPage />} />
              <Route path="/candidate/change-mobile-email" element={<ChangeMobileEmailPage />} />
            </Route>
          </Route>

          {/* ── Candidate (91) ──────────────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={[91]} />}>
            <Route element={<AuthLayout />}>
              <Route path="/candidate/dashboard" element={<CandidateDashboardPage />} />
              <Route path="/candidate/application-form/summary" element={<ApplicationFormSummaryPage />} />
              <Route path="/candidate/application-form/personal" element={<PersonalPage />} />
              <Route path="/candidate/application-form/address" element={<AddressPage />} />
              <Route path="/candidate/application-form/category" element={<CategoryPage />} />
              <Route path="/candidate/application-form/qualification" element={<QualificationPage />} />
              <Route path="/candidate/application-form/research-paper" element={<ResearchPaperPage />} />
              <Route path="/candidate/application-form/shortlist" element={<ShortlistOptionsPage />} />
              <Route path="/candidate/application-form/photo-sign" element={<UploadPhotoSignPage />} />
              <Route path="/candidate/application-form/documents" element={<UploadDocumentsPage />} />
              <Route path="/candidate/application-form/pay-fee" element={<PayApplicationFeePage />} />
              <Route path="/candidate/application-form/print" element={<ApplicationFormPrintPage />} />
              <Route path="/candidate/application-form/appendix-d" element={<AppendixDPage />} />
              <Route path="/candidate/unlock-form" element={<ApplicationFormUnlockPage />} />
            </Route>
          </Route>

          {/* ── College (61) + SuperAdmin (11) + Admin (12) ────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={[11, 12, 61]} />}>
            <Route element={<AuthLayout />}>
              <Route path="/college/dashboard" element={<DashboardCollegePage />} />
              <Route path="/college/allotted-students" element={<AllottedStudentsPage />} />
              <Route path="/college/confirm-admission/:candidateId" element={<ConfirmAdmissionPage />} />
              <Route path="/college/list" element={<CollegeListPage />} />
              <Route path="/college/edit" element={<EditCollegePage />} />
              <Route path="/college/edit/:id" element={<EditCollegePage />} />
              <Route path="/college/summary" element={<CollegeSummaryPage />} />
              <Route path="/college/summary/:id" element={<CollegeSummaryPage />} />
              <Route path="/college/get-password" element={<GetCollegePasswordPage />} />
              <Route path="/college/reset-password" element={<ResetCollegePasswordPage />} />
              {/* College Establishment profile pages */}
              <Route path="/college/profile" element={<DashboardCollegePage />} />
              <Route path="/college/address" element={<DashboardCollegePage />} />
              <Route path="/college/authorized-rep" element={<DashboardCollegePage />} />
              <Route path="/college/bank" element={<DashboardCollegePage />} />
              <Route path="/college/registration" element={<DashboardCollegePage />} />
              <Route path="/college/employees" element={<DashboardCollegePage />} />
              <Route path="/college/self-declaration" element={<DashboardCollegePage />} />
              <Route path="/college/request-inspection" element={<DashboardCollegePage />} />
              <Route path="/college/print-profile" element={<DashboardCollegePage />} />
              <Route path="/college/unlock-profile" element={<DashboardCollegePage />} />
              <Route path="/college/approval-status" element={<DashboardCollegePage />} />
              {/* College flag-based admission routes */}
              <Route path="/college/check-application-id" element={<CheckApplicationIdAdminPage />} />
              <Route path="/admission/cancel" element={<CancelAdmissionPage />} />
            </Route>
          </Route>

          {/* ── EVerification Admin (41) + EVC Coordinator (42) + Admins ───── */}
          <Route element={<ProtectedRoute allowedRoles={[11, 12, 41, 42]} />}>
            <Route element={<AuthLayout />}>
              <Route path="/everification/dashboard" element={<DashboardEVerificationPage />} />
              <Route path="/everification/candidates" element={<CandidateListPage />} />
              <Route path="/everification/verify/:candidateId" element={<VerifyDocumentsPage />} />
              <Route path="/everification/check-application-id" element={<EVCCheckApplicationIdPage />} />
            </Route>
          </Route>

          {/* ── University (93) + Admins ────────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={[11, 12, 93]} />}>
            <Route element={<AuthLayout />}>
              <Route path="/university/dashboard" element={<DashboardUniversityPage />} />
              <Route path="/university/spot-round/register" element={<SpotRoundRegistrationPage />} />
              <Route path="/university/spot-round/confirm" element={<SpotRoundConfirmAdmissionPage />} />
              <Route path="/university/spot-round/candidates" element={<RegisteredCandidatesPage />} />
              <Route path="/university/spot-round/allotment-letter" element={<SpotRoundAllotmentLetterPage />} />
            </Route>
          </Route>

          {/* ── Reports (Batch M) — Staff oversight ──────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={[11, 12, 61, 93]} />}>
            <Route element={<AuthLayout />}>
              <Route path="/reports" element={<ReportsListPage />} />
              <Route path="/reports/generate" element={<GenerateReportPage />} />
            </Route>
          </Route>

          {/* ── SuperAdmin (11) + Admin (12) ────────────────────────────────── */}
          <Route element={<ProtectedRoute allowedRoles={[11, 12]} />}>
            <Route element={<AuthLayout />}>
              {/* Dashboards */}
              <Route path="/super-admin/dashboard" element={<DashboardSuperAdminPage />} />
              <Route path="/admin/dashboard" element={<DashboardAdminPage />} />
              {/* Administration (Batch K) */}
              <Route path="/admin/notifications" element={<ManageNotificationsPage />} />
              <Route path="/admin/activity-status" element={<ManageActivityStatusPage />} />
              <Route path="/admin/admission-activity" element={<ManageAdmissionActivityStatusPage />} />
              <Route path="/admin/phases" element={<ManagePhasePage />} />
              <Route path="/admin/users" element={<ManageUsersPage />} />
              <Route path="/admin/users/add" element={<AddEditUserPage />} />
              <Route path="/admin/users/edit/:id" element={<AddEditUserPage />} />
              <Route path="/admin/profile" element={<EditProfilePage />} />
              <Route path="/admin/evc" element={<ManageEvcPage />} />
              <Route path="/admin/evc/:id" element={<EvcDetailsPage />} />
              <Route path="/admin/sub-evc" element={<ManageSubEvcPage />} />
              <Route path="/admin/sub-evc/:id" element={<SubEvcDetailsPage />} />
              <Route path="/admin/generate-passwords" element={<GeneratePasswordPage />} />
              <Route path="/admin/config" element={<ManageConfigPage />} />
              <Route path="/admin/reset-cache" element={<ResetCachePage />} />
              <Route path="/admin/manage-reports" element={<ManageReportsAdminPage />} />
              <Route path="/admin/app-settings" element={<CheckAppSettingsPage />} />
              {/* Helpdesk (Batch L) */}
              <Route path="/admin/search-candidate" element={<SearchCandidatePage />} />
              <Route path="/admin/check-application-id" element={<CheckApplicationIdAdminPage />} />
              <Route path="/admin/doc-verification-status" element={<DocumentVerificationStatusPage />} />
              <Route path="/admin/check-pgcet" element={<CheckPgcetPage />} />
              <Route path="/admin/reset-candidate-password" element={<ResetCandidatePasswordPage />} />
              {/* Fee administration */}
              <Route path="/fee/check-failed" element={<CheckFailedTransactionsPage />} />
              <Route path="/fee/refund" element={<RefundTransactionPage />} />
              <Route path="/fee/refund-duplicate" element={<RefundDuplicateTransactionsPage />} />
              <Route path="/fee/check-refund-status" element={<RefundTransactionPage />} />
              {/* Menu management (Batch N) */}
              <Route path="/admin/menus" element={<ManageMenusPage />} />
              <Route path="/admin/menu-groups" element={<ManageGroupsPage />} />
              <Route path="/admin/menu-links" element={<ManageLinksPage />} />
            </Route>
          </Route>

          {/* ── Error pages ─────────────────────────────────────────────────── */}
          <Route path={ERROR_ROUTES.accessDenied} element={<AccessDeniedPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path={ERROR_ROUTES.serverError} element={<InternalErrorPage />} />
          <Route path="/service-unavailable" element={<GeneralErrorPage />} />
          <Route path="*" element={<NotFoundPage />} />

        </Routes>
      </SuspenseWrapper>
    )
  }
