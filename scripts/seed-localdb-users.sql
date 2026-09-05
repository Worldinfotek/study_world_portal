USE study_world_portal;
GO

MERGE dbo.users AS t
USING (VALUES
  (N'usr_admin_01', N'musadixsolution@gmail.com', N'Super Admin (Musa)', N'SWCAdmin@2026', N'Admin', N'Central Admissions & Executive Operations', 1, N'+92 300 1234567', NULL, NULL),
  (N'usr_staff_01', N'staff@studyworld.pk', N'Ayesha Khan', N'SWCPortal@2026', N'Office Staff', N'Central Student Counseling — Lahore HQ', 0, N'+92 321 7654321', NULL, NULL),
  (N'usr_fr_admin_01', N'salman.owner@studyworldfranchise.pk', N'Chaudhry Salman (Franchise Owner)', N'SWCPortal@2026', N'Franchise Admin', N'Franchise Management', 0, N'+92 300 9988776', N'fr_lhr_gulberg', N'Study World — Gulberg Lahore Franchise'),
  (N'usr_fr_staff_01', N'mahnoor.counselor@studyworldfranchise.pk', N'Mahnoor Tariq (Sub-User Counselor)', N'SWCPortal@2026', N'Franchise Staff', N'Gulberg Student Desk', 0, N'+92 333 4455667', N'fr_lhr_gulberg', N'Study World — Gulberg Lahore Franchise'),
  (N'usr_fr_admin_02', N'hamza.isb@studyworldfranchise.pk', N'Hamza Farooq (Franchise Partner)', N'SWCPortal@2026', N'Franchise Admin', N'Franchise Management', 0, N'+92 301 5566778', N'fr_isb_f8', N'Study World — Islamabad F-8 Franchise'),
  (N'usr_fr_staff_02', N'asad.niazi@studyworldfranchise.pk', N'Asad Niazi (Sub-User Counselor)', N'SWCPortal@2026', N'Franchise Staff', N'Islamabad Student Admissions', 0, N'+92 345 6677889', N'fr_isb_f8', N'Study World — Islamabad F-8 Franchise'),
  (N'usr_b2b_partner_01', N'b2b.partner@globaleducation.pk', N'Bilal Farooqi (B2B Partner)', N'SWCPortal@2026', N'B-2-B', N'B2B Partner & External Referral Network', 0, N'+92 320 8899001', NULL, NULL),
  (N'usr_student_demo', N'student@studyworld.pk', N'Zain Ahmed (Applicant)', N'SWCStudent@2026', N'User', N'Public Student Portal', 1, N'+92 300 9876543', NULL, NULL),
  (N'usr_developer_01', N'developer@gmail.com', N'Developer', N'SWCAdmin@2026', N'Admin', N'Engineering', 1, NULL, NULL, NULL)
) AS s (uid, email, name, password, role, department, export_permission, phone, franchise_id, franchise_name)
ON t.email = s.email
WHEN MATCHED THEN
  UPDATE SET
    uid = s.uid,
    name = s.name,
    password = s.password,
    role = s.role,
    department = s.department,
    export_permission = s.export_permission,
    phone = s.phone,
    franchise_id = s.franchise_id,
    franchise_name = s.franchise_name,
    is_active = 1,
    status = N'Active',
    updated_at = SYSUTCDATETIME()
WHEN NOT MATCHED THEN
  INSERT (uid, email, name, password, role, department, export_permission, phone, franchise_id, franchise_name, status, is_active, auth_provider)
  VALUES (s.uid, s.email, s.name, s.password, s.role, s.department, s.export_permission, s.phone, s.franchise_id, s.franchise_name, N'Active', 1, N'email');
GO

SELECT email, role FROM dbo.users ORDER BY email;
GO
