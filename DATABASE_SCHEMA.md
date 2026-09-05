# Study World Consultants (SWC) — Database Schema & Architecture

This document describes the Firestore database collections, field schemas, data types, security access controls, and relationship mapping for the Study World Consultants International Education Portal.

**Database Instance:** `ai-studio-studyportalsearc-cbf038f5-27e4-493f-9305-1a55871091e8`  
**Firebase Project:** `turing-outcome-zhh41`  
**Database Engine:** Google Cloud Firestore (NoSQL Document Store)

---

## 1. Collections & Data Models

### 1.1 `universities` Collection
Stores partner higher education institutions across global destination countries.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `university_id` / `id` | `string` | Primary Key, Max 64 chars | Unique university identifier (e.g., `uni_herts`, `uni_monash`) |
| `name` | `string` | Required, Max 256 chars | Official name of university |
| `country` | `string` | Required, Max 64 chars | Country (e.g., United Kingdom, Australia, USA, Canada) |
| `city` | `string` | Required, Max 64 chars | City of primary or secondary campus |
| `campus` | `string` | Optional, Max 128 chars | Specific campus name (e.g., College Lane Campus, Clayton) |
| `ranking` | `number` | Optional | National league table ranking |
| `world_rank` | `number` | Optional | QS / THE World University ranking |
| `logo_url` | `string` | Optional | URL to official high-res institution crest/logo |
| `website_url` | `string` | Optional | Official institution admissions portal URL |
| `commission_rate` | `string` | Optional | Agency commercial contract terms (e.g., "12.5% of Year 1 Fee") |
| `status` | `string` | Enum: `Active`, `Inactive` | University partnership status |
| `created_at` | `string` | ISO 8601 Timestamp | Record creation timestamp |
| `updated_at` | `string` | ISO 8601 Timestamp | Record modification timestamp |

---

### 1.2 `courses` Collection
Stores academic degree programs, tuition fees, entry scores, and intakes offered by universities.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `course_id` | `string` | Primary Key, Max 64 chars | Unique course code (e.g., `crs_herts_cs_msc`) |
| `university_id` | `string` | Foreign Key (`universities.id`) | Owning university ID |
| `university_name` | `string` | Required | Denormalized university name for rapid querying |
| `country` | `string` | Required | Destination country |
| `city` | `string` | Required | City location |
| `course_name` | `string` | Required, Max 256 chars | Full degree title (e.g., MSc Data Science & AI) |
| `discipline` | `string` | Required | Field of study (Computer Science, Business, Engineering, etc.) |
| `level` | `string` | Required | Academic tier: `Undergraduate`, `Postgraduate`, `Doctoral`, `Foundation` |
| `duration_years` | `string` | Required | Program length (e.g., "1 Year", "3 Years", "4 Years with Placement") |
| `annual_fee` | `string` | Required | Annual tuition rate (e.g., "16500", "34500") |
| `currency` | `string` | Required | Currency symbol/code (`GBP (£)`, `AUD ($)`, `USD ($)`, `CAD ($)`, `EUR (€)`) |
| `scholarship_available` | `string` | Optional | Guaranteed or merit scholarship (e.g., "£2,000 - £4,000 Early Bird") |
| `ielts_requirement` | `string` | Required | Minimum overall IELTS score & sub-bands (e.g., "6.5 overall (min 6.0)") |
| `toefl_requirement` | `string` | Optional | Minimum TOEFL iBT score |
| `duolingo_requirement`| `string` | Optional | Minimum DET score |
| `pte_requirement` | `string` | Optional | Minimum Pearson PTE score |
| `moi_accepted` | `boolean`| Required | Whether Medium of Instruction (MOI) waiver letter is accepted |
| `gpa_requirement` | `string` | Required | Minimum undergraduate/high school CGPA (e.g., "2.7 / 4.0") |
| `percentage_requirement`| `string`| Optional | Percentage equivalent (e.g., "60% in Bachelor's") |
| `intakes` | `string` | Required | Available intake sessions (e.g., "September 2026, January 2027") |
| `application_deadline`| `string` | Optional | Standard international application closing deadline |
| `status` | `string` | Enum: `Active`, `Inactive` | Program availability status |
| `created_at` | `string` | ISO 8601 Timestamp | Timestamp |
| `updated_at` | `string` | ISO 8601 Timestamp | Timestamp |

---

### 1.3 `student_leads` Collection
Stores student prospective profiles, counseling dossiers, and application tracking stages.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Primary Key, Max 64 chars | Unique lead code (e.g., `lead_1714002938`) |
| `student_name` | `string` | Required, Max 128 chars | Student full legal name |
| `email` | `string` | Required, Max 256 chars | Student contact email |
| `phone` | `string` | Required, Max 64 chars | Student WhatsApp/Phone with international code |
| `city` | `string` | Optional | Student hometown / current location |
| `counselor_id` | `string` | Foreign Key (`users.id`) | Assigned educational counselor UID |
| `counselor_name` | `string` | Required | Assigned counselor display name |
| `counselor_email`| `string` | Optional | Assigned counselor email |
| `franchise_id` | `string` | Foreign Key (`franchises.id`)| Assigned office branch code |
| `franchise_name` | `string` | Optional | Office branch name (e.g., Islamabad Head Office, Lahore Branch) |
| `course_id` | `string` | Foreign Key (`courses.course_id`)| Selected course ID |
| `course_name` | `string` | Required | Selected course title |
| `university_id` | `string` | Foreign Key (`universities.id`)| Selected university ID |
| `university_name`| `string` | Required | Selected university name |
| `destination_country`| `string` | Required | Target country |
| `target_intake` | `string` | Required | Target intake period (e.g., "Fall 2026", "Spring 2027") |
| `academic_score` | `string` | Required | Prior qualification & score (e.g., "CGPA 3.4/4.0 BS Software Eng") |
| `english_test_score`| `string` | Required | English proficiency (e.g., "IELTS 7.0 (W 6.5, S 7.0)") |
| `status` | `string` | Workflow Status | Stage: `Inquiry`, `Counseling`, `Documents Uploaded`, `Application Submitted`, `Conditional Offer`, `Unconditional Offer / CAS / I-20`, `Visa Filed`, `Visa Approved`, `Enrolled` |
| `priority` | `string` | Enum: `Urgent`, `High`, `Medium`, `Low` | Urgency tier |
| `notes` | `string` | Optional, Max 2048 chars | Counselor case notes and requirements |
| `meet_link` | `string` | Optional | Auto-generated Google Meet consultation URL |
| `calendar_event_id`| `string` | Optional | Google Calendar synchronized event ID |
| `google_doc_id` | `string` | Optional | Google Docs application dossier ID |
| `created_at` | `string` | ISO 8601 Timestamp | Registration timestamp |
| `updated_at` | `string` | ISO 8601 Timestamp | Last update timestamp |

---

### 1.4 `counseling_meetings` Collection
Stores student video counseling and calendar consultations synchronized with Google Calendar & Google Meet.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Primary Key, Max 64 chars | Meeting unique ID (e.g., `meet_1714002938`) |
| `lead_id` | `string` | Foreign Key (`student_leads.id`) | Associated student lead ID |
| `student_name` | `string` | Required, Max 128 chars | Student full name |
| `student_email` | `string` | Required, Max 256 chars | Student email address |
| `counselor_id` | `string` | Foreign Key (`users.id`) | Counselor UID |
| `counselor_email`| `string` | Required, Max 256 chars | Counselor email address |
| `title` | `string` | Required, Max 256 chars | Meeting subject |
| `description` | `string` | Optional, Max 1024 chars | Agenda / preparation notes |
| `meet_uri` | `string` | Optional, Max 512 chars | Google Meet video room URL (`https://meet.google.com/...`) |
| `calendar_event_id`| `string` | Optional | Google Calendar event reference ID |
| `start_time` | `string` | ISO 8601 Timestamp | Consultation start time |
| `end_time` | `string` | ISO 8601 Timestamp | Consultation end time |
| `status` | `string` | Enum: `scheduled`, `completed`, `cancelled` | Meeting status |
| `created_at` | `string` | ISO 8601 Timestamp | Creation timestamp |

---

### 1.5 `users` Collection
Stores authorized counselors, franchise branch administrators, and executive managers.

| Field Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `uid` / `id` | `string` | Primary Key, Max 128 chars | User ID (Firebase UID or custom ID) |
| `email` | `string` | Required, Max 256 chars | Counselor email address |
| `name` | `string` | Required, Max 128 chars | Counselor full name |
| `role` | `string` | Enum: `Admin`, `Franchise Admin`, `Counselor`, `Office Staff` | Access control role |
| `department` | `string` | Optional | Department (Admissions, Visa Processing, Executive) |
| `franchise_id` | `string` | Optional | Branch ID |
| `franchise_name`| `string` | Optional | Branch location name |
| `status` | `string` | Enum: `Active`, `Inactive` | Account activity status |
| `export_permission`| `boolean`| Optional | Permission to export leads & course lists |
| `last_login` | `string` | ISO 8601 Timestamp | Last activity timestamp |

---

## 2. Relationships & Foreign Key Map

```
┌─────────────────┐             ┌─────────────────────┐
│  universities   │ 1 ─────── N │       courses       │
│  (university_id)│             │   (university_id)   │
└────────┬────────┘             └──────────┬──────────┘
         │                                 │
         │ 1                               │ 1
         │                                 │
         │ N                               │ N
┌────────┴─────────────────────────────────┴──────────┐
│                    student_leads                    │
│  (id, university_id, course_id, counselor_id)       │
└────────┬─────────────────────────────────┬──────────┘
         │ 1                               │ 1
         │                                 │
         │ N                               │ N
┌────────┴────────┐             ┌──────────┴──────────┐
│     users       │ 1 ─────── N │ counseling_meetings │
│  (counselor_id) │             │  (lead_id, counselor)│
└─────────────────┘             └─────────────────────┘
```

---

## 3. Migration & Seeding Engine

The application includes an automated migration and seeder engine in `src/utils/firestoreService.ts`:
- **Auto-Boot Seeding**: Checks if Firestore has records on app launch; if empty, populates all universities, courses, initial leads, and counselor accounts.
- **Batching & Throttling**: Seeding operations are batched in groups of 25 with write-throttling to respect Firestore free-tier and standard quotas.
- **Merge Integrity**: All documents use `{ merge: true }` to preserve custom notes, document attachments, and application edits.
