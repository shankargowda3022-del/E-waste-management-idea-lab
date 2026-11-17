import React, { useState } from 'react';
import {
  X,
  Lock,
  ShieldCheck,
  Terminal,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  ADMIN_CREDENTIALS,
  verifyAdminCredentials,
  switchUserRole
} from '../../services/storage';
import { User } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (adminUser: User) => void;
}

export const AdminChallengeModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [adminId, setAdminId] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!adminId.trim() || !adminPassword.trim()) {
      setErrorMessage('Please enter both Administrator ID and Password.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const isValid = verifyAdminCredentials(adminId, adminPassword);

      if (isValid) {
        const adminUser = switchUserRole('admin');
        setIsVerifying(false);
        onSuccess(adminUser);
        onClose();
      } else {
        setIsVerifying(false);
        setErrorMessage('Access Denied: Invalid Administrator ID or Password.');
      }
    }, 400);
  };

  const handleAutofill = () => {
    setAdminId(ADMIN_CREDENTIALS.id);
    setAdminPassword(ADMIN_CREDENTIALS.password);
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-[#123D32]/50 backdrop-blur-sm animate-modal-in overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-white border border-[#DCE6E0] rounded-2xl shadow-2xl p-4 sm:p-6 text-xs text-[#182B26] flex flex-col box-border min-w-0 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E1EBE5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B9F5D0]/50 border border-[#16A36A]/30 flex items-center justify-center text-[#123D32] shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#16A36A] font-semibold">
                Security Clearance Level 4
              </span>
              <h2 className="text-base font-bold text-[#182B26] mt-0.5">
                Admin Console Authorization
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

        {errorMessage && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-[#182B26] font-semibold mb-1.5">
              Administrator ID / Email <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718078]" />
              <input
                type="text"
                required
                value={adminId}
                onChange={(e) => setAdminId(e.target.value)}
                placeholder="adminewaste@123"
                className="w-full pl-9 pr-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#182B26] font-semibold mb-1.5">
              Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#718078]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-9 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs"
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

          <div className="p-3 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl flex items-center justify-between text-[10px] font-mono text-[#718078]">
            <div>
              <span>Demo: </span>
              <strong className="text-[#182B26]">adminewaste@123</strong> / <strong className="text-[#182B26]">Admin@2026</strong>
            </div>
            <button
              type="button"
              onClick={handleAutofill}
              className="text-[#16A36A] hover:underline shrink-0 font-semibold cursor-pointer"
            >
              Autofill
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F7FAF8] hover:bg-[#E1EBE5] border border-[#DCE6E0] text-[#182B26] rounded-xl cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white font-semibold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              {isVerifying ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin View</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
