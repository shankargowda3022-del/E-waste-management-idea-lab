import React, { useState } from 'react';
import { CATEGORY_DETAILS } from '../../data/mockData';
import { Laptop, Smartphone, HardDrive, Tv, BatteryCharging, Headphones, Cpu, Microwave, AlertTriangle, ArrowRight, Sparkles } from 'lucide-react';
import { Reveal } from '../common/Reveal';

interface Props {
  onSelectCategoryForPickup: (category: string) => void;
  onOpenAssistantWithCategory: (category: string) => void;
  onOpenPrivacy: () => void;
}

export const AcceptedCategories: React.FC<Props> = ({
  onSelectCategoryForPickup,
  onOpenAssistantWithCategory,
  onOpenPrivacy
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Laptops');

  const categoryIcons: Record<string, React.ElementType> = {
    'Laptops': Laptop,
    'Smartphones & Tablets': Smartphone,
    'Desktops & Servers': HardDrive,
    'Large Displays & TVs': Tv,
    'Lithium-Ion Batteries': BatteryCharging,
    'Audio & Wearables': Headphones,
    'PCBs & RAM': Cpu,
    'Small Appliances': Microwave
  };

  const details = CATEGORY_DETAILS[selectedCategory] || CATEGORY_DETAILS['Laptops'];
  const CurrentIcon = categoryIcons[selectedCategory] || Laptop;

  return (
    <section className="py-20 bg-[#F7FAF8] border-b border-[#E1EBE5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-[#E1EBE5]">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#16A36A] font-semibold">
              Accepted Electronics Directory
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-[#182B26] mt-2">
              What Can You Recycle with E-Cycle AI?
            </h2>
            <p className="text-sm text-[#718078] mt-2 max-w-xl leading-relaxed">
              From microscopic drone batteries to mainframe servers, explore typical material yields and safe handling precautions for each electronics category.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#718078]">
            <span>Select any category below to inspect recovery telemetry</span>
          </div>
        </Reveal>

        {/* Categories selector strip */}
        <Reveal delayMs={60} className="mt-8 flex flex-wrap gap-2">
          {Object.keys(CATEGORY_DETAILS).map((cat) => {
            const Icon = categoryIcons[cat] || Laptop;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#123D32] text-white shadow-sm'
                    : 'bg-white text-[#182B26] hover:bg-[#B9F5D0]/30 border border-[#DCE6E0]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#B9F5D0]' : 'text-[#16A36A]'}`} />
                <span className="whitespace-nowrap">{cat}</span>
              </button>
            );
          })}
        </Reveal>

        {/* Detailed Inspection Box */}
        <Reveal delayMs={120}>
          <div className="mt-8 eco-card p-6 sm:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-4 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#B9F5D0]/50 border border-[#16A36A]/25 flex items-center justify-center text-[#123D32]">
                  <CurrentIcon className="w-6 h-6 text-[#16A36A]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#182B26]">{selectedCategory}</h3>
                  <p className="text-xs text-[#718078] mt-1 leading-relaxed">
                    {details.recommendedAction}
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => onSelectCategoryForPickup(selectedCategory)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    <span>Recycle {selectedCategory}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenAssistantWithCategory(selectedCategory)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F7FAF8] hover:bg-[#B9F5D0]/35 border border-[#DCE6E0] text-[#123D32] text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#16A36A]" />
                    <span>Analyze with EcoAI</span>
                  </button>
                </div>
              </div>

              {/* Metrics cards */}
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl space-y-1">
                  <div className="text-[11px] font-mono text-[#718078] uppercase">Avg GHG Avoidance</div>
                  <div className="text-xl font-bold text-[#16A36A] font-mono tabular-nums">
                    {details.co2SavingsPerUnitKg} <span className="text-xs text-[#718078] font-normal">kg CO2e</span>
                  </div>
                  <div className="text-[11px] text-[#718078]">vs virgin material extraction</div>
                </div>

                <div className="p-4 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl space-y-1">
                  <div className="text-[11px] font-mono text-[#718078] uppercase">Precious Gold Yield</div>
                  <div className="text-xl font-bold text-amber-600 font-mono tabular-nums">
                    {details.typicalGoldMg} <span className="text-xs text-[#718078] font-normal">mg / unit</span>
                  </div>
                  <div className="text-[11px] text-[#718078]">~{details.typicalCopperGrams}g copper reclaimed</div>
                </div>

                <div className="p-4 bg-[#F7FAF8] border border-[#E1EBE5] rounded-xl space-y-1">
                  <div className="text-[11px] font-mono text-[#718078] uppercase">Average Weight</div>
                  <div className="text-xl font-bold text-[#182B26] font-mono tabular-nums">
                    {details.avgWeightKg} <span className="text-xs text-[#718078] font-normal">kg</span>
                  </div>
                  <div className="text-[11px] text-[#718078]">standard unit specification</div>
                </div>

                {/* Hazard callout row with direct link to privacy & safety */}
                <div className="sm:col-span-3 p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-semibold text-[#182B26]">Environmental & Toxic Risk: </span>
                      <span className="text-[#53635B]">
                        Contains {details.hazardousElements.join(', ')}. Must be processed in hermetic de-pollution environments.
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onOpenPrivacy}
                    className="text-xs font-mono font-semibold text-[#16A36A] hover:text-[#123D32] hover:underline shrink-0 whitespace-nowrap cursor-pointer"
                  >
                    Safe Handling Guide →
                  </button>
                </div>

              </div>

            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
};
