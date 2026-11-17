import React, { useState, useEffect, useRef } from 'react';
import { User, UserNotification, TrackingStage } from '../../types';
import { getUserNotifications, markNotificationAsRead } from '../../services/storage';
import {
  Bell,
  CheckCircle2,
  Truck,
  Wrench,
  Recycle,
  Sparkles,
  ArrowRight,
  X,
  Award,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface Props {
  currentUser: User;
  onViewTracking: (trackingId: string) => void;
}

interface ToastItem {
  id: string;
  notification: UserNotification;
  stage?: TrackingStage;
  stageNumber?: number;
}

// Gentle pleasant dual-tone synthesized audio chime using Web Audio API
const playNotificationChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    // High-tech pleasant positive chords (880Hz A5 -> 1174.66Hz D6)
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1174.66, now + 0.12);

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(440, now);
    osc2.frequency.exponentialRampToValueAtTime(587.33, now + 0.12);

    gainNode.gain.setValueAtTime(0.08, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.36);
    osc2.stop(now + 0.36);
  } catch {
    // Graceful fallback if user hasn't interacted or audio is muted
  }
};

const STAGE_NUMBERS: Record<string, { num: number; total: number; label: string }> = {
  submitted: { num: 1, total: 7, label: 'Stage 1: Request Submitted' },
  verified: { num: 2, total: 7, label: 'Stage 2: Request Verified' },
  assigned: { num: 3, total: 7, label: 'Stage 3: Request Accepted' },
  scheduled: { num: 4, total: 7, label: 'Stage 4: Assigned to Crew' },
  collected: { num: 5, total: 7, label: 'Stage 5: Device Collected' },
  processing: { num: 6, total: 7, label: 'Stage 6: Under Processing' },
  completed: { num: 7, total: 7, label: 'Stage 7: Certified & Rewarded' }
};

export const NotificationToast: React.FC<Props> = ({ currentUser, onViewTracking }) => {
  const [activeToasts, setActiveToasts] = useState<ToastItem[]>([]);
  const knownNotificationIds = useRef<Set<string>>(new Set());
  const isFirstMount = useRef(true);

  useEffect(() => {
    // Populate existing IDs on first load so we don't spam toasts on mount
    const initialList = getUserNotifications(currentUser.id);
    initialList.forEach(n => knownNotificationIds.current.add(n.id));
    isFirstMount.current = false;

    const checkForNewNotifications = () => {
      const currentList = getUserNotifications(currentUser.id);

      currentList.forEach(notif => {
        if (!knownNotificationIds.current.has(notif.id)) {
          knownNotificationIds.current.add(notif.id);

          // Only trigger popup if not already read
          if (!notif.read) {
            playNotificationChime();

            const stageInfo = notif.type ? STAGE_NUMBERS[notif.type] : undefined;

            const newToast: ToastItem = {
              id: notif.id,
              notification: notif,
              stage: notif.type as TrackingStage,
              stageNumber: stageInfo?.num
            };

            setActiveToasts(prev => [newToast, ...prev.slice(0, 2)]);

            // Auto-dismiss toast after 7.5 seconds
            setTimeout(() => {
              setActiveToasts(prev => prev.filter(t => t.id !== notif.id));
            }, 7500);
          }
        }
      });
    };

    window.addEventListener('ecycle_state_updated', checkForNewNotifications);
    const interval = setInterval(checkForNewNotifications, 3000);

    return () => {
      window.removeEventListener('ecycle_state_updated', checkForNewNotifications);
      clearInterval(interval);
    };
  }, [currentUser.id]);

  const handleDismiss = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
    markNotificationAsRead(id);
  };

  const handleTrackClick = (toast: ToastItem) => {
    if (toast.notification.requestId || toast.notification.actionUrl) {
      onViewTracking(toast.notification.requestId || toast.notification.actionUrl!);
      handleDismiss(toast.id);
    }
  };

  if (activeToasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-[9990] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-3 sm:px-0"
      aria-live="polite"
    >
      {activeToasts.map(t => {
        const stageInfo = t.notification.type ? STAGE_NUMBERS[t.notification.type] : undefined;
        const isCompleted = t.notification.type === 'completed';
        const isAssigned = t.notification.type === 'assigned';
        const isCollected = t.notification.type === 'collected';

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-2xl border shadow-[0_18px_38px_-10px_rgba(18,61,50,0.22)] backdrop-blur-md transition-all duration-300 animate-modal-in ${
              isCompleted
                ? 'bg-white/95 border-[#16A36A] ring-1 ring-[#16A36A]/25'
                : isAssigned
                ? 'bg-white/95 border-blue-500/60 ring-1 ring-blue-500/20'
                : 'bg-white/95 border-[#DCE6E0]'
            }`}
          >
            {/* Header info */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                    isCompleted
                      ? 'bg-[#B9F5D0]/50 text-[#123D32] border-[#16A36A]/30'
                      : isAssigned
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : isCollected
                      ? 'bg-cyan-50 text-cyan-600 border-cyan-200'
                      : 'bg-[#F7FAF8] text-[#16A36A] border-[#DCE6E0]'
                  }`}
                >
                  {isCompleted ? (
                    <Award className="w-4 h-4 text-[#16A36A]" />
                  ) : isAssigned ? (
                    <Wrench className="w-4 h-4 text-blue-600" />
                  ) : isCollected ? (
                    <Truck className="w-4 h-4 text-cyan-600" />
                  ) : (
                    <Bell className="w-4 h-4 text-[#16A36A]" />
                  )}
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[#718078] flex items-center gap-1.5">
                    <span>{stageInfo ? stageInfo.label : 'Citizen Notification'}</span>
                    {t.stageNumber && (
                      <span className="text-[#16A36A] font-bold tabular-nums">
                        ({t.stageNumber}/7)
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#182B26] leading-snug mt-0.5">
                    {t.notification.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => handleDismiss(t.id)}
                className="text-[#718078] hover:text-[#182B26] p-1 rounded-lg hover:bg-[#F7FAF8] transition-colors cursor-pointer"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Message Body */}
            <p className="text-xs text-[#53635B] mt-2.5 leading-relaxed">
              {t.notification.message}
            </p>

            {/* Stage Progress Mini-Tracker (7 Dots) */}
            {stageInfo && (
              <div className="mt-3 pt-2.5 border-t border-[#E1EBE5] flex items-center justify-between gap-1">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5, 6, 7].map(step => (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-all ${
                        step <= stageInfo.num
                          ? 'w-4 bg-[#16A36A]'
                          : 'w-2 bg-[#DCE6E0]'
                      }`}
                      title={`Step ${step}`}
                    />
                  ))}
                </div>

                <span className="text-[10px] font-mono text-[#718078] tabular-nums">
                  {stageInfo.num === 7 ? 'Complete' : `Step ${stageInfo.num} of 7`}
                </span>
              </div>
            )}

            {/* Action Footer */}
            {(t.notification.requestId || t.notification.actionUrl) && (
              <div className="mt-3 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleTrackClick(t)}
                  className="px-3 py-1.5 bg-[#16A36A] hover:bg-[#128757] text-white rounded-xl text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <span>Track Live Handover</span>
                  <ArrowRight className="w-3 h-3" />
                </button>

                <span className="text-[10px] font-mono text-[#718078] tabular-nums">
                  {t.notification.timestamp}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
