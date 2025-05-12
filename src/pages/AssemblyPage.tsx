
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Panel } from '@/utils/panelGenerator';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { loadCurrentPanel, loadCurrentParams } from '@/utils/storage';
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
          <CardContent className="text-center py-10">
            <p className="mb-4 text-lg">Aucun panneau généré. Veuillez d'abord générer un panneau.</p>
            <Button onClick={goToHomePage} size="lg" className="text-lg py-6 px-8">
              <ArrowLeft className="h-6 w-6 mr-2" />
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <Button variant="ghost" onClick={goToHomePage} size="lg" className="text-lg">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">
          Planche {currentPlank + 1}/{totalPlanks}
        </h1>
        <div className="w-20"></div> {/* Placeholder for balance */}
      </div>
      
      {/* Main content */}
      <div className="flex-grow p-4 flex flex-col">
        {/* Essential info card */}
        <Card className="mb-4 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <div 
                className="w-12 h-12 rounded-full mr-4 flex-shrink-0 border-2 border-gray-300" 
                style={{ backgroundColor: woodBin.color }}
              />
              <div>
                <h2 className="text-3xl font-bold">{woodBin.name}</h2>
                {isNewRow && (
                  <div className="mt-2 p-2 bg-yellow-100 text-yellow-800 rounded-md font-bold text-xl uppercase">
                    Nouvelle rangée!
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold my-6">
                {plank.length.toFixed(1)} cm
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Minimap panel visualization */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-md">
            <canvas 
              ref={canvasRef} 
              width={400}
              height={200}
              className="w-full border rounded-lg shadow-sm"
            />
            <div className="mt-2 text-center text-sm text-gray-500">
              {currentPlank + 1} / {totalPlanks} planches assemblées
            </div>
          </div>
        </div>
      </div>
      
      {/* Fixed navigation buttons at bottom */}
      <div className="grid grid-cols-2 fixed bottom-0 left-0 right-0 h-24 border-t bg-background/90 backdrop-blur-sm">
        <Button
          variant="ghost"
          onClick={goToPreviousPlank}
          disabled={currentPlank === 0}
          className="h-full rounded-none text-2xl font-bold border-r"
        >
          <ChevronLeft className="h-8 w-8 mr-2" />
          Précédent
        </Button>
        <Button
          variant="ghost"
          onClick={goToNextPlank}
          disabled={currentPlank === totalPlanks - 1}
          className="h-full rounded-none text-2xl font-bold"
        >
          Suivant
          <ChevronRight className="h-8 w-8 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default AssemblyPage;
