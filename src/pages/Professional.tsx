import { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Battery, Sun, Zap, Settings2, Info, Calculator, RotateCcw, Download, Share2, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

type ConnectionType = 'series' | 'parallel' | 'series-parallel';

const STANDARD_MCB_SIZES = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160];
const STANDARD_CABLE_SIZES = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95];

// Cable current capacity (approximate for copper, PVC insulated)
const CABLE_CURRENT_RATINGS: [number, number][] = [
  [1.5, 15], [2.5, 21], [4, 28], [6, 36], [10, 50],
  [16, 68], [25, 89], [35, 110], [50, 133], [70, 171], [95, 207],
];

function nextMcbSize(current: number): number {
  const rated = current * 1.25;
  return STANDARD_MCB_SIZES.find(s => s >= rated) || STANDARD_MCB_SIZES[STANDARD_MCB_SIZES.length - 1];
}

function cableSizeForCurrent(current: number): number {
  const needed = current * 1.25;
  const match = CABLE_CURRENT_RATINGS.find(([, rating]) => rating >= needed);
  return match ? match[0] : CABLE_CURRENT_RATINGS[CABLE_CURRENT_RATINGS.length - 1][0];
}

interface ProtectionSizing {
  dcMcbPanelToCC: number;
  dcMcbCCToBattery: number;
  acMcbInverterToLoad: number;
  dcBreakerBatteryToInverter: number;
  spdRating: string;
  earthWire: number;
  isolatorSwitch: string;
  cablePanelToCC: number;
  cableCCToBattery: number;
  cableBatteryToInverter: number;
  cableInverterToLoad: number;
}

interface CalculationResults {
  minBatteries: number;
  batteryBankVoltage: number;
  batteryBankAh: number;
  totalPanels: number;
  panelArrayVoltage: number;
  panelArrayWattage: number;
  dailyEnergyProduction: number;
  recommendedChargeController: number;
  protection: ProtectionSizing;
}

interface ProfessionalState {
  solarLoad: string;
  backupLoad: string;
  systemVoltage: string;
  backupHours: string;
  batteryVoltage: string;
  batteryAh: string;
  batteryConnection: ConnectionType;
  solarHours: string;
  panelWattage: string;
  panelVoltage: string;
  panelConnection: ConnectionType;
  showResults: boolean;
}

const STORAGE_KEY = 'professionalCalculatorState';

const loadPersistedState = (): ProfessionalState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Migration: if old state has loadSize, map it to both fields
      if (parsed.loadSize && !parsed.solarLoad) {
        parsed.solarLoad = parsed.loadSize;
        parsed.backupLoad = parsed.loadSize;
        delete parsed.loadSize;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load professional state:', e);
  }
  return null;
};

const saveState = (state: ProfessionalState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save professional state:', e);
  }
};

const Professional = () => {
  const navigate = useNavigate();
  const persistedState = loadPersistedState();

  // Dual load inputs
  const [solarLoad, setSolarLoad] = useState<string>(persistedState?.solarLoad || '');
  const [backupLoad, setBackupLoad] = useState<string>(persistedState?.backupLoad || '');
  const [systemVoltage, setSystemVoltage] = useState<string>(persistedState?.systemVoltage || '24');
  const [backupHours, setBackupHours] = useState<string>(persistedState?.backupHours || '4');

  // Battery inputs
  const [batteryVoltage, setBatteryVoltage] = useState<string>(persistedState?.batteryVoltage || '12');
  const [batteryAh, setBatteryAh] = useState<string>(persistedState?.batteryAh || '200');
  const [batteryConnection, setBatteryConnection] = useState<ConnectionType>(persistedState?.batteryConnection || 'series');

  // Solar inputs
  const [solarHours, setSolarHours] = useState<string>(persistedState?.solarHours || '5');
  const [panelWattage, setPanelWattage] = useState<string>(persistedState?.panelWattage || '450');
  const [panelVoltage, setPanelVoltage] = useState<string>(persistedState?.panelVoltage || '40');
  const [panelConnection, setPanelConnection] = useState<ConnectionType>(persistedState?.panelConnection || 'series');

  const [showResults, setShowResults] = useState(persistedState?.showResults || false);

  // Persist state on changes
  useEffect(() => {
    const state: ProfessionalState = {
      solarLoad,
      backupLoad,
      systemVoltage,
      backupHours,
      batteryVoltage,
      batteryAh,
      batteryConnection,
      solarHours,
      panelWattage,
      panelVoltage,
      panelConnection,
      showResults,
    };
    saveState(state);
  }, [solarLoad, backupLoad, systemVoltage, backupHours, batteryVoltage, batteryAh, batteryConnection, solarHours, panelWattage, panelVoltage, panelConnection, showResults]);

  const calculations = useMemo((): CalculationResults | null => {
    const sLoad = parseFloat(solarLoad);
    const bLoad = parseFloat(backupLoad);
    const sysVolt = parseFloat(systemVoltage);
    const backup = parseFloat(backupHours);
    const batVolt = parseFloat(batteryVoltage);
    const batAh = parseFloat(batteryAh);
    const sunHours = parseFloat(solarHours);
    const pnlWatt = parseFloat(panelWattage);
    const pnlVolt = parseFloat(panelVoltage);

    if (!sLoad || !bLoad || !sysVolt || !backup || !batVolt || !batAh || !sunHours || !pnlWatt || !pnlVolt) {
      return null;
    }

    // Battery sizing based on backup load
    const energyNeeded = bLoad * backup; // Wh
    const dod = 1.0;
    const usableEnergy = energyNeeded / dod;

    const batteriesInSeries = sysVolt / batVolt;
    const batteryBankWh = batVolt * batAh;
    const parallelStrings = Math.ceil(usableEnergy / (batteryBankWh * batteriesInSeries));
    const minBatteries = batteriesInSeries * parallelStrings;

    // Solar panel sizing: must power solar load during day AND charge batteries for backup
    const dailySolarConsumption = sLoad * sunHours;
    const dailyBackupEnergy = bLoad * backup;
    const totalDailyEnergy = (dailySolarConsumption + dailyBackupEnergy) * 1.2; // 20% overhead
    const panelsNeeded = Math.ceil(totalDailyEnergy / (pnlWatt * sunHours));

    // Panel array configuration
    let panelArrayVoltage = pnlVolt;
    const panelArrayWattage = pnlWatt * panelsNeeded;

    if (panelConnection === 'series') {
      panelArrayVoltage = pnlVolt * panelsNeeded;
    } else if (panelConnection === 'parallel') {
      panelArrayVoltage = pnlVolt;
    } else {
      panelArrayVoltage = pnlVolt * 2;
    }

    const dailyEnergyProduction = pnlWatt * panelsNeeded * sunHours;

    // Charge controller sizing (25% safety margin)
    const maxCurrent = (pnlWatt * panelsNeeded) / sysVolt;
    const recommendedChargeController = Math.ceil(maxCurrent * 1.25 / 10) * 10;

    // --- Protection & Breaker Sizing ---
    // All protection sizes derived from the max load at the appropriate voltage
    const maxLoad = Math.max(sLoad, bLoad);

    // DC side currents (load referred to DC system voltage)
    const dcLoadCurrent = maxLoad / sysVolt;

    // DC MCB: Panel → Charge Controller (same current as DC load side)
    const dcMcbPanelToCC = nextMcbSize(dcLoadCurrent);
    // DC MCB: Charge Controller → Battery
    const dcMcbCCToBattery = nextMcbSize(dcLoadCurrent);
    // DC Breaker: Battery → Inverter
    const dcBreakerBatteryToInverter = nextMcbSize(dcLoadCurrent);

    // AC side (230V output)
    const acLoadCurrent = maxLoad / 230;
    const acMcbInverterToLoad = nextMcbSize(acLoadCurrent);

    // SPD rating based on array open circuit voltage (Voc ≈ Vmp × 1.2)
    const arrayVoc = panelConnection === 'series' ? pnlVolt * 1.2 * panelsNeeded :
      panelConnection === 'series-parallel' ? pnlVolt * 1.2 * Math.ceil(panelsNeeded / 2) :
        pnlVolt * 1.2;
    const spdRating = `Type 2 DC SPD, ${Math.ceil(arrayVoc / 100) * 100}V rated`;

    // Earth wire: 16mm² standard for solar installations
    const earthWire = 16;

    // Isolator switch
    const isolatorSwitch = `DC Isolator ${Math.ceil(arrayVoc / 100) * 100}V / ${nextMcbSize(dcLoadCurrent)}A`;

    // Cable sizing (all based on max load current at respective voltage)
    const cablePanelToCC = cableSizeForCurrent(dcLoadCurrent);
    const cableCCToBattery = cableSizeForCurrent(dcLoadCurrent);
    const cableBatteryToInverter = cableSizeForCurrent(dcLoadCurrent);
    const cableInverterToLoad = cableSizeForCurrent(acLoadCurrent);

    return {
      minBatteries: Math.ceil(minBatteries),
      batteryBankVoltage: sysVolt,
      batteryBankAh: batAh * parallelStrings,
      totalPanels: panelsNeeded,
      panelArrayVoltage: Math.round(panelArrayVoltage),
      panelArrayWattage,
      dailyEnergyProduction: Math.round(dailyEnergyProduction),
      recommendedChargeController,
      protection: {
        dcMcbPanelToCC,
        dcMcbCCToBattery,
        acMcbInverterToLoad,
        dcBreakerBatteryToInverter,
        spdRating,
        earthWire,
        isolatorSwitch,
        cablePanelToCC,
        cableCCToBattery,
        cableBatteryToInverter,
        cableInverterToLoad,
      },
    };
  }, [solarLoad, backupLoad, systemVoltage, backupHours, batteryVoltage, batteryAh, batteryConnection, solarHours, panelWattage, panelVoltage, panelConnection]);

  const handleCalculate = () => {
    if (calculations) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setSolarLoad('');
    setBackupLoad('');
    setSystemVoltage('24');
    setBackupHours('4');
    setBatteryVoltage('12');
    setBatteryAh('200');
    setBatteryConnection('series');
    setSolarHours('5');
    setPanelWattage('450');
    setPanelVoltage('40');
    setPanelConnection('series');
    setShowResults(false);
    localStorage.removeItem(STORAGE_KEY);
  };

  const handleDownload = () => {
    if (!calculations) return;

    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const p = calculations.protection;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Professional Solar System Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { margin: 20mm; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #1a1a2e;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header { 
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 3px solid #FB8500;
    }
    .header h1 { font-size: 28px; color: #1a1a2e; margin: 0; }
    .header .date { color: #666; font-size: 14px; text-align: right; }
    .section { margin-bottom: 30px; }
    .section-title { 
      font-size: 18px; font-weight: 600; color: #FB8500;
      margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #e0e0e0;
    }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px; }
    .stat-card { background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center; }
    .stat-card.highlight { background: #FB8500 !important; color: white !important; }
    .stat-card.highlight .stat-label, .stat-card.highlight .stat-value, .stat-card.highlight .stat-unit { color: white !important; }
    .stat-label { font-size: 12px; text-transform: uppercase; opacity: 0.8; margin-bottom: 4px; }
    .stat-value { font-size: 24px; font-weight: 700; }
    .stat-unit { font-size: 14px; opacity: 0.8; }
    .config-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    .config-table th, .config-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e0e0e0; }
    .config-table th { background: #f8f9fa; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #666; }
    .notes-box { background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin: 10px 0; border-radius: 0 8px 8px 0; }
    .list-item { margin: 8px 0; padding-left: 15px; position: relative; font-size: 13px; }
    .list-item::before { content: "•"; position: absolute; left: 0; }
    .disclaimer { margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666; }
    .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Professional Solar System Report</h1>
    <p class="date">Generated on ${date}</p>
  </div>

  <div class="section">
    <div class="section-title">System Configuration</div>
    <table class="config-table">
      <tr><th>Parameter</th><th>Value</th></tr>
      <tr><td>Load During Solar Hours</td><td>${solarLoad}W</td></tr>
      <tr><td>Load During Backup Hours</td><td>${backupLoad}W</td></tr>
      <tr><td>System Voltage</td><td>${systemVoltage}V</td></tr>
      <tr><td>Backup Hours</td><td>${backupHours} hours</td></tr>
      <tr><td>Battery Voltage</td><td>${batteryVoltage}V</td></tr>
      <tr><td>Battery Capacity</td><td>${batteryAh}Ah</td></tr>
      <tr><td>Battery Connection</td><td>${batteryConnection}</td></tr>
      <tr><td>Solar Hours/Day</td><td>${solarHours} hours</td></tr>
      <tr><td>Panel Wattage</td><td>${panelWattage}W</td></tr>
      <tr><td>Panel Vmp</td><td>${panelVoltage}V</td></tr>
      <tr><td>Panel Connection</td><td>${panelConnection}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Calculation Results</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Minimum Batteries</div>
        <div class="stat-value">${calculations.minBatteries}</div>
        <div class="stat-unit">${calculations.batteryBankVoltage}V / ${calculations.batteryBankAh}Ah bank</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Solar Panels Needed</div>
        <div class="stat-value">${calculations.totalPanels}</div>
        <div class="stat-unit">${calculations.panelArrayWattage}W array</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Daily Production</div>
        <div class="stat-value">${calculations.dailyEnergyProduction}</div>
        <div class="stat-unit">Wh per day</div>
      </div>
      <div class="stat-card highlight">
        <div class="stat-label">Charge Controller</div>
        <div class="stat-value">${calculations.recommendedChargeController}A</div>
        <div class="stat-unit">MPPT recommended</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Protection & Breaker Sizing</div>
    <table class="config-table">
      <tr><th>Component</th><th>Size</th></tr>
      <tr><td>DC MCB (Panel → Charge Controller)</td><td>${p.dcMcbPanelToCC}A</td></tr>
      <tr><td>DC MCB (Charge Controller → Battery)</td><td>${p.dcMcbCCToBattery}A</td></tr>
      <tr><td>DC Breaker (Battery → Inverter)</td><td>${p.dcBreakerBatteryToInverter}A</td></tr>
      <tr><td>AC MCB (Inverter → Load)</td><td>${p.acMcbInverterToLoad}A</td></tr>
      <tr><td>Surge Protection Device (SPD)</td><td>${p.spdRating}</td></tr>
      <tr><td>Earth Wire</td><td>${p.earthWire}mm² copper</td></tr>
      <tr><td>DC Isolator Switch</td><td>${p.isolatorSwitch}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Cable Sizing</div>
    <table class="config-table">
      <tr><th>Run</th><th>Size (mm²)</th></tr>
      <tr><td>Panel → Charge Controller</td><td>${p.cablePanelToCC}mm²</td></tr>
      <tr><td>Charge Controller → Battery</td><td>${p.cableCCToBattery}mm²</td></tr>
      <tr><td>Battery → Inverter</td><td>${p.cableBatteryToInverter}mm²</td></tr>
      <tr><td>Inverter → Load</td><td>${p.cableInverterToLoad}mm²</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Important Notes</div>
    <div class="notes-box">
      <div class="list-item">20% solar production overhead is included for real-world conditions</div>
      <div class="list-item">Cable sizes are minimum recommendations — increase for long cable runs</div>
      <div class="list-item">Always consult a qualified engineer for final system design</div>
    </div>
  </div>

  <div class="disclaimer">
    <strong>Disclaimer:</strong> This report provides estimates for planning purposes only. 
    Actual system performance may vary based on installation, weather, and equipment quality.
    Consult with a qualified solar installer for professional sizing recommendations.
  </div>

  <div class="footer">InverterSize.com - Professional Solar System Calculator</div>
</body>
</html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        URL.revokeObjectURL(url);
        printWindow.print();
      };
    }
  };

  const handleShare = async () => {
    if (!calculations) return;

    const p = calculations.protection;
    const shareText = `Professional Solar System Report

Configuration:
• Solar Load: ${solarLoad}W | Backup Load: ${backupLoad}W
• System: ${systemVoltage}V | Backup: ${backupHours}h
• Battery: ${batteryVoltage}V ${batteryAh}Ah (${batteryConnection})
• Solar: ${panelWattage}W panels @ ${solarHours}h/day (${panelConnection})

Results:
• Batteries: ${calculations.minBatteries} (${calculations.batteryBankVoltage}V/${calculations.batteryBankAh}Ah)
• Solar panels: ${calculations.totalPanels} (${calculations.panelArrayWattage}W)
• Daily production: ${calculations.dailyEnergyProduction} Wh
• Charge controller: ${calculations.recommendedChargeController}A MPPT

Protection:
• DC MCB Panel→CC: ${p.dcMcbPanelToCC}A
• DC MCB CC→Bat: ${p.dcMcbCCToBattery}A
• DC Breaker Bat→Inv: ${p.dcBreakerBatteryToInverter}A
• AC MCB Inv→Load: ${p.acMcbInverterToLoad}A

Generated with InverterSize.com`;

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Professional Solar System Report', text: shareText });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          copyToClipboard(shareText);
        }
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Report copied to clipboard!');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getConnectionDescription = (type: ConnectionType, component: 'battery' | 'panel') => {
    const descriptions = {
      battery: {
        series: 'Batteries connected in series increase voltage while maintaining the same Ah capacity.',
        parallel: 'Batteries connected in parallel increase Ah capacity while maintaining the same voltage.',
        'series-parallel': 'Combination of series and parallel connections for both higher voltage and capacity.',
      },
      panel: {
        series: 'Panels in series increase voltage (Vmp adds up). Good for MPPT controllers.',
        parallel: 'Panels in parallel increase current while maintaining voltage. Good for PWM controllers.',
        'series-parallel': 'Mixed configuration for optimal voltage and current balance.',
      },
    };
    return descriptions[component][type];
  };

  return (
    <>
      <Helmet>
        <title>Professional Calculator - InverterSize</title>
        <meta 
          name="description" 
          content="Professional solar system calculator. Configure inverter size, battery banks, and solar panel arrays with precise calculations." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2 mb-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="text-center space-y-2">
                <Badge variant="secondary" className="mb-2">
                  <Settings2 className="h-3 w-3 mr-1" />
                  Professional Mode
                </Badge>
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Professional System Calculator
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Configure your solar power system with precise calculations for batteries, panels, charge controllers, and protection devices.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Load Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Load Configuration
                  </CardTitle>
                  <CardDescription>Set your load for solar and backup hours</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="solarLoad">Load During Solar Hours (Watts)</Label>
                    <Input
                      id="solarLoad"
                      type="number"
                      placeholder="e.g., 2000"
                      value={solarLoad}
                      onChange={(e) => setSolarLoad(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground flex items-start gap-1">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      Total wattage consumed when solar panels are generating power.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backupLoad">Load During Backup Hours (Watts)</Label>
                    <Input
                      id="backupLoad"
                      type="number"
                      placeholder="e.g., 1500"
                      value={backupLoad}
                      onChange={(e) => setBackupLoad(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground flex items-start gap-1">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      Total wattage consumed from battery when there is no solar (night/cloudy).
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemVoltage">System Voltage (V)</Label>
                    <Select value={systemVoltage} onValueChange={setSystemVoltage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12V</SelectItem>
                        <SelectItem value="24">24V</SelectItem>
                        <SelectItem value="48">48V</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backupHours">Desired Backup Hours</Label>
                    <Input
                      id="backupHours"
                      type="number"
                      placeholder="e.g., 4"
                      value={backupHours}
                      onChange={(e) => setBackupHours(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Battery Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Battery className="h-5 w-5 text-primary" />
                    Battery Configuration
                  </CardTitle>
                  <CardDescription>Configure your battery bank</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="batteryVoltage">Battery Voltage (V)</Label>
                    <Select value={batteryVoltage} onValueChange={setBatteryVoltage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6V</SelectItem>
                        <SelectItem value="12">12V</SelectItem>
                        <SelectItem value="24">24V (LiFePO4)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batteryAh">Battery Capacity (Ah)</Label>
                    <Input
                      id="batteryAh"
                      type="number"
                      placeholder="e.g., 200"
                      value={batteryAh}
                      onChange={(e) => setBatteryAh(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batteryConnection">Connection Configuration</Label>
                    <Select value={batteryConnection} onValueChange={(v) => setBatteryConnection(v as ConnectionType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="series">Series</SelectItem>
                        <SelectItem value="parallel">Parallel</SelectItem>
                        <SelectItem value="series-parallel">Series-Parallel</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground flex items-start gap-1">
                      <Info className="h-3 w-3 mt-0.5 shrink-0" />
                      {getConnectionDescription(batteryConnection, 'battery')}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Solar Panel Configuration */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sun className="h-5 w-5 text-primary" />
                    Solar Panel Configuration
                  </CardTitle>
                  <CardDescription>Configure your solar array</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="solarHours">Average Solar Hours/Day</Label>
                      <Input
                        id="solarHours"
                        type="number"
                        placeholder="e.g., 5"
                        value={solarHours}
                        onChange={(e) => setSolarHours(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="panelWattage">Panel Wattage (W)</Label>
                      <Input
                        id="panelWattage"
                        type="number"
                        placeholder="e.g., 450"
                        value={panelWattage}
                        onChange={(e) => setPanelWattage(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="panelVoltage">Panel Vmp (V)</Label>
                      <Input
                        id="panelVoltage"
                        type="number"
                        placeholder="e.g., 40"
                        value={panelVoltage}
                        onChange={(e) => setPanelVoltage(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="panelConnection">Panel Connection</Label>
                      <Select value={panelConnection} onValueChange={(v) => setPanelConnection(v as ConnectionType)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="series">Series</SelectItem>
                          <SelectItem value="parallel">Parallel</SelectItem>
                          <SelectItem value="series-parallel">Series-Parallel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-start gap-1 mt-3">
                    <Info className="h-3 w-3 mt-0.5 shrink-0" />
                    {getConnectionDescription(panelConnection, 'panel')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button size="lg" onClick={handleCalculate} disabled={!calculations} className="gap-2">
                <Calculator className="h-4 w-4" />
                Calculate System
              </Button>
              <Button size="lg" variant="outline" onClick={handleReset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>

            {/* Results */}
            {showResults && calculations && (
              <div className="space-y-6">
                <Card className="border-primary/50 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-primary">Calculation Results</CardTitle>
                    <CardDescription>Based on your configuration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-background rounded-lg p-4 border">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Battery className="h-4 w-4" />
                          Minimum Batteries
                        </div>
                        <div className="text-2xl font-bold text-foreground">{calculations.minBatteries}</div>
                        <div className="text-xs text-muted-foreground">
                          {calculations.batteryBankVoltage}V / {calculations.batteryBankAh}Ah bank
                        </div>
                      </div>

                      <div className="bg-background rounded-lg p-4 border">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Sun className="h-4 w-4" />
                          Solar Panels Needed
                        </div>
                        <div className="text-2xl font-bold text-foreground">{calculations.totalPanels}</div>
                        <div className="text-xs text-muted-foreground">
                          {calculations.panelArrayWattage}W array
                        </div>
                      </div>

                      <div className="bg-background rounded-lg p-4 border">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Zap className="h-4 w-4" />
                          Daily Production
                        </div>
                        <div className="text-2xl font-bold text-foreground">{calculations.dailyEnergyProduction}</div>
                        <div className="text-xs text-muted-foreground">Wh per day</div>
                      </div>

                      <div className="bg-background rounded-lg p-4 border">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
                          <Settings2 className="h-4 w-4" />
                          Charge Controller
                        </div>
                        <div className="text-2xl font-bold text-foreground">{calculations.recommendedChargeController}A</div>
                        <div className="text-xs text-muted-foreground">MPPT recommended</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Protection & Breaker Sizing */}
                <Card className="border-warning/50 bg-warning/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-warning">
                      <Shield className="h-5 w-5" />
                      Protection & Breaker Sizing
                    </CardTitle>
                    <CardDescription>Circuit breakers, surge protection, and cable sizes</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Breakers */}
                    <div>
                      <h4 className="font-medium text-sm mb-3 text-foreground">Circuit Breakers (MCB)</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">DC MCB: Panel → Charge Controller</div>
                          <div className="text-lg font-bold text-foreground">{calculations.protection.dcMcbPanelToCC}A</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">DC MCB: Charge Controller → Battery</div>
                          <div className="text-lg font-bold text-foreground">{calculations.protection.dcMcbCCToBattery}A</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">DC Breaker: Battery → Inverter</div>
                          <div className="text-lg font-bold text-foreground">{calculations.protection.dcBreakerBatteryToInverter}A</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">AC MCB: Inverter → Load</div>
                          <div className="text-lg font-bold text-foreground">{calculations.protection.acMcbInverterToLoad}A</div>
                        </div>
                      </div>
                    </div>

                    {/* Protection Devices */}
                    <div>
                      <h4 className="font-medium text-sm mb-3 text-foreground">Protection Devices</h4>
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">SPD / Lightning Arrestor</div>
                          <div className="text-sm font-bold text-foreground">{calculations.protection.spdRating}</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">Earth Wire</div>
                          <div className="text-sm font-bold text-foreground">{calculations.protection.earthWire}mm² copper + earth rod</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">DC Isolator Switch</div>
                          <div className="text-sm font-bold text-foreground">{calculations.protection.isolatorSwitch}</div>
                        </div>
                      </div>
                    </div>

                    {/* Cable Sizing */}
                    <div>
                      <h4 className="font-medium text-sm mb-3 text-foreground">Cable Sizing (Minimum)</h4>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">Panel → Charge Controller</div>
                          <div className="text-lg font-bold text-foreground">{calculations.protection.cablePanelToCC}mm²</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">Charge Controller → Battery</div>
                          <div className="text-lg font-bold text-foreground">{calculations.protection.cableCCToBattery}mm²</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">Battery → Inverter</div>
                          <div className="text-lg font-bold text-foreground">{calculations.protection.cableBatteryToInverter}mm²</div>
                        </div>
                        <div className="bg-background rounded-lg p-3 border">
                          <div className="text-xs text-muted-foreground mb-1">Inverter → Load</div>
                          <div className="text-lg font-bold text-foreground">{calculations.protection.cableInverterToLoad}mm²</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions & Notes */}
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-3 justify-center mb-4">
                      <Button onClick={handleDownload} className="gap-2">
                        <Download className="h-4 w-4" />
                        Download Report
                      </Button>
                      <Button variant="outline" onClick={handleShare} className="gap-2">
                        <Share2 className="h-4 w-4" />
                        Share Report
                      </Button>
                    </div>

                    <div className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4 text-primary" />
                        Important Notes
                      </h4>
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                        <li>20% solar production overhead is included for real-world conditions</li>
                        <li>Cable sizes are minimum recommendations — increase for long cable runs</li>
                        <li>MCB ratings include 25% safety margin above calculated current</li>
                        <li>Always consult a qualified engineer for final system design</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Professional;
