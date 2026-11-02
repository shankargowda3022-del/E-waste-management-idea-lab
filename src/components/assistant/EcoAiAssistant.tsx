import React, { useState } from 'react';
import { analyzeDeviceCondition, getSmartAssistantAnswer, DeviceAnalysisResult } from '../../services/ecoAiEngine';
import { Sparkles, Cpu, ShieldAlert, Send, Wrench, RefreshCw, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onOpenPickupModal: (category?: string) => void;
  onExploreMarketplace: () => void;
}

export const EcoAiAssistant: React.FC<Props> = ({ onOpenPickupModal, onExploreMarketplace }) => {
  const [activeMode, setActiveMode] = useState<'diagnostic' | 'chat'>('diagnostic');

  // Diagnostic form state
  const [diagCategory, setDiagCategory] = useState('Laptops');
  const [diagBrand, setDiagBrand] = useState('Apple');
  const [diagModel, setDiagModel] = useState('MacBook Air (M1)');
  const [diagAge, setDiagAge] = useState(4);
  const [diagCondition, setDiagCondition] = useState('minor_damage');
  const [analysisResult, setAnalysisResult] = useState<DeviceAnalysisResult | null>(null);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'ai'; text: string; time: string }[]>([
    {
      sender: 'ai',
      text: "Hello! I am **EcoAI**, your circular electronics advisor. I can analyze device repairability, calculate precious metal recovery, or guide you through DoD-compliant cryptographic data erasure. What device are you evaluating today?",
      time: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const handleRunDiagnostic = (e: React.FormEvent) => {
    e.preventDefault();
    const res = analyzeDeviceCondition(diagCategory, diagCondition, diagAge, diagBrand, diagModel);
    setAnalysisResult(res);
  };

  const handleSendChat = (promptText?: string) => {
    const textToSend = promptText || chatInput;
    if (!textToSend.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!promptText) setChatInput('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = getSmartAssistantAnswer(textToSend);
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: responseText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 450);
  };

  const quickPrompts = [
    'My phone battery is swollen. Is it safe to keep in my dorm?',
    'How do I securely wipe my laptop before recycling?',
    'Should I repair or recycle an older ThinkPad with slow performance?',
    'How do Eco-Points work and how are they verified?'
  ];

  return (
    <section className="py-12 bg-neutral-950 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostic & Circular Knowledge Engine</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
              EcoAI E-Waste Assistant
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Rule-based hardware intelligence engine trained on Basel Convention e-waste recovery frameworks, EPA WARM v15, and OEM cryptographic wiping standards.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveMode('diagnostic')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeMode === 'diagnostic'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Device Triage Calculator
            </button>
            <button
              onClick={() => setActiveMode('chat')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeMode === 'chat'
                  ? 'bg-neutral-800 text-white font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Ask EcoAI Assistant
            </button>
          </div>
        </div>

        {/* Diagnostic Mode */}
        {activeMode === 'diagnostic' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-white mb-1">Evaluate Any Electronic Device</h2>
              <p className="text-xs text-neutral-400 mb-6">
                Enter your hardware specs to instantly generate repairability scoring, precious metal yields, and data sanitization guidelines.
              </p>

              <form onSubmit={handleRunDiagnostic} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1">Device Category</label>
                  <select
                    value={diagCategory}
                    onChange={(e) => setDiagCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
                  >
                    <option value="Laptops">Laptops</option>
                    <option value="Smartphones & Tablets">Smartphones & Tablets</option>
                    <option value="Desktops & Servers">Desktops & Servers</option>
                    <option value="Large Displays & TVs">Large Displays & TVs</option>
                    <option value="Lithium-Ion Batteries">Lithium-Ion Batteries</option>
                    <option value="Audio & Wearables">Audio & Wearables</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Brand</label>
                    <input
                      type="text"
                      value={diagBrand}
                      onChange={(e) => setDiagBrand(e.target.value)}
                      placeholder="e.g. Apple, Dell, Lenovo"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Model / Specs</label>
                    <input
                      type="text"
                      value={diagModel}
                      onChange={(e) => setDiagModel(e.target.value)}
                      placeholder="e.g. Latitude 5400"
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Device Age (Years)</label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      value={diagAge}
                      onChange={(e) => setDiagAge(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 font-semibold mb-1">Condition</label>
                    <select
                      value={diagCondition}
                      onChange={(e) => setDiagCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200"
                    >
                      <option value="working">Working / Intact</option>
                      <option value="minor_damage">Minor Damage / Sluggish</option>
                      <option value="non_working">Non-Working / Broken</option>
                      <option value="hazardous">Hazardous (Swollen / Leaking)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-950"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Run EcoAI Triage Analysis</span>
                </button>
              </form>

              {/* Sample Presets */}
              <div className="mt-6 pt-4 border-t border-neutral-800/80">
                <span className="text-[11px] font-mono text-neutral-500 block mb-2">Try a scenario:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setDiagCategory('Laptops'); setDiagBrand('Lenovo'); setDiagModel('ThinkPad T470'); setDiagAge(6); setDiagCondition('minor_damage'); }}
                    className="px-2 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-[10px] text-neutral-300 font-mono"
                  >
                    6-yr ThinkPad (Sluggish)
                  </button>
                  <button
                    onClick={() => { setDiagCategory('Lithium-Ion Batteries'); setDiagBrand('Anker'); setDiagModel('26800mAh'); setDiagAge(3); setDiagCondition('hazardous'); }}
                    className="px-2 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-[10px] text-neutral-300 font-mono"
                  >
                    Swollen Powerbank
                  </button>
                </div>
              </div>

            </div>

            {/* Results Output Column */}
            <div className="lg:col-span-7">
              {analysisResult ? (
                <div className="space-y-6">
                  
                  {/* Score & Verdict Card */}
                  <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
                    <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
                      <div>
                        <span className="text-xs font-mono uppercase text-neutral-400">Triage Verdict</span>
                        <h3 className="text-xl font-bold text-white mt-0.5 capitalize">
                          {analysisResult.recommendedPathway.replace('_', ' & ')}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-neutral-400">Repairability Score</span>
                        <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                          {analysisResult.repairabilityScore} <span className="text-xs text-neutral-500 font-normal">/ 10</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-300 mt-4 leading-relaxed">
                      {analysisResult.safetyAdvisory}
                    </p>

                    {/* Next Steps */}
                    <div className="mt-4 pt-4 border-t border-neutral-800 space-y-2 text-xs">
                      <span className="font-semibold text-white">Recommended Circular Actions:</span>
                      {analysisResult.nextSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-neutral-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => onOpenPickupModal(analysisResult.category)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                      >
                        <span>Schedule Handover</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={onExploreMarketplace}
                        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium rounded-xl"
                      >
                        Browse Spare Parts
                      </button>
                    </div>
                  </div>

                  {/* Materials & Data Wipe Guide Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Metal yields */}
                    <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs space-y-3 font-mono">
                      <span className="text-neutral-400 uppercase text-[11px] block">Recoverable Critical Metals</span>
                      <div className="flex justify-between py-1 border-b border-neutral-800">
                        <span className="text-neutral-300">Precious Gold:</span>
                        <span className="text-amber-400 font-bold tabular-nums">{analysisResult.environmentalImpact.preciousMetals.goldMg} mg</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-800">
                        <span className="text-neutral-300">Industrial Copper:</span>
                        <span className="text-amber-300 font-bold tabular-nums">{analysisResult.environmentalImpact.preciousMetals.copperGrams} g</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-neutral-800">
                        <span className="text-neutral-300">Battery Lithium:</span>
                        <span className="text-cyan-400 font-bold tabular-nums">{analysisResult.environmentalImpact.preciousMetals.lithiumGrams} g</span>
                      </div>
                      <div className="flex justify-between py-1 text-neutral-300">
                        <span>Avoided Lifecycle CO2:</span>
                        <span className="text-emerald-400 font-bold tabular-nums">{analysisResult.environmentalImpact.co2SavedKg} kg</span>
                      </div>
                    </div>

                    {/* Data wipe checklist */}
                    <div className="p-5 bg-neutral-900 border border-neutral-800 rounded-2xl text-xs space-y-2">
                      <span className="text-neutral-400 uppercase text-[11px] font-mono block">Data Sanitization Standard</span>
                      <div className="font-semibold text-white">{analysisResult.dataWipeGuide.platform}</div>
                      <ul className="space-y-1.5 text-neutral-300 text-[11px] list-disc pl-4">
                        {analysisResult.dataWipeGuide.steps.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                      <div className="mt-2 p-2 bg-amber-950/30 border border-amber-900/50 rounded-lg text-amber-300 text-[10px]">
                        {analysisResult.dataWipeGuide.criticalWarning}
                      </div>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="p-12 bg-neutral-900/60 border border-neutral-800 rounded-2xl text-center">
                  <Cpu className="w-10 h-10 text-emerald-400/60 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-white">Ready for Hardware Diagnostics</h3>
                  <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                    Fill out the device parameters on the left to view circular economy repair vs recycling recommendations, toxic risk telemetry, and precious metals yield.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Chat Mode */}
        {activeMode === 'chat' && (
          <div className="mt-8 max-w-4xl mx-auto bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
            
            {/* Chat header */}
            <div className="p-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">EcoAI Circular Engine</div>
                  <div className="text-[10px] text-neutral-400 font-mono">Offline-Resilient Rule-Based Reasoning Engine</div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-emerald-400">Knowledge Base v2026.11</span>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      m.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-neutral-950 border border-neutral-800 text-neutral-200 rounded-bl-none'
                    }`}
                  >
                    <div className="prose prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </div>
                    <div className="text-[10px] text-neutral-400 mt-2 text-right font-mono">
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-3 text-xs text-neutral-400 font-mono">
                    EcoAI is consulting circular guidelines...
                  </div>
                </div>
              )}
            </div>

            {/* Quick questions pills */}
            <div className="px-4 py-2 border-t border-neutral-800/80 bg-neutral-950/80 flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-neutral-500 shrink-0 font-mono">Try asking:</span>
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChat(p)}
                  className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 rounded-lg whitespace-nowrap transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div className="p-3 bg-neutral-950 border-t border-neutral-800 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask about device repairability, battery safety, or data-wiping..."
                className="flex-1 px-4 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                onClick={() => handleSendChat()}
                className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
