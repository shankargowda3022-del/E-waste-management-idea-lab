import React, { useState, useEffect } from 'react';
import { User, PickupRequest } from '../../types';
import { CitizenDashboard } from './CitizenDashboard';
import { RecyclerDashboard } from './RecyclerDashboard';
import { RepairDashboard } from './RepairDashboard';
import { AdminDashboard } from './AdminDashboard';
import { AdminAuthGate } from '../auth/AdminAuthGate';
import { isAdminAuthenticated, setAdminAuthenticated, switchUserRole } from '../../services/storage';

interface Props {
  currentUser: User;
  onOpenPickupModal: (preference?: 'recycle' | 'repair') => void;
  onViewTracking: (trackingId: string) => void;
  onOpenReceipt: (req: PickupRequest) => void;
  onGoToRewards: () => void;
  onOpenAuditReport: () => void;
  onOpenSupabaseModal?: () => void;
  onOpenAssistant?: () => void;
  onExploreMarketplace?: () => void;
  onExploreCentres?: () => void;
  onOpenPrivacy?: () => void;
  onOpenAnalytics?: () => void;
}

export const DashboardRouter: React.FC<Props> = ({
  currentUser,
  onOpenPickupModal,
  onViewTracking,
  onOpenReceipt,
  onGoToRewards,
  onOpenAuditReport,
  onOpenSupabaseModal,
  onOpenAssistant,
  onExploreMarketplace,
  onExploreCentres,
  onOpenPrivacy,
  onOpenAnalytics
}) => {
  const [adminUnlocked, setAdminUnlocked] = useState<boolean>(isAdminAuthenticated());

  useEffect(() => {
    const handleUpdate = () => {
      setAdminUnlocked(isAdminAuthenticated());
    };
    window.addEventListener('ecycle_state_updated', handleUpdate);
    return () => window.removeEventListener('ecycle_state_updated', handleUpdate);
  }, []);

  return (
    <section className="py-12 bg-[#F7FAF8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {currentUser.role === 'citizen' && (
          <CitizenDashboard
            currentUser={currentUser}
            onOpenPickupModal={onOpenPickupModal}
            onViewTracking={onViewTracking}
            onOpenReceipt={onOpenReceipt}
            onGoToRewards={onGoToRewards}
            onOpenAssistant={onOpenAssistant}
            onExploreMarketplace={onExploreMarketplace}
            onExploreCentres={onExploreCentres}
            onOpenPrivacy={onOpenPrivacy}
            onOpenAnalytics={onOpenAnalytics}
          />
        )}

        {currentUser.role === 'recycler' && (
          <RecyclerDashboard
            currentUser={currentUser}
            onOpenReceipt={onOpenReceipt}
            onViewTracking={onViewTracking}
          />
        )}

        {currentUser.role === 'repair' && (
          <RepairDashboard
            currentUser={currentUser}
            onOpenReceipt={onOpenReceipt}
            onViewTracking={onViewTracking}
            onExploreMarketplace={onExploreMarketplace}
          />
        )}

        {currentUser.role === 'admin' && (
          adminUnlocked ? (
            <AdminDashboard
              currentUser={currentUser}
              onOpenAuditReport={onOpenAuditReport}
              onViewTracking={onViewTracking}
              onOpenSupabaseModal={onOpenSupabaseModal}
              onLockConsole={() => {
                setAdminAuthenticated(false);
                setAdminUnlocked(false);
              }}
            />
          ) : (
            <AdminAuthGate
              onUnlockSuccess={() => setAdminUnlocked(true)}
              onCancel={() => {
                switchUserRole('citizen');
              }}
            />
          )
        )}
      </div>
    </section>
  );
};

