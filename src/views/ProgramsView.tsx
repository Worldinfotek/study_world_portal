import React from 'react';
import { ProgramMaster, UserAccount } from '../types';
import { exportToCsv, printFormattedReport } from '../utils/exportUtils';
import { GraduationCap, Award, BookOpen, Layers, CheckCircle2, Printer, FileSpreadsheet } from 'lucide-react';

interface ProgramsViewProps {
  programs: ProgramMaster[];
  currentUser: UserAccount;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({ programs, currentUser }) => {
  const programRank = (p: ProgramMaster) => p.rank ?? p.rank_level;
  const programDuration = (p: ProgramMaster) => p.typical_duration || p.typical_duration_years || '';

  const handleExportCsv = () => {
    const rows = programs.map((p) => ({
      'Rank': programRank(p),
      'Program Name': p.name,
      'Typical Duration': programDuration(p),
      'Description': p.description,
    }));
    exportToCsv(`SWC_Academic_Programs_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const handlePrintPdf = () => {
    const headers = ['Hierarchy Rank', 'Standardized Degree Level', 'Duration Range', 'Academic Description'];
    const rows = programs.map((p) => [
      `Rank #${programRank(p)}`,
      p.name,
      programDuration(p),
      p.description,
    ]);

    printFormattedReport({
      title: 'Study World Consultant — Academic Programs Master Framework',
      subtitle: 'Standardized 10-Tier Global Higher Education Classification Structure',
      badgeText: 'Academic Framework',
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
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#701C18] text-white">
              Master Standards
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Section 6.D: 10 Fixed Academic Programs
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#701C18] mt-1">
            Academic Programs Master Registry
          </h1>
          <p className="text-xs text-stone-500">
            The 10 standardized award classifications utilized across global admissions and eligibility rank mapping.
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

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-300 font-bold text-stone-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Export to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Program Hierarchy Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {programs.map((prog) => (
          <div
            key={prog.id}
            className="p-5 bg-white rounded-2xl border border-stone-200 shadow-xs flex items-start justify-between gap-4 hover:border-[#701C18] transition-colors"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FBF6F1] text-[#701C18] border border-stone-200">
                  Level Rank: #{prog.rank ?? prog.rank_level}
                </span>
                <span className="text-xs text-stone-500 font-semibold">
                  Typical Duration: {prog.typical_duration || prog.typical_duration_years}
                </span>
              </div>

              <h3 className="font-display font-bold text-base text-stone-900">
                {prog.name}
              </h3>

              <p className="text-xs text-stone-600 leading-relaxed">
                {prog.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 text-[#701C18] flex-shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
