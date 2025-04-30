
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Panel } from '@/utils/panelGenerator';

interface PanelVisualizationProps {
  panel: Panel | null;
}

const PanelVisualization: React.FC<PanelVisualizationProps> = ({ panel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  
  // Rendu du panneau sur le canvas
  useEffect(() => {
    if (!panel || panel.planks.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Dimensions du canvas
    const canvasWidth = canvas.width;
    const canvasHeight = 400; // hauteur fixe
    
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
    
    // Ajuster la hauteur du canvas
    canvas.height = canvasHeight;
    
    // Effacer le canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    
    // Dessiner l'arrière-plan du panneau
    ctx.fillStyle = '#f8f8f8';
    ctx.fillRect(offsetX, offsetY, drawWidth, drawHeight);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);
    
    // Dessiner chaque planche
    panel.planks.forEach((plank) => {
      // Calculer la position et la taille
      const x = offsetX + plank.positionX * scale;
      const y = offsetY + plank.positionY * scale;
      const width = plank.length * scale;
      const height = plank.width * scale;
      
      // Dessiner la planche
      ctx.fillStyle = plank.color;
      ctx.fillRect(x, y, width, height);
      
      // Ajouter la bordure
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
      
      // Ajouter un numéro sur la planche si assez large
      if (width > 20 && height > 15) {
        ctx.fillStyle = getContrastColor(plank.color);
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${plank.id}`, x + width / 2, y + height / 2);
      }
    });
    
  }, [panel]);

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
    const totalArea = panel.planks.reduce((sum, p) => sum + (p.width * p.length), 0);
    
    // Calculer les statistiques par bac
    const binStats: Record<number, { count: number, area: number }> = {};
    
    panel.planks.forEach(plank => {
      const binId = plank.binId;
      if (!binStats[binId]) {
        binStats[binId] = { count: 0, area: 0 };
      }
      binStats[binId].count += 1;
      binStats[binId].area += (plank.width * plank.length);
    });
    
    return {
      totalPlanks,
      totalArea,
      binStats
    };
  };

  const summary = getPanelSummary();
  
  const goToAssemblyPage = () => {
    navigate('/assembly');
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Visualisation du Panneau</CardTitle>
        {panel && panel.planks.length > 0 && (
          <Button onClick={goToAssemblyPage}>
            Voir les instructions d'assemblage
          </Button>
        )}
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
                height={400}
                className="w-full h-auto border rounded"
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
