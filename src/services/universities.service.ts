import { deleteCollectionRecord, getUniversityById, listUniversities, upsertCollectionRecord } from '../db/catalog.ts';
import { HttpError } from '../server/httpError.ts';

export async function list() {
  return listUniversities();
}

export async function getById(id: string) {
  const item = await getUniversityById(id);
  if (!item) throw new HttpError(404, 'University not found.');
  return item;
}

export async function save(body: any, id?: string) {
  const record = { ...body, university_id: body?.university_id || id || `uni_${Date.now()}` };
  if (!record.name) throw new HttpError(400, 'University name is required.');
  await upsertCollectionRecord('universities', record);
  return getById(record.university_id);
}

export async function remove(id: string) {
  if (!id) throw new HttpError(400, 'University id is required.');
  await getById(id);
  await deleteCollectionRecord('universities', id);
  return { ok: true, id };
}
