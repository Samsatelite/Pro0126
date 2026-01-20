import { memo } from 'react';
import { 
  Lightbulb, 
  UtensilsCrossed, 
  Tv, 
  Fan, 
  Monitor, 
  Zap,
  AirVent,
  Refrigerator,
  AlertCircle,
  type LucideIcon 
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ApplianceCard } from './ApplianceCard';
import { ApplianceVariantCard, type VariantSelection } from './ApplianceVariantCard';
import type { ApplianceWithQuantity, ApplianceVariant } from '@/data/appliances';
import { applianceCategories, allowedCombinations, applianceVariants, soloOnlyVariants, essentialApplianceIds, fanApplianceIds } from '@/data/appliances';

const iconMap: Record<string, LucideIcon> = {
  Lightbulb,
  UtensilsCrossed,
  Tv,
  Fan,
  Monitor,
  Zap,
  AirVent,
  Refrigerator,
};

// Check if an appliance can be combined with currently selected ones
function canSelectAppliance(
  applianceId: string, 
  appliance: ApplianceWithQuantity,
  selectedHeavyDutyIds: string[],
  hasSoloOnlySelected: boolean
): { canSelect: boolean; reason?: string } {
  // Non-heavy-duty can always be selected
  if (!appliance.isHeavyDuty) {
    return { canSelect: true };
  }

  // If this appliance is already selected, it can be deselected
  if (appliance.quantity > 0) {
    return { canSelect: true };
  }

  // If a solo-only appliance is selected, nothing else can be added
  if (hasSoloOnlySelected) {
    return { canSelect: false, reason: 'Solo appliance selected' };
  }

  // If this is a solo-only appliance and something else is selected
  if (appliance.soloOnly && selectedHeavyDutyIds.length > 0) {
    return { canSelect: false, reason: 'Must be used alone' };
  }

  // If we already have 2 heavy-duty, can't add more
  if (selectedHeavyDutyIds.length >= 2) {
    return { canSelect: false, reason: 'Max 2 heavy-duty' };
  }

  // If we have 1 heavy-duty, check if this one is compatible
  if (selectedHeavyDutyIds.length === 1) {
    const existingId = selectedHeavyDutyIds[0];
    const isCompatible = allowedCombinations.some(
      ([a, b]) => (a === existingId && b === applianceId) || (a === applianceId && b === existingId)
    );
    
    if (!isCompatible) {
      return { canSelect: false, reason: 'Not compatible' };
    }
  }

  return { canSelect: true };
}

interface CategorySectionProps {
  categoryId: string;
  appliances: ApplianceWithQuantity[];
  allAppliances: ApplianceWithQuantity[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  variantSelections?: Record<string, VariantSelection[]>;
  onUpdateVariantSelection?: (applianceId: string, variantId: string, quantity: number) => void;
  onDisabledApplianceClick?: (appliance: ApplianceWithQuantity) => void;
  hasHeavyDutySelected?: boolean;
  hasSoloOnlySelected?: boolean;
  hasFansSelected?: boolean;
  selectedHeavyDutyIds?: string[];
  essentialsOnlyMode?: boolean;
  onEssentialsOnlyToggle?: (enabled: boolean) => void;
}

export const CategorySection = memo(function CategorySection({
  categoryId,
  appliances,
  allAppliances,
  onUpdateQuantity,
  variantSelections = {},
  onUpdateVariantSelection,
  onDisabledApplianceClick,
  hasSoloOnlySelected = false,
  hasFansSelected = false,
  selectedHeavyDutyIds = [],
  essentialsOnlyMode = false,
  onEssentialsOnlyToggle,
}: CategorySectionProps) {
  
  const category = applianceCategories.find(c => c.id === categoryId);
  if (!category) return null;

  const IconComponent = iconMap[category.icon] || Zap;
  
  // Count active appliances - count total number of selected items
  const activeCount = appliances.reduce((count, a) => {
    if (a.hasVariants && applianceVariants[a.id]) {
      // For variant appliances, count the total quantity of all selected variants
      const selections = variantSelections[a.id] || [];
      return count + selections.reduce((sum, s) => sum + s.quantity, 0);
    }
    return count + a.quantity;
  }, 0);
  
  const isHeavyDutyCategory = categoryId === 'heavy-duty';

  // Handle turning off non-essentials when toggle is switched OFF
  const handleEssentialsToggle = (checked: boolean) => {
    onEssentialsOnlyToggle?.(!checked);
    if (!checked) {
      // Turn OFF was clicked - reduce all non-essential devices to zero
      allAppliances.forEach(appliance => {
        if (!essentialApplianceIds.includes(appliance.id) && appliance.quantity > 0 && !appliance.isHeavyDuty) {
          onUpdateQuantity(appliance.id, 0);
        }
      });
    }
  };

  const handleVariantSelection = (applianceId: string, variantId: string, quantity: number) => {
    // Check if selecting a solo-only variant (like 2HP AC)
    if (soloOnlyVariants.includes(variantId) && quantity > 0 && selectedHeavyDutyIds.length > 0) {
      // This will be handled by the parent with a dialog
    }
    onUpdateVariantSelection?.(applianceId, variantId, quantity);
  };

  // Check if we should show the AC fan notice
  const showAcFanNotice = categoryId === 'heavy-duty' && hasFansSelected;

  return (
    <div className="animate-slide-up" style={{ animationDelay: `${applianceCategories.indexOf(category) * 50}ms` }}>
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${isHeavyDutyCategory ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
          <IconComponent className="h-4 w-4" />
        </div>
        <h3 className="font-display font-semibold text-foreground">
          {category.name}
        </h3>
        {activeCount > 0 && (
          <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-primary/20 text-primary">
            {activeCount} selected
          </span>
        )}
      </div>

      {isHeavyDutyCategory && (
        <>
          {/* Toggle for switching off household appliances */}
          <div className="flex items-center justify-between bg-muted/50 p-3 rounded-md mb-3">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                Would you switch off other appliances when using heavy-duties?
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Label htmlFor="essentials-toggle" className="text-xs text-muted-foreground whitespace-nowrap">
                {essentialsOnlyMode ? 'OFF' : 'ON'}
              </Label>
              <Switch
                id="essentials-toggle"
                checked={!essentialsOnlyMode}
                onCheckedChange={handleEssentialsToggle}
              />
            </div>
          </div>

          <div className="text-xs mb-3 bg-success/10 border border-success/20 p-3 rounded-md space-y-1">
            <p className="font-medium text-success">Selection Rules:</p>
            <p className="text-success/80">• <span className="text-success font-medium">Solo</span> appliances must be used alone</p>
            <p className="text-success/80">• Other heavy-duty: max 2 compatible appliances</p>
          </div>
        </>
      )}
      
      <div className="grid gap-2">
        {appliances.map(appliance => {
          const { canSelect, reason } = canSelectAppliance(
            appliance.id, 
            appliance, 
            selectedHeavyDutyIds, 
            hasSoloOnlySelected
          );
          
          // Check if this appliance is disabled due to essentials-only mode
          // Essential IDs: led_bulb, phone_charger, ceiling_fan, standing_fan, laptop, led_tv, router
          const isDisabledByEssentialsMode = essentialsOnlyMode && 
            !essentialApplianceIds.includes(appliance.id) && 
            !appliance.isHeavyDuty;
          
          const effectivelyDisabled = !canSelect || isDisabledByEssentialsMode;
          const effectiveReason = isDisabledByEssentialsMode 
            ? 'Disabled during heavy-duty use' 
            : reason;
          
          // Check if this is AC and we should show the fan notice
          const showFanNoticeForAC = appliance.id === 'air_conditioner' && showAcFanNotice;
          
          // Handle appliances with variants (LED Bulb, LED TV, AC, Refrigerator)
          if (appliance.hasVariants && applianceVariants[appliance.id]) {
            const variants = applianceVariants[appliance.id];
            const selections = variantSelections[appliance.id] || [];
            
            // Remove icons for LED bulb, LED TV, Air Conditioner, Refrigerator
            const hideIcon = ['led_bulb', 'led_tv', 'air_conditioner', 'refrigerator'].includes(appliance.id);
            
            return (
              <div key={appliance.id}>
                {showFanNoticeForAC && (
                  <div className="flex items-center gap-2 mb-2 p-2 rounded-md bg-warning/10 border border-warning/20">
                    <AlertCircle className="h-4 w-4 text-warning shrink-0" />
                    <p className="text-xs text-warning">
                      We noticed you have fans already selected. You might want to remove them while selecting the AC.
                    </p>
                  </div>
                )}
                <ApplianceVariantCard
                  name={appliance.name}
                  icon={hideIcon ? null : null}
                  variants={variants}
                  selections={selections}
                  onUpdateSelection={(variantId, quantity) => handleVariantSelection(appliance.id, variantId, quantity)}
                  isHeavyDuty={appliance.isHeavyDuty}
                  soloOnly={appliance.soloOnly}
                  allowMultiple={appliance.allowMultiple !== false}
                  isDisabled={effectivelyDisabled}
                  disabledReason={effectiveReason}
                />
              </div>
            );
          }
          
          return (
            <div 
              key={appliance.id}
              onClick={() => {
                if (effectivelyDisabled && onDisabledApplianceClick) {
                  onDisabledApplianceClick(appliance);
                }
              }}
            >
              <ApplianceCard
                appliance={appliance}
                onUpdateQuantity={onUpdateQuantity}
                isDisabled={effectivelyDisabled}
                disabledReason={effectiveReason}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
