import React, { useState, useMemo } from 'react';
import { University, Course, CountryMaster, UserAccount } from '../types';
import { exportToCsv, printFormattedReport } from '../utils/exportUtils';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  Globe2,
  MapPin,
  GraduationCap,
  Calendar,
  BookOpen,
  Filter,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

interface UniversitiesViewProps {
  universities: University[];
  courses: Course[];
  countries: CountryMaster[];
  currentUser: UserAccount;
  onSelectUniversity: (university: University) => void;
  onAddUniversity: () => void;
  onEditUniversity: (university: University) => void;
  onDeleteUniversity: (universityId: string) => void;
  onDeleteUniversities?: (universityIds: string[]) => void;
}

export const UniversitiesView: React.FC<UniversitiesViewProps> = ({
  universities,
  courses,
  countries,
  currentUser,
  onSelectUniversity,
  onAddUniversity,
  onEditUniversity,
  onDeleteUniversity,
  onDeleteUniversities,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedUniIds, setSelectedUniIds] = useState<string[]>([]);
  const [uniToDelete, setUniToDelete] = useState<University | null>(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  const isAdmin = currentUser.role === 'Admin';

  const filteredUniversities = useMemo(() => {
    return universities.filter((u) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesName = u.name.toLowerCase().includes(q);
        const matchesCity = u.city.toLowerCase().includes(q);
        if (!matchesName && !matchesCity) return false;
      }
      if (selectedCountry !== 'All' && u.country !== selectedCountry) {
        return false;
      }
      if (selectedStatus !== 'All' && u.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [universities, searchQuery, selectedCountry, selectedStatus]);

  const uniqueCountries = useMemo(() => {
    return Array.from(new Set(universities.map((u) => u.country))).sort();
  }, [universities]);

  const toggleSelectUni = (uniId: string) => {
    setSelectedUniIds((prev) =>
      prev.includes(uniId) ? prev.filter((id) => id !== uniId) : [...prev, uniId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUniIds.length === filteredUniversities.length) {
      setSelectedUniIds([]);
    } else {
      setSelectedUniIds(filteredUniversities.map((u) => u.university_id));
    }
  };

  const handleConfirmSingleDelete = () => {
    if (!uniToDelete) return;
    onDeleteUniversity(uniToDelete.university_id);
    setSelectedUniIds((prev) => prev.filter((id) => id !== uniToDelete.university_id));
    setUniToDelete(null);
  };

  const handleConfirmBulkDelete = () => {
    if (selectedUniIds.length === 0) return;
    if (onDeleteUniversities) {
      onDeleteUniversities(selectedUniIds);
    } else {
      selectedUniIds.forEach((id) => onDeleteUniversity(id));
    }
    setSelectedUniIds([]);
    setShowBulkDeleteModal(false);
  };

  const handleExportCsv = () => {
    const rows = filteredUniversities.map((u) => {
      const courseCount = courses.filter((c) => c.university_id === u.university_id).length;
      return {
        'University ID': u.university_id,
        'University Name': u.name,
        'Country': u.country,
        'City': u.city,
        'Global Ranking': u.ranking || 'Unranked',
        'Active Courses': courseCount,
        'Website': u.website,
        'Status': u.status,
      };
    });
    exportToCsv(`SWC_Universities_Directory_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const handlePrintPdf = () => {
    const headers = ['University Name', 'Country & City', 'Global Ranking', 'Linked Courses', 'Status'];
    const rows = filteredUniversities.map((u) => {
      const count = courses.filter((c) => c.university_id === u.university_id).length;
      return [
        u.name,
        `${u.city}, ${u.country}`,
        u.ranking ? `#${u.ranking}` : 'N/A',
        `${count} Programs`,
        u.status,
      ];
    });

    printFormattedReport({
      title: 'Study World Consultant — Partner Universities Directory',
      subtitle: `Official Higher Education Institutional Partners (${filteredUniversities.length} Institutions)`,
      badgeText: 'Universities Roster',
      headers,
      rows,
      currentUser,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#241512]">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[#701C18]">
            Partner Universities Directory
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage international partner institutions, campuses, and official contact credentials
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
              onClick={onAddUniversity}
              className="px-4 py-2 bg-[#701C18] hover:bg-[#4A0E0B] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#D4AF37]" />
              <span>Add University</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search university name, city..."
            className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-[#FBF6F1] focus:bg-white focus:outline-none focus:border-[#A8382C]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-[#A8382C] flex-1 sm:flex-none font-medium"
          >
            <option value="All">All Countries ({uniqueCountries.length})</option>
            {uniqueCountries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:border-[#A8382C] font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Bulk Admin Actions Bar */}
      {isAdmin && selectedUniIds.length > 0 && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-rose-900 font-semibold">
            <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-bold">
              {selectedUniIds.length}
            </span>
            <span>Universit{selectedUniIds.length > 1 ? 'ies' : 'y'} selected for permanent deletion</span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setSelectedUniIds([])}
              className="px-3 py-1.5 bg-white hover:bg-stone-100 text-stone-700 font-medium rounded-xl border border-stone-300 transition-colors"
            >
              Cancel Selection
            </button>
            <button
              onClick={() => setShowBulkDeleteModal(true)}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Permanently ({selectedUniIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* University Cards Grid or Empty State */}
      {filteredUniversities.length === 0 ? (
        <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-amber-50 text-[#7A2820] flex items-center justify-center mx-auto border border-amber-200">
            <Building2 className="w-8 h-8 text-[#A8382C]" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-display font-bold text-lg text-stone-900">
              No Partner Universities Found
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Try adjusting your search terms, country filters, or active status selection.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {(searchQuery || selectedCountry !== 'All' || selectedStatus !== 'All') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCountry('All');
                  setSelectedStatus('All');
                }}
                className="px-4 py-2 text-xs font-bold text-[#7A2820] bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200 transition-colors"
              >
                Reset All Filters
              </button>
            )}
            {isAdmin && (
              <button
                onClick={onAddUniversity}
                className="px-4 py-2 text-xs font-bold text-white bg-[#7A2820] hover:bg-[#A8382C] rounded-xl transition-colors"
              >
                Add New University
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUniversities.map((uni) => {
          const uniCourses = courses.filter((c) => c.university_id === uni.university_id);
          const countryMaster = countries.find((c) => c.name === uni.country);
          const isSelected = selectedUniIds.includes(uni.university_id);

          return (
            <div
              key={uni.university_id}
              className={`card-modern flex flex-col justify-between overflow-hidden group transition-all duration-300 ${
                isSelected
                  ? 'border-rose-400 ring-2 ring-rose-300 bg-rose-50/25 shadow-md'
                  : 'border-stone-200/90 hover:border-[#A8382C]/50 hover:shadow-xl'
              }`}
            >
              <div className="p-6 space-y-4">
                {/* Logo, Checkbox & Ranking */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {isAdmin && (
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectUni(uni.university_id)}
                        className="rounded border-stone-300 text-[#701C18] focus:ring-[#701C18] cursor-pointer mt-0.5"
                        title="Select for bulk action"
                      />
                    )}
                    <img
                      src={uni.logo_url}
                      alt={uni.name}
                      className="w-12 h-12 rounded-2xl object-cover border border-stone-200 bg-[#FBF6F1] shadow-2xs flex-shrink-0 group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <span className="text-xs text-stone-600 font-medium flex items-center gap-1.5">
                        <span>{countryMaster?.flag || '🏛️'}</span>
                        <span>{uni.country}</span>
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-1 ${
                          uni.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {uni.status}
                      </span>
                    </div>
                  </div>

                  {uni.ranking && (
                    <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-50/80 border border-amber-200/70 text-[#7A2820] shadow-2xs">
                      #{uni.ranking} QS
                    </span>
                  )}
                </div>

                {/* University Name */}
                <div>
                  <h3
                    onClick={() => onSelectUniversity(uni)}
                    className="font-display font-bold text-base sm:text-lg text-stone-900 group-hover:text-[#A8382C] transition-colors cursor-pointer line-clamp-2 leading-snug"
                  >
                    {uni.name}
                  </h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-[#A8382C]" />
                    <span>{uni.city}{uni.campus ? ` (${uni.campus})` : ''}</span>
                  </p>
                </div>

                {/* Short Overview */}
                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                  {uni.overview}
                </p>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-stone-100 text-xs">
                  <div className="p-3 rounded-xl bg-stone-50/80 border border-stone-100">
                    <span className="text-[10px] text-stone-500 uppercase block font-bold">
                      Programs
                    </span>
                    <span className="font-bold text-stone-900 text-sm font-display">
                      {uniCourses.length} Courses
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-50/80 border border-stone-100">
                    <span className="text-[10px] text-stone-500 uppercase block font-bold">
                      Established
                    </span>
                    <span className="font-bold text-stone-900 text-sm font-display">
                      {uni.established_year || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-6 py-3.5 bg-stone-50/90 border-t border-stone-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => onSelectUniversity(uni)}
                  className="font-bold text-[#7A2820] hover:text-[#A8382C] flex items-center gap-1.5 transition-colors group/btn py-1"
                >
                  <span>View Details</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                </button>

                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onEditUniversity(uni)}
                      className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/80 rounded-xl transition-all active:scale-95"
                      title="Edit University"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setUniToDelete(uni)}
                      className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-100/80 rounded-xl transition-all active:scale-95"
                      title="Delete University Permanently (Admin Only)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Single University Delete Confirmation Modal */}
      {uniToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
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
                  Are you sure you want to delete this university from the portal? If this institution has closed or terminated operations, deleting it will also remove all its linked courses.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-2">
              <div className="font-bold text-stone-900 text-sm">{uniToDelete.name}</div>
              <div className="text-stone-600">
                {uniToDelete.city}, {uniToDelete.country}
              </div>
              {(() => {
                const count = courses.filter((c) => c.university_id === uniToDelete.university_id).length;
                return (
                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-stone-700">
                    <span>Associated Programs:</span>
                    <strong className="text-rose-700 font-bold">{count} course(s) will be deleted</strong>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setUniToDelete(null)}
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
        </div>
      )}

      {/* Bulk University Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900">Bulk Delete Universities</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 uppercase">
                    Admin Only
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  You are about to permanently delete <strong className="text-stone-900">{selectedUniIds.length}</strong> selected universities and all their linked courses.
                </p>
              </div>
            </div>

            <div className="max-h-40 overflow-y-auto p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
              {selectedUniIds.map((id) => {
                const u = universities.find((item) => item.university_id === id);
                const attachedCount = courses.filter((c) => c.university_id === id).length;
                return (
                  <div key={id} className="flex items-center justify-between text-stone-700 py-0.5 border-b border-stone-100 last:border-0">
                    <span className="font-medium truncate pr-2">{u?.name || id}</span>
                    <span className="text-[11px] text-rose-600 font-semibold flex-shrink-0">{attachedCount} courses</span>
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
                <span>Delete {selectedUniIds.length} Universities</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
