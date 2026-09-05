import React, { useState, useEffect } from 'react';
import { UserAccount } from '../types';
import {
  Settings,
  Shield,
  KeyRound,
  Eye,
  EyeOff,
  RotateCcw,
  Database,
  Download,
  CheckCircle2,
  AlertTriangle,
  Server,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileImage,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Lock,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import { getCustomLogo, setCustomLogo, removeCustomLogo, LOGO_UPDATED_EVENT } from '../utils/logoStorage';
import { CrestLogo } from '../components/CrestLogo';
import * as SqlStore from '../utils/sqlStore';
import { authHeaders } from '../lib/apiAuth';

interface SettingsViewProps {
  currentUser: UserAccount;
  onResetFactoryData: () => void;
  onUpdateCurrentUser: (updated: Partial<UserAccount>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  onResetFactoryData,
  onUpdateCurrentUser,
}) => {
  const isAdmin = currentUser.role === 'Admin' || currentUser.role === 'Super Admin';

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const [name, setName] = useState(currentUser.name);
  const [department, setDepartment] = useState(currentUser.department);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Logo Management State
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(() => getCustomLogo());
  const [logoInputUrl, setLogoInputUrl] = useState('');
  const [logoUploadSuccess, setLogoUploadSuccess] = useState('');
  const [logoUploadError, setLogoUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      setCustomLogoUrl(customEvent.detail ?? getCustomLogo());
    };
    window.addEventListener(LOGO_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(LOGO_UPDATED_EVENT, handleUpdate);
  }, []);

  const handleProcessFile = (file: File) => {
    setLogoUploadError('');
    setLogoUploadSuccess('');

    if (!file.type.match(/image\/(png|jpeg|jpg|svg\+xml|webp|gif)/i)) {
      setLogoUploadError('Please select a valid image file (PNG, JPG, SVG, WebP, or GIF).');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError('File size exceeds 5MB. Please upload a smaller image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setCustomLogo(result);
        setCustomLogoUrl(result);
        setLogoUploadSuccess('Custom brand logo uploaded and applied across the entire portal!');
        setTimeout(() => setLogoUploadSuccess(''), 5000);
      }
    };
    reader.onerror = () => {
      setLogoUploadError('Failed to read the image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleProcessFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleApplyUrlLogo = (e: React.FormEvent) => {
    e.preventDefault();
    setLogoUploadError('');
    setLogoUploadSuccess('');

    if (!logoInputUrl.trim()) {
      setLogoUploadError('Please enter a valid image URL.');
      return;
    }

    setCustomLogo(logoInputUrl.trim());
    setCustomLogoUrl(logoInputUrl.trim());
    setLogoInputUrl('');
    setLogoUploadSuccess('Custom logo URL applied successfully across the portal!');
    setTimeout(() => setLogoUploadSuccess(''), 5000);
  };

  const handleRemoveLogo = () => {
    if (window.confirm('Are you sure you want to remove the custom logo? The portal will revert to the default standard logo.')) {
      removeCustomLogo();
      setCustomLogoUrl(null);
      setLogoUploadSuccess('Custom logo removed. Default system logo restored.');
      setTimeout(() => setLogoUploadSuccess(''), 5000);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (!currentPassword.trim()) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          currentPassword: currentPassword.trim(),
          newPassword,
        }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(payload.error || 'Could not update password.');
        return;
      }
      setPasswordSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err?.message || 'Could not update password.');
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onUpdateCurrentUser({ name: name.trim() });
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  const handleExportJsonBackup = () => {
    const data = SqlStore.getPortalData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SWC_SQL_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-fade-in text-[#241512] max-w-4xl">
      {/* Header */}
      <div className="border-b border-stone-200 pb-4">
        <h1 className="text-2xl font-display font-bold text-[#7A2820]">
          System & Account Settings
        </h1>
        <p className="text-xs text-stone-500 mt-0.5">
          Manage counselor profile details, authentication credentials, and database persistence
        </p>
      </div>

      {/* Admin Custom Logo Management Section */}
      {isAdmin && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-5 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#8E2F26]/10 text-[#8E2F26] rounded-lg">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base text-[#7A2820] flex items-center gap-2">
                    Brand Identity & Custom Portal Logo
                    <span className="px-2 py-0.5 bg-[#7A2820] text-white font-bold text-[10px] rounded-full uppercase tracking-wider">
                      Admin Only
                    </span>
                  </h2>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    Upload your own official brand logo. It will immediately appear everywhere across the portal (Header, Sidebar, Login, Factsheets, and all Official Print/PDF Reports).
                  </p>
                </div>
              </div>
            </div>

            {customLogoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg flex items-center gap-1.5 transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Custom Logo</span>
              </button>
            )}
          </div>

          {logoUploadSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-center gap-2.5 font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{logoUploadSuccess}</span>
            </div>
          )}

          {logoUploadError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl flex items-center gap-2.5 font-medium">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>{logoUploadError}</span>
            </div>
          )}

          {/* Live Preview Display Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Header Bar Simulation */}
            <div className="p-4 bg-stone-900 text-white rounded-xl border border-stone-800 space-y-2">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                1. Top Header Preview
              </div>
              <div className="p-2.5 bg-stone-950/80 rounded-lg flex items-center justify-between border border-stone-800">
                <CrestLogo size="sm" variant="white" subtitleText="Search Portal" />
                <span className="text-[9px] text-stone-500 font-mono">Header View</span>
              </div>
            </div>

            {/* Sidebar Simulation */}
            <div className="p-4 bg-[#701C18] text-white rounded-xl border border-[#581512] space-y-2">
              <div className="text-[10px] font-bold text-amber-200/80 uppercase tracking-wider">
                2. Sidebar Preview
              </div>
              <div className="p-2.5 bg-black/20 rounded-lg flex items-center justify-between border border-white/10">
                <CrestLogo size="sm" variant="white" subtitleText="Search Portal" />
                <span className="text-[9px] text-amber-200/60 font-mono">Sidebar</span>
              </div>
            </div>

            {/* Print/PDF Report Letterhead Simulation */}
            <div className="p-4 bg-white rounded-xl border border-stone-200 space-y-2 shadow-2xs">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                3. Print & PDF Letterhead Preview
              </div>
              <div className="p-2.5 bg-[#FAF6F2] rounded-lg flex items-center justify-between border border-stone-200">
                <CrestLogo size="sm" variant="full" />
                <span className="text-[9px] text-stone-400 font-mono">PDF Report</span>
              </div>
            </div>
          </div>

          {/* Upload Dropzone and Controls */}
          <div className="space-y-4 pt-2">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all ${
                isDragging
                  ? 'border-[#8E2F26] bg-[#8E2F26]/5 scale-[0.99]'
                  : 'border-stone-300 hover:border-stone-400 bg-stone-50/50'
              }`}
            >
              <div className="max-w-md mx-auto flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-[#8E2F26] shadow-2xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-sm text-stone-900">
                    Click to browse or drag & drop your company logo here
                  </div>
                  <p className="text-stone-500 text-[11px] mt-1">
                    Supports PNG (transparent recommended), SVG, JPG, JPEG, or WebP up to 5MB.
                  </p>
                </div>

                <label
                  htmlFor="logo-file-input"
                  className="cursor-pointer px-5 py-2.5 bg-[#8E2F26] hover:bg-[#701C18] text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 text-xs"
                >
                  <FileImage className="w-4 h-4" />
                  <span>Choose Logo File from Device</span>
                </label>
                <input
                  id="logo-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp,image/gif"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Alternative: Enter Direct Image URL */}
            <form onSubmit={handleApplyUrlLogo} className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2">
              <label className="font-bold text-stone-700 text-xs flex items-center gap-1.5">
                <span>Or paste an online Image URL:</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoInputUrl}
                  onChange={(e) => setLogoInputUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-stone-300 rounded-lg bg-white text-xs"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Apply URL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Profile Form */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
        <h2 className="font-display font-bold text-base text-[#7A2820] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#A8382C]" />
          My Counselor Profile
        </h2>

        {profileSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile details updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white focus:outline-none focus:border-[#7A2820]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-stone-400 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Read-only</span>
                </span>
              </label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-100 text-stone-500 cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 flex items-center justify-between">
                <span>Office Branch / Department</span>
                <span className="text-[10px] text-stone-400 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Assigned by Admin</span>
                </span>
              </label>
              <input
                type="text"
                value={currentUser.department || 'Counseling & Admissions'}
                disabled
                className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-100 text-stone-600 font-medium cursor-not-allowed"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700 flex items-center justify-between">
                <span>Assigned Privilege Role</span>
                <span className="text-[10px] text-stone-400 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Assigned by Admin</span>
                </span>
              </label>
              <input
                type="text"
                value={currentUser.role}
                disabled
                className="w-full px-3 py-2 border border-stone-200 rounded-lg bg-stone-100 text-stone-700 font-bold cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-[#A8382C] hover:bg-[#7A2820] text-white font-bold rounded-lg shadow-xs transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>

      {/* Security & Password Reset */}
      <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h2 className="font-display font-bold text-base text-[#7A2820] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#A8382C]" />
            Change Password
          </h2>
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-stone-500 hover:text-stone-900 flex items-center gap-1.5 font-medium"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{showPassword ? 'Hide Passwords' : 'Show Passwords'}</span>
          </button>
        </div>

        {passwordError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Your password has been updated securely.</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Current Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">New Password (Min 8 chars)</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-stone-700">Confirm New Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg bg-white"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-stone-800 hover:bg-stone-900 text-white font-bold rounded-lg shadow-xs transition-colors"
            >
              Update Password
            </button>
          </div>
        </form>
      </div>

      {/* Database State & Factory Reset (Admin Controls Only) */}
      {isAdmin && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#7A2820] flex items-center gap-2">
              <Database className="w-5 h-5 text-[#A8382C]" />
              Database State & System Maintenance
            </h2>
            <span className="px-2 py-0.5 bg-[#7A2820] text-white font-bold text-[10px] rounded-full uppercase tracking-wider">
              Admin Only
            </span>
          </div>
          <p className="text-stone-600 leading-relaxed">
            Catalog data — universities, courses, countries, programs, and franchises — is stored in SQL Server LocalDB. Export a JSON snapshot of the live database, or reset those catalog tables back to the official seed records. User accounts and student leads are not wiped.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExportJsonBackup}
              className="px-4 py-2 bg-[#FBF6F1] hover:bg-amber-50 border border-stone-300 text-[#7A2820] font-bold rounded-xl flex items-center gap-2 shadow-2xs"
            >
              <Download className="w-4 h-4 text-[#C9A227]" />
              <span>Export Database JSON Backup</span>
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Reset universities, courses, countries, programs, franchises, and import history to the official seed records? User accounts and student leads will not be deleted.'
                  )
                ) {
                  onResetFactoryData();
                }
              }}
              className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-rose-500" />
              <span>Reset to Factory Seed Data</span>
            </button>
          </div>
        </div>
      )}

      {/* SQL Server source of truth */}
      {isAdmin && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#7A2820] flex items-center gap-2">
              <Server className="w-5 h-5 text-[#A8382C]" />
              SQL Server Database
            </h2>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LocalDB Source of Truth
            </span>
          </div>

          <p className="text-stone-600 leading-relaxed">
            Dashboard, courses, universities, countries, franchises, users, and leads are loaded from SQL Server. Browser localStorage is no longer used as a catalog store.
          </p>

          <SqlDatabaseStatusBox />
        </div>
      )}

      {isAdmin && (
        <div className="p-6 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#7A2820] flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Data Reliability & Relational Integrity
            </h2>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] rounded-full uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3 h-3 text-emerald-600" />
              SQL Live
            </span>
          </div>

          <p className="text-stone-600 leading-relaxed">
            Compare the portal cache with SQL Server row counts and audit university-to-course relationships.
          </p>

          <DataReliabilitySyncAuditBox />
        </div>
      )}
    </div>
  );
};

const SqlDatabaseStatusBox: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<any | null>(null);
  const [error, setError] = useState('');

  const handleRefresh = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cloudsql/status', { headers: authHeaders() });
      const payload = await res.json();
      if (!res.ok || !payload.success) {
        throw new Error(payload.error || 'SQL Server is not reachable');
      }
      setStatus(payload);
    } catch (err: any) {
      setError(err.message || 'Failed to read SQL Server status');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="font-bold text-stone-800 text-sm">Live SQL Server row counts</div>
          <div className="text-stone-500 text-[11px]">
            {status?.server ? `${status.server} / ${status.database}` : 'study_world_portal on LocalDB'}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="px-5 py-2.5 bg-[#A8382C] hover:bg-[#7A2820] disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 text-[#C9A227] ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Reading SQL Server...' : 'Refresh Database Status'}</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {status?.tables && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
          <div className="p-2 bg-white/80 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-800 text-base">{status.tables.universities}</div>
            <div className="text-[10px] text-stone-500 font-medium">Universities</div>
          </div>
          <div className="p-2 bg-white/80 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-800 text-base">{status.tables.courses}</div>
            <div className="text-[10px] text-stone-500 font-medium">Courses</div>
          </div>
          <div className="p-2 bg-white/80 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-800 text-base">{status.tables.student_leads}</div>
            <div className="text-[10px] text-stone-500 font-medium">Student Leads</div>
          </div>
          <div className="p-2 bg-white/80 rounded-lg border border-emerald-100">
            <div className="font-bold text-emerald-800 text-base">{status.tables.users}</div>
            <div className="text-[10px] text-stone-500 font-medium">Users</div>
          </div>
        </div>
      )}
    </div>
  );
};

const DataReliabilitySyncAuditBox: React.FC = () => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [syncReport, setSyncReport] = useState<any | null>(null);
  const [relationalReport, setRelationalReport] = useState<any | null>(null);
  const [repairedNotice, setRepairedNotice] = useState('');

  const handleRunAudit = async () => {
    setIsAuditing(true);
    setRepairedNotice('');
    try {
      const live = await SqlStore.hydrateFromDatabase();
      const sqlStatus = await fetch('/api/cloudsql/status', { headers: authHeaders() }).then((r) => r.json());
      const collections = {
        universities: { name: 'Universities', cacheCount: live.universities.length, sqlCount: Number(sqlStatus?.tables?.universities || live.universities.length) },
        courses: { name: 'Courses', cacheCount: live.courses.length, sqlCount: Number(sqlStatus?.tables?.courses || live.courses.length) },
        leads: { name: 'Student Leads', cacheCount: live.studentLeads.length, sqlCount: Number(sqlStatus?.tables?.student_leads || live.studentLeads.length) },
        users: { name: 'Users', cacheCount: live.users.length, sqlCount: Number(sqlStatus?.tables?.users || live.users.length) },
        franchises: { name: 'Franchises', cacheCount: live.franchises.length, sqlCount: live.franchises.length },
        countries: { name: 'Countries', cacheCount: live.countries.length, sqlCount: live.countries.length },
      };
      const inSync = Object.values(collections).every((c) => c.cacheCount === c.sqlCount);
      setSyncReport({
        isConnected: Boolean(sqlStatus?.success),
        overallStatus: inSync ? 'synchronized' : 'mismatch',
        collections,
      });

      const uniIds = new Set(live.universities.map((u) => u.university_id));
      const orphaned = live.courses.filter((c) => !uniIds.has(c.university_id));
      setRelationalReport({
        isValid: orphaned.length === 0,
        orphanedCoursesCount: orphaned.length,
        issues: orphaned.map((c) => `${c.course_name} references missing university ${c.university_id}`),
      });
    } catch (e: any) {
      console.error('Audit failed:', e);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleRepairOrphans = async () => {
    const data = SqlStore.getPortalData();
    const uniIds = new Set(data.universities.map((u) => u.university_id));
    const orphanedCourses = data.courses.filter((c) => !uniIds.has(c.university_id));
    if (orphanedCourses.length > 0) {
      await SqlStore.deleteCourses(orphanedCourses.map((c) => c.course_id));
      setRepairedNotice(`Removed ${orphanedCourses.length} orphaned course records from SQL Server.`);
      handleRunAudit();
    } else {
      setRepairedNotice('No orphaned courses detected. Relational integrity is sound.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing SQL Server...' : 'Audit SQL Database'}</span>
        </button>
        {relationalReport && relationalReport.orphanedCoursesCount > 0 && (
          <button
            onClick={handleRepairOrphans}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Repair Relational Inconsistencies ({relationalReport.orphanedCoursesCount} orphans)</span>
          </button>
        )}
      </div>

      {repairedNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{repairedNotice}</span>
        </div>
      )}

      {syncReport && (
        <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-bold text-stone-800 text-xs">Portal cache vs SQL Server</div>
            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${syncReport.overallStatus === 'synchronized' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              Status: {String(syncReport.overallStatus).toUpperCase()}
            </span>
          </div>
          <table className="w-full text-[11px] text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-1.5 font-semibold">Table</th>
                <th className="py-1.5 font-semibold text-center">Portal</th>
                <th className="py-1.5 font-semibold text-center">SQL Server</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {Object.entries(syncReport.collections).map(([key, item]: [string, any]) => (
                <tr key={key}>
                  <td className="py-1.5 font-medium text-stone-800">{item.name}</td>
                  <td className="py-1.5 text-center font-mono">{item.cacheCount}</td>
                  <td className="py-1.5 text-center font-mono">{item.sqlCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {relationalReport && (
        <div className={`p-3 rounded-xl border ${relationalReport.isValid ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-amber-50/50 border-amber-200 text-amber-900'}`}>
          <div className="flex items-center gap-2 font-bold text-xs">
            {relationalReport.isValid ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Relational integrity validated: every course points to a university in SQL Server</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Relational discrepancy: {relationalReport.orphanedCoursesCount} orphaned courses</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};



