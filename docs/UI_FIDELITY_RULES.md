
# UI_FIDELITY_RULES.md
# AgriPHD 2026 — UI Fidelity & Legacy Parity Rules

> ⚠️ **CLIENT DIRECTIVE — PHASE 6 THEME & DESIGN MODERNIZATION APPROVED**
>
> The client has requested a comprehensive theme and visual design modernization to make the portal attractive, cohesive, and worthy of a prestigious **Doctor of Philosophy (Ph.D.) Admissions Process Portal**.
>
> **Core Principle:** Improve aesthetics, color harmony, typography, and visual presentation everywhere **without altering any functionality, workflow, field order, or validation**.
> - Functional parity, step sequencing, SP bindings, and business logic remain strictly 1:1.
> - See `TASKSHEET.md` **Phase 6 — Professional UI/UX & Theme Modernization** for the detailed task breakdown (`P6-THEME-01` to `P6-THEME-19`).

---

## The Rule

**Every migrated page must preserve the legacy page's functional flow, sections, labels, field order,
and user workflow exactly, while applying the unified Phase 6 Professional Academic Theme.**

---

## What Is Allowed vs Not Allowed

### ✅ Allowed
- Tailwind CSS instead of Bootstrap (framework swap only)
- React components replacing server controls (same rendered output)
- Making pages responsive (mobile-first — was missing in legacy)
- Improving accessibility (ARIA labels — was missing in legacy)
- Using RHF + Zod instead of ASP.NET validators (same rules)

### ❌ NOT Allowed Without Explicit Client Approval
- Changing field order, section headings, or button labels
- Removing any section or widget present in legacy
- Adding new sections or features not in legacy
- Changing tab labels (e.g. "Brochure" not "News")
- Changing column headers in any table/grid
- Changing error message wording (use exact SP-returned messages)
- Changing card header text (use exact legacy heading strings)

---

## Shared Legacy CSS Classes (use these in ALL pages)

All values from `AgriPHD_2026/Admission.Web/App_Themes/default/style.css` default theme.
Defined in `agri-phd-web/src/index.css`.

| Class | Description | Key CSS values |
|---|---|---|
| `.l-card` | Card container | `box-shadow: 0px 4px 14px #3333334A; border-radius: 0.25rem` |
| `.l-card-header` | Card heading | `bg #9EC8B9; color #193857; font-weight 600; font-size 115%; padding 0.3rem 1rem` |
| `.l-card-header-sm` | Sub-section heading | `bg #9EC8B9; color #193857; font-weight 600; font-size 100%; padding 0.2rem 0.5rem` |
| `.l-card-body` | Card content | `padding: 1rem` |
| `.l-card-footer` | Card footer | `bg #F2EDE4` |
| `.btn-special` | Primary action button | `bg #D32F2F; color #fff; hover bg #B04203` |
| `.btn-success-legacy` | Secondary/search buttons | Bootstrap green `#198754` |
| `.control-label` | Form field label | `font-weight 500; padding-bottom 2px` |
| `.required` | Required asterisk | `color #CF0A0A; font-weight 600` |
| `.l-form-control` | Input/select fields | `border #ced4da; focus border #002060; border-radius 0.25rem` |
| `.input-group-addon` | Icon prefix on inputs | `bg #4682B4; color #fff; padding 0.575rem` |
| `.form-group` | Field wrapper | `margin-bottom 10px` |
| `.l-alert` | Alert box | `padding 10px; border-radius 5px` |
| `.l-alert-danger` | Error alert | Bootstrap danger colors |
| `.l-alert-success` | Success alert | Bootstrap success colors |
| `.grid-view` | Table/GridView | `th bg #C8B39E; border #c48c54; font-size 80%; padding 5px` |
| `.grid-view-top-header` | Dynamic filter headers in grid | `bg #DFDAB9; font-weight 600` |
| `.user-details` | Info row on dashboards | `border #F1EEE9; border-radius 5px; label bg #F1EEE9` |
| `.order-card` | Dashboard KPI card text | `color #fff` |
| `.bg-c-blue` | KPI card — blue gradient | `linear-gradient(45deg, #4099ff, #73b4ff)` |
| `.bg-c-green` | KPI card — green gradient | `linear-gradient(45deg, #2ed8b6, #59e0c5)` |
| `.bg-c-yellow` | KPI card — yellow gradient | `linear-gradient(45deg, #FFB64D, #ffcb80)` |
| `.bg-c-pink` | KPI card — pink gradient | `linear-gradient(45deg, #FF5370, #ff869a)` |

---

## Standard Inner-Page Card Pattern

Every inner page uses this exact structure:

```tsx
<div style={{ padding: '20px' }}>
  <div className="l-card">
    <div className="l-card-header">Page Title</div>
    <div className="l-card-body">
      {/* row layout with form-group fields */}
    </div>
  </div>
</div>
```

For sub-sections:
```tsx
<div className="l-card" style={{ marginBottom: '16px' }}>
  <div className="l-card-header l-card-header-sm">Sub-section Title</div>
  <div className="l-card-body">...</div>
</div>
```

---

## Legacy Color Quick Reference

| Element | Value |
|---|---|
| Body text | `#15133C` |
| Body font | `Verdana, Poppins, sans-serif; 14px; line-height 1.8` |
| Navbar bg | `#15133C` |
| Nav link hover bg | `#638889` |
| Card header bg | `#9EC8B9` |
| Card header color | `#193857` |
| btn-special bg | `#D32F2F` |
| btn-special hover | `#B04203` |
| btn-signup bg | `#04AA6D` |
| btn-signin bg | `#D9EEE1` |
| Announcement bar bg | `#fafaf2` |
| Tab normal bg | `#58c8a0` |
| Tab active bg | `#ebfceb` / color `#15133C` |
| Page-tab bg | `#fafaf2` |
| Grid th bg | `#C8B39E` |
| Grid border | `#c48c54` |
| Footer bg | `#373737` |
| Footer links | `#8DB9ED` |
| Required asterisk | `#CF0A0A` |
| Input focus border | `#002060` |
| input-group-addon | `#4682B4` |

---

## Backend Connectivity — Fixed Issues

**Discovered and fixed on 30-Sep-2026:**

| Issue | Was | Fixed To |
|---|---|---|
| Vite proxy port | `https://localhost:7001` | `https://localhost:7038` (from launchSettings.json) |
| DB connection string | `Server=localhost;Database=...` | `Data Source=localhost\SQLEXPRESS;Initial Catalog=2025_AgriPHD_Live;...` |
| CORS origins | Only `http://localhost:5173` | Added `https://localhost:5173` too |

**Files changed:**
- `agri-phd-web/vite.config.ts` — proxy target port
- `AgriPhd.Api/appsettings.Development.json` — DB connection string
- `AgriPhd.Api/Program.cs` — CORS origins array

**To start both projects:**
```powershell
# Terminal 1 — API
cd c:\ABS_Work\Project_.Net\PhD-admission-projects\AgriPHD_New\AgriPhd.Api
dotnet run --launch-profile https

# Terminal 2 — React
cd c:\ABS_Work\Project_.Net\PhD-admission-projects\AgriPHD_New\agri-phd-web
npm run dev
```
API available at: `https://localhost:7038/swagger`
React app at: `http://localhost:5173`

---

## Pages Redesigned to Match Legacy UI (30-Sep-2026)

| Page | Status | Key changes |
|---|---|---|
| `PublicLayout` | ✅ Fixed | White header (logo + 3 title lines), navbar bg `#15133C`, overlapping signup/login buttons, 3-column footer |
| `AuthLayout` | ✅ Fixed | Same header, user avatar dropdown (50px circle), sticky navbar, `min-height: 57vh` content area |
| `HomePage` | ✅ Fixed | Announcement bar (bg `#fafaf2`, btn-announcement `#58c8a0`), 4 tabs (Notifications/Brochure/Schedule/Downloads), tab colors `#58c8a0`/`#ebfceb` |
| `LoginPage` | ✅ Fixed | Card "Sign In", icon prefix inputs, eye toggle, `btn-special`, forgot-password link right-aligned, conditional register link |
| `NewRegistrationPage` | ✅ Fixed | Two sub-cards, grid for candidate lookup, 9 fields exact labels, Verify/Verified button, password rules note |
| `RegistrationSuccessPage` | ✅ Fixed | Card "User Login Details", green alert with LoginID, instructions list, Print + Proceed to Login buttons |
| `ForgotPasswordPage` | ✅ Fixed | Card "Options to Reset Password", radio table layout (3 options matching exact legacy labels) |
| `ResetBySecurityQuestionPage` | ✅ Fixed | Card heading, 3 fields with exact labels, `btn-special` "Proceed >>>" |
| `ResetByMobileOtpPage` | ✅ Fixed | Card "Reset Password using OTP", Login ID + Mobile No, OTP modal |
| `ResetByEmailOtpPage` | ✅ Fixed | Card "Reset Password using OTP", Login ID + Email ID, OTP modal |
| `ResetPasswordPage` | ✅ Fixed | Password rules danger alert, disabled Login ID + User Name, 2 password fields, "Change Password" btn |
| `AboutUsPage` | ✅ Fixed | Exact card heading + 2 legacy paragraphs |
| `SearchCollegePage` | ✅ Fixed | Filter card, dynamic header rows in grid, exact columns |
| `SearchAgriCollegePage` | ✅ Fixed | Faculty/University/Status filters, 8-column grid |
| `AllotmentListPage` | ✅ Fixed | Round/Faculty/College cascade, 8-column grid, "Get Allotment List" button |
| `UniversityVacancyPage` | ✅ Fixed | Red note text, University/Subject cascade, 3 grids side-by-side matching legacy layout |

---

## How to Check Legacy UI Before Implementing a Page

1. Find the legacy `.aspx` in `AgriPHD_2026/Admission.Web/`
2. Read the markup — note every Panel, GridView, Label, Button
3. Read the `.aspx.cs` code-behind — note every conditional show/hide
4. Use `.l-card` + `.l-card-header` for every page wrapper
5. Use `.l-form-control` for all inputs/selects
6. Use `.control-label` + `.required` for all form labels
7. Use `.btn-special` for primary actions, `.btn-success-legacy` for search/proceed
8. Use `.grid-view` for all tables with exact column headers from legacy
9. Match exact button text: "Search", "Proceed >>>", "Sign In", "Get Allotment List", etc.

---

## Tailwind ↔ Bootstrap Mapping

| Bootstrap (legacy) | New migration |
|---|---|
| `.card` | `.l-card` |
| `.card-header` | `.l-card-header` |
| `.card-body` | `.l-card-body` |
| `.btn.btn-special` | `.btn-special` |
| `.btn.btn-success` | `.btn-success-legacy` |
| `.form-control` | `.l-form-control` |
| `.control-label` | `.control-label` |
| `.alert.alert-danger` | `.l-alert.l-alert-danger` |
| `GridView` | `<table className="grid-view">` |
| `BoundField HeaderText="X"` | `<th>X</th>` |
| `.input-group-addon` | `.input-group-addon` |
