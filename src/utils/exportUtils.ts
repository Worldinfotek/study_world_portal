import { Course, University, ImportCategory, UserAccount, Franchise, EligibilityEvaluationResult, StudentProfile } from '../types';
import { getCustomLogo } from './logoStorage';

export function exportToCsv(filename: string, rows: Record<string, any>[]): void {
  if (!rows || !rows.length) {
    alert('No data available to export.');
    return;
  }

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let val = row[header];
          if (val === null || val === undefined) val = '';
          if (Array.isArray(val)) val = val.join('; ');
          if (typeof val === 'object') val = JSON.stringify(val);
          const str = String(val).replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Global SVG Logo markup for print windows (Exact SWC Brand Shield)
const SWC_PRINT_LOGO_SVG = `
<div style="display:flex;align-items:center;gap:14px;">
  <svg width="52" height="60" viewBox="0 0 280 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M 140 10 C 185 10 242 22 260 36 C 266 95 260 178 212 232 C 180 268 145 288 140 292 C 135 288 100 268 68 232 C 20 178 14 95 20 36 C 38 22 95 10 140 10 Z" fill="none" stroke="#8E2F26" stroke-width="14" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="140" cy="116" r="96" fill="none" stroke="#8E2F26" stroke-width="6"/>
    <ellipse cx="140" cy="74" rx="86" ry="26" fill="none" stroke="#8E2F26" stroke-width="3.5"/>
    <ellipse cx="140" cy="116" rx="94" ry="36" fill="none" stroke="#8E2F26" stroke-width="3.5"/>
    <ellipse cx="140" cy="116" rx="52" ry="94" fill="none" stroke="#8E2F26" stroke-width="3.5"/>
    <line x1="140" y1="20" x2="140" y2="100" stroke="#8E2F26" stroke-width="3.5"/>
    <path d="M 130 38 Q 160 34 186 48 Q 212 62 206 84 Q 188 80 176 94 Q 168 116 180 134 Q 168 142 154 134 Q 140 152 144 172 Q 134 176 125 160 Q 120 130 132 118 Q 118 108 114 88 Q 110 60 130 38 Z" fill="#8E2F26"/>
    <path d="M 66 48 Q 92 44 102 66 Q 92 84 78 94 Q 88 120 74 142 Q 62 134 56 108 Q 52 80 66 48 Z" fill="#8E2F26"/>
    <g transform="translate(140, 102)">
      <polygon points="0,-32 58,-10 0,12 -58,-10" fill="#8E2F26"/>
      <path d="M -26 -4 L -26 14 C -26 22 26 22 26 14 L 26 -4 Z" fill="#8E2F26"/>
      <circle cx="0" cy="-10" r="3.5" fill="#FFFFFF"/>
      <path d="M 0 -10 Q -28 -6 -36 10 Q -40 20 -38 28" fill="none" stroke="#8E2F26" stroke-width="3.5" stroke-linecap="round"/>
      <polygon points="-41,28 -35,28 -36,36 -40,36" fill="#8E2F26"/>
    </g>
    <g transform="translate(140, 160)">
      <path d="M -76 -10 Q -38 2 0 -5 Q 38 2 76 -10 L 68 18 Q 34 7 0 14 Q -34 7 -68 18 Z" fill="#FFFFFF" stroke="#8E2F26" stroke-width="5" stroke-linejoin="round"/>
      <line x1="0" y1="-5" x2="0" y2="14" stroke="#8E2F26" stroke-width="3"/>
      <text x="-42" y="8" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="18" fill="#8E2F26" text-anchor="middle">S</text>
      <text x="0" y="8" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="18" fill="#8E2F26" text-anchor="middle">W</text>
      <text x="42" y="8" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-weight="900" font-size="18" fill="#8E2F26" text-anchor="middle">C</text>
    </g>
    <ellipse cx="140" cy="216" rx="60" ry="24" fill="none" stroke="#8E2F26" stroke-width="4"/>
    <ellipse cx="140" cy="236" rx="40" ry="14" fill="none" stroke="#8E2F26" stroke-width="3.5"/>
    <line x1="140" y1="174" x2="140" y2="250" stroke="#8E2F26" stroke-width="4"/>
    <line x1="112" y1="184" x2="116" y2="242" stroke="#8E2F26" stroke-width="3"/>
    <line x1="168" y1="184" x2="164" y2="242" stroke="#8E2F26" stroke-width="3"/>
  </svg>
  <div>
    <div style="font-size:18px;font-weight:900;color:#701C18;letter-spacing:0.5px;text-transform:uppercase;line-height:1.1;">STUDY WORLD</div>
    <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
      <span style="font-size:14px;font-weight:900;color:#88221D;letter-spacing:1px;text-transform:uppercase;line-height:1;">CONSULTANT</span>
      <span style="background:#701C18;color:#FFFFFF;font-size:8.5px;font-weight:900;padding:2px 4px;border-radius:2px;letter-spacing:0.5px;">SINCE 2016</span>
    </div>
    <div style="font-size:9px;color:#666;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-top:2px;">Search Portal</div>
  </div>
</div>
`;

/**
 * Generic Print & PDF Document Builder with official SWC styling
 */
export function printFormattedReport(options: {
  title: string;
  subtitle?: string;
  badgeText?: string;
  infoFields?: { label: string; value: string | number }[];
  headers?: string[];
  rows?: (string | number | boolean)[][];
  contentHtml?: string;
  currentUser?: UserAccount;
}): void {
  const printWindow = window.open('', '_blank', 'width=1050,height=850');
  if (!printWindow) {
    alert('Please allow popups to print and export PDF reports.');
    return;
  }

  const dateStr = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const counselorInfo = options.currentUser
    ? `${options.currentUser.name} (${options.currentUser.role}${
        options.currentUser.franchise_name ? ` — ${options.currentUser.franchise_name}` : ''
      })`
    : 'Authorized Admissions Counselor';

  const customLogoUrl = getCustomLogo();
  const printLogoHtml = customLogoUrl
    ? `
    <div style="display:flex;align-items:center;gap:14px;">
      <img src="${customLogoUrl}" style="height:56px;max-width:140px;object-fit:contain;" alt="SWC Logo" />
      <div>
        <div style="font-size:18px;font-weight:900;color:#701C18;letter-spacing:0.5px;text-transform:uppercase;line-height:1.1;">STUDY WORLD</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:2px;">
          <span style="font-size:14px;font-weight:900;color:#88221D;letter-spacing:1px;text-transform:uppercase;line-height:1;">CONSULTANT</span>
          <span style="background:#701C18;color:#FFFFFF;font-size:8.5px;font-weight:900;padding:2px 4px;border-radius:2px;letter-spacing:0.5px;">SINCE 2016</span>
        </div>
        <div style="font-size:9px;color:#666;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-top:2px;">Search Portal</div>
      </div>
    </div>
    `
    : SWC_PRINT_LOGO_SVG;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${options.title} — Study World Consultant</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 12mm 14mm 12mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #241512;
      background: #FFFFFF;
      margin: 0;
      padding: 16px;
      font-size: 11px;
      line-height: 1.45;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #701C18;
      padding-bottom: 12px;
      margin-bottom: 14px;
    }
    .report-title-box {
      text-align: right;
    }
    .report-badge {
      display: inline-block;
      background: #701C18;
      color: #FFF;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .report-title {
      font-size: 16px;
      font-weight: 800;
      color: #701C18;
      margin: 0;
      line-height: 1.2;
    }
    .report-subtitle {
      font-size: 10px;
      color: #666;
      margin-top: 2px;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 8px;
      background: #FDF9F6;
      border: 1px solid #E8DDD7;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 14px;
    }
    .meta-item {
      display: flex;
      flex-direction: column;
    }
    .meta-label {
      font-size: 9px;
      text-transform: uppercase;
      font-weight: 700;
      color: #88221D;
      letter-spacing: 0.5px;
    }
    .meta-val {
      font-size: 11px;
      font-weight: 600;
      color: #241512;
      margin-top: 1px;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      font-size: 10px;
    }
    table.data-table th {
      background: #701C18;
      color: #FFFFFF;
      font-weight: 700;
      text-align: left;
      padding: 6px 8px;
      border: 1px solid #701C18;
      text-transform: uppercase;
      font-size: 8.5px;
      letter-spacing: 0.5px;
    }
    table.data-table td {
      padding: 6px 8px;
      border: 1px solid #E5DCD6;
      vertical-align: top;
    }
    table.data-table tr:nth-child(even) {
      background: #FAF6F2;
    }
    .footer-stamp {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1px solid #DDD;
      display: flex;
      justify-content: space-between;
      font-size: 8.5px;
      color: #777;
    }
    .signature-row {
      margin-top: 30px;
      display: flex;
      justify-content: space-between;
      gap: 30px;
    }
    .sig-box {
      flex: 1;
      border-top: 1px dashed #999;
      padding-top: 4px;
      font-size: 9.5px;
      color: #555;
      text-align: center;
    }
    .no-print-bar {
      background: #241512;
      color: #FFF;
      padding: 10px 16px;
      border-radius: 8px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .print-btn {
      background: #A8322A;
      color: #FFF;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      font-weight: 700;
      cursor: pointer;
      font-size: 11px;
    }
    @media print {
      .no-print-bar { display: none !important; }
      body { padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="no-print-bar">
    <span><strong>Study World Consultant — Document Print & Export to PDF</strong> (Use system dialog to Save as PDF)</span>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header-bar">
    ${printLogoHtml}
    <div class="report-title-box">
      ${options.badgeText ? `<span class="report-badge">${options.badgeText}</span>` : ''}
      <h1 class="report-title">${options.title}</h1>
      <div class="report-subtitle">${options.subtitle || 'Official Admissions Evaluation Document'}</div>
      <div style="font-size: 8.5px; color: #888; margin-top: 3px;">Generated: ${dateStr}</div>
    </div>
  </div>

  ${
    options.infoFields && options.infoFields.length > 0
      ? `
    <div class="meta-grid">
      ${options.infoFields
        .map(
          (f) => `
        <div class="meta-item">
          <span class="meta-label">${f.label}</span>
          <span class="meta-val">${f.value}</span>
        </div>
      `
        )
        .join('')}
    </div>
  `
      : ''
  }

  ${options.contentHtml || ''}

  ${
    options.headers && options.rows
      ? `
    <table class="data-table">
      <thead>
        <tr>
          ${options.headers.map((h) => `<th>${h}</th>`).join('')}
        </tr>
      </thead>
      <tbody>
        ${options.rows
          .map(
            (row) => `
          <tr>
            ${row.map((cell) => `<td>${cell !== undefined && cell !== null ? String(cell) : '-'}</td>`).join('')}
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `
      : ''
  }

  <div class="signature-row">
    <div class="sig-box">
      <strong>Evaluated By Counselor:</strong><br>
      ${counselorInfo}
    </div>
    <div class="sig-box">
      <strong>Student / Applicant Acknowledgement:</strong><br>
      Signature & Date
    </div>
    <div class="sig-box">
      <strong>Central Admissions Verification:</strong><br>
      Study World Consultant Seal & Stamp
    </div>
  </div>

  <div class="footer-stamp">
    <span>Study World Consultant © 2016–2026. Confidential student counseling assessment report.</span>
    <span>www.studyworld.pk · info@studyworld.pk</span>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

/**
 * Print Course Comparison Sheet
 */
export function printCourseComparisonSheet(
  c1: Course,
  c2: Course,
  u1?: University,
  u2?: University,
  currentUser?: UserAccount
): void {
  const formatCurrency = (amount: number, curr: string) => {
    const sym = curr === 'GBP' ? '£' : curr === 'AUD' ? 'A$' : curr === 'CAD' ? 'C$' : curr === 'EUR' ? '€' : '$';
    return `${sym}${amount.toLocaleString()} ${curr}`;
  };

  const rows = [
    { label: 'University / Institution', v1: u1?.name || '-', v2: u2?.name || '-' },
    { label: 'Location (City, Country)', v1: `${c1.city}, ${c1.destination_country}`, v2: `${c2.city}, ${c2.destination_country}` },
    { label: 'Degree / Program Level', v1: c1.program, v2: c2.program },
    { label: 'Duration & Study Mode', v1: `${c1.duration} ${c1.duration_unit} (${c1.study_mode})`, v2: `${c2.duration} ${c2.duration_unit} (${c2.study_mode})` },
    { label: 'Annual Tuition Fee', v1: formatCurrency(c1.tuition_fee, c1.currency), v2: formatCurrency(c2.tuition_fee, c2.currency) },
    { label: 'Application Fee', v1: c1.application_fee > 0 ? formatCurrency(c1.application_fee, c1.currency) : 'Waived / Free', v2: c2.application_fee > 0 ? formatCurrency(c2.application_fee, c2.currency) : 'Waived / Free' },
    { label: 'Application Deadline', v1: c1.application_deadline, v2: c2.application_deadline },
    { label: 'Intake Months', v1: c1.intake_months.join(', '), v2: c2.intake_months.join(', ') },
    { label: 'Scholarship Status', v1: c1.scholarship_available ? (c1.scholarship_detail || 'Available') : 'Standard Rates', v2: c2.scholarship_available ? (c2.scholarship_detail || 'Available') : 'Standard Rates' },
    { label: 'Academic Qualification Req.', v1: `${c1.eligibility.minimum_qualification} (Min ${c1.eligibility.minimum_percentage ? `${c1.eligibility.minimum_percentage}%` : `${c1.eligibility.minimum_cgpa} CGPA`})`, v2: `${c2.eligibility.minimum_qualification} (Min ${c2.eligibility.minimum_percentage ? `${c2.eligibility.minimum_percentage}%` : `${c2.eligibility.minimum_cgpa} CGPA`})` },
    { label: 'Max Study Gap Allowed', v1: `${c1.eligibility.study_gap_allowed_years} Years`, v2: `${c2.eligibility.study_gap_allowed_years} Years` },
    { label: 'IELTS Proficiency', v1: `Overall ${c1.eligibility.ielts_overall} (Min Band ${c1.eligibility.ielts_min_band})`, v2: `Overall ${c2.eligibility.ielts_overall} (Min Band ${c2.eligibility.ielts_min_band})` },
    { label: 'PTE Academic / TOEFL', v1: `PTE ${c1.eligibility.pte_min} / TOEFL ${c1.eligibility.toefl_min}`, v2: `PTE ${c2.eligibility.pte_min} / TOEFL ${c2.eligibility.toefl_min}` },
    { label: 'Medium of Instruction (MOI)', v1: c1.eligibility.moi_acceptance, v2: c2.eligibility.moi_acceptance },
    { label: 'Eligible Nationalities', v1: c1.eligibility.eligible_nationalities.join(', '), v2: c2.eligibility.eligible_nationalities.join(', ') },
  ];

  const contentHtml = `
    <div style="margin-bottom:12px;">
      <h2 style="font-size:13px;color:#701C18;margin:0 0 6px 0;text-transform:uppercase;">Side-by-Side Course Evaluation Matrix</h2>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th style="width:28%;">Evaluation Criteria</th>
          <th style="width:36%;background:#88221D;">Option 1: ${c1.course_name}</th>
          <th style="width:36%;background:#55100D;">Option 2: ${c2.course_name}</th>
        </tr>
      </thead>
      <tbody>
        ${rows
          .map(
            (r) => `
          <tr>
            <td style="font-weight:700;background:#FDF9F6;color:#55100D;">${r.label}</td>
            <td style="font-weight:600;">${r.v1}</td>
            <td style="font-weight:600;">${r.v2}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>
  `;

  printFormattedReport({
    title: 'Executive Course Comparison Report',
    subtitle: `${c1.course_name} vs ${c2.course_name}`,
    badgeText: 'Side-by-Side Counseling Evaluation',
    contentHtml,
    currentUser,
  });
}

/**
 * Print Single Course Factsheet
 */
export function printCourseFactsheet(
  course: Course,
  university?: University,
  currentUser?: UserAccount
): void {
  const infoFields = [
    { label: 'Course Code / ID', value: course.course_id },
    { label: 'Program Level', value: course.program },
    { label: 'University', value: university?.name || 'Institution Partner' },
    { label: 'Destination & City', value: `${course.city}, ${course.destination_country}` },
    { label: 'Duration', value: `${course.duration} ${course.duration_unit} (${course.study_mode})` },
    { label: 'Annual Tuition Fee', value: `${course.currency} ${course.tuition_fee.toLocaleString()}` },
    { label: 'Intakes Available', value: course.intake_months.join(', ') },
    { label: 'Application Deadline', value: course.application_deadline },
  ];

  const contentHtml = `
    <div style="background:#FAF6F2;border:1px solid #E8DDD7;border-radius:8px;padding:12px;margin-bottom:14px;">
      <h3 style="color:#701C18;font-size:12px;margin:0 0 8px 0;text-transform:uppercase;border-bottom:1px solid #D8C7C0;padding-bottom:4px;">Academic & English Eligibility Requirements</h3>
      <table style="width:100%;font-size:10px;border-collapse:collapse;">
        <tr>
          <td style="padding:4px 0;width:35%;font-weight:700;color:#666;">Minimum Academic Level:</td>
          <td style="padding:4px 0;font-weight:600;">${course.eligibility.minimum_qualification}</td>
          <td style="padding:4px 0;width:30%;font-weight:700;color:#666;">Min Score Required:</td>
          <td style="padding:4px 0;font-weight:600;">${course.eligibility.minimum_percentage ? `${course.eligibility.minimum_percentage}%` : `${course.eligibility.minimum_cgpa} CGPA`}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:700;color:#666;">IELTS Requirement:</td>
          <td style="padding:4px 0;font-weight:600;">Overall ${course.eligibility.ielts_overall} (Min band ${course.eligibility.ielts_min_band})</td>
          <td style="padding:4px 0;font-weight:700;color:#666;">PTE Academic:</td>
          <td style="padding:4px 0;font-weight:600;">Min score ${course.eligibility.pte_min}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:700;color:#666;">TOEFL iBT / Duolingo:</td>
          <td style="padding:4px 0;font-weight:600;">Min score ${course.eligibility.toefl_min}</td>
          <td style="padding:4px 0;font-weight:700;color:#666;">Medium of Instruction (MOI):</td>
          <td style="padding:4px 0;font-weight:600;color:#701C18;">${course.eligibility.moi_acceptance}</td>
        </tr>
        <tr>
          <td style="padding:4px 0;font-weight:700;color:#666;">Maximum Study Gap Allowed:</td>
          <td style="padding:4px 0;font-weight:600;">${course.eligibility.study_gap_allowed_years} Years</td>
          <td style="padding:4px 0;font-weight:700;color:#666;">Scholarships:</td>
          <td style="padding:4px 0;font-weight:600;color:#1B5E20;">${course.scholarship_available ? (course.scholarship_detail || 'Merit scholarships available') : 'Standard tuition rates apply'}</td>
        </tr>
      </table>
    </div>

    ${
      course.eligibility.required_documents && course.eligibility.required_documents.length > 0
        ? `
      <div style="margin-bottom:14px;">
        <h4 style="font-size:11px;color:#701C18;margin:0 0 6px 0;text-transform:uppercase;">Mandatory Admissions Checklist & Required Documents</h4>
        <ul style="margin:0;padding-left:18px;font-size:10px;color:#333;">
          ${course.eligibility.required_documents.map((doc) => `<li style="margin-bottom:3px;">${doc}</li>`).join('')}
        </ul>
      </div>
    `
        : ''
    }

    ${
      course.eligibility.important_notes
        ? `
      <div style="background:#FFF9E6;border:1px solid #FFE082;border-radius:6px;padding:10px;font-size:9.5px;color:#5D4037;margin-bottom:12px;">
        <strong>Important Admissions Advisor Note:</strong> ${course.eligibility.important_notes}
      </div>
    `
        : ''
    }
  `;

  printFormattedReport({
    title: course.course_name,
    subtitle: `${university?.name || 'Partner University'} · ${course.city}, ${course.destination_country}`,
    badgeText: 'Program Factsheet & Admissions Guide',
    infoFields,
    contentHtml,
    currentUser,
  });
}

/**
 * Print University Profile Factsheet
 */
export function printUniversityFactsheet(
  university: University,
  courses: Course[],
  currentUser?: UserAccount
): void {
  const uniCourses = courses.filter((c) => c.university_id === university.university_id);

  const infoFields = [
    { label: 'Institution Name', value: university.name },
    { label: 'Country & City', value: `${university.city}, ${university.country}` },
    { label: 'Campus Details', value: university.campus || 'Main Campus' },
    { label: 'Global Ranking', value: university.ranking ? `QS Rank #${university.ranking}` : 'Accredited Institution' },
    { label: 'Official Website', value: university.website },
    { label: 'Admissions Contact', value: university.contact_info?.email || 'international@admissions.ac' },
  ];

  const headers = ['Course Name', 'Program Level', 'Duration', 'Annual Tuition Fee', 'Intakes', 'IELTS Req.', 'MOI Status'];
  const rows = uniCourses.map((c) => [
    c.course_name,
    c.program,
    `${c.duration} ${c.duration_unit}`,
    `${c.currency} ${c.tuition_fee.toLocaleString()}`,
    c.intake_months.join(', '),
    `Overall ${c.eligibility.ielts_overall} (Band ${c.eligibility.ielts_min_band})`,
    c.eligibility.moi_acceptance,
  ]);

  printFormattedReport({
    title: university.name,
    subtitle: `Institutional Profile & Registered Course Catalog (${uniCourses.length} Programs)`,
    badgeText: 'University Dossier',
    infoFields,
    headers,
    rows,
    currentUser,
  });
}

/**
 * Print Student Eligibility Assessment Report
 */
export function printStudentAssessmentReport(
  student: StudentProfile,
  results: EligibilityEvaluationResult[],
  currentUser?: UserAccount
): void {
  const eligibleResults = results.filter((r) => r.verdict === 'Eligible');
  const possibleResults = results.filter((r) => r.verdict === 'Possibly Eligible');
  const notEligibleResults = results.filter((r) => r.verdict === 'Not Eligible');

  const englishScore = student.ielts_overall
    ? `IELTS ${student.ielts_overall} (Min ${student.ielts_min_band || 'N/A'})`
    : student.pte_score
    ? `PTE ${student.pte_score}`
    : student.toefl_score
    ? `TOEFL ${student.toefl_score}`
    : student.moi_available
    ? 'MOI Available (Waiver)'
    : 'Pending / None';

  const academicScore = `${student.percentage ? `${student.percentage}%` : ''} ${
    student.cgpa ? `(${student.cgpa} CGPA)` : ''
  }`.trim() || 'N/A';

  const infoFields = [
    { label: 'Candidate Name', value: student.student_name || 'Prospective Applicant' },
    { label: 'Nationality & Age', value: `${student.nationality || 'International'} · ${student.age || 20} Years` },
    { label: 'Prior Qualification', value: student.previous_qualification || 'High School / Bachelor' },
    { label: 'Academic Marks / CGPA', value: academicScore },
    { label: 'Graduation Year / Gap', value: `${student.graduation_year || 2024} (${student.study_gap || 0} Yrs Gap)` },
    { label: 'English Language Status', value: englishScore },
    { label: 'Target Destination(s)', value: student.desired_destinations.length ? student.desired_destinations.join(', ') : 'All Global Destinations' },
    { label: 'Target Program Level', value: student.preferred_programs.length ? student.preferred_programs.join(', ') : 'All Academic Levels' },
    { label: 'Tuition Budget', value: student.max_tuition_budget ? `$${student.max_tuition_budget.toLocaleString()}` : 'Flexible / Any' },
    { label: 'Assessment Summary', value: `${eligibleResults.length} Eligible · ${possibleResults.length} Conditional · ${notEligibleResults.length} Ineligible` },
  ];

  const contentHtml = `
    <div style="display:flex;gap:10px;margin-bottom:14px;">
      <div style="flex:1;background:#E8F5E9;border:1px solid #A5D6A7;border-radius:8px;padding:10px;text-align:center;">
        <span style="font-size:9px;font-weight:700;color:#2E7D32;text-transform:uppercase;display:block;">Directly Eligible</span>
        <span style="font-size:20px;font-weight:800;color:#1B5E20;">${eligibleResults.length} Programs</span>
      </div>
      <div style="flex:1;background:#FFF8E1;border:1px solid #FFE082;border-radius:8px;padding:10px;text-align:center;">
        <span style="font-size:9px;font-weight:700;color:#F57F17;text-transform:uppercase;display:block;">Conditional / Review</span>
        <span style="font-size:20px;font-weight:800;color:#E65100;">${possibleResults.length} Programs</span>
      </div>
      <div style="flex:1;background:#FFEBEE;border:1px solid #FFCDD2;border-radius:8px;padding:10px;text-align:center;">
        <span style="font-size:9px;font-weight:700;color:#C62828;text-transform:uppercase;display:block;">Ineligible Options</span>
        <span style="font-size:20px;font-weight:800;color:#B71C1C;">${notEligibleResults.length} Programs</span>
      </div>
    </div>

    ${
      eligibleResults.length > 0
        ? `
      <div style="margin-bottom:14px;">
        <h3 style="color:#1B5E20;font-size:12px;margin:0 0 6px 0;text-transform:uppercase;font-weight:800;">
          ✓ Verified Eligible Academic Programs
        </h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="background:#2E7D32;">Course Title</th>
              <th style="background:#2E7D32;">University & Location</th>
              <th style="background:#2E7D32;">Level</th>
              <th style="background:#2E7D32;">Duration</th>
              <th style="background:#2E7D32;">Tuition Fee</th>
              <th style="background:#2E7D32;">Intakes</th>
              <th style="background:#2E7D32;">Match Score</th>
            </tr>
          </thead>
          <tbody>
            ${eligibleResults
              .map(
                (r) => `
              <tr>
                <td style="font-weight:700;color:#701C18;">${r.course.course_name}</td>
                <td><strong>${r.university?.name || r.course.destination_country}</strong><br><span style="color:#666;font-size:8.5px;">${r.course.city}, ${r.course.destination_country}</span></td>
                <td>${r.course.program}</td>
                <td>${r.course.duration} ${r.course.duration_unit}</td>
                <td style="font-weight:700;">${r.course.currency} ${r.course.tuition_fee.toLocaleString()}</td>
                <td>${r.course.intake_months.join(', ')}</td>
                <td style="font-weight:700;color:#2E7D32;">${r.overall_score}%</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
        : `
      <div style="background:#F9F9F9;border:1px solid #DDD;padding:12px;border-radius:6px;font-size:10px;color:#666;margin-bottom:14px;">
        No direct eligible options match this specific profile. Please review the conditional programs below.
      </div>
    `
    }

    ${
      possibleResults.length > 0
        ? `
      <div style="margin-bottom:14px;">
        <h3 style="color:#E65100;font-size:12px;margin:0 0 6px 0;text-transform:uppercase;font-weight:800;">
          ⚠ Conditional Options (Subject to English / Admission Review)
        </h3>
        <table class="data-table">
          <thead>
            <tr>
              <th style="background:#F57F17;">Course Title</th>
              <th style="background:#F57F17;">University & Country</th>
              <th style="background:#F57F17;">Tuition</th>
              <th style="background:#F57F17;">Conditional Clearance Requirements</th>
            </tr>
          </thead>
          <tbody>
            ${possibleResults
              .slice(0, 8)
              .map(
                (r) => `
              <tr>
                <td style="font-weight:700;">${r.course.course_name}</td>
                <td>${r.university?.name || r.course.destination_country} (${r.course.destination_country})</td>
                <td style="font-weight:600;">${r.course.currency} ${r.course.tuition_fee.toLocaleString()}</td>
                <td style="color:#B71C1C;font-weight:600;">${r.missing_data_warnings.join('; ') || 'Departmental portfolio / interview review'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      </div>
    `
        : ''
    }
  `;

  printFormattedReport({
    title: 'Student Eligibility Assessment Report',
    subtitle: `Candidate: ${student.student_name || 'Prospective Applicant'} · Evaluated for Global Academic Admission`,
    badgeText: 'Assessment Report',
    infoFields,
    contentHtml,
    currentUser,
  });
}

export function generateTemplateData(category: ImportCategory): {
  filename: string;
  headers: string[];
  sampleRows: Record<string, any>[];
} {
  if (category === 'Universities') {
    return {
      filename: 'SWC_Universities_Import_Template.csv',
      headers: [
        'university_id',
        'name',
        'country',
        'city',
        'campus',
        'website',
        'contact_email',
        'contact_phone',
        'status',
        'ranking',
      ],
      sampleRows: [
        {
          university_id: 'uni_sample_01',
          name: 'Oxford Brookes University',
          country: 'United Kingdom',
          city: 'Oxford',
          campus: 'Headington Campus',
          website: 'https://www.brookes.ac.uk',
          contact_email: 'admissions@brookes.ac.uk',
          contact_phone: '+44 1865 484848',
          status: 'Active',
          ranking: '450',
        },
        {
          university_id: 'uni_sample_02',
          name: 'Griffith University',
          country: 'Australia',
          city: 'Brisbane / Gold Coast',
          campus: 'Gold Coast Campus',
          website: 'https://www.griffith.edu.au',
          contact_email: 'international@griffith.edu.au',
          contact_phone: '+61 7 3735 7111',
          status: 'Active',
          ranking: '250',
        },
      ],
    };
  }

  if (category === 'Public Universities') {
    return {
      filename: 'SWC_Public_Universities_No_UniName_Template.csv',
      headers: [
        'Course Name',
        'Country',
        'City',
        'Public System / Institution Type',
        'Program Level',
        'Duration',
        'Duration Unit',
        'Tuition Fee',
        'Currency',
        'Intake Months',
        'Min Qualification',
        'Min %',
        'Min CGPA',
        'Study Gap Max (Years)',
        'IELTS Overall',
        'IELTS Min Band',
        'PTE Min',
        'TOEFL Min',
        'MOI Accepted',
        'Eligible Nationalities',
        'Scholarship Available',
        'Scholarship Detail',
        'Application Fee',
        'Application Deadline',
        'Visa Processing (Weeks)',
        'Post Study Work Visa',
        'Required Documents',
        'Admissions Notes',
      ],
      sampleRows: [
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
      ],
    };
  }

  if (category === 'Complete Data Import' || category === 'Courses') {
    return {
      filename: 'SWC_Private_Universities_Master_Template.csv',
      headers: [
        'Course Name',
        'University Name',
        'Country',
        'City',
        'Campus',
        'University Website',
        'University Email',
        'University Ranking',
        'Program Level',
        'Duration',
        'Duration Unit',
        'Tuition Fee',
        'Currency',
        'Intake Months',
        'Min Qualification',
        'Min %',
        'Min CGPA',
        'Study Gap Max (Years)',
        'IELTS Overall',
        'IELTS Min Band',
        'PTE Min',
        'TOEFL Min',
        'MOI Accepted',
        'Eligible Nationalities',
        'Scholarship Available',
        'Scholarship Detail',
        'Application Fee',
        'Application Deadline',
        'Visa Processing (Weeks)',
        'Post Study Work Visa',
        'Required Documents',
        'Admissions Notes',
      ],
      sampleRows: [
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
      ],
    };
  }

  if (category === 'Eligibility & Requirements' || category === 'Requirements') {
    return {
      filename: 'SWC_Eligibility_Requirements_Template.csv',
      headers: [
        'requirement_title',
        'target_level',
        'ielts_overall',
        'ielts_min_band',
        'pte_score',
        'toefl_score',
        'moi_accepted',
        'max_study_gap',
      ],
      sampleRows: [
        {
          requirement_title: 'Standard Postgraduate Band 6.5',
          target_level: "Master's Degree",
          ielts_overall: 6.5,
          ielts_min_band: 6.0,
          pte_score: 58,
          toefl_score: 85,
          moi_accepted: 'Accepted',
          max_study_gap: 5,
        },
      ],
    };
  }

  // Countries
  return {
    filename: 'SWC_Countries_Template.csv',
    headers: [
      'country_name',
      'iso_code',
      'region',
      'currency_code',
      'currency_symbol',
      'post_study_work_visa',
    ],
    sampleRows: [
      {
        country_name: 'United Kingdom',
        iso_code: 'GB',
        region: 'Europe',
        currency_code: 'GBP',
        currency_symbol: '£',
        post_study_work_visa: '2 Years',
      },
    ],
  };
}

export function generateSampleCsvTemplate(category: string): string {
  const data = generateTemplateData(category as ImportCategory);
  const rows = [data.headers.join(',')];
  for (const row of data.sampleRows) {
    const vals = data.headers.map((h) => {
      const v = row[h] !== undefined ? String(row[h]) : '';
      return `"${v.replace(/"/g, '""')}"`;
    });
    rows.push(vals.join(','));
  }
  return rows.join('\r\n');
}
