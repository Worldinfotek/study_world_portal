import { StudentLeadRequest } from '../types';
import { authHeaders } from '../lib/apiAuth';

function asLead(row: any): StudentLeadRequest | null {
  if (row?.payload_json) {
    try {
      const parsed = typeof row.payload_json === 'string' ? JSON.parse(row.payload_json) : row.payload_json;
      if (parsed?.id) return parsed as StudentLeadRequest;
    } catch {
      // fall through to column mapping
    }
  }
  if (!row?.lead_id && !row?.id) return null;
  return {
    id: row.lead_id || row.id,
    student_name: row.student_name || '',
    student_email: row.email || row.student_email || '',
    student_phone: row.phone || row.student_phone || '',
    student_city: row.city || row.student_city || '',
    nationality: row.nationality || '',
    academic_score: row.academic_score || '',
    english_test: row.english_test_score || row.english_test || '',
    course_id: row.course_id || '',
    course_name: row.course_name || '',
    university_id: row.university_id || '',
    university_name: row.university_name || '',
    destination_country: row.destination_country || '',
    city: row.city || '',
    program_level: row.program_level || '',
    tuition_fee: Number(row.tuition_fee || 0),
    currency: row.currency || 'USD',
    intake: row.target_intake || row.intake || '',
    counselor_id: row.counselor_id || '',
    counselor_name: row.counselor_name || '',
    counselor_email: row.counselor_email || '',
    counselor_role: row.counselor_role || 'Office Staff',
    franchise_id: row.franchise_id || 'ho',
    franchise_name: row.franchise_name || 'Head Office',
    request_type: row.request_type || 'Course Application',
    priority: row.priority || 'Medium',
    status: row.status === 'New Lead' ? 'New Inquiry' : row.status || 'New Inquiry',
    notes: row.notes || '',
    meet_link: row.meet_link || '',
    calendar_event_id: row.calendar_event_id || '',
    google_doc_id: row.google_doc_id || '',
    timeline: Array.isArray(row.timeline) ? row.timeline : [],
    created_at: row.created_at || new Date().toISOString(),
    updated_at: row.updated_at || new Date().toISOString(),
  } as StudentLeadRequest;
}

export async function fetchSqlLeads(): Promise<StudentLeadRequest[]> {
  const res = await fetch('/api/leads', { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to load leads from SQL Server');
  const rows = await res.json();
  return (Array.isArray(rows) ? rows : []).map(asLead).filter(Boolean) as StudentLeadRequest[];
}

export async function saveSqlLead(lead: StudentLeadRequest): Promise<StudentLeadRequest> {
  const hasId = Boolean(lead.id);
  const res = await fetch(hasId ? `/api/leads/${encodeURIComponent(lead.id)}` : '/api/leads', {
    method: hasId ? 'PUT' : 'POST',
    headers: authHeaders(),
    body: JSON.stringify(lead),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to save lead to SQL Server');
  }
  const saved = await res.json();
  return asLead(saved) || lead;
}

export async function deleteSqlLead(leadId: string): Promise<void> {
  const res = await fetch(`/api/leads/${encodeURIComponent(leadId)}`, { method: 'DELETE', headers: authHeaders() });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete lead from SQL Server');
  }
}
