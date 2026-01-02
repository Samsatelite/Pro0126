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
  type LucideIcon 
} from 'lucide-react';
import { ApplianceCard } from './ApplianceCard';
import { ApplianceVariantCard, type VariantSelection } from './ApplianceVariantCard';
import type { ApplianceWithQuantity, ApplianceVariant } from '@/data/appliances';
import { applianceCategories, allowedCombinations, applianceVariants, soloOnlyVariants } from '@/data/appliances';

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
  onUpdateQuantity: (id: string, quantity: number) => void;
  variantSelections?: Record<string, VariantSelection[]>;
  onUpdateVariantSelection?: (applianceId: string, variantId: string, quantity: number) => void;
  onDisabledApplianceClick?: (appliance: ApplianceWithQuantity) => void;
  hasHeavyDutySelected?: boolean;
  hasSoloOnlySelected?: boolean;
  selectedHeavyDutyIds?: string[];
}

export const CategorySection = memo(function CategorySection({
  categoryId,
  appliances,
  onUpdateQuantity,
  variantSelections = {},
  onUpdateVariantSelection,
  onDisabledApplianceClick,
  hasSoloOnlySelected = false,
  selectedHeavyDutyIds = [],
}: CategorySectionProps) {
  const category = applianceCategories.find(c => c.id === categoryId);
  if (!category) return null;

  const IconComponent = iconMap[category.icon] || Zap;
  const activeCount = appliances.filter(a => a.quantity > 0).length;
  const isHeavyDutyCategory = categoryId === 'heavy-duty';

  const handleVariantSelection = (applianceId: string, variantId: string, quantity: number) => {
    // Check if selecting a solo-only variant (like 2HP AC)
    if (soloOnlyVariants.includes(variantId) && quantity > 0 && selectedHeavyDutyIds.length > 0) {
      // This will be handled by the parent with a dialog
    }
    onUpdateVariantSelection?.(applianceId, variantId, quantity);
  };

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
        <div className="text-xs text-muted-foreground mb-3 bg-muted/50 p-3 rounded-md space-y-1">
          <p className="font-medium text-foreground">Selection Rules:</p>
          <p>• <span className="text-warning font-medium">Solo</span> appliances must be used alone</p>
          <p>• Other heavy-duty: max 2 compatible appliances</p>
        </div>
      )}
      
      <div className="grid gap-2">
        {appliances.map(appliance => {
          const { canSelect, reason } = canSelectAppliance(
            appliance.id, 
            appliance, 
            selectedHeavyDutyIds, 
            hasSoloOnlySelected
          );
          
          // Handle appliances with variants
          if (appliance.hasVariants && applianceVariants[appliance.id]) {
            const variants = applianceVariants[appliance.id];
            const selections = variantSelections[appliance.id] || [];
            const ApplianceIcon = iconMap[appliance.icon];
            
            return (
              <ApplianceVariantCard
                key={appliance.id}
                name={appliance.name}
                icon={ApplianceIcon ? <ApplianceIcon className="h-4 w-4 text-muted-foreground" /> : null}
                variants={variants}
                selections={selections}
                onUpdateSelection={(variantId, quantity) => handleVariantSelection(appliance.id, variantId, quantity)}
                isHeavyDuty={appliance.isHeavyDuty}
                soloOnly={appliance.soloOnly}
                allowMultiple={appliance.allowMultiple !== false}
                isDisabled={!canSelect}
                disabledReason={reason}
              />
            );
          }
          
          return (
            <div 
              key={appliance.id}
              onClick={() => {
                if (!canSelect && onDisabledApplianceClick) {
                  onDisabledApplianceClick(appliance);
                }
              }}
            >
              <ApplianceCard
                appliance={appliance}
                onUpdateQuantity={onUpdateQuantity}
                isDisabled={!canSelect}
                disabledReason={reason}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});
