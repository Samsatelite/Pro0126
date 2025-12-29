import { memo } from 'react';
import { Minus, Plus, AlertTriangle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { ApplianceWithQuantity } from '@/data/appliances';
import { cn } from '@/lib/utils';

interface ApplianceCardProps {
  appliance: ApplianceWithQuantity;
  onUpdateQuantity: (id: string, quantity: number) => void;
  isDisabled?: boolean;
  disabledReason?: string;
}

export const ApplianceCard = memo(function ApplianceCard({
  appliance,
  onUpdateQuantity,
  isDisabled = false,
  disabledReason,
}: ApplianceCardProps) {
  const isActive = appliance.quantity > 0;
  const isHeavyDuty = appliance.isHeavyDuty;
  const isSoloOnly = appliance.soloOnly;

  return (
    <Card
      className={cn(
        'p-4 flex items-center justify-between gap-3 relative transition-all',
        isActive && 'border-primary/50 bg-primary/5',
        isDisabled && 'opacity-50'
      )}
    >
      {isHeavyDuty && (
        <div className="absolute -top-1 -right-1 flex gap-1">
          {isSoloOnly && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-warning text-warning-foreground rounded">
              <Ban className="h-2.5 w-2.5" />
              Solo
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium bg-destructive text-destructive-foreground rounded">
            <AlertTriangle className="h-2.5 w-2.5" />
            Heavy
          </span>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className={cn(
          'font-medium text-sm truncate transition-colors',
          isActive ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {appliance.name}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {appliance.wattage}W
          {appliance.surge > 1 && (
            <span className="text-warning ml-2">
              ×{appliance.surge} surge
            </span>
          )}
        </p>
        {isDisabled && disabledReason && (
          <p className="text-[10px] text-destructive mt-1">{disabledReason}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isHeavyDuty ? (
          <Button
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onUpdateQuantity(appliance.id, isActive ? 0 : 1)}
            disabled={isDisabled && !isActive}
            className="h-8 px-3 text-xs"
          >
            {isActive ? 'Selected' : 'Select'}
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(appliance.id, appliance.quantity - 1)}
              disabled={appliance.quantity === 0}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </Button>

            <span className={cn(
              'w-8 text-center font-display font-semibold tabular-nums transition-all',
              isActive && 'text-primary animate-count'
            )}>
              {appliance.quantity}
            </span>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => onUpdateQuantity(appliance.id, appliance.quantity + 1)}
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
});
