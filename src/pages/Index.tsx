
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

// Composants
import PanelParameters from '@/components/PanelParameters';
import WoodBins from '@/components/WoodBins';
import PanelVisualization from '@/components/PanelVisualization';
import AssemblyInstructions from '@/components/AssemblyInstructions';

const Index = () => {
  const { toast } = useToast();
  
  // États pour les paramètres et résultats
  const [params, setParams] = useState<PanelParams>({
    minPlankLength: 20,
    maxPlankLength: 100,
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
    <div className="container py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-wood-dark mb-2">Générateur de Panneaux</h1>
        <p className="text-lg text-muted-foreground">
          Créez et visualisez des panneaux de bois lamellé-collé pour vos projets de menuiserie
        </p>
      </div>
      
      {/* Actions rapides */}
      <div className="flex justify-center mb-8 space-x-4">
        <Button
          onClick={handleGeneratePanel}
          disabled={isGenerating}
          className="bg-wood-dark hover:bg-wood-darker text-white"
          size="lg"
        >
          {isGenerating ? "Génération en cours..." : "Générer un panneau"}
        </Button>
        
        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              Sauvegarder le projet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sauvegarder le projet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Nom du projet</Label>
                <Input
                  id="project-name"
                  placeholder="Mon projet de panneau"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSaveProject}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        <Dialog open={showLoadDialog} onOpenChange={setShowLoadDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="lg">
              Charger un projet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Charger un projet</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              {savedProjects.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  Aucun projet sauvegardé
                </p>
              ) : (
                <div className="space-y-2">
                  {savedProjects.map((project) => (
                    <div 
                      key={project.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted"
                    >
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(project.date)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleLoadProject(project.id)}
                        >
                          Charger
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Colonne de gauche: Paramètres */}
        <div className="md:col-span-1 space-y-6">
          <PanelParameters params={params} onChange={handleParamsUpdate} />
          <WoodBins bins={params.woodBins} onChange={handleWoodBinsUpdate} />
        </div>
        
        {/* Colonne de droite: Visualisation et Instructions */}
        <div className="md:col-span-2 space-y-6">
          <PanelVisualization panel={panel} />
          <AssemblyInstructions panel={panel} woodBins={params.woodBins} />
        </div>
      </div>
    </div>
  );
};

export default Index;
