import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  X,
  CheckCircle2,
  AlertCircle,
  Truck,
  Wrench,
  ArrowRight,
  Clock,
  Sparkles,
  Lock,
  Mail,
  MapPin,
  Phone,
  User as UserIcon
} from 'lucide-react';
import {
  submitPartnerApplication,
  switchUserRole,
  ADMIN_CREDENTIALS
} from '../../services/storage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'recycler' | 'repair';
  onPartnerApprovedLaunch?: (role: 'recycler' | 'repair') => void;
  onOpenAdminChallenge?: () => void;
}

export const PartnerApplicationModal: React.FC<Props> = ({
  isOpen,
  onClose,
  targetRole = 'recycler',
  onPartnerApprovedLaunch,
  onOpenAdminChallenge
}) => {
  const [partnerType, setPartnerType] = useState<'Recycler' | 'Repairer'>(
    targetRole === 'repair' ? 'Repairer' : 'Recycler'
  );
  const [shopName, setShopName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<{
    id: string;
    shopName: string;
    name: string;
    email: string;
    type: 'Recycler' | 'Repairer';
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!shopName.trim() || !name.trim() || !email.trim() || !phone.trim() || !address.trim()) {
      setErrorMessage('Please fill in all registration fields (Shop Name, Name, Email, Phone, Address, Type).');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail or work email address.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newApp = submitPartnerApplication({
        shopName: shopName.trim(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        type: partnerType,
        r2Certified: true
      });

      setIsSubmitting(false);
      setSubmittedApp({
        id: newApp.id,
        shopName: newApp.shopName,
        name: newApp.name,
        email: newApp.email,
        type: newApp.type
      });
    }, 450);
  };

  const handleFastTrackDemo = () => {
    const chosenRole = partnerType === 'Repairer' ? 'repair' : 'recycler';
    switchUserRole(chosenRole);
    if (onPartnerApprovedLaunch) {
      onPartnerApprovedLaunch(chosenRole);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-[#123D32]/50 backdrop-blur-sm animate-modal-in overflow-y-auto">
      <div className="relative w-full max-w-xl my-auto bg-white border border-[#DCE6E0] rounded-2xl shadow-2xl p-4 sm:p-6 text-xs text-[#182B26] max-h-[92vh] overflow-y-auto box-border min-w-0">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E1EBE5]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              partnerType === 'Recycler'
                ? 'bg-[#B9F5D0]/50 border-[#16A36A]/30 text-[#123D32]'
                : 'bg-amber-50 border-amber-200 text-amber-700'
            }`}>
              {partnerType === 'Recycler' ? <Truck className="w-5 h-5" /> : <Wrench className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#16A36A] font-semibold">
                  Partner Registration
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-[#F7FAF8] border border-[#DCE6E0] text-[#718078]">
                  UN SDG 12
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#182B26] mt-0.5">
                Register as a {partnerType === 'Recycler' ? 'Certified Recycler' : 'Authorized Repairer'}
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

        {submittedApp ? (
          /* Confirmation Screen */
          <div className="py-6 space-y-5 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#B9F5D0]/50 border border-[#16A36A]/30 flex items-center justify-center text-[#123D32] shadow-sm">
              <CheckCircle2 className="w-8 h-8 text-[#16A36A]" />
            </div>

            <div className="space-y-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>STATUS: PENDING ADMIN APPROVAL</span>
              </span>
              <h3 className="text-xl font-bold text-[#182B26]">
                Registration Request Submitted!
              </h3>
              <p className="text-[#718078] text-xs max-w-md mx-auto leading-relaxed">
                Your partner registration for <strong className="text-[#182B26]">{submittedApp.shopName}</strong> has been saved with status <strong className="text-amber-700">"Pending"</strong> in the database.
              </p>
            </div>

            <div className="p-4 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl max-w-md mx-auto space-y-2 text-left font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-[#718078]">Request ID:</span>
                <strong className="text-[#16A36A] tabular-nums">{submittedApp.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718078]">Shop Name:</span>
                <span className="text-[#182B26] font-semibold">{submittedApp.shopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718078]">Applicant Name:</span>
                <span className="text-[#182B26]">{submittedApp.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718078]">Registered Email:</span>
                <span className="text-[#123D32] font-semibold">{submittedApp.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#718078]">Partner Type:</span>
                <span className="text-[#182B26]">{submittedApp.type}</span>
              </div>
            </div>

            {/* Email Dispatch Notice */}
            <div className="p-3.5 bg-[#B9F5D0]/30 border border-[#16A36A]/30 rounded-xl max-w-md mx-auto text-left space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-[#123D32] font-mono text-[11px]">
                <Mail className="w-4 h-4 text-[#16A36A]" />
                <span>Next Step: Admin Approval & Gmail Dispatch</span>
              </div>
              <p className="text-[#182B26]/85 text-[11px] leading-relaxed">
                When the Admin reviews and clicks <strong>Accept</strong> in the Admin Dashboard, your unique <strong>Username</strong> and <strong>Temporary Password</strong> will be automatically generated and delivered to <strong>{submittedApp.email}</strong> via Gmail.
              </p>
            </div>

            {/* Admin navigation for test evaluators */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              {onOpenAdminChallenge && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminChallenge();
                  }}
                  className="flex-1 py-2.5 px-4 bg-[#16A36A] hover:bg-[#128757] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Go to Admin View to Accept</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleFastTrackDemo}
                className="py-2.5 px-4 bg-[#F7FAF8] hover:bg-[#E1EBE5] border border-[#DCE6E0] text-[#182B26] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <span>Instant Demo Access</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-xs text-[#718078] hover:text-[#182B26] underline font-mono cursor-pointer"
            >
              Close and return to portal
            </button>
          </div>
        ) : (
          /* Registration Form */
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            
            <div className="p-3 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl flex items-start gap-2.5 text-[#718078] text-[11px] leading-relaxed">
              <Mail className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
              <div>
                Fill in your details below. Once submitted, your registration request will be set to <strong className="text-amber-700">"Pending"</strong>. Upon Admin approval, your login credentials will be automatically sent to your Gmail.
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Type: Recycler / Repairer */}
            <div>
              <label className="block text-[#182B26] font-semibold mb-1.5">
                Partner Type <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPartnerType('Recycler')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    partnerType === 'Recycler'
                      ? 'bg-[#B9F5D0]/30 border-[#16A36A] text-[#182B26] shadow-xs'
                      : 'bg-[#F7FAF8] border-[#DCE6E0] text-[#718078] hover:border-[#16A36A]/40'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-[#182B26]">
                    <Truck className="w-4 h-4 text-[#16A36A]" />
                    <span>Recycler</span>
                  </div>
                  <div className="text-[10px] text-[#718078] mt-1">
                    Accept pickups for smelting & material recovery
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPartnerType('Repairer')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    partnerType === 'Repairer'
                      ? 'bg-amber-50 border-amber-500 text-[#182B26] shadow-xs'
                      : 'bg-[#F7FAF8] border-[#DCE6E0] text-[#718078] hover:border-amber-400'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-[#182B26]">
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Repairer</span>
                  </div>
                  <div className="text-[10px] text-[#718078] mt-1">
                    Diagnose, refurbish & test citizen devices
                  </div>
                </button>
              </div>
            </div>

            {/* Shop Name */}
            <div>
              <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#718078]" />
                <span>Shop Name <span className="text-red-600">*</span></span>
              </label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder={partnerType === 'Recycler' ? 'e.g. GreenTech Smelting & E-Waste Solutions' : 'e.g. MicroFix Electronics Repair Lab'}
                className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
              />
            </div>

            {/* Contact Person Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-[#718078]" />
                  <span>Name (Contact Person) <span className="text-red-600">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Marcus Vance"
                  className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs box-border"
                />
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#718078]" />
                  <span>Email (Gmail for Credentials) <span className="text-red-600">*</span></span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. partner.business@gmail.com"
                  className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                />
              </div>
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#718078]" />
                  <span>Phone Number <span className="text-red-600">*</span></span>
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 345-6789"
                  className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                />
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#718078]" />
                  <span>Address <span className="text-red-600">*</span></span>
                </label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. 400 Industrial Pkwy, West Eco-Park"
                  className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs box-border"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleFastTrackDemo}
                className="text-xs text-[#16A36A] hover:underline font-mono cursor-pointer font-semibold"
              >
                ⚡ Fast-track with Demo Account
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-[#F7FAF8] hover:bg-[#E1EBE5] border border-[#DCE6E0] text-[#182B26] rounded-xl text-xs cursor-pointer font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-5 py-2.5 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
                  ) : (
                    <>
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Submit Registration Request</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
