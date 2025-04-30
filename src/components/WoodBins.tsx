
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
      updatedBins[index][field] = Number(value) || 0;
    } else if (field === 'name' || field === 'color') {
      updatedBins[index][field] = String(value);
    } else if (field === 'id') {
      updatedBins[index][field] = Number(value);
    } else {
      // Si jamais on ajoute d'autres champs à l'avenir
      updatedBins[index] = {
        ...updatedBins[index],
        [field]: value
      };
    }
    setEditedBins(updatedBins);
  };

  // Mise à jour d'une proportion avec ajustement automatique
  const updateProportion = (index: number, newValue: number) => {
    if (editedBins.length <= 1) {
      const updatedBins = [...editedBins];
      updatedBins[index].proportion = 100;
      setEditedBins(updatedBins);
      return;
    }

    const updatedBins = [...editedBins];
    const oldValue = updatedBins[index].proportion;
    const valueDiff = newValue - oldValue;
    
    // Si la nouvelle valeur mène à un total > 100%, ajuster les autres proportions
    if (totalProportion + valueDiff > 100) {
      updatedBins[index].proportion = newValue;
      
      // Distribuer la réduction proportionnellement aux autres bacs
      const excess = totalProportion + valueDiff - 100;
      const otherBins = updatedBins.filter((_, i) => i !== index);
      const otherTotal = otherBins.reduce((sum, bin) => sum + bin.proportion, 0);
      
      if (otherTotal > 0) {
        updatedBins.forEach((bin, i) => {
          if (i !== index) {
            const reductionRatio = bin.proportion / otherTotal;
            const reduction = excess * reductionRatio;
            updatedBins[i].proportion = Math.max(0, bin.proportion - reduction);
            // Arrondir à 1 décimale
            updatedBins[i].proportion = Math.round(updatedBins[i].proportion * 10) / 10;
          }
        });
      }
    } else {
      // Simple mise à jour si pas de dépassement
      updatedBins[index].proportion = newValue;
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
    
    // Redistribuer les proportions pour maintenir 100%
    const newTotal = updatedBins.reduce((sum, bin) => sum + bin.proportion, 0);
    if (newTotal < 100) {
      const toDistribute = 100 - newTotal;
      const distributionPerBin = toDistribute / updatedBins.length;
      updatedBins.forEach((bin, i) => {
        updatedBins[i].proportion += distributionPerBin;
        updatedBins[i].proportion = Math.round(updatedBins[i].proportion * 10) / 10;
      });
    }
    
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
          
          <div className="space-y-6">
            {editedBins.map((bin, index) => (
              <div key={bin.id} className="space-y-4">
                <div className="grid grid-cols-12 items-end gap-2">
                  <div className="col-span-4">
                    <Label htmlFor={`bin-${index}-name`}>Nom</Label>
                    <Input
                      id={`bin-${index}-name`}
                      value={bin.name}
                      onChange={(e) => updateBin(index, 'name', e.target.value)}
                    />
                  </div>
                  
                  <div className="col-span-7">
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
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor={`bin-${index}-proportion`}>Proportion: {bin.proportion.toFixed(1)}%</Label>
                    <span className="text-sm text-muted-foreground">{bin.proportion.toFixed(1)}%</span>
                  </div>
                  <Slider
                    id={`bin-${index}-proportion`}
                    min={0}
                    max={100}
                    step={0.1}
                    value={[bin.proportion]}
                    onValueChange={(values) => updateProportion(index, values[0])}
                    className="w-full"
                  />
                </div>
                
                {index < editedBins.length - 1 && <hr className="my-4 border-gray-200" />}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between mt-6">
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
