import React from 'react';
import { UserAccount, isB2BUser } from '../types';
import { CrestLogo } from './CrestLogo';
import {
  LayoutDashboard,
  Search,
  Building2,
  BookOpen,
  UserCheck,
  UserPlus,
  UploadCloud,
  History,
  DownloadCloud,
  Globe2,
  GraduationCap,
  FileCheck2,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  Shield,
  Scale,
  Building,
  KeyRound,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  currentUser: UserAccount;
  onLogout: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  franchiseOnly?: boolean;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  currentUser,
  onLogout,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const isAdmin = currentUser.role === 'Admin';
  const isFranchiseRole = currentUser.role === 'Franchise Admin' || currentUser.role === 'Franchise Staff';
  const isFranchiseAdmin = currentUser.role === 'Franchise Admin';
  const isPublicUser = currentUser.role === 'User';
  const isB2B = isB2BUser(currentUser);

  const mainNavItems: NavItem[] = isB2B
    ? [
        { id: 'dashboard', label: 'B2B Dashboard', icon: LayoutDashboard },
        { id: 'search_courses', label: 'Search Courses', icon: Search, badge: 'Core' },
        { id: 'compare_courses', label: 'Compare Courses', icon: Scale, badge: 'Side-by-Side' },
        { id: 'universities', label: 'Partner Universities', icon: Building2 },
        { 
          id: 'student_leads', 
          label: 'Student Leads & Referrals', 
          icon: UserPlus, 
          badge: 'Add Lead' 
        },
      ]
    : [
        { id: 'dashboard', label: isPublicUser ? 'Student Dashboard' : 'Dashboard', icon: LayoutDashboard },
        { 
          id: 'student_leads', 
          label: isPublicUser ? 'My Inquiries & Applications' : 'Student Leads & Requests', 
          icon: UserPlus, 
          badge: isPublicUser ? 'My Portal' : 'Staff' 
        },
        { id: 'search_courses', label: 'Search Courses', icon: Search, badge: 'Core' },
        { id: 'compare_courses', label: 'Compare Courses', icon: Scale, badge: 'Side-by-Side' },
        { id: 'universities', label: 'Universities', icon: Building2 },
        { id: 'courses', label: 'Courses Catalog', icon: BookOpen },
        { id: 'eligibility_checker', label: 'Quick Match (Eligibility)', icon: UserCheck, badge: 'Realtime' },
        ...(isPublicUser ? [{ id: 'countries', label: 'Study Destinations', icon: Globe2 }] : []),
      ];

  // Admin Items
  const adminNavItems: NavItem[] = [
    { id: 'franchises', label: 'Franchise Accounts', icon: Building, badge: 'Network' },
    { id: 'users_team', label: 'Users & Sub-Users Access', icon: Users },
    { id: 'data_upload', label: 'Data Upload & Import', icon: UploadCloud },
    { id: 'import_history', label: 'Import History', icon: History },
    { id: 'download_templates', label: 'Download Templates', icon: DownloadCloud },
    { id: 'countries', label: 'Countries & Destinations', icon: Globe2 },
    { id: 'programs', label: 'Programs Master', icon: GraduationCap },
    { id: 'requirements', label: 'Requirements Master', icon: FileCheck2 },
  ];

  const bottomNavItems: NavItem[] = isPublicUser || isB2B
    ? []
    : [
        { id: 'workspace_hub', label: 'Google Workspace Hub', icon: Sparkles, badge: 'Cloud' },
        { id: 'settings', label: 'Settings & Database', icon: Settings },
      ];

  const handleNavClick = (screenId: string) => {
    onNavigate(screenId);
    onCloseMobile?.();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-gradient-to-b from-[#3B0E0A] via-[#5C1B14] to-[#2D0B08] text-white flex flex-col justify-between border-r border-[#A8382C]/30 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Section: Official Crest Logo */}
        <div className="p-4 bg-[#FAF7F5] border-b border-[#E8DDD7] flex items-center justify-start text-left shadow-xs">
          <CrestLogo size="sm" variant="full" subtitleText="Search Portal" />
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 text-left">
          {/* Main Navigation Section */}
          <div className="space-y-1 text-left">
            <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#C9A227] text-left block drop-shadow-xs">
              {isB2B ? 'B-2-B Partner Workspace' : 'Core Counseling Tools'}
            </span>
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group text-left ${
                    isActive
                      ? 'bg-white text-[#7A2820] shadow-md font-bold scale-[1.02]'
                      : 'text-stone-200 hover:text-white hover:bg-white/12 active:scale-98'
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <Icon
                      className={`w-4 h-4 transition-transform duration-200 ${
                        isActive
                          ? 'text-[#A8382C] scale-110'
                          : 'text-[#C9A227] group-hover:scale-110'
                      }`}
                    />
                    <span className="text-left">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-[#7A2820] text-[#C9A227]'
                          : 'bg-[#C9A227]/20 text-[#F4E8C1] border border-[#C9A227]/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Staff Personal Account Section */}
          {!isAdmin && !isB2B && (
            <div className="space-y-1 pt-2 border-t border-white/10 text-left">
              <div className="px-3 flex items-center justify-between text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227] text-left drop-shadow-xs">
                  My Profile & Account
                </span>
                <Users className="w-3 h-3 text-[#C9A227]" />
              </div>
              <button
                onClick={() => handleNavClick('users_team')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group text-left ${
                  currentScreen === 'users_team'
                    ? 'bg-white text-[#7A2820] shadow-md font-bold'
                    : 'text-stone-100 hover:text-white hover:bg-white/15'
                }`}
              >
                <div className="flex items-center gap-3 text-left">
                  <Users className="w-4 h-4 text-[#C9A227]" />
                  <span className="truncate text-left">My Counselor Profile</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-[#C9A227]/25 text-[#C9A227] border border-[#C9A227]/30">
                  Profile
                </span>
              </button>
            </div>
          )}

          {/* Admin Management Section (Filtered strictly for Admin) */}
          {isAdmin && (
            <div className="space-y-1 pt-2 border-t border-white/10 text-left">
              <div className="px-3 flex items-center justify-between text-left">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227] text-left drop-shadow-xs">
                  Administration & Franchises
                </span>
                <Shield className="w-3 h-3 text-[#C9A227]" />
              </div>
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group text-left ${
                      isActive
                        ? 'bg-white text-[#7A2820] shadow-md font-bold'
                        : 'text-stone-100 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-[#A8382C]'
                            : 'text-stone-200 group-hover:text-[#C9A227] transition-colors'
                        }`}
                      />
                      <span className="truncate text-left">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider bg-[#C9A227]/25 text-[#C9A227] border border-[#C9A227]/30">
                        {item.badge}
                      </span>
                    )}
                    {isActive && !item.badge && <ChevronRight className="w-3.5 h-3.5 text-[#A8382C]" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* Settings & Database / Workspace Navigation */}
          {bottomNavItems.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-white/10 text-left">
              <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#C9A227] text-left block drop-shadow-xs">
                Settings & Database
              </span>
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group text-left ${
                      isActive
                        ? 'bg-white text-[#7A2820] shadow-md font-bold'
                        : 'text-stone-100 hover:text-white hover:bg-white/15'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-left">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive
                            ? 'text-[#A8382C]'
                            : 'text-[#C9A227] group-hover:scale-110 transition-transform'
                        }`}
                      />
                      <span className="text-left">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          isActive
                            ? 'bg-[#7A2820] text-[#C9A227]'
                            : 'bg-[#C9A227]/25 text-[#C9A227] border border-[#C9A227]/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                    {isActive && !item.badge && <ChevronRight className="w-3.5 h-3.5 text-[#A8382C]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom User Card & Role Info */}
        <div className="p-4 border-t border-white/10 bg-black/35 space-y-3 text-left">
          <div className="flex items-center justify-between text-xs text-left">
            <div className="flex items-center gap-2.5 truncate text-left">
              <div className="w-7 h-7 rounded-full bg-[#C9A227] text-stone-900 font-bold flex items-center justify-center text-xs flex-shrink-0">
                {currentUser.name[0]}
              </div>
              <div className="truncate text-left">
                <p className="font-bold text-white leading-none truncate text-left">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-amber-200 truncate mt-0.5 font-semibold text-left">
                  {currentUser.role === 'B-2-B' ? 'B-2-B Partner' : currentUser.role}
                  {currentUser.franchise_name ? ` · ${currentUser.franchise_name.split('—')[1] || currentUser.franchise_name}` : ''}
                </p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="p-1.5 hover:bg-white/10 rounded-lg text-stone-300 hover:text-rose-300 transition-colors flex-shrink-0"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <div className="text-[10px] text-stone-200 text-left border-t border-white/10 pt-2 font-medium tracking-wide">
            Study World Consultant · Since 2016
          </div>
        </div>
      </aside>
    </>
  );
};
