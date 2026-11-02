import React, { useState } from 'react';
import { Wrench, Repeat, Recycle, Check, X, ArrowRight, ShieldCheck, Heart } from 'lucide-react';

interface Props {
  onOpenPickupModal: () => void;
  onExploreMarketplace: () => void;
}

export const RepairVsRecycle: React.FC<Props> = ({ onOpenPickupModal, onExploreMarketplace }) => {
  const [activeStrategy, setActiveStrategy] = useState<'repair' | 'reuse' | 'recycle'>('repair');

  const strategies = [
    {
      id: 'repair' as const,
      title: '01. Repair First',
      tagline: 'Life Extension & Component Upgrades',
      carbonFactor: '95% Carbon Avoided',
      costSavings: 'Saves $400 - $900 vs New',
      idealFor: 'Laptops with slow HDDs, stiff fans, battery degradation, cracked screens, or dirty ports.',
      actionLabel: 'Explore Repair Diagnostics',
      badgeColor: 'text-cyan-400',
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
      badgeColor: 'text-emerald-400',
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
      badgeColor: 'text-amber-400',
      icon: Recycle
    }
  ];

  const current = strategies.find(s => s.id === activeStrategy)!;
  const CurrentIcon = current.icon;

  return (
    <section className="py-20 bg-neutral-950 border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
            Circular Hierarchy Matrix
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-2">
            Repair vs. Reuse vs. Recycle: What’s Best?
          </h2>
          <p className="text-sm text-neutral-400 mt-2 leading-relaxed">
            Not all old electronics belong in a shredder. Manufacturing a single new computer consumes over 240kg of fossil fuels, 22kg of chemicals, and 1,500kg of water. Prioritizing repair first preserves that embodied energy.
          </p>
        </div>

        {/* Strategy Selector Tabs */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {strategies.map((strat) => {
            const Icon = strat.icon;
            const isSelected = activeStrategy === strat.id;
            return (
              <button
                key={strat.id}
                onClick={() => setActiveStrategy(strat.id)}
                className={`p-6 text-left rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-neutral-900 border-emerald-500/80 shadow-lg shadow-emerald-950/20'
                    : 'bg-neutral-900/40 border-neutral-800/80 hover:bg-neutral-900 hover:border-neutral-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-semibold text-neutral-400">{strat.title}</span>
                    <div className={`p-2 rounded-lg bg-neutral-800/80 ${strat.badgeColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">{strat.tagline}</h3>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{strat.idealFor}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono">
                  <span className={strat.badgeColor}>{strat.carbonFactor}</span>
                  <span className="text-neutral-500">Tap to inspect</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Deep Dive Strategy Feature Block */}
        <div className="mt-8 bg-neutral-900/90 border border-neutral-800 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <CurrentIcon className="w-4 h-4" />
                <span>Strategy Overview · {current.title}</span>
              </div>
              <h3 className="text-2xl font-bold text-white">{current.tagline}</h3>
              <p className="text-sm text-neutral-300 leading-relaxed">
                {current.idealFor}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-[11px] font-mono text-neutral-500 uppercase">Embodied Carbon Saved</div>
                  <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">{current.carbonFactor}</div>
                </div>
                <div className="p-3.5 bg-neutral-950 rounded-xl border border-neutral-800">
                  <div className="text-[11px] font-mono text-neutral-500 uppercase">Economic Benefit</div>
                  <div className="text-base font-bold text-cyan-400 font-mono mt-0.5">{current.costSavings}</div>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-3">
                {activeStrategy === 'reuse' ? (
                  <button
                    onClick={onExploreMarketplace}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>{current.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={onOpenPickupModal}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <span>{current.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
                
                <span className="text-xs text-neutral-500 font-mono">
                  Supported by campus repair clinics & authorized R2 refiners
                </span>
              </div>

            </div>

            {/* Checklist / Criteria comparison */}
            <div className="lg:col-span-5 bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-3 font-mono text-xs">
              <div className="text-neutral-400 font-semibold border-b border-neutral-800 pb-2">
                Triage Decision Matrix
              </div>
              
              <div className="space-y-2 text-neutral-300">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Choose <strong>Repair</strong> if device boots, screen lights up, or issue is isolated to software, thermal paste, or modular battery.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span>Choose <strong>Reuse / Donation</strong> if device is within 6 years old, fully functional, and capable of web browsing or office tasks.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Choose <strong>Certified Recycling</strong> if motherboard PCB is fractured, liquid corroded, or battery is bulging.</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
