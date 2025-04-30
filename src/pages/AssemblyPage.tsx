
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from '@/utils/panelGenerator';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { loadCurrentPanel, loadCurrentParams } from '@/utils/storage';

const AssemblyPage = () => {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [woodBins, setWoodBins] = useState<any[]>([]);
  const [currentPlank, setCurrentPlank] = useState<number>(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Charger le panneau et les paramètres depuis le stockage local
    const loadedPanel = loadCurrentPanel();
    const loadedParams = loadCurrentParams();
    
    if (loadedPanel) {
      setPanel(loadedPanel);
    }
    
    if (loadedParams) {
      setWoodBins(loadedParams.woodBins);
    }
  }, []);
  
  const goToNextPlank = () => {
    if (panel && currentPlank < panel.planks.length - 1) {
      setCurrentPlank(currentPlank + 1);
    }
  };

  const goToPreviousPlank = () => {
    if (currentPlank > 0) {
      setCurrentPlank(currentPlank - 1);
    }
  };
  
  const goToHomePage = () => {
    navigate('/');
  };
  
  if (!panel || panel.planks.length === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Instructions d'assemblage</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Aucun panneau généré. Veuillez d'abord générer un panneau.</p>
            <Button onClick={goToHomePage}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la conception
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const plank = panel.planks[currentPlank];
  const woodBin = woodBins.find(bin => bin.id === plank?.binId) || { 
    id: -1, 
    name: "Bac inconnu", 
    color: "#cccccc" 
  };
  
  const totalPlanks = panel.planks.length;
  
  // Déterminer si c'est une nouvelle rangée
  const isNewRow = currentPlank > 0 && 
    panel.planks[currentPlank].positionY !== panel.planks[currentPlank - 1].positionY;
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Instructions d'assemblage</h1>
        <Button variant="outline" onClick={goToHomePage}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la conception
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Étape {currentPlank + 1} sur {totalPlanks}</span>
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
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="bg-wood-muted p-6 rounded-lg border">
              {isNewRow && (
                <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded-md font-medium">
                  NOUVELLE RANGÉE : Passez à la rangée suivante !
                </div>
              )}
              
              <h3 className="text-xl font-medium mb-4">Planche #{plank.id}</h3>
              <div className="space-y-4 text-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Bac:</span>
                  <div className="flex items-center">
                    <div 
                      className="w-6 h-6 rounded-full mr-2" 
                      style={{ backgroundColor: woodBin.color }}
                    />
                    <span>{woodBin.name}</span>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Longueur:</span>
                  <span>{plank.length.toFixed(1)} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Position X:</span>
                  <span>{plank.positionX.toFixed(1)} cm du bord gauche</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Position Y:</span>
                  <span>{plank.positionY.toFixed(1)} cm du bord supérieur</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-8 mb-4">
              <div className="w-80 h-12 bg-gray-200 relative">
                <div className="h-full border-r-2 border-black absolute" style={{ left: `${(currentPlank+1) / totalPlanks * 100}%` }}></div>
                
                <div className="absolute top-0 left-0 text-xs">Début</div>
                <div className="absolute top-0 right-0 text-xs">Fin</div>
                
                <div className="absolute bottom-0 left-0 right-0 text-center text-sm">
                  Progression: planche {currentPlank + 1}/{totalPlanks}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssemblyPage;
