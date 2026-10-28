namespace AgriPhd.Api.Helpers;

/// <summary>
/// Maps legacy ASPX page URLs (returned by Menu_GetMenu SP) to React SPA routes.
/// IMPORTANT: Every value here must exactly match a Route path in router/index.tsx.
/// </summary>
public static class LegacyUrlMapper
{
    private static readonly Dictionary<string, string> _map = new(StringComparer.OrdinalIgnoreCase)
    {
        // ── Candidate wizard steps (TypeID=91) ────────────────────────────────
        ["Candidate/Personal.aspx"]                             = "/candidate/application-form/personal",
        ["Candidate/Address.aspx"]                              = "/candidate/application-form/address",
        ["Candidate/CategoryAndOtherReservation.aspx"]          = "/candidate/application-form/category",
        ["Candidate/Qualification.aspx"]                        = "/candidate/application-form/qualification",
        ["Candidate/ApplicationFormResearchPaper.aspx"]         = "/candidate/application-form/research-paper",
        ["Candidate/ShortListOptions.aspx"]                     = "/candidate/application-form/shortlist",
        ["Candidate/SetPreferences.aspx"]                       = "/candidate/application-form/shortlist",
        ["Candidate/UploadPhotoAndSign.aspx"]                   = "/candidate/application-form/photo-sign",
        ["Candidate/UploadRequiredDocuments.aspx"]              = "/candidate/application-form/documents",
        ["Candidate/PayApplicationFee.aspx"]                    = "/candidate/application-form/pay-fee",
        ["Candidate/ApplicationFormSummary.aspx"]               = "/candidate/application-form/summary",
        ["Candidate/ApplicationForm.aspx"]                      = "/candidate/application-form/print",

        // ── Candidate OptionForm aliases ──────────────────────────────────────
        ["OptionForm/ShortListOptions.aspx"]                    = "/candidate/application-form/shortlist",
        ["OptionForm/SetPreferences.aspx"]                      = "/candidate/application-form/shortlist",
        ["OptionForm/OptionFormSummary.aspx"]                   = "/candidate/application-form/summary",
        ["OptionForm/OptionForm.aspx"]                          = "/candidate/application-form/print",
        ["OptionForm/OptionFormUnlock.aspx"]                    = "/candidate/unlock-form",
        ["OptionForm/ApplicationFormSummary.aspx"]              = "/candidate/application-form/summary",
        ["OptionForm/PayCounsellingFee.aspx"]                   = "/candidate/application-form/pay-fee",

        // ── Candidate self-service → role-neutral /account/... paths ──────────
        ["Candidate/ChangePassword.aspx"]                       = "/account/change-password",
        ["Candidate/ChangeSecurityQuestion.aspx"]               = "/account/change-security-question",
        ["Candidate/ChangeMobileEMail.aspx"]                    = "/account/change-mobile-email",

        // ── Candidate admission ────────────────────────────────────────────────
        ["Admission/CheckAllotmentStatus.aspx"]                 = "/admission/allotment-status",
        ["Admission/AllotmentSummary.aspx"]                     = "/admission/allotment-summary",
        ["Admission/DownloadAllotmentLetterRoundWise.aspx"]     = "/admission/allotment-letter",
        ["Admission/AllotmentLetter.aspx"]                      = "/admission/allotment-letter",
        ["Admission/AdmissionLetter.aspx"]                      = "/admission/letter",

        // ── Fee ───────────────────────────────────────────────────────────────
        ["Fee/PaymentHistory.aspx"]                             = "/fee/history",
        ["Fee/CheckFailedTransactions.aspx"]                    = "/fee/check-failed",
        ["Fee/RefundDuplicateTransactions.aspx"]                = "/fee/refund-duplicate",
        ["Fee/CheckRefundStatus.aspx"]                          = "/fee/check-refund-status",

        // ── Administration (TypeID=11/12) ─────────────────────────────────────
        ["Administration/ManageNotifications.aspx"]             = "/admin/notifications",
        ["Administration/ManageActivityStatus.aspx"]            = "/admin/activity-status",
        ["Administration/ManageAdmissionActivityStatus.aspx"]   = "/admin/admission-activity",
        ["Administration/ManageAdmissionSchedule.aspx"]         = "/admin/admission-activity",
        ["Administration/ManagePhase.aspx"]                     = "/admin/phases",
        ["Administration/ManageUsers.aspx"]                     = "/admin/users",
        ["Administration/AddEditUsers.aspx"]                    = "/admin/users/add",
        ["Administration/EditUserProfile.aspx"]                 = "/admin/profile",
        ["Administration/ManageEVC.aspx"]                       = "/admin/evc",
        ["Administration/ManageSubEVC.aspx"]                    = "/admin/sub-evc",
        ["Administration/GeneratePassword.aspx"]                = "/admin/generate-passwords",
        ["Administration/ManageProjectConfiguration.aspx"]      = "/admin/config",
        ["Administration/ResetApplicationVariables.aspx"]       = "/admin/reset-cache",
        ["Administration/ManageReports.aspx"]                   = "/admin/manage-reports",
        ["Administration/CheckAppSettings.aspx"]                = "/admin/app-settings",

        // ── Menu Management ───────────────────────────────────────────────────
        ["Menu/MenuHome.aspx"]                                  = "/admin/menus",
        ["Menu/ManageMenus.aspx"]                               = "/admin/menus",
        ["Menu/ManageGroups.aspx"]                              = "/admin/menu-groups",
        ["Menu/ManageLinks.aspx"]                               = "/admin/menu-links",

        // ── College Establishment pages (TypeID=61) ───────────────────────────
        ["Establishment/Profile.aspx"]                          = "/college/profile",
        ["Establishment/Address.aspx"]                          = "/college/address",
        ["Establishment/AuthorizedRepresentative.aspx"]         = "/college/authorized-rep",
        ["Establishment/Bank.aspx"]                             = "/college/bank",
        ["Establishment/Registration.aspx"]                     = "/college/registration",
        ["Establishment/Employee.aspx"]                         = "/college/employees",
        ["Establishment/SelfDeclaration.aspx"]                  = "/college/self-declaration",
        ["Establishment/RequestForInspection.aspx"]             = "/college/request-inspection",
        ["Establishment/ApplicationForm.aspx"]                  = "/college/print-profile",
        ["Establishment/UnlockApplicationForm.aspx"]            = "/college/unlock-profile",
        ["Establishment/CheckApprovalStatus.aspx"]              = "/college/approval-status",

        // ── Sanstha (college roster/advertise) — placeholder for now ─────────
        ["Sanstha/SansthaRoster.aspx"]                          = "/college/dashboard",
        ["Sanstha/SendRosterForVerfication.aspx"]               = "/college/dashboard",
        ["Sanstha/ApprovedRoster.aspx"]                         = "/college/dashboard",
        ["Sanstha/Advertisement.aspx"]                          = "/college/dashboard",
        ["Sanstha/SendAdvertisementForVerification.aspx"]       = "/college/dashboard",
        ["Sanstha/SelfCertificate.aspx"]                        = "/college/dashboard",

        // ── College — CheckApplicationID flag-based (mapped to /college/...) ──
        ["Admission/CheckApplicationID.aspx"]                   = "/college/check-application-id",
        ["College/CollegeList.aspx"]                            = "/college/list",
        ["College/EditCollegeDetails.aspx"]                     = "/college/edit",
        ["College/GetCollegePassword.aspx"]                     = "/college/get-password",
        ["College/ResetCollegePassword.aspx"]                   = "/college/reset-password",
        ["College/CollegeSummary.aspx"]                         = "/college/summary",

        // ── Admin CAPAdmission (uses same check-application-id page) ─────────
        ["CAPAdmission/CheckApplicationID.aspx"]                = "/admin/check-application-id",
        ["CAPAdmission/RequestedForForcedAdmissionCancellationList.aspx"] = "/admission/allotment-status",
        ["Admission/AdmissionAllotedStudent.aspx"]              = "/college/allotted-students",

        // ── Admin admission letters ───────────────────────────────────────────
        ["Admission/RejectionLetter.aspx"]                      = "/admission/rejection-letter",
        ["Admission/CancellationLetter.aspx"]                   = "/admission/cancellation-letter",

        // ── Admin helpdesk ────────────────────────────────────────────────────
        ["Admin/SearchCandidate.aspx"]                          = "/admin/search-candidate",
        ["Admin/CheckApplicationID.aspx"]                       = "/admin/check-application-id",
        ["Admin/CheckPGCETApplicationNo.aspx"]                  = "/admin/check-pgcet",
        ["GuidanceCenter/CheckApplicationID.aspx"]              = "/admin/check-application-id",
        ["BTRI/EstablishmentSearch.aspx"]                       = "/admin/dashboard",

        // ── Reports ───────────────────────────────────────────────────────────
        ["Reports/ReportsList.aspx"]                            = "/reports",
        ["Reports/AllotmentReport.aspx"]                        = "/reports/generate?report=allotment",
        ["Reports/AllotmentReportByCollege.aspx"]               = "/reports/generate?report=allotment-by-college",
        ["Reports/AllotmentReportByCourse.aspx"]                = "/reports/generate?report=allotment-by-course",
        ["Reports/CompositeAdmissionReport.aspx"]               = "/reports/generate?report=composite-admission",
        ["Reports/CompositeAdmissionReportByCollege.aspx"]      = "/reports/generate?report=composite-by-college",
        ["Reports/CompositeAdmissionReportByCourse.aspx"]       = "/reports/generate?report=composite-by-course",
        ["Reports/GenerateReport.aspx"]                         = "/reports/generate",
        ["Reports/CandidatesEligibleForEVerification.aspx"]     = "/reports/generate?report=eligible-for-everification",
        ["Reports/EVCWiseReport.aspx"]                          = "/reports/generate?report=evc-summary",
        ["Reports/EVCWiseCandidateList.aspx"]                   = "/reports/generate?report=evc-candidate-list",

        // ── EVerification (TypeID=41/42) ──────────────────────────────────────
        ["EVerification/CandidateListForEVerification.aspx"]    = "/everification/candidates",
        ["EVerification/EVerifyDocuments.aspx"]                 = "/everification/candidates",
        ["EVerification/CheckApplicationID.aspx"]               = "/everification/check-application-id",

        // ── University (TypeID=93) ────────────────────────────────────────────
        ["University/UniversityRegistration.aspx"]              = "/university/spot-round/register",
        ["University/UniversityConfirmAdmission.aspx"]          = "/university/spot-round/confirm",
        ["University/UniversityRegisteredCandidates.aspx"]      = "/university/spot-round/candidates",
        ["University/SpotRoundAllotmentLetter.aspx"]            = "/university/spot-round/allotment-letter",

        // ── Print ─────────────────────────────────────────────────────────────
        ["Public/PrintApplicationForm.aspx"]                    = "/print-application",
    };

    public static string ToReactRoute(string legacyUrl)
    {
        if (string.IsNullOrWhiteSpace(legacyUrl) || legacyUrl == "#")
            return "#";

        if (legacyUrl.StartsWith('/'))
            return legacyUrl;

        var cleaned = legacyUrl.TrimStart('.', '/').TrimStart('/');

        // Extract query string — needed for Flag-based routes
        string? queryString = null;
        var qIndex = cleaned.IndexOf('?');
        if (qIndex >= 0)
        {
            queryString = cleaned[(qIndex + 1)..];
            cleaned = cleaned[..qIndex];
        }

        if (!_map.TryGetValue(cleaned, out var react))
            return "#";

        // Append flag as query param for flag-based routes
        if (!string.IsNullOrEmpty(queryString))
        {
            var flagMatch = System.Text.RegularExpressions.Regex.Match(queryString, @"Flag=(\w+)");
            if (flagMatch.Success)
                return $"{react}?flag={flagMatch.Groups[1].Value.ToLowerInvariant()}";
        }

        return react;
    }
}
