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
import { Battery, Sun, Zap, Settings2, Info, Calculator, RotateCcw, Download, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';

type ConnectionType = 'series' | 'parallel' | 'series-parallel';

interface CalculationResults {
  minBatteries: number;
  batteryBankVoltage: number;
  batteryBankAh: number;
  totalPanels: number;
  panelArrayVoltage: number;
  panelArrayWattage: number;
  dailyEnergyProduction: number;
  recommendedChargeController: number;
}

interface ProfessionalState {
  inverterSize: string;
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
      return JSON.parse(stored);
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
  const persistedState = loadPersistedState();

  // Inverter inputs
  const [inverterSize, setInverterSize] = useState<string>(persistedState?.inverterSize || '');
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
      inverterSize,
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
  }, [inverterSize, systemVoltage, backupHours, batteryVoltage, batteryAh, batteryConnection, solarHours, panelWattage, panelVoltage, panelConnection, showResults]);

  const calculations = useMemo((): CalculationResults | null => {
    const invSize = parseFloat(inverterSize);
    const sysVolt = parseFloat(systemVoltage);
    const backup = parseFloat(backupHours);
    const batVolt = parseFloat(batteryVoltage);
    const batAh = parseFloat(batteryAh);
    const sunHours = parseFloat(solarHours);
    const pnlWatt = parseFloat(panelWattage);
    const pnlVolt = parseFloat(panelVoltage);

    if (!invSize || !sysVolt || !backup || !batVolt || !batAh || !sunHours || !pnlWatt || !pnlVolt) {
      return null;
    }

    // Convert kVA to watts (assuming 0.8 power factor)
    const inverterWatts = invSize * 1000 * 0.8;

    // Calculate energy needed for backup (Wh)
    const energyNeeded = inverterWatts * backup;

    // Account for inverter efficiency (90%) and depth of discharge (80%)
    const dod = 0.8; // Depth of discharge
    const efficiency = 0.9;
    const usableEnergy = energyNeeded / (dod * efficiency);

    // Calculate battery bank requirements
    const batteriesInSeries = sysVolt / batVolt;
    const batteryBankWh = batVolt * batAh;
    const totalBatteryWh = usableEnergy;
    const parallelStrings = Math.ceil(totalBatteryWh / (batteryBankWh * batteriesInSeries));
    const minBatteries = batteriesInSeries * parallelStrings;

    // Calculate solar panel requirements
    // Daily energy production should cover usage plus 20% for losses
    const dailyUsage = inverterWatts * 6; // Assume 6 hours of average daily use
    const requiredDailyProduction = dailyUsage * 1.2;
    const panelsNeeded = Math.ceil(requiredDailyProduction / (pnlWatt * sunHours));
    
    // Panel array configuration
    let panelArrayVoltage = pnlVolt;
    let panelArrayWattage = pnlWatt * panelsNeeded;
    
    if (panelConnection === 'series') {
      panelArrayVoltage = pnlVolt * panelsNeeded;
    } else if (panelConnection === 'parallel') {
      panelArrayVoltage = pnlVolt;
    } else {
      // Series-parallel: assume 2 in series
      panelArrayVoltage = pnlVolt * 2;
    }

    const dailyEnergyProduction = pnlWatt * panelsNeeded * sunHours;

    // Charge controller sizing (add 25% safety margin)
    const maxCurrent = (pnlWatt * panelsNeeded) / sysVolt;
    const recommendedChargeController = Math.ceil(maxCurrent * 1.25 / 10) * 10;

    return {
      minBatteries: Math.ceil(minBatteries),
      batteryBankVoltage: sysVolt,
      batteryBankAh: batAh * parallelStrings,
      totalPanels: panelsNeeded,
      panelArrayVoltage: Math.round(panelArrayVoltage),
      panelArrayWattage: panelArrayWattage,
      dailyEnergyProduction: Math.round(dailyEnergyProduction),
      recommendedChargeController,
    };
  }, [inverterSize, systemVoltage, backupHours, batteryVoltage, batteryAh, batteryConnection, solarHours, panelWattage, panelVoltage, panelConnection]);

  const handleCalculate = () => {
    if (calculations) {
      setShowResults(true);
    }
  };

  const handleReset = () => {
    setInverterSize('');
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
    .header h1 { 
      font-size: 28px; 
      color: #1a1a2e;
      margin: 0;
    }
    .header .date { 
      color: #666; 
      font-size: 14px;
      text-align: right;
    }
    .section { margin-bottom: 30px; }
    .section-title { 
      font-size: 18px;
      font-weight: 600;
      color: #FB8500;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #e0e0e0;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin-bottom: 25px;
    }
    .stat-card {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 15px;
      text-align: center;
    }
    .stat-card.highlight {
      background: #FB8500 !important;
      color: white !important;
    }
    .stat-card.highlight .stat-label,
    .stat-card.highlight .stat-value,
    .stat-card.highlight .stat-unit {
      color: white !important;
    }
    .stat-label { 
      font-size: 12px; 
      text-transform: uppercase;
      opacity: 0.8;
      margin-bottom: 4px;
    }
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
      <tr><td>Inverter Size</td><td>${inverterSize} kVA</td></tr>
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
    <div class="section-title">Important Notes</div>
    <div class="notes-box">
      <div class="list-item">Calculations assume 80% depth of discharge</div>
      <div class="list-item">90% inverter efficiency is factored into the calculations</div>
      <div class="list-item">20% solar production overhead is included for real-world conditions</div>
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

    const shareText = `Professional Solar System Report

Configuration:
• Inverter: ${inverterSize} kVA @ ${systemVoltage}V
• Backup: ${backupHours} hours
• Battery: ${batteryVoltage}V ${batteryAh}Ah (${batteryConnection})
• Solar: ${panelWattage}W panels @ ${solarHours}h/day (${panelConnection})

Results:
• Batteries needed: ${calculations.minBatteries} (${calculations.batteryBankVoltage}V/${calculations.batteryBankAh}Ah bank)
• Solar panels: ${calculations.totalPanels} (${calculations.panelArrayWattage}W array)
• Daily production: ${calculations.dailyEnergyProduction} Wh
• Charge controller: ${calculations.recommendedChargeController}A MPPT

Generated with InverterSize.com`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Professional Solar System Report',
          text: shareText,
        });
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
            <div className="text-center space-y-2">
              <Badge variant="secondary" className="mb-2">
                <Settings2 className="h-3 w-3 mr-1" />
                Professional Mode
              </Badge>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Professional System Calculator
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Configure your solar power system with precise calculations for batteries, panels, and charge controllers.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Inverter Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" />
                    Inverter Configuration
                  </CardTitle>
                  <CardDescription>Set your inverter specifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="inverterSize">Inverter Size (kVA)</Label>
                    <Input
                      id="inverterSize"
                      type="number"
                      placeholder="e.g., 5"
                      value={inverterSize}
                      onChange={(e) => setInverterSize(e.target.value)}
                    />
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

                  <Separator className="my-4" />

                  {/* Download & Share Buttons */}
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
                      <li>Calculations assume 80% depth of discharge for battery longevity</li>
                      <li>90% inverter efficiency is factored into the calculations</li>
                      <li>20% solar production overhead is included for real-world conditions</li>
                      <li>Always consult a qualified engineer for final system design</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default Professional;
