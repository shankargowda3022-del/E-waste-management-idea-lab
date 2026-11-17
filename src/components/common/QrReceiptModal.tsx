import React from 'react';
import { PickupRequest } from '../../types';
import { formatRequestDateTime } from '../../services/storage';
import { X, Printer, ShieldCheck } from 'lucide-react';

interface Props {
  request: PickupRequest | null;
  onClose: () => void;
}

export const QrReceiptModal: React.FC<Props> = ({ request, onClose }) => {
  if (!request) return null;

  const handlePrint = () => {
    window.print();
  };

  const uploadedPhoto = request.deviceImage || request.aiDiagnosis?.imageUrl;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-[#123D32]/55 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg my-auto bg-white border border-[#DCE6E0] rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-[#182B26] box-border min-w-0 max-h-[92vh] overflow-y-auto animate-modal-in">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E3ECE7]">
          <div>
            <span className="text-xs font-mono font-semibold text-[#16A36A] tracking-wider uppercase">Official Chain of Custody</span>
            <h2 className="text-xl font-bold text-[#182B26] mt-1">E-Waste Deposit Receipt</h2>
            <p className="text-xs text-[#718078] font-mono mt-0.5">Tracking ID: {request.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#718078] hover:text-[#182B26] rounded-lg hover:bg-[#F7FAF8] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code Box */}
        <div className="my-5 p-6 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl flex flex-col items-center justify-center text-center">
          <div className="p-3 bg-white rounded-xl border border-[#DCE6E0] shadow-sm mb-3">
            <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              <rect x="10" y="10" width="24" height="24" fill="#123D32" />
              <rect x="14" y="14" width="16" height="16" fill="white" />
              <rect x="18" y="18" width="8" height="8" fill="#123D32" />
              <rect x="66" y="10" width="24" height="24" fill="#123D32" />
              <rect x="70" y="14" width="16" height="16" fill="white" />
              <rect x="74" y="18" width="8" height="8" fill="#123D32" />
              <rect x="10" y="66" width="24" height="24" fill="#123D32" />
              <rect x="14" y="70" width="16" height="16" fill="white" />
              <rect x="18" y="74" width="8" height="8" fill="#123D32" />
              <rect x="42" y="12" width="6" height="6" fill="#123D32" />
              <rect x="52" y="12" width="6" height="6" fill="#123D32" />
              <rect x="42" y="24" width="6" height="6" fill="#123D32" />
              <rect x="12" y="44" width="6" height="6" fill="#123D32" />
              <rect x="24" y="44" width="6" height="6" fill="#123D32" />
              <rect x="36" y="36" width="6" height="6" fill="#16A36A" />
              <rect x="48" y="36" width="6" height="6" fill="#123D32" />
              <rect x="60" y="36" width="6" height="6" fill="#123D32" />
              <rect x="36" y="48" width="6" height="6" fill="#123D32" />
              <rect x="48" y="48" width="6" height="6" fill="#16A36A" />
              <rect x="60" y="48" width="6" height="6" fill="#123D32" />
              <rect x="72" y="48" width="6" height="6" fill="#123D32" />
              <rect x="84" y="44" width="6" height="6" fill="#123D32" />
              <rect x="42" y="60" width="6" height="6" fill="#123D32" />
              <rect x="54" y="60" width="6" height="6" fill="#123D32" />
              <rect x="42" y="72" width="6" height="6" fill="#123D32" />
              <rect x="54" y="72" width="6" height="6" fill="#123D32" />
              <rect x="66" y="72" width="6" height="6" fill="#16A36A" />
              <rect x="78" y="72" width="6" height="6" fill="#123D32" />
              <rect x="42" y="84" width="6" height="6" fill="#123D32" />
              <rect x="66" y="84" width="6" height="6" fill="#123D32" />
              <rect x="78" y="84" width="6" height="6" fill="#123D32" />
            </svg>
          </div>

          <p className="text-xs font-mono text-[#123D32] font-semibold tracking-wider">{request.qrCodeToken}</p>
          <p className="text-xs text-[#718078] mt-1">Scan at deposit kiosk or present to pickup driver</p>
        </div>

        {uploadedPhoto && (
          <div className="mb-4 p-3 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl flex items-center gap-3">
            <img
              src={uploadedPhoto}
              alt={`${request.brand} ${request.model}`}
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-lg object-cover border border-[#DCE6E0] shrink-0"
            />
            <div className="text-xs">
              <div className="font-semibold text-[#182B26]">Attached Device Photo</div>
              <div className="text-[#718078] font-mono text-[11px] truncate max-w-[260px]">
                {request.deviceImageName || 'Verified submission photo'}
              </div>
            </div>
          </div>
        )}

        {/* Details Table */}
        <div className="space-y-2 text-xs text-[#718078] font-mono">
          <div className="flex justify-between py-1.5 border-b border-[#E3ECE7]">
            <span>Submitted On</span>
            <span className="text-[#182B26] font-semibold text-right tabular-nums">
              {formatRequestDateTime(request.submittedAt || request.createdAt)}
            </span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E3ECE7]">
            <span>Device Description</span>
            <span className="text-[#182B26] font-medium text-right">{request.quantity}x {request.brand} {request.model}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E3ECE7]">
            <span>Category & Condition</span>
            <span className="text-[#182B26] capitalize">{request.deviceCategory} · {request.condition.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E3ECE7]">
            <span>Disposal Pathway</span>
            <span className="text-[#16A36A] font-semibold capitalize">{request.disposalPreference}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E3ECE7]">
            <span>Scheduled Date & Slot</span>
            <span className="text-[#182B26] tabular-nums">{request.preferredDate} ({request.timeSlot})</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E3ECE7]">
            <span>Deposit Mode</span>
            <span className="text-[#182B26] text-right">{request.pickupType === 'centre_dropoff' ? `Drop-off at ${request.centreName || 'Campus Depot'}` : 'Doorstep Pickup'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-[#E3ECE7]">
            <span>Eco-Points Granted</span>
            <span className="text-[#16A36A] font-bold tabular-nums">+{request.ecoPointsAwarded} Points (Upon Completion)</span>
          </div>
        </div>

        {/* Security Stamp */}
        <div className="mt-5 p-3 bg-[#B9F5D0]/30 border border-[#16A36A]/30 rounded-xl flex items-center gap-3 text-xs text-[#123D32]">
          <ShieldCheck className="w-5 h-5 text-[#16A36A] shrink-0" />
          <span>Complies with R2v3 / ISO 14001 e-Stewards standards. Zero electronic waste diverted to unregulated landfills.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F7FAF8] hover:bg-white border border-[#DCE6E0] text-[#182B26] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#16A36A]" />
            Print Tag / Save PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
