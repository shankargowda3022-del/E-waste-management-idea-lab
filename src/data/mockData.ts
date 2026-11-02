import {
  User,
  CollectionCentre,
  PickupRequest,
  EcoReward,
  MarketplaceItem,
  CommunityChallenge,
  PartnerVerificationApplication
} from '../types';

export const DEMO_USERS: Record<string, User> = {
  citizen: {
    id: 'usr_citizen_01',
    name: 'Alex Rivera',
    email: 'alex.rivera@university.edu',
    role: 'citizen',
    organization: 'Apex Engineering College, Dept of CS',
    ecoPoints: 480,
    carbonSavedKg: 94.5,
    devicesRecycled: 5,
    phone: '+1 (555) 234-8901',
    address: 'Room 304, Redwood Student Residence, North Campus'
  },
  recycler: {
    id: 'usr_recycler_01',
    name: 'GreenTech Certified Solutions',
    email: 'ops@greentech-ewaste.org',
    role: 'recycler',
    organization: 'GreenTech Certified Recyclers Ltd (R2v3 / ISO 14001)',
    ecoPoints: 3450,
    carbonSavedKg: 1240.0,
    devicesRecycled: 142,
    phone: '+1 (555) 456-7890',
    address: 'Bay 14, CleanTech Eco-Park, West Corridor'
  },
  repair: {
    id: 'usr_repair_01',
    name: 'MicroFix Hardware Lab',
    email: 'technician@microfixlab.com',
    role: 'repair',
    organization: 'MicroFix Circuit & Device Diagnostics Hub',
    ecoPoints: 1820,
    carbonSavedKg: 580.0,
    devicesRecycled: 46,
    phone: '+1 (555) 678-1234',
    address: 'Unit 4B, Innovation Quarters, University Tech Mall'
  },
  admin: {
    id: 'usr_admin_01',
    name: 'Dr. Sarah Vance',
    email: 'director@e-cycle-ai.org',
    role: 'admin',
    organization: 'UN SDG Environmental Taskforce / Campus Sustainability Office',
    ecoPoints: 9999,
    carbonSavedKg: 8940.0,
    devicesRecycled: 920,
    phone: '+1 (555) 901-2345',
    address: 'Sustainability Directorate, Suite 10, Admin Tower'
  }
};

export const INITIAL_CENTRES: CollectionCentre[] = [
  {
    id: 'ctr_campus_01',
    name: 'North Campus Smart Eco-Kiosk',
    type: 'campus_depot',
    address: 'Ground Floor, Student Union Building, Campus Plaza',
    city: 'Metro University District',
    distanceKm: 0.4,
    phone: '+1 (555) 234-9911',
    email: 'campus-dropoff@e-cycle-ai.org',
    rating: 4.9,
    reviewsCount: 128,
    acceptedCategories: ['Laptops', 'Smartphones & Tablets', 'Batteries & Chargers', 'Audio & Wearables', 'PCBs & RAM'],
    services: ['Free Doorstep Pickup', 'Instant Eco-Points', 'Data Wiping Verification'],
    openHours: 'Mon - Sat: 8:00 AM - 8:00 PM',
    certifiedR2: true
  },
  {
    id: 'ctr_metro_02',
    name: 'Apex Certified E-Waste Recovery Hub',
    type: 'certified_recycler',
    address: '42 Eco Industrial Lane, Sector 9',
    city: 'Tech Corridor',
    distanceKm: 3.2,
    phone: '+1 (555) 345-8822',
    email: 'recovery@apexr2recycling.com',
    rating: 4.8,
    reviewsCount: 215,
    acceptedCategories: ['Laptops', 'Desktops & Servers', 'Large Displays & TVs', 'Small Appliances', 'Lithium-Ion Batteries'],
    services: ['Free Doorstep Pickup', 'Instant Eco-Points', 'Data Wiping Verification'],
    openHours: 'Mon - Fri: 9:00 AM - 6:00 PM',
    certifiedR2: true
  },
  {
    id: 'ctr_repair_03',
    name: 'MicroFix Component Diagnostic & Refurb Hub',
    type: 'repair_hub',
    address: 'Unit 4B, Innovation Quarters, University Tech Mall',
    city: 'Metro University District',
    distanceKm: 1.1,
    phone: '+1 (555) 678-1234',
    email: 'desk@microfixlab.com',
    rating: 4.9,
    reviewsCount: 94,
    acceptedCategories: ['Laptops', 'Smartphones & Tablets', 'Audio & Wearables', 'PCBs & RAM'],
    services: ['On-site Diagnostic', 'Data Wiping Verification', 'Instant Eco-Points'],
    openHours: 'Tue - Sun: 10:00 AM - 7:00 PM',
    certifiedR2: false
  },
  {
    id: 'ctr_suburb_04',
    name: 'CleanEarth Regional Aggregate Facility',
    type: 'certified_recycler',
    address: '108 Green Circuit Way, Logistics Zone',
    city: 'South Suburbs',
    distanceKm: 7.5,
    phone: '+1 (555) 789-3344',
    email: 'logistics@cleanearth-recyclers.org',
    rating: 4.7,
    reviewsCount: 160,
    acceptedCategories: ['Laptops', 'Desktops & Servers', 'Large Displays & TVs', 'Small Appliances', 'Batteries & Chargers', 'PCBs & RAM'],
    services: ['Free Doorstep Pickup', 'Instant Eco-Points'],
    openHours: 'Mon - Sat: 7:30 AM - 5:30 PM',
    certifiedR2: true
  }
];

export const INITIAL_REQUESTS: PickupRequest[] = [
  {
    id: 'ECY-2026-8941',
    userId: 'usr_citizen_01',
    userName: 'Alex Rivera',
    userEmail: 'alex.rivera@university.edu',
    userPhone: '+1 (555) 234-8901',
    deviceCategory: 'Laptops',
    brand: 'Lenovo',
    model: 'ThinkPad T480 (Core i5, 8GB RAM)',
    quantity: 1,
    condition: 'minor_damage',
    pickupType: 'home_pickup',
    address: 'Room 304, Redwood Student Residence, North Campus',
    preferredDate: '2026-11-05',
    timeSlot: '10:00 AM - 01:00 PM',
    disposalPreference: 'repair',
    notes: 'Battery charges slowly; trackpad right click stiff. SSD removed for data security.',
    serialNumber: 'PF1K92M4',
    status: 'assigned',
    trackingUpdates: [
      {
        stage: 'submitted',
        title: 'Request Logged',
        description: 'Citizen submitted e-waste pickup request via digital portal.',
        timestamp: '2026-11-01 09:30 AM',
        location: 'North Campus Portal'
      },
      {
        stage: 'verified',
        title: 'Eligibility Verified',
        description: 'Automated serial check & condition triage confirmed device matches circular economy repair quota.',
        timestamp: '2026-11-01 11:15 AM',
        location: 'E-Cycle AI Central Engine'
      },
      {
        stage: 'assigned',
        title: 'Assigned to Partner',
        description: 'Allocated to MicroFix Hardware Lab for doorstep batch pickup and component health triage.',
        timestamp: '2026-11-02 08:00 AM',
        location: 'Innovation Quarters Station',
        updatedBy: 'GreenTech Logistics Dispatch'
      }
    ],
    ecoPointsAwarded: 160,
    estimatedWeightKg: 1.75,
    assignedPartnerId: 'usr_repair_01',
    assignedPartnerName: 'MicroFix Hardware Lab',
    createdAt: '2026-11-01 09:30 AM',
    dataPrivacyAcknowledged: true,
    batterySafeHandlingAcknowledged: true,
    qrCodeToken: 'ECY-QR-8941-SECURE-2026'
  },
  {
    id: 'ECY-2026-8812',
    userId: 'usr_citizen_01',
    userName: 'Alex Rivera',
    userEmail: 'alex.rivera@university.edu',
    userPhone: '+1 (555) 234-8901',
    deviceCategory: 'Smartphones & Tablets',
    brand: 'Samsung',
    model: 'Galaxy S10 (128GB)',
    quantity: 1,
    condition: 'working',
    pickupType: 'centre_dropoff',
    address: 'Ground Floor, Student Union Building, Campus Plaza',
    centreId: 'ctr_campus_01',
    centreName: 'North Campus Smart Eco-Kiosk',
    preferredDate: '2026-10-28',
    timeSlot: '02:00 PM - 05:00 PM',
    disposalPreference: 'refurbish',
    notes: 'Fully functioning, factory reset done. Minor scuffs on back glass.',
    serialNumber: 'R58M90A81KL',
    status: 'completed',
    trackingUpdates: [
      {
        stage: 'submitted',
        title: 'Drop-off Scheduled',
        description: 'Device registered for campus depot drop-off.',
        timestamp: '2026-10-28 09:00 AM'
      },
      {
        stage: 'verified',
        title: 'Drop-off Received',
        description: 'Kiosk attendant checked IMEI and confirmed functional condition.',
        timestamp: '2026-10-28 02:45 PM'
      },
      {
        stage: 'collected',
        title: 'Transferred to Lab',
        description: 'Logged into refurbishment batch for educational device donation program.',
        timestamp: '2026-10-29 10:00 AM'
      },
      {
        stage: 'completed',
        title: 'Completed & Certified',
        description: 'Refurbishment passed. 120 Eco-Points deposited to Alex Rivera.',
        timestamp: '2026-10-30 04:30 PM'
      }
    ],
    ecoPointsAwarded: 120,
    estimatedWeightKg: 0.18,
    verifiedWeightKg: 0.18,
    recoveredGoldGrams: 0.034,
    recoveredCopperKg: 0.016,
    assignedPartnerId: 'usr_recycler_01',
    assignedPartnerName: 'GreenTech Certified Solutions',
    createdAt: '2026-10-28 09:00 AM',
    dataPrivacyAcknowledged: true,
    batterySafeHandlingAcknowledged: true,
    qrCodeToken: 'ECY-QR-8812-COMPLETED-2026'
  },
  {
    id: 'ECY-2026-8977',
    userId: 'usr_citizen_02',
    userName: 'Priya Sharma',
    userEmail: 'priya.s@university.edu',
    userPhone: '+1 (555) 432-1098',
    deviceCategory: 'Lithium-Ion Batteries',
    brand: 'Anker / Mixed OEM',
    model: '20,000mAh Powerbank + 4 Swollen Drone Cells',
    quantity: 5,
    condition: 'hazardous',
    pickupType: 'home_pickup',
    address: 'Dorm 12B, South Quad Engineering Campus',
    preferredDate: '2026-11-06',
    timeSlot: '09:00 AM - 12:00 PM',
    disposalPreference: 'recycle',
    notes: 'Power bank casing is bulging slightly. Placed in fire-safe vermiculite bag.',
    status: 'submitted',
    trackingUpdates: [
      {
        stage: 'submitted',
        title: 'Hazardous Collection Logged',
        description: 'High priority flag raised for swollen Li-ion cells. Dispatched hazardous handling instructions.',
        timestamp: '2026-11-02 07:15 AM'
      }
    ],
    ecoPointsAwarded: 90,
    estimatedWeightKg: 1.2,
    createdAt: '2026-11-02 07:15 AM',
    dataPrivacyAcknowledged: true,
    batterySafeHandlingAcknowledged: true,
    qrCodeToken: 'ECY-QR-8977-HAZARD-2026'
  }
];

export const INITIAL_REWARDS: EcoReward[] = [
  {
    id: 'rwd_cafe_01',
    title: 'Free Zero-Waste Organic Coffee or Tea',
    partner: 'Green Bean Campus Roasters',
    category: 'voucher',
    pointsCost: 80,
    discountVal: '$5.50 value',
    description: 'Enjoy any signature handcrafted beverage when you bring a reusable tumbler.',
    promoCode: 'ECO-CAFE-BEV26',
    claimedCount: 84
  },
  {
    id: 'rwd_bookstore_02',
    title: '20% Off Refurbished Tech & Textbooks',
    partner: 'University Campus Bookstore',
    category: 'tech_discount',
    pointsCost: 150,
    discountVal: '20% OFF',
    description: 'Valid on certified refurbished graphing calculators, tablets, and course supplies.',
    promoCode: 'CAMPUS-20-TECH',
    claimedCount: 42
  },
  {
    id: 'rwd_tree_03',
    title: 'Plant 2 Native Trees in Agroforestry Project',
    partner: 'Global Canopy Initiative & UN SDG 13',
    category: 'planting',
    pointsCost: 200,
    discountVal: '2 Trees Planted',
    description: 'We fund planting of 2 native trees with geotagged certificate sent to your profile.',
    promoCode: 'SDG13-FOREST-PLANT',
    claimedCount: 119
  },
  {
    id: 'rwd_repair_04',
    title: '$25 Labor Voucher for Hardware Repair',
    partner: 'MicroFix Hardware Lab',
    category: 'tech_discount',
    pointsCost: 250,
    discountVal: '$25 CREDIT',
    description: 'Applicable towards thermal paste repasting, screen replacement, or hinge repair.',
    promoCode: 'FIX-FIRST-25',
    claimedCount: 31
  }
];

export const INITIAL_MARKETPLACE: MarketplaceItem[] = [
  {
    id: 'mkt_01',
    title: 'ThinkPad T480 - i5 8th Gen / 16GB RAM / 256GB NVMe',
    category: 'Laptops',
    price: 185,
    condition: 'refurbished_grade_a',
    sellerId: 'usr_repair_01',
    sellerName: 'MicroFix Hardware Lab',
    sellerRole: 'Certified Refurbisher',
    location: 'North Campus Hub',
    description: 'Thoroughly ultrasonic-cleaned motherboard, fresh Arctic MX-6 thermal paste, new OEM dual-battery installed. 1080p matte IPS display in pristine condition.',
    specs: ['Intel Core i5-8350U Quad Core', '16GB DDR4 Dual-Channel', '256GB M.2 PCIe NVMe SSD', 'Dual battery 72Wh ~8hrs battery'],
    warrantyDays: 90,
    createdAt: '2026-10-31'
  },
  {
    id: 'mkt_02',
    title: 'Dell UltraSharp 24" 1080p IPS Monitor (U2415)',
    category: 'Displays',
    price: 75,
    condition: 'tested_working',
    sellerId: 'usr_citizen_01',
    sellerName: 'Alex Rivera',
    sellerRole: 'Verified Student',
    location: 'Redwood Residence Hall',
    description: '16:10 aspect ratio (1920x1200) excellent for coding & reading. Full pivot and height-adjustable stand. DisplayPort and HDMI cables included.',
    specs: ['1920x1200 @ 60Hz 99% sRGB', 'Ultra-thin bezel', 'Height, tilt, swivel, pivot stand', 'Built-in USB 3.0 Hub'],
    warrantyDays: 14,
    createdAt: '2026-11-01'
  },
  {
    id: 'mkt_03',
    title: 'Crucial 16GB (2x8GB) DDR4-3200 SODIMM Laptop RAM',
    category: 'Components',
    price: 28,
    condition: 'tested_working',
    sellerId: 'usr_recycler_01',
    sellerName: 'GreenTech Certified Solutions',
    sellerRole: 'Certified Refurbisher',
    location: 'CleanTech Park Hub',
    description: 'Harvested from recycled corporate systems, passed 4 cycles of MemTest86 with zero errors. Perfect speed boost for student laptops.',
    specs: ['2x 8GB Modules DDR4', '3200MHz CL22', '1.2V Low Power', 'Non-ECC Unbuffered'],
    warrantyDays: 60,
    createdAt: '2026-10-29'
  },
  {
    id: 'mkt_04',
    title: 'Dell Latitude 7490 Screen Assembly + Hinge (FHD)',
    category: 'Components',
    price: 35,
    condition: 'for_parts',
    sellerId: 'usr_repair_01',
    sellerName: 'MicroFix Hardware Lab',
    sellerRole: 'Lab Technician',
    location: 'Innovation Quarters',
    description: 'Tested Grade B screen with top lid, webcam, and hinges. Excellent replacement part for cracked student laptops instead of landfilling.',
    specs: ['14-inch Full HD 1920x1080', '30-pin eDP connector', 'Includes OEM webcam & dual mic', 'Functional hinges'],
    warrantyDays: 30,
    createdAt: '2026-10-27'
  }
];

export const INITIAL_CHALLENGES: CommunityChallenge[] = [
  {
    id: 'chl_01',
    title: 'Campus Spring Dorm E-Cleanout 2026',
    organizer: 'Student Sustainability Council',
    targetKg: 2500,
    currentKg: 1845,
    daysLeft: 14,
    participantsCount: 312,
    campusName: 'University Central District'
  },
  {
    id: 'chl_02',
    title: 'Engineering Lab Component Circular Drive',
    organizer: 'IEEE Student Branch & E-Cycle AI',
    targetKg: 1000,
    currentKg: 780,
    daysLeft: 22,
    participantsCount: 145,
    campusName: 'School of Engineering & Applied Sciences'
  }
];

export const INITIAL_VERIFICATION_APPLICATIONS: PartnerVerificationApplication[] = [
  {
    id: 'app_01',
    organizationName: 'EcoTech Material Recovery Systems',
    registrationNumber: 'REG-EW-2026-784',
    contactPerson: 'David Chen',
    email: 'compliance@ecotechrecovery.org',
    phone: '+1 (555) 987-6543',
    city: 'East Valley Tech Hub',
    category: 'Recycler',
    r2Certified: true,
    status: 'pending',
    submittedAt: '2026-11-01',
    facilityAreaSqFt: 18500
  },
  {
    id: 'app_02',
    organizationName: 'CircuitRevive Refurbishment Co-op',
    registrationNumber: 'REG-RF-2026-319',
    contactPerson: 'Elena Rostova',
    email: 'elena@circuitrevive.org',
    phone: '+1 (555) 345-6712',
    city: 'Metro University District',
    category: 'Refurbisher',
    r2Certified: false,
    status: 'pending',
    submittedAt: '2026-10-31',
    facilityAreaSqFt: 3200
  }
];

export const CATEGORY_DETAILS: Record<string, {
  avgWeightKg: number;
  co2SavingsPerUnitKg: number;
  typicalGoldMg: number;
  typicalCopperGrams: number;
  hazardousElements: string[];
  recommendedAction: string;
}> = {
  'Laptops': {
    avgWeightKg: 2.1,
    co2SavingsPerUnitKg: 38.4,
    typicalGoldMg: 220,
    typicalCopperGrams: 500,
    hazardousElements: ['Lithium-Ion electrolyte', 'Lead solder (older models)', 'BFRs (Brominated Flame Retardants)'],
    recommendedAction: 'Diagnostics first. If CPU >= 8th Gen, SSD/RAM upgrade or educational donation is 10x better than shredding.'
  },
  'Smartphones & Tablets': {
    avgWeightKg: 0.19,
    co2SavingsPerUnitKg: 18.2,
    typicalGoldMg: 35,
    typicalCopperGrams: 16,
    hazardousElements: ['Lithium cobalt oxide', 'Cobalt in cathode', 'Rare earth neodymium magnets'],
    recommendedAction: 'Perform cryptographic factory reset. If screen intact, test for secondhand trade-in or reuse as IoT gateway.'
  },
  'Desktops & Servers': {
    avgWeightKg: 8.5,
    co2SavingsPerUnitKg: 110.0,
    typicalGoldMg: 450,
    typicalCopperGrams: 1200,
    hazardousElements: ['Capacitors with toxic electrolytes', 'Lead solder', 'Beryllium copper springs'],
    recommendedAction: 'Harvest RAM, PSU, heatsinks, and PCIe expansion cards. Shred chassis steel & copper coils for smelting.'
  },
  'Large Displays & TVs': {
    avgWeightKg: 6.2,
    co2SavingsPerUnitKg: 42.0,
    typicalGoldMg: 40,
    typicalCopperGrams: 350,
    hazardousElements: ['Mercury backlight lamps (CCFL in legacy LCDs)', 'Cadmium quantum dots (some QLEDs)', 'Lead glass (CRTs)'],
    recommendedAction: 'Careful de-pollution required. Never shatter LCD panel to prevent mercury/phosphor aerosol release.'
  },
  'Lithium-Ion Batteries': {
    avgWeightKg: 0.25,
    co2SavingsPerUnitKg: 12.5,
    typicalGoldMg: 0,
    typicalCopperGrams: 45,
    hazardousElements: ['Lithium hexafluorophosphate', 'Cobalt', 'Nickel', 'Flammable organic solvents'],
    recommendedAction: 'CRITICAL HAZARD: Insulate exposed terminals with electrical tape. Store in vermiculite. Send to hydrometallurgical recycling.'
  },
  'Audio & Wearables': {
    avgWeightKg: 0.12,
    co2SavingsPerUnitKg: 8.0,
    typicalGoldMg: 15,
    typicalCopperGrams: 22,
    hazardousElements: ['Tiny coin-cell lithium batteries', 'Nickel plating'],
    recommendedAction: 'Sanitize tips/pads. Test Bluetooth sync. If dead, recover neodymium magnets and gold-plated contacts.'
  },
  'PCBs & RAM': {
    avgWeightKg: 0.35,
    co2SavingsPerUnitKg: 24.0,
    typicalGoldMg: 180,
    typicalCopperGrams: 120,
    hazardousElements: ['Lead solder', 'Antimony trioxide flame retardant'],
    recommendedAction: 'High-value urban mining. Smelted by certified pyrometallurgical refiners to achieve 98% precious metal recovery.'
  },
  'Small Appliances': {
    avgWeightKg: 2.8,
    co2SavingsPerUnitKg: 22.0,
    typicalGoldMg: 10,
    typicalCopperGrams: 280,
    hazardousElements: ['Plasticizers', 'Heating coils', 'Transformer oils'],
    recommendedAction: 'Disassemble motor winding copper and steel core. Shred outer casing for high-grade polymer granulation.'
  }
};
