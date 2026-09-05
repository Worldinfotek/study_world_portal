import { deleteCollectionRecord, getCourseById, listCourses, upsertCollectionRecord } from '../db/catalog.ts';
import { HttpError } from '../server/httpError.ts';

export async function list() {
  return listCourses();
}

export async function getById(id: string) {
  const item = await getCourseById(id);
  if (!item) throw new HttpError(404, 'Course not found.');
  return item;
}

export async function save(body: any, id?: string) {
  const record = { ...body, course_id: body?.course_id || id || `crs_${Date.now()}` };
  if (!record.course_name) throw new HttpError(400, 'course_name is required.');
  await upsertCollectionRecord('courses', record);
  return getById(record.course_id);
}

export async function remove(id: string) {
  if (!id) throw new HttpError(400, 'Course id is required.');
  await getById(id);
  await deleteCollectionRecord('courses', id);
  return { ok: true, id };
}
