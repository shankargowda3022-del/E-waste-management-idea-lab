import React, { useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquare, HelpCircle } from 'lucide-react';

export const TestimonialsFaq: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const testimonials = [
    {
      quote: "Our campus robotics club had over 40 outdated LiPo batteries and obsolete control boards taking up locker space. E-Cycle AI provided hazardous vermiculite containers and credited our club with 940 Eco-Points that funded new sensor kits.",
      name: "Marcus Vance",
      role: "Vice President, IEEE Student Chapter",
      org: "Apex Engineering College"
    },
    {
      quote: "The repair-first triage is a game-changer. Instead of dumping 15 university lab ThinkPads that were sluggish, the MicroFix lab replaced the mechanical drives with NVMe SSDs and gave them to first-year scholarship students.",
      name: "Dr. Ananya Roy",
      role: "Director of Digital Infrastructure",
      org: "North Campus Innovation Center"
    },
    {
      quote: "As an R2v3 certified e-waste processor, our biggest challenge is receiving unorganized, hazardous batteries mixed into regular shred piles. E-Cycle AI’s pre-triage and serial tracking gives us pre-sorted batches ready for hydrometallurgical smelting.",
      name: "Rajiv Malhotra",
      role: "Operations Lead",
      org: "GreenTech Certified Recyclers"
    }
  ];

  const faqs = [
    {
      q: "How does E-Cycle AI protect my personal data before recycling?",
      a: "Data security is our top priority. Our platform provides manufacturer-approved cryptographic wiping checklists for iOS, Android, macOS, and Windows. When drop-offs arrive at verified centers, technician protocols perform DoD 5220.22-M 3-pass overwrites or physical disk degaussing/punching with verifiable audit certificates."
    },
    {
      q: "What should I do if my smartphone or laptop battery is visibly swollen?",
      a: "Never puncture, compress, or place swollen lithium batteries into ordinary trash! Swelling indicates internal gas generation from electrolyte decomposition. Immediately apply non-conductive tape over metal contacts, place the battery into a non-flammable container, and select 'Hazardous Condition' on our pickup form for priority collection."
    },
    {
      q: "Are pickup requests free for students and local residents?",
      a: "Yes! Doorstep collections within university zones and partnered municipal neighborhoods are 100% free. Collections are subsidized by our certified R2v3 material recovery partners through circular metal smelting yields."
    },
    {
      q: "How are Eco-Points converted into real rewards?",
      a: "Once our partner scans custody of your device and completes diagnostic or shred certification, points are instantly credited to your wallet. You can redeem points for campus bookstore discounts, free zero-waste cafe beverages, or real geotagged tree plantings via our agroforestry partners."
    },
    {
      q: "What is the difference between R2v3 certification and standard junk disposal?",
      a: "R2v3 (Responsible Recycling) is the global gold standard for electronics recyclers. It mandates strict environmental controls, guarantees zero toxic export to developing nations, verifies worker health protections, and legally requires data destruction validation."
    }
  ];

  return (
    <section className="py-20 bg-neutral-950 border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Testimonials Block */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-8 border-b border-neutral-800/60">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
                Community Feedback
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white mt-1">
                Trusted Across Campus & Industry
              </h2>
            </div>
            <div className="text-xs font-mono text-neutral-400">
              *Demo community reviews illustrating campus pilot impact
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between"
              >
                <p className="text-xs text-neutral-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
                <div className="mt-6 pt-4 border-t border-neutral-800/60">
                  <div className="text-xs font-bold text-white">{t.name}</div>
                  <div className="text-[11px] text-emerald-400">{t.role}</div>
                  <div className="text-[11px] text-neutral-400 font-mono">{t.org}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Block */}
        <div className="mt-20">
          <div className="max-w-2xl">
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Questions & Knowledge Base</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-2">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-neutral-400 mt-2">
              Everything you need to know about safe disposal, data privacy, and certified circular recovery.
            </p>
          </div>

          <div className="mt-8 space-y-3 max-w-3xl">
            {faqs.map((f, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="bg-neutral-900/70 border border-neutral-800 rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-white hover:text-emerald-300 transition-colors"
                  >
                    <span>{f.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/60 pt-3">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
