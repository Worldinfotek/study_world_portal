import {
  INITIAL_UNIVERSITIES,
  INITIAL_COURSES,
  INITIAL_FRANCHISES,
  COUNTRIES_MASTER,
  PROGRAMS_MASTER,
  INITIAL_IMPORT_HISTORY,
} from '../data/mockData.ts';
import type { University, Course, Franchise, CountryMaster, ProgramMaster, ImportHistoryRecord, UserAccount, StudentLeadRequest, CounselingMeeting } from '../types.ts';
import { mssqlBulk, mssqlExecute, mssqlQuery, mssqlQueries } from './mssql.ts';
import { countryCodeFromValue, countryDisplayName } from '../utils/countryRef.ts';
import { hashPassword } from '../lib/passwordHash.ts';
import { mapSqlUser } from '../mappers/userMapper.ts';
import { mapSqlLead } from '../mappers/leadMapper.ts';

function parsePayload<T>(row: any): T | null {
  if (!row?.payload_json) return null;
  try {
    return typeof row.payload_json === 'string' ? JSON.parse(row.payload_json) : row.payload_json;
  } catch {
    return null;
  }
}

export function universityUpsert(u: University) {
  const country = countryCodeFromValue(u.country, COUNTRIES_MASTER);
  const record = { ...u, country };
  return {
    sql: `MERGE dbo.universities AS t
USING (SELECT @id AS university_id) AS s ON t.university_id = s.university_id
WHEN MATCHED THEN UPDATE SET name=@name, country=@country, city=@city, campus=@campus, ranking=@ranking, logo_url=@logoUrl, website_url=@websiteUrl, status=@status, payload_json=@payloadJson, updated_at=SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (university_id, name, country, city, campus, ranking, logo_url, website_url, status, payload_json)
VALUES (@id, @name, @country, @city, @campus, @ranking, @logoUrl, @websiteUrl, @status, @payloadJson);`,
    params: {
      id: u.university_id,
      name: u.name,
      country,
      city: u.city,
      campus: u.campus || '',
      ranking: u.ranking ?? null,
      logoUrl: u.logo_url || '',
      websiteUrl: u.website || '',
      status: u.status || 'Active',
      payloadJson: JSON.stringify(record),
    },
  };
}

export function courseUpsert(c: Course) {
  const country = countryCodeFromValue(c.destination_country, COUNTRIES_MASTER);
  const record = { ...c, destination_country: country };
  return {
    sql: `MERGE dbo.courses AS t
USING (SELECT @id AS course_id) AS s ON t.course_id = s.course_id
WHEN MATCHED THEN UPDATE SET university_id=@universityId, university_name=@universityName, country=@country, city=@city, course_name=@courseName, discipline=@discipline, level=@level, duration_years=@durationYears, annual_fee=@annualFee, currency=@currency, status=@status, payload_json=@payloadJson, updated_at=SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (course_id, university_id, university_name, country, city, course_name, discipline, level, duration_years, annual_fee, currency, status, payload_json)
VALUES (@id, @universityId, @universityName, @country, @city, @courseName, @discipline, @level, @durationYears, @annualFee, @currency, @status, @payloadJson);`,
    params: {
      id: c.course_id,
      universityId: c.university_id,
      universityName: (c as any).university_name || INITIAL_UNIVERSITIES.find((u) => u.university_id === c.university_id)?.name || c.university_id,
      country,
      city: c.city || '',
      courseName: c.course_name,
      discipline: c.faculty || c.program || 'General',
      level: c.program || 'Bachelor\'s / Undergraduate',
      durationYears: String(c.duration ?? ''),
      annualFee: String(c.tuition_fee ?? ''),
      currency: c.currency || 'USD',
      status: c.status || 'Active',
      payloadJson: JSON.stringify(record),
    },
  };
}

export function franchiseUpsert(f: Franchise) {
  return {
    sql: `MERGE dbo.franchises AS t
USING (SELECT @id AS franchise_id) AS s ON t.franchise_id = s.franchise_id
WHEN MATCHED THEN UPDATE SET name=@name, code=@code, city=@city, country=@country, address=@address, contact_person=@contactPerson, email=@email, phone=@phone, status=@status, payload_json=@payloadJson
WHEN NOT MATCHED THEN INSERT (franchise_id, name, code, city, country, address, contact_person, email, phone, status, payload_json)
VALUES (@id, @name, @code, @city, @country, @address, @contactPerson, @email, @phone, @status, @payloadJson);`,
    params: {
      id: f.id,
      name: f.name,
      code: f.code,
      city: f.city,
      country: f.country,
      address: f.address || '',
      contactPerson: f.contact_person || '',
      email: f.email || '',
      phone: f.phone || '',
      status: f.status || 'Active',
      payloadJson: JSON.stringify(f),
    },
  };
}

export function countryUpsert(c: CountryMaster) {
  return {
    sql: `MERGE dbo.countries AS t
USING (SELECT @code AS code) AS s ON t.code = s.code
WHEN MATCHED THEN UPDATE SET name=@name, flag=@flag, currency=@currency, currency_symbol=@currencySymbol, visa_processing_weeks=@visaWeeks, post_study_work_visa=@psw, psw_duration=@pswDuration, is_active=@isActive, payload_json=@payloadJson, updated_at=SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (code, name, flag, currency, currency_symbol, visa_processing_weeks, post_study_work_visa, psw_duration, is_active, payload_json)
VALUES (@code, @name, @flag, @currency, @currencySymbol, @visaWeeks, @psw, @pswDuration, @isActive, @payloadJson);`,
    params: {
      code: c.code,
      name: c.name,
      flag: c.flag || '',
      currency: c.currency,
      currencySymbol: c.currency_symbol,
      visaWeeks: c.visa_processing_weeks || '',
      psw: c.post_study_work_visa || '',
      pswDuration: c.psw_duration || '',
      isActive: c.is_active === false || c.active === false ? 0 : 1,
      payloadJson: JSON.stringify(c),
    },
  };
}

export function programUpsert(p: ProgramMaster) {
  return {
    sql: `MERGE dbo.programs AS t
USING (SELECT @id AS program_id) AS s ON t.program_id = s.program_id
WHEN MATCHED THEN UPDATE SET name=@name, rank_level=@rankLevel, payload_json=@payloadJson, updated_at=SYSUTCDATETIME()
WHEN NOT MATCHED THEN INSERT (program_id, name, rank_level, payload_json)
VALUES (@id, @name, @rankLevel, @payloadJson);`,
    params: {
      id: p.id,
      name: p.name,
      rankLevel: p.rank_level ?? p.rank ?? 1,
      payloadJson: JSON.stringify(p),
    },
  };
}

export function importHistoryUpsert(h: ImportHistoryRecord) {
  const historyId = String(h.timestamp || h.file_name || Date.now());
  return {
    sql: `MERGE dbo.import_history AS t
USING (SELECT @id AS history_id) AS s ON t.history_id = s.history_id
WHEN MATCHED THEN UPDATE SET payload_json=@payloadJson
WHEN NOT MATCHED THEN INSERT (history_id, payload_json) VALUES (@id, @payloadJson);`,
    params: {
      id: historyId,
      payloadJson: JSON.stringify(h),
    },
  };
}

function catalogSeedRecords() {
  return [
    ...INITIAL_UNIVERSITIES.map(universityUpsert),
    ...INITIAL_COURSES.map(courseUpsert),
    ...INITIAL_FRANCHISES.map(franchiseUpsert),
    ...COUNTRIES_MASTER.map(countryUpsert),
    ...PROGRAMS_MASTER.map(programUpsert),
    ...INITIAL_IMPORT_HISTORY.map(importHistoryUpsert),
  ];
}

export async function seedCatalogIfEmpty(): Promise<void> {
  const seedIfEmpty = async (table: string, records: { sql: string; params: Record<string, unknown> }[]) => {
    const rows = await mssqlQuery<{ cnt: number }>(`SELECT COUNT(*) AS cnt FROM dbo.${table}`);
    if (Number(rows[0]?.cnt || 0) > 0) return;
    const count = await mssqlBulk(records);
    console.log(`[SQL Server] Seeded ${table}: ${count}`);
  };
  await seedIfEmpty('countries', COUNTRIES_MASTER.map(countryUpsert));
  await seedIfEmpty('programs', PROGRAMS_MASTER.map(programUpsert));
  await seedIfEmpty('franchises', INITIAL_FRANCHISES.map(franchiseUpsert));
  await seedIfEmpty('universities', INITIAL_UNIVERSITIES.map(universityUpsert));
  await seedIfEmpty('courses', INITIAL_COURSES.map(courseUpsert));
  await seedIfEmpty('import_history', INITIAL_IMPORT_HISTORY.map(importHistoryUpsert));
  await mssqlExecute(`
    IF COL_LENGTH('dbo.student_leads', 'payload_json') IS NULL
      ALTER TABLE dbo.student_leads ADD payload_json NVARCHAR(MAX) NULL;
  `).catch(() => {});
  await mssqlExecute(`UPDATE dbo.student_leads SET status = N'New Inquiry' WHERE status = N'New Lead'`).catch(() => {});
}

export async function resetAndSeedCatalog(): Promise<number> {
  await mssqlExecute('DELETE FROM dbo.courses');
  await mssqlExecute('DELETE FROM dbo.universities');
  await mssqlExecute('DELETE FROM dbo.countries');
  await mssqlExecute('DELETE FROM dbo.programs');
  await mssqlExecute('DELETE FROM dbo.import_history');
  await mssqlExecute('DELETE FROM dbo.franchises');
  const count = await mssqlBulk(catalogSeedRecords());
  console.log(`[SQL Server] Reset and re-seeded catalog records: ${count}`);
  return count;
}

function asUniversity(row: any): University | null {
  const parsed = parsePayload<University>(row);
  if (parsed?.university_id) return parsed;
  if (!row?.university_id) return null;
  return {
    university_id: row.university_id,
    name: row.name || row.university_id,
    country: row.country || '',
    city: row.city || '',
    campus: row.campus || '',
    website: row.website_url || '',
    logo_url: row.logo_url || '',
    contact_info: { email: '', phone: '' },
    status: row.status || 'Active',
    ranking: row.ranking ?? undefined,
    date_added: row.created_at || new Date().toISOString(),
    last_updated: row.updated_at || new Date().toISOString(),
  };
}

function asCourse(row: any): Course | null {
  const parsed = parsePayload<Course>(row);
  if (parsed?.course_id) return parsed;
  if (!row?.course_id) return null;
  const duration = Number(row.duration_years) || 1;
  return {
    course_id: row.course_id,
    university_id: row.university_id,
    course_name: row.course_name || '',
    destination_country: row.country || '',
    city: row.city || '',
    faculty: row.discipline || 'General',
    program: row.level || "Bachelor's / Undergraduate",
    duration,
    duration_unit: 'years',
    duration_bucket: duration <= 1 ? '0-1' : duration <= 2 ? '1-2' : duration <= 3 ? '2-3' : duration <= 4 ? '3-4' : '4+',
    intake_months: String(row.intakes || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    intake_years: [],
    tuition_fee: Number(row.annual_fee) || 0,
    currency: row.currency || 'USD',
    application_fee: 0,
    application_deadline: row.application_deadline || '',
    scholarship_available: Boolean(row.scholarship_available),
    study_mode: 'On-campus',
    status: row.status || 'Active',
    date_added: row.created_at || new Date().toISOString(),
    last_updated: row.updated_at || new Date().toISOString(),
    eligibility: {
      course_id: row.course_id,
      eligible_nationalities: ['All'],
      restricted_nationalities: [],
      minimum_qualification: 'High School / 12th Grade',
      minimum_qualification_rank: 2,
      study_gap_allowed_years: 5,
      age_requirement_min: 17,
      ielts_overall: 6,
      ielts_min_band: 5.5,
      pte_min: 50,
      toefl_min: 80,
      moi_acceptance: 'Accepted',
      required_documents: [],
      additional_admission_conditions: '',
      important_notes: '',
    },
  } as Course;
}

function asFranchise(row: any): Franchise | null {
  const parsed = parsePayload<Franchise>(row);
  if (parsed?.id) return parsed;
  if (!row?.franchise_id) return null;
  return {
    id: row.franchise_id,
    name: row.name,
    code: row.code,
    city: row.city,
    country: row.country,
    address: row.address || '',
    contact_person: row.contact_person || '',
    email: row.email || '',
    phone: row.phone || '',
    status: row.status || 'Active',
  } as Franchise;
}

function asCountry(row: any): CountryMaster | null {
  const parsed = parsePayload<CountryMaster>(row);
  if (parsed?.code) return parsed;
  if (!row?.code) return null;
  return {
    code: row.code,
    name: row.name,
    flag: row.flag || '',
    currency: row.currency,
    currency_symbol: row.currency_symbol,
    visa_processing_weeks: row.visa_processing_weeks || '',
    post_study_work_visa: row.post_study_work_visa || '',
    psw_duration: row.psw_duration || '',
    is_active: row.is_active !== 0 && row.is_active !== false,
    active: row.is_active !== 0 && row.is_active !== false,
  };
}

function asProgram(row: any): ProgramMaster | null {
  const parsed = parsePayload<ProgramMaster>(row);
  const rankLevel = Number(parsed?.rank_level ?? parsed?.rank ?? row.rank_level) || 1;
  const duration = parsed?.typical_duration || parsed?.typical_duration_years || '';
  if (parsed?.id) {
    return {
      ...parsed,
      rank: parsed.rank ?? rankLevel,
      rank_level: rankLevel,
      typical_duration: duration,
      typical_duration_years: parsed.typical_duration_years || duration,
    };
  }
  if (!row?.program_id) return null;
  return {
    id: row.program_id,
    name: row.name,
    rank: rankLevel,
    rank_level: rankLevel,
    description: '',
    typical_duration: duration,
    typical_duration_years: duration,
    active_courses_count: 0,
  } as ProgramMaster;
}

function asLead(row: any): StudentLeadRequest | null {
  const parsed = parsePayload<StudentLeadRequest>(row);
  if (parsed?.id) return parsed;
  if (!row?.lead_id) return null;
  return {
    id: row.lead_id,
    student_name: row.student_name || '',
    student_email: row.email || '',
    student_phone: row.phone || '',
    student_city: row.city || '',
    nationality: '',
    academic_score: row.academic_score || '',
    english_test: row.english_test_score || '',
    course_id: row.course_id || '',
    course_name: row.course_name || '',
    university_id: row.university_id || '',
    university_name: row.university_name || '',
    destination_country: row.destination_country || '',
    city: row.city || '',
    counselor_id: row.counselor_id || '',
    counselor_name: row.counselor_name || '',
    counselor_email: row.counselor_email || '',
    franchise_id: row.franchise_id || 'ho',
    franchise_name: row.franchise_name || 'Head Office',
    request_type: row.request_type || 'Course Application',
    priority: row.priority || 'Medium',
    status: row.status === 'New Lead' ? 'New Inquiry' : row.status || 'New Inquiry',
    notes: row.notes || '',
    meet_link: row.meet_link || '',
    timeline: [],
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  } as StudentLeadRequest;
}

function asMeeting(row: any): CounselingMeeting | null {
  if (!row?.meeting_id && !row?.id) return null;
  return {
    id: row.meeting_id || row.id,
    lead_id: row.lead_id || undefined,
    student_name: row.student_name || '',
    student_email: row.student_email || '',
    counselor_email: row.counselor_email || '',
    title: row.title || '',
    description: row.description || '',
    meet_uri: row.meet_uri || '',
    calendar_event_id: row.calendar_event_id || '',
    start_time: row.start_time || '',
    end_time: row.end_time || '',
    status: row.status || 'scheduled',
    created_at: row.created_at || new Date().toISOString(),
  };
}

function asImportHistory(row: any): ImportHistoryRecord | null {
  return parsePayload<ImportHistoryRecord>(row);
}

function asUserAccount(row: any): UserAccount | null {
  if (!row?.uid && !row?.email) return null;
  return mapSqlUser(row) as UserAccount;
}

export async function loadBootstrap() {
  const grouped = await mssqlQueries([
    { name: 'universities', query: 'SELECT * FROM dbo.universities' },
    { name: 'courses', query: 'SELECT * FROM dbo.courses' },
    { name: 'franchises', query: 'SELECT * FROM dbo.franchises' },
    { name: 'countries', query: 'SELECT * FROM dbo.countries' },
    { name: 'programs', query: 'SELECT * FROM dbo.programs' },
    { name: 'import_history', query: 'SELECT * FROM dbo.import_history' },
    { name: 'users', query: 'SELECT uid, email, name, role, department, status, is_active, export_permission, franchise_id, franchise_name, photo_url, phone, auth_provider FROM dbo.users' },
    { name: 'leads', query: 'SELECT * FROM dbo.student_leads ORDER BY created_at DESC' },
    { name: 'meetings', query: 'SELECT * FROM dbo.counseling_meetings ORDER BY start_time DESC' },
  ]);

  const asRows = (value: any): any[] => (Array.isArray(value) ? value : value ? [value] : []);
  const uniRows = asRows(grouped.universities);
  const courseRows = asRows(grouped.courses);
  const franchiseRows = asRows(grouped.franchises);
  const countryRows = asRows(grouped.countries);
  const programRows = asRows(grouped.programs);
  const historyRows = asRows(grouped.import_history);
  const userRows = asRows(grouped.users);
  const leadRows = asRows(grouped.leads);
  const meetingRows = asRows(grouped.meetings);

  const countries = countryRows.map(asCountry).filter(Boolean) as CountryMaster[];
  const universities = (uniRows.map(asUniversity).filter(Boolean) as University[]).map((u) => ({
    ...u,
    country: countryDisplayName(u.country, countries),
  }));
  const courses = (courseRows.map(asCourse).filter(Boolean) as Course[]).map((c) => ({
    ...c,
    destination_country: countryDisplayName(c.destination_country, countries),
  }));
  const leads = (leadRows.map(asLead).filter(Boolean) as StudentLeadRequest[]).map((lead) => ({
    ...lead,
    status: (String(lead.status) === 'New Lead' ? 'New Inquiry' : lead.status) as StudentLeadRequest['status'],
    request_type: (String(lead.request_type) === 'Direct Admission' ? 'Course Application' : lead.request_type) as StudentLeadRequest['request_type'],
  }));

  return {
    universities,
    courses,
    franchises: franchiseRows.map(asFranchise).filter(Boolean) as Franchise[],
    countries,
    programs: programRows.map(asProgram).filter(Boolean) as ProgramMaster[],
    importHistory: historyRows.map((row) => parsePayload<ImportHistoryRecord>(row)).filter(Boolean) as ImportHistoryRecord[],
    users: userRows.map((row: any) => ({
      id: row.uid,
      email: String(row.email || '').toLowerCase(),
      name: row.name,
      role: row.role,
      status: row.status === 'Inactive' || row.is_active === false || row.is_active === 0 ? 'Inactive' : 'Active',
      export_permission: Boolean(row.export_permission),
      department: row.department || 'Portal User',
      franchise_id: row.franchise_id || undefined,
      franchise_name: row.franchise_name || undefined,
      avatar_url: row.photo_url || undefined,
      phone: row.phone || undefined,
      auth_provider: row.auth_provider || 'email',
      last_login: new Date().toISOString(),
    })) as UserAccount[],
    studentLeads: leads,
    meetings: meetingRows.map(asMeeting).filter(Boolean) as CounselingMeeting[],
  };
}

export async function upsertCollectionRecord(collection: string, record: any): Promise<void> {
  let item: { sql: string; params: Record<string, unknown> };
  switch (collection) {
    case 'universities':
      item = universityUpsert(record);
      break;
    case 'courses':
      item = courseUpsert(record);
      break;
    case 'franchises':
      item = franchiseUpsert(record);
      break;
    case 'countries':
      item = countryUpsert(record);
      break;
    case 'programs':
      item = programUpsert(record);
      break;
    case 'import_history':
      item = importHistoryUpsert(record);
      break;
    default:
      throw new Error(`Unsupported collection: ${collection}`);
  }
  await mssqlExecute(item.sql, item.params);
}

export async function deleteCollectionRecord(collection: string, id: string): Promise<void> {
  const map: Record<string, { table: string; column: string }> = {
    universities: { table: 'universities', column: 'university_id' },
    courses: { table: 'courses', column: 'course_id' },
    franchises: { table: 'franchises', column: 'franchise_id' },
    countries: { table: 'countries', column: 'code' },
    programs: { table: 'programs', column: 'program_id' },
    import_history: { table: 'import_history', column: 'history_id' },
  };
  const target = map[collection];
  if (!target) throw new Error(`Unsupported collection: ${collection}`);
  if (collection === 'universities') {
    await mssqlExecute('DELETE FROM dbo.courses WHERE university_id = @id', { id });
  }
  await mssqlExecute(`DELETE FROM dbo.${target.table} WHERE ${target.column} = @id`, { id });
}

export async function saveSqlUser(user: UserAccount, password?: string): Promise<void> {
  const incomingPassword = password || user.password;
  const hashed = incomingPassword ? hashPassword(incomingPassword) : undefined;
  await mssqlExecute(
    `MERGE dbo.users AS t
     USING (SELECT @email AS email) AS s ON LOWER(t.email) = LOWER(s.email)
     WHEN MATCHED THEN UPDATE SET
       uid=@uid, name=@name, role=@role, department=@department, status=@status, is_active=@isActive,
       export_permission=@exportPermission, franchise_id=@franchiseId, franchise_name=@franchiseName,
       photo_url=@photoUrl, phone=@phone, auth_provider=@authProvider, updated_at=SYSUTCDATETIME()
       ${hashed ? ', password=@password' : ''}
     WHEN NOT MATCHED THEN INSERT (uid, email, name, password, role, department, status, is_active, export_permission, franchise_id, franchise_name, photo_url, phone, auth_provider)
     VALUES (@uid, @email, @name, @password, @role, @department, @status, @isActive, @exportPermission, @franchiseId, @franchiseName, @photoUrl, @phone, @authProvider);`,
    {
      uid: user.id,
      email: user.email,
      name: user.name,
      password: hashed || null,
      role: user.role,
      department: user.department || '',
      status: user.status || 'Active',
      isActive: user.status === 'Inactive' ? 0 : 1,
      exportPermission: user.export_permission ? 1 : 0,
      franchiseId: user.franchise_id || null,
      franchiseName: user.franchise_name || null,
      photoUrl: user.avatar_url || null,
      phone: user.phone || null,
      authProvider: user.auth_provider || 'email',
    }
  );
}

export async function deleteSqlUser(userId: string): Promise<void> {
  await mssqlExecute('DELETE FROM dbo.users WHERE uid = @uid', { uid: userId });
}

export async function findSqlUserRowByEmail(email: string): Promise<any | null> {
  const rows = await mssqlQuery('SELECT TOP 1 * FROM dbo.users WHERE LOWER(email) = LOWER(@email)', { email });
  return rows[0] || null;
}

export async function findSqlUserProfileByEmail(email: string): Promise<any | null> {
  const rows = await mssqlQuery(
    'SELECT TOP 1 uid, email, name, role, department, status, is_active, export_permission, franchise_id, franchise_name, photo_url, phone, auth_provider FROM dbo.users WHERE LOWER(email) = LOWER(@email)',
    { email }
  );
  return rows[0] || null;
}

export async function updateSqlUserPassword(email: string, hashedPassword: string): Promise<void> {
  await mssqlExecute(
    'UPDATE dbo.users SET password = @password, updated_at = SYSUTCDATETIME() WHERE LOWER(email) = LOWER(@email)',
    { email, password: hashedPassword }
  );
}

export async function touchSqlUser(email: string): Promise<void> {
  await mssqlExecute('UPDATE dbo.users SET updated_at = SYSUTCDATETIME() WHERE LOWER(email) = LOWER(@email)', { email });
}

export async function listSqlLeads(): Promise<any[]> {
  return mssqlQuery('SELECT * FROM dbo.student_leads ORDER BY created_at DESC');
}

export async function findSqlLeadById(leadId: string): Promise<any | null> {
  const rows = await mssqlQuery('SELECT TOP 1 * FROM dbo.student_leads WHERE lead_id = @leadId', { leadId });
  return rows[0] || null;
}

function clip(value: unknown, max: number, fallback = ''): string {
  const text = String(value ?? '').trim();
  return (text || fallback).slice(0, max);
}

export async function saveSqlLeadRecord(leadData: any): Promise<any> {
  const leadId = clip(leadData.id || `lead_${Date.now()}`, 64);
  const fullLead = { ...leadData, id: leadId, updated_at: new Date().toISOString() };
  await mssqlExecute(
    `MERGE dbo.student_leads AS t
     USING (SELECT @leadId AS lead_id) AS s
     ON t.lead_id = s.lead_id
     WHEN MATCHED THEN UPDATE SET
       student_name = @studentName,
       email = @email,
       phone = @phone,
       city = @city,
       counselor_id = @counselorId,
       counselor_name = @counselorName,
       counselor_email = @counselorEmail,
       franchise_id = @franchiseId,
       franchise_name = @franchiseName,
       course_id = @courseId,
       course_name = @courseName,
       university_id = @universityId,
       university_name = @universityName,
       destination_country = @destinationCountry,
       target_intake = @targetIntake,
       academic_score = @academicScore,
       english_test_score = @englishTestScore,
       status = @status,
       priority = @priority,
       request_type = @requestType,
       notes = @notes,
       meet_link = @meetLink,
       calendar_event_id = @calendarEventId,
       google_doc_id = @googleDocId,
       payload_json = @payloadJson,
       updated_at = SYSUTCDATETIME()
     WHEN NOT MATCHED THEN INSERT (
       lead_id, student_name, email, phone, city, counselor_id, counselor_name, counselor_email,
       franchise_id, franchise_name, course_id, course_name, university_id, university_name,
       destination_country, target_intake, academic_score, english_test_score, status, priority,
       request_type, notes, meet_link, calendar_event_id, google_doc_id, payload_json
     ) VALUES (
       @leadId, @studentName, @email, @phone, @city, @counselorId, @counselorName, @counselorEmail,
       @franchiseId, @franchiseName, @courseId, @courseName, @universityId, @universityName,
       @destinationCountry, @targetIntake, @academicScore, @englishTestScore, @status, @priority,
       @requestType, @notes, @meetLink, @calendarEventId, @googleDocId, @payloadJson
     );`,
    {
      leadId,
      studentName: clip(fullLead.student_name, 128, 'Unknown student'),
      email: clip(fullLead.student_email || fullLead.email, 256),
      phone: clip(fullLead.student_phone || fullLead.phone, 64),
      city: clip(fullLead.student_city || fullLead.city, 64),
      counselorId: clip(fullLead.counselor_id, 128, 'counselor_1'),
      counselorName: clip(fullLead.counselor_name, 128, 'Counselor'),
      counselorEmail: clip(fullLead.counselor_email, 256),
      franchiseId: clip(fullLead.franchise_id, 64, 'ho'),
      franchiseName: clip(fullLead.franchise_name, 256, 'Head Office'),
      courseId: clip(fullLead.course_id, 64, 'unassigned'),
      courseName: clip(fullLead.course_name, 256, 'Unassigned'),
      universityId: clip(fullLead.university_id, 64, 'unassigned'),
      universityName: clip(fullLead.university_name, 256, 'Unassigned'),
      destinationCountry: clip(fullLead.destination_country, 64, 'Unknown'),
      targetIntake: clip(fullLead.target_intake || fullLead.intake, 64),
      academicScore: clip(fullLead.academic_score, 64),
      englishTestScore: clip(fullLead.english_test_score || fullLead.english_test, 64),
      status: clip(fullLead.status === 'New Lead' ? 'New Inquiry' : fullLead.status, 64, 'New Inquiry'),
      priority: clip(fullLead.priority, 32, 'Medium'),
      requestType: clip(
        fullLead.request_type === 'Direct Admission' ? 'Course Application' : fullLead.request_type,
        64,
        'Course Application'
      ),
      notes: clip(fullLead.notes, 2000),
      meetLink: clip(fullLead.meet_link, 512),
      calendarEventId: clip(fullLead.calendar_event_id, 128),
      googleDocId: clip(fullLead.google_doc_id, 128),
      payloadJson: JSON.stringify(fullLead),
    }
  );
  return (await findSqlLeadById(leadId)) || { lead_id: leadId, payload_json: JSON.stringify(fullLead) };
}

export async function deleteSqlLeadRecord(leadId: string): Promise<void> {
  await mssqlExecute('DELETE FROM dbo.student_leads WHERE lead_id = @leadId', { leadId });
}

export async function getSqlTableCounts(): Promise<{
  student_leads: number;
  courses: number;
  universities: number;
  users: number;
  countries: number;
  franchises: number;
  programs: number;
  import_history: number;
  counseling_meetings: number;
}> {
  const [leads, courseRows, uniRows, userRows, countryRows, franchiseRows, programRows, historyRows, meetingRows] = await Promise.all([
    mssqlQuery('SELECT COUNT(*) AS cnt FROM dbo.student_leads'),
    mssqlQuery('SELECT COUNT(*) AS cnt FROM dbo.courses'),
    mssqlQuery('SELECT COUNT(*) AS cnt FROM dbo.universities'),
    mssqlQuery('SELECT COUNT(*) AS cnt FROM dbo.users'),
    mssqlQuery('SELECT COUNT(*) AS cnt FROM dbo.countries'),
    mssqlQuery('SELECT COUNT(*) AS cnt FROM dbo.franchises'),
    mssqlQuery('SELECT COUNT(*) AS cnt FROM dbo.programs').catch(() => [{ cnt: 0 }]),
    mssqlQuery('SELECT COUNT(*) AS cnt FROM dbo.import_history').catch(() => [{ cnt: 0 }]),
    mssqlQuery('SELECT COUNT(*) AS cnt FROM dbo.counseling_meetings').catch(() => [{ cnt: 0 }]),
  ]);
  return {
    student_leads: Number(leads[0]?.cnt || 0),
    courses: Number(courseRows[0]?.cnt || 0),
    universities: Number(uniRows[0]?.cnt || 0),
    users: Number(userRows[0]?.cnt || 0),
    countries: Number(countryRows[0]?.cnt || 0),
    franchises: Number(franchiseRows[0]?.cnt || 0),
    programs: Number(programRows[0]?.cnt || 0),
    import_history: Number(historyRows[0]?.cnt || 0),
    counseling_meetings: Number(meetingRows[0]?.cnt || 0),
  };
}

const USER_PROFILE_SQL =
  'uid, email, name, role, department, status, is_active, export_permission, franchise_id, franchise_name, photo_url, phone, auth_provider';

export async function listCountries(): Promise<CountryMaster[]> {
  const rows = await mssqlQuery('SELECT * FROM dbo.countries');
  return rows.map(asCountry).filter(Boolean) as CountryMaster[];
}

export async function getCountryByCode(code: string): Promise<CountryMaster | null> {
  const rows = await mssqlQuery('SELECT TOP 1 * FROM dbo.countries WHERE code = @code', { code });
  return asCountry(rows[0]) || null;
}

export async function listUniversities(): Promise<University[]> {
  const [rows, countries] = await Promise.all([mssqlQuery('SELECT * FROM dbo.universities'), listCountries()]);
  return (rows.map(asUniversity).filter(Boolean) as University[]).map((u) => ({
    ...u,
    country: countryDisplayName(u.country, countries),
  }));
}

export async function getUniversityById(id: string): Promise<University | null> {
  const [rows, countries] = await Promise.all([
    mssqlQuery('SELECT TOP 1 * FROM dbo.universities WHERE university_id = @id', { id }),
    listCountries(),
  ]);
  const uni = asUniversity(rows[0]);
  if (!uni) return null;
  return { ...uni, country: countryDisplayName(uni.country, countries) };
}

export async function listCourses(): Promise<Course[]> {
  const [rows, countries] = await Promise.all([mssqlQuery('SELECT * FROM dbo.courses'), listCountries()]);
  return (rows.map(asCourse).filter(Boolean) as Course[]).map((c) => ({
    ...c,
    destination_country: countryDisplayName(c.destination_country, countries),
  }));
}

export async function getCourseById(id: string): Promise<Course | null> {
  const [rows, countries] = await Promise.all([
    mssqlQuery('SELECT TOP 1 * FROM dbo.courses WHERE course_id = @id', { id }),
    listCountries(),
  ]);
  const course = asCourse(rows[0]);
  if (!course) return null;
  return { ...course, destination_country: countryDisplayName(course.destination_country, countries) };
}

export async function listFranchises(): Promise<Franchise[]> {
  const rows = await mssqlQuery('SELECT * FROM dbo.franchises');
  return rows.map(asFranchise).filter(Boolean) as Franchise[];
}

export async function getFranchiseById(id: string): Promise<Franchise | null> {
  const rows = await mssqlQuery('SELECT TOP 1 * FROM dbo.franchises WHERE franchise_id = @id', { id });
  return asFranchise(rows[0]);
}

export async function listPrograms(): Promise<ProgramMaster[]> {
  const rows = await mssqlQuery('SELECT * FROM dbo.programs');
  return rows.map(asProgram).filter(Boolean) as ProgramMaster[];
}

export async function getProgramById(id: string): Promise<ProgramMaster | null> {
  const rows = await mssqlQuery('SELECT TOP 1 * FROM dbo.programs WHERE program_id = @id', { id });
  return asProgram(rows[0]);
}

export async function listImportHistory(): Promise<ImportHistoryRecord[]> {
  const rows = await mssqlQuery('SELECT * FROM dbo.import_history');
  return rows.map(asImportHistory).filter(Boolean) as ImportHistoryRecord[];
}

export async function getImportHistoryById(id: string): Promise<ImportHistoryRecord | null> {
  const rows = await mssqlQuery('SELECT TOP 1 * FROM dbo.import_history WHERE history_id = @id', { id });
  return asImportHistory(rows[0]);
}

export async function listSqlUsers(): Promise<UserAccount[]> {
  const rows = await mssqlQuery(`SELECT ${USER_PROFILE_SQL} FROM dbo.users`);
  return rows.map(asUserAccount).filter(Boolean) as UserAccount[];
}

export async function getSqlUserById(id: string): Promise<UserAccount | null> {
  const rows = await mssqlQuery(`SELECT TOP 1 ${USER_PROFILE_SQL} FROM dbo.users WHERE uid = @id`, { id });
  return asUserAccount(rows[0]);
}

export async function getMappedLeadById(leadId: string): Promise<StudentLeadRequest | null> {
  const row = await findSqlLeadById(leadId);
  if (!row) return null;
  return mapSqlLead(row) as StudentLeadRequest;
}

export async function listMeetings(): Promise<CounselingMeeting[]> {
  const rows = await mssqlQuery('SELECT * FROM dbo.counseling_meetings ORDER BY start_time DESC');
  return rows.map(asMeeting).filter(Boolean) as CounselingMeeting[];
}

export async function getMeetingById(id: string): Promise<CounselingMeeting | null> {
  const rows = await mssqlQuery('SELECT TOP 1 * FROM dbo.counseling_meetings WHERE meeting_id = @id', { id });
  return asMeeting(rows[0]);
}

export async function saveMeeting(record: any): Promise<CounselingMeeting> {
  const meetingId = record.id || record.meeting_id || `mtg_${Date.now()}`;
  await mssqlExecute(
    `MERGE dbo.counseling_meetings AS t
     USING (SELECT @id AS meeting_id) AS s ON t.meeting_id = s.meeting_id
     WHEN MATCHED THEN UPDATE SET
       lead_id=@leadId, student_name=@studentName, student_email=@studentEmail, counselor_email=@counselorEmail,
       title=@title, description=@description, meet_uri=@meetUri, calendar_event_id=@calendarEventId,
       start_time=@startTime, end_time=@endTime, status=@status
     WHEN NOT MATCHED THEN INSERT (
       meeting_id, lead_id, student_name, student_email, counselor_email, title, description,
       meet_uri, calendar_event_id, start_time, end_time, status
     ) VALUES (
       @id, @leadId, @studentName, @studentEmail, @counselorEmail, @title, @description,
       @meetUri, @calendarEventId, @startTime, @endTime, @status
     );`,
    {
      id: meetingId,
      leadId: record.lead_id || null,
      studentName: record.student_name || '',
      studentEmail: record.student_email || '',
      counselorEmail: record.counselor_email || '',
      title: record.title || 'Counseling meeting',
      description: record.description || '',
      meetUri: record.meet_uri || '',
      calendarEventId: record.calendar_event_id || '',
      startTime: record.start_time || new Date().toISOString(),
      endTime: record.end_time || new Date().toISOString(),
      status: record.status || 'scheduled',
    }
  );
  return (await getMeetingById(meetingId)) || { ...record, id: meetingId };
}

export async function deleteMeeting(id: string): Promise<void> {
  await mssqlExecute('DELETE FROM dbo.counseling_meetings WHERE meeting_id = @id', { id });
}
