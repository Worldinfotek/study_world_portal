import { getSqlTableCounts } from '../db/catalog.ts';
import { testSqlConnection } from '../db/mssql.ts';

export async function getHealth() {
  try {
    const sql = await testSqlConnection();
    return {
      status: 'ok',
      sql,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    return {
      status: 'error',
      sql: { ok: false, error: error.message },
      timestamp: new Date().toISOString(),
    };
  }
}

export async function getDatabaseStatus() {
  const tables = await getSqlTableCounts();
  return {
    success: true,
    region: 'localdb',
    server: process.env.SQL_HOST || String.raw`(localdb)\MSSQLLocalDB`,
    database: process.env.SQL_DB_NAME || 'study_world_portal',
    tables,
  };
}
