export interface Appliance {
  id: string;
  name: string;
  wattage: number;
  surge: number;
  category: string;
  icon: string;
  isHeavyDuty: boolean;
  soloOnly: boolean; // Must be used alone - no other heavy-duty appliances
  hasVariants?: boolean; // Has dropdown variants
  allowMultiple?: boolean; // Can select multiple of this appliance (default true)
}

export interface ApplianceVariant {
  id: string;
  parentId: string;
  label: string;
  wattage: number;
  surge: number;
}

export interface ApplianceWithQuantity extends Appliance {
  quantity: number;
}

// Allowed heavy-duty combinations (pairs that can work together)
export const allowedCombinations: [string, string][] = [
  ['ac_1hp', 'refrigerator'],
  ['ac_1hp', 'mini_fridge'],
  ['ac_1hp', 'top_bottom_freezer'],
  ['ac_1hp', 'deep_freezer'],
  ['ac_1hp_inv', 'refrigerator'],
  ['ac_1hp_inv', 'mini_fridge'],
  ['ac_1hp_inv', 'top_bottom_freezer'],
  ['ac_1hp_inv', 'deep_freezer'],
  ['ac_15hp', 'refrigerator'],
  ['ac_15hp', 'mini_fridge'],
  ['ac_15hp_inv', 'refrigerator'],
  ['ac_15hp_inv', 'mini_fridge'],
  ['refrigerator', 'deep_freezer'],
  ['mini_fridge', 'deep_freezer'],
  ['top_bottom_freezer', 'mini_fridge'],
  ['refrigerator', 'toaster'],
  ['mini_fridge', 'toaster'],
  ['washing_machine', 'refrigerator'],
  ['washing_machine', 'mini_fridge'],
];

// Combinations to avoid (generate warnings)
export const avoidCombinations: { ids: string[], warning: string }[] = [
  { ids: ['ac_1hp', 'water_pump'], warning: 'Avoid running AC and Water Pump together - high surge load.' },
  { ids: ['ac_15hp', 'water_pump'], warning: 'Avoid running AC and Water Pump together - high surge load.' },
  { ids: ['ac_2hp', 'water_pump'], warning: 'Avoid running AC and Water Pump together - high surge load.' },
  { ids: ['electric_kettle'], warning: 'Electric Kettle should not run with other heavy-duty appliances.' },
  { ids: ['space_heater'], warning: 'Space Heater should not run with other heavy-duty appliances.' },
  { ids: ['iron'], warning: 'Electric Iron should not run with other heavy-duty appliances.' },
  { ids: ['microwave'], warning: 'Microwave Oven should not run with other heavy-duty appliances.' },
  { ids: ['vacuum'], warning: 'Vacuum Cleaner should not run with other heavy-duty appliances.' },
  { ids: ['washing_machine', 'water_pump'], warning: 'Avoid running Washing Machine and Water Pump together.' },
];

export const applianceCategories = [
  { id: 'lighting', name: 'Lighting', icon: 'Lightbulb' },
  { id: 'entertainment', name: 'Entertainment', icon: 'Tv' },
  { id: 'kitchen', name: 'Kitchen', icon: 'UtensilsCrossed' },
  { id: 'cooling', name: 'Cooling', icon: 'Fan' },
  { id: 'office', name: 'Office & Work', icon: 'Monitor' },
  { id: 'heavy-duty', name: 'Heavy Duty Appliances', icon: 'Zap' },
];

// LED Bulb variants
export const ledBulbVariants: ApplianceVariant[] = [
  { id: 'led_10w', parentId: 'led_bulb', label: '10W', wattage: 10, surge: 1 },
  { id: 'led_15w', parentId: 'led_bulb', label: '15W', wattage: 15, surge: 1 },
  { id: 'led_20w', parentId: 'led_bulb', label: '20W', wattage: 20, surge: 1 },
  { id: 'led_30w', parentId: 'led_bulb', label: '30W', wattage: 30, surge: 1 },
  { id: 'led_40w', parentId: 'led_bulb', label: '40W', wattage: 40, surge: 1 },
];

// LED TV variants
export const ledTvVariants: ApplianceVariant[] = [
  { id: 'tv_24', parentId: 'led_tv', label: '24"', wattage: 30, surge: 1 },
  { id: 'tv_32', parentId: 'led_tv', label: '32"', wattage: 50, surge: 1 },
  { id: 'tv_43', parentId: 'led_tv', label: '43"', wattage: 80, surge: 1 },
  { id: 'tv_50', parentId: 'led_tv', label: '50"', wattage: 100, surge: 1 },
  { id: 'tv_55', parentId: 'led_tv', label: '55"', wattage: 120, surge: 1 },
  { id: 'tv_65', parentId: 'led_tv', label: '65"', wattage: 150, surge: 1 },
  { id: 'tv_75', parentId: 'led_tv', label: '75"', wattage: 200, surge: 1 },
];

// Refrigerator variants (no multiple)
export const refrigeratorVariants: ApplianceVariant[] = [
  { id: 'mini_fridge', parentId: 'refrigerator', label: 'Mini Fridge', wattage: 100, surge: 3 },
  { id: 'top_bottom_freezer', parentId: 'refrigerator', label: 'Top/Bottom Freezer', wattage: 350, surge: 3 },
  { id: 'deep_freezer', parentId: 'refrigerator', label: 'Deep Freezer', wattage: 600, surge: 3 },
];

// Air Conditioner variants (no multiple)
export const acVariants: ApplianceVariant[] = [
  { id: 'ac_1hp', parentId: 'air_conditioner', label: '1HP', wattage: 900, surge: 3 },
  { id: 'ac_15hp', parentId: 'air_conditioner', label: '1.5HP', wattage: 1200, surge: 3 },
  { id: 'ac_2hp', parentId: 'air_conditioner', label: '2HP', wattage: 1800, surge: 3 },
  { id: 'ac_1hp_inv', parentId: 'air_conditioner', label: '1HP (Inverter)', wattage: 700, surge: 2 },
  { id: 'ac_15hp_inv', parentId: 'air_conditioner', label: '1.5HP (Inverter)', wattage: 950, surge: 2 },
  { id: 'ac_2hp_inv', parentId: 'air_conditioner', label: '2HP (Inverter)', wattage: 1400, surge: 2 },
];

// All variant groups
export const applianceVariants: Record<string, ApplianceVariant[]> = {
  led_bulb: ledBulbVariants,
  led_tv: ledTvVariants,
  refrigerator: refrigeratorVariants,
  air_conditioner: acVariants,
};

// Solo-only AC variants (these require solo usage)
export const soloOnlyVariants = ['ac_2hp', 'ac_2hp_inv'];

export const appliances: Appliance[] = [
  // Lighting (with variants for LED Bulb)
  { id: 'led_bulb', name: 'LED Bulb', wattage: 10, surge: 1, category: 'lighting', icon: 'Lightbulb', isHeavyDuty: false, soloOnly: false, hasVariants: true, allowMultiple: true },
  { id: 'fluorescent', name: 'Fluorescent Tube', wattage: 40, surge: 1.2, category: 'lighting', icon: 'Lightbulb', isHeavyDuty: false, soloOnly: false },
  { id: 'outdoor_light', name: 'Outdoor Light', wattage: 60, surge: 1, category: 'lighting', icon: 'Sun', isHeavyDuty: false, soloOnly: false },

  // Entertainment (with variants for LED TV)
  { id: 'led_tv', name: 'LED TV', wattage: 50, surge: 1, category: 'entertainment', icon: 'Tv', isHeavyDuty: false, soloOnly: false, hasVariants: true, allowMultiple: true },
  { id: 'sound_system', name: 'Sound System', wattage: 100, surge: 1.5, category: 'entertainment', icon: 'Speaker', isHeavyDuty: false, soloOnly: false },
  { id: 'gaming_console', name: 'Gaming Console', wattage: 200, surge: 1, category: 'entertainment', icon: 'Gamepad2', isHeavyDuty: false, soloOnly: false },
  { id: 'decoder', name: 'Cable/Satellite Decoder', wattage: 25, surge: 1, category: 'entertainment', icon: 'Radio', isHeavyDuty: false, soloOnly: false },

  // Kitchen (under 500W)
  { id: 'blender', name: 'Blender', wattage: 400, surge: 3, category: 'kitchen', icon: 'Blend', isHeavyDuty: false, soloOnly: false },

  // Cooling (under 500W)
  { id: 'ceiling_fan', name: 'Ceiling Fan', wattage: 75, surge: 1.5, category: 'cooling', icon: 'Fan', isHeavyDuty: false, soloOnly: false },
  { id: 'standing_fan', name: 'Standing Fan', wattage: 55, surge: 1.5, category: 'cooling', icon: 'Fan', isHeavyDuty: false, soloOnly: false },

  // Office (under 500W)
  { id: 'laptop', name: 'Laptop', wattage: 65, surge: 1, category: 'office', icon: 'Laptop', isHeavyDuty: false, soloOnly: false },
  { id: 'desktop', name: 'Desktop Computer', wattage: 250, surge: 1.5, category: 'office', icon: 'Monitor', isHeavyDuty: false, soloOnly: false },
  { id: 'monitor', name: 'Computer Monitor', wattage: 40, surge: 1, category: 'office', icon: 'Monitor', isHeavyDuty: false, soloOnly: false },
  { id: 'printer', name: 'Printer', wattage: 150, surge: 2, category: 'office', icon: 'Printer', isHeavyDuty: false, soloOnly: false },
  { id: 'router', name: 'WiFi Router', wattage: 15, surge: 1, category: 'office', icon: 'Wifi', isHeavyDuty: false, soloOnly: false },
  { id: 'phone_charger', name: 'Phone Charger', wattage: 10, surge: 1, category: 'office', icon: 'Smartphone', isHeavyDuty: false, soloOnly: false },

  // Heavy Duty - Air Conditioner with variants (no multiple)
  { id: 'air_conditioner', name: 'Air Conditioner', wattage: 900, surge: 3, category: 'heavy-duty', icon: 'AirVent', isHeavyDuty: true, soloOnly: false, hasVariants: true, allowMultiple: false },
  
  // Heavy Duty - Refrigerator with variants (no multiple)
  { id: 'refrigerator', name: 'Refrigerator', wattage: 350, surge: 3, category: 'heavy-duty', icon: 'Refrigerator', isHeavyDuty: true, soloOnly: false, hasVariants: true, allowMultiple: false },
  
  // Heavy Duty - Solo only appliances
  { id: 'microwave', name: 'Microwave Oven', wattage: 1200, surge: 2, category: 'heavy-duty', icon: 'Microwave', isHeavyDuty: true, soloOnly: true },
  { id: 'electric_kettle', name: 'Electric Kettle', wattage: 1500, surge: 1, category: 'heavy-duty', icon: 'Coffee', isHeavyDuty: true, soloOnly: true },
  { id: 'washing_machine', name: 'Washing Machine', wattage: 700, surge: 3, category: 'heavy-duty', icon: 'WashingMachine', isHeavyDuty: true, soloOnly: false },
  { id: 'iron', name: 'Electric Iron', wattage: 1200, surge: 1, category: 'heavy-duty', icon: 'Shirt', isHeavyDuty: true, soloOnly: true },
  { id: 'water_pump', name: 'Water Pump (1HP)', wattage: 750, surge: 3, category: 'heavy-duty', icon: 'Droplets', isHeavyDuty: true, soloOnly: true },
  { id: 'space_heater', name: 'Space Heater', wattage: 1500, surge: 1, category: 'heavy-duty', icon: 'Flame', isHeavyDuty: true, soloOnly: true },
  { id: 'toaster', name: 'Toaster', wattage: 800, surge: 1, category: 'heavy-duty', icon: 'Cookie', isHeavyDuty: true, soloOnly: false },
  { id: 'vacuum', name: 'Vacuum Cleaner', wattage: 1000, surge: 2, category: 'heavy-duty', icon: 'Wind', isHeavyDuty: true, soloOnly: true },
];

// IDs that should keep essentials when turning off
export const essentialApplianceIds = ['led_bulb', 'phone_charger', 'ceiling_fan', 'standing_fan', 'laptop', 'router'];

// Fan IDs for AC conflict check
export const fanApplianceIds = ['ceiling_fan', 'standing_fan'];

export const inverterSizes = [1.5, 2.5, 3.5, 5, 7.5, 10, 15, 20];

// Helper function to check if two heavy-duty appliances can be combined
export function canCombine(id1: string, id2: string): boolean {
  return allowedCombinations.some(
    ([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1)
  );
}

// Helper function to get warnings for current selection
export function getCombinationWarnings(selectedIds: string[]): string[] {
  const warnings: string[] = [];
  
  for (const combo of avoidCombinations) {
    const allPresent = combo.ids.every(id => selectedIds.includes(id));
    if (allPresent && combo.ids.length > 1) {
      warnings.push(combo.warning);
    }
    // For single-item warnings (solo appliances with other heavy-duty)
    if (combo.ids.length === 1 && selectedIds.includes(combo.ids[0]) && selectedIds.length > 1) {
      warnings.push(combo.warning);
    }
  }
  
  return warnings;
}
