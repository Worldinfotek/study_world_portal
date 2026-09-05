import React, { useState } from 'react';
import { UserAccount } from '../types';
import { CrestLogo } from './CrestLogo';
import {
  Search,
  Bell,
  ShieldCheck,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  CheckCircle,
  Settings,
  Image as ImageIcon,
} from 'lucide-react';

interface HeaderProps {
  currentUser: UserAccount;
  onSwitchUser?: (role: 'Admin' | 'Office Staff') => void;
  onNavigate: (screen: string) => void;
  onOpenLoginModal: () => void;
  onLogout?: () => void;
  onToggleSidebar?: () => void;
  onGlobalSearch?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onNavigate,
  onOpenLoginModal,
  onLogout,
  onToggleSidebar,
  onGlobalSearch,
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onGlobalSearch?.(searchTerm);
      onNavigate('search_courses');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-2xs h-16 flex items-center justify-between px-3 sm:px-6 transition-all">
      {/* Left: Mobile Menu + Crest Logo */}
      <div className="flex items-center gap-3 sm:gap-4">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-stone-600 hover:text-stone-900 lg:hidden rounded-xl hover:bg-stone-100/80 active:scale-95 transition-all"
            title="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div
          onClick={() => onNavigate('dashboard')}
          className="cursor-pointer hover:opacity-90 transition-all hover:scale-[1.01]"
        >
          <CrestLogo size="md" />
        </div>
      </div>

      {/* Center: Quick Course & University Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-6 relative group"
      >
        <Search className="w-4 h-4 text-stone-400 group-focus-within:text-[#A8382C] absolute left-3.5 pointer-events-none transition-colors" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search courses, universities, countries, IELTS..."
          className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-stone-50/80 border border-stone-200/90 focus:outline-none focus:border-[#A8382C] focus:bg-white focus:ring-3 focus:ring-[#A8382C]/10 transition-all text-stone-900 placeholder:text-stone-400 shadow-2xs"
        />
      </form>

      {/* Right: Authenticated User Status & Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role & Branch Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#FAF6F2] border border-[#EBE0D5] rounded-xl text-xs shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-bold text-[#7A2820] leading-tight">
              {currentUser.role === 'User' ? 'Student Portal' : currentUser.role === 'B-2-B' ? 'B-2-B Partner' : currentUser.role}
            </span>
            <span className="text-[10px] text-stone-500 leading-tight truncate max-w-[100px]">
              {currentUser.role === 'B-2-B'
                ? 'Independent'
                : currentUser.franchise_name
                ? (currentUser.franchise_name.split('—')[1] || currentUser.franchise_name)
                : currentUser.role === 'User'
                ? 'Public Access'
                : 'Head Office'}
            </span>
          </div>
          {currentUser.branch_code && (
            <span className="text-[10px] font-mono bg-[#C9A227]/20 text-[#7A2820] px-1.5 py-0.5 rounded-md font-bold ml-0.5">
              {currentUser.branch_code}
            </span>
          )}
        </div>

        {/* Google Workspace Hub Quick Link (Admin / Internal Staff Only) */}
        {currentUser.role !== 'B-2-B' && currentUser.role !== 'User' && (
          <button
            id="header-btn-workspace"
            onClick={() => onNavigate('workspace_hub')}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all shadow-2xs hover:border-[#A8382C]/40 hover:-translate-y-0.5 active:translate-y-0"
            title="Open Google Workspace Hub"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C9A227]" />
            <span>Workspace</span>
          </button>
        )}

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-white hover:bg-stone-50 transition-all border border-stone-200 shadow-2xs hover:border-stone-300"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7A2820] to-[#A8382C] text-white font-bold flex items-center justify-center text-xs shadow-xs tracking-wider">
              {currentUser.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </div>

            <div className="text-left hidden lg:block pr-1">
              <p className="text-xs font-bold text-stone-900 leading-tight truncate max-w-[120px]">
                {currentUser.name}
              </p>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md inline-block uppercase tracking-wider ${
                  currentUser.role === 'Admin'
                    ? 'bg-rose-50 text-[#A8382C] border border-rose-200/60'
                    : currentUser.role === 'B-2-B'
                    ? 'bg-purple-50 text-purple-900 border border-purple-200/80 font-black'
                    : 'bg-stone-100 text-stone-700'
                }`}
              >
                {currentUser.role}
              </span>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showUserDropdown && (
            <div
              className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200/90 p-2.5 z-50 animate-fade-in text-xs"
              onClick={() => setShowUserDropdown(false)}
            >
              <div className="p-3 bg-gradient-to-br from-[#FBF6F1] to-[#F4ECE4] rounded-xl mb-2 border border-stone-200/80">
                <p className="font-bold text-stone-900">{currentUser.name}</p>
                <p className="text-stone-500 text-[11px] truncate">{currentUser.email}</p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-stone-200 text-[11px]">
                  <span className="text-stone-500">Department:</span>
                  <span className="font-semibold text-stone-800 text-right truncate max-w-[120px]">
                    {currentUser.department}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-stone-500">Export Access:</span>
                  <span
                    className={`font-bold ${
                      currentUser.export_permission ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {currentUser.export_permission ? 'Enabled' : 'Restricted'}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                {(currentUser.role === 'Admin' || currentUser.role === 'Super Admin') && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#FAF6F2] hover:bg-[#F4ECE4] flex items-center gap-2 text-[#7A2820] font-bold text-xs transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-[#8E2F26]" />
                    Upload & Manage Brand Logo
                  </button>
                )}

                {currentUser.role !== 'B-2-B' && currentUser.role !== 'User' && (
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 flex items-center gap-2 text-stone-700 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-stone-400" />
                    Account Settings
                  </button>
                )}

                <button
                  onClick={() => onOpenLoginModal()}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-stone-100 flex items-center gap-2 text-stone-700 transition-colors"
                >
                  <User className="w-4 h-4 text-stone-400" />
                  Switch / Authenticate Account
                </button>

                <div className="border-t border-stone-100 my-1" />

                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    if (onLogout) {
                      onLogout();
                    } else {
                      onOpenLoginModal();
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-rose-50 text-rose-700 font-bold flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  Logout Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
