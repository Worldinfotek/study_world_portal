import React, { useState, useEffect } from 'react';
import { Course, University, ProgramLevel, DurationBucket, StudyMode, CourseStatus, MoiStatus } from '../types';
import { X, Save, AlertCircle, Sparkles } from 'lucide-react';

interface CourseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  initialCourse?: Course | null;
  universities: University[];
  preselectedUniversityId?: string;
}

export const CourseFormModal: React.FC<CourseFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialCourse,
  universities,
  preselectedUniversityId,
}) => {
  const isEditing = !!initialCourse;

  // Basic Course State
  const [courseId, setCourseId] = useState(initialCourse?.course_id || `crs_${Date.now()}`);
  const [universityId, setUniversityId] = useState(
    initialCourse?.university_id || preselectedUniversityId || universities[0]?.university_id || ''
  );
  const [courseName, setCourseName] = useState(initialCourse?.course_name || '');
  const [program, setProgram] = useState<ProgramLevel>(initialCourse?.program || "Master's (Coursework)");
  const [duration, setDuration] = useState(initialCourse?.duration || 1);
  const [durationUnit, setDurationUnit] = useState<'years' | 'months'>(initialCourse?.duration_unit || 'years');
  const [durationBucket, setDurationBucket] = useState<DurationBucket>(initialCourse?.duration_bucket || '1-2');
  const [intakeMonths, setIntakeMonths] = useState<string>(
    initialCourse?.intake_months?.join(', ') || 'September, January'
  );
  const [intakeYears, setIntakeYears] = useState<string>(
    initialCourse?.intake_years?.join(', ') || '2026, 2027'
  );
  const [tuitionFee, setTuitionFee] = useState<number>(initialCourse?.tuition_fee || 18000);
  const [currency, setCurrency] = useState<string>(initialCourse?.currency || 'GBP');
  const [applicationFee, setApplicationFee] = useState<number>(initialCourse?.application_fee || 0);
  const [applicationDeadline, setApplicationDeadline] = useState<string>(
    initialCourse?.application_deadline || '2026-11-30'
  );
  const [studyMode, setStudyMode] = useState<StudyMode>(initialCourse?.study_mode || 'On-campus');
  const [status, setStatus] = useState<CourseStatus>(initialCourse?.status || 'Active');
  const [scholarshipAvailable, setScholarshipAvailable] = useState<boolean>(
    initialCourse?.scholarship_available ?? true
  );
  const [scholarshipDetail, setScholarshipDetail] = useState<string>(
    initialCourse?.scholarship_detail || 'Merit discount up to £2,500'
  );
  const [faculty, setFaculty] = useState<string>(initialCourse?.faculty || 'Faculty of Science & Computing');

  // Eligibility State
  const [minQualification, setMinQualification] = useState<string>(
    initialCourse?.eligibility?.minimum_qualification || "Bachelor's / Undergraduate"
  );
  const [minQualificationRank, setMinQualificationRank] = useState<number>(
    initialCourse?.eligibility?.minimum_qualification_rank || 4
  );
  const [minPercentage, setMinPercentage] = useState<number>(
    initialCourse?.eligibility?.minimum_percentage || 55
  );
  const [minCgpa, setMinCgpa] = useState<number>(initialCourse?.eligibility?.minimum_cgpa || 2.5);
  const [studyGapAllowed, setStudyGapAllowed] = useState<number>(
    initialCourse?.eligibility?.study_gap_allowed_years || 5
  );
  const [ageMin, setAgeMin] = useState<number>(initialCourse?.eligibility?.age_requirement_min || 20);
  const [ageMax, setAgeMax] = useState<number | undefined>(initialCourse?.eligibility?.age_requirement_max);
  const [ieltsOverall, setIeltsOverall] = useState<number>(initialCourse?.eligibility?.ielts_overall || 6.5);
  const [ieltsMinBand, setIeltsMinBand] = useState<number>(initialCourse?.eligibility?.ielts_min_band || 6.0);
  const [pteMin, setPteMin] = useState<number>(initialCourse?.eligibility?.pte_min || 58);
  const [toeflMin, setToeflMin] = useState<number>(initialCourse?.eligibility?.toefl_min || 80);
  const [moiAcceptance, setMoiAcceptance] = useState<MoiStatus>(
    initialCourse?.eligibility?.moi_acceptance || 'Accepted'
  );
  const [eligibleNationalities, setEligibleNationalities] = useState<string>(
    initialCourse?.eligibility?.eligible_nationalities?.join(', ') || 'All'
  );
  const [restrictedNationalities, setRestrictedNationalities] = useState<string>(
    initialCourse?.eligibility?.restricted_nationalities?.join(', ') || ''
  );
  const [requiredDocs, setRequiredDocs] = useState<string>(
    initialCourse?.eligibility?.required_documents?.join(', ') ||
      'Degree & Transcripts, Passport, SOP, 2 Recommendation Letters'
  );
  const [importantNotes, setImportantNotes] = useState<string>(
    initialCourse?.eligibility?.important_notes || 'Placement year options available upon request.'
  );

  const [activeTab, setActiveTab] = useState<'basic' | 'eligibility'>('basic');
  const [errorMessage, setErrorMessage] = useState('');

  // Selected University detail
  const selectedUni = universities.find((u) => u.university_id === universityId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      setErrorMessage('Course name is required.');
      return;
    }
    if (!universityId) {
      setErrorMessage('Please select a valid University.');
      return;
    }

    const currentCountry = selectedUni?.country || 'United Kingdom';
    const currentCity = selectedUni?.city || 'London';

    const parsedIntakeMonths = intakeMonths
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedIntakeYears = intakeYears
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((y) => !isNaN(y));
    const parsedEligibleNat = eligibleNationalities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedRestrictedNat = restrictedNationalities
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedDocs = requiredDocs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const savedCourse: Course = {
      course_id: courseId,
      university_id: universityId,
      course_name: courseName.trim(),
      destination_country: currentCountry,
      city: currentCity,
      faculty,
      program,
      duration: Number(duration),
      duration_unit: durationUnit,
      duration_bucket: durationBucket,
      intake_months: parsedIntakeMonths.length ? parsedIntakeMonths : ['September'],
      intake_years: parsedIntakeYears.length ? parsedIntakeYears : [2026],
      tuition_fee: Number(tuitionFee),
      currency,
      application_fee: Number(applicationFee),
      application_deadline: applicationDeadline || 'Rolling',
      scholarship_available: scholarshipAvailable,
      scholarship_detail: scholarshipDetail,
      study_mode: studyMode,
      status,
      date_added: initialCourse?.date_added || new Date().toISOString().split('T')[0],
      last_updated: new Date().toISOString().split('T')[0],
      eligibility: {
        course_id: courseId,
        eligible_nationalities: parsedEligibleNat.length ? parsedEligibleNat : ['All'],
        restricted_nationalities: parsedRestrictedNat,
        minimum_qualification: minQualification,
        minimum_qualification_rank: Number(minQualificationRank),
        minimum_percentage: Number(minPercentage),
        minimum_cgpa: Number(minCgpa),
        study_gap_allowed_years: Number(studyGapAllowed),
        age_requirement_min: Number(ageMin),
        age_requirement_max: ageMax ? Number(ageMax) : undefined,
        ielts_overall: Number(ieltsOverall),
        ielts_min_band: Number(ieltsMinBand),
        pte_min: Number(pteMin),
        toefl_min: Number(toeflMin),
        moi_acceptance: moiAcceptance,
        required_documents: parsedDocs,
        additional_admission_conditions: '',
        important_notes: importantNotes,
      },
    };

    onSave(savedCourse);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#4A140F] via-[#7A2820] to-[#A8382C] text-white flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-display font-bold">
              {isEditing ? 'Edit Course & Eligibility Rules' : 'Add New University Course'}
            </h2>
            <p className="text-xs text-stone-200 mt-0.5">
              Study World Consultant Central Database
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 px-6 pt-2 gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'basic'
                ? 'border-[#A8382C] text-[#A8382C] bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            1. Course Information & Fees
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('eligibility')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'eligibility'
                ? 'border-[#A8382C] text-[#A8382C] bg-white rounded-t-lg'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            2. Admission & Student Eligibility Criteria
          </button>
        </div>

        {/* Form Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {activeTab === 'basic' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Select University *</label>
                  <select
                    value={universityId}
                    onChange={(e) => setUniversityId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                    required
                  >
                    {universities.map((u) => (
                      <option key={u.university_id} value={u.university_id}>
                        {u.name} ({u.country})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Course Name *</label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. MSc Data Science & Artificial Intelligence"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Program Level *</label>
                  <select
                    value={program}
                    onChange={(e) => setProgram(e.target.value as ProgramLevel)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  >
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

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Faculty / Department</label>
                  <input
                    type="text"
                    value={faculty}
                    onChange={(e) => setFaculty(e.target.value)}
                    placeholder="e.g. Engineering & IT"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Study Mode</label>
                  <select
                    value={studyMode}
                    onChange={(e) => setStudyMode(e.target.value as StudyMode)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  >
                    <option value="On-campus">On-campus</option>
                    <option value="Online">Online</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Duration Value</label>
                  <input
                    type="number"
                    step="0.5"
                    value={duration}
                    onChange={(e) => setDuration(parseFloat(e.target.value) || 1)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Duration Unit</label>
                  <select
                    value={durationUnit}
                    onChange={(e) => setDurationUnit(e.target.value as 'years' | 'months')}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  >
                    <option value="years">Years</option>
                    <option value="months">Months</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Duration Filter Bucket</label>
                  <select
                    value={durationBucket}
                    onChange={(e) => setDurationBucket(e.target.value as DurationBucket)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  >
                    <option value="0-1">0–1 Year</option>
                    <option value="1-2">1–2 Years</option>
                    <option value="2-3">2–3 Years</option>
                    <option value="3-4">3–4 Years</option>
                    <option value="4+">4+ Years</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Annual Tuition Fee *</label>
                  <input
                    type="number"
                    value={tuitionFee}
                    onChange={(e) => setTuitionFee(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Currency (ISO)</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  >
                    <option value="GBP">GBP (£ - United Kingdom)</option>
                    <option value="AUD">AUD (A$ - Australia)</option>
                    <option value="CAD">CAD (C$ - Canada)</option>
                    <option value="USD">USD ($ - United States)</option>
                    <option value="EUR">EUR (€ - Ireland / Germany)</option>
                    <option value="MYR">MYR (RM - Malaysia)</option>
                    <option value="AED">AED (UAE)</option>
                    <option value="NZD">NZD (New Zealand)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Application Fee</label>
                  <input
                    type="number"
                    value={applicationFee}
                    onChange={(e) => setApplicationFee(parseFloat(e.target.value) || 0)}
                    placeholder="0 for Free"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Intake Months (Comma separated)</label>
                  <input
                    type="text"
                    value={intakeMonths}
                    onChange={(e) => setIntakeMonths(e.target.value)}
                    placeholder="e.g. September, January, May"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Intake Years (Comma separated)</label>
                  <input
                    type="text"
                    value={intakeYears}
                    onChange={(e) => setIntakeYears(e.target.value)}
                    placeholder="e.g. 2026, 2027"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Application Deadline</label>
                  <input
                    type="text"
                    value={applicationDeadline}
                    onChange={(e) => setApplicationDeadline(e.target.value)}
                    placeholder="e.g. 2026-11-15 or Rolling"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Course Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as CourseStatus)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Outdated">Outdated</option>
                  </select>
                </div>
              </div>

              {/* Scholarship section */}
              <div className="p-3 bg-[#FBF6F1] rounded-xl border border-stone-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scholarshipAvailable}
                    onChange={(e) => setScholarshipAvailable(e.target.checked)}
                    className="w-4 h-4 text-[#A8382C] rounded accent-[#A8382C]"
                  />
                  <span className="font-semibold text-stone-900">Scholarship / Bursary Available</span>
                </label>
                {scholarshipAvailable && (
                  <input
                    type="text"
                    value={scholarshipDetail}
                    onChange={(e) => setScholarshipDetail(e.target.value)}
                    placeholder="e.g. £2,000 Early Bird + £3,500 Academic Merit"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'eligibility' && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Minimum Required Prior Qualification *</label>
                  <select
                    value={minQualification}
                    onChange={(e) => {
                      setMinQualification(e.target.value);
                      if (e.target.value.includes('Secondary') || e.target.value.includes('10th')) setMinQualificationRank(1);
                      else if (e.target.value.includes('High School') || e.target.value.includes('A-Levels')) setMinQualificationRank(2);
                      else if (e.target.value.includes('Diploma') || e.target.value.includes('Associate')) setMinQualificationRank(3);
                      else if (e.target.value.includes("Bachelor")) setMinQualificationRank(4);
                      else if (e.target.value.includes("Master")) setMinQualificationRank(6);
                    }}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  >
                    <option value="Secondary / 10th Grade / O-Levels / 11th Grade">Secondary / 10th Grade / O-Levels</option>
                    <option value="High School / A-Levels / Intermediate">High School / A-Levels / 12th Grade</option>
                    <option value="Diploma / Associate Degree / Pass Bachelor">Diploma / Associate Degree</option>
                    <option value="Bachelor's / Undergraduate">Bachelor's / 4-Year Undergraduate</option>
                    <option value="Master's Degree (MSc / MS / MPhil)">Master's Degree (MS / MPhil)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Hierarchy Rank Level (1-8)</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={minQualificationRank}
                    onChange={(e) => setMinQualificationRank(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Min Academic Percentage (%)</label>
                  <input
                    type="number"
                    value={minPercentage}
                    onChange={(e) => setMinPercentage(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 55"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Min CGPA (out of 4.0)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={minCgpa}
                    onChange={(e) => setMinCgpa(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 2.5"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Max Study Gap (Years)</label>
                  <input
                    type="number"
                    value={studyGapAllowed}
                    onChange={(e) => setStudyGapAllowed(parseInt(e.target.value, 10) || 0)}
                    placeholder="e.g. 5"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Minimum Entry Age (Years)</label>
                  <input
                    type="number"
                    value={ageMin}
                    onChange={(e) => setAgeMin(parseInt(e.target.value, 10) || 16)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Maximum Age (Optional)</label>
                  <input
                    type="number"
                    value={ageMax || ''}
                    onChange={(e) => setAgeMax(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    placeholder="Leave empty if no max"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#A8382C] bg-white"
                  />
                </div>
              </div>

              {/* English Requirements */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-800 text-xs uppercase tracking-wider">
                  English Language Requirements
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-600">IELTS Overall</label>
                    <input
                      type="number"
                      step="0.5"
                      value={ieltsOverall}
                      onChange={(e) => setIeltsOverall(parseFloat(e.target.value) || 6.0)}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-600">IELTS Min Band</label>
                    <input
                      type="number"
                      step="0.5"
                      value={ieltsMinBand}
                      onChange={(e) => setIeltsMinBand(parseFloat(e.target.value) || 5.5)}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-600">PTE Min</label>
                    <input
                      type="number"
                      value={pteMin}
                      onChange={(e) => setPteMin(parseInt(e.target.value, 10) || 50)}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-stone-600">TOEFL iBT Min</label>
                    <input
                      type="number"
                      value={toeflMin}
                      onChange={(e) => setToeflMin(parseInt(e.target.value, 10) || 75)}
                      className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-stone-600">MOI (Medium of Instruction) Policy</label>
                  <select
                    value={moiAcceptance}
                    onChange={(e) => setMoiAcceptance(e.target.value as MoiStatus)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  >
                    <option value="Accepted">Accepted (MOI letter waives English test)</option>
                    <option value="Case-by-Case">Case-by-Case (requires syllabus review)</option>
                    <option value="Not Accepted">Not Accepted (Official test mandatory)</option>
                  </select>
                </div>
              </div>

              {/* Nationalities & Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Eligible Nationalities (e.g. "All" or comma list)</label>
                  <input
                    type="text"
                    value={eligibleNationalities}
                    onChange={(e) => setEligibleNationalities(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-stone-700">Restricted / Excluded Nationalities</label>
                  <input
                    type="text"
                    value={restrictedNationalities}
                    onChange={(e) => setRestrictedNationalities(e.target.value)}
                    placeholder="Leave empty if none"
                    className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Required Documents (Comma separated)</label>
                <input
                  type="text"
                  value={requiredDocs}
                  onChange={(e) => setRequiredDocs(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Important Admission Notes</label>
                <textarea
                  rows={2}
                  value={importantNotes}
                  onChange={(e) => setImportantNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg bg-white"
                />
              </div>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
            {activeTab === 'basic' ? (
              <button
                type="button"
                onClick={() => setActiveTab('eligibility')}
                className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
              >
                Next: Set Eligibility Criteria →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className="px-4 py-2 text-xs font-bold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg"
              >
                ← Back to Course Info
              </button>
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#A8382C] hover:bg-[#7A2820] rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isEditing ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
