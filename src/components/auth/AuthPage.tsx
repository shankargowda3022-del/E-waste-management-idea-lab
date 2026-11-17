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
  Recycle,
  User as UserIcon,
  Mail,
  Lock,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';

interface Props {
  currentUser: User;
  onAuthSuccess: (user: User) => void;
  onGoToDashboard: () => void;
}

export const AuthPage: React.FC<Props> = ({ currentUser, onAuthSuccess, onGoToDashboard }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [nameOrEmail, setNameOrEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsLoading(true);
    const res = await signInWithGoogle();
    if (!res.success) {
      setIsLoading(false);
      setErrorMessage(res.error || 'Google sign-in could not be initiated.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!nameOrEmail.trim() || !password.trim()) {
      setErrorMessage('Please enter both your name or email and your password.');
      return;
    }

    setIsLoading(true);

    try {
      if (nameOrEmail.includes('@')) {
        const supaRes = await signInWithEmail(nameOrEmail.trim(), password.trim());
        if (supaRes.success && supaRes.user) {
          setSuccessMessage(`Welcome back, ${supaRes.user.name}! Access granted.`);
          setTimeout(() => {
            onAuthSuccess(supaRes.user!);
            onGoToDashboard();
          }, 450);
          return;
        }
      }

      // Fallback to local accounts
      const res = loginCitizenAccount(nameOrEmail.trim(), password.trim());
      if (res.success && res.user) {
        setSuccessMessage(`Welcome back, ${res.user.name}! Access granted.`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onGoToDashboard();
        }, 450);
      } else {
        setIsLoading(false);
        setErrorMessage(res.error || 'Invalid credentials. If you are a new citizen, please register below.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('Failed to sign in. Please check your network connection.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim() || !email.trim() || !phone.trim() || !address.trim() || !password.trim()) {
      setErrorMessage('Please fill in all registration fields.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.trim().length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Try Supabase Auth
      const supaRes = await signUpWithEmail(email.trim(), password.trim(), {
        name: name.trim(),
        role: selectedRole,
        phone: phone.trim(),
        address: address.trim()
      });

      if (supaRes.success && supaRes.user) {
        setSuccessMessage(`Account registered successfully! Welcome, ${supaRes.user.name}.`);
        setTimeout(() => {
          onAuthSuccess(supaRes.user!);
          onGoToDashboard();
        }, 450);
        return;
      }

      // 2. Fallback to local registration
      const res = registerCitizenAccount({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        password: password.trim()
      });

      if (res.success && res.user) {
        setSuccessMessage(`Account registered successfully! Welcome, ${res.user.name}.`);
        setTimeout(() => {
          onAuthSuccess(res.user!);
          onGoToDashboard();
        }, 450);
      } else {
        setIsLoading(false);
        setErrorMessage(res.error || 'Failed to create citizen account.');
      }
    } catch {
      setIsLoading(false);
      setErrorMessage('An unexpected error occurred during account creation.');
    }
  };

  return (
    <section className="w-full py-8 sm:py-16 bg-[#F7FAF8] eco-mesh-bg min-h-screen flex flex-col items-center justify-start relative z-10 overflow-x-hidden box-border px-4 sm:px-6">
      
      {/* Subtle Ambient Accent */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[560px] h-[260px] bg-[#B9F5D0]/35 blur-[120px] pointer-events-none -z-10" />

      <div className="w-full max-w-lg space-y-6">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#B9F5D0]/50 border border-[#16A36A]/30 text-[#123D32] font-mono text-xs font-semibold">
            <Recycle className="w-3.5 h-3.5 text-[#16A36A]" />
            <span>Citizen E-Waste Access</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#182B26] tracking-tight">
            {authMode === 'login' ? 'Citizen Sign In' : 'Create Citizen Account'}
          </h1>
          <p className="text-xs sm:text-sm text-[#718078] max-w-md mx-auto leading-relaxed">
            {authMode === 'login'
              ? 'Sign in with Google or your email and password to submit recycle requests, track pickups, and manage your eco-points.'
              : 'Register your details to request e-waste pickups and earn verified eco-rewards.'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white border border-[#DCE6E0] rounded-2xl shadow-lg p-6 sm:p-8 space-y-5">
          
          {/* Google One-Click OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 bg-[#F7FAF8] hover:bg-[#EDF5F0] border border-[#DCE6E0] hover:border-[#16A36A]/50 text-[#182B26] font-semibold rounded-xl text-xs flex items-center justify-center gap-3 transition-all cursor-pointer shadow-xs disabled:opacity-50"
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

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'login'
                  ? 'bg-[#16A36A] text-white shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Log In</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              className={`py-2 rounded-lg font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === 'register'
                  ? 'bg-[#16A36A] text-white shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register (New)</span>
            </button>
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-[#B9F5D0]/35 border border-[#16A36A]/40 rounded-xl text-[#123D32] text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#182B26] font-semibold mb-1">
                  Registered Email or Username <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={nameOrEmail}
                    onChange={(e) => setNameOrEmail(e.target.value)}
                    placeholder="e.g. alex.rivera@university.edu"
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs"
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
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718078] hover:text-[#182B26] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all mt-3"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Account</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-[#718078] text-xs font-mono">
                New citizen?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setErrorMessage('');
                  }}
                  className="text-[#16A36A] hover:underline font-semibold cursor-pointer"
                >
                  Create an account here
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                  <UserIcon className="w-3.5 h-3.5 text-[#718078]" />
                  <span>Full Name <span className="text-red-600">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deekshitha Gowda"
                  className="w-full px-3.5 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#718078]" />
                    <span>Email Address <span className="text-red-600">*</span></span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com"
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-[#718078]" />
                    <span>Phone Number <span className="text-red-600">*</span></span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 789-0123"
                    className="w-full px-3.5 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#718078]" />
                  <span>Doorstep Collection Address <span className="text-red-600">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Flat 302, Green Residence, North Campus"
                  className="w-full px-3.5 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-[#718078]" />
                  <span>Create Password <span className="text-red-600">*</span></span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set your account password"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718078] hover:text-[#182B26] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-all mt-3"
              >
                {isLoading ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Register & Sign In</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-[#718078] text-xs font-mono">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                  }}
                  className="text-[#16A36A] hover:underline font-semibold cursor-pointer"
                >
                  Log in to your account
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </section>
  );
};
