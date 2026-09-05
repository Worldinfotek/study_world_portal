import React, { useState } from 'react';
import { University, Course } from '../types';
import { printFormattedReport } from '../utils/exportUtils';
import { ViewportOverlay } from './ViewportOverlay';
import {
  X,
  MapPin,
  Globe,
  Mail,
  Phone,
  BookOpen,
  Award,
  Plus,
  ArrowRight,
  Edit2,
  Calendar,
  Printer,
  Trash2,
} from 'lucide-react';

interface UniversityDetailModalProps {
  university: University | null;
  courses: Course[];
  onClose: () => void;
  onSelectCourse: (course: Course) => void;
  onAddCourse?: (universityId: string) => void;
  onEditUniversity?: (university: University) => void;
  onDeleteUniversity?: (universityId: string) => void;
  canEdit?: boolean;
}

export const UniversityDetailModal: React.FC<UniversityDetailModalProps> = ({
  university,
  courses,
  onClose,
  onSelectCourse,
  onAddCourse,
  onEditUniversity,
  onDeleteUniversity,
  canEdit = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>('All');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleConfirmDelete = () => {
    if (university && onDeleteUniversity) {
      onDeleteUniversity(university.university_id);
      setShowDeleteConfirm(false);
      onClose();
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchSearch =
      c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.faculty?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchProgram = selectedProgram === 'All' || c.program === selectedProgram;
    return matchSearch && matchProgram;
  });

  const handlePrint = () => {
    if (!university) return;
    const infoFields = [
      { label: 'University Name', value: university.name },
      { label: 'Destination / Country', value: `${university.city}, ${university.country}` },
      { label: 'Global Ranking', value: university.ranking ? `QS #${university.ranking}` : 'Accredited Partner' },
      { label: 'Established', value: university.established_year ? `${university.established_year}` : 'Established Institution' },
      { label: 'Official Website', value: university.website || 'N/A' },
      { label: 'Admissions Contact', value: university.contact_email || 'admissions@studyworld.com' },
      { label: 'Active Programs Count', value: `${courses.length} Available Programs` },
      { label: 'Status', value: university.status },
    ];

    const headers = ['Program Name', 'Level', 'Duration', 'Tuition Fee', 'IELTS / MOI'];
    const rows = filteredCourses.map((c) => [
      c.course_name,
      c.program,
      `${c.duration} ${c.duration_unit}`,
      `${c.currency} ${c.tuition_fee.toLocaleString()}`,
      `IELTS ${c.eligibility.ielts_overall} | MOI: ${c.eligibility.moi_acceptance}`,
    ]);

    printFormattedReport({
      title: `Study World Consultant — Institutional Dossier: ${university.name}`,
      subtitle: `${university.city}, ${university.country} · Partner Prospectus & Program Offerings`,
      badgeText: 'University Dossier',
      infoFields,
      headers,
      rows,
    });
  };

  if (!university) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#4A140F] via-[#7A2820] to-[#A8382C] text-white flex items-start justify-between flex-shrink-0">
          <div className="flex items-start gap-4 flex-1 pr-4">
            <img
              src={university.logo_url}
              alt={university.name}
              className="w-16 h-16 rounded-xl object-cover border-2 border-[#C9A227] bg-white shadow-md flex-shrink-0"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    university.status === 'Active'
                      ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                      : 'bg-amber-500/20 text-amber-200'
                  }`}
                >
                  {university.status}
                </span>
                {university.ranking && (
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#C9A227] text-stone-900 flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    QS / Times #{university.ranking}
                  </span>
                )}
                {university.established_year && (
                  <span className="text-xs text-stone-300">
                    Est. {university.established_year}
                  </span>
                )}
              </div>
              <h2 className="text-2xl font-display font-bold leading-tight text-white">
                {university.name}
              </h2>
              <div className="flex items-center gap-2 text-sm text-stone-200 mt-1">
                <MapPin className="w-4 h-4 text-[#C9A227]" />
                <span>
                  {university.city}, {university.country}
                  {university.campus ? ` · ${university.campus}` : ''}
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

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-[#241512]">
          {/* Overview & Contacts */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2 p-4 rounded-xl bg-[#FBF6F1] border border-stone-200">
              <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Institutional Overview
              </h3>
              <p className="text-sm text-stone-700 leading-relaxed">
                {university.overview ||
                  `${university.name} is a premier international partner university accredited for high educational standards and international student placement.`}
              </p>
            </div>

            <div className="space-y-2.5 p-4 rounded-xl bg-white border border-stone-200 text-xs">
              <h3 className="font-bold text-stone-500 uppercase tracking-wider">
                Direct Contact
              </h3>
              <div className="space-y-2 text-stone-700">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#A8382C] flex-shrink-0" />
                  <a
                    href={`mailto:${university.contact_info.email}`}
                    className="hover:underline text-[#7A2820] font-medium truncate"
                  >
                    {university.contact_info.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#A8382C] flex-shrink-0" />
                  <span>{university.contact_info.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#A8382C] flex-shrink-0" />
                  <a
                    href={university.website}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-[#7A2820] font-medium truncate"
                  >
                    {university.website.replace('https://', '')}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Offered Section */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-lg font-display font-bold text-[#7A2820] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#A8382C]" />
                  Offered Academic Programs ({courses.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Search through active courses listed in the SWC database
                </p>
              </div>

              {canEdit && onAddCourse && (
                <button
                  onClick={() => onAddCourse(university.university_id)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-[#A8382C] hover:bg-[#7A2820] rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  Add Course to University
                </button>
              )}
            </div>

            {/* Filter controls within university */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter courses by name or subject..."
                className="px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-[#A8382C] bg-white flex-1 min-w-[200px]"
              />

              <select
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                className="px-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:border-[#A8382C] bg-white"
              >
                <option value="All">All Program Levels</option>
                <option value="Foundation">Foundation</option>
                <option value="Bachelor's / Undergraduate">Bachelor's / Undergraduate</option>
                <option value="Master's (Coursework)">Master's (Coursework)</option>
                <option value="Doctorate / PhD">Doctorate / PhD</option>
                <option value="Language / Pathway Program">Language / Pathway Program</option>
              </select>
            </div>

            {/* Courses List */}
            {filteredCourses.length === 0 ? (
              <div className="p-8 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300">
                <p className="text-sm text-stone-500">
                  No courses matching your criteria in this university.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-200 border border-stone-200 rounded-xl overflow-hidden bg-white">
                {filteredCourses.map((c) => (
                  <div
                    key={c.course_id}
                    onClick={() => onSelectCourse(c)}
                    className="p-4 hover:bg-[#FBF6F1] transition-colors cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                          {c.program}
                        </span>
                        <span className="text-xs text-stone-500">
                          {c.duration} {c.duration_unit} ({c.study_mode})
                        </span>
                        {c.scholarship_available && (
                          <span className="px-2 py-0.2 text-[10px] font-medium rounded-full bg-amber-100 text-amber-800">
                            Scholarship
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-stone-900 group-hover:text-[#A8382C]">
                        {c.course_name}
                      </h4>
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <span>
                          Tuition: <strong className="text-stone-800">{c.currency} {c.tuition_fee.toLocaleString()}</strong>
                        </span>
                        <span>Intakes: {c.intake_months.join(', ')}</span>
                        <span>IELTS: {c.eligibility.ielts_overall} | MOI: {c.eligibility.moi_acceptance}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-[#A8382C]">
                      <span>View Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between flex-shrink-0">
          <span className="text-xs text-stone-500">
            University ID: <span className="font-mono">{university.university_id}</span>
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-[#701C18]" />
              Print University Dossier
            </button>

            {canEdit && onEditUniversity && (
              <button
                onClick={() => onEditUniversity(university)}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Edit University Info
              </button>
            )}

            {canEdit && onDeleteUniversity && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Permanently Delete University (Admin Only)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete University
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-800 hover:bg-stone-900 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <ViewportOverlay zClass="z-[60]" onBackdropClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-stone-900">Delete University Permanently</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                    Are you sure you want to permanently delete this university from the portal? Deleting it will also remove all its linked courses.
                  </p>
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
                <div className="font-bold text-stone-900">{university.name}</div>
                <div className="text-stone-500">{university.city}, {university.country}</div>
                <div className="text-rose-700 font-semibold pt-1">
                  {courses.filter((c) => c.university_id === university.university_id).length} linked course(s) will be deleted.
                </div>
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
