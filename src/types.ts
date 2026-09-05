export type UserRole = 'Admin' | 'Office Staff' | 'Franchise Admin' | 'Franchise Staff' | 'B-2-B' | 'User';

export interface Franchise {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  address: string;
  contact_person: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  created_at: string;
  max_sub_users: number;
  commission_rate?: number; // General / legacy fallback
  consultancy_fee_commission_pct?: number; // % of student consultancy service fee shared with franchisee (e.g. 50%)
  university_commission_pct?: number; // % of university recruitment commission shared with franchisee (e.g. 20%)
  notes?: string;
}

export interface UserAccount {
  id: string;
  uid?: string;
  name: string;
  email: string;
  password?: string; // Optional legacy field - Plain text passwords are NEVER persisted to database
  auth_provider?: 'firebase' | 'google' | 'email';
  role: UserRole;
  status?: 'Active' | 'Inactive';
  export_permission: boolean;
  department: string;
  avatar_url?: string;
  last_login: string;
  created_at?: string;
  phone?: string;
  franchise_id?: string;
  franchise_name?: string;
  branch_code?: string;
  parent_user_id?: string;
}

export type ProgramLevel =
  | "Foundation"
  | "Diploma / Advanced Diploma"
  | "Associate Degree"
  | "Bachelor's / Undergraduate"
  | "Graduate Certificate / Diploma"
  | "Master's (Coursework)"
  | "Master's (Research)"
  | "Doctorate / PhD"
  | "Post-Doctoral / Fellowship"
  | "Language / Pathway Program";

export type DurationBucket = '0-1' | '1-2' | '2-3' | '3-4' | '4+';

export type StudyMode = 'On-campus' | 'Online' | 'Hybrid';

export type CourseStatus = 'Active' | 'Inactive' | 'Outdated';

export type UniversityStatus = 'Active' | 'Inactive';

export type MoiStatus = 'Accepted' | 'Not Accepted' | 'Case-by-Case';

export interface University {
  university_id: string;
  name: string;
  country: string;
  city: string;
  campus?: string;
  website: string;
  logo_url: string;
  contact_info: {
    email: string;
    phone: string;
    address?: string;
  };
  status: UniversityStatus;
  ranking?: number;
  established_year?: number;
  overview?: string;
  date_added: string;
  last_updated: string;
}

export interface EligibilityRequirement {
  course_id: string;
  eligible_nationalities: string[]; // ["All"] or list of countries
  restricted_nationalities: string[];
  minimum_qualification: string; // e.g. "High School / 12th Grade"
  minimum_qualification_rank: number; // 1: Secondary, 2: High School/A-Levels, 3: Diploma/Associate, 4: Bachelor's, 5: Master's
  minimum_percentage?: number;
  minimum_cgpa?: number; // Out of 4.0
  study_gap_allowed_years: number;
  age_requirement_min: number;
  age_requirement_max?: number;
  minimum_age?: number;
  ielts_overall: number;
  ielts_min_band: number;
  pte_min: number;
  toefl_min: number;
  moi_acceptance: MoiStatus;
  required_documents: string[];
  additional_admission_conditions: string;
  important_notes: string;
}

export interface Course {
  course_id: string;
  university_id: string;
  course_name: string;
  destination_country: string;
  city: string;
  faculty?: string;
  program: ProgramLevel;
  duration: number; // in years or months
  duration_unit: 'years' | 'months';
  duration_bucket: DurationBucket;
  intake_months: string[];
  intake_years: number[];
  tuition_fee: number;
  currency: string;
  application_fee: number;
  application_deadline: string; // Date or "Rolling"
  scholarship_available: boolean;
  scholarship_detail?: string;
  study_mode: StudyMode;
  status: CourseStatus;
  date_added: string;
  last_updated: string;
  eligibility: EligibilityRequirement;
}

export interface StudentProfile {
  student_name: string;
  nationality: string;
  age: number;
  previous_qualification: string;
  previous_qualification_rank: number;
  percentage?: number;
  cgpa?: number;
  graduation_year: number;
  study_gap: number;
  ielts_overall?: number;
  ielts_min_band?: number;
  pte_score?: number;
  toefl_score?: number;
  moi_available: boolean;
  desired_destinations: string[];
  preferred_programs: string[];
  preferred_intake_month?: string;
  preferred_intake_year?: number;
  max_tuition_budget?: number;
  currency_preference?: string;
}

export type EligibilityVerdict = 'Eligible' | 'Possibly Eligible' | 'Not Eligible';

export interface EligibilityEvaluationResult {
  course_id: string;
  course: Course;
  university?: University;
  verdict: EligibilityVerdict;
  overall_score: number; // 0 - 100 compatibility match index
  breakdown: {
    nationality: { passed: boolean; message: string; isHard: boolean };
    qualification: { passed: boolean; message: string; isHard: boolean };
    academic_score: { passed: boolean; message: string; isHard: boolean; partial?: boolean };
    study_gap: { passed: boolean; message: string; isHard: boolean };
    english_proficiency: { passed: boolean; message: string; isHard: boolean; partial?: boolean };
    age: { passed: boolean; message: string; isHard: boolean };
  };
  reasons: string[];
  positives: string[];
  missing_data_warnings: string[];
  financial_fit?: 'Within Budget' | 'Exceeds Budget' | 'Budget Not Set';
}

export type ImportCategory =
  | 'Complete Data Import'
  | 'Public Universities'
  | 'Universities'
  | 'Courses'
  | 'Eligibility & Requirements'
  | 'Requirements'
  | 'Countries';

export type DuplicateStrategy = 'skip' | 'update' | 'create_new';

export interface ImportErrorItem {
  row: number;
  record_identifier?: string;
  field?: string;
  reason: string;
  raw_data?: Record<string, any>;
}

export interface ImportHistoryRecord {
  id: string;
  file_name: string;
  file_type?: string;
  category: ImportCategory | string;
  date?: string;
  timestamp: number | string;
  imported_by?: string;
  admin_email?: string;
  total_records?: number;
  total_rows?: number;
  imported: number;
  updated?: number;
  duplicates?: number;
  skipped?: number;
  failed?: number;
  status: 'Completed' | 'Completed with Errors' | 'Partial Errors' | 'Failed';
  errors?: string[];
  error_report?: ImportErrorItem[];
}

export interface CountryMaster {
  code: string;
  name: string;
  flag: string;
  currency: string;
  currency_symbol: string;
  active_universities_count?: number;
  visa_processing_weeks?: string;
  post_study_work_visa?: string;
  financial_requirement_notes?: string;
  active?: boolean;
  is_active?: boolean;
  psw_duration?: string;
}

export interface ProgramMaster {
  id: string;
  name: ProgramLevel;
  rank?: number;
  rank_level: number;
  description: string;
  typical_duration?: string;
  typical_duration_years: string;
  active_courses_count: number;
}

export type StudentLeadStatus =
  | 'New Inquiry'
  | 'Under Assessment'
  | 'Documents Pending'
  | 'Application Submitted'
  | 'Conditional Offer'
  | 'Unconditional Offer'
  | 'Visa Processing'
  | 'Enrolled'
  | 'Closed / Rejected';

export type StudentLeadRequestType =
  | 'Course Application'
  | 'Lead Inquiry'
  | 'Pre-Assessment'
  | 'Offer Letter Request'
  | 'Visa Filing Assistance';

export type LeadPriority = 'High' | 'Medium' | 'Low';

export interface LeadTimelineEvent {
  id: string;
  date: string;
  action: string;
  performed_by: string;
  performed_by_role: UserRole;
  comment?: string;
}

export interface StudentLeadRequest {
  id: string;
  // Student Personal & Academic Details
  student_name: string;
  student_email: string;
  student_phone: string;
  student_city?: string;
  nationality: string;
  passport_no?: string;
  academic_qualification?: string;
  academic_score?: string; // e.g. "76% / 3.4 CGPA"
  english_test?: string; // e.g. "IELTS 6.5 (min 6.0)", "PTE 62", "MOI Waiver"
  study_gap_years?: number;

  // Selected Course & University
  course_id: string;
  course_name: string;
  university_id: string;
  university_name: string;
  destination_country: string;
  city: string;
  program_level: string;
  tuition_fee: number;
  currency: string;
  intake: string;

  // Ownership & Franchise Assignment
  counselor_id: string;
  counselor_name: string;
  counselor_email: string;
  counselor_role: UserRole;
  counselor_phone?: string;
  franchise_id?: string;
  franchise_name?: string;
  branch_code?: string;

  // Request Meta & Status
  request_type: StudentLeadRequestType;
  priority: LeadPriority;
  status: StudentLeadStatus;
  notes?: string;
  meet_link?: string;
  calendar_event_id?: string;
  google_doc_id?: string;
  google_doc_url?: string;
  last_gmail_sent?: string;
  last_whatsapp_sent?: string;
  timeline: LeadTimelineEvent[];
  created_at: string;
  updated_at: string;
}

/**
 * Access Control / Visibility Rule for Student Leads & Course Requests:
 * 1. Central Admin (Admin) - can view all leads across the entire system network
 * 2. Franchise Admin - can view all leads for their entire franchise branch (matching franchise_id) or their own assigned leads
 * 3. Office Staff - can ONLY view their own assigned leads (matching counselor_id / counselor_email)
 * 4. Franchise Staff - can ONLY view their own assigned leads (matching counselor_id / counselor_email)
 * 5. Public User / Student - can view their own submitted applications & inquiries
 */
export function canViewLeadRequest(user: UserAccount | null, lead: StudentLeadRequest): boolean {
  if (!user) return false;

  // 1. Central Superadmin (Head Office Admin) - full system network visibility
  if (user.role === 'Admin') return true;

  // 2. Franchise Admin - can view all leads originating from or assigned to their franchise branch
  if (user.role === 'Franchise Admin') {
    if (user.franchise_id && lead.franchise_id && lead.franchise_id === user.franchise_id) {
      return true;
    }
    // Also if directly assigned to this franchise admin
    if (
      lead.counselor_id === user.id ||
      (lead.counselor_email && user.email && lead.counselor_email.toLowerCase() === user.email.toLowerCase())
    ) {
      return true;
    }
    return false;
  }

  // 3. Office Staff (Head Office Counselor) - can ONLY view their own assigned leads
  if (user.role === 'Office Staff') {
    return (
      lead.counselor_id === user.id ||
      (!!lead.counselor_email && !!user.email && lead.counselor_email.toLowerCase() === user.email.toLowerCase())
    );
  }

  // 4. Franchise Staff (Branch Counselor) - can ONLY view their own assigned leads
  if (user.role === 'Franchise Staff') {
    return (
      lead.counselor_id === user.id ||
      (!!lead.counselor_email && !!user.email && lead.counselor_email.toLowerCase() === user.email.toLowerCase())
    );
  }

  // 5. B-2-B Partner / Agent - can ONLY view their own referred / assigned leads
  if (user.role === 'B-2-B') {
    return (
      lead.counselor_id === user.id ||
      (!!lead.counselor_email && !!user.email && lead.counselor_email.toLowerCase() === user.email.toLowerCase())
    );
  }

  // 6. Public Portal User / Student: can view their own submitted applications & inquiries
  if (user.role === 'User') {
    return (
      (!!lead.student_email && !!user.email && lead.student_email.toLowerCase() === user.email.toLowerCase()) ||
      lead.counselor_id === user.id
    );
  }

  // Fallback: match counselor id or counselor email
  return (
    lead.counselor_id === user.id ||
    (!!lead.counselor_email && !!user.email && lead.counselor_email.toLowerCase() === user.email.toLowerCase())
  );
}

/**
 * Universal helper to detect whether a user account or role string represents a B2B partner
 */
export function isB2BUser(userOrRole?: UserAccount | UserRole | string | null): boolean {
  if (!userOrRole) return false;
  const roleStr = typeof userOrRole === 'object' ? userOrRole.role : userOrRole;
  if (!roleStr) return false;
  const clean = String(roleStr).trim().toUpperCase();
  return clean === 'B-2-B' || clean === 'B2B' || clean.includes('B2B') || clean.includes('B-2-B');
}

export interface CounselingMeeting {
  id: string;
  lead_id?: string;
  student_name: string;
  student_email: string;
  counselor_email: string;
  title: string;
  description?: string;
  meet_uri?: string;
  calendar_event_id?: string;
  start_time: string;
  end_time: string;
  status?: string;
  created_at?: string;
}


