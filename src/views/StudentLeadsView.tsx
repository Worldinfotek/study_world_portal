import React, { useState, useMemo } from 'react';
import {
  StudentLeadRequest,
  StudentLeadStatus,
  StudentLeadRequestType,
  LeadPriority,
  UserAccount,
  Course,
  University,
  Franchise,
  canViewLeadRequest,
} from '../types';
import { ViewportOverlay } from '../components/ViewportOverlay';
import {
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  BookOpen,
  DollarSign,
  Award,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  UserCheck,
  Globe2,
  ChevronRight,
  TrendingUp,
  Download,
  ExternalLink,
  MessageSquare,
  Sparkles,
  LayoutGrid,
  List,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import { WhatsAppService } from '../services/whatsappService';

interface StudentLeadsViewProps {
  leads: StudentLeadRequest[];
  currentUser: UserAccount;
  courses: Course[];
  universities: University[];
  franchises: Franchise[];
  users: UserAccount[];
  onCreateLead: (course?: Course | null) => void;
  onEditLead: (lead: StudentLeadRequest) => void;
  onSaveLead?: (lead: StudentLeadRequest) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateLeadStatus: (leadId: string, status: StudentLeadStatus, comment?: string) => void;
  onSelectCourse: (course: Course) => void;
  onSwitchUser?: (user: UserAccount) => void;
}

export const StudentLeadsView: React.FC<StudentLeadsViewProps> = ({
  leads,
  currentUser,
  courses,
  universities,
  franchises,
  users,
  onCreateLead,
  onEditLead,
  onSaveLead,
  onDeleteLead,
  onUpdateLeadStatus,
  onSelectCourse,
  onSwitchUser,
}) => {
  // Filter state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [franchiseFilter, setFranchiseFilter] = useState<string>('All');
  const [counselorFilter, setCounselorFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Selected Lead for Detail Drawer
  const [selectedLead, setSelectedLead] = useState<StudentLeadRequest | null>(null);
  const [newTimelineComment, setNewTimelineComment] = useState<string>('');

  const canEditLead = currentUser.role !== 'B-2-B' && currentUser.role !== 'User';

  // 1. Enforce RBAC Filter: Only leads viewable by current user
  const visibleLeads = useMemo(() => {
    return leads.filter((lead) => canViewLeadRequest(currentUser, lead));
  }, [leads, currentUser]);

  // 2. Apply UI Search and Dropdown Filters on visible leads
  const filteredLeads = useMemo(() => {
    return visibleLeads.filter((lead) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matches =
          lead.student_name.toLowerCase().includes(q) ||
          lead.student_email.toLowerCase().includes(q) ||
          lead.student_phone.toLowerCase().includes(q) ||
          lead.course_name.toLowerCase().includes(q) ||
          lead.university_name.toLowerCase().includes(q) ||
          lead.counselor_name.toLowerCase().includes(q) ||
          (lead.franchise_name && lead.franchise_name.toLowerCase().includes(q)) ||
          lead.destination_country.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter !== 'All' && lead.status !== statusFilter) {
        return false;
      }

      // Request type filter
      if (typeFilter !== 'All' && lead.request_type !== typeFilter) {
        return false;
      }

      // Priority filter
      if (priorityFilter !== 'All' && lead.priority !== priorityFilter) {
        return false;
      }

      // Franchise filter (relevant for Admin / Office Staff)
      if (franchiseFilter !== 'All') {
        if (franchiseFilter === 'HeadOffice') {
          if (lead.franchise_id) return false;
        } else if (lead.franchise_id !== franchiseFilter) {
          return false;
        }
      }

      // Counselor filter
      if (counselorFilter !== 'All' && lead.counselor_id !== counselorFilter) {
        return false;
      }

      return true;
    });
  }, [visibleLeads, searchTerm, statusFilter, typeFilter, priorityFilter, franchiseFilter, counselorFilter]);

  // Key Metric Calculations
  const metrics = useMemo(() => {
    const total = visibleLeads.length;
    const newInquiries = visibleLeads.filter((l) => l.status === 'New Inquiry').length;
    const inAssessmentOrApplied = visibleLeads.filter(
      (l) => l.status === 'Under Assessment' || l.status === 'Application Submitted' || l.status === 'Documents Pending'
    ).length;
    const offers = visibleLeads.filter(
      (l) => l.status === 'Conditional Offer' || l.status === 'Unconditional Offer'
    ).length;
    const visaOrEnrolled = visibleLeads.filter(
      (l) => l.status === 'Visa Processing' || l.status === 'Enrolled'
    ).length;
    return { total, newInquiries, inAssessmentOrApplied, offers, visaOrEnrolled };
  }, [visibleLeads]);

  // Export visible filtered leads to CSV
  const handleExportCSV = () => {
    if (currentUser.role !== 'Admin' && !currentUser.export_permission) {
      alert('Access Denied: You do not have permission to export student leads datasets.');
      return;
    }

    const headers = [
      'Lead ID',
      'Student Name',
      'Email',
      'Phone',
      'Nationality',
      'Course Name',
      'University',
      'Destination Country',
      'Tuition Fee',
      'Intake',
      'Counselor Name',
      'Franchise',
      'Request Type',
      'Priority',
      'Status',
      'Created Date',
    ];

    const rows = filteredLeads.map((l) => [
      l.id,
      `"${l.student_name}"`,
      `"${l.student_email}"`,
      `"${l.student_phone}"`,
      `"${l.nationality}"`,
      `"${l.course_name}"`,
      `"${l.university_name}"`,
      `"${l.destination_country}"`,
      `"${l.currency} ${l.tuition_fee}"`,
      `"${l.intake}"`,
      `"${l.counselor_name}"`,
      `"${l.franchise_name || 'Head Office'}"`,
      `"${l.request_type}"`,
      `"${l.priority}"`,
      `"${l.status}"`,
      `"${l.created_at.slice(0, 10)}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SWC_Student_Leads_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddTimelineNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newTimelineComment.trim()) return;

    const formattedDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const updatedTimeline = [
      ...selectedLead.timeline,
      {
        id: `tl_${Date.now()}`,
        date: formattedDate,
        action: 'Counseling Note',
        performed_by: currentUser.name,
        performed_by_role: currentUser.role,
        comment: newTimelineComment.trim(),
      },
    ];

    const updatedLead: StudentLeadRequest = {
      ...selectedLead,
      timeline: updatedTimeline,
      updated_at: new Date().toISOString(),
    };

    if (onSaveLead) {
      onSaveLead(updatedLead);
    } else {
      onEditLead(updatedLead);
    }
    setSelectedLead(updatedLead);
    setNewTimelineComment('');
  };

  const handleQuickStatusChange = (newStatus: StudentLeadStatus) => {
    if (!selectedLead) return;
    onUpdateLeadStatus(selectedLead.id, newStatus, `Status updated to ${newStatus}`);
    setSelectedLead({
      ...selectedLead,
      status: newStatus,
      updated_at: new Date().toISOString(),
    });
  };

  // Helper for status badge styling
  const getStatusBadge = (status: StudentLeadStatus) => {
    switch (status) {
      case 'New Inquiry':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Assessment':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Documents Pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Application Submitted':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Conditional Offer':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Unconditional Offer':
        return 'bg-emerald-200 text-emerald-900 border-emerald-400 font-bold';
      case 'Visa Processing':
        return 'bg-[#C9A227]/20 text-amber-900 border-[#C9A227] font-bold';
      case 'Enrolled':
        return 'bg-green-600 text-white border-green-700 font-bold';
      case 'Closed / Rejected':
        return 'bg-stone-200 text-stone-700 border-stone-300';
      default:
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  const getPriorityBadge = (priority: LeadPriority) => {
    switch (priority) {
      case 'High':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low':
        return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="space-y-6 text-[#241512] animate-fade-in pb-16">
      {/* Top Title & Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C9A227] text-stone-900">
              Staff Portal
            </span>
            <span className="text-xs text-stone-500">
              Role: <strong className="text-stone-800">{currentUser.role}</strong>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-[#7A2820] mt-1">
            Student Leads & Course Requests
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Create student leads with available degree courses and track real-time admission progress.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Export Button (Strictly Permission-Checked) */}
          {(currentUser.role === 'Admin' || currentUser.export_permission) && (
            <button
              onClick={handleExportCSV}
              id="export-leads-csv-btn"
              className="px-3.5 py-2 rounded-xl border border-stone-300 hover:border-[#7A2820] bg-white text-stone-700 text-xs font-bold flex items-center gap-2 shadow-xs transition-colors"
              title="Export visible student leads to CSV"
            >
              <Download className="w-4 h-4 text-[#A8382C]" />
              <span>Export CSV</span>
            </button>
          )}

          {/* Create Lead Button */}
          <button
            onClick={() => onCreateLead(null)}
            id="create-lead-main-btn"
            className="px-4 py-2.5 rounded-xl bg-[#A8382C] hover:bg-[#7A2820] text-white text-xs font-bold flex items-center gap-2 shadow-md transition-all"
          >
            <UserPlus className="w-4 h-4 text-[#C9A227]" />
            <span>+ Create Student Lead</span>
          </button>
        </div>
      </div>

      {/* Role-Based Access Scope Security Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4A140F]/10 via-[#7A2820]/10 to-[#C9A227]/15 border border-[#C9A227]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#7A2820] text-white shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#C9A227]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-sm font-bold text-[#7A2820]">
                {currentUser.role === 'Admin'
                  ? '👑 Central Superadmin Scope (All System Leads)'
                  : currentUser.role === 'Franchise Admin'
                  ? `🏛️ Franchise Branch Scope — ${currentUser.franchise_name || 'Branch'} (All Branch Leads)`
                  : currentUser.role === 'Office Staff'
                  ? `👤 Head Office Staff Scope — ${currentUser.name} (My Assigned Leads Only)`
                  : currentUser.role === 'B-2-B'
                  ? `🤝 B-2-B Partner Referral Scope — ${currentUser.name} (My Submitted Leads)`
                  : `👤 Franchise Staff Scope — ${currentUser.name} (My Assigned Leads Only)`}
              </strong>
              <span className="px-2 py-0.5 bg-white rounded-full text-[10px] font-bold border border-stone-300 text-stone-700">
                {visibleLeads.length} of {leads.length} System Leads Visible
              </span>
            </div>
            <p className="text-stone-600 text-[11px] mt-0.5">
              {currentUser.role === 'Admin'
                ? 'Full system visibility: You can view, assign, and manage all leads across every franchise and head office.'
                : currentUser.role === 'Franchise Admin'
                ? `Branch-level visibility: You can view and manage all student leads belonging to ${currentUser.franchise_name || 'your franchise branch'}.`
                : currentUser.role === 'Office Staff'
                ? `Restricted counselor view: You can only view and manage student leads assigned directly to you (${currentUser.name}).`
                : currentUser.role === 'B-2-B'
                ? `Independent partner portal: You can submit new student leads and monitor live admission progress. Lead edits and status transitions are managed by central admissions counselors.`
                : `Restricted counselor view: You can only view and manage student leads assigned directly to you (${currentUser.name}).`}
            </p>
          </div>
        </div>

        {/* User Account / Role Switcher - ONLY visible to Central Superadmin */}
        {currentUser.role === 'Admin' && onSwitchUser && (
          <div className="flex items-center gap-2 bg-white/90 p-2 rounded-xl border border-[#C9A227]/40 flex-shrink-0 shadow-2xs">
            <span className="text-[10px] font-bold text-[#7A2820] uppercase tracking-wider flex items-center gap-1">
              <span>Admin Preview Role:</span>
            </span>
            <select
              value={currentUser.id}
              onChange={(e) => {
                const target = users.find((u) => u.id === e.target.value);
                if (target) onSwitchUser(target);
              }}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-stone-300 bg-white font-semibold text-stone-800 focus:outline-none focus:border-[#A8382C] cursor-pointer"
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.role} {u.franchise_id ? `(${u.branch_code || 'Branch'})` : '(HQ)'}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">
            Visible Leads
          </span>
          <h3 className="text-2xl font-display font-bold text-stone-900 mt-1">
            {metrics.total}
          </h3>
          <p className="text-[11px] text-stone-500 mt-0.5">Under your scope</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">
            New Inquiries
          </span>
          <h3 className="text-2xl font-display font-bold text-blue-900 mt-1">
            {metrics.newInquiries}
          </h3>
          <p className="text-[11px] text-blue-600 mt-0.5">Initial stage</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
            Applied / In Review
          </span>
          <h3 className="text-2xl font-display font-bold text-purple-900 mt-1">
            {metrics.inAssessmentOrApplied}
          </h3>
          <p className="text-[11px] text-purple-600 mt-0.5">Active files</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
            Offer Letters
          </span>
          <h3 className="text-2xl font-display font-bold text-emerald-900 mt-1">
            {metrics.offers}
          </h3>
          <p className="text-[11px] text-emerald-600 mt-0.5">Conditional & Unconditional</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#C9A227]/50 bg-amber-50/30 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
            Visa / Enrolled
          </span>
          <h3 className="text-2xl font-display font-bold text-amber-950 mt-1">
            {metrics.visaOrEnrolled}
          </h3>
          <p className="text-[11px] text-amber-700 mt-0.5">Final conversions</p>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search student, email, phone, course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            >
              <option value="All">All Statuses</option>
              <option value="New Inquiry">New Inquiry</option>
              <option value="Under Assessment">Under Assessment</option>
              <option value="Documents Pending">Documents Pending</option>
              <option value="Application Submitted">Application Submitted</option>
              <option value="Conditional Offer">Conditional Offer</option>
              <option value="Unconditional Offer">Unconditional Offer</option>
              <option value="Visa Processing">Visa Processing</option>
              <option value="Enrolled">Enrolled</option>
              <option value="Closed / Rejected">Closed / Rejected</option>
            </select>

            {/* Request Type */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            >
              <option value="All">All Request Types</option>
              <option value="Course Application">Course Application</option>
              <option value="Lead Inquiry">Lead Inquiry</option>
              <option value="Pre-Assessment">Pre-Assessment</option>
              <option value="Offer Letter Request">Offer Letter Request</option>
              <option value="Visa Filing Assistance">Visa Filing Assistance</option>
            </select>

            {/* Priority */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>

            {/* Franchise Filter (Visible only for Central Admin) */}
            {currentUser.role === 'Admin' && (
              <select
                value={franchiseFilter}
                onChange={(e) => setFranchiseFilter(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              >
                <option value="All">All Branches & HQ</option>
                <option value="HeadOffice">Head Office Only</option>
                {franchises.map((fr) => (
                  <option key={fr.id} value={fr.id}>
                    {fr.name} ({fr.city})
                  </option>
                ))}
              </select>
            )}

            {/* Counselor / Staff Filter */}
            {currentUser.role === 'Admin' && (
              <select
                value={counselorFilter}
                onChange={(e) => setCounselorFilter(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              >
                <option value="All">All Counselors & Staff</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role}) {u.franchise_id ? `· ${u.branch_code || 'Branch'}` : '· HQ'}
                  </option>
                ))}
              </select>
            )}

            {currentUser.role === 'Franchise Admin' && (
              <select
                value={counselorFilter}
                onChange={(e) => setCounselorFilter(e.target.value)}
                className="px-2.5 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
              >
                <option value="All">All Branch Staff</option>
                {users
                  .filter((u) => u.franchise_id === currentUser.franchise_id || u.id === currentUser.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
              </select>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-stone-300 p-0.5 bg-stone-100">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'table' ? 'bg-white text-[#7A2820] shadow-xs' : 'text-stone-500'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-[#7A2820] shadow-xs' : 'text-stone-500'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Leads List Container */}
      {filteredLeads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-base text-stone-800">
            No Student Leads Found
          </h3>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {searchTerm || statusFilter !== 'All' || priorityFilter !== 'All'
              ? 'No student requests match your active filter criteria. Try resetting filters.'
              : 'There are no student leads created yet under your visible scope. Click "+ Create Student Lead" to start.'}
          </p>
          <button
            onClick={() => onCreateLead(null)}
            className="px-4 py-2 bg-[#A8382C] text-white text-xs font-bold rounded-xl shadow-xs hover:bg-[#7A2820] transition-colors"
          >
            Create New Lead Now
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF6F1] text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3.5">Student Profile</th>
                  <th className="p-3.5">Requested Course & Destination</th>
                  <th className="p-3.5">Tuition & Intake</th>
                  <th className="p-3.5">Assigned Counselor & Branch</th>
                  <th className="p-3.5">Priority & Type</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 text-stone-800">
                {filteredLeads.map((lead) => {
                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedLead(lead)}
                      className="hover:bg-[#FBF6F1]/70 transition-colors cursor-pointer group"
                    >
                      {/* Student Profile Column */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <strong className="text-stone-900 font-bold text-xs block group-hover:text-[#A8382C]">
                            {lead.student_name}
                          </strong>
                          <div className="text-[11px] text-stone-500 flex flex-col gap-0.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-stone-400" />
                              {lead.student_email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-stone-400" />
                              {lead.student_phone}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {lead.nationality} {lead.student_city ? `· ${lead.student_city}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Course & Destination Column */}
                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-1">
                          <p className="font-bold text-stone-900 line-clamp-1">
                            {lead.course_name}
                          </p>
                          <div className="text-[11px] text-stone-600 flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-[#7A2820]">
                              {lead.university_name}
                            </span>
                            <span>·</span>
                            <span>{lead.city}, {lead.destination_country}</span>
                          </div>
                          <span className="inline-block px-2 py-0.2 text-[9px] font-bold rounded-full bg-[#FBF6F1] text-stone-700 border border-stone-200">
                            {lead.program_level}
                          </span>
                        </div>
                      </td>

                      {/* Tuition & Intake Column */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#A8382C] text-xs block">
                            {lead.currency} {lead.tuition_fee.toLocaleString()}
                          </span>
                          <span className="text-[11px] text-stone-600 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            {lead.intake}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Counselor & Franchise Scope */}
                      <td className="p-3.5">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-stone-900 block">
                            {lead.counselor_name}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium inline-block">
                            {lead.franchise_name || 'Head Office Central'}
                          </span>
                          {lead.branch_code && (
                            <span className="text-[10px] text-stone-400 block">
                              Code: {lead.branch_code}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Priority & Request Type */}
                      <td className="p-3.5">
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border inline-block ${getPriorityBadge(
                              lead.priority
                            )}`}
                          >
                            {lead.priority} Priority
                          </span>
                          <span className="text-[10px] text-stone-500 block">
                            {lead.request_type}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold border inline-flex items-center gap-1 ${getStatusBadge(
                            lead.status
                          )}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          <span>{lead.status}</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 text-stone-500 hover:text-[#7A2820] hover:bg-stone-100 rounded-lg transition-colors"
                            title="View Lead Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canEditLead && (
                            <button
                              onClick={() => onEditLead(lead)}
                              className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit Lead Information"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                          {(currentUser.role === 'Admin' ||
                            currentUser.role === 'Office Staff' ||
                            currentUser.role === 'Franchise Admin') && (
                            <button
                              onClick={() => {
                                if (
                                  confirm(`Are you sure you want to delete lead for ${lead.student_name}?`)
                                ) {
                                  onDeleteLead(lead.id);
                                }
                              }}
                              className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredLeads.map((lead) => {
            return (
              <div
                key={lead.id}
                onClick={() => setSelectedLead(lead)}
                className="bg-white rounded-2xl border border-stone-200 hover:border-[#A8382C] hover:shadow-md transition-all p-5 space-y-4 cursor-pointer group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Top Bar: Priority & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${getPriorityBadge(
                        lead.priority
                      )}`}
                    >
                      {lead.priority}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadge(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                  </div>

                  {/* Student Name & Contacts */}
                  <div>
                    <h3 className="font-display font-bold text-base text-stone-900 group-hover:text-[#A8382C] transition-colors">
                      {lead.student_name}
                    </h3>
                    <div className="text-xs text-stone-500 space-y-0.5 mt-1">
                      <p className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{lead.student_email}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-stone-400" />
                        <span>{lead.student_phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Course Box */}
                  <div className="bg-[#FBF6F1] p-3 rounded-xl border border-stone-100 space-y-1 text-xs">
                    <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                      Target Course
                    </span>
                    <p className="font-bold text-stone-900 line-clamp-1">{lead.course_name}</p>
                    <p className="text-stone-600 text-[11px]">
                      {lead.university_name} · {lead.city}, {lead.destination_country}
                    </p>
                    <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 mt-1">
                      <span className="font-bold text-[#A8382C]">
                        {lead.currency} {lead.tuition_fee.toLocaleString()}
                      </span>
                      <span className="text-stone-500 text-[10px]">
                        Intake: {lead.intake}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Bar: Counselor & Action buttons */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div>
                    <span className="text-[10px] text-stone-400 block">Counselor:</span>
                    <span className="font-semibold text-stone-800 text-[11px] truncate max-w-[130px] block">
                      {lead.counselor_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {canEditLead && (
                      <button
                        onClick={() => onEditLead(lead)}
                        className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Lead"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedLead(lead)}
                      className="px-2.5 py-1 bg-stone-100 hover:bg-[#A8382C] hover:text-white font-bold rounded-lg text-stone-700 text-[11px] transition-colors"
                    >
                      Details →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Lead Detail & Status Transition Drawer / Modal */}
      {selectedLead && (
        <ViewportOverlay onBackdropClick={() => setSelectedLead(null)}>
          <div
            id="lead-detail-modal-container"
            className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] animate-scale-in"
          >
            {/* Drawer Header */}
            <div className="px-6 py-4.5 bg-gradient-to-r from-[#4A140F] via-[#7A2820] to-[#A8382C] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#C9A227] text-stone-950 shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-display font-bold">
                      {selectedLead.student_name}
                    </h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(
                        selectedLead.status
                      )}`}
                    >
                      {selectedLead.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-200">
                    Lead ID: #{selectedLead.id} · Created {selectedLead.created_at.slice(0, 10)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-2 text-stone-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs sm:text-sm text-stone-800">
              {/* Quick Pipeline Status Stepper Bar */}
              <div className="p-4 rounded-xl bg-[#FBF6F1] border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                    Admission Pipeline Progression
                  </span>
                  {!canEditLead && (
                    <span className="text-[10px] font-bold text-stone-500 bg-stone-200/80 px-2 py-0.5 rounded-full">
                      Status Managed by Admissions Counselor
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    'New Inquiry',
                    'Under Assessment',
                    'Application Submitted',
                    'Conditional Offer',
                    'Unconditional Offer',
                    'Visa Processing',
                    'Enrolled',
                  ].map((stepStatus) => {
                    const isCurrent = selectedLead.status === stepStatus;
                    return (
                      <button
                        key={stepStatus}
                        type="button"
                        disabled={!canEditLead}
                        onClick={() => canEditLead && handleQuickStatusChange(stepStatus as StudentLeadStatus)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isCurrent
                            ? 'bg-[#A8382C] text-white border-[#A8382C] shadow-xs'
                            : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-300'
                        } ${!canEditLead ? 'cursor-default opacity-85' : ''}`}
                      >
                        {stepStatus}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2-Column Grid: Left Student & Course, Right Timeline & Ownership */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Student Details + Selected Course Card */}
                <div className="space-y-4">
                  {/* Student Details Card */}
                  <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <h3 className="font-bold text-sm text-[#7A2820] flex items-center gap-2 border-b border-stone-100 pb-2">
                      <GraduationCap className="w-4 h-4 text-[#A8382C]" />
                      <span>Student Academic Dossier</span>
                    </h3>

                    <div className="grid grid-cols-2 gap-2.5 text-xs">
                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">
                          Email Address
                        </span>
                        <a
                          href={`mailto:${selectedLead.student_email}`}
                          className="font-bold text-stone-800 hover:text-[#A8382C] truncate block"
                        >
                          {selectedLead.student_email}
                        </a>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">
                          Phone / WhatsApp
                        </span>
                        <a
                          href={`https://wa.me/${selectedLead.student_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold text-emerald-700 hover:underline flex items-center gap-1 truncate"
                        >
                          <span>{selectedLead.student_phone}</span>
                        </a>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">
                          Nationality & City
                        </span>
                        <span className="font-semibold text-stone-800">
                          {selectedLead.nationality} ({selectedLead.student_city || 'N/A'})
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">
                          Passport / CNIC
                        </span>
                        <span className="font-semibold text-stone-800">
                          {selectedLead.passport_no || 'Not submitted yet'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">
                          Qualification
                        </span>
                        <span className="font-semibold text-stone-800">
                          {selectedLead.academic_qualification || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">
                          Academic Score
                        </span>
                        <span className="font-bold text-stone-900">
                          {selectedLead.academic_score || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">
                          English Proficiency
                        </span>
                        <span className="font-semibold text-stone-800">
                          {selectedLead.english_test || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-stone-400 block font-semibold">
                          Study Gap
                        </span>
                        <span className="font-semibold text-stone-800">
                          {selectedLead.study_gap_years ? `${selectedLead.study_gap_years} Years` : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Course Card */}
                  <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                      <h3 className="font-bold text-sm text-[#7A2820] flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#A8382C]" />
                        <span>Requested Degree Program</span>
                      </h3>
                      <button
                        onClick={() => {
                          const crs =
                            courses.find((c) => c.course_id === selectedLead.course_id) ||
                            courses.find(
                              (c) =>
                                c.course_name?.trim().toLowerCase() === selectedLead.course_name?.trim().toLowerCase() &&
                                (!selectedLead.destination_country ||
                                  c.destination_country?.trim().toLowerCase() === selectedLead.destination_country?.trim().toLowerCase())
                            ) ||
                            courses.find(
                              (c) => c.course_name?.trim().toLowerCase() === selectedLead.course_name?.trim().toLowerCase()
                            );
                          if (crs) {
                            onSelectCourse(crs);
                          } else {
                            onSelectCourse({
                              course_id: selectedLead.course_id || `course_${selectedLead.id}`,
                              university_id: selectedLead.university_id || 'uni_snapshot',
                              course_name: selectedLead.course_name,
                              program: selectedLead.program_level || 'Postgraduate',
                              duration: 1,
                              duration_unit: 'years',
                              tuition_fee: selectedLead.tuition_fee,
                              currency: selectedLead.currency,
                              intake_months: [selectedLead.intake || 'September 2026'],
                              destination_country: selectedLead.destination_country,
                              city: selectedLead.city,
                              is_active: true,
                              academic_requirements: { min_qualification: selectedLead.academic_qualification || 'Degree' },
                              english_requirements: { minimum_score: selectedLead.english_test || '6.0' },
                            });
                          }
                        }}
                        className="text-xs font-bold text-[#A8382C] hover:underline flex items-center gap-1"
                      >
                        <span>Full Specs</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>

                    <div>
                      <h4 className="font-display font-bold text-sm text-stone-900">
                        {selectedLead.course_name}
                      </h4>
                      <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#A8382C]" />
                        <span className="font-semibold">{selectedLead.university_name}</span>
                        <span>·</span>
                        <span>{selectedLead.city}, {selectedLead.destination_country}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-[#FBF6F1] p-2.5 rounded-xl border border-stone-100">
                      <div>
                        <span className="text-[10px] text-stone-500 font-semibold block">
                          Annual Tuition
                        </span>
                        <span className="font-bold text-sm text-[#A8382C]">
                          {selectedLead.currency} {selectedLead.tuition_fee.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-stone-500 font-semibold block">
                          Target Intake
                        </span>
                        <span className="font-bold text-stone-800">
                          {selectedLead.intake}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ownership, Notes, and Timeline History */}
                <div className="space-y-4">
                  {/* Ownership & Branch Card */}
                  <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-2 text-xs">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Lead Assignment & Branch Ownership
                    </span>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-stone-900 text-sm">
                          {selectedLead.counselor_name}
                        </p>
                        <p className="text-stone-500 text-[11px]">
                          Role: {selectedLead.counselor_role} · {selectedLead.counselor_email}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-[#FBF6F1] font-bold text-stone-800 border border-stone-200">
                        {selectedLead.franchise_name || 'Head Office Central'}
                      </span>
                    </div>

                    {selectedLead.notes && (
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 mt-2">
                        <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider block">
                          Counselor Remarks:
                        </span>
                        <p className="text-stone-700 text-xs mt-0.5">{selectedLead.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Activity Timeline & Counseling Notes */}
                  <div className="p-4 rounded-xl bg-white border border-stone-200 shadow-2xs space-y-3">
                    <h3 className="font-bold text-sm text-[#7A2820] flex items-center gap-2 border-b border-stone-100 pb-2">
                      <Clock className="w-4 h-4 text-[#A8382C]" />
                      <span>Activity Log & Counseling Timeline</span>
                    </h3>

                    {/* Add note input */}
                    <form onSubmit={handleAddTimelineNote} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Add counseling note or application update..."
                        value={newTimelineComment}
                        onChange={(e) => setNewTimelineComment(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-stone-300 bg-white focus:outline-none focus:border-[#A8382C]"
                      />
                      <button
                        type="submit"
                        disabled={!newTimelineComment.trim()}
                        className="px-3 py-1.5 bg-[#A8382C] text-white text-xs font-bold rounded-xl hover:bg-[#7A2820] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Post Note
                      </button>
                    </form>

                    {/* Timeline entries */}
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {[...selectedLead.timeline].reverse().map((event) => (
                        <div
                          key={event.id}
                          className="p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#7A2820]">{event.action}</span>
                            <span className="text-[10px] text-stone-400">{event.date}</span>
                          </div>
                          {event.comment && (
                            <p className="text-stone-700 text-[11px] leading-relaxed">
                              {event.comment}
                            </p>
                          )}
                          <p className="text-[10px] text-stone-500 italic">
                            Logged by {event.performed_by} ({event.performed_by_role})
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
                <div className="flex items-center gap-2">
                  {canEditLead && (
                    <button
                      type="button"
                      onClick={() => {
                        const l = selectedLead;
                        setSelectedLead(null);
                        onEditLead(l);
                      }}
                      className="px-4 py-2 text-xs font-bold text-stone-700 hover:bg-stone-100 rounded-xl border border-stone-300 transition-colors flex items-center gap-1.5"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Full Lead Profile</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const templateMsg = WhatsAppService.getTemplateMessage('lead_summary', selectedLead);
                      WhatsAppService.sendWhatsAppMessage({
                        phoneNumber: selectedLead.student_phone,
                        messageText: templateMsg,
                        leadId: selectedLead.id,
                      });
                      if (onSaveLead) {
                        const formattedDate = new Date().toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });
                        onSaveLead({
                          ...selectedLead,
                          last_whatsapp_sent: new Date().toISOString(),
                          timeline: [
                            ...selectedLead.timeline,
                            {
                              id: `tl_wa_${Date.now()}`,
                              date: formattedDate,
                              action: 'WhatsApp Dispatched',
                              performed_by: currentUser.name || 'Counselor',
                              performed_by_role: currentUser.role || 'Staff',
                              comment: `Quick WhatsApp dispatched with Admission Assessment template`,
                            },
                          ],
                        });
                      }
                    }}
                    className="px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-xl border border-emerald-300 transition-colors flex items-center gap-1.5"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Send WhatsApp Assessment</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLead(null)}
                  className="px-6 py-2 text-xs font-bold text-white bg-stone-800 hover:bg-stone-900 rounded-xl shadow-xs transition-colors"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          </div>
        </ViewportOverlay>
      )}
    </div>
  );
};
