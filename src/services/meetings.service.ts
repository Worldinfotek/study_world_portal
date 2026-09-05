import { deleteMeeting, getMeetingById, listMeetings, saveMeeting } from '../db/catalog.ts';
import { HttpError } from '../server/httpError.ts';

export async function list() {
  return listMeetings();
}

export async function getById(id: string) {
  const item = await getMeetingById(id);
  if (!item) throw new HttpError(404, 'Meeting not found.');
  return item;
}

export async function save(body: any, id?: string) {
  const record = { ...body, id: body?.id || body?.meeting_id || id };
  if (!record.student_name || !record.student_email || !record.counselor_email) {
    throw new HttpError(400, 'student_name, student_email, and counselor_email are required.');
  }
  return saveMeeting(record);
}

export async function remove(id: string) {
  if (!id) throw new HttpError(400, 'Meeting id is required.');
  await getById(id);
  await deleteMeeting(id);
  return { ok: true, id };
}
