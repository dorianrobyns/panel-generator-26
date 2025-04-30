
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WoodBin } from '@/utils/panelGenerator';
import { Trash2, Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WoodBinsProps {
  bins: WoodBin[];
  onChange: (bins: WoodBin[]) => void;
}

const WoodBins: React.FC<WoodBinsProps> = ({ bins, onChange }) => {
  const { toast } = useToast();
  const [editedBins, setEditedBins] = useState<WoodBin[]>(bins);

  const totalProportion = editedBins.reduce((sum, bin) => sum + bin.proportion, 0);
  const isProportionValid = Math.abs(totalProportion - 100) <= 0.1;

  // Mise à jour d'un bac
  const updateBin = (index: number, field: keyof WoodBin, value: string | number) => {
    const updatedBins = [...editedBins];
    if (field === 'proportion') {
      updatedBins[index][field] = parseFloat(value as string) || 0;
    } else {
      updatedBins[index][field] = value;
    }
    setEditedBins(updatedBins);
  };

  // Ajout d'un nouveau bac
  const addBin = () => {
    // Génération d'une couleur aléatoire pour le nouveau bac
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    
    const missingProportion = Math.max(0, 100 - totalProportion);
    
    const newBin: WoodBin = {
      id: Date.now(),
      name: `Bac ${editedBins.length + 1}`,
      color: randomColor,
      proportion: missingProportion || 10
    };
    
    const updatedBins = [...editedBins, newBin];
    setEditedBins(updatedBins);
  };

  // Suppression d'un bac
  const removeBin = (index: number) => {
    if (editedBins.length <= 1) {
      toast({
        title: "Impossible de supprimer",
        description: "Vous devez avoir au moins un bac de bois.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedBins = editedBins.filter((_, i) => i !== index);
    setEditedBins(updatedBins);
  };

  // Redistribution des proportions pour atteindre 100%
  const redistributeProportions = () => {
    if (editedBins.length === 0) return;
    
    const updatedBins = [...editedBins];
    const missingProportion = 100 - totalProportion;
    
    // Distribution équitable du pourcentage manquant
    const adjustment = missingProportion / updatedBins.length;
    
    updatedBins.forEach((bin, index) => {
      updatedBins[index].proportion = Math.max(0, bin.proportion + adjustment);
      
      // Arrondir à 1 décimale pour éviter les problèmes de précision
      updatedBins[index].proportion = Math.round(updatedBins[index].proportion * 10) / 10;
    });
    
    // Ajuster le dernier pour s'assurer que le total est exactement 100%
    const newTotal = updatedBins.reduce((sum, bin) => sum + bin.proportion, 0);
    if (newTotal !== 100) {
      updatedBins[updatedBins.length - 1].proportion += (100 - newTotal);
      updatedBins[updatedBins.length - 1].proportion = Math.max(0, updatedBins[updatedBins.length - 1].proportion);
      updatedBins[updatedBins.length - 1].proportion = Math.round(updatedBins[updatedBins.length - 1].proportion * 10) / 10;
    }
    
    setEditedBins(updatedBins);
  };

  // Sauvegarde des modifications
  const saveBins = () => {
    if (isProportionValid) {
      onChange(editedBins);
      toast({
        title: "Bacs sauvegardés",
        description: `${editedBins.length} bac(s) configuré(s) avec succès.`
      });
    } else {
      toast({
        title: "Erreur de proportion",
        description: `La somme des proportions doit être égale à 100% (Actuellement: ${totalProportion.toFixed(1)}%)`,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Bacs de Bois</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!isProportionValid && (
            <div className="flex p-3 rounded-lg bg-amber-50 text-amber-600 items-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">Total des proportions: {totalProportion.toFixed(1)}% (doit être 100%)</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto text-amber-600 border-amber-300 hover:bg-amber-100"
                onClick={redistributeProportions}
              >
                Corriger
              </Button>
            </div>
          )}
          
          <div className="space-y-4">
            {editedBins.map((bin, index) => (
              <div key={bin.id} className="grid grid-cols-12 items-end gap-2">
                <div className="col-span-3">
                  <Label htmlFor={`bin-${index}-name`}>Nom</Label>
                  <Input
                    id={`bin-${index}-name`}
                    value={bin.name}
                    onChange={(e) => updateBin(index, 'name', e.target.value)}
                  />
                </div>
                
                <div className="col-span-3">
                  <Label htmlFor={`bin-${index}-color`}>Teinte</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id={`bin-${index}-color`}
                      type="color"
                      value={bin.color}
                      onChange={(e) => updateBin(index, 'color', e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      value={bin.color}
                      onChange={(e) => updateBin(index, 'color', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="col-span-5">
                  <Label htmlFor={`bin-${index}-proportion`}>Proportion (%)</Label>
                  <div className="flex items-center">
                    <Input
                      id={`bin-${index}-proportion`}
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={bin.proportion}
                      onChange={(e) => updateBin(index, 'proportion', e.target.value)}
                    />
                    <div className="w-8 ml-2 text-center">%</div>
                  </div>
                </div>
                
                <div className="col-span-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeBin(index)}
                    className="h-10 w-10 text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={addBin}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Ajouter un bac
            </Button>
            
            <Button
              onClick={saveBins}
              disabled={!isProportionValid}
            >
              Sauvegarder les bacs
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WoodBins;
