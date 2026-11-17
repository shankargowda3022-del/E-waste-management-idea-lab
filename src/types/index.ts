export type UserRole = 'citizen' | 'campus_admin' | 'recycler' | 'super_admin' | 'repair' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  ecoPoints: number;
  carbonSavedKg: number;
  devicesRecycled: number;
  phone: string;
  address: string;
  isAuthenticatedCitizen?: boolean;
}

export interface EcoPointTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  reason: string;
  referenceId?: string;
  createdAt: string;
}

export interface ImpactMetrics {
  devicesCollected: number;
  kgProcessed: number;
  ghgAvoidedKg: number;
  activePartners: number;
  goldRecoveredGrams: number;
  copperRecoveredKg: number;
  updatedAt: string;
}

export interface AIDiagnosisResult {
  deviceType: string;
  brand: string;
  model: string;
  condition: DeviceCondition;
  estimatedRepairabilityScore: number; // 0 to 10
  preciousMetalEstimate: {
    goldGrams: number;
    copperGrams: number;
    aluminumGrams: number;
    lithiumGrams?: number;
    estimatedValueUsd: number;
  };
  hazardFlags: {
    hasHazard: boolean;
    swollenBattery: boolean;
    crackedGlass: boolean;
    liquidDamage: boolean;
    exposedWiring: boolean;
    description?: string;
  };
  dataWipingInstructions: {
    supported: boolean;
    difficulty: 'easy' | 'moderate' | 'advanced';
    steps: string[];
    factoryResetGuide: string;
    warningNote: string;
  };
  recommendedAction: 'repair' | 'refurbish' | 'recycle' | 'hazardous_handling';
  reasoningEngine?: string;
  analyzedAt: string;
  imageUrl?: string;
}

export interface CitizenAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  createdAt: string;
  ecoPoints?: number;
}

export type DeviceCondition = 'working' | 'minor_damage' | 'non_working' | 'hazardous';
export type DisposalPreference = 'repair' | 'donation' | 'refurbish' | 'recycle';
export type PickupType = 'home_pickup' | 'centre_dropoff';

export type TrackingStage =
  | 'submitted'
  | 'verified'
  | 'assigned'
  | 'scheduled'
  | 'collected'
  | 'processing'
  | 'completed'
  | 'cancelled';

export interface TrackingUpdate {
  stage: TrackingStage;
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  updatedBy?: string;
}

export interface UserNotification {
  id: string;
  userId: string;
  userEmail?: string;
  requestId?: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'submitted' | 'assigned' | 'scheduled' | 'collected' | 'processing' | 'completed' | 'reward' | 'partner';
  read: boolean;
  actionUrl?: string;
}

export interface PickupRequest {
  id: string; // e.g. "ECY-2026-8941"
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  deviceCategory: string;
  brand: string;
  model: string;
  quantity: number;
  condition: DeviceCondition;
  pickupType: PickupType;
  address: string;
  centreId?: string;
  centreName?: string;
  preferredDate: string;
  timeSlot: string;
  disposalPreference: DisposalPreference;
  notes?: string;
  serialNumber?: string;
  status: TrackingStage;
  trackingUpdates: TrackingUpdate[];
  ecoPointsAwarded: number;
  estimatedWeightKg: number;
  verifiedWeightKg?: number;
  recoveredGoldGrams?: number;
  recoveredCopperKg?: number;
  assignedPartnerId?: string;
  assignedPartnerName?: string;
  createdAt: string;
  submittedAt?: string;
  deviceImage?: string;
  deviceImageName?: string;
  dataPrivacyAcknowledged: boolean;
  batterySafeHandlingAcknowledged: boolean;
  qrCodeToken: string;
  aiDiagnosis?: AIDiagnosisResult;
}

export interface CollectionCentre {
  id: string;
  name: string;
  type: 'certified_recycler' | 'dropoff_kiosk' | 'repair_hub' | 'campus_depot';
  address: string;
  city: string;
  distanceKm: number;
  phone: string;
  email: string;
  rating: number;
  reviewsCount: number;
  acceptedCategories: string[];
  services: ('Free Doorstep Pickup' | 'Instant Eco-Points' | 'Data Wiping Verification' | 'On-site Diagnostic')[];
  openHours: string;
  certifiedR2: boolean;
  image?: string;
}

export interface EcoReward {
  id: string;
  title: string;
  partner: string;
  category: 'voucher' | 'tech_discount' | 'planting' | 'merch';
  pointsCost: number;
  discountVal: string;
  description: string;
  promoCode: string;
  claimedCount: number;
}

export interface ClaimedReward {
  id: string;
  rewardId: string;
  rewardTitle: string;
  promoCode: string;
  claimedAt: string;
  pointsDeducted: number;
}

export interface MarketplaceItem {
  id: string;
  title: string;
  category: string;
  price: number;
  condition: 'refurbished_grade_a' | 'tested_working' | 'for_parts';
  sellerId: string;
  sellerName: string;
  sellerRole: 'Verified Student' | 'Certified Refurbisher' | 'Lab Technician';
  location: string;
  description: string;
  specs: string[];
  warrantyDays: number;
  isReserved?: boolean;
  createdAt: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  organizer: string;
  targetKg: number;
  currentKg: number;
  daysLeft: number;
  participantsCount: number;
  campusName: string;
}

export interface PartnerVerificationApplication {
  id: string;
  shopName: string; // Shop Name
  organizationName: string; // Synonym
  name: string; // Contact Person Name
  contactPerson: string; // Synonym
  email: string;
  phone: string;
  address: string; // Full Shop Address
  city: string;
  type: 'Recycler' | 'Repairer'; // Explicit type as required
  category: 'Recycler' | 'Refurbisher' | 'Collection Agency';
  r2Certified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  facilityAreaSqFt?: number;
  username?: string;
  assignedLoginId?: string;
  temporaryPassword?: string;
  generatedPassword?: string;
  approvedAt?: string;
  emailDeliveryStatus?: 'sent' | 'simulated' | 'failed' | 'not_sent';
  emailDeliveryMessage?: string;
  emailDeliveryError?: string;
  emailSentAt?: string;
}

