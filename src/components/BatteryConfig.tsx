import { Battery, RefreshCw } from "lucide-react";
import { BATTERY_VOLTAGES, BATTERY_CAPACITIES, calculateUsableEnergy } from "@/data/appliances";

interface BatteryConfigProps {
  voltage: string;
  capacity: string;
  numBatteries: number;
  dod: number;
  onVoltageChange: (v: string) => void;
  onCapacityChange: (c: string) => void;
  onNumBatteriesChange: (n: number) => void;
  onDodChange: (d: number) => void;
}

export function BatteryConfig({
  voltage,
  capacity,
  numBatteries,
  dod,
  onVoltageChange,
  onCapacityChange,
  onNumBatteriesChange,
  onDodChange,
}: BatteryConfigProps) {
  const usableEnergy = calculateUsableEnergy(voltage, capacity, numBatteries, dod);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2 mb-5">
        <Battery className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-foreground">Battery Configuration</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Bank Voltage</label>
          <select
            value={voltage}
            onChange={(e) => onVoltageChange(e.target.value)}
            className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {BATTERY_VOLTAGES.map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted-foreground mb-1.5">Capacity (Ah)</label>
          <select
            value={capacity}
            onChange={(e) => onCapacityChange(e.target.value)}
            className="w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {BATTERY_CAPACITIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-muted-foreground">Number of Batteries</label>
          <span className="text-sm font-bold text-primary">{numBatteries}</span>
        </div>
        <input
          type="range"
          min={1}
          max={8}
          value={numBatteries}
          onChange={(e) => onNumBatteriesChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-muted-foreground">Depth of Discharge</label>
          <span className="text-sm font-bold text-primary">{dod}%</span>
        </div>
        <input
          type="range"
          min={50}
          max={100}
          step={5}
          value={dod}
          onChange={(e) => onDodChange(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Usable Energy</span>
        </div>
        <span className="text-lg font-bold text-primary">{usableEnergy} kWh</span>
      </div>
    </div>
  );
}
