import { deleteCollectionRecord, getFranchiseById, listFranchises, upsertCollectionRecord } from '../db/catalog.ts';
import { HttpError } from '../server/httpError.ts';

export async function list() {
  return listFranchises();
}

export async function getById(id: string) {
  const item = await getFranchiseById(id);
  if (!item) throw new HttpError(404, 'Franchise not found.');
  return item;
}

export async function save(body: any, id?: string) {
  const record = { ...body, id: body?.id || body?.franchise_id || id || `fr_${Date.now()}` };
  if (!record.name) throw new HttpError(400, 'Franchise name is required.');
  await upsertCollectionRecord('franchises', record);
  return getById(record.id);
}

export async function remove(id: string) {
  if (!id) throw new HttpError(400, 'Franchise id is required.');
  await getById(id);
  await deleteCollectionRecord('franchises', id);
  return { ok: true, id };
}
