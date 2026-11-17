import React, { useState } from 'react';
import { Wrench, Repeat, Recycle, Check, X, ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';
import { Reveal } from '../common/Reveal';

interface Props {
  onOpenPickupModal: () => void;
  onExploreMarketplace: () => void;
  onOpenAssistant: () => void;
}

export const RepairVsRecycle: React.FC<Props> = ({
  onOpenPickupModal,
  onExploreMarketplace,
  onOpenAssistant
}) => {
  const [activeStrategy, setActiveStrategy] = useState<'repair' | 'reuse' | 'recycle'>('repair');

  const strategies = [
    {
      id: 'repair' as const,
      title: '01. Repair First',
      tagline: 'Life Extension & Component Upgrades',
      carbonFactor: '95% Carbon Avoided',
      costSavings: 'Saves $400 - $900 vs New',
      idealFor: 'Laptops with slow HDDs, stiff fans, battery degradation, cracked screens, or dirty ports.',
      actionLabel: 'Launch EcoAI Diagnostics',
      badgeColor: 'text-[#123D32]',
      icon: Wrench
    },
    {
      id: 'reuse' as const,
      title: '02. Refurbish & Reuse',
      tagline: 'Educational Redistribution & Student Marketplace',
      carbonFactor: '88% Carbon Avoided',
      costSavings: 'Generates Student Cash / Eco-Credits',
      idealFor: 'Fully working electronics, spare RAM sticks, monitors, working smartphones replaced during upgrades.',
      actionLabel: 'Browse Campus Marketplace',
      badgeColor: 'text-[#16A36A]',
      icon: Repeat
    },
    {
      id: 'recycle' as const,
      title: '03. Certified Recycling',
      tagline: 'Closed-Loop Urban Mining (R2v3)',
      carbonFactor: '72% Energy Saved vs Raw Ore Mining',
      costSavings: 'Earns 80-200 Eco-Points',
      idealFor: 'Water-damaged motherboards, swollen batteries, shattered displays, obsolete legacy mainframes.',
      actionLabel: 'Schedule R2 E-Waste Collection',
      badgeColor: 'text-amber-700',
      icon: Recycle
    }
  ];

  const current = strategies.find(s => s.id === activeStrategy)!;
  const CurrentIcon = current.icon;

  const handleAction = () => {
    if (activeStrategy === 'repair') {
      onOpenAssistant();
    } else if (activeStrategy === 'reuse') {
      onExploreMarketplace();
    } else {
      onOpenPickupModal();
    }
  };

  return (
    <section className="py-20 bg-white border-b border-[#E1EBE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <Reveal className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-[#16A36A] font-semibold">
            Circular Hierarchy Matrix
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#182B26] mt-2">
            Repair vs. Reuse vs. Recycle: What’s Best?
          </h2>
          <p className="text-sm text-[#718078] mt-2 leading-relaxed">
            Not all old electronics belong in a shredder. Manufacturing a single new computer consumes over 240kg of fossil fuels, 22kg of chemicals, and 1,500kg of water. Prioritizing repair first preserves that embodied energy.
          </p>
        </Reveal>

        {/* Strategy Selector Tabs */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.map((strat, idx) => {
            const Icon = strat.icon;
            const isSelected = activeStrategy === strat.id;
            return (
              <Reveal key={strat.id} delayMs={idx * 70}>
                <button
                  onClick={() => setActiveStrategy(strat.id)}
                  className={`w-full h-full p-6 text-left rounded-2xl border transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-[#F7FAF8] border-[#16A36A] shadow-[0_14px_28px_-12px_rgba(22,163,106,0.22)] ring-1 ring-[#16A36A]/20'
                      : 'bg-white border-[#DCE6E0] hover:border-[#16A36A]/50 hover:bg-[#F7FAF8]/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-semibold text-[#718078]">{strat.title}</span>
                      <div className={`p-2 rounded-lg bg-[#B9F5D0]/45 ${strat.badgeColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    <h3 className="text-base font-bold text-[#182B26] mb-1">{strat.tagline}</h3>
                    <p className="text-xs text-[#718078] line-clamp-2 leading-relaxed">{strat.idealFor}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E1EBE5] flex items-center justify-between text-xs font-mono">
                    <span className={`font-semibold ${strat.badgeColor}`}>{strat.carbonFactor}</span>
                    <span className="text-[#718078]">Tap to inspect</span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>

        {/* Deep Dive Strategy Feature Block */}
        <Reveal delayMs={100}>
          <div className="mt-8 eco-card p-6 sm:p-8 bg-[#F7FAF8]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#16A36A] font-semibold">
                  <CurrentIcon className="w-4 h-4" />
                  <span>Strategy Overview · {current.title}</span>
                </div>
                <h3 className="text-2xl font-bold text-[#182B26]">{current.tagline}</h3>
                <p className="text-sm text-[#53635B] leading-relaxed">
                  {current.idealFor}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3.5 bg-white rounded-xl border border-[#DCE6E0]">
                    <div className="text-[11px] font-mono text-[#718078] uppercase">Embodied Carbon Saved</div>
                    <div className="text-base font-bold text-[#16A36A] font-mono mt-0.5 tabular-nums">{current.carbonFactor}</div>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-[#DCE6E0]">
                    <div className="text-[11px] font-mono text-[#718078] uppercase">Economic Benefit</div>
                    <div className="text-base font-bold text-[#123D32] font-mono mt-0.5 tabular-nums">{current.costSavings}</div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleAction}
                    className="px-5 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {activeStrategy === 'repair' && <Sparkles className="w-3.5 h-3.5" />}
                    <span>{current.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  
                  <span className="text-xs text-[#718078] font-mono">
                    Supported by campus repair clinics & authorized R2 refiners
                  </span>
                </div>

              </div>

              {/* Checklist / Criteria comparison */}
              <div className="lg:col-span-5 bg-white border border-[#DCE6E0] rounded-xl p-5 space-y-3 font-mono text-xs shadow-xs">
                <div className="text-[#123D32] font-semibold border-b border-[#E1EBE5] pb-2">
                  Triage Decision Matrix
                </div>
                
                <div className="space-y-2.5 text-[#53635B]">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#16A36A] shrink-0 mt-0.5" />
                    <span>Choose <strong className="text-[#182B26]">Repair</strong> if device boots, screen lights up, or issue is isolated to software, thermal paste, or modular battery.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#123D32] shrink-0 mt-0.5" />
                    <span>Choose <strong className="text-[#182B26]">Reuse / Donation</strong> if device is within 6 years old, fully functional, and capable of web browsing or office tasks.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Choose <strong className="text-[#182B26]">Certified Recycling</strong> if motherboard PCB is fractured, liquid corroded, or battery is bulging.</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
};
