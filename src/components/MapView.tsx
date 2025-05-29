import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import TollMarker from './TollMarker';

type Toll = {
  id: number;
  nom: string;
  autoroute: string;
  longitude: number;
  latitude: number;
};

type MapViewProps = {
  position: [number, number];
  geoJSONData?: any[]; // <--- Tableau de GeoJSON
  tolls?: Toll[];
};

const colors = ['#ff7800', '#0074D9', '#2ECC40', '#FF4136', '#B10DC9']; // couleurs différentes

const MapView: React.FC<MapViewProps> = ({ position, geoJSONData = [], tolls }) => (
  console.log('MapView rendered with position:', position, 'geoJSONData:', geoJSONData, 'tolls:', tolls),
  <div className="bg-white rounded-xl shadow-md p-6">
    <h2 className="text-xl font-semibold text-gray-800 mb-4">Visualisation de l'itinéraire</h2>
    <div className="relative" style={{ width: '100%', paddingBottom: '60%' }}>
      <MapContainer
        center={position}
        zoom={13}
        style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geoJSONData && geoJSONData.map && geoJSONData.map((feature, idx) => (
          <GeoJSON
            key={idx}
            data={feature}
            style={() => ({
              color: colors[idx % colors.length],
              weight: 5,
              opacity: 0.65
            })}
          />
        ))}
        {tolls && tolls.map((toll) => <TollMarker key={toll.id} toll={toll} />)}
      </MapContainer>
    </div>
  </div>
);

export default MapView;