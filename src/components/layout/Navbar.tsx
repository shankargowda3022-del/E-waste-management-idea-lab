import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { switchUserRole } from '../../services/storage';
import { Menu, X, Recycle, User as UserIcon, ShieldAlert, Award, ChevronDown, Check } from 'lucide-react';

interface Props {
  currentUser: User;
  onOpenPickupModal: () => void;
  onOpenAuthModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<Props> = ({
  currentUser,
  onOpenPickupModal,
  onOpenAuthModal,
  activeTab,
  setActiveTab
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const roles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'citizen', label: 'Citizen View', desc: 'Alex Rivera (Student / Resident)' },
    { role: 'recycler', label: 'Recycler View', desc: 'GreenTech Certified Solutions' },
    { role: 'repair', label: 'Repair Partner', desc: 'MicroFix Hardware Lab' },
    { role: 'admin', label: 'Admin View', desc: 'UN SDG Taskforce Director' }
  ];

  const handleRoleSelect = (roleKey: UserRole) => {
    switchUserRole(roleKey);
    setRoleDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        
        {/* Zone 1: Wordmark in Display Face */}
        <button
          onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="flex items-center gap-2.5 text-left text-white whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-600/30 transition-colors">
            <Recycle className="w-4 h-4" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">E-Cycle AI</span>
        </button>

        {/* Zone 2: 5 Clean Single-Line Nav Links */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <button
            onClick={() => setActiveTab('home')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'home' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('centres')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'centres' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Collection Centres
          </button>
          <button
            onClick={() => setActiveTab('track')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'track' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Track E-Waste
          </button>
          <button
            onClick={() => setActiveTab('marketplace')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'marketplace' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Marketplace
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'rewards' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Eco-Rewards
          </button>
          <button
            onClick={() => setActiveTab('sdg')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'sdg' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            SDG Impact
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`whitespace-nowrap transition-colors hover:text-white ${activeTab === 'dashboard' ? 'text-emerald-400 font-semibold' : ''}`}
          >
            Dashboard
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action + Quick Role Switcher for Hackathon Judges */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/70 rounded-lg text-xs font-medium text-neutral-200 transition-colors whitespace-nowrap"
              title="Test role views for hackathon evaluation"
            >
              <span className="text-neutral-400">Role:</span>
              <span className="text-emerald-400 capitalize">{currentUser.role}</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-0.5" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-1.5 border-b border-neutral-800 text-[10px] uppercase font-mono text-neutral-400">
                  Switch Demo Account (Hackathon Triage)
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => handleRoleSelect(r.role)}
                    className="w-full px-3 py-2 text-left hover:bg-neutral-800 flex items-start justify-between gap-2 transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-neutral-200">{r.label}</div>
                      <div className="text-[11px] text-neutral-400">{r.desc}</div>
                    </div>
                    {currentUser.role === r.role && (
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Eco-Points Pill (clickable to rewards) */}
          <button
            onClick={() => setActiveTab('rewards')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-900/60 rounded-lg text-xs font-semibold text-emerald-300 hover:bg-emerald-900/40 transition-colors whitespace-nowrap"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            <span className="tabular-nums font-mono">{currentUser.ecoPoints}</span>
            <span className="text-[10px] text-emerald-400 font-normal">pts</span>
          </button>

          {/* Primary Action Button */}
          <button
            onClick={onOpenPickupModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm hover:shadow-emerald-900/30 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Recycle className="w-3.5 h-3.5" />
            <span>Recycle Device</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-neutral-400 hover:text-white lg:hidden rounded-lg hover:bg-neutral-800 focus:outline-none"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-800 bg-neutral-950 px-4 pt-3 pb-6 space-y-2 text-sm">
          <button
            onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-neutral-200 hover:bg-neutral-800"
          >
            Overview
          </button>
          <button
            onClick={() => { setActiveTab('centres'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-neutral-200 hover:bg-neutral-800"
          >
            Collection Centres
          </button>
          <button
            onClick={() => { setActiveTab('track'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-neutral-200 hover:bg-neutral-800"
          >
            Track E-Waste
          </button>
          <button
            onClick={() => { setActiveTab('marketplace'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-neutral-200 hover:bg-neutral-800"
          >
            Marketplace
          </button>
          <button
            onClick={() => { setActiveTab('rewards'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-neutral-200 hover:bg-neutral-800"
          >
            Eco-Rewards ({currentUser.ecoPoints} pts)
          </button>
          <button
            onClick={() => { setActiveTab('sdg'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-neutral-200 hover:bg-neutral-800"
          >
            SDG Impact
          </button>
          <button
            onClick={() => { setActiveTab('dashboard'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg text-neutral-200 hover:bg-neutral-800"
          >
            Dashboard ({currentUser.role.toUpperCase()})
          </button>
          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between">
            <span className="text-xs text-neutral-400">Signed in as {currentUser.name}</span>
            <button
              onClick={() => { onOpenAuthModal(); setMobileMenuOpen(false); }}
              className="text-xs text-emerald-400 hover:underline"
            >
              Change Account
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
