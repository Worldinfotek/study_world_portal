import React, { useState } from 'react';
import {
  University,
  Course,
  CountryMaster,
  ProgramMaster,
  ImportHistoryRecord,
  DuplicateStrategy,
  ImportCategory,
  UserAccount,
} from '../types';
import { exportToCsv, generateSampleCsvTemplate } from '../utils/exportUtils';
import { ALL_COUNTRIES_DATA } from '../data/countriesData';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Download,
  Database,
  Layers,
  Building2,
  BookOpen,
  Globe2,
  FileCheck2,
  FileText,
  Landmark,
} from 'lucide-react';

interface DataUploadViewProps {
  universities: University[];
  courses: Course[];
  countries: CountryMaster[];
  programs: ProgramMaster[];
  currentUser: UserAccount;
  onImportComplete: (
    category: ImportCategory,
    importedData: any,
    historyRecord: ImportHistoryRecord
  ) => void;
  onNavigate: (screen: string) => void;
}

export const DataUploadView: React.FC<DataUploadViewProps> = ({
  universities,
  courses,
  countries,
  programs,
  currentUser,
  onImportComplete,
  onNavigate,
}) => {
  // Wizard Steps: 1: Select File -> 2: Map Columns -> 3: Duplicate Resolution & Validation -> 4: Executing -> 5: Post-import Summary
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form states - Default to Private Universities Master
  const [selectedCategory, setSelectedCategory] = useState<ImportCategory>('Complete Data Import');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [columnHeaders, setColumnHeaders] = useState<string[]>([]);
  const [duplicateStrategy, setDuplicateStrategy] = useState<DuplicateStrategy>('update');

  // Execution & Results
  const [progress, setProgress] = useState(0);
  const [importSummary, setImportSummary] = useState<{
    total: number;
    imported: number;
    skipped: number;
    coursesCreated: number;
    universitiesCreated: number;
    countriesUpdated: number;
    errors: { row: number; reason: string; data: any }[];
  }>({
    total: 0,
    imported: 0,
    skipped: 0,
    coursesCreated: 0,
    universitiesCreated: 0,
    countriesUpdated: 0,
    errors: [],
  });

  // Handle Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  // Download Sample CSV Template directly from Point 1
  const handleDownloadSampleTemplate = (category: ImportCategory = selectedCategory) => {
    const csvContent = generateSampleCsvTemplate(category);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    let downloadName = `SWC_Template_${category}.csv`;
    if (category === 'Complete Data Import') {
      downloadName = 'SWC_Private_Universities_Master_Template.csv';
    } else if (category === 'Public Universities') {
      downloadName = 'SWC_Public_Universities_No_UniName_Template.csv';
    }
    link.setAttribute('download', downloadName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Quick Demo Preload for Testing
  const handlePreloadDemoDataset = (category: ImportCategory) => {
    setSelectedCategory(category);

    if (category === 'Public Universities') {
      setFileName('demo_public_universities_without_uni_name_2026.csv');
      setFileSize('14.2 KB');
      const demoRows = [
        {
          'Course Name': 'MSc Automotive Systems & Autonomous Driving',
          'Country': 'Germany',
          'City': 'Munich',
          'Public System / Institution Type': 'State Public University / TU9 System',
          'Program Level': "Master's (Coursework)",
          'Duration': '2',
          'Duration Unit': 'Years',
          'Tuition Fee': '0',
          'Currency': 'EUR',
          'Intake Months': 'October; April',
          'Min Qualification': "Bachelor's / Undergraduate",
          'Min %': '70',
          'Min CGPA': '3.0',
          'Study Gap Max (Years)': '3',
          'IELTS Overall': '6.5',
          'IELTS Min Band': '6.0',
          'PTE Min': '62',
          'TOEFL Min': '88',
          'MOI Accepted': 'Case-by-Case',
          'Eligible Nationalities': 'All',
          'Scholarship Available': 'Yes',
          'Scholarship Detail': 'DAAD Study Scholarship & Baden-Württemberg Waiver',
          'Application Fee': '75',
          'Application Deadline': '2026-05-15',
          'Visa Processing (Weeks)': '8-12 weeks',
          'Post Study Work Visa': '18 Months Job-Seeker Permit',
          'Required Documents': 'Passport; Degree Certificate; ECTS Transcript; VPD via Uni-Assist; Motivation Letter',
          'Admissions Notes': 'Tuition-free public institution. Semester administrative contribution ~€150 applies.',
        },
        {
          'Course Name': 'Master of Data Intelligence & Decision Science',
          'Country': 'Italy',
          'City': 'Milan',
          'Public System / Institution Type': 'National Public University Network',
          'Program Level': "Master's (Coursework)",
          'Duration': '2',
          'Duration Unit': 'Years',
          'Tuition Fee': '1000',
          'Currency': 'EUR',
          'Intake Months': 'September; February',
          'Min Qualification': "Bachelor's / Undergraduate",
          'Min %': '68',
          'Min CGPA': '2.8',
          'Study Gap Max (Years)': '4',
          'IELTS Overall': '6.5',
          'IELTS Min Band': '6.0',
          'PTE Min': '60',
          'TOEFL Min': '85',
          'MOI Accepted': 'Accepted',
          'Eligible Nationalities': 'All',
          'Scholarship Available': 'Yes',
          'Scholarship Detail': 'DSU Regional Need & Merit-based Grant (Up to €7,000/yr + Free Meals)',
          'Application Fee': '30',
          'Application Deadline': '2026-06-30',
          'Visa Processing (Weeks)': '4-8 weeks',
          'Post Study Work Visa': '1 Year Stay Back Visa',
          'Required Documents': 'Passport; Bachelor Degree; Syllabus/Course Descriptions; Declaration of Value / CIMEA',
          'Admissions Notes': 'Income-based fee sliding scale available via ISEE Parificato calculation.',
        },
        {
          'Course Name': 'Bachelor of International Business & Sustainable Finance',
          'Country': 'France',
          'City': 'Paris / Lyon',
          'Public System / Institution Type': 'Public University System / IAE Network',
          'Program Level': "Bachelor's / Undergraduate",
          'Duration': '3',
          'Duration Unit': 'Years',
          'Tuition Fee': '2770',
          'Currency': 'EUR',
          'Intake Months': 'September',
          'Min Qualification': 'High School / A-Levels / Intermediate',
          'Min %': '72',
          'Min CGPA': '3.0',
          'Study Gap Max (Years)': '2',
          'IELTS Overall': '6.0',
          'IELTS Min Band': '5.5',
          'PTE Min': '56',
          'TOEFL Min': '80',
          'MOI Accepted': 'Accepted',
          'Eligible Nationalities': 'All',
          'Scholarship Available': 'Yes',
          'Scholarship Detail': 'Eiffel Excellence Scholarship / France Excellence Bourse',
          'Application Fee': '50',
          'Application Deadline': '2026-03-31',
          'Visa Processing (Weeks)': '3-6 weeks',
          'Post Study Work Visa': 'APS / 1-2 Year Post Study Permit',
          'Required Documents': 'Passport; High School Marksheet; EEF / Études en France Dossier',
          'Admissions Notes': 'Subsidized differentiated national public fees apply for non-EU students.',
        },
      ];
      setParsedRows(demoRows);
      setColumnHeaders(Object.keys(demoRows[0]));
      setCurrentStep(2);
      return;
    }

    if (category === 'Complete Data Import' || category === 'Courses') {
      setFileName('demo_private_universities_master_2026.csv');
      setFileSize('18.6 KB');
      const demoRows = [
        {
          'Course Name': 'MSc Renewable Energy Engineering',
          'University Name': 'University of Aberdeen',
          'Country': 'United Kingdom',
          'City': 'Aberdeen',
          'Campus': 'King’s College Campus',
          'University Website': 'https://www.abdn.ac.uk',
          'University Email': 'admissions@abdn.ac.uk',
          'University Ranking': '208',
          'Program Level': "Master's (Coursework)",
          'Duration': '1',
          'Duration Unit': 'Years',
          'Tuition Fee': '24800',
          'Currency': 'GBP',
          'Intake Months': 'September; January',
          'Min Qualification': "Bachelor's / Undergraduate",
          'Min %': '60',
          'Min CGPA': '2.7',
          'Study Gap Max (Years)': '5',
          'IELTS Overall': '6.5',
          'IELTS Min Band': '6.0',
          'PTE Min': '60',
          'TOEFL Min': '88',
          'MOI Accepted': 'Accepted',
          'Eligible Nationalities': 'All',
          'Scholarship Available': 'Yes',
          'Scholarship Detail': '£4,000 Energy Transition Merit Bursary',
          'Application Fee': '0',
          'Application Deadline': '2026-07-30',
          'Visa Processing (Weeks)': '3-4 weeks',
          'Post Study Work Visa': 'Graduate Route: 2 Years',
          'Required Documents': 'Passport; Degree Certificate; Academic Transcript; Statement of Purpose',
          'Admissions Notes': 'Engineering background with strong quantitative grades preferred',
        },
        {
          'Course Name': 'Bachelor of Artificial Intelligence & Robotics',
          'University Name': 'University of New South Wales (UNSW)',
          'Country': 'Australia',
          'City': 'Sydney',
          'Campus': 'Kensington Campus',
          'University Website': 'https://www.unsw.edu.au',
          'University Email': 'international@unsw.edu.au',
          'University Ranking': '19',
          'Program Level': "Bachelor's / Undergraduate",
          'Duration': '3',
          'Duration Unit': 'Years',
          'Tuition Fee': '49500',
          'Currency': 'AUD',
          'Intake Months': 'February; September',
          'Min Qualification': 'High School / A-Levels / Intermediate',
          'Min %': '75',
          'Min CGPA': '3.2',
          'Study Gap Max (Years)': '2',
          'IELTS Overall': '6.5',
          'IELTS Min Band': '6.0',
          'PTE Min': '64',
          'TOEFL Min': '90',
          'MOI Accepted': 'Case-by-Case',
          'Eligible Nationalities': 'All',
          'Scholarship Available': 'Yes',
          'Scholarship Detail': 'International Scientia Award (AUD 10,000)',
          'Application Fee': '125',
          'Application Deadline': '2026-11-30',
          'Visa Processing (Weeks)': '4-8 weeks',
          'Post Study Work Visa': 'Subclass 485: 2-3 Years',
          'Required Documents': 'Passport; High School Marksheets; English Test Certificate',
          'Admissions Notes': 'Mathematics prerequisite score above 70% required',
        },
        {
          'Course Name': 'Master of Management Analytics',
          'University Name': 'University of Toronto',
          'Country': 'Canada',
          'City': 'Toronto',
          'Campus': 'St. George Campus',
          'University Website': 'https://www.utoronto.ca',
          'University Email': 'admissions.rotman@utoronto.ca',
          'University Ranking': '21',
          'Program Level': "Master's (Coursework)",
          'Duration': '1',
          'Duration Unit': 'Years',
          'Tuition Fee': '68000',
          'Currency': 'CAD',
          'Intake Months': 'August',
          'Min Qualification': "Bachelor's / Undergraduate",
          'Min %': '78',
          'Min CGPA': '3.3',
          'Study Gap Max (Years)': '4',
          'IELTS Overall': '7.0',
          'IELTS Min Band': '6.5',
          'PTE Min': '68',
          'TOEFL Min': '100',
          'MOI Accepted': 'Not Accepted',
          'Eligible Nationalities': 'All',
          'Scholarship Available': 'No',
          'Scholarship Detail': '',
          'Application Fee': '200',
          'Application Deadline': '2026-04-15',
          'Visa Processing (Weeks)': '6-12 weeks',
          'Post Study Work Visa': 'PGWP: up to 3 years',
          'Required Documents': 'Passport; Official Transcripts; 2 Reference Letters; Resume; Video Essay',
          'Admissions Notes': 'Calculus and Linear Algebra coursework mandatory',
        },
      ];
      setParsedRows(demoRows);
      setColumnHeaders(Object.keys(demoRows[0]));
      setCurrentStep(2);
    } else if (category === 'Universities') {
      setFileName('demo_batch_universities_2026.csv');
      setFileSize('9.4 KB');
      const demoRows = [
        {
          'University Name': 'University of Edinburgh',
          'Country': 'United Kingdom',
          'City': 'Edinburgh',
          'Campus': 'Central Campus',
          'Website': 'https://www.ed.ac.uk',
          'Email': 'admissions@ed.ac.uk',
          'Phone': '+44 131 650 1000',
          'Ranking': '22',
          'Established': '1583',
          'Overview': 'One of the world top research universities, located in the historic capital of Scotland.',
        },
        {
          'University Name': 'University of Melbourne',
          'Country': 'Australia',
          'City': 'Melbourne',
          'Campus': 'Parkville',
          'Website': 'https://www.unimelb.edu.au',
          'Email': 'international@unimelb.edu.au',
          'Phone': '+61 3 9035 5511',
          'Ranking': '14',
          'Established': '1853',
          'Overview': 'Australia leading research university with comprehensive academic offerings.',
        },
      ];
      setParsedRows(demoRows);
      setColumnHeaders(Object.keys(demoRows[0]));
      setCurrentStep(2);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(`${(selectedFile.size / 1024).toFixed(1)} KB`);

    // Parse CSV or Text File with clean quotation support
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) return;

      // Robust CSV Line parser respecting quotes
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let curVal = '';
        let insideQuote = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            if (insideQuote && line[i + 1] === '"') {
              curVal += '"';
              i++;
            } else {
              insideQuote = !insideQuote;
            }
          } else if (char === ',' && !insideQuote) {
            result.push(curVal.trim());
            curVal = '';
          } else {
            curVal += char;
          }
        }
        result.push(curVal.trim());
        return result;
      };

      // Extract CSV headers
      const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, ''));
      setColumnHeaders(headers);

      // Parse data rows
      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]).map((v) => v.replace(/^"|"$/g, ''));
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = values[idx] !== undefined ? values[idx] : '';
        });
        rows.push(rowObj);
      }

      setParsedRows(rows);
      setCurrentStep(2);
    };

    reader.readAsText(selectedFile);
  };

  // Execution step
  const handleExecuteImport = () => {
    setCurrentStep(4);
    setProgress(10);

    let curProgress = 10;
    const timer = setInterval(() => {
      curProgress += 25;
      if (curProgress >= 100) {
        clearInterval(timer);
        setProgress(100);
        // Execute finishImport in next tick outside React render/state updater pipeline
        setTimeout(() => {
          finishImport();
        }, 50);
      } else {
        setProgress(curProgress);
      }
    }, 200);
  };

  const finishImport = () => {
    const errors: { row: number; reason: string; data: any }[] = [];
    const newCourses: Course[] = [];
    const newUniversitiesMap = new Map<string, University>();
    const newCountriesMap = new Map<string, CountryMaster>();

    if (
      selectedCategory === 'Complete Data Import' ||
      selectedCategory === 'Public Universities' ||
      selectedCategory === 'Courses'
    ) {
      parsedRows.forEach((row, idx) => {
        const courseName = row['Course Name'] || row['course_name'] || row['Course'];
        const countryName = row['Country'] || row['country'] || (selectedCategory === 'Public Universities' ? 'Germany' : 'United Kingdom');
        const cityName = row['City'] || row['city'] || 'Main City';

        // In Public Universities upload: University Name is OPTIONAL and defaults to the public state system
        let uniName = row['University Name'] || row['university_name'] || row['University'];
        
        if (!uniName && selectedCategory === 'Public Universities') {
          const publicSystemType = row['Public System / Institution Type'] || row['Public System'] || row['Institution Type'];
          if (publicSystemType) {
            uniName = `${publicSystemType} (${countryName})`;
          } else if (cityName && cityName !== 'Main City') {
            uniName = `Public Universities of ${cityName} (${countryName})`;
          } else {
            uniName = `Public Universities System (${countryName})`;
          }
        } else if (!uniName) {
          uniName = 'Partner University';
        }

        if (!courseName) {
          errors.push({ row: idx + 1, reason: 'Missing Course Name', data: row });
          return;
        }

        // Find existing or create/update university
        let matchedUni = universities.find(
          (u) => u.name.toLowerCase().trim() === uniName.toLowerCase().trim()
        );

        if (!matchedUni) {
          const uniId = `uni_${uniName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
          const isPublic = selectedCategory === 'Public Universities' || uniName.toLowerCase().includes('public');
          const createdUni: University = {
            university_id: uniId,
            name: uniName,
            country: countryName,
            city: cityName,
            campus: row['Campus'] || row['campus'] || (isPublic ? 'Public Multi-campus' : 'Main Campus'),
            website: row['University Website'] || row['website'] || `https://www.${uniName.toLowerCase().replace(/[^a-z0-9]/g, '')}.edu`,
            logo_url: isPublic
              ? 'https://images.unsplash.com/photo-1562774053-701939374585?w=160'
              : 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160',
            contact_info: {
              email: row['University Email'] || row['email'] || (isPublic ? 'public.admissions@highered.gov' : 'admissions@studyworld.ac'),
              phone: row['University Phone'] || row['phone'] || '+44 20 7946 0991',
            },
            status: 'Active',
            ranking: parseInt(row['University Ranking'] || row['ranking'] || (isPublic ? '150' : '250'), 10) || 200,
            established_year: parseInt(row['Established'] || '1950', 10) || 1950,
            overview:
              row['Overview'] ||
              (isPublic
                ? `Public state-funded higher education system in ${countryName} with subsidized tuition and quota-based merit admissions.`
                : `${uniName} is an accredited international higher education partner institution.`),
            date_added: new Date().toISOString().split('T')[0],
            last_updated: new Date().toISOString().split('T')[0],
          };
          newUniversitiesMap.set(uniName.toLowerCase().trim(), createdUni);
          matchedUni = createdUni;
        }

        // Check and register country if not already known
        const countryObj = ALL_COUNTRIES_DATA.find(
          (c) => c.name.toLowerCase() === countryName.toLowerCase() || c.code.toLowerCase() === countryName.toLowerCase()
        );
        const countryCode = countryObj ? countryObj.code : countryName.slice(0, 2).toUpperCase();
        const countryFlag = countryObj ? countryObj.flag : '🌍';
        const currencyCode = row['Currency'] || (countryObj ? countryObj.currency : (selectedCategory === 'Public Universities' ? 'EUR' : 'GBP'));

        if (!countries.some((c) => c.code.toLowerCase() === countryCode.toLowerCase())) {
          newCountriesMap.set(countryCode, {
            code: countryCode,
            name: countryName,
            flag: countryFlag,
            currency: currencyCode,
            currency_symbol: countryObj ? countryObj.currency_symbol : '€',
            visa_processing_weeks: row['Visa Processing (Weeks)'] || '4-8 weeks',
            post_study_work_visa: row['Post Study Work Visa'] || 'Up to 1.5 - 2 Years',
            financial_requirement_notes: 'Standard blocked account / financial proof requirement',
            is_active: true,
          });
        }

        const duration = parseInt(row['Duration'] || '1', 10) || 1;
        let bucket: any = '1-2';
        if (duration <= 1) bucket = '0-1';
        else if (duration <= 2) bucket = '1-2';
        else if (duration <= 3) bucket = '2-3';
        else if (duration <= 4) bucket = '3-4';
        else bucket = '4+';

        const rawIntakes = row['Intake Months'] || row['intake_months'] || (selectedCategory === 'Public Universities' ? 'October; April' : 'September; January');
        const intakeMonths = rawIntakes
          .split(/[;,/]/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);

        const rawDocs = row['Required Documents'] || row['required_documents'] || 'Passport; Degree Certificate; Academic Transcript';
        const requiredDocs = rawDocs
          .split(/[;,]/)
          .map((s: string) => s.trim())
          .filter((s: string) => s.length > 0);

        const tuitionVal = parseFloat(row['Tuition Fee'] || row['tuition_fee'] || (selectedCategory === 'Public Universities' ? '0' : '18000'));
        const isScholarship =
          (row['Scholarship Available'] || row['scholarship_available'] || 'No').toLowerCase() === 'yes' ||
          (row['Scholarship Available'] || '').toLowerCase() === 'true';

        const newCourse: Course = {
          course_id: `course_import_${Date.now()}_${idx}`,
          university_id: matchedUni.university_id,
          course_name: courseName,
          program: row['Program Level'] || row['Program'] || row['program'] || "Master's (Coursework)",
          duration,
          duration_unit: (row['Duration Unit'] || 'Years').toLowerCase() === 'months' ? 'months' : 'years',
          duration_bucket: bucket,
          destination_country: countryName,
          city: cityName,
          tuition_fee: isNaN(tuitionVal) ? 0 : tuitionVal,
          currency: currencyCode,
          application_fee: parseFloat(row['Application Fee'] || row['application_fee'] || '0') || 0,
          intake_months: intakeMonths.length > 0 ? intakeMonths : ['September', 'October'],
          intake_years: [2026, 2027],
          study_mode: 'On-campus',
          scholarship_available: isScholarship,
          scholarship_detail: row['Scholarship Detail'] || row['scholarship_detail'] || undefined,
          application_deadline: row['Application Deadline'] || row['Deadline'] || '2026-08-30',
          status: 'Active',
          eligibility: {
            course_id: `crs_import_${Date.now()}_${idx}`,
            eligible_nationalities: row['Eligible Nationalities'] ? [row['Eligible Nationalities']] : ['All'],
            restricted_nationalities: [],
            minimum_qualification: row['Min Qualification'] || row['min_qualification'] || "Bachelor's / Undergraduate",
            minimum_qualification_rank: (row['Program Level'] || '').includes('Master') ? 4 : 2,
            minimum_percentage: parseFloat(row['Min %'] || row['min_percentage'] || '60') || 60,
            minimum_cgpa: parseFloat(row['Min CGPA'] || row['min_cgpa'] || '2.6') || 2.6,
            study_gap_allowed_years: parseInt(row['Study Gap Max (Years)'] || row['Study Gap Max'] || row['study_gap_max'] || '5', 10) || 5,
            age_requirement_min: 18,
            minimum_age: 18,
            ielts_overall: parseFloat(row['IELTS Overall'] || row['ielts_overall'] || '6.5') || 6.5,
            ielts_min_band: parseFloat(row['IELTS Min Band'] || row['ielts_min_band'] || '6.0') || 6.0,
            pte_min: parseFloat(row['PTE Min'] || row['pte_min'] || '60') || 60,
            toefl_min: parseFloat(row['TOEFL Min'] || row['toefl_min'] || '80') || 80,
            moi_acceptance: (row['MOI Accepted'] || row['moi_accepted'] || 'Accepted') as any,
            required_documents: requiredDocs,
            additional_admission_conditions: selectedCategory === 'Public Universities' ? 'Public state admissions verification' : 'Standard admission credentials verification',
            important_notes: row['Admissions Notes'] || (selectedCategory === 'Public Universities' ? 'Public University System stream' : 'Uploaded via bulk synchronization wizard'),
          },
          date_added: new Date().toISOString().split('T')[0],
          last_updated: new Date().toISOString().split('T')[0],
        };

        newCourses.push(newCourse);
      });
    } else if (selectedCategory === 'Universities') {
      parsedRows.forEach((row, idx) => {
        const uniName = row['University Name'] || row['name'];
        if (!uniName) {
          errors.push({ row: idx + 1, reason: 'Missing university name', data: row });
          return;
        }

        const newUni: University = {
          university_id: `uni_import_${Date.now()}_${idx}`,
          name: uniName,
          country: row['Country'] || 'United Kingdom',
          city: row['City'] || 'London',
          campus: row['Campus'] || 'Main Campus',
          website: row['Website'] || 'https://www.ac.uk',
          logo_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=160',
          contact_info: {
            email: row['Email'] || 'admissions@studyworld.ac.uk',
            phone: row['Phone'] || '+44 20 7946 0991',
          },
          status: 'Active',
          ranking: parseInt(row['Ranking'] || '250', 10) || 250,
          established_year: parseInt(row['Established'] || '1900', 10) || 1900,
          overview: row['Overview'] || 'Global partner institution.',
          date_added: new Date().toISOString().split('T')[0],
          last_updated: new Date().toISOString().split('T')[0],
        };

        newUniversitiesMap.set(uniName.toLowerCase().trim(), newUni);
      });
    }

    const successfulCount = newCourses.length || Array.from(newUniversitiesMap.values()).length;
    const skippedCount = errors.length;

    const historyRecord: ImportHistoryRecord = {
      id: `imp_${Date.now()}`,
      file_name: fileName || `dataset_${selectedCategory.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`,
      category: selectedCategory,
      imported_by: currentUser.name,
      timestamp: Date.now(),
      total_rows: parsedRows.length,
      imported: successfulCount,
      skipped: skippedCount,
      status: skippedCount === 0 ? 'Completed' : 'Completed with Errors',
      errors: errors.map((e) => `Row ${e.row}: ${e.reason}`),
    };

    setImportSummary({
      total: parsedRows.length,
      imported: successfulCount,
      skipped: skippedCount,
      coursesCreated: newCourses.length,
      universitiesCreated: newUniversitiesMap.size,
      countriesUpdated: newCountriesMap.size,
      errors,
    });

    if (selectedCategory === 'Complete Data Import' || selectedCategory === 'Public Universities') {
      onImportComplete(
        selectedCategory,
        {
          courses: newCourses,
          universities: Array.from(newUniversitiesMap.values()),
          countries: Array.from(newCountriesMap.values()),
        },
        historyRecord
      );
    } else if (selectedCategory === 'Courses') {
      onImportComplete('Courses', newCourses, historyRecord);
    } else if (selectedCategory === 'Universities') {
      onImportComplete('Universities', Array.from(newUniversitiesMap.values()), historyRecord);
    }

    setCurrentStep(5);
  };

  const handleDownloadErrorCsv = () => {
    if (importSummary.errors.length === 0) return;
    const errorRows = importSummary.errors.map((e) => ({
      'Row Number': e.row,
      'Error Reason': e.reason,
      ...e.data,
    }));
    exportToCsv(`Import_Errors_${fileName || 'dataset'}.csv`, errorRows);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#241512]">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#A8382C] text-white">
            Admin Suite
          </span>
          <span className="text-xs text-stone-500 font-medium">
            Section 7: Unified Multi-Entity Ingestion & Synchronization Pipeline
          </span>
        </div>
        <h1 className="text-2xl font-display font-bold text-[#7A2820] mt-1">
          Data Upload & Synchronization
        </h1>
        <p className="text-xs text-stone-500">
          Upload spreadsheets (.CSV / Excel) for Private Universities (with full institution profiles) or Public Universities (without university name required).
        </p>
      </div>

      {/* Pipeline Stepper Indicator */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between max-w-3xl mx-auto text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                currentStep >= 1 ? 'bg-[#A8382C] text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              1
            </span>
            <span className="font-bold hidden sm:inline text-stone-800">File & Schema</span>
          </div>

          <div className="w-12 h-0.5 bg-stone-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                currentStep >= 2 ? 'bg-[#A8382C] text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              2
            </span>
            <span className="font-bold hidden sm:inline text-stone-800">Column Mapping</span>
          </div>

          <div className="w-12 h-0.5 bg-stone-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                currentStep >= 3 ? 'bg-[#A8382C] text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              3
            </span>
            <span className="font-bold hidden sm:inline text-stone-800">Duplicates & Review</span>
          </div>

          <div className="w-12 h-0.5 bg-stone-200" />

          <div className="flex items-center gap-2">
            <span
              className={`w-7 h-7 rounded-full font-bold flex items-center justify-center text-xs ${
                currentStep >= 5 ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-500'
              }`}
            >
              ✓
            </span>
            <span className="font-bold hidden sm:inline text-stone-800">Commit Result</span>
          </div>
        </div>
      </div>

      {/* Step 1: Select Category & Drop File */}
      {currentStep === 1 && (
        <div className="space-y-6">
          {/* Point 1: Two Primary Master Options */}
          <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-base text-[#7A2820] flex items-center gap-2">
                  <span>1. Select Data Destination Schema</span>
                  <span className="text-[11px] font-normal text-stone-500">
                    (Private vs Public Universities Workflow)
                  </span>
                </h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Choose <strong>Private Universities</strong> (includes university name/profiles) or <strong>Public Universities</strong> (without university name requirement).
                </p>
              </div>

              {/* Instant CSV Template Download Button for chosen option */}
              <button
                onClick={() => handleDownloadSampleTemplate(selectedCategory)}
                className="px-3.5 py-2 bg-[#701C18] hover:bg-[#88221D] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
                title="Download formatted sample CSV template with instructions"
              >
                <Download className="w-4 h-4 text-[#C9A227]" />
                <span>
                  Download Template: {selectedCategory === 'Public Universities' ? 'Public Universities (No Uni Name)' : 'Private Universities'}
                </span>
              </button>
            </div>

            {/* TWO PRIMARY DEDICATED OPTIONS: Private vs Public */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* OPTION 1: PRIVATE UNIVERSITIES */}
              <button
                type="button"
                onClick={() => setSelectedCategory('Complete Data Import')}
                className={`p-5 rounded-2xl border text-left font-bold transition-all relative overflow-hidden flex flex-col justify-between ${
                  selectedCategory === 'Complete Data Import'
                    ? 'bg-[#701C18] text-white border-[#701C18] shadow-md ring-2 ring-[#C9A227]/40'
                    : 'bg-stone-50/80 text-stone-900 border-stone-200 hover:border-[#A8382C]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2.5 rounded-xl ${
                          selectedCategory === 'Complete Data Import' ? 'bg-white/20 text-[#C9A227]' : 'bg-[#A8382C] text-white'
                        }`}
                      >
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm">Option A: Private Universities Master</span>
                        </div>
                        <span
                          className={`text-[11px] block mt-0.5 font-semibold ${
                            selectedCategory === 'Complete Data Import' ? 'text-rose-100' : 'text-stone-600'
                          }`}
                        >
                          With University Name & Institutional Profile
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        selectedCategory === 'Complete Data Import'
                          ? 'bg-[#C9A227] text-stone-950'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      Private / Direct
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-3 leading-relaxed font-normal ${
                      selectedCategory === 'Complete Data Import' ? 'text-white/90' : 'text-stone-500'
                    }`}
                  >
                    Upload complete spreadsheets containing <strong>University Names, Campuses, Websites, Ranking, Emails</strong> alongside Course names, tuition fees, and admission criteria.
                  </p>
                </div>
                <div
                  className={`mt-3 pt-2.5 border-t text-[10px] flex items-center justify-between font-medium ${
                    selectedCategory === 'Complete Data Import' ? 'border-white/20 text-rose-100' : 'border-stone-200 text-stone-500'
                  }`}
                >
                  <span>Key Column: <strong>University Name (Mandatory)</strong></span>
                  <span>32 Columns Spec</span>
                </div>
              </button>

              {/* OPTION 2: PUBLIC UNIVERSITIES (WITHOUT UNIVERSITY NAME) */}
              <button
                type="button"
                onClick={() => setSelectedCategory('Public Universities')}
                className={`p-5 rounded-2xl border text-left font-bold transition-all relative overflow-hidden flex flex-col justify-between ${
                  selectedCategory === 'Public Universities'
                    ? 'bg-[#701C18] text-white border-[#701C18] shadow-md ring-2 ring-[#C9A227]/40'
                    : 'bg-stone-50/80 text-stone-900 border-stone-200 hover:border-[#A8382C]'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-2.5 rounded-xl ${
                          selectedCategory === 'Public Universities' ? 'bg-white/20 text-[#C9A227]' : 'bg-[#A8382C] text-white'
                        }`}
                      >
                        <Landmark className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm">Option B: Public Universities Master</span>
                        </div>
                        <span
                          className={`text-[11px] block mt-0.5 font-semibold ${
                            selectedCategory === 'Public Universities' ? 'text-rose-100' : 'text-stone-600'
                          }`}
                        >
                          Without University Name (Country & System Centric)
                        </span>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                        selectedCategory === 'Public Universities'
                          ? 'bg-[#C9A227] text-stone-950'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      No Uni Name Required
                    </span>
                  </div>
                  <p
                    className={`text-[11px] mt-3 leading-relaxed font-normal ${
                      selectedCategory === 'Public Universities' ? 'text-white/90' : 'text-stone-500'
                    }`}
                  >
                    Designed for <strong>Public Universities, State Quotas, Tuition-Free & Centralized Portals</strong> (Germany, Italy, France, Nordics). Upload courses and requirements directly by Country & City without typing university names.
                  </p>
                </div>
                <div
                  className={`mt-3 pt-2.5 border-t text-[10px] flex items-center justify-between font-medium ${
                    selectedCategory === 'Public Universities' ? 'border-white/20 text-rose-100' : 'border-stone-200 text-stone-500'
                  }`}
                >
                  <span>Key Columns: <strong>Country, Course Name, Criteria</strong></span>
                  <span>28 Columns Spec</span>
                </div>
              </button>
            </div>

            {/* Individual Datasets Sub-section */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2">
                Or Upload Specific Single-Entity Datasets:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Courses')}
                  className={`p-3 rounded-xl border text-left font-bold transition-all ${
                    selectedCategory === 'Courses'
                      ? 'bg-[#A8382C] text-white border-[#A8382C] shadow-sm'
                      : 'bg-[#FBF6F1] text-stone-800 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mb-1.5 opacity-80" />
                  <span>Course Catalog Only</span>
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Programs & tuition only</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('Universities')}
                  className={`p-3 rounded-xl border text-left font-bold transition-all ${
                    selectedCategory === 'Universities'
                      ? 'bg-[#A8382C] text-white border-[#A8382C] shadow-sm'
                      : 'bg-[#FBF6F1] text-stone-800 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1.5 opacity-80" />
                  <span>Universities Directory Only</span>
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Campuses & credentials</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('Countries')}
                  className={`p-3 rounded-xl border text-left font-bold transition-all ${
                    selectedCategory === 'Countries'
                      ? 'bg-[#A8382C] text-white border-[#A8382C] shadow-sm'
                      : 'bg-[#FBF6F1] text-stone-800 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <Globe2 className="w-4 h-4 mb-1.5 opacity-80" />
                  <span>Countries Master Only</span>
                  <span className="block text-[10px] font-normal opacity-80 mt-0.5">Currencies & visa rules</span>
                </button>
              </div>
            </div>

            {/* Template Active Bar */}
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-[#A8382C] flex-shrink-0" />
                <span className="text-stone-700">
                  Active Template File:{' '}
                  <strong className="text-stone-900">
                    {selectedCategory === 'Complete Data Import'
                      ? 'SWC_Private_Universities_Master_Template.csv (With University Name)'
                      : selectedCategory === 'Public Universities'
                      ? 'SWC_Public_Universities_No_UniName_Template.csv (Without University Name)'
                      : `SWC_Template_${selectedCategory}.csv`}
                  </strong>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadSampleTemplate(selectedCategory)}
                  className="text-xs font-bold text-[#A8382C] hover:text-[#7A2820] flex items-center gap-1 underline underline-offset-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .CSV</span>
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={() => onNavigate('download_templates')}
                  className="text-xs font-semibold text-stone-600 hover:text-stone-900"
                >
                  View All Specs
                </button>
              </div>
            </div>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="p-10 border-2 border-dashed border-stone-300 hover:border-[#A8382C] bg-white rounded-2xl text-center space-y-4 transition-colors cursor-pointer"
            onClick={() => document.getElementById('csvFileInput')?.click()}
          >
            <input
              type="file"
              id="csvFileInput"
              accept=".csv,.txt,.xls,.xlsx"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-full bg-[#FBF6F1] text-[#A8382C] flex items-center justify-center mx-auto shadow-xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-stone-900">
                Drop your {selectedCategory === 'Public Universities' ? 'Public Universities' : 'Private Universities'} CSV or Excel file here, or browse
              </h3>
              <p className="text-xs text-stone-500 mt-1">
                Supports .CSV, .XLS, .XLSX up to 25MB · Unicode UTF-8 recommended
              </p>
            </div>
          </div>

          {/* Quick Preload Demo Dataset for Instant Verification */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[#C9A227] flex-shrink-0" />
              <div>
                <strong className="text-stone-900 block font-bold">
                  Prototype Fast-Test: Preload Sample Dataset
                </strong>
                <span className="text-stone-600">
                  Simulate importing Private Universities (with profiles) or Public Universities (without university name).
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePreloadDemoDataset('Complete Data Import')}
                className="px-3.5 py-1.5 bg-[#701C18] text-white font-bold rounded-lg hover:bg-[#88221D] shadow-xs flex items-center gap-1.5"
              >
                <Building2 className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Preload Private Unis</span>
              </button>
              <button
                type="button"
                onClick={() => handlePreloadDemoDataset('Public Universities')}
                className="px-3.5 py-1.5 bg-emerald-800 text-white font-bold rounded-lg hover:bg-emerald-900 shadow-xs flex items-center gap-1.5"
              >
                <Landmark className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Preload Public Unis (No Uni Name)</span>
              </button>
              <button
                type="button"
                onClick={() => handlePreloadDemoDataset('Courses')}
                className="px-3 py-1.5 bg-white text-stone-800 border border-stone-300 font-bold rounded-lg hover:bg-stone-100 shadow-xs"
              >
                Courses Batch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Pre-upload Analysis & Column Mapping */}
      {currentStep === 2 && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div>
              <h2 className="font-display font-bold text-base text-[#7A2820]">
                2. Verify Header Column Mappings
              </h2>
              <p className="text-xs text-stone-500">
                Source File: <strong>{fileName}</strong> ({fileSize}) · {parsedRows.length} Rows Detected · Mode:{' '}
                <strong>
                  {selectedCategory === 'Public Universities' ? 'Public Universities (No University Name Required)' : selectedCategory}
                </strong>
              </p>
            </div>
            <button
              onClick={() => setCurrentStep(1)}
              className="text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              Change File / Mode
            </button>
          </div>

          {/* Mapping Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs max-h-96 overflow-y-auto pr-1">
            {columnHeaders.map((header, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#FBF6F1] border border-stone-200 space-y-1">
                <span className="text-[10px] text-stone-500 uppercase font-semibold block">
                  File Column #{idx + 1}
                </span>
                <p className="font-bold text-stone-900 truncate">{header}</p>
                <div className="flex items-center gap-1.5 text-emerald-700 text-[11px] pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Auto-mapped to Schema</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2 text-xs font-bold text-white bg-[#A8382C] hover:bg-[#7A2820] rounded-xl shadow-xs flex items-center gap-2"
            >
              <span>Continue to Duplicates & Review</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Duplicate Handling & Data Preview */}
      {currentStep === 3 && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div>
            <h2 className="font-display font-bold text-base text-[#7A2820]">
              3. Duplicate Resolution & Pre-import Preview
            </h2>
            <p className="text-xs text-stone-500">
              Select how matching records should be merged into your live system catalog
            </p>
          </div>

          {/* Duplicate Strategy Radio Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {[
              {
                strategy: 'update',
                title: 'Update / Overwrite Existing',
                desc: 'Updates matched records with new values from this sheet while preserving identifiers.',
              },
              {
                strategy: 'skip',
                title: 'Skip Duplicates',
                desc: 'Leaves existing catalog records untouched and only creates new items.',
              },
              {
                strategy: 'create_new',
                title: 'Create New Copy',
                desc: 'Always assigns new unique record IDs for each row in the spreadsheet.',
              },
            ].map((opt) => (
              <label
                key={opt.strategy}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  duplicateStrategy === opt.strategy
                    ? 'border-[#A8382C] bg-rose-50/50 shadow-xs'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="duplicateStrategy"
                    value={opt.strategy}
                    checked={duplicateStrategy === opt.strategy}
                    onChange={() => setDuplicateStrategy(opt.strategy as any)}
                    className="w-4 h-4 accent-[#A8382C]"
                  />
                  <strong className="text-stone-900 font-bold">{opt.title}</strong>
                </div>
                <p className="text-stone-500 mt-1.5 pl-6 text-[11px] leading-relaxed">{opt.desc}</p>
              </label>
            ))}
          </div>

          {/* Preview Table of First 4 Records */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-stone-700 uppercase tracking-wider">
              Data Sample Preview ({parsedRows.length} total rows)
            </h3>
            <div className="border border-stone-200 rounded-xl overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead className="bg-[#FBF6F1] text-stone-700 border-b border-stone-200 font-bold">
                  <tr>
                    {columnHeaders.slice(0, 7).map((h, i) => (
                      <th key={i} className="p-2.5 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {parsedRows.slice(0, 4).map((row, rIdx) => (
                    <tr key={rIdx}>
                      {columnHeaders.slice(0, 7).map((h, cIdx) => (
                        <td key={cIdx} className="p-2.5 truncate max-w-[160px]">
                          {row[h]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
            >
              Back
            </button>
            <button
              onClick={handleExecuteImport}
              className="px-5 py-2 text-xs font-bold text-white bg-[#A8382C] hover:bg-[#7A2820] rounded-xl shadow-xs flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-[#C9A227]" />
              <span>Commit Import ({parsedRows.length} Rows)</span>
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Progress Loading Bar */}
      {currentStep === 4 && (
        <div className="p-12 bg-white rounded-2xl border border-stone-200 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-[#A8382C] flex items-center justify-center mx-auto animate-pulse">
            <Database className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-display font-bold text-stone-900">
              Validating & Writing to System Database...
            </h3>
            <p className="text-xs text-stone-500">
              Syncing courses, {selectedCategory === 'Public Universities' ? 'public state streams' : 'partner institutions'}, eligibility requirements, and country destination matrices
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#A8382C] h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-stone-600">{progress}% Completed</span>
          </div>
        </div>
      )}

      {/* Step 5: Post-import Reporting & Log */}
      {currentStep === 5 && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-6 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-stone-900">
                Import Batch Finalized Successfully
              </h2>
              <p className="text-xs text-stone-500">
                Data is now live and synchronized across the search, eligibility checker, and export tools.
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
              <span className="text-xs text-stone-500 block">Total Rows Read</span>
              <span className="text-xl font-bold text-stone-900">{importSummary.total}</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs text-emerald-800 font-semibold block">Courses Created / Synced</span>
              <span className="text-xl font-bold text-emerald-700">{importSummary.coursesCreated || importSummary.imported}</span>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-xs text-amber-800 font-semibold block">
                {selectedCategory === 'Public Universities' ? 'Public Systems Synced' : 'Universities Synced'}
              </span>
              <span className="text-xl font-bold text-amber-700">{importSummary.universitiesCreated}</span>
            </div>
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-xs text-rose-800 font-semibold block">Errors / Skipped</span>
              <span className="text-xl font-bold text-rose-700">{importSummary.skipped}</span>
            </div>
          </div>

          {/* Error Log Breakdown if any */}
          {importSummary.errors.length > 0 && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <strong className="text-rose-900 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Validation Inconsistencies ({importSummary.errors.length})</span>
                </strong>
                <button
                  onClick={handleDownloadErrorCsv}
                  className="px-3 py-1 bg-white text-rose-700 border border-rose-300 font-bold rounded-lg hover:bg-rose-100 flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Error CSV Log
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto divide-y divide-rose-200">
                {importSummary.errors.map((err, i) => (
                  <div key={i} className="py-1.5 flex justify-between">
                    <span>Row #{err.row}: {err.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post Import Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
            <button
              onClick={() => {
                setFile(null);
                setParsedRows([]);
                setCurrentStep(1);
              }}
              className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 border border-stone-300 rounded-xl"
            >
              Upload Another Dataset
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('import_history')}
                className="px-4 py-2 text-xs font-semibold text-[#7A2820] bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
              >
                View Import History Logs
              </button>
              <button
                onClick={() => onNavigate('courses')}
                className="px-4 py-2 text-xs font-bold text-white bg-[#A8382C] hover:bg-[#7A2820] rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <span>Browse Live Courses</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
