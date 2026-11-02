import React, { useState } from 'react';
import { User, PartnerVerificationApplication } from '../../types';
import {
  getPickupRequests,
  getVerificationApplications,
  updateApplicationStatus,
  calculatePlatformMetrics
} from '../../services/storage';
import { ShieldAlert, Users, Check, X, Download, Settings, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  currentUser: User;
  onOpenAuditReport: () => void;
  onViewTracking: (id: string) => void;
}

export const AdminDashboard: React.FC<Props> = ({ currentUser, onOpenAuditReport, onViewTracking }) => {
  const metrics = calculatePlatformMetrics();
  const requests = getPickupRequests();
  const applications = getVerificationApplications();

  const [activeAdminTab, setActiveAdminTab] = useState<'applications' | 'pickups' | 'complaints' | 'settings'>('applications');
  const [pointMultiplier, setPointMultiplier] = useState<number>(1.25);
  const [multiplierSaved, setMultiplierSaved] = useState(false);

  // Complaints / Support Tickets State
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

  const handleApprovePartner = (appId: string) => {
    updateApplicationStatus(appId, 'approved');
  };

  const handleRejectPartner = (appId: string) => {
    updateApplicationStatus(appId, 'rejected');
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "ID,Category,Brand,Model,Quantity,Status,WeightKg,EcoPoints\n" +
      requests.map(r => `${r.id},${r.deviceCategory},${r.brand},${r.model},${r.quantity},${r.status},${r.estimatedWeightKg},${r.ecoPointsAwarded}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ecycle_audit_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase">Platform Governance & Regulatory Oversight</span>
          <h1 className="text-2xl font-bold text-white mt-1">
            System Administration Console
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {currentUser.organization} · Privileged Role: SDG Taskforce Director
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV Data</span>
          </button>

          <button
            onClick={onOpenAuditReport}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Institutional ESG Report</span>
          </button>
        </div>
      </div>

      {/* Admin Stat Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Network Volume</div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">{metrics.totalKg.toLocaleString()} <span className="text-sm font-normal text-neutral-400">kg</span></div>
          <div className="text-[11px] text-neutral-400 mt-1">Diverted from landfills</div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Pending Applications</div>
          <div className="text-3xl font-bold text-amber-400 font-mono tabular-nums mt-1">
            {applications.filter(a => a.status === 'pending').length}
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Awaiting R2 audit verification</div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Avoided Lifecycle CO2</div>
          <div className="text-3xl font-bold text-cyan-400 font-mono tabular-nums mt-1">{metrics.totalCo2Kg.toLocaleString()} <span className="text-sm font-normal text-cyan-300">kg</span></div>
          <div className="text-[11px] text-neutral-400 mt-1">Audited Scope 3 reduction</div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Active Campus Hubs</div>
          <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums mt-1">{metrics.totalPartners}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Zero unauthorized handlers</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 text-xs font-medium">
        <button
          onClick={() => setActiveAdminTab('applications')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${activeAdminTab === 'applications' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
        >
          Partner Verifications ({applications.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('pickups')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${activeAdminTab === 'pickups' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
        >
          All Platform Pickups ({requests.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('complaints')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${activeAdminTab === 'complaints' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
        >
          Inquiries & Tickets ({complaints.length})
        </button>
        <button
          onClick={() => setActiveAdminTab('settings')}
          className={`px-3 py-1.5 rounded-lg transition-colors ${activeAdminTab === 'settings' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
        >
          Reward Multipliers & Config
        </button>
      </div>

      {/* Tab 1: Partner Verification Applications */}
      {activeAdminTab === 'applications' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-neutral-800">
            <h2 className="text-base font-bold text-white">Recycler & Refurbisher Verification Queue</h2>
            <p className="text-xs text-neutral-400">Authorize third-party aggregators after reviewing R2 certification credentials</p>
          </div>

          <div className="divide-y divide-neutral-800/80 text-xs">
            {applications.map((app) => (
              <div key={app.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{app.organizationName}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-950 border border-neutral-800 text-neutral-300">
                      {app.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                      app.status === 'approved' ? 'bg-emerald-950 text-emerald-400' : app.status === 'rejected' ? 'bg-red-950 text-red-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="text-neutral-400 font-mono text-xs">
                    Contact: {app.contactPerson} · {app.email} · Phone: {app.phone} · Location: {app.city}
                  </div>

                  <div className="text-neutral-500 font-mono text-[11px]">
                    Registration: {app.registrationNumber} · Facility Area: {app.facilityAreaSqFt.toLocaleString()} sq.ft · R2 Certified: {app.r2Certified ? 'Yes' : 'No'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {app.status === 'pending' ? (
                    <>
                      <button
                        onClick={() => handleApprovePartner(app.id)}
                        className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Partner</span>
                      </button>
                      <button
                        onClick={() => handleRejectPartner(app.id)}
                        className="px-3.5 py-1.5 bg-neutral-800 hover:bg-red-950 hover:text-red-300 text-neutral-300 rounded-xl text-xs font-semibold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-neutral-400 font-mono text-xs capitalize">Decision Recorded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: All Platform Pickups */}
      {activeAdminTab === 'pickups' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-neutral-800">
            <h2 className="text-base font-bold text-white">Central Custody Manifest</h2>
            <p className="text-xs text-neutral-400">All registered pickups across North Campus, Innovation Quad, and South Suburbs</p>
          </div>

          <div className="divide-y divide-neutral-800/80 text-xs">
            {requests.map((r) => (
              <div key={r.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="font-bold text-emerald-400">{r.id}</span>
                    <span className="text-neutral-400 uppercase">· {r.status}</span>
                    <span className="text-neutral-500">· {r.deviceCategory}</span>
                  </div>
                  <div className="font-semibold text-white">
                    {r.quantity}x {r.brand} {r.model} (Citizen: {r.userName})
                  </div>
                  <div className="text-neutral-400 font-mono text-[11px]">
                    Assigned Partner: {r.assignedPartnerName || 'Pending Hub Assignment'}
                  </div>
                </div>

                <button
                  onClick={() => onViewTracking(r.id)}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg font-mono text-xs shrink-0"
                >
                  Inspect Tracking
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Complaints & Inquiries */}
      {activeAdminTab === 'complaints' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-neutral-800">
            <h2 className="text-base font-bold text-white">Citizen Inquiries & Hazardous Escalations</h2>
            <p className="text-xs text-neutral-400">Resolve customer queries and dispatch safety kits</p>
          </div>

          <div className="divide-y divide-neutral-800/80 text-xs">
            {complaints.map((c) => (
              <div key={c.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-emerald-400 font-bold">{c.id}</span>
                    <span className="text-neutral-400">· {c.user}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      c.status === 'Resolved' ? 'bg-emerald-950 text-emerald-400' : 'bg-cyan-950 text-cyan-400'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                  <div className="font-bold text-white text-sm">{c.subject}</div>
                  <p className="text-neutral-300 text-xs">{c.detail}</p>
                </div>

                <div>
                  {c.status !== 'Resolved' ? (
                    <button
                      onClick={() => handleResolveComplaint(c.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold"
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span className="text-neutral-500 font-mono">Resolved</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Reward Settings */}
      {activeAdminTab === 'settings' && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-6 text-xs">
          <div>
            <h2 className="text-base font-bold text-white">Platform Reward Configuration</h2>
            <p className="text-xs text-neutral-400">Tune Eco-Point multipliers for campus hackathon drives or Earth Month campaigns</p>
          </div>

          <div className="max-w-md space-y-4">
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">
                Eco-Points Multiplier: <span className="text-emerald-400 font-mono font-bold">{pointMultiplier}x</span>
              </label>
              <input
                type="range"
                min="1.0"
                max="2.5"
                step="0.25"
                value={pointMultiplier}
                onChange={(e) => { setPointMultiplier(parseFloat(e.target.value)); setMultiplierSaved(false); }}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[11px] text-neutral-500 font-mono mt-1">
                <span>1.0x (Standard)</span>
                <span>1.5x (Campus Drive)</span>
                <span>2.5x (Earth Week Peak)</span>
              </div>
            </div>

            <button
              onClick={() => setMultiplierSaved(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs"
            >
              Save Reward Configuration
            </button>

            {multiplierSaved && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Multiplier set to {pointMultiplier}x across all registered drop-off pods!</span>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
