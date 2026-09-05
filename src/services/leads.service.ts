import { deleteSqlLeadRecord, getMappedLeadById, listSqlLeads, saveSqlLeadRecord } from '../db/catalog.ts';
import { mapSqlLead } from '../mappers/leadMapper.ts';
import { HttpError } from '../server/httpError.ts';

export async function list() {
  return (await listSqlLeads()).map(mapSqlLead);
}

export async function listLeads() {
  return list();
}

export async function getById(leadId: string) {
  if (!leadId) throw new HttpError(400, 'Lead id is required.');
  const item = await getMappedLeadById(leadId);
  if (!item) throw new HttpError(404, 'Lead not found.');
  return item;
}

export async function save(leadData: any, id?: string) {
  const record = { ...leadData, id: leadData?.id || id };
  return mapSqlLead(await saveSqlLeadRecord(record || {}));
}

export async function saveLead(leadData: any) {
  return save(leadData);
}

export async function remove(leadIdRaw: string) {
  const leadId = String(leadIdRaw || '');
  if (!leadId) throw new HttpError(400, 'Lead id is required.');
  await getById(leadId);
  await deleteSqlLeadRecord(leadId);
  return { ok: true, id: leadId };
}

export async function deleteLead(leadIdRaw: string) {
  return remove(leadIdRaw);
}
