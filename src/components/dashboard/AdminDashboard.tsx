import React, { useState, useEffect } from 'react';
import { User, PartnerVerificationApplication, PickupRequest, TrackingStage } from '../../types';
import {
  getPickupRequests,
  getVerificationApplications,
  approvePartnerAndSendEmail,
  rejectPartnerApplication,
  calculatePlatformMetrics,
  updateRequestStatus,
  syncRequestsWithBackend,
  formatRequestDateTime
} from '../../services/storage';
import { checkSmtpStatus, SmtpStatusResult } from '../../services/emailService';
import { DeviceImageModal } from '../common/DeviceImageModal';
import {
  ShieldCheck,
  Check,
  X,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
  RefreshCw,
  ExternalLink,
  KeyRound,
  Mail,
  Truck,
  Wrench,
  Clock,
  Phone,
  MapPin,
  Loader2,
  Info,
  Recycle,
  Inbox,
  Image as ImageIcon,
  ZoomIn
} from 'lucide-react';

interface Props {
  currentUser: User;
  onOpenAuditReport: () => void;
  onViewTracking: (id: string) => void;
  onOpenSupabaseModal?: () => void;
  onLockConsole?: () => void;
}

export const AdminDashboard: React.FC<Props> = ({
  currentUser,
  onOpenAuditReport,
  onViewTracking,
  onOpenSupabaseModal,
  onLockConsole
}) => {
  const metrics = calculatePlatformMetrics();
  const [requests, setRequests] = useState<PickupRequest[]>(() => getPickupRequests());
  const [applications, setApplications] = useState<PartnerVerificationApplication[]>(getVerificationApplications());

  const [activeAdminTab, setActiveAdminTab] = useState<'applications' | 'pickups' | 'complaints' | 'settings'>('applications');
  const [appFilter, setAppFilter] = useState<'pending' | 'all' | 'approved' | 'rejected'>('pending');
  const [pickupFilter, setPickupFilter] = useState<'all' | 'pending' | 'recycle' | 'repair'>('all');
  const [pointMultiplier, setPointMultiplier] = useState<number>(1.25);
  const [multiplierSaved, setMultiplierSaved] = useState(false);

  const pendingPickups = requests.filter(r => r.status === 'submitted' || r.status === 'verified');
  const displayedPickups = requests.filter(r => {
    if (pickupFilter === 'pending') return r.status === 'submitted' || r.status === 'verified';
    if (pickupFilter === 'recycle') return r.disposalPreference === 'recycle' || r.disposalPreference === 'donation' || !r.disposalPreference;
    if (pickupFilter === 'repair') return r.disposalPreference === 'repair' || r.disposalPreference === 'refurbish';
    return true;
  });

  const [processingAppId, setProcessingAppId] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState<string | null>(null);
  const [adminError, setAdminError] = useState<string | null>(null);

  const [smtpStatus, setSmtpStatus] = useState<SmtpStatusResult | null>(null);
  const [showSmtpModal, setShowSmtpModal] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [previewReq, setPreviewReq] = useState<PickupRequest | null>(null);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncRequestsWithBackend();
    setRequests(getPickupRequests());
    setApplications(getVerificationApplications());
    setTimeout(() => setIsSyncing(false), 500);
  };

  const refreshApplications = () => {
    setApplications(getVerificationApplications());
  };

  useEffect(() => {
    checkSmtpStatus().then(res => setSmtpStatus(res));
  }, []);

  useEffect(() => {
    const handleStorageUpdate = () => {
      setRequests(getPickupRequests());
      setApplications(getVerificationApplications());
    };

    window.addEventListener('ecycle_state_updated', handleStorageUpdate);
    syncRequestsWithBackend().then(() => handleStorageUpdate()).catch(() => {});

    const pollInterval = setInterval(() => {
      syncRequestsWithBackend().then(() => handleStorageUpdate()).catch(() => {});
    }, 4000);

    return () => {
      window.removeEventListener('ecycle_state_updated', handleStorageUpdate);
      clearInterval(pollInterval);
    };
  }, []);

  const [complaints, setComplaints] = useState([
    {
      id: 'TKT-104',
      user: 'Priya Sharma (Dorm 12B)',
      subject: 'Hazardous Lithium Battery Container Delivery',
      detail: 'Requested specialized vermiculite fire bag for 4 swollen drone packs.',
      status: 'In Progress',
      priority: 'High'
    },
    {
      id: 'TKT-105',
      user: 'Marcus Vance (Robotics Lab)',
      subject: 'Large Bulk Pickup (40+ PCBs)',
      detail: 'Needs pallet truck access to Basement Engineering Loading Dock.',
      status: 'Open',
      priority: 'Medium'
    }
  ]);

  const handleResolveComplaint = (tktId: string) => {
    setComplaints(prev => prev.map(c => c.id === tktId ? { ...c, status: 'Resolved' } : c));
  };

  const handleAcceptPartner = async (app: PartnerVerificationApplication) => {
    setProcessingAppId(app.id);
    setAdminSuccess(null);
    setAdminError(null);

    try {
      const result = await approvePartnerAndSendEmail(app.id);
      refreshApplications();

      if (result.success && result.app) {
        const username = result.app.username || result.app.assignedLoginId;
        const password = result.app.temporaryPassword || result.app.generatedPassword;
        const recipient = result.app.email;

        if (result.emailResult?.emailSent) {
          setAdminSuccess(
            `Registration Approved! Unique username (${username}) and temporary password (${password}) generated. Email with login credentials sent successfully to ${recipient} via Gmail SMTP.`
          );
        } else if (result.emailResult?.simulated) {
          setAdminSuccess(
            `Registration Approved! Unique username (${username}) and temporary password (${password}) generated. Credentials prepared for ${recipient} (Simulated mode: set GMAIL_USER & GMAIL_APP_PASSWORD in .env for live Gmail dispatch).`
          );
        } else if (result.emailResult && !result.emailResult.success) {
          setAdminError(
            `Registration Approved in database (Username: ${username}, Password: ${password}), but Gmail SMTP email delivery failed: ${result.emailResult.error}. Please check your Gmail SMTP configuration in .env.`
          );
        } else {
          setAdminSuccess(
            `Registration for ${result.app.shopName || result.app.organizationName} Approved! Username: ${username} | Password: ${password}`
          );
        }
      } else {
        setAdminError(result.error || 'Failed to approve partner registration request.');
      }
    } catch (err: any) {
      setAdminError(`Error accepting registration: ${err.message || 'Unknown error'}`);
    } finally {
      setProcessingAppId(null);
      setTimeout(() => {
        setAdminSuccess(null);
      }, 10000);
    }
  };

  const handleRejectPartner = (app: PartnerVerificationApplication) => {
    setProcessingAppId(app.id);
    setAdminSuccess(null);
    setAdminError(null);

    const success = rejectPartnerApplication(app.id);
    refreshApplications();
    setProcessingAppId(null);

    if (success) {
      setAdminSuccess(`Registration request for "${app.shopName || app.organizationName}" has been Rejected.`);
      setTimeout(() => setAdminSuccess(null), 5000);
    } else {
      setAdminError(`Failed to reject registration request ${app.id}.`);
    }
  };

  const handleAdminAdvance = (req: PickupRequest, nextStage: TrackingStage) => {
    updateRequestStatus(
      req.id,
      nextStage,
      `UN SDG Directorate confirmed transition to ${nextStage.toUpperCase()}.`,
      req.verifiedWeightKg || req.estimatedWeightKg,
      'UN SDG Directorate Admin'
    );
    setAdminSuccess(`Request ${req.id} advanced to ${nextStage.toUpperCase()} & citizen notified.`);
    setTimeout(() => setAdminSuccess(null), 4000);
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Category,Brand,Model,Quantity,Status,SubmittedAt,WeightKg,EcoPoints\n" +
      requests.map(r => `${r.id},${r.deviceCategory},${r.brand},${r.model},${r.quantity},${r.status},"${formatRequestDateTime(r.submittedAt || r.createdAt)}",${r.estimatedWeightKg},${r.ecoPointsAwarded}`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecycle_audit_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pendingApps = applications.filter(a => a.status === 'pending');
  const filteredApps = applications.filter(a => {
    if (appFilter === 'pending') return a.status === 'pending';
    if (appFilter === 'approved') return a.status === 'approved';
    if (appFilter === 'rejected') return a.status === 'rejected';
    return true;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="p-6 eco-card rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-[#718078] flex-wrap">
            <span className="inline-flex items-center gap-1.5 font-semibold text-[#123D32]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Admin Directorate Console</span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono">ID: {currentUser.id}</span>
          </div>
          <h1 className="text-2xl font-bold text-[#182B26] mt-1 tracking-tight">
            System Administration Console
          </h1>
          <p className="text-xs text-[#718078] mt-1 font-mono">
            {currentUser.organization} · UN SDG 12 Responsible E-Waste Platform
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowSmtpModal(true)}
            className={`px-3.5 py-2 border text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              smtpStatus?.configured
                ? 'bg-[#B9F5D0]/35 border-[#16A36A]/35 text-[#123D32] hover:bg-[#B9F5D0]/55'
                : 'bg-[#F7FAF8] border-[#DCE6E0] text-[#182B26] hover:bg-white'
            }`}
            title="Inspect Gmail SMTP configuration for sending partner credentials"
          >
            <Mail className="w-3.5 h-3.5 text-[#16A36A]" />
            <span>Gmail SMTP: {smtpStatus?.configured ? 'Active' : 'Dev / Ready'}</span>
          </button>

          {onOpenSupabaseModal && (
            <button
              onClick={onOpenSupabaseModal}
              className="px-3.5 py-2 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#123D32] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Database className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Supabase Cloud</span>
            </button>
          )}

          {onLockConsole && (
            <button
              onClick={onLockConsole}
              className="px-3.5 py-2 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#182B26] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              title="Lock administration console session"
            >
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Lock Console</span>
            </button>
          )}

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3.5 py-2 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#182B26] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60 whitespace-nowrap"
            title="Fetch latest citizen requests and partner registrations from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#16A36A] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] text-[#182B26] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-[#16A36A]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAuditReport}
            className="px-4 py-2 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>ESG Report</span>
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {adminSuccess && (
        <div className="p-4 bg-[#B9F5D0]/35 border border-[#16A36A]/40 rounded-2xl text-[#123D32] text-xs flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#16A36A] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Operation Successful</span>
            <p className="font-mono text-[11px] leading-relaxed">{adminSuccess}</p>
          </div>
          <button
            onClick={() => setAdminSuccess(null)}
            className="ml-auto text-[#123D32] hover:opacity-75 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {adminError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Action Alert</span>
            <p className="font-mono text-[11px] leading-relaxed">{adminError}</p>
          </div>
          <button
            onClick={() => setAdminError(null)}
            className="ml-auto text-red-600 hover:text-red-800 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Admin Stat Strip - 5 Primary Live KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        
        <div
          onClick={() => setActiveAdminTab('pickups')}
          className={`p-5 eco-card eco-card-interactive rounded-2xl cursor-pointer transition-all ${
            activeAdminTab === 'pickups' ? 'border-[#16A36A] ring-2 ring-[#16A36A]/20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-medium text-[#718078]">Citizen Requests</div>
            <Inbox className="w-4 h-4 text-[#16A36A]" />
          </div>
          <div className="text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">
            {requests.length} <span className="text-xs font-medium text-[#16A36A] font-sans">({pendingPickups.length} new)</span>
          </div>
          <div className="text-[11px] text-[#16A36A] mt-1 font-medium">
            Review Live Pickups →
          </div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Pending Registrations</div>
          <div className="text-3xl font-bold text-amber-600 font-mono tabular-nums mt-1">
            {pendingApps.length}
          </div>
          <div className="text-[11px] text-[#718078] mt-1">
            Awaiting Admin review & Gmail dispatch
          </div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Approved Partners</div>
          <div className="text-3xl font-bold text-[#16A36A] font-mono tabular-nums mt-1">
            {applications.filter(a => a.status === 'approved').length}
          </div>
          <div className="text-[11px] text-[#718078] mt-1">
            Active Recyclers & Repairers
          </div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">Network Volume</div>
          <div className="text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">
            {metrics.totalKg.toLocaleString()} <span className="text-sm font-normal text-[#718078]">kg</span>
          </div>
          <div className="text-[11px] text-[#718078] mt-1">Diverted from landfills</div>
        </div>

        <div className="p-5 eco-card rounded-2xl">
          <div className="text-xs font-medium text-[#718078]">CO2 Avoided</div>
          <div className="text-3xl font-bold text-[#123D32] font-mono tabular-nums mt-1">
            {metrics.totalCo2Kg.toLocaleString()} <span className="text-sm font-normal text-[#16A36A]">kg</span>
          </div>
          <div className="text-[11px] text-[#718078] mt-1">Scope 3 reduction</div>
        </div>
      </div>

      {/* Live citizen requests overview banner */}
      <div className="p-4 bg-[#123D32] text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#16A36A]/25 border border-[#B9F5D0]/30 flex items-center justify-center text-[#B9F5D0] shrink-0">
            <Inbox className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
              <span>{requests.length} Total Citizen Request{requests.length !== 1 ? 's' : ''} Received ({pendingPickups.length} Pending Action)</span>
              <span className="text-xs font-mono text-[#B9F5D0] font-normal">· Live Backend Sync</span>
            </div>
            <p className="text-xs text-[#D3E4DA] mt-0.5">
              Citizen e-waste requests with submission timestamps and device photos are synchronized in real-time with backend and partner queues.
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveAdminTab('pickups')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors whitespace-nowrap ${
            activeAdminTab === 'pickups'
              ? 'bg-white text-[#123D32]'
              : 'bg-[#16A36A] hover:bg-[#19B577] text-white'
          }`}
        >
          {activeAdminTab === 'pickups' ? 'Viewing Pickups Tab ✓' : `Review Pickups (${requests.length}) →`}
        </button>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#DCE6E0] pb-3 text-xs font-medium overflow-x-auto flex-nowrap sm:flex-wrap">
        <button
          onClick={() => setActiveAdminTab('applications')}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'applications'
              ? 'bg-[#123D32] text-white font-semibold shadow-sm'
              : 'text-[#718078] hover:text-[#182B26] hover:bg-white'
          }`}
        >
          <span>Partner Registrations</span>
          {pendingApps.length > 0 && (
            <span className="font-mono text-[11px] opacity-80">({pendingApps.length})</span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('pickups')}
          className={`px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'pickups'
              ? 'bg-[#123D32] text-white font-semibold shadow-sm'
              : 'text-[#718078] hover:text-[#182B26] hover:bg-white'
          }`}
        >
          <span>Platform Pickups ({requests.length})</span>
          {pendingPickups.length > 0 && (
            <span className="font-mono text-[11px] text-[#B9F5D0] font-semibold">· {pendingPickups.length} new</span>
          )}
        </button>
        <button
          onClick={() => setActiveAdminTab('complaints')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'complaints'
              ? 'bg-[#123D32] text-white font-semibold shadow-sm'
              : 'text-[#718078] hover:text-[#182B26] hover:bg-white'
          }`}
        >
          Inquiries & Tickets ({complaints.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`px-3.5 py-2 rounded-xl transition-colors cursor-pointer whitespace-nowrap ${
            activeAdminTab === 'settings'
              ? 'bg-[#123D32] text-white font-semibold shadow-sm'
              : 'text-[#718078] hover:text-[#182B26] hover:bg-white'
          }`}
        >
          Reward Multipliers & Config
        </button>
      </div>

      {/* Tab 1: Partner Verification & Registration Applications */}
      {activeAdminTab === 'applications' && (
        <div className="eco-card rounded-2xl overflow-hidden">
          
          <div className="p-5 border-b border-[#E3ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#182B26]">
                  Recycler & Repairer Registration Requests
                </h2>
                <span className="text-[11px] font-mono text-[#16A36A]">
                  · Gmail SMTP Automated
                </span>
              </div>
              <p className="text-xs text-[#718078] mt-0.5">
                Review registrations. Clicking <strong className="text-[#182B26]">Accept</strong> generates a unique username and temporary password, saves status as "Approved", and dispatches credentials directly to the applicant's Gmail.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#F7FAF8] p-1 rounded-xl border border-[#DCE6E0] text-xs font-medium">
              <button
                onClick={() => setAppFilter('pending')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  appFilter === 'pending'
                    ? 'bg-white text-[#123D32] font-semibold shadow-sm'
                    : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                Pending ({pendingApps.length})
              </button>
              <button
                onClick={() => setAppFilter('approved')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  appFilter === 'approved'
                    ? 'bg-white text-[#16A36A] font-semibold shadow-sm'
                    : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                Approved
              </button>
              <button
                onClick={() => setAppFilter('rejected')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  appFilter === 'rejected'
                    ? 'bg-white text-red-600 font-semibold shadow-sm'
                    : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setAppFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  appFilter === 'all'
                    ? 'bg-white text-[#182B26] font-semibold shadow-sm'
                    : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                All ({applications.length})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E3ECE7] bg-[#F7FAF8] text-[#718078] font-mono text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4 font-semibold">Shop Name & Type</th>
                  <th className="py-3.5 px-4 font-semibold">Applicant Name</th>
                  <th className="py-3.5 px-4 font-semibold">Email & Phone</th>
                  <th className="py-3.5 px-4 font-semibold">Address</th>
                  <th className="py-3.5 px-4 font-semibold">Submitted</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3ECE7]">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 px-4 text-center text-[#718078] font-mono">
                      No registration requests matching filter "{appFilter}".
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => {
                    const isRecycler = app.type === 'Recycler' || app.category === 'Recycler';
                    const isProcessing = processingAppId === app.id;

                    return (
                      <tr key={app.id} className="hover:bg-[#F7FAF8] transition-colors">
                        <td className="py-4 px-4 align-top">
                          <div className="font-bold text-[#182B26] text-sm">
                            {app.shopName || app.organizationName}
                          </div>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#718078] flex-wrap">
                            <span className="inline-flex items-center gap-1 font-semibold text-[#123D32]">
                              {isRecycler ? <Truck className="w-3 h-3 text-[#16A36A]" /> : <Wrench className="w-3 h-3 text-[#123D32]" />}
                              <span>{isRecycler ? 'Recycler' : 'Repairer'}</span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono">ID: {app.id}</span>
                          </div>

                          {app.status === 'approved' && (
                            <div className="mt-2.5 p-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl space-y-1 font-mono text-[10px]">
                              <div className="flex items-center gap-1 text-[#16A36A] font-semibold">
                                <KeyRound className="w-3 h-3" />
                                <span>Generated Login Credentials:</span>
                              </div>
                              <div className="text-[#182B26]">
                                <span className="text-[#718078]">Username:</span>{' '}
                                <strong>{app.username || app.assignedLoginId}</strong>
                              </div>
                              <div className="text-[#182B26]">
                                <span className="text-[#718078]">Password:</span>{' '}
                                <strong className="text-[#123D32]">{app.temporaryPassword || app.generatedPassword}</strong>
                              </div>
                              <div className="flex items-center gap-1 text-[#718078] pt-0.5">
                                <Mail className="w-2.5 h-2.5 text-[#16A36A]" />
                                <span>Gmail Status: </span>
                                <span className={app.emailDeliveryStatus === 'sent' ? 'text-[#16A36A] font-semibold' : 'text-[#182B26]'}>
                                  {app.emailDeliveryStatus === 'sent' ? 'Delivered via Gmail SMTP' : app.emailDeliveryStatus === 'simulated' ? 'Simulated Dev Send' : 'Credentials Generated'}
                                </span>
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 align-top">
                          <div className="font-semibold text-[#182B26]">
                            {app.name || app.contactPerson}
                          </div>
                          <div className="text-[11px] text-[#718078] mt-0.5">
                            Lead Representative
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top font-mono text-xs">
                          <div className="text-[#123D32] font-medium flex items-center gap-1">
                            <Mail className="w-3 h-3 text-[#16A36A] shrink-0" />
                            <span>{app.email}</span>
                          </div>
                          <div className="text-[#718078] text-[11px] mt-1 flex items-center gap-1 tabular-nums">
                            <Phone className="w-3 h-3 shrink-0" />
                            <span>{app.phone}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top text-[#718078] text-xs">
                          <div className="flex items-start gap-1 max-w-xs">
                            <MapPin className="w-3.5 h-3.5 text-[#718078] shrink-0 mt-0.5" />
                            <span className="leading-snug">{app.address || app.city}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4 align-top font-mono text-[#718078] text-[11px] tabular-nums">
                          {app.submittedAt}
                        </td>

                        <td className="py-4 px-4 align-top">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-bold uppercase ${
                            app.status === 'approved'
                              ? 'text-[#16A36A]'
                              : app.status === 'rejected'
                              ? 'text-red-600'
                              : 'text-amber-600'
                          }`}>
                            {app.status === 'approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {app.status === 'rejected' && <X className="w-3.5 h-3.5" />}
                            {app.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                            <span>{app.status}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4 align-top text-right">
                          {app.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleAcceptPartner(app)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                                title="Generate credentials and send email via Gmail SMTP"
                              >
                                {isProcessing ? (
                                  <>
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Sending...</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Accept</span>
                                  </>
                                )}
                              </button>

                              <button
                                onClick={() => handleRejectPartner(app)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 bg-[#F7FAF8] hover:bg-red-50 hover:text-red-700 border border-[#DCE6E0] text-[#718078] disabled:opacity-50 rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                                title="Reject registration request"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : app.status === 'approved' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 text-[#16A36A] font-mono text-[11px] font-semibold">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approved</span>
                              </span>
                              <div>
                                <button
                                  onClick={() => handleAcceptPartner(app)}
                                  disabled={isProcessing}
                                  className="text-[10px] text-[#718078] hover:text-[#123D32] underline font-mono cursor-pointer"
                                  title="Resend login credentials to Gmail"
                                >
                                  Resend Email
                                </button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-[#718078] font-mono text-[11px]">
                              Rejected
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-[#F7FAF8] border-t border-[#E3ECE7] text-[11px] text-[#718078] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-[#16A36A]" />
              <span>Email Dispatch Engine: Nodemailer Gmail SMTP (`GMAIL_USER`, `GMAIL_APP_PASSWORD`)</span>
            </div>
            <button
              onClick={() => setShowSmtpModal(true)}
              className="text-[#16A36A] font-semibold hover:underline cursor-pointer"
            >
              Configure Gmail SMTP Credentials →
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: All Platform Pickups (With Citizen Photo + Exact Timestamp) */}
      {activeAdminTab === 'pickups' && (
        <div className="eco-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[#E3ECE7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-[#182B26]">Central Custody Manifest</h2>
                <span className="text-[11px] font-mono text-[#16A36A] font-semibold">
                  · Real-time Backend Stream
                </span>
              </div>
              <p className="text-xs text-[#718078] mt-0.5">
                All registered citizen requests with exact submission timestamps and uploaded device photos synced across Backend Server, Supabase, and partner queues.
              </p>
            </div>

            <div className="flex items-center gap-1 bg-[#F7FAF8] p-1 rounded-xl border border-[#DCE6E0] text-xs font-medium overflow-x-auto">
              <button
                onClick={() => setPickupFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  pickupFilter === 'all' ? 'bg-white text-[#123D32] font-semibold shadow-sm' : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                All ({requests.length})
              </button>
              <button
                onClick={() => setPickupFilter('pending')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  pickupFilter === 'pending'
                    ? 'bg-white text-amber-700 font-semibold shadow-sm'
                    : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                Pending ({pendingPickups.length})
              </button>
              <button
                onClick={() => setPickupFilter('recycle')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  pickupFilter === 'recycle' ? 'bg-white text-[#16A36A] font-semibold shadow-sm' : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                Recycler ({requests.filter(r => r.disposalPreference === 'recycle' || !r.disposalPreference || r.disposalPreference === 'donation').length})
              </button>
              <button
                onClick={() => setPickupFilter('repair')}
                className={`px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                  pickupFilter === 'repair' ? 'bg-white text-[#123D32] font-semibold shadow-sm' : 'text-[#718078] hover:text-[#182B26]'
                }`}
              >
                Repairer ({requests.filter(r => r.disposalPreference === 'repair' || r.disposalPreference === 'refurbish').length})
              </button>
            </div>
          </div>

          {displayedPickups.length > 0 ? (
            <div className="divide-y divide-[#E3ECE7] text-xs">
              {displayedPickups.map((r) => {
                const uploadedPhoto = r.deviceImage || r.aiDiagnosis?.imageUrl;
                return (
                  <div key={r.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#F7FAF8] transition-colors">
                    <div className="flex items-start gap-4 min-w-0 flex-1">
                      {uploadedPhoto ? (
                        <button
                          type="button"
                          onClick={() => setPreviewReq(r)}
                          className="group relative w-20 h-20 rounded-xl overflow-hidden border border-[#DCE6E0] bg-[#F7FAF8] shrink-0 cursor-pointer shadow-sm"
                          title="Click to inspect uploaded citizen device photo"
                        >
                          <img
                            src={uploadedPhoto}
                            alt={`${r.brand} ${r.model}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <span className="absolute inset-0 bg-[#123D32]/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-semibold gap-1">
                            <ZoomIn className="w-3.5 h-3.5" />
                            <span>View</span>
                          </span>
                        </button>
                      ) : (
                        <div className="w-20 h-20 rounded-xl border border-dashed border-[#DCE6E0] bg-[#F7FAF8] shrink-0 flex flex-col items-center justify-center text-[#718078] gap-1 text-center px-1">
                          <ImageIcon className="w-4 h-4 opacity-50" />
                          <span className="text-[9px] leading-tight">No photo</span>
                        </div>
                      )}

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap text-xs text-[#718078]">
                          <span className="font-mono font-bold text-[#123D32]">{r.id}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono uppercase font-semibold text-[#16A36A]">
                            {r.status.replace('_', ' ')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span>{r.deviceCategory}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-semibold text-[#123D32]">
                            {r.disposalPreference === 'repair' || r.disposalPreference === 'refurbish'
                              ? 'Routed to Repairer'
                              : 'Routed to Recycler'}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="inline-flex items-center gap-1 font-mono text-[#182B26] font-medium tabular-nums">
                            <Clock className="w-3 h-3 text-[#16A36A]" />
                            {formatRequestDateTime(r.submittedAt || r.createdAt)}
                          </span>
                        </div>

                        <div className="font-bold text-[#182B26] text-sm">
                          {r.quantity}x {r.brand} {r.model}
                        </div>

                        <div className="text-[#718078] text-xs flex items-center gap-2 flex-wrap">
                          <span>Citizen: <strong className="text-[#182B26]">{r.userName}</strong></span>
                          {r.userEmail && <span>· {r.userEmail}</span>}
                          {r.userPhone && <span className="font-mono tabular-nums">· {r.userPhone}</span>}
                          {r.address && <span>· {r.address}</span>}
                        </div>

                        <div className="text-[#718078] font-mono text-[11px]">
                          Assigned Partner: <strong className="text-[#182B26]">{r.assignedPartnerName || 'Pending Hub Assignment'}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {uploadedPhoto && (
                        <button
                          type="button"
                          onClick={() => setPreviewReq(r)}
                          className="px-3 py-1.5 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] text-[#123D32] rounded-xl text-xs font-semibold cursor-pointer transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          <ImageIcon className="w-3.5 h-3.5 text-[#16A36A]" />
                          <span>View Photo</span>
                        </button>
                      )}

                      <button
                        onClick={() => onViewTracking(r.id)}
                        className="px-3 py-1.5 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#182B26] rounded-xl text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap"
                      >
                        View Manifest
                      </button>

                      {r.status === 'submitted' && (
                        <button
                          onClick={() => handleAdminAdvance(r, 'assigned')}
                          className="px-3 py-1.5 bg-[#16A36A] hover:bg-[#128757] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-colors whitespace-nowrap"
                        >
                          {r.disposalPreference === 'repair' ? 'Assign to Repair Lab' : 'Assign to Recycler'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-[#718078]">
              <Inbox className="w-8 h-8 mx-auto text-[#718078] mb-2" />
              <div className="text-sm font-semibold text-[#182B26]">No requests found in this filter</div>
              <div className="text-xs text-[#718078] mt-1">Incoming citizen requests will show up here in real time.</div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Complaints */}
      {activeAdminTab === 'complaints' && (
        <div className="eco-card rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-[#E3ECE7]">
            <h2 className="text-base font-bold text-[#182B26]">Support & Compliance Tickets</h2>
            <p className="text-xs text-[#718078]">Handle partner and citizen operational support requests</p>
          </div>

          <div className="divide-y divide-[#E3ECE7] text-xs">
            {complaints.map((c) => (
              <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#F7FAF8] transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[#16A36A] font-bold">{c.id}</span>
                    <span className="font-bold text-[#182B26]">{c.subject}</span>
                    <span className={`text-[11px] font-mono font-semibold ${
                      c.status === 'Resolved' ? 'text-[#16A36A]' : 'text-amber-600'
                    }`}>
                      · {c.status}
                    </span>
                  </div>
                  <div className="text-[#718078]">{c.detail}</div>
                  <div className="text-[#718078] font-mono text-[11px]">Submitted by: {c.user}</div>
                </div>

                {c.status !== 'Resolved' && (
                  <button
                    onClick={() => handleResolveComplaint(c.id)}
                    className="px-3.5 py-2 bg-[#16A36A] hover:bg-[#128757] text-white rounded-xl text-xs font-semibold cursor-pointer shrink-0 transition-colors"
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Settings & Multipliers */}
      {activeAdminTab === 'settings' && (
        <div className="eco-card rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-[#182B26]">Reward Multipliers & Platform Calibration</h2>
            <p className="text-xs text-[#718078]">Configure real-time incentives for campus drives and community collections</p>
          </div>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-[#182B26] font-semibold mb-1.5">
                Eco-Points Multiplier: <span className="text-[#16A36A] font-mono font-bold tabular-nums">{pointMultiplier}x</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.25"
                value={pointMultiplier}
                onChange={(e) => { setPointMultiplier(parseFloat(e.target.value)); setMultiplierSaved(false); }}
                className="w-full accent-[#16A36A]"
              />
              <div className="flex justify-between text-[11px] text-[#718078] font-mono mt-1">
                <span>1.0x (Standard)</span>
                <span>1.5x (Campus Drive)</span>
                <span>2.5x (Earth Week Peak)</span>
              </div>
            </div>

            <button
              onClick={() => setMultiplierSaved(true)}
              className="px-5 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold rounded-xl text-xs cursor-pointer transition-colors"
            >
              Save Reward Configuration
            </button>

            {multiplierSaved && (
              <div className="p-3 bg-[#B9F5D0]/35 border border-[#16A36A]/35 rounded-xl text-[#123D32] text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                <span>Multiplier set to {pointMultiplier}x across all registered drop-off pods!</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Gmail SMTP Configuration Modal */}
      {showSmtpModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#123D32]/55 backdrop-blur-sm">
          <div className="bg-white border border-[#DCE6E0] rounded-2xl max-w-lg w-full p-6 text-xs text-[#182B26] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-modal-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#E3ECE7]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#B9F5D0]/50 border border-[#16A36A]/30 flex items-center justify-center text-[#123D32]">
                  <Mail className="w-4 h-4 text-[#16A36A]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#182B26]">Gmail SMTP Integration Guide</h3>
                  <span className="text-[11px] font-mono text-[#16A36A]">Nodemailer Service Backend</span>
                </div>
              </div>
              <button
                onClick={() => setShowSmtpModal(false)}
                className="p-1.5 text-[#718078] hover:text-[#182B26] rounded-lg hover:bg-[#F7FAF8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className={`p-3.5 rounded-xl border font-mono text-xs ${
              smtpStatus?.configured
                ? 'bg-[#B9F5D0]/30 border-[#16A36A]/35 text-[#123D32]'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <div className="font-bold flex items-center gap-1.5">
                {smtpStatus?.configured ? <CheckCircle2 className="w-4 h-4 text-[#16A36A]" /> : <Info className="w-4 h-4 text-amber-600" />}
                <span>Status: {smtpStatus?.configured ? 'Gmail SMTP Active & Connected' : 'Simulated Dev Mode (Ready for App Password)'}</span>
              </div>
              {smtpStatus?.maskedUser && (
                <div className="text-[11px] text-[#718078] mt-1">
                  Active User: <strong className="text-[#182B26]">{smtpStatus.maskedUser}</strong>
                </div>
              )}
            </div>

            <div className="space-y-3 text-[#718078] text-xs leading-relaxed">
              <h4 className="font-semibold text-[#182B26]">How to connect your Gmail Account:</h4>
              <ol className="list-decimal pl-5 space-y-2 text-[11px]">
                <li>
                  Enable <strong className="text-[#182B26]">2-Step Verification</strong> on your Google Account:
                  <br />
                  <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-[#16A36A] underline inline-flex items-center gap-1 mt-0.5">
                    <span>https://myaccount.google.com/security</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>
                  Generate a dedicated 16-character <strong className="text-[#182B26]">App Password</strong>:
                  <br />
                  <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-[#16A36A] underline inline-flex items-center gap-1 mt-0.5">
                    <span>https://myaccount.google.com/apppasswords</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <p className="text-[#718078] mt-0.5">Select app: "Mail", device: "Other (E-Cycle AI)".</p>
                </li>
                <li>
                  Add both variables to your environment / <code className="text-[#123D32] bg-[#F7FAF8] px-1 py-0.5 rounded border border-[#DCE6E0]">.env</code>:
                  <pre className="mt-1.5 p-2.5 bg-[#F7FAF8] rounded-lg text-[#123D32] font-mono text-[10px] overflow-x-auto border border-[#DCE6E0]">
                    GMAIL_USER="your-email@gmail.com"&#10;GMAIL_APP_PASSWORD="xxxx xxxx xxxx xxxx"
                  </pre>
                </li>
                <li>
                  When an Admin clicks <strong className="text-[#182B26]">Accept</strong> on any pending partner registration, Nodemailer uses Gmail SMTP (<code className="text-[#123D32]">smtp.gmail.com</code>) to send the login credentials directly to the partner's Gmail.
                </li>
              </ol>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-[#E3ECE7]">
              <button
                onClick={() => {
                  checkSmtpStatus().then(res => setSmtpStatus(res));
                }}
                className="px-3.5 py-2 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#182B26] rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#16A36A]" />
                <span>Recheck SMTP Status</span>
              </button>
              <button
                onClick={() => setShowSmtpModal(false)}
                className="px-4 py-2 bg-[#16A36A] hover:bg-[#128757] text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

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
