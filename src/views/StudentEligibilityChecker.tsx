import React, { useState, useMemo, useEffect } from 'react';
import { Course, University, StudentProfile, EligibilityEvaluationResult, EligibilityVerdict, UserAccount } from '../types';
import { evaluateEligibility } from '../utils/eligibilityEngine';
import { StudentAssessmentPrintModal } from '../components/StudentAssessmentPrintModal';
import { printStudentAssessmentReport } from '../utils/exportUtils';
import { ALL_COUNTRIES_DATA } from '../data/countriesData';
import {
  UserCheck,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Sparkles,
  Printer,
  ChevronDown,
  ChevronUp,
  MapPin,
  Award,
  BookOpen,
  DollarSign,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  FileText,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Check,
  Zap,
  Globe2,
} from 'lucide-react';

interface StudentEligibilityCheckerProps {
  courses: Course[];
  universities: University[];
  currentUser: UserAccount;
  initialCourse?: Course | null;
  onSelectCourse: (course: Course) => void;
  onCreateLead?: (course: Course, studentProfile?: StudentProfile) => void;
}

export const StudentEligibilityChecker: React.FC<StudentEligibilityCheckerProps> = ({
  courses,
  universities,
  currentUser,
  initialCourse,
  onSelectCourse,
  onCreateLead,
}) => {
  // Preset Demo Student Profiles for rapid counselor workflow testing
  const DEMO_PRESETS: { name: string; profile: StudentProfile }[] = [
    {
      name: 'Sample 1: High School (A-Levels) -> UK/Aus Bachelor',
      profile: {
        student_name: 'Hamza Tariq',
        nationality: 'Pakistan',
        age: 19,
        previous_qualification: 'High School / A-Levels / Intermediate',
        previous_qualification_rank: 2,
        percentage: 72,
        graduation_year: 2025,
        study_gap: 1,
        ielts_overall: 6.5,
        ielts_min_band: 6.0,
        moi_available: true,
        desired_destinations: ['United Kingdom', 'Australia'],
        preferred_programs: ["Bachelor's / Undergraduate"],
        preferred_intake_year: 2026,
        max_tuition_budget: 25000,
      },
    },
    {
      name: 'Sample 2: Bachelor Graduate with 4-Yr Gap -> MSc UK/Canada',
      profile: {
        student_name: 'Fatima Zahra',
        nationality: 'Pakistan',
        age: 26,
        previous_qualification: "Bachelor's / Undergraduate",
        previous_qualification_rank: 4,
        percentage: 62,
        cgpa: 2.85,
        graduation_year: 2022,
        study_gap: 4,
        ielts_overall: 6.5,
        ielts_min_band: 6.0,
        pte_score: 62,
        moi_available: true,
        desired_destinations: ['United Kingdom', 'Canada', 'Ireland'],
        preferred_programs: ["Master's (Coursework)"],
        preferred_intake_year: 2026,
        max_tuition_budget: 22000,
      },
    },
    {
      name: 'Sample 3: MOI Candidate (No IELTS Test Score)',
      profile: {
        student_name: 'Ali Raza',
        nationality: 'Pakistan',
        age: 23,
        previous_qualification: "Bachelor's / Undergraduate",
        previous_qualification_rank: 4,
        percentage: 58,
        cgpa: 2.6,
        graduation_year: 2024,
        study_gap: 2,
        moi_available: true,
        desired_destinations: ['United Kingdom', 'Germany', 'Malaysia'],
        preferred_programs: ["Master's (Coursework)"],
        preferred_intake_year: 2026,
        max_tuition_budget: 18000,
      },
    },
    {
      name: 'Sample 4: Intermediate with 3-Yr Gap (Needs Foundation/Diploma)',
      profile: {
        student_name: 'Zeeshan Khan',
        nationality: 'Pakistan',
        age: 21,
        previous_qualification: 'High School / A-Levels / Intermediate',
        previous_qualification_rank: 2,
        percentage: 50,
        graduation_year: 2023,
        study_gap: 3,
        ielts_overall: 5.5,
        ielts_min_band: 5.0,
        moi_available: false,
        desired_destinations: ['United Kingdom', 'Malaysia'],
        preferred_programs: ['Foundation', 'Diploma / Advanced Diploma'],
        preferred_intake_year: 2026,
      },
    },
  ];

  // Student Profile State
  const [studentName, setStudentName] = useState('Hamza Tariq');
  const [nationality, setNationality] = useState('Pakistan');
  const [age, setAge] = useState<number>(22);
  const [previousQualification, setPreviousQualification] = useState<string>(
    "Bachelor's / Undergraduate"
  );
  const [previousQualificationRank, setPreviousQualificationRank] = useState<number>(4);
  const [percentage, setPercentage] = useState<string>('65');
  const [cgpa, setCgpa] = useState<string>('2.8');
  const [graduationYear, setGraduationYear] = useState<number>(2024);
  const [studyGap, setStudyGap] = useState<number>(2);

  // English Proficiency
  const [ieltsOverall, setIeltsOverall] = useState<string>('6.5');
  const [ieltsMinBand, setIeltsMinBand] = useState<string>('6.0');
  const [pteScore, setPteScore] = useState<string>('');
  const [toeflScore, setToeflScore] = useState<string>('');
  const [moiAvailable, setMoiAvailable] = useState<boolean>(true);

  // Destination & Program Preferences
  const [desiredDestination, setDesiredDestination] = useState<string>('All');
  const [preferredProgram, setPreferredProgram] = useState<string>('All');
  const [maxBudget, setMaxBudget] = useState<string>('');

  // Results Filter & Search Tab
  const [activeVerdictTab, setActiveVerdictTab] = useState<'All' | 'Eligible' | 'Possibly Eligible' | 'Not Eligible'>('All');
  const [resultsSearchQuery, setResultsSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'score' | 'fee_asc' | 'fee_desc' | 'name'>('score');
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

  // Print Assessment Sheet Modal
  const [showPrintModal, setShowPrintModal] = useState(false);

  // If initialCourse provided, initialize destination or expanded course
  useEffect(() => {
    if (initialCourse) {
      setExpandedCourseId(initialCourse.course_id);
      if (initialCourse.destination_country) {
        setDesiredDestination(initialCourse.destination_country);
      }
    }
  }, [initialCourse]);

  // Auto calculate study gap when graduation year changes
  const handleGraduationYearChange = (year: number) => {
    setGraduationYear(year);
    const currentYear = new Date().getFullYear();
    const gap = Math.max(0, currentYear - year);
    setStudyGap(gap);
  };

  const handleResetForm = () => {
    setStudentName('');
    setNationality('Pakistan');
    setAge(20);
    setPreviousQualification("Bachelor's / Undergraduate");
    setPreviousQualificationRank(4);
    setPercentage('');
    setCgpa('');
    setGraduationYear(new Date().getFullYear());
    setStudyGap(0);
    setIeltsOverall('');
    setIeltsMinBand('');
    setPteScore('');
    setToeflScore('');
    setMoiAvailable(false);
    setDesiredDestination('All');
    setPreferredProgram('All');
    setMaxBudget('');
    setActiveVerdictTab('All');
    setResultsSearchQuery('');
  };

  const applyPreset = (preset: StudentProfile) => {
    setStudentName(preset.student_name);
    setNationality(preset.nationality);
    setAge(preset.age);
    setPreviousQualification(preset.previous_qualification);
    setPreviousQualificationRank(preset.previous_qualification_rank);
    setPercentage(preset.percentage?.toString() || '');
    setCgpa(preset.cgpa?.toString() || '');
    setGraduationYear(preset.graduation_year);
    setStudyGap(preset.study_gap);
    setIeltsOverall(preset.ielts_overall?.toString() || '');
    setIeltsMinBand(preset.ielts_min_band?.toString() || '');
    setPteScore(preset.pte_score?.toString() || '');
    setToeflScore(preset.toefl_score?.toString() || '');
    setMoiAvailable(preset.moi_available);
    if (preset.desired_destinations.length > 0) {
      setDesiredDestination(preset.desired_destinations[0]);
    } else {
      setDesiredDestination('All');
    }
    if (preset.preferred_programs.length > 0) {
      setPreferredProgram(preset.preferred_programs[0]);
    } else {
      setPreferredProgram('All');
    }
    setMaxBudget(preset.max_tuition_budget?.toString() || '');
  };

  // Compile active student profile in real-time
  const currentStudentProfile: StudentProfile = useMemo(() => {
    return {
      student_name: studentName.trim() || 'Prospective Applicant',
      nationality,
      age: Number(age) || 20,
      previous_qualification: previousQualification,
      previous_qualification_rank: Number(previousQualificationRank),
      percentage: percentage ? parseFloat(percentage) : undefined,
      cgpa: cgpa ? parseFloat(cgpa) : undefined,
      graduation_year: Number(graduationYear),
      study_gap: Number(studyGap),
      ielts_overall: ieltsOverall ? parseFloat(ieltsOverall) : undefined,
      ielts_min_band: ieltsMinBand ? parseFloat(ieltsMinBand) : undefined,
      pte_score: pteScore ? parseFloat(pteScore) : undefined,
      toefl_score: toeflScore ? parseFloat(toeflScore) : undefined,
      moi_available: moiAvailable,
      desired_destinations: desiredDestination !== 'All' ? [desiredDestination] : [],
      preferred_programs: preferredProgram !== 'All' ? [preferredProgram] : [],
      max_tuition_budget: maxBudget ? parseFloat(maxBudget) : undefined,
    };
  }, [
    studentName,
    nationality,
    age,
    previousQualification,
    previousQualificationRank,
    percentage,
    cgpa,
    graduationYear,
    studyGap,
    ieltsOverall,
    ieltsMinBand,
    pteScore,
    toeflScore,
    moiAvailable,
    desiredDestination,
    preferredProgram,
    maxBudget,
  ]);

  // Run Eligibility Evaluation Engine in REAL-TIME across all catalog courses
  const evaluatedResults: EligibilityEvaluationResult[] = useMemo(() => {
    return courses
      .map((course) => {
        const uni = universities.find((u) => u.university_id === course.university_id);
        return evaluateEligibility(currentStudentProfile, course, uni);
      })
      .filter((res) => {
        if (desiredDestination !== 'All' && res.course.destination_country !== desiredDestination) {
          return false;
        }
        if (preferredProgram !== 'All' && res.course.program !== preferredProgram) {
          return false;
        }
        return true;
      });
  }, [courses, universities, currentStudentProfile, desiredDestination, preferredProgram]);

  // Counts calculated instantly in real-time
  const totalEvaluated = evaluatedResults.length;
  const eligibleCount = evaluatedResults.filter((r) => r.verdict === 'Eligible').length;
  const possibleCount = evaluatedResults.filter((r) => r.verdict === 'Possibly Eligible').length;
  const notEligibleCount = evaluatedResults.filter((r) => r.verdict === 'Not Eligible').length;

  const eligiblePercent = totalEvaluated > 0 ? Math.round((eligibleCount / totalEvaluated) * 100) : 0;
  const possiblePercent = totalEvaluated > 0 ? Math.round((possibleCount / totalEvaluated) * 100) : 0;
  const notEligiblePercent = totalEvaluated > 0 ? Math.round((notEligibleCount / totalEvaluated) * 100) : 0;

  // Filtered by verdict tab and in-page search query
  const filteredAndSortedResults = useMemo(() => {
    let list = evaluatedResults;
    if (activeVerdictTab !== 'All') {
      list = list.filter((r) => r.verdict === activeVerdictTab);
    }

    if (resultsSearchQuery.trim()) {
      const q = resultsSearchQuery.toLowerCase().trim();
      list = list.filter((r) => {
        const nameMatch = r.course.course_name.toLowerCase().includes(q);
        const uniMatch = r.university?.name.toLowerCase().includes(q);
        const cityMatch = r.course.city.toLowerCase().includes(q);
        const countryMatch = r.course.destination_country.toLowerCase().includes(q);
        return nameMatch || uniMatch || cityMatch || countryMatch;
      });
    }

    // Sort
    const sorted = [...list];
    if (sortBy === 'score') {
      sorted.sort((a, b) => b.overall_score - a.overall_score);
    } else if (sortBy === 'fee_asc') {
      sorted.sort((a, b) => a.course.tuition_fee - b.course.tuition_fee);
    } else if (sortBy === 'fee_desc') {
      sorted.sort((a, b) => b.course.tuition_fee - a.course.tuition_fee);
    } else if (sortBy === 'name') {
      sorted.sort((a, b) => a.course.course_name.localeCompare(b.course.course_name));
    }

    return sorted;
  }, [evaluatedResults, activeVerdictTab, resultsSearchQuery, sortBy]);

  return (
    <div className="space-y-6 animate-fade-in text-[#241512]">
      {/* Print Assessment Modal */}
      <StudentAssessmentPrintModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        student={currentStudentProfile}
        results={evaluatedResults}
        counselorName={currentUser.name}
        counselorBranch={currentUser.department || currentUser.franchise_name}
        currentUser={currentUser}
      />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A227] text-stone-900 flex items-center gap-1">
              <Zap className="w-3 h-3 text-stone-900 fill-stone-900" />
              Quick Match Engine
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Real-Time Reactive Evaluation Active
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#7A2820] mt-1">
            Quick Match & Student Eligibility Evaluator
          </h1>
          <p className="text-xs text-stone-500">
            Enter or update candidate qualifications to see real-time calculated eligibility across all partner courses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetForm}
            className="px-3 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Clear all fields to evaluate a fresh student"
          >
            <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
            <span>Reset Profile</span>
          </button>

          <button
            onClick={() => printStudentAssessmentReport(currentStudentProfile, evaluatedResults, currentUser)}
            className="px-3.5 py-2 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Directly trigger system Print / Save as PDF dialog"
          >
            <Printer className="w-4 h-4 text-[#701C18]" />
            <span>Quick Print</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="px-4 py-2 text-xs font-bold text-white bg-[#701C18] hover:bg-[#4A0E0B] rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            title="Preview and Print or Export PDF Assessment Report"
          >
            <FileText className="w-4 h-4 text-[#D4AF37]" />
            <span>Print / Export Assessment PDF</span>
          </button>
        </div>
      </div>

      {/* Quick Preset Selector Buttons */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            Quick Load Sample Student Cases:
          </span>
          <span className="text-[10px] text-stone-400 italic">
            Click any archetype to auto-populate and test the real-time match engine
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {DEMO_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => applyPreset(preset.profile)}
              className="p-2 bg-[#FBF6F1] hover:bg-amber-50 hover:border-amber-300 border border-stone-200 text-[#7A2820] font-semibold text-xs rounded-xl transition-all text-left shadow-2xs flex flex-col justify-between"
            >
              <span className="font-bold text-[11px] block text-[#7A2820] truncate">
                {preset.name}
              </span>
              <span className="text-[9px] text-stone-500 mt-1 block">
                {preset.profile.nationality} · {preset.profile.previous_qualification} · {preset.profile.ielts_overall ? `IELTS ${preset.profile.ielts_overall}` : 'MOI'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Student Profile Input Matrix */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
          <h2 className="font-display font-bold text-base text-[#7A2820] flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#A8382C]" />
            Candidate Academic & Demographic Profile
          </h2>
          <span className="text-[11px] font-semibold text-[#A8382C] bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            Updates evaluation stats instantly as you type
          </span>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          {/* Candidate Name */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700">Candidate Full Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="e.g. Hamza Tariq"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white font-medium"
            />
          </div>

          {/* Student Nationality */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700">Student Nationality *</label>
            <select
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white font-medium"
            >
              {ALL_COUNTRIES_DATA.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
              <option value="Other">🌍 Other International</option>
            </select>
          </div>

          {/* Student Age */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700">Student Age (Years)</label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 18)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white font-medium"
            />
          </div>

          {/* Previous Qualification Level */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700">Highest Completed Qualification *</label>
            <select
              value={previousQualification}
              onChange={(e) => {
                const val = e.target.value;
                setPreviousQualification(val);
                if (val.includes('Secondary') || val.includes('10th')) setPreviousQualificationRank(1);
                else if (val.includes('High School') || val.includes('A-Levels')) setPreviousQualificationRank(2);
                else if (val.includes('Diploma') || val.includes('Associate')) setPreviousQualificationRank(3);
                else if (val.includes("Bachelor")) setPreviousQualificationRank(4);
                else if (val.includes("Master")) setPreviousQualificationRank(6);
              }}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white font-medium"
            >
              <option value="Secondary / 10th Grade / O-Levels / 11th Grade">Secondary / 10th Grade / O-Levels (Rank 1)</option>
              <option value="High School / A-Levels / Intermediate">High School / A-Levels / Intermediate (Rank 2)</option>
              <option value="Diploma / Associate Degree / Pass Bachelor">Diploma / Associate Degree / 14-Yr (Rank 3)</option>
              <option value="Bachelor's / Undergraduate">Bachelor's / 4-Year Undergraduate (Rank 4)</option>
              <option value="Master's Degree (MSc / MS / MPhil)">Master's Degree (MS / MPhil) (Rank 6)</option>
            </select>
          </div>

          {/* Academic Percentage */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700">Academic Percentage (%)</label>
            <input
              type="number"
              value={percentage}
              onChange={(e) => setPercentage(e.target.value)}
              placeholder="e.g. 68"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white font-medium"
            />
          </div>

          {/* CGPA */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700">CGPA (Out of 4.0)</label>
            <input
              type="number"
              step="0.05"
              value={cgpa}
              onChange={(e) => setCgpa(e.target.value)}
              placeholder="e.g. 2.85"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white font-medium"
            />
          </div>

          {/* Graduation Year */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700">Graduation / Passing Year</label>
            <input
              type="number"
              value={graduationYear}
              onChange={(e) => handleGraduationYearChange(parseInt(e.target.value, 10) || 2024)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white font-medium"
            />
          </div>

          {/* Study Gap */}
          <div className="space-y-1">
            <label className="font-bold text-stone-700">Calculated Study Gap (Years)</label>
            <input
              type="number"
              value={studyGap}
              onChange={(e) => setStudyGap(parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-amber-50 font-bold text-amber-900"
            />
          </div>
        </div>

        {/* English Language & Test Proofs */}
        <div className="p-4 rounded-xl bg-[#FBF6F1] border border-stone-200 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-700">
              English Language Proficiency Scores
            </h3>
            <span className="text-[11px] text-stone-500">
              Any qualifying test (IELTS, PTE, TOEFL) or MOI letter will satisfy criteria
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-stone-600">IELTS Overall</label>
              <input
                type="number"
                step="0.5"
                value={ieltsOverall}
                onChange={(e) => setIeltsOverall(e.target.value)}
                placeholder="e.g. 6.5"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-600">IELTS Min Band</label>
              <input
                type="number"
                step="0.5"
                value={ieltsMinBand}
                onChange={(e) => setIeltsMinBand(e.target.value)}
                placeholder="e.g. 6.0"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-600">PTE Academic</label>
              <input
                type="number"
                value={pteScore}
                onChange={(e) => setPteScore(e.target.value)}
                placeholder="e.g. 58"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-600">TOEFL iBT</label>
              <input
                type="number"
                value={toeflScore}
                onChange={(e) => setToeflScore(e.target.value)}
                placeholder="e.g. 85"
                className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white"
              />
            </div>

            <div className="space-y-1 flex flex-col justify-center">
              <label className="font-semibold text-stone-600">MOI Available</label>
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={moiAvailable}
                  onChange={(e) => setMoiAvailable(e.target.checked)}
                  className="w-4 h-4 text-[#A8382C] rounded accent-[#A8382C]"
                />
                <span className="font-bold text-stone-800 text-xs">Has MOI Letter</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Filter Desired Destination</label>
            <select
              value={desiredDestination}
              onChange={(e) => setDesiredDestination(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white font-medium"
            >
              <option value="All">All Study Destinations</option>
              {ALL_COUNTRIES_DATA.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Target Program Level</label>
            <select
              value={preferredProgram}
              onChange={(e) => setPreferredProgram(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
            >
              <option value="All">All Program Levels</option>
              <option value="Foundation">Foundation</option>
              <option value="Diploma / Advanced Diploma">Diploma / Advanced Diploma</option>
              <option value="Bachelor's / Undergraduate">Bachelor's / Undergraduate</option>
              <option value="Master's (Coursework)">Master's (Coursework)</option>
              <option value="Doctorate / PhD">Doctorate / PhD</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-stone-700">Max Tuition Budget (Optional)</label>
            <input
              type="number"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              placeholder="e.g. 20000"
              className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
            />
          </div>
        </div>
      </div>

      {/* Live Verdict Stats Tabs Bar (Instant Real-Time Result Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Evaluated Card */}
        <button
          type="button"
          onClick={() => setActiveVerdictTab('All')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeVerdictTab === 'All'
              ? 'bg-stone-900 text-white border-stone-900 shadow-md ring-2 ring-[#C9A227]'
              : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              activeVerdictTab === 'All' ? 'text-stone-300' : 'text-stone-500'
            }`}>
              Total Evaluated
            </span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              activeVerdictTab === 'All' ? 'bg-white/20 text-[#C9A227]' : 'bg-stone-100 text-stone-600'
            }`}>
              100%
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-display font-bold">
              {totalEvaluated}
            </span>
            <span className="text-[10px] opacity-70">
              of {courses.length} courses
            </span>
          </div>
          <div className="mt-2 text-[10px] flex items-center gap-1 opacity-80">
            <span>Click to view all {totalEvaluated} results</span>
          </div>
        </button>

        {/* Eligible (Pass) Card */}
        <button
          type="button"
          onClick={() => setActiveVerdictTab('Eligible')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeVerdictTab === 'Eligible'
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-md ring-2 ring-emerald-400'
              : 'bg-white text-stone-800 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              activeVerdictTab === 'Eligible' ? 'text-emerald-100' : 'text-emerald-800 font-extrabold'
            }`}>
              Eligible (Pass)
            </span>
            <CheckCircle2 className={`w-4 h-4 ${
              activeVerdictTab === 'Eligible' ? 'text-emerald-200' : 'text-emerald-600'
            }`} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl sm:text-3xl font-display font-bold ${
              activeVerdictTab === 'Eligible' ? 'text-white' : 'text-emerald-700'
            }`}>
              {eligibleCount}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              activeVerdictTab === 'Eligible' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {eligiblePercent}% Pass
            </span>
          </div>
          <div className="mt-2 text-[10px] flex items-center gap-1 opacity-80">
            <span>Direct qualify without condition</span>
          </div>
        </button>

        {/* Possibly Eligible Card */}
        <button
          type="button"
          onClick={() => setActiveVerdictTab('Possibly Eligible')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeVerdictTab === 'Possibly Eligible'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-300'
              : 'bg-white text-stone-800 border-amber-200 hover:border-amber-400 hover:bg-amber-50/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              activeVerdictTab === 'Possibly Eligible' ? 'text-amber-100' : 'text-amber-800 font-extrabold'
            }`}>
              Possibly Eligible
            </span>
            <AlertTriangle className={`w-4 h-4 ${
              activeVerdictTab === 'Possibly Eligible' ? 'text-amber-200' : 'text-amber-600'
            }`} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl sm:text-3xl font-display font-bold ${
              activeVerdictTab === 'Possibly Eligible' ? 'text-white' : 'text-amber-700'
            }`}>
              {possibleCount}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              activeVerdictTab === 'Possibly Eligible' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {possiblePercent}% Conditional
            </span>
          </div>
          <div className="mt-2 text-[10px] flex items-center gap-1 opacity-80">
            <span>Needs MOI review / test score</span>
          </div>
        </button>

        {/* Not Eligible (Fail) Card */}
        <button
          type="button"
          onClick={() => setActiveVerdictTab('Not Eligible')}
          className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
            activeVerdictTab === 'Not Eligible'
              ? 'bg-rose-700 text-white border-rose-700 shadow-md ring-2 ring-rose-300'
              : 'bg-white text-stone-800 border-rose-200 hover:border-rose-400 hover:bg-rose-50/30'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className={`text-[10px] font-bold uppercase tracking-wider block ${
              activeVerdictTab === 'Not Eligible' ? 'text-rose-100' : 'text-rose-800 font-extrabold'
            }`}>
              Not Eligible (Fail)
            </span>
            <XCircle className={`w-4 h-4 ${
              activeVerdictTab === 'Not Eligible' ? 'text-rose-200' : 'text-rose-600'
            }`} />
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl sm:text-3xl font-display font-bold ${
              activeVerdictTab === 'Not Eligible' ? 'text-white' : 'text-rose-700'
            }`}>
              {notEligibleCount}
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              activeVerdictTab === 'Not Eligible' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {notEligiblePercent}% Ineligible
            </span>
          </div>
          <div className="mt-2 text-[10px] flex items-center gap-1 opacity-80">
            <span>Fails hard entry criteria</span>
          </div>
        </button>
      </div>

      {/* In-Results Filter & Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={resultsSearchQuery}
            onChange={(e) => setResultsSearchQuery(e.target.value)}
            placeholder="Search matched courses by title, university, city..."
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs focus:outline-none focus:border-[#A8382C]"
          />
          {resultsSearchQuery && (
            <button
              onClick={() => setResultsSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs font-bold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1 text-xs text-stone-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-semibold hidden sm:inline">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white text-stone-800 focus:outline-none focus:border-[#A8382C]"
          >
            <option value="score">Highest Compatibility Match (%)</option>
            <option value="fee_asc">Tuition: Low to High</option>
            <option value="fee_desc">Tuition: High to Low</option>
            <option value="name">Course Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Evaluated Courses Breakdown List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-[#7A2820] flex items-center gap-2">
            <span>Evaluation Results</span>
            <span className="text-xs font-bold px-2 py-0.5 bg-stone-100 rounded-full text-stone-700">
              {filteredAndSortedResults.length} Courses
            </span>
            {activeVerdictTab !== 'All' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                activeVerdictTab === 'Eligible'
                  ? 'bg-emerald-100 text-emerald-800'
                  : activeVerdictTab === 'Possibly Eligible'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                Filter: {activeVerdictTab}
              </span>
            )}
          </h3>
          <span className="text-xs text-stone-500 hidden sm:inline">
            Click any course card to inspect the full 6-point eligibility criteria breakdown
          </span>
        </div>

        {filteredAndSortedResults.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-display font-bold text-stone-800">
              No matching courses found in "{activeVerdictTab}" category
            </h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Try adjusting the student academic scores, lowering the minimum budget, or switching the filter tab to "All" to view all evaluated options.
            </p>
            <button
              onClick={() => {
                setActiveVerdictTab('All');
                setResultsSearchQuery('');
              }}
              className="px-4 py-2 bg-[#FBF6F1] hover:bg-stone-100 text-[#7A2820] font-bold text-xs rounded-xl border border-stone-300 transition-colors"
            >
              View All Evaluated Courses
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedResults.map((res) => {
              const isExpanded = expandedCourseId === res.course_id;
              const verdictStyle =
                res.verdict === 'Eligible'
                  ? 'border-emerald-300 bg-white hover:border-emerald-400'
                  : res.verdict === 'Possibly Eligible'
                  ? 'border-amber-300 bg-white hover:border-amber-400'
                  : 'border-rose-200 bg-stone-50/50 hover:border-rose-300';

              const badgeStyle =
                res.verdict === 'Eligible'
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : res.verdict === 'Possibly Eligible'
                  ? 'bg-amber-100 text-amber-800 border-amber-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300';

              return (
                <div
                  key={res.course_id}
                  className={`card-modern overflow-hidden transition-all duration-300 ${verdictStyle}`}
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedCourseId(isExpanded ? null : res.course_id)}
                    className="p-5 sm:p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/80 transition-colors"
                  >
                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-2xs ${badgeStyle}`}
                        >
                          {res.verdict === 'Eligible' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                          {res.verdict === 'Possibly Eligible' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          {res.verdict === 'Not Eligible' && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          <span>{res.verdict}</span>
                        </span>

                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200/80">
                          {res.course.program}
                        </span>

                        <span className="text-xs text-stone-500 font-medium">
                          Match: <strong className="text-stone-800">{res.overall_score}%</strong>
                        </span>

                        {res.financial_fit === 'Within Budget' && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                            Within Budget
                          </span>
                        )}
                        {res.financial_fit === 'Exceeds Budget' && (
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-rose-50 text-rose-700 border border-rose-200/80">
                            Exceeds Budget
                          </span>
                        )}
                      </div>

                      <h4 className="font-display font-bold text-base sm:text-lg text-stone-900 leading-snug">
                        {res.course.course_name}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600">
                        <span className="font-bold text-stone-800">
                          {res.university?.name || res.course.destination_country}
                        </span>
                        <span>·</span>
                        <span>{res.course.city}, {res.course.destination_country}</span>
                        <span>·</span>
                        <span>Tuition: <strong className="text-[#A8382C]">{res.course.currency} {res.course.tuition_fee.toLocaleString()}</strong></span>
                        <span>·</span>
                        <span>Intake: {res.course.intake_months.join(', ')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {onCreateLead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onCreateLead(res.course, currentStudentProfile);
                          }}
                          className="px-3.5 py-2 text-xs font-bold text-white bg-[#A8382C] hover:bg-[#7A2820] rounded-xl transition-all shadow-xs flex items-center gap-1.5 hover:scale-[1.02] active:scale-98"
                          title="Generate a student lead / application for this student with this matched course"
                        >
                          <UserPlus className="w-3.5 h-3.5 text-[#F4E8C1]" />
                          <span>Submit Lead</span>
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCourse(res.course);
                        }}
                        className="px-3 py-1.5 text-xs font-bold text-[#7A2820] bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors"
                      >
                        Full Specs
                      </button>

                      <div className="p-1 text-stone-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Diagnostic 6-Point Criteria Breakdown */}
                  {isExpanded && (
                    <div className="p-5 border-t border-stone-200 bg-[#FBF6F1]/60 space-y-4 text-xs animate-fade-in">
                      <h5 className="font-bold uppercase tracking-wider text-stone-600 text-[11px]">
                        Detailed Evaluation Matrix (Checked in Sequence)
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {/* 1. Nationality */}
                        <div className={`p-3 rounded-xl border ${res.breakdown.nationality.passed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span>1. Nationality Check</span>
                            {res.breakdown.nationality.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            )}
                          </div>
                          <p className="text-stone-700">{res.breakdown.nationality.message}</p>
                        </div>

                        {/* 2. Qualification Level */}
                        <div className={`p-3 rounded-xl border ${res.breakdown.qualification.passed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span>2. Qualification Level</span>
                            {res.breakdown.qualification.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            )}
                          </div>
                          <p className="text-stone-700">{res.breakdown.qualification.message}</p>
                        </div>

                        {/* 3. Academic Score / Percentage */}
                        <div className={`p-3 rounded-xl border ${res.breakdown.academic_score.passed ? (res.breakdown.academic_score.partial ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50/70 border-emerald-200') : 'bg-rose-50 border-rose-200'}`}>
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span>3. Percentage / CGPA</span>
                            {res.breakdown.academic_score.passed ? (
                              res.breakdown.academic_score.partial ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            )}
                          </div>
                          <p className="text-stone-700">{res.breakdown.academic_score.message}</p>
                        </div>

                        {/* 4. Study Gap */}
                        <div className={`p-3 rounded-xl border ${res.breakdown.study_gap.passed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span>4. Study Gap Allowed</span>
                            {res.breakdown.study_gap.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            )}
                          </div>
                          <p className="text-stone-700">{res.breakdown.study_gap.message}</p>
                        </div>

                        {/* 5. English Proficiency */}
                        <div className={`p-3 rounded-xl border ${res.breakdown.english_proficiency.passed ? (res.breakdown.english_proficiency.partial ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50/70 border-emerald-200') : 'bg-rose-50 border-rose-200'}`}>
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span>5. English / MOI Rule</span>
                            {res.breakdown.english_proficiency.passed ? (
                              res.breakdown.english_proficiency.partial ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            )}
                          </div>
                          <p className="text-stone-700">{res.breakdown.english_proficiency.message}</p>
                        </div>

                        {/* 6. Age Criteria */}
                        <div className={`p-3 rounded-xl border ${res.breakdown.age.passed ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                          <div className="flex items-center justify-between font-bold mb-1">
                            <span>6. Minimum Age</span>
                            {res.breakdown.age.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600" />
                            )}
                          </div>
                          <p className="text-stone-700">{res.breakdown.age.message}</p>
                        </div>
                      </div>

                      {/* Reasons & Notes list */}
                      {res.reasons.length > 0 && (
                        <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800">
                          <strong className="block font-bold mb-1">Ineligibility Factors:</strong>
                          <ul className="list-disc list-inside space-y-0.5">
                            {res.reasons.map((r, i) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
