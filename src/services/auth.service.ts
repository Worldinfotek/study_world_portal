import { hashPassword, isHashedPassword, verifyPassword } from '../lib/passwordHash.ts';
import { createSessionToken } from '../middleware/auth.ts';
import { isInactiveUserRow, mapSqlUser } from '../mappers/userMapper.ts';
import { HttpError } from '../server/httpError.ts';
import {
  findSqlUserRowByEmail,
  saveSqlUser,
  touchSqlUser,
  updateSqlUserPassword,
} from '../db/catalog.ts';

export async function login(emailRaw: string, passwordRaw: string) {
  const email = String(emailRaw || '').trim().toLowerCase();
  const password = String(passwordRaw || '').trim();
  if (!email || !password) {
    throw new HttpError(400, 'Email and password are required.');
  }
  const row = await findSqlUserRowByEmail(email);
  if (!row) {
    throw new HttpError(404, 'No account found for this email.');
  }
  if (isInactiveUserRow(row)) {
    throw new HttpError(403, 'This account is currently marked Inactive.');
  }
  if (!verifyPassword(password, String(row.password || ''))) {
    throw new HttpError(401, 'Incorrect password.');
  }
  if (!isHashedPassword(String(row.password || ''))) {
    await updateSqlUserPassword(email, hashPassword(password));
  } else {
    await touchSqlUser(email);
  }
  const user = mapSqlUser(row);
  const token = createSessionToken({ id: user.id, email: user.email, role: user.role });
  return { source: 'sql', user, token };
}

export async function register(body: any) {
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '').trim();
  const name = String(body?.name || '').trim();
  if (!email || !password || !name) {
    throw new HttpError(400, 'Name, email, and password are required.');
  }
  const existing = await findSqlUserRowByEmail(email);
  if (existing) {
    throw new HttpError(409, 'An account with this email already exists.');
  }
  const user = {
    id: `usr_${Date.now().toString(36)}`,
    email,
    name,
    role: 'User',
    status: 'Active',
    export_permission: true,
    department: body?.department || 'Public Student Portal',
    phone: body?.phone || undefined,
    auth_provider: 'email',
    last_login: new Date().toISOString(),
  };
  await saveSqlUser(user as any, password);
  const token = createSessionToken({ id: user.id, email: user.email, role: user.role });
  return { source: 'sql', user, token };
}

export async function createExternalSession(body: any) {
  const email = String(body?.email || '').trim().toLowerCase();
  const name = String(body?.name || email.split('@')[0]).trim();
  if (!email || !email.includes('@')) {
    throw new HttpError(400, 'A valid email is required.');
  }
  const row = await findSqlUserRowByEmail(email);
  let user;
  if (row) {
    if (isInactiveUserRow(row)) {
      throw new HttpError(403, 'This account is currently marked Inactive.');
    }
    user = mapSqlUser(row);
  } else {
    user = {
      id: `usr_g_${Date.now().toString(36)}`,
      email,
      name,
      role: 'User',
      status: 'Active',
      export_permission: true,
      department: 'Public Student Portal',
      avatar_url: body?.photo || undefined,
      auth_provider: 'google',
      last_login: new Date().toISOString(),
    };
    await saveSqlUser(user as any);
  }
  const token = createSessionToken({ id: user.id, email: user.email, role: user.role });
  return { source: 'sql', user, token };
}

export async function changePassword(email: string | undefined, currentPasswordRaw: string, newPasswordRaw: string) {
  const currentPassword = String(currentPasswordRaw || '').trim();
  const newPassword = String(newPasswordRaw || '').trim();
  if (!email) {
    throw new HttpError(401, 'Please sign in to continue.');
  }
  if (newPassword.length < 8) {
    throw new HttpError(400, 'New password must be at least 8 characters long.');
  }
  const row = await findSqlUserRowByEmail(email);
  if (!row) {
    throw new HttpError(404, 'Account not found.');
  }
  if (!verifyPassword(currentPassword, String(row.password || ''))) {
    throw new HttpError(401, 'Current password is incorrect.');
  }
  await updateSqlUserPassword(email, hashPassword(newPassword));
  return { ok: true };
}
