import type { RouteData } from '../types/RouteData';
import clsx from 'clsx';

type RouteOptionsProps = {
  routesData: Record<string, RouteData>;
  selectedRoute: string | null;
  onSelectRoute: (routeType: string) => void;
  customRoute: RouteData | null;
};

const colorClasses: Record<string, { text: string; bg50: string; bg100: string }> = {
  blue: { text: 'text-blue-600', bg50: 'bg-blue-50', bg100: 'bg-blue-100' },
  green: { text: 'text-green-600', bg50: 'bg-green-50', bg100: 'bg-green-100' },
  red: { text: 'text-red-600', bg50: 'bg-red-50', bg100: 'bg-red-100' },
  yellow: { text: 'text-yellow-600', bg50: 'bg-yellow-50', bg100: 'bg-yellow-100' },
  purple: { text: 'text-purple-600', bg50: 'bg-purple-50', bg100: 'bg-purple-100' },
};

const RouteOptions: React.FC<RouteOptionsProps> = ({ routesData, selectedRoute, onSelectRoute, customRoute }) => (
  <div className="bg-white rounded-xl shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Options d'itinéraire</h2>
    <div className="space-y-4">
      {Object.entries(routesData).map(([key, data]) => (
        <div
          key={key}
          className={clsx(
            'route-card p-4 rounded-lg cursor-pointer border hover:shadow-lg transition',
            selectedRoute === key ? 'ring-2 ring-blue-500' : '',
            `bg-${data.color}-50 border-${data.color}-100`
          )}
          onClick={() => onSelectRoute(key)}
        >
          <div className="flex items-start space-x-3">
            <div className={`bg-${data.color}-100 p-2 rounded-full`}>
              <i className={`fas fa-${data.icon} ${colorClasses[data.color]?.text}`} />
            </div>
            <div className="flex-1">
              <h4 className={`font-medium ${colorClasses[data.color]?.text}`}>{data.name}</h4>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white p-1.5 rounded flex items-center justify-center">
                  <i className="fas fa-road text-gray-500 mr-2"></i>
                  <p className="text-gray-500 mr-1">Distance</p>
                  <p className={`font-bold ${colorClasses[data.color]?.text}`}>{data.distance} km</p>
                </div>
                <div className="bg-white p-1.5 rounded flex items-center justify-center">
                  <i className="fas fa-clock text-gray-500 mr-2"></i>
                  <p className="text-gray-500 mr-1">Durée</p>
                  <p className={`font-bold ${colorClasses[data.color]?.text}`}>
                    {data.duration.hours}h{data.duration.minutes}
                  </p>
                </div>
                <div className="bg-white p-1.5 rounded flex items-center justify-center">
                  <i className="fas fa-euro-sign text-gray-500 mr-2"></i>
                  <p className="text-gray-500 mr-1">Coût</p>
                  <p className={`font-bold ${colorClasses[data.color]?.text}`}>{data.cost.toFixed(2)}€</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{data.tolls} péages</p>
            </div>
          </div>
        </div>
      ))}

      {customRoute && (
        <div className="mt-6 custom-route-result">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg text-gray-800">Itinéraire personnalisé</h3>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">Recommandé</span>
          </div>
          <div
            id="custom-route-card"
            className={`bg-gray-50 p-4 rounded-lg custom-route-selectable cursor-pointer ${
              selectedRoute === 'custom' ? 'ring-2 ring-blue-500' : ''
            } hover:shadow-lg transition`}
            onClick={() => onSelectRoute('custom')}
          >
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <i className="fas fa-star text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">Optimisé selon vos critères</h4>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div className="bg-white p-1.5 rounded flex items-center justify-center">
                    <i className="fas fa-road text-gray-500 mr-2"></i>
                    <p className="text-gray-500 mr-1">Distance</p>
                    <p className="font-bold text-gray-800">{customRoute.distance} km</p>
                  </div>
                  <div className="bg-white p-1.5 rounded flex items-center justify-center">
                    <i className="fas fa-clock text-gray-500 mr-2"></i>
                    <p className="text-gray-500 mr-1">Durée</p>
                    <p className="font-bold text-gray-800">
                      {customRoute.duration.hours}h{customRoute.duration.minutes}
                    </p>
                  </div>
                  <div className="bg-white p-1.5 rounded flex items-center justify-center">
                    <i className="fas fa-euro-sign text-gray-500 mr-2"></i>
                    <p className="text-gray-500 mr-1">Coût</p>
                    <p className="font-bold text-gray-800">{customRoute.cost.toFixed(2)}€</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  <i className="fas fa-road mr-1" />
                  {customRoute.tolls} péage(s) |{' '}
                  <span className="text-green-600">
                    <i className="fas fa-coins mr-1" />
                    {(routesData.fastest.cost - customRoute.cost).toFixed(2)}€ d'économie
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default RouteOptions;