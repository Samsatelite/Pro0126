import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Download, Share2, Zap, Activity, AlertTriangle, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { downloadPDF } from '@/utils/pdfGenerator';
import { useToast } from '@/hooks/use-toast';

interface StoredSizingData {
  appliances: Array<{
    name: string;
    wattage: number;
    quantity: number;
    isHeavyDuty?: boolean;
    soloOnly?: boolean;
  }>;
  calculations: {
    totalLoad: number;
    peakSurge: number;
    requiredKva: number;
    recommendedInverter: number;
    warnings?: string[];
    recommendations?: string[];
  };
}

const ReportDetails = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [data, setData] = useState<StoredSizingData | null>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem('inverterSizingData');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      // Ensure warnings and recommendations exist
      if (!parsed.calculations.warnings) {
        parsed.calculations.warnings = [];
      }
      if (!parsed.calculations.recommendations) {
        parsed.calculations.recommendations = [];
      }
      setData(parsed);
    }
  }, []);

  const handleDownload = () => {
    if (!data) return;
    
    // Build full appliance objects for PDF generator
    const fullAppliances = data.appliances.map(a => ({
      id: a.name.toLowerCase().replace(/\s+/g, '-'),
      name: a.name,
      wattage: a.wattage,
      quantity: a.quantity,
      surge: 1,
      category: 'general',
      icon: 'Zap',
      isHeavyDuty: a.isHeavyDuty || false,
      soloOnly: a.soloOnly || false,
    }));

    downloadPDF({
      appliances: fullAppliances,
      calculations: {
        ...data.calculations,
        warnings: data.calculations.warnings || [],
        recommendations: data.calculations.recommendations || [],
      },
    });
  };

  const handleShare = async () => {
    const shareText = `Check out my inverter load report!\n\nTotal Load: ${data?.calculations.totalLoad}W\nRecommended Inverter: ${data?.calculations.recommendedInverter} kVA\n\nGenerated with InverterSize.com`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Inverter Load Report',
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        // User cancelled or share failed, fallback to copy
        copyToClipboard(shareText);
      }
    } else {
      copyToClipboard(shareText);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: 'Report details copied. Share it anywhere!',
    });
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">No report data found.</p>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const activeAppliances = data.appliances.filter(a => a.quantity > 0);

  return (
    <>
      <Helmet>
        <title>Inverter Load Report - InverterSize</title>
        <meta 
          name="description" 
          content="View your detailed inverter load report with recommendations and power requirements." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header with back button */}
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate('/')}
                className="shrink-0"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-display text-xl font-bold text-foreground">
                  Inverter Load Report
                </h1>
                <p className="text-xs text-muted-foreground">
                  Detailed power analysis
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="space-y-6">
            {/* Power Requirements Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Power Requirements Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-2">
                      <Zap className="h-4 w-4" />
                      Total Load
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {data.calculations.totalLoad.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Watts</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-2">
                      <Activity className="h-4 w-4" />
                      Peak Surge
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {data.calculations.peakSurge.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">Watts</div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-2">
                      <Zap className="h-4 w-4" />
                      Required
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      {data.calculations.requiredKva}
                    </div>
                    <div className="text-sm text-muted-foreground">kVA</div>
                  </div>
                  <div className="bg-primary rounded-lg p-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-primary-foreground/80 text-sm mb-2">
                      <Zap className="h-4 w-4" />
                      Recommended
                    </div>
                    <div className="text-2xl font-bold text-primary-foreground">
                      {data.calculations.recommendedInverter}
                    </div>
                    <div className="text-sm text-primary-foreground/80">kVA</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Selected Appliances */}
            <Card>
              <CardHeader>
                <CardTitle className="font-display text-lg">Selected Appliances</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Appliance</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Wattage</th>
                        <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Qty</th>
                        <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeAppliances.map((appliance, index) => (
                        <tr key={index} className="border-b border-border/50">
                          <td className="py-3 px-2">
                            <span className="text-sm text-foreground">{appliance.name}</span>
                            {appliance.isHeavyDuty && (
                              <span className="ml-2 text-xs bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded">
                                Heavy Duty
                              </span>
                            )}
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-muted-foreground">
                            {appliance.wattage}W
                          </td>
                          <td className="text-center py-3 px-2 text-sm text-muted-foreground">
                            {appliance.quantity}
                          </td>
                          <td className="text-right py-3 px-2 text-sm font-medium text-foreground">
                            {(appliance.wattage * appliance.quantity).toLocaleString()}W
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Warnings */}
            {data.calculations.warnings && data.calculations.warnings.length > 0 && (
              <Card className="border-warning/50 bg-warning/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    Warnings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {data.calculations.warnings.map((warning, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-warning mt-1">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {data.calculations.recommendations && data.calculations.recommendations.length > 0 && (
              <Card className="border-success/50 bg-success/5">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base text-success">
                    <Lightbulb className="h-4 w-4" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {data.calculations.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success mt-1">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Disclaimer */}
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Disclaimer:</strong> This report provides estimates for planning purposes only. 
                  Actual power consumption may vary. Consult with a qualified solar installer for professional sizing recommendations.
                  Calculations include a 20% safety margin, 50% surge diversity factor, and assume a power factor of 0.8.
                </p>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="flex-1" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Report
              </Button>
            </div>

            {/* Footer */}
            <div className="text-center pt-4 pb-8">
              <p className="text-sm text-muted-foreground">
                InverterSize.com - Your Inverter Planning Tool
              </p>
              <a 
                href="/contact" 
                className="text-sm text-primary hover:text-primary/80 underline underline-offset-4 mt-2 inline-block"
              >
                Contact an Expert
              </a>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ReportDetails;
