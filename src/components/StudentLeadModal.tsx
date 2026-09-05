import React, { useState, useEffect, useMemo } from 'react';
import {
  Course,
  University,
  UserAccount,
  Franchise,
  StudentLeadRequest,
  StudentLeadRequestType,
  LeadPriority,
  StudentLeadStatus,
} from '../types';
import { ViewportOverlay } from './ViewportOverlay';
import {
  X,
  UserPlus,
  BookOpen,
  Building2,
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  FileText,
  AlertCircle,
  Search,
  CheckCircle2,
  UserCheck,
  Globe,
  Sparkles,
} from 'lucide-react';

interface StudentLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: StudentLeadRequest) => void;
  initialCourse?: Course | null;
  initialStudentData?: Partial<StudentLeadRequest> | null;
  courses: Course[];
  universities: University[];
  franchises: Franchise[];
  users: UserAccount[];
  currentUser: UserAccount;
  editingLead?: StudentLeadRequest | null;
  initialLead?: StudentLeadRequest | null;
}

export const StudentLeadModal: React.FC<StudentLeadModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCourse,
  initialStudentData,
  courses,
  universities,
  franchises,
  users,
  currentUser,
  editingLead,
  initialLead,
}) => {
  const activeLead = editingLead || initialLead;
  // Selected course state
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [courseSearchTerm, setCourseSearchTerm] = useState<string>('');
  const [showCoursePicker, setShowCoursePicker] = useState<boolean>(false);

  // Student details state
  const [studentName, setStudentName] = useState<string>('');
  const [studentEmail, setStudentEmail] = useState<string>('');
  const [studentPhone, setStudentPhone] = useState<string>('');
  const [studentCity, setStudentCity] = useState<string>('');
  const [nationality, setNationality] = useState<string>('Pakistan');
  const [passportNo, setPassportNo] = useState<string>('');
  const [academicQualification, setAcademicQualification] = useState<string>('');
  const [academicScore, setAcademicScore] = useState<string>('');
  const [englishTest, setEnglishTest] = useState<string>('IELTS 6.5 (min 6.0)');
  const [studyGapYears, setStudyGapYears] = useState<number>(0);

  // Request parameters
  const [requestType, setRequestType] = useState<StudentLeadRequestType>('Course Application');
  const [priority, setPriority] = useState<LeadPriority>('High');
  const [status, setStatus] = useState<StudentLeadStatus>('New Inquiry');
  const [intake, setIntake] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Ownership & Counselor Assignment
  const [assignedCounselorId, setAssignedCounselorId] = useState<string>('');

  // Form errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or populate fields when modal opens or initial data changes
  useEffect(() => {
    if (!isOpen) return;

    if (activeLead) {
      // Find course_id if available, or attempt to match by course_name from courses
      let targetCourseId = activeLead.course_id || '';
      if (!targetCourseId && activeLead.course_name) {
        const matched = courses.find(
          (c) => c.course_name?.toLowerCase() === activeLead.course_name.toLowerCase()
        );
        if (matched) targetCourseId = matched.course_id;
      }
      setSelectedCourseId(targetCourseId);
      setStudentName(activeLead.student_name || '');
      setStudentEmail(activeLead.student_email || '');
      setStudentPhone(activeLead.student_phone || '');
      setStudentCity(activeLead.student_city || '');
      setNationality(activeLead.nationality || 'Pakistan');
      setPassportNo(activeLead.passport_no || '');
      setAcademicQualification(activeLead.academic_qualification || '');
      setAcademicScore(activeLead.academic_score || '');
      setEnglishTest(activeLead.english_test || '');
      setStudyGapYears(activeLead.study_gap_years ?? 0);
      setRequestType(activeLead.request_type || 'Course Application');
      setPriority(activeLead.priority || 'High');
      setStatus(activeLead.status || 'New Inquiry');
      setIntake(activeLead.intake || '');
      setNotes(activeLead.notes || '');
      setAssignedCounselorId(activeLead.counselor_id || currentUser.id);
      setShowCoursePicker(false);
    } else {
      // New lead mode
      const preselectedCourse = initialCourse || (courses.length > 0 ? courses[0] : null);
      setSelectedCourseId(preselectedCourse ? preselectedCourse.course_id : '');
      
      if (initialStudentData) {
        setStudentName(initialStudentData.student_name || '');
        setStudentEmail(initialStudentData.student_email || '');
        setStudentPhone(initialStudentData.student_phone || '');
        setStudentCity(initialStudentData.student_city || '');
        setNationality(initialStudentData.nationality || 'Pakistan');
        setPassportNo(initialStudentData.passport_no || '');
        setAcademicQualification(initialStudentData.academic_qualification || '');
        setAcademicScore(initialStudentData.academic_score || '');
        setEnglishTest(initialStudentData.english_test || 'IELTS 6.5 (min 6.0)');
        setStudyGapYears(initialStudentData.study_gap_years ?? 0);
        setRequestType(initialStudentData.request_type || 'Course Application');
        setPriority(initialStudentData.priority || 'High');
        setStatus(initialStudentData.status || 'New Inquiry');
        setIntake(initialStudentData.intake || (preselectedCourse?.intake_months?.[0] || 'September 2026'));
        setNotes(initialStudentData.notes || '');
      } else {
        setStudentName('');
        setStudentEmail('');
        setStudentPhone('');
        setStudentCity('');
        setNationality('Pakistan');
        setPassportNo('');
        setAcademicQualification('');
        setAcademicScore('');
        setEnglishTest('IELTS 6.5 (min 6.0)');
        setStudyGapYears(0);
        setRequestType('Course Application');
        setPriority('High');
        setStatus('New Inquiry');
        setIntake(preselectedCourse?.intake_months?.[0] || 'September 2026');
        setNotes('');
      }

      setAssignedCounselorId(currentUser.id);
      setShowCoursePicker(!preselectedCourse);
    }
    setErrors({});
  }, [isOpen, activeLead, initialCourse, initialStudentData, currentUser, courses]);

  // Selected Course Object with Multi-Tier Fallback
  const currentSelectedCourse = useMemo<Course | null>(() => {
    // 1. Try finding by selectedCourseId (exact, trimmed, or case-insensitive)
    if (selectedCourseId) {
      const matchById = courses.find(
        (c) =>
          c.course_id === selectedCourseId ||
          c.course_id?.trim().toLowerCase() === selectedCourseId.trim().toLowerCase()
      );
      if (matchById) return matchById;

      if (
        initialCourse &&
        (initialCourse.course_id === selectedCourseId ||
          initialCourse.course_id?.trim().toLowerCase() === selectedCourseId.trim().toLowerCase())
      ) {
        return initialCourse;
      }
    }

    // 2. Try finding by activeLead's course_id or course_name in courses list
    if (activeLead) {
      if (activeLead.course_id) {
        const matchByLeadId = courses.find(
          (c) =>
            c.course_id === activeLead.course_id ||
            c.course_id?.trim().toLowerCase() === activeLead.course_id?.trim().toLowerCase()
        );
        if (matchByLeadId) return matchByLeadId;
      }

      if (activeLead.course_name) {
        const cleanLeadCourseName = activeLead.course_name.trim().toLowerCase();
        const matchByNameAndCountry = courses.find(
          (c) =>
            c.course_name?.trim().toLowerCase() === cleanLeadCourseName &&
            (!activeLead.destination_country ||
              c.destination_country?.trim().toLowerCase() === activeLead.destination_country.trim().toLowerCase())
        );
        if (matchByNameAndCountry) return matchByNameAndCountry;

        const matchByName = courses.find(
          (c) => c.course_name?.trim().toLowerCase() === cleanLeadCourseName
        );
        if (matchByName) return matchByName;
      }

      // 3. Fallback: Synthesize complete Course object from activeLead snapshot fields
      if (activeLead.course_name || activeLead.course_id) {
        return {
          course_id: activeLead.course_id || selectedCourseId || `lead_course_${activeLead.id}`,
          university_id: activeLead.university_id || 'uni_snapshot',
          course_name: activeLead.course_name || 'Selected Academic Program',
          program: activeLead.program_level || 'Postgraduate',
          duration: 1,
          duration_unit: 'years',
          tuition_fee: activeLead.tuition_fee ?? 0,
          currency: activeLead.currency || 'USD',
          intake_months: activeLead.intake ? [activeLead.intake] : ['September 2026'],
          destination_country: activeLead.destination_country || 'International',
          city: activeLead.city || '',
          is_active: true,
          academic_requirements: {
            min_qualification: activeLead.academic_qualification || 'Degree Level',
            min_percentage: activeLead.academic_score || 'Pass',
          },
          english_requirements: {
            test_name: 'IELTS / Proficiency',
            minimum_score: activeLead.english_test || '6.0',
          },
        };
      }
    }

    // 4. Initial Course passed as prop
    if (initialCourse) return initialCourse;

    return null;
  }, [courses, selectedCourseId, activeLead, initialCourse]);

  const currentSelectedUni = useMemo<University | null>(() => {
    if (!currentSelectedCourse) return null;
    
    // 1. Try finding by university_id
    if (currentSelectedCourse.university_id) {
      const matchUni = universities.find(
        (u) =>
          u.university_id === currentSelectedCourse.university_id ||
          u.university_id?.trim().toLowerCase() === currentSelectedCourse.university_id?.trim().toLowerCase()
      );
      if (matchUni) return matchUni;
    }

    // 2. Try finding by university name
    const targetUniName = activeLead?.university_name;
    if (targetUniName) {
      const cleanName = targetUniName.trim().toLowerCase();
      const matchByName = universities.find(
        (u) => u.name?.trim().toLowerCase() === cleanName
      );
      if (matchByName) return matchByName;
    }

    // 3. Try finding by destination country
    if (currentSelectedCourse.destination_country) {
      const matchByCountry = universities.find(
        (u) => u.country?.trim().toLowerCase() === currentSelectedCourse.destination_country.trim().toLowerCase()
      );
      if (matchByCountry) return matchByCountry;
    }

    // 4. Fallback: Synthesize University object
    if (activeLead?.university_name) {
      return {
        university_id: activeLead.university_id || currentSelectedCourse.university_id || 'uni_snapshot',
        name: activeLead.university_name,
        country: activeLead.destination_country || currentSelectedCourse.destination_country || 'Global',
        city: activeLead.city || currentSelectedCourse.city || '',
        ranking: 0,
        logo_url: '',
        featured: false,
        website: '',
        intakes: currentSelectedCourse.intake_months || ['September'],
        campus_locations: [activeLead.city || currentSelectedCourse.city || 'Main Campus'],
        scholarships_available: true,
        contact_email: '',
      };
    }

    return null;
  }, [universities, currentSelectedCourse, activeLead]);

  // Filtered available courses for course picker
  const filteredCoursesList = useMemo(() => {
    let list = courses;
    if (courseSearchTerm.trim()) {
      const q = courseSearchTerm.toLowerCase();
      list = courses.filter((c) => {
        const u = universities.find((uni) => uni.university_id === c.university_id);
        return (
          c.course_name.toLowerCase().includes(q) ||
          c.destination_country.toLowerCase().includes(q) ||
          c.program.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          (u && u.name.toLowerCase().includes(q))
        );
      });
    }
    if (currentSelectedCourse && !list.some((c) => c.course_id === currentSelectedCourse.course_id)) {
      return [currentSelectedCourse, ...list].slice(0, 30);
    }
    return list.slice(0, 30);
  }, [courses, universities, courseSearchTerm, currentSelectedCourse]);

  // Available counselors based on current user's role:
  // - Admin: can assign to any active user
  // - Franchise Admin: can assign to any counselor in their franchise or themselves
  // - Office Staff / Franchise Staff: assigned to themselves
  const eligibleCounselors = useMemo(() => {
    if (currentUser.role === 'Admin') {
      return users.filter((u) => u.status === 'Active');
    }
    if (currentUser.role === 'Franchise Admin') {
      return users.filter(
        (u) =>
          u.status === 'Active' &&
          (u.id === currentUser.id || u.franchise_id === currentUser.franchise_id)
      );
    }
    // Office Staff / Franchise Staff: assigned to themselves
    return [currentUser];
  }, [users, currentUser]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!currentSelectedCourse) {
      errs.course = 'Please select a valid course for this student lead.';
    }
    if (!studentName.trim()) {
      errs.name = 'Student name is required.';
    }
    if (!studentEmail.trim()) {
      errs.email = 'Student email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(studentEmail.trim())) {
      errs.email = 'Enter a valid email address.';
    }
    if (!studentPhone.trim()) {
      errs.phone = 'Contact number or WhatsApp is required.';
    }
    if (!assignedCounselorId) {
      errs.counselor = 'Assigned counselor is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!currentSelectedCourse) return;

    const assignedUser =
      users.find((u) => u.id === assignedCounselorId) || currentUser;

    const assignedFranchise = assignedUser.franchise_id
      ? franchises.find((f) => f.id === assignedUser.franchise_id)
      : null;

    const now = new Date().toISOString();
    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (activeLead) {
      const updated: StudentLeadRequest = {
        ...activeLead,
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        student_phone: studentPhone.trim(),
        student_city: studentCity.trim() || undefined,
        nationality: nationality.trim(),
        passport_no: passportNo.trim() || undefined,
        academic_qualification: academicQualification.trim() || undefined,
        academic_score: academicScore.trim() || undefined,
        english_test: englishTest.trim() || undefined,
        study_gap_years: studyGapYears,
        course_id: currentSelectedCourse.course_id,
        course_name: currentSelectedCourse.course_name,
        university_id: currentSelectedCourse.university_id,
        university_name: currentSelectedUni?.name || currentSelectedCourse.destination_country,
        destination_country: currentSelectedCourse.destination_country,
        city: currentSelectedCourse.city,
        program_level: currentSelectedCourse.program,
        tuition_fee: currentSelectedCourse.tuition_fee,
        currency: currentSelectedCourse.currency,
        intake: intake || currentSelectedCourse.intake_months[0] || 'September 2026',
        counselor_id: assignedUser.id,
        counselor_name: assignedUser.name,
        counselor_email: assignedUser.email,
        counselor_role: assignedUser.role,
        counselor_phone: assignedUser.phone,
        franchise_id: assignedUser.franchise_id,
        franchise_name: assignedFranchise?.name || assignedUser.franchise_name,
        branch_code: assignedFranchise?.code || assignedUser.branch_code,
        request_type: requestType,
        priority,
        status,
        notes: notes.trim() || undefined,
        updated_at: now,
        timeline: [
          ...activeLead.timeline,
          {
            id: `tl_${Date.now()}`,
            date: formattedDate,
            action: 'Lead Updated',
            performed_by: currentUser.name,
            performed_by_role: currentUser.role,
            comment: `Status: ${status} | Priority: ${priority}`,
          },
        ],
      };
      onSave(updated);
    } else {
      const newLead: StudentLeadRequest = {
        id: `lead_${Date.now()}`,
        student_name: studentName.trim(),
        student_email: studentEmail.trim(),
        student_phone: studentPhone.trim(),
        student_city: studentCity.trim() || undefined,
        nationality: nationality.trim(),
        passport_no: passportNo.trim() || undefined,
        academic_qualification: academicQualification.trim() || undefined,
        academic_score: academicScore.trim() || undefined,
        english_test: englishTest.trim() || undefined,
        study_gap_years: studyGapYears,
        course_id: currentSelectedCourse.course_id,
        course_name: currentSelectedCourse.course_name,
        university_id: currentSelectedCourse.university_id,
        university_name: currentSelectedUni?.name || currentSelectedCourse.destination_country,
        destination_country: currentSelectedCourse.destination_country,
        city: currentSelectedCourse.city,
        program_level: currentSelectedCourse.program,
        tuition_fee: currentSelectedCourse.tuition_fee,
        currency: currentSelectedCourse.currency,
        intake: intake || currentSelectedCourse.intake_months[0] || 'September 2026',
        counselor_id: assignedUser.id,
        counselor_name: assignedUser.name,
        counselor_email: assignedUser.email,
        counselor_role: assignedUser.role,
        counselor_phone: assignedUser.phone,
        franchise_id: assignedUser.franchise_id,
        franchise_name: assignedFranchise?.name || assignedUser.franchise_name,
        branch_code: assignedFranchise?.code || assignedUser.branch_code,
        request_type: requestType,
        priority,
        status: status || 'New Inquiry',
        notes: notes.trim() || undefined,
        created_at: now,
        updated_at: now,
        timeline: [
          {
            id: `tl_${Date.now()}`,
            date: formattedDate,
            action: 'Lead Created',
            performed_by: currentUser.name,
            performed_by_role: currentUser.role,
            comment: `Initial request created with ${currentSelectedCourse.course_name} (${currentSelectedCourse.destination_country}).`,
          },
        ],
      };
      onSave(newLead);
    }
    onClose();
  };

  return (
    <ViewportOverlay onBackdropClick={onClose}>
      <div
        id="student-lead-modal-container"
        className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#4A140F] via-[#7A2820] to-[#A8382C] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#C9A227] text-stone-950 shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-display font-bold">
                {activeLead ? 'Edit Student Lead / Request' : 'Create Student Lead with Course'}
              </h2>
              <p className="text-xs text-stone-200">
                Staff Student Lead Generation & Application Tracking (SWC Portal)
              </p>
            </div>
          </div>
          <button
            id="close-lead-modal-btn"
            onClick={onClose}
            className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-xs sm:text-sm text-stone-800">
          {/* Section 1: Selected Course Summary & Picker */}
          <div className="space-y-3 p-4 rounded-xl bg-[#FBF6F1] border border-stone-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-[#7A2820] text-sm">
                <BookOpen className="w-4 h-4 text-[#A8382C]" />
                <span>Selected Available Course</span>
              </div>
              <button
                type="button"
                id="toggle-course-picker-btn"
                onClick={() => setShowCoursePicker(!showCoursePicker)}
                className="text-xs font-bold text-[#A8382C] hover:text-[#7A2820] underline"
              >
                {showCoursePicker ? 'Hide Course Picker' : 'Change / Select Different Course'}
              </button>
            </div>

            {/* If Course is selected, show summary card */}
            {currentSelectedCourse ? (
              <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF6F1] text-stone-800 border border-stone-200">
                      {currentSelectedCourse.program}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Active Course
                    </span>
                  </div>
                  <span className="font-bold text-sm text-[#A8382C]">
                    {currentSelectedCourse.currency} {currentSelectedCourse.tuition_fee.toLocaleString()} / year
                  </span>
                </div>

                <h3 className="text-base font-display font-bold text-stone-900">
                  {currentSelectedCourse.course_name}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                  <span className="font-semibold text-stone-800 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-[#A8382C]" />
                    {currentSelectedUni?.name || currentSelectedCourse.destination_country}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    {currentSelectedCourse.city}, {currentSelectedCourse.destination_country}
                  </span>
                  <span>·</span>
                  <span>Duration: {currentSelectedCourse.duration} {currentSelectedCourse.duration_unit}</span>
                  <span>·</span>
                  <span>Intakes: {currentSelectedCourse.intake_months.join(', ')}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>No course selected yet. Choose a course from below.</span>
              </div>
            )}

            {errors.course && (
              <p className="text-xs text-rose-600 font-semibold">{errors.course}</p>
            )}

            {/* Searchable Course Picker Dropdown Panel */}
            {showCoursePicker && (
              <div className="mt-3 space-y-3 pt-3 border-t border-stone-200">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search available courses by name, university, or country..."
                    value={courseSearchTerm}
                    onChange={(e) => setCourseSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 border border-stone-200 rounded-xl p-2 bg-white divide-y divide-stone-100">
                  {filteredCoursesList.map((c) => {
                    const uni = universities.find((u) => u.university_id === c.university_id);
                    const isSelected = c.course_id === selectedCourseId;
                    return (
                      <div
                        key={c.course_id}
                        onClick={() => {
                          setSelectedCourseId(c.course_id);
                          setIntake(c.intake_months[0] || 'September 2026');
                          setShowCoursePicker(false);
                        }}
                        className={`p-2.5 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-3 text-xs ${
                          isSelected ? 'bg-amber-50 border border-[#C9A227]' : 'hover:bg-stone-50'
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 truncate">{c.course_name}</p>
                          <p className="text-[11px] text-stone-500 truncate">
                            {uni?.name || c.destination_country} · {c.city}, {c.destination_country} ({c.program})
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-bold text-[#A8382C] block">
                            {c.currency} {c.tuition_fee.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-stone-500">
                            Intakes: {c.intake_months.slice(0, 2).join(', ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Student Personal & Contact Details */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#7A2820] flex items-center gap-2 border-b border-stone-200 pb-2">
              <GraduationCap className="w-4 h-4 text-[#A8382C]" />
              <span>Student Personal & Academic Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {/* Student Full Name */}
              <div className="space-y-1 sm:col-span-2">
                <label className="font-semibold text-stone-700 block">
                  Student Full Name <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  id="student-name-input"
                  placeholder="e.g. Muhammad Bilal Khan"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border bg-white focus:outline-none focus:border-[#A8382C] ${
                    errors.name ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300'
                  }`}
                />
                {errors.name && <p className="text-xs text-rose-600">{errors.name}</p>}
              </div>

              {/* Student Nationality */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Nationality / Country <span className="text-rose-600">*</span>
                </label>
                <select
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                >
                  <option value="Pakistan">🇵🇰 Pakistan</option>
                  <option value="India">🇮🇳 India</option>
                  <option value="Bangladesh">🇧🇩 Bangladesh</option>
                  <option value="Nigeria">🇳🇬 Nigeria</option>
                  <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
                  <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
                  <option value="Sri Lanka">🇱🇰 Sri Lanka</option>
                  <option value="Nepal">🇳🇵 Nepal</option>
                  <option value="Ghana">🇬🇭 Ghana</option>
                  <option value="Kenya">🇰🇪 Kenya</option>
                  <option value="Other">🌍 Other Country</option>
                </select>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Student Email <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="email"
                    id="student-email-input"
                    placeholder="student@example.com"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white focus:outline-none focus:border-[#A8382C] ${
                      errors.email ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-xs text-rose-600">{errors.email}</p>}
              </div>

              {/* Phone / WhatsApp */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">
                  Phone / WhatsApp <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    id="student-phone-input"
                    placeholder="+92 300 1234567"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className={`w-full pl-9 pr-3 py-2 rounded-xl border bg-white focus:outline-none focus:border-[#A8382C] ${
                      errors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-stone-300'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-xs text-rose-600">{errors.phone}</p>}
              </div>

              {/* City of Residence */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">City of Residence</label>
                <input
                  type="text"
                  placeholder="e.g. Lahore, Islamabad, Karachi"
                  value={studentCity}
                  onChange={(e) => setStudentCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                />
              </div>

              {/* Passport Number */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Passport Number / CNIC</label>
                <input
                  type="text"
                  placeholder="e.g. PK1234567"
                  value={passportNo}
                  onChange={(e) => setPassportNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                />
              </div>

              {/* Highest Academic Qualification */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Highest Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. FSc Pre-Eng, A-Levels, BBA"
                  value={academicQualification}
                  onChange={(e) => setAcademicQualification(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                />
              </div>

              {/* Academic Score / Percentage */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Academic Score / CGPA</label>
                <input
                  type="text"
                  placeholder="e.g. 76% or 3.3 CGPA"
                  value={academicScore}
                  onChange={(e) => setAcademicScore(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                />
              </div>

              {/* English Proficiency */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">English Test / MOI</label>
                <input
                  type="text"
                  placeholder="e.g. IELTS 6.5, PTE 62, or MOI"
                  value={englishTest}
                  onChange={(e) => setEnglishTest(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                />
              </div>

              {/* Study Gap in Years */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Study Gap (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={studyGapYears}
                  onChange={(e) => setStudyGapYears(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Request Type, Priority, Target Intake & Ownership Assignment */}
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-[#7A2820] flex items-center gap-2 border-b border-stone-200 pb-2">
              <UserCheck className="w-4 h-4 text-[#A8382C]" />
              <span>Application Parameters & Counselor Assignment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {/* Request Type */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Request Type</label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value as StudentLeadRequestType)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                >
                  <option value="Course Application">Course Application</option>
                  <option value="Lead Inquiry">Lead Inquiry</option>
                  <option value="Pre-Assessment">Pre-Assessment</option>
                  <option value="Offer Letter Request">Offer Letter Request</option>
                  <option value="Visa Filing Assistance">Visa Filing Assistance</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Lead Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as LeadPriority)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                >
                  <option value="High">🔥 High Priority</option>
                  <option value="Medium">⚡ Medium Priority</option>
                  <option value="Low">🌱 Low Priority</option>
                </select>
              </div>

              {/* Lead Status */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as StudentLeadStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                >
                  <option value="New Inquiry">New Inquiry</option>
                  <option value="Under Assessment">Under Assessment</option>
                  <option value="Documents Pending">Documents Pending</option>
                  <option value="Application Submitted">Application Submitted</option>
                  <option value="Conditional Offer">Conditional Offer</option>
                  <option value="Unconditional Offer">Unconditional Offer</option>
                  <option value="Visa Processing">Visa Processing</option>
                  <option value="Enrolled">Enrolled</option>
                  <option value="Closed / Rejected">Closed / Rejected</option>
                </select>
              </div>

              {/* Target Intake */}
              <div className="space-y-1">
                <label className="font-semibold text-stone-700 block">Target Intake</label>
                <input
                  type="text"
                  placeholder="e.g. September 2026"
                  value={intake}
                  onChange={(e) => setIntake(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                />
              </div>

              {/* Assigned Counselor & Franchise Scope */}
              <div className="space-y-1 sm:col-span-2 md:col-span-4">
                <label className="font-semibold text-stone-700 block">
                  Assigned Counselor & Branch Scope <span className="text-rose-600">*</span>
                </label>
                <select
                  value={assignedCounselorId}
                  onChange={(e) => setAssignedCounselorId(e.target.value)}
                  disabled={currentUser.role === 'Franchise Staff' || currentUser.role === 'B-2-B'}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C] disabled:bg-stone-100 disabled:cursor-not-allowed"
                >
                  {eligibleCounselors.map((counselor) => {
                    const fr = counselor.franchise_id
                      ? franchises.find((f) => f.id === counselor.franchise_id)
                      : null;
                    const scopeLabel = counselor.role === 'B-2-B'
                      ? 'Independent B-2-B Partner'
                      : fr
                      ? `${fr.name} (${fr.code})`
                      : 'Head Office Central';
                    return (
                      <option key={counselor.id} value={counselor.id}>
                        {counselor.name} ({counselor.role}) — {scopeLabel}
                      </option>
                    );
                  })}
                </select>
                <p className="text-[11px] text-stone-500 mt-1">
                  {currentUser.role === 'Admin'
                    ? '👑 Central Admin has full view and can assign to any counselor in the system.'
                    : currentUser.role === 'Franchise Admin'
                    ? '🏛️ Franchise Admin can assign to any counselor within their branch.'
                    : currentUser.role === 'B-2-B'
                    ? '🤝 Independent B-2-B Lead referral registered under your partner account.'
                    : '👤 Lead will be assigned to your counselor account.'}
                </p>
                {errors.counselor && (
                  <p className="text-xs text-rose-600">{errors.counselor}</p>
                )}
              </div>
            </div>

            {/* Notes / Counselor Remarks */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700 block">
                Counseling Notes & Action Items
              </label>
              <textarea
                rows={3}
                placeholder="Add student background notes, documents submitted, fee constraints, or special instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              />
            </div>
          </div>

          {/* Visibility Notice Box */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-[#C9A227]/40 text-amber-900 flex items-start gap-2.5 text-xs">
            <Sparkles className="w-4 h-4 text-[#C9A227] flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-stone-900 block">
                Access & Visibility Security Policy Enforced
              </strong>
              <span>
                As per system rules, this student request will be viewable strictly by{' '}
                <strong>Main Admin</strong>, <strong>Head Office Staff</strong>,{' '}
                <strong>Related Counselor</strong>, and <strong>Its Franchise Admin</strong>.
              </span>
            </div>
          </div>

          {/* Form Actions Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-xl border border-stone-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-student-lead-btn"
              className="px-6 py-2 text-xs font-bold text-white bg-[#A8382C] hover:bg-[#7A2820] rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-[#C9A227]" />
              <span>{activeLead ? 'Save Changes' : 'Create Student Lead'}</span>
            </button>
          </div>
        </form>
      </div>
    </ViewportOverlay>
  );
};
