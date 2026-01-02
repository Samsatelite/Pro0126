import { useMemo, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { ResultsPanel } from '@/components/ResultsPanel';
import { CustomEquipmentInput } from '@/components/CustomEquipmentInput';
import { EnergyTipBanner } from '@/components/EnergyTipBanner';
import { EnergyEfficiencyDialog, type DialogType } from '@/components/EnergyEfficiencyDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCalculator } from '@/hooks/useCalculator';
import { applianceCategories, type ApplianceWithQuantity } from '@/data/appliances';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const navigate = useNavigate();
  const {
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
  } = useCalculator();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<DialogType>(null);
  const [pendingAppliance, setPendingAppliance] = useState<ApplianceWithQuantity | null>(null);
  const [isFirstHeavyDutySelection, setIsFirstHeavyDutySelection] = useState(true);

  // Store sizing data in sessionStorage for the contact form
  useEffect(() => {
    if (activeCount > 0) {
      const sizingData = {
        appliances: [
          ...selectedAppliances.filter(a => a.quantity > 0).map(a => ({
            name: a.name,
            wattage: a.wattage,
            quantity: a.quantity,
            isHeavyDuty: a.isHeavyDuty,
            soloOnly: a.soloOnly,
          })),
          ...customEquipment.map(eq => ({
            name: `${eq.name} (Custom)`,
            wattage: eq.wattage,
            quantity: eq.quantity,
            isHeavyDuty: false,
            soloOnly: false,
          })),
        ],
        calculations: {
          totalLoad: calculations.totalLoad,
          peakSurge: calculations.peakSurge,
          requiredKva: calculations.requiredKva,
          recommendedInverter: calculations.recommendedInverter,
          warnings: calculations.warnings,
          recommendations: calculations.recommendations,
        },
      };
      sessionStorage.setItem('inverterSizingData', JSON.stringify(sizingData));
    }
  }, [selectedAppliances, customEquipment, calculations, activeCount]);

  // Handle quantity update with dialog checks
  const handleUpdateQuantity = useCallback((id: string, quantity: number) => {
    const appliance = selectedAppliances.find(a => a.id === id);
    
    if (!appliance) {
      updateQuantity(id, quantity);
      return;
    }

    // Check for first heavy-duty selection
    if (appliance.isHeavyDuty && quantity > 0 && !hasHeavyDutySelected && isFirstHeavyDutySelection) {
      setIsFirstHeavyDutySelection(false);
      setPendingAppliance(appliance);
      setDialogType('heavy-duty-first');
      setDialogOpen(true);
      // Still proceed with selection
      updateQuantity(id, quantity);
      return;
    }

    // Check for AC + Fan conflict
    if (id === 'air_conditioner' && quantity > 0 && hasFansSelected) {
      setPendingAppliance(appliance);
      setDialogType('ac-fan-conflict');
      setDialogOpen(true);
      updateQuantity(id, quantity);
      return;
    }

    updateQuantity(id, quantity);
  }, [selectedAppliances, hasHeavyDutySelected, hasFansSelected, isFirstHeavyDutySelection, updateQuantity]);

  // Handle clicking on disabled appliance
  const handleDisabledApplianceClick = useCallback((appliance: ApplianceWithQuantity) => {
    setPendingAppliance(appliance);
    setDialogType('disabled-appliance');
    setDialogOpen(true);
  }, []);

  // Dialog actions
  const handleDialogConfirm = useCallback(() => {
    if (dialogType === 'heavy-duty-first') {
      turnOffNonEssentials();
    } else if (dialogType === 'ac-fan-conflict') {
      turnOffFans();
    } else if (dialogType === 'disabled-appliance' && pendingAppliance) {
      // Force enable the appliance by resetting other heavy-duty and selecting this one
      updateQuantity(pendingAppliance.id, 1);
    }
    setDialogOpen(false);
    setDialogType(null);
    setPendingAppliance(null);
  }, [dialogType, pendingAppliance, turnOffNonEssentials, turnOffFans, updateQuantity]);

  const handleDialogCancel = useCallback(() => {
    setDialogOpen(false);
    setDialogType(null);
    setPendingAppliance(null);
  }, []);

  const appliancesByCategory = useMemo(() => {
    return applianceCategories.map(cat => ({
      ...cat,
      appliances: selectedAppliances.filter(a => a.category === cat.id),
    }));
  }, [selectedAppliances]);

  const handleViewDetails = () => {
    navigate('/report');
  };

  return (
    <>
      <Helmet>
        <title>InverterSize - Plan Your Inverter Setup</title>
        <meta 
          name="description" 
          content="Calculate your solar inverter size. Select your appliances and get instant recommendations for your power backup system." 
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />

        <main className="container mx-auto px-4 py-6 relative">
          <div className="grid lg:grid-cols-[1fr,380px] gap-6">
            {/* Left Column - Appliance Selection */}
            <div className="space-y-6">
              {/* Important Tips Banner */}
              <EnergyTipBanner />

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Select Your Appliances
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Choose the appliances you want to power during backup
                  </p>
                </div>
                {activeCount > 0 && (
                  <div className="text-sm font-medium text-primary">
                    {activeCount} appliance{activeCount !== 1 ? 's' : ''} selected
                  </div>
                )}
              </div>

              <ScrollArea className="h-[calc(100vh-320px)] pr-4">
                <div className="space-y-8 pb-6">
                  {appliancesByCategory.map(cat => (
                    <CategorySection
                      key={cat.id}
                      categoryId={cat.id}
                      appliances={cat.appliances}
                      onUpdateQuantity={handleUpdateQuantity}
                      variantSelections={variantSelections}
                      onUpdateVariantSelection={updateVariantSelection}
                      onDisabledApplianceClick={handleDisabledApplianceClick}
                      hasHeavyDutySelected={hasHeavyDutySelected}
                      hasSoloOnlySelected={hasSoloOnlySelected}
                      selectedHeavyDutyIds={selectedHeavyDutyIds}
                    />
                  ))}
                  
                  {/* Custom Equipment Section */}
                  <div className="border border-dashed border-border rounded-xl p-4">
                    <CustomEquipmentInput
                      customEquipment={customEquipment}
                      onAdd={addCustomEquipment}
                      onRemove={removeCustomEquipment}
                      onUpdateQuantity={updateCustomEquipmentQuantity}
                    />
                  </div>
                </div>
              </ScrollArea>
            </div>

            {/* Right Column - Results */}
            <div className="lg:sticky lg:top-24 lg:h-fit space-y-4">
              <div className="bg-card border border-border rounded-xl p-5">
                <h3 className="font-display font-semibold text-lg mb-4 text-foreground">
                  Calculation Results
                </h3>
                <ResultsPanel
                  calculations={calculations}
                  activeCount={activeCount}
                  onReset={resetAll}
                  onViewDetails={handleViewDetails}
                />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Energy Efficiency Dialog */}
      <EnergyEfficiencyDialog
        open={dialogOpen}
        dialogType={dialogType}
        heavyDutyNames={selectedHeavyDutyNames}
        onConfirm={handleDialogConfirm}
        onCancel={handleDialogCancel}
        onClose={handleDialogCancel}
      />
    </>
  );
};

export default Index;
