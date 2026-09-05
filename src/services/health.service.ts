import { getSqlTableCounts } from '../db/catalog.ts';
import { sqlServerName, testSqlConnection } from '../db/mssql.ts';
import { getEnvFilePath } from '../server/loadEnv.ts';

function sqlConfigStatus() {
  return {
    host: sqlServerName() || '(not set)',
    database: process.env.SQL_DB_NAME || 'study_world_portal',
    user: String(process.env.SQL_USER || '').trim() || '(not set)',
    passwordSet: Boolean(String(process.env.SQL_PASSWORD || '').trim()),
    envFile: getEnvFilePath() || '(not found)',
  };
}

export async function getHealth() {
  try {
    const sql = await testSqlConnection();
    return {
      status: 'ok',
      sql,
      config: sqlConfigStatus(),
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      status: 'error',
      sql: { ok: false, error: error.message },
      config: sqlConfigStatus(),
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getDatabaseStatus() {
  const tables = await getSqlTableCounts();
  return {
    success: true,
    region: 'sql',
    server: sqlServerName() || '(not set)',
    database: process.env.SQL_DB_NAME || 'study_world_portal',
    tables,
  };
}
