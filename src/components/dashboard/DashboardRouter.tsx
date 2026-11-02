import React from 'react';
import { User, PickupRequest } from '../../types';
import { CitizenDashboard } from './CitizenDashboard';
import { RecyclerDashboard } from './RecyclerDashboard';
import { AdminDashboard } from './AdminDashboard';

interface Props {
  currentUser: User;
  onOpenPickupModal: () => void;
  onViewTracking: (trackingId: string) => void;
  onOpenReceipt: (req: PickupRequest) => void;
  onGoToRewards: () => void;
  onOpenAuditReport: () => void;
}

export const DashboardRouter: React.FC<Props> = ({
  currentUser,
  onOpenPickupModal,
  onViewTracking,
  onOpenReceipt,
  onGoToRewards,
  onOpenAuditReport
}) => {
  return (
    <section className="py-12 bg-neutral-950 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {currentUser.role === 'citizen' && (
          <CitizenDashboard
            currentUser={currentUser}
            onOpenPickupModal={onOpenPickupModal}
            onViewTracking={onViewTracking}
            onOpenReceipt={onOpenReceipt}
            onGoToRewards={onGoToRewards}
          />
        )}

        {(currentUser.role === 'recycler' || currentUser.role === 'repair') && (
          <RecyclerDashboard
            currentUser={currentUser}
            onOpenReceipt={onOpenReceipt}
            onViewTracking={onViewTracking}
          />
        )}

        {currentUser.role === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            onOpenAuditReport={onOpenAuditReport}
            onViewTracking={onViewTracking}
          />
        )}
      </div>
    </section>
  );
};
