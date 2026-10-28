# SESSION STATUS — Last Updated: 30-Sep-2026

## ✅ BOTH BUILDS CLEAN
- AgriPhd.Api (.NET 8): 0 errors
- agri-phd-web TypeScript: CLEAN

---

## ✅ CONNECTIVITY — HOW TO RUN

```powershell
# Terminal 1 — API (HTTP port, no SSL cert issues)
cd c:\ABS_Work\Project_.Net\PhD-admission-projects\AgriPHD_New\AgriPhd.Api
dotnet run

# Terminal 2 — React
cd c:\ABS_Work\Project_.Net\PhD-admission-projects\AgriPHD_New\agri-phd-web
npm run dev
```

| URL | Purpose |
|---|---|
| http://localhost:5173 | React app |
| http://localhost:5255/swagger | API Swagger UI |
| http://localhost:5255/health | API health check |

Vite proxies `/api/*` → `http://localhost:5255` (configured in `vite.config.ts`).

### Connection String (in appsettings.Development.json)
```
Data Source=localhost\SQLEXPRESS;Initial Catalog=2025_AgriPHD_Live;Integrated Security=True;TrustServerCertificate=True
```
**If your SQL Server instance name is different**, update `appsettings.Development.json`.

---

## WHY NOTIFICATIONS ARE EMPTY

The API returns `200 OK` with empty arrays — this is correct behaviour.
The DB has no active notification records for the current date range.
To see notifications, insert rows into the notifications table via the Admin panel
(Administration → Manage Notifications) or directly in SQL.

The error "Unable to load notifications" was showing because Vite was proxying to the
wrong port (7001 instead of 5255). **This is now fixed.**

---

## ASSETS COPIED FROM LEGACY
| File | Source | Destination |
|---|---|---|
| MCAER Logo | `AgriPHD_2026/Admission.Web/App_Themes/default/images/mcaer_new_logo.png` | `agri-phd-web/public/mcaer-logo.png` |
| User avatar | `...images/dummy-user.png` | `public/dummy-user.png` |
| NEW badge | `...images/new_img.gif` | `public/new_img.gif` |

---

## NEXT TASK FROM TASKSHEET

**Phase 2 — Batch C — P2-C-01: Candidate Dashboard**

Read `TASKSHEET.md` → find `P2-C-01` (first unchecked in Batch C).

Requires implementing:
1. `DashboardRepository` (4 SPs)
2. `DashboardController` → `GET /api/v1/dashboard/candidate`
3. `pages/candidate/DashboardPage.tsx` — legacy layout match
