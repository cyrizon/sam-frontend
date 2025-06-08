import { useState, useRef } from 'react';
import './styles/App.css';
import Header from './components/Header';
import RouteCalculationBox from './components/RouteCalculationBox';
// import RouteOptions from './components/RouteOptions'; // Commenté car non utilisé
import MapView from './components/MapView';
import MapDetails from './components/MapDetails';
import RouteInstructions from './components/RouteInstructions';
import { useCalculateRoute } from './hooks/useCalculateRoute';
import { useMap } from './hooks/useMap';
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
}

interface SmartRouteResponse {
  status?: string;
  [key: string]: SmartRouteData | string | undefined;
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
  const [destinationFeature, setDestinationFeature] = useState<any | null>(null);
  const [smartRouteData, setSmartRouteData] = useState<any>(null); // Nouveau état pour les données brutes de smart-route

  const departureAutocompleteLoading = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationAutocompleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { customRoute } = useCalculateRoute(routesData);
  // Commenté car RouteOptions n'est plus utilisé
  // const { selectedRoute, mapLoading, mapDetailsVisible, mapRef, handleSelectRoute } = useMap();
  const { mapDetailsVisible } = useMap(); // On garde seulement mapDetailsVisible qui pourrait être utilisé

  const position: [number, number] = [48.8584, 2.2945]; // Tour Eiffel

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
    try {
      const tolls = await fetchTolls(geojsonArray);

      // Correction : gérer une liste de listes
      const tollsWGS84 = tolls.map((tollList: any[]) =>
        tollList.map((toll: any) => ({
          id: toll.id,
          nom: toll.nom || toll.id || "Péage",
          autoroute: toll.autoroute || "",
          latitude: toll.latitude ?? toll.lat,
          longitude: toll.longitude ?? toll.lon,
        }))
      );
      setTollsData(tollsWGS84);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleClearTolls = () => {
    setTollsData(null);
    setError(null);
    console.log("Données de péages vidées");
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
        const budgetPercent = maxBudgetPercent !== '' ? parseFloat(maxBudgetPercent) : undefined;
        data = await fetchSmartRouteBudget(coords, budget, budgetPercent, 'c1');
        console.log("Smart Route (Budget) result:", data);
      }
      
      // Nouveau traitement pour la structure de réponse avec métadonnées
      const geojsonArray: any[] = [];
      const uniqueRouteHashes = new Set(); // Pour éviter les doublons d'itinéraires identiques
      
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
              
              // Ajouter des métadonnées à l'objet route
              const enrichedRoute = {
                ...smartRouteData.route,
                _metadata: {
                  type: key, // fastest, cheapest, ou min_tolls
                  cost: smartRouteData.cost,
                  duration: smartRouteData.duration,
                  toll_count: smartRouteData.toll_count
                }
              };
              
              geojsonArray.push(enrichedRoute);
            }
          }
        }
      } else {
        // Ancien format (pour la rétrocompatibilité)
        Object.values(data).forEach((route: any) => {
          if (route && route.type === "FeatureCollection") {
            geojsonArray.push(route);
          }
        });
      }
      
      if (geojsonArray.length > 0) {
        setGeoJSONData(geojsonArray);
        console.log(`${geojsonArray.length} itinéraires uniques chargés`);
      } else {
        setGeoJSONData([]);
        setError("Aucun itinéraire trouvé ou tous les itinéraires sont identiques.");
      }
      console.log("Données GeoJSON traitées (Smart Route):", geojsonArray);
      
      // Stocker les données brutes pour les instructions
      setSmartRouteData(data);
    } catch (error: any) {
      setError(error.message);
    }
  };


  // Fonction combinée pour le calcul d'itinéraire optimisé
  const handleCalculateOptimized = async () => {
    setError(null);
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
      await handleFetchSmartRoute();
    } else {
      // Utiliser la logique de calcul classique et adapter pour les instructions
      const startCoords = departureFeature.geometry.coordinates;
      const endCoords = destinationFeature.geometry.coordinates;
      try {
        const data = await fetchRoute([startCoords, endCoords]);
        console.log("Données de l'itinéraire classique :", data);
        
        const geojson = parseRouteToGeoJSON(data);
        if (Array.isArray(geojson)) {
          setGeoJSONData(geojson);
          // Adapter pour RouteInstructions - mettre dans le même format que smart route
          setSmartRouteData({ 
            itineraire: { 
              route: geojson[0],
              cost: null,
              duration: geojson[0]?.features?.[0]?.properties?.segments?.[0]?.duration || null,
              toll_count: null
            } 
          });
        } else if (geojson) {
          setGeoJSONData([geojson]);
          setSmartRouteData({ 
            itineraire: { 
              route: geojson,
              cost: null,
              duration: geojson?.features?.[0]?.properties?.segments?.[0]?.duration || null,
              toll_count: null
            } 
          });
        } else {
          setGeoJSONData([]);
          setSmartRouteData(null);
          setError("Format de données d'itinéraire inconnu.");
        }
      } catch (error: any) {
        setError(error.message);
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

  // Test data pour RouteInstructions
  const addTestData = () => {
    const testData = {
      status: "success",
      fastest: {
        cost: 45.60,
        duration: 12600, // 3h30 en secondes
        toll_count: 3,
        route: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [[2.3522, 48.8566], [4.8357, 45.7640]]
            },
            properties: {
              segments: [{
                steps: [
                  {
                    type: 11,
                    instruction: "Départ de Paris",
                    name: "Rue de Rivoli",
                    distance: 0,
                    duration: 0
                  },
                  {
                    type: 1,
                    instruction: "Tourner à droite sur Boulevard Saint-Germain",
                    name: "Boulevard Saint-Germain",
                    distance: 500,
                    duration: 60
                  },
                  {
                    type: 6,
                    instruction: "Continuer tout droit sur A6 vers Lyon",
                    name: "A6 - Autoroute du Soleil",
                    distance: 350000,
                    duration: 10800
                  },
                  {
                    type: 5,
                    instruction: "Prendre légèrement à droite vers A7",
                    name: "A7",
                    distance: 120000,
                    duration: 1200
                  },
                  {
                    type: 10,
                    instruction: "Vous êtes arrivé à destination",
                    name: "Place Bellecour",
                    distance: 100,
                    duration: 30
                  }
                ]
              }]
            }
          }]
        }
      },
      cheapest: {
        cost: 32.40,
        duration: 14400, // 4h en secondes
        toll_count: 1,
        route: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "LineString", 
              coordinates: [[2.3522, 48.8566], [4.8357, 45.7640]]
            },
            properties: {
              segments: [{
                steps: [
                  {
                    type: 11,
                    instruction: "Départ de Paris",
                    name: "Rue de Rivoli",
                    distance: 0,
                    duration: 0
                  },
                  {
                    type: 0,
                    instruction: "Tourner à gauche sur les Quais de Seine",
                    name: "Quai de la Mégisserie",
                    distance: 800,
                    duration: 120
                  },
                  {
                    type: 6,
                    instruction: "Prendre la N7 vers Lyon",
                    name: "N7 - Route Nationale",
                    distance: 420000,
                    duration: 13800
                  },
                  {
                    type: 10,
                    instruction: "Vous êtes arrivé à destination",
                    name: "Place Bellecour",
                    distance: 200,
                    duration: 60
                  }
                ]
              }]
            }
          }]
        }
      },
      min_tolls: {
        cost: 38.20,
        duration: 13200, // 3h40 en secondes
        toll_count: 2,
        route: {
          type: "FeatureCollection",
          features: [{
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [[2.3522, 48.8566], [4.8357, 45.7640]]
            },
            properties: {
              segments: [{
                steps: [
                  {
                    type: 11,
                    instruction: "Départ de Paris",
                    name: "Rue de Rivoli",
                    distance: 0,
                    duration: 0
                  },
                  {
                    type: 1,
                    instruction: "Tourner à droite sur A6",
                    name: "A6",
                    distance: 1200,
                    duration: 90
                  },
                  {
                    type: 7,
                    instruction: "Prendre le rond-point, 2ème sortie",
                    name: "Rond-point de Fontainebleau",
                    distance: 300,
                    duration: 45
                  },
                  {
                    type: 6,
                    instruction: "Continuer sur A6 vers Lyon",
                    name: "A6",
                    distance: 380000,
                    duration: 12600
                  },
                  {
                    type: 10,
                    instruction: "Vous êtes arrivé à destination",
                    name: "Place Bellecour",
                    distance: 150,
                    duration: 45
                  }
                ]
              }]
            }
          }]
        }
      }
    };
    
    setSmartRouteData(testData);
  };

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
          routeOptimizationType={routeOptimizationType}
          setRouteOptimizationType={setRouteOptimizationType}
          handleCalculateOptimized={handleCalculateOptimized}
          handleClearRoute={handleClearRoute}
          handleFetchTolls={handleFetchTolls}
          handleClearTolls={handleClearTolls}
        />
        {/* Composant RouteOptions commenté car non utilisé
        <RouteOptions
          routesData={routesData}
          selectedRoute={selectedRoute}
          onSelectRoute={handleSelectRoute}
          customRoute={customRoute}
        />
        */}
        <MapView
          position={position}
          geoJSONData={geoJSONData}
          tolls={uniqueTolls}
        />
        <RouteInstructions routesData={smartRouteData} />
        <MapDetails route={customRoute} visible={mapDetailsVisible} />

        {/* Bouton de test temporaire pour RouteInstructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-800 mb-2">
            <strong>Test du composant RouteInstructions :</strong>
          </div>
          <button
            onClick={addTestData}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm font-medium"
          >
            Charger des données de test
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;
