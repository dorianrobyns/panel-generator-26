
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel, Plank } from '@/utils/panelGenerator';

interface PanelVisualizationProps {
  panel: Panel | null;
}

const PanelVisualization: React.FC<PanelVisualizationProps> = ({ panel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Rendu du panneau sur le canvas
  useEffect(() => {
    if (!panel || panel.planks.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Dimensions du canvas
    const canvasWidth = canvas.width;
    const scaleFactor = canvasWidth / panel.length;
    const displayHeight = Math.min(100, panel.width * scaleFactor);
    
    // Ajuster la hauteur du canvas
    canvas.height = displayHeight + 40; // Hauteur + espace pour les graduations
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvasWidth, canvas.height);
    
    // Dessiner le fond
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(0, 0, canvasWidth, displayHeight);
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(0, 0, canvasWidth, displayHeight);
    
    // Dessiner chaque planche
    panel.planks.forEach((plank) => {
      // Calculer la position et la taille
      const x = plank.position * scaleFactor;
      const width = plank.length * scaleFactor;
      
      // Dessiner la planche
      ctx.fillStyle = plank.color;
      ctx.fillRect(x, 0, width, displayHeight);
      
      // Ajouter la bordure
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, 0, width, displayHeight);
      
      // Ajouter un numéro sur la planche si assez large
      if (width > 30) {
        ctx.fillStyle = getContrastColor(plank.color);
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${plank.id}`, x + width / 2, displayHeight / 2);
      }
    });
    
    // Dessiner l'échelle (graduations)
    drawScale(ctx, panel.length, canvasWidth, displayHeight);
    
  }, [panel]);
  
  // Fonction pour dessiner l'échelle (graduations)
  const drawScale = (
    ctx: CanvasRenderingContext2D, 
    totalLength: number, 
    canvasWidth: number, 
    displayHeight: number
  ) => {
    ctx.fillStyle = '#555';
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    
    // Ligne horizontale de l'échelle
    ctx.beginPath();
    ctx.moveTo(0, displayHeight + 10);
    ctx.lineTo(canvasWidth, displayHeight + 10);
    ctx.stroke();
    
    // Déterminer l'intervalle des graduations
    let interval = 10; // cm
    if (totalLength > 200) interval = 50;
    else if (totalLength > 100) interval = 20;
    
    // Dessiner les graduations
    for (let i = 0; i <= totalLength; i += interval) {
      const x = (i / totalLength) * canvasWidth;
      
      // Graduation
      ctx.beginPath();
      ctx.moveTo(x, displayHeight + 5);
      ctx.lineTo(x, displayHeight + 15);
      ctx.stroke();
      
      // Étiquette
      ctx.fillText(`${i}`, x, displayHeight + 25);
    }
  };
  
  // Obtenir une couleur contrastante pour le texte
  const getContrastColor = (hexColor: string): string => {
    // Convertir la couleur hex en RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculer la luminosité
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Retourner noir ou blanc selon la luminosité
    return luminance > 0.5 ? '#000000' : '#ffffff';
  };

  // Informations récapitulatives sur le panneau
  const getPanelSummary = () => {
    if (!panel) return null;
    
    const totalPlanks = panel.planks.length;
    const binCounts: Record<number, number> = {};
    const binLengths: Record<number, number> = {};
    
    // Calculer les statistiques
    panel.planks.forEach(plank => {
      binCounts[plank.binId] = (binCounts[plank.binId] || 0) + 1;
      binLengths[plank.binId] = (binLengths[plank.binId] || 0) + plank.length;
    });
    
    // Calculer la proportion par bac
    const totalLength = panel.planks.reduce((sum, p) => sum + p.length, 0);
    const binProportions: Record<number, number> = {};
    
    Object.entries(binLengths).forEach(([binId, length]) => {
      binProportions[binId] = (length / totalLength) * 100;
    });
    
    return {
      totalPlanks,
      binCounts,
      binLengths,
      binProportions
    };
  };

  const summary = getPanelSummary();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Visualisation du Panneau</CardTitle>
      </CardHeader>
      <CardContent>
        {!panel || panel.planks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
            <p>Aucun panneau généré</p>
            <p className="text-sm">Utilisez le bouton "Générer un panneau" pour commencer</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto pb-4">
              <canvas 
                ref={canvasRef} 
                width={800} 
                height={150}
                className="w-full h-auto"
              />
            </div>
            
            {summary && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                <div className="bg-wood-muted p-3 rounded-md">
                  <p className="font-semibold">Nombre de planches</p>
                  <p className="text-xl">{summary.totalPlanks}</p>
                </div>
                
                <div className="bg-wood-muted p-3 rounded-md">
                  <p className="font-semibold">Dimensions</p>
                  <p className="text-xl">{panel.width} × {panel.length} cm</p>
                </div>
                
                <div className="bg-wood-muted p-3 rounded-md">
                  <p className="font-semibold">Surface</p>
                  <p className="text-xl">{(panel.width * panel.length / 10000).toFixed(2)} m²</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PanelVisualization;
