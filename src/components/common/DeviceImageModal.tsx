import React, { useEffect } from 'react';
import { X, Clock, FileImage, ShieldCheck } from 'lucide-react';
import { formatRequestDateTime } from '../../services/storage';

interface DeviceImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string;
  imageName?: string;
  title?: string;
  requestId?: string;
  submittedAt?: string;
  citizenName?: string;
}

export const DeviceImageModal: React.FC<DeviceImageModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
  title,
  requestId,
  submittedAt,
  citizenName
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-[#123D32]/60 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Citizen uploaded device photo preview"
    >
      <div
        className="w-full max-w-2xl bg-white border border-[#DCE6E0] rounded-2xl shadow-2xl overflow-hidden animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#F7FAF8] border-b border-[#E3ECE7] flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs text-[#123D32] font-semibold">
              <FileImage className="w-4 h-4 text-[#16A36A] shrink-0" />
              <span className="truncate">{title || 'Citizen Hardware Photo'}</span>
              {requestId && (
                <>
                  <span className="text-[#718078]" aria-hidden="true">·</span>
                  <span className="font-mono text-[#16A36A] shrink-0">{requestId}</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-[#718078]">
              {citizenName && <span>Submitted by {citizenName}</span>}
              {submittedAt && (
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3 text-[#16A36A]" />
                  {formatRequestDateTime(submittedAt)}
                </span>
              )}
              {imageName && (
                <span className="font-mono truncate max-w-[200px]">{imageName}</span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close photo preview"
            className="w-9 h-9 rounded-lg border border-[#DCE6E0] bg-white hover:bg-[#F7FAF8] text-[#182B26] flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Full Photo */}
        <div className="p-4 sm:p-6 bg-[#F7FAF8] flex items-center justify-center">
          <img
            src={imageUrl}
            alt={title || 'Uploaded hardware photo'}
            referrerPolicy="no-referrer"
            className="max-h-[65vh] w-auto max-w-full rounded-xl border border-[#DCE6E0] shadow-sm object-contain bg-white"
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-white border-t border-[#E3ECE7] flex items-center justify-between text-xs text-[#718078]">
          <span className="inline-flex items-center gap-1.5 text-[#123D32] font-medium">
            <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
            Verified inspection photo attached to custody record
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[#123D32] hover:bg-[#0D2E25] text-white font-semibold transition-colors whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
