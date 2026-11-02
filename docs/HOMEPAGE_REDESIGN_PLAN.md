# MCAER Ph.D. Admissions 2026-27 — Home Page Redesign Plan
## Fresh, Natural Aesthetic & Infographic-Driven Portal Experience

> **Document Version:** 3.0 (Updated: Fresh Natural Palette & Subtle Typography)  
> **Target Page:** `agri-phd-web/src/pages/public/HomePage.tsx`  
> **Status:** Approved for Implementation  
> **Core Aesthetic:** Fresh Botanical & Natural Earth Tones • Subtle, Refined Editorial Typography (Non-Bulgy) • 100% Static Illustrated Infographic Process Flow

---

## 1. Executive Summary & Design Vision

The redesign transitions the portal away from heavy, bureaucratic, 2010s government aesthetics (harsh navy `#0B1D33`, loud bulky headings, cold grey borders) toward a **fresh, breathable, nature-inspired academic aesthetic**. 

Inspired by modern world-class agricultural research universities (such as Wageningen University & Research and UC Davis Agricultural Sciences), the new experience combines **organic botanical colors, light airy surfaces, subtle non-bulgy typography**, and an **illustrated static infographic flowchart**.

### Key Aesthetic Transformations:

| Element | Old / Legacy Style | New Fresh & Natural Style |
|---|---|---|
| **Color Mood** | Heavy dark navy (`#0B1D33`), harsh black text, stark cold grey borders. | **Botanical & Organic Nature**: Deep forest green (`#1B4332`), fresh sage (`#40916C`), soft mint tints (`#F0FDF4`), warm wheat/parchment accents (`#FAF9F5`), and soft morning slate text (`#334155`). |
| **Typography** | Bulgy, loud, heavy bold block fonts (`font-black`, `text-4xl`/`text-5xl`), clunky thick pills. | **Subtle, Refined & Editorial**: Balanced `font-semibold` titles (`text-xl` to `text-2xl`), airy letter tracking (`tracking-tight`), `leading-relaxed` body prose, and delicate micro-badges (`text-3xs`/`text-2xs`). |
| **Process Flow** | Bulky, boxy tables or cards with dynamic date clutter. | **100% Static Illustrated Infographic Flow**: Pure visual story with delicate vector artwork, step numbers, and connecting flow paths (no live dates/dynamic clutter). |
| **Background & Surfaces** | Clunky grey cards on harsh white background. | **Soft Ivory & Herbal Canvas**: Natural warm off-white canvas (`#FAFBF9`) with delicate plant-stem border accents (`border-emerald-200/50`) and soft, natural shadows. |

---

## 2. Design System: Colors & Typography

### 2.1 Fresh & Natural Botanical Palette

```
  Primary Forest       Fresh Leaf Sage       Soft Herbal Mint      Warm Parchment       Soft Morning Slate
     #1B4332               #40916C               #F0FDF4               #FAF9F5               #334155
┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐   ┌─────────────────┐
│                 │   │                 │   │                 │   │                 │   │                 │
│  Forest Deep    │   │  Fresh Leaf     │   │  Herbal Surface │   │  Natural Canvas │   │  Editorial Text │
│  (Headings/Nav) │   │  (Active CTAs)  │   │  (Card Accents) │   │  (Page Base)    │   │  (Body / Prose) │
└─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘   └─────────────────┘
```

| Semantic Role | Color Name | Hex Code | Tailwind Equivalent / Usage |
|---|---|---|---|
| **Canvas Background** | Natural Warm Ivory | `#FAFBF9` | `bg-[#FAFBF9]` / `bg-stone-50/50` — calm, clean, breathable canvas |
| **Primary Brand Anchor** | Deep Forest Botanical | `#1B4332` | `text-[#1B4332]` / `bg-[#1B4332]` — titles, institutional badges, subtle dark touches |
| **Active Accent & CTA** | Fresh Leaf Sage | `#2D6A4F` $\to$ `#40916C` | `bg-emerald-700 hover:bg-emerald-800 text-white` — primary action buttons |
| **Card Surface** | Soft Herbal White | `#FFFFFF` with `#F4F8F5` tint | `bg-white/95 border border-emerald-100/80` — airy card surfaces |
| **Secondary Warmth** | Warm Wheat & Honey | `#E9C46A` / `#D4A373` | `text-amber-800 bg-amber-50/70 border-amber-200/60` — subtle warning/academic heritage chips |
| **Editorial Text (Primary)** | Charcoal Morning Slate | `#263238` / `#334155` | `text-slate-800` — high readability without the harshness of `#000000` |
| **Editorial Text (Muted)** | Soft Sage Slate | `#5C6B73` / `#64748B` | `text-slate-500` / `text-stone-500` — metadata, secondary captions |
| **Borders & Dividers** | Delicate Leaf Border | `#E2EBE5` / `#D8E5DC` | `border-emerald-200/40` / `border-stone-200/60` — light, organic dividers |

---

### 2.2 Subtle, Refined Typography Guidelines (Non-Bulgy)

To ensure the interface feels graceful, modern, and uncluttered, all font scales are kept **subtle, proportional, and balanced**:

```
Typography Hierarchy:
├── Page Eyebrow Kicker: text-3xs / text-2xs uppercase tracking-widest font-semibold text-emerald-800
├── Hero Heading: text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 (NOT text-5xl font-black)
├── Section Headings: text-base sm:text-lg font-semibold tracking-tight text-slate-900
├── Infographic Stage Titles: text-sm font-semibold text-slate-800
├── Body Prose: text-xs sm:text-sm font-normal text-slate-600 leading-relaxed
└── Micro Badges & Metrics: text-3xs font-medium px-2 py-0.5 rounded-full
```

#### Key Typography Rules:
1. **No Bulgy Font Weights**: Avoid `font-black` (900) and heavy `font-extrabold` (800). Maximize use of refined `font-semibold` (600) and `font-medium` (500) with slight letter-tracking (`tracking-tight`).
2. **Controlled Headings**: The hero title is capped at `text-3xl` (desktop), creating a distinguished editorial appearance rather than a billboard poster.
3. **Delicate Micro-Badges**: Stage chips, category tags, and counters use `text-3xs` (10px) to `text-2xs` (11px) with slim 1px borders and gentle padding (`px-2 py-0.5`).
4. **Relaxed Line Height**: Body text employs `leading-relaxed` (1.625) so reading requirements and instructions feels effortless.

---

## 3. High-Level Page Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 1: FRESH BOTANICAL HERO BANNER & CANDIDATE LAUNCHPAD                   │
│  - Soft sage & ivory gradient canvas with botanical biotech illustration       │
│  - Refined subtle title: "Doctor of Philosophy (Ph.D.) Centralized Admissions" │
│  - Subtle primary action buttons: [ Apply Online Now → ] [ Sign In to Portal ] │
│  - Nature-toned stat chips: 4 State Universities • 100% Online Scrutiny         │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 2: FLOATING ADMISSIONS NEWS CAPSULE                                    │
│  - Soft mint frosted capsule: [● UPDATE] Latest admission notices & alerts     │
│  - Subtle rotation controls with gentle fade transitions                        │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 3: STATIC IMAGE-BASED INFOGRAPHIC PROCESS FLOW (Visual Candidate Guide) │
│  - 100% STATIC visual flowchart showing the journey from start to end           │
│  - ZERO dynamic dates / beacons (clean, permanent, evergreen infographic)       │
│  - 5 Illustrated Milestone Chapters with delicate directional flow paths       │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 4: 4 STATE AGRICULTURAL UNIVERSITIES (Fresh Illustrated Campus Cards)  │
│  - MPKV Rahuri | PDKV Akola | VNMKV Parbhani | BSKKV Dapoli                      │
│  - Institutional crests, regional jurisdiction, doctoral faculties & colleges  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 5: MODERN DIGITAL DOCUMENT HUB & LIVE ADMISSION SCHEDULE               │
│  - Segmented subtle pill tabs: Circulars (x) | Prospectus (x) | Schedule (x)   │
│  - Live database schedule dates and official PDF circulars with clean download  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                         │
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  SECTION 6: CANDIDATE FAST-TRACK TOOLKIT & OFFICIAL HELPLINE                    │
│  - Subtle botanical cards: Information Brochure, Seat Matrix, Helpline 8806612998│
│  - Integrated AI Admission Copilot in Marathi & English                         │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Static Image-Based Infographic Process Flow

### 4.1 Concept & Characteristics
- **Completely Static**: Explains the end-to-end admission process visually without dependency on live database dates or active stage flags.
- **Visual Motif**: Soft botanical timeline cards with delicate pastel green and parchment backgrounds, subtle vector illustrations, step numbers, and directional connectors (`↓` / `→`).

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │                       PH.D. CENTRALIZED ADMISSION PROCESS (CAP) FLOWCHART                       │
 │                   Step-by-Step Candidate Journey Overview (Static Infographic Guide)            │
 └─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                  │
                                                  ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ 🧑‍💻 STAGE 01: ONLINE CANDIDATE REGISTRATION                                                     │
 │ Botanical Pastel Card • Candidate with Laptop & OTP Verification Shield                        │
 │ • Input: Mobile number, active email address & basic identity details                           │
 │ • Verification: Instant OTP SMS/Email authentication                                            │
 │ • Output: Permanent Login ID & Password generated for all admission rounds                     │
 └────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ (Directional Flow Connector)
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ 📋 STAGE 02: APPLICATION FORM FILLING & OPTION PREFERENCES                                      │
 │ Soft Azure/Sage Card • 10-Step Wizard Dossier, Scanned Certificates & Preference Priorities    │
 │ • Input: Academic marks (UG/PG), CGPA, category, domicile, publications & weightages            │
 │ • Uploads: Photograph, signature, transcripts & caste/validity/creamy-layer certificates       │
 │ • Options: Select university faculties, colleges and subjects in order of candidate priority   │
 │ • Final Step: Online fee payment & application form locking                                     │
 └────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ (Directional Flow Connector)
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ 🔍 STAGE 03: ONLINE E-SCRUTINY DOCUMENT VERIFICATION                                            │
 │ Soft Herbal Mint Card • EVC Scrutiny Officer with Magnifying Glass & Verified Seal              │
 │ • Verification: Assigned E-Verification Center (EVC) scrutinizes submitted documents online     │
 │ • Query Clearance: Candidate uploads clarifications if any document discrepancy is raised      │
 │ • Output: E-Scrutiny Verification Certificate generated; candidate marked verified / eligible │
 └────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ (Directional Flow Connector)
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ 🏆 STAGE 04: STATE MERIT RANKING & GRIEVANCE REDRESSAL                                          │
 │ Soft Lavender/Sage Card • State Merit Leaderboard Podium & Grievance Balance Scales             │
 │ • Step A: Publication of Provisional State Merit List on portal for candidate review            │
 │ • Step B: Online Grievance Submission Window (48-72h) for corrections / objections              │
 │ • Step C: Declaration of Final State Merit List with frozen state rankings for seat allocation  │
 └────────────────────────────────┬────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼ (Directional Flow Connector)
 ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
 │ 🏛️ STAGE 05: CENTRALIZED ALLOTMENT PROCESS (CAP) & COLLEGE ADMISSIONS                           │
 │ Soft Wheat/Ivory Card • University Colonnade Hall, Allotment Letter & Graduation Cap           │
 │ • Allotment: Publication of Round-I, Round-II & Spot CAP seat allotments on candidate login     │
 │ • In-Person Reporting: Candidate reports to allotted Agricultural College with original docs   │
 │ • Admission: College verifies originals, collects fees & issues Admission Confirmation Receipt  │
 └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 4.2 Illustrated Stage Card Specifications

| Stage | Delicate Color Tint | Vector Illustration Motif | Refined Title & Subtle Directive |
|---|---|---|---|
| **01. Registration** | `bg-emerald-50/50 border-emerald-200/50` | Candidate with laptop, mobile phone receiving OTP message, subtle shield icon. | **Candidate Registration**: Register once with active mobile & email to generate your permanent portal Login ID. |
| **02. Application & Options** | `bg-blue-50/40 border-blue-200/40` | Digital dossier folder with 10-step checklist, cloud upload icon, and ranked choice matrix (1, 2, 3). | **Application & Preferences**: Complete the 10-step wizard, upload documents, rank university preferences & lock form. |
| **03. E-Scrutiny** | `bg-teal-50/40 border-teal-200/40` | Scrutiny inspector avatar with magnifying glass over certificates and green verified seal stamp. | **Online Document Verification**: Assigned EVC officer examines documents online; monitor portal for discrepancy queries. |
| **04. State Merit & Grievance** | `bg-purple-50/40 border-purple-200/40` | State merit podium rankings (1st, 2nd, 3rd) with grievance balance scale and correction gavel. | **State Merit & Objections**: Review provisional state ranking, submit online objections if needed, and view final rank list. |
| **05. Allotment & Admission** | `bg-amber-50/40 border-amber-200/40` | University campus colonnade, official allotment letter with green ribbon stamp, graduation cap. | **CAP Allotment & College Reporting**: Download seat allotment letter; report in-person to allotted college with original certificates. |

---

## 5. The 4 State Agricultural Universities Showcase (Fresh Campus Cards)

Designed as **light, airy university profile cards** with delicate botanical frames:

```
┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
│ MPKV RAHURI             │ │ PDKV AKOLA              │ │ VNMKV PARBHANI          │ │ BSKKV DAPOLI            │
│ 🌿 Western Maharashtra  │ │ 🌿 Vidarbha Region     │ │ 🌿 Marathwada Region    │ │ 🌿 Konkan Coastal       │
│ Rahuri, Dist. Ahmednagar│ │ Akola Campus            │ │ Parbhani Campus         │ │ Dapoli, Dist. Ratnagiri │
│                         │ │                         │ │                         │ │                         │
│ • Agriculture           │ │ • Agril. Biotechnology  │ │ • Food Technology       │ │ • Fisheries Science     │
│ • Horticulture          │ │ • Forestry & Agronomy   │ │ • Community Science     │ │ • Marine Biology        │
│ • Agril. Engineering    │ │ • Agril. Engineering    │ │ • Soil Science          │ │ • Coastal Horticulture  │
│                         │ │                         │ │                         │ │                         │
│ [ View Colleges → ]     │ │ [ View Colleges → ]     │ │ [ View Colleges → ]     │ │ [ View Colleges → ]     │
└─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘ └─────────────────────────┘
```

- **Card Styling**: `bg-white/90 border border-emerald-100 hover:border-emerald-300 rounded-2xl p-5 shadow-xs hover:shadow-sm transition-all`.
- **Subtle Badges**: Delicate regional tag (`bg-emerald-50 text-emerald-800 text-3xs font-medium border border-emerald-200/60`).
- **Disciplines List**: Subtle bullet tags (`text-2xs text-slate-600 font-normal`).
- **College Link**: Soft arrow link (`text-xs font-medium text-emerald-700 hover:text-emerald-900`).

---

## 6. Modern Document Hub & Live Admission Schedule

This section independently handles all **dynamic database records** (notifications, circulars, prospectuses, schedules) in a clean card format:

- **Segmented Filter Pills**:
  - 📢 `Notifications & Circulars` (Live Count)
  - 📘 `Admission Prospectus` (Live Count)
  - 📅 `Admission Schedule & Key Dates` (Live Count from `Master_ActivityStatus` & `Phase`)
  - 📥 `Forms & Annexures` (Live Count)
- **Document Card Attributes**:
  - Vector PDF icon with file size chip.
  - Formatted publication date (`DD MMM YYYY`).
  - Subtle `NEW` pill for notices published in the last 7 days.
  - One-click `Preview Document ↗` and `Download PDF` actions.

---

## 7. Candidate Fast-Track Toolkit & Helpline Grid

Located at the base of the page with soft botanical backgrounds:

1. 📖 **Information Brochure (PDF)**: Complete admission guidelines, eligibility, quotas & fee structure.
2. 🏛️ **College & Seat Matrix**: Participating constituent and affiliated colleges with seat distribution.
3. 📞 **Official Admission Helpline**: Direct telephone support (`8806612998`) and email (`mcaer.admission@gmail.com`).
4. 🤖 **AI Admission Copilot**: Interactive floating assistant in Marathi & English to answer candidate queries 24/7.

---

## 8. Implementation Deliverables

| Deliverable | Purpose | Styling Highlights |
|---|---|---|
| `HomeHeroSection.tsx` | Welcoming hero banner with institutional authority | Soft forest green `#1B4332`, natural ivory canvas, subtle `text-2xl`/`text-3xl` title |
| `BreakingNewsCapsule.tsx` | Floating live update ticker | Frosted glass mint pill, subtle rotation controls |
| `StaticInfographicFlow.tsx` | **Purely static illustrated 5-stage infographic flowchart** | **100% Static** (no dates/beacons), pastel herbal card tints, delicate vector illustrations |
| `UniversityShowcase.tsx` | 4 illustrated cards for MPKV, PDKV, VNMKV, and BSKKV | Delicate plant-stem borders, subtle typography, regional badges |
| `DocumentHub.tsx` | Modern card-based document repository replacing legacy table tabs | Dynamic (queries DB notifications & schedule), clean PDF cards |
| `FastTrackToolkit.tsx` | Candidate helper cards for helpline, manual, and AI copilot | Soft wheat & mint cards, subtle micro-badges |

---

## 9. Verification & Acceptance Criteria

1. **Fresh & Natural Mood**: The page looks organic, refreshing, and academic with forest greens, soft sage, warm parchment, and herbal tints.
2. **Subtle Typography**: No loud or bulgy text; titles are balanced (`text-xl` to `text-2xl`), body text is `leading-relaxed` (`text-xs`/`text-sm`), and badges are delicate (`text-3xs`/`text-2xs`).
3. **100% Static Process Flow**: The infographic section explains the journey visually without live date bindings or dynamic clutter.
4. **Clean Code & Zero Errors**: TypeScript compiles with 0 errors (`npx tsc --noEmit`) and all 64 Vitest unit tests pass.
