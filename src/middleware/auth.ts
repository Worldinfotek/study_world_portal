import { randomBytes } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

export interface PortalSession {
  userId: string;
  email: string;
  role: string;
  createdAt: number;
}

export interface AuthRequest extends Request {
  portalUser?: PortalSession;
}

const sessions = new Map<string, PortalSession>();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function pruneSessions() {
  const cutoff = Date.now() - SESSION_TTL_MS;
  for (const [token, session] of sessions) {
    if (session.createdAt < cutoff) sessions.delete(token);
  }
}

export function createSessionToken(user: { id: string; email: string; role: string }): string {
  pruneSessions();
  const token = randomBytes(32).toString('hex');
  sessions.set(token, {
    userId: user.id,
    email: user.email,
    role: user.role,
    createdAt: Date.now(),
  });
  return token;
}

export function revokeSessionToken(token: string | undefined) {
  if (token) sessions.delete(token);
}

export function readBearerToken(req: Request): string {
  const header = String(req.headers.authorization || '');
  if (header.startsWith('Bearer ')) return header.slice(7).trim();
  return '';
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  pruneSessions();
  const token = readBearerToken(req);
  const session = token ? sessions.get(token) : undefined;
  if (!session) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  req.portalUser = session;
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.portalUser) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  if (req.portalUser.role !== 'Admin' && req.portalUser.role !== 'Super Admin') {
    return res.status(403).json({ error: 'Administrator access is required.' });
  }
  next();
}
