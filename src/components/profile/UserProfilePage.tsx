import React, { useState, useEffect } from 'react';
import { User, PickupRequest } from '../../types';
import {
  getPickupRequests,
  getEcoTransactions,
  setStoredUser,
  formatRequestDateTime
} from '../../services/storage';
import { saveUserProfileToSupabase } from '../../services/supabase';
import { DeviceImageModal } from '../common/DeviceImageModal';
import {
  Award,
  Recycle,
  Leaf,
  MapPin,
  Phone,
  Mail,
  Edit3,
  Check,
  ExternalLink,
  QrCode,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  ChevronRight,
  LogOut,
  CheckCircle2,
  Image as ImageIcon,
  ZoomIn
} from 'lucide-react';

interface Props {
  currentUser: User;
  onViewTracking: (trackingId: string) => void;
  onOpenReceipt: (req: PickupRequest) => void;
  onGoToRewards: () => void;
  onOpenPickupModal: () => void;
  onSignOut: () => void;
}

export const UserProfilePage: React.FC<Props> = ({
  currentUser,
  onViewTracking,
  onOpenReceipt,
  onGoToRewards,
  onOpenPickupModal,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<'submissions' | 'transactions'>('submissions');
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [organization, setOrganization] = useState(currentUser.organization || '');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [previewReq, setPreviewReq] = useState<PickupRequest | null>(null);

  const userRequests = getPickupRequests().filter(r => r.userId === currentUser.id || r.userEmail === currentUser.email);
  const transactions = getEcoTransactions(currentUser.id);

  useEffect(() => {
    setName(currentUser.name);
    setPhone(currentUser.phone || '');
    setAddress(currentUser.address || '');
    setOrganization(currentUser.organization || '');
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: User = {
      ...currentUser,
      name: name.trim() || currentUser.name,
      phone: phone.trim() || currentUser.phone,
      address: address.trim() || currentUser.address,
      organization: organization.trim() || currentUser.organization
    };

    setStoredUser(updated);
    await saveUserProfileToSupabase(updated);
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getTier = (points: number) => {
    if (points >= 1000) return { name: 'Platinum Circular Guardian' };
    if (points >= 500) return { name: 'Gold Eco-Champion' };
    if (points >= 200) return { name: 'Silver Eco-Pioneer' };
    return { name: 'Bronze Citizen Recycler' };
  };

  const currentTier = getTier(currentUser.ecoPoints);

  const stages = [
    { key: 'submitted', label: 'Queued' },
    { key: 'verified', label: 'Verified' },
    { key: 'assigned', label: 'Assigned' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'collected', label: 'Collected' },
    { key: 'processing', label: 'Processing' },
    { key: 'completed', label: 'Certified' }
  ];

  const getStageIndex = (st: string) => {
    const idx = stages.findIndex(s => s.key === st);
    return idx === -1 ? (st === 'cancelled' ? -1 : 0) : idx;
  };

  return (
    <div className="w-full min-h-screen bg-[#F7FAF8] text-[#182B26] py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Profile Header Banner */}
        <div className="relative eco-card rounded-2xl p-6 sm:p-8 overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#123D32] text-[#B9F5D0] flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-sm shrink-0">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-[#718078] flex-wrap">
                  <span className="inline-flex items-center gap-1 font-semibold text-[#16A36A]">
                    <Award className="w-3.5 h-3.5" />
                    <span>{currentTier.name}</span>
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">ID: {currentUser.id}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono uppercase font-semibold text-[#123D32]">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-[#182B26] tracking-tight">
                  {currentUser.name}
                </h1>

                <div className="flex items-center gap-4 text-xs text-[#718078] flex-wrap font-mono">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-[#16A36A]" />
                    {currentUser.email}
                  </span>
                  {currentUser.phone && (
                    <span className="flex items-center gap-1 tabular-nums">
                      <Phone className="w-3.5 h-3.5 text-[#16A36A]" />
                      {currentUser.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#16A36A]" />
                    {currentUser.address || 'Doorstep Pickup Depot'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#182B26] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
              </button>
              <button
                onClick={onSignOut}
                className="px-4 py-2 bg-white hover:bg-red-50 border border-[#DCE6E0] hover:border-red-200 text-red-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {isEditing && (
            <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-[#E3ECE7] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-medium text-[#718078] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs text-[#182B26] focus:outline-none focus:border-[#16A36A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#718078] mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs text-[#182B26] focus:outline-none focus:border-[#16A36A] font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#718078] mb-1">Doorstep Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs text-[#182B26] focus:outline-none focus:border-[#16A36A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#718078] mb-1">Affiliation / Organization</label>
                <input
                  type="text"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs text-[#182B26] focus:outline-none focus:border-[#16A36A]"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs text-[#718078] hover:text-[#182B26] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          )}

          {saveSuccess && (
            <div className="mt-4 p-3 bg-[#B9F5D0]/35 border border-[#16A36A]/35 text-[#123D32] rounded-xl text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
              <span>Profile details successfully updated and synchronized!</span>
            </div>
          )}
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          <div className="p-6 eco-card rounded-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 text-[#B9F5D0]">
              <Award className="w-16 h-16" />
            </div>
            <div className="relative">
              <div className="flex items-center justify-between text-xs font-medium text-[#718078] mb-2">
                <span>Eco-Points Balance</span>
                <span className="text-[#16A36A] font-semibold">Live Wallet</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#182B26] font-mono tabular-nums tracking-tight">
                  {currentUser.ecoPoints}
                </span>
                <span className="text-sm font-mono text-[#16A36A] font-semibold">PTS</span>
              </div>
              <p className="text-xs text-[#718078] mt-2">
                Earned through certified doorstep pickups and drop-offs.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E3ECE7] flex items-center justify-between">
              <button
                onClick={onGoToRewards}
                className="text-xs text-[#16A36A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Redeem Rewards Catalog</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-[#718078] hover:text-[#182B26] font-mono cursor-pointer"
              >
                View Ledger
              </button>
            </div>
          </div>

          <div className="p-6 eco-card rounded-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 text-[#B9F5D0]">
              <Leaf className="w-16 h-16" />
            </div>
            <div className="relative">
              <div className="text-xs font-medium text-[#718078] mb-2">
                GHG Emissions Avoided
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#123D32] font-mono tabular-nums tracking-tight">
                  {currentUser.carbonSavedKg || (userRequests.length * 18.5).toFixed(1)}
                </span>
                <span className="text-sm font-mono text-[#16A36A] font-semibold">KG CO₂e</span>
              </div>
              <p className="text-xs text-[#718078] mt-2">
                Equivalent to planting ~{Math.round(((currentUser.carbonSavedKg || (userRequests.length * 18.5)) / 21.77) * 10) / 10} urban mature trees.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E3ECE7] flex items-center justify-between text-xs text-[#718078] font-mono">
              <span>UN SDG 12 & 13 Metric</span>
              <span className="text-[#16A36A] font-semibold">Verified</span>
            </div>
          </div>

          <div className="p-6 eco-card rounded-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-4 text-[#B9F5D0]">
              <Recycle className="w-16 h-16" />
            </div>
            <div className="relative">
              <div className="text-xs font-medium text-[#718078] mb-2">
                Hardware Units Diverted
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-extrabold text-[#182B26] font-mono tabular-nums tracking-tight">
                  {userRequests.reduce((acc, r) => acc + r.quantity, 0) || currentUser.devicesRecycled}
                </span>
                <span className="text-sm font-mono text-[#16A36A] font-semibold">UNITS</span>
              </div>
              <p className="text-xs text-[#718078] mt-2">
                Diverted from landfill into certified circular recycling streams.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E3ECE7]">
              <button
                onClick={onOpenPickupModal}
                className="w-full py-2.5 bg-[#123D32] hover:bg-[#0D2E25] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Recycle className="w-3.5 h-3.5 text-[#B9F5D0]" />
                <span>Submit Another E-Waste Item</span>
              </button>
            </div>
          </div>

        </div>

        {/* Tabs Switcher */}
        <div className="border-b border-[#DCE6E0] flex items-center gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('submissions')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'submissions'
                ? 'text-[#123D32] border-[#16A36A]'
                : 'text-[#718078] border-transparent hover:text-[#182B26]'
            }`}
          >
            <Recycle className="w-4 h-4 text-[#16A36A]" />
            <span>My E-Waste Submissions ({userRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 transition-colors border-b-2 flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'transactions'
                ? 'text-[#123D32] border-[#16A36A]'
                : 'text-[#718078] border-transparent hover:text-[#182B26]'
            }`}
          >
            <Award className="w-4 h-4 text-[#16A36A]" />
            <span>Eco-Points Wallet Ledger ({transactions.length})</span>
          </button>
        </div>

        {/* TAB 1: SUBMISSIONS HISTORY */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            {userRequests.length === 0 ? (
              <div className="p-12 text-center eco-card rounded-2xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F7FAF8] border border-[#DCE6E0] flex items-center justify-center mx-auto text-[#718078]">
                  <Recycle className="w-8 h-8 text-[#16A36A]" />
                </div>
                <h3 className="text-base font-bold text-[#182B26]">No e-waste submissions yet</h3>
                <p className="text-xs text-[#718078] max-w-md mx-auto">
                  Submit an e-waste recycle request for old laptops, smartphones, tablets, or batteries to start earning verified Eco-Points.
                </p>
                <button
                  onClick={onOpenPickupModal}
                  className="px-5 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2 shadow-sm cursor-pointer"
                >
                  <span>Submit First E-Waste Item</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {userRequests.map((req) => {
                  const currentStageIdx = getStageIndex(req.status);
                  const isCancelled = req.status === 'cancelled';
                  const uploadedPhoto = req.deviceImage || req.aiDiagnosis?.imageUrl;

                  return (
                    <div
                      key={req.id}
                      className="p-5 sm:p-6 eco-card rounded-2xl space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-start gap-4 min-w-0">
                          {uploadedPhoto && (
                            <button
                              type="button"
                              onClick={() => setPreviewReq(req)}
                              className="group relative w-16 h-16 rounded-xl overflow-hidden border border-[#DCE6E0] bg-[#F7FAF8] shrink-0 cursor-pointer"
                              title="View uploaded device photo"
                            >
                              <img
                                src={uploadedPhoto}
                                alt={`${req.brand} ${req.model}`}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              <span className="absolute inset-0 bg-[#123D32]/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ZoomIn className="w-3.5 h-3.5" />
                              </span>
                            </button>
                          )}

                          <div>
                            <div className="flex items-center gap-2 text-xs text-[#718078] flex-wrap">
                              <span className="font-mono font-bold text-[#123D32]">{req.id}</span>
                              <span aria-hidden="true">·</span>
                              <span className="font-mono tabular-nums">
                                {formatRequestDateTime(req.submittedAt || req.createdAt)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className={`font-mono uppercase font-bold ${
                                req.status === 'completed'
                                  ? 'text-[#16A36A]'
                                  : isCancelled
                                  ? 'text-red-600'
                                  : 'text-[#123D32]'
                              }`}>
                                {req.status}
                              </span>
                            </div>

                            <h3 className="text-base font-bold text-[#182B26] mt-1.5">
                              {req.quantity}x {req.brand} {req.model}
                            </h3>
                            <p className="text-xs text-[#718078] font-mono mt-0.5">
                              Category: {req.deviceCategory} · Condition: {req.condition.replace('_', ' ')} · Pickup: {req.pickupType === 'home_pickup' ? 'Doorstep Collection' : 'Centre Drop-Off'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 flex-wrap">
                          {uploadedPhoto && (
                            <button
                              type="button"
                              onClick={() => setPreviewReq(req)}
                              className="px-3 py-1.5 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] text-[#123D32] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-[#16A36A]" />
                              <span>Photo</span>
                            </button>
                          )}
                          <button
                            onClick={() => onOpenReceipt(req)}
                            className="px-3 py-1.5 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#182B26] text-xs font-mono rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="View Digital QR Receipt"
                          >
                            <QrCode className="w-3.5 h-3.5 text-[#16A36A]" />
                            <span>QR Receipt</span>
                          </button>
                          <button
                            onClick={() => onViewTracking(req.id)}
                            className="px-3.5 py-1.5 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Track Custody</span>
                          </button>
                        </div>
                      </div>

                      {!isCancelled && (
                        <div className="pt-3 border-t border-[#E3ECE7]">
                          <div className="text-[11px] font-mono text-[#718078] mb-2 flex items-center justify-between">
                            <span>7-Stage Chain of Custody</span>
                            <span className="text-[#16A36A] font-bold">
                              Stage {currentStageIdx + 1} of 7: {stages[currentStageIdx]?.label}
                            </span>
                          </div>

                          <div className="grid grid-cols-7 gap-1">
                            {stages.map((st, i) => {
                              const isDone = i <= currentStageIdx;
                              const isCurrent = i === currentStageIdx;

                              return (
                                <div key={st.key} className="space-y-1">
                                  <div
                                    className={`h-2 rounded-full transition-all ${
                                      isDone ? 'bg-[#16A36A]' : 'bg-[#E3ECE7]'
                                    }`}
                                  />
                                  <span className={`block text-[9px] font-mono truncate text-center ${
                                    isCurrent ? 'text-[#123D32] font-bold' : isDone ? 'text-[#718078]' : 'text-[#A0AEA6]'
                                  }`}>
                                    {st.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between text-xs font-mono text-[#718078] flex-wrap gap-2">
                        <span className="flex items-center gap-1 text-[#16A36A] font-semibold tabular-nums">
                          <Award className="w-3.5 h-3.5" />
                          <span>+{req.ecoPointsAwarded} Eco-Points Awarded</span>
                        </span>
                        <span className="tabular-nums">Estimated Weight: {req.estimatedWeightKg} kg</span>
                        {req.assignedPartnerName && (
                          <span className="text-[#182B26]">Partner: {req.assignedPartnerName}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TRANSACTIONS WALLET LEDGER */}
        {activeTab === 'transactions' && (
          <div className="p-6 eco-card rounded-2xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3ECE7]">
              <div>
                <h3 className="text-base font-bold text-[#182B26]">Eco-Points Ledger</h3>
                <p className="text-xs text-[#718078] font-mono mt-0.5">
                  Full immutable record of points credited and redeemed.
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-[#718078] block">Current Balance</span>
                <span className="text-lg font-bold text-[#16A36A] font-mono tabular-nums">
                  {currentUser.ecoPoints} PTS
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {transactions.map((tx) => {
                const isCredit = tx.type === 'credit';
                return (
                  <div
                    key={tx.id}
                    className="p-3.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl flex items-center justify-between gap-4 hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                        isCredit
                          ? 'bg-[#B9F5D0]/40 border-[#16A36A]/30 text-[#123D32]'
                          : 'bg-red-50 border-red-200 text-red-600'
                      }`}>
                        {isCredit ? <ArrowDownLeft className="w-4 h-4 text-[#16A36A]" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#182B26]">{tx.reason}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#718078] mt-0.5 tabular-nums">
                          <Clock className="w-3 h-3 text-[#16A36A]" />
                          <span>{tx.createdAt}</span>
                          {tx.referenceId && (
                            <span>· Ref: {tx.referenceId}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={`font-mono font-bold text-sm shrink-0 tabular-nums ${
                      isCredit ? 'text-[#16A36A]' : 'text-red-600'
                    }`}>
                      {isCredit ? `+${tx.amount}` : `-${tx.amount}`} PTS
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      <DeviceImageModal
        isOpen={Boolean(previewReq)}
        onClose={() => setPreviewReq(null)}
        imageUrl={previewReq?.deviceImage || previewReq?.aiDiagnosis?.imageUrl}
        imageName={previewReq?.deviceImageName}
        title={previewReq ? `${previewReq.quantity}x ${previewReq.brand} ${previewReq.model}` : undefined}
        requestId={previewReq?.id}
        submittedAt={previewReq?.submittedAt || previewReq?.createdAt}
        citizenName={previewReq?.userName}
      />

    </div>
  );
};
