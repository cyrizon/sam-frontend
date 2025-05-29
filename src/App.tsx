import React, { useEffect, useState, useRef } from 'react';
import './styles/App.css';
import Header from './components/Header';
import RouteCalculationBox from './components/RouteCalculationBox';
import RouteOptions from './components/RouteOptions';
import MapView from './components/MapView';
import MapDetails from './components/MapDetails';
import { useCalculateRoute } from './hooks/useCalculateRoute';
import { useMap } from './hooks/useMap';
import type { RouteData } from './types/RouteData';
import { fetchHello, fetchMockRoute, fetchTolls, fetchORSRoute, fetchORSRoutePost, fetchSmartRoute, geocodeSearch, geocodeAutocomplete, fetchRoute, fetchRouteTollFree } from './services/api';
import { parseRouteToGeoJSON } from './utils/parseRouteToGeoJSON';
import proj4 from "proj4";

const routesData: Record<string, RouteData> = {
  fastest: { name: "Le plus rapide", distance: 320, duration: { hours: 3, minutes: 20 }, cost: 48.7, tolls: 3, color: 'blue', icon: 'bolt' },
  cheapest: { name: "Le plus économique", distance: 380, duration: { hours: 4, minutes: 10 }, cost: 32.2, tolls: 1, color: 'green', icon: 'euro-sign' },
  heavy: { name: "Péage important (75%)", distance: 330, duration: { hours: 3, minutes: 30 }, cost: 52.0, tolls: 4, color: 'red', icon: 'truck-moving' },
  moderate: { name: "Péage modéré (50%)", distance: 350, duration: { hours: 3, minutes: 45 }, cost: 42.5, tolls: 2, color: 'yellow', icon: 'road' },
  light: { name: "Péage léger (25%)", distance: 370, duration: { hours: 4, minutes: 5 }, cost: 36.8, tolls: 1, color: 'purple', icon: 'leaf' },
};

// Définition des projections
const lambert93 = "+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs";
const wgs84 = "EPSG:4326";

function App() {
  const [geoJSONData, setGeoJSONData] = useState<any[]>([]);
  const [helloMessage, setHelloMessage] = useState<string>('');
  const [departure, setDeparture] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [maxTolls, setMaxTolls] = useState<string>('');
  const [tollsData, setTollsData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [departureSuggestions, setDepartureSuggestions] = useState<any[]>([]);
  const [autocompleteLoading, setAutocompleteLoading] = useState(false);
  const [destinationSuggestions, setDestinationSuggestions] = useState<any[]>([]);
  const [destinationAutocompleteLoading, setDestinationAutocompleteLoading] = useState(false);
  const [departureSelected, setDepartureSelected] = useState(false);
  const [destinationSelected, setDestinationSelected] = useState(false);
  const [departureFeature, setDepartureFeature] = useState<any | null>(null);
  const [destinationFeature, setDestinationFeature] = useState<any | null>(null);

  const departureAutocompleteLoading = useRef<ReturnType<typeof setTimeout> | null>(null);
  const destinationAutocompleteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { customRoute, handleCalculate: calculateRoute } = useCalculateRoute(routesData);
  const { selectedRoute, mapLoading, mapDetailsVisible, mapRef, handleSelectRoute } = useMap();

  const position: [number, number] = [48.8584, 2.2945]; // Tour Eiffel

  console.log(tollsData);

  const handleFetchRoute = async () => {
    setError(null);
    try {
      const data = await fetchMockRoute();
      console.log("Données de l'itinéraire :", data);

      const geojson = parseRouteToGeoJSON(data);
      if (Array.isArray(geojson)) {
        setGeoJSONData(geojson);
      } else if (geojson) {
        setGeoJSONData([geojson]);
      } else {
        setGeoJSONData([]);
        setError("Format de données d'itinéraire inconnu.");
      }
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleClearRoute = () => {
    setGeoJSONData([]);
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

      // Correction : conversion uniquement si nécessaire
      const tollsWGS84 = tolls.map((toll: any) => {
        const [longitude, latitude] = proj4(lambert93, wgs84, [toll.longitude, toll.latitude]);
        return {
          id: toll.id,
          nom: toll.nom || toll.id || "Péage",
          autoroute: toll.autoroute || "",
          latitude,
          longitude,
        };
      });

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

  const handleFetchOrs = async () => {
    setError(null);
    try {
      const data = await fetchORSRoute();
      const geojson = parseRouteToGeoJSON(data);
      if (Array.isArray(geojson)) {
        setGeoJSONData(geojson);
      } else if (geojson) {
        setGeoJSONData([geojson]);
      } else {
        setGeoJSONData([]);
        setError("Format de données d'itinéraire inconnu.");
      }
      console.log("Données GeoJSON récupérées :", data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleFetchOrsPost = async () => {
    setError(null);
    try {
      const data = await fetchORSRoutePost();
      const geojsonArray = parseRouteToGeoJSON(data);
      if (Array.isArray(geojsonArray)) {
        setGeoJSONData(geojsonArray);
      } else if (geojsonArray) {
        setGeoJSONData([geojsonArray]);
      } else {
        setGeoJSONData([]);
        setError("Format de données d'itinéraire inconnu.");
      }
      console.log("Données GeoJSON reçues (ORS POST):", data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleFetchSmartRoute = async () => {
    setError(null);
    try {
      const data = await fetchSmartRoute();
      const geojsonArray: any[] = [];
      Object.values(data).forEach((route: any) => {
        if (route && route.type === "FeatureCollection") {
          geojsonArray.push(route);
        }
      });
      if (geojsonArray.length > 0) {
        setGeoJSONData(geojsonArray);
      } else {
        setGeoJSONData([]);
        setError("Aucun itinéraire trouvé dans la réponse.");
      }
      console.log("Données GeoJSON reçues (Smart Route):", data);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleCalculate = async () => {
    setError(null);
    if (!departureFeature || !destinationFeature) {
      setError("Veuillez sélectionner un point de départ et d'arrivée dans la liste.");
      return;
    }
    const startCoords = departureFeature.geometry.coordinates;
    const endCoords = destinationFeature.geometry.coordinates;
    try {
      let data;
      if (!maxTolls) {
        console.log("Calcul d'un itinéraire");
        data = await fetchRoute(startCoords, endCoords);
      } else if (maxTolls === "0") {
        console.log("Calcul d'un itinéraire sans péage");
        data = await fetchRouteTollFree([startCoords, endCoords]);
      } else {
        setError("La prise en compte du nombre de péage est en développement. Ne rien mettre dans le champ ou mettre 0 pour un itinéraire sans péage.");
        return;
      }
      console.log("Données de l'itinéraire :", data); 
      const geojson = parseRouteToGeoJSON(data);
      if (Array.isArray(geojson)) {
        setGeoJSONData(geojson);
      } else if (geojson) {
        setGeoJSONData([geojson]);
      } else {
        setGeoJSONData([]);
        setError("Format de données d'itinéraire inconnu.");
      }
    } catch (error: any) {
      setError(error.message);
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

  useEffect(() => {
    const fetchData = async () => {
      setError(null);
      try {
        const message = await fetchHello();
        setHelloMessage(message);
        console.log("Message du serveur:", message);
      } catch (error: any) {
        setError(error.message);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}
        <RouteCalculationBox
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
          loading={false}
          handleCalculate={handleCalculate}
          handleFetchRoute={handleFetchRoute}
          handleClearRoute={handleClearRoute}
          handleFetchTolls={handleFetchTolls}
          handleClearTolls={handleClearTolls}
          handleFetchOrs={handleFetchOrs}
          handleFetchOrsPost={handleFetchOrsPost}
          handleFetchSmartRoute={handleFetchSmartRoute}
        />
        <RouteOptions
          routesData={routesData}
          selectedRoute={selectedRoute}
          onSelectRoute={handleSelectRoute}
          customRoute={customRoute}
        />
        <MapView position={position} geoJSONData={geoJSONData} tolls={tollsData} />
        <MapDetails route={customRoute} visible={mapDetailsVisible} />
      </main>
    </div>
  );
}

export default App;
