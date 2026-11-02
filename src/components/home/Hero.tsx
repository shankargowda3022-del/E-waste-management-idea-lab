import React, { useState } from 'react';
import { calculatePlatformMetrics } from '../../services/storage';
import { ArrowRight, Search, ShieldCheck, Cpu, Leaf, Sparkles, MapPin } from 'lucide-react';

interface Props {
  onOpenPickupModal: () => void;
  onExploreCentres: () => void;
  onTrackSearch: (trackingId: string) => void;
}

export const Hero: React.FC<Props> = ({
  onOpenPickupModal,
  onExploreCentres,
  onTrackSearch
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
    <section className="relative w-full pt-12 pb-16 sm:pt-20 sm:pb-24 overflow-hidden border-b border-neutral-800/80">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-b from-emerald-600/15 via-cyan-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Context kicker: clean unboxed text */}
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
              <span className="uppercase tracking-wider">UN SDG 12 · 13 · 11 · 9 Platform</span>
              <span className="text-neutral-600">/</span>
              <span>AI-Assisted Circular Electronics</span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] text-balance">
              Turn E-Waste Into a <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">Better Future.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed">
              Responsible electronic collection, AI-powered repair diagnostics, and certified R2v3 recycling. Keep toxic heavy metals out of landfills while earning verified Eco-Points for community impact.
            </p>

            {/* Dual Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={onOpenPickupModal}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-950/40 hover:shadow-emerald-900/50 transition-all flex items-center gap-2"
              >
                <span>Recycle Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onExploreCentres}
                className="px-6 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Explore Collection Centres</span>
              </button>
            </div>

            {/* Quick Public Tracking Search Bar */}
            <div className="pt-4 max-w-md">
              <form onSubmit={handleQuickTrack} className="relative flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-neutral-500" />
                <input
                  type="text"
                  value={quickTrackingId}
                  onChange={(e) => setQuickTrackingId(e.target.value)}
                  placeholder="Enter Tracking ID (e.g. ECY-2026-8941)"
                  className="w-full pl-10 pr-24 py-2.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/40 font-mono"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-lg transition-colors font-sans"
                >
                  Track
                </button>
              </form>
              <p className="text-[11px] text-neutral-500 mt-1.5 font-mono">
                Sample code: <span className="text-emerald-400 cursor-pointer hover:underline" onClick={() => onTrackSearch('ECY-2026-8941')}>ECY-2026-8941</span> or <span className="text-emerald-400 cursor-pointer hover:underline" onClick={() => onTrackSearch('ECY-2026-8812')}>ECY-2026-8812</span>
              </p>
            </div>

          </div>

          {/* Right Column: High-Tech Circular Schematic Card */}
          <div className="lg:col-span-5">
            <div className="relative bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 shadow-2xl backdrop-blur-sm overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-800 text-xs font-mono">
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" />
                  Circular Flow Diagnostics
                </span>
                <span className="text-neutral-500">Live Telemetry</span>
              </div>

              {/* Schematic Visual */}
              <div className="my-5 p-4 bg-neutral-950 border border-neutral-800/80 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-neutral-300">
                  <span className="text-neutral-400">Triage Pipeline:</span>
                  <span className="text-cyan-400">Repair First → Urban Mining</span>
                </div>
                
                {/* Visual Progress Bars */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Circular Reuse Rate</span>
                    <span className="text-emerald-400 font-bold tabular-nums">94.2%</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-500 to-cyan-400 h-full rounded-full" style={{ width: '94.2%' }} />
                  </div>
                </div>

                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-neutral-400">Precious Metal Recovery Yield</span>
                    <span className="text-amber-400 font-bold tabular-nums">98.1% Smelted</span>
                  </div>
                  <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full" style={{ width: '98.1%' }} />
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-neutral-400 flex items-center justify-between border-t border-neutral-800/60">
                  <span>Cryptographic Data Shred:</span>
                  <span className="text-emerald-400">DoD 5220.22-M / NIST SP 800-88</span>
                </div>
              </div>

              {/* Quick Feature highlights */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                  <div className="text-emerald-400 font-semibold mb-1">Doorstep or Drop-Off</div>
                  <div className="text-neutral-400 text-[11px] leading-tight">GPS-optimized neighborhood cluster collection.</div>
                </div>
                <div className="p-3 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                  <div className="text-cyan-400 font-semibold mb-1">Eco-Point Wallet</div>
                  <div className="text-neutral-400 text-[11px] leading-tight">Redeem for campus cafe, tech credits, or trees.</div>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Full-width 4-Column Metric Strip (Section 3 of frontend-design) */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-neutral-900/60 border border-neutral-800/80 rounded-2xl backdrop-blur-sm">
          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Devices Collected</div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums mt-1">
              {metrics.totalDevices.toLocaleString()}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Across Campus & Metro Hubs</div>
          </div>

          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">E-Waste Processed</div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
              {metrics.totalKg.toLocaleString()} <span className="text-sm font-normal text-emerald-300">kg</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">Diverted from Landfills</div>
          </div>

          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">GHG Avoided</div>
            <div className="text-2xl sm:text-3xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
              {metrics.totalCo2Kg.toLocaleString()} <span className="text-sm font-normal text-cyan-300">kg CO2e</span>
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">~{metrics.treeEquivalents} tree-years absorbed</div>
          </div>

          <div>
            <div className="text-xs font-mono text-neutral-400 uppercase tracking-wider">Active Partners</div>
            <div className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums mt-1">
              {metrics.totalPartners}
            </div>
            <div className="text-[11px] text-neutral-500 mt-0.5">R2v3 & CPCB Authorized</div>
          </div>
        </div>

      </div>
    </section>
  );
};
