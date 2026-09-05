import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync } from 'node:fs';
import { mkdtemp, writeFile, unlink, rmdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { HttpError } from '../server/httpError.ts';

const execFileAsync = promisify(execFile);

function resolveSqlScript(name: string): string {
  const candidates = [
    path.join(process.cwd(), 'src', 'db', name),
    path.join(process.cwd(), 'dist', name),
  ];
  const found = candidates.find((file) => existsSync(file));
  if (!found) throw new HttpError(503, `SQL helper script missing: ${name}`);
  return found;
}

const scriptPath = resolveSqlScript('run-query.ps1');
const bulkScriptPath = resolveSqlScript('bulk-upsert.ps1');

function sqlValue(value: string): string {
  if (/[;='"]/.test(value)) return `'${value.replace(/'/g, "''")}'`;
  return value;
}

export function sqlServerName(): string {
  return String(process.env.SQL_HOST || String.raw`(localdb)\MSSQLLocalDB`).replace(/:0$/, '');
}

export function connectionString(): string {
  const server = sqlServerName();
  const database = process.env.SQL_DB_NAME || 'study_world_portal';
  const user = String(process.env.SQL_USER || '').trim();
  const password = String(process.env.SQL_PASSWORD || '');
  const auth = String(process.env.SQL_AUTH || (user ? 'sql' : 'windows')).toLowerCase();
  const common = 'TrustServerCertificate=True;Encrypt=False;Connection Timeout=60';
  if (auth === 'sql' || user) {
    if (!user || !password) {
      throw new HttpError(503, 'SQL_USER and SQL_PASSWORD are required for this database login.');
    }
    return `Server=${sqlValue(server)};Database=${sqlValue(database)};User Id=${sqlValue(user)};Password=${sqlValue(password)};${common}`;
  }
  return `Server=${sqlValue(server)};Database=${sqlValue(database)};Integrated Security=True;${common}`;
}

function sqlUnavailable(err: unknown): never {
  const message = String((err as { stderr?: string; message?: string })?.stderr || (err as Error)?.message || err);
  const safe = message.replace(/Password=[^;]+/gi, 'Password=***').slice(0, 400);
  console.error('[SQL Server]', safe);
  if (/circular reference/i.test(message)) {
    throw new HttpError(503, 'SQL Server result serialization failed. Please try again.');
  }
  if (/Cannot open database|RECOVERY_PENDING|not accessible|Login failed|Connection Timeout|Locating Server/i.test(message)) {
    throw new HttpError(503, 'SQL Server is temporarily unavailable. Please try again.');
  }
  throw new HttpError(503, 'Could not query SQL Server. Please try again.');
}

async function runPayload(payload: Record<string, unknown>): Promise<string> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'swc-sql-'));
  const payloadPath = path.join(dir, 'payload.json');
  await writeFile(payloadPath, JSON.stringify(payload), 'utf8');
  try {
    const { stdout, stderr } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-PayloadPath', payloadPath],
      { windowsHide: true, maxBuffer: 20 * 1024 * 1024 }
    );
    if (stderr && stderr.trim()) {
      console.warn('[SQL Server]', stderr.trim());
    }
    const fileOut = `${payloadPath}.out.json`;
    try {
      const fileJson = await readFile(fileOut, 'utf8');
      await unlink(fileOut).catch(() => {});
      return fileJson.trim();
    } catch {
      return stdout.trim();
    }
  } catch (err) {
    sqlUnavailable(err);
  } finally {
    await unlink(payloadPath).catch(() => {});
    await rmdir(dir).catch(() => {});
  }
}

export async function mssqlQueries(
  queries: { name: string; query: string; params?: Record<string, unknown> }[]
): Promise<Record<string, any[]>> {
  const raw = await runPayload({
    connectionString: connectionString(),
    queries,
  });
  if (!raw) return {};
  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== 'object') return {};
  const normalized: Record<string, any[]> = {};
  for (const [key, value] of Object.entries(parsed)) {
    normalized[key] = Array.isArray(value) ? value : value ? [value] : [];
  }
  return normalized;
}

export async function mssqlQuery<T = Record<string, any>>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const raw = await runPayload({
    connectionString: connectionString(),
    query,
    params,
    execute: false,
  });
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [parsed];
}

export async function mssqlExecute(query: string, params: Record<string, unknown> = {}): Promise<number> {
  const raw = await runPayload({
    connectionString: connectionString(),
    query,
    params,
    execute: true,
  });
  if (!raw) return 0;
  const parsed = JSON.parse(raw);
  return Number(parsed?.rowsAffected || 0);
}

export async function testSqlConnection(): Promise<{ ok: boolean; database: string; server: string }> {
  const rows = await mssqlQuery<{ name: string }>('SELECT DB_NAME() AS name');
  return {
    ok: true,
    database: rows[0]?.name || process.env.SQL_DB_NAME || 'study_world_portal',
    server: sqlServerName(),
  };
}

export async function mssqlBulk(records: { sql: string; params: Record<string, unknown> }[]): Promise<number> {
  if (!records.length) return 0;
  const dir = await mkdtemp(path.join(os.tmpdir(), 'swc-sql-bulk-'));
  const payloadPath = path.join(dir, 'payload.json');
  await writeFile(
    payloadPath,
    JSON.stringify({ connectionString: connectionString(), records }),
    'utf8'
  );
  try {
    const { stdout, stderr } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', bulkScriptPath, '-PayloadPath', payloadPath],
      { windowsHide: true, maxBuffer: 20 * 1024 * 1024 }
    );
    if (stderr && stderr.trim()) {
      console.warn('[SQL Server bulk]', stderr.trim());
    }
    const parsed = stdout.trim() ? JSON.parse(stdout.trim()) : { count: 0 };
    return Number(parsed.count || records.length);
  } finally {
    await unlink(payloadPath).catch(() => {});
    await rmdir(dir).catch(() => {});
  }
}
