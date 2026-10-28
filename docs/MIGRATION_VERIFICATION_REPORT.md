# Database Migration & Dynamic Provider Verification Report

> **Date:** October 28, 2026  
> **Source Database:** SQL Server `2025_AgriPHD_Live` (localhost\SQLEXPRESS)  
> **Target Database:** PostgreSQL 16 Alpine running in Docker (`agriphd-postgres`)  
> **Application:** .NET 8 Web API (`AgriPhd.Api`) + React 18 Web App (`agri-phd-web`)

---

## 1. Executive Summary

The database migration from Microsoft SQL Server to Dockerized PostgreSQL has been completed successfully with **100% data integrity** and **zero data loss**. In addition, `AgriPhd.Api` now features **Dynamic Multi-Provider Database Support**, enabling on-the-fly switching between SQL Server and PostgreSQL simply by changing a configuration toggle in `appsettings.json`.

---

## 2. Docker Infrastructure

A containerized database environment was deployed via [`docker-compose.db.yml`](file:///c:/ABS_Work/Project_.Net/PhD-admission-projects/AgriPHD_New/docker-compose.db.yml):

| Service | Container Name | Image | Port | Status | Purpose |
|---|---|---|---|---|---|
| **PostgreSQL** | `agriphd-postgres` | `postgres:16-alpine` | `5432:5432` | Healthy (Up) | Primary PostgreSQL Database (`agri_phd_live`) |
| **Adminer** | `agriphd-adminer` | `adminer:latest` | `8085:8080` | Running (Up) | Web UI for database inspection at http://localhost:8085 |

**Persistent Storage:** Named Docker volume `agriphd_pgdata` guarantees data persists across container and computer restarts.

---

## 3. Schema & Data Migration Results

An automated, high-speed binary streaming migration utility was created in [`tools/AgriPhd.Migrator`](file:///c:/ABS_Work/Project_.Net/PhD-admission-projects/AgriPHD_New/tools/AgriPhd.Migrator):
- **Total Tables Attempted:** 222 tables
- **Successful:** 222 tables (100%)
- **Failed:** 0 tables
- **Total Rows Migrated:** 219,044 rows
- **Elapsed Migration Time:** 44.69 seconds
- **Identity Sequences Synchronized:** 62 sequences reset to `MAX(column_value) + 1`

### Key Sample Tables Verified:
| Table Name | SQL Server Rows | PostgreSQL Rows | Status |
|---|---|---|---|
| `ApplicationForm_Status_History` | 13,302 | 13,302 | Matched (100%) |
| `Allocation_SeatDistribution` | 9,600 | 9,600 | Matched (100%) |
| `Allocation_SeatDistribution_Round1` | 9,600 | 9,600 | Matched (100%) |
| `Log_LoginDetails` | 6,049 | 6,049 | Matched (100%) |
| `Master_CandidateResult` | 623 | 623 | Matched (100%) |
| `Master_District` | 611 | 611 | Matched (100%) |
| `Master_Taluka` | 364 | 364 | Matched (100%) |
| `Master_User` | 383 | 383 | Matched (100%) |
| `Menu_MasterMenus` | 332 | 332 | Matched (100%) |
| `Menu_MasterLinks` | 217 | 217 | Matched (100%) |
| `Master_College` | 17 | 17 | Matched (100%) |
| `Master_Category` | 14 | 14 | Matched (100%) |

---

## 4. Stored Procedures & Functions Porting

Key routines were ported to PostgreSQL PL/pgSQL in [`tools/migration/sql/01_core_functions_and_procedures.sql`](file:///c:/ABS_Work/Project_.Net/PhD-admission-projects/AgriPHD_New/tools/migration/sql/01_core_functions_and_procedures.sql):
1. `fngetistdatetime()`: Computes IST (+05:30) timestamp matching legacy SQL Server behavior.
2. `account_checkuserexists`: Candidate and Admin authentication, session creation in `log_logindetails`, and permission verification.
3. `account_getuserpassword`: Retrieves stored password hash for authentication.
4. `account_getloggedinuserdetails`: Fetches profile details for authenticated sessions.
5. `account_updateloginstatus` & `account_updatelogoutstatus`: Session management.
6. `account_iscurrentloginvalid`: Session validation check.
7. `account_resetpassword`: Password upgrade and historical audit logging.
8. `menu_getmenu`: Dynamic role-based menu generator (supports English and Marathi, Phase filtering, and candidate form lock status).
9. `menu_getmenuslist`, `menu_getlinkslist`, `menu_getgroupslist`: Administrative menu management.
10. `base_getmastertablelist`: Generic dynamic dropdown loader.
11. `base_getmastercollege`: College list filtered by faculty ID.

---

## 5. Dynamic Provider Architecture in `AgriPhd.Api`

### 5.1 Architecture Details
- **Provider Enum:** `DatabaseProvider.SqlServer` or `DatabaseProvider.PostgreSql` in [`DatabaseProvider.cs`](file:///c:/ABS_Work/Project_.Net/PhD-admission-projects/AgriPHD_New/AgriPhd.Api/Data/DatabaseProvider.cs).
- **Dynamic Adapter:** [`PostgreSqlDynamicConnection.cs`](file:///c:/ABS_Work/Project_.Net/PhD-admission-projects/AgriPHD_New/AgriPhd.Api/Data/PostgreSqlDynamicConnection.cs):
  - Wraps `NpgsqlConnection` and translates `CommandType.StoredProcedure` to PostgreSQL function calls (`SELECT * FROM func(@param1, @param2)`).
  - Uses `PostgreSqlDynamicDataReader` to ensure case-insensitive column mapping matching legacy Dapper POCO and dynamic objects.
- **Dependency Injection:** [`DatabaseExtensions.cs`](file:///c:/ABS_Work/Project_.Net/PhD-admission-projects/AgriPHD_New/AgriPhd.Api/Extensions/DatabaseExtensions.cs) inspects configuration and registers the appropriate scoped `IDbConnection`.

### 5.2 How to Switch Database Providers
In [`AgriPhd.Api/appsettings.Development.json`](file:///c:/ABS_Work/Project_.Net/PhD-admission-projects/AgriPHD_New/AgriPhd.Api/appsettings.Development.json):
```json
{
  "DatabaseProvider": "PostgreSql", // Change to "SqlServer" at any time to switch back!
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=agri_phd_live;Username=postgres;Password=postgres_dev_password_2026;Include Error Detail=true;",
    "SqlServerConnection": "Data Source=localhost\\SQLEXPRESS;Initial Catalog=2025_AgriPHD_Live;Integrated Security=True;Connection Timeout=30;TrustServerCertificate=True",
    "PostgreSqlConnection": "Host=localhost;Port=5432;Database=agri_phd_live;Username=postgres;Password=postgres_dev_password_2026;Include Error Detail=true;"
  }
}
```

---

## 6. End-to-End Test & Verification Summary

| Test Area | Details / Output | Result |
|---|---|---|
| **Health Check API** | `GET http://localhost:5255/health` returns `status: ok`, `databaseProvider: PostgreSql` | PASSED |
| **Dropdown Master API** | `GET /api/v1/master/gender` returns 3 items (M, F, O) | PASSED |
| **Category Master API** | `GET /api/v1/master/category` returns 11 reservation categories (EWS, OBC, SC, ST, etc.) | PASSED |
| **Candidate Login API** | `POST /api/v1/auth/login` with user `252000008` authenticated against PostgreSQL and returned JWT session | PASSED |
| **Admin Login API** | `POST /api/v1/auth/login` with `Admin` authenticated against PostgreSQL and returned Admin session | PASSED |
| **Dynamic Switching** | Switched provider to `SqlServer`, verified `/health` reported `SqlServer` and returned data; switched back to `PostgreSql` | PASSED |
| **Backend Unit Tests** | `dotnet test AgriPhd.Tests`: 31 passed, 0 failed, 1 skipped | PASSED |
| **Frontend Unit Tests** | `npx vitest --run`: 4 test suites passed, 64 tests passed, 0 failed | PASSED |
