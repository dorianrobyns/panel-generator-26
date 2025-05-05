
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
    <div className={`mt-4 rounded-lg border p-4 bg-background shadow-sm ${isMobile ? 'text-sm' : ''}`}>
      <h3 className={`font-medium mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>
        Statistiques du panneau
      </h3>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <span>Nombre total de planches:</span>
          <span className="font-medium">{panel.planks.length}</span>
        </div>
        
        <div className="border-t my-2"></div>
        
        <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium mb-2`}>
          Planches par bac:
        </div>
        
        <div className="space-y-2">
          {woodBins.map((bin) => (
            <div key={bin.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: bin.color }}
                />
                <span>{bin.name}</span>
              </div>
              <span className="font-medium">
                {plankCountByBin[bin.id] || 0} planches
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PanelVisualizationStats;
