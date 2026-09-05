import { StorageService, LocalTaskItem, LocalTaskList } from '../utils/storage';
import { Course, StudentLeadRequest, University } from '../types';

const FEATURE_UNAVAILABLE = 'Feature not available yet';

function requireGoogleWorkspace(): never {
  throw new Error(FEATURE_UNAVAILABLE);
}

/** Unreachable after requireGoogleWorkspace(); kept so leftover Gmail/Calendar code typechecks. */
const token = '';

export interface CalendarEventItem {
  id?: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: { email: string }[];
  hangoutLink?: string;
  htmlLink?: string;
}

export interface WorkspaceSendEmailParams {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
}

export interface CreatedDocResult {
  documentId: string;
  title: string;
  webViewLink: string;
}

export interface CreatedSheetResult {
  spreadsheetId: string;
  title: string;
  spreadsheetUrl: string;
}

export interface GoogleTaskItem {
  id?: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated?: string;
  position?: string;
  links?: { description: string; link: string; type: string }[];
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
  selfLink?: string;
}

export const GoogleWorkspaceService = {
  // ==========================================
  // GMAIL API
  // ==========================================
  async sendEmail({ to, subject, bodyText, bodyHtml }: WorkspaceSendEmailParams): Promise<{ id: string; threadId: string }> {
    requireGoogleWorkspace();

    // Build RFC 2822 format email
    const utf8Subject = `=?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`;
    const messageParts = [
      `To: ${to}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: ${utf8Subject}`,
      '',
      bodyHtml || bodyText.replace(/\n/g, '<br/>'),
    ];
    const message = messageParts.join('\r\n');

    // Base64URL encode
    const encodedMessage = btoa(unescape(encodeURIComponent(message)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gmail API error: ${res.statusText}`);
    }

    return await res.json();
  },

  async listRecentMessages(maxResults = 10): Promise<any[]> {
    requireGoogleWorkspace();
    const token = '';
    if (!token) throw new Error('Google Workspace authentication required.');

    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to list Gmail messages');
    }

    const data = await res.json();
    if (!data.messages || !Array.isArray(data.messages)) return [];

    // Fetch message summaries
    const details = await Promise.all(
      data.messages.slice(0, 5).map(async (m: { id: string }) => {
        try {
          const mRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (mRes.ok) return await mRes.json();
        } catch {
          return null;
        }
      })
    );

    return details.filter(Boolean);
  },

  // ==========================================
  // GOOGLE CALENDAR & GOOGLE MEET
  // ==========================================
  async listUpcomingEvents(maxResults = 15): Promise<CalendarEventItem[]> {
    requireGoogleWorkspace();
    const token = '';
    if (!token) throw new Error('Google Workspace authentication required.');

    const timeMin = new Date().toISOString();
    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(timeMin)}&singleEvents=true&orderBy=startTime&maxResults=${maxResults}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to load Google Calendar events');
    }

    const data = await res.json();
    return data.items || [];
  },

  async createCalendarEventWithMeet({
    summary,
    description,
    startTimeIso,
    endTimeIso,
    attendeeEmail,
  }: {
    summary: string;
    description: string;
    startTimeIso: string;
    endTimeIso: string;
    attendeeEmail?: string;
  }): Promise<{ eventId: string; meetUri?: string; htmlLink: string }> {
    requireGoogleWorkspace();
    const token = '';
    if (!token) throw new Error('Google Workspace authentication required.');

    const requestId = `meet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const eventPayload: any = {
      summary,
      description,
      start: { dateTime: startTimeIso },
      end: { dateTime: endTimeIso },
      conferenceData: {
        createRequest: {
          requestId,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    if (attendeeEmail) {
      eventPayload.attendees = [{ email: attendeeEmail }];
    }

    const res = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventPayload),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to schedule Google Calendar & Meet event');
    }

    const data = await res.json();
    const meetUri =
      data.hangoutLink ||
      data.conferenceData?.entryPoints?.find((ep: any) => ep.entryPointType === 'video')?.uri;

    return {
      eventId: data.id,
      meetUri,
      htmlLink: data.htmlLink,
    };
  },

  // ==========================================
  // GOOGLE MEET (STANDALONE V2 SPACES API)
  // ==========================================
  async createInstantMeetSpace(): Promise<{ spaceId: string; meetingUri: string }> {
    requireGoogleWorkspace();
    const token = '';
    if (!token) throw new Error('Google Workspace authentication required.');

    // Attempt Meet v2 Spaces API
    try {
      const res = await fetch('https://meet.googleapis.com/v2/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          spaceId: data.name || '',
          meetingUri: data.meetingUri || `https://meet.google.com/${data.name?.split('/').pop()}`,
        };
      }
    } catch {
      // fallback to calendar meet generator below
    }

    // Fallback: Create instant 30-min quick meet slot on Calendar
    const now = new Date();
    const end = new Date(now.getTime() + 45 * 60 * 1000);
    const calRes = await this.createCalendarEventWithMeet({
      summary: 'Study World Quick Student Counseling (Google Meet)',
      description: 'Instant student consultation room created from Study World Consultant Search Portal.',
      startTimeIso: now.toISOString(),
      endTimeIso: end.toISOString(),
    });

    return {
      spaceId: calRes.eventId,
      meetingUri: calRes.meetUri || calRes.htmlLink,
    };
  },

  // ==========================================
  // GOOGLE DOCS API
  // ==========================================
  async createStudentAssessmentDoc(lead: StudentLeadRequest, course?: Course | null): Promise<CreatedDocResult> {
    requireGoogleWorkspace();
    const token = '';
    if (!token) throw new Error('Google Workspace authentication required.');

    const title = `Study World Dossier - ${lead.student_name} - ${lead.course_name}`;

    // 1. Create document via Google Docs API
    const docRes = await fetch('https://docs.googleapis.com/v1/documents', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!docRes.ok) {
      const err = await docRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to create Google Doc');
    }

    const docData = await docRes.json();
    const documentId = docData.documentId;

    // 2. Insert rich formatted content into Google Doc
    const docContent = [
      `STUDY WORLD CONSULTANT - OFFICIAL STUDENT ASSESSMENT DOSSIER\n`,
      `========================================================================\n\n`,
      `Date Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}\n`,
      `Assigned Counselor: ${lead.counselor_name} (${lead.counselor_email || 'counselor@studyworld.com'})\n`,
      `Branch / Franchise: ${lead.franchise_name || 'Head Office'}\n\n`,
      `1. CANDIDATE PROFILE\n`,
      `------------------------------------------------------------------------\n`,
      `• Student Name: ${lead.student_name}\n`,
      `• Contact Email: ${lead.student_email}\n`,
      `• Phone / WhatsApp: ${lead.student_phone}\n`,
      `• City / Origin: ${lead.city || 'N/A'}\n`,
      `• Academic Score: ${lead.academic_score || 'N/A'}\n`,
      `• English Language Proficiency: ${lead.english_test || 'N/A'}\n`,
      `• Target Intake: ${lead.intake || 'Upcoming Intake'}\n\n`,
      `2. RECOMMENDED ACADEMIC PROGRAMME\n`,
      `------------------------------------------------------------------------\n`,
      `• Program Name: ${lead.course_name}\n`,
      `• Institution: ${lead.university_name}\n`,
      `• Country & Location: ${lead.destination_country}\n`,
      `• Application Priority: ${lead.priority}\n`,
      `• Current Workflow Status: ${lead.status}\n\n`,
      course
        ? `3. COURSE SPECIFICATIONS & TUITION\n` +
          `------------------------------------------------------------------------\n` +
          `• Faculty / Discipline: ${course.faculty || course.program}\n` +
          `• Study Level: ${course.program}\n` +
          `• Annual Fee: ${course.currency} ${course.tuition_fee?.toLocaleString() || 'Contact admissions'}\n` +
          `• Scholarship: ${course.scholarship_available ? course.scholarship_detail || 'Available' : 'Standard tuition'}\n` +
          `• IELTS Requirement: ${course.eligibility?.ielts_overall || 6.0} (Min band: ${course.eligibility?.ielts_min_band || 5.5})\n` +
          `• MOI Waiver Accepted: ${course.eligibility?.moi_acceptance === 'Accepted' ? 'YES (Valid Medium of Instruction Letter)' : 'NO / Case-by-Case'}\n\n`
        : '',
      `4. COUNSELOR ASSESSMENT & ACTION PLAN\n`,
      `------------------------------------------------------------------------\n`,
      `${lead.notes || 'Student profile has been screened by Study World Consultant counseling division and meets preliminary entry criteria for admissions processing.'}\n\n`,
      `---\n`,
      `Study World Consultant Global Network • Head Office & Franchise Advisory Services\n`,
    ].join('');

    await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: docContent,
            },
          },
        ],
      }),
    });

    return {
      documentId,
      title,
      webViewLink: `https://docs.google.com/document/d/${documentId}/edit`,
    };
  },

  // ==========================================
  // GOOGLE SHEETS API
  // ==========================================
  async exportLeadsToSheet(leads: StudentLeadRequest[], titlePrefix = 'Study World Leads Report'): Promise<CreatedSheetResult> {
    requireGoogleWorkspace();
    const token = '';
    if (!token) throw new Error('Google Workspace authentication required.');

    const title = `${titlePrefix} - ${new Date().toISOString().slice(0, 10)}`;

    // 1. Create Spreadsheet
    const sheetRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title },
        sheets: [{ properties: { title: 'Student Leads' } }],
      }),
    });

    if (!sheetRes.ok) {
      const err = await sheetRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to create Google Sheet');
    }

    const sheetData = await sheetRes.json();
    const spreadsheetId = sheetData.spreadsheetId;

    // 2. Populate Headers and Data
    const headers = [
      'Lead ID',
      'Student Name',
      'Email',
      'Phone',
      'City',
      'Destination Country',
      'Target University',
      'Course Name',
      'Target Intake',
      'Academic Score',
      'English Test',
      'Status',
      'Priority',
      'Counselor Name',
      'Franchise Branch',
      'Created Date',
      'Counselor Notes',
    ];

    const rows = leads.map((l) => [
      l.id,
      l.student_name,
      l.student_email,
      l.student_phone,
      l.city || '',
      l.destination_country,
      l.university_name,
      l.course_name,
      l.intake || '',
      l.academic_score || '',
      l.english_test || '',
      l.status,
      l.priority,
      l.counselor_name,
      l.franchise_name || '',
      l.created_at?.slice(0, 10) || '',
      l.notes || '',
    ]);

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Student Leads!A1:Q${rows.length + 1}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [headers, ...rows],
        }),
      }
    );

    return {
      spreadsheetId,
      title,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    };
  },

  async exportCoursesToSheet(courses: Course[], universities: University[]): Promise<CreatedSheetResult> {
    requireGoogleWorkspace();
    const token = '';
    if (!token) throw new Error('Google Workspace authentication required.');

    const title = `Study World Course Master Catalog - ${new Date().toISOString().slice(0, 10)}`;

    const sheetRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: { title },
        sheets: [{ properties: { title: 'Courses Catalog' } }],
      }),
    });

    if (!sheetRes.ok) {
      const err = await sheetRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to create Google Sheet');
    }

    const sheetData = await sheetRes.json();
    const spreadsheetId = sheetData.spreadsheetId;

    const headers = [
      'Course ID',
      'Course Title',
      'University',
      'Country',
      'City',
      'Faculty',
      'Level',
      'Duration',
      'Annual Tuition',
      'Currency',
      'Scholarship Details',
      'IELTS Requirement',
      'PTE Requirement',
      'MOI Accepted',
      'Intakes',
      'Deadline',
    ];

    const uniMap = new Map(universities.map((u) => [u.university_id, u.name]));

    const rows = courses.map((c) => [
      c.course_id,
      c.course_name,
      uniMap.get(c.university_id) || c.university_id,
      c.destination_country,
      c.city,
      c.faculty || '',
      c.program,
      `${c.duration} ${c.duration_unit}`,
      c.tuition_fee,
      c.currency || 'USD',
      c.scholarship_available ? c.scholarship_detail || 'Yes' : 'No',
      c.eligibility ? `${c.eligibility.ielts_overall} (Min: ${c.eligibility.ielts_min_band})` : 'N/A',
      c.eligibility ? c.eligibility.pte_min : 'N/A',
      c.eligibility ? c.eligibility.moi_acceptance : 'N/A',
      c.intake_months?.join(', ') || '',
      c.application_deadline || '',
    ]);

    await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Courses Catalog!A1:P${rows.length + 1}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [headers, ...rows],
        }),
      }
    );

    return {
      spreadsheetId,
      title,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
    };
  },

  // ==========================================
  // GOOGLE TASKS API (WITH RESILIENT LOCAL CACHE & CLOUD SYNC)
  // ==========================================
  async listTaskLists(): Promise<GoogleTaskList[]> {
    const localLists = StorageService.getTaskLists();
    try {
      requireGoogleWorkspace();
    const token = '';
      if (!token) {
        return localLists;
      }

      const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return localLists;
      }

      const data = await res.json();
      const items: GoogleTaskList[] = data.items || [];
      if (items.length > 0) {
        StorageService.saveTaskLists(items.map((i) => ({ id: i.id, title: i.title, updated: i.updated })));
        return items;
      }
      return localLists;
    } catch (err) {
      console.warn('Google Tasks listTaskLists fallback to local storage:', err);
      return localLists;
    }
  },

  async createTaskList(title: string): Promise<GoogleTaskList> {
    const localId = `list_${Date.now()}`;
    const newLocalList: GoogleTaskList = { id: localId, title, updated: new Date().toISOString() };
    StorageService.addTaskList(newLocalList);

    try {
      requireGoogleWorkspace();
    const token = '';
      if (!token) return newLocalList;

      const res = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (!res.ok) {
        return newLocalList;
      }

      const cloudList = await res.json();
      StorageService.addTaskList({ id: cloudList.id, title: cloudList.title, updated: cloudList.updated });
      return cloudList;
    } catch (err) {
      console.warn('Google Tasks createTaskList fallback to local storage:', err);
      return newLocalList;
    }
  },

  async listTasks(taskListId?: string): Promise<GoogleTaskItem[]> {
    const targetListId = taskListId || '@default';
    const localTasks = StorageService.getTasks(targetListId);

    try {
      requireGoogleWorkspace();
    const token = '';
      if (!token) {
        return localTasks;
      }

      const listId = encodeURIComponent(targetListId);
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists/${listId}/tasks?showCompleted=true&showHidden=true&maxResults=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        return localTasks;
      }

      const data = await res.json();
      const items: GoogleTaskItem[] = data.items || [];
      if (items.length > 0) {
        StorageService.saveTasks(
          targetListId,
          items.map((i) => ({
            id: i.id || `task_${Date.now()}_${Math.random()}`,
            title: i.title || '',
            notes: i.notes || '',
            status: i.status || 'needsAction',
            due: i.due,
            completed: i.completed,
            updated: i.updated,
          }))
        );
        return items;
      }
      return localTasks;
    } catch (err) {
      console.warn('Google Tasks listTasks fallback to local storage:', err);
      return localTasks;
    }
  },

  async createTask(taskListId: string | undefined, task: { title: string; notes?: string; due?: string }): Promise<GoogleTaskItem> {
    const targetListId = taskListId || '@default';
    const localId = `task_${Date.now()}`;
    const localTask: GoogleTaskItem = {
      id: localId,
      title: task.title,
      notes: task.notes || '',
      status: 'needsAction',
      due: task.due ? (task.due.includes('T') ? task.due : `${task.due}T00:00:00.000Z`) : undefined,
      updated: new Date().toISOString(),
    };

    StorageService.saveTask(targetListId, localTask as any);

    try {
      requireGoogleWorkspace();
    const token = '';
      if (!token) return localTask;

      const listId = encodeURIComponent(targetListId);
      const bodyPayload: any = {
        title: task.title,
        notes: task.notes || '',
        status: 'needsAction',
      };

      if (task.due) {
        const parsedDue = new Date(task.due);
        if (!isNaN(parsedDue.getTime())) {
          bodyPayload.due = parsedDue.toISOString();
        }
      }

      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists/${listId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        return localTask;
      }

      const cloudTask = await res.json();
      StorageService.saveTask(targetListId, cloudTask);
      return cloudTask;
    } catch (err) {
      console.warn('Google Tasks createTask fallback to local storage:', err);
      return localTask;
    }
  },

  async updateTaskStatus(taskListId: string | undefined, taskId: string, completed: boolean): Promise<GoogleTaskItem> {
    const targetListId = taskListId || '@default';
    const currentTasks = StorageService.getTasks(targetListId);
    const existing = currentTasks.find((t) => t.id === taskId);
    if (existing) {
      existing.status = completed ? 'completed' : 'needsAction';
      existing.completed = completed ? new Date().toISOString() : undefined;
      existing.updated = new Date().toISOString();
      StorageService.saveTask(targetListId, existing);
    }

    try {
      requireGoogleWorkspace();
    const token = '';
      if (!token) return (existing as GoogleTaskItem) || { id: taskId, title: '', status: completed ? 'completed' : 'needsAction' };

      const listId = encodeURIComponent(targetListId);
      const encodedTaskId = encodeURIComponent(taskId);

      const bodyPayload: any = {
        status: completed ? 'completed' : 'needsAction',
      };
      if (!completed) {
        bodyPayload.completed = null;
      }

      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists/${listId}/tasks/${encodedTaskId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        return (existing as GoogleTaskItem) || { id: taskId, title: '', status: completed ? 'completed' : 'needsAction' };
      }

      const updatedCloud = await res.json();
      StorageService.saveTask(targetListId, updatedCloud);
      return updatedCloud;
    } catch (err) {
      console.warn('Google Tasks updateTaskStatus fallback to local storage:', err);
      return (existing as GoogleTaskItem) || { id: taskId, title: '', status: completed ? 'completed' : 'needsAction' };
    }
  },

  async updateTaskDetails(taskListId: string | undefined, taskId: string, updates: { title?: string; notes?: string; due?: string }): Promise<GoogleTaskItem> {
    const targetListId = taskListId || '@default';
    const currentTasks = StorageService.getTasks(targetListId);
    const existing = currentTasks.find((t) => t.id === taskId);
    if (existing) {
      if (updates.title !== undefined) existing.title = updates.title;
      if (updates.notes !== undefined) existing.notes = updates.notes;
      if (updates.due !== undefined) existing.due = updates.due;
      existing.updated = new Date().toISOString();
      StorageService.saveTask(targetListId, existing);
    }

    try {
      requireGoogleWorkspace();
    const token = '';
      if (!token) return (existing as GoogleTaskItem) || { id: taskId, title: updates.title || '', status: 'needsAction' };

      const listId = encodeURIComponent(targetListId);
      const encodedTaskId = encodeURIComponent(taskId);

      const bodyPayload: any = {};
      if (updates.title !== undefined) bodyPayload.title = updates.title;
      if (updates.notes !== undefined) bodyPayload.notes = updates.notes;
      if (updates.due !== undefined) {
        if (updates.due) {
          const parsedDue = new Date(updates.due);
          if (!isNaN(parsedDue.getTime())) {
            bodyPayload.due = parsedDue.toISOString();
          }
        } else {
          bodyPayload.due = null;
        }
      }

      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists/${listId}/tasks/${encodedTaskId}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });

      if (!res.ok) {
        return (existing as GoogleTaskItem) || { id: taskId, title: updates.title || '', status: 'needsAction' };
      }

      const updatedCloud = await res.json();
      StorageService.saveTask(targetListId, updatedCloud);
      return updatedCloud;
    } catch (err) {
      console.warn('Google Tasks updateTaskDetails fallback to local storage:', err);
      return (existing as GoogleTaskItem) || { id: taskId, title: updates.title || '', status: 'needsAction' };
    }
  },

  async deleteTask(taskListId: string | undefined, taskId: string): Promise<void> {
    const targetListId = taskListId || '@default';
    StorageService.deleteTask(taskId);

    try {
      requireGoogleWorkspace();
    const token = '';
      if (!token) return;

      const listId = encodeURIComponent(targetListId);
      const encodedTaskId = encodeURIComponent(taskId);

      await fetch(`https://tasks.googleapis.com/tasks/v1/users/@me/lists/${listId}/tasks/${encodedTaskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.warn('Google Tasks deleteTask fallback to local storage:', err);
    }
  },
};
