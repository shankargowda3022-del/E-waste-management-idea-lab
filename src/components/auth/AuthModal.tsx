import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { DEMO_USERS } from '../../data/mockData';
import { setStoredUser } from '../../services/storage';
import { X, UserCheck, ShieldCheck, ArrowRight, UserPlus, LogIn } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [tab, setTab] = useState<'demo' | 'custom'>('demo');
  const [isRegister, setIsRegister] = useState(false);

  // Custom form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('citizen');
  const [org, setOrg] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleQuickLogin = (roleKey: UserRole) => {
    const user = DEMO_USERS[roleKey];
    setStoredUser(user);
    onAuthSuccess(user);
    onClose();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || (!name.trim() && isRegister)) {
      setErrorMsg('Please fill in required credentials.');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      role: role,
      organization: org.trim() || (role === 'admin' ? 'Environmental Taskforce' : 'Campus Community'),
      ecoPoints: role === 'citizen' ? 100 : 500,
      carbonSavedKg: 0,
      devicesRecycled: 0,
      phone: phone.trim() || '+1 (555) 000-0000',
      address: address.trim() || 'Campus District'
    };

    setStoredUser(newUser);
    onAuthSuccess(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 text-xs text-neutral-100">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div>
            <span className="text-xs font-mono uppercase text-emerald-400">Authentication Portal</span>
            <h2 className="text-xl font-bold text-white mt-1">Sign In / Switch Role</h2>
            <p className="text-xs text-neutral-400 mt-0.5">Access role-tailored e-waste workflows</p>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="my-4 flex items-center gap-1 p-1 bg-neutral-950 border border-neutral-800 rounded-xl text-xs">
          <button
            onClick={() => setTab('demo')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${tab === 'demo' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
          >
            ⚡ 1-Click Demo Accounts
          </button>
          <button
            onClick={() => setTab('custom')}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-colors ${tab === 'custom' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
          >
            Custom Sign In
          </button>
        </div>

        {tab === 'demo' ? (
          <div className="space-y-3">
            <div className="text-[11px] text-neutral-400 font-mono">
              Select any pre-configured role profile to test dashboards & permissions:
            </div>

            <button
              onClick={() => handleQuickLogin('citizen')}
              className="w-full p-3.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-between text-left transition-colors group"
            >
              <div>
                <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                  Alex Rivera (Citizen View)
                </div>
                <div className="text-[11px] text-neutral-400">Student / Resident · 480 Eco-Points</div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            </button>

            <button
              onClick={() => handleQuickLogin('recycler')}
              className="w-full p-3.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-between text-left transition-colors group"
            >
              <div>
                <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                  GreenTech Solutions (Recycler View)
                </div>
                <div className="text-[11px] text-neutral-400">R2v3 Certified Recycler · Processing Console</div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            </button>

            <button
              onClick={() => handleQuickLogin('repair')}
              className="w-full p-3.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-between text-left transition-colors group"
            >
              <div>
                <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                  MicroFix Lab (Repair Partner)
                </div>
                <div className="text-[11px] text-neutral-400">Diagnostics, Refurbishment & Spare Parts</div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            </button>

            <button
              onClick={() => handleQuickLogin('admin')}
              className="w-full p-3.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-xl flex items-center justify-between text-left transition-colors group"
            >
              <div>
                <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors">
                  Dr. Sarah Vance (Platform Admin)
                </div>
                <div className="text-[11px] text-neutral-400">UN SDG Director · Partner Approvals & Audits</div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleCustomSubmit} className="space-y-3">
            {errorMsg && (
              <div className="p-2 bg-red-950/40 border border-red-800 rounded-lg text-red-300 text-[11px]">
                {errorMsg}
              </div>
            )}

            {isRegister && (
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
                />
              </div>
            )}

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
              />
            </div>

            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Select Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 capitalize"
              >
                <option value="citizen">Citizen / Student / Resident</option>
                <option value="recycler">Certified Recycler Partner</option>
                <option value="repair">Hardware Repair Lab</option>
                <option value="admin">SDG Compliance Admin</option>
              </select>
            </div>

            {isRegister && (
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Organization / Campus Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Oak Residence Hall or Tech Park"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              {isRegister ? 'Create Account' : 'Sign In'}
            </button>

            <div className="pt-2 text-center text-neutral-400 text-[11px]">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="hover:underline text-emerald-400"
              >
                {isRegister ? 'Already registered? Sign in instead' : 'Need an account? Register here'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
