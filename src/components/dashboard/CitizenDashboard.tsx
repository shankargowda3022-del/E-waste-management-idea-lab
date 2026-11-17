import React, { useState, useEffect } from 'react';
import { User, PickupRequest, UserNotification } from '../../types';
import {
  getPickupRequests,
  cancelPickupRequest,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  syncRequestsWithSupabase,
  formatRequestDateTime
} from '../../services/storage';
import { DeviceImageModal } from '../common/DeviceImageModal';
import {
  Recycle,
  Award,
  Clock,
  FileText,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  MapPin,
  Wrench,
  ShieldCheck,
  TrendingUp,
  Bell,
  Truck,
  Check,
  CheckCheck,
  Image as ImageIcon,
  ZoomIn
} from 'lucide-react';

interface Props {
  currentUser: User;
  onOpenPickupModal: (preference?: 'recycle' | 'repair') => void;
  onViewTracking: (trackingId: string) => void;
  onOpenReceipt: (req: PickupRequest) => void;
  onGoToRewards: () => void;
  onOpenAssistant?: () => void;
  onExploreMarketplace?: () => void;
  onExploreCentres?: () => void;
  onOpenPrivacy?: () => void;
  onOpenAnalytics?: () => void;
}

export const CitizenDashboard: React.FC<Props> = ({
  currentUser,
  onOpenPickupModal,
  onViewTracking,
  onOpenReceipt,
  onGoToRewards,
  onOpenAssistant = () => {},
  onExploreMarketplace = () => {},
  onExploreCentres = () => {},
  onOpenPrivacy = () => {},
  onOpenAnalytics = () => {}
}) => {
  const [requests, setRequests] = useState<PickupRequest[]>(() =>
    getPickupRequests().filter(r => r.userId === currentUser.id)
  );
  const [notifications, setNotifications] = useState<UserNotification[]>(() =>
    getUserNotifications(currentUser.id)
  );
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [previewReq, setPreviewReq] = useState<PickupRequest | null>(null);

  useEffect(() => {
    const refreshData = () => {
      setRequests(getPickupRequests().filter(r => r.userId === currentUser.id));
      setNotifications(getUserNotifications(currentUser.id));
    };

    window.addEventListener('ecycle_state_updated', refreshData);
    syncRequestsWithSupabase().then(() => refreshData()).catch(() => {});

    const pollInterval = setInterval(() => {
      syncRequestsWithSupabase().then(() => refreshData()).catch(() => {});
    }, 4000);

    return () => {
      window.removeEventListener('ecycle_state_updated', refreshData);
      clearInterval(pollInterval);
    };
  }, [currentUser.id]);

  const pendingRequests = requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled');
  const completedRequests = requests.filter(r => r.status === 'completed');

  const displayedRequests = requests.filter(r => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return r.status !== 'completed' && r.status !== 'cancelled';
    if (filterStatus === 'completed') return r.status === 'completed';
    return true;
  });

  const handleCancel = (id: string) => {
    if (window.confirm('Cancel this pending pickup request?')) {
      cancelPickupRequest(id, 'Cancelled from citizen dashboard');
    }
  };

  const recentActivities = [
    { text: 'Completed hardware triage for Lenovo ThinkPad T480', time: 'Yesterday', icon: Sparkles, color: 'text-[#16A36A]' },
    { text: 'Awarded 120 Eco-Points for verified Samsung Galaxy S10 drop-off', time: '3 days ago', icon: Award, color: 'text-amber-600' },
    { text: 'Unlocked "First Spark" certified recycling achievement', time: '5 days ago', icon: CheckCircle2, color: 'text-[#123D32]' }
  ];

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner & Quick Action */}
      <div className="p-6 eco-card rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-[#718078] flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#123D32]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Clearance Level 1 · Verified Citizen</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">ID: {currentUser.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182B26] mt-1 tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-[#718078] mt-1 font-mono">
            {currentUser.organization || 'Campus Community Resident'} · {currentUser.address}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => onOpenPickupModal('recycle')}
            className="px-4 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <Recycle className="w-4 h-4" />
            <span>Recycle E-Waste</span>
          </button>

          <button
            onClick={() => onOpenPickupModal('repair')}
            className="px-4 py-2.5 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] hover:border-[#123D32]/40 text-[#123D32] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Wrench className="w-4 h-4 text-[#16A36A]" />
            <span>Book Repair Service</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Devices Recycled</div>
          <div className="text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">
            {currentUser.devicesRecycled} <span className="text-sm font-normal text-[#718078]">units</span>
          </div>
          <div className="text-[11px] text-[#718078] mt-1">Verified handovers</div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Eco-Points Balance</div>
          <div className="text-3xl font-bold text-[#16A36A] font-mono tabular-nums mt-1">
            {currentUser.ecoPoints} <span className="text-sm font-normal text-[#123D32]">pts</span>
          </div>
          <button
            onClick={onGoToRewards}
            className="text-[11px] text-[#16A36A] font-semibold mt-1 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>Redeem rewards</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Avoided Lifecycle CO2</div>
          <div className="text-3xl font-bold text-[#123D32] font-mono tabular-nums mt-1">
            {currentUser.carbonSavedKg} <span className="text-sm font-normal text-[#718078]">kg CO2e</span>
          </div>
          <button
            onClick={onOpenAnalytics}
            className="text-[11px] text-[#123D32] font-semibold mt-1 hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>View impact audit</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Active Pickups</div>
          <div className="text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">
            {pendingRequests.length} <span className="text-sm font-normal text-[#718078]">in flight</span>
          </div>
          <div className="text-[11px] text-[#718078] mt-1">Chain of custody active</div>
        </div>
      </div>

      {/* Real-Time Step Notifications & Chain of Custody Feed */}
      <div className="p-5 eco-card rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E3ECE7] pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B9F5D0]/50 border border-[#16A36A]/30 flex items-center justify-center text-[#123D32]">
              <Bell className="w-4 h-4 text-[#16A36A]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#182B26] flex items-center gap-2">
                <span>Live Chain-of-Custody Step Notifications</span>
                {notifications.some(n => !n.read) && (
                  <span className="text-xs font-mono text-[#16A36A] font-semibold">
                    · {notifications.filter(n => !n.read).length} unread
                  </span>
                )}
              </h2>
              <p className="text-[11px] text-[#718078]">
                Real-time updates dispatched whenever Recyclers or Repair Labs process your e-waste requests
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {notifications.some(n => !n.read) && (
              <button
                onClick={() => markAllNotificationsAsRead(currentUser.id)}
                className="text-[11px] text-[#16A36A] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
            {notifications.length > 3 && (
              <button
                onClick={() => setShowAllNotifications(!showAllNotifications)}
                className="px-2.5 py-1 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] rounded-lg text-[11px] text-[#182B26] font-medium transition-colors cursor-pointer"
              >
                {showAllNotifications ? 'Show Recent' : `View All (${notifications.length})`}
              </button>
            )}
          </div>
        </div>

        {notifications.length > 0 ? (
          <div className="divide-y divide-[#E3ECE7] text-xs">
            {(showAllNotifications ? notifications : notifications.slice(0, 3)).map((notif) => (
              <div
                key={notif.id}
                className={`py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors ${
                  !notif.read ? 'bg-[#B9F5D0]/20 px-3 rounded-xl' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-lg shrink-0 mt-0.5 bg-[#F7FAF8] border border-[#DCE6E0] text-[#16A36A]">
                    {notif.type === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-semibold text-[#182B26] flex items-center gap-2 flex-wrap">
                      <span>{notif.title}</span>
                      {notif.type && (
                        <span className="text-[11px] font-mono text-[#16A36A] font-medium">
                          · {notif.type === 'assigned'
                            ? 'Accepted'
                            : notif.type === 'scheduled'
                            ? 'Assigned to Crew'
                            : notif.type === 'collected'
                            ? 'Collected'
                            : notif.type === 'processing'
                            ? 'Processing'
                            : notif.type === 'completed'
                            ? 'Certified'
                            : notif.type}
                        </span>
                      )}
                    </div>
                    <div className="text-[#718078] text-xs mt-0.5 leading-relaxed">
                      {notif.message}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <span className="text-[11px] font-mono text-[#718078] whitespace-nowrap tabular-nums">
                    {notif.timestamp}
                  </span>
                  {notif.requestId && (
                    <button
                      onClick={() => onViewTracking(notif.requestId!)}
                      className="text-[11px] text-[#16A36A] font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>Track</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  {!notif.read && (
                    <button
                      onClick={() => markNotificationAsRead(notif.id)}
                      className="p-1 hover:bg-[#F7FAF8] rounded text-[#718078] hover:text-[#182B26] cursor-pointer"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-[#718078]">
            No unread notifications. Schedule a pickup to receive step-by-step custody tracking.
          </div>
        )}
      </div>

      {/* Quick Action Navigation Hub */}
      <div className="p-5 eco-card rounded-2xl space-y-3">
        <div className="flex items-center justify-between text-xs text-[#718078]">
          <span className="font-semibold text-[#182B26]">Quick Actions & Platform Shortcuts</span>
          <span>Fast navigation across modules</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <button
            onClick={onOpenAssistant}
            className="p-3.5 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] hover:border-[#16A36A] rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-[#16A36A] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[#182B26]">EcoAI Triage</span>
            <span className="text-[10px] text-[#718078] mt-0.5">Diagnose device</span>
          </button>

          <button
            onClick={onExploreCentres}
            className="p-3.5 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] hover:border-[#16A36A] rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer group"
          >
            <MapPin className="w-4 h-4 text-[#16A36A] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[#182B26]">Find Kiosks</span>
            <span className="text-[10px] text-[#718078] mt-0.5">Campus depots</span>
          </button>

          <button
            onClick={onExploreMarketplace}
            className="p-3.5 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] hover:border-[#16A36A] rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer group"
          >
            <Wrench className="w-4 h-4 text-[#123D32] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[#182B26]">Marketplace</span>
            <span className="text-[10px] text-[#718078] mt-0.5">Refurb & parts</span>
          </button>

          <button
            onClick={onGoToRewards}
            className="p-3.5 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] hover:border-[#16A36A] rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer group"
          >
            <Award className="w-4 h-4 text-amber-600 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[#182B26]">Eco-Rewards</span>
            <span className="text-[10px] text-[#718078] mt-0.5">Claim vouchers</span>
          </button>

          <button
            onClick={onOpenPrivacy}
            className="p-3.5 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] hover:border-[#16A36A] rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer group"
          >
            <ShieldCheck className="w-4 h-4 text-[#123D32] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[#182B26]">Data Wipe Hub</span>
            <span className="text-[10px] text-[#718078] mt-0.5">NIST guidelines</span>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="p-3.5 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] hover:border-[#16A36A] rounded-xl text-left transition-all flex flex-col justify-between cursor-pointer group"
          >
            <TrendingUp className="w-4 h-4 text-[#16A36A] mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-[#182B26]">ESG Analytics</span>
            <span className="text-[10px] text-[#718078] mt-0.5">Campus metrics</span>
          </button>
        </div>
      </div>

      {/* Pickup Requests Table */}
      <div className="eco-card rounded-2xl overflow-hidden">
        
        <div className="p-5 border-b border-[#E3ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-[#182B26]">Your E-Waste Pickup Requests</h2>
            <p className="text-xs text-[#718078]">Manage submissions, inspect uploaded photos, view live tracking, or cancel pending collections</p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${filterStatus === 'all' ? 'bg-white text-[#123D32] font-semibold shadow-sm' : 'text-[#718078] hover:text-[#182B26]'}`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${filterStatus === 'active' ? 'bg-white text-[#123D32] font-semibold shadow-sm' : 'text-[#718078] hover:text-[#182B26]'}`}
            >
              Active ({pendingRequests.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${filterStatus === 'completed' ? 'bg-white text-[#123D32] font-semibold shadow-sm' : 'text-[#718078] hover:text-[#182B26]'}`}
            >
              Completed ({completedRequests.length})
            </button>
          </div>
        </div>

        {displayedRequests.length > 0 ? (
          <div className="divide-y divide-[#E3ECE7] text-xs">
            {displayedRequests.map((req) => {
              const uploadedPhoto = req.deviceImage || req.aiDiagnosis?.imageUrl;
              return (
                <div
                  key={req.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F7FAF8] transition-colors"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {uploadedPhoto && (
                      <button
                        type="button"
                        onClick={() => setPreviewReq(req)}
                        className="group relative w-16 h-16 rounded-xl overflow-hidden border border-[#DCE6E0] bg-[#F7FAF8] shrink-0 cursor-pointer"
                        title="Inspect uploaded device photo"
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

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap text-xs text-[#718078]">
                        <span className="font-mono font-bold text-[#123D32]">{req.id}</span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-mono uppercase font-semibold ${
                          req.status === 'completed'
                            ? 'text-[#16A36A]'
                            : req.status === 'cancelled'
                            ? 'text-red-600'
                            : 'text-[#123D32]'
                        }`}>
                          {req.status.replace('_', ' ')}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-medium text-[#16A36A]">
                          {req.disposalPreference === 'repair' || req.disposalPreference === 'refurbish'
                            ? 'Routed to Repairer'
                            : 'Routed to Recycler'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 font-mono text-[#182B26] tabular-nums">
                          <Clock className="w-3 h-3 text-[#16A36A]" />
                          Submitted: {formatRequestDateTime(req.submittedAt || req.createdAt)}
                        </span>
                      </div>

                      <div className="font-bold text-[#182B26] text-sm">
                        {req.quantity}x {req.brand} {req.model}
                      </div>

                      <div className="text-[#718078] text-xs font-mono tabular-nums">
                        Scheduled: {req.preferredDate} ({req.timeSlot}) · {req.pickupType === 'centre_dropoff' ? `Drop-off at ${req.centreName || 'Campus Hub'}` : 'Doorstep Pickup'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {uploadedPhoto && (
                      <button
                        type="button"
                        onClick={() => setPreviewReq(req)}
                        className="px-3 py-1.5 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] text-[#123D32] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-[#16A36A]" />
                        <span>Photo</span>
                      </button>
                    )}

                    <button
                      onClick={() => onViewTracking(req.id)}
                      className="px-3 py-1.5 bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1 cursor-pointer whitespace-nowrap"
                    >
                      <span>Track Pipeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onOpenReceipt(req)}
                      className="p-2 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] text-[#123D32] rounded-xl transition-colors cursor-pointer"
                      title="View QR Tag Receipt"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#16A36A]" />
                    </button>

                    {(req.status === 'submitted' || req.status === 'verified') && (
                      <button
                        onClick={() => handleCancel(req.id)}
                        className="px-3 py-1.5 bg-white hover:bg-red-50 border border-[#DCE6E0] text-[#718078] hover:text-red-700 text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Recycle className="w-8 h-8 text-[#718078] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#182B26]">No requests found in this filter</h3>
            <p className="text-xs text-[#718078] mt-1">Schedule your first e-waste collection to begin earning points.</p>
            <button
              onClick={() => onOpenPickupModal('recycle')}
              className="mt-4 px-4 py-2 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Schedule Pickup
            </button>
          </div>
        )}

      </div>

      {/* Recent Activities Feed */}
      <div className="p-5 eco-card rounded-2xl">
        <h3 className="text-sm font-bold text-[#182B26] mb-3">Recent Circular Activities</h3>
        <div className="space-y-3">
          {recentActivities.map((act, i) => {
            const Icon = act.icon;
            return (
              <div key={i} className="flex items-center justify-between py-2 border-b border-[#E3ECE7] last:border-0 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 bg-[#F7FAF8] rounded-lg border border-[#DCE6E0] ${act.color}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[#182B26]">{act.text}</span>
                </div>
                <span className="text-[11px] font-mono text-[#718078]">{act.time}</span>
              </div>
            );
          })}
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
