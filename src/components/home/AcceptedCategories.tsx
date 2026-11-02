import React, { useState } from 'react';
import { CATEGORY_DETAILS } from '../../data/mockData';
import { Laptop, Smartphone, HardDrive, Tv, BatteryCharging, Headphones, Cpu, Microwave, AlertTriangle, ArrowRight } from 'lucide-react';

interface Props {
  onSelectCategoryForPickup: (category: string) => void;
}

export const AcceptedCategories: React.FC<Props> = ({ onSelectCategoryForPickup }) => {
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
    <section className="py-20 bg-neutral-900/30 border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-12 border-b border-neutral-800/60">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              Accepted Electronics Directory
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white mt-2">
              What Can You Recycle with E-Cycle AI?
            </h2>
            <p className="text-sm text-neutral-400 mt-2 max-w-xl leading-relaxed">
              From microscopic drone batteries to mainframe servers, explore typical material yields and safe handling precautions for each electronics category.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>Click any category to inspect recovery telemetry</span>
          </div>
        </div>

        {/* Categories selector strip */}
        <div className="mt-8 flex flex-wrap gap-2">
          {Object.keys(CATEGORY_DETAILS).map((cat) => {
            const Icon = categoryIcons[cat] || Laptop;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                    : 'bg-neutral-900 text-neutral-300 hover:bg-neutral-800 border border-neutral-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">{cat}</span>
              </button>
            );
          })}
        </div>

        {/* Detailed Inspection Box */}
        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-4 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                <CurrentIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedCategory}</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  {details.recommendedAction}
                </p>
              </div>

              <button
                onClick={() => onSelectCategoryForPickup(selectedCategory)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
              >
                <span>Recycle {selectedCategory}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Metrics cards */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-neutral-500 uppercase">Avg GHG Avoidance</div>
                <div className="text-xl font-bold text-emerald-400 font-mono tabular-nums">
                  {details.co2SavingsPerUnitKg} <span className="text-xs text-neutral-400 font-normal">kg CO2e</span>
                </div>
                <div className="text-[11px] text-neutral-400">vs virgin material extraction</div>
              </div>

              <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-neutral-500 uppercase">Precious Gold Yield</div>
                <div className="text-xl font-bold text-amber-400 font-mono tabular-nums">
                  {details.typicalGoldMg} <span className="text-xs text-neutral-400 font-normal">mg / unit</span>
                </div>
                <div className="text-[11px] text-neutral-400">~{details.typicalCopperGrams}g copper reclaimed</div>
              </div>

              <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-xl space-y-1">
                <div className="text-[11px] font-mono text-neutral-500 uppercase">Average Weight</div>
                <div className="text-xl font-bold text-white font-mono tabular-nums">
                  {details.avgWeightKg} <span className="text-xs text-neutral-400 font-normal">kg</span>
                </div>
                <div className="text-[11px] text-neutral-400">standard unit specification</div>
              </div>

              {/* Hazard callout row */}
              <div className="sm:col-span-3 p-4 bg-neutral-950/60 border border-neutral-800/80 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-neutral-200">Environmental & Toxic Risk: </span>
                  <span className="text-neutral-400">
                    Contains {details.hazardousElements.join(', ')}. Must be processed in hermetic de-pollution environments to prevent groundwater contamination.
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
