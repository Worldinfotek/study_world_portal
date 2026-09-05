import {
  deleteSqlUser,
  findSqlUserProfileByEmail,
  getSqlUserById,
  listSqlUsers,
  saveSqlUser,
} from '../db/catalog.ts';
import { mapSqlUser } from '../mappers/userMapper.ts';
import { HttpError } from '../server/httpError.ts';

export async function list() {
  return listSqlUsers();
}

export async function getById(id: string) {
  const item = await getSqlUserById(id);
  if (!item) throw new HttpError(404, 'User not found.');
  return item;
}

export async function lookupUserByEmail(emailRaw: string) {
  const email = String(emailRaw || '').trim().toLowerCase();
  if (!email || !email.includes('@')) {
    throw new HttpError(400, 'A valid email is required.');
  }
  const row = await findSqlUserProfileByEmail(email);
  if (!row) return { user: null, source: 'sql' };
  return { source: 'sql', user: mapSqlUser(row) };
}

export async function save(body: any, id?: string) {
  const record = { ...body, id: body?.id || id || `user_${Date.now()}` };
  if (!record.email) throw new HttpError(400, 'Email is required.');
  await saveSqlUser(record, record.password);
  const saved = await getSqlUserById(record.id);
  if (saved) return saved;
  const row = await findSqlUserProfileByEmail(String(record.email).trim().toLowerCase());
  if (!row) throw new HttpError(500, 'User was not saved.');
  return mapSqlUser(row);
}

export async function saveUser(body: any) {
  return save(body);
}

export async function remove(userId: string) {
  if (!userId) throw new HttpError(400, 'User id is required.');
  await getById(userId);
  await deleteSqlUser(userId);
  return { ok: true, id: userId };
}

export async function removeUser(userId: string) {
  return remove(userId);
}
