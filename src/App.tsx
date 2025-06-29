import { useState, useRef, useEffect } from 'react';
import './styles/App.css';
import Header from './components/Header';
import RouteCalculationBox from './components/RouteCalculationBox';
// import RouteOptions from './components/RouteOptions'; // Commenté car non utilisé
import MapView from './components/MapView';
import MapDetails from './components/MapDetails';
import RouteInstructions from './components/RouteInstructions';
import LoadingModal from './components/LoadingModal';
import { useCalculateRoute } from './hooks/useCalculateRoute';
import { useMap } from './hooks/useMap';
import { useLoadingModal } from './hooks/useLoadingModal';
import type { RouteData } from './types/RouteData';
import type { Toll } from './types/Toll'; // ou './types/Toll' selon l'emplacement du fichier
import { fetchTolls, fetchSmartRouteTolls, fetchSmartRouteBudget, geocodeAutocomplete, fetchRoute } from './services/api';
import { parseRouteToGeoJSON } from './utils/parseRouteToGeoJSON';

const routesData: Record<string, RouteData> = {
  fastest: { name: "Le plus rapide", distance: 320, duration: { hours: 3, minutes: 20 }, cost: 48.7, tolls: 3, color: 'blue', icon: 'bolt' },
  cheapest: { name: "Le plus économique", distance: 380, duration: { hours: 4, minutes: 10 }, cost: 32.2, tolls: 1, color: 'green', icon: 'euro-sign' },
  heavy: { name: "Péage important (75%)", distance: 330, duration: { hours: 3, minutes: 30 }, cost: 52.0, tolls: 4, color: 'red', icon: 'truck-moving' },
  moderate: { name: "Péage modéré (50%)", distance: 350, duration: { hours: 3, minutes: 45 }, cost: 42.5, tolls: 2, color: 'yellow', icon: 'road' },
  light: { name: "Péage léger (25%)", distance: 370, duration: { hours: 4, minutes: 5 }, cost: 36.8, tolls: 1, color: 'purple', icon: 'leaf' },
};

// Interface pour les données de smart route
interface SmartRouteData {
  route: any;
  cost?: number;
  duration?: number;
  toll_count?: number;
  distance?: number;
}

interface SmartRouteResponse {
  status?: string;
  route?: any;
  distance?: number;
  duration?: number;
  cost?: number;
  toll_count?: number;
  tolls?: any[];
  instructions?: any[];
  toll_info?: any;
  segments?: any;
  target_tolls?: number;
  found_solution?: string;
  respects_constraint?: boolean;
  strategy_used?: string;
  selected_tolls?: string[];
  toll_systems?: string[];
  [key: string]: SmartRouteData | string | number | boolean | any[] | any | undefined;
}

function App() {  const [geoJSONData, setGeoJSONData] = useState<any[]>([]);
  const [departure, setDeparture] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [maxTolls, setMaxTolls] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [maxBudgetPercent, setMaxBudgetPercent] = useState<string>('');
  const [routeOptimizationType, setRouteOptimizationType] = useState<'tolls' | 'budget'>('tolls');
  const [tollsData, setTollsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [departureSuggestions, setDepartureSuggestions] = useState<any[]>([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [destinationAutocompleteLoading, setDestinationAutocompleteLoading] = useState(false);
  const [departureSelected, setDepartureSelected] = useState(false);  const [destinationSelected, setDestinationSelected] = useState(false);
  const [departureFeature, setDepartureFeature] = useState<any | null>(null);
  const [destinationFeature, setDestinationFeature] = useState<any | null>(null);  const [smartRouteData, setSmartRouteData] = useState<any>(null); // Nouveau état pour les données brutes de smart-route
  const [showTolls, setShowTolls] = useState<boolean>(false); // État pour afficher/masquer les péages

  const departureAutocompleteLoading = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationAutocompleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { customRoute } = useCalculateRoute(routesData);
  const { 
    isVisible: isLoadingModalVisible,
    isLoading: isRequestLoading,
    requestStartTime,
    requestDescription,
    responseData,
    startRequest,
    completeRequest,
    closeModal: closeLoadingModal
  } = useLoadingModal();
  // Commenté car RouteOptions n'est plus utilisé
  // const { selectedRoute, mapLoading, mapDetailsVisible, mapRef, handleSelectRoute } = useMap();
  const { mapDetailsVisible } = useMap(); // On garde seulement mapDetailsVisible qui pourrait être utilisé

  const position: [number, number] = [48.8584, 2.2945]; // Tour Eiffel
  // Auto-récupération/nettoyage des péages selon la checkbox
  useEffect(() => {
    if (showTolls && geoJSONData.length > 0 && !tollsData) {
      handleFetchTolls();
    } else if (!showTolls && tollsData) {
      // Nettoyer les données de péages quand la checkbox est décochée
      setTollsData(null);
      setError(null);
    }
  }, [showTolls, geoJSONData.length, tollsData]);

  console.log(tollsData);

  const handleClearRoute = () => {
    setGeoJSONData([]);
    setSmartRouteData(null);
    setError(null);
    console.log("Itinéraire vidé");
  };
  const handleFetchTolls = async () => {
    setError(null);
    let geojsonArray: any[] = [];
    if (Array.isArray(geoJSONData)) {
      geojsonArray = geoJSONData;
    } else if (geoJSONData) {
      geojsonArray = [geoJSONData];
    }
    if (!geojsonArray || geojsonArray.length === 0) {
      setError("Aucun itinéraire disponible pour calculer les péages.");
      return;
    }
    // Démarrer la modal de chargement
    startRequest("Recherche des péages sur l'itinéraire");
    try {
      const tolls = await fetchTolls(geojsonArray);
      // Correction : gérer à la fois un tableau plat ou un tableau de tableaux
      let tollsWGS84: any[] = [];
      if (Array.isArray(tolls) && tolls.length > 0) {
        if (Array.isArray(tolls[0])) {
          // Cas multi-trajets : tableau de tableaux
          tollsWGS84 = tolls.map((tollList: any[]) =>
            tollList
              .filter((toll: any) => Number.isFinite(Number(toll.latitude)) && Number.isFinite(Number(toll.longitude)))
              .map((toll: any) => ({
                id: toll.id,
                nom: toll.nom || toll.id || "Péage",
                autoroute: toll.autoroute || "",
                latitude: Number(toll.latitude),
                longitude: Number(toll.longitude),
                operator: toll.operator,
                type: toll.type,
                distance_route: toll.distance_route,
              }))
          );
        } else {
          // Cas unique : tableau plat
          tollsWGS84 = [
            tolls
              .filter((toll: any) => Number.isFinite(Number(toll.latitude)) && Number.isFinite(Number(toll.longitude)))
              .map((toll: any) => ({
                id: toll.id,
                nom: toll.nom || toll.id || "Péage",
                autoroute: toll.autoroute || "",
                latitude: Number(toll.latitude),
                longitude: Number(toll.longitude),
                operator: toll.operator,
                type: toll.type,
                distance_route: toll.distance_route,
              }))
          ];
        }
      } else {
        tollsWGS84 = [[]];
      }
      // Log pour debug
      console.log('Tolls reçus du backend:', tolls);
      console.log('Tolls après mapping/filter:', tollsWGS84);
      setTollsData(tollsWGS84);
      // Terminer la modal de chargement avec succès
      completeRequest({ tolls: tollsWGS84, count: tollsWGS84.flat().length });
    } catch (error: any) {
      setError(error.message);
      // Terminer la modal de chargement avec erreur
      completeRequest({ error: error.message, success: false });
    }
  };


  const handleFetchSmartRoute = async () => {
    setError(null);
    if (!departureFeature || !destinationFeature) {
      setError("Veuillez sélectionner un point de départ et d'arrivée dans la liste.");
      return;
    }
    
    const coords = [
      departureFeature.geometry.coordinates,
      destinationFeature.geometry.coordinates
    ];
    
    // Démarrer la modal de chargement
    const requestDesc = routeOptimizationType === 'tolls' 
      ? `Calcul d'itinéraire optimisé (max ${maxTolls} péages)`
      : `Calcul d'itinéraire optimisé (budget: ${maxBudget ? maxBudget + '€' : maxBudgetPercent + '%'})`;
    startRequest(requestDesc);
    
    try {
      let data: SmartRouteResponse;
      
      if (routeOptimizationType === 'tolls') {
        // Vérifier que le champ maxTolls n'est pas vide
        if (maxTolls === '') {
          setError("Veuillez spécifier un nombre maximum de péages.");
          return;
        }
        // Utiliser l'endpoint smart-route/tolls
        data = await fetchSmartRouteTolls(coords, parseInt(maxTolls), 'c1');
        console.log("Smart Route (Tolls) result:", data);
      } else { // routeOptimizationType === 'budget'
        // Vérifier qu'au moins un des champs de budget n'est pas vide
        if (maxBudget === '' && maxBudgetPercent === '') {
          setError("Veuillez spécifier soit un budget maximum en euros, soit un pourcentage.");
          return;
        }
        // Utiliser l'endpoint smart-route/budget
        const budget = maxBudget !== '' ? parseFloat(maxBudget) : undefined;
        // Correction: envoyer le pourcentage sous forme décimale (0-1)
        const budgetPercent = maxBudgetPercent !== '' ? parseFloat(maxBudgetPercent) / 100 : undefined;
        data = await fetchSmartRouteBudget(coords, budget, budgetPercent, 'c1');
        console.log("Smart Route (Budget) result:", data);
      }
      
      // Nouveau traitement pour la structure de réponse avec métadonnées
      const geojsonArray: any[] = [];
      const uniqueRouteHashes = new Set(); // Pour éviter les doublons d'itinéraires identiques
      const harmonizedSmartRouteData: any = {};
      // Vérifier si les données ont la nouvelle structure (avec cost, duration, toll_count)
      if (data.status) {
        console.log(`Statut de la requête: ${data.status}`);
        // Parcourir les différentes options (fastest, cheapest, min_tolls)
        for (const [key, routeData] of Object.entries(data)) {
          if (key === 'status') continue; // Ignorer le champ status
          const smartRouteData = routeData as SmartRouteData;
          if (smartRouteData && typeof smartRouteData === 'object' && smartRouteData.route) {
            // Créer un hash simple du tracé pour détecter les itinéraires identiques
            const routeCoords = smartRouteData.route.features?.[0]?.geometry?.coordinates;
            const routeHash = JSON.stringify(routeCoords?.length);
            // N'ajouter que si l'itinéraire n'est pas déjà présent
            if (routeCoords && !uniqueRouteHashes.has(routeHash)) {
              uniqueRouteHashes.add(routeHash);
              // Extraire distance/duration du summary si GeoJSON
              let distance = smartRouteData.distance;
              let duration = smartRouteData.duration;
              if (
                smartRouteData.route?.features?.[0]?.properties?.summary
              ) {
                const summary = smartRouteData.route.features[0].properties.summary;
                distance = summary.distance;
                duration = summary.duration;
              }
              // Ajouter des métadonnées à l'objet route
              const enrichedRoute = {
                ...smartRouteData.route,
                _metadata: {
                  type: key, // fastest, cheapest, ou min_tolls
                  cost: smartRouteData.cost,
                  duration,
                  distance,
                  toll_count: smartRouteData.toll_count
                }
              };
              geojsonArray.push(enrichedRoute);
              // Harmoniser pour RouteInstructions
              harmonizedSmartRouteData[key] = {
                ...smartRouteData,
                duration,
                distance
              };
            }
          }       
         }
      } else if (data.route && data.distance && data.duration) {        // Nouveau format d'API avec réponse directe (distance, duration, route, etc.)
        console.log("Nouveau format d'API détecté:", data);          console.log("Propriétés reçues du backend:");
        console.log("- instructions:", data.instructions ? "✅" : "❌");
        console.log("- cost:", data.cost !== undefined ? "✅" : "❌");
        console.log("- toll_count:", data.toll_count !== undefined ? "✅" : "❌");
        console.log("- target_tolls:", data.target_tolls !== undefined ? "✅" : "❌");
        console.log("- tolls:", data.tolls ? "✅" : "❌");
        console.log("- toll_info:", data.toll_info ? "✅" : "❌");
        console.log("- toll_info.selected_tolls:", data.toll_info?.selected_tolls ? "✅" : "❌");
        console.log("- toll_info.toll_systems:", data.toll_info?.toll_systems ? "✅" : "❌");
        console.log("- segments:", data.segments ? "✅" : "❌");
        
        const geojsonRoute = parseRouteToGeoJSON(data.route);
        if (geojsonRoute) {
          if (Array.isArray(geojsonRoute)) {
            geojsonArray.push(...geojsonRoute);
          } else {
            geojsonArray.push(geojsonRoute);
          }
        }        // Adapter les données pour RouteInstructions
        harmonizedSmartRouteData.itineraire = {
          route: data.route,
          distance: data.distance,
          duration: data.duration,
          cost: data.cost || null,
          toll_count: data.toll_count || data.target_tolls || null,
          found_solution: data.found_solution,
          respects_constraint: data.respects_constraint,
          strategy_used: data.strategy_used,
          instructions: data.instructions || null,  // ✅ Instructions directement dans data
          selected_tolls: data.toll_info?.selected_tolls || null,  // ✅ Extraction correcte
          toll_systems: data.toll_info?.toll_systems || null,  // ✅ Extraction correcte
          tolls: data.tolls || null,  // ✅ Informations détaillées des péages
          toll_info: data.toll_info || null,  // ✅ Informations complètes de localisation
          segments: data.segments || null  // ✅ Informations de segments
        };
        
        console.log("Données harmonisées pour RouteInstructions:", harmonizedSmartRouteData.itineraire);
      } else {
        // Ancien format (pour la rétrocompatibilité)
        Object.entries(data).forEach(([key, route]: any) => {
          if (route && route.type === "FeatureCollection") {
            geojsonArray.push(route);
            harmonizedSmartRouteData[key] = route;
          }
        });
      }
      if (geojsonArray.length > 0) {
        setGeoJSONData(geojsonArray);
        setSmartRouteData(harmonizedSmartRouteData);
        console.log(`${geojsonArray.length} itinéraires uniques chargés`);
      } else {
        setGeoJSONData([]);
        setSmartRouteData(null);
        setError("Aucun itinéraire trouvé ou tous les itinéraires sont identiques.");
      }
      
      console.log("Données GeoJSON traitées (Smart Route):", geojsonArray);
      console.log("Données harmonisées pour RouteInstructions:", harmonizedSmartRouteData);
      
      // Terminer la modal de chargement avec succès
      completeRequest(data);
    } catch (error: any) {
      setError(error.message);
      // Terminer la modal de chargement avec erreur
      completeRequest({ error: error.message, success: false });
    }
  };

  // Fonction combinée pour le calcul d'itinéraire optimisé
  const handleCalculateOptimized = async () => {
    setError(null);
    
    // Vider automatiquement la route précédente avant de calculer la nouvelle
    handleClearRoute();
    
    if (!departureFeature || !destinationFeature) {
      setError("Veuillez sélectionner un point de départ et d'arrivée dans la liste.");
      return;
    }
    
    // Vérifier s'il y a des contraintes
    const hasConstraints = 
      (routeOptimizationType === 'tolls' && maxTolls !== '') ||
      (routeOptimizationType === 'budget' && (maxBudget !== '' || maxBudgetPercent !== ''));
    
    if (hasConstraints) {
      // Utiliser la logique smart route
      await handleFetchSmartRoute();    } else {
      // Utiliser la logique de calcul classique et adapter pour les instructions
      startRequest("Calcul d'itinéraire classique");
      
      const startCoords = departureFeature.geometry.coordinates;
      const endCoords = destinationFeature.geometry.coordinates;
      try {
        const data = await fetchRoute([startCoords, endCoords]);
        console.log("Données de l'itinéraire classique :", data);
        
        const geojson = parseRouteToGeoJSON(data);
        if (Array.isArray(geojson)) {
          setGeoJSONData(geojson);
        } else if (geojson) {
          setGeoJSONData([geojson]);
        } else {
          setGeoJSONData([]);
          setError("Format de données d'itinéraire inconnu.");
        }
        // Passe la réponse brute à RouteInstructions
        // Harmoniser distance/duration pour le format classique aussi
        let distance = data.routes?.[0]?.summary?.distance;
        let duration = data.routes?.[0]?.summary?.duration;
        if (data.routes?.[0]?.segments?.[0]?.summary) {
          // Si ORS classique fournit summary dans segments
          const summary = data.routes[0].segments[0].summary;
          distance = summary.distance;
          duration = summary.duration;
        } else if (data.routes?.[0]?.features?.[0]?.properties?.summary) {
          // Si backend renvoie déjà du GeoJSON dans un tableau routes
          const summary = data.routes[0].features[0].properties.summary;
          distance = summary.distance;
          duration = summary.duration;
        } else if (data.type === 'FeatureCollection' && Array.isArray(data.features) && data.features[0]?.properties?.summary) {
          // Si la racine est un FeatureCollection (GeoJSON natif)
          const summary = data.features[0].properties.summary;
          distance = summary.distance;
          duration = summary.duration;
        }
        // Forcer la conversion en nombre (ou 0 si non défini)
        distance = typeof distance === 'number' ? distance : Number(distance) || 0;
        duration = typeof duration === 'number' ? duration : Number(duration) || 0;        setSmartRouteData({
          itineraire: {
            route: data,
            duration,
            distance,
            cost: data.cost ?? null, // Use backend-provided cost
            toll_count: data.toll_count ?? null // Use backend-provided toll_count
          }
        });
        
        // Terminer la modal de chargement avec succès
        completeRequest(data);
      } catch (error: any) {
        setError(error.message);
        // Terminer la modal de chargement avec erreur
        completeRequest({ error: error.message, success: false });
      }
    }
  };

  const handleDepartureChange = (value: string) => {
    setDeparture(value);
    setDepartureSelected(false);
    setDepartureSuggestions([]);
    if (departureAutocompleteLoading.current) clearTimeout(departureAutocompleteLoading.current);

    if (value.length > 3) {
      setAutocompleteLoading(true);
      departureAutocompleteLoading.current = setTimeout(async () => {
        try {
          const suggestions = await geocodeAutocomplete(value);
          setDepartureSuggestions(suggestions.features || []);
        } catch (error: any) {
          setError(error.message);
        } finally {
          setAutocompleteLoading(false);
        }
      }, 400); // 400ms debounce
    }
  };

  const handleDestinationChange = (value: string) => {
    setDestination(value);
    setDestinationSelected(false);
    setDestinationSuggestions([]);
    if (destinationAutocompleteTimer.current) clearTimeout(destinationAutocompleteTimer.current);

    if (value.length > 3) {
      setDestinationAutocompleteLoading(true);
      destinationAutocompleteTimer.current = setTimeout(async () => {
        try {
          const suggestions = await geocodeAutocomplete(value);
          setDestinationSuggestions(suggestions.features || []);
        } catch (error: any) {
          setError(error.message);
        } finally {
          setDestinationAutocompleteLoading(false);
        }
      }, 400);
    }
  };
  // Fusionne et déduplique les péages par id
  const uniqueTolls: Toll[] = tollsData
    ? Array.from(
        new Map(
          tollsData.flat().map((toll: any) => [toll.id, toll])
        ).values()
      ) as Toll[]
    : [];
  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}        <RouteCalculationBox
          departure={departure}
          setDeparture={handleDepartureChange}
          departureSuggestions={departureSuggestions}
          setDepartureSuggestions={setDepartureSuggestions}
          departureAutocompleteLoading={autocompleteLoading}
          departureSelected={departureSelected}
          setDepartureSelected={setDepartureSelected}
          setDepartureFeature={setDepartureFeature}
          destination={destination}
          setDestination={handleDestinationChange}
          destinationSuggestions={destinationSuggestions}
          setDestinationSuggestions={setDestinationSuggestions}
          destinationAutocompleteLoading={destinationAutocompleteLoading}
          destinationSelected={destinationSelected}
          setDestinationSelected={setDestinationSelected}
          setDestinationFeature={setDestinationFeature}
          maxTolls={maxTolls}
          setMaxTolls={setMaxTolls}
          maxBudget={maxBudget}
          setMaxBudget={setMaxBudget}
          maxBudgetPercent={maxBudgetPercent}
          setMaxBudgetPercent={setMaxBudgetPercent}
          routeOptimizationType={routeOptimizationType}          setRouteOptimizationType={setRouteOptimizationType}          handleCalculateOptimized={handleCalculateOptimized}
          showTolls={showTolls}
          setShowTolls={setShowTolls}
        />
        {/* Composant RouteOptions commenté car non utilisé
        <RouteOptions
          routesData={routesData}
          selectedRoute={selectedRoute}
          onSelectRoute={handleSelectRoute}
          customRoute={customRoute}
        />
        */}        <MapView
          position={position}
          geoJSONData={geoJSONData}
          tolls={showTolls ? uniqueTolls : []}
        />
        <RouteInstructions routesData={smartRouteData} />
        <MapDetails route={customRoute} visible={mapDetailsVisible} />      </main>
      
      {/* Modal de chargement */}
      <LoadingModal
        isVisible={isLoadingModalVisible}
        isLoading={isRequestLoading}
        requestStartTime={requestStartTime}
        requestDescription={requestDescription}
        responseData={responseData}
        onClose={closeLoadingModal}
      />
    </div>
  );
}

export default App;
