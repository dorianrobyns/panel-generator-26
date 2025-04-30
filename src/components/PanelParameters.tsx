
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PanelParams } from '@/utils/panelGenerator';

interface PanelParametersProps {
  params: PanelParams;
  onChange: (params: PanelParams) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const PanelParameters: React.FC<PanelParametersProps> = ({ params, onChange, onGenerate, isGenerating }) => {
  // Fonction de mise à jour des paramètres
  const updateParam = (key: keyof PanelParams, value: number) => {
    onChange({ ...params, [key]: value });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Paramètres du Panneau</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minPlankLength">Longueur min. des planches (cm)</Label>
              <Input
                id="minPlankLength"
                type="number"
                min="5"
                value={params.minPlankLength}
                onChange={(e) => updateParam('minPlankLength', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="maxPlankLength">Longueur max. des planches (cm)</Label>
              <Input
                id="maxPlankLength"
                type="number"
                min={params.minPlankLength + 1}
                value={params.maxPlankLength}
                onChange={(e) => updateParam('maxPlankLength', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="plankWidth">Largeur des planches (cm)</Label>
            <Input
              id="plankWidth"
              type="number"
              min="2"
              value={params.plankWidth || 10}
              onChange={(e) => updateParam('plankWidth', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="panelWidth">Largeur du panneau (cm)</Label>
              <Input
                id="panelWidth"
                type="number"
                min="10"
                value={params.panelWidth}
                onChange={(e) => updateParam('panelWidth', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="panelLength">Longueur du panneau (cm)</Label>
              <Input
                id="panelLength"
                type="number"
                min="10"
                value={params.panelLength}
                onChange={(e) => updateParam('panelLength', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full bg-wood-dark hover:bg-wood-darker text-white mt-4"
          >
            {isGenerating ? "Génération en cours..." : "Générer un panneau"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PanelParameters;
