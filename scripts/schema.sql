IF OBJECT_ID(N'dbo.users', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.users (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    uid NVARCHAR(128) NOT NULL UNIQUE,
    email NVARCHAR(256) NOT NULL,
    name NVARCHAR(128) NOT NULL CONSTRAINT DF_users_name DEFAULT (N'Staff Member'),
    password NVARCHAR(256) NULL,
    role NVARCHAR(64) NOT NULL CONSTRAINT DF_users_role DEFAULT (N'User'),
    franchise_id NVARCHAR(64) NULL,
    franchise_name NVARCHAR(256) NULL,
    photo_url NVARCHAR(512) NULL,
    phone NVARCHAR(64) NULL,
    department NVARCHAR(256) NULL,
    status NVARCHAR(32) NOT NULL CONSTRAINT DF_users_status DEFAULT (N'Active'),
    export_permission BIT NOT NULL CONSTRAINT DF_users_export DEFAULT (0),
    is_active BIT NOT NULL CONSTRAINT DF_users_active DEFAULT (1),
    auth_provider NVARCHAR(32) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_users_created DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_users_updated DEFAULT (SYSUTCDATETIME())
  );
  CREATE UNIQUE INDEX IX_users_email ON dbo.users (email);
END
GO

IF OBJECT_ID(N'dbo.universities', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.universities (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    university_id NVARCHAR(64) NOT NULL UNIQUE,
    name NVARCHAR(256) NOT NULL,
    country NVARCHAR(64) NOT NULL,
    city NVARCHAR(64) NOT NULL,
    campus NVARCHAR(128) NULL,
    ranking INT NULL,
    world_rank INT NULL,
    logo_url NVARCHAR(512) NULL,
    website_url NVARCHAR(512) NULL,
    commission_rate NVARCHAR(64) NULL,
    status NVARCHAR(32) NULL CONSTRAINT DF_universities_status DEFAULT (N'Active'),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_universities_created DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_universities_updated DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.courses', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.courses (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    course_id NVARCHAR(64) NOT NULL UNIQUE,
    university_id NVARCHAR(64) NOT NULL,
    university_name NVARCHAR(256) NOT NULL,
    country NVARCHAR(64) NOT NULL,
    city NVARCHAR(64) NOT NULL,
    course_name NVARCHAR(256) NOT NULL,
    discipline NVARCHAR(128) NOT NULL,
    level NVARCHAR(64) NOT NULL,
    duration_years NVARCHAR(64) NULL,
    annual_fee NVARCHAR(64) NULL,
    currency NVARCHAR(16) NULL CONSTRAINT DF_courses_currency DEFAULT (N'USD'),
    scholarship_available NVARCHAR(128) NULL,
    ielts_requirement NVARCHAR(64) NULL,
    toefl_requirement NVARCHAR(64) NULL,
    duolingo_requirement NVARCHAR(64) NULL,
    pte_requirement NVARCHAR(64) NULL,
    moi_accepted BIT NOT NULL CONSTRAINT DF_courses_moi DEFAULT (0),
    gpa_requirement NVARCHAR(64) NULL,
    percentage_requirement NVARCHAR(64) NULL,
    intakes NVARCHAR(128) NULL,
    application_deadline NVARCHAR(128) NULL,
    status NVARCHAR(32) NULL CONSTRAINT DF_courses_status DEFAULT (N'Active'),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_courses_created DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_courses_updated DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.student_leads', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.student_leads (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    lead_id NVARCHAR(64) NOT NULL UNIQUE,
    student_name NVARCHAR(128) NOT NULL,
    email NVARCHAR(256) NOT NULL,
    phone NVARCHAR(64) NOT NULL,
    city NVARCHAR(64) NULL,
    counselor_id NVARCHAR(128) NOT NULL,
    counselor_name NVARCHAR(128) NOT NULL,
    counselor_email NVARCHAR(256) NULL,
    franchise_id NVARCHAR(64) NOT NULL,
    franchise_name NVARCHAR(256) NOT NULL,
    course_id NVARCHAR(64) NOT NULL,
    course_name NVARCHAR(256) NOT NULL,
    university_id NVARCHAR(64) NOT NULL,
    university_name NVARCHAR(256) NOT NULL,
    destination_country NVARCHAR(64) NOT NULL,
    target_intake NVARCHAR(64) NULL,
    academic_score NVARCHAR(64) NULL,
    english_test_score NVARCHAR(64) NULL,
    status NVARCHAR(64) NOT NULL CONSTRAINT DF_leads_status DEFAULT (N'New Lead'),
    priority NVARCHAR(32) NOT NULL CONSTRAINT DF_leads_priority DEFAULT (N'Medium'),
    request_type NVARCHAR(64) NOT NULL CONSTRAINT DF_leads_type DEFAULT (N'Direct Admission'),
    notes NVARCHAR(2048) NULL,
    meet_link NVARCHAR(512) NULL,
    calendar_event_id NVARCHAR(128) NULL,
    google_doc_id NVARCHAR(128) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_leads_created DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_leads_updated DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.counseling_meetings', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.counseling_meetings (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    meeting_id NVARCHAR(64) NOT NULL UNIQUE,
    lead_id NVARCHAR(64) NULL,
    student_name NVARCHAR(128) NOT NULL,
    student_email NVARCHAR(256) NOT NULL,
    counselor_email NVARCHAR(256) NOT NULL,
    title NVARCHAR(256) NOT NULL,
    description NVARCHAR(1024) NULL,
    meet_uri NVARCHAR(512) NULL,
    calendar_event_id NVARCHAR(128) NULL,
    start_time DATETIME2 NOT NULL,
    end_time DATETIME2 NOT NULL,
    status NVARCHAR(32) NULL CONSTRAINT DF_meetings_status DEFAULT (N'scheduled'),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_meetings_created DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.franchises', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.franchises (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    franchise_id NVARCHAR(64) NOT NULL UNIQUE,
    name NVARCHAR(256) NOT NULL,
    code NVARCHAR(64) NOT NULL,
    city NVARCHAR(64) NOT NULL,
    country NVARCHAR(64) NOT NULL,
    address NVARCHAR(256) NULL,
    contact_person NVARCHAR(128) NULL,
    email NVARCHAR(256) NULL,
    phone NVARCHAR(64) NULL,
    status NVARCHAR(32) NULL CONSTRAINT DF_franchises_status DEFAULT (N'Active'),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_franchises_created DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.countries', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.countries (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    code NVARCHAR(8) NOT NULL UNIQUE,
    name NVARCHAR(128) NOT NULL,
    flag NVARCHAR(32) NULL,
    currency NVARCHAR(16) NOT NULL,
    currency_symbol NVARCHAR(16) NOT NULL,
    visa_processing_weeks NVARCHAR(128) NULL,
    post_study_work_visa NVARCHAR(256) NULL,
    psw_duration NVARCHAR(128) NULL,
    is_active BIT NOT NULL CONSTRAINT DF_countries_active DEFAULT (1),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_countries_created DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_countries_updated DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF COL_LENGTH('dbo.universities', 'payload_json') IS NULL
  ALTER TABLE dbo.universities ADD payload_json NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.courses', 'payload_json') IS NULL
  ALTER TABLE dbo.courses ADD payload_json NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.franchises', 'payload_json') IS NULL
  ALTER TABLE dbo.franchises ADD payload_json NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.countries', 'payload_json') IS NULL
  ALTER TABLE dbo.countries ADD payload_json NVARCHAR(MAX) NULL;
IF COL_LENGTH('dbo.student_leads', 'payload_json') IS NULL
  ALTER TABLE dbo.student_leads ADD payload_json NVARCHAR(MAX) NULL;
GO

IF OBJECT_ID(N'dbo.programs', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.programs (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    program_id NVARCHAR(64) NOT NULL UNIQUE,
    name NVARCHAR(128) NOT NULL,
    rank_level INT NOT NULL CONSTRAINT DF_programs_rank DEFAULT (1),
    payload_json NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_programs_created DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_programs_updated DEFAULT (SYSUTCDATETIME())
  );
END
GO

IF OBJECT_ID(N'dbo.import_history', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.import_history (
    id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
    history_id NVARCHAR(64) NOT NULL UNIQUE,
    payload_json NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_import_history_created DEFAULT (SYSUTCDATETIME())
  );
END
GO
