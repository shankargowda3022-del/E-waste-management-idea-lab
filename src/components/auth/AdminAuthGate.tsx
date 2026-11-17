import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Terminal,
  LogOut
} from 'lucide-react';
import {
  ADMIN_CREDENTIALS,
  verifyAdminCredentials,
  switchUserRole
} from '../../services/storage';

interface Props {
  onUnlockSuccess: () => void;
  onCancel: () => void;
}

export const AdminAuthGate: React.FC<Props> = ({ onUnlockSuccess, onCancel }) => {
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!adminId.trim()) {
      setErrorMessage('Please enter your Administrator ID or institutional email.');
      return;
    }

    if (!adminPassword.trim()) {
      setErrorMessage('Please enter your Administrator password.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const isValid = verifyAdminCredentials(adminId, adminPassword, twoFactorCode);

      if (isValid) {
        setSuccessMessage('Cryptographic handshake confirmed. Clearance Level 4 granted.');
        setTimeout(() => {
          setIsVerifying(false);
          onUnlockSuccess();
        }, 600);
      } else {
        setIsVerifying(false);
        setErrorMessage(
          'Access Denied: Invalid Administrator ID or Password. Check authorized credentials below.'
        );
      }
    }, 400);
  };

  const handleAutofill = () => {
    setAdminId(ADMIN_CREDENTIALS.id);
    setAdminPassword(ADMIN_CREDENTIALS.password);
    setTwoFactorCode(ADMIN_CREDENTIALS.twoFactorToken);
    setErrorMessage('');
  };

  return (
    <div className="max-w-xl mx-auto my-8 p-6 sm:p-8 bg-white border border-[#DCE6E0] rounded-2xl shadow-lg relative overflow-hidden text-xs text-[#182B26]">
      {/* Subtle ambient glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-[#B9F5D0]/30 blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#16A36A]/10 blur-3xl pointer-events-none -z-10" />

      {/* Top Directorate Header */}
      <div className="text-center space-y-3 pb-6 border-b border-[#E1EBE5]">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-[#123D32] border border-[#1D5446] flex items-center justify-center text-[#B9F5D0] shadow-md">
          <Lock className="w-7 h-7" />
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono bg-[#B9F5D0]/50 text-[#123D32] border border-[#16A36A]/30">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
            <span>FIPS 140-2 RESTRICTED ACCESS GATEWAY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#182B26]">
            Administrator Clearance Required
          </h2>
          <p className="text-[#718078] text-xs max-w-md mx-auto leading-relaxed">
            The System Administration Console requires Level 4 Directorate credentials. Please provide your authorized ID and security password to access platform governance controls.
          </p>
        </div>
      </div>

      {/* Error / Success Notifications */}
      {errorMessage && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 leading-relaxed">{errorMessage}</div>
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3.5 bg-[#B9F5D0]/35 border border-[#16A36A]/40 rounded-xl text-[#123D32] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
          <div className="flex-1 font-mono leading-relaxed">{successMessage}</div>
        </div>
      )}

      {/* Security Form */}
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Admin ID / Email */}
        <div>
          <label className="block text-[#182B26] font-semibold mb-1.5">
            Administrator ID / Directorate Email <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <Terminal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718078]" />
            <input
              type="text"
              required
              value={adminId}
              onChange={(e) => setAdminId(e.target.value)}
              placeholder="adminewaste@123"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono"
            />
          </div>
        </div>

        {/* Admin Password */}
        <div>
          <label className="block text-[#182B26] font-semibold mb-1.5">
            Directorate Password <span className="text-red-600">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718078]" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono"
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

        {/* 2FA Token (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[#182B26] font-semibold">
              Security Token (2FA Passcode)
            </label>
            <span className="text-[10px] font-mono text-[#16A36A]">Optional (SDG-2026)</span>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#16A36A]" />
            <input
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              placeholder="Enter 2FA Code (e.g. SDG-2026)"
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono"
            />
          </div>
        </div>

        {/* Credentials Reference Box for Hackathon Reviewers */}
        <div className="p-3.5 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-[#718078] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Authorized Admin Credentials</span>
            </span>
            <button
              type="button"
              onClick={handleAutofill}
              className="text-[#16A36A] hover:underline font-mono text-[10px] cursor-pointer font-semibold"
            >
              1-Click Autofill
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#718078] pt-1 border-t border-[#E1EBE5]">
            <div>
              <span className="text-[#718078]">Admin ID: </span>
              <strong className="text-[#182B26]">adminewaste@123</strong>
            </div>
            <div>
              <span className="text-[#718078]">Password: </span>
              <strong className="text-[#182B26]">Admin@2026</strong>
            </div>
          </div>
        </div>

        {/* Submit & Cancel Actions */}
        <div className="pt-2 space-y-2">
          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            {isVerifying ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Verifying Cryptographic Credentials...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Verify & Unlock Directorate Console</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 bg-[#F7FAF8] hover:bg-[#E1EBE5] border border-[#DCE6E0] text-[#718078] hover:text-[#182B26] rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Return to Citizen Portal</span>
          </button>
        </div>
      </form>
    </div>
  );
};
