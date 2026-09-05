import React from 'react';
import { Course, University } from '../types';
import { printFormattedReport } from '../utils/exportUtils';
import { ViewportOverlay } from './ViewportOverlay';
import {
  X,
  MapPin,
  Calendar,
  DollarSign,
  GraduationCap,
  Clock,
  Award,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle2,
  BookOpen,
  Printer,
  UserCheck,
  UserPlus,
  Scale,
  Trash2,
} from 'lucide-react';

interface CourseDetailModalProps {
  course: Course | null;
  university?: University | null;
  isOpen?: boolean;
  onClose: () => void;
  onCheckEligibility?: (course: Course) => void;
  onEditCourse?: (course: Course) => void;
  onCompareCourse?: (course: Course) => void;
  onDeleteCourse?: (courseId: string) => void;
  onCreateLead?: (course: Course) => void;
  canEdit?: boolean;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  university,
  isOpen = true,
  onClose,
  onCheckEligibility,
  onEditCourse,
  onCompareCourse,
  onDeleteCourse,
  onCreateLead,
  canEdit = false,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  if (!isOpen || !course) return null;

  const req = course.eligibility;

  const handleConfirmDelete = () => {
    if (onDeleteCourse) {
      onDeleteCourse(course.course_id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const handlePrint = () => {
    const infoFields = [
      { label: 'Course Title', value: course.course_name },
      { label: 'University', value: university?.name || 'Partner Institution' },
      { label: 'Country & City', value: `${course.city}, ${course.destination_country}` },
      { label: 'Degree Level', value: course.program },
      { label: 'Duration & Mode', value: `${course.duration} ${course.duration_unit} (${course.study_mode})` },
      { label: 'Annual Tuition Fee', value: `${course.currency} ${course.tuition_fee.toLocaleString()}` },
      { label: 'Application Fee', value: course.application_fee > 0 ? `${course.currency} ${course.application_fee}` : 'Free / Waived' },
      { label: 'Intake Months', value: course.intake_months.join(', ') },
      { label: 'Application Deadline', value: course.application_deadline },
      { label: 'Min Academic Entry', value: `${req.minimum_qualification} (${req.minimum_percentage || 55}% / ${req.minimum_cgpa || '2.5'} CGPA)` },
      { label: 'Study Gap Allowed', value: `Up to ${req.study_gap_allowed_years} years` },
      { label: 'English MOI Status', value: req.moi_acceptance },
      { label: 'IELTS / PTE / TOEFL', value: `IELTS ${req.ielts_overall} (Min ${req.ielts_min_band}) | PTE ${req.pte_min} | TOEFL ${req.toefl_min}` },
      { label: 'Scholarships', value: course.scholarship_available ? course.scholarship_detail || 'Available' : 'None' },
    ];

    const headers = ['Requirement Category', 'Specific Institutional Criteria'];
    const rows = [
      ['Minimum Prior Education', req.minimum_qualification],
      ['Academic Marks / CGPA', `${req.minimum_percentage || 55}% minimum or ${req.minimum_cgpa || '2.5'} CGPA`],
      ['Permissible Study Gap', `Maximum ${req.study_gap_allowed_years} years gap accepted`],
      ['Medium of Instruction (MOI)', `${req.moi_acceptance} for qualifying institutions`],
      ['IELTS Academic', `Overall ${req.ielts_overall} with minimum ${req.ielts_min_band} in each band`],
      ['PTE Academic Score', `${req.pte_min} points minimum`],
      ['TOEFL iBT Score', `${req.toefl_min} points minimum`],
      ['Required Documents', (req.required_documents || ['Passport', 'Transcripts', 'Degree Certificate', 'SOP']).join(', ')],
      ['Special Conditions / Notes', req.important_notes || req.additional_admission_conditions || 'Standard admissions processing applies.'],
    ];

    printFormattedReport({
      title: 'Study World Consultant — Official Course Specification Sheet',
      subtitle: `${course.course_name} · ${university?.name || 'Partner University'} (${course.destination_country})`,
      badgeText: 'Course Factsheet',
      infoFields,
      headers,
      rows,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Brand Gradient */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#4A140F] via-[#7A2820] to-[#A8382C] text-white flex items-start justify-between flex-shrink-0">
          <div className="flex-1 pr-6">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-[#C9A227] text-stone-900">
                {course.program}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  course.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                }`}
              >
                {course.status}
              </span>
              <span className="text-xs text-stone-300">
                Course ID: <span className="font-mono text-stone-100">{course.course_id}</span>
              </span>
            </div>
            <h2 className="text-2xl font-display font-bold leading-tight text-white mb-2">
              {course.course_name}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-stone-200">
              <div className="flex items-center gap-1.5 font-medium text-[#FBF6F1]">
                <GraduationCap className="w-4 h-4 text-[#C9A227]" />
                <span>{university?.name || 'Partner University'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
                <span>
                  {course.city}, {course.destination_country}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-[#C9A227]" />
                <span>
                  {course.duration} {course.duration_unit} ({course.study_mode})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#241512]">
          {/* Key Metric Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#FBF6F1] border border-stone-200">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Annual Tuition Fee
              </span>
              <p className="text-xl font-bold text-[#A8382C]">
                {course.currency} {course.tuition_fee.toLocaleString()}
              </p>
              <span className="text-[11px] text-stone-500">Per Academic Year</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Application Fee
              </span>
              <p className="text-xl font-bold text-stone-800">
                {course.application_fee === 0
                  ? 'FREE (£0)'
                  : `${course.currency} ${course.application_fee}`}
              </p>
              <span className="text-[11px] text-stone-500">Official Univ Fee</span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Upcoming Intakes
              </span>
              <p className="text-sm font-bold text-stone-800 line-clamp-1">
                {course.intake_months.join(', ')}
              </p>
              <span className="text-[11px] text-stone-500">
                Years: {course.intake_years.join(', ')}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Deadline
              </span>
              <p className="text-sm font-bold text-stone-800">
                {course.application_deadline}
              </p>
              <span className="text-[11px] text-stone-500">Application Cutoff</span>
            </div>
          </div>

          {/* Scholarship Box */}
          {course.scholarship_available && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3.5">
              <Award className="w-6 h-6 text-[#C9A227] flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900">
                  Scholarship & Financial Aid Available
                </h4>
                <p className="text-sm text-amber-800 mt-0.5">
                  {course.scholarship_detail || 'Merit and regional international scholarships available.'}
                </p>
              </div>
            </div>
          )}

          {/* Detailed Admission & Eligibility Requirements Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-display font-bold text-[#7A2820] flex items-center gap-2 border-b border-stone-200 pb-2">
              <CheckCircle2 className="w-5 h-5 text-[#A8382C]" />
              Admission & Eligibility Criteria (1:1 Rules)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {/* Academic Requirements Card */}
              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
                <h4 className="font-semibold text-stone-900 flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500">
                  <GraduationCap className="w-4 h-4 text-[#A8382C]" />
                  Academic Entry Criteria
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-600">Minimum Qualification:</span>
                    <span className="font-semibold text-stone-900 text-right">
                      {req.minimum_qualification}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-600">Min Percentage / CGPA:</span>
                    <span className="font-semibold text-stone-900">
                      {req.minimum_percentage ? `${req.minimum_percentage}%` : 'N/A'}{' '}
                      {req.minimum_cgpa ? `(${req.minimum_cgpa} CGPA)` : ''}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-600">Max Permissible Study Gap:</span>
                    <span className="font-semibold text-stone-900">
                      {req.study_gap_allowed_years} Years
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Age Requirement:</span>
                    <span className="font-semibold text-stone-900">
                      Min {req.age_requirement_min} yrs {req.age_requirement_max ? `(Max ${req.age_requirement_max} yrs)` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* English Language Proficiency Card */}
              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-3">
                <h4 className="font-semibold text-stone-900 flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500">
                  <Globe className="w-4 h-4 text-[#A8382C]" />
                  English Language Requirements
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-600">IELTS Academic:</span>
                    <span className="font-semibold text-stone-900">
                      Overall {req.ielts_overall} (Min {req.ielts_min_band} in each band)
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-600">PTE Academic:</span>
                    <span className="font-semibold text-stone-900">
                      Minimum {req.pte_min} Score
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-stone-100 pb-1.5">
                    <span className="text-stone-600">TOEFL iBT:</span>
                    <span className="font-semibold text-stone-900">
                      Minimum {req.toefl_min} Score
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">MOI Acceptance:</span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-xs ${
                        req.moi_acceptance === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.moi_acceptance === 'Case-by-Case'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {req.moi_acceptance}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Nationalities Eligibility Info */}
            <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900">Eligible Nationalities:</span>
                <span className="text-stone-700">
                  {req.eligible_nationalities?.length ? req.eligible_nationalities.join(', ') : 'All Countries'}
                </span>
              </div>
              {req.restricted_nationalities && req.restricted_nationalities.length > 0 && (
                <div className="flex items-center justify-between text-rose-600">
                  <span className="font-semibold">Restricted / Excluded:</span>
                  <span>{req.restricted_nationalities.join(', ')}</span>
                </div>
              )}
            </div>

            {/* Required Documents Checklist */}
            {req.required_documents && req.required_documents.length > 0 && (
              <div className="p-4 rounded-xl bg-white border border-stone-200 space-y-2.5">
                <h4 className="font-semibold text-stone-900 flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500">
                  <FileText className="w-4 h-4 text-[#A8382C]" />
                  Required Application Documents
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {req.required_documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-stone-700">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#A8382C]" />
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Important Notes Box */}
            {req.important_notes && (
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-300 space-y-1">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-[#A8382C]" />
                  Admissions Officer Notes
                </h4>
                <p className="text-sm text-stone-700">{req.important_notes}</p>
                {req.additional_admission_conditions && (
                  <p className="text-xs text-stone-600 mt-1 italic">
                    Special condition: {req.additional_admission_conditions}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-stone-500">
            Last updated: {course.last_updated} · Verified for SWC office team
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-stone-500" />
              Print Course Sheet
            </button>

            {onCompareCourse && (
              <button
                onClick={() => {
                  onCompareCourse(course);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-semibold text-stone-800 bg-[#FBF6F1] hover:bg-amber-100 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Scale className="w-4 h-4 text-[#A8382C]" />
                Compare Course
              </button>
            )}

            {canEdit && onEditCourse && (
              <button
                onClick={() => onEditCourse(course)}
                className="px-3.5 py-2 text-xs font-semibold text-[#7A2820] bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg transition-colors"
              >
                Edit Course
              </button>
            )}

            {canEdit && onDeleteCourse && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Permanently Delete Course (Admin Only)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Course
              </button>
            )}

            {onCreateLead && (
              <button
                onClick={() => {
                  onCreateLead(course);
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-semibold text-[#7A2820] bg-[#FBF6F1] hover:bg-[#A8382C] hover:text-white border border-[#C9A227]/40 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
                title="Create a new student lead/application with this course"
              >
                <UserPlus className="w-4 h-4 text-[#C9A227]" />
                Create Student Lead
              </button>
            )}

            {onCheckEligibility && (
              <button
                onClick={() => onCheckEligibility(course)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#A8382C] hover:bg-[#7A2820] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <UserCheck className="w-4 h-4 text-[#C9A227]" />
                Check Student Eligibility
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation Popup inside modal */}
        {showDeleteConfirm && (
          <ViewportOverlay zClass="z-[60]" onBackdropClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900">Delete Course Permanently</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Are you sure you want to permanently delete this course? If the program has closed permanently, removing it will prevent it from appearing in any student assessments.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="font-bold text-stone-900">{course.course_name}</div>
                <div className="text-stone-500">{university?.name || 'Partner University'} · {course.destination_country}</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Confirm & Delete</span>
                </button>
              </div>
            </div>
          </ViewportOverlay>
        )}
      </div>
    </div>
  );
};
