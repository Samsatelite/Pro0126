import { memo } from 'react';
import { Zap, Activity, AlertTriangle, Lightbulb, Download, RotateCcw, MessageCircle, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from './StatCard';
import { cn } from '@/lib/utils';

interface ResultsPanelProps {
  calculations: {
    totalLoad: number;
    peakSurge: number;
    requiredKva: number;
    recommendedInverter: number;
    warnings: string[];
    recommendations: string[];
  };
  activeCount: number;
  onReset: () => void;
  onDownloadPDF: () => void;
}

export const ResultsPanel = memo(function ResultsPanel({
  calculations,
  activeCount,
  onReset,
  onDownloadPDF,
}: ResultsPanelProps) {
  const hasResults = activeCount > 0;

  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Load"
          value={calculations.totalLoad}
          unit="W"
          icon={<Zap className="h-4 w-4" />}
          delay={0}
        />
        <StatCard
          label="Peak Surge"
          value={calculations.peakSurge}
          unit="W"
          icon={<Activity className="h-4 w-4" />}
          delay={50}
        />
        <StatCard
          label="Required"
          value={calculations.requiredKva}
          unit="kVA"
          icon={<Zap className="h-4 w-4" />}
          delay={100}
        />
        <StatCard
          label="Recommended"
          value={calculations.recommendedInverter}
          unit="kVA"
          icon={<Zap className="h-4 w-4" />}
          highlight
          delay={150}
        />
      </div>

      {/* Warnings */}
      {calculations.warnings.length > 0 && (
        <Card className="border-warning/50 bg-warning/5 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-warning">
              <AlertTriangle className="h-4 w-4" />
              Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {calculations.warnings.map((warning, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-warning mt-1.5">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {calculations.recommendations.length > 0 && (
        <Card className="border-success/50 bg-success/5 animate-slide-up" style={{ animationDelay: '250ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base text-success">
              <Lightbulb className="h-4 w-4" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {calculations.recommendations.map((rec, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-success mt-1.5">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className={cn(
        'flex gap-3 pt-2',
        !hasResults && 'opacity-50 pointer-events-none'
      )}>
        <Button
          variant="outline"
          className="flex-1"
          onClick={onReset}
          disabled={!hasResults}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button
          className="flex-1"
          onClick={onDownloadPDF}
          disabled={!hasResults}
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
      </div>

      {/* Expert CTA */}
      <Card className="border-primary/20 bg-primary/5 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <CardContent className="pt-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            If you plan to run very heavy equipment, or devices not listed in this calculator, please consult a qualified inverter engineer.
          </p>
          <p className="text-sm font-medium text-foreground">
            Get expert guidance, avoid costly mistakes, and install the right system the first time.
          </p>
          <div className="flex gap-3 pt-1">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => window.open('https://wa.me/2349074243753', '_blank')}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => window.open('mailto:devidfirm@gmail.com', '_blank')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
