
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from '@/utils/panelGenerator';
import { loadCurrentParams } from '@/utils/storage';
import PanelVisualizationStats from './PanelVisualizationStats';
import { useIsMobile } from '@/hooks/use-mobile';

interface PanelVisualizationProps {
  panel: Panel | null;
}

const PanelVisualization: React.FC<PanelVisualizationProps> = ({ panel }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  
  // Charger les paramètres pour les bacs
  const params = loadCurrentParams();
  const woodBins = params?.woodBins || [];
  
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
    ctx.lineWidth = 2;
    ctx.strokeRect(offsetX, offsetY, drawWidth, drawHeight);
    
    // Dessiner les planches
    panel.planks.forEach((plank) => {
      const x = offsetX + plank.positionX * scale;
      const y = offsetY + plank.positionY * scale;
      const width = plank.length * scale;
      const height = plank.width * scale;
      
      ctx.fillStyle = plank.color;
      ctx.fillRect(x, y, width, height);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, width, height);
    });
  }, [panel]);
  
  if (!panel) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Visualisation du panneau</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-center text-muted-foreground mb-4">
            Aucun panneau généré. Configurez les paramètres et générez un panneau.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className={isMobile ? "text-base" : "text-lg"}>Visualisation du panneau</CardTitle>
        <Button 
          onClick={() => navigate('/assembly')}
          variant="default"
          size={isMobile ? "sm" : "default"}
          className="font-medium"
        >
          Instructions d'assemblage
        </Button>
      </CardHeader>
      <CardContent className={`pt-4 ${isMobile ? 'px-2' : 'px-6'}`}>
        <div className="border rounded-lg p-2 bg-background shadow-sm">
          <canvas 
            ref={canvasRef} 
            width={600}
            height={300}
            className="w-full"
          />
        </div>
        
        <PanelVisualizationStats panel={panel} woodBins={woodBins} />
      </CardContent>
    </Card>
  );
};

export default PanelVisualization;
