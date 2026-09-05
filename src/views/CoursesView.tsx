import React, { useState, useMemo } from 'react';
import { Course, University, UserAccount } from '../types';
import { exportToCsv, printFormattedReport } from '../utils/exportUtils';
import { ViewportOverlay } from '../components/ViewportOverlay';
import {
  BookOpen,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Calendar,
  DollarSign,
  Award,
  Filter,
  CheckCircle,
  XCircle,
  Printer,
  FileSpreadsheet,
  Globe2,
} from 'lucide-react';

interface CoursesViewProps {
  courses: Course[];
  universities: University[];
  currentUser: UserAccount;
  onSelectCourse: (course: Course) => void;
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onDeleteCourses?: (courseIds: string[]) => void;
}

export const CoursesView: React.FC<CoursesViewProps> = ({
  courses,
  universities,
  currentUser,
  onSelectCourse,
  onAddCourse,
  onEditCourse,
  onDeleteCourse,
  onDeleteCourses,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('All');
  const [selectedProgram, setSelectedProgram] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const isAdmin = currentUser.role === 'Admin';

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.course_name.toLowerCase().includes(q);
        const matchesFaculty = c.faculty?.toLowerCase().includes(q);
        if (!matchesName && !matchesFaculty) return false;
      }
      if (selectedUniversity !== 'All' && c.university_id !== selectedUniversity) {
        return false;
      }
      if (selectedProgram !== 'All' && c.program !== selectedProgram) {
        return false;
      }
      if (selectedStatus !== 'All' && c.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [courses, searchQuery, selectedUniversity, selectedProgram, selectedStatus]);

  const toggleSelectAll = () => {
    if (selectedCourseIds.length === filteredCourses.length) {
      setSelectedCourseIds([]);
    } else {
      setSelectedCourseIds(filteredCourses.map((c) => c.course_id));
    }
  };

  const toggleSelectCourse = (courseId: string) => {
    setSelectedCourseIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  };

  const handleConfirmSingleDelete = () => {
    if (!courseToDelete) return;
    onDeleteCourse(courseToDelete.course_id);
    setSelectedCourseIds((prev) => prev.filter((id) => id !== courseToDelete.course_id));
    setCourseToDelete(null);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedCourseIds.length === 0) return;
    if (onDeleteCourses) {
      onDeleteCourses(selectedCourseIds);
    } else {
      selectedCourseIds.forEach((id) => onDeleteCourse(id));
    }
    setSelectedCourseIds([]);
    setShowBulkDeleteModal(false);
  };

  const handleExportCsv = () => {
    const rows = filteredCourses.map((c) => {
      const uni = universities.find((u) => u.university_id === c.university_id);
      return {
        'Course ID': c.course_id,
        'Course Title': c.course_name,
        'University': uni?.name || 'Partner University',
        'Country': c.destination_country,
        'City': c.city,
        'Program Level': c.program,
        'Duration': `${c.duration} ${c.duration_unit}`,
        'Tuition Fee': `${c.currency} ${c.tuition_fee}`,
        'IELTS Overall': c.eligibility.ielts_overall,
        'PTE Score': c.eligibility.pte_min,
        'MOI Acceptance': c.eligibility.moi_acceptance,
        'Intake Months': c.intake_months.join('; '),
        'Status': c.status,
      };
    });
    exportToCsv(`SWC_Course_Inventory_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const handlePrintPdf = () => {
    const headers = ['Course Title', 'University & Country', 'Program', 'Duration', 'Tuition Fee', 'IELTS / MOI', 'Status'];
    const rows = filteredCourses.map((c) => {
      const uni = universities.find((u) => u.university_id === c.university_id);
      return [
        c.course_name,
        `${uni?.name || 'Partner University'} (${c.city}, ${c.destination_country})`,
        c.program,
        `${c.duration} ${c.duration_unit}`,
        `${c.currency} ${c.tuition_fee.toLocaleString()}`,
        `IELTS ${c.eligibility.ielts_overall} · MOI: ${c.eligibility.moi_acceptance}`,
        c.status,
      ];
    });

    printFormattedReport({
      title: 'Study World Consultant — Course Catalog & Inventory',
      subtitle: `Master Database of Accredited Academic Programs (${filteredCourses.length} Courses)`,
      badgeText: 'Course Inventory',
      headers,
      rows,
      currentUser,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#241512]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#701C18]">
            Courses Catalog & Inventory
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Full repository of {courses.length} academic programs across partner universities
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handlePrintPdf}
            className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-300 font-bold text-stone-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#701C18]" />
            <span>Print / PDF</span>
          </button>

          {(isAdmin || currentUser.export_permission) && (
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-300 font-bold text-stone-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
              title="Export to CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={onAddCourse}
              className="px-4 py-2 bg-[#701C18] hover:bg-[#4A0E0B] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add Course</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search course title or faculty..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-[#FBF6F1] focus:bg-white focus:outline-none focus:border-[#A8382C]"
          />
        </div>

        <div>
          <select
            value={selectedUniversity}
            onChange={(e) => setSelectedUniversity(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-[#A8382C] font-medium"
          >
            <option value="All">All Partner Universities</option>
            {universities.map((u) => (
              <option key={u.university_id} value={u.university_id}>
                {u.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedProgram}
            onChange={(e) => setSelectedProgram(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-[#A8382C] font-medium"
          >
            <option value="All">All Program Levels</option>
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

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-[#A8382C] font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Courses Only</option>
            <option value="Inactive">Inactive / Archived</option>
          </select>
        </div>
      </div>

      {/* Bulk Admin Actions Bar */}
      {isAdmin && selectedCourseIds.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-rose-900 font-semibold">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedCourseIds.length}
            </span>
            <span>Course{selectedCourseIds.length > 1 ? 's' : ''} selected for administrative action</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedCourseIds([])}
              className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 font-medium rounded-xl border border-stone-300 transition-colors"
            >
              Cancel Selection
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Permanently ({selectedCourseIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Courses Table / List or Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-[#7A2820] flex items-center justify-center mx-auto border border-amber-200">
            <BookOpen className="w-8 h-8 text-[#A8382C]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-display font-bold text-lg text-stone-900">
              No Courses Found
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Try adjusting your search query, target university, program level, or status filter.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || selectedUniversity !== 'All' || selectedProgram !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedUniversity('All');
                  setSelectedProgram('All');
                  setSelectedStatus('All');
                }}
                className="px-4 py-2 text-xs font-bold text-[#7A2820] bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors"
              >
                Reset All Filters
              </button>
            )}
            {isAdmin && (
              <button
                onClick={onAddCourse}
                className="px-4 py-2 text-xs font-bold text-white bg-[#7A2820] hover:bg-[#A8382C] rounded-xl transition-colors"
              >
                Add New Course
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBF6F1] text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                {isAdmin && (
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={
                        filteredCourses.length > 0 &&
                        selectedCourseIds.length === filteredCourses.length
                      }
                      onChange={toggleSelectAll}
                      className="rounded border-stone-300 text-[#701C18] focus:ring-[#701C18] cursor-pointer"
                      title="Select all filtered courses"
                    />
                  </th>
                )}
                <th className="p-3.5">Course Name & Level</th>
                <th className="p-3.5">University</th>
                <th className="p-3.5">Destination</th>
                <th className="p-3.5">Tuition</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">IELTS / PTE</th>
                <th className="p-3.5">MOI</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200 text-stone-800">
              {filteredCourses.map((course) => {
                const uni = universities.find((u) => u.university_id === course.university_id);
                const isSelected = selectedCourseIds.includes(course.course_id);
                return (
                  <tr
                    key={course.course_id}
                    className={`hover:bg-[#FBF6F1] transition-colors cursor-pointer ${
                      isSelected ? 'bg-rose-50/60' : ''
                    }`}
                    onClick={() => onSelectCourse(course)}
                  >
                    {isAdmin && (
                      <td
                        className="p-3.5 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectCourse(course.course_id);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded border-stone-300 text-[#701C18] focus:ring-[#701C18] cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="p-3.5">
                      <strong className="text-stone-900 font-bold block hover:text-[#A8382C]">
                        {course.course_name}
                      </strong>
                      <span className="text-[11px] text-stone-500">{course.program}</span>
                    </td>
                    <td className="p-3.5 font-medium text-stone-800">
                      {uni?.name || 'Partner University'}
                    </td>
                    <td className="p-3.5">
                      {course.city}, {course.destination_country}
                    </td>
                    <td className="p-3.5 font-bold text-[#A8382C]">
                      {course.currency} {course.tuition_fee.toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      {course.duration} {course.duration_unit}
                    </td>
                    <td className="p-3.5">
                      IELTS {course.eligibility.ielts_overall} / PTE {course.eligibility.pte_min}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          course.eligibility.moi_acceptance === 'Accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {course.eligibility.moi_acceptance}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          course.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {course.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onSelectCourse(course)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-md text-[11px] transition-colors"
                      >
                        View
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => onEditCourse(course)}
                            className="p-1 text-stone-500 hover:text-stone-900 rounded"
                            title="Edit Course"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setCourseToDelete(course)}
                            className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Course Permanently (Admin Only)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
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

      {/* Single Delete Confirmation Modal */}
      {courseToDelete && (
        <ViewportOverlay onBackdropClick={() => setCourseToDelete(null)}>
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
                  Are you sure you want to permanently remove this course? This action cannot be undone. If the course is permanently closed, it will no longer appear in course searches or student eligibility assessments.
                </p>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
              <div className="font-bold text-stone-900">{courseToDelete.course_name}</div>
              <div className="text-stone-500">
                {universities.find((u) => u.university_id === courseToDelete.university_id)?.name || 'Partner University'} · {courseToDelete.destination_country}
              </div>
              <div className="text-stone-500 font-mono text-[11px]">ID: {courseToDelete.course_id}</div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCourseToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSingleDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm & Delete</span>
              </button>
            </div>
          </div>
        </ViewportOverlay>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <ViewportOverlay onBackdropClick={() => setShowBulkDeleteModal(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900">Bulk Delete Courses</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                    Admin Only
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  You are about to permanently delete <strong className="text-stone-900">{selectedCourseIds.length}</strong> selected courses from the master repository.
                </p>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1">
              {selectedCourseIds.map((id) => {
                const c = courses.find((item) => item.course_id === id);
                return (
                  <div key={id} className="flex items-center justify-between text-stone-700 py-0.5 border-b border-stone-100 last:border-0">
                    <span className="font-medium truncate pr-2">{c?.course_name || id}</span>
                    <span className="text-[10px] text-stone-400 font-mono flex-shrink-0">{id}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete {selectedCourseIds.length} Courses</span>
              </button>
            </div>
          </div>
        </ViewportOverlay>
      )}
    </div>
  );
};
