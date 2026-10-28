# AgriPHD 2026 — Project Instructions for AI Coding Sessions

This file provides context for any AI agent starting a new session on this project.

## Project Overview

Migration of **MCAER Pune's legacy ASP.NET Web Forms PhD Admissions Portal** to **React 18 + .NET Core 8**.

- **Legacy project**: `AgriPHD_2026/` — ASP.NET Web Forms, C#, SQL Server, SSRS reports
- **New project**: `AgriPHD_New/` — React 18 + TypeScript + Vite + .NET 8 API + Dapper + SQL Server

## Key Documentation

Read these four files at the start of every session:

| File | Purpose |
|---|---|
| `AgriPHD_2026/docs/TASKSHEET.md` | **Task checklist** — single source of truth for what's done and what's next |
| `AgriPHD_2026/docs/ARCHITECTURE.md` | Architecture decisions, folder structure, conventions |
| `AgriPHD_2026/docs/PRD.md` | Product requirements and acceptance criteria |
| `AgriPHD_2026/docs/IMPLEMENTATION_PLAN.md` | Phase sequencing and dependency map |

## Project Structure

```
AgriPHD_New/
├── AgriPhd.Api/          .NET 8 Web API (port 5255)
│   ├── Controllers/
│   ├── Repositories/
│   ├── Services/
│   ├── Helpers/          JwtHelper, PasswordHelper, OtpHelper, BlobStorageHelper, LegacyUrlMapper
│   └── Middleware/
├── agri-phd-web/         React 18 + TypeScript + Vite (port 5173)
│   ├── src/
│   │   ├── api/          axios clients
│   │   ├── pages/        candidate/, admin/, college/, everification/, university/
│   │   ├── components/   layout/, ui/, shared/
│   │   ├── hooks/        useMenu, useAuth, useMasterData
│   │   ├── store/        authStore (Zustand)
│   │   ├── router/       index.tsx, ProtectedRoute, routes.ts, LegacyUrlMapper
│   │   ├── schemas/      Zod validation schemas
│   │   └── utils/        categoryUtils.ts
│   └── src/__tests__/    Vitest unit tests
└── AgriPhd.Tests/        xUnit backend unit tests
```

## Database

- **Server**: `localhost\SQLEXPRESS`
- **Database**: `2025_AgriPHD_Live`
- **Auth**: Windows Integrated

## Critical Mappings (frequently wrong if forgotten)

### UserTypeID mapping (DB reality vs what was originally coded)
| DB UserTypeID | Role |
|---|---|
| 11 | Super Admin |
| 12 | Admin |
| 41 | EVC Admin |
| 42 | EVC Coordinator |
| 61 | College |
| 91 | Candidate |
| 93 | University |

### Menu URL mapping
All ASPX URLs from `Menu_GetMenu` SP are converted to React routes via `LegacyUrlMapper.cs`. If a menu item does nothing (navigates to `#`), the ASPX path is missing from the mapper.

## Running the Project

```powershell
# Start API
cd AgriPHD_New/AgriPhd.Api
dotnet run --no-build

# Start React
cd AgriPHD_New/agri-phd-web
npm run dev
```

Both must be running. React proxies `/api` to `http://localhost:5255`.

## Testing

```powershell
# Frontend tests (Vitest)
cd agri-phd-web && npx vitest --run

# Backend tests (xUnit)
cd AgriPhd.Tests && dotnet test
```

## Common Issues Fixed (don't repeat these)

1. **Menu returns only public items** → `MenuController` missing `[Authorize]`
2. **College/University get access denied** → UserTypeIDs are 61/93 not 21/41
3. **Menu links do nothing** → Add ASPX path to `LegacyUrlMapper.cs`
4. **Admission confirm fails** → SP needs `PHDCollegeCode` (e.g. 3025611), not internal `CollegeID`
5. **Marathi text garbled** → File saved with wrong encoding; rewrite with `fs_write`
6. **Double dropdown arrow** → `@tailwindcss/forms` global strategy; use `strategy: 'class'`
7. **Dashboard always highlighted** → Remove `startsWith` prefix matching in `AuthNavItem`
