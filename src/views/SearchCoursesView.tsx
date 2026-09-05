import React, { useState, useMemo } from 'react';
import { Course, University, ProgramLevel, DurationBucket, UserAccount, isB2BUser } from '../types';
import { exportToCsv, printFormattedReport } from '../utils/exportUtils';
import { ALL_COUNTRIES_DATA } from '../data/countriesData';
import {
  Search,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ListFilter,
  Download,
  Printer,
  Sparkles,
  MapPin,
  Calendar,
  DollarSign,
  GraduationCap,
  Award,
  BookOpen,
  ArrowUpDown,
  UserCheck,
  UserPlus,
  CheckCircle,
  Scale,
  CheckSquare,
  Square,
  Check,
  X,
  ArrowLeftRight,
  Lock,
  ShieldAlert,
  ShieldCheck,
  Globe2,
} from 'lucide-react';

interface SearchCoursesViewProps {
  courses: Course[];
  universities: University[];
  currentUser: UserAccount;
  onSelectCourse: (course: Course) => void;
  onCheckEligibility: (course: Course) => void;
  onCompareCourses?: (course1: Course, course2: Course) => void;
  selectedForComparison?: Course[];
  onToggleComparison?: (course: Course) => void;
  onCreateLead?: (course: Course) => void;
  initialSearchQuery?: string;
}

export const SearchCoursesView: React.FC<SearchCoursesViewProps> = ({
  courses = [],
  universities = [],
  currentUser,
  onSelectCourse,
  onCheckEligibility,
  onCompareCourses,
  selectedForComparison: externalSelectedForComparison,
  onToggleComparison: externalOnToggleComparison,
  onCreateLead,
  initialSearchQuery = '',
}) => {
  // Local comparison state if not managed externally
  const [internalComparisonList, setInternalComparisonList] = useState<Course[]>([]);
  const comparisonList = externalSelectedForComparison !== undefined ? externalSelectedForComparison : internalComparisonList;

  const toggleComparison = (course: Course) => {
    if (externalOnToggleComparison) {
      externalOnToggleComparison(course);
      return;
    }
    setInternalComparisonList((prev) => {
      const exists = prev.some((c) => c.course_id === course.course_id);
      if (exists) {
        return prev.filter((c) => c.course_id !== course.course_id);
      }
      if (prev.length >= 2) {
        // Replace second item if 2 are already selected
        return [prev[0], course];
      }
      return [...prev, course];
    });
  };

  const handleLaunchComparison = () => {
    if (comparisonList.length >= 2 && onCompareCourses) {
      onCompareCourses(comparisonList[0], comparisonList[1]);
    } else if (comparisonList.length === 1 && onCompareCourses) {
      // Pick a default second course from same destination or another course in list
      const secondCourse = courses.find((c) => c.course_id !== comparisonList[0].course_id) || courses[1];
      if (secondCourse) {
        onCompareCourses(comparisonList[0], secondCourse);
      }
    }
  };

  const clearComparison = () => {
    if (externalOnToggleComparison && externalSelectedForComparison) {
      externalSelectedForComparison.forEach((c) => externalOnToggleComparison(c));
    } else {
      setInternalComparisonList([]);
    }
  };
  // Standard Filters
  const [courseNameQuery, setCourseNameQuery] = useState(initialSearchQuery);
  const [studentNationality, setStudentNationality] = useState('');
  const [studyDestination, setStudyDestination] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [englishRequirementType, setEnglishRequirementType] = useState<string>('');
  const [intakeMonth, setIntakeMonth] = useState<string>('');
  const [intakeYear, setIntakeYear] = useState<string>('');
  const [durationBucket, setDurationBucket] = useState<string>('');

  // Sync initialSearchQuery if passed dynamically
  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setCourseNameQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Advanced Filters State (Collapsible)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [universityFilter, setUniversityFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [maxTuition, setMaxTuition] = useState<string>('');
  const [maxApplicationFee, setMaxApplicationFee] = useState<string>('');
  const [scholarshipOnly, setScholarshipOnly] = useState(false);
  const [moiAcceptedOnly, setMoiAcceptedOnly] = useState(false);
  const [maxStudyGap, setMaxStudyGap] = useState<string>('');
  const [studyModeFilter, setStudyModeFilter] = useState<string>('');

  // View state & sorting
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'featured' | 'fee_asc' | 'fee_desc' | 'duration' | 'name'>('featured');

  // Autocomplete suggestions list
  const autocompleteSuggestions = useMemo(() => {
    if (!courseNameQuery || courseNameQuery.length < 2) return [];
    const query = courseNameQuery.toLowerCase().trim();
    const matches = Array.from(
      new Set(
        courses
          .map((c) => c?.course_name)
          .filter((name): name is string => Boolean(name && name.toLowerCase().includes(query)))
      )
    ).slice(0, 5);
    return matches;
  }, [courseNameQuery, courses]);

  // All global country destinations
  const destinations = useMemo(() => {
    return ALL_COUNTRIES_DATA.map((c) => {
      const activeUnis = universities.filter(
        (u) => u.country.toLowerCase() === c.name.toLowerCase()
      ).length;
      return {
        ...c,
        activeUnis,
      };
    }).sort((a, b) => {
      if (a.activeUnis > 0 && b.activeUnis === 0) return -1;
      if (a.activeUnis === 0 && b.activeUnis > 0) return 1;
      return a.name.localeCompare(b.name);
    });
  }, [universities]);

  // All Global Nationalities
  const nationalities = ALL_COUNTRIES_DATA;

  const monthsList = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const yearsList = [2026, 2027, 2028, 2029, 2030];

  const resetFilters = () => {
    setCourseNameQuery('');
    setStudentNationality('');
    setStudyDestination('');
    setSelectedProgram('');
    setEnglishRequirementType('');
    setIntakeMonth('');
    setIntakeYear('');
    setDurationBucket('');
    setUniversityFilter('');
    setCityFilter('');
    setMaxTuition('');
    setMaxApplicationFee('');
    setScholarshipOnly(false);
    setMoiAcceptedOnly(false);
    setMaxStudyGap('');
    setStudyModeFilter('');
  };

  // Main Filter Logic (Logical AND across all active filters)
  const filteredCourses = useMemo(() => {
    return (courses || []).filter((course) => {
      if (!course) return false;

      // 1. Course Name (partial & keyword match)
      if (courseNameQuery) {
        const query = courseNameQuery.toLowerCase().trim();
        const matchesName = (course.course_name || '').toLowerCase().includes(query);
        const matchesFaculty = (course.faculty || '').toLowerCase().includes(query);
        const uni = universities.find((u) => u.university_id === course.university_id);
        const matchesUni = (uni?.name || '').toLowerCase().includes(query);
        if (!matchesName && !matchesFaculty && !matchesUni) return false;
      }

      // 2. Student Nationality (excludes courses that explicitly restrict it)
      if (studentNationality) {
        const nat = studentNationality.toLowerCase().trim();
        const isRestricted = course.eligibility?.restricted_nationalities?.some(
          (n) => (n || '').toLowerCase() === nat
        );
        if (isRestricted) return false;

        const elNat = course.eligibility?.eligible_nationalities;
        if (elNat && elNat.length > 0 && !elNat.includes('All')) {
          const isEligible = elNat.some((n) => (n || '').toLowerCase() === nat);
          if (!isEligible) return false;
        }
      }

      // 3. Study Destination
      if (studyDestination && course.destination_country !== studyDestination) {
        return false;
      }

      // 4. Program
      if (selectedProgram && course.program !== selectedProgram) {
        return false;
      }

      // 5. English Requirement Type
      if (englishRequirementType) {
        if (englishRequirementType === 'MOI' && course.eligibility?.moi_acceptance !== 'Accepted') {
          return false;
        }
        if (englishRequirementType === 'IELTS' && (!course.eligibility?.ielts_overall || course.eligibility.ielts_overall === 0)) {
          return false;
        }
        if (englishRequirementType === 'PTE' && (!course.eligibility?.pte_min || course.eligibility.pte_min === 0)) {
          return false;
        }
        if (englishRequirementType === 'TOEFL' && (!course.eligibility?.toefl_min || course.eligibility.toefl_min === 0)) {
          return false;
        }
      }

      // 6. Intake Month
      if (intakeMonth && (!Array.isArray(course.intake_months) || !course.intake_months.includes(intakeMonth))) {
        return false;
      }

      // 7. Intake Year
      if (intakeYear && (!Array.isArray(course.intake_years) || !course.intake_years.includes(parseInt(intakeYear, 10)))) {
        return false;
      }

      // 8. Duration Bucket
      if (durationBucket && course.duration_bucket !== durationBucket) {
        return false;
      }

      // Advanced Filters
      if (universityFilter && course.university_id !== universityFilter) {
        return false;
      }

      if (cityFilter && !(course.city || '').toLowerCase().includes(cityFilter.toLowerCase())) {
        return false;
      }

      if (maxTuition && Number(course.tuition_fee || 0) > parseFloat(maxTuition)) {
        return false;
      }

      if (maxApplicationFee && Number(course.application_fee || 0) > parseFloat(maxApplicationFee)) {
        return false;
      }

      if (scholarshipOnly && !course.scholarship_available) {
        return false;
      }

      if (moiAcceptedOnly && course.eligibility?.moi_acceptance !== 'Accepted') {
        return false;
      }

      if (maxStudyGap && (course.eligibility?.study_gap_allowed_years ?? 99) < parseInt(maxStudyGap, 10)) {
        return false;
      }

      if (studyModeFilter && course.study_mode !== studyModeFilter) {
        return false;
      }

      return true;
    });
  }, [
    courses,
    universities,
    courseNameQuery,
    studentNationality,
    studyDestination,
    selectedProgram,
    englishRequirementType,
    intakeMonth,
    intakeYear,
    durationBucket,
    universityFilter,
    cityFilter,
    maxTuition,
    maxApplicationFee,
    scholarshipOnly,
    moiAcceptedOnly,
    maxStudyGap,
    studyModeFilter,
  ]);

  // Sort Courses
  const sortedCourses = useMemo(() => {
    const list = [...filteredCourses];
    if (sortBy === 'fee_asc') list.sort((a, b) => a.tuition_fee - b.tuition_fee);
    else if (sortBy === 'fee_desc') list.sort((a, b) => b.tuition_fee - a.tuition_fee);
    else if (sortBy === 'duration') list.sort((a, b) => a.duration - b.duration);
    else if (sortBy === 'name') list.sort((a, b) => a.course_name.localeCompare(b.course_name));
    return list;
  }, [filteredCourses, sortBy]);

  // Export Results
  const handleExportCsv = () => {
    const isAllowed = currentUser.role === 'Admin' || currentUser.export_permission;
    if (!isAllowed) {
      alert('Security Restriction: Exporting Course Search Datasets to CSV is restricted. Only the Main Admin has administrative authority to allow dataset exports.');
      return;
    }

    const rows = sortedCourses.map((c) => {
      const uni = universities.find((u) => u.university_id === c.university_id);
      return {
        'Course ID': c.course_id,
        'Course Name': c.course_name,
        'University': uni?.name || '',
        'Country': c.destination_country,
        'City': c.city,
        'Program': c.program,
        'Duration': `${c.duration} ${c.duration_unit}`,
        'Tuition Fee': `${c.currency} ${c.tuition_fee}`,
        'Application Fee': `${c.currency} ${c.application_fee}`,
        'Intake Months': c.intake_months.join('; '),
        'Intake Years': c.intake_years.join('; '),
        'Min Qualification': c.eligibility.minimum_qualification,
        'Min % / CGPA': `${c.eligibility.minimum_percentage || ''}% ${c.eligibility.minimum_cgpa ? `(${c.eligibility.minimum_cgpa})` : ''}`,
        'Study Gap Max': `${c.eligibility.study_gap_allowed_years} yrs`,
        'IELTS': `${c.eligibility.ielts_overall} (min ${c.eligibility.ielts_min_band})`,
        'PTE': c.eligibility.pte_min,
        'MOI Acceptance': c.eligibility.moi_acceptance,
        'Scholarship': c.scholarship_available ? 'Yes' : 'No',
        'Deadline': c.application_deadline,
      };
    });

    exportToCsv(`SWC_Course_Search_Export_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const handlePrint = () => {
    const headers = ['Course Title', 'University & Country', 'Program', 'Duration', 'Annual Tuition', 'IELTS / MOI', 'Intakes'];
    const rows = sortedCourses.map((c) => {
      const uni = universities.find((u) => u.university_id === c.university_id);
      return [
        c.course_name,
        `${uni?.name || 'Partner University'} (${c.city}, ${c.destination_country})`,
        c.program,
        `${c.duration} ${c.duration_unit}`,
        `${c.currency} ${c.tuition_fee.toLocaleString()}`,
        `IELTS ${c.eligibility.ielts_overall} · MOI: ${c.eligibility.moi_acceptance}`,
        c.intake_months.join(', '),
      ];
    });

    const infoFields = [
      { label: 'Total Results', value: `${sortedCourses.length} Courses Found` },
      { label: 'Target Destination', value: studyDestination || 'All Global Destinations' },
      { label: 'Program Level', value: selectedProgram || 'All Degree Levels' },
      { label: 'Student Nationality', value: studentNationality || 'Unrestricted / General' },
    ];

    printFormattedReport({
      title: 'Study World Consultant — Course Search Dossier',
      subtitle: `Shortlisted Program Matrix for Academic Counseling (${sortedCourses.length} Courses)`,
      badgeText: 'Course Search Evaluation',
      infoFields,
      headers,
      rows,
      currentUser,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#241512]">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#7A2820]">
            Search International Courses
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Internal evaluation filter for {courses.length} accredited university courses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-xs font-semibold text-stone-600 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>

          {(currentUser.role === 'Admin' || currentUser.export_permission) ? (
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 text-xs font-bold text-[#7A2820] bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              title={currentUser.role === 'Admin' ? 'Export filtered course dataset to CSV (Admin Access)' : 'Export filtered course dataset to CSV (Authorized by Main Admin)'}
            >
              <Download className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Export CSV</span>
              {currentUser.role === 'Admin' && (
                <span className="text-[9px] bg-amber-200/80 text-amber-900 font-bold px-1.5 py-0.2 rounded-md uppercase">
                  Admin
                </span>
              )}
            </button>
          ) : (
            <div
              className="px-3 py-2 text-xs font-semibold text-stone-400 bg-stone-100/90 border border-stone-200 rounded-xl flex items-center gap-1.5 cursor-not-allowed select-none shadow-2xs"
              title="CSV Dataset Export is restricted. Only the Main Admin can allow export permissions."
            >
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Export CSV (Restricted)</span>
            </div>
          )}

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-stone-400" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Main Filter Control Box */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        {/* Row 1: Course Name Free Text with Autocomplete */}
        <div className="relative">
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
            Course Keyword / Subject / Specialization
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={courseNameQuery}
              onChange={(e) => setCourseNameQuery(e.target.value)}
              placeholder="e.g. Master of Computer Science, Data Science, MBA, Engineering, Nursing..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[#FBF6F1] border border-stone-300 focus:outline-none focus:border-[#A8382C] focus:bg-white text-stone-900 placeholder:text-stone-400 font-medium"
            />
          </div>

          {/* Autocomplete suggestions dropdown */}
          {autocompleteSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-30 p-1 divide-y divide-stone-100 text-xs">
              {autocompleteSuggestions.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => setCourseNameQuery(item)}
                  className="px-3 py-2 hover:bg-[#FBF6F1] cursor-pointer flex items-center gap-2 text-stone-700 hover:text-[#A8382C]"
                >
                  <Search className="w-3 h-3 text-stone-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Row 2: Standard Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 text-xs">
          {/* Student Nationality */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Student Nationality</label>
            <select
              value={studentNationality}
              onChange={(e) => setStudentNationality(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            >
              <option value="">Any Nationality (All Global)</option>
              {nationalities.map((nat) => (
                <option key={nat.name} value={nat.name}>
                  {nat.flag} {nat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Study Destination */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Study Destination</label>
            <select
              value={studyDestination}
              onChange={(e) => setStudyDestination(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            >
              <option value="">All Destinations</option>
              {destinations.map((dest) => (
                <option key={dest.name} value={dest.name}>
                  {dest.flag} {dest.name} {dest.activeUnis > 0 ? `(${dest.activeUnis} Unis)` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Program Level (10 values) */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Program Level</label>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            >
              <option value="">All Program Levels</option>
              <option value="Foundation">Foundation</option>
              <option value="Diploma / Advanced Diploma">Diploma / Advanced Diploma</option>
              <option value="Associate Degree">Associate Degree</option>
              <option value="Bachelor's / Undergraduate">Bachelor's / Undergraduate</option>
              <option value="Graduate Certificate / Diploma">Graduate Certificate / Diploma</option>
              <option value="Master's (Coursework)">Master's (Coursework)</option>
              <option value="Master's (Research)">Master's (Research)</option>
              <option value="Doctorate / PhD">Doctorate / PhD</option>
              <option value="Post-Doctoral / Fellowship">Post-Doctoral / Fellowship</option>
              <option value="Language / Pathway Program">Language / Pathway Program</option>
            </select>
          </div>

          {/* English Requirement */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">English / MOI Req.</label>
            <select
              value={englishRequirementType}
              onChange={(e) => setEnglishRequirementType(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            >
              <option value="">Any Requirement</option>
              <option value="MOI">MOI Accepted (Waiver)</option>
              <option value="IELTS">IELTS Accepted</option>
              <option value="PTE">PTE Accepted</option>
              <option value="TOEFL">TOEFL Accepted</option>
            </select>
          </div>

          {/* Intake Month */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Intake Month</label>
            <select
              value={intakeMonth}
              onChange={(e) => setIntakeMonth(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            >
              <option value="">Any Month</option>
              {monthsList.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Duration Bucket */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Duration Bucket</label>
            <select
              value={durationBucket}
              onChange={(e) => setDurationBucket(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            >
              <option value="">Any Duration</option>
              <option value="0-1">0–1 Year</option>
              <option value="1-2">1–2 Years</option>
              <option value="2-3">2–3 Years</option>
              <option value="3-4">3–4 Years</option>
              <option value="4+">4+ Years</option>
            </select>
          </div>
        </div>

        {/* Collapsible Advanced Search Toggle Button */}
        <div className="flex items-center justify-between border-t border-stone-100 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-bold text-[#A8382C] hover:text-[#7A2820] flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>{showAdvanced ? 'Hide Advanced Filters' : 'Show Advanced Filters (Tuition, Study Gap, University, Scholarship)'}</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <span className="text-xs font-medium text-stone-500">
            Showing <strong>{filteredCourses.length}</strong> matching courses
          </span>
        </div>

        {/* Advanced Search Collapsible Panel */}
        {showAdvanced && (
          <div className="p-4 rounded-xl bg-[#FBF6F1] border border-stone-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs animate-fade-in">
            {/* University Name */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Specific University</label>
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              >
                <option value="">All Partner Universities</option>
                {universities.map((u) => (
                  <option key={u.university_id} value={u.university_id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City / Campus */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">City / Campus</label>
              <input
                type="text"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="e.g. London, Melbourne, Toronto"
                className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              />
            </div>

            {/* Max Annual Tuition Fee */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Max Annual Tuition Fee</label>
              <input
                type="number"
                value={maxTuition}
                onChange={(e) => setMaxTuition(e.target.value)}
                placeholder="e.g. 20000"
                className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              />
            </div>

            {/* Max Permissible Study Gap */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Student Study Gap (Years)</label>
              <input
                type="number"
                value={maxStudyGap}
                onChange={(e) => setMaxStudyGap(e.target.value)}
                placeholder="e.g. 5"
                className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              />
            </div>

            {/* Intake Year */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Intake Year</label>
              <select
                value={intakeYear}
                onChange={(e) => setIntakeYear(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              >
                <option value="">Any Year</option>
                {yearsList.map((y) => (
                  <option key={y} value={y.toString()}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Study Mode */}
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Study Mode</label>
              <select
                value={studyModeFilter}
                onChange={(e) => setStudyModeFilter(e.target.value)}
                className="w-full px-2.5 py-2 rounded-lg border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              >
                <option value="">Any Mode</option>
                <option value="On-campus">On-campus Only</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            {/* Toggles */}
            <div className="sm:col-span-2 flex flex-wrap items-center gap-6 pt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scholarshipOnly}
                  onChange={(e) => setScholarshipOnly(e.target.checked)}
                  className="w-4 h-4 text-[#A8382C] rounded accent-[#A8382C]"
                />
                <span className="font-semibold text-stone-800">
                  Scholarships / Bursaries Only
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={moiAcceptedOnly}
                  onChange={(e) => setMoiAcceptedOnly(e.target.checked)}
                  className="w-4 h-4 text-[#A8382C] rounded accent-[#A8382C]"
                />
                <span className="font-semibold text-stone-800">
                  MOI Acceptance Only (No IELTS)
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Results Header: Sort & View Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-stone-600">
          <span>Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white font-semibold text-stone-800 focus:outline-none focus:border-[#A8382C]"
          >
            <option value="featured">Featured / Default</option>
            <option value="fee_asc">Tuition: Low to High</option>
            <option value="fee_desc">Tuition: High to Low</option>
            <option value="duration">Shortest Duration</option>
            <option value="name">Course Title (A-Z)</option>
          </select>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-[#A8382C] text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            title="Card Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'table'
                ? 'bg-[#A8382C] text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
            title="Data Table View"
          >
            <ListFilter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Course Results List */}
      {sortedCourses.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="font-display font-bold text-lg text-stone-800">
            No courses found matching your criteria
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            Try adjusting your filters, clearing nationality exclusions, or broadening your tuition and duration ranges.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[#A8382C] text-white font-bold text-xs rounded-xl shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {sortedCourses.map((course) => {
            const uni = universities.find((u) => u.university_id === course.university_id);
            const isSelectedForComp = comparisonList.some((c) => c.course_id === course.course_id);
            const compIndex = comparisonList.findIndex((c) => c.course_id === course.course_id);

            return (
              <div
                key={course.course_id}
                className={`card-modern flex flex-col justify-between overflow-hidden group transition-all duration-300 ${
                  isSelectedForComp
                    ? 'border-[#A8382C] ring-2 ring-[#C9A227] shadow-lg bg-stone-50/50'
                    : 'border-stone-200/90 hover:border-[#A8382C]/50 hover:shadow-xl'
                }`}
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* University & Program Badge Header + Compare Checkbox */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={uni?.logo_url || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160'}
                        alt={uni?.name}
                        className="w-11 h-11 rounded-xl object-cover border border-stone-200 bg-white flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {uni?.name || 'Partner University'}
                        </h4>
                        <p className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                          <MapPin className="w-3 h-3 text-[#A8382C] flex-shrink-0" />
                          <span className="truncate">{course.city}, {course.destination_country}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComparison(course);
                        }}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all flex items-center gap-1 active:scale-95 ${
                          isSelectedForComp
                            ? 'bg-[#A8382C] text-white border-[#A8382C] shadow-2xs'
                            : 'bg-white text-stone-600 hover:text-[#A8382C] border-stone-300 hover:border-[#A8382C]'
                        }`}
                        title={isSelectedForComp ? 'Remove from comparison' : 'Add to side-by-side comparison'}
                      >
                        <Scale className="w-3 h-3 text-[#C9A227]" />
                        <span>{isSelectedForComp ? `Compared (${compIndex + 1})` : 'Compare'}</span>
                      </button>

                      <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-stone-100 text-stone-800 border border-stone-200/80">
                        {course.program}
                      </span>
                    </div>
                  </div>

                  {/* Course Title */}
                  <div>
                    <h3
                      onClick={() => onSelectCourse(course)}
                      className="font-display font-bold text-base sm:text-lg text-stone-900 group-hover:text-[#A8382C] transition-colors line-clamp-2 cursor-pointer leading-snug"
                    >
                      {course.course_name}
                    </h3>
                  </div>

                  {/* Key Highlights Table Pills */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs bg-stone-50/80 p-3 rounded-2xl border border-stone-200/70">
                    <div>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                        Annual Tuition
                      </span>
                      <span className="font-bold text-[#A8382C] text-sm font-display">
                        {course.currency} {course.tuition_fee.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                        Duration
                      </span>
                      <span className="font-bold text-stone-800">
                        {course.duration} {course.duration_unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                        Intakes
                      </span>
                      <span className="font-semibold text-stone-700 truncate block">
                        {course.intake_months.join(', ')}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">
                        English / MOI
                      </span>
                      <span className="font-semibold text-stone-700 truncate block">
                        IELTS {course.eligibility.ielts_overall} · {course.eligibility.moi_acceptance === 'Accepted' ? 'MOI ✓' : 'Test Only'}
                      </span>
                    </div>
                  </div>

                  {/* Scholarship Pill if available */}
                  {course.scholarship_available && (
                    <div className="flex items-center gap-2 text-[11px] font-medium text-amber-950 bg-amber-50/90 px-3 py-1.5 rounded-xl border border-amber-200/80">
                      <Award className="w-3.5 h-3.5 text-[#C9A227] flex-shrink-0" />
                      <span className="truncate">{course.scholarship_detail || 'Scholarship / Bursary available'}</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons Footer */}
                <div className="px-5 sm:px-6 py-3.5 bg-stone-50/90 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <button
                    onClick={() => onSelectCourse(course)}
                    className="font-bold text-stone-700 hover:text-[#A8382C] transition-colors py-1 group/btn flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <span className="group-hover/btn:translate-x-0.5 transition-transform">→</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {onCreateLead && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onCreateLead(course);
                        }}
                        className="px-3 py-2 bg-white hover:bg-[#A8382C] hover:text-white text-[#7A2820] font-bold rounded-xl border border-stone-300 hover:border-[#A8382C] flex items-center gap-1.5 transition-all shadow-2xs hover:scale-[1.02] active:scale-98"
                        title="Create a student lead / request with this course"
                      >
                        <UserPlus className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Create Lead</span>
                      </button>
                    )}

                    {!isB2BUser(currentUser) && (
                      <button
                        onClick={() => onCheckEligibility(course)}
                        className="px-3.5 py-2 bg-[#A8382C] hover:bg-[#7A2820] text-white font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs hover:scale-[1.02] active:scale-98"
                      >
                        <UserCheck className="w-3.5 h-3.5 text-[#F4E8C1]" />
                        <span>Check Match</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs pb-24">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF6F1] text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5 w-12 text-center">Compare</th>
                  <th className="p-3.5">Course Name & Level</th>
                  <th className="p-3.5">University & Location</th>
                  <th className="p-3.5">Tuition Fee</th>
                  <th className="p-3.5">Duration</th>
                  <th className="p-3.5">English Req.</th>
                  <th className="p-3.5">MOI</th>
                  <th className="p-3.5">Intake</th>
                  <th className="p-3.5">Scholarship</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {sortedCourses.map((course) => {
                  const uni = universities.find((u) => u.university_id === course.university_id);
                  const isSelectedForComp = comparisonList.some((c) => c.course_id === course.course_id);

                  return (
                    <tr
                      key={course.course_id}
                      className={`hover:bg-[#FBF6F1] transition-colors cursor-pointer ${
                        isSelectedForComp ? 'bg-amber-50/60 font-medium' : ''
                      }`}
                      onClick={() => onSelectCourse(course)}
                    >
                      <td className="p-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => toggleComparison(course)}
                          className={`p-1.5 rounded-md border transition-colors ${
                            isSelectedForComp
                              ? 'bg-[#A8382C] text-white border-[#A8382C]'
                              : 'bg-white text-stone-400 hover:text-[#A8382C] border-stone-300'
                          }`}
                          title="Select to compare side-by-side"
                        >
                          <Scale className="w-3.5 h-3.5 text-[#C9A227]" />
                        </button>
                      </td>
                      <td className="p-3.5">
                        <strong className="text-stone-900 font-bold block hover:text-[#A8382C]">
                          {course.course_name}
                        </strong>
                        <span className="text-[11px] text-stone-500">{course.program}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-semibold text-stone-900 block">{uni?.name}</span>
                        <span className="text-stone-500 text-[11px]">{course.city}, {course.destination_country}</span>
                      </td>
                      <td className="p-3.5 font-bold text-[#A8382C]">
                        {course.currency} {course.tuition_fee.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        {course.duration} {course.duration_unit} ({course.study_mode})
                      </td>
                      <td className="p-3.5">
                        IELTS {course.eligibility.ielts_overall} / PTE {course.eligibility.pte_min}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            course.eligibility.moi_acceptance === 'Accepted'
                              ? 'bg-emerald-100 text-emerald-800'
                              : course.eligibility.moi_acceptance === 'Case-by-Case'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {course.eligibility.moi_acceptance}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-700">
                        {course.intake_months.join(', ')}
                      </td>
                      <td className="p-3.5">
                        {course.scholarship_available ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-semibold text-[10px]">
                            Available
                          </span>
                        ) : (
                          <span className="text-stone-400">None</span>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5" onClick={(e) => e.stopPropagation()}>
                        {onCreateLead && (
                          <button
                            onClick={() => onCreateLead(course)}
                            className="px-2 py-1 bg-[#FBF6F1] text-[#7A2820] hover:bg-[#A8382C] hover:text-white border border-stone-300 font-bold rounded-md text-[11px] transition-colors inline-flex items-center gap-1"
                            title="Create student lead with this course"
                          >
                            <UserPlus className="w-3 h-3 text-[#C9A227]" />
                            <span>+ Lead</span>
                          </button>
                        )}
                        {!isB2BUser(currentUser) && (
                          <button
                            onClick={() => onCheckEligibility(course)}
                            className="px-2.5 py-1 bg-[#A8382C] text-white font-bold rounded-md hover:bg-[#7A2820] text-[11px] transition-colors"
                          >
                            Check Match
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Floating Comparison Drawer Bar at Bottom */}
      {comparisonList.length > 0 && (
        <div
          id="floating-comparison-dock"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-3xl px-4 animate-slide-up"
        >
          <div className="bg-stone-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-stone-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-2 bg-[#A8382C] rounded-xl text-[#C9A227] flex-shrink-0">
                <Scale className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#C9A227] uppercase tracking-wider">
                    Course Comparison Dock
                  </span>
                  <span className="px-1.5 py-0.2 bg-stone-800 rounded text-[10px] text-stone-300 font-mono">
                    {comparisonList.length}/2 Selected
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {/* Slot 1 */}
                  {comparisonList[0] && (
                    <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700 max-w-[150px] sm:max-w-[200px]">
                      <span className="text-xs font-semibold text-stone-200 truncate">
                        {comparisonList[0].course_name}
                      </span>
                      <button
                        onClick={() => toggleComparison(comparisonList[0])}
                        className="text-stone-400 hover:text-white flex-shrink-0"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Slot 2 */}
                  {comparisonList[1] ? (
                    <div className="flex items-center gap-1.5 bg-stone-800/80 px-2.5 py-1 rounded-lg border border-stone-700 max-w-[150px] sm:max-w-[200px]">
                      <span className="text-xs font-semibold text-stone-200 truncate">
                        {comparisonList[1].course_name}
                      </span>
                      <button
                        onClick={() => toggleComparison(comparisonList[1])}
                        className="text-stone-400 hover:text-white flex-shrink-0"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-400 border border-dashed border-stone-600 px-2.5 py-1 rounded-lg">
                      <span>+ Select 2nd course to compare</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={clearComparison}
                className="px-2.5 py-2 text-stone-400 hover:text-white text-xs font-semibold transition-colors"
              >
                Clear
              </button>

              <button
                id="btn-trigger-side-by-side-comparison"
                onClick={handleLaunchComparison}
                className="px-4 py-2 bg-gradient-to-r from-[#A8382C] to-[#7A2820] hover:from-[#7A2820] hover:to-[#4A140F] text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg border border-[#C9A227]/40"
              >
                <Scale className="w-4 h-4 text-[#C9A227]" />
                <span>
                  {comparisonList.length >= 2
                    ? 'Compare Side-by-Side (2)'
                    : 'Compare Course (1/2)'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
