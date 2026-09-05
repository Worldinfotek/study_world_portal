import sql from 'mssql';
import { HttpError } from '../server/httpError.ts';

export function sqlServerName(): string {
  return String(process.env.SQL_HOST || String.raw`(localdb)\MSSQLLocalDB`).replace(/:0$/, '');
}

function parseHost(host: string): { server: string; instanceName?: string; port?: number } {
  let server = host.trim();
  let instanceName: string | undefined;
  let port: number | undefined;
  if (server.includes('\\')) {
    const [name, instance] = server.split('\\');
    server = name;
    instanceName = instance || undefined;
  }
  if (server.includes(',')) {
    const [name, portText] = server.split(',');
    server = name;
    port = Number(portText) || undefined;
  }
  return { server, instanceName, port };
}

function poolConfig(): sql.config {
  const host = sqlServerName();
  const { server, instanceName, port } = parseHost(host);
  const user = String(process.env.SQL_USER || '').trim();
  const password = String(process.env.SQL_PASSWORD || '');
  const database = process.env.SQL_DB_NAME || 'study_world_portal';
  const config: sql.config = {
    server,
    port,
    database,
    connectionTimeout: 60000,
    requestTimeout: 120000,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      instanceName,
      enableArithAbort: true,
    },
  };
  if (!user || !password) {
    throw new HttpError(503, 'SQL_USER and SQL_PASSWORD are required for this database login.');
  }
  config.user = user;
  config.password = password;
  return config;
}

function sqlUnavailable(err: unknown): never {
  const message = String((err as { message?: string })?.message || err);
  const safe = message.replace(/Password=[^;]+/gi, 'Password=***').slice(0, 400);
  console.error('[SQL Server]', safe);
  if (/Cannot open database|RECOVERY_PENDING|not accessible|Login failed|ELOGIN|ETIMEOUT|ECONNREFUSED|getaddrinfo/i.test(message)) {
    throw new HttpError(503, 'SQL Server is temporarily unavailable. Please try again.');
  }
  throw new HttpError(503, 'Could not query SQL Server. Please try again.');
}

let poolPromise: Promise<sql.ConnectionPool> | null = null;

function getPool(): Promise<sql.ConnectionPool> {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(poolConfig())
      .connect()
      .catch((err) => {
        poolPromise = null;
        sqlUnavailable(err);
      });
  }
  return poolPromise;
}

function bind(request: sql.Request, params: Record<string, unknown> = {}) {
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value === undefined ? null : value);
  }
}

function asRows(recordset: unknown): any[] {
  return Array.isArray(recordset) ? recordset : [];
}

export async function mssqlQueries(
  queries: { name: string; query: string; params?: Record<string, unknown> }[]
): Promise<Record<string, any[]>> {
  const pool = await getPool();
  const grouped: Record<string, any[]> = {};
  for (const item of queries) {
    const request = pool.request();
    bind(request, item.params);
    const result = await request.query(item.query).catch(sqlUnavailable);
    grouped[item.name] = asRows(result.recordset);
  }
  return grouped;
}

export async function mssqlQuery<T = Record<string, any>>(
  query: string,
  params: Record<string, unknown> = {}
): Promise<T[]> {
  const pool = await getPool();
  const request = pool.request();
  bind(request, params);
  const result = await request.query(query).catch(sqlUnavailable);
  return asRows(result.recordset) as T[];
}

export async function mssqlExecute(query: string, params: Record<string, unknown> = {}): Promise<number> {
  const pool = await getPool();
  const request = pool.request();
  bind(request, params);
  const result = await request.query(query).catch(sqlUnavailable);
  const affected = Array.isArray(result.rowsAffected) ? result.rowsAffected[0] : 0;
  return Number(affected || 0);
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
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    for (const item of records) {
      const request = new sql.Request(transaction);
      bind(request, item.params);
      await request.query(item.sql);
    }
    await transaction.commit();
    return records.length;
  } catch (err) {
    await transaction.rollback().catch(() => {});
    sqlUnavailable(err);
  }
}
