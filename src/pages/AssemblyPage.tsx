
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Panel } from '@/utils/panelGenerator';
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react';
import { loadCurrentPanel, loadCurrentParams } from '@/utils/storage';

const AssemblyPage = () => {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [woodBins, setWoodBins] = useState<any[]>([]);
  const [currentPlank, setCurrentPlank] = useState<number>(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Charger le panneau et les paramètres depuis le stockage local
    const loadedPanel = loadCurrentPanel();
    const loadedParams = loadCurrentParams();
    
    if (loadedPanel) {
      setPanel(loadedPanel);
    }
    
    if (loadedParams) {
      setWoodBins(loadedParams.woodBins);
    }
  }, []);
  
  const goToNextPlank = () => {
    if (panel && currentPlank < panel.planks.length - 1) {
      setCurrentPlank(currentPlank + 1);
    }
  };

  const goToPreviousPlank = () => {
    if (currentPlank > 0) {
      setCurrentPlank(currentPlank - 1);
    }
  };
  
  const goToHomePage = () => {
    navigate('/');
  };
  
  if (!panel || panel.planks.length === 0) {
    return (
      <div className="container py-8">
        <Card>
          <CardHeader>
            <CardTitle>Instructions d'assemblage</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">Aucun panneau généré. Veuillez d'abord générer un panneau.</p>
            <Button onClick={goToHomePage}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à la conception
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const plank = panel.planks[currentPlank];
  const woodBin = woodBins.find(bin => bin.id === plank?.binId) || { 
    id: -1, 
    name: "Bac inconnu", 
    color: "#cccccc" 
  };
  
  const totalPlanks = panel.planks.length;
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Instructions d'assemblage</h1>
        <Button variant="outline" onClick={goToHomePage}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la conception
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Étape {currentPlank + 1} sur {totalPlanks}</span>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToPreviousPlank}
                disabled={currentPlank === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={goToNextPlank}
                disabled={currentPlank === totalPlanks - 1}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-wood-muted p-6 rounded-lg border">
                <h3 className="text-xl font-medium mb-4">Planche #{plank.id}</h3>
                <div className="space-y-4 text-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">Bac:</span>
                    <div className="flex items-center">
                      <div 
                        className="w-6 h-6 rounded-full mr-2" 
                        style={{ backgroundColor: woodBin.color }}
                      />
                      <span>{woodBin.name}</span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Dimensions:</span>
                    <span>{plank.length.toFixed(1)} cm</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="w-full max-w-md aspect-video bg-gray-100 border rounded-lg relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div 
                    className="h-24 w-80 rounded-md" 
                    style={{ backgroundColor: woodBin.color }}
                  >
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xl font-bold" style={{ color: getContrastColor(woodBin.color) }}>
                        Planche #{plank.id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des planches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Planche</TableHead>
                  <TableHead>Bac</TableHead>
                  <TableHead className="text-right">Dimensions (cm)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {panel.planks.map((p, index) => {
                  const bin = woodBins.find(b => b.id === p.binId) || { name: "Inconnu", color: "#cccccc" };
                  return (
                    <TableRow 
                      key={p.id}
                      className={currentPlank === index ? "bg-wood-muted font-medium" : ""}
                      style={{ cursor: "pointer" }}
                      onClick={() => setCurrentPlank(index)}
                    >
                      <TableCell>#{p.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div 
                            className="w-4 h-4 rounded-full mr-2" 
                            style={{ backgroundColor: bin.color }}
                          />
                          <span>{bin.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">{p.length.toFixed(1)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Fonction utilitaire pour déterminer la couleur de texte contrastante
const getContrastColor = (hexColor: string): string => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export default AssemblyPage;
