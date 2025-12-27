import { useState, useMemo, useCallback } from 'react';
import { appliances, inverterSizes, type ApplianceWithQuantity } from '@/data/appliances';

interface CalculationResult {
  totalLoad: number;
  peakSurge: number;
  requiredPower: number;
  requiredKva: number;
  recommendedInverter: number;
  warnings: string[];
  recommendations: string[];
  selectedHeavyDuty: ApplianceWithQuantity | null;
}

export function useCalculator() {
  const [selectedAppliances, setSelectedAppliances] = useState<ApplianceWithQuantity[]>(
    appliances.map(a => ({ ...a, quantity: 0 }))
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setSelectedAppliances(prev => {
      const appliance = prev.find(a => a.id === id);
      
      // If this is a heavy-duty appliance and we're selecting it
      if (appliance?.isHeavyDuty && quantity > 0) {
        // Reset all other heavy-duty appliances to 0, set this one to 1
        return prev.map(a => {
          if (a.id === id) return { ...a, quantity: 1 };
          if (a.isHeavyDuty) return { ...a, quantity: 0 };
          return a;
        });
      }
      
      return prev.map(a => (a.id === id ? { ...a, quantity: Math.max(0, quantity) } : a));
    });
  }, []);

  const resetAll = useCallback(() => {
    setSelectedAppliances(appliances.map(a => ({ ...a, quantity: 0 })));
  }, []);

  const calculations = useMemo((): CalculationResult => {
    const activeAppliances = selectedAppliances.filter(a => a.quantity > 0);

    // 1. Continuous Load = Σ (wattage × quantity)
    const totalLoad = activeAppliances.reduce(
      (sum, a) => sum + a.wattage * a.quantity,
      0
    );

    // 2. Effective Surge = max(wattage × (surge - 1)) - avoids double counting running power
    const effectiveSurge = activeAppliances.reduce(
      (max, a) => Math.max(max, a.wattage * (a.surge - 1) * a.quantity),
      0
    );

    // 3. Surge Diversity Factor (residential default: 0.5)
    const surgeDiversityFactor = 0.5;
    const adjustedSurge = effectiveSurge * surgeDiversityFactor;

    // 4. Required Power = Continuous Load + Adjusted Surge
    const requiredPower = totalLoad + adjustedSurge;

    // 5. Safety Margin = 20% (reduced due to realistic modeling)
    const finalPower = requiredPower * 1.2;

    // 6. Convert to kVA (power factor 0.8)
    const requiredKva = finalPower / 800;

    // Peak surge for display (the effective surge before diversity factor)
    const peakSurge = effectiveSurge;

    // Find recommended inverter size
    const recommendedInverter = inverterSizes.find(size => size >= requiredKva) || inverterSizes[inverterSizes.length - 1];

    // Get selected heavy duty appliance
    const selectedHeavyDuty = activeAppliances.find(a => a.isHeavyDuty) || null;

    // Generate warnings
    const warnings: string[] = [];
    const recommendations: string[] = [];

    if (selectedHeavyDuty) {
      warnings.push(`Heavy-duty appliance selected: ${selectedHeavyDuty.name} (${selectedHeavyDuty.wattage}W). Do not run other heavy appliances concurrently.`);
    }

    if (peakSurge > requiredPower * 0.7) {
      warnings.push('High surge load detected - consider staggering startup');
    }

    // Generate recommendations
    if (totalLoad > 0) {
      recommendations.push(`Recommended inverter: ${recommendedInverter} kVA for optimal performance`);

      if (selectedHeavyDuty && selectedHeavyDuty.surge > 2) {
        recommendations.push(`${selectedHeavyDuty.name} has high startup surge. Ensure inverter can handle ${(selectedHeavyDuty.wattage * selectedHeavyDuty.surge / 1000).toFixed(1)} kW peak.`);
      }

      if (requiredKva > 5) {
        recommendations.push('Large load detected - ensure proper ventilation for inverter');
      }
    }

    return {
      totalLoad,
      peakSurge,
      requiredPower,
      requiredKva: Math.ceil(requiredKva * 10) / 10,
      recommendedInverter,
      warnings,
      recommendations,
      selectedHeavyDuty,
    };
  }, [selectedAppliances]);

  const activeCount = useMemo(
    () => selectedAppliances.filter(a => a.quantity > 0).length,
    [selectedAppliances]
  );

  const hasHeavyDutySelected = useMemo(
    () => selectedAppliances.some(a => a.isHeavyDuty && a.quantity > 0),
    [selectedAppliances]
  );

  return {
    selectedAppliances,
    updateQuantity,
    resetAll,
    calculations,
    activeCount,
    hasHeavyDutySelected,
  };
}
