import React from 'react';
import { generateSampleCsvTemplate } from '../utils/exportUtils';
import { ImportCategory } from '../types';
import {
  DownloadCloud,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Building2,
  BookOpen,
  Globe2,
  FileCheck2,
  Layers,
  GraduationCap,
  Landmark,
} from 'lucide-react';

export const DownloadTemplatesView: React.FC = () => {
  const handleDownload = (category: ImportCategory) => {
    const csvContent = generateSampleCsvTemplate(category);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    let filename = `SWC_Template_${category}.csv`;
    if (category === 'Complete Data Import') {
      filename = 'SWC_Private_Universities_Master_Template.csv';
    } else if (category === 'Public Universities') {
      filename = 'SWC_Public_Universities_No_UniName_Template.csv';
    }
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const templates: {
    category: ImportCategory;
    title: string;
    description: string;
    icon: React.ElementType;
    badgeText?: string;
    isPrimary?: boolean;
    columns: { name: string; required: boolean; example: string }[];
  }[] = [
    {
      category: 'Complete Data Import',
      title: 'Private Universities Master Template (With University Name)',
      description:
        'Standard master spreadsheet for Private & Direct Partner Universities. Includes complete institutional profiles (Name, Campus, Ranking, Contact Emails, Website) alongside courses, fees, and eligibility requirements.',
      icon: Building2,
      badgeText: 'Option A: Private / Direct Universities',
      isPrimary: true,
      columns: [
        { name: 'Course Name', required: true, example: 'MSc Renewable Energy Engineering' },
        { name: 'University Name', required: true, example: 'University of Aberdeen' },
        { name: 'Country', required: true, example: 'United Kingdom' },
        { name: 'City', required: true, example: 'Aberdeen' },
        { name: 'Campus', required: false, example: 'King’s College Campus' },
        { name: 'University Website', required: false, example: 'https://www.abdn.ac.uk' },
        { name: 'University Email', required: false, example: 'admissions@abdn.ac.uk' },
        { name: 'University Ranking', required: false, example: '208' },
        { name: 'Program Level', required: true, example: "Master's (Coursework)" },
        { name: 'Duration', required: true, example: '1' },
        { name: 'Duration Unit', required: true, example: 'Years' },
        { name: 'Tuition Fee', required: true, example: '24800' },
        { name: 'Currency', required: true, example: 'GBP' },
        { name: 'Intake Months', required: true, example: 'September; January' },
        { name: 'Min Qualification', required: true, example: "Bachelor's / Undergraduate" },
        { name: 'Min %', required: true, example: '60' },
        { name: 'Min CGPA', required: false, example: '2.7' },
        { name: 'Study Gap Max (Years)', required: true, example: '5' },
        { name: 'IELTS Overall', required: true, example: '6.5' },
        { name: 'IELTS Min Band', required: true, example: '6.0' },
        { name: 'PTE Min', required: false, example: '60' },
        { name: 'TOEFL Min', required: false, example: '88' },
        { name: 'MOI Accepted', required: true, example: 'Accepted' },
        { name: 'Eligible Nationalities', required: false, example: 'All' },
        { name: 'Scholarship Available', required: false, example: 'Yes' },
        { name: 'Scholarship Detail', required: false, example: '£4,000 Energy Bursary' },
        { name: 'Application Fee', required: false, example: '0' },
        { name: 'Application Deadline', required: false, example: '2026-07-30' },
        { name: 'Visa Processing (Weeks)', required: false, example: '3-4 weeks' },
        { name: 'Post Study Work Visa', required: false, example: 'Graduate Route: 2 Years' },
        { name: 'Required Documents', required: false, example: 'Passport; Degree; Transcript' },
        { name: 'Admissions Notes', required: false, example: 'Engineering background preferred' },
      ],
    },
    {
      category: 'Public Universities',
      title: 'Public Universities Master Template (Without University Name)',
      description:
        'Designed specifically for Public University Systems, State Institutions, and Centralized Portals (e.g. Germany TU9/State, Italy DSU/Universitaly, France EEF, Nordic Tuition-Free/Subsidized quotas). Upload courses, city/system type, and requirements without entering individual university names.',
      icon: Landmark,
      badgeText: 'Option B: Public Universities (No Uni Name)',
      isPrimary: true,
      columns: [
        { name: 'Course Name', required: true, example: 'MSc Automotive Systems & Autonomous Driving' },
        { name: 'Country', required: true, example: 'Germany' },
        { name: 'City', required: true, example: 'Munich' },
        { name: 'Public System / Institution Type', required: false, example: 'State Public University / TU9 System' },
        { name: 'Program Level', required: true, example: "Master's (Coursework)" },
        { name: 'Duration', required: true, example: '2' },
        { name: 'Duration Unit', required: true, example: 'Years' },
        { name: 'Tuition Fee', required: true, example: '0' },
        { name: 'Currency', required: true, example: 'EUR' },
        { name: 'Intake Months', required: true, example: 'October; April' },
        { name: 'Min Qualification', required: true, example: "Bachelor's / Undergraduate" },
        { name: 'Min %', required: true, example: '70' },
        { name: 'Min CGPA', required: false, example: '3.0' },
        { name: 'Study Gap Max (Years)', required: true, example: '3' },
        { name: 'IELTS Overall', required: true, example: '6.5' },
        { name: 'IELTS Min Band', required: true, example: '6.0' },
        { name: 'PTE Min', required: false, example: '62' },
        { name: 'TOEFL Min', required: false, example: '88' },
        { name: 'MOI Accepted', required: true, example: 'Case-by-Case' },
        { name: 'Eligible Nationalities', required: false, example: 'All' },
        { name: 'Scholarship Available', required: false, example: 'Yes' },
        { name: 'Scholarship Detail', required: false, example: 'DAAD Study Scholarship & Baden-Württemberg Waiver' },
        { name: 'Application Fee', required: false, example: '75' },
        { name: 'Application Deadline', required: false, example: '2026-05-15' },
        { name: 'Visa Processing (Weeks)', required: false, example: '8-12 weeks' },
        { name: 'Post Study Work Visa', required: false, example: '18 Months Job-Seeker Permit' },
        { name: 'Required Documents', required: false, example: 'Passport; Degree Certificate; VPD via Uni-Assist' },
        { name: 'Admissions Notes', required: false, example: 'Tuition-free public system. Admin contribution ~€150.' },
      ],
    },
    {
      category: 'Courses',
      title: 'Course Catalog Only Template',
      description:
        'Standard spreadsheet schema for uploading undergraduate and postgraduate programs, tuition structures, intake months, and specific eligibility criteria.',
      icon: BookOpen,
      columns: [
        { name: 'Course Name', required: true, example: 'MSc Data Science & AI' },
        { name: 'University Name', required: true, example: 'University of Aberdeen' },
        { name: 'Country', required: true, example: 'United Kingdom' },
        { name: 'City', required: true, example: 'Aberdeen' },
        { name: 'Program', required: true, example: "Master's (Coursework)" },
        { name: 'Duration', required: true, example: '1' },
        { name: 'Duration Unit', required: true, example: 'Years' },
        { name: 'Tuition Fee', required: true, example: '22500' },
        { name: 'Currency', required: true, example: 'GBP' },
        { name: 'Intake Months', required: true, example: 'September; January' },
        { name: 'Min Qualification', required: true, example: "Bachelor's / Undergraduate" },
        { name: 'Min %', required: true, example: '60' },
        { name: 'Study Gap Max', required: true, example: '5' },
        { name: 'IELTS Overall', required: true, example: '6.5' },
        { name: 'IELTS Min Band', required: true, example: '6.0' },
        { name: 'PTE Min', required: false, example: '60' },
        { name: 'MOI Accepted', required: true, example: 'Accepted' },
        { name: 'Scholarship Available', required: false, example: 'Yes' },
      ],
    },
    {
      category: 'Universities',
      title: 'Partner Universities Master Template',
      description:
        'Institution profiling template including official name, country destination, campuses, contact credentials, world rankings, and institutional overview.',
      icon: Building2,
      columns: [
        { name: 'University Name', required: true, example: 'University of Edinburgh' },
        { name: 'Country', required: true, example: 'United Kingdom' },
        { name: 'City', required: true, example: 'Edinburgh' },
        { name: 'Campus', required: false, example: 'Central Campus' },
        { name: 'Website', required: false, example: 'https://www.ed.ac.uk' },
        { name: 'Email', required: false, example: 'admissions@ed.ac.uk' },
        { name: 'Phone', required: false, example: '+44 131 650 1000' },
        { name: 'Ranking', required: false, example: '22' },
        { name: 'Established', required: false, example: '1583' },
        { name: 'Overview', required: false, example: 'Leading research university.' },
      ],
    },
    {
      category: 'Requirements',
      title: 'Eligibility Matrices & English Tests Template',
      description:
        'Standardized language minimum bands, qualification conversion tables, and MOI waiver rules.',
      icon: FileCheck2,
      columns: [
        { name: 'Requirement Title', required: true, example: 'Standard Postgraduate Band 6.5' },
        { name: 'Target Level', required: true, example: "Master's Degree" },
        { name: 'IELTS Overall', required: true, example: '6.5' },
        { name: 'IELTS Min Band', required: true, example: '6.0' },
        { name: 'PTE Score', required: false, example: '58' },
        { name: 'TOEFL iBT', required: false, example: '85' },
        { name: 'MOI Accepted', required: true, example: 'Accepted' },
        { name: 'Max Study Gap', required: true, example: '5' },
      ],
    },
    {
      category: 'Countries',
      title: 'Countries & Study Destinations Template',
      description:
        'Destination countries master list with standard currency codes, region mappings, and visa processing estimates.',
      icon: Globe2,
      columns: [
        { name: 'Country Name', required: true, example: 'United Kingdom' },
        { name: 'ISO Code', required: true, example: 'GB' },
        { name: 'Region', required: true, example: 'Europe' },
        { name: 'Currency Code', required: true, example: 'GBP' },
        { name: 'Currency Symbol', required: true, example: '£' },
        { name: 'Post-Study Work Visa', required: true, example: '2 Years' },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in text-[#241512]">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#A8382C] text-white">
            Admin Resources
          </span>
          <span className="text-xs text-stone-500 font-medium">
            Section 7.3: Formatted Spreadsheet Templates & Schemas
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-[#7A2820] mt-1">
          Download CSV / Excel Templates
        </h1>
        <p className="text-xs text-stone-500">
          Choose between Private Universities (with full institution profiles) or Public Universities (without university name requirement) for 100% automated parsing.
        </p>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((tpl) => {
          const Icon = tpl.icon;
          return (
            <div
              key={tpl.category}
              className={`p-6 bg-white rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                tpl.isPrimary
                  ? 'border-[#701C18] shadow-md bg-gradient-to-br from-white via-rose-50/20 to-amber-50/20'
                  : 'border-stone-200 shadow-xs hover:border-[#A8382C]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2.5 rounded-xl flex items-center justify-center ${
                        tpl.isPrimary ? 'bg-[#701C18] text-white' : 'bg-[#FBF6F1] text-[#A8382C]'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    {tpl.badgeText && (
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#C9A227] text-stone-950 uppercase tracking-wider">
                        {tpl.badgeText}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700">
                    UTF-8 .CSV
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-bold text-base text-stone-900">
                    {tpl.title}
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed mt-1">
                    {tpl.description}
                  </p>
                </div>

                {/* Column chips preview */}
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                    Columns Included ({tpl.columns.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {tpl.columns.map((col, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${
                          col.required
                            ? 'bg-rose-50 text-[#A8382C] border border-rose-200'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                        title={col.required ? 'Mandatory Column' : 'Optional Column'}
                      >
                        {col.name} {col.required && '*'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-500">
                  * Marked columns are required
                </span>
                <button
                  onClick={() => handleDownload(tpl.category)}
                  className={`px-4 py-2 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors ${
                    tpl.isPrimary
                      ? 'bg-[#701C18] hover:bg-[#88221D] text-white'
                      : 'bg-[#A8382C] hover:bg-[#7A2820] text-white'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Download .CSV</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
