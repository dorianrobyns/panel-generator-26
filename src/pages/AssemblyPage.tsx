
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from '@/utils/panelGenerator';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { loadCurrentPanel, loadCurrentParams } from '@/utils/storage';
import { Progress } from "@/components/ui/progress";
import { useIsMobile } from '@/hooks/use-mobile';

const AssemblyPage = () => {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [woodBins, setWoodBins] = useState<any[]>([]);
  const [currentPlank, setCurrentPlank] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
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

  // Calcul du nombre de planches par bac
  const getBinPlankCounts = () => {
    if (!panel) return {};
    
    const counts: Record<number, number> = {};
    panel.planks.forEach(plank => {
      counts[plank.binId] = (counts[plank.binId] || 0) + 1;
    });
    
    return counts;
  };

  const plankCounts = getBinPlankCounts();

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
      <div className="container py-4">
        <Card>
          <CardHeader>
            <CardTitle>Instructions d'assemblage</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Aucun panneau généré. Veuillez d'abord générer un panneau.</p>
            <Button onClick={goToHomePage} size="lg">
              <ArrowLeft className="h-5 w-5 mr-2" />
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
    <div className={`container ${isMobile ? 'py-2 px-2' : 'py-6'}`}>
      <div className="flex justify-between items-center mb-4">
        <h1 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-bold`}>Instructions d'assemblage</h1>
        <Button variant="outline" onClick={goToHomePage} size={isMobile ? "sm" : "default"}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Retour
        </Button>
      </div>
      
      {/* Interface plus simple pour tablette tactile */}
      <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
        <div className={isMobile ? "" : "md:col-span-2"}>
          <Card className="shadow-md mb-3">
            <CardHeader className="pb-1">
              <CardTitle className="flex justify-between items-center">
                <span>Étape {currentPlank + 1}/{totalPlanks}</span>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={goToPreviousPlank}
                    disabled={currentPlank === 0}
                    className="h-10 w-10"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={goToNextPlank}
                    disabled={currentPlank === totalPlanks - 1}
                    className="h-10 w-10"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-wood-muted p-4 rounded-lg border">
                  {isNewRow && (
                    <div className="mb-3 p-3 bg-yellow-100 text-yellow-800 rounded-md font-medium text-center text-lg">
                      NOUVELLE RANGÉE !
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center">
                      <div 
                        className="w-8 h-8 rounded-full mr-3 flex-shrink-0" 
                        style={{ backgroundColor: woodBin.color }}
                      />
                      <span className="text-xl font-medium">{woodBin.name}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-lg">
                      <div>
                        <span className="font-medium block text-sm">Longueur</span>
                        <span>{plank.length.toFixed(1)} cm</span>
                      </div>
                      <div>
                        <span className="font-medium block text-sm">Position</span>
                        <span>À {plank.positionX.toFixed(1)} cm du bord</span>
                      </div>
                      <div>
                        <span className="font-medium block text-sm">Rangée</span>
                        <span>#{Math.floor(plank.positionY / plank.width) + 1}</span>
                      </div>
                      <div>
                        <span className="font-medium block text-sm">ID Planche</span>
                        <span>#{plank.id}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Début</span>
                    <span>{progress}%</span>
                    <span>Fin</span>
                  </div>
                  <Progress value={progress} className="h-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className={isMobile ? "" : "md:col-span-1"}>
          <Card className="shadow-md h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-center">Progression</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-full aspect-[4/3] relative mb-3">
                <canvas 
                  ref={canvasRef} 
                  width={400}
                  height={300}
                  className="w-full h-full border rounded"
                />
              </div>
              <div className="text-center text-sm mb-2">
                <p>Planches assemblées: {currentPlank + 1} / {totalPlanks}</p>
              </div>

              {/* Récapitulatif des bacs */}
              <div className="w-full border-t pt-3 mt-2">
                <h4 className="font-medium text-center mb-2">Planches par bac</h4>
                <div className="space-y-2 w-full">
                  {woodBins.map(bin => {
                    const count = plankCounts[bin.id] || 0;
                    const usedCount = panel.planks
                      .filter(p => p.binId === bin.id && panel.planks.indexOf(p) <= currentPlank)
                      .length;
                    
                    return (
                      <div key={bin.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: bin.color }}
                          />
                          <span>{bin.name}</span>
                        </div>
                        <span className="font-medium">
                          {usedCount}/{count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssemblyPage;
