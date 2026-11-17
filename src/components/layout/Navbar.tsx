import React, { useState, useEffect } from 'react';
import { User, UserRole, UserNotification } from '../../types';
import {
  switchUserRole,
  isAdminAuthenticated,
  isPartnerSessionActive,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  logoutCitizen
} from '../../services/storage';
import {
  Menu,
  X,
  Recycle,
  User as UserIcon,
  ShieldAlert,
  ShieldCheck,
  Award,
  ChevronDown,
  Check,
  Database,
  Lock,
  Bell,
  ChevronRight,
  CheckCircle2,
  FileText,
  UserCheck,
  LogIn,
  LogOut
} from 'lucide-react';
import { AdminChallengeModal } from '../auth/AdminChallengeModal';
import { PartnerChallengeModal } from '../auth/PartnerChallengeModal';
import { PartnerApplicationModal } from '../partner/PartnerApplicationModal';

interface Props {
  currentUser: User;
  onOpenPickupModal: () => void;
  onOpenAuthModal: () => void;
  onOpenSupabaseModal?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  onOpenPickupModal,
  onOpenAuthModal,
  onOpenSupabaseModal,
  activeTab,
  setActiveTab
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [moreNavOpen, setMoreNavOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [adminChallengeModalOpen, setAdminChallengeModalOpen] = useState(false);
  const [partnerChallengeOpen, setPartnerChallengeOpen] = useState(false);
  const [partnerModalOpen, setPartnerModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [targetPartnerRole, setTargetPartnerRole] = useState<'recycler' | 'repair'>('recycler');

  const [notifications, setNotifications] = useState<UserNotification[]>(() => getUserNotifications(currentUser.id));
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const refresh = () => setNotifications(getUserNotifications(currentUser.id));
    refresh();
    window.addEventListener('ecycle_state_updated', refresh);
    const interval = setInterval(refresh, 3000);
    return () => {
      window.removeEventListener('ecycle_state_updated', refresh);
      clearInterval(interval);
    };
  }, [currentUser.id]);

  const roles: { role: UserRole; label: string; desc: string; badge?: string }[] = [
    { role: 'citizen', label: 'Citizen View', desc: 'Public Access (Default)' },
    { role: 'recycler', label: 'Recycler View', desc: 'R2v3 Partner Clearance Required', badge: 'Partner Vetting' },
    { role: 'repair', label: 'Repair Technician', desc: 'Diagnostics Lab Partner Clearance Required', badge: 'Partner Vetting' },
    { role: 'admin', label: 'Admin View (Secured)', desc: 'SDG Taskforce Director (ID: adminewaste@123)', badge: 'Level 4' }
  ];

  const handleRoleSelect = (roleKey: UserRole) => {
    if (roleKey === 'admin') {
      if (!isAdminAuthenticated()) {
        setRoleDropdownOpen(false);
        setAdminChallengeModalOpen(true);
        return;
      }
      switchUserRole('admin');
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setRoleDropdownOpen(false);
      return;
    }
    if (roleKey === 'recycler' || roleKey === 'repair') {
      // Must authenticate with Admin-generated partner credentials
      if (!isPartnerSessionActive(roleKey)) {
        setTargetPartnerRole(roleKey);
        setRoleDropdownOpen(false);
        setPartnerChallengeOpen(true);
        return;
      }
      switchUserRole(roleKey);
      setActiveTab('dashboard');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setRoleDropdownOpen(false);
      return;
    }
    switchUserRole('citizen');
    setActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRoleDropdownOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-[#F7FAF8]/90 backdrop-blur-md border-b border-[#DCE6E0] shadow-[0_1px_12px_-4px_rgba(18,61,50,0.06)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-6 px-3 sm:px-6 py-3">
        
        {/* Zone 1: Wordmark */}
        <button
          onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2.5 text-left text-[#182B26] whitespace-nowrap shrink-0 group focus:outline-none cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[#123D32] flex items-center justify-center text-[#B9F5D0] shadow-sm group-hover:bg-[#16A36A] group-hover:text-white transition-colors">
            <Recycle className="w-4 h-4" />
          </div>
          <span className="text-base sm:text-lg font-bold tracking-tight text-[#123D32]">E-Cycle AI</span>
        </button>

        {/* Zone 2: Responsive Clean Navigation Links */}
        {/* Full 8 links on 2xl screens */}
        <nav className="hidden 2xl:flex items-center gap-5 text-xs font-medium text-[#718078]">
          <button onClick={() => setActiveTab('home')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'home' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Overview</button>
          <button onClick={() => setActiveTab('centres')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'centres' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Collection Centres</button>
          <button onClick={() => setActiveTab('track')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'track' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Track E-Waste</button>
          <button onClick={() => setActiveTab('marketplace')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'marketplace' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Marketplace</button>
          <button onClick={() => setActiveTab('rewards')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'rewards' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Eco-Rewards</button>
          <button onClick={() => setActiveTab('sdg')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'sdg' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>SDG Impact</button>
          <button onClick={() => setActiveTab('dashboard')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'dashboard' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Dashboard</button>
          <button onClick={() => setActiveTab('login')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'login' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Citizen Login</button>
        </nav>

        {/* Streamlined + More dropdown on lg and xl screens */}
        <nav className="hidden lg:flex 2xl:hidden items-center gap-4 xl:gap-5 text-xs font-medium text-[#718078]">
          <button onClick={() => setActiveTab('home')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'home' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Overview</button>
          <button onClick={() => setActiveTab('centres')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'centres' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Centres</button>
          <button onClick={() => setActiveTab('track')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'track' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Track</button>
          <button onClick={() => setActiveTab('marketplace')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'marketplace' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Marketplace</button>
          <button onClick={() => setActiveTab('rewards')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'rewards' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Rewards</button>
          <button onClick={() => setActiveTab('dashboard')} className={`whitespace-nowrap py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'dashboard' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}>Dashboard</button>
          
          {/* More Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setMoreNavOpen(!moreNavOpen); setRoleDropdownOpen(false); }}
              className={`flex items-center gap-1 py-1 border-b-2 transition-all cursor-pointer hover:text-[#123D32] ${activeTab === 'sdg' || activeTab === 'privacy' || activeTab === 'login' ? 'text-[#123D32] font-semibold border-[#16A36A]' : 'border-transparent'}`}
            >
              <span>More</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {moreNavOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-[#DCE6E0] rounded-xl shadow-[0_14px_34px_-10px_rgba(18,61,50,0.16)] py-2 z-50 text-xs">
                <button
                  onClick={() => { setActiveTab('sdg'); setMoreNavOpen(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-[#F7FAF8] flex items-center justify-between cursor-pointer ${activeTab === 'sdg' ? 'text-[#16A36A] font-semibold' : 'text-[#182B26]'}`}
                >
                  <span>SDG Impact</span>
                </button>
                <button
                  onClick={() => { setActiveTab('privacy'); setMoreNavOpen(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-[#F7FAF8] flex items-center justify-between cursor-pointer ${activeTab === 'privacy' ? 'text-[#16A36A] font-semibold' : 'text-[#182B26]'}`}
                >
                  <span>Data Privacy Hub</span>
                </button>
                <button
                  onClick={() => { setActiveTab('login'); setMoreNavOpen(false); }}
                  className={`w-full px-3 py-2 text-left hover:bg-[#F7FAF8] flex items-center justify-between cursor-pointer ${activeTab === 'login' ? 'text-[#16A36A] font-semibold' : 'text-[#16A36A]'}`}
                >
                  <span>Citizen Login</span>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Zone 3: Actions Cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Citizen Account Status / Sign In */}
          {currentUser.role === 'citizen' ? (
            currentUser.isAuthenticatedCitizen ? (
              <div className="relative">
                <button
                  onClick={() => {
                    setUserMenuOpen(!userMenuOpen);
                    setRoleDropdownOpen(false);
                    setNotifDropdownOpen(false);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#B9F5D0]/45 border border-[#16A36A]/30 text-[#123D32] hover:bg-[#B9F5D0]/70 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                  title={`Signed in as ${currentUser.name}`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-[#16A36A]" />
                  <span className="max-w-[100px] sm:max-w-[130px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3 h-3 text-[#718078]" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#DCE6E0] rounded-xl shadow-[0_14px_34px_-10px_rgba(18,61,50,0.16)] p-3 z-50 text-xs space-y-2">
                    <div className="pb-2 border-b border-[#E1EBE5]">
                      <div className="font-bold text-[#182B26] truncate">{currentUser.name}</div>
                      <div className="text-[11px] text-[#718078] truncate">{currentUser.email}</div>
                      <div className="mt-1 text-[10px] font-mono text-[#16A36A] font-semibold tabular-nums">
                        {currentUser.ecoPoints} Eco-Points Earned
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setActiveTab('profile');
                      }}
                      className="w-full text-left py-1 text-[#16A36A] font-semibold hover:text-[#123D32] cursor-pointer flex items-center justify-between"
                    >
                      <span>My Profile & Wallet</span>
                      <span className="text-[10px] font-mono tabular-nums">{currentUser.ecoPoints} PTS</span>
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setActiveTab('dashboard');
                      }}
                      className="w-full text-left py-1 text-[#182B26] hover:text-[#16A36A] cursor-pointer"
                    >
                      My Recycle Dashboard
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logoutCitizen();
                      }}
                      className="w-full text-left py-1 text-red-600 hover:text-red-700 font-semibold cursor-pointer border-t border-[#E1EBE5] pt-2 flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#123D32] hover:bg-[#0D2E25] text-white rounded-lg text-xs font-semibold shadow-sm cursor-pointer whitespace-nowrap transition-colors"
                title="Citizen Login or Register to request e-waste recycle"
              >
                <LogIn className="w-3.5 h-3.5 text-[#B9F5D0]" />
                <span>Login / Register</span>
              </button>
            )
          ) : null}

          {/* Portal Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setMoreNavOpen(false);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] rounded-lg text-xs font-medium text-[#182B26] transition-colors whitespace-nowrap cursor-pointer shadow-xs"
              title="Portal clearance & views"
            >
              <span className="hidden sm:inline text-[#718078]">Portal:</span>
              <span className="text-[#16A36A] font-semibold capitalize">{currentUser.role === 'citizen' ? 'Citizen' : currentUser.role}</span>
              <ChevronDown className="w-3 h-3 text-[#718078]" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-60 sm:w-64 max-w-[calc(100vw-2rem)] bg-white border border-[#DCE6E0] rounded-xl shadow-[0_14px_34px_-10px_rgba(18,61,50,0.16)] py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-[#E1EBE5] text-[10px] uppercase font-mono text-[#718078]">
                  Switch Portal View
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSelect(r.role)}
                    className="w-full px-3 py-2 text-left hover:bg-[#F7FAF8] flex items-start justify-between gap-2 transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-semibold text-[#182B26] flex items-center gap-1.5">
                        <span>{r.label}</span>
                        {r.role === 'admin' && <Lock className="w-3 h-3 text-amber-600" />}
                      </div>
                      <div className="text-[11px] text-[#718078] truncate">{r.desc}</div>
                    </div>
                    {currentUser.role === r.role && (
                      <Check className="w-3.5 h-3.5 text-[#16A36A] mt-0.5 shrink-0" />
                    )}
                  </button>
                ))}
                <div className="pt-2 mt-1 border-t border-[#E1EBE5] px-3">
                  <button
                    onClick={() => {
                      setRoleDropdownOpen(false);
                      setActiveTab('login');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full text-left py-1 text-[11px] text-[#16A36A] font-mono font-semibold hover:underline flex items-center justify-between cursor-pointer"
                  >
                    <span>Citizen Sign In & Register</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => { setNotifDropdownOpen(!notifDropdownOpen); setRoleDropdownOpen(false); }}
              className="relative p-2 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] rounded-lg text-[#182B26] hover:text-[#16A36A] transition-colors cursor-pointer shadow-xs"
              title="Live Chain-of-Custody Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[17px] h-[17px] px-1 bg-[#16A36A] text-white font-bold font-mono text-[9px] rounded-full flex items-center justify-center shadow-xs tabular-nums">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown Drawer */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] bg-white border border-[#DCE6E0] rounded-xl shadow-[0_18px_40px_-12px_rgba(18,61,50,0.2)] p-3 z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E1EBE5]">
                  <div className="flex items-center gap-1.5 font-bold text-[#182B26]">
                    <Bell className="w-3.5 h-3.5 text-[#16A36A]" />
                    <span>Real-Time Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#B9F5D0]/60 text-[#123D32] font-semibold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllNotificationsAsRead(currentUser.id)}
                      className="text-[10px] text-[#16A36A] hover:underline font-mono font-semibold cursor-pointer"
                    >
                      Clear unread
                    </button>
                  )}
                </div>

                <div className="divide-y divide-[#E1EBE5] max-h-72 overflow-y-auto mt-1">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 6).map(n => (
                      <div
                        key={n.id}
                        onClick={() => {
                          markNotificationAsRead(n.id);
                          setNotifications(getUserNotifications(currentUser.id));
                          if (n.requestId) {
                            setNotifDropdownOpen(false);
                            setActiveTab('track');
                          }
                        }}
                        className={`py-2.5 px-2 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer hover:bg-[#F7FAF8] ${
                          !n.read ? 'bg-[#B9F5D0]/20' : ''
                        }`}
                      >
                        <div className="p-1 rounded-md bg-[#F7FAF8] border border-[#DCE6E0] text-[#16A36A] shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-semibold text-[#182B26] text-[11px] truncate">{n.title}</span>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[#16A36A] shrink-0" />}
                          </div>
                          <div className="text-[#718078] text-[10px] mt-0.5 line-clamp-2">{n.message}</div>
                          <div className="flex items-center justify-between mt-1 text-[9px] font-mono">
                            <span className="text-[#718078] tabular-nums">{n.timestamp}</span>
                            {n.requestId && (
                              <span className="text-[#16A36A] font-semibold hover:underline">Track →</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-[11px] text-[#718078] font-mono">
                      No recent notifications
                    </div>
                  )}
                </div>

                <div className="pt-2 mt-1 border-t border-[#E1EBE5] flex justify-between text-[11px] font-mono">
                  <button
                    onClick={() => {
                      setNotifDropdownOpen(false);
                      setActiveTab('dashboard');
                    }}
                    className="text-[#16A36A] font-semibold hover:underline cursor-pointer"
                  >
                    View All in Dashboard →
                  </button>
                  <button
                    onClick={() => setNotifDropdownOpen(false)}
                    className="text-[#718078] hover:text-[#182B26] cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Supabase Cloud Connection Button (Restricted: Shown only in Admin View) */}
          {onOpenSupabaseModal && currentUser.role === 'admin' && isAdminAuthenticated() && (
            <button
              onClick={onOpenSupabaseModal}
              className="hidden sm:flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] rounded-lg text-xs font-mono text-[#123D32] hover:border-[#16A36A] transition-colors whitespace-nowrap cursor-pointer"
              title="Supabase Database Status & Setup (Admin Clearance Only)"
            >
              <Database className="w-3.5 h-3.5 text-[#16A36A]" />
              <span className="hidden xl:inline">Supabase Cloud</span>
              <span className="xl:hidden">Cloud</span>
            </button>
          )}

          {/* Eco-Points Pill (clickable to rewards) */}
          <button
            onClick={() => setActiveTab('rewards')}
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-[#B9F5D0]/45 border border-[#16A36A]/25 rounded-lg text-xs font-semibold text-[#123D32] hover:bg-[#B9F5D0]/70 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-[#16A36A]" />
            <span className="tabular-nums font-mono">{currentUser.ecoPoints}</span>
            <span className="text-[10px] text-[#718078] font-normal">pts</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenPickupModal}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-semibold text-white bg-[#16A36A] hover:bg-[#128757] rounded-lg shadow-sm hover:shadow-[0_6px_16px_-4px_rgba(22,163,106,0.4)] transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Recycle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Recycle Device</span>
            <span className="sm:hidden">Recycle</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 text-[#182B26] hover:text-[#16A36A] lg:hidden rounded-lg hover:bg-white border border-transparent hover:border-[#DCE6E0] focus:outline-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#DCE6E0] bg-white px-4 pt-3 pb-6 space-y-1.5 text-sm shadow-lg">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-[#182B26] hover:bg-[#F7FAF8] font-medium"
          >
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('centres'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-[#182B26] hover:bg-[#F7FAF8] font-medium"
          >
            Collection Centres
          </button>
          <button
            onClick={() => { setActiveTab('track'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-[#182B26] hover:bg-[#F7FAF8] font-medium"
          >
            Track E-Waste
          </button>
          <button
            onClick={() => { setActiveTab('marketplace'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-[#182B26] hover:bg-[#F7FAF8] font-medium"
          >
            Marketplace
          </button>
          <button
            onClick={() => { setActiveTab('rewards'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-[#182B26] hover:bg-[#F7FAF8] font-medium"
          >
            Eco-Rewards ({currentUser.ecoPoints} pts)
          </button>
          <button
            onClick={() => { setActiveTab('sdg'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-[#182B26] hover:bg-[#F7FAF8] font-medium"
          >
            SDG Impact
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-[#182B26] hover:bg-[#F7FAF8] font-medium"
          >
            Dashboard ({currentUser.role.toUpperCase()})
          </button>
          <button
            onClick={() => { setActiveTab('login'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-[#16A36A] font-semibold font-mono hover:bg-[#F7FAF8] flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
            <span>Citizen Sign In & Register</span>
          </button>
          {onOpenSupabaseModal && currentUser.role === 'admin' && isAdminAuthenticated() && (
            <button
              onClick={() => { onOpenSupabaseModal(); setMobileMenuOpen(false); }}
              className="w-full text-left py-2 px-3 rounded-lg text-[#123D32] font-mono font-semibold hover:bg-[#F7FAF8] flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-[#16A36A]" />
              <span>Supabase Cloud Database (Admin Only)</span>
            </button>
          )}
          <div className="pt-3 mt-2 border-t border-[#E1EBE5] flex items-center justify-between">
            {currentUser.role === 'citizen' && currentUser.isAuthenticatedCitizen ? (
              <>
                <span className="text-xs text-[#182B26] font-medium">Citizen: {currentUser.name}</span>
                <button
                  onClick={() => {
                    logoutCitizen();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </button>
              </>
            ) : (
              <>
                <span className="text-xs text-[#718078]">Citizen: Not Logged In</span>
                <button
                  onClick={() => {
                    onOpenAuthModal();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs text-[#16A36A] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <LogIn className="w-3 h-3" />
                  <span>Login / Register</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      </header>

      {/* Admin Security Challenge Modal */}
      <AdminChallengeModal
        isOpen={adminChallengeModalOpen}
        onClose={() => setAdminChallengeModalOpen(false)}
        onSuccess={() => {
          setActiveTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Partner Authentication Challenge Modal */}
      <PartnerChallengeModal
        isOpen={partnerChallengeOpen}
        onClose={() => setPartnerChallengeOpen(false)}
        targetRole={targetPartnerRole}
        onSuccess={() => {
          switchUserRole(targetPartnerRole);
          setActiveTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRequestPartnerApply={() => {
          setPartnerChallengeOpen(false);
          setPartnerModalOpen(true);
        }}
      />

      {/* Partner Application to Admin Modal */}
      <PartnerApplicationModal
        isOpen={partnerModalOpen}
        onClose={() => setPartnerModalOpen(false)}
        targetRole={targetPartnerRole}
        onPartnerApprovedLaunch={(role) => {
          setActiveTab('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAdminChallenge={() => {
          setAdminChallengeModalOpen(true);
        }}
      />
    </>
  );
};
