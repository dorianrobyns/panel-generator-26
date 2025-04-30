
// Types pour notre application
export interface WoodBin {
  id: number;
  name: string;
  color: string;
  proportion: number;
}

export interface Plank {
  id: number;
  binId: number;
  color: string;
  length: number;
  width: number;
  positionX: number;
  positionY: number;
  orientation: 'horizontal' | 'vertical';
}

export interface PanelParams {
  minPlankLength: number;
  maxPlankLength: number;
  minPlankWidth: number;
  maxPlankWidth: number;
  panelWidth: number;
  panelLength: number;
  woodBins: WoodBin[];
}

export interface Panel {
  width: number;
  length: number;
  planks: Plank[];
}

// Fonction de génération de panneau
export const generatePanel = (params: PanelParams): Panel => {
  const { 
    minPlankLength, maxPlankLength, 
    minPlankWidth = 5, maxPlankWidth = 20, 
    panelLength, panelWidth, woodBins 
  } = params;
  
  // Vérification des proportions
  const totalProportion = woodBins.reduce((sum, bin) => sum + bin.proportion, 0);
  if (Math.abs(totalProportion - 100) > 0.1) {
    throw new Error("La somme des proportions doit être égale à 100%");
  }
  
  // Vérification des paramètres de dimension
  if (minPlankLength <= 0 || maxPlankLength <= 0 || minPlankWidth <= 0 || maxPlankWidth <= 0 || panelLength <= 0 || panelWidth <= 0) {
    throw new Error("Toutes les dimensions doivent être positives");
  }
  
  if (minPlankLength > maxPlankLength) {
    throw new Error("La longueur minimum doit être inférieure à la longueur maximum");
  }

  if (minPlankWidth > maxPlankWidth) {
    throw new Error("La largeur minimum doit être inférieure à la largeur maximum");
  }
  
  if (minPlankLength > panelLength || minPlankWidth > panelWidth) {
    throw new Error("Les dimensions minimum des planches doivent être inférieures aux dimensions du panneau");
  }

  // Initialisation du panneau
  const panel: Panel = {
    width: panelWidth,
    length: panelLength,
    planks: []
  };

  // Pour le moment, nous implémentons une version simplifiée où les planches sont disposées en rangées
  // (on pourrait améliorer cela avec un algorithme plus complexe de placement 2D)
  
  let plankId = 1;
  let currentY = 0;
  
  // On remplit le panneau en rangées jusqu'à ce que toute la hauteur soit couverte
  while (currentY < panelWidth) {
    // Déterminer la hauteur de cette rangée (largeur de planche)
    const rowHeight = Math.min(
      panelWidth - currentY,
      Math.max(minPlankWidth, Math.random() * (maxPlankWidth - minPlankWidth) + minPlankWidth)
    );
    
    // Remplir une rangée avec des planches horizontales
    let currentX = 0;
    
    while (currentX < panelLength) {
      // Sélectionner un bac en fonction des proportions
      const selectedBin = getNextBin(panel.planks, woodBins);
      if (!selectedBin) break;
      
      // Déterminer la longueur de la planche
      const plankLength = Math.min(
        panelLength - currentX,
        maxPlankLength,
        Math.max(minPlankLength, Math.random() * (maxPlankLength - minPlankLength) + minPlankLength)
      );
      
      // Créer et ajouter la planche
      const plank: Plank = {
        id: plankId++,
        binId: selectedBin.id,
        color: selectedBin.color,
        length: plankLength,
        width: rowHeight,
        positionX: currentX,
        positionY: currentY,
        orientation: 'horizontal'
      };
      
      panel.planks.push(plank);
      currentX += plankLength;
    }
    
    currentY += rowHeight;
  }

  // Vérifier que les proportions sont respectées (avec une tolérance)
  verifyProportions(panel, woodBins);

  return panel;
};

// Fonction pour obtenir le prochain bac basé sur les proportions et l'état actuel
const getNextBin = (planks: Plank[], woodBins: WoodBin[]): WoodBin | undefined => {
  // Calculer la surface totale actuelle
  const currentTotalArea = planks.reduce((sum, plank) => sum + plank.length * plank.width, 0);
  
  if (currentTotalArea === 0) {
    return woodBins[0]; // Premier bac pour commencer
  }

  // Calculer les surfaces actuelles par bac
  const binAreas: Record<number, number> = {};
  planks.forEach(plank => {
    const area = plank.length * plank.width;
    binAreas[plank.binId] = (binAreas[plank.binId] || 0) + area;
  });

  // Calculer les proportions actuelles de chaque bac
  const currentProportions = woodBins.map(bin => {
    const binArea = binAreas[bin.id] || 0;
    return {
      bin,
      currentProportion: (binArea / currentTotalArea) * 100,
      targetProportion: bin.proportion
    };
  });

  // Trier par différence entre proportion cible et actuelle (descendant)
  currentProportions.sort((a, b) => {
    const diffA = a.targetProportion - a.currentProportion;
    const diffB = b.targetProportion - b.currentProportion;
    return diffB - diffA;
  });

  // Retourner le bac avec la plus grande différence positive
  return currentProportions.find(item => item.targetProportion > item.currentProportion)?.bin 
      || woodBins[0]; // Fallback
};

// Fonction pour vérifier que les proportions finales respectent les proportions cibles
const verifyProportions = (panel: Panel, woodBins: WoodBin[]): void => {
  const binAreas: Record<number, number> = {};
  
  panel.planks.forEach(plank => {
    const area = plank.length * plank.width;
    binAreas[plank.binId] = (binAreas[plank.binId] || 0) + area;
  });
  
  const totalArea = panel.planks.reduce((sum, plank) => sum + plank.length * plank.width, 0);
  
  woodBins.forEach(bin => {
    const binArea = binAreas[bin.id] || 0;
    const actualProportion = (binArea / totalArea) * 100;
    console.log(`Bac ${bin.name}: Proportion cible = ${bin.proportion}%, Proportion réelle = ${actualProportion.toFixed(2)}%`);
  });
};
