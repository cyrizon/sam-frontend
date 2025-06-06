import React from 'react';
import AutocompleteInput from './AutocompleteInput';

interface RouteCalculationBoxProps {
  departure: string;
  setDeparture: (value: string) => void;
  departureSuggestions: any[];
  setDepartureSuggestions: (s: any[]) => void;
  departureAutocompleteLoading: boolean;
  departureSelected: boolean;
  setDepartureSelected: (b: boolean) => void;
  setDepartureFeature: (feature: any) => void;
  destination: string;
  setDestination: (value: string) => void;
  destinationSuggestions: any[];
  setDestinationSuggestions: (s: any[]) => void;
  destinationAutocompleteLoading: boolean;
  destinationSelected: boolean;
  setDestinationSelected: (b: boolean) => void;
  setDestinationFeature: (feature: any) => void;
  maxTolls: string;
  setMaxTolls: (value: string) => void;
  maxBudget: string;
  setMaxBudget: (value: string) => void;
  maxBudgetPercent: string;
  setMaxBudgetPercent: (value: string) => void;
  routeOptimizationType: 'tolls' | 'budget';
  setRouteOptimizationType: (value: 'tolls' | 'budget') => void;
  loading: boolean;
  handleCalculate: () => void;
  handleFetchRoute: () => void;
  handleClearRoute: () => void;
  handleFetchTolls: () => void;
  handleClearTolls: () => void;
  handleFetchOrs: () => void;
  handleFetchOrsPost: () => void;
  handleFetchSmartRoute: () => void;
}

const RouteCalculationBox: React.FC<RouteCalculationBoxProps> = ({
  departure,
  setDeparture,
  departureSuggestions,
  setDepartureSuggestions,
  departureAutocompleteLoading,
  departureSelected,
  setDepartureSelected,
  setDepartureFeature,
  destination,
  setDestination,
  destinationSuggestions,
  setDestinationSuggestions,
  destinationAutocompleteLoading,
  destinationSelected,
  setDestinationSelected,
  setDestinationFeature,
  maxTolls,
  setMaxTolls,
  maxBudget,
  setMaxBudget,
  maxBudgetPercent,
  setMaxBudgetPercent,
  routeOptimizationType,
  setRouteOptimizationType,
  loading,
  handleCalculate,
  handleFetchRoute,
  handleClearRoute,
  handleFetchTolls,
  handleClearTolls,
  handleFetchOrs,
  handleFetchOrsPost,
  handleFetchSmartRoute,
}) => {
  // Fonction pour valider les entrées numériques
  const validateNumberInput = (value: string, min: number, max: number | null): string => {
    if (value === '') return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    if (numValue < min) return min.toString();
    if (max !== null && numValue > max) return max.toString();
    return value;
  };

  // Gestion des changements des champs d'optimisation
  const handleOptimizationTypeChange = (type: 'tolls' | 'budget') => {
    setRouteOptimizationType(type);
    // Réinitialiser les champs non utilisés
    if (type === 'tolls') {
      setMaxBudget('');
      setMaxBudgetPercent('');
    } else {
      setMaxTolls('');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Calcul d'itinéraire</h2>
      <div className="space-y-4">
        {/* Départ */}
        <AutocompleteInput
          label="Départ"
          id="departure"
          placeholder="Ville de départ"
          value={departure}
          onChange={setDeparture}
          suggestions={departureSuggestions}
          loading={departureAutocompleteLoading}
          selected={departureSelected}
          onSelectSuggestion={(feature: any) => {
            setDeparture(feature.properties.label);
            setDepartureSelected(true);
            setDepartureSuggestions([]);
            setDepartureFeature(feature); // <-- stocke la feature complète
          }}
        />

        {/* Destination */}
        <AutocompleteInput
          label="Destination"
          id="destination"
          placeholder="Ville d'arrivée"
          value={destination}
          onChange={setDestination}
          suggestions={destinationSuggestions}
          loading={destinationAutocompleteLoading}
          selected={destinationSelected}
          onSelectSuggestion={(feature: any) => {
            setDestination(feature.properties.label);
            setDestinationSelected(true);
            setDestinationSuggestions([]);
            setDestinationFeature(feature); // <-- stocke la feature complète
          }}
        />        {/* Optimization Type Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type d'optimisation
          </label>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition shadow-md flex items-center justify-center gap-2 ${
                routeOptimizationType === 'tolls'
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => handleOptimizationTypeChange('tolls')}
            >
              <i className="fas fa-tag"></i>
              <span>Par nombre de péages</span>
            </button>
            <button
              type="button"
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition shadow-md flex items-center justify-center gap-2 ${
                routeOptimizationType === 'budget'
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => handleOptimizationTypeChange('budget')}
            >
              <i className="fas fa-euro-sign"></i>
              <span>Par budget</span>
            </button>
          </div>
        </div>        {/* Toll Constraints - Only visible when toll optimization is selected */}
        {routeOptimizationType === 'tolls' && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 shadow-sm">
            <label htmlFor="max-tolls" className="block text-sm font-medium text-blue-700 mb-2">
              Nombre maximum de péages
            </label>
            <div className="relative">
              <input
                type="number"
                id="max-tolls"
                min="0"
                placeholder="Ex: 2"
                className="w-full pl-10 px-4 py-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                value={maxTolls}
                onChange={(e) => setMaxTolls(validateNumberInput(e.target.value, 0, null))}
              />
              <i className="fas fa-tag icon absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 pointer-events-none"></i>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              <i className="fas fa-info-circle mr-1"></i>
              Définissez le nombre maximum de péages que vous êtes prêt à traverser
            </p>
          </div>
        )}

        {/* Budget Constraints - Only visible when budget optimization is selected */}
        {routeOptimizationType === 'budget' && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-sm space-y-4">
            <div>
              <label htmlFor="max-budget" className="block text-sm font-medium text-green-700 mb-2">
                Budget maximum en euros (€)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="max-budget"
                  min="0"
                  step="0.01"
                  placeholder="Ex: 25.50"
                  className={`w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 bg-white ${
                    maxBudget ? 'border-green-400 focus:ring-green-500 focus:border-green-500' : 'border-gray-300'
                  }`}
                  value={maxBudget}
                  onChange={(e) => {
                    setMaxBudget(validateNumberInput(e.target.value, 0, null));
                    // Vider le champ pourcentage si un budget est spécifié
                    if (e.target.value) setMaxBudgetPercent('');
                  }}
                />
                <i className="fas fa-euro-sign icon absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 pointer-events-none"></i>
              </div>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <i className="fas fa-info-circle mr-1"></i>
                <span>Laissez vide si vous utilisez un pourcentage</span>
              </p>
            </div>

            <div className="relative">
              <div className="flex items-center">
                <div className="h-0.5 flex-grow bg-gray-300"></div>
                <span className="mx-2 text-sm text-gray-500 font-medium">OU</span>
                <div className="h-0.5 flex-grow bg-gray-300"></div>
              </div>
            </div>

            <div>
              <label htmlFor="max-budget-percent" className="block text-sm font-medium text-green-700 mb-2">
                Pourcentage du budget maximum (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="max-budget-percent"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="Ex: 75"
                  className={`w-full pl-10 px-4 py-3 border rounded-lg focus:ring-2 bg-white ${
                    maxBudgetPercent ? 'border-green-400 focus:ring-green-500 focus:border-green-500' : 'border-gray-300'
                  }`}
                  value={maxBudgetPercent}
                  onChange={(e) => {
                    setMaxBudgetPercent(validateNumberInput(e.target.value, 0, 100));
                    // Vider le champ budget si un pourcentage est spécifié
                    if (e.target.value) setMaxBudget('');
                  }}
                />
                <i className="fas fa-percent icon absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 pointer-events-none"></i>
              </div>
              <p className="text-xs text-green-600 mt-1 flex items-center">
                <i className="fas fa-info-circle mr-1"></i>
                <span>Laissez vide si vous utilisez un montant en euros</span>
              </p>
            </div>
          </div>
        )}

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
        {/* Test ORS POST */}
        <div>
          <button
            onClick={handleFetchOrsPost}
            className="w-full bg-yellow-700 text-white py-3 px-4 rounded-lg font-medium hover:bg-yellow-800 transition shadow-md flex items-center justify-center"
          >
            Test ORS POST
          </button>
        </div>        {/* Smart Route Button */}
        <div>
          <button
            onClick={handleFetchSmartRoute}
            className={`w-full py-4 px-4 rounded-lg font-medium transition shadow-md flex items-center justify-center gap-2 text-white ${
              routeOptimizationType === 'tolls' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            <i className={`fas ${routeOptimizationType === 'tolls' ? 'fa-road' : 'fa-chart-line'} text-xl`}></i>
            <span className="text-lg">Calculer itinéraire optimisé</span>
            <i className="fas fa-arrow-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteCalculationBox;