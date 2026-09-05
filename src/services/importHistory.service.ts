import { deleteCollectionRecord, getImportHistoryById, listImportHistory, upsertCollectionRecord } from '../db/catalog.ts';
import { HttpError } from '../server/httpError.ts';

export async function list() {
  return listImportHistory();
}

export async function getById(id: string) {
  const item = await getImportHistoryById(id);
  if (!item) throw new HttpError(404, 'Import history record not found.');
  return item;
}

export async function save(body: any, id?: string) {
  const historyId = String(body?.timestamp || body?.id || id || Date.now());
  const record = { ...body, timestamp: body?.timestamp || historyId, file_name: body?.file_name || historyId };
  await upsertCollectionRecord('import_history', record);
  return getById(String(record.timestamp || record.file_name));
}

export async function remove(id: string) {
  if (!id) throw new HttpError(400, 'Import history id is required.');
  await getById(id);
  await deleteCollectionRecord('import_history', id);
  return { ok: true, id };
}
