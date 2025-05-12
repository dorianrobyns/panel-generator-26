
import React from 'react';
import { Panel } from '@/utils/panelGenerator';
import { useIsMobile } from '@/hooks/use-mobile';

interface PanelVisualizationStatsProps {
  panel: Panel | null;
  woodBins: { id: number; name: string; color: string }[];
}

const PanelVisualizationStats: React.FC<PanelVisualizationStatsProps> = ({ panel, woodBins }) => {
  const isMobile = useIsMobile();
  
  if (!panel) return null;

  // Calculer le nombre de planches par bac
  const plankCountByBin: Record<number, number> = {};
  panel.planks.forEach(plank => {
    plankCountByBin[plank.binId] = (plankCountByBin[plank.binId] || 0) + 1;
  });

  return (
    <div className="rounded-lg border p-5 bg-background shadow-sm">
      <h3 className="font-bold mb-4 text-xl">
        Statistiques du panneau
      </h3>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg">Nombre total de planches:</span>
          <span className="font-bold text-xl">{panel.planks.length}</span>
        </div>
        
        <div className="border-t my-3"></div>
        
        <div className="font-medium mb-3 text-lg">
          Planches par bac:
        </div>
        
        <div className="space-y-4">
          {woodBins.map((bin) => (
            <div key={bin.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-full border border-gray-300" 
                  style={{ backgroundColor: bin.color }}
                />
                <span className="text-lg">{bin.name}</span>
              </div>
              <span className="font-bold text-xl">
                {plankCountByBin[bin.id] || 0}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PanelVisualizationStats;
