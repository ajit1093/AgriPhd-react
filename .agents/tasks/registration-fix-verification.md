# Registration Lookup Bug Fix — Verification Report

**Date:** 2026-10-22  
**Task:** Verify and validate the registration lookup bug fix (candidate not found in new project)

---

## Fix 1 — Date Conversion (RegistrationService.cs)

**Status: Applied with critical bug fix**

The fix was present but had a Windows culture issue: `dd/MM/yyyy` was producing `05-02-2001` (dashes)
instead of `05/02/2001` (slashes) because .NET's `/` format specifier is culture-sensitive and
the machine's date separator is `-`. Fixed by using literal slash syntax `dd'/'MM'/'yyyy`.

**Final code in `LookupCandidateAsync`:**
```csharp
string dobForSp = request.DateOfBirth;
if (DateTime.TryParse(request.DateOfBirth, out var parsedDob))
    dobForSp = parsedDob.ToString("dd'/'MM'/'yyyy"); // literal '/' — avoid culture-specific date separator
```

The SP `ApplicationForm_GetRegisteredCandidate` uses `CONVERT(VARCHAR, mc.DOB, 103) = @DOB`
(format 103 = DD/MM/YYYY). With the fix, `2001-02-05` → `05/02/2001`, matching SP output.

---

## Fix 2 — CSRF Exemption (CsrfMiddleware.cs)

**Status: Confirmed present**

`_csrfExemptPaths` contains both required entries:
- `/api/v1/registration/lookup` ✓
- `/api/v1/registration/register` ✓

---

## Fix 3 — Zod Schema (registrationSchemas.ts)

**Status: Confirmed correct**

`candidateLookupSchema.dateOfBirth` is:
```ts
dateOfBirth: z.string().min(1, 'Date of Birth is required.')
```
No DD/MM/YYYY regex present. Accepts any non-empty string (including `YYYY-MM-DD` from `<input type="date">`).

---

## Build Result

**Status: Success (0 errors, 2 pre-existing warnings)**

```
AgriPhd.Api succeeded with 2 warning(s) → bin\Debug\net8.0\AgriPhd.Api.dll
Build succeeded with 2 warning(s) in 3.0s
```

Warnings are pre-existing nullable dereference warnings in `ApplicationFormRepository.cs` (unrelated to this fix).

---

## API Health Check — Port 5255

**Status: Responding ✓**

```
GET http://localhost:5255/health → 200
{"status":"ok","timestamp":"2026-10-22T06:12:16.0651618Z"}
```

---

## Vite Status — Port 5173

**Status: Responding ✓**

```
netstat: TCP [::1]:5173 LISTENING
```

---

## End-to-End Test Result

**POST** `http://localhost:5255/api/v1/registration/lookup`  
**Body:** `{"applicationFormNo":252001006,"dateOfBirth":"2001-02-05"}`

**HTTP Response: 200 OK**
```json
{
  "found": true,
  "candidateName": "ABHI SHIRISH BABAR",
  "facultyName": "Agriculture",
  "applicationFormNo": 252001006,
  "dob": "05-02-2001 00:00:00",
  "genderCode": "",
  "loginExists": false,
  "mobileNo": "9356950795",
  "emailId": "abhi@gmail.com",
  "pgSubjectName": "Soil Science"
}
```

---

## TypeScript Check

**Status: 0 errors ✓**

Fixed 2 errors in `src/utils/categoryUtils.ts`:
- `CASTE_CERT_REQUIRED` was inferred as a tuple of literal union types, causing `Array.includes(number)` to fail.
- Fix: Added explicit `number[]` type annotation: `export const CASTE_CERT_REQUIRED: number[] = [...]`

---

## Definition of Done — Checklist

- [x] API running on port 5255
- [x] Vite running on port 5173
- [x] Lookup POST returns `found: true` for CET Form No 252001006, DOB 2001-02-05
- [x] TypeScript check passes with 0 errors
- [x] Verification report written
