import { deleteCollectionRecord, getCountryByCode, listCountries, upsertCollectionRecord } from '../db/catalog.ts';
import { HttpError } from '../server/httpError.ts';

export async function list() {
  return listCountries();
}

export async function getById(code: string) {
  const item = await getCountryByCode(code);
  if (!item) throw new HttpError(404, 'Country not found.');
  return item;
}

export async function save(body: any, code?: string) {
  const record = { ...body, code: body?.code || code };
  if (!record.code) throw new HttpError(400, 'Country code is required.');
  if (!record.name) throw new HttpError(400, 'Country name is required.');
  await upsertCollectionRecord('countries', record);
  return getById(record.code);
}

export async function remove(code: string) {
  if (!code) throw new HttpError(400, 'Country code is required.');
  await getById(code);
  await deleteCollectionRecord('countries', code);
  return { ok: true, id: code };
}
