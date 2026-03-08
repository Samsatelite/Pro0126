import { useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { ApplianceSelector } from "@/components/ApplianceSelector";
import { BatteryConfig } from "@/components/BatteryConfig";
import { CalculationResults } from "@/components/CalculationResults";
import {
  APPLIANCES,
  getRecommendedInverterSize,
  calculateBackupTime,
} from "@/data/appliances";
import { toast } from "sonner";

export default function Index() {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [voltage, setVoltage] = useState("24V");
  const [capacity, setCapacity] = useState("200Ah");
  const [numBatteries, setNumBatteries] = useState(2);
  const [dod, setDod] = useState(80);

  const handleChange = (name: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [name]: qty }));
  };

  const { totalLoad, peakSurge } = useMemo(() => {
    let load = 0;
    let surge = 0;
    for (const appliance of APPLIANCES) {
      const qty = quantities[appliance.name] ?? 0;
      if (qty > 0) {
        load += appliance.watts * qty;
        surge += appliance.watts * (appliance.surge ?? 1) * qty;
      }
    }
    return { totalLoad: load, peakSurge: surge };
  }, [quantities]);

  const inverterSize = useMemo(() => getRecommendedInverterSize(totalLoad), [totalLoad]);
  const backupTime = useMemo(
    () => calculateBackupTime(totalLoad, voltage, capacity, numBatteries, dod),
    [totalLoad, voltage, capacity, numBatteries, dod]
  );

  const handleReset = () => {
    setQuantities({});
    toast.success("Calculator reset");
  };

  const handleDownload = () => {
    // Generate a simple text-based summary for download
    const lines = ["Solar Load Calculator Report", "===========================", ""];
    for (const appliance of APPLIANCES) {
      const qty = quantities[appliance.name] ?? 0;
      if (qty > 0) {
        lines.push(`${appliance.name}: ${qty} × ${appliance.watts}W = ${qty * appliance.watts}W`);
      }
    }
    lines.push("");
    lines.push(`Total Load: ${totalLoad}W`);
    lines.push(`Peak Surge: ${peakSurge}W`);
    lines.push(`Recommended Inverter: ${inverterSize} kVA`);
    lines.push(`Battery: ${voltage} ${capacity} × ${numBatteries} (${dod}% DoD)`);
    lines.push(`Backup Time: ${backupTime} hours`);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inverter-sizing-report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <ApplianceSelector quantities={quantities} onChange={handleChange} />
          <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <BatteryConfig
              voltage={voltage}
              capacity={capacity}
              numBatteries={numBatteries}
              dod={dod}
              onVoltageChange={setVoltage}
              onCapacityChange={setCapacity}
              onNumBatteriesChange={setNumBatteries}
              onDodChange={setDod}
            />
            <CalculationResults
              totalLoad={totalLoad}
              peakSurge={peakSurge}
              inverterSize={inverterSize}
              backupTime={backupTime}
              onReset={handleReset}
              onDownload={handleDownload}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
