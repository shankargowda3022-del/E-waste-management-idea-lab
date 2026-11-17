import React, { useState } from 'react';
import { calculatePlatformMetrics } from '../../services/storage';
import { ArrowRight, Search, ShieldCheck, Cpu, Leaf, Sparkles, MapPin, Award, TrendingUp } from 'lucide-react';

interface Props {
  onOpenPickupModal: () => void;
  onExploreCentres: () => void;
  onTrackSearch: (trackingId: string) => void;
  onOpenAssistant: () => void;
  onOpenRewards: () => void;
  onOpenAnalytics: () => void;
}

export const Hero: React.FC<Props> = ({
  onOpenPickupModal,
  onExploreCentres,
  onTrackSearch,
  onOpenAssistant,
  onOpenRewards,
  onOpenAnalytics
}) => {
  const [quickTrackingId, setQuickTrackingId] = useState('');
  const metrics = calculatePlatformMetrics();

  const handleQuickTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickTrackingId.trim()) {
      onTrackSearch(quickTrackingId.trim());
    }
  };

  return (
    <section className="relative w-full pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden bg-[#F7FAF8] eco-mesh-bg border-b border-[#E1EBE5]">
      {/* Subtle Environmental Glow */}
      <div className="absolute -top-24 right-0 w-[640px] h-[420px] bg-gradient-to-br from-[#B9F5D0]/55 via-[#16A36A]/10 to-transparent blur-3xl pointer-events-none -z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Context kicker: clean unboxed text */}
            <div className="flex items-center gap-2 text-xs font-mono text-[#16A36A] font-semibold">
              <span className="uppercase tracking-wider">UN SDG 12 · 13 · 11 · 9 Platform</span>
              <span className="text-[#DCE6E0]">/</span>
              <span className="text-[#123D32]">AI-Assisted Circular Electronics</span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#182B26] leading-[1.08] text-balance">
              Turn E-Waste Into a{' '}
              <span className="bg-gradient-to-r from-[#123D32] via-[#16A36A] to-[#0D8A58] bg-clip-text text-transparent">
                Better Future.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#53635B] max-w-2xl leading-relaxed">
              Responsible electronic collection, AI-powered repair diagnostics, and certified R2v3 recycling. Keep toxic heavy metals out of landfills while earning verified Eco-Points for community impact.
            </p>

            {/* Triple Interactive Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenPickupModal}
                className="px-6 py-3.5 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold text-sm rounded-xl shadow-[0_10px_25px_-8px_rgba(22,163,106,0.5)] hover:shadow-[0_14px_28px_-8px_rgba(22,163,106,0.6)] hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Recycle Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAssistant}
                className="px-5 py-3.5 bg-[#123D32] hover:bg-[#0D2E25] text-white font-semibold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4 text-[#B9F5D0]" />
                <span>AI Device Diagnosis</span>
              </button>

              <button
                onClick={onExploreCentres}
                className="px-5 py-3.5 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] hover:border-[#16A36A]/50 text-[#182B26] font-semibold text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <MapPin className="w-4 h-4 text-[#16A36A]" />
                <span>Collection Centres</span>
              </button>
            </div>

            {/* Quick Public Tracking Search Bar */}
            <div className="pt-4 max-w-md">
              <form onSubmit={handleQuickTrack} className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-[#718078]" />
                <input
                  type="text"
                  value={quickTrackingId}
                  onChange={(e) => setQuickTrackingId(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. ECY-2026-8941)"
                  className="w-full pl-10 pr-24 py-3 bg-white border border-[#DCE6E0] rounded-xl text-xs text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#B9F5D0] font-mono shadow-xs transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3.5 py-1.5 bg-[#123D32] hover:bg-[#16A36A] text-white text-xs font-semibold rounded-lg transition-colors font-sans cursor-pointer"
                >
                  Track
                </button>
              </form>
              <p className="text-[11px] text-[#718078] mt-2 font-mono">
                Sample code:{' '}
                <span className="text-[#16A36A] font-semibold cursor-pointer hover:underline" onClick={() => onTrackSearch('ECY-2026-8941')}>
                  ECY-2026-8941
                </span>{' '}
                or{' '}
                <span className="text-[#16A36A] font-semibold cursor-pointer hover:underline" onClick={() => onTrackSearch('ECY-2026-8812')}>
                  ECY-2026-8812
                </span>
              </p>
            </div>

          </div>

          {/* Right Column: High-Tech Circular Schematic Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-white border border-[#DCE6E0] rounded-2xl p-6 shadow-[0_24px_48px_-16px_rgba(18,61,50,0.14)] overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-[#E1EBE5] text-xs font-mono">
                <button
                  onClick={onOpenAssistant}
                  className="text-[#123D32] font-semibold flex items-center gap-1.5 hover:text-[#16A36A] focus:outline-none cursor-pointer transition-colors"
                >
                  <Cpu className="w-4 h-4 text-[#16A36A]" />
                  <span>Circular Flow Diagnostics</span>
                </button>
                <button
                  onClick={onOpenAnalytics}
                  className="text-[#718078] hover:text-[#123D32] font-mono text-[11px] cursor-pointer transition-colors"
                >
                  Live Telemetry →
                </button>
              </div>

              {/* Schematic Visual (Deep Forest Accent Panel) */}
              <div className="my-5 p-4 bg-[#123D32] border border-[#1D5446] rounded-xl space-y-3.5 font-mono text-xs text-white">
                <div className="flex items-center justify-between">
                  <span className="text-[#C8DDD2]">Triage Pipeline:</span>
                  <button onClick={onOpenAssistant} className="text-[#B9F5D0] hover:underline font-semibold cursor-pointer">
                    Repair First → Urban Mining
                  </button>
                </div>
                
                {/* Visual Progress Bars */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#C8DDD2]">Circular Reuse Rate</span>
                    <span className="text-[#B9F5D0] font-bold tabular-nums">94.2%</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#16A36A] to-[#B9F5D0] h-full rounded-full" style={{ width: '94.2%' }} />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#C8DDD2]">Precious Metal Recovery Yield</span>
                    <span className="text-[#B9F5D0] font-bold tabular-nums">98.1% Smelted</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#B9F5D0] to-[#16A36A] h-full rounded-full" style={{ width: '98.1%' }} />
                  </div>
                </div>

                <div className="pt-2.5 text-[11px] text-[#C8DDD2] flex items-center justify-between border-t border-white/10">
                  <span>Cryptographic Data Shred:</span>
                  <span className="text-[#B9F5D0] font-semibold">DoD 5220.22-M / NIST SP 800-88</span>
                </div>
              </div>

              {/* Quick Feature highlights with direct navigation */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={onExploreCentres}
                  className="p-3.5 bg-[#F7FAF8] hover:bg-[#B9F5D0]/25 border border-[#E1EBE5] hover:border-[#16A36A]/45 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="text-[#123D32] font-semibold mb-1 flex items-center justify-between">
                    <span>Doorstep or Drop-Off</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#16A36A] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <div className="text-[#718078] text-[11px] leading-tight">GPS-optimized neighborhood cluster collection.</div>
                </button>

                <button
                  onClick={onOpenRewards}
                  className="p-3.5 bg-[#F7FAF8] hover:bg-[#B9F5D0]/25 border border-[#E1EBE5] hover:border-[#16A36A]/45 rounded-xl text-left transition-all cursor-pointer group"
                >
                  <div className="text-[#123D32] font-semibold mb-1 flex items-center justify-between">
                    <span>Eco-Point Wallet</span>
                    <Award className="w-3.5 h-3.5 text-[#16A36A] opacity-60 group-hover:opacity-100 transition-all" />
                  </div>
                  <div className="text-[#718078] text-[11px] leading-tight">Redeem for campus cafe, tech credits, or trees.</div>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Full-width 4-Column Metric Strip with clickable navigation */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-5 sm:p-6 bg-white border border-[#DCE6E0] rounded-2xl shadow-[0_10px_30px_-14px_rgba(18,61,50,0.1)]">
          <button
            onClick={() => onTrackSearch('ECY-2026-8941')}
            className="text-left group cursor-pointer p-3 rounded-xl hover:bg-[#F7FAF8] transition-colors"
          >
            <div className="text-xs font-mono text-[#718078] uppercase tracking-wider group-hover:text-[#16A36A] transition-colors">
              Devices Collected
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">
              {metrics.totalDevices.toLocaleString()}
            </div>
            <div className="text-[11px] text-[#718078] mt-0.5 group-hover:text-[#123D32]">
              Track shipments →
            </div>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="text-left group cursor-pointer p-3 rounded-xl hover:bg-[#F7FAF8] transition-colors"
          >
            <div className="text-xs font-mono text-[#718078] uppercase tracking-wider group-hover:text-[#16A36A] transition-colors">
              E-Waste Processed
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#16A36A] font-mono tabular-nums mt-1">
              {metrics.totalKg.toLocaleString()} <span className="text-sm font-normal text-[#718078]">kg</span>
            </div>
            <div className="text-[11px] text-[#718078] mt-0.5 group-hover:text-[#123D32]">
              View material recovery →
            </div>
          </button>

          <button
            onClick={onOpenAnalytics}
            className="text-left group cursor-pointer p-3 rounded-xl hover:bg-[#F7FAF8] transition-colors"
          >
            <div className="text-xs font-mono text-[#718078] uppercase tracking-wider group-hover:text-[#16A36A] transition-colors">
              GHG Avoided
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#123D32] font-mono tabular-nums mt-1">
              {metrics.totalCo2Kg.toLocaleString()} <span className="text-sm font-normal text-[#718078]">kg CO2e</span>
            </div>
            <div className="text-[11px] text-[#718078] mt-0.5 group-hover:text-[#123D32]">
              ~{metrics.treeEquivalents} tree-years absorbed →
            </div>
          </button>

          <button
            onClick={onExploreCentres}
            className="text-left group cursor-pointer p-3 rounded-xl hover:bg-[#F7FAF8] transition-colors"
          >
            <div className="text-xs font-mono text-[#718078] uppercase tracking-wider group-hover:text-[#16A36A] transition-colors">
              Active Partners
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">
              {metrics.totalPartners}
            </div>
            <div className="text-[11px] text-[#718078] mt-0.5 group-hover:text-[#123D32]">
              Explore 28 certified depots →
            </div>
          </button>
        </div>

      </div>
    </section>
  );
};
