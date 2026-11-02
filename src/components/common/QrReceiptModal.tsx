import React from 'react';
import { PickupRequest } from '../../types';
import { X, Printer, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';

interface Props {
  request: PickupRequest | null;
  onClose: () => void;
}

export const QrReceiptModal: React.FC<Props> = ({ request, onClose }) => {
  if (!request) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8 text-neutral-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
          <div>
            <span className="text-xs font-mono text-emerald-400 tracking-wider uppercase">Official Chain of Custody</span>
            <h2 className="text-xl font-bold text-white mt-1">E-Waste Deposit Receipt</h2>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">Tracking ID: {request.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Code and Barcode Box */}
        <div className="my-6 p-6 bg-neutral-950 border border-neutral-800 rounded-xl flex flex-col items-center justify-center text-center">
          {/* Simulated High-Res QR SVG */}
          <div className="p-3 bg-white rounded-xl shadow-inner mb-3">
            <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none">
              {/* Outer boundary */}
              <rect x="0" y="0" width="100" height="100" fill="white" />
              {/* QR Finder Corners */}
              <rect x="10" y="10" width="24" height="24" fill="#090d0b" />
              <rect x="14" y="14" width="16" height="16" fill="white" />
              <rect x="18" y="18" width="8" height="8" fill="#090d0b" />

              <rect x="66" y="10" width="24" height="24" fill="#090d0b" />
              <rect x="70" y="14" width="16" height="16" fill="white" />
              <rect x="74" y="18" width="8" height="8" fill="#090d0b" />

              <rect x="10" y="66" width="24" height="24" fill="#090d0b" />
              <rect x="14" y="70" width="16" height="16" fill="white" />
              <rect x="18" y="74" width="8" height="8" fill="#090d0b" />

              {/* Data matrix dots */}
              <rect x="42" y="12" width="6" height="6" fill="#090d0b" />
              <rect x="52" y="12" width="6" height="6" fill="#090d0b" />
              <rect x="42" y="24" width="6" height="6" fill="#090d0b" />
              <rect x="12" y="44" width="6" height="6" fill="#090d0b" />
              <rect x="24" y="44" width="6" height="6" fill="#090d0b" />
              <rect x="36" y="36" width="6" height="6" fill="#090d0b" />
              <rect x="48" y="36" width="6" height="6" fill="#090d0b" />
              <rect x="60" y="36" width="6" height="6" fill="#090d0b" />
              <rect x="36" y="48" width="6" height="6" fill="#090d0b" />
              <rect x="48" y="48" width="6" height="6" fill="#090d0b" />
              <rect x="60" y="48" width="6" height="6" fill="#090d0b" />
              <rect x="72" y="48" width="6" height="6" fill="#090d0b" />
              <rect x="84" y="44" width="6" height="6" fill="#090d0b" />
              <rect x="42" y="60" width="6" height="6" fill="#090d0b" />
              <rect x="54" y="60" width="6" height="6" fill="#090d0b" />
              <rect x="42" y="72" width="6" height="6" fill="#090d0b" />
              <rect x="54" y="72" width="6" height="6" fill="#090d0b" />
              <rect x="66" y="72" width="6" height="6" fill="#090d0b" />
              <rect x="78" y="72" width="6" height="6" fill="#090d0b" />
              <rect x="42" y="84" width="6" height="6" fill="#090d0b" />
              <rect x="66" y="84" width="6" height="6" fill="#090d0b" />
              <rect x="78" y="84" width="6" height="6" fill="#090d0b" />
            </svg>
          </div>

          <p className="text-xs font-mono text-neutral-400 tracking-wider">{request.qrCodeToken}</p>
          <p className="text-xs text-neutral-500 mt-1">Scan at deposit kiosk or present to pickup driver</p>
        </div>

        {/* Details Table */}
        <div className="space-y-2.5 text-xs text-neutral-300 font-mono">
          <div className="flex justify-between py-1.5 border-b border-neutral-800">
            <span className="text-neutral-500">Device Description</span>
            <span className="text-white font-medium text-right">{request.quantity}x {request.brand} {request.model}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-neutral-800">
            <span className="text-neutral-500">Category & Condition</span>
            <span className="text-neutral-200 capitalize">{request.deviceCategory} · {request.condition.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-neutral-800">
            <span className="text-neutral-500">Disposal Pathway</span>
            <span className="text-emerald-400 capitalize">{request.disposalPreference}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-neutral-800">
            <span className="text-neutral-500">Scheduled Date & Slot</span>
            <span className="text-neutral-200">{request.preferredDate} ({request.timeSlot})</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-neutral-800">
            <span className="text-neutral-500">Deposit Mode</span>
            <span className="text-neutral-200">{request.pickupType === 'centre_dropoff' ? `Drop-off at ${request.centreName || 'Campus Depot'}` : 'Doorstep Pickup'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-neutral-800">
            <span className="text-neutral-500">Eco-Points Granted</span>
            <span className="text-emerald-400 font-bold tabular-nums">+{request.ecoPointsAwarded} Points (Upon Completion)</span>
          </div>
        </div>

        {/* Security Stamp */}
        <div className="mt-5 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-xl flex items-center gap-3 text-xs text-emerald-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Complies with R2v3 / ISO 14001 e-Stewards standards. Zero electronic waste diverted to unregulated landfills.</span>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Tag / Save PDF
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
