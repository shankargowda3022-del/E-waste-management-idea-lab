/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, PickupRequest, DisposalPreference } from './types';
import { getStoredUser, calculatePlatformMetrics, syncRequestsWithSupabase, logoutCitizen, setStoredUser } from './services/storage';
import { supabase, fetchUserProfileFromSupabase } from './services/supabase';

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
import { UserProfilePage } from './components/profile/UserProfilePage';

// Modals
import { PickupRequestModal } from './components/pickup/PickupRequestModal';
import { QrReceiptModal } from './components/common/QrReceiptModal';
import { AuthModal } from './components/auth/AuthModal';
import { AuthPage } from './components/auth/AuthPage';
import { SupabaseStatusModal } from './components/common/SupabaseStatusModal';

// Interactive Cursor & Real-Time Chain-of-Custody Notifications
import { InteractiveCursor } from './components/common/InteractiveCursor';
import { NotificationToast } from './components/common/NotificationToast';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>(getStoredUser());
  const [activeTab, setActiveTab] = useState<string>('home');
  const [pickupModalOpen, setPickupModalOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState<boolean>(false);
  const [activeReceiptRequest, setActiveReceiptRequest] = useState<PickupRequest | null>(null);

  // Deep linking props
  const [trackingLookupId, setTrackingLookupId] = useState<string>('ECY-2026-8941');
  const [prefilledCategory, setPrefilledCategory] = useState<string>('Laptops');
  const [prefilledCentreId, setPrefilledCentreId] = useState<string | undefined>(undefined);
  const [prefilledPreference, setPrefilledPreference] = useState<DisposalPreference>('recycle');

  const handleOpenPickupModal = (pref?: DisposalPreference) => {
    setPrefilledCentreId(undefined);
    setPrefilledPreference(pref || 'recycle');
    setPickupModalOpen(true);
  };

  // Sync state reactively across components & fetch from Supabase
  useEffect(() => {
    // Initial fetch from Supabase cloud database
    syncRequestsWithSupabase().catch(() => {});

    // Listen to Supabase Auth state changes (Google OAuth, magic links, email auth)
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await fetchUserProfileFromSupabase(session.user.id);
        if (profile) {
          setStoredUser(profile);
          setCurrentUser(profile);
        } else {
          const meta = session.user.user_metadata || {};
          const fallbackUser: User = {
            id: session.user.id,
            name: meta.full_name || meta.name || session.user.email?.split('@')[0] || 'Verified Citizen',
            email: session.user.email || '',
            role: (meta.role as any) || 'citizen',
            phone: meta.phone || '+1 (555) 000-0000',
            address: meta.address || 'Campus Central',
            organization: meta.organization || 'Campus Community',
            ecoPoints: 120,
            carbonSavedKg: 0,
            devicesRecycled: 0,
            isAuthenticatedCitizen: true
          };
          setStoredUser(fallbackUser);
          setCurrentUser(fallbackUser);
        }
      }
    });

    const handleStateUpdate = () => {
      setCurrentUser(getStoredUser());
    };
    window.addEventListener('ecycle_state_updated', handleStateUpdate);
    return () => {
      window.removeEventListener('ecycle_state_updated', handleStateUpdate);
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleOpenAssistantWithCategory = (cat?: string) => {
    if (cat) setPrefilledCategory(cat);
    setActiveTab('assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#F7FAF8] text-[#182B26] flex flex-col font-sans selection:bg-[#B9F5D0] selection:text-[#123D32] box-border">
      
      {/* Top Bar Navigation */}
      <Navbar
        currentUser={currentUser}
        onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden box-border">
        
        {/* Tab 1: Home Overview */}
        {activeTab === 'home' && (
          <div>
            <Hero
              onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
              onExploreCentres={() => { setActiveTab('centres'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onTrackSearch={handleTrackSearch}
              onOpenAssistant={() => { setActiveTab('assistant'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onOpenRewards={() => { setActiveTab('rewards'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onOpenAnalytics={() => { setActiveTab('analytics'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
            <HowItWorks
              onOpenAssistant={() => { setActiveTab('assistant'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onExploreCentres={() => { setActiveTab('centres'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onExploreMarketplace={() => { setActiveTab('marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onOpenRewards={() => { setActiveTab('rewards'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
            <AcceptedCategories
              onSelectCategoryForPickup={handleOpenPickupWithCategory}
              onOpenAssistantWithCategory={handleOpenAssistantWithCategory}
              onOpenPrivacy={() => { setActiveTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            />
            <RepairVsRecycle
              onOpenPickupModal={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
              onExploreMarketplace={() => { setActiveTab('marketplace'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              onOpenAssistant={() => { setActiveTab('assistant'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
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
            onExploreCentres={() => { setActiveTab('centres'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onGoToPrivacy={() => { setActiveTab('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            initialCategory={prefilledCategory}
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
            <div className="py-12 bg-white border-b border-[#E1EBE5] text-center">
              <div className="max-w-2xl mx-auto px-4 space-y-4">
                <h3 className="text-xl font-bold text-[#182B26]">Join the Campus Circular Drive</h3>
                <p className="text-xs text-[#718078]">
                  Are you a student club, dormitory, or department? Register your unit for our upcoming Earth Day e-cleanout.
                </p>
                <button
                  onClick={() => { setPrefilledCentreId(undefined); setPickupModalOpen(true); }}
                  className="px-5 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold rounded-xl text-xs shadow-sm transition-colors cursor-pointer"
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
            onOpenPickupModal={handleOpenPickupModal}
            onViewTracking={handleTrackSearch}
            onOpenReceipt={(req) => setActiveReceiptRequest(req)}
            onGoToRewards={() => { setActiveTab('rewards'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onOpenAuditReport={() => { setActiveTab('analytics'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          />
        )}

        {/* Tab 11: Dedicated Authorised Gateway */}
        {activeTab === 'login' && (
          <AuthPage
            currentUser={currentUser}
            onAuthSuccess={(user) => {
              setCurrentUser(user);
              setActiveTab('dashboard');
            }}
            onGoToDashboard={() => {
              setActiveTab('dashboard');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Tab 12: Citizen Profile & Eco-Points Wallet */}
        {activeTab === 'profile' && (
          <UserProfilePage
            currentUser={currentUser}
            onViewTracking={handleTrackSearch}
            onOpenReceipt={(req) => setActiveReceiptRequest(req)}
            onGoToRewards={() => { setActiveTab('rewards'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            onOpenPickupModal={() => handleOpenPickupModal('recycle')}
            onSignOut={() => {
              logoutCitizen();
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPickupModal={() => handleOpenPickupModal('recycle')}
      />

      {/* Global Modals */}
      <PickupRequestModal
        currentUser={currentUser}
        isOpen={pickupModalOpen}
        onClose={() => setPickupModalOpen(false)}
        onSuccess={handlePickupSuccess}
        initialCategory={prefilledCategory}
        initialCentreId={prefilledCentreId}
        initialDisposalPreference={prefilledPreference}
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

      <SupabaseStatusModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      {/* Interactive Cursor with Trail and Physics */}
      <InteractiveCursor />

      {/* Real-time Notification Toasts for Every Step */}
      <NotificationToast
        currentUser={currentUser}
        onViewTracking={handleTrackSearch}
      />

    </div>
  );
}
