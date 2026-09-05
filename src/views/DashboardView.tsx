import React, { useState, useMemo } from 'react';
import {
  University,
  Course,
  ImportHistoryRecord,
  UserAccount,
  StudentLeadRequest,
  canViewLeadRequest,
  isB2BUser,
} from '../types';
import {
  Building2,
  BookOpen,
  Globe2,
  Calendar,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  PlusCircle,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  UserPlus,
  Users,
  Search,
  Award,
  GraduationCap,
  ArrowUpRight,
  Filter,
  Compass,
  Layers,
  Flame,
  Check,
} from 'lucide-react';

interface DashboardViewProps {
  universities: University[];
  courses: Course[];
  importHistory: ImportHistoryRecord[];
  leads?: StudentLeadRequest[];
  currentUser: UserAccount;
  onNavigate: (screen: string, searchParam?: string) => void;
  onSelectCourse: (course: Course) => void;
  onSelectUniversity: (university: University) => void;
  onCreateLead?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  universities = [],
  courses = [],
  importHistory = [],
  leads = [],
  currentUser,
  onNavigate,
  onSelectCourse,
  onSelectUniversity,
  onCreateLead,
}) => {
  const [activeCourseTab, setActiveCourseTab] = useState<'all' | 'scholarship' | 'postgrad' | 'undergrad'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const isB2B = isB2BUser(currentUser);

  // Calculations & Analytics
  const activeCourses = useMemo(() => (courses || []).filter((c) => c?.status === 'Active'), [courses]);
  const scholarshipCourses = useMemo(() => (courses || []).filter((c) => Boolean(c?.scholarship_available)), [courses]);
  const uniqueDestinations = useMemo(() => Array.from(new Set((courses || []).map((c) => c?.destination_country).filter(Boolean))), [courses]);
  
  // Destination course counts
  const destinationCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (courses || []).forEach((c) => {
      if (c?.destination_country) {
        counts[c.destination_country] = (counts[c.destination_country] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [courses]);

  // Lead visibility
  const visibleLeads = useMemo(() => (leads || []).filter((l) => l && canViewLeadRequest(currentUser, l)), [leads, currentUser]);
  
  const leadsByStatus = useMemo(() => {
    const counts: Record<string, number> = {
      'New Inquiry': 0,
      'Under Assessment': 0,
      'Application Submitted': 0,
      'Offer Issued': 0,
      'Enrolled': 0,
    };
    visibleLeads.forEach((l) => {
      if (!l) return;
      const statusKey = l.status || 'New Inquiry';
      if (counts[statusKey] !== undefined) {
        counts[statusKey]++;
      } else {
        counts[statusKey] = 1;
      }
    });
    return counts;
  }, [visibleLeads]);

  const recentLeads = useMemo(() => {
    return [...visibleLeads]
      .sort((a, b) => {
        const timeA = a?.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b?.created_at ? new Date(b.created_at).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      })
      .slice(0, 4);
  }, [visibleLeads]);

  // Filtered displayed courses based on tab and live search
  const displayedCourses = useMemo(() => {
    let list = courses || [];
    if (activeCourseTab === 'scholarship') {
      list = list.filter((c) => Boolean(c?.scholarship_available));
    } else if (activeCourseTab === 'postgrad') {
      list = list.filter((c) => {
        const prog = String(c?.program || '').toLowerCase();
        return prog.includes('master') || prog.includes('postgraduate') || prog.includes('phd') || prog.includes('doctor');
      });
    } else if (activeCourseTab === 'undergrad') {
      list = list.filter((c) => {
        const prog = String(c?.program || '').toLowerCase();
        return prog.includes('bachelor') || prog.includes('undergraduate') || prog.includes('diploma');
      });
    }

    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const uniMap = new Map((universities || []).map((u) => [u?.university_id, u?.name]));

      list = list.filter((c) => {
        if (!c) return false;
        const courseName = String(c.course_name || '').toLowerCase();
        const country = String(c.destination_country || '').toLowerCase();
        const city = String(c.city || '').toLowerCase();
        const discipline = String(c.discipline || '').toLowerCase();
        const program = String(c.program || '').toLowerCase();
        const faculty = String(c.faculty || '').toLowerCase();
        const studyMode = String(c.study_mode || '').toLowerCase();
        const uniName = String(uniMap.get(c.university_id) || '').toLowerCase();

        return (
          courseName.includes(q) ||
          country.includes(q) ||
          city.includes(q) ||
          discipline.includes(q) ||
          program.includes(q) ||
          faculty.includes(q) ||
          studyMode.includes(q) ||
          uniName.includes(q)
        );
      });
    }

    return [...list]
      .sort((a, b) => {
        const dateA = a?.date_added ? new Date(a.date_added).getTime() : 0;
        const dateB = b?.date_added ? new Date(b.date_added).getTime() : 0;
        return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA);
      })
      .slice(0, 6);
  }, [courses, activeCourseTab, searchQuery, universities]);

  // Recent / Featured Universities
  const featuredUniversities = useMemo(() => {
    return [...(universities || [])]
      .sort((a, b) => (a?.ranking || 999) - (b?.ranking || 999))
      .slice(0, 5);
  }, [universities]);

  const recentImports = useMemo(() => {
    return [...(importHistory || [])]
      .sort((a, b) => (b?.timestamp || 0) - (a?.timestamp || 0))
      .slice(0, 3);
  }, [importHistory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('search_courses', searchQuery.trim());
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in text-[#241512] pb-12">
      {/* 1. Header Hero Banner with ambient lighting & quick search */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#4A140F] via-[#701C18] to-[#962F24] text-white p-6 sm:p-9 overflow-hidden shadow-xl border border-[#C9A227]/30">
        {/* Subtle decorative glow overlays */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-radial from-[#C9A227]/20 to-transparent pointer-events-none blur-2xl" />
        <div className="absolute bottom-0 left-1/4 -mb-12 w-64 h-64 rounded-full bg-[#A8382C]/25 pointer-events-none blur-xl" />

        <div className="relative z-10 flex flex-col gap-6">
          {/* Top row: Role Pill + Live Portal Status */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-[#C9A227] text-stone-950 shadow-xs tracking-wider uppercase">
                Study World Consultant
              </span>
              <span className="hidden sm:inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-stone-200/90 font-medium">
                Welcome back, <strong className="text-white font-bold">{currentUser.name}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-300">
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-white/20 font-semibold text-[#F4E8C1]">
                {currentUser.role === 'User'
                  ? 'Student Portal'
                  : currentUser.role === 'B-2-B'
                  ? 'B-2-B Partner'
                  : currentUser.role}
              </span>
              {currentUser.franchise_name && currentUser.role !== 'B-2-B' && (
                <span className="hidden md:inline text-stone-300 text-[11px]">
                  · {currentUser.franchise_name.split('—')[1] || currentUser.franchise_name}
                </span>
              )}
            </div>
          </div>

          {/* Main Hero Typography & Call-To-Action */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold leading-tight tracking-tight text-white drop-shadow-xs">
                Global Higher Education & Admissions Hub
              </h1>
              <p className="text-xs sm:text-sm text-stone-200/90 leading-relaxed max-w-xl">
                {isB2B
                  ? 'Search verified degree programs across world-class partner universities, compare curriculum options, and submit student referrals seamlessly.'
                  : 'Search verified degree courses across world-class universities, check real-time admission eligibility, and manage international student applications seamlessly.'}
              </p>
            </div>

            {/* Quick Primary Actions */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <button
                id="dash-btn-search-all"
                onClick={() => onNavigate('search_courses')}
                className="px-4 py-2.5 bg-white text-[#701C18] hover:bg-[#FBF6F1] font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
              >
                <Search className="w-4 h-4 text-[#A8382C]" />
                <span>Search All Courses</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#701C18]" />
              </button>

              {onCreateLead && (
                <button
                  id="dash-btn-add-lead"
                  onClick={onCreateLead}
                  className="px-4 py-2.5 bg-[#C9A227] text-stone-950 hover:bg-[#d8b02f] font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isB2B ? 'Submit Student Referral' : 'Submit Student Lead'}</span>
                </button>
              )}

              {/* Quick Match is strictly restricted to non-B2B users */}
              {!isB2B ? (
                <button
                  id="dash-btn-quick-match"
                  onClick={() => onNavigate('eligibility_checker')}
                  className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/25 backdrop-blur-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4 text-[#F4E8C1]" />
                  <span>Quick Match</span>
                </button>
              ) : (
                <>
                  <button
                    id="dash-btn-compare-courses"
                    onClick={() => onNavigate('compare_courses')}
                    className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/25 backdrop-blur-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
                  >
                    <Layers className="w-4 h-4 text-[#F4E8C1]" />
                    <span>Compare Programs</span>
                  </button>
                  <button
                    id="dash-btn-partner-unis"
                    onClick={() => onNavigate('universities')}
                    className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/25 backdrop-blur-xs flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-98"
                  >
                    <Building2 className="w-4 h-4 text-[#F4E8C1]" />
                    <span>Partner Universities</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Integrated Live Quick-Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="pt-2 flex flex-col sm:flex-row items-center gap-2 sm:gap-3"
          >
            <div className="relative w-full flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Quick search courses by name, subject, country (e.g., Computer Science, UK, MBA)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl bg-white/95 text-stone-900 placeholder:text-stone-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#C9A227] shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600 px-1"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 bg-stone-950 text-white hover:bg-stone-900 text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer"
            >
              <span>Explore Portal</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C9A227]" />
            </button>
          </form>

          {/* Real-time search status banner */}
          {searchQuery.trim() && (
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-xl bg-black/25 border border-white/15 text-stone-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C9A227] animate-pulse" />
                <span>
                  Filtering live: <strong className="text-white">{displayedCourses.length}</strong> matching programs shown below
                </span>
              </span>
              <button
                type="button"
                onClick={() => onNavigate('search_courses', searchQuery.trim())}
                className="text-xs font-bold text-[#F4E8C1] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all in Full Search</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Key Metrics & Analytics Bento Grid (4 Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Universities Card */}
        <div
          id="stat-card-universities"
          onClick={() => onNavigate('universities')}
          className="card-modern card-interactive p-5 group flex flex-col justify-between border-stone-200 hover:border-[#7A2820]/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Partner Universities
            </span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-[#7A2820] group-hover:bg-[#7A2820] group-hover:text-white transition-all duration-300 shadow-2xs">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 group-hover:text-[#7A2820] transition-colors">
                {universities.length}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                100% Active
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1 font-medium">
              <span>QS Ranked & Global Network</span>
              <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Total Courses Card */}
        <div
          id="stat-card-courses"
          onClick={() => onNavigate('courses')}
          className="card-modern card-interactive p-5 group flex flex-col justify-between border-stone-200 hover:border-[#A8382C]/40"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Degree Programs
            </span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-[#A8382C] group-hover:bg-[#A8382C] group-hover:text-white transition-all duration-300 shadow-2xs">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 group-hover:text-[#A8382C] transition-colors">
                {courses.length}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                {activeCourses.length} Active
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5 flex items-center gap-1 font-medium">
              <span>UG, PG & Foundation Levels</span>
              <ArrowUpRight className="w-3 h-3 text-stone-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </p>
          </div>
        </div>

        {/* Study Destinations Card */}
        <div
          id="stat-card-destinations"
          onClick={() => onNavigate('countries')}
          className="card-modern card-interactive p-5 group flex flex-col justify-between border-stone-200 hover:border-blue-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Study Destinations
            </span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-800 group-hover:bg-[#7A2820] group-hover:text-white transition-all duration-300 shadow-2xs">
              <Globe2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-stone-900 group-hover:text-blue-900 transition-colors">
                {uniqueDestinations.length}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                Global
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5 font-medium truncate">
              UK, Aus, US, Canada, EU & more
            </p>
          </div>
        </div>

        {/* Scholarships Available Card */}
        <div
          id="stat-card-scholarships"
          onClick={() => onNavigate('search_courses')}
          className="card-modern card-interactive p-5 group flex flex-col justify-between border-stone-200 hover:border-emerald-400"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
              Scholarships
            </span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-[#C9A227] group-hover:text-stone-950 transition-all duration-300 shadow-2xs">
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl sm:text-3xl font-display font-bold text-emerald-700">
                {scholarshipCourses.length}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                Up to 50% Off
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1.5 font-medium">
              Active International Bursaries
            </p>
          </div>
        </div>
      </div>

      {/* 3. Quick Action Hub Pills */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-stone-600">
          <Compass className="w-4 h-4 text-[#A8382C]" />
          <span>Quick Workspace Shortcuts:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="dash-shortcut-search"
            onClick={() => onNavigate('search_courses')}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#A8382C]" />
            <span>Search Courses</span>
          </button>

          <button
            id="dash-shortcut-compare"
            onClick={() => onNavigate('compare_courses')}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#7A2820]" />
            <span>Compare Degree Programs</span>
          </button>

          {!isB2B && (
            <button
              id="dash-btn-eligibility-matcher"
              onClick={() => onNavigate('eligibility_checker')}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Eligibility Matcher</span>
            </button>
          )}

          {isB2B && (
            <button
              id="dash-shortcut-unis"
              onClick={() => onNavigate('universities')}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-[#7A2820]" />
              <span>Partner Universities</span>
            </button>
          )}

          <button
            id="dash-shortcut-leads"
            onClick={() => onNavigate('student_leads')}
            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <UserPlus className="w-3.5 h-3.5 text-blue-700" />
            <span>{isB2B ? 'Student Referrals' : 'Student Inquiries'} ({visibleLeads.length})</span>
          </button>

          {currentUser.role === 'Admin' && (
            <button
              id="dash-shortcut-upload"
              onClick={() => onNavigate('data_upload')}
              className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#7A2820] text-xs font-bold rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5"
            >
              <UploadCloud className="w-3.5 h-3.5 text-[#A8382C]" />
              <span>Bulk Excel Import</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. Main Two-Column Responsive Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column (2/3 Width): Featured Programs & Destination Bento */}
        <div className="lg:col-span-2 space-y-6">
          {/* Degree Programs Section with Tabbed Filter */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-rose-50 rounded-lg text-[#A8382C]">
                    <GraduationCap className="w-4 h-4" />
                  </span>
                  <h2 className="text-lg sm:text-xl font-display font-bold text-[#7A2820]">
                    Verified Degree Programs
                  </h2>
                </div>
                <p className="text-xs text-stone-500 font-medium mt-0.5">
                  Real-time admissions criteria, IELTS requirements, and tuition fees
                </p>
              </div>

              {/* Tab Pills */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-bold text-stone-600 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveCourseTab('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeCourseTab === 'all'
                      ? 'bg-white text-[#7A2820] shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  All ({courses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCourseTab('scholarship')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeCourseTab === 'scholarship'
                      ? 'bg-white text-[#7A2820] shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Scholarships ({scholarshipCourses.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCourseTab('postgrad')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeCourseTab === 'postgrad'
                      ? 'bg-white text-[#7A2820] shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Postgraduate
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCourseTab('undergrad')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    activeCourseTab === 'undergrad'
                      ? 'bg-white text-[#7A2820] shadow-2xs'
                      : 'hover:text-stone-900'
                  }`}
                >
                  Undergraduate
                </button>
              </div>
            </div>

            {/* Courses List */}
            {displayedCourses.length === 0 ? (
              <div className="py-12 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500 font-bold">No courses match your filter.</p>
                <button
                  onClick={() => {
                    setActiveCourseTab('all');
                    setSearchQuery('');
                  }}
                  className="text-xs font-bold text-[#A8382C] hover:underline"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {displayedCourses.map((course) => {
                  const uni = universities.find((u) => u.university_id === course.university_id);
                  const feeValue = typeof course.tuition_fee === 'number'
                    ? course.tuition_fee.toLocaleString()
                    : (course.tuition_fee || 'Contact for fee');
                  const intakes = Array.isArray(course.intake_months)
                    ? course.intake_months.slice(0, 3).join(', ')
                    : (course.intake_months || 'Rolling');

                  return (
                    <div
                      key={course.course_id}
                      onClick={() => onSelectCourse(course)}
                      className="card-modern card-interactive p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group border-stone-200/90 hover:border-[#A8382C]/30 cursor-pointer"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-lg bg-stone-100 text-stone-700 border border-stone-200">
                            {course.program || 'Degree'}
                          </span>
                          <span className="text-xs text-stone-500 font-medium">
                            {course.duration || ''} {course.duration_unit || ''} {course.study_mode ? `(${course.study_mode})` : ''}
                          </span>
                          {course.scholarship_available && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-50 text-amber-900 border border-amber-200 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#C9A227]" />
                              <span>Scholarship</span>
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#A8382C] transition-colors leading-snug">
                          {course.course_name || 'Degree Program'}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-500">
                          <span className="font-semibold text-stone-800">
                            {uni?.name || course.destination_country || 'Partner University'}
                          </span>
                          {(course.city || course.destination_country) && (
                            <>
                              <span>·</span>
                              <span>{[course.city, course.destination_country].filter(Boolean).join(', ')}</span>
                            </>
                          )}
                          {course.eligibility?.ielts_overall !== undefined && course.eligibility?.ielts_overall !== null && (
                            <>
                              <span>·</span>
                              <span className="font-bold text-[#7A2820] bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-200/60">
                                IELTS {course.eligibility.ielts_overall}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100 gap-1 flex-shrink-0">
                        <span className="text-base sm:text-lg font-bold text-[#A8382C] font-display">
                          {course.currency || '$'} {feeValue}
                        </span>
                        <span className="text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md font-medium">
                          Intake: {intakes}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Explore Footer */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-stone-500 font-medium">
                Showing top {displayedCourses.length} of {courses.length} courses
              </span>
              <button
                onClick={() => onNavigate('search_courses')}
                className="text-xs font-bold text-[#A8382C] hover:text-[#7A2820] flex items-center gap-1 group"
              >
                <span>View All Filtered Courses</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

          {/* Top Destination Explorer Bento */}
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-50 rounded-lg text-blue-800">
                  <Globe2 className="w-4 h-4" />
                </span>
                <h3 className="font-display font-bold text-base text-[#7A2820]">
                  Top Study Destinations
                </h3>
              </div>
              <button
                onClick={() => onNavigate('countries')}
                className="text-xs font-bold text-[#A8382C] hover:underline"
              >
                View All Destinations
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {destinationCounts.map(([country, count]) => (
                <div
                  key={country}
                  onClick={() => onNavigate('search_courses')}
                  className="p-3.5 rounded-2xl bg-stone-50/80 hover:bg-[#FBF6F1] border border-stone-200/80 hover:border-[#A8382C]/40 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div>
                    <strong className="text-xs font-bold text-stone-900 group-hover:text-[#A8382C] transition-colors block truncate max-w-[120px]">
                      {country}
                    </strong>
                    <span className="text-[11px] text-stone-500 font-medium">
                      {count} {count === 1 ? 'Program' : 'Programs'}
                    </span>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-[#A8382C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1/3 Width): Inquiries, Partner Unis, System Health */}
        <div className="space-y-6">
          {/* Recent Student Leads & Inquiries Hub */}
          <div className="p-5 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-50 text-[#7A2820]">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#7A2820]">
                    {currentUser.role === 'User' ? 'My Inquiries' : 'Student Applications'}
                  </h3>
                  <p className="text-[10px] text-stone-400 font-medium">
                    {visibleLeads.length} total active referrals
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('student_leads')}
                className="text-xs font-bold text-[#A8382C] hover:underline flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Quick Pipeline Status Chips */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-2 rounded-xl bg-amber-50/70 border border-amber-200/60">
                <span className="text-base font-bold text-[#7A2820] font-display">
                  {leadsByStatus['New Inquiry'] || 0}
                </span>
                <p className="text-[10px] text-stone-600 font-bold uppercase tracking-wider">
                  New Inquiries
                </p>
              </div>
              <div className="p-2 rounded-xl bg-blue-50/70 border border-blue-200/60">
                <span className="text-base font-bold text-blue-900 font-display">
                  {(leadsByStatus['Under Assessment'] || 0) + (leadsByStatus['Application Submitted'] || 0)}
                </span>
                <p className="text-[10px] text-stone-600 font-bold uppercase tracking-wider">
                  In Progress
                </p>
              </div>
            </div>

            {/* Lead list */}
            {recentLeads.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <Users className="w-6 h-6 text-stone-300 mx-auto" />
                <p className="text-xs text-stone-500 font-medium">
                  No active student leads recorded yet.
                </p>
                {onCreateLead && (
                  <button
                    onClick={onCreateLead}
                    className="text-xs font-bold text-[#A8382C] hover:underline"
                  >
                    + Submit First Lead
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2.5 text-xs">
                {recentLeads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => onNavigate('student_leads')}
                    className="p-3 rounded-2xl bg-stone-50/80 hover:bg-[#FBF6F1] border border-stone-200/80 transition-all cursor-pointer space-y-1.5 hover:border-[#A8382C]/30 hover:shadow-2xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-stone-900 font-bold truncate max-w-[150px]">
                        {lead.student_name}
                      </strong>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-700 shadow-2xs">
                        {lead.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 truncate font-medium">
                      {lead.course_name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                      <span>{lead.counselor_name}</span>
                      <span>{lead.created_at ? lead.created_at.slice(0, 10) : 'Recent'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Featured Partner Universities */}
          <div className="p-5 bg-white rounded-3xl border border-stone-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-display font-bold text-sm text-[#7A2820] flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#A8382C]" />
                <span>Partner Universities</span>
              </h3>
              <button
                onClick={() => onNavigate('universities')}
                className="text-xs font-bold text-[#A8382C] hover:underline"
              >
                View All ({universities.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {featuredUniversities.map((uni) => (
                <div
                  key={uni.university_id}
                  onClick={() => onSelectUniversity(uni)}
                  className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-stone-50 transition-colors cursor-pointer border border-transparent hover:border-stone-200 group"
                >
                  <img
                    src={uni.logo_url}
                    alt={uni.name}
                    className="w-10 h-10 rounded-xl object-cover border border-stone-200 bg-white flex-shrink-0 shadow-2xs group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-stone-900 truncate group-hover:text-[#A8382C] transition-colors">
                      {uni.name}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate">
                      {uni.city}, {uni.country}
                    </p>
                  </div>
                  {uni.ranking && (
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-50 text-[#7A2820] border border-amber-200 rounded-lg flex-shrink-0">
                      #{uni.ranking}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Counselor Fast-Facts & System Health */}
          <div className="p-5 bg-gradient-to-br from-[#FBF6F1] to-stone-50 rounded-3xl border border-stone-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Admission Timeline</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-stone-700 border border-stone-200">
                2026/2027 Intakes
              </span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              Fall (Sep/Oct) and Spring (Jan/Feb) intakes are open across partner campuses. Early conditional offers require verified academic transcripts and English proficiency scores.
            </p>
            <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[11px] text-stone-500">
              <span>Cloud DB Synchronization:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live & Connected</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
