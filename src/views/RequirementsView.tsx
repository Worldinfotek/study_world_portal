import React from 'react';
import { UserAccount } from '../types';
import { exportToCsv, printFormattedReport } from '../utils/exportUtils';
import {
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  Award,
  BookOpen,
  Globe2,
  Info,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';

interface RequirementsViewProps {
  currentUser: UserAccount;
}

export const RequirementsView: React.FC<RequirementsViewProps> = ({ currentUser }) => {
  // English score concordance table
  const languageConcordance = [
    { ielts: '8.0 - 9.0', pte: '86 - 90', toefl: '115 - 120', level: 'Expert (C2)', suitableFor: 'Medical, Law, Research PhD' },
    { ielts: '7.5', pte: '76 - 85', toefl: '102 - 114', level: 'Very Good (C1)', suitableFor: 'Top-tier Master programs, Oxford/Cambridge/Russell Group' },
    { ielts: '7.0', pte: '68 - 75', toefl: '94 - 101', level: 'Good (C1)', suitableFor: 'Standard Master programs, Clinical degrees' },
    { ielts: '6.5', pte: '58 - 67', toefl: '79 - 93', level: 'Competent (B2)', suitableFor: 'General Postgraduate & High-demand Undergraduate' },
    { ielts: '6.0', pte: '50 - 57', toefl: '60 - 78', level: 'Modest (B2)', suitableFor: 'Standard Bachelor / Undergraduate entries' },
    { ielts: '5.5', pte: '42 - 49', toefl: '46 - 59', level: 'Limited (B1)', suitableFor: 'International Foundation & Pre-Masters Programs' },
  ];

  const qualificationHierarchy = [
    { rank: 1, level: 'Secondary / 10th Grade / O-Levels', eligibleFor: 'Foundation / Secondary Pathway' },
    { rank: 2, level: 'High School / A-Levels / Intermediate (12 Years)', eligibleFor: 'Bachelor / Undergraduate, International Year One' },
    { rank: 3, level: 'Diploma / Associate Degree / 14-Yr Pass Bachelor', eligibleFor: 'Top-up Degree (Final Year), Pre-Masters' },
    { rank: 4, level: "Bachelor's / 4-Year Undergraduate Degree", eligibleFor: "Master's (Coursework), Postgrad Diploma" },
    { rank: 5, level: 'Graduate Diploma / Pre-Masters Certificate', eligibleFor: "Direct Entry to Master's Programs" },
    { rank: 6, level: "Master's Degree (MSc / MS / MPhil / MBA)", eligibleFor: 'Doctorate / PhD Programs' },
  ];

  const handleExportCsv = () => {
    const rows = languageConcordance.map((c) => ({
      'IELTS Band': c.ielts,
      'PTE Academic': c.pte,
      'TOEFL iBT': c.toefl,
      'CEFR Level': c.level,
      'Target Programs': c.suitableFor,
    }));
    exportToCsv(`SWC_Language_Concordance_Table_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  const handlePrintPdf = () => {
    const headers = ['IELTS Band', 'PTE Academic', 'TOEFL iBT', 'CEFR Equivalence', 'Target Programs / Suitability'];
    const rows = languageConcordance.map((c) => [
      c.ielts,
      c.pte,
      c.toefl,
      c.level,
      c.suitableFor,
    ]);

    printFormattedReport({
      title: 'Study World Consultant — Language & Academic Equivalence Master',
      subtitle: 'Standardized International Test Concordance and Prior Education Prerequisite Matrix',
      badgeText: 'Equivalence Standards',
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
              Eligibility Standards
            </span>
            <span className="text-xs text-stone-500 font-medium">
              Language Equivalence & Academic Qualification Rank Matrices
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#701C18] mt-1">
            Requirements & Equivalence Master
          </h1>
          <p className="text-xs text-stone-500">
            Official benchmarks for language test conversions, MOI policies, and prerequisite qualification ladders.
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

      {/* English Language Concordance Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs space-y-3 p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-display font-bold text-base text-[#701C18] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#701C18]" />
            English Proficiency Test Concordance Scale
          </h3>
          <span className="text-xs text-stone-500">IELTS · PTE Academic · TOEFL iBT</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#FBF6F1] text-stone-700 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3">IELTS Band</th>
                <th className="p-3">PTE Academic</th>
                <th className="p-3">TOEFL iBT</th>
                <th className="p-3">CEFR Level</th>
                <th className="p-3">Typical Target Program</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {languageConcordance.map((row, idx) => (
                <tr key={idx} className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-[#701C18]">{row.ielts}</td>
                  <td className="p-3 font-semibold text-stone-900">{row.pte}</td>
                  <td className="p-3 font-semibold text-stone-900">{row.toefl}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-[10px]">
                      {row.level}
                    </span>
                  </td>
                  <td className="p-3 text-stone-600">{row.suitableFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Qualification Hierarchy Matrix */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs space-y-3 p-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="font-display font-bold text-base text-[#701C18] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#701C18]" />
            Academic Prerequisite Ladder (Rank 1 to 6)
          </h3>
          <span className="text-xs text-stone-500">Evaluator Algorithm Rank Engine</span>
        </div>

        <div className="overflow-x-auto text-xs">
          <table className="w-full text-left">
            <thead className="bg-[#FBF6F1] text-stone-700 font-bold uppercase text-[10px] tracking-wider border-b border-stone-200">
              <tr>
                <th className="p-3">Rank #</th>
                <th className="p-3">Completed Qualification Level</th>
                <th className="p-3">Direct Admission Eligibility</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-800">
              {qualificationHierarchy.map((row) => (
                <tr key={row.rank} className="hover:bg-stone-50">
                  <td className="p-3 font-bold text-[#701C18]">#{row.rank}</td>
                  <td className="p-3 font-semibold text-stone-900">{row.level}</td>
                  <td className="p-3 text-emerald-800 font-medium">{row.eligibleFor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MOI (Medium of Instruction) Policy Notes */}
      <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs text-amber-900">
        <div className="flex items-center gap-2 font-bold text-sm">
          <Info className="w-4 h-4 text-[#D4AF37]" />
          <span>Medium of Instruction (MOI) Policy Guidelines</span>
        </div>
        <p className="leading-relaxed text-stone-700">
          Certain universities in the United Kingdom, Malaysia, and Europe grant English language test waivers for candidates who completed their previous degree in English. The letter must explicitly confirm that the medium of instruction and examination was 100% English. Candidates must have graduated within 2 to 5 years depending on the institution's CAS/Visa sponsorship policy.
        </p>
      </div>
    </div>
  );
};
