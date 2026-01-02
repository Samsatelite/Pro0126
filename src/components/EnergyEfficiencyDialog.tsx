import { memo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export type DialogType = 
  | 'heavy-duty-first' 
  | 'ac-fan-conflict' 
  | 'disabled-appliance'
  | null;

interface EnergyEfficiencyDialogProps {
  open: boolean;
  dialogType: DialogType;
  heavyDutyNames?: string[];
  onConfirm: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export const EnergyEfficiencyDialog = memo(function EnergyEfficiencyDialog({
  open,
  dialogType,
  heavyDutyNames = [],
  onConfirm,
  onCancel,
  onClose,
}: EnergyEfficiencyDialogProps) {
  const getContent = () => {
    switch (dialogType) {
      case 'heavy-duty-first':
        return {
          subtitle: 'It is recommended to switch off other household appliances when using heavy-duty device.',
          confirmText: 'Turn OFF',
          cancelText: 'Leave ON',
        };
      case 'ac-fan-conflict':
        return {
          subtitle: 'We noticed you have fans already selected. Do you wish to switch them OFF while selecting the AC?',
          confirmText: 'Turn OFF Fan',
          cancelText: 'Leave ON',
        };
      case 'disabled-appliance':
        return {
          subtitle: `Using this appliance alongside ${heavyDutyNames.join(', ')} will require a very large inverter size. Do you wish to proceed?`,
          confirmText: 'Use it',
          cancelText: "Don't use it",
        };
      default:
        return null;
    }
  };

  const content = getContent();
  if (!content) return null;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-full bg-warning/10">
              <Zap className="h-5 w-5 text-warning" />
            </div>
            <DialogTitle className="font-display">Energy Efficiency</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {content.subtitle}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-row gap-2 sm:justify-end">
          <Button variant="outline" onClick={onCancel} className="flex-1 sm:flex-initial">
            {content.cancelText}
          </Button>
          <Button onClick={onConfirm} className="flex-1 sm:flex-initial">
            {content.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});
