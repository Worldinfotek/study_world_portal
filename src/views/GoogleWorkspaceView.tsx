import React, { useState, useEffect } from 'react';
import {
  Mail,
  Calendar,
  Video,
  FileText,
  Table,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Send,
  Plus,
  RefreshCw,
  Copy,
  Clock,
  User,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  CheckSquare,
  ListTodo,
  Trash2,
  Edit3,
  Filter,
  CalendarCheck,
  Check,
  Square,
  MessageCircle,
  PhoneCall,
  Smartphone,
} from 'lucide-react';
import {
  GoogleWorkspaceService,
  CalendarEventItem,
  GoogleTaskItem,
  GoogleTaskList,
} from '../services/googleWorkspace';
import { WhatsAppService } from '../services/whatsappService';
import { StorageService } from '../utils/storage';
import { StudentLeadRequest, Course, University, UserAccount } from '../types';
import { authHeaders } from '../lib/apiAuth';

interface GoogleWorkspaceViewProps {
  currentUser: UserAccount | null;
  studentLeads: StudentLeadRequest[];
  courses: Course[];
  universities: University[];
  onUpdateLead?: (lead: StudentLeadRequest) => void;
}

export const GoogleWorkspaceView: React.FC<GoogleWorkspaceViewProps> = ({
  currentUser,
  studentLeads,
  courses,
  universities,
  onUpdateLead,
}) => {
  const isSuperAdmin = currentUser?.role === 'Admin' || currentUser?.role?.toLowerCase() === 'admin';
  const [activeTab, setActiveTab] = useState<'gmail' | 'whatsapp' | 'calendar' | 'meet' | 'tasks' | 'docs' | 'sheets' | 'cloudsql'>('gmail');
  const [isSignedInGoogle, setIsSignedInGoogle] = useState<boolean>(false);
  const [googleUserEmail, setGoogleUserEmail] = useState<string>('');
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Auto-switch to an allowed tab if a non-Super Admin is on an admin-restricted tab
  useEffect(() => {
    if (!isSuperAdmin && (activeTab === 'docs' || activeTab === 'sheets' || activeTab === 'cloudsql')) {
      setActiveTab('gmail');
    }
  }, [isSuperAdmin, activeTab]);

  // GMAIL STATE
  const [gmailRecipient, setGmailRecipient] = useState<string>('');
  const [gmailSubject, setGmailSubject] = useState<string>('');
  const [gmailBody, setGmailBody] = useState<string>('');
  const [selectedLeadForEmail, setSelectedLeadForEmail] = useState<string>('');
  const [emailTemplate, setEmailTemplate] = useState<string>('lead_summary');
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [showEmailConfirmModal, setShowEmailConfirmModal] = useState<boolean>(false);
  const [recentEmails, setRecentEmails] = useState<any[]>([]);
  const [isLoadingEmails, setIsLoadingEmails] = useState<boolean>(false);

  // WHATSAPP STATE
  const [whatsappRecipient, setWhatsappRecipient] = useState<string>('');
  const [whatsappMessage, setWhatsappMessage] = useState<string>('');
  const [selectedLeadForWhatsapp, setSelectedLeadForWhatsapp] = useState<string>('');
  const [whatsappTemplate, setWhatsappTemplate] = useState<string>('lead_summary');
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState<boolean>(false);
  const [showWhatsappConfirmModal, setShowWhatsappConfirmModal] = useState<boolean>(false);
  const [whatsappApiUrl, setWhatsappApiUrl] = useState<string>('');
  const [whatsappApiKey, setWhatsappApiKey] = useState<string>('');
  const [showWhatsappApiConfig, setShowWhatsappApiConfig] = useState<boolean>(false);

  // CALENDAR & MEET STATE
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>([]);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState<boolean>(false);
  const [meetTitle, setMeetTitle] = useState<string>('Study World Student Counseling Session');
  const [meetDescription, setMeetDescription] = useState<string>('Comprehensive consultation on academic eligibility, visa processes, and university admission guidelines.');
  const [meetDate, setMeetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [meetTime, setMeetTime] = useState<string>('14:00');
  const [meetDurationMins, setMeetDurationMins] = useState<number>(45);
  const [meetAttendeeEmail, setMeetAttendeeEmail] = useState<string>('');
  const [selectedLeadForMeet, setSelectedLeadForMeet] = useState<string>('');
  const [isCreatingMeet, setIsCreatingMeet] = useState<boolean>(false);
  const [showMeetConfirmModal, setShowMeetConfirmModal] = useState<boolean>(false);
  const [generatedMeetLink, setGeneratedMeetLink] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // GOOGLE TASKS STATE
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState<boolean>(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskNotes, setNewTaskNotes] = useState<string>('');
  const [newTaskDue, setNewTaskDue] = useState<string>('');
  const [selectedLeadForTask, setSelectedLeadForTask] = useState<string>('');
  const [isCreatingTask, setIsCreatingTask] = useState<boolean>(false);
  const [showCreateListModal, setShowCreateListModal] = useState<boolean>(false);
  const [newListTitle, setNewListTitle] = useState<string>('');
  const [isCreatingList, setIsCreatingList] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<GoogleTaskItem | null>(null);
  const [editTaskTitle, setEditTaskTitle] = useState<string>('');
  const [editTaskNotes, setEditTaskNotes] = useState<string>('');
  const [editTaskDue, setEditTaskDue] = useState<string>('');
  const [isSavingTaskEdit, setIsSavingTaskEdit] = useState<boolean>(false);
  const [taskToDelete, setTaskToDelete] = useState<GoogleTaskItem | null>(null);
  const [showTaskDeleteModal, setShowTaskDeleteModal] = useState<boolean>(false);
  const [isDeletingTask, setIsDeletingTask] = useState<boolean>(false);

  // GOOGLE DOCS STATE
  const [selectedLeadForDoc, setSelectedLeadForDoc] = useState<string>('');
  const [isCreatingDoc, setIsCreatingDoc] = useState<boolean>(false);
  const [createdDocsList, setCreatedDocsList] = useState<Array<{ id: string; title: string; link: string; date: string }>>([]);

  // GOOGLE SHEETS STATE
  const [isExportingSheet, setIsExportingSheet] = useState<boolean>(false);
  const [createdSheetsList, setCreatedSheetsList] = useState<Array<{ id: string; title: string; link: string; date: string; type: string }>>([]);

  // CLOUD SQL & FIREBASE STATUS STATE
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [isCheckingDb, setIsCheckingDb] = useState<boolean>(false);

  // Check auth on mount
  useEffect(() => {
    checkGoogleAuth();
  }, []);

  const checkGoogleAuth = async () => {
    setIsSignedInGoogle(false);
  };

  const handleSignInGoogle = async () => {
    setIsAuthLoading(false);
    setStatusMessage({ type: 'error', text: 'Feature not available yet' });
  };

  const handleLogoutGoogle = async () => {
    setIsSignedInGoogle(false);
    setGoogleUserEmail('');
    setStatusMessage({ type: 'error', text: 'Feature not available yet' });
  };

  // Populate Email template based on selected lead
  useEffect(() => {
    if (!selectedLeadForEmail) return;
    const lead = studentLeads.find((l) => l.id === selectedLeadForEmail);
    if (!lead) return;

    setGmailRecipient(lead.student_email);

    if (emailTemplate === 'lead_summary') {
      setGmailSubject(`Study World Consultant: Course Application Assessment - ${lead.student_name}`);
      setGmailBody(
        `Dear ${lead.student_name},\n\n` +
        `Greetings from Study World Consultant.\n\n` +
        `We have reviewed your profile for admission to ${lead.course_name} at ${lead.university_name} (${lead.destination_country}).\n\n` +
        `Summary Details:\n` +
        `• Destination: ${lead.destination_country}\n` +
        `• Institution: ${lead.university_name}\n` +
        `• Program: ${lead.course_name}\n` +
        `• Current Status: ${lead.status}\n` +
        `• Assigned Counselor: ${lead.counselor_name} (${lead.counselor_email || 'Admissions Team'})\n` +
        `• Franchise Office: ${lead.franchise_name}\n\n` +
        `Next Steps:\n` +
        `Please provide your updated academic transcripts, passport copy, and English language test scores so our team can expedite your conditional offer letter.\n\n` +
        `Kind regards,\n` +
        `${lead.counselor_name}\n` +
        `Study World Consultant Global Admissions\n`
      );
    } else if (emailTemplate === 'docs_reminder') {
      setGmailSubject(`Action Required: Missing Documentation for ${lead.university_name}`);
      setGmailBody(
        `Dear ${lead.student_name},\n\n` +
        `To finalize your application for ${lead.course_name} at ${lead.university_name}, please reply to this email with the following documents:\n` +
        `1. Official High School / Degree Transcripts\n` +
        `2. Valid Passport Bio Page\n` +
        `3. English Language Certificate (IELTS / PTE / Duolingo or MOI Certificate)\n` +
        `4. Statement of Purpose (SOP)\n\n` +
        `Feel free to reach out to us directly if you have any questions.\n\n` +
        `Warm regards,\n` +
        `${lead.counselor_name} • ${lead.franchise_name}`
      );
    } else if (emailTemplate === 'meet_invite') {
      setGmailSubject(`Counseling Consultation Confirmation - Study World Consultant`);
      setGmailBody(
        `Dear ${lead.student_name},\n\n` +
        `Your 1-on-1 higher education consultation with Study World Consultant is confirmed.\n\n` +
        `We will discuss course options, scholarship eligibility, and visa procedures for ${lead.destination_country}.\n\n` +
        `${lead.meet_link ? `Google Meet Link: ${lead.meet_link}\n\n` : ''}` +
        `We look forward to speaking with you!\n\n` +
        `Best regards,\n` +
        `${lead.counselor_name}`
      );
    }
  }, [selectedLeadForEmail, emailTemplate, studentLeads]);

  // Populate WhatsApp template based on selected lead
  useEffect(() => {
    if (!selectedLeadForWhatsapp) return;
    const lead = studentLeads.find((l) => l.id === selectedLeadForWhatsapp);
    if (!lead) return;

    setWhatsappRecipient(lead.student_phone || '');
    const generatedMsg = WhatsAppService.getTemplateMessage(whatsappTemplate, lead);
    setWhatsappMessage(generatedMsg);
  }, [selectedLeadForWhatsapp, whatsappTemplate, studentLeads]);

  // SEND WHATSAPP MESSAGE
  const handleExecuteSendWhatsapp = async () => {
    setShowWhatsappConfirmModal(false);
    setIsSendingWhatsapp(true);
    setStatusMessage(null);
    try {
      const res = await WhatsAppService.sendWhatsAppMessage({
        phoneNumber: whatsappRecipient,
        messageText: whatsappMessage,
        leadId: selectedLeadForWhatsapp,
        apiEndpointUrl: whatsappApiUrl,
        apiKey: whatsappApiKey,
      });

      if (selectedLeadForWhatsapp && onUpdateLead) {
        const lead = studentLeads.find((l) => l.id === selectedLeadForWhatsapp);
        if (lead) {
          const formattedDate = new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          });
          onUpdateLead({
            ...lead,
            last_whatsapp_sent: new Date().toISOString(),
            timeline: [
              ...lead.timeline,
              {
                id: `tl_wa_${Date.now()}`,
                date: formattedDate,
                action: 'WhatsApp Dispatched',
                performed_by: currentUser?.name || 'Counselor',
                performed_by_role: currentUser?.role || 'Office Staff',
                comment: `Sent template "${whatsappTemplate}" to ${whatsappRecipient}`,
              },
            ],
          });
        }
      }

      setStatusMessage({
        type: 'success',
        text: res.message || `WhatsApp message prepared and opened for ${whatsappRecipient}!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to dispatch WhatsApp message' });
    } finally {
      setIsSendingWhatsapp(false);
    }
  };

  // SEND GMAIL
  const handleExecuteSendEmail = async () => {
    setShowEmailConfirmModal(false);
    setIsSendingEmail(true);
    setStatusMessage(null);
    try {
      await GoogleWorkspaceService.sendEmail({
        to: gmailRecipient,
        subject: gmailSubject,
        bodyText: gmailBody,
      });

      if (selectedLeadForEmail && onUpdateLead) {
        const lead = studentLeads.find((l) => l.id === selectedLeadForEmail);
        if (lead) {
          onUpdateLead({
            ...lead,
            last_gmail_sent: new Date().toISOString(),
          });
        }
      }

      setStatusMessage({
        type: 'success',
        text: `Email successfully sent to ${gmailRecipient} via official Gmail API!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to send email' });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // LOAD CALENDAR EVENTS
  const loadCalendarEvents = async () => {
    setIsLoadingCalendar(true);
    try {
      const items = await GoogleWorkspaceService.listUpcomingEvents();
      setCalendarEvents(items);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // SCHEDULE CALENDAR & MEET
  const handleExecuteScheduleMeet = async () => {
    setShowMeetConfirmModal(false);
    setIsCreatingMeet(true);
    setStatusMessage(null);
    try {
      const startDateTime = new Date(`${meetDate}T${meetTime}:00`);
      const endDateTime = new Date(startDateTime.getTime() + meetDurationMins * 60 * 1000);

      const res = await GoogleWorkspaceService.createCalendarEventWithMeet({
        summary: meetTitle,
        description: `${meetDescription}\n\nScheduled via Study World Consultant Portal for ${meetAttendeeEmail || 'Student'}.`,
        startTimeIso: startDateTime.toISOString(),
        endTimeIso: endDateTime.toISOString(),
        attendeeEmail: meetAttendeeEmail || undefined,
      });

      setGeneratedMeetLink(res.meetUri || res.htmlLink);

      // Update lead with meet link if attached
      if (selectedLeadForMeet && onUpdateLead) {
        const lead = studentLeads.find((l) => l.id === selectedLeadForMeet);
        if (lead) {
          onUpdateLead({
            ...lead,
            meet_link: res.meetUri || res.htmlLink,
            calendar_event_id: res.eventId,
          });
        }
      }

      setStatusMessage({
        type: 'success',
        text: `Google Calendar event and Google Meet room created successfully!`,
      });
      loadCalendarEvents();
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to schedule event' });
    } finally {
      setIsCreatingMeet(false);
    }
  };

  // INSTANT MEET
  const handleCreateInstantMeet = async () => {
    setIsCreatingMeet(true);
    setStatusMessage(null);
    try {
      const res = await GoogleWorkspaceService.createInstantMeetSpace();
      setGeneratedMeetLink(res.meetingUri);
      setStatusMessage({
        type: 'success',
        text: 'Instant Google Meet room ready! Share the link with your student or colleague.',
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create instant meet space' });
    } finally {
      setIsCreatingMeet(false);
    }
  };

  // GOOGLE TASKS HANDLERS
  const loadGoogleTasks = async (listId?: string) => {
    setIsLoadingTasks(true);
    try {
      const lists = await GoogleWorkspaceService.listTaskLists();
      const safeLists = lists && lists.length > 0 ? lists : StorageService.getTaskLists();
      setTaskLists(safeLists);
      const targetListId = listId !== undefined ? listId : (selectedTaskListId || (safeLists[0]?.id || '@default'));
      setSelectedTaskListId(targetListId);
      const items = await GoogleWorkspaceService.listTasks(targetListId);
      setTasks(items || []);
    } catch (err: any) {
      console.warn('Failed to load tasks from Google Tasks, loaded from local storage:', err);
      const localLists = StorageService.getTaskLists();
      setTaskLists(localLists);
      const targetListId = listId || selectedTaskListId || '@default';
      setTasks(StorageService.getTasks(targetListId));
    } finally {
      setIsLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tasks') {
      loadGoogleTasks();
    }
  }, [activeTab, isSignedInGoogle]);

  const handleCreateTask = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsCreatingTask(true);
    setStatusMessage(null);
    try {
      let finalNotes = newTaskNotes.trim();
      if (selectedLeadForTask) {
        const lead = studentLeads.find((l) => l.id === selectedLeadForTask);
        if (lead) {
          const leadMeta = `\n--- Student Lead Reference ---\nName: ${lead.student_name}\nEmail: ${lead.student_email}\nPhone: ${lead.student_phone || 'N/A'}\nCountry: ${lead.destination_country}\nRequest: ${lead.request_type || 'Admissions Counseling'}`;
          finalNotes = finalNotes ? `${finalNotes}\n${leadMeta}` : leadMeta.trim();
        }
      }

      const created = await GoogleWorkspaceService.createTask(selectedTaskListId, {
        title: newTaskTitle.trim(),
        notes: finalNotes,
        due: newTaskDue ? `${newTaskDue}T00:00:00.000Z` : undefined,
      });

      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle('');
      setNewTaskNotes('');
      setNewTaskDue('');
      setSelectedLeadForTask('');
      setStatusMessage({
        type: 'success',
        text: `Task "${created.title}" successfully added to Google Tasks!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create task in Google Tasks' });
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleToggleTaskStatus = async (task: GoogleTaskItem) => {
    if (!task.id) return;
    const nextCompleted = task.status !== 'completed';
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: nextCompleted ? 'completed' : 'needsAction' }
          : t
      )
    );

    try {
      await GoogleWorkspaceService.updateTaskStatus(selectedTaskListId, task.id, nextCompleted);
    } catch (err: any) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id
            ? { ...t, status: task.status }
            : t
        )
      );
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update task status in Google Tasks' });
    }
  };

  const handleOpenEditTask = (task: GoogleTaskItem) => {
    setEditingTask(task);
    setEditTaskTitle(task.title || '');
    setEditTaskNotes(task.notes || '');
    setEditTaskDue(task.due ? task.due.split('T')[0] : '');
  };

  const handleSaveTaskEdit = async () => {
    if (!editingTask || !editingTask.id || !editTaskTitle.trim()) return;
    setIsSavingTaskEdit(true);
    try {
      const updated = await GoogleWorkspaceService.updateTaskDetails(
        selectedTaskListId,
        editingTask.id,
        {
          title: editTaskTitle.trim(),
          notes: editTaskNotes.trim(),
          due: editTaskDue ? `${editTaskDue}T00:00:00.000Z` : undefined,
        }
      );
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...t, ...updated } : t)));
      setEditingTask(null);
      setStatusMessage({ type: 'success', text: 'Task updated successfully in Google Tasks!' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update task' });
    } finally {
      setIsSavingTaskEdit(false);
    }
  };

  const handleOpenDeleteTask = (task: GoogleTaskItem) => {
    setTaskToDelete(task);
    setShowTaskDeleteModal(true);
  };

  const handleExecuteDeleteTask = async () => {
    if (!taskToDelete || !taskToDelete.id) return;
    setIsDeletingTask(true);
    try {
      await GoogleWorkspaceService.deleteTask(selectedTaskListId, taskToDelete.id);
      setTasks((prev) => prev.filter((t) => t.id !== taskToDelete.id));
      setShowTaskDeleteModal(false);
      setTaskToDelete(null);
      setStatusMessage({ type: 'success', text: 'Task removed from Google Tasks.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to delete task' });
    } finally {
      setIsDeletingTask(false);
    }
  };

  const handleCreateNewTaskList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;
    setIsCreatingList(true);
    try {
      const newList = await GoogleWorkspaceService.createTaskList(newListTitle.trim());
      setTaskLists((prev) => [...prev, newList]);
      setSelectedTaskListId(newList.id);
      setNewListTitle('');
      setShowCreateListModal(false);
      loadGoogleTasks(newList.id);
      setStatusMessage({ type: 'success', text: `Task List "${newList.title}" created in Google Tasks!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create task list' });
    } finally {
      setIsCreatingList(false);
    }
  };

  // GENERATE GOOGLE DOC
  const handleGenerateDoc = async () => {
    if (!selectedLeadForDoc) return;
    const lead = studentLeads.find((l) => l.id === selectedLeadForDoc);
    if (!lead) return;

    const course = courses.find((c) => c.course_id === lead.course_id);

    setIsCreatingDoc(true);
    setStatusMessage(null);
    try {
      const res = await GoogleWorkspaceService.createStudentAssessmentDoc(lead, course);
      setCreatedDocsList((prev) => [
        {
          id: res.documentId,
          title: res.title,
          link: res.webViewLink,
          date: new Date().toLocaleTimeString(),
        },
        ...prev,
      ]);

      if (onUpdateLead) {
        onUpdateLead({
          ...lead,
          google_doc_id: res.documentId,
          google_doc_url: res.webViewLink,
        });
      }

      setStatusMessage({
        type: 'success',
        text: `Google Doc "${res.title}" created in Google Drive!`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create Google Doc' });
    } finally {
      setIsCreatingDoc(false);
    }
  };

  // EXPORT TO GOOGLE SHEETS
  const handleExportLeadsSheet = async () => {
    setIsExportingSheet(true);
    setStatusMessage(null);
    try {
      const res = await GoogleWorkspaceService.exportLeadsToSheet(studentLeads);
      setCreatedSheetsList((prev) => [
        {
          id: res.spreadsheetId,
          title: res.title,
          link: res.spreadsheetUrl,
          date: new Date().toLocaleTimeString(),
          type: 'Student Leads',
        },
        ...prev,
      ]);
      setStatusMessage({
        type: 'success',
        text: `Exported ${studentLeads.length} leads to Google Sheets: "${res.title}"`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to export to Google Sheets' });
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleExportCoursesSheet = async () => {
    setIsExportingSheet(true);
    setStatusMessage(null);
    try {
      const res = await GoogleWorkspaceService.exportCoursesToSheet(courses, universities);
      setCreatedSheetsList((prev) => [
        {
          id: res.spreadsheetId,
          title: res.title,
          link: res.spreadsheetUrl,
          date: new Date().toLocaleTimeString(),
          type: 'Courses Catalog',
        },
        ...prev,
      ]);
      setStatusMessage({
        type: 'success',
        text: `Exported ${courses.length} courses to Google Sheets: "${res.title}"`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to export courses' });
    } finally {
      setIsExportingSheet(false);
    }
  };

  // CHECK CLOUD SQL STATUS
  const handleCheckDbStatus = async () => {
    setIsCheckingDb(true);
    try {
      const res = await fetch('/api/cloudsql/status', { headers: authHeaders() });
      const data = await res.json();
      setDbStatus(data);
    } catch (err: any) {
      setDbStatus({ success: false, error: err.message });
    } finally {
      setIsCheckingDb(false);
    }
  };

  return (
    <div id="google-workspace-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Google Workspace & Cloud Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Shield className="w-3 h-3 text-emerald-600" />
                Cloud SQL • Firebase • OAuth
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Google Workspace Integration</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isSuperAdmin
                ? 'Directly communicate via Gmail, schedule with Google Calendar & Meet, generate Google Docs dossiers, and sync live Google Sheets with Cloud SQL.'
                : 'Directly communicate with students via Gmail, schedule appointments with Google Calendar, and host virtual counseling sessions with Google Meet.'}
            </p>
          </div>

          {/* Google Auth Status / Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
            {isSignedInGoogle ? (
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <p className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" /> Master Admin Connected
                  </p>
                  <p className="text-xs font-mono text-emerald-700 font-medium max-w-[220px] truncate">{googleUserEmail || 'Not connected'}</p>
                  <span className="text-[10px] text-slate-400 block">Unified connector for all users & database</span>
                </div>
                <button
                  id="btn-workspace-disconnect"
                  onClick={handleLogoutGoogle}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">Master Admin Account</p>
                  <p className="text-xs font-mono text-slate-500">Feature not available yet</p>
                  <span className="text-[10px] text-slate-400 block">Required for all users & database sync</span>
                </div>
                <button
                  id="btn-workspace-signin-google"
                  onClick={handleSignInGoogle}
                  disabled={isAuthLoading}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition"
                >
                  {isAuthLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                  Connect Admin Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Status Notification */}
        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-lg text-sm flex items-start gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : statusMessage.type === 'error'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            ) : statusMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
            ) : (
              <Clock className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            )}
            <p className="flex-1">{statusMessage.text}</p>
            <button onClick={() => setStatusMessage(null)} className="text-xs opacity-70 hover:opacity-100 font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-6 border-b border-slate-200 pb-2">
          <button
            id="tab-btn-gmail"
            onClick={() => setActiveTab('gmail')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'gmail' ? 'bg-red-50 text-red-700 border border-red-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Mail className="w-4 h-4 text-red-600" />
            Gmail Communications
          </button>

          <button
            id="tab-btn-whatsapp"
            onClick={() => {
              setActiveTab('whatsapp');
              if (selectedLeadForEmail && !selectedLeadForWhatsapp) {
                setSelectedLeadForWhatsapp(selectedLeadForEmail);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'whatsapp' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>WhatsApp Messages</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">Free API</span>
          </button>

          <button
            id="tab-btn-calendar"
            onClick={() => {
              setActiveTab('calendar');
              if (isSignedInGoogle) loadCalendarEvents();
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'calendar' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            Google Calendar & Appointments
          </button>

          <button
            id="tab-btn-meet"
            onClick={() => setActiveTab('meet')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'meet' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-600" />
            Google Meet Rooms
          </button>

          <button
            id="tab-btn-tasks"
            onClick={() => {
              setActiveTab('tasks');
              if (isSignedInGoogle) loadGoogleTasks();
            }}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
              activeTab === 'tasks' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-600" />
            Google Tasks
          </button>

          {/* Super Admin Restricted Tabs */}
          {isSuperAdmin && (
            <>
              <button
                id="tab-btn-docs"
                onClick={() => setActiveTab('docs')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                  activeTab === 'docs' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Google Docs Dossiers</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">Admin</span>
              </button>

              <button
                id="tab-btn-sheets"
                onClick={() => setActiveTab('sheets')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                  activeTab === 'sheets' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Table className="w-4 h-4 text-teal-600" />
                <span>Google Sheets Live Sync</span>
                <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold">Admin</span>
              </button>

              <button
                id="tab-btn-cloudsql"
                onClick={() => {
                  setActiveTab('cloudsql');
                  handleCheckDbStatus();
                }}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition ${
                  activeTab === 'cloudsql' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Database className="w-4 h-4 text-purple-600" />
                <span>Cloud SQL (PostgreSQL)</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-bold">Admin</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* ==========================================
          TAB 1: GMAIL HUB
      ========================================== */}
      {activeTab === 'gmail' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-600" />
                Compose & Dispatch via Gmail
              </h2>
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                Official Gmail API
              </span>
            </div>

            {/* Quick autofill from student lead */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Autofill from Student Lead
                </label>
                <select
                  id="select-email-student-lead"
                  value={selectedLeadForEmail}
                  onChange={(e) => setSelectedLeadForEmail(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose a Student Lead --</option>
                  {studentLeads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.student_name} • {lead.university_name} ({lead.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Template
                </label>
                <select
                  id="select-email-template"
                  value={emailTemplate}
                  onChange={(e) => setEmailTemplate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lead_summary">Assessment & Eligibility Summary</option>
                  <option value="docs_reminder">Missing Documents Notice</option>
                  <option value="meet_invite">Counseling Consultation Confirmation</option>
                </select>
              </div>
            </div>

            {/* Recipient & Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Recipient Email (To:)</label>
              <input
                id="input-gmail-recipient"
                type="email"
                placeholder="student@example.com or admissions@partneruniversity.ac.uk"
                value={gmailRecipient}
                onChange={(e) => setGmailRecipient(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
              <input
                id="input-gmail-subject"
                type="text"
                placeholder="Study World Consultant: Course Admission Update"
                value={gmailSubject}
                onChange={(e) => setGmailSubject(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Message Body</label>
              <textarea
                id="input-gmail-body"
                rows={9}
                value={gmailBody}
                onChange={(e) => setGmailBody(e.target.value)}
                placeholder="Write your email message..."
                className="w-full text-sm font-sans bg-white border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <p className="text-xs text-slate-500">
                Emails are sent securely directly from your authorized Google Workspace account.
              </p>
              <div className="flex items-center gap-2">
                <button
                  id="btn-trigger-quick-whatsapp-from-gmail"
                  type="button"
                  onClick={() => {
                    if (selectedLeadForEmail) {
                      setSelectedLeadForWhatsapp(selectedLeadForEmail);
                      setActiveTab('whatsapp');
                    } else {
                      setActiveTab('whatsapp');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-xs transition"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Send WhatsApp</span>
                </button>

                <button
                  id="btn-trigger-send-gmail"
                  onClick={() => setShowEmailConfirmModal(true)}
                  disabled={!gmailRecipient || !gmailSubject || !gmailBody || isSendingEmail}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg shadow-sm transition"
                >
                  {isSendingEmail ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Send with Gmail
                </button>
              </div>
            </div>
          </div>

          {/* Side Info & Lead Quick List */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                Active Student Leads
              </h3>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {studentLeads.slice(0, 8).map((l) => (
                  <div
                    key={l.id}
                    onClick={() => setSelectedLeadForEmail(l.id)}
                    className={`p-2.5 rounded-lg border text-xs cursor-pointer transition ${
                      selectedLeadForEmail === l.id
                        ? 'bg-red-50 border-red-300 text-red-900'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-semibold">
                      <span>{l.student_name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200">
                        {l.status}
                      </span>
                    </div>
                    <p className="text-slate-500 truncate text-[11px] mt-0.5">{l.course_name}</p>
                    {l.last_gmail_sent && (
                      <p className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 inline" /> Sent {new Date(l.last_gmail_sent).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 text-xs text-slate-700">
              <h4 className="font-bold text-red-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                Workspace Direct Send
              </h4>
              <p className="leading-relaxed">
                Sends RFC 2822 compliant MIME emails via Google's OAuth2 endpoints with full Unicode support and custom branding.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB: WHATSAPP DIRECT API TRANSMISSION
      ========================================== */}
      {activeTab === 'whatsapp' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">WhatsApp Student Direct API</h2>
                  <p className="text-xs text-slate-500">Instant personalized candidate messaging with zero API charges</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWhatsappApiConfig(!showWhatsappApiConfig)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
              >
                {showWhatsappApiConfig ? 'Hide Custom Gateway' : 'Custom Webhook API (Optional)'}
              </button>
            </div>

            {/* Optional Custom Webhook / API URL */}
            {showWhatsappApiConfig && (
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">Custom WhatsApp Gateway / Webhook Config</span>
                  <span className="text-[10px] text-emerald-700">Optional (Defaults to Free Direct WhatsApp Web/App API)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Webhook Endpoint URL</label>
                    <input
                      type="url"
                      placeholder="https://api.yourdomain.com/send-whatsapp"
                      value={whatsappApiUrl}
                      onChange={(e) => setWhatsappApiUrl(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">API Key / Token (if required)</label>
                    <input
                      type="password"
                      placeholder="Bearer token or secret key"
                      value={whatsappApiKey}
                      onChange={(e) => setWhatsappApiKey(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Quick autofill from student lead */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Autofill from Student Lead
                </label>
                <select
                  id="select-whatsapp-student-lead"
                  value={selectedLeadForWhatsapp}
                  onChange={(e) => setSelectedLeadForWhatsapp(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Select a Student Lead --</option>
                  {studentLeads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.student_name} ({lead.student_phone || 'No Phone'}) • {lead.university_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ready-Made WhatsApp Template
                </label>
                <select
                  id="select-whatsapp-template"
                  value={whatsappTemplate}
                  onChange={(e) => setWhatsappTemplate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="lead_summary">🎓 Admission Assessment & University Specs</option>
                  <option value="docs_reminder">⚠️ Documentation Checklist Reminder</option>
                  <option value="meet_consultation">📅 1-on-1 Counseling Session Invite</option>
                  <option value="offer_letter_congrats">🎉 Conditional Offer Letter Congratulations</option>
                </select>
              </div>
            </div>

            {/* Recipient Phone */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Student Phone Number (with Country Code)
                </label>
                {whatsappRecipient && (
                  <span className="text-[11px] text-emerald-700 font-mono font-semibold">
                    API Target: +{WhatsAppService.formatInternationalPhone(whatsappRecipient)}
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="input-whatsapp-recipient"
                  type="text"
                  placeholder="e.g. +92 334 5566778, +971 50 123 4567, or 03001234567"
                  value={whatsappRecipient}
                  onChange={(e) => setWhatsappRecipient(e.target.value)}
                  className="w-full text-sm bg-white border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-slate-800 focus:ring-2 focus:ring-emerald-500"
                />
                <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Supports all international formats. Leading country codes (e.g. +92, +971, +44, +1) are auto-formatted.
              </p>
            </div>

            {/* WhatsApp Message Body */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">WhatsApp Message Content</label>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(whatsappMessage);
                    setStatusMessage({ type: 'info', text: 'WhatsApp message copied to clipboard!' });
                  }}
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" /> Copy Message
                </button>
              </div>
              <textarea
                id="input-whatsapp-body"
                rows={10}
                value={whatsappMessage}
                onChange={(e) => setWhatsappMessage(e.target.value)}
                placeholder="Type your WhatsApp message..."
                className="w-full text-sm font-sans bg-white border border-slate-300 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free Universal WhatsApp API Protocol — Opens desktop, web & mobile client instantly</span>
              </div>
              <button
                id="btn-trigger-send-whatsapp"
                onClick={() => setShowWhatsappConfirmModal(true)}
                disabled={!whatsappRecipient || !whatsappMessage.trim() || isSendingWhatsapp}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-xs transition"
              >
                {isSendingWhatsapp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                Send WhatsApp Message
              </button>
            </div>
          </div>

          {/* Right Column: Lead Contacts & Quick Dispatch */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Student Lead Contacts
                </span>
                <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                  {studentLeads.length} Leads
                </span>
              </h3>

              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {studentLeads.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => {
                      setSelectedLeadForWhatsapp(l.id);
                    }}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition ${
                      selectedLeadForWhatsapp === l.id
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span className="truncate">{l.student_name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200">
                        {l.status}
                      </span>
                    </div>

                    <p className="text-slate-600 font-mono text-[11px] mt-1 flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-600 inline" />
                      {l.student_phone || 'No phone'}
                    </p>

                    <p className="text-slate-500 truncate text-[11px] mt-0.5">
                      {l.course_name} · {l.university_name}
                    </p>

                    {l.last_whatsapp_sent ? (
                      <p className="text-[10px] text-emerald-700 mt-1 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        WhatsApp Sent: {new Date(l.last_whatsapp_sent).toLocaleDateString()}
                      </p>
                    ) : (
                      <p className="text-[10px] text-stone-400 mt-1">No WhatsApp sent yet</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
              <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Free Universal WhatsApp API
              </h4>
              <p className="leading-relaxed text-emerald-800 text-[11px]">
                Pre-fills professional templates with student dossiers, degree program specs, tuition costs, and meeting links. Dispatches directly via WhatsApp Web, Desktop, and Mobile.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: GOOGLE CALENDAR & APPOINTMENTS
      ========================================== */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Schedule Consultation on Google Calendar
              </h2>
              <button
                onClick={loadCalendarEvents}
                disabled={isLoadingCalendar}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingCalendar ? 'animate-spin' : ''}`} />
                Refresh Schedule
              </button>
            </div>

            {/* Select lead to autofill */}
            <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Link to Student Lead
              </label>
              <select
                id="select-calendar-lead"
                value={selectedLeadForMeet}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedLeadForMeet(val);
                  const lead = studentLeads.find((l) => l.id === val);
                  if (lead) {
                    setMeetTitle(`Study World Counseling: ${lead.student_name} (${lead.destination_country})`);
                    setMeetAttendeeEmail(lead.student_email);
                  }
                }}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Optional: Choose a Student Lead --</option>
                {studentLeads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.student_name} • {lead.course_name} ({lead.franchise_name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Title</label>
              <input
                id="input-calendar-title"
                type="text"
                value={meetTitle}
                onChange={(e) => setMeetTitle(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                <input
                  id="input-calendar-date"
                  type="date"
                  value={meetDate}
                  onChange={(e) => setMeetDate(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Time</label>
                <input
                  id="input-calendar-time"
                  type="time"
                  value={meetTime}
                  onChange={(e) => setMeetTime(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration</label>
                <select
                  id="select-calendar-duration"
                  value={meetDurationMins}
                  onChange={(e) => setMeetDurationMins(Number(e.target.value))}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800"
                >
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>1 Hour</option>
                  <option value={90}>1.5 Hours</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Student / Invitee Email</label>
              <input
                id="input-calendar-attendee"
                type="email"
                placeholder="student@example.com"
                value={meetAttendeeEmail}
                onChange={(e) => setMeetAttendeeEmail(e.target.value)}
                className="w-full text-sm bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Agenda / Counseling Notes</label>
              <textarea
                id="input-calendar-description"
                rows={3}
                value={meetDescription}
                onChange={(e) => setMeetDescription(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Video className="w-3.5 h-3.5 text-emerald-600 inline" /> Automatically attaches a Google Meet video conference.
              </p>
              <button
                id="btn-trigger-schedule-calendar"
                onClick={() => setShowMeetConfirmModal(true)}
                disabled={!meetTitle || !meetDate || !meetTime || isCreatingMeet}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg shadow-sm transition"
              >
                {isCreatingMeet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add to Google Calendar
              </button>
            </div>
          </div>

          {/* Upcoming Events List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Upcoming Consultations
              </span>
              <span className="text-xs text-slate-500">{calendarEvents.length} events</span>
            </h3>

            <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
              {calendarEvents.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
                  No upcoming events loaded. Click "Refresh Schedule" or schedule your first counseling session.
                </div>
              ) : (
                calendarEvents.map((evt, idx) => (
                  <div key={evt.id || idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <p className="font-semibold text-slate-900 truncate">{evt.summary}</p>
                    <p className="text-slate-500 text-[11px]">
                      {new Date(evt.start.dateTime || '').toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {evt.hangoutLink && (
                      <a
                        href={evt.hangoutLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:underline font-medium mt-1"
                      >
                        <Video className="w-3 h-3" /> Join Google Meet
                      </a>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 3: GOOGLE MEET ROOMS
      ========================================== */}
      {activeTab === 'meet' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Video className="w-5 h-5 text-emerald-600" />
              Instant Google Meet Room
            </h2>
            <p className="text-sm text-slate-600">
              Generate a high-definition 1-on-1 student consultation room with Google Meet video conferencing for instant student walk-ins, franchise syncs, or university interviews.
            </p>

            <div className="pt-2">
              <button
                id="btn-create-instant-meet"
                onClick={handleCreateInstantMeet}
                disabled={isCreatingMeet}
                className="flex items-center justify-center gap-2 w-full py-3.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-sm transition"
              >
                {isCreatingMeet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-5 h-5" />}
                Generate Instant Google Meet Room
              </button>
            </div>

            {generatedMeetLink && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Meeting Link Ready
                  </span>
                  <a
                    href={generatedMeetLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-1"
                  >
                    Join Room <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-emerald-200">
                  <input
                    type="text"
                    readOnly
                    value={generatedMeetLink}
                    className="w-full text-xs font-mono text-slate-800 bg-transparent outline-none"
                  />
                  <button
                    id="btn-copy-meet-link"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedMeetLink);
                      setCopiedLink(true);
                      setTimeout(() => setCopiedLink(false), 2500);
                    }}
                    className="px-3 py-1 text-xs font-medium text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded flex items-center gap-1 shrink-0"
                  >
                    {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedLink ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500" />
              Student Leads with Video Consultations
            </h3>
            <p className="text-xs text-slate-500">
              Students who have had a Google Meet session attached to their application:
            </p>

            <div className="space-y-2 max-h-[320px] overflow-y-auto">
              {studentLeads.filter((l) => l.meet_link).length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No active student leads with scheduled Google Meet links yet.
                </div>
              ) : (
                studentLeads
                  .filter((l) => l.meet_link)
                  .map((l) => (
                    <div key={l.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between font-semibold text-slate-900">
                        <span>{l.student_name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                          Meet Active
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate">{l.course_name} • {l.university_name}</p>
                      <a
                        href={l.meet_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium hover:underline pt-1"
                      >
                        <Video className="w-3 h-3" /> {l.meet_link} <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB: GOOGLE TASKS (COUNSELOR TASK MANAGER)
      ========================================== */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          {/* Top Controls & List Switcher */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Task List:</span>
                  <select
                    id="select-google-tasklist"
                    value={selectedTaskListId}
                    onChange={(e) => {
                      setSelectedTaskListId(e.target.value);
                      loadGoogleTasks(e.target.value);
                    }}
                    className="text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg py-1.5 px-3 text-slate-800 focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="@default">Default My Tasks</option>
                    {taskLists
                      .filter((l) => l.id !== '@default')
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.title}
                        </option>
                      ))}
                  </select>
                </div>

                <button
                  id="btn-new-task-list"
                  onClick={() => setShowCreateListModal(true)}
                  className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-dashed border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> New List
                </button>

                <button
                  id="btn-sync-tasks"
                  onClick={() => loadGoogleTasks(selectedTaskListId)}
                  disabled={isLoadingTasks}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingTasks ? 'animate-spin text-amber-600' : ''}`} />
                  Sync with Google Tasks
                </button>
              </div>

              {/* Status Filters & Counters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setTaskFilter('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    taskFilter === 'all'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setTaskFilter('pending')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    taskFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Pending ({tasks.filter((t) => t.status !== 'completed').length})
                </button>
                <button
                  onClick={() => setTaskFilter('completed')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    taskFilter === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Completed ({tasks.filter((t) => t.status === 'completed').length})
                </button>
              </div>
            </div>

            {/* Quick Completion Progress Bar */}
            {tasks.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.round(
                        (tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100
                      )}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-slate-500 shrink-0">
                  {Math.round(
                    (tasks.filter((t) => t.status === 'completed').length / tasks.length) * 100
                  )}
                  % Completed ({tasks.filter((t) => t.status === 'completed').length}/{tasks.length})
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Add Task Card & Tasks List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Quick Add Task Card */}
              <form
                onSubmit={handleCreateTask}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-amber-600" />
                    Create Task in Google Tasks
                  </h3>
                  <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-medium border border-amber-200">
                    Live Tasks Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <input
                      type="text"
                      placeholder="Task Title (e.g. Verify Ali's bank statement for UK CAS application)..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <input
                      type="date"
                      value={newTaskDue}
                      onChange={(e) => setNewTaskDue(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Link with Student Lead (Optional)
                    </label>
                    <select
                      value={selectedLeadForTask}
                      onChange={(e) => {
                        setSelectedLeadForTask(e.target.value);
                        if (e.target.value && !newTaskTitle) {
                          const lead = studentLeads.find((l) => l.id === e.target.value);
                          if (lead) {
                            setNewTaskTitle(`Counseling follow-up for ${lead.student_name}`);
                          }
                        }
                      }}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">-- No specific lead linked --</option>
                      {studentLeads.map((lead) => (
                        <option key={lead.id} value={lead.id}>
                          {lead.student_name} — {lead.destination_country} ({lead.status})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Notes & Checklist Details
                    </label>
                    <input
                      type="text"
                      placeholder="Additional notes, specific document instructions, or links..."
                      value={newTaskNotes}
                      onChange={(e) => setNewTaskNotes(e.target.value)}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                    <span>Syncs with your mobile & desktop Google Tasks app</span>
                  </div>

                  <button
                    id="btn-submit-create-task"
                    type="submit"
                    disabled={isCreatingTask || !newTaskTitle.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5 transition"
                  >
                    {isCreatingTask ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    Add Task
                  </button>
                </div>
              </form>

              {/* Tasks List */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ListTodo className="w-4 h-4 text-amber-600" />
                    Tasks in {taskLists.find((l) => l.id === selectedTaskListId)?.title || 'Selected List'}
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    Showing{' '}
                    {
                      tasks.filter((t) => {
                        if (taskFilter === 'pending') return t.status !== 'completed';
                        if (taskFilter === 'completed') return t.status === 'completed';
                        return true;
                      }).length
                    }{' '}
                    item(s)
                  </span>
                </div>

                {isLoadingTasks ? (
                  <div className="py-12 flex flex-col items-center justify-center text-slate-500 space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-600" />
                    <p className="text-xs">Fetching tasks from Google Tasks...</p>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <CheckSquare className="w-10 h-10 mx-auto text-slate-300" />
                    <p className="text-xs font-medium text-slate-600">No tasks in this list yet.</p>
                    <p className="text-[11px] text-slate-400">
                      Create your first task above or choose one of the counselor presets on the right.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks
                      .filter((t) => {
                        if (taskFilter === 'pending') return t.status !== 'completed';
                        if (taskFilter === 'completed') return t.status === 'completed';
                        return true;
                      })
                      .map((task) => {
                        const isDone = task.status === 'completed';
                        const isOverdue =
                          task.due &&
                          !isDone &&
                          new Date(task.due.split('T')[0]).getTime() <
                            new Date(new Date().toISOString().split('T')[0]).getTime();

                        return (
                          <div
                            key={task.id}
                            className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 group ${
                              isDone
                                ? 'bg-slate-50/70 border-slate-200 opacity-75'
                                : isOverdue
                                ? 'bg-red-50/40 border-red-200 hover:border-red-300'
                                : 'bg-white border-slate-200 hover:border-amber-300 shadow-xs'
                            }`}
                          >
                            {/* Checkbox Button */}
                            <button
                              onClick={() => handleToggleTaskStatus(task)}
                              className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                                isDone
                                  ? 'bg-emerald-600 text-white'
                                  : 'border-2 border-slate-300 hover:border-amber-600 bg-white'
                              }`}
                              title={isDone ? 'Mark as pending' : 'Mark as completed'}
                            >
                              {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            {/* Task Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p
                                  className={`text-xs font-semibold ${
                                    isDone
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-800'
                                  }`}
                                >
                                  {task.title}
                                </p>

                                {task.due && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                                      isDone
                                        ? 'bg-slate-100 text-slate-500'
                                        : isOverdue
                                        ? 'bg-red-100 text-red-800 border border-red-200 animate-pulse'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}
                                  >
                                    <CalendarCheck className="w-3 h-3" />
                                    {isOverdue && !isDone ? 'Overdue: ' : 'Due: '}
                                    {new Date(task.due).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                    })}
                                  </span>
                                )}

                                {isDone && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                                    Done
                                  </span>
                                )}
                              </div>

                              {task.notes && (
                                <p className="text-[11px] text-slate-500 mt-1 whitespace-pre-line bg-slate-50 p-2 rounded-lg border border-slate-100 font-sans">
                                  {task.notes}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 shrink-0">
                              <button
                                onClick={() => handleOpenEditTask(task)}
                                className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                                title="Edit Task"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteTask(task)}
                                className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Counselor Admissions Presets & Standard SOPs */}
            <div className="space-y-4">
              {/* Counselor Presets */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Counselor Quick SOP Presets
                  </h3>
                </div>

                <p className="text-[11px] text-slate-500">
                  Click any standard admission step to instantly generate a tracked Google Task:
                </p>

                <div className="space-y-2">
                  {[
                    {
                      title: 'Verify Passport & Academic Transcripts',
                      notes: 'Audit original degrees, mark sheets, passport validity (> 6 months), and English language test certificate.',
                      daysAhead: 1,
                    },
                    {
                      title: 'Submit University Application Portal Filing',
                      notes: 'Upload applicant dossier, Statement of Purpose (SOP), letters of recommendation, and pay application fee.',
                      daysAhead: 3,
                    },
                    {
                      title: 'Review Bank Statement & Financial Solvency',
                      notes: 'Verify 28-day holding funds, sponsor affidavit of support, and official bank letter against Embassy criteria.',
                      daysAhead: 5,
                    },
                    {
                      title: 'Schedule Embassy Pre-Visa Mock Interview',
                      notes: 'Conduct 45-minute comprehensive mock session on genuine temporary entrant (GTE), university choice, and financials.',
                      daysAhead: 7,
                    },
                    {
                      title: 'Follow Up on Conditional Offer Letter & Invoice',
                      notes: 'Check admission portal status, request conditional clearance, and forward tuition deposit invoice to student.',
                      daysAhead: 2,
                    },
                    {
                      title: 'Pre-Departure Briefing & Accommodation Check',
                      notes: 'Review flight tickets, airport pickup, university dormitory/private tenancy contract, and currency conversion.',
                      daysAhead: 14,
                    },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const targetDate = new Date();
                        targetDate.setDate(targetDate.getDate() + preset.daysAhead);
                        setNewTaskTitle(preset.title);
                        setNewTaskNotes(preset.notes);
                        setNewTaskDue(targetDate.toISOString().split('T')[0]);
                      }}
                      className="w-full text-left p-2.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 transition group"
                    >
                      <p className="text-xs font-semibold text-slate-800 group-hover:text-amber-900 flex items-center justify-between">
                        <span>{preset.title}</span>
                        <Plus className="w-3 h-3 text-slate-400 group-hover:text-amber-700" />
                      </p>
                      <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{preset.notes}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Task List Management & Help */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200/60 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-700" />
                  <h4 className="text-xs font-bold text-amber-900">Google Tasks Synchronization</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All tasks created here are stored securely in Google Tasks under your unified master admin account. They reflect automatically across Google Calendar, Gmail sidebar, and mobile Google Tasks apps.
                </p>
                <div className="text-[11px] text-amber-800 space-y-1 font-medium bg-amber-50/80 p-3 rounded-lg border border-amber-200">
                  <p>✓ Instant cloud synchronization</p>
                  <p>✓ Bi-directional completion state</p>
                  <p>✓ Integrated with Student Lead pipelines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 4: GOOGLE DOCS DOSSIERS (SUPER ADMIN ONLY)
      ========================================== */}
      {activeTab === 'docs' && isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Generate Student Dossier in Google Docs
              </h2>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md font-medium border border-indigo-200">
                Official Docs API
              </span>
            </div>

            <p className="text-sm text-slate-600">
              Instantly create an official, structured Student Course Eligibility & Admissions Briefing Dossier directly in your Google Drive using the Google Docs batchUpdate engine.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Student Lead for Dossier Generation
              </label>
              <select
                id="select-docs-lead"
                value={selectedLeadForDoc}
                onChange={(e) => setSelectedLeadForDoc(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select a Student Lead --</option>
                {studentLeads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.student_name} — {l.course_name} ({l.university_name})
                  </option>
                ))}
              </select>
            </div>

            {selectedLeadForDoc && (
              <div className="p-4 bg-indigo-50/50 border border-indigo-200 rounded-xl text-xs space-y-2 text-slate-700">
                <h4 className="font-bold text-indigo-900">Document Blueprint Includes:</h4>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Official Study World Consultant Executive Header & Branch Identification</li>
                  <li>Candidate Profile (Qualifications, English Test Scores, Study Gap, Contact Info)</li>
                  <li>Target Programme Details (Tuition Fees, Intakes, Application Deadlines, Scholarship Info)</li>
                  <li>Admissions Entry Criteria Breakdown (IELTS/PTE, MOI Waiver Acceptance Status)</li>
                  <li>Counselor Assessment and Strategic Action Plan</li>
                </ul>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                id="btn-generate-google-doc"
                onClick={handleGenerateDoc}
                disabled={!selectedLeadForDoc || isCreatingDoc}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-sm transition"
              >
                {isCreatingDoc ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Generate & Save to Google Drive
              </button>
            </div>
          </div>

          {/* Generated Docs List */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center justify-between">
              <span>Created Google Docs</span>
              <span className="text-xs text-slate-500">{createdDocsList.length} files</span>
            </h3>

            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {createdDocsList.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No documents generated in this session yet.
                </div>
              ) : (
                createdDocsList.map((docItem) => (
                  <div key={docItem.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <p className="font-semibold text-slate-900 truncate">{docItem.title}</p>
                    <p className="text-slate-500 text-[10px]">Created at {docItem.date}</p>
                    <a
                      href={docItem.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-indigo-700 font-semibold hover:underline mt-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Open in Google Docs
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          TAB 5: GOOGLE SHEETS LIVE SYNC (SUPER ADMIN ONLY)
      ========================================== */}
      {activeTab === 'sheets' && isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Leads Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-700">
                <Table className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Export Student Leads to Google Sheets</h3>
                <p className="text-xs text-slate-500">Live 17-column master report with full status & counselor breakdown</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <p>• Total Leads to export: <span className="font-semibold text-slate-900">{studentLeads.length}</span></p>
              <p>• Columns: Lead ID, Student, Email, Phone, Country, University, Intake, Test Scores, Counselor, Branch</p>
            </div>

            <button
              id="btn-export-leads-sheet"
              onClick={handleExportLeadsSheet}
              disabled={isExportingSheet || studentLeads.length === 0}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg shadow-sm transition"
            >
              {isExportingSheet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />}
              Create Live Google Sheet for Leads
            </button>
          </div>

          {/* Export Courses Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Export Course Catalog to Google Sheets</h3>
                <p className="text-xs text-slate-500">Full university catalog with tuition, requirements, and deadlines</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
              <p>• Total Courses: <span className="font-semibold text-slate-900">{courses.length}</span> across {universities.length} Universities</p>
              <p>• Columns: Course ID, Title, Uni, Country, Discipline, Level, Fee, IELTS, PTE, MOI Status</p>
            </div>

            <button
              id="btn-export-courses-sheet"
              onClick={handleExportCoursesSheet}
              disabled={isExportingSheet || courses.length === 0}
              className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition"
            >
              {isExportingSheet ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Table className="w-4 h-4" />}
              Create Live Google Sheet for Courses
            </button>
          </div>

          {/* Generated Sheets Feed */}
          {createdSheetsList.length > 0 && (
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Recent Google Spreadsheets</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {createdSheetsList.map((sheet) => (
                  <div key={sheet.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 truncate">{sheet.title}</span>
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-medium">
                        {sheet.type}
                      </span>
                    </div>
                    <p className="text-slate-500 text-[10px]">Created at {sheet.date}</p>
                    <a
                      href={sheet.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-teal-700 font-semibold hover:underline mt-1"
                    >
                      <ExternalLink className="w-3 h-3" /> Open in Google Sheets
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          TAB 6: CLOUD SQL & FIREBASE STATUS (SUPER ADMIN ONLY)
      ========================================== */}
      {activeTab === 'cloudsql' && isSuperAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-slate-900">Cloud SQL (PostgreSQL)</h2>
              </div>
              <button
                onClick={handleCheckDbStatus}
                disabled={isCheckingDb}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isCheckingDb ? 'animate-spin' : ''}`} />
                Check Status
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Engine:</span>
                <span className="font-semibold text-slate-900">PostgreSQL (Drizzle ORM)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Region:</span>
                <span className="font-semibold text-slate-900">asia-southeast1</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Instance ID:</span>
                <span className="font-semibold text-slate-900 font-mono">ai-studio-d18ee3cf</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Tables Provisioned:</span>
                <span className="font-semibold text-purple-700">student_leads, courses, universities, counseling_meetings, users</span>
              </div>
            </div>

            {dbStatus && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl space-y-2 text-xs">
                <p className="font-bold text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" /> Database Live Connection
                </p>
                <pre className="p-2 bg-white rounded border border-purple-200 font-mono text-[11px] overflow-x-auto text-slate-800">
                  {JSON.stringify(dbStatus, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Shield className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-bold text-slate-900">Firebase Firestore & Security</h2>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Firestore Rules:</span>
                <span className="font-semibold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Deployed (v2)
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Authentication:</span>
                <span className="font-semibold text-slate-900">Firebase Auth + Google Workspace OAuth</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Security Model:</span>
                <span className="font-semibold text-slate-900">8 Pillars ABAC + RBAC Validation</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-600">Cloud Sync:</span>
                <span className="font-semibold text-slate-900">Real-time onSnapshot Listeners</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CONFIRMATION MODAL: GMAIL DISPATCH
      ========================================== */}
      {showEmailConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Email Dispatch</h3>
                <p className="text-xs text-slate-500">Official Gmail API Transmission</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <p><span className="font-semibold text-slate-700">Recipient:</span> {gmailRecipient}</p>
              <p><span className="font-semibold text-slate-700">Subject:</span> {gmailSubject}</p>
              <div className="pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Preview:</span>
                <p className="text-slate-600 text-[11px] line-clamp-4 mt-1 font-mono">{gmailBody}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowEmailConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-send-gmail"
                onClick={handleExecuteSendEmail}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" /> Confirm & Send Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CONFIRMATION MODAL: WHATSAPP DISPATCH
      ========================================== */}
      {showWhatsappConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-emerald-600">
              <div className="p-3 bg-emerald-50 rounded-xl">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm WhatsApp Message Dispatch</h3>
                <p className="text-xs text-slate-500">Free Direct WhatsApp API Channel</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <p>
                <span className="font-semibold text-slate-700">Student Phone:</span>{' '}
                <span className="font-mono text-emerald-700 font-bold">
                  +{WhatsAppService.formatInternationalPhone(whatsappRecipient)}
                </span>{' '}
                ({whatsappRecipient})
              </p>
              <p><span className="font-semibold text-slate-700">Template:</span> {whatsappTemplate}</p>
              <div className="pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-700">Message Preview:</span>
                <pre className="text-slate-600 text-[11px] whitespace-pre-wrap max-h-48 overflow-y-auto mt-1 p-2.5 bg-white border border-slate-200 rounded-lg font-sans">
                  {whatsappMessage}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowWhatsappConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-send-whatsapp"
                type="button"
                onClick={handleExecuteSendWhatsapp}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <MessageCircle className="w-3.5 h-3.5" /> Confirm & Send via WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          CONFIRMATION MODAL: CALENDAR & MEET
      ========================================== */}
      {showMeetConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-blue-600">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Calendar & Meet Creation</h3>
                <p className="text-xs text-slate-500">Google Calendar & Hangouts Meet Solution</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
              <p><span className="font-semibold text-slate-700">Event Title:</span> {meetTitle}</p>
              <p><span className="font-semibold text-slate-700">Date & Time:</span> {meetDate} at {meetTime} ({meetDurationMins} mins)</p>
              {meetAttendeeEmail && <p><span className="font-semibold text-slate-700">Invitee:</span> {meetAttendeeEmail}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowMeetConfirmModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-schedule-meet"
                onClick={handleExecuteScheduleMeet}
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Create Event & Meet Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: CREATE NEW TASK LIST
      ========================================== */}
      {showCreateListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-3 bg-amber-50 rounded-xl">
                <CheckSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Create New Google Task List</h3>
                <p className="text-xs text-slate-500">Organize tasks by category or cohort</p>
              </div>
            </div>

            <form onSubmit={handleCreateNewTaskList} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task List Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Visa Processing Fall 2026, UK Offer Letters..."
                  value={newListTitle}
                  onChange={(e) => setNewListTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateListModal(false);
                    setNewListTitle('');
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  id="btn-confirm-create-tasklist"
                  type="submit"
                  disabled={isCreatingList || !newListTitle.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  {isCreatingList ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  Create List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: EDIT TASK DETAILS
      ========================================== */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600">
              <div className="p-3 bg-amber-50 rounded-xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Task in Google Tasks</h3>
                <p className="text-xs text-slate-500">Update title, deadline, or checklist notes</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editTaskDue}
                  onChange={(e) => setEditTaskDue(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Task Notes & Information
                </label>
                <textarea
                  rows={4}
                  value={editTaskNotes}
                  onChange={(e) => setEditTaskNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-800 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="btn-save-task-edit"
                onClick={handleSaveTaskEdit}
                disabled={isSavingTaskEdit || !editTaskTitle.trim()}
                className="px-5 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                {isSavingTaskEdit ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MANDATORY CONFIRMATION MODAL: DELETE TASK
      ========================================== */}
      {showTaskDeleteModal && taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-3 bg-red-50 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete Task from Google Tasks</h3>
                <p className="text-xs text-slate-500">Destructive Workspace Operation</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this task from Google Tasks? This action will remove it across all linked devices and cannot be undone.
            </p>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <p className="font-semibold text-slate-800">{taskToDelete.title}</p>
              {taskToDelete.due && (
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Due: {new Date(taskToDelete.due).toLocaleDateString()}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowTaskDeleteModal(false);
                  setTaskToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                id="btn-confirm-delete-task"
                onClick={handleExecuteDeleteTask}
                disabled={isDeletingTask}
                className="px-5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                {isDeletingTask ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
