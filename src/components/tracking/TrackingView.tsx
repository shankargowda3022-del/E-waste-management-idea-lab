import React, { useState } from 'react';
import { PickupRequest, TrackingStage } from '../../types';
import { getPickupRequests, cancelPickupRequest } from '../../services/storage';
import { Search, CheckCircle2, Clock, MapPin, AlertCircle, FileText, XCircle, ArrowRight } from 'lucide-react';

interface Props {
  initialTrackingId?: string;
  onOpenReceipt: (request: PickupRequest) => void;
  onOpenPickupModal: () => void;
}

export const TrackingView: React.FC<Props> = ({
  initialTrackingId,
  onOpenReceipt,
  onOpenPickupModal
}) => {
  const allRequests = getPickupRequests();
  const [searchTerm, setSearchTerm] = useState<string>(initialTrackingId || 'ECY-2026-8941');
  const [selectedId, setSelectedId] = useState<string>(initialTrackingId || (allRequests[0]?.id || ''));
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('Found alternate reuse option on campus.');

  const currentRequest = allRequests.find(r => r.id.toLowerCase() === selectedId.toLowerCase()) || allRequests[0];

  const pipelineStages: { stage: TrackingStage; label: string; desc: string }[] = [
    { stage: 'submitted', label: 'Submitted', desc: 'Request registered & logged' },
    { stage: 'verified', label: 'Verified', desc: 'Specs & triage confirmed' },
    { stage: 'assigned', label: 'Assigned', desc: 'Partner allocated' },
    { stage: 'scheduled', label: 'Pickup Scheduled', desc: 'Logistics slot locked' },
    { stage: 'collected', label: 'Collected', desc: 'Physical scan & custody' },
    { stage: 'processing', label: 'Processing', desc: 'Repair / R2 Smelting' },
    { stage: 'completed', label: 'Completed', desc: 'Certified & Points issued' }
  ];

  const getStageIndex = (stage: TrackingStage): number => {
    if (stage === 'cancelled') return -1;
    return pipelineStages.findIndex(s => s.stage === stage);
  };

  const currentIndex = currentRequest ? getStageIndex(currentRequest.status) : 0;
  const isCancelled = currentRequest?.status === 'cancelled';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = allRequests.find(r => r.id.toLowerCase() === searchTerm.trim().toLowerCase());
    if (found) {
      setSelectedId(found.id);
    }
  };

  const handleConfirmCancel = () => {
    if (currentRequest) {
      cancelPickupRequest(currentRequest.id, cancelReason);
      setCancelModalOpen(false);
    }
  };

  return (
    <section className="py-12 bg-neutral-950 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-neutral-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              Chain of Custody Pipeline
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
              Live E-Waste Tracker
            </h1>
            <p className="text-xs text-neutral-400 mt-1">
              Verify real-time logistics, handling facility, and de-manufacturing status with cryptographic audit receipts.
            </p>
          </div>

          {/* Search box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 w-4 h-4 text-neutral-500 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Tracking ID (e.g. ECY-2026-8941)"
                className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors shrink-0"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Recent requests quick pill selector */}
        <div className="py-4 flex items-center gap-2 overflow-x-auto text-xs font-mono border-b border-neutral-800/60">
          <span className="text-neutral-500 shrink-0">Recent Shipments:</span>
          {allRequests.slice(0, 5).map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setSearchTerm(r.id); }}
              className={`px-2.5 py-1 rounded-lg transition-colors shrink-0 ${
                selectedId === r.id
                  ? 'bg-emerald-950/60 border border-emerald-600/60 text-emerald-300 font-bold'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {r.id} ({r.brand} {r.model.split(' ')[0]})
            </button>
          ))}
        </div>

        {currentRequest ? (
          <div className="mt-8 space-y-8">
            
            {/* Top metadata summary card */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-mono text-white">{currentRequest.id}</span>
                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono uppercase font-semibold ${
                    currentRequest.status === 'completed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      : currentRequest.status === 'cancelled'
                      ? 'bg-red-950 text-red-400 border border-red-800'
                      : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                  }`}>
                    {currentRequest.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm font-semibold text-neutral-200 mt-1">
                  {currentRequest.quantity}x {currentRequest.brand} {currentRequest.model}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5 font-mono">
                  Submitted on {currentRequest.createdAt} · Mode: {currentRequest.pickupType === 'centre_dropoff' ? 'Drop-off Kiosk' : 'Doorstep Pickup'}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onOpenReceipt(currentRequest)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View QR Receipt</span>
                </button>

                {(currentRequest.status === 'submitted' || currentRequest.status === 'verified') && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="px-4 py-2 bg-neutral-900 hover:bg-red-950/40 border border-neutral-700 text-neutral-400 hover:text-red-300 text-xs font-medium rounded-xl transition-colors"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>

            {/* Visual 7-Stage Stepper Pipeline */}
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
              <h2 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-6">
                Verification & Custody Pipeline
              </h2>

              {isCancelled ? (
                <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-xl text-red-300 flex items-center gap-3 text-xs">
                  <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <span className="font-bold">Request Cancelled: </span>
                    <span>This pickup was cancelled. No physical collection scheduled.</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                  {pipelineStages.map((s, idx) => {
                    const isPassed = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;
                    return (
                      <div
                        key={s.stage}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          isCurrent
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-950'
                            : isPassed
                            ? 'bg-neutral-950/80 border-emerald-900/60 text-neutral-300'
                            : 'bg-neutral-950/40 border-neutral-800/80 text-neutral-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[11px] font-mono font-bold ${isPassed ? 'text-emerald-400' : 'text-neutral-600'}`}>
                            0{idx + 1}
                          </span>
                          <CheckCircle2 className={`w-4 h-4 ${isPassed ? 'text-emerald-400' : 'text-neutral-700'}`} />
                        </div>

                        <div>
                          <div className={`text-xs font-bold leading-tight ${isPassed ? 'text-white' : 'text-neutral-500'}`}>
                            {s.label}
                          </div>
                          <div className="text-[10px] text-neutral-500 mt-1 leading-tight">
                            {s.desc}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Split Details: Timeline Logs on Left + Partner Details on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Timeline Logs */}
              <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <h3 className="text-xs font-mono uppercase tracking-wider text-neutral-400 mb-4">
                  Custody Event Logs
                </h3>

                <div className="space-y-4">
                  {currentRequest.trackingUpdates.map((u, i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-neutral-800/60 last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{u.title}</span>
                          <span className="text-[11px] font-mono text-neutral-500">{u.timestamp}</span>
                        </div>
                        <p className="text-neutral-300 mt-0.5 leading-relaxed">{u.description}</p>
                        {u.location && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{u.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partner & Impact Info */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Partner Card */}
                <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 mb-3">
                    Assigned Logistics Partner
                  </div>
                  <div className="text-sm font-bold text-white">
                    {currentRequest.assignedPartnerName || 'GreenTech Certified Solutions'}
                  </div>
                  <div className="text-xs text-neutral-400 mt-1">
                    Certified R2v3 / ISO 14001 E-Waste Aggregator
                  </div>
                  <div className="mt-3 pt-3 border-t border-neutral-800 text-xs text-neutral-300 space-y-1 font-mono">
                    <div>Contact: ops@greentech-ewaste.org</div>
                    <div>Dispatch Hub: Bay 14, CleanTech Eco-Park</div>
                  </div>
                </div>

                {/* Environmental Recovery Box */}
                <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-2 text-xs font-mono">
                  <div className="text-[11px] uppercase tracking-wider text-neutral-400">
                    Recovered Material Estimate
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
                    <span>Verified / Est Weight:</span>
                    <span className="text-white font-bold">{currentRequest.verifiedWeightKg || currentRequest.estimatedWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-neutral-800 text-neutral-300">
                    <span>Avoided CO2e:</span>
                    <span className="text-emerald-400 font-bold">~{((currentRequest.estimatedWeightKg || 1) * 22).toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between py-1 text-neutral-300">
                    <span>Eco-Points:</span>
                    <span className="text-cyan-400 font-bold">+{currentRequest.ecoPointsAwarded} pts</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="mt-12 p-12 bg-neutral-900 border border-neutral-800 rounded-2xl text-center">
            <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">Tracking Code Not Found</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              We couldn’t find an order matching "{searchTerm}". Please check your tracking receipt or book a new pickup.
            </p>
            <button
              onClick={onOpenPickupModal}
              className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
            >
              Book New Pickup
            </button>
          </div>
        )}

      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-xs space-y-4">
            <h3 className="text-base font-bold text-white">Confirm Cancellation</h3>
            <p className="text-neutral-400">
              Are you sure you want to cancel pickup request <strong className="text-white">{currentRequest?.id}</strong>? The logistics slot will be released.
            </p>
            <div>
              <label className="block text-neutral-300 font-semibold mb-1">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
              >
                <option value="Found alternate reuse option on campus.">Found alternate reuse option on campus</option>
                <option value="Device repaired successfully.">Device repaired successfully</option>
                <option value="Schedule conflict with pickup window.">Schedule conflict with pickup window</option>
                <option value="Mistake in device specification.">Mistake in device specification</option>
              </select>
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setCancelModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl font-medium"
              >
                Keep Active
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold"
              >
                Yes, Cancel Pickup
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
