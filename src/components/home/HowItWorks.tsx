import React from 'react';
import { Sparkles, Truck, Wrench, Award, CheckCircle, ArrowRight } from 'lucide-react';
import { Reveal } from '../common/Reveal';

interface Props {
  onOpenAssistant: () => void;
  onExploreCentres: () => void;
  onExploreMarketplace: () => void;
  onOpenRewards: () => void;
}

export const HowItWorks: React.FC<Props> = ({
  onOpenAssistant,
  onExploreCentres,
  onExploreMarketplace,
  onOpenRewards
}) => {
  const steps = [
    {
      step: '01',
      title: 'Instant Assessment & Triage',
      desc: 'Tell us your device brand, model, and condition. EcoAI computes repairability scores, precious metal content, and generates step-by-step cryptographic data-wiping guides.',
      icon: Sparkles,
      highlight: 'Automated Repairability Check',
      actionText: 'Launch EcoAI Triage',
      action: onOpenAssistant
    },
    {
      step: '02',
      title: 'Drop-off Kiosk or Doorstep Pickup',
      desc: 'Choose an on-campus solar eco-depot or schedule doorstep collection. Nearby pickups are clustered using route optimization algorithms to minimize transportation emissions.',
      icon: Truck,
      highlight: 'Grouped Low-Emission Logistics',
      actionText: 'View Collection Kiosks',
      action: onExploreCentres
    },
    {
      step: '03',
      title: 'Certified Repair & Urban Mining',
      desc: 'Viable units enter student repair co-ops or educational refurbishment labs. End-of-life units undergo R2v3-certified de-pollution, recovering up to 98% of copper, gold, and aluminum.',
      icon: Wrench,
      highlight: 'Zero-Landfill Guarantee',
      actionText: 'Browse Campus Marketplace',
      action: onExploreMarketplace
    },
    {
      step: '04',
      title: 'Eco-Points & Verified Custody',
      desc: 'Follow your hardware through 7 distinct transparent custody stages. Receive verified Eco-Points to redeem for campus discounts, cafe vouchers, or verified agroforestry tree planting.',
      icon: Award,
      highlight: 'Proof of Environmental Impact',
      actionText: 'Explore Rewards Center',
      action: onOpenRewards
    }
  ];

  return (
    <section className="py-20 bg-white border-b border-[#E1EBE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <Reveal className="max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-[#16A36A] font-semibold">
            A Transparent Circular Workflow
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-[#182B26] mt-2 text-balance">
            How E-Cycle AI Closes the Electronics Loop
          </h2>
          <p className="text-sm text-[#718078] mt-3 leading-relaxed">
            Unlike traditional junk disposal, our 4-tier pipeline prioritizes life-extension and component reuse before responsible certified material recovery.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Reveal key={s.step} delayMs={idx * 70}>
                <div
                  className="h-full relative eco-card eco-card-interactive p-6 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-2xl font-bold font-mono text-[#16A36A]/80 group-hover:text-[#123D32] transition-colors tabular-nums">
                        {s.step}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#F7FAF8] border border-[#DCE6E0] flex items-center justify-center text-[#16A36A] group-hover:bg-[#B9F5D0]/50 group-hover:border-[#16A36A]/35 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#182B26] mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-[#718078] leading-relaxed">
                      {s.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E1EBE5] space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#16A36A] font-semibold">
                      <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{s.highlight}</span>
                    </div>

                    <button
                      onClick={s.action}
                      className="w-full py-2.5 px-3 bg-[#F7FAF8] hover:bg-[#123D32] border border-[#DCE6E0] hover:border-[#123D32] rounded-xl text-xs font-semibold text-[#182B26] hover:text-white transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{s.actionText}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#16A36A] group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
};
