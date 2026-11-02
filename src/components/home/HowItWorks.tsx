import React from 'react';
import { Sparkles, Truck, Wrench, Award, CheckCircle } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Instant Assessment & Triage',
      desc: 'Tell us your device brand, model, and condition. EcoAI computes repairability scores, precious metal content, and generates step-by-step cryptographic data-wiping guides.',
      icon: Sparkles,
      highlight: 'Automated Repairability Check'
    },
    {
      step: '02',
      title: 'Drop-off Kiosk or Doorstep Pickup',
      desc: 'Choose an on-campus solar eco-depot or schedule doorstep collection. Nearby pickups are clustered using route optimization algorithms to minimize transportation emissions.',
      icon: Truck,
      highlight: 'Grouped Low-Emission Logistics'
    },
    {
      step: '03',
      title: 'Certified Repair & Urban Mining',
      desc: 'Viable units enter student repair co-ops or educational refurbishment labs. End-of-life units undergo R2v3-certified de-pollution, recovering up to 98% of copper, gold, and aluminum.',
      icon: Wrench,
      highlight: 'Zero-Landfill Guarantee'
    },
    {
      step: '04',
      title: 'Eco-Points & Verified Custody',
      desc: 'Follow your hardware through 7 distinct transparent custody stages. Receive verified Eco-Points to redeem for campus discounts, cafe vouchers, or verified agroforestry tree planting.',
      icon: Award,
      highlight: 'Proof of Environmental Impact'
    }
  ];

  return (
    <section className="py-20 bg-neutral-950 border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
            A Transparent Circular Workflow
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mt-2 text-balance">
            How E-Cycle AI Closes the Electronics Loop
          </h2>
          <p className="text-sm text-neutral-400 mt-3 leading-relaxed">
            Unlike traditional junk disposal, our 4-tier pipeline prioritizes life-extension and component reuse before responsible certified material recovery.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative bg-neutral-905 bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-emerald-500/40 transition-all duration-200 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-2xl font-bold font-mono text-emerald-400/80 group-hover:text-emerald-400 transition-colors">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-950/40 group-hover:border-emerald-700/50 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="text-base font-semibold text-white mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-neutral-800/60 flex items-center gap-1.5 text-[11px] font-mono text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{s.highlight}</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
