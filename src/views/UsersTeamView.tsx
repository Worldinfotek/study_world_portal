import React, { useState } from 'react';
import { UserAccount, Franchise } from '../types';
import { exportToCsv, printFormattedReport } from '../utils/exportUtils';
import { ViewportOverlay } from '../components/ViewportOverlay';
import {
  DEFAULT_CITIES_DATA,
  getAreasForCity,
  getCountryForCity,
  generateFranchiseCodeSuggestion,
} from '../data/locationData';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  UserCheck,
  Building,
  Mail,
  Printer,
  FileSpreadsheet,
  AlertTriangle,
  AlertCircle,
  Phone,
  CheckCircle2,
  Building2,
  Sparkles,
  Lock,
  ArrowRight,
  Info,
  Compass,
  MapPin,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
} from 'lucide-react';

interface UsersTeamViewProps {
  users: UserAccount[];
  franchises?: Franchise[];
  currentUser: UserAccount;
  onSaveUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onSaveFranchise?: (franchise: Franchise) => void;
  onSwitchToUser?: (user: UserAccount) => void;
}

export const UsersTeamView: React.FC<UsersTeamViewProps> = ({
  users,
  franchises = [],
  currentUser,
  onSaveUser,
  onDeleteUser,
  onSaveFranchise,
  onSwitchToUser,
}) => {
  const isAdmin = currentUser.role === 'Admin';
  const isFranchiseAdmin = currentUser.role === 'Franchise Admin';
  const isFranchiseStaff = currentUser.role === 'Franchise Staff';
  const isOfficeStaff = currentUser.role === 'Office Staff';
  const isRegularStaff = !isAdmin && !isFranchiseAdmin;

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [franchiseFilter, setFranchiseFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<'all_users' | 'my_profile'>('all_users');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Core User Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<{ id: string; msg: string; success: boolean } | null>(null);
  const [role, setRole] = useState<'Admin' | 'Office Staff' | 'Franchise Admin' | 'Franchise Staff' | 'B-2-B' | 'User'>('Office Staff');
  const [department, setDepartment] = useState('Counseling & Admissions');
  const [exportPermission, setExportPermission] = useState(true);

  // Franchise Admin Creation States (Auto create Franchise branch)
  const [franchiseMode, setFranchiseMode] = useState<'new' | 'existing'>('new');
  const [newFranchiseName, setNewFranchiseName] = useState('');
  const [newFranchiseCity, setNewFranchiseCity] = useState('Islamabad');
  const [newFranchiseArea, setNewFranchiseArea] = useState('Blue Area');
  const [newFranchiseCustomCity, setNewFranchiseCustomCity] = useState('');
  const [newFranchiseCustomArea, setNewFranchiseCustomArea] = useState('');
  const [newFranchiseCode, setNewFranchiseCode] = useState('');
  const [newFranchiseAddress, setNewFranchiseAddress] = useState('');
  const [newFranchiseConsultancyCommission, setNewFranchiseConsultancyCommission] = useState<number>(50);
  const [newFranchiseUniversityCommission, setNewFranchiseUniversityCommission] = useState<number>(20);
  
  // Selected Existing Franchise (For Admin manual assignment/change)
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>('');
  const [modalError, setModalError] = useState<string>('');

  const handleCityChange = (c: string) => {
    setNewFranchiseCity(c);
    if (c === 'Other') {
      setNewFranchiseArea('Other');
      setNewFranchiseCustomArea('');
      return;
    }
    const areas = getAreasForCity(c);
    const defaultArea = areas[0] || 'Main Commercial Area';
    setNewFranchiseArea(defaultArea);
    setNewFranchiseCustomArea('');

    const areaClean = defaultArea.split('(')[0].trim();
    setNewFranchiseName(`Study World — ${c} (${areaClean})`);
    setNewFranchiseCode(generateFranchiseCodeSuggestion(c, defaultArea));
    setNewFranchiseAddress(`Office Suite, ${defaultArea}, ${c}`);
  };

  const handleAreaChange = (a: string) => {
    setNewFranchiseArea(a);
    if (a !== 'Other') {
      const areaClean = a.split('(')[0].trim();
      setNewFranchiseName(`Study World — ${newFranchiseCity} (${areaClean})`);
      setNewFranchiseCode(generateFranchiseCodeSuggestion(newFranchiseCity, a));
      setNewFranchiseAddress(`Office Suite, ${a}, ${newFranchiseCity}`);
    }
  };

  const handleFranchiseNameChange = (val: string) => {
    setNewFranchiseName(val);
  };

  // Strict RBAC Filtering:
  // - Admin sees ALL users in the entire system.
  // - Franchise Admin sees ONLY their own account + sub-users belonging to their specific franchise.
  // - Regular Staff (Office Staff / Franchise Staff) sees ONLY their own account.
  const filteredUsers = users.filter((u) => {
    if (isRegularStaff) {
      return u.id === currentUser.id;
    }
    if (isFranchiseAdmin) {
      return u.franchise_id === currentUser.franchise_id || u.id === currentUser.id;
    }

    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (franchiseFilter !== 'all') {
      if (franchiseFilter === 'head_office' && (u.franchise_id || u.role === 'Franchise Admin' || u.role === 'Franchise Staff')) return false;
      if (franchiseFilter !== 'head_office' && u.franchise_id !== franchiseFilter) return false;
    }

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      (u.franchise_name && u.franchise_name.toLowerCase().includes(q)) ||
      (u.branch_code && u.branch_code.toLowerCase().includes(q)) ||
      (u.phone && u.phone.includes(q))
    );
  });

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('SWCPortal@2026');
    setShowModalPassword(false);
    setModalError('');
    
    // If Franchise Admin is creating, default role to Franchise Staff (Sub-User Counselor)
    if (isFranchiseAdmin) {
      setRole('Franchise Staff');
      setDepartment('Counseling & Student Admissions');
      setSelectedFranchiseId(currentUser.franchise_id || '');
    } else {
      setRole('Franchise Admin');
      setDepartment('Branch Management');
      setSelectedFranchiseId(franchises[0]?.id || '');
    }

    // Default export permission to false so ONLY Main Admin can explicitly allow if needed
    setExportPermission(false);
    setFranchiseMode('new');
    setNewFranchiseCity('Islamabad');
    const initialAreas = getAreasForCity('Islamabad');
    const defaultArea = initialAreas[0] || 'Blue Area';
    setNewFranchiseArea(defaultArea);
    setNewFranchiseCustomCity('');
    setNewFranchiseCustomArea('');
    setNewFranchiseName(`Study World — Islamabad (${defaultArea})`);
    setNewFranchiseCode(generateFranchiseCodeSuggestion('Islamabad', defaultArea));
    setNewFranchiseAddress(`Office Suite, ${defaultArea}, Islamabad`);
    setNewFranchiseConsultancyCommission(50);
    setNewFranchiseUniversityCommission(20);
    setShowModal(true);
  };

  const handleToggleUserExportPerm = (targetUser: UserAccount) => {
    if (!isAdmin) {
      alert('Security Policy: Only the Main Admin has authorization to allow or revoke Course Search dataset export permissions.');
      return;
    }
    const updatedUser: UserAccount = {
      ...targetUser,
      export_permission: !targetUser.export_permission,
    };
    onSaveUser(updatedUser);
  };

  const handleOpenEdit = (user: UserAccount) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone || '');
    setPassword(user.password || (user.role === 'Admin' ? 'SWCAdmin@2026' : 'SWCPortal@2026'));
    setShowModalPassword(false);
    setModalError('');
    setRole(user.role);
    setDepartment(user.department);
    setSelectedFranchiseId(user.franchise_id || '');
    setExportPermission(user.export_permission);

    // If editing a Franchise Admin
    if (user.role === 'Franchise Admin') {
      const existingFranchise = franchises.find((f) => f.id === user.franchise_id);
      if (existingFranchise) {
        setFranchiseMode('existing');
        setNewFranchiseName(existingFranchise.name);
        setNewFranchiseCity(existingFranchise.city);
        setNewFranchiseCode(existingFranchise.code);
        setNewFranchiseAddress(existingFranchise.address || '');
      } else {
        setFranchiseMode('new');
        setNewFranchiseName(user.franchise_name || '');
        setNewFranchiseCity('Islamabad');
        const defaultArea = getAreasForCity('Islamabad')[0] || 'Blue Area';
        setNewFranchiseArea(defaultArea);
        setNewFranchiseCode(user.branch_code || 'SWC-ISB-BA-01');
        setNewFranchiseAddress('');
      }
    }

    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedName) {
      setModalError('Full Name is mandatory.');
      return;
    }

    if (!trimmedEmail) {
      setModalError('Email address is mandatory.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setModalError('Please enter a valid email address format.');
      return;
    }

    // Strict Email Uniqueness Check across all system accounts
    const isEmailDuplicate = users.some(
      (u) => (u.email || '').trim().toLowerCase() === trimmedEmail && u.id !== editingUser?.id
    );
    if (isEmailDuplicate) {
      setModalError(
        `The email address "${trimmedEmail}" is already registered to another user account. Every user must have a unique email address.`
      );
      return;
    }

    // Password Check (Mandatory for new user accounts)
    if (!editingUser) {
      if (!trimmedPassword) {
        setModalError('Password is mandatory when creating a new user account.');
        return;
      }
      if (trimmedPassword.length < 6) {
        setModalError('Password must be at least 6 characters long.');
        return;
      }
    } else if (trimmedPassword && trimmedPassword.length < 6) {
      setModalError('Password must be at least 6 characters long.');
      return;
    }

    const isEditingOwnAccount = editingUser?.id === currentUser.id;
    const canManageRoleAndDepartment = isAdmin && !isEditingOwnAccount;

    let finalFranchiseId: string | undefined = undefined;
    let finalFranchiseName: string | undefined = undefined;
    let finalBranchCode: string | undefined = undefined;

    if (canManageRoleAndDepartment) {
      // CASE 1: Franchise Admin
      if (role === 'Franchise Admin') {
        if (franchiseMode === 'new' || (!selectedFranchiseId && newFranchiseName.trim())) {
          // Auto-create brand new Franchise in the system
          const newId = `fr_${Date.now().toString(36)}`;
          const finalCity = newFranchiseCity === 'Other' ? (newFranchiseCustomCity.trim() || 'General City') : newFranchiseCity.trim();
          const finalArea = newFranchiseArea === 'Other' ? newFranchiseCustomArea.trim() : newFranchiseArea.trim();
          const finalAddress = newFranchiseAddress.trim() || (finalArea ? `${finalArea}, ${finalCity}` : finalCity);
          const country = getCountryForCity(finalCity);
          const code = newFranchiseCode.trim() || generateFranchiseCodeSuggestion(finalCity, finalArea);
          const nameToSave = newFranchiseName.trim() || `Study World — ${finalCity} (${finalArea || 'Branch'})`;

          const newFranchiseObj: Franchise = {
            id: newId,
            name: nameToSave,
            code: code.toUpperCase(),
            city: finalCity,
            country: country,
            address: finalAddress,
            contact_person: trimmedName,
            email: trimmedEmail,
            phone: phone.trim() || '+92 300 0000000',
            status: 'Active',
            commission_rate: Number(newFranchiseUniversityCommission) || 20,
            consultancy_fee_commission_pct: Number(newFranchiseConsultancyCommission) ?? 50,
            university_commission_pct: Number(newFranchiseUniversityCommission) ?? 20,
            max_sub_users: 10,
            notes: `Auto-registered upon creating Franchise Admin (${trimmedName})`,
            created_at: new Date().toISOString().split('T')[0],
          };

          onSaveFranchise?.(newFranchiseObj);

          finalFranchiseId = newFranchiseObj.id;
          finalFranchiseName = newFranchiseObj.name;
          finalBranchCode = newFranchiseObj.code;
        } else {
          // Existing franchise selected
          const matched = franchises.find((f) => f.id === selectedFranchiseId);
          if (matched) {
            finalFranchiseId = matched.id;
            finalFranchiseName = matched.name;
            finalBranchCode = matched.code;
          }
        }
      } 
      // CASE 2: Franchise Staff (Sub-User Counselor)
      else if (role === 'Franchise Staff') {
        const matched = franchises.find((f) => f.id === selectedFranchiseId);
        if (matched) {
          finalFranchiseId = matched.id;
          finalFranchiseName = matched.name;
          finalBranchCode = matched.code;
        } else if (franchises.length > 0) {
          finalFranchiseId = franchises[0].id;
          finalFranchiseName = franchises[0].name;
          finalBranchCode = franchises[0].code;
        }
      }
      // CASE 3: B-2-B Role (Independent Partner / Agent - No Franchise or Branch)
      else if (role === 'B-2-B') {
        finalFranchiseId = undefined;
        finalFranchiseName = undefined;
        finalBranchCode = undefined;
      }
    } else if (isFranchiseAdmin && !editingUser) {
      // Franchise Admin creating new sub-user staff
      finalFranchiseId = currentUser.franchise_id;
      finalFranchiseName = currentUser.franchise_name;
      finalBranchCode = currentUser.branch_code;
    } else {
      // Retain existing franchise and branch assignments when editing own profile or non-admin
      if (editingUser?.role === 'B-2-B' || role === 'B-2-B') {
        finalFranchiseId = undefined;
        finalFranchiseName = undefined;
        finalBranchCode = undefined;
      } else {
        finalFranchiseId = editingUser?.franchise_id;
        finalFranchiseName = editingUser?.franchise_name;
        finalBranchCode = editingUser?.branch_code;
      }
    }

    // Determine final role & department
    const finalRole = canManageRoleAndDepartment
      ? role
      : editingUser
      ? editingUser.role
      : isFranchiseAdmin
      ? 'Franchise Staff'
      : role;

    const finalDepartment = canManageRoleAndDepartment
      ? (department.trim() || (finalRole === 'B-2-B' ? 'B2B Partner & External Referral Network' : finalRole === 'Franchise Admin' ? 'Branch Management' : 'Counseling & Admissions'))
      : editingUser
      ? editingUser.department
      : (isFranchiseAdmin ? 'Counseling & Student Admissions' : 'Counseling & Admissions');

    // Only Main Admin has administrative authority to grant/modify CSV export permissions
    const finalExportPermission = isAdmin && !isEditingOwnAccount
      ? exportPermission
      : (editingUser ? (editingUser.export_permission ?? false) : false);

    const saved: UserAccount = {
      id: editingUser?.id || `usr_${Date.now().toString(36)}`,
      name: trimmedName,
      email: trimmedEmail,
      phone: phone.trim(),
      auth_provider: editingUser?.auth_provider || 'email',
      role: finalRole,
      status: editingUser?.status || 'Active',
      department: finalDepartment,
      export_permission: finalExportPermission,
      franchise_id: finalFranchiseId,
      franchise_name: finalFranchiseName,
      branch_code: finalBranchCode,
      parent_user_id: isFranchiseAdmin ? currentUser.id : editingUser?.parent_user_id,
      last_login: editingUser?.last_login || 'Never',
      created_at: editingUser?.created_at || new Date().toISOString().split('T')[0],
      ...(trimmedPassword ? { password: trimmedPassword } : {}),
    };

    onSaveUser(saved);
    setShowModal(false);
  };

  const handleExportCsv = () => {
    const rows = filteredUsers.map((u) => ({
      'Full Name': u.name,
      'Email Address': u.email,
      'System Role': u.role,
      'Branch / Department': u.department,
      'Affiliated Franchise': u.franchise_name || 'Central Head Office',
      'Branch Code': u.branch_code || 'N/A',
      'Phone Number': u.phone || 'N/A',
      'CSV Export Permission': u.export_permission ? 'Allowed' : 'Restricted',
      'Account Status': u.status || 'Active',
      'Last Login': u.last_login || 'Never',
      'Account Created': u.created_at || 'N/A',
    }));
    exportToCsv('SWC_Team_Accounts_Directory.csv', rows);
  };

  const handlePrintPdf = () => {
    const headers = ['Staff Name', 'Email', 'Role', 'Department / Branch', 'Franchise Office', 'Branch Code', 'Export Perm.', 'Status'];
    const rows = filteredUsers.map((u) => [
      u.name,
      u.email,
      u.role,
      u.department,
      u.franchise_name || 'Central Head Office',
      u.branch_code || 'HQ',
      u.export_permission ? 'Enabled' : 'Restricted',
      u.status || 'Active',
    ]);

    printFormattedReport({
      title: 'Study World Consultant — User Accounts & RBAC Roster',
      subtitle: `Authorized System Users & Access Privileges (${filteredUsers.length} Users)`,
      badgeText: 'Team Directory',
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
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              isAdmin ? 'bg-[#701C18] text-white' : isFranchiseAdmin ? 'bg-amber-900 text-amber-100' : 'bg-stone-800 text-stone-100'
            }`}>
              {isAdmin ? 'Master Administration' : isFranchiseAdmin ? 'Franchise Branch Portal' : 'Personal Account & Profile'}
            </span>
            <span className="text-xs text-stone-500 font-medium">
              {isAdmin ? 'Full Multi-Account Access' : isFranchiseAdmin ? 'Branch Team Management' : 'Restricted Personal Access'}
            </span>
          </div>
          <h1 className="text-2xl font-display font-bold text-[#701C18] mt-1">
            {isAdmin ? 'Users & Team Access Control' : isFranchiseAdmin ? 'Franchise Staff & Sub-Users' : 'My Account & Counselor Profile'}
          </h1>
          <p className="text-xs text-stone-500">
            {isAdmin
              ? 'Super Admin master directory: view, operate, manage, and switch to all system accounts, franchises, and counselors.'
              : isFranchiseAdmin
              ? `Manage counseling staff and sub-user accounts for ${currentUser.franchise_name || 'your franchise branch'}.`
              : 'Manage your personal profile details, contact information, password, and view authorized permissions.'}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {(isAdmin || isFranchiseAdmin) && (
            <>
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
                title="Export CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-[#701C18] hover:bg-[#4A0E0B] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4 text-[#D4AF37]" />
                <span>{isFranchiseAdmin ? 'Add Franchise Staff' : 'Add User Account'}</span>
              </button>
            </>
          )}

          {isRegularStaff && (
            <button
              onClick={() => handleOpenEdit(currentUser)}
              className="px-4 py-2 bg-[#701C18] hover:bg-[#4A0E0B] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors"
            >
              <Edit2 className="w-4 h-4 text-[#D4AF37]" />
              <span>Edit My Profile & Password</span>
            </button>
          )}
        </div>
      </div>

      {/* Regular Staff Notice or Filter Bar */}
      {isRegularStaff ? (
        <div className="p-4 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-950">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 flex-shrink-0" />
            <div>
              <strong className="block font-bold">Personal Account Scope Active</strong>
              <span className="text-amber-800 text-[11px]">
                You are logged into your counselor profile. System-wide user administration and directory rosters are restricted to the Super Administrator.
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-white border border-amber-200 rounded-lg font-bold text-[10px] text-[#701C18]">
            {currentUser.role}
          </span>
        </div>
      ) : (
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, branch, department..."
                className="w-full pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-[#FDF9F6] focus:bg-white focus:outline-none focus:border-[#701C18]"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-stone-300 rounded-xl bg-[#FDF9F6] font-semibold text-stone-800 focus:outline-none focus:border-[#701C18]"
            >
              <option value="all">All Roles ({filteredUsers.length})</option>
              <option value="Admin">Admin</option>
              <option value="Office Staff">Office Staff</option>
              <option value="Franchise Admin">Franchise Admin</option>
              <option value="Franchise Staff">Franchise Staff</option>
              <option value="B-2-B">B-2-B (Independent Partner)</option>
              <option value="User">User (Public Student)</option>
            </select>

            {isAdmin && franchises.length > 0 && (
              <select
                value={franchiseFilter}
                onChange={(e) => setFranchiseFilter(e.target.value)}
                className="px-3 py-2 border border-stone-300 rounded-xl bg-[#FDF9F6] font-semibold text-stone-800 focus:outline-none focus:border-[#701C18]"
              >
                <option value="all">All Branches / HQ</option>
                <option value="head_office">Central Head Office Only</option>
                {franchises.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.city})
                  </option>
                ))}
              </select>
            )}
          </div>

          <span className="text-stone-500 font-medium">
            Showing {filteredUsers.length} Authorized {filteredUsers.length === 1 ? 'Account' : 'Accounts'}
          </span>
        </div>
      )}

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
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
                    <p className="text-xs text-stone-500 truncate max-w-[170px]">{user.email}</p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                    user.role === 'Admin'
                      ? 'bg-rose-100 text-[#701C18] border border-rose-200'
                      : user.role === 'B-2-B'
                      ? 'bg-purple-100 text-purple-900 border border-purple-300 font-black'
                      : user.role === 'Franchise Admin'
                      ? 'bg-amber-100 text-amber-900 border border-amber-200'
                      : user.role === 'Franchise Staff'
                      ? 'bg-sky-100 text-sky-900 border border-sky-200'
                      : user.role === 'User'
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {user.role}
                </span>
              </div>

              <div className="p-3 bg-[#FDF9F6] rounded-xl text-xs space-y-1.5 border border-[#F0E6E0]">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Franchise Branch:</span>
                  <span className="font-semibold text-[#701C18] text-right truncate max-w-[160px]" title={user.franchise_name}>
                    {user.role === 'B-2-B' ? (
                      <span className="text-purple-800 font-bold bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                        Independent B-2-B Partner
                      </span>
                    ) : user.franchise_name ? (
                      <span className="flex items-center gap-1 justify-end">
                        <Building2 className="w-3 h-3 text-[#701C18] inline flex-shrink-0" />
                        <span>{user.franchise_name}</span>
                      </span>
                    ) : (
                      'Central Head Office'
                    )}
                  </span>
                </div>

                {user.branch_code && (
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Branch Code:</span>
                    <span className="font-mono text-[11px] font-bold text-amber-900 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      {user.branch_code}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Department / Desk:</span>
                  <span className="font-semibold text-stone-800 text-right truncate max-w-[150px]">
                    {user.department}
                  </span>
                </div>

                {user.phone && (
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500">Phone:</span>
                    <span className="text-stone-700 font-medium">{user.phone}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
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
                        onClick={() => handleToggleUserExportPerm(user)}
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

                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Last Activity:</span>
                  <span className="text-stone-700 font-mono text-[11px]">{user.last_login}</span>
                </div>

                {(isAdmin || (isFranchiseAdmin && (user.franchise_id === currentUser.franchise_id || user.parent_user_id === currentUser.id)) || user.id === currentUser.id) && (
                  <div className="flex justify-between items-center bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200/80 mt-1">
                    <span className="text-stone-500 text-[11px] flex items-center gap-1 font-medium">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      <span>Security:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-stone-700 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                        {user.auth_provider === 'google' ? 'Google Auth' : 'SQL / scrypt'}
                      </span>
                      {user.email && (
                        <button
                          type="button"
                          onClick={() => {
                            setResetStatus({ id: user.id, msg: 'Feature not available yet', success: false });
                            setTimeout(() => setResetStatus(null), 4000);
                          }}
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${
                            resetStatus?.id === user.id
                              ? resetStatus.success
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                              : 'text-[#701C18] hover:bg-[#FAF4EE]'
                          }`}
                          title="Password reset is not available yet"
                        >
                          {resetStatus?.id === user.id ? resetStatus.msg : 'Reset Link'}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
              {/* Admin Switch / Use Account Button */}
              {isAdmin && user.id !== currentUser.id && onSwitchToUser && (
                <button
                  type="button"
                  onClick={() => onSwitchToUser(user)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#701C18] border border-amber-200 rounded-lg flex items-center gap-1.5 font-bold transition-colors shadow-2xs"
                  title={`Impersonate & Use ${user.name}'s Account`}
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#A8382C]" />
                  <span>Use Account</span>
                </button>
              )}

              {user.id === currentUser.id && (
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  <span>Your Active Session</span>
                </span>
              )}

              <div className="flex items-center gap-1.5 ml-auto">
                {(isAdmin || (isFranchiseAdmin && (user.franchise_id === currentUser.franchise_id || user.id === currentUser.id)) || (isRegularStaff && user.id === currentUser.id)) && (
                  <button
                    onClick={() => handleOpenEdit(user)}
                    className="px-2.5 py-1 text-stone-700 hover:bg-stone-100 rounded-lg flex items-center gap-1 font-semibold"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{user.id === currentUser.id ? 'Manage Profile' : 'Edit'}</span>
                  </button>
                )}

                {/* Active Delete User */}
                {user.id !== currentUser.id && (isAdmin || (isFranchiseAdmin && user.role === 'Franchise Staff' && user.franchise_id === currentUser.franchise_id)) && (
                  <button
                    onClick={() => setDeleteTargetUser(user)}
                    className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 font-semibold transition-colors"
                    title="Permanently Delete User"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL: ADD / EDIT USER */}
      {showModal && (
        <ViewportOverlay onBackdropClick={() => setShowModal(false)}>
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-xs text-[#241512] my-8">
            <div className="px-6 py-4 bg-gradient-to-r from-[#88221D] to-[#701C18] text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base">
                  {editingUser
                    ? `Edit User Account — ${editingUser.name}`
                    : isFranchiseAdmin
                    ? 'Add Franchise Counselor (Sub-User)'
                    : 'Add New User / Branch Manager'}
                </h3>
                <p className="text-[11px] text-stone-200">
                  {isFranchiseAdmin
                    ? `Will be automatically linked to ${currentUser.franchise_name}`
                    : 'Configure credentials, system role, and franchise branch ownership'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-stone-300 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-bold text-stone-700">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:border-[#701C18] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Official Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. tariq@studyworld.pk"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:border-[#701C18] focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700">Phone / WhatsApp</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:border-[#701C18] focus:outline-none"
                  />
                </div>

                {/* Account Login Password Field */}
                <div className="space-y-1 sm:col-span-2 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-stone-800 text-xs flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#701C18]" />
                      <span>{editingUser ? 'Update Password (leave blank to keep current)' : 'Initial Account Password *'}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randPass = `SWC@${Math.floor(1000 + Math.random() * 9000)}`;
                        setPassword(randPass);
                        setShowModalPassword(true);
                      }}
                      className="text-[11px] font-bold text-[#701C18] hover:text-[#4A0E0B] flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                      <span>Generate Password</span>
                    </button>
                  </div>
                  <div className="relative mt-1">
                    <input
                      type={showModalPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={editingUser ? 'Leave blank to preserve existing credentials' : 'e.g. SWCPortal@2026'}
                      className="w-full pl-3 pr-10 py-2 border border-stone-300 rounded-xl bg-white focus:border-[#701C18] focus:outline-none text-xs font-mono font-bold"
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowModalPassword(!showModalPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1"
                      title={showModalPassword ? 'Hide password' : 'Show password'}
                    >
                      {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    {editingUser
                      ? 'Leave blank to keep the existing SQL password. A new value is hashed and stored in SQL Server.'
                      : 'Initial password is required. It is hashed and stored in SQL Server.'}
                  </p>
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 flex items-center justify-between">
                  <span>System Role *</span>
                  {(!isAdmin || editingUser?.id === currentUser.id) && (
                    <span className="text-[10px] text-stone-400 font-normal flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Assigned by Admin</span>
                    </span>
                  )}
                </label>
                {isFranchiseAdmin && !editingUser ? (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 block">Franchise Staff (Sub-User Counselor)</span>
                    <span className="text-[11px] text-amber-700">
                      As a Franchise Admin, created accounts are automatically registered as your branch staff.
                    </span>
                  </div>
                ) : (!isAdmin || editingUser?.id === currentUser.id) ? (
                  <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900 text-xs block">{role}</span>
                      <span className="text-[10px] text-stone-500">
                        {editingUser?.id === currentUser.id
                          ? 'Role privileges and access tiers can only be modified by a Super Administrator.'
                          : 'Role assigned by administrative policy.'}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-200 text-stone-700 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-stone-500" />
                      <span>Read-only</span>
                    </span>
                  </div>
                ) : (
                  <select
                    value={role}
                    onChange={(e) => {
                      const selected = e.target.value as any;
                      setRole(selected);
                      if (selected === 'B-2-B') {
                        setDepartment('B2B Partner & External Referral Network');
                      } else if (selected === 'Franchise Admin') {
                        setDepartment('Branch Management');
                      } else if (selected === 'Franchise Staff') {
                        setDepartment('Counseling & Student Admissions');
                      } else if (selected === 'Office Staff') {
                        setDepartment('Counseling & Admissions');
                      }
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-semibold focus:border-[#701C18] focus:outline-none"
                  >
                    <option value="Franchise Admin">Franchise Admin (Branch Manager & Auto-Create Branch)</option>
                    <option value="Franchise Staff">Franchise Staff (Sub-User Counselor)</option>
                    <option value="Office Staff">Office Staff (Head Office Counselor)</option>
                    <option value="B-2-B">B-2-B (Independent Partner / Agent — No Branch Required)</option>
                    <option value="User">User (Public Student Portal)</option>
                    <option value="Admin">Central Admin (Full System Administrator)</option>
                  </select>
                )}
              </div>

              {/* SECTION: B-2-B PARTNER NOTICE (Independent user, no franchise or branch) */}
              {role === 'B-2-B' && (
                <div className="p-4 bg-purple-50/90 rounded-2xl border border-purple-200 space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck className="w-5 h-5 text-purple-700 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-purple-950 text-xs">
                        Independent B-2-B Partner / Agent Profile
                      </h4>
                      <p className="text-[11px] text-purple-900 mt-0.5 leading-relaxed">
                        This user operates independently outside the franchise network. No franchise or branch assignment is required.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 p-3 rounded-xl border border-purple-100 text-[11px] text-stone-700 space-y-1.5">
                    <div className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Authorized Capabilities:</span>
                    </div>
                    <ul className="list-disc list-inside space-y-0.5 text-stone-600 pl-1">
                      <li>Can add student leads & inquiries</li>
                      <li>Can search and compare courses</li>
                      <li>Can view partner universities directory</li>
                    </ul>
                    <div className="pt-1 text-[10px] text-rose-700 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-rose-600 flex-shrink-0" />
                      <span>Restricted: Cannot create, manage, or invite any sub-users or users.</span>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION: FRANCHISE ADMIN AUTO-CREATION & SETUP (Only when Admin is creating/configuring other accounts) */}
              {role === 'Franchise Admin' && isAdmin && editingUser?.id !== currentUser.id && (
                <div className="p-4 bg-gradient-to-br from-amber-50/80 to-[#FAF4EE] rounded-2xl border border-amber-200/80 space-y-3">
                  <div className="flex items-start gap-2">
                    <Building className="w-4 h-4 text-amber-800 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs">
                        Franchise Branch Creation & Linking
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        Specify the Franchise Name below. The system will automatically register this Franchise Branch in the portal and link it to this Branch Manager.
                      </p>
                    </div>
                  </div>

                  {/* If Admin and existing franchises exist, allow toggling */}
                  {isAdmin && franchises.length > 0 && (
                    <div className="flex items-center gap-4 pt-1 text-[11px]">
                      <label className="flex items-center gap-1.5 cursor-pointer font-bold text-stone-800">
                        <input
                          type="radio"
                          name="franchiseMode"
                          value="new"
                          checked={franchiseMode === 'new'}
                          onChange={() => setFranchiseMode('new')}
                          className="accent-[#701C18]"
                        />
                        <span>Create New Franchise Branch</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-stone-700">
                        <input
                          type="radio"
                          name="franchiseMode"
                          value="existing"
                          checked={franchiseMode === 'existing'}
                          onChange={() => setFranchiseMode('existing')}
                          className="accent-[#701C18]"
                        />
                        <span>Assign to Existing Branch ({franchises.length})</span>
                      </label>
                    </div>
                  )}

                  {franchiseMode === 'new' ? (
                    <div className="space-y-3 pt-1">
                      {/* CITY & DYNAMIC AREA SELECTION */}
                      <div className="p-3.5 bg-stone-50 rounded-2xl border border-amber-200/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Compass className="w-4 h-4 text-[#701C18]" />
                            <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                              Branch City & Area Selection
                            </h5>
                          </div>
                          {newFranchiseCity !== 'Other' && (
                            <span className="text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#701C18]" />
                              <span>{getAreasForCity(newFranchiseCity).length} Areas in {newFranchiseCity}</span>
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* 1. DEFAULT CITY LIST */}
                          <div className="space-y-1">
                            <label className="font-bold text-stone-800 text-xs">
                              Select City (Default List) *
                            </label>
                            <select
                              value={newFranchiseCity}
                              onChange={(e) => handleCityChange(e.target.value)}
                              className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-bold text-xs text-stone-900 focus:outline-none focus:border-[#701C18]"
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

                            {newFranchiseCity === 'Other' && (
                              <input
                                type="text"
                                value={newFranchiseCustomCity}
                                onChange={(e) => setNewFranchiseCustomCity(e.target.value)}
                                placeholder="Type custom city name..."
                                className="w-full mt-1 px-3 py-1.5 border border-amber-400 rounded-lg text-xs font-bold bg-amber-50/50"
                                required
                              />
                            )}
                          </div>

                          {/* 2. DYNAMIC AREA LIST */}
                          <div className="space-y-1">
                            <label className="font-bold text-stone-800 text-xs">
                              Area / Sector (in {newFranchiseCity === 'Other' ? (newFranchiseCustomCity || 'City') : newFranchiseCity}) *
                            </label>
                            {newFranchiseCity !== 'Other' ? (
                              <select
                                value={newFranchiseArea}
                                onChange={(e) => handleAreaChange(e.target.value)}
                                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-bold text-xs text-stone-900 focus:outline-none focus:border-[#701C18]"
                              >
                                {getAreasForCity(newFranchiseCity).map((area) => (
                                  <option key={area} value={area}>
                                    📍 {area}
                                  </option>
                                ))}
                                <option value="Other">➕ Other / Custom Area or Sector...</option>
                              </select>
                            ) : (
                              <input
                                type="text"
                                value={newFranchiseCustomArea}
                                onChange={(e) => setNewFranchiseCustomArea(e.target.value)}
                                placeholder="Type area or sector name..."
                                className="w-full px-3 py-2 border border-stone-300 rounded-xl bg-white font-bold text-xs"
                                required
                              />
                            )}

                            {newFranchiseCity !== 'Other' && newFranchiseArea === 'Other' && (
                              <input
                                type="text"
                                value={newFranchiseCustomArea}
                                onChange={(e) => setNewFranchiseCustomArea(e.target.value)}
                                placeholder={`Type specific area/market in ${newFranchiseCity}...`}
                                className="w-full mt-1 px-3 py-1.5 border border-amber-400 rounded-lg text-xs font-bold bg-amber-50/50"
                                required
                              />
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 text-[11px] text-stone-600">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              Jurisdiction:{' '}
                              <strong>
                                {newFranchiseArea === 'Other' ? (newFranchiseCustomArea || 'Custom Area') : newFranchiseArea},{' '}
                                {newFranchiseCity === 'Other' ? (newFranchiseCustomCity || 'Custom City') : newFranchiseCity}
                              </strong>
                            </span>
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-800">
                          Franchise / Branch Name *
                        </label>
                        <input
                          type="text"
                          value={newFranchiseName}
                          onChange={(e) => handleFranchiseNameChange(e.target.value)}
                          placeholder="e.g. Study World — Islamabad (Blue Area)"
                          className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white focus:outline-none focus:border-[#701C18] font-bold text-xs"
                          required={role === 'Franchise Admin' && franchiseMode === 'new'}
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-800">Branch Code *</label>
                        <input
                          type="text"
                          value={newFranchiseCode}
                          onChange={(e) => setNewFranchiseCode(e.target.value)}
                          placeholder="e.g. SWC-ISB-BA-101"
                          className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white font-mono uppercase font-bold text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="font-bold text-stone-800 text-xs">Consultancy Fee Comm. (%)</label>
                          <input
                            type="number"
                            value={newFranchiseConsultancyCommission}
                            onChange={(e) => setNewFranchiseConsultancyCommission(Math.max(0, Math.min(100, Number(e.target.value))))}
                            min={0}
                            max={100}
                            placeholder="50"
                            className="w-full px-3 py-1.5 border border-amber-300 rounded-xl bg-white font-bold text-xs"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="font-bold text-stone-800 text-xs">University Comm. (%)</label>
                          <input
                            type="number"
                            value={newFranchiseUniversityCommission}
                            onChange={(e) => setNewFranchiseUniversityCommission(Math.max(0, Math.min(100, Number(e.target.value))))}
                            min={0}
                            max={100}
                            placeholder="20"
                            className="w-full px-3 py-1.5 border border-rose-300 rounded-xl bg-white font-bold text-xs"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-bold text-stone-800">Branch Physical Address (Optional)</label>
                        <input
                          type="text"
                          value={newFranchiseAddress}
                          onChange={(e) => setNewFranchiseAddress(e.target.value)}
                          placeholder="e.g. Office 4, Ground Floor, Beverly Centre, Blue Area"
                          className="w-full px-3 py-2 border border-amber-300 rounded-xl bg-white text-xs"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1">
                      <label className="font-bold text-stone-800">Select Existing Franchise Branch *</label>
                      <select
                        value={selectedFranchiseId}
                        onChange={(e) => setSelectedFranchiseId(e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl font-semibold bg-white"
                        required={role === 'Franchise Admin' && franchiseMode === 'existing'}
                      >
                        <option value="">-- Choose Existing Franchise --</option>
                        {franchises.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.city}) - {f.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* SECTION: FRANCHISE STAFF (SUB-USER COUNSELOR) AUTO-ASSIGNMENT */}
              {role === 'Franchise Staff' && (
                <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200 space-y-2">
                  <div className="flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-sky-800 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs">
                        Franchise Staff Affiliation
                      </h4>
                      <p className="text-[11px] text-stone-600">
                        {isFranchiseAdmin || (!isAdmin || editingUser?.id === currentUser.id)
                          ? 'This counselor account is affiliated with its designated franchise branch.'
                          : 'Admin can assign or change the Franchise Branch for this counselor.'}
                      </p>
                    </div>
                  </div>

                  {isFranchiseAdmin || (!isAdmin || editingUser?.id === currentUser.id) ? (
                    <div className="p-3 bg-white rounded-xl border border-sky-200 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-stone-500 font-bold uppercase block">
                          Assigned Franchise Branch:
                        </span>
                        <span className="font-bold text-stone-900 text-xs">
                          {editingUser?.franchise_name || currentUser.franchise_name || 'Designated Franchise Branch'}
                        </span>
                      </div>
                      {(editingUser?.branch_code || currentUser.branch_code) && (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-sky-100 text-sky-900 border border-sky-200">
                          {editingUser?.branch_code || currentUser.branch_code}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1 pt-1">
                      <label className="font-bold text-stone-800">
                        Assign to Franchise Branch *
                      </label>
                      <select
                        value={selectedFranchiseId}
                        onChange={(e) => setSelectedFranchiseId(e.target.value)}
                        className="w-full px-3 py-2 border border-sky-300 rounded-xl font-semibold bg-white"
                        required={role === 'Franchise Staff'}
                      >
                        <option value="">-- Choose Franchise Branch --</option>
                        {franchises.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.name} ({f.city}) - {f.code}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Department & Permissions */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 flex items-center justify-between">
                  <span>Branch Office / Department Desk</span>
                  {(!isAdmin || editingUser?.id === currentUser.id) && (
                    <span className="text-[10px] text-stone-400 font-normal flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      <span>Assigned by Admin</span>
                    </span>
                  )}
                </label>
                {(!isAdmin || editingUser?.id === currentUser.id) ? (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={department || (editingUser?.department ?? currentUser.department ?? 'Counseling & Admissions')}
                      disabled
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl bg-stone-100 text-stone-600 font-medium cursor-not-allowed"
                    />
                    <p className="text-[10px] text-stone-400">
                      Office branch and department desk assignments are managed by the Central Administrator.
                    </p>
                  </div>
                ) : (
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. UK & Australia Student Admissions Desk"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl focus:border-[#701C18] focus:outline-none"
                  />
                )}
              </div>

              {/* CSV Export Permission: Main Admin Privilege Only */}
              {isAdmin ? (
                <div className="p-3.5 bg-gradient-to-r from-amber-50/90 to-orange-50/50 rounded-2xl border border-amber-300 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#701C18] bg-amber-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#701C18]" />
                      Main Admin Authorization Control
                    </span>
                    <span className="text-[10px] text-stone-500 font-bold">
                      {exportPermission ? 'Export Enabled' : 'Export Restricted'}
                    </span>
                  </div>

                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      id="exportPermCheck"
                      checked={exportPermission}
                      onChange={(e) => setExportPermission(e.target.checked)}
                      className="w-4 h-4 mt-0.5 accent-[#701C18] rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-stone-900 block text-xs">
                        Allow Exporting Course Search Datasets to CSV
                      </span>
                      <p className="text-[11px] text-stone-600 mt-0.5 leading-tight">
                        Enable this user to download and export filtered course matrices, tuition fees, and admission criteria as CSV spreadsheets.
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
                          exportPermission
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-stone-200 text-stone-700'
                        }`}
                      >
                        {exportPermission ? 'Allowed by Admin' : 'Restricted'}
                      </span>
                    </div>
                    <p className="text-stone-500 mt-1 leading-tight">
                      Exporting course search datasets to CSV is restricted by central security policy. Only the Main Head Office Admin can allow this privilege.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-stone-600 font-semibold hover:bg-stone-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#701C18] hover:bg-[#4A0E0B] text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingUser ? 'Save Changes' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </ViewportOverlay>
      )}

      {/* ACTIVE DELETE CONFIRMATION MODAL */}
      {deleteTargetUser && (
        <ViewportOverlay onBackdropClick={() => setDeleteTargetUser(null)}>
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden text-xs text-[#241512] p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-stone-900">
                  Confirm User Account Deletion
                </h3>
                <p className="text-xs text-stone-500">Permanent security revocation</p>
              </div>
            </div>

            <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-stone-800">
              <p>
                Are you sure you want to permanently delete user{' '}
                <strong className="text-rose-900">{deleteTargetUser.name}</strong> ({deleteTargetUser.email})?
              </p>
              {deleteTargetUser.role === 'Franchise Admin' && (
                <p className="text-[11px] text-amber-800 font-semibold mt-1">
                  Note: This user manages {deleteTargetUser.franchise_name || 'a franchise branch'}.
                </p>
              )}
              <p className="text-[11px] text-stone-600 mt-2">
                This will immediately remove their login and database access rights across all Study World Consultant systems.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 text-stone-600 font-semibold hover:bg-stone-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(deleteTargetUser.id);
                  setDeleteTargetUser(null);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </ViewportOverlay>
      )}
    </div>
  );
};
