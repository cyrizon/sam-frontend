import React, { useEffect, useState } from 'react';
import './styles/App.css';
import Header from './components/Header';
import RouteCalculationBox from './components/RouteCalculationBox';
import RouteOptions from './components/RouteOptions';
import MapView from './components/MapView';
import MapDetails from './components/MapDetails';
import { fetchHello } from './services/api'; // Import de la fonction API
import { useCalculateRoute } from './hooks/useCalculateRoute';
import { useMap } from './hooks/useMap';
import type { RouteData } from './types/RouteData';

const routesData: Record<string, RouteData> = {
  fastest: { name: "Le plus rapide", distance: 320, duration: { hours: 3, minutes: 20 }, cost: 48.7, tolls: 3, color: 'blue', icon: 'bolt' },
  cheapest: { name: "Le plus économique", distance: 380, duration: { hours: 4, minutes: 10 }, cost: 32.2, tolls: 1, color: 'green', icon: 'euro-sign' },
  heavy: { name: "Péage important (75%)", distance: 330, duration: { hours: 3, minutes: 30 }, cost: 52.0, tolls: 4, color: 'red', icon: 'truck-moving' },
  moderate: { name: "Péage modéré (50%)", distance: 350, duration: { hours: 3, minutes: 45 }, cost: 42.5, tolls: 2, color: 'yellow', icon: 'road' },
  light: { name: "Péage léger (25%)", distance: 370, duration: { hours: 4, minutes: 5 }, cost: 36.8, tolls: 1, color: 'purple', icon: 'leaf' },
};

function App() {
  const [helloMessage, setHelloMessage] = useState<string>('');
  const [departure, setDeparture] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [maxTolls, setMaxTolls] = useState<string>('');

  const { customRoute, handleCalculate } = useCalculateRoute(routesData);
  const { selectedRoute, mapLoading, mapDetailsVisible, mapRef, handleSelectRoute } = useMap();

  const position: [number, number] = [48.8584, 2.2945]; // Tour Eiffel

  useEffect(() => {
    console.log("useEffect exécuté");
    const fetchData = async () => {
      try {
        const message = await fetchHello();
        setHelloMessage(message);
        console.log("Message du serveur:", message);
      } catch (error) {
        console.error("Erreur lors de la récupération du message:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main className="container mx-auto px-4 py-6 space-y-6">
        <RouteCalculationBox
          departure={departure}
          setDeparture={setDeparture}
          destination={destination}
          setDestination={setDestination}
          maxTolls={maxTolls}
          setMaxTolls={setMaxTolls}
          loading={false}
          handleCalculate={() => handleCalculate(null)}
        />
        <RouteOptions
          routesData={routesData}
          selectedRoute={selectedRoute}
          onSelectRoute={handleSelectRoute}
          customRoute={customRoute}
        />
        <MapView position={position} />
        <MapDetails route={customRoute} visible={mapDetailsVisible} />
      </main>
    </div>
  );
}

export default App;
