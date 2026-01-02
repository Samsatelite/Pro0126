import { Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function EnergyTipBanner() {
  return (
    <Alert className="bg-primary/5 border-primary/20 mb-6">
      <Lightbulb className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary font-display font-semibold">
        Important Tips
      </AlertTitle>
      <AlertDescription className="text-muted-foreground mt-2 space-y-1">
        <p>1. To get the best performance from your inverter system, ensure you're using energy-efficient devices.</p>
        <p>2. Avoid selecting multiple heavy-duty devices to be used at the same time, as this will require a larger inverter system.</p>
      </AlertDescription>
    </Alert>
  );
}
