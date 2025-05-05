
import React, { useState, useEffect, useRef } from 'react';
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
  
  useEffect(() => {
    if (!panel || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Dimensions du canvas
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Calculer les facteurs d'échelle pour adapter le panneau au canvas
    const scaleX = canvasWidth / panel.length;
    const scaleY = canvasHeight / panel.width;
    
    // Utiliser le plus petit des deux pour conserver les proportions
    const scale = Math.min(scaleX, scaleY);
    
    // Dimensions réelles du dessin
    const drawWidth = panel.length * scale;
    const drawHeight = panel.width * scale;
    
    // Centrer le panneau dans le canvas
    const offsetX = (canvasWidth - drawWidth) / 2;
    const offsetY = (canvasHeight - drawHeight) / 2;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Dessiner l'arrière-plan du panneau
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(offsetX, offsetY, drawWidth, drawHeight);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);
    
    // Dessiner chaque planche
    panel.planks.forEach((plank, index) => {
      // Calculer la position et la taille
      const x = offsetX + plank.positionX * scale;
      const y = offsetY + plank.positionY * scale;
      const width = plank.length * scale;
      const height = plank.width * scale;
      
      // Planches déjà assemblées en couleur, planches restantes en gris
      ctx.fillStyle = index <= currentPlank ? plank.color : '#e0e0e0';
      ctx.fillRect(x, y, width, height);
      
      // Bordure plus épaisse pour la planche actuelle
      ctx.strokeStyle = index === currentPlank ? '#000' : '#888';
      ctx.lineWidth = index === currentPlank ? 2 : 1;
      ctx.strokeRect(x, y, width, height);
    });
  }, [panel, currentPlank]);

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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="shadow-md">
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
                      <span className="font-medium mr-2">Bac:</span>
                      <div className="flex items-center">
                        <div 
                          className="w-6 h-6 rounded-full mr-2" 
                          style={{ backgroundColor: woodBin.color }}
                        />
                        <span>{woodBin.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Longueur:</span>
                      <span>{plank.length.toFixed(1)} cm</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Position:</span>
                      <span>{plank.positionX.toFixed(1)} cm du bord gauche</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-medium mr-2">Hauteur:</span>
                      <span>{plank.positionY.toFixed(1)} cm du haut</span>
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
        
        <div className="md:col-span-1">
          <Card className="shadow-md h-full">
            <CardHeader>
              <CardTitle>Progression de l'assemblage</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="w-full aspect-[4/3] relative mb-4">
                <canvas 
                  ref={canvasRef} 
                  width={400}
                  height={300}
                  className="w-full h-full border rounded"
                />
              </div>
              <div className="text-center text-sm text-muted-foreground">
                <p>Planches assemblées: {currentPlank + 1} / {totalPlanks}</p>
                <p className="mt-2">
                  <span className="inline-block w-3 h-3 bg-wood-accent mr-1"></span> Assemblées
                  <span className="inline-block w-3 h-3 bg-gray-300 ml-4 mr-1"></span> À assembler
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssemblyPage;
