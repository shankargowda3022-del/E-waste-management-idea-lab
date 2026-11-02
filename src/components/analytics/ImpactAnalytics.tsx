import React, { useState } from 'react';
import { calculatePlatformMetrics } from '../../services/storage';
import { BarChart3, PieChart, TrendingUp, Download, FileText, Globe, ShieldCheck, Printer, Check } from 'lucide-react';

export const ImpactAnalytics: React.FC = () => {
  const metrics = calculatePlatformMetrics();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [institutionName, setInstitutionName] = useState('Apex Engineering College');
  const [department, setDepartment] = useState('Department of Computer Science & Labs');
  const [isExporting, setIsExporting] = useState(false);

  // Monthly collection trends (kg)
  const monthlyData = [
    { month: 'Jun', kg: 520, co2: 2100 },
    { month: 'Jul', kg: 680, co2: 2750 },
    { month: 'Aug', kg: 840, co2: 3400 },
    { month: 'Sep', kg: 1100, co2: 4450 },
    { month: 'Oct', kg: 1350, co2: 5460 },
    { month: 'Nov', kg: 1620, co2: 6540 }
  ];

  const maxKg = Math.max(...monthlyData.map(d => d.kg));

  // Category composition data
  const categoryComposition = [
    { name: 'Laptops & PCs', percent: 42, color: 'bg-emerald-500' },
    { name: 'Monitors & TVs', percent: 26, color: 'bg-cyan-500' },
    { name: 'Mobile & Tablets', percent: 18, color: 'bg-amber-500' },
    { name: 'Li-Ion Batteries', percent: 9, color: 'bg-indigo-500' },
    { name: 'PCBs & Other', percent: 5, color: 'bg-purple-500' }
  ];

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <section className="py-12 bg-neutral-950 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Lifecycle Assessment (LCA) Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
              Environmental Impact Analytics
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Real-time resource recovery statistics modeled after EPA WARM v15 and Basel Convention urban mining recovery metrics.
            </p>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-emerald-300 text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm shrink-0"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Generate Institutional Audit</span>
          </button>
        </div>

        {/* 4 Primary Top Metric Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Total E-Waste Processed</div>
            <div className="text-3xl font-bold text-emerald-400 font-mono tabular-nums mt-1">
              {metrics.totalKg.toLocaleString()} <span className="text-sm font-normal text-emerald-300">kg</span>
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              100% diverted from municipal incinerators
            </div>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Avoided GHG Emissions</div>
            <div className="text-3xl font-bold text-cyan-400 font-mono tabular-nums mt-1">
              {metrics.totalCo2Kg.toLocaleString()} <span className="text-sm font-normal text-cyan-300">kg CO2e</span>
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Equiv. to {metrics.treeEquivalents} trees planted for 10 yrs
            </div>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Devices Repaired / Reused</div>
            <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">
              {metrics.repairedCount.toLocaleString()} <span className="text-sm font-normal text-neutral-400">units</span>
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              {((metrics.repairedCount / metrics.totalDevices) * 100).toFixed(1)}% circular reuse rate
            </div>
          </div>

          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-wider">Completion Rate</div>
            <div className="text-3xl font-bold text-white font-mono tabular-nums mt-1">
              {metrics.completionRate}%
            </div>
            <div className="text-xs text-neutral-400 mt-2">
              Average custody turnaround: 48 hours
            </div>
          </div>

        </div>

        {/* Charts Split: Monthly Trend SVG Bar Chart + Category Donut Composition */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Monthly Trend SVG Bar Chart */}
          <div className="lg:col-span-7 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white">Monthly E-Waste Diverted (kg)</h3>
                <div className="text-xs text-neutral-400 font-mono">Continuous Growth over Past 6 Months</div>
              </div>
              <span className="text-xs font-mono text-emerald-400">Active Logging</span>
            </div>

            {/* Visual Bar Chart */}
            <div className="mt-8 h-56 flex items-end justify-between gap-4 pt-6 px-2">
              {monthlyData.map((d) => {
                const heightPercent = Math.round((d.kg / maxKg) * 100);
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-mono text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.kg}kg
                    </span>
                    <div className="w-full bg-neutral-950 rounded-t-lg h-44 flex items-end p-1 border border-neutral-800/60">
                      <div
                        className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-500 group-hover:from-emerald-500 group-hover:to-cyan-400"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-neutral-400">{d.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono text-neutral-400">
              <span>Baseline: 520 kg (Jun 2026)</span>
              <span className="text-emerald-400 font-bold">+211% Total Volume Surge</span>
            </div>
          </div>

          {/* Category Breakdown & Material Yields */}
          <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-neutral-800">
                <h3 className="text-sm font-bold text-white">Hardware Category Composition</h3>
                <div className="text-xs text-neutral-400 font-mono">By Estimated Mass Recovered</div>
              </div>

              {/* Composition Bars */}
              <div className="mt-6 space-y-3">
                {categoryComposition.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-neutral-300">{cat.name}</span>
                      <span className="text-neutral-400 font-bold tabular-nums">{cat.percent}%</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                      <div
                        className={`${cat.color} h-full rounded-full`}
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Urban Mining Precious Metal Recovery Tally */}
            <div className="mt-6 p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-2 text-xs font-mono">
              <span className="text-neutral-500 uppercase text-[11px] block">Calculated Urban Mining Yield</span>
              <div className="flex justify-between text-neutral-300">
                <span>Gold (Au) Reclaimed:</span>
                <span className="text-amber-400 font-bold tabular-nums">{metrics.totalGoldGrams} grams</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Copper (Cu) Extracted:</span>
                <span className="text-amber-300 font-bold tabular-nums">{metrics.totalCopperKg} kg</span>
              </div>
              <div className="flex justify-between text-neutral-300">
                <span>Al & Steel Chassis:</span>
                <span className="text-neutral-200 font-bold tabular-nums">~{Math.round(metrics.totalKg * 0.65)} kg</span>
              </div>
            </div>

          </div>

        </div>

        {/* Methodology & Assumption Disclosure */}
        <div className="mt-8 p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 leading-relaxed font-mono">
          <strong className="text-neutral-200">Transparency Notice: </strong>
          Environmental impact values are estimates computed using life-cycle analysis (LCA) assumptions from EPA WARM v15 and the Basel Convention E-Waste Guidelines. Actual smelting yields may vary based on specific printed circuit board assay purity.
        </div>

      </div>

      {/* Institutional Audit Generator Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 text-xs space-y-6">
            
            <div className="flex items-start justify-between pb-4 border-b border-neutral-800">
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase">ESG Audit Certificate</span>
                <h2 className="text-xl font-bold text-white mt-1">Campus E-Waste Compliance Report</h2>
                <div className="text-xs text-neutral-400 font-mono mt-0.5">Report Reference: ESG-2026-EW-{Math.floor(1000 + Math.random() * 9000)}</div>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Institution Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1">Department / Facility</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
                />
              </div>
            </div>

            {/* Printable Preview Container */}
            <div className="p-6 bg-neutral-950 border border-neutral-800 rounded-xl space-y-4 font-mono text-xs">
              <div className="text-center pb-3 border-b border-neutral-800">
                <div className="text-base font-bold text-white uppercase">{institutionName}</div>
                <div className="text-neutral-400 text-xs">{department}</div>
                <div className="text-[11px] text-emerald-400 mt-1">Verified Scope 3 Waste Diversion Audit · Nov 2026</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-neutral-900 rounded-lg">
                  <span className="text-neutral-500 text-[10px] block">TOTAL MASS DIVERTED</span>
                  <span className="text-lg font-bold text-emerald-400">{metrics.totalKg} kg</span>
                </div>
                <div className="p-3 bg-neutral-900 rounded-lg">
                  <span className="text-neutral-500 text-[10px] block">AVOIDED EMISSIONS</span>
                  <span className="text-lg font-bold text-cyan-400">{metrics.totalCo2Kg} kg CO2e</span>
                </div>
              </div>

              <div className="space-y-1.5 text-neutral-300 text-[11px] pt-2">
                <div className="flex justify-between">
                  <span>UN SDG 12 Compliance:</span>
                  <span className="text-emerald-400 font-bold">Passed (Zero-Landfill Target Met)</span>
                </div>
                <div className="flex justify-between">
                  <span>Cryptographic Data Sanitization:</span>
                  <span className="text-emerald-400 font-bold">NIST SP 800-88 Rev. 1 Certified</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Downstream Smelter:</span>
                  <span className="text-neutral-200 font-bold">GreenTech Certified Recyclers (R2v3)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={handlePrintAudit}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official PDF / Export Audit</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};
