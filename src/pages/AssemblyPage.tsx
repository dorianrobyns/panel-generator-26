
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from '@/utils/panelGenerator';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { loadCurrentPanel, loadCurrentParams } from '@/utils/storage';
import { Progress } from "@/components/ui/progress";

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
  const progress = Math.round((currentPlank + 1) / totalPlanks * 100);
  
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
      
      <Card className="mb-6 shadow-md">
        <CardHeader className="pb-2">
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
              <div className="grid grid-cols-2 gap-4 text-lg">
                <div className="flex items-center">
                  <span className="font-medium">Bac:</span>
                  <div className="flex items-center ml-2">
                    <div 
                      className="w-6 h-6 rounded-full mr-2" 
                      style={{ backgroundColor: woodBin.color }}
                    />
                    <span>{woodBin.name}</span>
                  </div>
                </div>
                <div>
                  <span className="font-medium">Longueur:</span>
                  <span className="ml-2">{plank.length.toFixed(1)} cm</span>
                </div>
                <div>
                  <span className="font-medium">Position horizontale:</span>
                  <span className="ml-2">{plank.positionX.toFixed(1)} cm</span>
                </div>
                <div>
                  <span className="font-medium">Position verticale:</span>
                  <span className="ml-2">{plank.positionY.toFixed(1)} cm</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Début</span>
                <span>Progression: {progress}%</span>
                <span>Fin</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssemblyPage;
