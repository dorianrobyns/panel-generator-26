
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
  position: number;
}

export interface PanelParams {
  minPlankLength: number;
  maxPlankLength: number;
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
  const { minPlankLength, maxPlankLength, panelLength, panelWidth, woodBins } = params;
  
  // Vérification des proportions
  const totalProportion = woodBins.reduce((sum, bin) => sum + bin.proportion, 0);
  if (Math.abs(totalProportion - 100) > 0.1) {
    throw new Error("La somme des proportions doit être égale à 100%");
  }
  
  // Vérification des paramètres de longueur
  if (minPlankLength <= 0 || maxPlankLength <= 0 || panelLength <= 0 || panelWidth <= 0) {
    throw new Error("Toutes les dimensions doivent être positives");
  }
  
  if (minPlankLength > maxPlankLength) {
    throw new Error("La longueur minimum doit être inférieure à la longueur maximum");
  }
  
  if (minPlankLength > panelLength) {
    throw new Error("La longueur minimum doit être inférieure à la longueur du panneau");
  }

  // Initialisation du panneau
  const panel: Panel = {
    width: panelWidth,
    length: panelLength,
    planks: []
  };

  // Longueur totale à remplir
  let remainingLength = panelLength;
  // Position actuelle
  let currentPosition = 0;
  // Planks ajoutées
  const binPlanksLength: Record<number, number> = {};
  woodBins.forEach(bin => {
    binPlanksLength[bin.id] = 0;
  });

  // Fonction pour obtenir le prochain bac basé sur les proportions et l'état actuel
  const getNextBin = (): WoodBin | undefined => {
    // Calculer la longueur totale actuelle
    const currentTotalLength = panel.planks.reduce((sum, plank) => sum + plank.length, 0);
    
    if (currentTotalLength === 0) {
      return woodBins[0]; // Premier bac pour commencer
    }

    // Calculer les proportions actuelles de chaque bac
    const currentProportions = woodBins.map(bin => {
      const binLength = binPlanksLength[bin.id] || 0;
      return {
        bin,
        currentProportion: (binLength / currentTotalLength) * 100,
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

  // Génération séquentielle des planches
  let plankId = 1;
  while (remainingLength > 0) {
    // Sélectionner un bac
    const selectedBin = getNextBin();
    if (!selectedBin) break;
    
    // Déterminer la longueur de la planche
    let plankLength = Math.min(
      remainingLength, 
      maxPlankLength, 
      Math.max(minPlankLength, Math.random() * (maxPlankLength - minPlankLength) + minPlankLength)
    );
    
    // Pour la dernière planche, utiliser exactement l'espace restant
    if (plankLength >= remainingLength) {
      plankLength = remainingLength;
    }
    
    // Créer et ajouter la planche
    if (plankLength >= minPlankLength) {
      const plank: Plank = {
        id: plankId++,
        binId: selectedBin.id,
        color: selectedBin.color,
        length: plankLength,
        position: currentPosition
      };
      
      panel.planks.push(plank);
      binPlanksLength[selectedBin.id] = (binPlanksLength[selectedBin.id] || 0) + plankLength;
      
      // Mise à jour des variables
      remainingLength -= plankLength;
      currentPosition += plankLength;
    } else {
      // Si on ne peut plus créer de planche respectant les contraintes
      break;
    }
  }

  // Vérification finale
  if (remainingLength > 0) {
    // Ajuster la dernière planche pour combler l'espace restant
    if (panel.planks.length > 0) {
      const lastPlank = panel.planks[panel.planks.length - 1];
      lastPlank.length += remainingLength;
      binPlanksLength[lastPlank.binId] += remainingLength;
      remainingLength = 0;
    }
  }

  // Vérifier que les proportions sont respectées (avec une tolérance)
  const totalLength = panel.planks.reduce((sum, plank) => sum + plank.length, 0);
  woodBins.forEach(bin => {
    const binLength = binPlanksLength[bin.id] || 0;
    const actualProportion = (binLength / totalLength) * 100;
    console.log(`Bac ${bin.name}: Proportion cible = ${bin.proportion}%, Proportion réelle = ${actualProportion.toFixed(2)}%`);
  });

  return panel;
};
