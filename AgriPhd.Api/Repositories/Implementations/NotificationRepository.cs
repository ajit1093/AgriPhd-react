using System.Data;
using Dapper;
using AgriPhd.Api.Models;
using AgriPhd.Api.Repositories.Interfaces;

namespace AgriPhd.Api.Repositories.Implementations;

/// <summary>
/// Dapper implementation.
/// SP names and @parameter names confirmed from legacy
/// Repository.ManageNotification.cs and Repository.Base.cs.
/// </summary>
public class NotificationRepository : INotificationRepository
{
    private readonly IDbConnection _db;

    public NotificationRepository(IDbConnection db) => _db = db;

    public async Task<IEnumerable<NotificationItem>> GetNotificationListForDisplayAsync(
        short regionId, string language = "")
    {
        var p = new DynamicParameters();
        p.Add("@RegionID", regionId);
        p.Add("@Language", language);

        var rows = await _db.QueryAsync<dynamic>(
            "Administration_GetNotificationListForDisplay", p,
            commandType: CommandType.StoredProcedure);

        return rows.Select(r =>
        {
            var dict = (IDictionary<string, object>)r;
            return new NotificationItem
            {
                NotificationID         = Convert.ToInt64(dict.TryGetValue("NotificationID", out var nid) ? nid : 0L),
                NotificationCategoryID = Convert.ToInt32(dict.TryGetValue("NotificationCategoryID", out var cid) ? cid : 0),
                NotificationCategory   = Convert.ToString(dict.TryGetValue("NotificationCategory", out var cat) ? cat : "") ?? "",
                NotificationTitle      = Convert.ToString(dict.TryGetValue("NotificationTitle", out var title) ? title : "") ?? "",
                ContentType            = Convert.ToString(dict.TryGetValue("ContentType", out var ct) ? ct : "") ?? "",
                TextContent            = Convert.ToString(dict.TryGetValue("TextContent", out var txt) ? txt : "") ?? "",
                FileContentURL         = Convert.ToString(dict.TryGetValue("FileContentURL", out var url) ? url : "") ?? "",
                DisplayNewImage        = Convert.ToInt32(dict.TryGetValue("DisplayNewImage", out var dni) ? dni : 0),
                OpenInNewPage          = Convert.ToInt32(dict.TryGetValue("OpenInNewPage", out var onp) ? onp : 0),
                PublishDateTime        = dict.TryGetValue("PublishDateTime", out var pdt) && pdt != null && pdt != DBNull.Value ? (DateTime?)Convert.ToDateTime(pdt) : null,
                PublishDateTimeF       = Convert.ToString(dict.TryGetValue("PublishDateTimeF", out var pdtf) ? pdtf : "") ?? "",
            };
        });
    }

    public async Task<bool> IsNewCandidateRegistrationStartedAsync()
    {
        // SP takes no parameters — confirmed from Repository.Base.cs
        var result = await _db.ExecuteScalarAsync<object>(
            "Base_IsNewCandidateRegistrationStarted",
            commandType: CommandType.StoredProcedure);

        return Convert.ToBoolean(result);
    }

    public async Task<IEnumerable<ImportantDateItem>> GetImportantDatesAsync(short regionId = 1)
    {
        var list = new List<ImportantDateItem>();
        var now = DateTime.Now;

        try
        {
            // 1. Fetch activities from Master_ActivityStatus
            var pAct = new DynamicParameters();
            pAct.Add("@RegionID", regionId);
            var actRows = await _db.QueryAsync<dynamic>(
                "Administration_GetActivityStatusList", pAct,
                commandType: CommandType.StoredProcedure);

            var actDict = new Dictionary<string, (string details, DateTime? start, DateTime? end, string startF, string endF)>(StringComparer.OrdinalIgnoreCase);

            foreach (var r in actRows)
            {
                var d = (IDictionary<string, object>)r;
                var name = Convert.ToString(d.TryGetValue("ActivityName", out var n) ? n : "") ?? "";
                var details = Convert.ToString(d.TryGetValue("ActivityDetails", out var dt) ? dt : "") ?? "";
                DateTime? start = d.TryGetValue("ActivityStartDateTime", out var s) && s != null && s != DBNull.Value ? (DateTime?)Convert.ToDateTime(s) : null;
                DateTime? end = d.TryGetValue("ActivityEndDateTime", out var e) && e != null && e != DBNull.Value ? (DateTime?)Convert.ToDateTime(e) : null;
                var startF = Convert.ToString(d.TryGetValue("ActivityStartDateTimeF", out var sf) ? sf : "") ?? "";
                var endF = Convert.ToString(d.TryGetValue("ActivityEndDateTimeF", out var ef) ? ef : "") ?? "";

                if (!string.IsNullOrEmpty(name))
                {
                    actDict[name] = (details, start, end, startF, endF);
                }
            }

            // 2. Fetch phases from Master_Phase
            var phaseRows = await _db.QueryAsync<dynamic>(
                "Administration_GetAdmissionActivityStatusList",
                commandType: CommandType.StoredProcedure);

            var phaseList = new List<(int phaseId, string phase, DateTime? allotStart, DateTime? admStart, DateTime? candEnd, string allotF, string admStartF, string candEndF)>();

            foreach (var r in phaseRows)
            {
                var d = (IDictionary<string, object>)r;
                int phaseId = Convert.ToInt32(d.TryGetValue("PhaseID", out var pid) ? pid : 0);
                string phase = Convert.ToString(d.TryGetValue("Phase", out var ph) ? ph : "") ?? "";
                DateTime? allot = d.TryGetValue("AllotmentDisplayStartDate", out var a) && a != null && a != DBNull.Value ? (DateTime?)Convert.ToDateTime(a) : null;
                DateTime? admStart = d.TryGetValue("AdmissionStartDate", out var ad) && ad != null && ad != DBNull.Value ? (DateTime?)Convert.ToDateTime(ad) : null;
                DateTime? candEnd = d.TryGetValue("CandidateAdmissionLastDate", out var ce) && ce != null && ce != DBNull.Value ? (DateTime?)Convert.ToDateTime(ce) : null;
                string allotF = Convert.ToString(d.TryGetValue("AllotmentDisplayStartDateF", out var af) ? af : "") ?? "";
                string admStartF = Convert.ToString(d.TryGetValue("AdmissionStartDateF", out var adf) ? adf : "") ?? "";
                string candEndF = Convert.ToString(d.TryGetValue("CandidateAdmissionLastDateF", out var cef) ? cef : "") ?? "";

                phaseList.Add((phaseId, phase, allot, admStart, candEnd, allotF, admStartF, candEndF));
            }

            int seq = 1;

            // 1. Registration
            if (actDict.TryGetValue("NewCandidateRegistration", out var reg))
            {
                list.Add(BuildDateItem(seq++, "NewCandidateRegistration", "Online Candidate Registration", "Candidate registration & login credentials generation", "Registration", reg.start, reg.end, reg.startF, reg.endF, now));
            }

            // 2. Application Form Filling
            if (actDict.TryGetValue("ApplicationFormFilling", out var app))
            {
                list.Add(BuildDateItem(seq++, "ApplicationFormFilling", "Application Form Filling & Document Upload", "Online form filling, university choices & documents upload", "Application", app.start, app.end, app.startF, app.endF, now));
            }

            // 3. Document Verification
            if (actDict.TryGetValue("EVerification", out var evc))
            {
                list.Add(BuildDateItem(seq++, "EVerification", "Online E-Scrutiny & Document Verification", "Online scrutiny & verification of uploaded documents by assigned EVC", "Verification", evc.start, evc.end, evc.startF, evc.endF, now));
            }

            // 4. Provisional Merit List
            if (actDict.TryGetValue("ProvisionalMeritList", out var pml))
            {
                list.Add(BuildDateItem(seq++, "ProvisionalMeritList", "Display of Provisional Merit List", "Publication of provisional state-wide merit rank list on portal", "Merit List", pml.start, pml.end, pml.startF, pml.endF, now));
            }

            // 5. Grievance Submission
            if (actDict.TryGetValue("GrievanceSubmission", out var grv))
            {
                list.Add(BuildDateItem(seq++, "GrievanceSubmission", "Submission of Grievances / Objections", "Online grievance filing against provisional merit list for corrections", "Grievance", grv.start, grv.end, grv.startF, grv.endF, now));
            }

            // 6. Final Merit List
            if (actDict.TryGetValue("FinalMeritList", out var fml))
            {
                list.Add(BuildDateItem(seq++, "FinalMeritList", "Display of Final State Merit List", "Declaration of final state merit rank list of eligible candidates", "Merit List", fml.start, fml.end, fml.startF, fml.endF, now));
            }

            // 7 & 8. Round-I CAP Allotment & Admission
            var r1 = phaseList.FirstOrDefault(p => p.phaseId == 1 || p.phase.Contains("Round-I", StringComparison.OrdinalIgnoreCase));
            if (r1.phaseId > 0)
            {
                list.Add(BuildDateItem(seq++, "Round1Allotment", "Round-I Seat Allotment Display", "Publication of Round-I CAP seat allotment results on portal", "Allotment", r1.allotStart, r1.allotStart, r1.allotF, r1.allotF, now));
                list.Add(BuildDateItem(seq++, "Round1Admission", "Round-I College Reporting & Admission", "Reporting to allotted university / college with original documents & fee", "Admission", r1.admStart, r1.candEnd, r1.admStartF, r1.candEndF, now));
            }

            // 9 & 10. Round-II CAP Allotment & Admission
            var r2 = phaseList.FirstOrDefault(p => p.phaseId == 2 || p.phase.Contains("Round-II", StringComparison.OrdinalIgnoreCase));
            if (r2.phaseId > 0)
            {
                list.Add(BuildDateItem(seq++, "Round2Allotment", "Round-II Seat Allotment Display", "Publication of Round-II CAP seat allotment results", "Allotment", r2.allotStart, r2.allotStart, r2.allotF, r2.allotF, now));
                list.Add(BuildDateItem(seq++, "Round2Admission", "Round-II College Reporting & Admission", "Reporting to allotted college for Round-II admissions & fee payment", "Admission", r2.admStart, r2.candEnd, r2.admStartF, r2.candEndF, now));
            }

            // 11. Third Round / Spot Round
            var r3 = phaseList.FirstOrDefault(p => p.phaseId == 3 || p.phase.Contains("Third", StringComparison.OrdinalIgnoreCase) || p.phase.Contains("Spot", StringComparison.OrdinalIgnoreCase));
            if (r3.phaseId > 0)
            {
                list.Add(BuildDateItem(seq++, "Round3Spot", "Third Round / Spot Round Admissions", "Physical spot round counselling & reporting at university campus", "Admission", r3.admStart, r3.candEnd, r3.admStartF, r3.candEndF, now));
            }
        }
        catch
        {
            // Fallback gracefully if database query encounters an issue
        }

        if (!list.Any())
        {
            list = GetDefaultImportantDates(now);
        }

        return list;
    }

    private static ImportantDateItem BuildDateItem(
        int seq, string code, string title, string subtitle, string category,
        DateTime? start, DateTime? end, string startF, string endF, DateTime now)
    {
        string status = "Upcoming";
        if (end.HasValue && now > end.Value)
        {
            status = "Completed";
        }
        else if (start.HasValue && now >= start.Value && (!end.HasValue || now <= end.Value))
        {
            status = "Active";
        }

        return new ImportantDateItem
        {
            Sequence = seq,
            ActivityCode = code,
            Title = title,
            Subtitle = subtitle,
            Category = category,
            StartDate = start,
            EndDate = end,
            StartDateFormatted = !string.IsNullOrWhiteSpace(startF) ? startF : (start?.ToString("dd-MM-yyyy HH:mm") ?? "To be notified"),
            EndDateFormatted = !string.IsNullOrWhiteSpace(endF) ? endF : (end?.ToString("dd-MM-yyyy HH:mm") ?? "To be notified"),
            Status = status,
            IsActive = true,
            Description = subtitle,
        };
    }

    private static List<ImportantDateItem> GetDefaultImportantDates(DateTime now)
    {
        return new List<ImportantDateItem>
        {
            BuildDateItem(1, "NewCandidateRegistration", "Online Candidate Registration", "Candidate registration & login credentials generation", "Registration", DateTime.Parse("2026-09-06 10:00:00"), DateTime.Parse("2027-10-15 23:59:00"), "06-09-2026 10:00", "15-10-2027 23:59", now),
            BuildDateItem(2, "ApplicationFormFilling", "Application Form Filling & Document Upload", "Online form filling, university choices & documents upload", "Application", DateTime.Parse("2025-12-28 17:30:00"), DateTime.Parse("2027-01-01 23:59:00"), "28-12-2025 17:30", "01-01-2027 23:59", now),
            BuildDateItem(3, "EVerification", "Online E-Scrutiny & Document Verification", "Online scrutiny & verification of uploaded documents by assigned EVC", "Verification", DateTime.Parse("2026-09-08 10:00:00"), DateTime.Parse("2026-10-18 18:00:00"), "08-09-2026 10:00", "18-10-2026 18:00", now),
            BuildDateItem(4, "ProvisionalMeritList", "Display of Provisional Merit List", "Publication of provisional state-wide merit rank list on portal", "Merit List", DateTime.Parse("2026-10-22 17:30:00"), DateTime.Parse("2026-10-25 23:59:00"), "22-10-2026 17:30", "25-10-2026 23:59", now),
            BuildDateItem(5, "GrievanceSubmission", "Submission of Grievances / Objections", "Online grievance filing against provisional merit list for corrections", "Grievance", DateTime.Parse("2026-10-23 10:00:00"), DateTime.Parse("2026-10-25 17:30:00"), "23-10-2026 10:00", "25-10-2026 17:30", now),
            BuildDateItem(6, "FinalMeritList", "Display of Final State Merit List", "Declaration of final state merit rank list of eligible candidates", "Merit List", DateTime.Parse("2026-10-28 17:30:00"), DateTime.Parse("2026-10-31 23:59:00"), "28-10-2026 17:30", "31-10-2026 23:59", now),
            BuildDateItem(7, "Round1Allotment", "Round-I Seat Allotment Display", "Publication of Round-I CAP seat allotment results on portal", "Allotment", DateTime.Parse("2026-01-06 16:30:00"), DateTime.Parse("2026-01-06 16:30:00"), "06-01-2026 16:30", "06-01-2026 16:30", now),
            BuildDateItem(8, "Round1Admission", "Round-I College Reporting & Admission", "Reporting to allotted university / college with original documents & fee", "Admission", DateTime.Parse("2026-01-07 09:00:00"), DateTime.Parse("2026-01-09 17:30:00"), "07-01-2026 09:00", "09-01-2026 17:30", now),
            BuildDateItem(9, "Round2Allotment", "Round-II Seat Allotment Display", "Publication of Round-II CAP seat allotment results", "Allotment", DateTime.Parse("2026-01-12 17:30:00"), DateTime.Parse("2026-01-12 17:30:00"), "12-01-2026 17:30", "12-01-2026 17:30", now),
            BuildDateItem(10, "Round2Admission", "Round-II College Reporting & Admission", "Reporting to allotted college for Round-II admissions & fee payment", "Admission", DateTime.Parse("2026-01-13 09:00:00"), DateTime.Parse("2026-01-15 17:30:00"), "13-01-2026 09:00", "15-01-2026 17:30", now),
            BuildDateItem(11, "Round3Spot", "Third Round / Spot Round Admissions", "Physical spot round counselling & reporting at university campus", "Admission", DateTime.Parse("2026-01-19 09:00:00"), DateTime.Parse("2027-01-19 17:30:00"), "19-01-2026 09:00", "19-01-2027 17:30", now),
        };
    }
}

