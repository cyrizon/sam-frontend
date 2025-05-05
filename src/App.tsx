import './App.css'
import 'leaflet/dist/leaflet.css'
import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet'

type Duration = { hours: number; minutes: number };
type RouteData = { name: string; distance: number; duration: Duration; cost: number; tolls: number; color: string; icon: string };

const routesData: Record<string, RouteData> = {
  fastest: { name: "Le plus rapide", distance: 320, duration: { hours: 3, minutes: 20 }, cost: 48.7, tolls: 3, color: 'blue', icon: 'bolt' },
  cheapest: { name: "Le plus économique", distance: 380, duration: { hours: 4, minutes: 10 }, cost: 32.2, tolls: 1, color: 'green', icon: 'euro-sign' },
  heavy: { name: "Péage important (75%)", distance: 330, duration: { hours: 3, minutes: 30 }, cost: 52.0, tolls: 4, color: 'red', icon: 'truck-moving' },
  moderate: { name: "Péage modéré (50%)", distance: 350, duration: { hours: 3, minutes: 45 }, cost: 42.5, tolls: 2, color: 'yellow', icon: 'road' },
  light: { name: "Péage léger (25%)", distance: 370, duration: { hours: 4, minutes: 5 }, cost: 36.8, tolls: 1, color: 'purple', icon: 'leaf' },
};

function App() {
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [maxTolls, setMaxTolls] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [customRoute, setCustomRoute] = useState<RouteData | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapDetailsVisible, setMapDetailsVisible] = useState(false);

  const optionsRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Détermine l'itinéraire personnalisé selon maxTolls
  const calculateCustomRoute = (tolls: number): RouteData => {
    if (tolls === 0) return routesData.cheapest;
    if (tolls === 1) return routesData.light;
    if (tolls === 2) return routesData.moderate;
    if (tolls === 3) return routesData.heavy;
    if (tolls >= 4) return routesData.fastest;
    return routesData.moderate;
  };

  // Gestion du clic "Calculer"
  const handleCalculate = () => {
    if (!departure || !destination) {
      alert('Veuillez saisir une ville de départ et une destination');
      return;
    }
    setLoading(true);
    setShowOptions(false);
    setMapDetailsVisible(false);

    setTimeout(() => {
      const num = maxTolls ? parseInt(maxTolls) : NaN;
      const custom = !isNaN(num) ? calculateCustomRoute(num) : routesData.fastest;
      setCustomRoute(custom);
      setShowOptions(true);
      setSelectedRoute(maxTolls ? 'custom' : 'fastest');
      setLoading(false);
      optionsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
  };

  // Lorsqu'un itinéraire est sélectionné
  const handleSelectRoute = (routeType: string) => {
    setSelectedRoute(routeType);
    setMapLoading(true);
    setMapDetailsVisible(false);
    mapRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Met à jour l'affichage de la carte après sélection
  useEffect(() => {
    if (selectedRoute) {
      const timer = setTimeout(() => {
        setMapLoading(false);
        setMapDetailsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [selectedRoute]);

  // Récupère les données de l'itinéraire courant
  const getRoute = (): RouteData | null => {
    if (!selectedRoute) return null;
    return selectedRoute === 'custom' ? customRoute : routesData[selectedRoute];
  };

  const position: [number, number] = [48.8584, 2.2945]; // Tour Eiffel

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header Minimal */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 flex items-center">
          <i className="fas fa-route text-blue-600 text-2xl mr-2"></i>
          <h1 className="text-xl font-bold text-gray-800">SAM - Smart Auto Mapper</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Route Calculation Box */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Calcul d'itinéraire</h2>
          <div className="space-y-4">
            {/* Départ */}
            <div>
              <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-1">Départ</label>
              <div className="relative">
                <input
                  type="text"
                  id="departure"
                  placeholder="Ville de départ"
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={departure}
                  onChange={e => setDeparture(e.target.value)}
                />
                <i className="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"></i>
              </div>
            </div>

            {/* Destination */}
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <div className="relative">
                <input
                  type="text"
                  id="destination"
                  placeholder="Ville d'arrivée"
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                />
                <i className="fas fa-flag-checkered icon absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"></i>
              </div>
            </div>

            {/* Toll Constraints */}
            <div>
              <label htmlFor="max-tolls" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre maximum de péages (optionnel)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="max-tolls"
                  min="0"
                  placeholder="Ex: 2 (laisser vide pour aucune contrainte)"
                  className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={maxTolls}
                  onChange={e => setMaxTolls(e.target.value)}
                />
                <i className="fas fa-tag icon absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"></i>
              </div>
            </div>

            <div>
              <button
                onClick={handleCalculate}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition shadow-md flex items-center justify-center"
                disabled={loading}
              >
                <span>{loading ? 'Chargement...' : 'Calculer l\'itinéraire'}</span>
                {loading && <i className="fas fa-circle-notch animate-spin ml-2" />}
              </button>
            </div>
          </div>
        </div>

        {/* Options d'itinéraire */}
        {showOptions && (
          <div ref={optionsRef} className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Options d'itinéraire</h2>
            <div className="space-y-4">
              {Object.entries(routesData).map(([key, data]) => (
                <div
                  key={key}
                  className={`route-card bg-${data.color}-50 p-4 rounded-lg cursor-pointer border border-${data.color}-100 ${selectedRoute === key ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => handleSelectRoute(key)}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`bg-${data.color}-100 p-2 rounded-full`}>
                      <i className={`fas fa-${data.icon} text-${data.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium text-${data.color}-800`}>{data.name}</h4>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div className="bg-white p-1.5 rounded text-center">
                          <p className="text-gray-500">Distance</p>
                          <p className={`font-bold text-${data.color}-800`}>{data.distance} km</p>
                        </div>
                        <div className="bg-white p-1.5 rounded text-center">
                          <p className="text-gray-500">Durée</p>
                          <p className={`font-bold text-${data.color}-800`}>{data.duration.hours}h{data.duration.minutes}</p>
                        </div>
                        <div className="bg-white p-1.5 rounded text-center">
                          <p className="text-gray-500">Coût</p>
                          <p className={`font-bold text-${data.color}-800`}>{data.cost.toFixed(2)}€</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{data.tolls} péages</p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Itinéraire personnalisé */}
              {customRoute && (
                <div className="mt-6 custom-route-result">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-medium text-lg text-gray-800">Itinéraire personnalisé</h3>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Recommandé</span>
                  </div>
                  <div
                    id="custom-route-card"
                    className={`bg-gray-50 p-4 rounded-lg custom-route-selectable ${selectedRoute === 'custom' ? 'custom-route-selected' : ''}`}
                    onClick={() => handleSelectRoute('custom')}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <i className="fas fa-star text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">Optimisé selon vos critères</h4>
                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                          <div className="bg-white p-1.5 rounded text-center">
                            <p className="text-gray-500">Distance</p>
                            <p className="font-bold text-gray-800">{customRoute.distance} km</p>
                          </div>
                          <div className="bg-white p-1.5 rounded text-center">
                            <p className="text-gray-500">Durée</p>
                            <p className="font-bold text-gray-800">{customRoute.duration.hours}h{customRoute.duration.minutes}</p>
                          </div>
                          <div className="bg-white p-1.5 rounded text-center">
                            <p className="text-gray-500">Coût</p>
                            <p className="font-bold text-gray-800">{customRoute.cost.toFixed(2)}€</p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          <i className="fas fa-road mr-1" />{customRoute.tolls} péage(s) | <span className="text-green-600">
                            <i className="fas fa-coins mr-1" />{(routesData.fastest.cost - customRoute.cost).toFixed(2)}€ d'économie
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button onClick={() => handleSelectRoute('custom')} className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                      <i className="fas fa-map-marked-alt mr-2" /> Voir cet itinéraire sur la carte
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Visualisation de l'itinéraire</h2>
          <div className="h-screen">
            <MapContainer center={position} zoom={13} className="h-full w-full rounded-lg">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
            </MapContainer>
          </div>
        </div>

        <div id="map-details" className={`${mapDetailsVisible ? '' : 'hidden'} mt-6`}>     
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 id="map-route-name" className="font-bold text-lg">{getRoute()?.name}</h3>
              <span id="map-route-cost" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {getRoute()?.cost.toFixed(2)} €
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Distance</p>
                <p id="map-distance" className="font-bold">{getRoute()?.distance} km</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Durée</p>
                <p id="map-duration" className="font-bold">{getRoute()?.duration.hours}h{getRoute()?.duration.minutes}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Péages</p>
                <p id="map-tolls" className="font-bold">{getRoute()?.tolls}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">Économie</p>
                <p id="map-savings" className="font-bold text-green-600">
                  {((routesData.fastest.cost - (getRoute()?.cost || 0))).toFixed(2)} €
                </p>
              </div>
            </div>
          </div>
      </main>
    </div>
  );
}

export default App
