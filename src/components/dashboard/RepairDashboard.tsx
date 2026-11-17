import React, { useState, useEffect } from 'react';
import { User, PickupRequest, TrackingStage } from '../../types';
import {
  getPickupRequests,
  updateRequestStatus,
  addMarketplaceItem,
  syncRequestsWithSupabase,
  formatRequestDateTime
} from '../../services/storage';
import { DeviceImageModal } from '../common/DeviceImageModal';
import {
  Wrench,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  ShoppingBag,
  Clock,
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
  onExploreMarketplace?: () => void;
}

export const RepairDashboard: React.FC<Props> = ({
  currentUser,
  onOpenReceipt,
  onViewTracking,
  onExploreMarketplace = () => {}
}) => {
  const [requests, setRequests] = useState<PickupRequest[]>(getPickupRequests());
  const [selectedTab, setSelectedTab] = useState<'incoming' | 'in_bench' | 'completed' | 'all'>('incoming');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string>('');
  const [listingSuccess, setListingSuccess] = useState<string>('');
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

  const repairRequests = requests.filter(r =>
    r.disposalPreference === 'repair' || r.disposalPreference === 'refurbish'
  );

  const incomingRequests = repairRequests.filter(r => r.status === 'submitted' || r.status === 'verified');
  const inBenchRequests = repairRequests.filter(r =>
    r.status === 'assigned' || r.status === 'scheduled' || r.status === 'collected' || r.status === 'processing'
  );
  const completedRequests = repairRequests.filter(r => r.status === 'completed');

  const displayedRequests = repairRequests.filter(r => {
    if (selectedTab === 'incoming') return r.status === 'submitted' || r.status === 'verified';
    if (selectedTab === 'in_bench') return r.status === 'assigned' || r.status === 'scheduled' || r.status === 'collected' || r.status === 'processing';
    if (selectedTab === 'completed') return r.status === 'completed';
    return true;
  });

  const handleAdvanceStatus = (req: PickupRequest, nextStage: TrackingStage) => {
    const note =
      nextStage === 'assigned'
        ? `Your request has been accepted by ${currentUser.organization || 'MicroFix Hardware Diagnostics Lab'}.`
        : nextStage === 'scheduled'
        ? `Your request has been assigned to our collection crew for doorstep pickup.`
        : nextStage === 'collected'
        ? `Your device has been collected and received by our diagnostics team.`
        : nextStage === 'processing'
        ? 'Your device is being processed: Diagnostics, power delivery testing, and component repair underway.'
        : nextStage === 'completed'
        ? 'Your repair has been certified and completed! Eco-Points credited to your account.'
        : undefined;

    updateRequestStatus(
      req.id,
      nextStage,
      note,
      req.verifiedWeightKg || req.estimatedWeightKg,
      currentUser.organization || 'MicroFix Hardware Diagnostics Lab'
    );

    const feedbackTitle =
      nextStage === 'assigned' ? 'Your request has been accepted' :
      nextStage === 'scheduled' ? 'Your request has been assigned to crew' :
      nextStage === 'collected' ? 'Your device has been collected' :
      nextStage === 'processing' ? 'Your device is being processed' :
      nextStage === 'completed' ? 'Your repair has been certified' : nextStage;

    setActionFeedback(`Repair request ${req.id} advanced! Citizen notified: "${feedbackTitle}"`);
    setTimeout(() => setActionFeedback(''), 4500);
  };

  const handleListOnMarketplace = (req: PickupRequest) => {
    addMarketplaceItem({
      title: `Certified Restored ${req.brand} ${req.model}`,
      category: req.deviceCategory,
      price: req.deviceCategory === 'Laptops' ? 240 : req.deviceCategory === 'Smartphones & Tablets' ? 140 : 75,
      condition: 'refurbished_grade_a',
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerRole: 'Certified Refurbisher',
      location: 'University Tech Mall, Lab 4B',
      description: `Professionally restored and bench-tested by ${currentUser.organization || 'MicroFix Hardware Diagnostics Lab'}. Cleaned with 90-day hardware warranty. Avoided e-waste lifecycle emissions.`,
      specs: [
        '90-Day Hardware Warranty included',
        'NIST SP 800-88 Data Sanitized',
        'OEM Battery Tested (>90% health)'
      ],
      warrantyDays: 90
    });

    setListingSuccess(`Published ${req.brand} ${req.model} to the Reuse & Repair Marketplace!`);
    setTimeout(() => setListingSuccess(''), 4500);
  };

  const getNextStage = (curr: TrackingStage): { next: TrackingStage; label: string; primary?: boolean } | null => {
    switch (curr) {
      case 'submitted':
      case 'verified':
        return { next: 'assigned', label: 'Accept Repair Request', primary: true };
      case 'assigned':
        return { next: 'scheduled', label: 'Assign to Crew & Schedule Pickup', primary: true };
      case 'scheduled':
        return { next: 'collected', label: 'Confirm Hardware Collected by Crew', primary: true };
      case 'collected':
        return { next: 'processing', label: 'Start Component Diagnostics & Repair' };
      case 'processing':
        return { next: 'completed', label: 'Certify Restored & Release Eco-Points', primary: true };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="p-6 eco-card rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-[#718078] flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#123D32]">
              <Wrench className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Certified Repair & Refurbish Hub · NIST SP 800-88</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">ID: {currentUser.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182B26] mt-1 tracking-tight">
            {currentUser.organization || 'MicroFix Hardware Diagnostics Lab'}
          </h1>
          <p className="text-xs text-[#718078] mt-1 font-mono">
            NIST SP 800-88 Component Testing Facility · Right-to-Repair Verified Circular Station
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
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh Bench'}</span>
          </button>

          <div className="flex items-center gap-2 px-3.5 py-2 bg-[#B9F5D0]/35 border border-[#16A36A]/25 rounded-xl text-xs font-mono font-semibold text-[#123D32] tabular-nums">
            <ShieldCheck className="w-4 h-4 text-[#16A36A] shrink-0" />
            <span>Bench: {incomingRequests.length} Pending ({repairRequests.length} Total)</span>
          </div>
        </div>
      </div>

      {/* Real-time incoming repair requests banner */}
      {incomingRequests.length > 0 && (
        <div className="p-4 bg-[#123D32] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#16A36A]/25 border border-[#B9F5D0]/30 flex items-center justify-center text-[#B9F5D0] shrink-0">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">
                {incomingRequests.length} New Citizen Repair Request{incomingRequests.length > 1 ? 's' : ''} Received
              </h4>
              <p className="text-xs text-[#D3E4DA] mt-0.5">
                Citizens have requested hardware diagnostic testing and repair. Inspect uploaded photos and accept jobs below.
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedTab('incoming')}
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

      {listingSuccess && (
        <div className="p-3.5 bg-[#B9F5D0]/35 border border-[#16A36A]/35 rounded-xl text-[#123D32] text-xs font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#16A36A] shrink-0" />
          <span>{listingSuccess}</span>
        </div>
      )}

      {/* Repair KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Incoming Repair Queue</div>
          <div className="text-3xl font-bold text-[#123D32] font-mono tabular-nums mt-1">{incomingRequests.length}</div>
          <div className="text-[11px] text-[#718078] mt-1">Awaiting repair intake</div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Active Diagnostics Bench</div>
          <div className="text-3xl font-bold text-[#16A36A] font-mono tabular-nums mt-1">{inBenchRequests.length}</div>
          <div className="text-[11px] text-[#718078] mt-1">Under component testing</div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Successfully Restored</div>
          <div className="text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">{completedRequests.length}</div>
          <div className="text-[11px] text-[#718078] mt-1">Passed burn-in testing</div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Repair Success Rate</div>
          <div className="text-3xl font-bold text-[#123D32] font-mono tabular-nums mt-1">92.6%</div>
          <div className="text-[11px] text-[#718078] mt-1">Components saved from shredding</div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="eco-card rounded-2xl overflow-hidden">
        
        <div className="p-5 border-b border-[#E3ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#182B26] flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#16A36A]" />
              <span>Hardware Diagnostics & Repair Lab Queue</span>
            </h2>
            <p className="text-xs text-[#718078] mt-0.5">
              Showing requests routed to Repairer ({repairRequests.length} total)
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs font-medium overflow-x-auto">
            <button
              onClick={() => setSelectedTab('incoming')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                selectedTab === 'incoming'
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Incoming Requests ({incomingRequests.length})</span>
            </button>
            <button
              onClick={() => setSelectedTab('in_bench')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedTab === 'in_bench'
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              On Bench ({inBenchRequests.length})
            </button>
            <button
              onClick={() => setSelectedTab('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedTab === 'completed'
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              Restored ({completedRequests.length})
            </button>
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                selectedTab === 'all'
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              All ({repairRequests.length})
            </button>
          </div>
        </div>

        {/* Requests List */}
        <div className="divide-y divide-[#E3ECE7] text-xs">
          {displayedRequests.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <Wrench className="w-10 h-10 text-[#718078] mx-auto" />
              <div className="font-bold text-[#182B26] text-sm">No repair requests in this view</div>
              <p className="text-[#718078] text-xs">
                {selectedTab === 'incoming'
                  ? 'No pending citizen repair requests awaiting intake right now.'
                  : 'Switch tabs above to inspect active diagnostics or restored devices.'}
              </p>
            </div>
          ) : (
            displayedRequests.map((req) => {
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
                        <span>Routed to Repairer</span>
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
                          <span className="font-semibold text-[#182B26]">Citizen Problem Description:</span> {req.notes}
                        </div>
                      )}

                      {req.condition === 'hazardous' && (
                        <div className="inline-flex items-center gap-1.5 text-amber-700 font-medium text-[11px] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>HAZARDOUS: Priority battery isolation & explosion safe box required</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Repair Controls */}
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

                    {req.status === 'completed' && (
                      <button
                        onClick={() => handleListOnMarketplace(req)}
                        className="px-3.5 py-2.5 bg-[#B9F5D0]/40 hover:bg-[#B9F5D0]/60 border border-[#16A36A]/35 text-[#123D32] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#16A36A]" />
                        <span>List on Marketplace</span>
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
