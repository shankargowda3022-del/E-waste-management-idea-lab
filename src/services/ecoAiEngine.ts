export interface DeviceAnalysisResult {
  category: string;
  recommendedPathway: 'repair' | 'refurbish_reuse' | 'recycle';
  repairabilityScore: number; // 1-10
  environmentalImpact: {
    co2SavedKg: number;
    hazardousElementsPrevented: string[];
    preciousMetals: {
      goldMg: number;
      copperGrams: number;
      lithiumGrams: number;
    };
  };
  dataWipeGuide: {
    platform: string;
    steps: string[];
    criticalWarning: string;
  };
  safetyAdvisory: string;
  nextSteps: string[];
}

export const analyzeDeviceCondition = (
  deviceCategory: string,
  condition: string,
  deviceAgeYears: number,
  brand: string,
  model: string
): DeviceAnalysisResult => {
  let recommendedPathway: 'repair' | 'refurbish_reuse' | 'recycle' = 'recycle';
  let repairabilityScore = 5;

  if (condition === 'working') {
    recommendedPathway = 'refurbish_reuse';
    repairabilityScore = 9;
  } else if (condition === 'minor_damage') {
    if (deviceAgeYears <= 5) {
      recommendedPathway = 'repair';
      repairabilityScore = 8;
    } else {
      recommendedPathway = 'refurbish_reuse';
      repairabilityScore = 6;
    }
  } else if (condition === 'hazardous') {
    recommendedPathway = 'recycle';
    repairabilityScore = 1;
  } else {
    // non_working
    if (deviceAgeYears <= 3 && (deviceCategory === 'Laptops' || deviceCategory === 'Smartphones & Tablets')) {
      recommendedPathway = 'repair';
      repairabilityScore = 7;
    } else {
      recommendedPathway = 'recycle';
      repairabilityScore = 3;
    }
  }

  // Base metrics based on category
  let co2 = 25.0;
  let gold = 50;
  let copper = 120;
  let lithium = 15;
  let hazards = ['Toxic heavy metals', 'Brominated flame retardants'];

  switch (deviceCategory) {
    case 'Laptops':
      co2 = 38.4;
      gold = 220;
      copper = 500;
      lithium = 45;
      hazards = ['Lithium-Ion electrolyte', 'BFRs in PCB laminate', 'Lead traces in solder'];
      break;
    case 'Smartphones & Tablets':
      co2 = 18.2;
      gold = 35;
      copper = 18;
      lithium = 8;
      hazards = ['Cobalt oxide cathode', 'Organic electrolyte solvents', 'Neodymium rare earths'];
      break;
    case 'Desktops & Servers':
      co2 = 110.0;
      gold = 450;
      copper = 1200;
      lithium = 0;
      hazards = ['Electrolytic capacitors', 'Lead solder', 'Beryllium copper'];
      break;
    case 'Lithium-Ion Batteries':
      co2 = 14.5;
      gold = 0;
      copper = 45;
      lithium = 65;
      hazards = ['Corrosive HF acid risk if punctured', 'Thermal runaway fire hazard', 'Cobalt/Nickel'];
      break;
    case 'Large Displays & TVs':
      co2 = 42.0;
      gold = 40;
      copper = 350;
      lithium = 0;
      hazards = ['Mercury vapor in cold cathode backlights', 'Cadmium quantum dots', 'High-voltage capacitors'];
      break;
    default:
      co2 = 20.0;
      gold = 25;
      copper = 80;
      lithium = 5;
  }

  // Platform specific wipe guide
  let wipeGuide = {
    platform: 'General Electronics',
    steps: [
      'Remove all external storage media, SD cards, and SIM trays.',
      'Unlink any cloud synchronization accounts (Google, Apple, Microsoft).',
      'Execute a full hardware cryptographic reset via system recovery settings.'
    ],
    criticalWarning: 'Do not simply delete files or empty recycle bin; data remains recoverable with forensic tools unless encrypted and overwritten.'
  };

  const lowerBrand = brand.toLowerCase();
  const lowerCat = deviceCategory.toLowerCase();

  if (lowerBrand.includes('apple') || lowerCat.includes('iphone') || lowerCat.includes('macbook')) {
    wipeGuide = {
      platform: 'Apple iOS & macOS (Erase All Content and Settings)',
      steps: [
        'Open Settings > Apple Account > Sign Out of iCloud & Find My (Activation Lock removal).',
        'Back up essential personal documents to encrypted external storage.',
        'On Mac: System Settings > General > Transfer or Reset > Erase All Content and Settings.',
        'On iPhone/iPad: Settings > General > Transfer or Reset > Erase All Content and Settings (triggers hardware AES-256 crypto-shredding).'
      ],
      criticalWarning: 'CRITICAL: If you do not disable "Find My" before recycling, the device remains Activation Locked and cannot be repaired or reused!'
    };
  } else if (lowerBrand.includes('samsung') || lowerBrand.includes('pixel') || lowerCat.includes('android')) {
    wipeGuide = {
      platform: 'Android Device Sanitization (FBE Hardware Encryption)',
      steps: [
        'Open Settings > Accounts & Backup > Manage Accounts > Remove Google and OEM Accounts.',
        'Eject physical SIM card and MicroSD memory card.',
        'Settings > System / General Management > Reset > Factory Data Reset.',
        'Confirm password to trigger secure key destruction.'
      ],
      criticalWarning: 'Always delete Google Account first to avoid triggering Factory Reset Protection (FRP) on the next recipient.'
    };
  } else if (lowerCat.includes('laptop') || lowerCat.includes('desktop')) {
    wipeGuide = {
      platform: 'Windows / Linux PC Sanitization',
      steps: [
        'Backup local files to an external drive.',
        'Windows Settings > System > Recovery > Reset this PC.',
        'Select "Remove everything" and critically choose "Clean the drive" (overwrites sectors with zeroes, takes ~45 minutes).',
        'Optional advanced: Boot into USB with DBAN or shred utilities, or retain the physical drive and submit chassis only.'
      ],
      criticalWarning: 'Selecting "Quick Reset" leaves previous files recoverable. Always choose "Fully clean the drive".'
    };
  }

  let safetyAdvisory = 'Ensure unit is powered down completely before handover. No exposed bare wire terminals.';
  if (condition === 'hazardous' || deviceCategory === 'Lithium-Ion Batteries') {
    safetyAdvisory = 'DANGER: Lithium-ion cells under stress or swelling can undergo exothermic thermal runaway. Cover positive/negative contacts with non-conductive electrical tape immediately. Store in a cool, ventilated container away from flammable materials.';
  }

  const nextSteps = [];
  if (recommendedPathway === 'repair') {
    nextSteps.push('Connect with our campus hardware repair clinic (MicroFix Lab) for a free diagnostic assessment.');
    nextSteps.push('Check the Reuse & Repair Marketplace to source verified donor parts or replacement components.');
  } else if (recommendedPathway === 'refurbish_reuse') {
    nextSteps.push('List on our campus Marketplace to help a fellow student acquire an affordable refurbished machine.');
    nextSteps.push('Submit a donation drop-off request to earn 150 Eco-Points towards campus rewards.');
  } else {
    nextSteps.push('Book a certified R2v3 e-waste pickup or deposit at our solar-powered North Campus Eco-Kiosk.');
    nextSteps.push('Track transparent recovery through our 7-stage chain of custody tracker.');
  }

  return {
    category: deviceCategory,
    recommendedPathway,
    repairabilityScore,
    environmentalImpact: {
      co2SavedKg: co2,
      hazardousElementsPrevented: hazards,
      preciousMetals: {
        goldMg: gold,
        copperGrams: copper,
        lithiumGrams: lithium
      }
    },
    dataWipeGuide: wipeGuide,
    safetyAdvisory,
    nextSteps
  };
};

export const getSmartAssistantAnswer = (query: string): string => {
  const q = query.toLowerCase();

  if (q.includes('battery') || q.includes('swollen') || q.includes('bulg') || q.includes('fire')) {
    return `### ⚠️ Safe Lithium-Ion Battery Handling Protocol\n\n1. **Immediate Quarantine:** Swollen or punctured batteries must never be placed in household trash, incinerators, or general recycling bins. Fire risk is severe.\n2. **Tape the Terminals:** Apply non-conductive vinyl electrical tape over all exposed copper/brass terminals to prevent accidental short-circuits.\n3. **Cushioned Storage:** Place the battery inside a non-combustible container (e.g. metal tin or ceramic pot filled with sand or vermiculite).\n4. **Handover:** Select the "Hazardous Collection" checkbox on our E-Cycle AI pickup form. A trained technician will collect it in a fire-rated UN-certified transport box.`;
  }

  if (q.includes('wipe') || q.includes('erase') || q.includes('privacy') || q.includes('data') || q.includes('format')) {
    return `### 🔒 Certified Pre-Disposal Data Sanitization Guide\n\n- **For Apple Devices (Mac/iPhone/iPad):**\n  1. Sign out of iCloud and disable *Find My* in Settings (crucial to remove Activation Lock).\n  2. Navigate to *Settings > General > Transfer or Reset > Erase All Content & Settings*. Modern Apple Silicon uses hardware AES-256 keys that are instantly crypto-shredded.\n\n- **For Android Devices:**\n  1. Remove Google Accounts under *Settings > Accounts* to prevent Factory Reset Protection (FRP).\n  2. Perform *Factory Data Reset* under System settings.\n\n- **For Windows Laptops:**\n  1. Go to *Settings > Recovery > Reset this PC > Remove Everything*.\n  2. **Select "Clean the drive fully"** (writes random data over all sectors) instead of "Just remove my files".`;
  }

  if (q.includes('repair') || q.includes('fix') || q.includes('slow') || q.includes('screen') || q.includes('laptop')) {
    return `### 🛠️ Repair-First Diagnostic Recommendation\n\nBefore recycling a laptop, evaluate these 3 high-impact upgrades:\n1. **Thermal Paste & Fan Cleaning:** Reduces thermal throttling by up to 25°C, restoring sluggish systems to factory speed.\n2. **SATA/NVMe SSD Upgrade:** Replacing an old mechanical hard drive with an SSD boosts read/write speeds by 500%.\n3. **Battery Replacement:** Most 4-8 year old business laptops (ThinkPad, Dell Latitude, HP EliteBook) have modular battery cells costing under $30.\n\n💡 *Tip: Check out our Reuse & Repair Marketplace for donor parts and student repair lab consultations!*`;
  }

  if (q.includes('sdg') || q.includes('sustainable') || q.includes('un') || q.includes('goals')) {
    return `### 🌍 Alignment with UN Sustainable Development Goals (SDGs)\n\nE-Cycle AI directly operationalizes four UN SDGs:\n- **SDG 12 (Target 12.4 & 12.5):** Environmentally sound management of chemical wastes and substantial reduction of waste generation through circular repair, refurbishing, and certified urban mining.\n- **SDG 13 (Target 13.3):** Preventing greenhouse gas emissions by offsetting virgin mining energy demands (recycling 1 ton of laptops avoids ~17 tons of CO2e).\n- **SDG 11 (Target 11.6):** Reducing per-capita environmental impact of municipal tech waste in smart cities and campus communities.\n- **SDG 9 (Target 9.4):** Retrofitting electronics logistics infrastructure with transparent chain-of-custody tracking.`;
  }

  if (q.includes('points') || q.includes('rewards') || q.includes('earn')) {
    return `### 🏆 Eco-Points Reward Architecture\n\nPoints are automatically minted and credited to your verified profile upon successful completion:\n- **Laptops & Desktops:** 160 – 200 Eco-Points\n- **Smartphones & Tablets:** 100 – 140 Eco-Points\n- **Monitors & Large Displays:** 120 Eco-Points\n- **Batteries & Power Banks:** 60 – 90 Eco-Points\n- **RAM & High-Grade Circuit Boards:** 80 Eco-Points\n\nPoints can be redeemed in the Rewards Center for campus bookstore discounts, free zero-waste cafe beverages, or real geotagged agroforestry tree plantings!`;
  }

  return `### 💡 E-Cycle AI Assistant Analysis\n\nThank you for championing circular electronics! Based on your question, here is our guidance:\n\n1. **Assessment:** Prioritize repair and component recovery over direct shredding whenever feasible.\n2. **Security:** Never dispose of any device with your personal data still intact. Always disconnect accounts and run full cryptographic wipes.\n3. **Hazard Prevention:** Keep lithium batteries insulated from water and metal surfaces.\n4. **Action:** You can schedule a doorstep pickup or select a local campus drop-off kiosk using the "Recycle Device" button above.`;
};
