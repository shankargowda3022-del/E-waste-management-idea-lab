import React, { useState } from 'react';
import { User, PickupRequest, DeviceCondition, DisposalPreference, PickupType } from '../../types';
import { savePickupRequest, getCentres } from '../../services/storage';
import { X, Upload, Calendar, Clock, MapPin, ShieldCheck, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

interface Props {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRequest: PickupRequest) => void;
  initialCategory?: string;
  initialCentreId?: string;
}

export const PickupRequestModal: React.FC<Props> = ({
  currentUser,
  isOpen,
  onClose,
  onSuccess,
  initialCategory,
  initialCentreId
}) => {
  const centres = getCentres();

  const [step, setStep] = useState<number>(1);
  const [deviceCategory, setDeviceCategory] = useState<string>(initialCategory || 'Laptops');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [condition, setCondition] = useState<DeviceCondition>('minor_damage');
  const [pickupType, setPickupType] = useState<PickupType>(initialCentreId ? 'centre_dropoff' : 'home_pickup');
  const [address, setAddress] = useState<string>(currentUser.address || '');
  const [centreId, setCentreId] = useState<string>(initialCentreId || centres[0]?.id || '');
  const [preferredDate, setPreferredDate] = useState<string>('2026-11-06');
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 01:00 PM');
  const [disposalPreference, setDisposalPreference] = useState<DisposalPreference>('repair');
  const [notes, setNotes] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [privacyCheck, setPrivacyCheck] = useState<boolean>(false);
  const [batteryCheck, setBatteryCheck] = useState<boolean>(false);
  const [simulatedPhotoName, setSimulatedPhotoName] = useState<string>('');

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const categories = [
    'Laptops',
    'Smartphones & Tablets',
    'Desktops & Servers',
    'Large Displays & TVs',
    'Lithium-Ion Batteries',
    'Audio & Wearables',
    'PCBs & RAM',
    'Small Appliances'
  ];

  const handleSimulatePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSimulatedPhotoName(e.target.files[0].name);
    }
  };

  const handleQuickPresetDevice = (cat: string, b: string, m: string, cond: DeviceCondition, pref: DisposalPreference) => {
    setDeviceCategory(cat);
    setBrand(b);
    setModel(m);
    setCondition(cond);
    setDisposalPreference(pref);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!brand.trim() || !model.trim()) {
      setErrorMsg('Please specify both the brand and model of the electronic device.');
      setStep(1);
      return;
    }

    if (pickupType === 'home_pickup' && !address.trim()) {
      setErrorMsg('Please enter a valid doorstep collection address.');
      setStep(2);
      return;
    }

    if (!privacyCheck) {
      setErrorMsg('You must review and acknowledge the Data-Privacy and Sign-Out checklist.');
      setStep(3);
      return;
    }

    if (!batteryCheck) {
      setErrorMsg('You must acknowledge the Battery Safety and Non-Incineration guideline.');
      setStep(3);
      return;
    }

    setIsSubmitting(true);

    const selectedCentre = centres.find(c => c.id === centreId);

    // Calculate baseline eco points
    let points = 100;
    let estimatedWeight = 1.5;
    if (deviceCategory === 'Laptops') { points = 160; estimatedWeight = 2.1; }
    if (deviceCategory === 'Smartphones & Tablets') { points = 120; estimatedWeight = 0.2; }
    if (deviceCategory === 'Desktops & Servers') { points = 220; estimatedWeight = 8.5; }
    if (deviceCategory === 'Lithium-Ion Batteries') { points = 80; estimatedWeight = 0.8; }
    if (disposalPreference === 'repair') points += 40; // bonus for repair-first

    setTimeout(() => {
      const newReq = savePickupRequest({
        userId: currentUser.id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userPhone: currentUser.phone || '+1 (555) 234-8901',
        deviceCategory,
        brand: brand.trim(),
        model: model.trim(),
        quantity,
        condition,
        pickupType,
        address: pickupType === 'home_pickup' ? address.trim() : (selectedCentre?.address || 'Campus Drop-off Depot'),
        centreId: pickupType === 'centre_dropoff' ? centreId : undefined,
        centreName: pickupType === 'centre_dropoff' ? (selectedCentre?.name || 'Campus Depot') : undefined,
        preferredDate,
        timeSlot,
        disposalPreference,
        notes: notes.trim(),
        serialNumber: serialNumber.trim(),
        ecoPointsAwarded: points * quantity,
        estimatedWeightKg: estimatedWeight * quantity,
        dataPrivacyAcknowledged: true,
        batterySafeHandlingAcknowledged: true
      });

      setIsSubmitting(false);
      onSuccess(newReq);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono uppercase tracking-wider text-emerald-400">
              Responsible Circular Handover
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">
              Schedule E-Waste Collection
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress tabs */}
        <div className="grid grid-cols-3 border-b border-neutral-800 text-xs font-mono text-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-2.5 transition-colors ${step === 1 ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold bg-neutral-800/40' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            1. Device Specs
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className={`py-2.5 transition-colors ${step === 2 ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold bg-neutral-800/40' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            2. Logistics & Date
          </button>
          <button
            type="button"
            onClick={() => setStep(3)}
            className={`py-2.5 transition-colors ${step === 3 ? 'border-b-2 border-emerald-500 text-emerald-400 font-semibold bg-neutral-800/40' : 'text-neutral-500 hover:text-neutral-300'}`}
          >
            3. Privacy & Submit
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {errorMsg && (
            <div className="p-3 bg-red-950/40 border border-red-800/60 rounded-xl text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Device Details */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Quick Fill presets for hackathon demo */}
              <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl">
                <span className="text-[11px] font-mono text-neutral-400 block mb-2">⚡ Quick 1-Click Demo Presets:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPresetDevice('Laptops', 'Lenovo', 'ThinkPad T480 (Core i5)', 'minor_damage', 'repair')}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[11px] font-mono"
                  >
                    ThinkPad T480 (Repair First)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetDevice('Smartphones & Tablets', 'Apple', 'iPhone 11 (64GB)', 'working', 'donation')}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[11px] font-mono"
                  >
                    iPhone 11 (Student Donation)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetDevice('Lithium-Ion Batteries', 'Anker / Drone', 'LiPo Pack 5000mAh', 'hazardous', 'recycle')}
                    className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg text-[11px] font-mono"
                  >
                    Swollen Li-Ion (Hazardous)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Device Category <span className="text-red-400">*</span>
                </label>
                <select
                  value={deviceCategory}
                  onChange={(e) => setDeviceCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">
                    Manufacturer / Brand <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Dell, Apple, Samsung, Lenovo"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">
                    Model & Series <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. Latitude 5420, Galaxy S20, 24-inch Monitor"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">
                    Physical Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">
                    Device Condition <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as DeviceCondition)}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 capitalize"
                  >
                    <option value="working">Fully Functional / Working</option>
                    <option value="minor_damage">Minor Damage (Slow / Battery degraded / Scratched)</option>
                    <option value="non_working">Non-Working / Broken screen / Dead motherboard</option>
                    <option value="hazardous">Hazardous (Swollen battery / Exposed chemicals)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Disposal & Circular Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'repair', label: 'Repair First', desc: 'Diagnose & fix' },
                    { id: 'donation', label: 'Donation', desc: 'Campus charity' },
                    { id: 'refurbish', label: 'Refurbish', desc: 'Resale credit' },
                    { id: 'recycle', label: 'Certified Recycling', desc: 'R2 urban mining' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setDisposalPreference(p.id as DisposalPreference)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        disposalPreference === p.id
                          ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                          : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <div className="font-semibold text-xs">{p.label}</div>
                      <div className="text-[10px] text-neutral-500">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload Simulation */}
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Device Photo Verification (Optional)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border border-dashed border-neutral-800 hover:border-emerald-500/60 rounded-xl bg-neutral-950 cursor-pointer transition-colors">
                  <Upload className="w-5 h-5 text-neutral-500 mb-1" />
                  <span className="text-neutral-400 text-xs">
                    {simulatedPhotoName ? `Selected: ${simulatedPhotoName}` : 'Upload device photo for visual AI serial triage'}
                  </span>
                  <span className="text-[10px] text-neutral-600 mt-0.5">JPG, PNG up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleSimulatePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>

            </div>
          )}

          {/* Step 2: Logistics & Date */}
          {step === 2 && (
            <div className="space-y-4">
              
              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Collection Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPickupType('home_pickup')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      pickupType === 'home_pickup'
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold">Free Doorstep Pickup</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Clustered low-emission truck collection</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPickupType('centre_dropoff')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      pickupType === 'centre_dropoff'
                        ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <div className="font-semibold">Campus Drop-off Kiosk</div>
                    <div className="text-[11px] text-neutral-500 mt-0.5">Deposit at solar eco-hub anytime</div>
                  </button>
                </div>
              </div>

              {pickupType === 'home_pickup' ? (
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">
                    Doorstep Address & Room <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Room 304, Redwood Student Residence, North Campus"
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">
                    Select Collection Centre / Kiosk <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={centreId}
                    onChange={(e) => setCentreId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    {centres.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.distanceKm} km · {c.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">
                    Preferred Collection Date <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-semibold mb-1.5">
                    Time Window
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning Slot)</option>
                    <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM (Afternoon Slot)</option>
                    <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM (Evening Slot)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Device Serial Number or IMEI (Optional)
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  placeholder="e.g. SN-8921-X992 (Helps generate R2 certificate)"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-semibold mb-1.5">
                  Special Instructions or Access Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Leave with dorm security desk if after 5 PM; power adapter included in box."
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

            </div>
          )}

          {/* Step 3: Privacy, Safety & Submission */}
          {step === 3 && (
            <div className="space-y-4">
              
              <div className="p-4 bg-neutral-950 border border-neutral-800 rounded-xl space-y-3">
                <div className="text-xs font-semibold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Mandatory Pre-Disposal Acknowledgements</span>
                </div>

                {/* Privacy checkbox */}
                <label className="flex items-start gap-3 text-xs text-neutral-300 cursor-pointer pt-2 border-t border-neutral-800">
                  <input
                    type="checkbox"
                    checked={privacyCheck}
                    onChange={(e) => setPrivacyCheck(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>
                    <strong className="text-white">Data Privacy Sign-Out Acknowledgement:</strong> I have signed out of Apple ID / Google / Microsoft accounts, removed SIM/SD cards, or acknowledge that physical drives will undergo certified DoD 5220.22-M magnetic degaussing.
                  </span>
                </label>

                {/* Battery checkbox */}
                <label className="flex items-start gap-3 text-xs text-neutral-300 cursor-pointer pt-2 border-t border-neutral-800">
                  <input
                    type="checkbox"
                    checked={batteryCheck}
                    onChange={(e) => setBatteryCheck(e.target.checked)}
                    className="mt-0.5 rounded border-neutral-700 bg-neutral-900 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span>
                    <strong className="text-white">Battery Safety Guideline:</strong> I confirm this device will not be placed in ordinary household trash or municipal compactors. Any swollen lithium batteries have their terminals taped with non-conductive electrical tape.
                  </span>
                </label>
              </div>

              {/* Summary card */}
              <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl space-y-2 text-xs font-mono">
                <div className="flex justify-between text-neutral-300">
                  <span>Unit:</span>
                  <span className="text-white font-bold">{quantity}x {brand} {model}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Pathway:</span>
                  <span className="text-emerald-400 capitalize">{disposalPreference}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Estimated Eco-Points:</span>
                  <span className="text-emerald-400 font-bold">+{deviceCategory === 'Laptops' ? 200 : 120} pts</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Chain of Custody:</span>
                  <span className="text-neutral-400">7-Stage Real-Time Telemetry</span>
                </div>
              </div>

            </div>
          )}

          {/* Dialog Action Footer */}
          <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-xl text-xs"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && (!brand.trim() || !model.trim())) {
                    setErrorMsg('Please specify brand and model to continue.');
                    return;
                  }
                  setErrorMsg('');
                  setStep(step + 1);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-950/40"
              >
                {isSubmitting ? (
                  <span>Generating Tracking ID...</span>
                ) : (
                  <>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Confirm & Schedule</span>
                  </>
                )}
              </button>
            )}
          </div>

        </form>

      </div>
    </div>
  );
};
