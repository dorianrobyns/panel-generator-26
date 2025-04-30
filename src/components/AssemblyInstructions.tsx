
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Panel, Plank } from '@/utils/panelGenerator';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AssemblyInstructionsProps {
  panel: Panel | null;
  woodBins: { id: number; name: string; color: string }[];
}

const AssemblyInstructions: React.FC<AssemblyInstructionsProps> = ({ panel, woodBins }) => {
  const [currentPlank, setCurrentPlank] = useState<number>(0);
  
  if (!panel || panel.planks.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Instructions d'Assemblage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-6">
            Aucun panneau généré. Les instructions d'assemblage apparaîtront ici.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalPlanks = panel.planks.length;
  const plank = panel.planks[currentPlank];
  
  // Bac associé à la planche
  const woodBin = woodBins.find(bin => bin.id === plank?.binId) || { 
    id: -1, 
    name: "Bac inconnu", 
    color: "#cccccc" 
  };

  // Déterminer si c'est une nouvelle rangée
  const isNewRow = currentPlank > 0 && 
    panel.planks[currentPlank].positionY !== panel.planks[currentPlank - 1].positionY;

  const goToNextPlank = () => {
    if (currentPlank < totalPlanks - 1) {
      setCurrentPlank(currentPlank + 1);
    }
  };

  const goToPreviousPlank = () => {
    if (currentPlank > 0) {
      setCurrentPlank(currentPlank - 1);
    }
  };

  const goToPlank = (index: number) => {
    if (index >= 0 && index < totalPlanks) {
      setCurrentPlank(index);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Instructions d'Assemblage</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mode étape par étape */}
        <div className="mb-6 p-4 border rounded-md bg-wood-muted">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">
              Étape {currentPlank + 1} sur {totalPlanks}
            </h3>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPreviousPlank}
                disabled={currentPlank === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextPlank}
                disabled={currentPlank === totalPlanks - 1}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-3">
                <span className="font-medium">Planche n°{plank.id}</span>
                {isNewRow && (
                  <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded-md">
                    Nouvelle rangée ! Passez à la rangée suivante.
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Bac:</span>
                  <span className="font-medium">{woodBin.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Couleur:</span>
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full mr-2 border border-gray-300" 
                      style={{ backgroundColor: woodBin.color }}
                    />
                    <span>{woodBin.color}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span>Longueur:</span>
                  <span className="font-medium">{plank.length.toFixed(1)} cm</span>
                </div>
                <div className="flex justify-between">
                  <span>Position X:</span>
                  <span className="font-medium">{plank.positionX.toFixed(1)} cm du bord gauche</span>
                </div>
                <div className="flex justify-between">
                  <span>Position Y:</span>
                  <span className="font-medium">{plank.positionY.toFixed(1)} cm du bord supérieur</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col justify-center">
              <div className="h-10 w-full bg-gray-200 rounded-md relative">
                {panel.planks.map((p, i) => {
                  const startPos = (p.positionX / panel.length) * 100;
                  const width = (p.length / panel.length) * 100;
                  return (
                    <div 
                      key={p.id}
                      style={{
                        position: 'absolute',
                        left: `${startPos}%`,
                        width: `${width}%`,
                        height: '100%',
                        backgroundColor: i === currentPlank ? p.color : '#e5e5e5',
                        border: i === currentPlank ? '2px solid #000' : '1px solid #ccc',
                        opacity: i === currentPlank ? 1 : 0.6,
                      }}
                      onClick={() => goToPlank(i)}
                      className="cursor-pointer transition-all duration-200 hover:opacity-80"
                    />
                  );
                })}
              </div>
              <div className="text-xs text-center mt-1">
                Panneau: {panel.width} × {panel.length} cm
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssemblyInstructions;
