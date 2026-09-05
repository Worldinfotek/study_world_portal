import { loadEnv } from './src/server/loadEnv.ts';
import { createApp } from './src/server/app.ts';

loadEnv();

function listenTarget(): string | number {
  const raw = process.env.PORT;
  if (raw && Number.isNaN(Number(raw))) {
    return raw;
  }
  return Number(raw) || 3000;
}

async function startServer() {
  const app = await createApp();
  const port = listenTarget();
  const onListening = () => {
    const where = typeof port === 'string' ? port : `http://0.0.0.0:${port}`;
    console.log(`Study World Server running on ${where}`);
    console.log(
      `SQL Server: ${String(process.env.SQL_HOST || '').trim() || '(not set)'} / ${process.env.SQL_DB_NAME || 'study_world_portal'}`
    );
  };

  const server = typeof port === 'string' ? app.listen(port, onListening) : app.listen(port, '0.0.0.0', onListening);
  server.on('error', (err) => {
    console.error('[server] listen failed:', err);
    process.exit(1);
  });
}

startServer().catch((err) => {
  console.error('[server] failed to start:', err);
  process.exit(1);
});
