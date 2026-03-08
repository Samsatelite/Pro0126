export interface Appliance {
  name: string;
  watts: number;
  surge?: number;
  category: string;
  icon: string;
}

export const APPLIANCE_CATEGORIES = [
  { key: "cooling", label: "Cooling & Heating", icon: "Thermometer" },
  { key: "kitchen", label: "Kitchen", icon: "ChefHat" },
  { key: "entertainment", label: "Entertainment", icon: "Tv" },
  { key: "lighting", label: "Lighting", icon: "Lightbulb" },
  { key: "office", label: "Office & Work", icon: "Monitor" },
  { key: "utilities", label: "Utilities", icon: "Wrench" },
] as const;

export const APPLIANCES: Appliance[] = [
  // Cooling & Heating
  { name: "Air Conditioner 1 HP", watts: 900, surge: 3, category: "cooling", icon: "Wind" },
  { name: "Air Conditioner 1.5 HP", watts: 1200, surge: 3, category: "cooling", icon: "Wind" },
  { name: "Air Conditioner 2 HP", watts: 1800, surge: 3, category: "cooling", icon: "Wind" },
  { name: "Ceiling Fan", watts: 75, surge: 1.5, category: "cooling", icon: "Fan" },
  { name: "Standing Fan", watts: 55, surge: 1.5, category: "cooling", icon: "Fan" },
  { name: "Space Heater", watts: 1500, category: "cooling", icon: "Flame" },

  // Kitchen
  { name: "Refrigerator", watts: 150, surge: 3, category: "kitchen", icon: "Refrigerator" },
  { name: "Deep Freezer", watts: 200, surge: 3, category: "kitchen", icon: "Snowflake" },
  { name: "Microwave Oven", watts: 1200, surge: 2, category: "kitchen", icon: "Microwave" },
  { name: "Electric Kettle", watts: 1500, category: "kitchen", icon: "Coffee" },
  { name: "Blender", watts: 400, surge: 3, category: "kitchen", icon: "Blend" },
  { name: "Toaster", watts: 800, category: "kitchen", icon: "Sandwich" },

  // Entertainment
  { name: 'LED TV 32"', watts: 50, category: "entertainment", icon: "Tv" },
  { name: 'LED TV 55"', watts: 120, category: "entertainment", icon: "Tv" },
  { name: "Sound System", watts: 100, surge: 1.5, category: "entertainment", icon: "Speaker" },
  { name: "Gaming Console", watts: 200, category: "entertainment", icon: "Gamepad2" },
  { name: "Cable/Satellite Decoder", watts: 25, category: "entertainment", icon: "Radio" },

  // Lighting
  { name: "LED Bulb (9W)", watts: 9, category: "lighting", icon: "Lightbulb" },
  { name: "Fluorescent Tube", watts: 40, surge: 1.2, category: "lighting", icon: "Lamp" },
  { name: "Outdoor Light", watts: 60, category: "lighting", icon: "LampDesk" },

  // Office & Work
  { name: "Laptop", watts: 65, category: "office", icon: "Laptop" },
  { name: "Desktop Computer", watts: 250, surge: 1.5, category: "office", icon: "Monitor" },
  { name: "Printer", watts: 150, surge: 2, category: "office", icon: "Printer" },
  { name: "WiFi Router", watts: 15, category: "office", icon: "Wifi" },

  // Utilities
  { name: "Washing Machine", watts: 500, surge: 3, category: "utilities", icon: "WashingMachine" },
  { name: "Electric Iron", watts: 1200, category: "utilities", icon: "Shirt" },
  { name: "Water Pump (1HP)", watts: 750, surge: 3, category: "utilities", icon: "Droplets" },
  { name: "Vacuum Cleaner", watts: 1000, surge: 2, category: "utilities", icon: "Trash2" },
  { name: "Phone Charger", watts: 10, category: "utilities", icon: "Smartphone" },
];

export const BATTERY_VOLTAGES = ["12V", "24V", "48V"] as const;
export const BATTERY_CAPACITIES = ["100Ah", "150Ah", "200Ah", "250Ah", "300Ah"] as const;

export const INVERTER_SIZES = [1.5, 2.5, 3.5, 5, 7.5, 10, 15, 20];

export function getRecommendedInverterSize(totalWatts: number): number {
  const kva = totalWatts / 800; // 0.8 power factor
  for (const size of INVERTER_SIZES) {
    if (size >= kva) return size;
  }
  return INVERTER_SIZES[INVERTER_SIZES.length - 1];
}

export function calculateBackupTime(
  totalWatts: number,
  voltageStr: string,
  capacityStr: string,
  numBatteries: number,
  dod: number
): number {
  if (totalWatts === 0) return 0;
  const voltage = parseInt(voltageStr);
  const capacity = parseInt(capacityStr);
  const usableEnergy = voltage * capacity * numBatteries * (dod / 100);
  return Math.round((usableEnergy / totalWatts) * 10) / 10;
}

export function calculateUsableEnergy(
  voltageStr: string,
  capacityStr: string,
  numBatteries: number,
  dod: number
): number {
  const voltage = parseInt(voltageStr);
  const capacity = parseInt(capacityStr);
  return Math.round((voltage * capacity * numBatteries * (dod / 100)) / 100) / 10;
}
