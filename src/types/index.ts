export type UserRole = 'citizen' | 'recycler' | 'repair' | 'admin';

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
  dataPrivacyAcknowledged: boolean;
  batterySafeHandlingAcknowledged: boolean;
  qrCodeToken: string;
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
  organizationName: string;
  registrationNumber: string;
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  category: 'Recycler' | 'Refurbisher' | 'Collection Agency';
  r2Certified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  facilityAreaSqFt: number;
}
