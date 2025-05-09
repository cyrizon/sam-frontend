import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';

type MapViewProps = {
  position: [number, number];
  geoJSONData?: any;
};

const MapView: React.FC<MapViewProps> = ({ position, geoJSONData }) => (
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
        {geoJSONData && (
          <GeoJSON
            data={geoJSONData}
            style={() => ({ color: '#ff7800', weight: 5, opacity: 0.65 })}
          />
        )}
      </MapContainer>
    </div>
  </div>
);

export default MapView;