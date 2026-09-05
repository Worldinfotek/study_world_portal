import dotenv from 'dotenv';
import { createApp } from './src/server/app.ts';

dotenv.config({ path: '.env.local', override: true });
dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
if (!process.env.NODE_ENV && process.env.npm_lifecycle_event === 'start') {
  process.env.NODE_ENV = 'production';
}

async function startServer() {
  const app = await createApp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Study World Server running on http://0.0.0.0:${PORT}`);
    console.log(
      `SQL Server: ${String(process.env.SQL_HOST || String.raw`(localdb)\\MSSQLLocalDB`).replace(/:0$/, '')} / ${process.env.SQL_DB_NAME || 'study_world_portal'}`
    );
  });
}

startServer();
