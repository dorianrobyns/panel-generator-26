
import { PanelParams, Panel } from './panelGenerator';

// Clés pour localStorage
const PARAMS_KEY = 'patchwork-panel-params';
const PANEL_KEY = 'patchwork-panel-result';
const PROJECTS_KEY = 'patchwork-saved-projects';

// Interface pour un projet sauvegardé
export interface SavedProject {
  id: string;
  name: string;
  date: string;
  params: PanelParams;
  panel: Panel | null;
}

// Sauvegarder les paramètres actuels
export const saveCurrentParams = (params: PanelParams): void => {
  localStorage.setItem(PARAMS_KEY, JSON.stringify(params));
};

// Charger les derniers paramètres
export const loadCurrentParams = (): PanelParams | null => {
  const savedParams = localStorage.getItem(PARAMS_KEY);
  return savedParams ? JSON.parse(savedParams) : null;
};

// Sauvegarder le panneau généré
export const saveCurrentPanel = (panel: Panel | null): void => {
  if (panel) {
    localStorage.setItem(PANEL_KEY, JSON.stringify(panel));
  } else {
    localStorage.removeItem(PANEL_KEY);
  }
};

// Charger le dernier panneau généré
export const loadCurrentPanel = (): Panel | null => {
  const savedPanel = localStorage.getItem(PANEL_KEY);
  return savedPanel ? JSON.parse(savedPanel) : null;
};

// Sauvegarder un projet complet
export const saveProject = (name: string, params: PanelParams, panel: Panel | null): string => {
  // Charger les projets existants
  const existingProjects = loadAllProjects();
  
  // Créer un nouveau projet avec un ID unique
  const newProject: SavedProject = {
    id: Date.now().toString(),
    name: name || `Projet du ${new Date().toLocaleDateString()}`,
    date: new Date().toISOString(),
    params,
    panel
  };
  
  // Ajouter le nouveau projet
  existingProjects.push(newProject);
  
  // Sauvegarder tous les projets
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(existingProjects));
  
  return newProject.id;
};

// Charger tous les projets sauvegardés
export const loadAllProjects = (): SavedProject[] => {
  const savedProjects = localStorage.getItem(PROJECTS_KEY);
  return savedProjects ? JSON.parse(savedProjects) : [];
};

// Charger un projet spécifique par son ID
export const loadProject = (projectId: string): SavedProject | null => {
  const projects = loadAllProjects();
  const project = projects.find(p => p.id === projectId);
  return project || null;
};

// Supprimer un projet par son ID
export const deleteProject = (projectId: string): boolean => {
  const projects = loadAllProjects();
  const filteredProjects = projects.filter(p => p.id !== projectId);
  
  if (filteredProjects.length < projects.length) {
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(filteredProjects));
    return true;
  }
  
  return false;
};
