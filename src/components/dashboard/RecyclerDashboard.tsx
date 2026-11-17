import React, { useState, useEffect } from 'react';
import { User, PickupRequest, TrackingStage } from '../../types';
import {
  getPickupRequests,
  updateRequestStatus,
  syncRequestsWithSupabase,
  formatRequestDateTime
} from '../../services/storage';
import { DeviceImageModal } from '../common/DeviceImageModal';
import {
  CheckCircle2,
  ChevronRight,
  Scale,
  ShieldCheck,
  AlertCircle,
  Clock,
  Recycle,
  Inbox,
  User as UserIcon,
  Phone,
  MapPin,
  Calendar,
  Check,
  RefreshCw,
  Image as ImageIcon,
  ZoomIn
} from 'lucide-react';

interface Props {
  currentUser: User;
  onOpenReceipt: (req: PickupRequest) => void;
  onViewTracking: (id: string) => void;
}

export const RecyclerDashboard: React.FC<Props> = ({ currentUser, onOpenReceipt, onViewTracking }) => {
  const [requests, setRequests] = useState<PickupRequest[]>(getPickupRequests());
  const [selectedStatusTab, setSelectedStatusTab] = useState<'incoming' | 'assigned' | 'collected' | 'completed' | 'all'>('incoming');
  const [viewScope, setViewScope] = useState<'recycle' | 'all'>('recycle');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [weightInput, setWeightInput] = useState<Record<string, number>>({});
  const [actionFeedback, setActionFeedback] = useState<string>('');
  const [previewReq, setPreviewReq] = useState<PickupRequest | null>(null);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await syncRequestsWithSupabase();
    setRequests(getPickupRequests());
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    const handleUpdate = () => {
      setRequests(getPickupRequests());
    };
    window.addEventListener('ecycle_state_updated', handleUpdate);
    syncRequestsWithSupabase().then(() => handleUpdate()).catch(() => {});

    const pollInterval = setInterval(() => {
      syncRequestsWithSupabase().then(() => handleUpdate()).catch(() => {});
    }, 3000);

    return () => {
      window.removeEventListener('ecycle_state_updated', handleUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  const recyclerRequests = requests.filter(r =>
    !r.disposalPreference || r.disposalPreference === 'recycle' || r.disposalPreference === 'donation'
  );

  const activeScopeRequests = viewScope === 'recycle' ? recyclerRequests : requests;

  const incomingRequests = activeScopeRequests.filter(r => r.status === 'submitted' || r.status === 'verified');
  const assignedRequests = activeScopeRequests.filter(r => r.status === 'assigned' || r.status === 'scheduled');
  const processingRequests = activeScopeRequests.filter(r => r.status === 'collected' || r.status === 'processing');
  const completedRequests = activeScopeRequests.filter(r => r.status === 'completed');

  const filteredRequests = activeScopeRequests.filter(r => {
    if (selectedStatusTab === 'incoming') return r.status === 'submitted' || r.status === 'verified';
    if (selectedStatusTab === 'assigned') return r.status === 'assigned' || r.status === 'scheduled';
    if (selectedStatusTab === 'collected') return r.status === 'collected' || r.status === 'processing';
    if (selectedStatusTab === 'completed') return r.status === 'completed';
    return true;
  });

  const handleAdvanceStatus = (req: PickupRequest, nextStage: TrackingStage) => {
    const verifiedKg = weightInput[req.id] !== undefined ? weightInput[req.id] : req.estimatedWeightKg;
    const note =
      nextStage === 'assigned'
        ? `Your request has been accepted by ${currentUser.organization || 'GreenTech Certified Recyclers'}.`
        : nextStage === 'scheduled'
        ? `Your request has been assigned to our logistics collection crew. Pickup scheduled for ${req.preferredDate} (${req.timeSlot}).`
        : nextStage === 'collected'
        ? `Your device has been collected from your doorstep by our collection crew.`
        : nextStage === 'processing'
        ? `Your device is being processed at our R2 facility. Verified weight: ${verifiedKg} kg. High-temperature metal extraction underway.`
        : nextStage === 'completed'
        ? `Your recycling has been certified! Recycled materials verified and Eco-Points awarded to your account.`
        : undefined;

    updateRequestStatus(req.id, nextStage, note, verifiedKg, currentUser.organization || 'GreenTech Certified Recyclers Ltd');

    const feedbackTitle =
      nextStage === 'assigned' ? 'Your request has been accepted' :
      nextStage === 'scheduled' ? 'Your request has been assigned to crew' :
      nextStage === 'collected' ? 'Your device has been collected' :
      nextStage === 'processing' ? 'Your device is being processed' :
      nextStage === 'completed' ? 'Your recycling has been certified' : nextStage;

    setActionFeedback(`Request ${req.id} advanced! Citizen notified: "${feedbackTitle}"`);
    setTimeout(() => setActionFeedback(''), 4500);
  };

  const getNextStage = (curr: TrackingStage): { next: TrackingStage; label: string; primary?: boolean } | null => {
    switch (curr) {
      case 'submitted':
      case 'verified':
        return { next: 'assigned', label: 'Accept Request', primary: true };
      case 'assigned':
        return { next: 'scheduled', label: 'Assign to Crew & Schedule Pickup', primary: true };
      case 'scheduled':
        return { next: 'collected', label: 'Confirm Hardware Collected from Doorstep', primary: true };
      case 'collected':
        return { next: 'processing', label: 'Start De-manufacturing & Smelting' };
      case 'processing':
        return { next: 'completed', label: 'Certify R2 Recovery & Award Eco-Points', primary: true };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="p-6 eco-card rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-[#718078] flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#123D32]">
              <Recycle className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Recycler Operations Portal · R2v3 / ISO 14001</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">ID: {currentUser.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182B26] mt-1 tracking-tight">
            {currentUser.organization || 'GreenTech Certified Recyclers Ltd'}
          </h1>
          <p className="text-xs text-[#718078] mt-1 font-mono">
            R2v3 Certified Processor #R2-2026-991 · CPCB Authorized E-Waste Smelter & Logistics Dispatch
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] rounded-xl text-xs font-semibold text-[#123D32] cursor-pointer disabled:opacity-60 transition-colors whitespace-nowrap"
            title="Fetch latest citizen requests from server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#16A36A] ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Queue'}</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#B9F5D0]/35 border border-[#16A36A]/25 rounded-xl text-xs font-mono font-semibold text-[#123D32] tabular-nums">
            <ShieldCheck className="w-4 h-4 text-[#16A36A] shrink-0" />
            <span>Queue: {incomingRequests.length} Pending ({recyclerRequests.length} Total)</span>
          </div>
        </div>
      </div>

      {/* Real-time incoming requests alert banner */}
      {incomingRequests.length > 0 && (
        <div className="p-4 bg-[#123D32] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#16A36A]/25 border border-[#B9F5D0]/30 flex items-center justify-center text-[#B9F5D0] shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {incomingRequests.length} New Citizen Recycle Request{incomingRequests.length > 1 ? 's' : ''} Received
              </h4>
              <p className="text-xs text-[#D3E4DA] mt-0.5">
                Citizens have submitted e-waste for certified recycling. Review attached device photos, submission timestamps, and accept requests below.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedStatusTab('incoming')}
            className="px-4 py-2 bg-[#16A36A] hover:bg-[#19B577] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors whitespace-nowrap"
          >
            <span>Review Incoming</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionFeedback && (
        <div className="p-3.5 bg-[#B9F5D0]/35 border border-[#16A36A]/35 rounded-xl text-[#123D32] text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#16A36A] shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Recycler KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Incoming Pending</div>
          <div className="text-3xl font-bold text-[#123D32] font-mono tabular-nums mt-1">{incomingRequests.length}</div>
          <div className="text-[11px] text-[#718078] mt-1">Awaiting recycler acceptance</div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Active In Logistics/Smelter</div>
          <div className="text-3xl font-bold text-[#16A36A] font-mono tabular-nums mt-1">
            {assignedRequests.length + processingRequests.length}
          </div>
          <div className="text-[11px] text-[#718078] mt-1">In transit & component recovery</div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Certified Recycled</div>
          <div className="text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">
            {completedRequests.length}
          </div>
          <div className="text-[11px] text-[#718078] mt-1">Closed circular chain of custody</div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Critical Metals Yield</div>
          <div className="text-3xl font-bold text-[#123D32] font-mono tabular-nums mt-1">98.4%</div>
          <div className="text-[11px] text-[#718078] mt-1">Gold & Copper recovery purity</div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="eco-card rounded-2xl overflow-hidden">
        
        <div className="p-5 border-b border-[#E3ECE7] flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#182B26] flex items-center gap-2">
                <Recycle className="w-4 h-4 text-[#16A36A]" />
                <span>Certified Recycler Intake & Logistics Queue</span>
              </h2>
              <p className="text-xs text-[#718078] mt-0.5">
                Showing {viewScope === 'recycle' ? 'requests routed to Recycler' : 'all platform citizen requests'} ({activeScopeRequests.length} total)
              </p>
            </div>

            {/* Scope Toggle: Recycle vs All */}
            <div className="flex items-center gap-1 p-1 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setViewScope('recycle')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  viewScope === 'recycle' ? 'bg-white text-[#123D32] shadow-sm font-semibold' : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                Recycler ({recyclerRequests.length})
              </button>
              <button
                onClick={() => setViewScope('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  viewScope === 'all' ? 'bg-white text-[#123D32] shadow-sm font-semibold' : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                All Platform ({requests.length})
              </button>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setSelectedStatusTab('incoming')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedStatusTab === 'incoming'
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Incoming ({incomingRequests.length})</span>
            </button>
            <button
              onClick={() => setSelectedStatusTab('assigned')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedStatusTab === 'assigned'
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              Assigned / Route ({assignedRequests.length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('collected')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedStatusTab === 'collected'
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              In Processing ({processingRequests.length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedStatusTab === 'completed'
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              Completed ({completedRequests.length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedStatusTab === 'all'
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              All ({activeScopeRequests.length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-[#E3ECE7] text-xs">
          {filteredRequests.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <Recycle className="w-10 h-10 text-[#718078] mx-auto" />
              <div className="font-bold text-[#182B26] text-sm">No requests in this status view</div>
              <p className="text-[#718078] text-xs max-w-md mx-auto">
                {selectedStatusTab === 'incoming'
                  ? `No new incoming requests waiting for initial triage right now. You have ${activeScopeRequests.length} total request(s) registered in the platform.`
                  : `No requests currently marked as ${selectedStatusTab.toUpperCase()}.`}
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedStatusTab('all')}
                  className="px-3.5 py-1.5 bg-[#F7FAF8] hover:bg-[#EDF3EF] border border-[#DCE6E0] text-[#182B26] rounded-lg text-xs font-semibold cursor-pointer"
                >
                  View All Requests ({activeScopeRequests.length})
                </button>
                <button
                  onClick={handleManualRefresh}
                  className="px-3.5 py-1.5 bg-[#16A36A] hover:bg-[#128757] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>
          ) : (
            filteredRequests.map((req) => {
              const nextAction = getNextStage(req.status);
              const isIncoming = req.status === 'submitted' || req.status === 'verified';
              const uploadedPhoto = req.deviceImage || req.aiDiagnosis?.imageUrl;

              return (
                <div
                  key={req.id}
                  className={`p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-colors ${
                    isIncoming ? 'bg-[#B9F5D0]/15 hover:bg-[#B9F5D0]/25' : 'hover:bg-[#F7FAF8]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 flex-1 min-w-0">
                    {/* Citizen Uploaded Image Thumbnail */}
                    {uploadedPhoto ? (
                      <button
                        type="button"
                        onClick={() => setPreviewReq(req)}
                        className="group relative w-24 h-24 rounded-xl overflow-hidden border border-[#DCE6E0] bg-[#F7FAF8] shrink-0 cursor-pointer shadow-sm"
                        title="Click to inspect full citizen device photo"
                      >
                        <img
                          src={uploadedPhoto}
                          alt={`${req.brand} ${req.model}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <span className="absolute inset-0 bg-[#123D32]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold gap-1">
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </span>
                      </button>
                    ) : (
                      <div className="w-24 h-24 rounded-xl border border-dashed border-[#DCE6E0] bg-[#F7FAF8] shrink-0 flex flex-col items-center justify-center text-[#718078] gap-1 text-center px-2">
                        <ImageIcon className="w-4 h-4 opacity-60" />
                        <span className="text-[10px] leading-tight">No photo attached</span>
                      </div>
                    )}

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-xs text-[#718078] flex-wrap">
                        <span className="font-mono font-bold text-[#123D32]">{req.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-semibold uppercase text-[#16A36A]">{req.status.replace('_', ' ')}</span>
                        <span aria-hidden="true">·</span>
                        <span>Routed to Recycler</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 font-mono text-[#182B26] font-medium tabular-nums">
                          <Clock className="w-3 h-3 text-[#16A36A]" />
                          Submitted: {formatRequestDateTime(req.submittedAt || req.createdAt)}
                        </span>
                      </div>

                      <div className="font-bold text-[#182B26] text-base">
                        {req.quantity}x {req.brand} {req.model}
                        <span className="text-xs font-normal text-[#718078] ml-2">
                          ({req.deviceCategory})
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[#182B26] text-xs">
                        <div className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-[#718078] shrink-0" />
                          <span>Citizen: {req.userName}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono tabular-nums">
                          <Phone className="w-3.5 h-3.5 text-[#718078] shrink-0" />
                          <span>{req.userPhone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:col-span-2 text-[#718078]">
                          <MapPin className="w-3.5 h-3.5 text-[#718078] shrink-0" />
                          <span>Address: {req.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5 sm:col-span-2 text-[#718078] tabular-nums">
                          <Calendar className="w-3.5 h-3.5 text-[#718078] shrink-0" />
                          <span>
                            Pickup Schedule: {req.preferredDate} ({req.timeSlot}) · {req.pickupType === 'home_pickup' ? 'Doorstep Collection' : 'Depot Drop-off'}
                          </span>
                        </div>
                      </div>

                      {req.notes && (
                        <div className="text-[11px] text-[#718078] bg-[#F7FAF8] p-2.5 rounded-lg border border-[#E3ECE7]">
                          <span className="font-semibold text-[#182B26]">Citizen Note:</span> {req.notes}
                        </div>
                      )}

                      {req.condition === 'hazardous' && (
                        <div className="inline-flex items-center gap-1.5 text-amber-700 font-medium text-[11px] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>HAZARDOUS: Priority battery handling & UN-box dispatch required</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recycler Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                    
                    {uploadedPhoto && (
                      <button
                        type="button"
                        onClick={() => setPreviewReq(req)}
                        className="px-3 py-2 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] text-[#123D32] font-semibold rounded-xl text-xs transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#16A36A]" />
                        <span>View Photo</span>
                      </button>
                    )}

                    {req.status !== 'completed' && req.status !== 'cancelled' && (
                      <div className="flex items-center gap-1.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl px-2.5 py-2">
                        <Scale className="w-3.5 h-3.5 text-[#718078]" />
                        <input
                          type="number"
                          step="0.1"
                          placeholder={`${req.estimatedWeightKg}`}
                          value={weightInput[req.id] !== undefined ? weightInput[req.id] : ''}
                          onChange={(e) => setWeightInput({ ...weightInput, [req.id]: parseFloat(e.target.value) || 0 })}
                          className="w-14 bg-transparent text-[#182B26] font-mono text-xs focus:outline-none tabular-nums"
                        />
                        <span className="text-[#718078] font-mono text-[11px]">kg</span>
                      </div>
                    )}

                    {nextAction && (
                      <button
                        onClick={() => handleAdvanceStatus(req, nextAction.next)}
                        className={`px-4 py-2.5 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer whitespace-nowrap ${
                          nextAction.primary
                            ? 'bg-[#16A36A] hover:bg-[#128757] text-white'
                            : 'bg-[#123D32] hover:bg-[#0D2E25] text-white'
                        }`}
                      >
                        <Check className="w-4 h-4" />
                        <span>{nextAction.label}</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewTracking(req.id)}
                      className="px-3 py-2 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#182B26] font-medium rounded-xl text-xs transition-colors cursor-pointer text-center whitespace-nowrap"
                    >
                      Track Chain
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
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
