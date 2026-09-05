import React, { useState, useEffect, useMemo } from 'react';
import {
  University,
  Course,
  CountryMaster,
  ProgramMaster,
  UserAccount,
  ImportHistoryRecord,
  ImportCategory,
  Franchise,
  StudentLeadRequest,
  StudentProfile,
  StudentLeadStatus,
  isB2BUser,
} from './types';
import * as SqlStore from './utils/sqlStore';
import { getSessionToken } from './lib/apiAuth';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CourseDetailModal } from './components/CourseDetailModal';
import { UniversityDetailModal } from './components/UniversityDetailModal';
import { CourseFormModal } from './components/CourseFormModal';
import { UniversityFormModal } from './components/UniversityFormModal';
import { LoginModal } from './components/LoginModal';
import { CourseComparisonModal } from './components/CourseComparisonModal';
import { StudentLeadModal } from './components/StudentLeadModal';
import { AuthScreen } from './components/AuthScreen';

// Views
import { DashboardView } from './views/DashboardView';
import { SearchCoursesView } from './views/SearchCoursesView';
import { StudentEligibilityChecker } from './views/StudentEligibilityChecker';
import { StudentLeadsView } from './views/StudentLeadsView';
import { UniversitiesView } from './views/UniversitiesView';
import { CoursesView } from './views/CoursesView';
import { DataUploadView } from './views/DataUploadView';
import { ImportHistoryView } from './views/ImportHistoryView';
import { DownloadTemplatesView } from './views/DownloadTemplatesView';
import { CountriesView } from './views/CountriesView';
import { ProgramsView } from './views/ProgramsView';
import { RequirementsView } from './views/RequirementsView';
import { UsersTeamView } from './views/UsersTeamView';
import { FranchisesView } from './views/FranchisesView';
import { SettingsView } from './views/SettingsView';
import { GoogleWorkspaceView } from './views/GoogleWorkspaceView';
import { BusyOverlay } from './components/BusyOverlay';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  // Persistence state
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [countries, setCountries] = useState<CountryMaster[]>([]);
  const [programs, setPrograms] = useState<ProgramMaster[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [studentLeads, setStudentLeads] = useState<StudentLeadRequest[]>([]);
  const [importHistory, setImportHistory] = useState<ImportHistoryRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const user = SqlStore.getSessionUser();
    if (user && !getSessionToken()) {
      SqlStore.setSessionUser(null);
      return null;
    }
    return user;
  });
  const [catalogReady, setCatalogReady] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [busyMessage, setBusyMessage] = useState<string | null>(null);

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Modals & Detail Drawers State
  const [selectedCourseDetail, setSelectedCourseDetail] = useState<Course | null>(null);
  const [selectedUniversityDetail, setSelectedUniversityDetail] = useState<University | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingUniversity, setEditingUniversity] = useState<University | null>(null);
  const [showUniversityForm, setShowUniversityForm] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Student Lead Request Modal State
  const [showLeadModal, setShowLeadModal] = useState<boolean>(false);
  const [leadModalCourse, setLeadModalCourse] = useState<Course | null>(null);
  const [leadModalStudentProfile, setLeadModalStudentProfile] = useState<Partial<StudentProfile> | null>(null);
  const [editingLead, setEditingLead] = useState<StudentLeadRequest | null>(null);

  // Comparison State
  const [comparisonCourses, setComparisonCourses] = useState<[Course | null, Course | null]>([null, null]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [eligibilityCheckerInitialCourse, setEligibilityCheckerInitialCourse] = useState<Course | null>(null);

  const applyCatalog = (data: SqlStore.PortalData) => {
    setUniversities(data.universities);
    setCourses(data.courses);
    setCountries(data.countries);
    setPrograms(data.programs);
    setFranchises(data.franchises);
    setUsers(data.users);
    setStudentLeads(data.studentLeads);
    setImportHistory(data.importHistory);
  };

  const clearCatalog = () => {
    setUniversities([]);
    setCourses([]);
    setCountries([]);
    setPrograms([]);
    setUsers([]);
    setFranchises([]);
    setStudentLeads([]);
    setImportHistory([]);
    setCatalogReady(false);
    setCatalogError(null);
  };

  // Catalog loads from SQL Server after a signed-in session token exists
  useEffect(() => {
    if (!currentUser) {
      setCatalogReady(false);
      return;
    }
    let cancelled = false;
    setCatalogReady(false);
    SqlStore.hydrateFromDatabase()
      .then((data) => {
        if (cancelled) return;
        applyCatalog(data);
        setCatalogError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err?.message === 'SESSION_EXPIRED' || !SqlStore.getSessionUser()) {
          clearCatalog();
          setCurrentUser(null);
          return;
        }
        console.error('Failed to load portal data from SQL Server:', err);
        setCatalogError(err?.message || 'Failed to load portal data from SQL Server');
      })
      .finally(() => {
        if (!cancelled) setCatalogReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  // Quick switch user role helper
  const handleSwitchUserRole = (role: 'Admin' | 'Office Staff' | 'Franchise Admin' | 'Franchise Staff') => {
    const target = users.find((u) => u.role === role) || users[0];
    if (target) {
      setCurrentUser(target);
      SqlStore.setSessionUser(target);
    }
  };

  const handleLoginSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    SqlStore.setSessionUser(user);
  };

  const handleLogout = () => {
    SqlStore.setSessionUser(null);
    setCurrentUser(null);
    setShowLoginModal(false);
    clearCatalog();
  };

  const runBusy = async <T,>(message: string, work: () => Promise<T>): Promise<T> => {
    setBusyMessage(message);
    try {
      return await work();
    } finally {
      setBusyMessage(null);
    }
  };

  // Franchise handlers
  const handleSaveFranchise = async (savedFranchise: Franchise) => {
    await runBusy('Saving franchise…', async () => {
      await SqlStore.saveFranchise(savedFranchise);
      setFranchises(SqlStore.getPortalData().franchises);
    });
  };

  const handleDeleteFranchise = async (franchiseId: string, deleteSubUsers = false) => {
    await runBusy('Deleting franchise…', async () => {
      await SqlStore.deleteFranchise(franchiseId);
      setFranchises(SqlStore.getPortalData().franchises);
      if (deleteSubUsers) setUsers(SqlStore.getPortalData().users);
    });
  };

  const handleSaveCourse = async (savedCourse: Course) => {
    await runBusy('Saving course…', async () => {
      await SqlStore.saveCourse(savedCourse);
      setCourses(SqlStore.getPortalData().courses);
    });
  };

  const handleDeleteCourse = async (courseId: string) => {
    await runBusy('Deleting course…', async () => {
      await SqlStore.deleteCourse(courseId);
      setCourses(SqlStore.getPortalData().courses);
      if (selectedCourseDetail?.course_id === courseId) setSelectedCourseDetail(null);
    });
  };

  const handleDeleteCourses = async (courseIds: string[]) => {
    await runBusy('Deleting courses…', async () => {
      await SqlStore.deleteCourses(courseIds);
      setCourses(SqlStore.getPortalData().courses);
      if (selectedCourseDetail && courseIds.includes(selectedCourseDetail.course_id)) setSelectedCourseDetail(null);
    });
  };

  const handleSaveUniversity = async (savedUni: University) => {
    await runBusy('Saving university…', async () => {
      await SqlStore.saveUniversity(savedUni);
      setUniversities(SqlStore.getPortalData().universities);
    });
  };

  const handleDeleteUniversity = async (universityId: string) => {
    await runBusy('Deleting university…', async () => {
      await SqlStore.deleteUniversity(universityId);
      setUniversities(SqlStore.getPortalData().universities);
      setCourses(SqlStore.getPortalData().courses);
      if (selectedUniversityDetail?.university_id === universityId) setSelectedUniversityDetail(null);
    });
  };

  const handleDeleteUniversities = async (universityIds: string[]) => {
    await runBusy('Deleting universities…', async () => {
      await SqlStore.deleteUniversities(universityIds);
      setUniversities(SqlStore.getPortalData().universities);
      setCourses(SqlStore.getPortalData().courses);
      if (selectedUniversityDetail && universityIds.includes(selectedUniversityDetail.university_id)) {
        setSelectedUniversityDetail(null);
      }
    });
  };

  const handleSaveCountry = async (country: CountryMaster) => {
    await runBusy('Saving country…', async () => {
      await SqlStore.saveCountry(country);
      setCountries(SqlStore.getPortalData().countries);
    });
  };

  const handleDeleteCountry = async (code: string) => {
    await runBusy('Deleting country…', async () => {
      await SqlStore.deleteCountry(code);
      setCountries(SqlStore.getPortalData().countries);
    });
  };

  const handleSaveUser = async (savedUser: UserAccount) => {
    await runBusy('Saving user…', async () => {
      await SqlStore.saveUser(savedUser);
      const { password: _password, ...safeUser } = savedUser;
      setUsers(SqlStore.getPortalData().users);
      setFranchises(SqlStore.getPortalData().franchises);
      if (currentUser?.id === safeUser.id) {
        const next = { ...currentUser, ...safeUser };
        setCurrentUser(next);
        SqlStore.setSessionUser(next);
      }
    });
  };

  const handleDeleteUser = async (userId: string) => {
    await runBusy('Deleting user…', async () => {
      await SqlStore.deleteUser(userId);
      setUsers(SqlStore.getPortalData().users);
    });
  };

  // Import completion handler
  const handleImportComplete = async (
    category: ImportCategory,
    importedData: any,
    historyRecord: ImportHistoryRecord
  ) => {
    await runBusy('Saving imported data…', async () => {
    if (category === 'Complete Data Import' || category === 'Public Universities') {
      const { courses: newCourses, universities: newUnis, countries: newCountries } = importedData || {};

      if (newUnis && newUnis.length > 0) {
        const existingUnis = SqlStore.getPortalData().universities;
        const uniMap = new Map<string, University>();
        existingUnis.forEach((u) => uniMap.set(u.name.toLowerCase().trim(), u));
        newUnis.forEach((u: University) => uniMap.set(u.name.toLowerCase().trim(), u));
        const updatedUnis = Array.from(uniMap.values());
        await SqlStore.saveUniversities(updatedUnis);
        setUniversities(updatedUnis);
      }

      if (newCourses && newCourses.length > 0) {
        const existingCourses = SqlStore.getPortalData().courses;
        const courseMap = new Map<string, Course>();
        existingCourses.forEach((c) => courseMap.set(`${c.course_name.toLowerCase()}_${c.university_id}`, c));
        newCourses.forEach((c: Course) => courseMap.set(`${c.course_name.toLowerCase()}_${c.university_id}`, c));
        const updatedCourses = Array.from(courseMap.values());
        await SqlStore.saveCourses(updatedCourses);
        setCourses(updatedCourses);
      }

      if (newCountries && newCountries.length > 0) {
        const existingCountries = SqlStore.getPortalData().countries;
        const countryMap = new Map<string, CountryMaster>();
        existingCountries.forEach((c) => countryMap.set(c.code.toUpperCase(), c));
        newCountries.forEach((c: CountryMaster) => countryMap.set(c.code.toUpperCase(), c));
        const updatedCountries = Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        await SqlStore.saveCountries(updatedCountries);
        setCountries(updatedCountries);
      }
    } else if (category === 'Courses') {
      const existing = SqlStore.getPortalData().courses;
      const updated = [...(importedData || []), ...existing];
      await SqlStore.saveCourses(updated);
      setCourses(updated);
    } else if (category === 'Universities') {
      const existing = SqlStore.getPortalData().universities;
      const updated = [...(importedData || []), ...existing];
      await SqlStore.saveUniversities(updated);
      setUniversities(updated);
    } else if (category === 'Countries') {
      const existing = SqlStore.getPortalData().countries;
      const countryMap = new Map<string, CountryMaster>();
      existing.forEach((c) => countryMap.set(c.code.toUpperCase(), c));
      (importedData || []).forEach((c: CountryMaster) => countryMap.set(c.code.toUpperCase(), c));
      const updated = Array.from(countryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
      await SqlStore.saveCountries(updated);
      setCountries(updated);
    }

    await SqlStore.addImportHistory(historyRecord);
    setImportHistory(SqlStore.getPortalData().importHistory);
    });
  };

  const handleResetFactory = async () => {
    await runBusy('Resetting catalog…', async () => {
      const d = await SqlStore.resetToDefaults();
      applyCatalog(d);
    });
  };

  const handleSaveStudentLead = async (lead: StudentLeadRequest) => {
    try {
      await runBusy('Saving student lead…', async () => {
        await SqlStore.saveStudentLead(lead);
        setStudentLeads(SqlStore.getPortalData().studentLeads);
      });
      setShowLeadModal(false);
      setEditingLead(null);
      setLeadModalCourse(null);
      setLeadModalStudentProfile(null);
    } catch (err: any) {
      console.error(err);
      window.alert(err?.message || 'Could not save the student lead. Please try again.');
    }
  };

  const handleDeleteStudentLead = async (leadId: string) => {
    await runBusy('Deleting student lead…', async () => {
      await SqlStore.deleteStudentLead(leadId);
      setStudentLeads(SqlStore.getPortalData().studentLeads);
    });
  };

  const handleUpdateLeadStatus = async (leadId: string, status: StudentLeadStatus, comment?: string) => {
    if (!currentUser) return;
    await runBusy('Updating lead status…', async () => {
      await SqlStore.updateLeadStatus(leadId, status, currentUser.name, currentUser.role, comment);
      setStudentLeads(SqlStore.getPortalData().studentLeads);
    });
  };

  const handleOpenCreateLead = (course?: Course | null, studentProfile?: StudentProfile) => {
    setEditingLead(null);
    setLeadModalCourse(course || null);
    setLeadModalStudentProfile(studentProfile || null);
    setShowLeadModal(true);
  };

  const handleOpenEditLead = (lead: StudentLeadRequest) => {
    if (isB2BUser(currentUser) || currentUser?.role === 'User') {
      return;
    }
    setEditingLead(lead);
    const crs: Course =
      courses.find((c) => c.course_id === lead.course_id) ||
      courses.find(
        (c) =>
          c.course_name?.trim().toLowerCase() === lead.course_name?.trim().toLowerCase() &&
          (!lead.destination_country || c.destination_country?.trim().toLowerCase() === lead.destination_country?.trim().toLowerCase())
      ) ||
      courses.find((c) => c.course_name?.trim().toLowerCase() === lead.course_name?.trim().toLowerCase()) || {
        course_id: lead.course_id || `course_${lead.id}`,
        university_id: lead.university_id || 'uni_snapshot',
        course_name: lead.course_name || 'Academic Degree Program',
        program: lead.program_level || 'Postgraduate',
        duration: 1,
        duration_unit: 'years',
        tuition_fee: lead.tuition_fee ?? 0,
        currency: lead.currency || 'USD',
        intake_months: [lead.intake || 'September 2026'],
        destination_country: lead.destination_country || 'Canada',
        city: lead.city || '',
        is_active: true,
        academic_requirements: { min_qualification: lead.academic_qualification || 'Degree' },
        english_requirements: { minimum_score: lead.english_test || '6.0' },
      };
    setLeadModalCourse(crs);
    setLeadModalStudentProfile(null);
    setShowLeadModal(true);
  };

  // Quick navigation to Eligibility Checker with specific course
  const handleQuickCheckEligibility = (course: Course) => {
    if (isB2BUser(currentUser)) return;
    setSelectedCourseDetail(null);
    setShowComparisonModal(false);
    setEligibilityCheckerInitialCourse(course);
    setCurrentScreen('eligibility_checker');
  };

  // Course comparison handlers
  const handleCompareTwoCourses = (c1: Course, c2: Course) => {
    setComparisonCourses([c1, c2]);
    setShowComparisonModal(true);
  };

  const handleStartComparisonFromDetail = (c: Course) => {
    const otherCourse =
      courses.find(
        (item) =>
          item.course_id !== c.course_id &&
          item.destination_country === c.destination_country
      ) ||
      courses.find((item) => item.course_id !== c.course_id) ||
      courses[0];
    setComparisonCourses([c, otherCourse || null]);
    setShowComparisonModal(true);
  };

  // Navigation handler with compare_courses modal hook
  const handleNavigate = (scr: string) => {
    if (scr === 'compare_courses') {
      if (!comparisonCourses[0] && courses.length > 0) {
        setComparisonCourses([courses[0], courses[1] || courses[0]]);
      }
      setShowComparisonModal(true);
      return;
    }
    setCurrentScreen(scr);
  };

  if (!currentUser) {
    return (
      <AuthScreen
        onLoginSuccess={handleLoginSuccess}
        users={users}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF6F1] text-[#241512] flex flex-col font-sans selection:bg-[#C9A227] selection:text-stone-900">
      {(busyMessage || !catalogReady) && (
        <BusyOverlay
          message={busyMessage || 'Loading courses and universities from SQL Server…'}
        />
      )}
      {/* Modals */}
      <StudentLeadModal
        isOpen={showLeadModal}
        onClose={() => {
          setShowLeadModal(false);
          setEditingLead(null);
          setLeadModalCourse(null);
          setLeadModalStudentProfile(null);
        }}
        onSave={handleSaveStudentLead}
        editingLead={editingLead}
        initialCourse={leadModalCourse}
        initialStudentData={leadModalStudentProfile}
        courses={courses}
        universities={universities}
        franchises={franchises}
        users={users}
        currentUser={currentUser}
      />

      <CourseDetailModal
        isOpen={!!selectedCourseDetail}
        onClose={() => setSelectedCourseDetail(null)}
        course={selectedCourseDetail}
        university={
          selectedCourseDetail
            ? universities.find((u) => u.university_id === selectedCourseDetail.university_id)
            : null
        }
        canEdit={currentUser?.role === 'Admin'}
        onEditCourse={(c) => {
          setSelectedCourseDetail(null);
          setEditingCourse(c);
          setShowCourseForm(true);
        }}
        onDeleteCourse={handleDeleteCourse}
        onCheckEligibility={isB2BUser(currentUser) ? undefined : handleQuickCheckEligibility}
        onCompareCourse={handleStartComparisonFromDetail}
        onCreateLead={(c) => handleOpenCreateLead(c)}
      />

      <CourseComparisonModal
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        course1={comparisonCourses[0]}
        course2={comparisonCourses[1]}
        allCourses={courses}
        universities={universities}
        countries={countries}
        onChangeCourse1={(c) => setComparisonCourses([c, comparisonCourses[1]])}
        onChangeCourse2={(c) => setComparisonCourses([comparisonCourses[0], c])}
        onCheckEligibility={isB2BUser(currentUser) ? undefined : handleQuickCheckEligibility}
        onViewDetails={(c) => {
          setShowComparisonModal(false);
          setSelectedCourseDetail(c);
        }}
      />

      <UniversityDetailModal
        isOpen={!!selectedUniversityDetail}
        onClose={() => setSelectedUniversityDetail(null)}
        university={selectedUniversityDetail}
        courses={
          selectedUniversityDetail
            ? courses.filter((c) => c.university_id === selectedUniversityDetail.university_id)
            : []
        }
        canEdit={currentUser?.role === 'Admin'}
        onEditUniversity={(u) => {
          setSelectedUniversityDetail(null);
          setEditingUniversity(u);
          setShowUniversityForm(true);
        }}
        onDeleteUniversity={handleDeleteUniversity}
        onSelectCourse={(c) => {
          setSelectedUniversityDetail(null);
          setSelectedCourseDetail(c);
        }}
      />

      <CourseFormModal
        isOpen={showCourseForm}
        onClose={() => {
          setShowCourseForm(false);
          setEditingCourse(null);
        }}
        onSave={handleSaveCourse}
        initialCourse={editingCourse}
        universities={universities}
        countries={countries}
        programs={programs}
      />

      <UniversityFormModal
        isOpen={showUniversityForm}
        onClose={() => {
          setShowUniversityForm(false);
          setEditingUniversity(null);
        }}
        onSave={handleSaveUniversity}
        initialUniversity={editingUniversity}
        countries={countries}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
        users={users}
      />

      {/* Main Top Header */}
      <Header
        currentUser={currentUser}
        onSwitchUser={handleSwitchUserRole}
        onNavigate={handleNavigate}
        onOpenLoginModal={() => {
          setUsers(SqlStore.getPortalData().users);
          setShowLoginModal(true);
        }}
        onLogout={handleLogout}
        onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
      />

      {/* App Body Shell with Sidebar and Main Content View */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          isOpenMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
        />

        {/* Content Canvas */}
        <main className="flex-1 lg:pl-64 overflow-y-auto p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {catalogReady && catalogError && (
            <div className="mb-4 px-4 py-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl">
              Could not refresh data from SQL Server: {catalogError}
            </div>
          )}
          {currentScreen === 'dashboard' && (
            <DashboardView
              universities={universities}
              courses={courses}
              importHistory={importHistory}
              leads={studentLeads}
              currentUser={currentUser}
              onNavigate={handleNavigate}
              onSelectCourse={(c) => setSelectedCourseDetail(c)}
              onSelectUniversity={(u) => setSelectedUniversityDetail(u)}
              onCreateLead={() => handleOpenCreateLead(null)}
            />
          )}

          {currentScreen === 'workspace_hub' && (
            <GoogleWorkspaceView
              currentUser={currentUser}
              studentLeads={studentLeads}
              courses={courses}
              universities={universities}
              onUpdateLead={handleSaveStudentLead}
            />
          )}

          {currentScreen === 'student_leads' && (
            <StudentLeadsView
              leads={studentLeads}
              currentUser={currentUser}
              courses={courses}
              universities={universities}
              franchises={franchises}
              users={users}
              onCreateLead={(c) => handleOpenCreateLead(c)}
              onEditLead={(l) => handleOpenEditLead(l)}
              onSaveLead={handleSaveStudentLead}
              onDeleteLead={handleDeleteStudentLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onSelectCourse={(c) => setSelectedCourseDetail(c)}
              onSwitchUser={(u) => {
                setCurrentUser(u);
                SqlStore.setSessionUser(u);
              }}
            />
          )}

          {currentScreen === 'search_courses' && (
            <SearchCoursesView
              courses={courses}
              universities={universities}
              currentUser={currentUser}
              onSelectCourse={(c) => setSelectedCourseDetail(c)}
              onCheckEligibility={handleQuickCheckEligibility}
              onCompareCourses={handleCompareTwoCourses}
              onCreateLead={(c) => handleOpenCreateLead(c)}
            />
          )}

          {currentScreen === 'eligibility_checker' && (
            isB2BUser(currentUser) ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-stone-200 shadow-sm space-y-4 max-w-lg mx-auto mt-8">
                <ShieldCheck className="w-12 h-12 text-stone-400 mx-auto" />
                <h2 className="text-xl font-bold text-stone-800">Access Restricted</h2>
                <p className="text-stone-600 text-sm">
                  The Quick Match eligibility evaluation tool is reserved for direct student applicants and educational counselors. B-2-B partners can explore courses, compare degree programs, and submit student referrals directly.
                </p>
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="px-5 py-2.5 bg-[#701C18] text-white font-bold rounded-xl text-sm hover:bg-[#88221D] transition-colors shadow-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <StudentEligibilityChecker
                courses={courses}
                universities={universities}
                currentUser={currentUser}
                initialCourse={eligibilityCheckerInitialCourse}
                onSelectCourse={(c) => setSelectedCourseDetail(c)}
                onCreateLead={(c, profile) => handleOpenCreateLead(c, profile)}
              />
            )
          )}

          {currentScreen === 'universities' && (
            <UniversitiesView
              universities={universities}
              courses={courses}
              countries={countries}
              currentUser={currentUser}
              onSelectUniversity={(u) => setSelectedUniversityDetail(u)}
              onAddUniversity={() => {
                setEditingUniversity(null);
                setShowUniversityForm(true);
              }}
              onEditUniversity={(u) => {
                setEditingUniversity(u);
                setShowUniversityForm(true);
              }}
              onDeleteUniversity={handleDeleteUniversity}
              onDeleteUniversities={handleDeleteUniversities}
            />
          )}

          {currentScreen === 'courses' && (
            <CoursesView
              courses={courses}
              universities={universities}
              currentUser={currentUser}
              onSelectCourse={(c) => setSelectedCourseDetail(c)}
              onAddCourse={() => {
                setEditingCourse(null);
                setShowCourseForm(true);
              }}
              onEditCourse={(c) => {
                setEditingCourse(c);
                setShowCourseForm(true);
              }}
              onDeleteCourse={handleDeleteCourse}
              onDeleteCourses={handleDeleteCourses}
            />
          )}

          {currentScreen === 'data_upload' && (
            <DataUploadView
              universities={universities}
              courses={courses}
              countries={countries}
              programs={programs}
              currentUser={currentUser}
              onImportComplete={handleImportComplete}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'import_history' && (
            <ImportHistoryView
              importHistory={importHistory}
              onNavigate={setCurrentScreen}
            />
          )}

          {currentScreen === 'download_templates' && (
            <DownloadTemplatesView />
          )}

          {currentScreen === 'countries' && (
            <CountriesView
              countries={countries}
              currentUser={currentUser}
              onSaveCountry={handleSaveCountry}
              onDeleteCountry={handleDeleteCountry}
            />
          )}

          {currentScreen === 'programs' && (
            <ProgramsView
              programs={programs}
              currentUser={currentUser}
            />
          )}

          {currentScreen === 'requirements' && (
            <RequirementsView
              currentUser={currentUser}
            />
          )}

          {currentScreen === 'users_team' && (
            <UsersTeamView
              users={users}
              franchises={franchises}
              currentUser={currentUser}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
              onSaveFranchise={handleSaveFranchise}
              onSwitchToUser={(u) => {
                setCurrentUser(u);
                SqlStore.setSessionUser(u);
              }}
            />
          )}

          {currentScreen === 'franchises' && (
            currentUser.role === 'Admin' ? (
              <FranchisesView
                franchises={franchises}
                users={users}
                currentUser={currentUser}
                onSaveFranchise={handleSaveFranchise}
                onDeleteFranchise={handleDeleteFranchise}
                onSaveUser={handleSaveUser}
                onDeleteUser={handleDeleteUser}
              />
            ) : (
              <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 shadow-sm max-w-xl mx-auto my-12 animate-fade-in">
                <div className="w-12 h-12 rounded-full bg-rose-100 text-[#7A2820] flex items-center justify-center mx-auto mb-4 font-bold text-xl">
                  🔒
                </div>
                <h2 className="text-xl font-bold font-display text-stone-900 mb-2">Access Restricted</h2>
                <p className="text-sm text-stone-600 mb-6">
                  The Franchise Portal is strictly restricted to Super Administrators. Franchise users and staff do not have permission to access this section.
                </p>
                <button
                  onClick={() => setCurrentScreen('dashboard')}
                  className="px-5 py-2.5 bg-[#7A2820] text-white font-bold text-xs rounded-xl shadow-md hover:bg-[#A8382C] transition-all cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            )
          )}

          {currentScreen === 'settings' && (
            <SettingsView
              currentUser={currentUser}
              onResetFactoryData={handleResetFactory}
              onUpdateCurrentUser={(up) => {
                if (currentUser) {
                  // Protect role, department, franchise metadata from being tampered via profile update
                  const { role, department, franchise_id, franchise_name, branch_code, export_permission, status, ...safeUp } = up as any;
                  const updated = { ...currentUser, ...safeUp };
                  handleSaveUser(updated);
                }
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
