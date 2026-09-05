import React from 'react';
import { StudentProfile, EligibilityEvaluationResult, UserAccount } from '../types';
import { CrestLogo } from './CrestLogo';
import { printStudentAssessmentReport } from '../utils/exportUtils';
import { X, Printer, CheckCircle2, AlertTriangle, XCircle, Award, FileText } from 'lucide-react';

interface StudentAssessmentPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  results: EligibilityEvaluationResult[];
  counselorName?: string;
  counselorBranch?: string;
  currentUser?: UserAccount;
}

export const StudentAssessmentPrintModal: React.FC<StudentAssessmentPrintModalProps> = ({
  isOpen,
  onClose,
  student,
  results,
  counselorName = 'Ayesha Khan (Senior Counselor)',
  counselorBranch = 'Lahore Main Office',
  currentUser,
}) => {
  if (!isOpen) return null;

  const eligibleResults = results.filter((r) => r.verdict === 'Eligible');
  const possibleResults = results.filter((r) => r.verdict === 'Possibly Eligible');
  const notEligibleResults = results.filter((r) => r.verdict === 'Not Eligible');

  const handlePrint = () => {
    printStudentAssessmentReport(student, results, currentUser || {
      user_id: 'counselor_active',
      name: counselorName,
      email: 'counselor@studyworld.pk',
      role: 'Office Staff',
      department: counselorBranch,
      status: 'Active',
      created_at: '',
      last_active: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Controls top bar (hidden when printed) */}
        <div className="no-print px-6 py-4 bg-stone-900 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#C9A227]" />
            <h3 className="text-sm font-bold">
              Official Student Eligibility Assessment Report
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-xs font-bold bg-[#701C18] hover:bg-[#4A0E0B] text-white rounded-xl shadow-xs flex items-center gap-2 transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-4 h-4 text-[#D4AF37]" />
              <span>Print / Export PDF Assessment Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Sheet */}
        <div className="p-8 overflow-y-auto space-y-6 flex-1 text-[#241512] bg-white">
          {/* Header with SWC Crest */}
          <div className="flex items-center justify-between border-b-2 border-[#A8382C] pb-6">
            <CrestLogo size="lg" />
            <div className="text-right">
              <span className="px-3 py-1 bg-[#FBF6F1] border border-[#C9A227] text-[#7A2820] text-xs font-bold rounded-full inline-block mb-1">
                Confidential Assessment Report
              </span>
              <p className="text-xs text-stone-500">
                Date: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-xs text-stone-500">
                Ref No: <span className="font-mono text-stone-800">SWC-EVAL-{Date.now().toString().slice(-6)}</span>
              </p>
            </div>
          </div>

          {/* Student Profile Card */}
          <div className="p-5 rounded-xl bg-[#FBF6F1] border border-stone-200 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h3 className="font-display font-bold text-base text-[#7A2820]">
                Candidate Profile Information
              </h3>
              <span className="text-xs font-semibold text-stone-600">
                Nationality: <strong className="text-stone-900">{student.nationality || 'Unspecified'}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-stone-500 block">Candidate Name</span>
                <span className="font-bold text-stone-900">{student.student_name || 'Prospective Applicant'}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Candidate Age</span>
                <span className="font-bold text-stone-900">{student.age} Years</span>
              </div>
              <div>
                <span className="text-stone-500 block">Highest Qualification</span>
                <span className="font-bold text-stone-900">{student.previous_qualification}</span>
              </div>
              <div>
                <span className="text-stone-500 block">Academic Score / CGPA</span>
                <span className="font-bold text-stone-900">
                  {student.percentage ? `${student.percentage}%` : ''}{' '}
                  {student.cgpa ? `(${student.cgpa} CGPA)` : ''}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Graduation Year / Gap</span>
                <span className="font-bold text-stone-900">
                  {student.graduation_year} ({student.study_gap} Yrs Gap)
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">English Language Test</span>
                <span className="font-bold text-stone-900">
                  {student.ielts_overall ? `IELTS: ${student.ielts_overall} (Min ${student.ielts_min_band || 'N/A'})` : ''}
                  {student.pte_score ? `PTE: ${student.pte_score}` : ''}
                  {student.toefl_score ? `TOEFL: ${student.toefl_score}` : ''}
                  {!student.ielts_overall && !student.pte_score && !student.toefl_score ? (student.moi_available ? 'MOI Available' : 'Pending Test') : ''}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Desired Destination(s)</span>
                <span className="font-bold text-stone-900">
                  {student.desired_destinations.length ? student.desired_destinations.join(', ') : 'Any Destination'}
                </span>
              </div>
              <div>
                <span className="text-stone-500 block">Preferred Level</span>
                <span className="font-bold text-stone-900">
                  {student.preferred_programs.length ? student.preferred_programs.join(', ') : 'Any Program'}
                </span>
              </div>
            </div>
          </div>

          {/* Assessment Summary Verdict Bar */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
                Directly Eligible Courses
              </span>
              <span className="text-2xl font-display font-bold text-emerald-700">
                {eligibleResults.length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider block">
                Conditional / Review Required
              </span>
              <span className="text-2xl font-display font-bold text-amber-700">
                {possibleResults.length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider block">
                Not Eligible Courses
              </span>
              <span className="text-2xl font-display font-bold text-rose-700">
                {notEligibleResults.length}
              </span>
            </div>
          </div>

          {/* Recommended Eligible Courses Table */}
          <div className="space-y-3">
            <h4 className="font-display font-bold text-base text-[#7A2820] flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Recommended Eligible University Options
            </h4>

            {eligibleResults.length === 0 ? (
              <p className="text-xs text-stone-500 italic p-4 bg-stone-50 rounded-lg">
                No direct matches found. Please review conditional options or alternative study destinations.
              </p>
            ) : (
              <div className="border border-stone-200 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#FBF6F1] text-stone-700 border-b border-stone-200 font-semibold">
                    <tr>
                      <th className="p-3">University & Location</th>
                      <th className="p-3">Program & Level</th>
                      <th className="p-3">Duration</th>
                      <th className="p-3">Annual Tuition</th>
                      <th className="p-3">Intake</th>
                      <th className="p-3">Scholarship</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {eligibleResults.map((res) => (
                      <tr key={res.course_id} className="hover:bg-stone-50">
                        <td className="p-3 font-semibold text-stone-900">
                          {res.university?.name || res.course.destination_country}
                          <span className="block font-normal text-stone-500 text-[11px]">
                            {res.course.city}, {res.course.destination_country}
                          </span>
                        </td>
                        <td className="p-3">
                          <strong className="text-[#A8382C]">{res.course.course_name}</strong>
                          <span className="block text-stone-500 text-[11px]">{res.course.program}</span>
                        </td>
                        <td className="p-3">{res.course.duration} {res.course.duration_unit}</td>
                        <td className="p-3 font-bold text-stone-800">
                          {res.course.currency} {res.course.tuition_fee.toLocaleString()}
                        </td>
                        <td className="p-3">{res.course.intake_months.join(', ')}</td>
                        <td className="p-3">
                          {res.course.scholarship_available ? (
                            <span className="text-emerald-700 font-medium">Available</span>
                          ) : (
                            <span className="text-stone-400">Standard</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Conditional Options if any */}
          {possibleResults.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-display font-bold text-base text-amber-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Conditional Opportunities (Subject to English / Document Clearance)
              </h4>
              <div className="border border-amber-200 bg-amber-50/40 rounded-xl p-4 space-y-2 text-xs">
                {possibleResults.slice(0, 4).map((res) => (
                  <div key={res.course_id} className="flex justify-between items-start border-b border-amber-100 pb-2">
                    <div>
                      <strong className="text-stone-900">{res.course.course_name}</strong> — {res.university?.name} ({res.course.destination_country})
                      <p className="text-amber-800 text-[11px] mt-0.5">
                        Condition: {res.missing_data_warnings.join('; ')}
                      </p>
                    </div>
                    <span className="font-bold text-stone-700 flex-shrink-0 ml-4">
                      {res.course.currency} {res.course.tuition_fee.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Counselor Verification & Signatures */}
          <div className="pt-8 border-t border-stone-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <span className="text-stone-500 block mb-1">Prepared by Education Counselor:</span>
              <p className="font-bold text-stone-900">{counselorName}</p>
              <p className="text-stone-600">{counselorBranch}</p>
              <p className="text-stone-500 mt-2 text-[11px]">
                Study World Consultant · Official Advisory Team
              </p>
            </div>

            <div className="text-right">
              <span className="text-stone-500 block mb-8">Authorized Office Stamp & Signature</span>
              <div className="w-48 border-b-2 border-stone-800 ml-auto" />
              <p className="text-[11px] text-stone-500 mt-1">
                Study World Consultant — Head Office
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
