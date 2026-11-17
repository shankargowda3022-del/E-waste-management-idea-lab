import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import {
  registerCitizenAccount,
  loginCitizenAccount
} from '../../services/storage';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle
} from '../../services/supabase';
import {
  X,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Recycle,
  UserPlus,
  LogIn,
  ShieldCheck
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form inputs
  const [nameOrEmail, setNameOrEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setIsSubmitting(false);
      setErrorMsg(res.error || 'Google sign-in could not be initiated.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!nameOrEmail.trim() || !password.trim()) {
      setErrorMsg('Please enter both your Name / Email and Password.');
      return;
    }

    setIsSubmitting(true);

    try {
      // If user provided an email, try Supabase Auth first
      if (nameOrEmail.includes('@')) {
        const supaRes = await signInWithEmail(nameOrEmail.trim(), password.trim());
        if (supaRes.success && supaRes.user) {
          setSuccessMsg(`Welcome back, ${supaRes.user.name}!`);
          setTimeout(() => {
            onAuthSuccess(supaRes.user!);
            setIsSubmitting(false);
            onClose();
          }, 350);
          return;
        }
      }

      // Fallback to local accounts
      const res = loginCitizenAccount(nameOrEmail.trim(), password.trim());
      if (res.success && res.user) {
        setSuccessMsg(`Welcome back, ${res.user.name}!`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          setIsSubmitting(false);
          onClose();
        }, 350);
      } else {
        setIsSubmitting(false);
        setErrorMsg(res.error || 'Invalid credentials. If you are a new citizen, please register your account.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('An unexpected error occurred during sign in. Please retry.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !password.trim()) {
      setErrorMsg('Please fill in all registration fields to create your account.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return;
    }

    if (password.trim().length < 4) {
      setErrorMsg('Password must be at least 4 characters long.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Try Supabase Auth Sign-Up
      const supaRes = await signUpWithEmail(email.trim(), password.trim(), {
        name: name.trim(),
        role: selectedRole,
        phone: phone.trim(),
        address: address.trim()
      });

      if (supaRes.success && supaRes.user) {
        setSuccessMsg(`Account created successfully! Welcome, ${supaRes.user.name}.`);
        setTimeout(() => {
          onAuthSuccess(supaRes.user!);
          setIsSubmitting(false);
          onClose();
        }, 350);
        return;
      }

      // 2. Fallback to local citizen registration
      const res = registerCitizenAccount({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        password: password.trim()
      });

      if (res.success && res.user) {
        setSuccessMsg(`Account created successfully! Welcome, ${res.user.name}.`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          setIsSubmitting(false);
          onClose();
        }, 350);
      } else {
        setIsSubmitting(false);
        setErrorMsg(res.error || 'Failed to create account. Please check your details.');
      }
    } catch {
      setIsSubmitting(false);
      setErrorMsg('Failed to complete registration. Please check your network connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-[#123D32]/50 backdrop-blur-sm animate-modal-in overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-white border border-[#DCE6E0] rounded-2xl shadow-2xl p-5 sm:p-6 text-xs text-[#182B26] flex flex-col max-h-[92vh] overflow-y-auto box-border min-w-0">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E1EBE5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B9F5D0]/50 border border-[#16A36A]/30 flex items-center justify-center text-[#123D32] shrink-0">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#16A36A] font-semibold block">
                E-Cycle AI Portal
              </span>
              <h2 className="text-base sm:text-lg font-bold text-[#182B26] mt-0.5">
                {mode === 'login' ? 'Citizen Sign In' : 'Create Citizen Account'}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#718078] hover:text-[#182B26] rounded-lg hover:bg-[#F7FAF8] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Google One-Click OAuth Button */}
        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-[#F7FAF8] hover:bg-[#EDF5F0] border border-[#DCE6E0] hover:border-[#16A36A]/50 text-[#182B26] font-semibold rounded-xl text-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-xs disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E1EBE5]" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono">
              <span className="bg-white px-2 text-[#718078]">Or continue with email</span>
            </div>
          </div>
        </div>

        {/* Tab switcher: Login vs Register ONLY */}
        <div className="mb-4 grid grid-cols-2 gap-1 p-1 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-lg font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-[#16A36A] text-white shadow-sm'
                : 'text-[#718078] hover:text-[#182B26]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
            className={`py-2 rounded-lg font-semibold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-[#16A36A] text-white shadow-sm'
                : 'text-[#718078] hover:text-[#182B26]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register (New)</span>
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="mb-4 p-3 bg-[#B9F5D0]/35 border border-[#16A36A]/40 rounded-xl text-[#123D32] text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODE 1: CITIZEN LOGIN */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="block text-[#182B26] font-semibold mb-1">
                Your Registered Email or Username <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={nameOrEmail}
                  onChange={(e) => setNameOrEmail(e.target.value)}
                  placeholder="e.g. alex.rivera@university.edu"
                  className="w-full pl-3 pr-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs box-border font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#182B26] font-semibold mb-1">
                Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-3 pr-9 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718078] hover:text-[#182B26] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer mt-2 transition-colors"
            >
              {isSubmitting ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In to Account</span>
                </>
              )}
            </button>

            <div className="text-center pt-2 text-[#718078] text-xs font-mono">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setErrorMsg('');
                }}
                className="text-[#16A36A] hover:underline font-semibold cursor-pointer"
              >
                Register here
              </button>
            </div>
          </form>
        ) : (
          /* MODE 2: CITIZEN REGISTRATION */
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                <UserIcon className="w-3 h-3 text-[#718078]" />
                <span>Full Name <span className="text-red-600">*</span></span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Deekshitha Gowda"
                className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs box-border"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-[#718078]" />
                  <span>Email Address <span className="text-red-600">*</span></span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. name@gmail.com"
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                />
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-[#718078]" />
                  <span>Phone Number <span className="text-red-600">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 789-0123"
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#718078]" />
                <span>Doorstep Address <span className="text-red-600">*</span></span>
              </label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Flat 302, Green Residence, North Campus"
                className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs box-border"
              />
            </div>

            <div>
              <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#718078]" />
                <span>Create Password <span className="text-red-600">*</span></span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set your account password"
                  className="w-full pl-3 pr-9 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718078] hover:text-[#182B26] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer mt-2 transition-colors"
            >
              {isSubmitting ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register & Sign In</span>
                </>
              )}
            </button>

            <div className="text-center pt-1 text-[#718078] text-xs font-mono">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="text-[#16A36A] hover:underline font-semibold cursor-pointer"
              >
                Sign in here
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
