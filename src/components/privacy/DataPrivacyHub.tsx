import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Smartphone, Laptop, HardDrive, Check, Lock, Info } from 'lucide-react';

export const DataPrivacyHub: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'apple' | 'android' | 'windows' | 'mac'>('apple');
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    backup: false,
    signout: false,
    ejectSim: false,
    cryptoWipe: false,
    tapeBattery: false
  });

  const toggleCheck = (key: string) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const platforms = [
    { id: 'apple' as const, name: 'Apple iPhone / iPad', icon: Smartphone },
    { id: 'android' as const, name: 'Android Smartphones', icon: Smartphone },
    { id: 'windows' as const, name: 'Windows 10 / 11 PC', icon: Laptop },
    { id: 'mac' as const, name: 'Apple Mac (Apple Silicon & Intel)', icon: Laptop }
  ];

  const guides = {
    apple: {
      title: 'iOS & iPadOS Hardware Sanitization',
      steps: [
        'Open Settings > tap your Apple Account banner at the top.',
        'Scroll down and tap Sign Out. Enter your Apple ID password to disable Activation Lock and Find My. (Crucial: without this, the device cannot be refurbished).',
        'Return to Settings > General > Transfer or Reset iPhone.',
        'Tap Erase All Content and Settings. Modern iOS devices use FileVault-grade AES-256 cryptographic keys which are instantaneously destroyed upon confirmation.'
      ],
      warning: 'Never send a locked Apple device. Activation Lock permanently prevents repair labs and student beneficiaries from reusing hardware.'
    },
    android: {
      title: 'Android FBE (File-Based Encryption) Reset',
      steps: [
        'Open Settings > Accounts & Passwords (or Accounts & Backup).',
        'Tap each Google account and tap Remove Account. This prevents Factory Reset Protection (FRP) from blocking the next user.',
        'Eject physical SIM card tray and microSD memory expansion card.',
        'Navigate to Settings > System (or General Management) > Reset > Factory Data Reset.',
        'Confirm pattern/PIN to initiate hardware cryptographic wipe.'
      ],
      warning: 'Removing Google and OEM manufacturer accounts before resetting is mandatory to allow circular reuse.'
    },
    windows: {
      title: 'Windows BitLocker & Drive Scrubbing',
      steps: [
        'Back up personal photos and documents to OneDrive or external USB drive.',
        'Open Settings > System > Recovery > Reset this PC > Get Started.',
        'Select "Remove everything".',
        'IMPORTANT: When prompted "Do you want to clean the drives?", select "Fully clean the drive". This writes random zeroes across all storage blocks, taking ~45 minutes and preventing forensic data recovery.',
        'If the drive was BitLocker-encrypted, keys are discarded permanently.'
      ],
      warning: 'Selecting "Just remove my files" only deletes directory pointers. Always choose "Fully clean the drive" when disposing or recycling.'
    },
    mac: {
      title: 'macOS Erase All Content & Settings',
      steps: [
        'Apple Silicon / T2 Macs (macOS Monterey or later): Open System Settings > General > Transfer or Reset > Erase All Content and Settings.',
        'Enter admin credentials and sign out of Apple ID.',
        'Intel Macs without T2 chip: Restart Mac and immediately hold Command (⌘) + R to enter macOS Recovery.',
        'Open Disk Utility > select Macintosh HD > click Erase with APFS format, then reinstall a clean macOS image.'
      ],
      warning: 'Always unpair Bluetooth keyboards/mice and turn off FileVault before wiping legacy Macs.'
    }
  };

  const currentGuide = guides[activePlatform];

  return (
    <section className="py-12 bg-neutral-950 min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-neutral-800">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Consumer Privacy & Safety Standard</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mt-1">
              Data Privacy & Battery Safety Hub
            </h1>
            <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
              Official manufacturer-approved data sanitization protocols, pre-disposal checklist, and fire-prevention protocols for lithium-ion cells.
            </p>
          </div>

          <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono text-neutral-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>NIST SP 800-88 Compliant Guidelines</span>
          </div>
        </div>

        {/* Battery Fire Safety Alert Box */}
        <div className="mt-8 p-6 bg-amber-950/20 border border-amber-900/60 rounded-2xl flex flex-col md:flex-row items-start gap-4">
          <div className="p-3 rounded-xl bg-amber-900/40 text-amber-400 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2 text-xs">
            <h3 className="text-base font-bold text-amber-300">
              Critical Warning: Never Put Batteries in Ordinary Household Trash
            </h3>
            <p className="text-neutral-300 leading-relaxed">
              Lithium-ion cells punctured inside municipal garbage compactor trucks or landfill bulldozers ignite immediate exothermic thermal runaway fires. If any battery or device feels swollen, warm, or distorted:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 font-mono text-[11px] text-neutral-200">
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
                1. <strong>Tape Contacts:</strong> Cover metal terminal tabs with non-conductive electrical tape.
              </div>
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
                2. <strong>Cool Container:</strong> Place in a metal bucket or container filled with sand or vermiculite.
              </div>
              <div className="p-3 bg-neutral-950/80 rounded-xl border border-neutral-800">
                3. <strong>Hazardous Dispatch:</strong> Tag as "Hazardous" on E-Cycle AI for specialized UN-box collection.
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Pre-Disposal Checklist */}
        <div className="mt-8 p-6 bg-neutral-900 border border-neutral-800 rounded-2xl">
          <h2 className="text-sm font-bold text-white mb-1">Pre-Disposal Digital Checklist</h2>
          <p className="text-xs text-neutral-400 mb-4">Complete these 5 actions before handing over your device:</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            
            <label
              onClick={() => toggleCheck('backup')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                checklist.backup ? 'bg-emerald-950/40 border-emerald-700 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checklist.backup ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-neutral-700'}`}>
                {checklist.backup && <Check className="w-3 h-3" />}
              </div>
              <div>
                <strong className="block text-neutral-200">1. Cloud or Drive Backup</strong>
                <span className="text-[11px] text-neutral-400">Save photos, passwords, and assignments to Google Drive/iCloud.</span>
              </div>
            </label>

            <label
              onClick={() => toggleCheck('signout')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                checklist.signout ? 'bg-emerald-950/40 border-emerald-700 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checklist.signout ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-neutral-700'}`}>
                {checklist.signout && <Check className="w-3 h-3" />}
              </div>
              <div>
                <strong className="block text-neutral-200">2. Sign Out of Cloud Accounts</strong>
                <span className="text-[11px] text-neutral-400">Disable Find My & Google FRP locks to allow hardware reuse.</span>
              </div>
            </label>

            <label
              onClick={() => toggleCheck('ejectSim')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                checklist.ejectSim ? 'bg-emerald-950/40 border-emerald-700 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checklist.ejectSim ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-neutral-700'}`}>
                {checklist.ejectSim && <Check className="w-3 h-3" />}
              </div>
              <div>
                <strong className="block text-neutral-200">3. Eject Physical SIM & SD Cards</strong>
                <span className="text-[11px] text-neutral-400">Remove expansion trays and shred or keep old SIM chips.</span>
              </div>
            </label>

            <label
              onClick={() => toggleCheck('cryptoWipe')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                checklist.cryptoWipe ? 'bg-emerald-950/40 border-emerald-700 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checklist.cryptoWipe ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-neutral-700'}`}>
                {checklist.cryptoWipe && <Check className="w-3 h-3" />}
              </div>
              <div>
                <strong className="block text-neutral-200">4. Run Cryptographic Factory Reset</strong>
                <span className="text-[11px] text-neutral-400">Destroy encryption keys in hardware security module (Secure Enclave / TPM).</span>
              </div>
            </label>

            <label
              onClick={() => toggleCheck('tapeBattery')}
              className={`p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3 ${
                checklist.tapeBattery ? 'bg-emerald-950/40 border-emerald-700 text-white' : 'bg-neutral-950 border-neutral-800 text-neutral-400'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${checklist.tapeBattery ? 'bg-emerald-600 border-emerald-500 text-white' : 'border-neutral-700'}`}>
                {checklist.tapeBattery && <Check className="w-3 h-3" />}
              </div>
              <div>
                <strong className="block text-neutral-200">5. Insulate Battery Terminals</strong>
                <span className="text-[11px] text-neutral-400">Apply non-conductive electrical tape on loose battery packs.</span>
              </div>
            </label>

          </div>
        </div>

        {/* Platform Sanitization Guide Accordion */}
        <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
            <div>
              <h2 className="text-base font-bold text-white">Manufacturer Sanitization Walkthrough</h2>
              <p className="text-xs text-neutral-400">Step-by-step procedures for your specific operating system</p>
            </div>

            {/* Platform selector */}
            <div className="flex flex-wrap gap-2">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePlatform(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    activePlatform === p.id
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-neutral-950 text-neutral-400 hover:text-white border border-neutral-800'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <h3 className="text-base font-bold text-white">{currentGuide.title}</h3>

            <div className="space-y-3 font-mono text-xs">
              {currentGuide.steps.map((step, idx) => (
                <div key={idx} className="p-3.5 bg-neutral-950 border border-neutral-800/80 rounded-xl flex items-start gap-3">
                  <span className="font-bold text-emerald-400 shrink-0">Step 0{idx + 1}:</span>
                  <span className="text-neutral-300 font-sans text-xs leading-relaxed">{step}</span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-amber-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{currentGuide.warning}</span>
            </div>
          </div>
        </div>

        {/* Legal Transparency Disclaimer */}
        <div className="mt-8 p-4 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-400 font-mono leading-relaxed">
          <strong>Transparency Notice: </strong>
          E-Cycle AI provides software guidance based on NIST Special Publication 800-88 Revision 1. The digital web platform does not remotely wipe local client storage; users are required to execute these factory procedures before handing over physical hardware to logistics collectors.
        </div>

      </div>
    </section>
  );
};
