import React, { useState } from 'react';
import { PickupRequest, TrackingStage } from '../../types';
import { getPickupRequests, cancelPickupRequest, formatRequestDateTime } from '../../services/storage';
import { DeviceImageModal } from '../common/DeviceImageModal';
import { Search, CheckCircle2, MapPin, AlertCircle, FileText, XCircle, Clock, Image as ImageIcon, ZoomIn } from 'lucide-react';

interface Props {
  initialTrackingId?: string;
  onOpenReceipt: (request: PickupRequest) => void;
  onOpenPickupModal: () => void;
  onExploreCentres?: () => void;
  onNavigateHome?: () => void;
  onGoToDashboard?: () => void;
  onGoToRewards?: () => void;
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
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const currentRequest = allRequests.find(r => r.id.toLowerCase() === selectedId.toLowerCase()) || allRequests[0];

  const pipelineStages: { stage: TrackingStage; label: string; desc: string }[] = [
    { stage: 'submitted', label: '1. Request Submitted', desc: 'Request submitted & queued' },
    { stage: 'verified', label: '2. Request Verified', desc: 'Specs & eligibility verified' },
    { stage: 'assigned', label: '3. Request Accepted', desc: 'Accepted by certified partner' },
    { stage: 'scheduled', label: '4. Assigned to Crew', desc: 'Collection crew route scheduled' },
    { stage: 'collected', label: '5. Device Collected', desc: 'Hardware safely collected from doorstep' },
    { stage: 'processing', label: '6. Under Processing', desc: 'Diagnostics, repair or R2 smelting' },
    { stage: 'completed', label: '7. Certified & Rewarded', desc: 'Certified & Eco-Points credited' }
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

  const uploadedPhoto = currentRequest?.deviceImage || currentRequest?.aiDiagnosis?.imageUrl;

  return (
    <section className="py-12 bg-[#F7FAF8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#DCE6E0]">
          <div>
            <div className="text-xs font-mono font-semibold text-[#16A36A]">
              Chain of Custody Pipeline
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#182B26] mt-1">
              Live E-Waste Tracker
            </h1>
            <p className="text-xs text-[#718078] mt-1">
              Verify real-time logistics, handling facility, and de-manufacturing status with cryptographic audit receipts.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-sm w-full">
            <div className="relative flex-1">
              <Search className="absolute left-3 w-4 h-4 text-[#718078] top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter Tracking ID (e.g. ECY-2026-8941)"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#DCE6E0] rounded-xl text-xs text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              Lookup
            </button>
          </form>
        </div>

        {/* Recent requests quick selector */}
        <div className="py-4 flex items-center gap-2 overflow-x-auto text-xs font-mono border-b border-[#E3ECE7]">
          <span className="text-[#718078] shrink-0 font-sans font-medium">Recent Shipments:</span>
          {allRequests.slice(0, 5).map(r => (
            <button
              key={r.id}
              onClick={() => { setSelectedId(r.id); setSearchTerm(r.id); }}
              className={`px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                selectedId === r.id
                  ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                  : 'bg-white border border-[#DCE6E0] text-[#718078] hover:text-[#182B26]'
              }`}
            >
              {r.id} ({r.brand} {r.model.split(' ')[0]})
            </button>
          ))}
        </div>

        {currentRequest ? (
          <div className="mt-8 space-y-8">
            
            {/* Top metadata summary card */}
            <div className="p-6 eco-card rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                {uploadedPhoto && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="group relative w-20 h-20 rounded-xl overflow-hidden border border-[#DCE6E0] bg-[#F7FAF8] shrink-0 cursor-pointer shadow-sm"
                    title="Inspect uploaded device photo"
                  >
                    <img
                      src={uploadedPhoto}
                      alt={`${currentRequest.brand} ${currentRequest.model}`}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-0 bg-[#123D32]/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </button>
                )}

                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-xl font-bold font-mono text-[#123D32]">{currentRequest.id}</span>
                    <span className="text-[#718078]" aria-hidden="true">·</span>
                    <span className={`text-xs font-mono uppercase font-bold ${
                      currentRequest.status === 'completed'
                        ? 'text-[#16A36A]'
                        : currentRequest.status === 'cancelled'
                        ? 'text-red-600'
                        : 'text-[#123D32]'
                    }`}>
                      {currentRequest.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#182B26] mt-1">
                    {currentRequest.quantity}x {currentRequest.brand} {currentRequest.model}
                  </div>
                  <div className="text-xs text-[#718078] mt-1 font-mono flex items-center gap-2 flex-wrap tabular-nums">
                    <span className="inline-flex items-center gap-1 text-[#182B26]">
                      <Clock className="w-3.5 h-3.5 text-[#16A36A]" />
                      Submitted on {formatRequestDateTime(currentRequest.submittedAt || currentRequest.createdAt)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>Mode: {currentRequest.pickupType === 'centre_dropoff' ? 'Drop-off Kiosk' : 'Doorstep Pickup'}</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5 flex-wrap">
                {uploadedPhoto && (
                  <button
                    type="button"
                    onClick={() => setShowPhotoModal(true)}
                    className="px-4 py-2 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#123D32] text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#16A36A]" />
                    <span>View Device Photo</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenReceipt(currentRequest)}
                  className="px-4 py-2 bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-[#B9F5D0]" />
                  <span>View QR Receipt</span>
                </button>

                {(currentRequest.status === 'submitted' || currentRequest.status === 'verified') && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="px-4 py-2 bg-white hover:bg-red-50 border border-[#DCE6E0] text-[#718078] hover:text-red-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            </div>

            {/* Visual 7-Stage Stepper Pipeline */}
            <div className="p-6 eco-card rounded-2xl">
              <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#718078] mb-5">
                Verification & Custody Pipeline
              </h2>

              {isCancelled ? (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-3 text-xs">
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <div>
                    <span className="font-bold">Request Cancelled: </span>
                    <span>This pickup was cancelled. No physical collection scheduled.</span>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3.5">
                  {pipelineStages.map((s, idx) => {
                    const isPassed = idx <= currentIndex;
                    const isCurrent = idx === currentIndex;
                    return (
                      <div
                        key={s.stage}
                        className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                          isCurrent
                            ? 'bg-[#B9F5D0]/35 border-[#16A36A] shadow-sm'
                            : isPassed
                            ? 'bg-[#F7FAF8] border-[#CBE0D3] text-[#182B26]'
                            : 'bg-white border-[#E6EEE9] text-[#718078]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[11px] font-mono font-bold tabular-nums ${isPassed ? 'text-[#16A36A]' : 'text-[#718078]'}`}>
                            0{idx + 1}
                          </span>
                          <CheckCircle2 className={`w-4 h-4 ${isPassed ? 'text-[#16A36A]' : 'text-[#D0DDD5]'}`} />
                        </div>

                        <div>
                          <div className={`text-xs font-bold leading-tight ${isPassed ? 'text-[#182B26]' : 'text-[#718078]'}`}>
                            {s.label}
                          </div>
                          <div className="text-[10px] text-[#718078] mt-1 leading-tight">
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
              
              <div className="lg:col-span-7 eco-card rounded-2xl p-6">
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#718078] mb-4">
                  Custody Event Logs
                </h3>

                <div className="space-y-4">
                  {currentRequest.trackingUpdates.map((u, i) => (
                    <div key={i} className="flex items-start gap-3 pb-4 border-b border-[#E3ECE7] last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-[#16A36A] mt-1.5 shrink-0" />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold text-[#182B26]">{u.title}</span>
                          <span className="text-[11px] font-mono text-[#718078] tabular-nums">{u.timestamp}</span>
                        </div>
                        <p className="text-[#718078] mt-0.5 leading-relaxed">{u.description}</p>
                        {u.location && (
                          <div className="flex items-center gap-1 text-[11px] font-mono text-[#16A36A] mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{u.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4">
                
                <div className="p-5 eco-card rounded-2xl">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#718078] mb-3">
                    Assigned Logistics Partner
                  </div>
                  <div className="text-sm font-bold text-[#182B26]">
                    {currentRequest.assignedPartnerName || 'GreenTech Certified Solutions'}
                  </div>
                  <div className="text-xs text-[#718078] mt-1">
                    Certified R2v3 / ISO 14001 E-Waste Aggregator
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#E3ECE7] text-xs text-[#182B26] space-y-1 font-mono">
                    <div>Contact: ops@greentech-ewaste.org</div>
                    <div>Dispatch Hub: Bay 14, CleanTech Eco-Park</div>
                  </div>
                </div>

                <div className="p-5 eco-card rounded-2xl space-y-2 text-xs font-mono">
                  <div className="text-[11px] uppercase tracking-wider text-[#718078]">
                    Recovered Material Estimate
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E3ECE7] text-[#718078]">
                    <span>Verified / Est Weight:</span>
                    <span className="text-[#182B26] font-bold tabular-nums">{currentRequest.verifiedWeightKg || currentRequest.estimatedWeightKg} kg</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-[#E3ECE7] text-[#718078]">
                    <span>Avoided CO2e:</span>
                    <span className="text-[#16A36A] font-bold tabular-nums">~{((currentRequest.estimatedWeightKg || 1) * 22).toFixed(1)} kg</span>
                  </div>
                  <div className="flex justify-between py-1.5 text-[#718078]">
                    <span>Eco-Points:</span>
                    <span className="text-[#123D32] font-bold tabular-nums">+{currentRequest.ecoPointsAwarded} pts</span>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="mt-12 p-12 eco-card rounded-2xl text-center">
            <AlertCircle className="w-8 h-8 text-[#718078] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#182B26]">Tracking Code Not Found</h3>
            <p className="text-xs text-[#718078] mt-1 max-w-sm mx-auto">
              We couldn’t find an order matching "{searchTerm}". Please check your tracking receipt or book a new pickup.
            </p>
            <button
              onClick={onOpenPickupModal}
              className="mt-4 px-4 py-2 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl cursor-pointer"
            >
              Book New Pickup
            </button>
          </div>
        )}

      </div>

      {/* Cancel Confirmation Dialog */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123D32]/55 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-[#DCE6E0] rounded-2xl p-6 text-xs space-y-4 shadow-2xl animate-modal-in">
            <h3 className="text-base font-bold text-[#182B26]">Confirm Cancellation</h3>
            <p className="text-[#718078]">
              Are you sure you want to cancel pickup request <strong className="text-[#182B26]">{currentRequest?.id}</strong>? The logistics slot will be released.
            </p>
            <div>
              <label className="block text-[#182B26] font-semibold mb-1">Reason for Cancellation</label>
              <select
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26]"
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
                className="px-4 py-2 bg-[#F7FAF8] hover:bg-[#EDF3EF] border border-[#DCE6E0] text-[#182B26] rounded-xl font-medium cursor-pointer"
              >
                Keep Active
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold cursor-pointer"
              >
                Yes, Cancel Pickup
              </button>
            </div>
          </div>
        </div>
      )}

      <DeviceImageModal
        isOpen={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        imageUrl={uploadedPhoto}
        imageName={currentRequest?.deviceImageName}
        title={currentRequest ? `${currentRequest.quantity}x ${currentRequest.brand} ${currentRequest.model}` : undefined}
        requestId={currentRequest?.id}
        submittedAt={currentRequest?.submittedAt || currentRequest?.createdAt}
        citizenName={currentRequest?.userName}
      />

    </section>
  );
};
