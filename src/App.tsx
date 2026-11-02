/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, PickupRequest } from './types';
import { getStoredUser, calculatePlatformMetrics } from './services/storage';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Views
import { Hero } from './components/home/Hero';
import { HowItWorks } from './components/home/HowItWorks';
import { AcceptedCategories } from './components/home/AcceptedCategories';
import { RepairVsRecycle } from './components/home/RepairVsRecycle';
import { SdgSection } from './components/home/SdgSection';
import { TestimonialsFaq } from './components/home/TestimonialsFaq';
import { TrackingView } from './components/tracking/TrackingView';
import { EcoAiAssistant } from './components/assistant/EcoAiAssistant';
import { CentresDirectory } from './components/centres/CentresDirectory';
import { RewardsCenter } from './components/rewards/RewardsCenter';
import { Marketplace } from './components/marketplace/Marketplace';
import { ImpactAnalytics } from './components/analytics/ImpactAnalytics';
import { DataPrivacyHub } from './components/privacy/DataPrivacyHub';
import { DashboardRouter } from './components/dashboard/DashboardRouter';

// Modals
import { PickupRequestModal } from './components/pickup/PickupRequestModal';
import { QrReceiptModal } from './components/common/QrReceiptModal';
import { AuthModal } from './components/auth/AuthModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(getStoredUser());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [pickupModalOpen, setPickupModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [activeReceiptRequest, setActiveReceiptRequest] = useState<PickupRequest | null>(null);

  // Deep linking props
  const [trackingLookupId, setTrackingLookupId] = useState<string>('ECY-2026-8941');
  const [prefilledCategory, setPrefilledCategory] = useState<string>('Laptops');
  const [prefilledCentreId, setPrefilledCentreId] = useState<string | undefined>(undefined);

  // Sync state reactively across components
  useEffect(() => {
    const handleStateUpdate = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener('ecycle_state_updated', handleStateUpdate);
    return () => window.removeEventListener('ecycle_state_updated', handleStateUpdate);
  }, []);

  const handleOpenPickupWithCategory = (cat?: string) => {
    setPrefilledCategory(cat || 'Laptops');
    setPrefilledCentreId(undefined);
    setPickupModalOpen(true);
  };

  const handleOpenPickupWithCentre = (centreId: string) => {
    setPrefilledCentreId(centreId);
    setPickupModalOpen(true);
  };

  const handleTrackSearch = (id: string) => {
    setTrackingLookupId(id);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePickupSuccess = (newRequest: PickupRequest) => {
    setActiveReceiptRequest(newRequest);
    setPickupModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-500/20 selection:text-emerald-400">
      
      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* Tab 1: Home Overview */}
        {activeTab === 'home' && (
          <div>
            <Hero
              onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
              onExploreCentres={() => { setActiveTab('centres'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onTrackSearch={handleTrackSearch}
            />
            <HowItWorks />
            <AcceptedCategories onSelectCategoryForPickup={handleOpenPickupWithCategory} />
            <RepairVsRecycle
              onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
              onExploreMarketplace={() => { setActiveTab('marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
            <SdgSection />
            <TestimonialsFaq />
          </div>
        )}

        {/* Tab 2: Centres Directory */}
        {activeTab === 'centres' && (
          <CentresDirectory onSelectCentreForPickup={handleOpenPickupWithCentre} />
        )}

        {/* Tab 3: Track E-Waste */}
        {activeTab === 'track' && (
          <TrackingView
            initialTrackingId={trackingLookupId}
            onOpenReceipt={(req) => setActiveReceiptRequest(req)}
            onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
          />
        )}

        {/* Tab 4: EcoAI Assistant */}
        {activeTab === 'assistant' && (
          <EcoAiAssistant
            onOpenPickupModal={handleOpenPickupWithCategory}
            onExploreMarketplace={() => { setActiveTab('marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

        {/* Tab 5: Reuse & Repair Marketplace */}
        {activeTab === 'marketplace' && (
          <Marketplace currentUser={currentUser} />
        )}

        {/* Tab 6: Eco-Rewards & Gamification */}
        {activeTab === 'rewards' && (
          <RewardsCenter
            currentUser={currentUser}
            onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
          />
        )}

        {/* Tab 7: UN SDG Alignment Deep-Dive */}
        {activeTab === 'sdg' && (
          <div>
            <SdgSection />
            <div className="py-12 bg-neutral-950 border-b border-neutral-800 text-center">
              <div className="max-w-2xl mx-auto px-4 space-y-4">
                <h3 className="text-xl font-bold text-white">Join the Campus Circular Drive</h3>
                <p className="text-xs text-neutral-400">
                  Are you a student club, dormitory, or department? Register your unit for our upcoming Earth Day e-cleanout.
                </p>
                <button
                  onClick={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs"
                >
                  Schedule Department E-Waste Pickup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Data Privacy & Safety */}
        {activeTab === 'privacy' && (
          <DataPrivacyHub />
        )}

        {/* Tab 9: Impact Analytics */}
        {activeTab === 'analytics' && (
          <ImpactAnalytics />
        )}

        {/* Tab 10: Role-Based Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardRouter
            currentUser={currentUser}
            onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
            onViewTracking={handleTrackSearch}
            onOpenReceipt={(req) => setActiveReceiptRequest(req)}
            onGoToRewards={() => { setActiveTab('rewards'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onOpenAuditReport={() => { setActiveTab('analytics'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
      />

      {/* Global Modals */}
      <PickupRequestModal
        currentUser={currentUser}
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        onSuccess={handlePickupSuccess}
        initialCategory={prefilledCategory}
        initialCentreId={prefilledCentreId}
      />

      <QrReceiptModal
        request={activeReceiptRequest}
        onClose={() => setActiveReceiptRequest(null)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setActiveTab('dashboard');
        }}
      />

    </div>
  );
}
