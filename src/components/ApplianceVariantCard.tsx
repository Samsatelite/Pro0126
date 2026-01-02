import { memo, useState } from 'react';
import { Minus, Plus, ChevronDown, AlertTriangle, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface ApplianceVariant {
  id: string;
  label: string;
  wattage: number;
}

export interface VariantSelection {
  variantId: string;
  quantity: number;
}

interface ApplianceVariantCardProps {
  name: string;
  icon: React.ReactNode;
  variants: ApplianceVariant[];
  selections: VariantSelection[];
  onUpdateSelection: (variantId: string, quantity: number) => void;
  isHeavyDuty?: boolean;
  soloOnly?: boolean;
  allowMultiple?: boolean;
  isDisabled?: boolean;
  disabledReason?: string;
}

export const ApplianceVariantCard = memo(function ApplianceVariantCard({
  name,
  icon,
  variants,
  selections,
  onUpdateSelection,
  isHeavyDuty = false,
  soloOnly = false,
  allowMultiple = true,
  isDisabled = false,
  disabledReason,
}: ApplianceVariantCardProps) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  
  const totalSelected = selections.reduce((sum, s) => sum + s.quantity, 0);
  const isActive = totalSelected > 0;

  const handleVariantSelect = (variantId: string) => {
    if (!allowMultiple) {
      // For appliances that don't allow multiple, selecting a new variant replaces the old one
      selections.forEach(s => {
        if (s.variantId !== variantId) {
          onUpdateSelection(s.variantId, 0);
        }
      });
      const currentSelection = selections.find(s => s.variantId === variantId);
      if (!currentSelection || currentSelection.quantity === 0) {
        onUpdateSelection(variantId, 1);
      }
    } else {
      setSelectedVariant(variantId);
      const currentSelection = selections.find(s => s.variantId === variantId);
      if (!currentSelection || currentSelection.quantity === 0) {
        onUpdateSelection(variantId, 1);
      }
    }
  };

  const handleQuantityChange = (variantId: string, delta: number) => {
    const current = selections.find(s => s.variantId === variantId)?.quantity || 0;
    const newQuantity = Math.max(0, current + delta);
    onUpdateSelection(variantId, newQuantity);
  };

  // Get summary of selections
  const selectionSummary = selections
    .filter(s => s.quantity > 0)
    .map(s => {
      const variant = variants.find(v => v.id === s.variantId);
      return variant ? `${variant.label}${allowMultiple ? ` (${s.quantity})` : ''}` : '';
    })
    .filter(Boolean)
    .join(', ');

  return (
    <Card
      className={cn(
        'p-4 relative transition-all',
        isActive && 'border-primary/50 bg-primary/5',
        isDisabled && 'opacity-50'
      )}
    >
      {isHeavyDuty && (
        <div className="absolute -top-1 -right-1 flex gap-1">
          {soloOnly && (
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

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {icon}
            <p className={cn(
              'font-medium text-sm truncate transition-colors',
              isActive ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {name}
            </p>
          </div>
          
          {isDisabled && disabledReason && (
            <p className="text-[10px] text-destructive mt-1">{disabledReason}</p>
          )}
          
          {selectionSummary && (
            <p className="text-xs text-muted-foreground mt-2 bg-muted/50 px-2 py-1 rounded">
              Selected: {selectionSummary}
            </p>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={isActive ? "default" : "outline"} 
              size="sm"
              disabled={isDisabled}
              className="h-8 px-3 text-xs"
            >
              {isActive ? 'Change' : 'Select'}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-popover z-50">
            {variants.map(variant => {
              const selection = selections.find(s => s.variantId === variant.id);
              const qty = selection?.quantity || 0;
              
              return (
                <DropdownMenuItem
                  key={variant.id}
                  className="flex items-center justify-between py-3 focus:bg-accent"
                  onSelect={(e) => e.preventDefault()}
                >
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleVariantSelect(variant.id)}
                  >
                    <span className="font-medium">{variant.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">{variant.wattage}W</span>
                  </div>
                  
                  {allowMultiple ? (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(variant.id, -1);
                        }}
                        disabled={qty === 0}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className={cn(
                        'w-6 text-center text-sm font-medium tabular-nums',
                        qty > 0 && 'text-primary'
                      )}>
                        {qty}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(variant.id, 1);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className={cn(
                        'h-4 w-4 rounded-full border-2 transition-colors cursor-pointer',
                        qty > 0 ? 'bg-primary border-primary' : 'border-muted-foreground'
                      )}
                      onClick={() => handleVariantSelect(variant.id)}
                    />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
});
