import { useState, memo } from 'react';
import { Plus, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type EquipmentCategory = 'none' | 'has_motor' | 'produce_heat';

export interface CustomEquipment {
  id: string;
  name: string;
  wattage: number;
  quantity: number;
  category: EquipmentCategory;
}

// Surge multipliers based on category
export const CATEGORY_SURGE: Record<EquipmentCategory, number> = {
  none: 1,
  has_motor: 3,
  produce_heat: 1.5,
};

const categoryLabels: Record<EquipmentCategory, string> = {
  none: 'None',
  has_motor: 'Has a motor',
  produce_heat: 'Produces heat',
};

interface CustomEquipmentInputProps {
  customEquipment: CustomEquipment[];
  onAdd: (equipment: CustomEquipment) => void;
  onRemove: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
}

export const CustomEquipmentInput = memo(function CustomEquipmentInput({
  customEquipment,
  onAdd,
  onRemove,
  onUpdateQuantity
}: CustomEquipmentInputProps) {
  const [name, setName] = useState('');
  const [wattage, setWattage] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('none');
  const [showForm, setShowForm] = useState(false);

  const handleAdd = () => {
    if (!name.trim() || !wattage || Number(wattage) <= 0) return;
    
    onAdd({
      id: `custom_${Date.now()}`,
      name: name.trim(),
      wattage: Number(wattage),
      quantity: 1,
      category,
    });
    
    setName('');
    setWattage('');
    setCategory('none');
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-foreground">Custom Equipment</h3>
        {!showForm && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowForm(true)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Custom
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="p-4 space-y-4 bg-muted/30 border-dashed">
          <Alert variant="default" className="bg-amber-500/10 border-amber-500/30">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-xs text-muted-foreground">
              <strong>Disclaimer:</strong> Custom equipment wattage values are user-provided estimates. 
              For accurate sizing, please verify wattage from manufacturer specifications. 
              Incorrect values may lead to undersized inverter recommendations.
            </AlertDescription>
          </Alert>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="equipment-name" className="text-xs">Equipment Name</Label>
              <Input
                id="equipment-name"
                placeholder="e.g., Water Heater"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="equipment-wattage" className="text-xs">Wattage (W)</Label>
              <Input
                id="equipment-wattage"
                type="number"
                placeholder="e.g., 1500"
                value={wattage}
                onChange={(e) => setWattage(e.target.value)}
                min="1"
                className="h-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment-category" className="text-xs">Equipment Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as EquipmentCategory)}>
              <SelectTrigger id="equipment-category" className="h-9">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="has_motor">Has a motor</SelectItem>
                <SelectItem value="produce_heat">Produces heat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAdd} disabled={!name.trim() || !wattage}>
              Add Equipment
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {customEquipment.length > 0 && (
        <div className="space-y-2">
          {customEquipment.map((eq) => (
            <Card 
              key={eq.id} 
              className="p-3 flex items-center justify-between bg-primary/5 border-primary/20"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{eq.name}</p>
                <p className="text-xs text-muted-foreground">
                  {eq.wattage}W • {categoryLabels[eq.category]} (custom)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onUpdateQuantity(eq.id, Math.max(0, eq.quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-8 text-center text-sm font-medium">{eq.quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => onUpdateQuantity(eq.id, eq.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  onClick={() => onRemove(eq.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
});