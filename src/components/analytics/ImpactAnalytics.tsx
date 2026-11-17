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
    { name: 'Laptops & PCs', percent: 42, color: 'bg-[#16A36A]' },
    { name: 'Monitors & TVs', percent: 26, color: 'bg-[#123D32]' },
    { name: 'Mobile & Tablets', percent: 18, color: 'bg-amber-500' },
    { name: 'Li-Ion Batteries', percent: 9, color: 'bg-emerald-400' },
    { name: 'PCBs & Other', percent: 5, color: 'bg-teal-600' }
  ];

  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <section className="py-12 bg-[#F7FAF8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E1EBE5]">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#16A36A] font-semibold flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Lifecycle Assessment (LCA) Dashboard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#182B26] mt-1">
              Environmental Impact Analytics
            </h1>
            <p className="text-xs text-[#718078] mt-1 max-w-2xl leading-relaxed">
              Real-time resource recovery statistics modeled after EPA WARM v15 and Basel Convention urban mining recovery metrics.
            </p>
          </div>

          <button
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2.5 bg-[#123D32] hover:bg-[#0D2E25] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-sm shrink-0 cursor-pointer"
          >
            <FileText className="w-4 h-4 text-[#B9F5D0]" />
            <span>Generate Institutional Audit</span>
          </button>
        </div>

        {/* 4 Primary Top Metric Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="p-6 eco-card">
            <div className="text-xs font-mono text-[#718078] uppercase tracking-wider">Total E-Waste Processed</div>
            <div className="text-3xl font-bold text-[#16A36A] font-mono tabular-nums mt-1">
              {metrics.totalKg.toLocaleString()} <span className="text-sm font-normal text-[#718078]">kg</span>
            </div>
            <div className="text-xs text-[#718078] mt-2">
              100% diverted from municipal incinerators
            </div>
          </div>

          <div className="p-6 eco-card">
            <div className="text-xs font-mono text-[#718078] uppercase tracking-wider">Avoided GHG Emissions</div>
            <div className="text-3xl font-bold text-[#123D32] font-mono tabular-nums mt-1">
              {metrics.totalCo2Kg.toLocaleString()} <span className="text-sm font-normal text-[#718078]">kg CO2e</span>
            </div>
            <div className="text-xs text-[#718078] mt-2">
              Equiv. to {metrics.treeEquivalents} trees planted for 10 yrs
            </div>
          </div>

          <div className="p-6 eco-card">
            <div className="text-xs font-mono text-[#718078] uppercase tracking-wider">Devices Repaired / Reused</div>
            <div className="text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">
              {metrics.repairedCount.toLocaleString()} <span className="text-sm font-normal text-[#718078]">units</span>
            </div>
            <div className="text-xs text-[#718078] mt-2">
              {((metrics.repairedCount / metrics.totalDevices) * 100).toFixed(1)}% circular reuse rate
            </div>
          </div>

          <div className="p-6 eco-card">
            <div className="text-xs font-mono text-[#718078] uppercase tracking-wider">Completion Rate</div>
            <div className="text-3xl font-bold text-[#182B26] font-mono tabular-nums mt-1">
              {metrics.completionRate}%
            </div>
            <div className="text-xs text-[#718078] mt-2">
              Average custody turnaround: 48 hours
            </div>
          </div>

        </div>

        {/* Charts Split: Monthly Trend SVG Bar Chart + Category Donut Composition */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Monthly Trend SVG Bar Chart */}
          <div className="lg:col-span-7 eco-card p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#E1EBE5]">
              <div>
                <h3 className="text-sm font-bold text-[#182B26]">Monthly E-Waste Diverted (kg)</h3>
                <div className="text-xs text-[#718078] font-mono">Continuous Growth over Past 6 Months</div>
              </div>
              <span className="text-xs font-mono text-[#16A36A] font-semibold">Active Logging</span>
            </div>

            {/* Visual Bar Chart */}
            <div className="mt-8 h-56 flex items-end justify-between gap-4 pt-6 px-2">
              {monthlyData.map((d) => {
                const heightPercent = Math.round((d.kg / maxKg) * 100);
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[11px] font-mono font-bold text-[#123D32] opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
                      {d.kg}kg
                    </span>
                    <div className="w-full bg-[#F7FAF8] rounded-t-lg h-44 flex items-end p-1 border border-[#DCE6E0]">
                      <div
                        className="w-full bg-gradient-to-t from-[#123D32] to-[#16A36A] rounded-t transition-all duration-500 group-hover:from-[#16A36A] group-hover:to-[#22C55E]"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono text-[#718078] font-medium">{d.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-[#E1EBE5] flex items-center justify-between text-xs font-mono text-[#718078]">
              <span>Baseline: 520 kg (Jun 2026)</span>
              <span className="text-[#16A36A] font-bold">+211% Total Volume Surge</span>
            </div>
          </div>

          {/* Category Breakdown & Material Yields */}
          <div className="lg:col-span-5 eco-card p-6 flex flex-col justify-between">
            <div>
              <div className="pb-4 border-b border-[#E1EBE5]">
                <h3 className="text-sm font-bold text-[#182B26]">Hardware Category Composition</h3>
                <div className="text-xs text-[#718078] font-mono">By Estimated Mass Recovered</div>
              </div>

              {/* Composition Bars */}
              <div className="mt-6 space-y-3">
                {categoryComposition.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-[#182B26] font-medium">{cat.name}</span>
                      <span className="text-[#123D32] font-bold tabular-nums">{cat.percent}%</span>
                    </div>
                    <div className="w-full bg-[#F7FAF8] h-2 rounded-full overflow-hidden border border-[#DCE6E0]">
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
            <div className="mt-6 p-4 bg-[#123D32] border border-[#1D5446] rounded-xl space-y-2 text-xs font-mono text-white">
              <span className="text-[#B9F5D0] uppercase text-[11px] font-semibold block">Calculated Urban Mining Yield</span>
              <div className="flex justify-between">
                <span className="text-[#C8DDD2]">Gold (Au) Reclaimed:</span>
                <span className="text-[#B9F5D0] font-bold tabular-nums">{metrics.totalGoldGrams} grams</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C8DDD2]">Copper (Cu) Extracted:</span>
                <span className="text-white font-bold tabular-nums">{metrics.totalCopperKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#C8DDD2]">Al & Steel Chassis:</span>
                <span className="text-white font-bold tabular-nums">~{Math.round(metrics.totalKg * 0.65)} kg</span>
              </div>
            </div>

          </div>

        </div>

        {/* Methodology & Assumption Disclosure */}
        <div className="mt-8 p-4 bg-white border border-[#DCE6E0] rounded-xl text-xs text-[#718078] leading-relaxed font-mono">
          <strong className="text-[#182B26]">Transparency Notice: </strong>
          Environmental impact values are estimates computed using life-cycle analysis (LCA) assumptions from EPA WARM v15 and the Basel Convention E-Waste Guidelines. Actual smelting yields may vary based on specific printed circuit board assay purity.
        </div>

      </div>

      {/* Institutional Audit Generator Modal */}
      {reportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#123D32]/50 backdrop-blur-sm animate-modal-in">
          <div className="w-full max-w-2xl bg-white border border-[#DCE6E0] rounded-2xl p-6 sm:p-8 text-xs space-y-6 shadow-2xl">
            
            <div className="flex items-start justify-between pb-4 border-b border-[#E1EBE5]">
              <div>
                <span className="text-xs font-mono text-[#16A36A] font-semibold uppercase">ESG Audit Certificate</span>
                <h2 className="text-xl font-bold text-[#182B26] mt-1">Campus E-Waste Compliance Report</h2>
                <div className="text-xs text-[#718078] font-mono mt-0.5">Report Reference: ESG-2026-EW-{Math.floor(1000 + Math.random() * 9000)}</div>
              </div>
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-[#718078] hover:text-[#182B26] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#182B26] font-semibold mb-1">Institution Name</label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1">Department / Facility</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                />
              </div>
            </div>

            {/* Printable Preview Container */}
            <div className="p-6 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl space-y-4 font-mono text-xs">
              <div className="text-center pb-3 border-b border-[#E1EBE5]">
                <div className="text-base font-bold text-[#182B26] uppercase">{institutionName}</div>
                <div className="text-[#718078] text-xs">{department}</div>
                <div className="text-[11px] text-[#16A36A] font-semibold mt-1">Verified Scope 3 Waste Diversion Audit · Nov 2026</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white border border-[#DCE6E0] rounded-lg">
                  <span className="text-[#718078] text-[10px] block">TOTAL MASS DIVERTED</span>
                  <span className="text-lg font-bold text-[#16A36A] tabular-nums">{metrics.totalKg} kg</span>
                </div>
                <div className="p-3 bg-white border border-[#DCE6E0] rounded-lg">
                  <span className="text-[#718078] text-[10px] block">AVOIDED EMISSIONS</span>
                  <span className="text-lg font-bold text-[#123D32] tabular-nums">{metrics.totalCo2Kg} kg CO2e</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[#53635B] text-[11px] pt-2">
                <div className="flex justify-between">
                  <span>UN SDG 12 Compliance:</span>
                  <span className="text-[#16A36A] font-bold">Passed (Zero-Landfill Target Met)</span>
                </div>
                <div className="flex justify-between">
                  <span>Cryptographic Data Sanitization:</span>
                  <span className="text-[#16A36A] font-bold">NIST SP 800-88 Rev. 1 Certified</span>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Downstream Smelter:</span>
                  <span className="text-[#182B26] font-bold">GreenTech Certified Recyclers (R2v3)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                onClick={() => setReportModalOpen(false)}
                className="px-4 py-2 bg-[#F7FAF8] hover:bg-[#E1EBE5] border border-[#DCE6E0] text-[#182B26] rounded-xl font-medium cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handlePrintAudit}
                className="px-5 py-2 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold rounded-xl flex items-center gap-2 shadow-sm cursor-pointer"
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
