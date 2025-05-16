import React from 'react';

interface RouteCalculationBoxProps {
  departure: string;
  setDeparture: (value: string) => void;
  destination: string;
  setDestination: (value: string) => void;
  maxTolls: string;
  setMaxTolls: (value: string) => void;
  loading: boolean;
  handleCalculate: () => void;
  handleFetchRoute: () => void;
  handleClearRoute: () => void;
  handleFetchTolls: () => void;
  handleClearTolls: () => void;
  handleFetchOrs: () => void;
}

const RouteCalculationBox: React.FC<RouteCalculationBoxProps> = ({
  departure,
  setDeparture,
  destination,
  setDestination,
  maxTolls,
  setMaxTolls,
  loading,
  handleCalculate,
  handleFetchRoute,
  handleClearRoute,
  handleFetchTolls,
  handleClearTolls,
  handleFetchOrs,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Calcul d'itinéraire</h2>
      <div className="space-y-4">
        {/* Départ */}
        <div>
          <label htmlFor="departure" className="block text-sm font-medium text-gray-700 mb-1">
            Départ
          </label>
          <div className="relative">
            <input
              type="text"
              id="departure"
              placeholder="Ville de départ"
              className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={departure}
              onChange={(e) => setDeparture(e.target.value)}
            />
            <i className="fas fa-map-marker-alt absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"></i>
          </div>
        </div>

        {/* Destination */}
        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
            Destination
          </label>
          <div className="relative">
            <input
              type="text"
              id="destination"
              placeholder="Ville d'arrivée"
              className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
            <i className="fas fa-flag-checkered icon absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"></i>
          </div>
        </div>

        {/* Toll Constraints */}
        <div>
          <label htmlFor="max-tolls" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre maximum d'entrées-sorties de péages (optionnel)
          </label>
          <div className="relative">
            <input
              type="number"
              id="max-tolls"
              min="0"
              placeholder="Ex: 2 (laisser vide pour aucune contrainte)"
              className="w-full pl-10 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={maxTolls}
              onChange={(e) => setMaxTolls(e.target.value)}
            />
            <i className="fas fa-tag icon absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"></i>
          </div>
        </div>

        {/* Calculate Button */}
        <div>
          <button
            onClick={handleCalculate}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition shadow-md flex items-center justify-center"
            disabled={loading}
          >
            <span>{loading ? 'Chargement...' : "Calculer l'itinéraire"}</span>
            {loading && <i className="fas fa-circle-notch animate-spin ml-2" />}
          </button>
        </div>

        {/* Show mock route */}
        <div>
          <button
            onClick={handleFetchRoute}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition shadow-md flex items-center justify-center"
          >
            Afficher un itinéraire fictif
          </button>
        </div>

        {/* Clear route */}
        <div>
          <button
            onClick={handleClearRoute}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition shadow-md flex items-center justify-center"
          >
            Vider l'itinéraire
          </button>
        </div>

        {/* Show tolls on route */}
        <div>
          <button
            onClick={handleFetchTolls}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition shadow-md flex items-center justify-center"
          >
            Afficher les péages
          </button>
        </div>

        {/* Clear tolls */}
        <div>
          <button
            onClick={handleClearTolls}
            className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition shadow-md flex items-center justify-center"
          >
            Vider la liste des péages
          </button>
        </div>
        {/* Test ors */}
        <div>
          <button
            onClick={handleFetchOrs}
            className="w-full bg-yellow-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-700 transition shadow-md flex items-center justify-center"
          >
            Test ORS
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteCalculationBox;