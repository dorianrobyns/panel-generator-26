
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PanelParams } from '@/utils/panelGenerator';
import { saveCurrentParams } from '@/utils/storage';

interface PanelParametersProps {
  params: PanelParams;
  onChange: (params: PanelParams) => void;
}

const PanelParameters: React.FC<PanelParametersProps> = ({ params, onChange }) => {
  const [minLength, setMinLength] = useState<number>(params.minPlankLength);
  const [maxLength, setMaxLength] = useState<number>(params.maxPlankLength);
  const [panelWidth, setPanelWidth] = useState<number>(params.panelWidth);
  const [panelLength, setPanelLength] = useState<number>(params.panelLength);

  // Mise à jour du state lorsque les props changent
  useEffect(() => {
    setMinLength(params.minPlankLength);
    setMaxLength(params.maxPlankLength);
    setPanelWidth(params.panelWidth);
    setPanelLength(params.panelLength);
  }, [params]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedParams: PanelParams = {
      ...params,
      minPlankLength: minLength,
      maxPlankLength: maxLength,
      panelWidth: panelWidth,
      panelLength: panelLength
    };
    
    // Sauvegarder dans le stockage local
    saveCurrentParams(updatedParams);
    
    // Envoyer au parent
    onChange(updatedParams);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Paramètres du Panneau</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min-length">Longueur minimum des planches (cm)</Label>
              <Input
                id="min-length"
                type="number"
                min="1"
                step="0.1"
                value={minLength}
                onChange={(e) => setMinLength(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="max-length">Longueur maximum des planches (cm)</Label>
              <Input
                id="max-length"
                type="number"
                min="1"
                step="0.1"
                value={maxLength}
                onChange={(e) => setMaxLength(parseFloat(e.target.value) || 0)}
                required
              />
              {minLength > maxLength && 
                <p className="text-xs text-destructive">La longueur max doit être supérieure à la longueur min</p>
              }
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="panel-width">Largeur du panneau (cm)</Label>
              <Input
                id="panel-width"
                type="number"
                min="1"
                step="0.1"
                value={panelWidth}
                onChange={(e) => setPanelWidth(parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="panel-length">Longueur du panneau (cm)</Label>
              <Input
                id="panel-length"
                type="number"
                min="1"
                step="0.1"
                value={panelLength}
                onChange={(e) => setPanelLength(parseFloat(e.target.value) || 0)}
                required
              />
              {minLength > panelLength && 
                <p className="text-xs text-destructive">La longueur du panneau doit être supérieure à la longueur min des planches</p>
              }
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit"
              disabled={minLength <= 0 || maxLength <= 0 || minLength > maxLength || minLength > panelLength}
            >
              Appliquer les paramètres
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PanelParameters;
