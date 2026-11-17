import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Truck,
  Cpu,
  X,
  FileCheck2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { verifyPartnerCredentials, getVerificationApplications } from '../../services/storage';
import { UserRole } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetRole: 'recycler' | 'repair';
  onSuccess: () => void;
  onRequestPartnerApply: () => void;
}

export const PartnerChallengeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetRole,
  onSuccess,
  onRequestPartnerApply
}) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const isRecycler = targetRole === 'recycler';
  const roleTitle = isRecycler ? 'Certified Recycler Terminal' : 'Hardware Diagnostics Lab';
  const roleCategory = isRecycler ? 'Recycler' : 'Refurbisher';

  // Find approved applications for this category to show demo reviewer helper
  const allApps = getVerificationApplications();
  const approvedApps = allApps.filter(a => 
    a.status === 'approved' && 
    (a.type === (isRecycler ? 'Recycler' : 'Repairer') || a.category === roleCategory)
  );
  const primaryApproved = approvedApps[approvedApps.length - 1] || approvedApps[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginId.trim() || !password.trim()) {
      setErrorMessage('Please enter both your authorized Username / Email and temporary password.');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const res = verifyPartnerCredentials(targetRole, loginId, password);

      if (res.success) {
        setIsVerifying(false);
        onSuccess();
        onClose();
      } else {
        setIsVerifying(false);
        setErrorMessage(
          res.error || 'Access Denied: Invalid Username or Password. Request admin approval first.'
        );
      }
    }, 400);
  };

  const handleAutofillApproved = (app: typeof primaryApproved) => {
    if (app) {
      setLoginId(app.username || app.assignedLoginId || app.email);
      setPassword(app.temporaryPassword || app.generatedPassword || 'GreenTech@2026');
      setErrorMessage('');
    } else if (isRecycler) {
      setLoginId('ops@greentech-ewaste.org');
      setPassword('GreenTech@2026');
      setErrorMessage('');
    } else {
      setLoginId('technician@microfixlab.com');
      setPassword('MicroFix@2026');
      setErrorMessage('');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-[#123D32]/50 backdrop-blur-sm animate-modal-in overflow-y-auto">
      <div className="relative w-full max-w-md my-auto bg-white border border-[#DCE6E0] rounded-2xl shadow-2xl p-4 sm:p-6 text-xs text-[#182B26] flex flex-col box-border min-w-0 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E1EBE5]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              isRecycler ? 'bg-[#B9F5D0]/50 border-[#16A36A]/30 text-[#123D32]' : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {isRecycler ? <Truck className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#16A36A] font-semibold">
                Authorized Partner Authentication
              </span>
              <h2 className="text-base font-bold text-[#182B26] mt-0.5">
                {roleTitle}
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
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="block text-[#182B26] font-semibold mb-1">
              Authorized Partner ID / Email <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              placeholder={isRecycler ? 'ops@greentech-ewaste.org' : 'technician@microfixlab.com'}
              className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
            />
          </div>

          <div>
            <label className="block text-[#182B26] font-semibold mb-1">
              Admin-Generated Password <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
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

          {/* Admin Generated Credentials Reference for Hackathon Reviewers */}
          <div className="p-3 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl space-y-1 text-[11px] font-mono">
            <div className="flex items-center justify-between text-[#718078]">
              <span className="flex items-center gap-1.5 font-semibold text-[#182B26]">
                <Sparkles className="w-3 h-3 text-[#16A36A]" />
                <span>Admin-Issued Partner Credentials</span>
              </span>
              <button
                type="button"
                onClick={() => handleAutofillApproved(primaryApproved)}
                className="text-[#16A36A] hover:underline cursor-pointer text-[10px] font-semibold"
              >
                Autofill
              </button>
            </div>
            <div className="text-[#718078] text-[10px] pt-1">
              <span>Login ID: </span>
              <strong className="text-[#182B26]">
                {primaryApproved?.assignedLoginId || (isRecycler ? 'ops@greentech-ewaste.org' : 'technician@microfixlab.com')}
              </strong>
            </div>
            <div className="text-[#718078] text-[10px]">
              <span>Password: </span>
              <strong className="text-[#182B26]">
                {primaryApproved?.generatedPassword || (isRecycler ? 'GreenTech@2026' : 'MicroFix@2026')}
              </strong>
            </div>
          </div>

          {/* Need to apply banner */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                onRequestPartnerApply();
              }}
              className="text-[11px] text-[#16A36A] hover:underline font-mono inline-flex items-center gap-1 cursor-pointer font-semibold"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Don't have an approved account? Apply to Admin here</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#F7FAF8] hover:bg-[#E1EBE5] border border-[#DCE6E0] text-[#182B26] rounded-xl text-xs cursor-pointer font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="px-5 py-2 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
            >
              {isVerifying ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authenticate & Enter Console</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
