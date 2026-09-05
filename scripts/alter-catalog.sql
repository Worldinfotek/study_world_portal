USE study_world_portal;
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
