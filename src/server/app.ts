import express from 'express';
import path from 'path';
import { seedCatalogIfEmpty } from '../db/catalog.ts';
import { apiAuthGate } from '../middleware/apiAuthGate.ts';
import { errorHandler } from '../middleware/errorHandler.ts';
import apiRouter from '../routes/index.ts';

export async function createApp() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use('/api', apiAuthGate);
  app.use('/api', apiRouter);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist', 'public');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use(errorHandler);

  await seedCatalogIfEmpty().catch((err) => {
    console.error('[SQL Server] Catalog seed failed:', err);
  });

  return app;
}
