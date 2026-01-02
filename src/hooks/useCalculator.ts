import { useState, useMemo, useCallback } from 'react';
import { 
  appliances, 
  inverterSizes, 
  allowedCombinations, 
  getCombinationWarnings,
  applianceVariants,
  soloOnlyVariants,
  essentialApplianceIds,
  fanApplianceIds,
  type ApplianceWithQuantity,
  type ApplianceVariant,
} from '@/data/appliances';
import type { CustomEquipment } from '@/components/CustomEquipmentInput';

// Constants
const POWER_FACTOR = 0.8;
const SAFETY_MARGIN = 1.2; // 20% safety margin
const SURGE_DIVERSITY = 0.5; // Only 50% of max surge applied

export interface VariantSelection {
  variantId: string;
  quantity: number;
}

interface CalculationResult {
  totalLoad: number;
  peakSurge: number;
  requiredPower: number;
  requiredKva: number;
  recommendedInverter: number;
  warnings: string[];
  recommendations: string[];
  selectedHeavyDuty: ApplianceWithQuantity[];
}

// Helper to check if combination is allowed
function isAllowedCombination(id1: string, id2: string): boolean {
  return allowedCombinations.some(
    ([a, b]) => (a === id1 && b === id2) || (a === id2 && b === id1)
  );
}

export function useCalculator() {
  const [selectedAppliances, setSelectedAppliances] = useState<ApplianceWithQuantity[]>(
    appliances.map(a => ({ ...a, quantity: 0 }))
  );
  
  const [variantSelections, setVariantSelections] = useState<Record<string, VariantSelection[]>>({});
  const [customEquipment, setCustomEquipment] = useState<CustomEquipment[]>([]);

  const addCustomEquipment = useCallback((equipment: CustomEquipment) => {
    setCustomEquipment(prev => [...prev, equipment]);
  }, []);

  const removeCustomEquipment = useCallback((id: string) => {
    setCustomEquipment(prev => prev.filter(eq => eq.id !== id));
  }, []);

  const updateCustomEquipmentQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setCustomEquipment(prev => prev.filter(eq => eq.id !== id));
    } else {
      setCustomEquipment(prev => 
        prev.map(eq => eq.id === id ? { ...eq, quantity } : eq)
      );
    }
  }, []);

  const updateVariantSelection = useCallback((applianceId: string, variantId: string, quantity: number) => {
    setVariantSelections(prev => {
      const current = prev[applianceId] || [];
      const existing = current.find(s => s.variantId === variantId);
      
      let updated: VariantSelection[];
      if (quantity <= 0) {
        updated = current.filter(s => s.variantId !== variantId);
      } else if (existing) {
        updated = current.map(s => s.variantId === variantId ? { ...s, quantity } : s);
      } else {
        updated = [...current, { variantId, quantity }];
      }
      
      return { ...prev, [applianceId]: updated };
    });
    
    // Update parent appliance quantity based on total variant selections
    setSelectedAppliances(prev => {
      return prev.map(a => {
        if (a.id === applianceId) {
          const selections = variantSelections[applianceId] || [];
          // Account for the new change
          const existingTotal = selections.reduce((sum, s) => {
            if (s.variantId === variantId) return sum;
            return sum + s.quantity;
          }, 0);
          const newTotal = existingTotal + (quantity > 0 ? quantity : 0);
          return { ...a, quantity: newTotal > 0 ? 1 : 0 };
        }
        return a;
      });
    });
  }, [variantSelections]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setSelectedAppliances(prev => {
      const appliance = prev.find(a => a.id === id);
      if (!appliance) return prev;
      
      // If deselecting, just update
      if (quantity === 0) {
        // Also clear variant selections if applicable
        if (appliance.hasVariants) {
          setVariantSelections(p => ({ ...p, [id]: [] }));
        }
        return prev.map(a => (a.id === id ? { ...a, quantity: 0 } : a));
      }
      
      // If this is a solo-only appliance, reset all other heavy-duty
      if (appliance.soloOnly && quantity > 0) {
        // Clear variant selections for heavy-duty
        setVariantSelections(p => {
          const updated = { ...p };
          prev.forEach(a => {
            if (a.isHeavyDuty && a.hasVariants) {
              updated[a.id] = [];
            }
          });
          return updated;
        });
        
        return prev.map(a => {
          if (a.id === id) return { ...a, quantity: 1 };
          if (a.isHeavyDuty) return { ...a, quantity: 0 };
          return a;
        });
      }
      
      // If selecting a heavy-duty appliance
      if (appliance.isHeavyDuty && quantity > 0) {
        const currentHeavyDuty = prev.filter(a => a.isHeavyDuty && a.quantity > 0);
        
        // If there's a solo-only appliance currently selected, reset it
        const hasSoloSelected = currentHeavyDuty.some(a => a.soloOnly);
        if (hasSoloSelected) {
          // Clear variant selections for heavy-duty
          setVariantSelections(p => {
            const updated = { ...p };
            prev.forEach(a => {
              if (a.isHeavyDuty && a.hasVariants) {
                updated[a.id] = [];
              }
            });
            return updated;
          });
          
          return prev.map(a => {
            if (a.id === id) return { ...a, quantity: 1 };
            if (a.isHeavyDuty) return { ...a, quantity: 0 };
            return a;
          });
        }
        
        // Check if this new selection is compatible with existing heavy-duty
        if (currentHeavyDuty.length > 0) {
          const canAddMore = currentHeavyDuty.length < 2 && 
            currentHeavyDuty.every(existing => isAllowedCombination(existing.id, id));
          
          if (!canAddMore) {
            // Replace existing heavy-duty selections with this one
            setVariantSelections(p => {
              const updated = { ...p };
              prev.forEach(a => {
                if (a.isHeavyDuty && a.hasVariants && a.id !== id) {
                  updated[a.id] = [];
                }
              });
              return updated;
            });
            
            return prev.map(a => {
              if (a.id === id) return { ...a, quantity: 1 };
              if (a.isHeavyDuty) return { ...a, quantity: 0 };
              return a;
            });
          }
        }
        
        return prev.map(a => (a.id === id ? { ...a, quantity: 1 } : a));
      }
      
      // For non-heavy-duty, just update quantity
      return prev.map(a => (a.id === id ? { ...a, quantity: Math.max(0, quantity) } : a));
    });
  }, []);

  // Turn off non-essential appliances (keep lights, phone charger, fan, laptop, wifi)
  const turnOffNonEssentials = useCallback(() => {
    setSelectedAppliances(prev => {
      return prev.map(a => {
        if (essentialApplianceIds.includes(a.id)) {
          return a; // Keep essentials as-is
        }
        return { ...a, quantity: 0 };
      });
    });
    
    // Clear variant selections except for LED bulb
    setVariantSelections(prev => {
      const updated: Record<string, VariantSelection[]> = {};
      Object.keys(prev).forEach(key => {
        if (key === 'led_bulb') {
          updated[key] = prev[key];
        } else {
          updated[key] = [];
        }
      });
      return updated;
    });
  }, []);

  // Turn off fans only
  const turnOffFans = useCallback(() => {
    setSelectedAppliances(prev => {
      return prev.map(a => {
        if (fanApplianceIds.includes(a.id)) {
          return { ...a, quantity: 0 };
        }
        return a;
      });
    });
  }, []);

  const resetAll = useCallback(() => {
    setSelectedAppliances(appliances.map(a => ({ ...a, quantity: 0 })));
    setVariantSelections({});
    setCustomEquipment([]);
  }, []);

  // Check if fans are selected
  const hasFansSelected = useMemo(() => {
    return selectedAppliances.some(a => fanApplianceIds.includes(a.id) && a.quantity > 0);
  }, [selectedAppliances]);

  // Get selected heavy duty variant IDs
  const selectedHeavyDutyVariantIds = useMemo(() => {
    const ids: string[] = [];
    Object.entries(variantSelections).forEach(([applianceId, selections]) => {
      const appliance = appliances.find(a => a.id === applianceId);
      if (appliance?.isHeavyDuty) {
        selections.forEach(s => {
          if (s.quantity > 0) {
            ids.push(s.variantId);
          }
        });
      }
    });
    return ids;
  }, [variantSelections]);

  const calculations = useMemo((): CalculationResult => {
    const activeAppliances = selectedAppliances.filter(a => a.quantity > 0);
    
    // Calculate custom equipment load
    const customLoad = customEquipment.reduce(
      (sum, eq) => sum + eq.wattage * eq.quantity,
      0
    );

    // Calculate load from appliances with variants
    let variantLoad = 0;
    let variantSurgeCandidates: number[] = [];
    
    Object.entries(variantSelections).forEach(([applianceId, selections]) => {
      const variants = applianceVariants[applianceId];
      if (variants) {
        selections.forEach(sel => {
          const variant = variants.find(v => v.id === sel.variantId);
          if (variant && sel.quantity > 0) {
            variantLoad += variant.wattage * sel.quantity;
            if (variant.surge > 1) {
              variantSurgeCandidates.push(variant.wattage * (variant.surge - 1));
            }
          }
        });
      }
    });

    // Calculate load from non-variant appliances
    const nonVariantAppliances = activeAppliances.filter(a => !a.hasVariants);
    const nonVariantLoad = nonVariantAppliances.reduce(
      (sum, a) => sum + a.wattage * a.quantity,
      0
    );

    // Total load
    const totalLoad = nonVariantLoad + variantLoad + customLoad;

    // Calculate surge
    const nonVariantSurgeCandidates = nonVariantAppliances
      .filter(a => a.surge > 1 && a.quantity > 0)
      .map(a => a.wattage * (a.surge - 1));

    const allSurgeCandidates = [...nonVariantSurgeCandidates, ...variantSurgeCandidates];
    const maxSurge = allSurgeCandidates.length > 0 
      ? Math.max(...allSurgeCandidates) 
      : 0;

    const adjustedSurge = maxSurge * SURGE_DIVERSITY;
    const rawRequiredPower = totalLoad + adjustedSurge;
    const finalRequiredPower = rawRequiredPower * SAFETY_MARGIN;
    const requiredKva = finalRequiredPower / (1000 * POWER_FACTOR);

    const recommendedInverter = inverterSizes.find(size => size >= requiredKva) 
      || inverterSizes[inverterSizes.length - 1];

    // Get selected heavy duty appliances
    const selectedHeavyDuty = activeAppliances.filter(a => a.isHeavyDuty);
    const selectedHeavyDutyIds = [
      ...selectedHeavyDuty.filter(a => !a.hasVariants).map(a => a.id),
      ...selectedHeavyDutyVariantIds,
    ];

    // Generate warnings
    const warnings: string[] = [];

    const hasAC = selectedHeavyDutyVariantIds.some(id => id.startsWith('ac_'));
    const hasFridge = selectedHeavyDutyVariantIds.some(id => 
      ['mini_fridge', 'top_bottom_freezer', 'deep_freezer'].includes(id)
    );
    const hasHeating = activeAppliances.some(a => 
      ['microwave', 'toaster'].includes(a.id) && a.quantity > 0
    );

    if (hasAC && hasFridge) {
      warnings.push('Running AC and refrigerator together increases load significantly.');
    }

    if (hasHeating) {
      warnings.push('Heating appliances significantly reduce battery backup time.');
    }

    if (adjustedSurge > totalLoad * 0.8) {
      warnings.push('High motor startup load detected. Consider a higher inverter capacity.');
    }

    const combinationWarnings = getCombinationWarnings(selectedHeavyDutyIds);
    warnings.push(...combinationWarnings);

    const soloAppliance = selectedHeavyDuty.find(a => a.soloOnly);
    if (soloAppliance) {
      warnings.push(`${soloAppliance.name} should be used alone for optimal performance.`);
    }

    // Check for solo-only variants (2HP AC)
    const soloVariant = selectedHeavyDutyVariantIds.find(id => soloOnlyVariants.includes(id));
    if (soloVariant) {
      const variant = Object.values(applianceVariants).flat().find(v => v.id === soloVariant);
      if (variant) {
        warnings.push(`${variant.label} Air Conditioner should be used alone for optimal performance.`);
      }
    }

    if (customEquipment.length > 0) {
      warnings.push('Custom equipment wattage values are estimates. Verify with manufacturer specs.');
    }

    // Recommendations
    const recommendations: string[] = [];

    if (totalLoad > 0) {
      recommendations.push(`Recommended inverter: ${recommendedInverter} kVA for optimal performance`);

      const highSurgeAppliance = nonVariantAppliances.find(a => a.surge >= 3);
      if (highSurgeAppliance) {
        recommendations.push(
          `${highSurgeAppliance.name} has high startup surge. Ensure inverter can handle ${((highSurgeAppliance.wattage * highSurgeAppliance.surge) / 1000).toFixed(1)} kW peak.`
        );
      }

      if (requiredKva > 5) {
        recommendations.push('Large load detected - ensure proper ventilation for inverter');
      }
    }

    return {
      totalLoad: Math.round(totalLoad),
      peakSurge: Math.round(adjustedSurge),
      requiredPower: Math.round(finalRequiredPower),
      requiredKva: Number(requiredKva.toFixed(2)),
      recommendedInverter,
      warnings,
      recommendations,
      selectedHeavyDuty,
    };
  }, [selectedAppliances, variantSelections, customEquipment, selectedHeavyDutyVariantIds]);

  const activeCount = useMemo(() => {
    const applianceCount = selectedAppliances.filter(a => a.quantity > 0).length;
    const variantCount = Object.values(variantSelections).reduce((sum, selections) => {
      return sum + selections.filter(s => s.quantity > 0).length;
    }, 0);
    return applianceCount + variantCount + customEquipment.length;
  }, [selectedAppliances, variantSelections, customEquipment]);

  const hasHeavyDutySelected = useMemo(
    () => selectedAppliances.some(a => a.isHeavyDuty && a.quantity > 0),
    [selectedAppliances]
  );

  const hasSoloOnlySelected = useMemo(() => {
    const hasSoloAppliance = selectedAppliances.some(a => a.soloOnly && a.quantity > 0);
    const hasSoloVariant = selectedHeavyDutyVariantIds.some(id => soloOnlyVariants.includes(id));
    return hasSoloAppliance || hasSoloVariant;
  }, [selectedAppliances, selectedHeavyDutyVariantIds]);

  const selectedHeavyDutyIds = useMemo(() => {
    const applianceIds = selectedAppliances
      .filter(a => a.isHeavyDuty && a.quantity > 0 && !a.hasVariants)
      .map(a => a.id);
    return [...applianceIds, ...selectedHeavyDutyVariantIds];
  }, [selectedAppliances, selectedHeavyDutyVariantIds]);

  // Get names of selected heavy-duty appliances/variants
  const selectedHeavyDutyNames = useMemo(() => {
    const names: string[] = [];
    
    selectedAppliances
      .filter(a => a.isHeavyDuty && a.quantity > 0 && !a.hasVariants)
      .forEach(a => names.push(a.name));
    
    selectedHeavyDutyVariantIds.forEach(variantId => {
      const variant = Object.values(applianceVariants).flat().find(v => v.id === variantId);
      if (variant) {
        const parent = appliances.find(a => a.id === variant.parentId);
        names.push(`${parent?.name || ''} ${variant.label}`.trim());
      }
    });
    
    return names;
  }, [selectedAppliances, selectedHeavyDutyVariantIds]);

  return {
    selectedAppliances,
    variantSelections,
    customEquipment,
    updateQuantity,
    updateVariantSelection,
    addCustomEquipment,
    removeCustomEquipment,
    updateCustomEquipmentQuantity,
    turnOffNonEssentials,
    turnOffFans,
    resetAll,
    calculations,
    activeCount,
    hasHeavyDutySelected,
    hasSoloOnlySelected,
    hasFansSelected,
    selectedHeavyDutyIds,
    selectedHeavyDutyNames,
  };
}
