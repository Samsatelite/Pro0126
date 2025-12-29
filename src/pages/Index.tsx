import { useMemo } from 'react';
import { Header } from '@/components/Header';
import { CategorySection } from '@/components/CategorySection';
import { ResultsPanel } from '@/components/ResultsPanel';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCalculator } from '@/hooks/useCalculator';
import { applianceCategories } from '@/data/appliances';
import { downloadPDF } from '@/utils/pdfGenerator';
import { Helmet } from 'react-helmet-async';

const Index = () => {
  const {
    selectedAppliances,
    updateQuantity,
    resetAll,
    calculations,
    activeCount,
    hasHeavyDutySelected,
    hasSoloOnlySelected,
    selectedHeavyDutyIds,
  } = useCalculator();

  const appliancesByCategory = useMemo(() => {
    return applianceCategories.map(cat => ({
      ...cat,
      appliances: selectedAppliances.filter(a => a.category === cat.id),
    }));
  }, [selectedAppliances]);

  const handleDownloadPDF = () => {
    downloadPDF({
      appliances: selectedAppliances,
      calculations,
    });
  };

  return (
    <>
      <Helmet>
        <title>Solar Load Calculator - Plan Your Inverter Setup</title>
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

              <ScrollArea className="h-[calc(100vh-220px)] pr-4">
                <div className="space-y-8 pb-6">
                  {appliancesByCategory.map(cat => (
                    <CategorySection
                      key={cat.id}
                      categoryId={cat.id}
                      appliances={cat.appliances}
                      onUpdateQuantity={updateQuantity}
                      hasHeavyDutySelected={hasHeavyDutySelected}
                      hasSoloOnlySelected={hasSoloOnlySelected}
                      selectedHeavyDutyIds={selectedHeavyDutyIds}
                    />
                  ))}
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
                  onDownloadPDF={handleDownloadPDF}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Index;
