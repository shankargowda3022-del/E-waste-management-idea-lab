import React, { useState, useEffect } from 'react';
import { User, PickupRequest, DeviceCondition, DisposalPreference, PickupType } from '../../types';
import {
  savePickupRequest,
  savePickupRequestAsync,
  getCentres,
  registerCitizenAccount,
  loginCitizenAccount,
  isCitizenAuthenticated,
  formatRequestDateTime
} from '../../services/storage';
import {
  X,
  Upload,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Recycle,
  Building2,
  Wrench,
  Camera,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';

interface Props {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRequest: PickupRequest) => void;
  initialCategory?: string;
  initialCentreId?: string;
  initialDisposalPreference?: DisposalPreference;
}

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const result = reader.result as string;
      const img = new Image();
      img.onerror = () => resolve(result);
      img.onload = () => {
        const maxDim = 960;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width >= height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(result);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/jpeg', 0.78);
          resolve(compressed);
        } catch {
          resolve(result);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  });
};

export const PickupRequestModal: React.FC<Props> = ({
  currentUser,
  isOpen,
  onClose,
  onSuccess,
  initialCategory,
  initialCentreId,
  initialDisposalPreference
}) => {
  const centres = getCentres();
  const alreadyAuthenticated = isCitizenAuthenticated(currentUser);

  const [step, setStep] = useState<number>(1);

  // Device specs
  const [deviceCategory, setDeviceCategory] = useState<string>(initialCategory || 'Laptops');
  const [brand, setBrand] = useState<string>('');
  const [model, setModel] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [condition, setCondition] = useState<DeviceCondition>('minor_damage');
  const [disposalPreference, setDisposalPreference] = useState<DisposalPreference>(initialDisposalPreference || 'recycle');
  const [deviceImage, setDeviceImage] = useState<string>('');
  const [deviceImageName, setDeviceImageName] = useState<string>('');
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);

  useEffect(() => {
    if (initialDisposalPreference) {
      setDisposalPreference(initialDisposalPreference);
    }
  }, [initialDisposalPreference, isOpen]);

  // Citizen Identity & Details
  const [userName, setUserName] = useState<string>(currentUser.isAuthenticatedCitizen ? currentUser.name : '');
  const [userEmail, setUserEmail] = useState<string>(currentUser.isAuthenticatedCitizen ? currentUser.email : '');
  const [userPhone, setUserPhone] = useState<string>(currentUser.phone !== '+1 (555) 234-8901' ? currentUser.phone : '');
  const [address, setAddress] = useState<string>(currentUser.address !== 'Redwood Residence Hall, North Campus' ? currentUser.address : '');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [citizenMode, setCitizenMode] = useState<'register' | 'login'>('register');

  // Logistics & Schedule
  const [pickupType, setPickupType] = useState<PickupType>(initialCentreId ? 'centre_dropoff' : 'home_pickup');
  const [centreId, setCentreId] = useState<string>(initialCentreId || centres[0]?.id || '');
  const [preferredDate, setPreferredDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM - 01:00 PM');
  const [notes, setNotes] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');

  // Acknowledgements
  const [privacyCheck, setPrivacyCheck] = useState<boolean>(false);
  const [batteryCheck, setBatteryCheck] = useState<boolean>(false);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser.isAuthenticatedCitizen) {
      setUserName(currentUser.name);
      setUserEmail(currentUser.email);
      if (currentUser.phone) setUserPhone(currentUser.phone);
      if (currentUser.address) setAddress(currentUser.address);
    }
  }, [currentUser]);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingPhoto(true);
    setErrorMsg('');
    try {
      const compressedDataUrl = await compressImageFile(file);
      setDeviceImage(compressedDataUrl);
      setDeviceImageName(file.name);
    } catch {
      setErrorMsg('Unable to process selected image. Please try a JPG or PNG file.');
    } finally {
      setIsProcessingPhoto(false);
    }
  };

  const handleClearPhoto = () => {
    setDeviceImage('');
    setDeviceImageName('');
  };

  const handleQuickPresetDevice = (cat: string, b: string, m: string, cond: DeviceCondition, pref: DisposalPreference) => {
    setDeviceCategory(cat);
    setBrand(b);
    setModel(m);
    setCondition(cond);
    setDisposalPreference(pref);
  };

  const handleValidateStep1 = () => {
    if (!brand.trim() || !model.trim()) {
      setErrorMsg('Please specify both the brand and model of your electronic device.');
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handleValidateStep2 = () => {
    setErrorMsg('');
    if (!userName.trim()) {
      setErrorMsg('Please fill in your full name.');
      return false;
    }
    if (!userEmail.trim() || !userEmail.includes('@')) {
      setErrorMsg('Please provide a valid email address.');
      return false;
    }
    if (!userPhone.trim()) {
      setErrorMsg('Please provide your contact phone number.');
      return false;
    }
    if (pickupType === 'home_pickup' && !address.trim()) {
      setErrorMsg('Please enter your doorstep pickup address.');
      return false;
    }

    if (!alreadyAuthenticated) {
      if (!password.trim()) {
        setErrorMsg('Please enter your password to log in or create your citizen account.');
        return false;
      }
      if (password.trim().length < 4) {
        setErrorMsg('Password should be at least 4 characters long.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!handleValidateStep1()) {
      setStep(1);
      return;
    }

    if (!handleValidateStep2()) {
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

    let activeCitizenUser: User = currentUser;

    if (!alreadyAuthenticated) {
      if (citizenMode === 'register') {
        const regRes = registerCitizenAccount({
          name: userName.trim(),
          email: userEmail.trim(),
          phone: userPhone.trim(),
          address: address.trim(),
          password: password.trim()
        });

        if (!regRes.success || !regRes.user) {
          setIsSubmitting(false);
          setErrorMsg(regRes.error || 'Failed to register citizen account. If you already have an account, switch to "Log in with existing password".');
          setStep(2);
          return;
        }
        activeCitizenUser = regRes.user;
      } else {
        const loginRes = loginCitizenAccount(userEmail.trim() || userName.trim(), password.trim());
        if (!loginRes.success || !loginRes.user) {
          setIsSubmitting(false);
          setErrorMsg(loginRes.error || 'Invalid credentials. Please verify your password or choose "Create new citizen account".');
          setStep(2);
          return;
        }
        activeCitizenUser = loginRes.user;
      }
    }

    const selectedCentre = centres.find(c => c.id === centreId);

    let points = 100;
    let estimatedWeight = 1.5;
    if (deviceCategory === 'Laptops') { points = 160; estimatedWeight = 2.1; }
    if (deviceCategory === 'Smartphones & Tablets') { points = 120; estimatedWeight = 0.2; }
    if (deviceCategory === 'Desktops & Servers') { points = 220; estimatedWeight = 8.5; }
    if (deviceCategory === 'Lithium-Ion Batteries') { points = 80; estimatedWeight = 0.8; }
    if (disposalPreference === 'repair') points += 40;

    const requestPayload = {
      userId: activeCitizenUser.id,
      userName: userName.trim() || activeCitizenUser.name,
      userEmail: userEmail.trim() || activeCitizenUser.email,
      userPhone: userPhone.trim() || activeCitizenUser.phone,
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
      deviceImage: deviceImage || undefined,
      deviceImageName: deviceImageName || undefined,
      ecoPointsAwarded: points * quantity,
      estimatedWeightKg: estimatedWeight * quantity,
      dataPrivacyAcknowledged: true,
      batterySafeHandlingAcknowledged: true
    };

    savePickupRequestAsync(requestPayload)
      .then((newReq) => {
        setIsSubmitting(false);
        onSuccess(newReq);
        onClose();
      })
      .catch((err) => {
        console.warn('Async backend save failed, falling back to local save:', err);
        const fallbackReq = savePickupRequest(requestPayload);
        setIsSubmitting(false);
        onSuccess(fallbackReq);
        onClose();
      });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-3 sm:p-4 bg-[#123D32]/55 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl my-auto bg-white border border-[#DCE6E0] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] box-border min-w-0 animate-modal-in">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-[#F7FAF8] border-b border-[#DCE6E0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#B9F5D0]/60 border border-[#16A36A]/25 flex items-center justify-center text-[#123D32] shrink-0">
              <Recycle className="w-5 h-5 text-[#16A36A]" />
            </div>
            <div>
              <div className="text-xs font-mono font-semibold text-[#16A36A]">
                Citizen Circular Handover
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#182B26] mt-0.5">
                Request E-Waste Recycling Pickup
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 text-[#718078] hover:text-[#182B26] rounded-lg hover:bg-white border border-transparent hover:border-[#DCE6E0] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress tabs */}
        <div className="grid grid-cols-3 border-b border-[#DCE6E0] bg-white text-xs font-medium text-center">
          <button
            type="button"
            onClick={() => setStep(1)}
            className={`py-3 transition-colors cursor-pointer whitespace-nowrap ${
              step === 1
                ? 'border-b-2 border-[#16A36A] text-[#123D32] font-semibold bg-[#F7FAF8]'
                : 'text-[#718078] hover:text-[#182B26]'
            }`}
          >
            1. Device Specs
          </button>
          <button
            type="button"
            onClick={() => {
              if (handleValidateStep1()) setStep(2);
            }}
            className={`py-3 transition-colors cursor-pointer whitespace-nowrap ${
              step === 2
                ? 'border-b-2 border-[#16A36A] text-[#123D32] font-semibold bg-[#F7FAF8]'
                : 'text-[#718078] hover:text-[#182B26]'
            }`}
          >
            2. Name, Details & Login
          </button>
          <button
            type="button"
            onClick={() => {
              if (handleValidateStep1() && handleValidateStep2()) setStep(3);
            }}
            className={`py-3 transition-colors cursor-pointer whitespace-nowrap ${
              step === 3
                ? 'border-b-2 border-[#16A36A] text-[#123D32] font-semibold bg-[#F7FAF8]'
                : 'text-[#718078] hover:text-[#182B26]'
            }`}
          >
            3. Review & Submit
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs text-[#182B26]">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Step 1: Device Details */}
          {step === 1 && (
            <div className="space-y-4">
              
              {/* Quick Fill presets */}
              <div className="p-3.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl">
                <span className="text-[11px] font-medium text-[#718078] block mb-2">Quick Device Presets:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickPresetDevice('Laptops', 'Lenovo', 'ThinkPad T480 (Core i5)', 'minor_damage', 'repair')}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#B9F5D0]/30 border border-[#DCE6E0] text-[#182B26] rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    ThinkPad T480 (Repair First)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetDevice('Smartphones & Tablets', 'Apple', 'iPhone 11 (64GB)', 'working', 'donation')}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#B9F5D0]/30 border border-[#DCE6E0] text-[#182B26] rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    iPhone 11 (Refurbish)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickPresetDevice('Lithium-Ion Batteries', 'Anker / Mixed OEM', 'LiPo Pack 5000mAh', 'hazardous', 'recycle')}
                    className="px-2.5 py-1.5 bg-white hover:bg-[#B9F5D0]/30 border border-[#DCE6E0] text-[#182B26] rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    Swollen Li-Ion (Hazardous)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1.5">
                  Device Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={deviceCategory}
                  onChange={(e) => setDeviceCategory(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white transition-colors"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1.5">
                    Brand <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="e.g. Dell, Apple, HP"
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#182B26] font-semibold mb-1.5">
                    Model Name / Series <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g. XPS 13, iPad Pro"
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-[#182B26] font-semibold mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono tabular-nums transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1.5">
                  Operational Condition <span className="text-red-500">*</span>
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as DeviceCondition)}
                  className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white transition-colors"
                >
                  <option value="working">Fully Functional / Working</option>
                  <option value="minor_damage">Minor Damage (Slow / Battery degraded / Scratched)</option>
                  <option value="non_working">Non-Working / Broken screen / Dead motherboard</option>
                  <option value="hazardous">Hazardous (Swollen battery / Exposed chemicals)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1.5 flex items-center justify-between gap-2 flex-wrap">
                  <span>Routing Destination & Service Partner <span className="text-red-500">*</span></span>
                  <span className="text-[11px] font-mono font-semibold text-[#16A36A]">
                    {disposalPreference === 'recycle' ? 'Routes to: Certified Recycler' : 'Routes to: Hardware Repair Lab'}
                  </span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDisposalPreference('recycle')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      disposalPreference === 'recycle'
                        ? 'border-[#16A36A] bg-[#B9F5D0]/25 text-[#182B26] shadow-sm ring-1 ring-[#16A36A]/30'
                        : 'border-[#DCE6E0] bg-[#F7FAF8] text-[#718078] hover:border-[#16A36A]/40 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-lg bg-[#123D32] flex items-center justify-center text-[#B9F5D0] shrink-0">
                        <Recycle className="w-3.5 h-3.5" />
                      </div>
                      <div className="font-bold text-xs text-[#182B26]">Send to Recycler</div>
                    </div>
                    <div className="text-[11px] text-[#718078] leading-relaxed">
                      Certified R2v3 e-waste recycling, material smelting & gold/copper recovery.
                    </div>
                    <div className="mt-2 text-[10px] font-mono font-semibold text-[#16A36A]">
                      ✓ Dispatches directly to Recycler Queue
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDisposalPreference('repair')}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      disposalPreference === 'repair'
                        ? 'border-[#123D32] bg-[#B9F5D0]/25 text-[#182B26] shadow-sm ring-1 ring-[#123D32]/25'
                        : 'border-[#DCE6E0] bg-[#F7FAF8] text-[#718078] hover:border-[#123D32]/40 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-lg bg-[#16A36A] flex items-center justify-center text-white shrink-0">
                        <Wrench className="w-3.5 h-3.5" />
                      </div>
                      <div className="font-bold text-xs text-[#182B26]">Send to Repairer</div>
                    </div>
                    <div className="text-[11px] text-[#718078] leading-relaxed">
                      Hardware diagnostic intake, component fix, battery renewal & refurbishment.
                    </div>
                    <div className="mt-2 text-[10px] font-mono font-semibold text-[#123D32]">
                      ✓ Dispatches directly to Repairer Queue
                    </div>
                  </button>
                </div>
              </div>

              {/* Real Device Photo Upload (Stored & Visible to Recycler & Admin) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[#182B26] font-semibold">
                    Device Photo Verification (Shared with Recycler & Admin)
                  </label>
                  {deviceImageName && (
                    <span className="text-[11px] font-mono text-[#16A36A] truncate max-w-[180px]">
                      {deviceImageName}
                    </span>
                  )}
                </div>

                {deviceImage ? (
                  <div className="p-3 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={deviceImage}
                        alt="Uploaded device preview"
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-lg object-cover border border-[#DCE6E0] bg-white shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-[#182B26] flex items-center gap-1.5">
                          <ImageIcon className="w-3.5 h-3.5 text-[#16A36A]" />
                          <span>Photo attached to request</span>
                        </div>
                        <div className="text-[11px] text-[#718078] truncate font-mono mt-0.5">
                          {deviceImageName || 'device-photo.jpg'}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <label className="text-[11px] font-semibold text-[#16A36A] hover:underline cursor-pointer">
                            Replace photo
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handlePhotoUpload}
                              className="hidden"
                            />
                          </label>
                          <button
                            type="button"
                            onClick={handleClearPhoto}
                            className="text-[11px] font-medium text-red-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[#C7D7CE] hover:border-[#16A36A] rounded-xl bg-[#F7FAF8] hover:bg-white cursor-pointer transition-colors text-center">
                      <Upload className="w-5 h-5 text-[#16A36A] mb-1.5" />
                      <span className="text-[#182B26] font-medium text-xs">
                        {isProcessingPhoto ? 'Optimizing image...' : 'Upload from Gallery'}
                      </span>
                      <span className="text-[10px] text-[#718078] mt-0.5">JPG, PNG, WEBP up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>

                    <label className="flex flex-col items-center justify-center p-4 border border-dashed border-[#C7D7CE] hover:border-[#123D32] rounded-xl bg-[#F7FAF8] hover:bg-white cursor-pointer transition-colors text-center">
                      <Camera className="w-5 h-5 text-[#123D32] mb-1.5" />
                      <span className="text-[#182B26] font-medium text-xs">
                        Take Device Photo
                      </span>
                      <span className="text-[10px] text-[#718078] mt-0.5">Visible to Recycler & Admin</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    if (handleValidateStep1()) setStep(2);
                  }}
                  className="px-5 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <span>Continue to Citizen Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* Step 2: Citizen Name, Details & Account Login */}
          {step === 2 && (
            <div className="space-y-4">
              
              <div className="p-3.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl flex items-start gap-3">
                <UserIcon className="w-5 h-5 text-[#16A36A] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-semibold text-[#182B26] text-xs">
                    Citizen Authentication & Contact Profile
                  </h4>
                  <p className="text-[#718078] text-[11px] leading-relaxed">
                    Please provide your <strong className="text-[#182B26]">Name and Details</strong> and <strong className="text-[#182B26]">log in with your password</strong> so this pickup request and its Eco-Points are securely credited to your authenticated account.
                  </p>
                </div>
              </div>

              {alreadyAuthenticated ? (
                <div className="p-3 bg-[#B9F5D0]/25 border border-[#16A36A]/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16A36A]" />
                    <div>
                      <span className="font-semibold text-[#123D32]">Authenticated as {currentUser.name}</span>
                      <span className="text-[#718078] text-[11px] block">{currentUser.email}</span>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-semibold text-[#16A36A]">
                    Logged In
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 p-1 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => setCitizenMode('register')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                      citizenMode === 'register'
                        ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                        : 'text-[#718078] hover:text-[#182B26]'
                    }`}
                  >
                    New Citizen? Register & Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => setCitizenMode('login')}
                    className={`flex-1 py-2 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                      citizenMode === 'login'
                        ? 'bg-[#123D32] text-white font-semibold shadow-sm'
                        : 'text-[#718078] hover:text-[#182B26]'
                    }`}
                  >
                    Existing User? Log In with Password
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#718078]" />
                    <span>Your Full Name <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Deekshitha Gowda"
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs box-border"
                  />
                </div>

                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#718078]" />
                    <span>Your Email Address <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g. citizen@gmail.com"
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#718078]" />
                    <span>Contact Phone Number <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 789-0123"
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                  />
                </div>

                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#718078]" />
                    <span>
                      {alreadyAuthenticated ? 'Account Password (Optional)' : 'Account Password ' + (citizenMode === 'register' ? '(Create Password)' : '(Enter Password)')} <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required={!alreadyAuthenticated}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={alreadyAuthenticated ? '••••••••' : (citizenMode === 'register' ? 'Create a secure password' : 'Enter your password')}
                      className="w-full pl-3 pr-9 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718078] hover:text-[#182B26] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#182B26] font-semibold mb-1.5">
                  Collection Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPickupType('home_pickup')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      pickupType === 'home_pickup'
                        ? 'border-[#16A36A] bg-[#B9F5D0]/25 text-[#123D32]'
                        : 'border-[#DCE6E0] bg-[#F7FAF8] text-[#718078] hover:border-[#16A36A]/40'
                    }`}
                  >
                    <div className="font-semibold text-[#182B26]">Free Doorstep Pickup</div>
                    <div className="text-[11px] text-[#718078] mt-0.5">Logistics team collects directly from your address</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPickupType('centre_dropoff')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      pickupType === 'centre_dropoff'
                        ? 'border-[#16A36A] bg-[#B9F5D0]/25 text-[#123D32]'
                        : 'border-[#DCE6E0] bg-[#F7FAF8] text-[#718078] hover:border-[#16A36A]/40'
                    }`}
                  >
                    <div className="font-semibold text-[#182B26]">Campus Drop-off Kiosk</div>
                    <div className="text-[11px] text-[#718078] mt-0.5">Self-deposit at verified collection centre</div>
                  </button>
                </div>
              </div>

              {pickupType === 'home_pickup' ? (
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#718078]" />
                    <span>Your Doorstep Address & Room / Flat <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Flat 402, Oakwood Apartments, 12th Cross, Indiranagar"
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] placeholder-[#718078] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs box-border"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-[#718078]" />
                    <span>Select Collection Centre / Depot <span className="text-red-500">*</span></span>
                  </label>
                  <select
                    value={centreId}
                    onChange={(e) => setCentreId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                  >
                    {centres.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.distanceKm} km · {c.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#718078]" />
                    <span>Preferred Pickup Date <span className="text-red-500">*</span></span>
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs box-border"
                  />
                </div>

                <div>
                  <label className="block text-[#182B26] font-semibold mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#718078]" />
                    <span>Time Window Slot</span>
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2.5 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white"
                  >
                    <option value="09:00 AM - 12:00 PM">09:00 AM - 12:00 PM (Morning Slot)</option>
                    <option value="12:00 PM - 03:00 PM">12:00 PM - 03:00 PM (Afternoon Slot)</option>
                    <option value="03:00 PM - 06:00 PM">03:00 PM - 06:00 PM (Evening Slot)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 bg-[#F7FAF8] hover:bg-[#EDF3EF] border border-[#DCE6E0] text-[#182B26] rounded-xl cursor-pointer transition-colors"
                >
                  ← Back to Specs
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (handleValidateStep2()) setStep(3);
                  }}
                  className="px-5 py-2.5 bg-[#16A36A] hover:bg-[#128757] text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
                >
                  <span>Continue to Review</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* Step 3: Privacy, Safety & Submission */}
          {step === 3 && (
            <div className="space-y-4">
              
              {/* Order & Identity Summary Box */}
              <div className="p-4 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl space-y-2 text-xs">
                <div className="font-bold text-[#123D32] text-[11px] uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Recycle Request Summary</span>
                  <span className="font-mono text-[#718078] font-normal tabular-nums">
                    {formatRequestDateTime(new Date().toISOString())}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718078]">Citizen:</span>
                  <span className="text-[#182B26] font-bold">{userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718078]">Email:</span>
                  <span className="text-[#182B26] font-mono">{userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718078]">Phone:</span>
                  <span className="text-[#182B26] font-mono">{userPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718078]">Device:</span>
                  <span className="text-[#123D32] font-bold">{quantity}x {brand} {model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718078]">Category:</span>
                  <span className="text-[#182B26]">{deviceCategory}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718078]">Service Destination:</span>
                  <span className={`font-bold ${disposalPreference === 'recycle' ? 'text-[#16A36A]' : 'text-[#123D32]'}`}>
                    {disposalPreference === 'recycle' ? 'Certified Recycler' : 'Hardware Repairer'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718078]">Pickup Address:</span>
                  <span className="text-[#182B26] text-right max-w-xs truncate">{address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#718078]">Schedule:</span>
                  <span className="text-[#182B26] font-mono tabular-nums">{preferredDate} ({timeSlot})</span>
                </div>

                {deviceImage && (
                  <div className="pt-2 mt-2 border-t border-[#DCE6E0] flex items-center justify-between gap-3">
                    <span className="text-[#718078]">Attached Device Photo:</span>
                    <div className="flex items-center gap-2">
                      <img
                        src={deviceImage}
                        alt="Attached device"
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-lg object-cover border border-[#DCE6E0]"
                      />
                      <span className="font-mono text-[11px] text-[#16A36A] max-w-[140px] truncate">
                        {deviceImageName || 'Attached'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Special Notes or Serial Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1">
                    Device Serial / IMEI (Optional)
                  </label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN-8921-X992"
                    className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[#182B26] font-semibold mb-1">
                    Pickup Notes
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Ring bell or call on arrival"
                    className="w-full px-3 py-2 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl text-[#182B26] focus:outline-none focus:border-[#16A36A] focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Safety & Compliance acknowledgements */}
              <div className="p-4 bg-[#F7FAF8] border border-[#DCE6E0] rounded-xl space-y-3">
                <div className="text-xs font-semibold text-[#123D32] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#16A36A]" />
                  <span>Mandatory Handover Acknowledgements</span>
                </div>

                <label className="flex items-start gap-3 text-xs text-[#718078] cursor-pointer pt-2 border-t border-[#DCE6E0]">
                  <input
                    type="checkbox"
                    checked={privacyCheck}
                    onChange={(e) => setPrivacyCheck(e.target.checked)}
                    className="mt-0.5 rounded border-[#C7D7CE] text-[#16A36A] focus:ring-[#16A36A] h-4 w-4 accent-[#16A36A]"
                  />
                  <span>
                    <strong className="text-[#182B26]">Data Privacy Sign-Out:</strong> I have removed cloud locks, SIM/SD cards, or acknowledge that storage media will undergo certified sanitization.
                  </span>
                </label>

                <label className="flex items-start gap-3 text-xs text-[#718078] cursor-pointer pt-2 border-t border-[#DCE6E0]">
                  <input
                    type="checkbox"
                    checked={batteryCheck}
                    onChange={(e) => setBatteryCheck(e.target.checked)}
                    className="mt-0.5 rounded border-[#C7D7CE] text-[#16A36A] focus:ring-[#16A36A] h-4 w-4 accent-[#16A36A]"
                  />
                  <span>
                    <strong className="text-[#182B26]">Battery Safety Guideline:</strong> I confirm this device will not be placed in ordinary household trash. Swollen battery terminals have been insulated.
                  </span>
                </label>
              </div>

              {/* Form Navigation and Submit */}
              <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2.5 bg-[#F7FAF8] hover:bg-[#EDF3EF] border border-[#DCE6E0] text-[#182B26] rounded-xl text-xs cursor-pointer transition-colors"
                >
                  ← Edit Details
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-[#F7FAF8] hover:bg-[#EDF3EF] border border-[#DCE6E0] text-[#718078] hover:text-[#182B26] rounded-xl text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-[#16A36A] hover:bg-[#128757] disabled:opacity-50 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm cursor-pointer transition-colors"
                  >
                    {isSubmitting ? (
                      <span>Authenticating & Submitting...</span>
                    ) : (
                      <>
                        <Recycle className="w-4 h-4" />
                        <span>Confirm & Submit Recycle Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>
          )}

        </form>

      </div>
    </div>
  );
};
