import React, { useState, useEffect } from 'react';
import { Franchise, UserAccount } from '../types';
import { exportToCsv, printFormattedReport } from '../utils/exportUtils';
import { CrestLogo } from '../components/CrestLogo';
import {
  DEFAULT_CITIES_DATA,
  getAreasForCity,
  getCountryForCity,
  generateFranchiseCodeSuggestion,
  CityLocationData,
} from '../data/locationData';
import {
  Building,
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Percent,
  UserCheck,
  Shield,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
  KeyRound,
  ExternalLink,
  ChevronRight,
  Coins,
  GraduationCap,
  Receipt,
  Calculator,
  Info,
  DollarSign,
  Compass,
  Sparkles,
  Lock,
  ShieldCheck,
} from 'lucide-react';

interface FranchisesViewProps {
  franchises: Franchise[];
  users: UserAccount[];
  currentUser: UserAccount;
  onSaveFranchise: (franchise: Franchise) => void;
  onDeleteFranchise: (franchiseId: string, deleteSubUsers?: boolean) => void;
  onSaveUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
}

export const FranchisesView: React.FC<FranchisesViewProps> = ({
  franchises,
  users,
  currentUser,
  onSaveFranchise,
  onDeleteFranchise,
  onSaveUser,
  onDeleteUser,
}) => {
  const isAdmin = currentUser.role === 'Admin';
  const isFranchiseAdmin = currentUser.role === 'Franchise Admin';
  const isFranchiseStaff = currentUser.role === 'Franchise Staff';

  // Filter franchises if user is a Franchise Admin / Staff
  const visibleFranchises = isAdmin
    ? franchises
    : franchises.filter((f) => f.id === currentUser.franchise_id);

  const [activeTab, setActiveTab] = useState<'franchises' | 'sub_users'>('franchises');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFranchiseFilter, setSelectedFranchiseFilter] = useState<string>(
    isFranchiseAdmin || isFranchiseStaff ? currentUser.franchise_id || 'all' : 'all'
  );

  // Modals
  const [showFranchiseModal, setShowFranchiseModal] = useState(false);
  const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);

  const [showSubUserModal, setShowSubUserModal] = useState(false);
  const [editingSubUser, setEditingSubUser] = useState<UserAccount | null>(null);
  const [targetFranchiseForUser, setTargetFranchiseForUser] = useState<Franchise | null>(
    visibleFranchises[0] || null
  );

  // Delete Confirmation Modal
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'franchise' | 'user';
    id: string;
    name: string;
    subUsersCount?: number;
  } | null>(null);

  // Franchise Form States
  const [fName, setFName] = useState('');
  const [fCode, setFCode] = useState('');
  const [fCity, setFCity] = useState('Islamabad');
  const [fArea, setFArea] = useState('Blue Area');
  const [fCustomCity, setFCustomCity] = useState('');
  const [fCustomArea, setFCustomArea] = useState('');
  const [fCountry, setFCountry] = useState('Pakistan');
  const [fAddress, setFAddress] = useState('');
  const [fContactPerson, setFContactPerson] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fConsultancyCommission, setFConsultancyCommission] = useState<number>(50);
  const [fUniversityCommission, setFUniversityCommission] = useState<number>(20);
  const [fCommission, setFCommission] = useState<number>(20);
  const [fMaxSubUsers, setFMaxSubUsers] = useState<number>(5);
  const [fStatus, setFStatus] = useState<'Active' | 'Inactive'>('Active');
  const [fNotes, setFNotes] = useState('');
  const [createAdminAccountToo, setCreateAdminAccountToo] = useState(true);

  // Sub-User Form States
  const [uName, setUName] = useState('');
  const [uEmail, setUEmail] = useState('');
  const [uPassword, setUPassword] = useState('SWCPortal@2026');
  const [showUPassword, setShowUPassword] = useState(false);
  const [uModalError, setUModalError] = useState('');
  const [uPhone, setUPhone] = useState('');
  const [uRole, setURole] = useState<'Franchise Staff' | 'Franchise Admin'>('Franchise Staff');
  const [uDepartment, setUDepartment] = useState('Student Admissions & Counseling');
  const [uExportPermission, setUExportPermission] = useState(true);
  const [uSelectedFranchiseId, setUSelectedFranchiseId] = useState(
    currentUser.franchise_id || (franchises[0]?.id || '')
  );

  // Helper to handle City selection & auto-populate corresponding Areas
  const handleCitySelect = (selectedCity: string) => {
    setFCity(selectedCity);
    if (selectedCity === 'Other') {
      setFCountry('Pakistan');
      setFArea('Other');
      setFCustomArea('');
      return;
    }
    const country = getCountryForCity(selectedCity);
    setFCountry(country);
    const areas = getAreasForCity(selectedCity);
    const defaultArea = areas[0] || 'Main Commercial Hub';
    setFArea(defaultArea);
    setFCustomArea('');

    // If new franchise, suggest name, code and address
    if (!editingFranchise) {
      const areaClean = defaultArea.split('(')[0].trim();
      setFName(`Study World — ${selectedCity} (${areaClean})`);
      setFCode(generateFranchiseCodeSuggestion(selectedCity, defaultArea));
      setFAddress(`Office Suite, ${defaultArea}, ${selectedCity}`);
    }
  };

  // Helper to handle Area selection
  const handleAreaSelect = (selectedArea: string) => {
    setFArea(selectedArea);
    if (selectedArea !== 'Other' && !editingFranchise) {
      const areaClean = selectedArea.split('(')[0].trim();
      setFName(`Study World — ${fCity} (${areaClean})`);
      setFCode(generateFranchiseCodeSuggestion(fCity, selectedArea));
      setFAddress(`Office Suite, ${selectedArea}, ${fCity}`);
    }
  };

  // Filtered Franchises
  const filteredFranchises = visibleFranchises.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.code.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q) ||
      f.country.toLowerCase().includes(q) ||
      f.contact_person.toLowerCase().includes(q) ||
      f.email.toLowerCase().includes(q)
    );
  });

  // Filtered Sub-Users
  const subUsersList = users.filter((u) => {
    // Only franchise roles or users linked to a franchise
    if (!u.franchise_id && u.role !== 'Franchise Admin' && u.role !== 'Franchise Staff') {
      return false;
    }
    if (!isAdmin && u.franchise_id !== currentUser.franchise_id) {
      return false;
    }
    if (selectedFranchiseFilter !== 'all' && u.franchise_id !== selectedFranchiseFilter) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        (u.franchise_name && u.franchise_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Open Franchise Add Modal
  const handleOpenAddFranchise = () => {
    setEditingFranchise(null);
    setFCity('Islamabad');
    setFCountry('Pakistan');
    const initialAreas = getAreasForCity('Islamabad');
    const defaultArea = initialAreas[0] || 'Blue Area';
    setFArea(defaultArea);
    setFCustomCity('');
    setFCustomArea('');
    setFName(`Study World — Islamabad (${defaultArea})`);
    setFCode(generateFranchiseCodeSuggestion('Islamabad', defaultArea));
    setFAddress(`Office Suite, ${defaultArea}, Islamabad`);
    setFContactPerson('');
    setFEmail('');
    setFPhone('');
    setFConsultancyCommission(50);
    setFUniversityCommission(20);
    setFCommission(20);
    setFMaxSubUsers(5);
    setFStatus('Active');
    setFNotes('');
    setCreateAdminAccountToo(true);
    setShowFranchiseModal(true);
  };

  // Open Franchise Edit Modal
  const handleOpenEditFranchise = (f: Franchise) => {
    setEditingFranchise(f);
    setFName(f.name);
    setFCode(f.code);
    
    const knownCity = DEFAULT_CITIES_DATA.find((c) => c.city.toLowerCase() === f.city.toLowerCase());
    if (knownCity) {
      setFCity(knownCity.city);
      setFCustomCity('');
      const cityAreas = knownCity.areas;
      const matchedArea = cityAreas.find(
        (a) => f.address?.toLowerCase().includes(a.toLowerCase()) || f.name.toLowerCase().includes(a.toLowerCase())
      );
      if (matchedArea) {
        setFArea(matchedArea);
        setFCustomArea('');
      } else {
        setFArea('Other');
        setFCustomArea(f.address ? f.address.split(',')[0].trim() : '');
      }
    } else {
      setFCity('Other');
      setFCustomCity(f.city);
      setFArea('Other');
      setFCustomArea('');
    }

    setFCountry(f.country);
    setFAddress(f.address);
    setFContactPerson(f.contact_person);
    setFEmail(f.email);
    setFPhone(f.phone);
    setFConsultancyCommission(f.consultancy_fee_commission_pct ?? 50);
    setFUniversityCommission(f.university_commission_pct ?? f.commission_rate ?? 20);
    setFCommission(f.commission_rate || 20);
    setFMaxSubUsers(f.max_sub_users || 5);
    setFStatus(f.status);
    setFNotes(f.notes || '');
    setCreateAdminAccountToo(false);
    setShowFranchiseModal(true);
  };

  // Save Franchise Submit
  const handleSubmitFranchise = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCity = fCity === 'Other' ? (fCustomCity.trim() || 'General City') : fCity.trim();
    const finalArea = fArea === 'Other' ? fCustomArea.trim() : fArea.trim();
    const finalAddress = fAddress.trim() || (finalArea ? `${finalArea}, ${finalCity}` : finalCity);

    if (!fName.trim() || !fEmail.trim()) return;

    const franchiseId = editingFranchise?.id || `fr_${Date.now().toString(36)}`;
    const savedFranchise: Franchise = {
      id: franchiseId,
      name: fName.trim(),
      code: fCode.trim() || `SWC-FR-${franchiseId.slice(-4).toUpperCase()}`,
      city: finalCity,
      country: fCountry.trim(),
      address: finalAddress,
      contact_person: fContactPerson.trim(),
      email: fEmail.trim().toLowerCase(),
      phone: fPhone.trim(),
      commission_rate: Number(fUniversityCommission) || 20,
      consultancy_fee_commission_pct: Number(fConsultancyCommission) ?? 50,
      university_commission_pct: Number(fUniversityCommission) ?? 20,
      max_sub_users: Number(fMaxSubUsers) || 5,
      status: fStatus,
      notes: fNotes.trim(),
      created_at: editingFranchise?.created_at || new Date().toISOString().split('T')[0],
    };

    onSaveFranchise(savedFranchise);

    // If new franchise & create Admin requested
    if (!editingFranchise && createAdminAccountToo) {
      const newAdminUser: UserAccount = {
        id: `usr_fr_adm_${Date.now().toString(36)}`,
        name: fContactPerson.trim() || `${fName.trim()} (Admin)`,
        email: fEmail.trim().toLowerCase(),
        password: 'SWCPortal@2026',
        role: 'Franchise Admin',
        status: 'Active',
        export_permission: false,
        department: 'Franchise Management',
        franchise_id: franchiseId,
        franchise_name: fName.trim(),
        branch_code: savedFranchise.code,
        phone: fPhone.trim(),
        last_login: 'Never',
        created_at: new Date().toISOString().split('T')[0],
      };
      onSaveUser(newAdminUser);
    }

    setShowFranchiseModal(false);
  };

  // Quick toggle export permission by Main Admin
  const handleToggleSubUserExportPerm = (targetUser: UserAccount) => {
    if (!isAdmin) {
      alert('Security Policy: Only the Main Admin has administrative authorization to allow or revoke CSV dataset export permissions.');
      return;
    }
    const updatedUser: UserAccount = {
      ...targetUser,
      export_permission: !targetUser.export_permission,
    };
    onSaveUser(updatedUser);
  };

  // Open Sub-User Add Modal
  const handleOpenAddSubUser = (franchise?: Franchise) => {
    const parentFranchise = franchise || (visibleFranchises.find((f) => f.id === selectedFranchiseFilter) || visibleFranchises[0]);
    if (!parentFranchise) {
      alert('Please select or create a franchise first.');
      return;
    }

    // Check capacity
    const currentSubUsersCount = users.filter((u) => u.franchise_id === parentFranchise.id).length;
    if (currentSubUsersCount >= (parentFranchise.max_sub_users || 5)) {
      if (!confirm(`Warning: This franchise has reached its allocated maximum sub-user capacity (${currentSubUsersCount}/${parentFranchise.max_sub_users}). Do you still want to proceed?`)) {
        return;
      }
    }

    setEditingSubUser(null);
    setTargetFranchiseForUser(parentFranchise);
    setUSelectedFranchiseId(parentFranchise.id);
    setUName('');
    setUEmail('');
    setUPassword('SWCPortal@2026');
    setShowUPassword(false);
    setUModalError('');
    setUPhone('');
    setURole('Franchise Staff');
    setUDepartment('Student Admissions & Counseling Desk');
    setUExportPermission(false);
    setShowSubUserModal(true);
  };

  // Open Sub-User Edit Modal
  const handleOpenEditSubUser = (u: UserAccount) => {
    setEditingSubUser(u);
    const parentFranchise = franchises.find((f) => f.id === u.franchise_id) || visibleFranchises[0];
    setTargetFranchiseForUser(parentFranchise);
    setUSelectedFranchiseId(u.franchise_id || parentFranchise.id);
    setUName(u.name);
    setUEmail(u.email);
    setUPassword(u.password || 'SWCPortal@2026');
    setShowUPassword(false);
    setUModalError('');
    setUPhone(u.phone || '');
    setURole(u.role === 'Franchise Admin' ? 'Franchise Admin' : 'Franchise Staff');
    setUDepartment(u.department);
    setUExportPermission(u.export_permission);
    setShowSubUserModal(true);
  };

  // Save Sub-User Submit
  const handleSubmitSubUser = (e: React.FormEvent) => {
    e.preventDefault();
    setUModalError('');

    const trimmedName = uName.trim();
    const trimmedEmail = uEmail.trim().toLowerCase();
    const trimmedPassword = uPassword.trim();

    if (!trimmedName) {
      setUModalError('Full Name is required.');
      return;
    }
    if (!trimmedEmail) {
      setUModalError('Email address is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setUModalError('Please enter a valid email address format.');
      return;
    }

    // Strict Email Uniqueness Check across all accounts
    const isEmailDuplicate = users.some(
      (u) => (u.email || '').trim().toLowerCase() === trimmedEmail && u.id !== editingSubUser?.id
    );
    if (isEmailDuplicate) {
      setUModalError(`The email "${trimmedEmail}" is already registered to another user account.`);
      return;
    }

    if (!trimmedPassword) {
      setUModalError('Password is required for all user accounts.');
      return;
    }
    if (trimmedPassword.length < 6) {
      setUModalError('Password must be at least 6 characters long.');
      return;
    }

    const parentFranchise = franchises.find((f) => f.id === uSelectedFranchiseId) || targetFranchiseForUser;

    // Only Main Admin can allow or modify dataset export permissions
    const finalExportPermission = isAdmin ? uExportPermission : (editingSubUser ? (editingSubUser.export_permission ?? false) : false);

    // Enforce role security:
    // - If Central Superadmin: can assign Franchise Staff or Franchise Admin (except when editing self)
    // - If Franchise Admin: can ONLY create/edit Franchise Staff sub-users for their own branch
    const finalRole = (isAdmin && editingSubUser?.id !== currentUser.id)
      ? uRole
      : (editingSubUser ? (editingSubUser.role === 'Franchise Admin' ? 'Franchise Admin' : 'Franchise Staff') : 'Franchise Staff');

    const saved: UserAccount = {
      id: editingSubUser?.id || `usr_fr_sub_${Date.now().toString(36)}`,
      name: trimmedName,
      email: trimmedEmail,
      password: trimmedPassword,
      role: finalRole,
      status: editingSubUser?.status || 'Active',
      department: uDepartment.trim(),
      export_permission: finalExportPermission,
      phone: uPhone.trim(),
      franchise_id: parentFranchise?.id,
      franchise_name: parentFranchise?.name,
      branch_code: parentFranchise?.code,
      parent_user_id: currentUser.id,
      last_login: editingSubUser?.last_login || 'Never',
      created_at: editingSubUser?.created_at || new Date().toISOString().split('T')[0],
    };

    onSaveUser(saved);
    setShowSubUserModal(false);
  };

  // Trigger Real Delete Confirmation
  const confirmDelete = () => {
    if (!deleteConfirmTarget) return;

    if (deleteConfirmTarget.type === 'franchise') {
      onDeleteFranchise(deleteConfirmTarget.id, true);
    } else {
      onDeleteUser(deleteConfirmTarget.id);
    }
    setDeleteConfirmTarget(null);
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    if (activeTab === 'franchises') {
      const rows = filteredFranchises.map((f) => {
        const subCount = users.filter((u) => u.franchise_id === f.id).length;
        return {
          'Franchise Code': f.code,
          'Franchise Name': f.name,
          'City': f.city,
          'Country': f.country,
          'Contact Person': f.contact_person,
          'Email': f.email,
          'Phone': f.phone,
          'Consultancy Fee Commission %': `${f.consultancy_fee_commission_pct ?? 50}%`,
          'University Commission %': `${f.university_commission_pct ?? f.commission_rate ?? 20}%`,
          'Active Sub-Users': `${subCount} / ${f.max_sub_users}`,
          'Status': f.status,
          'Created Date': f.created_at,
          'Notes': f.notes || '',
        };
      });
      exportToCsv('SWC_Franchise_Network_Directory.csv', rows);
    } else {
      const rows = subUsersList.map((u) => ({
        'Full Name': u.name,
        'Email': u.email,
        'Role': u.role,
        'Franchise': u.franchise_name || 'N/A',
        'Branch Code': u.branch_code || 'N/A',
        'Department': u.department,
        'Phone': u.phone || 'N/A',
        'CSV Export Permission': u.export_permission ? 'Allowed' : 'Restricted',
        'Status': u.status || 'Active',
        'Created Date': u.created_at || 'N/A',
      }));
      exportToCsv('SWC_Franchise_Sub_Users_Roster.csv', rows);
    }
  };

  // Print & PDF Handler
  const handlePrintPdf = () => {
    if (activeTab === 'franchises') {
      const headers = ['Code', 'Franchise Name', 'Location', 'Contact Person', 'Consultancy Comm. %', 'Uni Comm. %', 'Sub-Users', 'Status'];
      const rows = filteredFranchises.map((f) => {
        const subCount = users.filter((u) => u.franchise_id === f.id).length;
        return [
          f.code,
          f.name,
          `${f.city}, ${f.country}`,
          f.contact_person,
          `${f.consultancy_fee_commission_pct ?? 50}%`,
          `${f.university_commission_pct ?? f.commission_rate ?? 20}%`,
          `${subCount} / ${f.max_sub_users} Staff`,
          f.status,
        ];
      });

      printFormattedReport({
        title: 'Study World Consultant — Franchise Network Directory',
        subtitle: `Official Franchise Branches Master List (${filteredFranchises.length} Registered Locations)`,
        badgeText: 'Franchise Operations',
        headers,
        rows,
        currentUser,
      });
    } else {
      const headers = ['Staff Name', 'Role', 'Franchise Branch', 'Department', 'Email / Phone', 'Export Perm.', 'Status'];
      const rows = subUsersList.map((u) => [
        u.name,
        u.role,
        u.franchise_name || 'Central HQ',
        u.department,
        `${u.email} | ${u.phone || '-'}`,
        u.export_permission ? 'Enabled' : 'Restricted',
        u.status || 'Active',
      ]);

      printFormattedReport({
        title: 'Study World Consultant — Franchise Sub-Users & Counselor Roster',
        subtitle: `Counselor Access Control & Staff Directory (${subUsersList.length} Accounts)`,
        badgeText: 'Team Access Control',
        headers,
        rows,
        currentUser,
      });
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 shadow-sm max-w-xl mx-auto my-12 animate-fade-in text-[#241512]">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-[#7A2820] flex items-center justify-center mx-auto mb-4 font-bold text-xl">
          <Lock className="w-6 h-6 text-[#7A2820]" />
        </div>
        <h2 className="text-xl font-bold font-display text-stone-900 mb-2">Access Restricted</h2>
        <p className="text-sm text-stone-600 mb-4">
          The Franchise Management Portal is strictly restricted to Super Administrators. Franchise users and staff do not have permission to access this section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-[#241512]">
      {/* Header Banner with Crest */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#701C18] text-white">
              Network Operations
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {isAdmin ? 'Master Admin Franchise Controller' : `Franchise Portal: ${currentUser.franchise_name || 'Branch'}`}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#701C18] mt-1">
            {isAdmin ? 'Franchise Accounts & Sub-User Management' : 'My Franchise & Team Sub-Users'}
          </h1>
          <p className="text-xs text-stone-500">
            {isAdmin
              ? 'Provision new franchise branches, manage franchise owners, and authorize sub-user counselor seats.'
              : 'Create and manage sub-user counselor accounts for your franchise branch.'}
          </p>
        </div>

        {/* Action Buttons: Add Franchise, Add Sub-User, Print & Export */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={handlePrintPdf}
            className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-300 font-bold text-stone-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Print or Save Report as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-[#701C18]" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-white hover:bg-stone-50 border border-stone-300 font-bold text-stone-700 rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            title="Export Data to CSV"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
            <span>Export CSV</span>
          </button>

          {/* Sub-User Button (Available to Admin and Franchise Admin) */}
          <button
            onClick={() => handleOpenAddSubUser()}
            className="px-3.5 py-2 bg-[#88221D] hover:bg-[#701C18] text-white font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>+ Add Sub-User</span>
          </button>

          {/* Franchise Button (Admin Only) */}
          {isAdmin && (
            <button
              onClick={handleOpenAddFranchise}
              className="px-3.5 py-2 bg-[#701C18] hover:bg-[#4A0E0B] text-white font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
            >
              <Building className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>+ New Franchise Account</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => setActiveTab('franchises')}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                activeTab === 'franchises'
                  ? 'bg-[#701C18] text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Franchise Accounts ({franchises.length})</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('sub_users')}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
              activeTab === 'sub_users' || !isAdmin
                ? 'bg-[#701C18] text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Franchise Sub-Users ({subUsersList.length})</span>
          </button>
        </div>

        {/* Search & Franchise Selector */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {isAdmin && activeTab === 'sub_users' && (
            <select
              value={selectedFranchiseFilter}
              onChange={(e) => setSelectedFranchiseFilter(e.target.value)}
              className="px-3 py-1.5 border border-stone-300 rounded-xl bg-[#FDF9F6] font-semibold text-stone-800 focus:outline-none focus:border-[#701C18]"
            >
              <option value="all">All Franchises ({franchises.length})</option>
              {franchises.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.city})
                </option>
              ))}
            </select>
          )}

          <div className="relative min-w-[220px]">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeTab === 'franchises' ? 'franchises' : 'sub-users'}...`}
              className="w-full pl-8 pr-3 py-1.5 border border-stone-300 rounded-xl bg-[#FDF9F6] focus:bg-white focus:outline-none focus:border-[#701C18]"
            />
          </div>
        </div>
      </div>

      {/* TAB 1: FRANCHISES LIST (Admin View) */}
      {(activeTab === 'franchises' && isAdmin) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFranchises.map((f) => {
            const franchiseSubUsers = users.filter((u) => u.franchise_id === f.id);
            const adminUser = users.find(
              (u) => u.franchise_id === f.id && u.role === 'Franchise Admin'
            );
            const usagePercent = Math.round((franchiseSubUsers.length / (f.max_sub_users || 1)) * 100);

            return (
              <div
                key={f.id}
                className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#701C18] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FAF4EE] border border-[#E8DDD7] text-[#701C18] font-bold flex items-center justify-center text-xs flex-shrink-0">
                        <Building className="w-5 h-5 text-[#88221D]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 bg-stone-100 text-stone-700 rounded-xs">
                            {f.code}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                              f.status === 'Active'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {f.status}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-sm text-stone-900 leading-tight mt-0.5">
                          {f.name}
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Details Pill Box */}
                  <div className="p-3 bg-[#FDF9F6] rounded-xl text-xs space-y-1.5 border border-[#F0E6E0]">
                    <div className="flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <MapPin className="w-3 h-3 text-[#701C18]" /> Location:
                      </span>
                      <span className="font-semibold text-stone-900 text-right">
                        {f.city}, {f.country}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <UserCheck className="w-3 h-3 text-[#701C18]" /> Contact Person:
                      </span>
                      <span className="font-semibold text-stone-900">{f.contact_person}</span>
                    </div>

                    <div className="flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Mail className="w-3 h-3 text-[#701C18]" /> Official Email:
                      </span>
                      <span className="font-semibold text-stone-900 truncate max-w-[150px]">
                        {f.email}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-stone-600">
                      <span className="flex items-center gap-1 text-[11px]">
                        <Phone className="w-3 h-3 text-[#701C18]" /> Phone:
                      </span>
                      <span className="font-semibold text-stone-900">{f.phone}</span>
                    </div>

                    {/* Dual Commission Structure */}
                    <div className="pt-2 border-t border-[#E8DDD7] space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-stone-700 flex items-center gap-1">
                          <Coins className="w-3 h-3 text-[#701C18]" />
                          <span>Commission Structure</span>
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-white rounded-xl border border-amber-200/80 shadow-2xs">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-900">
                            <Receipt className="w-3 h-3 text-amber-700" />
                            <span className="truncate">Consultancy Fee</span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-sm font-black text-amber-950">
                              {f.consultancy_fee_commission_pct ?? 50}%
                            </span>
                            <span className="text-[9px] text-stone-500 font-medium">Service Fee</span>
                          </div>
                        </div>

                        <div className="p-2 bg-white rounded-xl border border-rose-200/80 shadow-2xs">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-[#701C18]">
                            <GraduationCap className="w-3 h-3 text-[#701C18]" />
                            <span className="truncate">Uni. Commission</span>
                          </div>
                          <div className="mt-1 flex items-baseline justify-between">
                            <span className="text-sm font-black text-[#701C18]">
                              {f.university_commission_pct ?? f.commission_rate ?? 20}%
                            </span>
                            <span className="text-[9px] text-stone-500 font-medium">Tuition Kickback</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-User Capacity Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-700">Sub-User Counselor Seats:</span>
                      <span className="font-mono font-bold text-[#701C18]">
                        {franchiseSubUsers.length} / {f.max_sub_users} Active
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usagePercent >= 100 ? 'bg-rose-600' : usagePercent >= 70 ? 'bg-amber-500' : 'bg-[#701C18]'
                        }`}
                        style={{ width: `${Math.min(100, usagePercent)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => {
                      setSelectedFranchiseFilter(f.id);
                      setActiveTab('sub_users');
                    }}
                    className="px-2.5 py-1 text-[#701C18] hover:bg-[#FAF4EE] rounded-lg flex items-center gap-1 font-bold"
                  >
                    <span>View Staff ({franchiseSubUsers.length})</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAddSubUser(f)}
                      className="p-1.5 text-stone-600 hover:text-[#701C18] hover:bg-stone-100 rounded-lg"
                      title="Add Sub-User to this Franchise"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEditFranchise(f)}
                      className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg"
                      title="Edit Franchise Details"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirmTarget({
                          type: 'franchise',
                          id: f.id,
                          name: f.name,
                          subUsersCount: franchiseSubUsers.length,
                        })
                      }
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Franchise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: SUB-USERS & COUNSELORS LIST (Admin and Franchisee View) */}
      {(activeTab === 'sub_users' || !isAdmin) && (
        <div className="space-y-4">
          {/* Franchise Summary Card for Franchise Admins */}
          {!isAdmin && currentUser.franchise_id && (
            <div className="p-5 bg-gradient-to-br from-[#FAF4EE] via-white to-[#FDF9F6] rounded-2xl border border-[#E8DDD7] shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#701C18] text-white flex items-center justify-center font-bold shadow-2xs flex-shrink-0">
                  <Building className="w-6 h-6 text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-white text-[#701C18] rounded-md border border-[#E8DDD7]">
                      {currentUser.branch_code || 'SWC-FR'}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Franchise Active
                    </span>
                  </div>
                  <h2 className="font-display font-bold text-base text-stone-900 mt-0.5">
                    {currentUser.franchise_name}
                  </h2>
                </div>
              </div>

              {/* Commission Badges & Actions */}
              {(() => {
                const myFranchise = franchises.find((f) => f.id === currentUser.franchise_id);
                const consultPct = myFranchise?.consultancy_fee_commission_pct ?? 50;
                const uniPct = myFranchise?.university_commission_pct ?? myFranchise?.commission_rate ?? 20;

                return (
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="p-2.5 px-3.5 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center gap-2.5 shadow-2xs">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800">
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">
                          Consultancy Fee Share
                        </span>
                        <span className="text-sm font-black text-amber-950">{consultPct}%</span>
                      </div>
                    </div>

                    <div className="p-2.5 px-3.5 bg-rose-50 rounded-xl border border-rose-200/80 flex items-center gap-2.5 shadow-2xs">
                      <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-[#701C18]">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] text-[#701C18] font-bold block uppercase tracking-wider">
                          University Comm. Share
                        </span>
                        <span className="text-sm font-black text-[#701C18]">{uniPct}%</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenAddSubUser()}
                      className="px-4 py-2.5 bg-[#701C18] hover:bg-[#4A0E0B] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-amber-300" />
                      <span>Add Sub-User</span>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Sub-Users Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subUsersList.map((user) => (
              <div
                key={user.id}
                className="p-5 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-[#701C18] transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#701C18] to-[#9E2A23] text-white font-bold flex items-center justify-center text-sm shadow-2xs flex-shrink-0">
                        {user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-sm text-stone-900 leading-tight">
                          {user.name}
                        </h3>
                        <p className="text-xs text-stone-500 truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                        user.role === 'Franchise Admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>

                  <div className="p-3 bg-[#FDF9F6] rounded-xl text-xs space-y-1.5 border border-[#F0E6E0]">
                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Franchise Branch:</span>
                      <span className="font-semibold text-[#701C18] text-right truncate max-w-[150px]">
                        {user.franchise_name || 'Central HQ'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-stone-500">Department / Role:</span>
                      <span className="font-semibold text-stone-800 text-right truncate max-w-[150px]">
                        {user.department}
                      </span>
                    </div>

                    {user.phone && (
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Phone:</span>
                        <span className="font-mono text-stone-800">{user.phone}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-1 border-t border-[#E8DDD7]">
                      <span className="text-stone-500">CSV Export:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-bold text-[11px] px-2 py-0.5 rounded-md flex items-center gap-1 ${
                            user.export_permission
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-600 border border-stone-200'
                          }`}
                        >
                          {user.export_permission ? (
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Lock className="w-3 h-3 text-stone-400" />
                          )}
                          <span>{user.export_permission ? 'Allowed' : 'Restricted'}</span>
                        </span>

                        {isAdmin && user.id !== currentUser.id && (
                          <button
                            type="button"
                            onClick={() => handleToggleSubUserExportPerm(user)}
                            className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer border ${
                              user.export_permission
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                                : 'bg-amber-50 hover:bg-amber-100 text-[#701C18] border-amber-300'
                            }`}
                            title={user.export_permission ? 'Revoke CSV Export Permission' : 'Grant CSV Export Permission'}
                          >
                            {user.export_permission ? 'Revoke' : 'Allow'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls with Active Delete */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 text-xs">
                  <button
                    onClick={() => handleOpenEditSubUser(user)}
                    className="px-2.5 py-1 text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  {/* Active Delete User Button */}
                  {user.id !== currentUser.id && (
                    <button
                      onClick={() =>
                        setDeleteConfirmTarget({
                          type: 'user',
                          id: user.id,
                          name: user.name,
                        })
                      }
                      className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                      title="Permanently Delete Sub-User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {subUsersList.length === 0 && (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 space-y-3">
              <Users className="w-12 h-12 text-stone-300 mx-auto" />
              <h3 className="font-display font-bold text-base text-stone-800">No Sub-Users Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Create counselor and staff sub-accounts for your franchise branch to enable portal search access.
              </p>
              <button
                onClick={() => handleOpenAddSubUser()}
                className="px-4 py-2 bg-[#701C18] text-white font-bold text-xs rounded-xl"
              >
                + Add First Sub-User
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT FRANCHISE */}
      {showFranchiseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-xs text-[#241512]">
            <div className="px-6 py-4 bg-gradient-to-r from-[#701C18] to-[#9E2A23] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-amber-300" />
                <h3 className="font-display font-bold text-base">
                  {editingFranchise ? 'Edit Franchise Branch Account' : 'Provision New Franchise Account'}
                </h3>
              </div>
              <button
                onClick={() => setShowFranchiseModal(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitFranchise} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* LOCATION SELECTOR: DEFAULT CITY LIST & DYNAMIC AREA LIST */}
                <div className="sm:col-span-2 p-4 bg-gradient-to-br from-stone-50 via-white to-amber-50/40 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#701C18]" />
                      <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                        Branch Location & Jurisdiction
                      </h4>
                    </div>
                    {fCity !== 'Other' && (
                      <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#701C18]" />
                        <span>{getAreasForCity(fCity).length} Recognized Areas in {fCity}</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. BY DEFAULT CITY LIST */}
                    <div className="space-y-1">
                      <label className="font-bold text-stone-800 text-xs flex items-center justify-between">
                        <span>Select City (Default List) *</span>
                        <span className="text-[10px] text-stone-500 font-normal">Country: {fCountry}</span>
                      </label>
                      <select
                        value={fCity}
                        onChange={(e) => handleCitySelect(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-bold text-xs text-stone-900 focus:outline-none focus:border-[#701C18] focus:ring-1 focus:ring-[#701C18]"
                        required
                      >
                        <optgroup label="─── Pakistan: Major Metros ───">
                          {DEFAULT_CITIES_DATA.filter((c) => c.country === 'Pakistan' && ['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi'].includes(c.city)).map((c) => (
                            <option key={c.city} value={c.city}>
                              {c.city} ({c.province_state})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="─── Pakistan: Key Regional Hubs ───">
                          {DEFAULT_CITIES_DATA.filter((c) => c.country === 'Pakistan' && !['Islamabad', 'Lahore', 'Karachi', 'Rawalpindi'].includes(c.city)).map((c) => (
                            <option key={c.city} value={c.city}>
                              {c.city} ({c.province_state})
                            </option>
                          ))}
                        </optgroup>
                        <optgroup label="─── International Hubs ───">
                          {DEFAULT_CITIES_DATA.filter((c) => c.country !== 'Pakistan').map((c) => (
                            <option key={c.city} value={c.city}>
                              {c.city} ({c.country})
                            </option>
                          ))}
                        </optgroup>
                        <option value="Other">➕ Other / Custom City...</option>
                      </select>

                      {fCity === 'Other' && (
                        <div className="pt-1.5 space-y-1 animate-fade-in">
                          <input
                            type="text"
                            value={fCustomCity}
                            onChange={(e) => setFCustomCity(e.target.value)}
                            placeholder="Type custom city name..."
                            className="w-full px-3 py-1.5 border border-amber-400 rounded-lg text-xs font-bold bg-amber-50/50"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* 2. DYNAMIC AREA LIST FOR CHOSEN CITY */}
                    <div className="space-y-1">
                      <label className="font-bold text-stone-800 text-xs flex items-center justify-between">
                        <span>Area / Sector (in {fCity === 'Other' ? (fCustomCity || 'City') : fCity}) *</span>
                        {fArea !== 'Other' && <span className="text-[10px] text-emerald-700 font-bold">Auto Linked</span>}
                      </label>

                      {fCity !== 'Other' ? (
                        <select
                          value={fArea}
                          onChange={(e) => handleAreaSelect(e.target.value)}
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-bold text-xs text-stone-900 focus:outline-none focus:border-[#701C18] focus:ring-1 focus:ring-[#701C18]"
                          required
                        >
                          {getAreasForCity(fCity).map((area) => (
                            <option key={area} value={area}>
                              📍 {area}
                            </option>
                          ))}
                          <option value="Other">➕ Other / Custom Area or Sector...</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={fCustomArea}
                          onChange={(e) => setFCustomArea(e.target.value)}
                          placeholder="Type area or sector name..."
                          className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-bold text-xs"
                          required
                        />
                      )}

                      {fCity !== 'Other' && fArea === 'Other' && (
                        <div className="pt-1.5 space-y-1 animate-fade-in">
                          <input
                            type="text"
                            value={fCustomArea}
                            onChange={(e) => setFCustomArea(e.target.value)}
                            placeholder={`Type specific area/market in ${fCity}...`}
                            className="w-full px-3 py-1.5 border border-amber-400 rounded-lg text-xs font-bold bg-amber-50/50"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Auto-suggest preview chip */}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px] text-stone-600">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>
                        Active Territory:{' '}
                        <strong className="text-stone-900 font-bold">
                          {fArea === 'Other' ? (fCustomArea || 'Custom Area') : fArea},{' '}
                          {fCity === 'Other' ? (fCustomCity || 'Custom City') : fCity} ({fCountry})
                        </strong>
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const areaClean = (fArea === 'Other' ? fCustomArea : fArea).split('(')[0].trim();
                        const cityClean = fCity === 'Other' ? fCustomCity : fCity;
                        if (cityClean) {
                          setFName(`Study World — ${cityClean} (${areaClean || 'Branch'})`);
                          setFCode(generateFranchiseCodeSuggestion(cityClean, areaClean));
                          setFAddress(`Office Suite, ${areaClean || ''}, ${cityClean}`);
                        }
                      }}
                      className="text-[10px] text-[#701C18] hover:text-[#4A0E0B] font-bold underline cursor-pointer"
                    >
                      Re-sync Name & Code
                    </button>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-700">Franchise Branch Name *</label>
                  <input
                    type="text"
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    placeholder="e.g. Study World — Islamabad (Blue Area)"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-bold text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Branch Code *</label>
                  <input
                    type="text"
                    value={fCode}
                    onChange={(e) => setFCode(e.target.value)}
                    placeholder="e.g. SWC-ISB-BA-101"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono uppercase font-bold text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Country *</label>
                  <input
                    type="text"
                    value={fCountry}
                    onChange={(e) => setFCountry(e.target.value)}
                    placeholder="e.g. Pakistan / UAE"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-medium bg-stone-50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Contact Person / Owner *</label>
                  <input
                    type="text"
                    value={fContactPerson}
                    onChange={(e) => setFContactPerson(e.target.value)}
                    placeholder="e.g. Mian Tariq"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Official Email *</label>
                  <input
                    type="email"
                    value={fEmail}
                    onChange={(e) => setFEmail(e.target.value)}
                    placeholder="e.g. fsd@studyworldfranchise.pk"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Phone / WhatsApp *</label>
                  <input
                    type="text"
                    value={fPhone}
                    onChange={(e) => setFPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                    required
                  />
                </div>

                {/* DUAL COMMISSION STRUCTURE SETTINGS */}
                <div className="sm:col-span-2 p-4 bg-gradient-to-br from-amber-50/80 to-[#FAF4EE] rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-amber-800" />
                      <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                        Franchise Revenue & Commission Model
                      </h4>
                    </div>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                      Dual Revenue Split
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Rate 1: Consultancy Fee % */}
                    <div className="p-3 bg-white rounded-xl border border-amber-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-xs text-amber-950 flex items-center gap-1">
                          <Receipt className="w-3.5 h-3.5 text-amber-700" />
                          <span>Consultancy Fee (%) *</span>
                        </label>
                        <span className="font-black text-amber-900 text-xs">{fConsultancyCommission}%</span>
                      </div>
                      <input
                        type="number"
                        value={fConsultancyCommission}
                        onChange={(e) => setFConsultancyCommission(Math.max(0, Math.min(100, Number(e.target.value))))}
                        min={0}
                        max={100}
                        className="w-full px-3 py-1.5 border border-amber-300 rounded-lg text-xs font-bold text-amber-950 focus:outline-none focus:border-[#701C18]"
                        required
                      />
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Percentage of student registration & processing consultancy fees retained by / paid to franchisee.
                      </p>
                    </div>

                    {/* Rate 2: University Commission % */}
                    <div className="p-3 bg-white rounded-xl border border-rose-200 shadow-2xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-bold text-xs text-[#701C18] flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-[#701C18]" />
                          <span>University Commission (%) *</span>
                        </label>
                        <span className="font-black text-[#701C18] text-xs">{fUniversityCommission}%</span>
                      </div>
                      <input
                        type="number"
                        value={fUniversityCommission}
                        onChange={(e) => setFUniversityCommission(Math.max(0, Math.min(100, Number(e.target.value))))}
                        min={0}
                        max={100}
                        className="w-full px-3 py-1.5 border border-rose-300 rounded-lg text-xs font-bold text-[#701C18] focus:outline-none focus:border-[#701C18]"
                        required
                      />
                      <p className="text-[10px] text-stone-500 leading-tight">
                        Percentage of university tuition recruitment kickback paid by universities to head office shared with franchisee.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Commission Simulation Preview */}
                  <div className="p-3 bg-white/90 rounded-xl border border-stone-200 text-stone-700 text-[11px] space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                      <Calculator className="w-3.5 h-3.5 text-[#701C18]" />
                      <span>Live Revenue Split Simulation (Per Enrolled Student Case)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                      <div className="p-2 bg-stone-50 rounded-lg">
                        <span className="text-[10px] text-stone-500 block">On PKR 50,000 Consultancy Fee:</span>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <span className="font-bold text-stone-700">Franchise Earns:</span>
                          <span className="font-mono font-bold text-amber-900">
                            PKR {((50000 * (fConsultancyCommission || 0)) / 100).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="p-2 bg-stone-50 rounded-lg">
                        <span className="text-[10px] text-stone-500 block">On £1,500 (~PKR 540k) University Commission:</span>
                        <div className="flex items-baseline justify-between mt-0.5">
                          <span className="font-bold text-stone-700">Franchise Earns:</span>
                          <span className="font-mono font-bold text-[#701C18]">
                            £{((1500 * (fUniversityCommission || 0)) / 100).toFixed(0)} (~PKR {Math.round((540000 * (fUniversityCommission || 0)) / 100).toLocaleString()})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-700">Max Sub-Users Allowed</label>
                  <input
                    type="number"
                    value={fMaxSubUsers}
                    onChange={(e) => setFMaxSubUsers(Number(e.target.value))}
                    min={1}
                    max={50}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-700">Office Physical Address</label>
                  <input
                    type="text"
                    value={fAddress}
                    onChange={(e) => setFAddress(e.target.value)}
                    placeholder="e.g. Office 12, Regency Plaza, Mall Road"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-700">Internal Operational Notes</label>
                  <textarea
                    value={fNotes}
                    onChange={(e) => setFNotes(e.target.value)}
                    rows={2}
                    placeholder="Branch agreements, territory exclusivity, target student volume..."
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              {!editingFranchise && (
                <div className="p-3 bg-[#FAF4EE] rounded-xl border border-[#E8DDD7] flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoCreateAdmin"
                    checked={createAdminAccountToo}
                    onChange={(e) => setCreateAdminAccountToo(e.target.checked)}
                    className="w-4 h-4 accent-[#701C18]"
                  />
                  <label htmlFor="autoCreateAdmin" className="font-bold text-stone-800">
                    Automatically create Franchise Administrator account for {fContactPerson || 'Owner'}
                  </label>
                </div>
              )}
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFranchiseModal(false)}
                  className="px-4 py-2.5 text-stone-600 hover:text-stone-900 font-semibold rounded-xl hover:bg-stone-200/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#701C18] hover:bg-[#4A0E0B] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {editingFranchise ? 'Update Franchise' : 'Create Franchise Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT SUB-USER */}
      {showSubUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md max-h-[90vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-xs text-[#241512]">
            <div className="px-6 py-4 bg-gradient-to-r from-[#88221D] to-[#701C18] text-white flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-300" />
                <h3 className="font-display font-bold text-base">
                  {editingSubUser ? 'Edit Franchise Sub-User' : 'Add New Sub-User Counselor'}
                </h3>
              </div>
              <button
                onClick={() => setShowSubUserModal(false)}
                className="text-stone-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitSubUser} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {uModalError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                    <span>{uModalError}</span>
                  </div>
                )}

              {/* Target Franchise Selection */}
              {isAdmin ? (
                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Belongs to Franchise *</label>
                  <select
                    value={uSelectedFranchiseId}
                    onChange={(e) => setUSelectedFranchiseId(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-semibold bg-[#FDF9F6]"
                  >
                    {franchises.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.city})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-[#FAF4EE] rounded-xl border border-[#E8DDD7]">
                  <span className="text-[10px] text-stone-500 uppercase font-bold block">Assigned Franchise Branch:</span>
                  <span className="font-bold text-stone-900">{currentUser.franchise_name}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Sub-User Full Name *</label>
                <input
                  type="text"
                  value={uName}
                  onChange={(e) => setUName(e.target.value)}
                  placeholder="e.g. Mahnoor Tariq"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Official Email Address *</label>
                <input
                  type="email"
                  value={uEmail}
                  onChange={(e) => setUEmail(e.target.value)}
                  placeholder="e.g. counselor@studyworldfranchise.pk"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                  required
                />
              </div>

              {/* Mandatory Login Password */}
              <div className="space-y-1 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#701C18]" />
                    <span>Login Password *</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const randPass = `SWC@${Math.floor(1000 + Math.random() * 9000)}`;
                      setUPassword(randPass);
                      setShowUPassword(true);
                    }}
                    className="text-[11px] font-bold text-[#701C18] hover:text-[#4A0E0B] flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                    <span>Generate</span>
                  </button>
                </div>
                <div className="relative mt-1">
                  <input
                    type={showUPassword ? 'text' : 'password'}
                    value={uPassword}
                    onChange={(e) => setUPassword(e.target.value)}
                    placeholder="e.g. SWCPortal@2026"
                    className="w-full pl-3 pr-10 py-2 border border-stone-300 rounded-xl bg-white focus:border-[#701C18] focus:outline-none text-xs font-mono font-bold"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowUPassword(!showUPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                    title={showUPassword ? 'Hide password' : 'Show password'}
                  >
                    {showUPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Phone / Mobile Number</label>
                <input
                  type="text"
                  value={uPhone}
                  onChange={(e) => setUPhone(e.target.value)}
                  placeholder="e.g. +92 333 1234567"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Sub-User Role *</label>
                {(!isAdmin || editingSubUser?.id === currentUser.id) ? (
                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 text-xs block">
                        {editingSubUser ? editingSubUser.role : 'Franchise Staff (Counselor)'}
                      </span>
                      <span className="text-[10px] text-stone-500">
                        {editingSubUser?.id === currentUser.id
                          ? 'Your account role is protected and can only be modified by the Central Superadmin.'
                          : 'Franchise branch team members are assigned Franchise Staff counselor privileges.'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200 text-stone-700 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-stone-500" />
                      <span>Protected</span>
                    </span>
                  </div>
                ) : (
                  <select
                    value={uRole}
                    onChange={(e) => setURole(e.target.value as any)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-semibold bg-[#FDF9F6] focus:bg-white focus:border-[#701C18] focus:outline-none"
                  >
                    <option value="Franchise Staff">Franchise Staff (Counselor / Student Search)</option>
                    <option value="Franchise Admin">Franchise Admin (Branch Manager)</option>
                  </select>
                )}
              </div>

              <div className="space-y-1">
                <label className="font-bold text-stone-700">Desk / Department</label>
                <input
                  type="text"
                  value={uDepartment}
                  onChange={(e) => setUDepartment(e.target.value)}
                  placeholder="e.g. UK & Australia Admissions Desk"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl"
                />
              </div>

              {/* CSV Export Permission: Main Admin Authorization Only */}
              {isAdmin ? (
                <div className="p-3.5 bg-gradient-to-r from-amber-50/90 to-orange-50/50 rounded-2xl border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#701C18] bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#701C18]" />
                      Main Admin Authorization Control
                    </span>
                    <span className="text-[10px] text-stone-500 font-bold">
                      {uExportPermission ? 'Export Enabled' : 'Export Restricted'}
                    </span>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="subUserExportPerm"
                      checked={uExportPermission}
                      onChange={(e) => setUExportPermission(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#701C18] rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-stone-900 block text-xs">
                        Allow Exporting Course Search Datasets to CSV
                      </span>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-tight">
                        Authorize this counselor to download and export filtered course search datasets and tuition criteria to CSV.
                      </p>
                    </div>
                  </label>
                </div>
              ) : (
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 flex items-start gap-2.5">
                  <Lock className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-800">CSV Dataset Export Access</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                          uExportPermission
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {uExportPermission ? 'Allowed by Admin' : 'Restricted'}
                      </span>
                    </div>
                    <p className="text-stone-500 mt-1 leading-tight">
                      Exporting course search datasets to CSV is protected by central security policy. Only the Main Head Office Admin can allow this privilege.
                    </p>
                  </div>
                </div>
              )}
              </div>

              {/* Modal Sticky Footer */}
              <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-stone-200 bg-stone-50/80 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSubUserModal(false)}
                  className="px-4 py-2.5 text-stone-600 hover:text-stone-900 font-semibold rounded-xl hover:bg-stone-200/60 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#88221D] hover:bg-[#701C18] text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {editingSubUser ? 'Save Changes' : 'Create Sub-User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ACTIVE DELETE CONFIRMATION MODAL */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-xs text-[#241512] p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  Confirm Permanent Deletion
                </h3>
                <p className="text-xs text-stone-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-stone-800 space-y-2">
              <p>
                Are you sure you want to permanently delete{' '}
                <strong className="text-rose-900">{deleteConfirmTarget.name}</strong>?
              </p>
              {deleteConfirmTarget.type === 'franchise' && deleteConfirmTarget.subUsersCount ? (
                <p className="text-[11px] text-rose-700 font-semibold">
                  ⚠️ Deleting this franchise will also remove {deleteConfirmTarget.subUsersCount} associated counselor sub-user accounts.
                </p>
              ) : null}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 text-stone-600 font-semibold hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
