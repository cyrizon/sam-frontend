import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

interface RouteInstructionsProps {
  routesData: any; // Les données des itinéraires de l'API smart-route
}

const RouteInstructions: React.FC<RouteInstructionsProps> = ({ routesData }) => {
  const [selectedRouteKey, setSelectedRouteKey] = useState<string>('');

  // Extraire les clés des itinéraires disponibles (exclure 'status')
  const availableRoutes = routesData 
    ? Object.keys(routesData).filter(key => key !== 'status' && routesData[key]?.route)
    : [];

  // Sélectionner automatiquement le premier itinéraire si aucun n'est sélectionné
  useEffect(() => {
    if (availableRoutes.length > 0 && !selectedRouteKey) {
      setSelectedRouteKey(availableRoutes[0]);
    }
  }, [availableRoutes, selectedRouteKey]);

  // Si pas de données ou pas d'itinéraires disponibles, ne rien afficher
  if (!routesData || availableRoutes.length === 0) {
    console.log('RouteInstructions: Pas de données disponibles', routesData);
    return null;
  }

  console.log('RouteInstructions: Données reçues', routesData);
  console.log('RouteInstructions: Itinéraires disponibles', availableRoutes);

  const selectedRoute = routesData[selectedRouteKey];
  
  // Essayer plusieurs chemins possibles pour accéder aux instructions
  let steps: any[] = [];
  if (selectedRoute?.route?.features?.[0]?.properties?.segments?.[0]?.steps) {
    steps = selectedRoute.route.features[0].properties.segments[0].steps;
  } else if (selectedRoute?.route?.features?.[0]?.properties?.steps) {
    steps = selectedRoute.route.features[0].properties.steps;
  } else if (selectedRoute?.steps) {
    steps = selectedRoute.steps;
  }

  console.log('Selected route data:', selectedRoute);
  console.log('Steps found:', steps);
  // Fonction pour formater la durée
  const formatDuration = (durationInSeconds: number): string => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    const seconds = Math.floor(durationInSeconds % 60);
    
    if (hours > 0) {
      return `${hours}h${minutes.toString().padStart(2, '0')}`;
    } else if (minutes > 0) {
      return `${minutes} min`;
    } else {
      return `${seconds} sec`;
    }
  };

  // Fonction pour formater la distance
  const formatDistance = (distanceInMeters: number): string => {
    if (distanceInMeters >= 1000) {
      return `${(distanceInMeters / 1000).toFixed(1)} km`;
    }
    return `${Math.round(distanceInMeters)} m`;
  };

  // Fonction pour obtenir le nom d'affichage du type d'itinéraire
  const getRouteDisplayName = (routeKey: string): string => {
    switch (routeKey) {
      case 'fastest':
        return 'Le plus rapide';
      case 'cheapest':
        return 'Le plus économique';
      case 'min_tolls':
        return 'Minimum de péages';
      default:
        return `Itinéraire ${routeKey}`;
    }  };  

  // Fonction pour générer et télécharger le PDF
  const downloadPDF = () => {
    if (!selectedRoute || steps.length === 0) {
      alert('Aucune instruction disponible pour générer le PDF.');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;
    const lineHeight = 8;
    const margin = 20;

    // Titre du document
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Instructions d\'itinéraire', margin, yPosition);
    yPosition += 15;

    // Informations de l'itinéraire
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    const routeName = getRouteDisplayName(selectedRouteKey);
    doc.text(`Itinéraire: ${routeName}`, margin, yPosition);
    yPosition += lineHeight;
    
    doc.text(`Durée: ${formatDuration(selectedRoute.duration)}`, margin, yPosition);
    yPosition += lineHeight;
    
    doc.text(`Coût: ${selectedRoute.cost?.toFixed(2)} €`, margin, yPosition);
    yPosition += lineHeight;
    
    doc.text(`Nombre de péages: ${selectedRoute.toll_count}`, margin, yPosition);
    yPosition += lineHeight * 2;

    // Ligne de séparation
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Instructions
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Instructions détaillées:', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    steps.forEach((step: any, index: number) => {
      // Vérifier si on a besoin d'une nouvelle page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      // Numéro et instruction
      const stepNumber = `${index + 1}.`;
      const instruction = step.instruction || 'Instruction non disponible';
      
      doc.setFont(undefined, 'bold');
      doc.text(stepNumber, margin, yPosition);
      
      doc.setFont(undefined, 'normal');
      // Diviser le texte si trop long
      const splitInstruction = doc.splitTextToSize(instruction, pageWidth - margin - 30);
      doc.text(splitInstruction, margin + 15, yPosition);
      
      yPosition += splitInstruction.length * lineHeight + 2;

      // Nom de la route si disponible
      if (step.name && step.name !== '') {
        doc.setFont(undefined, 'italic');
        doc.text(`Route: ${step.name}`, margin + 15, yPosition);
        yPosition += lineHeight;
      }

      // Distance et durée
      doc.setFont(undefined, 'normal');
      doc.setFontSize(8);
      const details = `Distance: ${formatDistance(step.distance)} - Durée: ${formatDuration(step.duration)}`;
      doc.text(details, margin + 15, yPosition);
      yPosition += lineHeight + 3;
      
      doc.setFontSize(10);
    });

    // Footer
    const now = new Date();
    const dateStr = now.toLocaleDateString('fr-FR') + ' à ' + now.toLocaleTimeString('fr-FR');
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text(`Généré le ${dateStr}`, margin, pageHeight - 10);

    // Télécharger le PDF
    const fileName = `instructions_${routeName.replace(/\s+/g, '_').toLowerCase()}_${now.getTime()}.pdf`;
    doc.save(fileName);
  };

  // Fonction pour obtenir l'icône selon le type d'instruction
  const getInstructionIcon = (type: number): string => {
    switch (type) {
      case 0: return '↰'; // Turn left
      case 1: return '↱'; // Turn right
      case 2: return '↰'; // Turn sharp left
      case 3: return '↱'; // Turn sharp right
      case 4: return '↰'; // Turn slight left
      case 5: return '↱'; // Turn slight right
      case 6: return '↑'; // Continue straight
      case 7: return '↻'; // Enter roundabout
      case 8: return '↻'; // Exit roundabout
      case 9: return '↩'; // U-turn
      case 10: return '🏁'; // Goal
      case 11: return '🚀'; // Depart      
      case 12: return '←'; // Keep left      case 13: return '→'; // Keep right
      default: return '↑';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Instructions d'itinéraire</h2>
        {steps.length > 0 && (
          <button
            onClick={downloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            <span>📄</span>
            Télécharger PDF
          </button>        )}
      </div>

      {/* Boutons de sélection d'itinéraire */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {availableRoutes.map((routeKey) => {
          const route = routesData[routeKey];
          const isSelected = selectedRouteKey === routeKey;
          
          return (
            <button
              key={routeKey}
              onClick={() => setSelectedRouteKey(routeKey)}
              className={`px-4 py-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              <div className="text-center">
                <div className="font-semibold mb-1">{getRouteDisplayName(routeKey)}</div>
                <div className="flex items-center justify-center gap-2 text-xs opacity-90">
                  <span className="flex items-center gap-1">
                    <span>⏱️</span>
                    {formatDuration(route.duration)}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>💰</span>
                    {route.cost?.toFixed(2)}€
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span>🛣️</span>
                    {route.toll_count}
                  </span>
                </div>
              </div>
            </button>
          );        })}
      </div>

      {/* Instructions de l'itinéraire sélectionné */}
      {steps.length > 0 ? (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <div className="text-sm text-gray-600 mb-3 font-medium">
            {steps.length} étape{steps.length !== 1 ? 's' : ''} pour cet itinéraire
          </div>
          {steps.map((step: any, index: number) => (
            <div key={index} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full text-lg font-medium text-blue-600">
                {getInstructionIcon(step.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 mb-2 leading-relaxed">
                  {step.instruction}
                </div>
                {step.name && step.name !== '' && (
                  <div className="text-xs text-blue-600 mb-2 font-medium">
                    🛣️ {step.name}
                  </div>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span>📏</span>
                    {formatDistance(step.distance)}
                  </span>
                  <span className="flex items-center gap-1">
                    <span>⏱️</span>
                    {formatDuration(step.duration)}
                  </span>
                </div>
              </div>
              <div className="flex-shrink-0 text-xs text-gray-400 font-mono">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg">
          <div className="text-4xl mb-4">🗺️</div>
          <p className="text-lg font-medium mb-2">Aucune instruction disponible</p>
          <p className="text-sm">Les instructions détaillées pour cet itinéraire ne sont pas encore disponibles.</p>
        </div>
      )}
    </div>
  );
};

export default RouteInstructions;
