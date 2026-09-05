export function mapSqlLead(row: any) {
  if (row?.payload_json) {
    try {
      const parsed = typeof row.payload_json === 'string' ? JSON.parse(row.payload_json) : row.payload_json;
      if (parsed?.id) return parsed;
    } catch {
      // use column mapping
    }
  }
  return {
    id: row.lead_id,
    student_name: row.student_name,
    student_email: row.email,
    student_phone: row.phone,
    student_city: row.city,
    course_id: row.course_id,
    course_name: row.course_name,
    university_id: row.university_id,
    university_name: row.university_name,
    destination_country: row.destination_country,
    city: row.city,
    counselor_id: row.counselor_id,
    counselor_name: row.counselor_name,
    counselor_email: row.counselor_email,
    franchise_id: row.franchise_id,
    franchise_name: row.franchise_name,
    request_type: row.request_type === 'Direct Admission' ? 'Course Application' : row.request_type,
    priority: row.priority,
    status: row.status === 'New Lead' ? 'New Inquiry' : row.status,
    notes: row.notes,
    meet_link: row.meet_link,
    calendar_event_id: row.calendar_event_id,
    google_doc_id: row.google_doc_id,
    academic_score: row.academic_score,
    english_test: row.english_test_score,
    intake: row.target_intake,
    timeline: [],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
