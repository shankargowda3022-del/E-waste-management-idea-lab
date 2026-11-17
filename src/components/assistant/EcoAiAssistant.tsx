import React, { useState } from 'react';
import { analyzeDeviceCondition, getSmartAssistantAnswer, DeviceAnalysisResult } from '../../services/ecoAiEngine';
import { Sparkles, Cpu, ShieldAlert, Send, Wrench, RefreshCw, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Props {
  onOpenPickupModal: (category?: string) => void;
  onExploreMarketplace: () => void;
  onExploreCentres: () => void;
  onGoToPrivacy: () => void;
  initialCategory?: string;
}

export const EcoAiAssistant: React.FC<Props> = ({
  onOpenPickupModal,
  onExploreMarketplace,
  onExploreCentres,
  onGoToPrivacy,
  initialCategory
}) => {
  const [activeMode, setActiveMode] = useState<'diagnostic' | 'chat'>('diagnostic');

  // Diagnostic form state
  const [diagCategory, setDiagCategory] = useState(initialCategory || 'Laptops');
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
    <section className="py-12 bg-[#F7FAF8] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E1EBE5]">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-[#16A36A] font-semibold flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostic & Circular Knowledge Engine</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#182B26] mt-1">
              EcoAI E-Waste Assistant
            </h1>
            <p className="text-xs text-[#718078] mt-1 max-w-2xl leading-relaxed">
              Rule-based hardware intelligence engine trained on Basel Convention e-waste recovery frameworks, EPA WARM v15, and OEM cryptographic wiping standards.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-white border border-[#DCE6E0] rounded-xl text-xs font-medium shadow-xs">
            <button
              onClick={() => setActiveMode('diagnostic')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeMode === 'diagnostic'
                  ? 'bg-[#123D32] text-white font-semibold'
                  : 'text-[#718078] hover:text-[#182B26]'
              }`}
            >
              Device Triage Calculator
            </button>
            <button
              onClick={() => setActiveMode('chat')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                activeMode === 'chat'
                  ? 'bg-[#123D32] text-white font-semibold'
                  : 'text-[#718078] hover:text-[#182B26]'
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
            <div className="lg:col-span-5 eco-card p-6">
              <h2 className="text-base font-bold text-[#182B26] mb-1">Evaluate Any Electronic Device</h2>
              <p className="text-xs text-[#718078] mb-6">
                Enter your hardware specs to instantly generate repairability scoring, precious metal yields, and data sanitization guidelines.
              </p>

              <form onSubmit={handleRunDiagnostic} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1">Device Category</label>
                  <select
                    value={diagCategory}
                    onChange={(e) => setDiagCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
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
                    <label className="block text-[#182B26] font-semibold mb-1">Brand</label>
                    <input
                      type="text"
                      value={diagBrand}
                      onChange={(e) => setDiagBrand(e.target.value)}
                      placeholder="e.g. Apple, Dell, Lenovo"
                      className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[#182B26] font-semibold mb-1">Model / Specs</label>
                    <input
                      type="text"
                      value={diagModel}
                      onChange={(e) => setDiagModel(e.target.value)}
                      placeholder="e.g. Latitude 5400"
                      className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#182B26] font-semibold mb-1">Device Age (Years)</label>
                    <input
                      type="number"
                      min="0"
                      max="25"
                      value={diagAge}
                      onChange={(e) => setDiagAge(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] font-mono tabular-nums focus:outline-none focus:border-[#16A36A] focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[#182B26] font-semibold mb-1">Condition</label>
                    <select
                      value={diagCondition}
                      onChange={(e) => setDiagCondition(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
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
                  className="w-full mt-2 py-3 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Run EcoAI Triage Analysis</span>
                </button>
              </form>

              {/* Sample Presets */}
              <div className="mt-6 pt-4 border-t border-[#E1EBE5]">
                <span className="text-[11px] font-mono text-[#718078] block mb-2">Try a scenario:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setDiagCategory('Laptops'); setDiagBrand('Lenovo'); setDiagModel('ThinkPad T470'); setDiagAge(6); setDiagCondition('minor_damage'); }}
                    className="px-2.5 py-1 bg-[#F7FAF8] hover:bg-[#B9F5D0]/40 border border-[#DCE6E0] rounded-lg text-[10px] text-[#182B26] font-mono cursor-pointer transition-colors"
                  >
                    6-yr ThinkPad (Sluggish)
                  </button>
                  <button
                    onClick={() => { setDiagCategory('Lithium-Ion Batteries'); setDiagBrand('Anker'); setDiagModel('26800mAh'); setDiagAge(3); setDiagCondition('hazardous'); }}
                    className="px-2.5 py-1 bg-[#F7FAF8] hover:bg-[#B9F5D0]/40 border border-[#DCE6E0] rounded-lg text-[10px] text-[#182B26] font-mono cursor-pointer transition-colors"
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
                  <div className="p-6 eco-card">
                    <div className="flex items-center justify-between pb-4 border-b border-[#E1EBE5]">
                      <div>
                        <span className="text-xs font-mono uppercase text-[#718078]">Triage Verdict</span>
                        <h3 className="text-xl font-bold text-[#182B26] mt-0.5 capitalize">
                          {analysisResult.recommendedPathway.replace('_', ' & ')}
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-mono text-[#718078]">Repairability Score</span>
                        <div className="text-2xl font-bold font-mono text-[#16A36A] tabular-nums">
                          {analysisResult.repairabilityScore} <span className="text-xs text-[#718078] font-normal">/ 10</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-[#53635B] mt-4 leading-relaxed">
                      {analysisResult.safetyAdvisory}
                    </p>

                    {/* Next Steps */}
                    <div className="mt-4 pt-4 border-t border-[#E1EBE5] space-y-2 text-xs">
                      <span className="font-semibold text-[#182B26]">Recommended Circular Actions:</span>
                      {analysisResult.nextSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2 text-[#53635B]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#16A36A] shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2.5">
                      <button
                        onClick={() => onOpenPickupModal(analysisResult.category)}
                        className="px-4 py-2 bg-[#16A36A] hover:bg-[#128757] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>Schedule Handover</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={onExploreCentres}
                        className="px-4 py-2 bg-[#F7FAF8] hover:bg-[#B9F5D0]/35 border border-[#DCE6E0] text-[#123D32] text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Find Drop-Off Depots
                      </button>
                      <button
                        onClick={onExploreMarketplace}
                        className="px-4 py-2 bg-white hover:bg-[#F7FAF8] border border-[#DCE6E0] text-[#182B26] text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Browse Spare Parts
                      </button>
                    </div>
                  </div>

                  {/* Materials & Data Wipe Guide Split */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Metal yields */}
                    <div className="p-5 eco-card text-xs space-y-3 font-mono">
                      <span className="text-[#718078] uppercase text-[11px] block font-semibold">Recoverable Critical Metals</span>
                      <div className="flex justify-between py-1.5 border-b border-[#E1EBE5]">
                        <span className="text-[#53635B]">Precious Gold:</span>
                        <span className="text-amber-600 font-bold tabular-nums">{analysisResult.environmentalImpact.preciousMetals.goldMg} mg</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#E1EBE5]">
                        <span className="text-[#53635B]">Industrial Copper:</span>
                        <span className="text-amber-700 font-bold tabular-nums">{analysisResult.environmentalImpact.preciousMetals.copperGrams} g</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-[#E1EBE5]">
                        <span className="text-[#53635B]">Battery Lithium:</span>
                        <span className="text-[#123D32] font-bold tabular-nums">{analysisResult.environmentalImpact.preciousMetals.lithiumGrams} g</span>
                      </div>
                      <div className="flex justify-between py-1 text-[#182B26]">
                        <span>Avoided Lifecycle CO2:</span>
                        <span className="text-[#16A36A] font-bold tabular-nums">{analysisResult.environmentalImpact.co2SavedKg} kg</span>
                      </div>
                    </div>

                    {/* Data wipe checklist */}
                    <div className="p-5 eco-card text-xs space-y-2">
                      <span className="text-[#718078] uppercase text-[11px] font-mono block font-semibold">Data Sanitization Standard</span>
                      <div className="font-semibold text-[#182B26]">{analysisResult.dataWipeGuide.platform}</div>
                      <ul className="space-y-1.5 text-[#53635B] text-[11px] list-disc pl-4">
                        {analysisResult.dataWipeGuide.steps.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ul>
                      <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[10px]">
                        {analysisResult.dataWipeGuide.criticalWarning}
                      </div>
                      <button
                        onClick={onGoToPrivacy}
                        className="mt-2 text-xs font-mono font-semibold text-[#16A36A] hover:text-[#123D32] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                      >
                        <span>Open Full Pre-Disposal Wipe Guide</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                  </div>

                </div>
              ) : (
                <div className="p-12 eco-card text-center">
                  <Cpu className="w-10 h-10 text-[#16A36A] mx-auto mb-3" />
                  <h3 className="text-base font-bold text-[#182B26]">Ready for Hardware Diagnostics</h3>
                  <p className="text-xs text-[#718078] mt-1 max-w-sm mx-auto">
                    Fill out the device parameters on the left to view circular economy repair vs recycling recommendations, toxic risk telemetry, and precious metals yield.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Chat Mode */}
        {activeMode === 'chat' && (
          <div className="mt-8 max-w-4xl mx-auto eco-card overflow-hidden flex flex-col h-[600px]">
            
            {/* Chat header */}
            <div className="p-4 bg-[#123D32] border-b border-[#1D5446] flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#16A36A] flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">EcoAI Circular Engine</div>
                  <div className="text-[10px] text-[#C8DDD2] font-mono">Offline-Resilient Rule-Based Reasoning Engine</div>
                </div>
              </div>

              <span className="text-[11px] font-mono text-[#B9F5D0]">Knowledge Base v2026.11</span>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs bg-[#F7FAF8]">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-xs ${
                      m.sender === 'user'
                        ? 'bg-[#123D32] text-white rounded-br-none'
                        : 'bg-white border border-[#DCE6E0] text-[#182B26] rounded-bl-none'
                    }`}
                  >
                    <div className="max-w-none text-xs leading-relaxed whitespace-pre-wrap">
                      {m.text}
                    </div>
                    <div className={`text-[10px] mt-2 text-right font-mono ${m.sender === 'user' ? 'text-[#B9F5D0]' : 'text-[#718078]'}`}>
                      {m.time}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#DCE6E0] rounded-2xl p-3 text-xs text-[#718078] font-mono">
                    EcoAI is consulting circular guidelines...
                  </div>
                </div>
              )}
            </div>

            {/* Quick questions pills */}
            <div className="px-4 py-2.5 border-t border-[#E1EBE5] bg-white flex items-center gap-2 overflow-x-auto text-[11px]">
              <span className="text-[#718078] shrink-0 font-mono">Try asking:</span>
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendChat(p)}
                  className="px-2.5 py-1 bg-[#F7FAF8] hover:bg-[#B9F5D0]/40 border border-[#DCE6E0] text-[#182B26] rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div className="p-3 bg-white border-t border-[#E1EBE5] flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Ask about device repairability, battery safety, or data-wiping..."
                className="flex-1 px-4 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white"
              />
              <button
                onClick={() => handleSendChat()}
                className="p-2.5 bg-[#16A36A] hover:bg-[#128757] text-white rounded-xl transition-colors cursor-pointer"
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
