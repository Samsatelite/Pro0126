import { Zap, Activity, BatteryCharging, Clock, RotateCcw, Download } from "lucide-react";
import { motion } from "framer-motion";

interface CalculationResultsProps {
  totalLoad: number;
  peakSurge: number;
  inverterSize: number;
  backupTime: number;
  onReset: () => void;
  onDownload: () => void;
}

export function CalculationResults({
  totalLoad,
  peakSurge,
  inverterSize,
  backupTime,
  onReset,
  onDownload,
}: CalculationResultsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="font-bold text-primary mb-4">Calculation Results</h3>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="rounded-lg border border-border bg-secondary p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Total Load
            </span>
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalLoad}<span className="text-sm font-normal text-muted-foreground ml-1">W</span>
          </p>
        </div>
        <div className="rounded-lg border border-border bg-secondary p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Peak Surge
            </span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {peakSurge}<span className="text-sm font-normal text-muted-foreground ml-1">W</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <motion.div
          className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4"
          animate={{ borderColor: totalLoad > 0 ? "hsl(174, 72%, 46%)" : "hsl(174, 72%, 46%, 0.3)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Inverter Size
            </span>
            <BatteryCharging className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">
            {inverterSize}<span className="text-sm font-normal text-muted-foreground ml-1">kVA</span>
          </p>
        </motion.div>
        <motion.div
          className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4"
          animate={{ borderColor: totalLoad > 0 ? "hsl(174, 72%, 46%)" : "hsl(174, 72%, 46%, 0.3)" }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              Backup Time
            </span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-primary">
            {backupTime}<span className="text-sm font-normal text-muted-foreground ml-1">hours</span>
          </p>
        </motion.div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onReset}
          className="flex-1 flex items-center justify-center gap-2 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>
        <button
          onClick={onDownload}
          className="flex-1 flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Download className="w-4 h-4" />
          Download PDF
        </button>
      </div>

      {totalLoad === 0 && (
        <div className="mt-6 text-center">
          <Zap className="w-12 h-12 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Select appliances to see your power requirements
          </p>
        </div>
      )}
    </div>
  );
}
