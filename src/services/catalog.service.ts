import {
  deleteCollectionRecord,
  loadBootstrap,
  resetAndSeedCatalog,
  upsertCollectionRecord,
} from '../db/catalog.ts';

export async function getBootstrap() {
  return loadBootstrap();
}

export async function resetCatalog() {
  const seeded = await resetAndSeedCatalog();
  const data = await loadBootstrap();
  return { ok: true, seeded, data };
}

export async function saveRecord(collection: string, record: unknown) {
  await upsertCollectionRecord(collection, record);
  return { ok: true };
}

export async function deleteRecord(collection: string, id: string) {
  await deleteCollectionRecord(collection, id);
  return { ok: true };
}
