import {
  University,
  Course,
  CountryMaster,
  ProgramMaster,
  Franchise,
  UserAccount,
  StudentLeadRequest,
  StudentLeadStatus,
  ImportHistoryRecord,
  CounselingMeeting,
} from '../types';
import { saveSqlLead, deleteSqlLead } from './sqlLeadService';
import { authHeaders, setSessionToken } from '../lib/apiAuth';
import { countryDisplayName } from './countryRef';

export interface PortalData {
  universities: University[];
  courses: Course[];
  countries: CountryMaster[];
  programs: ProgramMaster[];
  franchises: Franchise[];
  users: UserAccount[];
  studentLeads: StudentLeadRequest[];
  importHistory: ImportHistoryRecord[];
  meetings: CounselingMeeting[];
}

const SESSION_USER_KEY = 'swc_session_user';

const emptyData = (): PortalData => ({
  universities: [],
  courses: [],
  countries: [],
  programs: [],
  franchises: [],
  users: [],
  studentLeads: [],
  importHistory: [],
  meetings: [],
});

let cache: PortalData = emptyData();
let hydrated = false;

export function isHydrated(): boolean {
  return hydrated;
}

export function getPortalData(): PortalData {
  return cache;
}

function upsertBy<T>(list: T[], item: T, key: keyof T): T[] {
  const id = item[key];
  const idx = list.findIndex((row) => row[key] === id);
  if (idx >= 0) {
    const next = [...list];
    next[idx] = item;
    return next;
  }
  return [item, ...list];
}

function collectionPath(collection: string, id: string): string {
  const encoded = encodeURIComponent(id);
  const map: Record<string, string> = {
    universities: `/api/universities/${encoded}`,
    courses: `/api/courses/${encoded}`,
    countries: `/api/countries/${encoded}`,
    programs: `/api/programs/${encoded}`,
    franchises: `/api/franchises/${encoded}`,
    import_history: `/api/import-history/${encoded}`,
    meetings: `/api/meetings/${encoded}`,
  };
  return map[collection] || `/api/records/${encodeURIComponent(collection)}/${encoded}`;
}

async function putRecord(collection: string, id: string, record: unknown): Promise<void> {
  const res = await fetch(collectionPath(collection, id), {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to save ${collection}`);
  }
}

async function removeRecord(collection: string, id: string): Promise<void> {
  const res = await fetch(`${collectionPath(collection, id)}/delete`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to delete ${collection}`);
  }
}

export async function hydrateFromDatabase(): Promise<PortalData> {
  const res = await fetch('/api/bootstrap', { headers: authHeaders() });
  if (!res.ok) {
    if (res.status === 401) {
      setSessionUser(null);
      throw new Error('SESSION_EXPIRED');
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load portal data from SQL Server');
  }
  const data = await res.json();
  cache = {
    universities: data.universities || [],
    courses: data.courses || [],
    countries: data.countries || [],
    programs: data.programs || [],
    franchises: data.franchises || [],
    users: data.users || [],
    studentLeads: data.studentLeads || [],
    importHistory: data.importHistory || [],
    meetings: data.meetings || [],
  };
  hydrated = true;
  return cache;
}

export async function saveUniversity(u: University): Promise<void> {
  await putRecord('universities', u.university_id, u);
  cache.universities = upsertBy(
    cache.universities,
    { ...u, country: countryDisplayName(u.country, cache.countries) || u.country },
    'university_id'
  );
}

export async function deleteUniversity(id: string): Promise<void> {
  await removeRecord('universities', id);
  cache.universities = cache.universities.filter((u) => u.university_id !== id);
  cache.courses = cache.courses.filter((c) => c.university_id !== id);
}

export async function saveCourse(c: Course): Promise<void> {
  await putRecord('courses', c.course_id, c);
  cache.courses = upsertBy(
    cache.courses,
    {
      ...c,
      destination_country: countryDisplayName(c.destination_country, cache.countries) || c.destination_country,
    },
    'course_id'
  );
}

export async function deleteCourse(id: string): Promise<void> {
  await removeRecord('courses', id);
  cache.courses = cache.courses.filter((c) => c.course_id !== id);
}

export async function deleteCourses(ids: string[]): Promise<void> {
  for (const id of ids) await deleteCourse(id);
}

export async function deleteUniversities(ids: string[]): Promise<void> {
  for (const id of ids) await deleteUniversity(id);
}

export async function saveCountry(c: CountryMaster): Promise<void> {
  await putRecord('countries', c.code, c);
  cache.countries = upsertBy(cache.countries, c, 'code');
}

export async function deleteCountry(code: string): Promise<void> {
  await removeRecord('countries', code);
  cache.countries = cache.countries.filter((c) => c.code !== code);
}

export async function saveFranchise(f: Franchise): Promise<void> {
  await putRecord('franchises', f.id, f);
  cache.franchises = upsertBy(cache.franchises, f, 'id');
}

export async function deleteFranchise(id: string): Promise<void> {
  await removeRecord('franchises', id);
  cache.franchises = cache.franchises.filter((f) => f.id !== id);
}

export async function saveProgram(p: ProgramMaster): Promise<void> {
  await putRecord('programs', p.id, p);
  cache.programs = upsertBy(cache.programs, p, 'id');
}

export async function deleteProgram(id: string): Promise<void> {
  await removeRecord('programs', id);
  cache.programs = cache.programs.filter((p) => p.id !== id);
}

export async function saveImportHistory(h: ImportHistoryRecord): Promise<void> {
  const id = String(h.timestamp || h.file_name || Date.now());
  await putRecord('import_history', id, h);
  cache.importHistory = [h, ...cache.importHistory.filter((x) => String(x.timestamp) !== id)];
}

export async function deleteImportHistory(id: string): Promise<void> {
  await removeRecord('import_history', id);
  cache.importHistory = cache.importHistory.filter((x) => String(x.timestamp) !== id && x.id !== id);
}

export async function saveMeeting(meeting: CounselingMeeting): Promise<CounselingMeeting> {
  const hasId = Boolean(meeting.id);
  const record = { ...meeting, id: meeting.id || `mtg_${Date.now()}` };
  const res = await fetch(hasId ? `/api/meetings/${encodeURIComponent(meeting.id)}` : '/api/meetings', {
    method: hasId ? 'PUT' : 'POST',
    headers: authHeaders(),
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save meeting');
  }
  const saved = (await res.json()) as CounselingMeeting;
  cache.meetings = upsertBy(cache.meetings, saved, 'id');
  return saved;
}

export async function deleteMeeting(id: string): Promise<void> {
  await removeRecord('meetings', id);
  cache.meetings = cache.meetings.filter((m) => m.id !== id);
}

export async function saveUser(user: UserAccount): Promise<void> {
  const res = await fetch('/api/users', {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(user),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save user');
  }
  const { password: _password, ...safeUser } = user;
  cache.users = upsertBy(cache.users, safeUser as UserAccount, 'id');
}

export async function deleteUser(userId: string): Promise<void> {
  const res = await fetch(`/api/users/${encodeURIComponent(userId)}/delete`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete user');
  }
  cache.users = cache.users.filter((u) => u.id !== userId);
}

export async function saveUniversities(unis: University[]): Promise<void> {
  await replaceCollection('universities', unis);
}

export async function saveCourses(list: Course[]): Promise<void> {
  await replaceCollection('courses', list);
}

export async function saveCountries(list: CountryMaster[]): Promise<void> {
  await replaceCollection('countries', list);
}

export async function addImportHistory(h: ImportHistoryRecord): Promise<void> {
  await saveImportHistory(h);
}

export async function saveStudentLead(lead: StudentLeadRequest): Promise<StudentLeadRequest> {
  const saved = await saveSqlLead(lead);
  cache.studentLeads = upsertBy(cache.studentLeads, saved, 'id');
  return saved;
}

export async function deleteStudentLead(leadId: string): Promise<void> {
  await deleteSqlLead(leadId);
  cache.studentLeads = cache.studentLeads.filter((l) => l.id !== leadId);
}

export async function updateLeadStatus(
  leadId: string,
  status: StudentLeadStatus,
  performedBy: string,
  performedByRole: string,
  comment?: string
): Promise<void> {
  const lead = cache.studentLeads.find((l) => l.id === leadId);
  if (!lead) return;
  const updated: StudentLeadRequest = {
    ...lead,
    status,
    updated_at: new Date().toISOString(),
    timeline: [
      ...(lead.timeline || []),
      {
        id: `tl_${Date.now()}`,
        date: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        action: `Status changed to ${status}`,
        performed_by: performedBy,
        performed_by_role: performedByRole as StudentLeadRequest['timeline'][number]['performed_by_role'],
        comment: comment || `Status updated to ${status}`,
      },
    ],
  };
  await saveStudentLead(updated);
}

export async function resetToDefaults(): Promise<PortalData> {
  const res = await fetch('/api/catalog/reset', { method: 'POST', headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to reset catalog in SQL Server');
  }
  return hydrateFromDatabase();
}

export async function replaceCollection<K extends keyof PortalData>(key: K, records: PortalData[K]): Promise<void> {
  cache[key] = records;
  const collectionMap: Record<string, string> = {
    universities: 'universities',
    courses: 'courses',
    countries: 'countries',
    programs: 'programs',
    franchises: 'franchises',
    importHistory: 'import_history',
  };
  const collection = collectionMap[key as string];
  if (!collection) return;
  const items = records as any[];
  const idField =
    key === 'universities' ? 'university_id' :
    key === 'courses' ? 'course_id' :
    key === 'countries' ? 'code' :
    key === 'franchises' ? 'id' :
    key === 'programs' ? 'id' :
    'timestamp';
  for (const item of items) {
    await putRecord(collection, String(item[idField]), item);
  }
}

export function getSessionUser(): UserAccount | null {
  try {
    const raw = sessionStorage.getItem(SESSION_USER_KEY);
    return raw ? (JSON.parse(raw) as UserAccount) : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user: UserAccount | null): void {
  if (!user) {
    sessionStorage.removeItem(SESSION_USER_KEY);
    setSessionToken(null);
  } else sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(user));
}

export function applyLocal(partial: Partial<PortalData>): void {
  cache = { ...cache, ...partial };
}
