import {
  User,
  PickupRequest,
  CollectionCentre,
  EcoReward,
  ClaimedReward,
  MarketplaceItem,
  PartnerVerificationApplication,
  CommunityChallenge,
  TrackingStage
} from '../types';
import {
  DEMO_USERS,
  INITIAL_CENTRES,
  INITIAL_REQUESTS,
  INITIAL_REWARDS,
  INITIAL_MARKETPLACE,
  INITIAL_CHALLENGES,
  INITIAL_VERIFICATION_APPLICATIONS,
  CATEGORY_DETAILS
} from '../data/mockData';

const KEYS = {
  USER: 'ecycle_current_user',
  REQUESTS: 'ecycle_pickup_requests',
  CENTRES: 'ecycle_collection_centres',
  REWARDS: 'ecycle_rewards_catalog',
  CLAIMED_REWARDS: 'ecycle_claimed_rewards',
  MARKETPLACE: 'ecycle_marketplace_items',
  CHALLENGES: 'ecycle_community_challenges',
  APPLICATIONS: 'ecycle_partner_applications'
};

// Dispatch custom event for cross-component reactive updates
const notifyStateChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('ecycle_state_updated'));
  }
};

export const getStoredUser = (): User => {
  try {
    const raw = localStorage.getItem(KEYS.USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading stored user', e);
  }
  return DEMO_USERS.citizen;
};

export const setStoredUser = (user: User): void => {
  localStorage.setItem(KEYS.USER, JSON.stringify(user));
  notifyStateChange();
};

export const switchUserRole = (roleKey: 'citizen' | 'recycler' | 'repair' | 'admin'): User => {
  const targetUser = DEMO_USERS[roleKey] || DEMO_USERS.citizen;
  setStoredUser(targetUser);
  return targetUser;
};

export const getPickupRequests = (): PickupRequest[] => {
  try {
    const raw = localStorage.getItem(KEYS.REQUESTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading requests', e);
  }
  localStorage.setItem(KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
};

export const savePickupRequest = (req: Omit<PickupRequest, 'id' | 'createdAt' | 'qrCodeToken' | 'status' | 'trackingUpdates'>): PickupRequest => {
  const all = getPickupRequests();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `ECY-2026-${randomNum}`;
  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const newRequest: PickupRequest = {
    ...req,
    id: newId,
    createdAt: timeStr,
    status: 'submitted',
    qrCodeToken: `ECY-QR-${randomNum}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    trackingUpdates: [
      {
        stage: 'submitted',
        title: 'Request Registered & Queued',
        description: `Pickup request filed for ${req.quantity}x ${req.brand} ${req.model}. AI Triage scheduled.`,
        timestamp: timeStr,
        location: req.pickupType === 'centre_dropoff' ? req.centreName || 'Campus Depot' : 'Citizen Address'
      }
    ]
  };

  const updated = [newRequest, ...all];
  localStorage.setItem(KEYS.REQUESTS, JSON.stringify(updated));
  notifyStateChange();
  return newRequest;
};

export const updateRequestStatus = (
  requestId: string,
  newStage: TrackingStage,
  note?: string,
  verifiedWeightKg?: number,
  updatedBy?: string
): PickupRequest | null => {
  const all = getPickupRequests();
  const index = all.findIndex(r => r.id === requestId);
  if (index === -1) return null;

  const target = all[index];
  const now = new Date();
  const timeStr = `${now.toISOString().split('T')[0]} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

  const stageTitles: Record<TrackingStage, string> = {
    submitted: 'Request Submitted',
    verified: 'Device Specs & Eligibility Verified',
    assigned: 'Collection Partner Assigned',
    scheduled: 'Pickup Route Confirmed',
    collected: 'Hardware Collected from Citizen',
    processing: 'Diagnostics, Shredding & Material Recovery In Progress',
    completed: 'E-Waste Responsibly Processed & Certified',
    cancelled: 'Request Cancelled'
  };

  const stageDescriptions: Record<TrackingStage, string> = {
    submitted: 'Device entered into collection queue.',
    verified: 'Automated triage and partner verification cleared this unit for processing.',
    assigned: 'Assigned to certified logistics agent for pickup or kiosk storage.',
    scheduled: 'Time window locked. Logistics truck scheduled with optimized routing.',
    collected: 'Physical custody handed over. Device tag scanned and verified.',
    processing: 'Unit logged into R2-certified facility. De-manufacturing and testing underway.',
    completed: 'Circular pathway executed. Eco-Points issued to user profile.',
    cancelled: 'Cancelled per user or administrator request.'
  };

  const newUpdate = {
    stage: newStage,
    title: stageTitles[newStage] || `Stage updated to ${newStage}`,
    description: note || stageDescriptions[newStage] || 'Status updated by platform.',
    timestamp: timeStr,
    updatedBy: updatedBy || 'GreenTech Logistics Dispatch'
  };

  const updatedRequest: PickupRequest = {
    ...target,
    status: newStage,
    verifiedWeightKg: verifiedWeightKg !== undefined ? verifiedWeightKg : target.verifiedWeightKg,
    trackingUpdates: [...target.trackingUpdates, newUpdate]
  };

  // If completed, award eco points if not already awarded to citizen
  if (newStage === 'completed' && target.status !== 'completed') {
    const currentUser = getStoredUser();
    if (currentUser.id === target.userId) {
      const updatedUser: User = {
        ...currentUser,
        ecoPoints: currentUser.ecoPoints + target.ecoPointsAwarded,
        devicesRecycled: currentUser.devicesRecycled + target.quantity,
        carbonSavedKg: Number((currentUser.carbonSavedKg + (target.estimatedWeightKg * 18.5)).toFixed(1))
      };
      setStoredUser(updatedUser);
    }
  }

  all[index] = updatedRequest;
  localStorage.setItem(KEYS.REQUESTS, JSON.stringify(all));
  notifyStateChange();
  return updatedRequest;
};

export const cancelPickupRequest = (requestId: string, reason?: string): boolean => {
  const req = updateRequestStatus(requestId, 'cancelled', reason || 'Cancelled by user prior to pickup dispatch.');
  return !!req;
};

export const getCentres = (): CollectionCentre[] => {
  try {
    const raw = localStorage.getItem(KEYS.CENTRES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading centres', e);
  }
  localStorage.setItem(KEYS.CENTRES, JSON.stringify(INITIAL_CENTRES));
  return INITIAL_CENTRES;
};

export const getRewards = (): EcoReward[] => {
  try {
    const raw = localStorage.getItem(KEYS.REWARDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading rewards', e);
  }
  localStorage.setItem(KEYS.REWARDS, JSON.stringify(INITIAL_REWARDS));
  return INITIAL_REWARDS;
};

export const getClaimedRewards = (): ClaimedReward[] => {
  try {
    const raw = localStorage.getItem(KEYS.CLAIMED_REWARDS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading claimed rewards', e);
  }
  return [];
};

export const claimReward = (rewardId: string): { success: boolean; promoCode?: string; message: string } => {
  const user = getStoredUser();
  const rewards = getRewards();
  const reward = rewards.find(r => r.id === rewardId);

  if (!reward) return { success: false, message: 'Reward not found.' };
  if (user.ecoPoints < reward.pointsCost) {
    return { success: false, message: `Insufficient Eco-Points! You need ${reward.pointsCost} points, but have ${user.ecoPoints}.` };
  }

  // Deduct points
  const updatedUser: User = {
    ...user,
    ecoPoints: user.ecoPoints - reward.pointsCost
  };
  setStoredUser(updatedUser);

  // Add to claimed rewards
  const claimed = getClaimedRewards();
  const newClaimed: ClaimedReward = {
    id: `CLM-${Date.now()}`,
    rewardId: reward.id,
    rewardTitle: reward.title,
    promoCode: reward.promoCode,
    claimedAt: new Date().toLocaleDateString(),
    pointsDeducted: reward.pointsCost
  };
  localStorage.setItem(KEYS.CLAIMED_REWARDS, JSON.stringify([newClaimed, ...claimed]));

  // Increment reward claimed count
  reward.claimedCount += 1;
  localStorage.setItem(KEYS.REWARDS, JSON.stringify(rewards));
  notifyStateChange();

  return { success: true, promoCode: reward.promoCode, message: 'Reward successfully claimed!' };
};

export const getMarketplaceItems = (): MarketplaceItem[] => {
  try {
    const raw = localStorage.getItem(KEYS.MARKETPLACE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading marketplace', e);
  }
  localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(INITIAL_MARKETPLACE));
  return INITIAL_MARKETPLACE;
};

export const addMarketplaceItem = (item: Omit<MarketplaceItem, 'id' | 'createdAt'>): MarketplaceItem => {
  const all = getMarketplaceItems();
  const newItem: MarketplaceItem = {
    ...item,
    id: `mkt_${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0]
  };
  const updated = [newItem, ...all];
  localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(updated));
  notifyStateChange();
  return newItem;
};

export const reserveMarketplaceItem = (itemId: string): boolean => {
  const all = getMarketplaceItems();
  const target = all.find(i => i.id === itemId);
  if (!target) return false;
  target.isReserved = !target.isReserved;
  localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(all));
  notifyStateChange();
  return true;
};

export const getChallenges = (): CommunityChallenge[] => {
  try {
    const raw = localStorage.getItem(KEYS.CHALLENGES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading challenges', e);
  }
  localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(INITIAL_CHALLENGES));
  return INITIAL_CHALLENGES;
};

export const getVerificationApplications = (): PartnerVerificationApplication[] => {
  try {
    const raw = localStorage.getItem(KEYS.APPLICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading applications', e);
  }
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(INITIAL_VERIFICATION_APPLICATIONS));
  return INITIAL_VERIFICATION_APPLICATIONS;
};

export const updateApplicationStatus = (appId: string, status: 'approved' | 'rejected'): boolean => {
  const all = getVerificationApplications();
  const target = all.find(a => a.id === appId);
  if (!target) return false;
  target.status = status;
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(all));
  notifyStateChange();
  return true;
};

export const calculatePlatformMetrics = () => {
  const requests = getPickupRequests();
  const baselineDevices = 1240;
  const baselineKg = 4850;
  const baselineCo2Kg = 18600;

  let addedDevices = 0;
  let addedKg = 0;
  let addedCo2 = 0;
  let completedCount = 0;
  let repairedCount = 0;

  requests.forEach(r => {
    addedDevices += r.quantity;
    const cat = CATEGORY_DETAILS[r.deviceCategory];
    const unitKg = cat ? cat.avgWeightKg : 1.5;
    const unitCo2 = cat ? cat.co2SavingsPerUnitKg : 25;
    const reqKg = (r.verifiedWeightKg || r.estimatedWeightKg || unitKg) * r.quantity;

    addedKg += reqKg;
    addedCo2 += unitCo2 * r.quantity;

    if (r.status === 'completed') {
      completedCount++;
    }
    if (r.disposalPreference === 'repair' || r.disposalPreference === 'refurbish') {
      repairedCount += r.quantity;
    }
  });

  const totalDevices = baselineDevices + addedDevices;
  const totalKg = Number((baselineKg + addedKg).toFixed(1));
  const totalCo2Kg = Number((baselineCo2Kg + addedCo2).toFixed(1));
  const totalGoldGrams = Number((totalKg * 0.042).toFixed(2));
  const totalCopperKg = Number((totalKg * 0.14).toFixed(1));

  return {
    totalDevices,
    totalKg,
    totalCo2Kg,
    totalGoldGrams,
    totalCopperKg,
    totalPartners: 28,
    completionRate: 94.2,
    repairedCount: 318 + repairedCount,
    treeEquivalents: Math.round(totalCo2Kg / 21.77) // 1 mature tree absorbs ~21.77kg CO2/yr
  };
};

export const resetToDefaults = () => {
  localStorage.setItem(KEYS.USER, JSON.stringify(DEMO_USERS.citizen));
  localStorage.setItem(KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
  localStorage.setItem(KEYS.CENTRES, JSON.stringify(INITIAL_CENTRES));
  localStorage.setItem(KEYS.REWARDS, JSON.stringify(INITIAL_REWARDS));
  localStorage.setItem(KEYS.CLAIMED_REWARDS, JSON.stringify([]));
  localStorage.setItem(KEYS.MARKETPLACE, JSON.stringify(INITIAL_MARKETPLACE));
  localStorage.setItem(KEYS.CHALLENGES, JSON.stringify(INITIAL_CHALLENGES));
  localStorage.setItem(KEYS.APPLICATIONS, JSON.stringify(INITIAL_VERIFICATION_APPLICATIONS));
  notifyStateChange();
};
