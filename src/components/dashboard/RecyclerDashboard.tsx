import React, { useState } from 'react';
import { User, PickupRequest, TrackingStage } from '../../types';
import { getPickupRequests, updateRequestStatus } from '../../services/storage';
import { Truck, CheckCircle2, ChevronRight, Scale, ShieldCheck, AlertCircle, FileText } from 'lucide-react';

interface Props {
  currentUser: User;
  onOpenReceipt: (req: PickupRequest) => void;
  onViewTracking: (id: string) => void;
}

export const RecyclerDashboard: React.FC<Props> = ({ currentUser, onOpenReceipt, onViewTracking }) => {
  const requests = getPickupRequests();
  const [selectedStatusTab, setSelectedStatusTab] = useState<'all' | 'assigned' | 'collected' | 'completed'>('all');
  const [weightInput, setWeightInput] = useState<Record<string, number>>({});
  const [statusNote, setStatusNote] = useState<Record<string, string>>({});
  const [actionFeedback, setActionFeedback] = useState<string>('');

  const filteredRequests = requests.filter(r => {
    if (selectedStatusTab === 'all') return true;
    if (selectedStatusTab === 'assigned') return r.status === 'assigned' || r.status === 'scheduled';
    if (selectedStatusTab === 'collected') return r.status === 'collected' || r.status === 'processing';
    if (selectedStatusTab === 'completed') return r.status === 'completed';
    return true;
  });

  const handleAdvanceStatus = (req: PickupRequest, nextStage: TrackingStage) => {
    const verifiedKg = weightInput[req.id] !== undefined ? weightInput[req.id] : req.estimatedWeightKg;
    const note = statusNote[req.id] || undefined;

    updateRequestStatus(req.id, nextStage, note, verifiedKg, currentUser.name);
    setActionFeedback(`Request ${req.id} advanced to ${nextStage.toUpperCase()}. Verified weight: ${verifiedKg} kg.`);
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const getNextStage = (curr: TrackingStage): { next: TrackingStage; label: string } | null => {
    switch (curr) {
      case 'submitted':
        return { next: 'verified', label: 'Verify Specs & Triage' };
      case 'verified':
        return { next: 'assigned', label: 'Accept Job & Assign Hub' };
      case 'assigned':
        return { next: 'scheduled', label: 'Schedule Logistics Route' };
      case 'scheduled':
        return { next: 'collected', label: 'Mark Hardware Collected' };
      case 'collected':
        return { next: 'processing', label: 'Enter De-manufacturing & Smelting' };
      case 'processing':
        return { next: 'completed', label: 'Certify R2 Recovery & Issue Points' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-emerald-400 uppercase">Certified Recycler & Operations Console</span>
          <h1 className="text-2xl font-bold text-white mt-1">
            {currentUser.organization || 'GreenTech Certified Solutions'}
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono">
            R2v3 Certified Processor #R2-2026-991 · CPCB Authorized E-Waste Smelter
          </p>
        </div>

        <div className="flex items-center gap-2 p-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-mono text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Chain of Custody Verifier Active</span>
        </div>
      </div>

      {actionFeedback && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Recycler KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Total Jobs Assigned</div>
          <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">{requests.length}</div>
          <div className="text-[11px] text-neutral-400 mt-1">Across campus & regional pods</div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Processed Mass</div>
          <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
            {currentUser.carbonSavedKg ? Math.round(currentUser.carbonSavedKg * 1.8) : 2480} <span className="text-sm font-normal text-emerald-300">kg</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Verified R2 de-pollution</div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Critical Metals Yield</div>
          <div className="text-3xl font-bold text-amber-400 font-mono tabular-nums mt-1">
            98.1% <span className="text-sm font-normal text-amber-300">Au/Cu</span>
          </div>
          <div className="text-[11px] text-neutral-400 mt-1">Hydrometallurgical purity</div>
        </div>

        <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <div className="text-xs font-mono text-neutral-500 uppercase">Compliance Score</div>
          <div className="text-3xl font-bold text-cyan-400 font-mono tabular-nums mt-1">100%</div>
          <div className="text-[11px] text-neutral-400 mt-1">DoD 5220 data certificates verified</div>
        </div>
      </div>

      {/* Operations Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        
        <div className="p-5 border-b border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white">Logistics & De-Manufacturing Queue</h2>
            <p className="text-xs text-neutral-400">Accept jobs, record verified weights, and advance custody stages</p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setSelectedStatusTab('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${selectedStatusTab === 'all' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              All Jobs ({requests.length})
            </button>
            <button
              onClick={() => setSelectedStatusTab('assigned')}
              className={`px-3 py-1 rounded-lg transition-colors ${selectedStatusTab === 'assigned' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              Assigned / Routing
            </button>
            <button
              onClick={() => setSelectedStatusTab('collected')}
              className={`px-3 py-1 rounded-lg transition-colors ${selectedStatusTab === 'collected' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              In Processing
            </button>
            <button
              onClick={() => setSelectedStatusTab('completed')}
              className={`px-3 py-1 rounded-lg transition-colors ${selectedStatusTab === 'completed' ? 'bg-neutral-800 text-white font-semibold' : 'text-neutral-400 hover:text-white'}`}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="divide-y divide-neutral-800/80 text-xs">
          {filteredRequests.map((req) => {
            const nextAction = getNextStage(req.status);
            return (
              <div
                key={req.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-neutral-850/40 transition-colors"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-emerald-400">{req.id}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-neutral-950 border border-neutral-800 text-neutral-300">
                      {req.status}
                    </span>
                    <span className="text-neutral-400 font-mono text-[11px]">
                      Citizen: {req.userName} ({req.userPhone})
                    </span>
                  </div>

                  <div className="font-semibold text-white text-sm">
                    {req.quantity}x {req.brand} {req.model} ({req.deviceCategory})
                  </div>

                  <div className="text-neutral-400 text-xs font-mono">
                    Address: {req.address} · Preferred: {req.preferredDate} ({req.timeSlot})
                  </div>

                  {req.condition === 'hazardous' && (
                    <div className="inline-flex items-center gap-1.5 text-amber-400 font-mono text-[11px] bg-amber-950/40 px-2 py-0.5 rounded border border-amber-900/60">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>HAZARDOUS: Priority battery handling & UN-box dispatch required</span>
                    </div>
                  )}
                </div>

                {/* Recycler Controls */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                  
                  {/* Verified weight input if before completed */}
                  {req.status !== 'completed' && req.status !== 'cancelled' && (
                    <div className="flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded-xl px-2.5 py-1.5">
                      <Scale className="w-3.5 h-3.5 text-neutral-400" />
                      <input
                        type="number"
                        step="0.1"
                        placeholder={`${req.estimatedWeightKg} kg`}
                        value={weightInput[req.id] !== undefined ? weightInput[req.id] : ''}
                        onChange={(e) => setWeightInput({ ...weightInput, [req.id]: parseFloat(e.target.value) || 0 })}
                        className="w-16 bg-transparent text-white font-mono text-xs focus:outline-none"
                      />
                      <span className="text-neutral-500 font-mono text-[11px]">kg</span>
                    </div>
                  )}

                  {/* Advance Action Button */}
                  {nextAction && (
                    <button
                      onClick={() => handleAdvanceStatus(req, nextAction.next)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>{nextAction.label}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* QR Receipt */}
                  <button
                    onClick={() => onOpenReceipt(req)}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors"
                    title="View QR receipt"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  </button>

                  <button
                    onClick={() => onViewTracking(req.id)}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition-colors"
                    title="View live public tracking"
                  >
                    <Truck className="w-3.5 h-3.5" />
                  </button>

                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};
