import { deleteCollectionRecord, getProgramById, listPrograms, upsertCollectionRecord } from '../db/catalog.ts';
import { HttpError } from '../server/httpError.ts';

export async function list() {
  return listPrograms();
}

export async function getById(id: string) {
  const item = await getProgramById(id);
  if (!item) throw new HttpError(404, 'Program not found.');
  return item;
}

export async function save(body: any, id?: string) {
  const record = { ...body, id: body?.id || body?.program_id || id || `prog_${Date.now()}` };
  if (!record.name) throw new HttpError(400, 'Program name is required.');
  await upsertCollectionRecord('programs', record);
  return getById(record.id);
}

export async function remove(id: string) {
  if (!id) throw new HttpError(400, 'Program id is required.');
  await getById(id);
  await deleteCollectionRecord('programs', id);
  return { ok: true, id };
}
