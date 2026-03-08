import { Minus, Plus } from "lucide-react";
import { APPLIANCES, APPLIANCE_CATEGORIES } from "@/data/appliances";
import { motion } from "framer-motion";

interface ApplianceSelectorProps {
  quantities: Record<string, number>;
  onChange: (name: string, qty: number) => void;
}

export function ApplianceSelector({ quantities, onChange }: ApplianceSelectorProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">Select Your Appliances</h2>
        <p className="text-sm text-muted-foreground">
          Choose the appliances you want to power during backup
        </p>
      </div>

      {APPLIANCE_CATEGORIES.map((cat) => {
        const items = APPLIANCES.filter((a) => a.category === cat.key);
        return (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-xs">⚡</span>
              </div>
              <h3 className="font-semibold text-foreground">{cat.label}</h3>
            </div>

            <div className="space-y-2">
              {items.map((appliance) => {
                const qty = quantities[appliance.name] ?? 0;
                return (
                  <div
                    key={appliance.name}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:border-primary/30 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{appliance.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {appliance.watts}W
                        {appliance.surge && (
                          <span className="text-primary ml-2">×{appliance.surge} surge</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onChange(appliance.name, Math.max(0, qty - 1))}
                        className="w-8 h-8 rounded-md border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold text-foreground">
                        {qty}
                      </span>
                      <button
                        onClick={() => onChange(appliance.name, qty + 1)}
                        className="w-8 h-8 rounded-md border border-border bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
