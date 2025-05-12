
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Panel } from '@/utils/panelGenerator';
import { loadCurrentParams } from '@/utils/storage';
import PanelVisualizationStats from './PanelVisualizationStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface PanelVisualizationProps {
  panel: Panel | null;
}

const PanelVisualization: React.FC<PanelVisualizationProps> = ({ panel }) => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();
  const [zoomLevel, setZoomLevel] = useState(1);
  
  // Charger les paramètres pour les bacs
  const params = loadCurrentParams();
  const woodBins = params?.woodBins || [];
  
  const handleZoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.25, 3));
  };
  
  const handleZoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.25, 0.5));
  };
  
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
    const baseScale = Math.min(scaleX, scaleY);
    
    // Appliquer le zoom
    const scale = baseScale * zoomLevel;
    
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
  }, [panel, zoomLevel]);
  
  if (!panel) {
    return (
      <Card className="h-full shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Visualisation du panneau</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-center text-muted-foreground mb-4 text-lg">
            Aucun panneau généré. Configurez les paramètres et générez un panneau.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-2xl">Visualisation du panneau</CardTitle>
        <div className="flex items-center gap-2">
          <div className="bg-muted rounded-lg p-1 flex items-center mr-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomOut} 
              disabled={zoomLevel <= 0.5}
              className="h-12 w-12 rounded-l-lg rounded-r-none border-r"
            >
              <ZoomOut className="h-6 w-6" />
            </Button>
            <div className="px-2 font-medium text-lg">
              {Math.round(zoomLevel * 100)}%
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleZoomIn} 
              disabled={zoomLevel >= 3}
              className="h-12 w-12 rounded-r-lg rounded-l-none border-l"
            >
              <ZoomIn className="h-6 w-6" />
            </Button>
          </div>
          <Button 
            onClick={() => navigate('/assembly')}
            variant="default"
            size="lg"
            className="font-medium text-lg h-12"
          >
            Instructions d'assemblage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 px-4">
        <div className="border rounded-lg p-2 bg-background shadow-sm mb-4">
          <canvas 
            ref={canvasRef} 
            width={600}
            height={300}
            className="w-full touch-pan-y touch-pinch-zoom"
          />
        </div>
        
        <PanelVisualizationStats panel={panel} woodBins={woodBins} />
      </CardContent>
    </Card>
  );
};

export default PanelVisualization;
