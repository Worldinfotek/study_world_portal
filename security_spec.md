# Security Specification: Study World Portal

## 1. Data Invariants & Access Control Policy
- **Authentication**: All operations requiring role-based access must have a valid Firebase Auth session (`request.auth != null`).
- **No Plain-Text Passwords**: The `password` attribute is strictly forbidden from ever being persisted into any Firestore document (`users`, `student_leads`, etc.). User credentials are exclusively managed by Firebase Authentication identity services.
- **Role Escalation Protection**: Users creating their own profiles cannot assign themselves `Admin`, `Franchise Admin`, or `Office Staff` roles. Only authorized system administrators can grant or elevate privileges.
- **Franchise & Branch Data Isolation**: Franchise Admins and Franchise Staff may only access, query, and mutate student leads that belong to their specific `franchise_id`. Unbounded queries across other branches are strictly blocked.
- **Sensitive Student PII Protection**: Sensitive student contact and academic data (`email`, `phone`, `academic_score`, `english_test_score`, `notes`) can only be read by the student themselves, the assigned counselor, their specific branch franchise administrator, or system administrators.
- **Catalog Tampering Prevention**: The `universities`, `courses`, `countries`, and `franchises` collections are protected against unauthorized modification. Only administrators can alter institutional data and commission parameters.

---

## 2. The "Dirty Dozen" Threat Payloads
The following 12 attack payloads are designed to test and break data integrity, role security, and branch boundaries:

1. **Payload 1 (Plain-Text Password Injection)**: Unauthenticated or authenticated user attempting to save a plain-text password field inside `/users/{userId}`. Expected: `PERMISSION_DENIED`.
2. **Payload 2 (Self-Assigned Admin Escalation)**: Regular user setting `role: "Admin"` upon registering `/users/{userId}`. Expected: `PERMISSION_DENIED`.
3. **Payload 3 (Role Hijacking on Profile Update)**: Non-admin user attempting an update on `/users/{userId}` to change `role` from `"User"` to `"Franchise Admin"`. Expected: `PERMISSION_DENIED`.
4. **Payload 4 (Cross-Franchise Lead Snooping)**: Franchise Admin of `lahore_central` attempting to read a student lead document belonging to `karachi_clifton`. Expected: `PERMISSION_DENIED`.
5. **Payload 5 (Unauthenticated Student PII Leak)**: Unauthenticated client attempting `get` on `/student_leads/{leadId}` to harvest student phone numbers and test scores. Expected: `PERMISSION_DENIED`.
6. **Payload 6 (Student Impersonation on Application)**: User creating a student lead with an invalid or spoofed ID. Expected: `PERMISSION_DENIED`.
7. **Payload 7 (Unauthorized University Rate Tampering)**: Counselor or public user attempting to update `commission_rate` or `status` in `/universities/{universityId}`. Expected: `PERMISSION_DENIED`.
8. **Payload 8 (Unauthorized Course Modification)**: Unprivileged user attempting `write` on `/courses/{courseId}`. Expected: `PERMISSION_DENIED`.
9. **Payload 9 (Franchise Commission Alteration)**: Non-admin user attempting to modify `/franchises/{franchiseId}` commission percentages. Expected: `PERMISSION_DENIED`.
10. **Payload 10 (Global Lead Query Hijack)**: Branch staff attempting an unbounded list query `collection('student_leads')` without scoping by `franchise_id` or `counselor_id`. Expected: `PERMISSION_DENIED`.
11. **Payload 11 (Malicious User Deletion)**: Regular staff or public user attempting `deleteDoc` on an administrator account in `/users/{userId}`. Expected: `PERMISSION_DENIED`.
12. **Payload 12 (Unauthorized Country Settings Overwrite)**: Non-admin attempting to alter destination visa rules or active states in `/countries/{countryCode}`. Expected: `PERMISSION_DENIED`.
