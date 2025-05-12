
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PanelParams, WoodBin, Panel, generatePanel } from '@/utils/panelGenerator';
import { 
  saveCurrentPanel, 
  saveCurrentParams, 
  loadCurrentParams, 
  loadCurrentPanel,
  saveProject,
  loadAllProjects,
  loadProject,
  deleteProject,
  SavedProject
} from '@/utils/storage';
import { Save, Folder } from 'lucide-react';

// Composants
import PanelParameters from '@/components/PanelParameters';
import WoodBins from '@/components/WoodBins';
import PanelVisualization from '@/components/PanelVisualization';

const Index = () => {
  const { toast } = useToast();
  
  // États pour les paramètres et résultats
  const [params, setParams] = useState<PanelParams>({
    minPlankLength: 20,
    maxPlankLength: 100,
    plankWidth: 10,
    panelWidth: 60,
    panelLength: 200,
    woodBins: [
      { id: 1, name: "Bac 1", color: "#8B5A2B", proportion: 35 },
      { id: 2, name: "Bac 2", color: "#C69C6D", proportion: 45 },
      { id: 3, name: "Bac 3", color: "#E8D0A9", proportion: 20 }
    ]
  });
  
  const [panel, setPanel] = useState<Panel | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);

  // Chargement des données sauvegardées au démarrage
  useEffect(() => {
    const loadedParams = loadCurrentParams();
    if (loadedParams) {
      setParams(loadedParams);
    }
    
    const loadedPanel = loadCurrentPanel();
    if (loadedPanel) {
      setPanel(loadedPanel);
    }
    
    // Charger les projets sauvegardés
    const projects = loadAllProjects();
    setSavedProjects(projects);
  }, []);

  // Gestionnaire de mise à jour des paramètres
  const handleParamsUpdate = (updatedParams: PanelParams) => {
    setParams(updatedParams);
    saveCurrentParams(updatedParams);
  };

  // Gestionnaire de mise à jour des bacs
  const handleWoodBinsUpdate = (updatedBins: WoodBin[]) => {
    const updatedParams = { ...params, woodBins: updatedBins };
    setParams(updatedParams);
    saveCurrentParams(updatedParams);
  };

  // Génération du panneau
  const handleGeneratePanel = () => {
    try {
      setIsGenerating(true);
      
      // Validation des proportions
      const totalProportion = params.woodBins.reduce((sum, bin) => sum + bin.proportion, 0);
      if (Math.abs(totalProportion - 100) > 0.1) {
        toast({
          title: "Erreur de proportion",
          description: "La somme des proportions doit être égale à 100%",
          variant: "destructive"
        });
        return;
      }
      
      const generatedPanel = generatePanel(params);
      setPanel(generatedPanel);
      saveCurrentPanel(generatedPanel);
      
      toast({
        title: "Panneau généré",
        description: `${generatedPanel.planks.length} planches générées.`
      });
    } catch (error) {
      toast({
        title: "Erreur de génération",
        description: error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Sauvegarde du projet
  const handleSaveProject = () => {
    if (!projectName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer un nom pour votre projet",
        variant: "destructive"
      });
      return;
    }
    
    const projectId = saveProject(projectName, params, panel);
    
    // Mettre à jour la liste des projets
    const updatedProjects = loadAllProjects();
    setSavedProjects(updatedProjects);
    
    setShowSaveDialog(false);
    setProjectName("");
    
    toast({
      title: "Projet sauvegardé",
      description: `Le projet "${projectName}" a été sauvegardé avec succès.`
    });
  };

  // Chargement d'un projet
  const handleLoadProject = (projectId: string) => {
    const project = loadProject(projectId);
    if (project) {
      setParams(project.params);
      setPanel(project.panel);
      
      // Sauvegarder comme projet actuel
      saveCurrentParams(project.params);
      saveCurrentPanel(project.panel);
      
      setShowLoadDialog(false);
      
      toast({
        title: "Projet chargé",
        description: `Le projet "${project.name}" a été chargé avec succès.`
      });
    } else {
      toast({
        title: "Erreur",
        description: "Le projet n'a pas pu être chargé",
        variant: "destructive"
      });
    }
  };

  // Suppression d'un projet
  const handleDeleteProject = (projectId: string) => {
    const success = deleteProject(projectId);
    if (success) {
      // Mettre à jour la liste des projets
      const updatedProjects = loadAllProjects();
      setSavedProjects(updatedProjects);
      
      toast({
        title: "Projet supprimé",
        description: "Le projet a été supprimé avec succès"
      });
    } else {
      toast({
        title: "Erreur",
        description: "Le projet n'a pas pu être supprimé",
        variant: "destructive"
      });
    }
  };

  // Formatage de la date
  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-wood-dark">Générateur de Panneaux</h1>
        
        <div className="flex items-center gap-2">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Save className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">Sauvegarder le projet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-6">
                <div className="space-y-2">
                  <Label htmlFor="project-name" className="text-lg">Nom du projet</Label>
                  <Input
                    id="project-name"
                    placeholder="Mon projet de panneau"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="h-14 text-lg"
                  />
                </div>
                
                <div className="flex justify-end space-x-4 mt-6">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowSaveDialog(false)}
                    className="h-12 text-lg"
                  >
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleSaveProject}
                    className="h-12 text-lg"
                  >
                    Sauvegarder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12">
                <Folder className="h-6 w-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-2xl">Charger un projet</DialogTitle>
              </DialogHeader>
              <div className="max-h-[70vh] overflow-y-auto py-4">
                {savedProjects.length === 0 ? (
                  <p className="text-center py-12 text-muted-foreground text-lg">
                    Aucun projet sauvegardé
                  </p>
                ) : (
                  <div className="space-y-3">
                    {savedProjects.map((project) => (
                      <div 
                        key={project.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted"
                      >
                        <div>
                          <p className="font-medium text-lg">{project.name}</p>
                          <p className="text-muted-foreground">
                            {formatDate(project.date)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="lg"
                            onClick={() => handleLoadProject(project.id)}
                            className="h-12"
                          >
                            Charger
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="lg"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-12"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche: Paramètres */}
        <div className="lg:col-span-1 space-y-6">
          <PanelParameters 
            params={params} 
            onChange={handleParamsUpdate} 
            onGenerate={handleGeneratePanel}
            isGenerating={isGenerating}
          />
          <WoodBins bins={params.woodBins} onChange={handleWoodBinsUpdate} />
        </div>
        
        {/* Colonne de droite: Visualisation */}
        <div className="lg:col-span-2 space-y-6">
          <PanelVisualization panel={panel} />
        </div>
      </div>
    </div>
  );
};

export default Index;
