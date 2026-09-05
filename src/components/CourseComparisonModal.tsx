import React, { useState } from 'react';
import { Course, University, CountryMaster } from '../types';
import { printFormattedReport } from '../utils/exportUtils';
import {
  X,
  Scale,
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  MapPin,
  Calendar,
  DollarSign,
  GraduationCap,
  Clock,
  Award,
  FileText,
  Printer,
  Sparkles,
  Building2,
  Globe,
  UserCheck,
  Check,
  Search,
  ExternalLink,
  ChevronDown,
  Info,
  ShieldCheck,
  Layers,
  BookOpen,
} from 'lucide-react';

interface CourseComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  course1: Course | null;
  course2: Course | null;
  allCourses: Course[];
  universities: University[];
  countries?: CountryMaster[];
  onChangeCourse1: (course: Course) => void;
  onChangeCourse2: (course: Course) => void;
  onCheckEligibility?: (course: Course) => void;
  onViewDetails?: (course: Course) => void;
}

export const CourseComparisonModal: React.FC<CourseComparisonModalProps> = ({
  isOpen,
  onClose,
  course1,
  course2,
  allCourses,
  universities,
  countries = [],
  onChangeCourse1,
  onChangeCourse2,
  onCheckEligibility,
  onViewDetails,
}) => {
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(true);
  const [searchQuery1, setSearchQuery1] = useState('');
  const [searchQuery2, setSearchQuery2] = useState('');
  const [isSelecting1, setIsSelecting1] = useState(false);
  const [isSelecting2, setIsSelecting2] = useState(false);

  if (!isOpen) return null;

  const uni1 = course1 ? universities.find((u) => u.university_id === course1.university_id) : null;
  const uni2 = course2 ? universities.find((u) => u.university_id === course2.university_id) : null;

  const country1 = course1 ? countries.find((c) => c.name.toLowerCase() === course1.destination_country.toLowerCase()) : null;
  const country2 = course2 ? countries.find((c) => c.name.toLowerCase() === course2.destination_country.toLowerCase()) : null;

  const handleSwap = () => {
    if (course1 && course2) {
      const temp = course1;
      onChangeCourse1(course2);
      onChangeCourse2(temp);
    }
  };

  const handlePrint = () => {
    if (!course1 || !course2) {
      window.print();
      return;
    }

    const headers = [
      'Comparative Parameter',
      `Option A: ${course1.course_name.slice(0, 30)}`,
      `Option B: ${course2.course_name.slice(0, 30)}`,
    ];

    const rows = [
      ['University', uni1?.name || 'Partner University', uni2?.name || 'Partner University'],
      ['Destination / City', `${course1.city}, ${course1.destination_country}`, `${course2.city}, ${course2.destination_country}`],
      ['Program Level', course1.program, course2.program],
      ['Duration & Mode', `${course1.duration} ${course1.duration_unit} (${course1.study_mode})`, `${course2.duration} ${course2.duration_unit} (${course2.study_mode})`],
      ['Annual Tuition Fee', `${course1.currency} ${course1.tuition_fee.toLocaleString()}`, `${course2.currency} ${course2.tuition_fee.toLocaleString()}`],
      ['Application Fee', course1.application_fee > 0 ? `${course1.currency} ${course1.application_fee}` : 'Free / Waived', course2.application_fee > 0 ? `${course2.currency} ${course2.application_fee}` : 'Free / Waived'],
      ['Intake Months', course1.intake_months.join(', '), course2.intake_months.join(', ')],
      ['Application Deadline', course1.application_deadline, course2.application_deadline],
      ['Min Academic Qualification', course1.eligibility.minimum_qualification, course2.eligibility.minimum_qualification],
      ['Min Grade / Percentage', `${course1.eligibility.minimum_percentage || 55}% ${course1.eligibility.minimum_cgpa ? `(${course1.eligibility.minimum_cgpa} CGPA)` : ''}`, `${course2.eligibility.minimum_percentage || 55}% ${course2.eligibility.minimum_cgpa ? `(${course2.eligibility.minimum_cgpa} CGPA)` : ''}`],
      ['Max Study Gap Permitted', `${course1.eligibility.study_gap_allowed_years} years`, `${course2.eligibility.study_gap_allowed_years} years`],
      ['Medium of Instruction (MOI)', course1.eligibility.moi_acceptance, course2.eligibility.moi_acceptance],
      ['IELTS Requirement', `Overall ${course1.eligibility.ielts_overall} (Min band ${course1.eligibility.ielts_min_band})`, `Overall ${course2.eligibility.ielts_overall} (Min band ${course2.eligibility.ielts_min_band})`],
      ['PTE Academic Score', `${course1.eligibility.pte_min} Score`, `${course2.eligibility.pte_min} Score`],
      ['Scholarships / Bursaries', course1.scholarship_available ? course1.scholarship_detail || 'Available' : 'None', course2.scholarship_available ? course2.scholarship_detail || 'Available' : 'None'],
      ['Post-Study Work Visa (PSWR)', country1?.psw_duration || country1?.post_study_work_visa || '2 - 3 Years', country2?.psw_duration || country2?.post_study_work_visa || '2 - 3 Years'],
    ];

    const infoFields = [
      { label: 'Comparison Mode', value: 'Side-by-Side Dual Option Analysis' },
      { label: 'Option A Institution', value: uni1?.name || course1.destination_country },
      { label: 'Option B Institution', value: uni2?.name || course2.destination_country },
      { label: 'Consultant Agency', value: 'Study World Consultant' },
    ];

    printFormattedReport({
      title: 'Study World Consultant — Comparative Course Assessment',
      subtitle: `Side-by-Side Admission & Eligibility Evaluation: Option A vs Option B`,
      badgeText: 'Program Comparison',
      infoFields,
      headers,
      rows,
    });
  };

  // Filtered lists for course selection drop-downs
  const filteredList1 = allCourses.filter((c) => {
    if (!searchQuery1) return true;
    const q = searchQuery1.toLowerCase();
    const u = universities.find((uni) => uni.university_id === c.university_id);
    return (
      c.course_name.toLowerCase().includes(q) ||
      c.destination_country.toLowerCase().includes(q) ||
      (u && u.name.toLowerCase().includes(q))
    );
  });

  const filteredList2 = allCourses.filter((c) => {
    if (!searchQuery2) return true;
    const q = searchQuery2.toLowerCase();
    const u = universities.find((uni) => uni.university_id === c.university_id);
    return (
      c.course_name.toLowerCase().includes(q) ||
      c.destination_country.toLowerCase().includes(q) ||
      (u && u.name.toLowerCase().includes(q))
    );
  });

  // Comparison helper functions
  const isDifferent = (val1: any, val2: any) => {
    if (val1 === undefined || val2 === undefined) return false;
    if (Array.isArray(val1) && Array.isArray(val2)) {
      return val1.join(',') !== val2.join(',');
    }
    return val1 !== val2;
  };

  const getDiffClass = (val1: any, val2: any) => {
    if (!highlightDifferences) return '';
    return isDifferent(val1, val2) ? 'bg-amber-50/70 text-amber-950 font-semibold' : '';
  };

  return (
    <div
      id="course-comparison-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="course-comparison-modal-container"
        className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-4 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-[#4A140F] via-[#7A2820] to-[#A8382C] text-white flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/20 text-[#C9A227] shadow-xs">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#C9A227] text-stone-900 uppercase tracking-wider">
                  Side-by-Side Evaluation
                </span>
                <span className="text-xs text-stone-200">Study World Consultant</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-bold leading-tight text-white">
                Course & Requirements Comparison
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Swap Button */}
            {course1 && course2 && (
              <button
                id="btn-swap-courses"
                onClick={handleSwap}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
                title="Swap column positions"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#C9A227]" />
                <span className="hidden sm:inline">Swap Sides</span>
              </button>
            )}

            {/* Print Button */}
            <button
              id="btn-print-comparison"
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-white/20"
              title="Print comparison sheet"
            >
              <Printer className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {/* Close Button */}
            <button
              id="btn-close-comparison-modal"
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors ml-1"
              title="Close Modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-2.5 bg-[#FBF6F1] border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                id="toggle-highlight-differences"
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="w-4 h-4 text-[#A8382C] rounded accent-[#A8382C]"
              />
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
                Highlight Differences
              </span>
            </label>
            <span className="text-stone-400">|</span>
            <span className="text-stone-600">
              Comparing <strong>{course1 ? course1.course_name : 'No selection'}</strong> vs{' '}
              <strong>{course2 ? course2.course_name : 'No selection'}</strong>
            </span>
          </div>

          <div className="text-stone-500 italic text-[11px]">
            * Values highlighted in amber differ between the two programs
          </div>
        </div>

        {/* Scrollable Comparison Matrix Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Course Profile Cards Header (Column 1 & Column 2) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Column 1: Course 1 */}
            <div className="bg-stone-50 rounded-2xl p-5 border-2 border-stone-200 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-[#A8382C] text-white text-[11px] font-bold rounded-full shadow-xs">
                    Course Option A
                  </span>
                  <div className="relative">
                    <button
                      id="btn-change-course-1"
                      onClick={() => setIsSelecting1(!isSelecting1)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-stone-300 hover:border-[#A8382C] text-stone-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Change Course</span>
                      <ChevronDown className="w-3 h-3 text-stone-500" />
                    </button>

                    {/* Change Course 1 Dropdown */}
                    {isSelecting1 && (
                      <div className="absolute right-0 mt-1 w-72 sm:w-80 bg-white border border-stone-300 rounded-xl shadow-xl z-30 p-2 text-xs">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={searchQuery1}
                            onChange={(e) => setSearchQuery1(e.target.value)}
                            placeholder="Search replacement course..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#A8382C]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-stone-100">
                          {filteredList1.slice(0, 15).map((c) => {
                            const u = universities.find((uni) => uni.university_id === c.university_id);
                            return (
                              <button
                                key={c.course_id}
                                onClick={() => {
                                  onChangeCourse1(c);
                                  setIsSelecting1(false);
                                  setSearchQuery1('');
                                }}
                                className="w-full text-left p-2 hover:bg-[#FBF6F1] rounded-lg transition-colors"
                              >
                                <p className="font-bold text-stone-900 truncate">{c.course_name}</p>
                                <p className="text-[11px] text-stone-500 truncate">
                                  {u?.name} · {c.destination_country} · {c.currency} {c.tuition_fee.toLocaleString()}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {course1 ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={uni1?.logo_url || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160'}
                        alt={uni1?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-white flex-shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-stone-900 truncate">{uni1?.name || 'Partner University'}</h4>
                        <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#A8382C]" />
                          <span>{course1.city}, {course1.destination_country}</span>
                          {uni1?.ranking && (
                            <span className="ml-1 px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded text-[10px] font-semibold">
                              QS #{uni1.ranking}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-display font-bold text-stone-900 leading-snug mb-2">
                      {course1.course_name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-stone-200 text-stone-800 text-[11px] font-bold rounded-md">
                        {course1.program}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-md">
                        {course1.status}
                      </span>
                      {course1.faculty && (
                        <span className="text-[11px] text-stone-500 truncate">
                          Faculty of {course1.faculty}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-stone-400">
                    <p>No course selected for Option A</p>
                  </div>
                )}
              </div>

              {course1 && (
                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(course1)}
                      className="text-xs font-bold text-stone-700 hover:text-[#A8382C] transition-colors"
                    >
                      View Full Details →
                    </button>
                  )}
                  {onCheckEligibility && (
                    <button
                      onClick={() => onCheckEligibility(course1)}
                      className="px-3 py-1.5 bg-[#A8382C] hover:bg-[#7A2820] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Check Match</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Column 2: Course 2 */}
            <div className="bg-stone-50 rounded-2xl p-5 border-2 border-stone-200 relative flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-0.5 bg-[#7A2820] text-white text-[11px] font-bold rounded-full shadow-xs">
                    Course Option B
                  </span>
                  <div className="relative">
                    <button
                      id="btn-change-course-2"
                      onClick={() => setIsSelecting2(!isSelecting2)}
                      className="px-2.5 py-1 text-xs font-semibold bg-white border border-stone-300 hover:border-[#A8382C] text-stone-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <span>Change Course</span>
                      <ChevronDown className="w-3 h-3 text-stone-500" />
                    </button>

                    {/* Change Course 2 Dropdown */}
                    {isSelecting2 && (
                      <div className="absolute right-0 mt-1 w-72 sm:w-80 bg-white border border-stone-300 rounded-xl shadow-xl z-30 p-2 text-xs">
                        <div className="relative mb-2">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={searchQuery2}
                            onChange={(e) => setSearchQuery2(e.target.value)}
                            placeholder="Search replacement course..."
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-[#A8382C]"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-stone-100">
                          {filteredList2.slice(0, 15).map((c) => {
                            const u = universities.find((uni) => uni.university_id === c.university_id);
                            return (
                              <button
                                key={c.course_id}
                                onClick={() => {
                                  onChangeCourse2(c);
                                  setIsSelecting2(false);
                                  setSearchQuery2('');
                                }}
                                className="w-full text-left p-2 hover:bg-[#FBF6F1] rounded-lg transition-colors"
                              >
                                <p className="font-bold text-stone-900 truncate">{c.course_name}</p>
                                <p className="text-[11px] text-stone-500 truncate">
                                  {u?.name} · {c.destination_country} · {c.currency} {c.tuition_fee.toLocaleString()}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {course2 ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <img
                        src={uni2?.logo_url || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160'}
                        alt={uni2?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-stone-200 bg-white flex-shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm text-stone-900 truncate">{uni2?.name || 'Partner University'}</h4>
                        <p className="text-xs text-stone-500 flex items-center gap-1 truncate">
                          <MapPin className="w-3 h-3 text-[#A8382C]" />
                          <span>{course2.city}, {course2.destination_country}</span>
                          {uni2?.ranking && (
                            <span className="ml-1 px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded text-[10px] font-semibold">
                              QS #{uni2.ranking}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-base sm:text-lg font-display font-bold text-stone-900 leading-snug mb-2">
                      {course2.course_name}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-stone-200 text-stone-800 text-[11px] font-bold rounded-md">
                        {course2.program}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded-md">
                        {course2.status}
                      </span>
                      {course2.faculty && (
                        <span className="text-[11px] text-stone-500 truncate">
                          Faculty of {course2.faculty}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-stone-400">
                    <p>No course selected for Option B</p>
                  </div>
                )}
              </div>

              {course2 && (
                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between gap-2">
                  {onViewDetails && (
                    <button
                      onClick={() => onViewDetails(course2)}
                      className="text-xs font-bold text-stone-700 hover:text-[#A8382C] transition-colors"
                    >
                      View Full Details →
                    </button>
                  )}
                  {onCheckEligibility && (
                    <button
                      onClick={() => onCheckEligibility(course2)}
                      className="px-3 py-1.5 bg-[#A8382C] hover:bg-[#7A2820] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Check Match</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {course1 && course2 ? (
            <div className="space-y-6">
              {/* SECTION 1: Financials & Timeline Comparison Matrix */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="bg-[#FBF6F1] px-5 py-3 border-b border-stone-200 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#A8382C]" />
                  <h4 className="font-display font-bold text-sm text-stone-900">
                    1. Financials & Program Duration
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
                        <th className="p-3.5 w-1/3 text-left">Key Attribute</th>
                        <th className="p-3.5 w-1/3 text-left font-bold text-[#A8382C]">Option A ({course1.course_name.slice(0, 20)}...)</th>
                        <th className="p-3.5 w-1/3 text-left font-bold text-[#7A2820]">Option B ({course2.course_name.slice(0, 20)}...)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-800">
                      {/* Annual Tuition Fee */}
                      <tr className={getDiffClass(course1.tuition_fee, course2.tuition_fee)}>
                        <td className="p-3.5 font-bold text-stone-900 flex items-center gap-1.5">
                          <span>Annual Tuition Fee</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-[#A8382C]">
                            {course1.currency} {course1.tuition_fee.toLocaleString()}
                          </span>
                          {course1.currency === course2.currency && course1.tuition_fee < course2.tuition_fee && (
                            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                              Lower by {course1.currency} {(course2.tuition_fee - course1.tuition_fee).toLocaleString()}
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-[#7A2820]">
                            {course2.currency} {course2.tuition_fee.toLocaleString()}
                          </span>
                          {course1.currency === course2.currency && course2.tuition_fee < course1.tuition_fee && (
                            <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                              Lower by {course2.currency} {(course1.tuition_fee - course2.tuition_fee).toLocaleString()}
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Program Duration */}
                      <tr className={getDiffClass(`${course1.duration} ${course1.duration_unit}`, `${course2.duration} ${course2.duration_unit}`)}>
                        <td className="p-3.5 font-bold text-stone-900">Program Duration</td>
                        <td className="p-3.5 font-semibold">
                          {course1.duration} {course1.duration_unit} ({course1.study_mode})
                        </td>
                        <td className="p-3.5 font-semibold">
                          {course2.duration} {course2.duration_unit} ({course2.study_mode})
                        </td>
                      </tr>

                      {/* Application Fee */}
                      <tr className={getDiffClass(course1.application_fee, course2.application_fee)}>
                        <td className="p-3.5 font-bold text-stone-900">Application Fee</td>
                        <td className="p-3.5">
                          {course1.application_fee > 0 ? (
                            <span>{course1.currency} {course1.application_fee}</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md">Free / Waived</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {course2.application_fee > 0 ? (
                            <span>{course2.currency} {course2.application_fee}</span>
                          ) : (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-md">Free / Waived</span>
                          )}
                        </td>
                      </tr>

                      {/* Intakes Available */}
                      <tr className={getDiffClass(course1.intake_months, course2.intake_months)}>
                        <td className="p-3.5 font-bold text-stone-900">Intake Months</td>
                        <td className="p-3.5 font-semibold text-stone-700">
                          {course1.intake_months.join(', ')}
                        </td>
                        <td className="p-3.5 font-semibold text-stone-700">
                          {course2.intake_months.join(', ')}
                        </td>
                      </tr>

                      {/* Application Deadlines */}
                      <tr className={getDiffClass(course1.application_deadline, course2.application_deadline)}>
                        <td className="p-3.5 font-bold text-stone-900">Application Deadline</td>
                        <td className="p-3.5">{course1.application_deadline}</td>
                        <td className="p-3.5">{course2.application_deadline}</td>
                      </tr>

                      {/* Scholarships */}
                      <tr className={getDiffClass(course1.scholarship_available, course2.scholarship_available)}>
                        <td className="p-3.5 font-bold text-stone-900">Scholarships & Bursaries</td>
                        <td className="p-3.5">
                          {course1.scholarship_available ? (
                            <div className="flex items-start gap-1.5 text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                              <Award className="w-4 h-4 text-[#C9A227] flex-shrink-0 mt-0.5" />
                              <span className="font-semibold">{course1.scholarship_detail || 'Available for international students'}</span>
                            </div>
                          ) : (
                            <span className="text-stone-400">No standard scholarships noted</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {course2.scholarship_available ? (
                            <div className="flex items-start gap-1.5 text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
                              <Award className="w-4 h-4 text-[#C9A227] flex-shrink-0 mt-0.5" />
                              <span className="font-semibold">{course2.scholarship_detail || 'Available for international students'}</span>
                            </div>
                          ) : (
                            <span className="text-stone-400">No standard scholarships noted</span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 2: Academic & Eligibility Requirements Matrix */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="bg-[#FBF6F1] px-5 py-3 border-b border-stone-200 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-[#A8382C]" />
                  <h4 className="font-display font-bold text-sm text-stone-900">
                    2. Academic & General Eligibility Requirements
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
                        <th className="p-3.5 w-1/3 text-left">Requirement Parameter</th>
                        <th className="p-3.5 w-1/3 text-left font-bold text-[#A8382C]">Option A</th>
                        <th className="p-3.5 w-1/3 text-left font-bold text-[#7A2820]">Option B</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-800">
                      {/* Minimum Prior Qualification */}
                      <tr className={getDiffClass(course1.eligibility.minimum_qualification, course2.eligibility.minimum_qualification)}>
                        <td className="p-3.5 font-bold text-stone-900">Minimum Prior Degree / Level</td>
                        <td className="p-3.5 font-semibold text-stone-900">
                          {course1.eligibility.minimum_qualification}
                        </td>
                        <td className="p-3.5 font-semibold text-stone-900">
                          {course2.eligibility.minimum_qualification}
                        </td>
                      </tr>

                      {/* Minimum Percentage / CGPA */}
                      <tr className={getDiffClass(course1.eligibility.minimum_percentage, course2.eligibility.minimum_percentage)}>
                        <td className="p-3.5 font-bold text-stone-900">Minimum Grade / Percentage</td>
                        <td className="p-3.5">
                          <span className="font-bold text-stone-900">
                            {course1.eligibility.minimum_percentage || 55}%
                          </span>
                          {course1.eligibility.minimum_cgpa && (
                            <span className="text-stone-500 ml-1">({course1.eligibility.minimum_cgpa} CGPA)</span>
                          )}
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-stone-900">
                            {course2.eligibility.minimum_percentage || 55}%
                          </span>
                          {course2.eligibility.minimum_cgpa && (
                            <span className="text-stone-500 ml-1">({course2.eligibility.minimum_cgpa} CGPA)</span>
                          )}
                        </td>
                      </tr>

                      {/* Max Permissible Study Gap */}
                      <tr className={getDiffClass(course1.eligibility.study_gap_allowed_years, course2.eligibility.study_gap_allowed_years)}>
                        <td className="p-3.5 font-bold text-stone-900">Max Permissible Study Gap</td>
                        <td className="p-3.5 font-bold text-stone-900">
                          Up to {course1.eligibility.study_gap_allowed_years} years
                        </td>
                        <td className="p-3.5 font-bold text-stone-900">
                          Up to {course2.eligibility.study_gap_allowed_years} years
                        </td>
                      </tr>

                      {/* Minimum Age */}
                      <tr className={getDiffClass(course1.eligibility.age_requirement_min || course1.eligibility.minimum_age, course2.eligibility.age_requirement_min || course2.eligibility.minimum_age)}>
                        <td className="p-3.5 font-bold text-stone-900">Age Requirement</td>
                        <td className="p-3.5">
                          Min {course1.eligibility.age_requirement_min || course1.eligibility.minimum_age || 18} years old
                        </td>
                        <td className="p-3.5">
                          Min {course2.eligibility.age_requirement_min || course2.eligibility.minimum_age || 18} years old
                        </td>
                      </tr>

                      {/* Nationality Restrictions */}
                      <tr className={getDiffClass(course1.eligibility.restricted_nationalities, course2.eligibility.restricted_nationalities)}>
                        <td className="p-3.5 font-bold text-stone-900">Restricted Nationalities</td>
                        <td className="p-3.5">
                          {course1.eligibility.restricted_nationalities && course1.eligibility.restricted_nationalities.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {course1.eligibility.restricted_nationalities.map((nat) => (
                                <span key={nat} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[10px]">
                                  {nat} (Restricted)
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> All Nationalities Accepted
                            </span>
                          )}
                        </td>
                        <td className="p-3.5">
                          {course2.eligibility.restricted_nationalities && course2.eligibility.restricted_nationalities.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {course2.eligibility.restricted_nationalities.map((nat) => (
                                <span key={nat} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[10px]">
                                  {nat} (Restricted)
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-emerald-700 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> All Nationalities Accepted
                            </span>
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 3: English Language Proficiency & Tests Matrix */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="bg-[#FBF6F1] px-5 py-3 border-b border-stone-200 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#A8382C]" />
                  <h4 className="font-display font-bold text-sm text-stone-900">
                    3. English Language Proficiency & Standardized Tests
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
                        <th className="p-3.5 w-1/3 text-left">Language Assessment</th>
                        <th className="p-3.5 w-1/3 text-left font-bold text-[#A8382C]">Option A</th>
                        <th className="p-3.5 w-1/3 text-left font-bold text-[#7A2820]">Option B</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-800">
                      {/* MOI Acceptance */}
                      <tr className={getDiffClass(course1.eligibility.moi_acceptance, course2.eligibility.moi_acceptance)}>
                        <td className="p-3.5 font-bold text-stone-900">Medium of Instruction (MOI)</td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                              course1.eligibility.moi_acceptance === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : course1.eligibility.moi_acceptance === 'Case-by-Case'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {course1.eligibility.moi_acceptance === 'Accepted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {course1.eligibility.moi_acceptance === 'Case-by-Case' && <AlertCircle className="w-3.5 h-3.5" />}
                            {course1.eligibility.moi_acceptance === 'Not Accepted' && <XCircle className="w-3.5 h-3.5" />}
                            <span>{course1.eligibility.moi_acceptance}</span>
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                              course2.eligibility.moi_acceptance === 'Accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : course2.eligibility.moi_acceptance === 'Case-by-Case'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {course2.eligibility.moi_acceptance === 'Accepted' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {course2.eligibility.moi_acceptance === 'Case-by-Case' && <AlertCircle className="w-3.5 h-3.5" />}
                            {course2.eligibility.moi_acceptance === 'Not Accepted' && <XCircle className="w-3.5 h-3.5" />}
                            <span>{course2.eligibility.moi_acceptance}</span>
                          </span>
                        </td>
                      </tr>

                      {/* IELTS */}
                      <tr className={getDiffClass(`${course1.eligibility.ielts_overall}_${course1.eligibility.ielts_min_band}`, `${course2.eligibility.ielts_overall}_${course2.eligibility.ielts_min_band}`)}>
                        <td className="p-3.5 font-bold text-stone-900">IELTS Academic</td>
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-stone-900">{course1.eligibility.ielts_overall}</span> Overall
                          <span className="text-stone-500 ml-1.5">(Min band {course1.eligibility.ielts_min_band})</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-stone-900">{course2.eligibility.ielts_overall}</span> Overall
                          <span className="text-stone-500 ml-1.5">(Min band {course2.eligibility.ielts_min_band})</span>
                        </td>
                      </tr>

                      {/* PTE Academic */}
                      <tr className={getDiffClass(course1.eligibility.pte_min, course2.eligibility.pte_min)}>
                        <td className="p-3.5 font-bold text-stone-900">PTE Academic</td>
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-stone-900">{course1.eligibility.pte_min}</span> Score
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-stone-900">{course2.eligibility.pte_min}</span> Score
                        </td>
                      </tr>

                      {/* TOEFL iBT */}
                      <tr className={getDiffClass(course1.eligibility.toefl_min, course2.eligibility.toefl_min)}>
                        <td className="p-3.5 font-bold text-stone-900">TOEFL iBT</td>
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-stone-900">{course1.eligibility.toefl_min}</span> Score
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-sm text-stone-900">{course2.eligibility.toefl_min}</span> Score
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 4: Destination & Visa Benefits */}
              <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
                <div className="bg-[#FBF6F1] px-5 py-3 border-b border-stone-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#A8382C]" />
                  <h4 className="font-display font-bold text-sm text-stone-900">
                    4. Destination Country & Post-Study Work Visa (PSWR)
                  </h4>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-stone-50 text-stone-600 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
                        <th className="p-3.5 w-1/3 text-left">Country Benefits</th>
                        <th className="p-3.5 w-1/3 text-left font-bold text-[#A8382C]">Option A ({course1.destination_country})</th>
                        <th className="p-3.5 w-1/3 text-left font-bold text-[#7A2820]">Option B ({course2.destination_country})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-800">
                      <tr className={getDiffClass(country1?.psw_duration || country1?.post_study_work_visa, country2?.psw_duration || country2?.post_study_work_visa)}>
                        <td className="p-3.5 font-bold text-stone-900">Post-Study Work Visa (PSWR)</td>
                        <td className="p-3.5 font-semibold text-stone-900">
                          {country1?.psw_duration || country1?.post_study_work_visa || '2 - 3 Years standard PSWR'}
                        </td>
                        <td className="p-3.5 font-semibold text-stone-900">
                          {country2?.psw_duration || country2?.post_study_work_visa || '2 - 3 Years standard PSWR'}
                        </td>
                      </tr>
                      <tr className={getDiffClass(country1?.visa_processing_weeks, country2?.visa_processing_weeks)}>
                        <td className="p-3.5 font-bold text-stone-900">Est. Visa Processing Timeline</td>
                        <td className="p-3.5">{country1?.visa_processing_weeks || '3 - 6 weeks'}</td>
                        <td className="p-3.5">{country2?.visa_processing_weeks || '3 - 6 weeks'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: Required Admission Checklist & Department Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Checklist A */}
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                  <h5 className="font-bold text-xs text-stone-900 mb-2.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#A8382C]" />
                    <span>Admission Checklist: Option A</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-stone-700 mb-3">
                    {(course1.eligibility.required_documents || ['Passport', 'Degree Certificate', 'Transcripts', 'SOP']).map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                  {course1.eligibility.important_notes && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                      <strong>Note:</strong> {course1.eligibility.important_notes}
                    </div>
                  )}
                </div>

                {/* Checklist B */}
                <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
                  <h5 className="font-bold text-xs text-stone-900 mb-2.5 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#7A2820]" />
                    <span>Admission Checklist: Option B</span>
                  </h5>
                  <ul className="space-y-1.5 text-xs text-stone-700 mb-3">
                    {(course2.eligibility.required_documents || ['Passport', 'Degree Certificate', 'Transcripts', 'SOP']).map((doc, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                  {course2.eligibility.important_notes && (
                    <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-amber-900">
                      <strong>Note:</strong> {course2.eligibility.important_notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-stone-50 rounded-2xl border border-stone-200">
              <Scale className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-stone-800">
                Please select two courses to display side-by-side comparison
              </h3>
              <p className="text-xs text-stone-500 max-w-md mx-auto mt-1">
                Choose courses from the search results or use the dropdown selectors at the top of each column.
              </p>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs flex-shrink-0">
          <div className="flex items-center gap-2 text-stone-500">
            <Info className="w-4 h-4 text-[#A8382C]" />
            <span>Study World Consultant internal evaluation tool · Ready for client consultation printout</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Comparison</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#A8382C] hover:bg-[#7A2820] text-white font-bold rounded-xl transition-colors shadow-xs"
            >
              Close Comparison
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
