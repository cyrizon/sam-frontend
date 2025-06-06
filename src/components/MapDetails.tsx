import type { RouteData } from '../types/RouteData';

type MapDetailsProps = {
  route: RouteData | null;
  visible: boolean;
};

const MapDetails: React.FC<MapDetailsProps> = ({ route, visible }) => {
  if (!route || !visible) return null;

  return (
    <div id="map-details" className="mt-6">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h3 id="map-route-name" className="font-bold text-lg">{route.name}</h3>
        <span id="map-route-cost" className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {route.cost.toFixed(2)} €
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Distance</p>
          <p id="map-distance" className="font-bold">{route.distance} km</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Durée</p>
          <p id="map-duration" className="font-bold">{route.duration.hours}h{route.duration.minutes}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Péages</p>
          <p id="map-tolls" className="font-bold">{route.tolls}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-xs text-gray-500 uppercase font-medium mb-1">Économie</p>
          <p id="map-savings" className="font-bold text-green-600">
            {((route.cost - route.cost)).toFixed(2)} €
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapDetails;