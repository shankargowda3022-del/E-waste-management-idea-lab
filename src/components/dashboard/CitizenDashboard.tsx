import React, { useState } from 'react';
import { User, PickupRequest } from '../../types';
import { getPickupRequests, cancelPickupRequest } from '../../services/storage';
import { Recycle, Award, Globe, Plus, Clock, FileText, ArrowRight, XCircle, CheckCircle2, ChevronRight } from 'lucide-react';

interface Props {
  currentUser: User;
  onOpenPickupModal: () => void;
  onViewTracking: (trackingId: string) => void;
  onOpenReceipt: (req: PickupRequest) => void;
  onGoToRewards: () => void;
}

export const CitizenDashboard: React.FC<Props> = ({
  currentUser,
  onOpenPickupModal,
  onViewTracking,
  onOpenReceipt,
  onGoToRewards
}) => {
  const requests = getPickupRequests().filter(r => r.userId === currentUser.id);
  const [filterStatus, setFilterStatus] = useState<string>('all');

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

  return (
    <div className="space-y-8">
      
      {/* Welcome Banner & Quick Action */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase">Citizen Sustainability Portal</span>
          <h1 className="text-2xl font-bold text-white mt-1">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            {currentUser.organization || 'Campus Community Resident'} · {currentUser.address}
          </p>
        </div>

        <button
          onClick={onOpenPickupModal}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-md shadow-emerald-950 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New E-Waste Pickup Request</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Devices Recycled</div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">
            {currentUser.devicesRecycled} <span className="text-sm font-normal text-neutral-400">units</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Verified handovers</div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Eco-Points Balance</div>
          <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {currentUser.ecoPoints} <span className="text-sm font-normal text-emerald-300">pts</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 cursor-pointer hover:underline" onClick={onGoToRewards}>
            Redeem rewards →
          </div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Avoided Lifecycle CO2</div>
          <div className="text-3xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
            {currentUser.carbonSavedKg} <span className="text-sm font-normal text-cyan-300">kg CO2e</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">~{Math.round(currentUser.carbonSavedKg / 21)} tree-years</div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Active Pickups</div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">
            {pendingRequests.length} <span className="text-sm font-normal text-neutral-400">in flight</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Chain of custody active</div>
        </div>

      </div>

      {/* Pickup Requests Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        
        <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Your E-Waste Pickup Requests</h2>
            <p className="text-xs text-neutral-400">Manage submissions, view live tracking, or cancel pending collections</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === 'all' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              All ({requests.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === 'active' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              Active ({pendingRequests.length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-3 py-1 rounded-lg transition-colors ${filterStatus === 'completed' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              Completed ({completedRequests.length})
            </button>
          </div>
        </div>

        {displayedRequests.length > 0 ? (
          <div className="divide-y divide-neutral-800/80 text-xs">
            {displayedRequests.map((req) => (
              <div
                key={req.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-850/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-emerald-400">{req.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                      req.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : req.status === 'cancelled'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                    }`}>
                      {req.status.replace('_', ' ')}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px] capitalize">· {req.disposalPreference}</span>
                  </div>

                  <div className="font-semibold text-white text-sm">
                    {req.quantity}x {req.brand} {req.model}
                  </div>

                  <div className="text-neutral-400 text-xs font-mono">
                    Scheduled: {req.preferredDate} ({req.timeSlot}) · {req.pickupType === 'centre_dropoff' ? `Drop-off at ${req.centreName || 'Campus Hub'}` : 'Doorstep Pickup'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onViewTracking(req.id)}
                    className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl transition-colors flex items-center gap-1"
                  >
                    <span>Track Pipeline</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenReceipt(req)}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors"
                    title="View QR Tag Receipt"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  </button>

                  {(req.status === 'submitted' || req.status === 'verified') && (
                    <button
                      onClick={() => handleCancel(req.id)}
                      className="px-3 py-1.5 bg-neutral-950 hover:bg-red-950 border border-neutral-800 text-neutral-400 hover:text-red-300 text-xs rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Recycle className="w-8 h-8 text-neutral-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white">No requests found in this filter</h3>
            <p className="text-xs text-neutral-400 mt-1">Schedule your first e-waste collection to begin earning points.</p>
            <button
              onClick={onOpenPickupModal}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
            >
              Schedule Pickup
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
