import React from 'react';
import { Recycle, Globe, ShieldCheck, FileText } from 'lucide-react';

interface Props {
  setActiveTab: (tab: string) => void;
  onOpenPickupModal: () => void;
}

export const Footer: React.FC<Props> = ({ setActiveTab, onOpenPickupModal }) => {
  return (
    <footer className="w-full bg-neutral-950 border-t border-neutral-800/80 pt-16 pb-12 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-neutral-800/60">
          
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="text-base font-bold tracking-tight">E-Cycle AI</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed">
              Smart e-waste management platform transforming obsolete electronics into circular resources through AI triage, certified R2v3 recycler matching, and UN SDG impact analytics.
            </p>
            <div className="flex items-center gap-2 text-neutral-400 font-mono text-[11px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Basel Convention & EPA WARM v15 Aligned</span>
            </div>
          </div>

          {/* Platform Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Platform</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-emerald-400 transition-colors">
                  Platform Overview
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('centres')} className="hover:text-emerald-400 transition-colors">
                  Verified Collection Centres
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('track')} className="hover:text-emerald-400 transition-colors">
                  7-Stage Chain of Custody
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('marketplace')} className="hover:text-emerald-400 transition-colors">
                  Reuse & Repair Marketplace
                </button>
              </li>
              <li>
                <button onClick={onOpenPickupModal} className="hover:text-emerald-400 transition-colors">
                  Schedule E-Waste Pickup
                </button>
              </li>
            </ul>
          </div>

          {/* Sustainability & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Sustainability & SDGs</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setActiveTab('sdg')} className="hover:text-emerald-400 transition-colors">
                  SDG 12: Responsible Consumption
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('sdg')} className="hover:text-emerald-400 transition-colors">
                  SDG 13: Climate Action (GHG Avoidance)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('sdg')} className="hover:text-emerald-400 transition-colors">
                  SDG 11: Sustainable Smart Cities
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('rewards')} className="hover:text-emerald-400 transition-colors">
                  Eco-Points & Tree Planting
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('privacy')} className="hover:text-emerald-400 transition-colors">
                  Data Sanitization Guidelines
                </button>
              </li>
            </ul>
          </div>

          {/* Hackathon & Institutional */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono">Institutional Audit</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Are you a university department, hostel, or corporate lab? Generate an automated ESG compliance audit report for your facility.
            </p>
            <button
              onClick={() => setActiveTab('analytics')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 rounded-lg text-xs font-medium text-emerald-300 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>Generate Campus Audit</span>
            </button>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            © 2026 E-Cycle AI Platform. Built for the UN SDG Sustainable Innovation Hackathon.
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-emerald-500/80">Simulated Campus Environment</span>
            <span>·</span>
            <span>Zero-Landfill Commitment</span>
            <span>·</span>
            <button onClick={() => setActiveTab('privacy')} className="hover:text-neutral-300">
              Data Privacy Checklist
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
