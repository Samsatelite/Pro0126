export interface Appliance {
  id: string;
  name: string;
  wattage: number;
  surge: number;
  category: string;
  icon: string;
  isHeavyDuty: boolean;
  soloOnly: boolean; // Must be used alone - no other heavy-duty appliances
}

export interface ApplianceWithQuantity extends Appliance {
  quantity: number;
}

// Allowed heavy-duty combinations (pairs that can work together)
export const allowedCombinations: [string, string][] = [
  ['ac_1hp', 'refrigerator'],
  ['ac_1hp', 'freezer'],
  ['ac_1hp', 'vacuum'],
  ['ac_15hp', 'refrigerator'],
  ['ac_15hp', 'freezer'],
  ['refrigerator', 'freezer'],
  ['refrigerator', 'vacuum'],
  ['freezer', 'toaster'],
  ['microwave', 'refrigerator'],
  ['toaster', 'refrigerator'],
  ['washing_machine', 'refrigerator'],
  ['washing_machine', 'freezer'],
  ['vacuum', 'refrigerator'],
  ['vacuum', 'freezer'],
];

// Combinations to avoid (generate warnings)
export const avoidCombinations: { ids: string[], warning: string }[] = [
  { ids: ['ac_1hp', 'water_pump'], warning: 'Avoid running AC and Water Pump together - high surge load.' },
  { ids: ['ac_15hp', 'water_pump'], warning: 'Avoid running AC and Water Pump together - high surge load.' },
  { ids: ['ac_2hp', 'water_pump'], warning: 'Avoid running AC and Water Pump together - high surge load.' },
  { ids: ['electric_kettle'], warning: 'Electric Kettle should not run with other heavy-duty appliances.' },
  { ids: ['space_heater'], warning: 'Space Heater should not run with other heavy-duty appliances.' },
  { ids: ['iron'], warning: 'Electric Iron should not run with other heavy-duty appliances.' },
  { ids: ['microwave', 'electric_kettle'], warning: 'Avoid running Microwave and Kettle together.' },
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

export const appliances: Appliance[] = [
  // Lighting (under 500W)
  { id: 'led_bulb', name: 'LED Bulb (9W)', wattage: 9, surge: 1, category: 'lighting', icon: 'Lightbulb', isHeavyDuty: false, soloOnly: false },
  { id: 'fluorescent', name: 'Fluorescent Tube', wattage: 40, surge: 1.2, category: 'lighting', icon: 'Lightbulb', isHeavyDuty: false, soloOnly: false },
  { id: 'outdoor_light', name: 'Outdoor Light', wattage: 60, surge: 1, category: 'lighting', icon: 'Sun', isHeavyDuty: false, soloOnly: false },

  // Entertainment (under 500W)
  { id: 'tv_32', name: 'LED TV 32"', wattage: 50, surge: 1, category: 'entertainment', icon: 'Tv', isHeavyDuty: false, soloOnly: false },
  { id: 'tv_55', name: 'LED TV 55"', wattage: 120, surge: 1, category: 'entertainment', icon: 'Tv', isHeavyDuty: false, soloOnly: false },
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
  { id: 'printer', name: 'Printer', wattage: 150, surge: 2, category: 'office', icon: 'Printer', isHeavyDuty: false, soloOnly: false },
  { id: 'router', name: 'WiFi Router', wattage: 15, surge: 1, category: 'office', icon: 'Wifi', isHeavyDuty: false, soloOnly: false },
  { id: 'phone_charger', name: 'Phone Charger', wattage: 10, surge: 1, category: 'office', icon: 'Smartphone', isHeavyDuty: false, soloOnly: false },

  // Heavy Duty (500W and above) - Some are solo only
  { id: 'ac_1hp', name: 'Air Conditioner 1 HP', wattage: 900, surge: 3, category: 'heavy-duty', icon: 'AirVent', isHeavyDuty: true, soloOnly: false },
  { id: 'ac_15hp', name: 'Air Conditioner 1.5 HP', wattage: 1200, surge: 3, category: 'heavy-duty', icon: 'AirVent', isHeavyDuty: true, soloOnly: false },
  { id: 'ac_2hp', name: 'Air Conditioner 2 HP', wattage: 1800, surge: 3, category: 'heavy-duty', icon: 'AirVent', isHeavyDuty: true, soloOnly: true },
  { id: 'refrigerator', name: 'Refrigerator', wattage: 500, surge: 3, category: 'heavy-duty', icon: 'Refrigerator', isHeavyDuty: true, soloOnly: false },
  { id: 'freezer', name: 'Deep Freezer', wattage: 600, surge: 3, category: 'heavy-duty', icon: 'Snowflake', isHeavyDuty: true, soloOnly: false },
  { id: 'microwave', name: 'Microwave Oven', wattage: 1200, surge: 2, category: 'heavy-duty', icon: 'Microwave', isHeavyDuty: true, soloOnly: false },
  { id: 'electric_kettle', name: 'Electric Kettle', wattage: 1500, surge: 1, category: 'heavy-duty', icon: 'Coffee', isHeavyDuty: true, soloOnly: true },
  { id: 'washing_machine', name: 'Washing Machine', wattage: 700, surge: 3, category: 'heavy-duty', icon: 'WashingMachine', isHeavyDuty: true, soloOnly: false },
  { id: 'iron', name: 'Electric Iron', wattage: 1200, surge: 1, category: 'heavy-duty', icon: 'Shirt', isHeavyDuty: true, soloOnly: true },
  { id: 'water_pump', name: 'Water Pump (1HP)', wattage: 750, surge: 3, category: 'heavy-duty', icon: 'Droplets', isHeavyDuty: true, soloOnly: true },
  { id: 'space_heater', name: 'Space Heater', wattage: 1500, surge: 1, category: 'heavy-duty', icon: 'Flame', isHeavyDuty: true, soloOnly: true },
  { id: 'toaster', name: 'Toaster', wattage: 800, surge: 1, category: 'heavy-duty', icon: 'Cookie', isHeavyDuty: true, soloOnly: false },
  { id: 'vacuum', name: 'Vacuum Cleaner', wattage: 1000, surge: 2, category: 'heavy-duty', icon: 'Wind', isHeavyDuty: true, soloOnly: false },
];

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
