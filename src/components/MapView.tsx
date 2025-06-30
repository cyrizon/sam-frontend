import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';
import TollMarker from './TollMarker';
import type { Toll } from '../types/Toll';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

type MapViewProps = {
  position: [number, number];
  geoJSONData?: any[]; // <--- Tableau de GeoJSON
  tolls?: Toll[];
};

// Couleurs par type d'itinéraire
const routeColors: Record<string, string> = {
  fastest: '#0074D9', // Bleu
  cheapest: '#2ECC40', // Vert 
  min_tolls: '#FF4136', // Rouge
  default: '#ff7800' // Orange (pour les itinéraires sans méta-données)
};

// Couleurs par défaut pour les itinéraires sans type spécifique
const defaultColors = ['#ff7800', '#0074D9', '#2ECC40', '#FF4136', '#B10DC9'];

// Fonction pour formater la durée en heures/minutes
const formatDuration = (durationInSeconds: number): string => {
  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
};

// Composant pour auto-fit la carte sur la bbox des routes
const MapAutoFit = ({ geoJSONData }: { geoJSONData: any[] }) => {
  const map = useMap();
  useEffect(() => {
    if (!geoJSONData || geoJSONData.length === 0) return;
    // Cherche la première bbox valide
    let bbox = null;
    for (const feature of geoJSONData) {
      if (feature.bbox && Array.isArray(feature.bbox) && feature.bbox.length >= 4) {
        bbox = feature.bbox;
        break;
      }
    }
    // Sinon, tente de prendre la bbox globale (cas ORS)
    if (!bbox && geoJSONData[0]?.bbox && Array.isArray(geoJSONData[0].bbox) && geoJSONData[0].bbox.length >= 4) {
      bbox = geoJSONData[0].bbox;
    }
    if (bbox) {
      // bbox = [minLon, minLat, maxLon, maxLat]
      const southWest: [number, number] = [bbox[1], bbox[0]];
      const northEast: [number, number] = [bbox[3], bbox[2]];
      map.fitBounds([southWest, northEast], { padding: [40, 40] });
    }
  }, [geoJSONData, map]);
  return null;
};

const MapView: React.FC<MapViewProps> = ({ position, geoJSONData = [], tolls }) => {
  console.log('MapView rendered with position:', position, 'geoJSONData:', geoJSONData, 'tolls:', tolls);
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Visualisation de l'itinéraire</h2>
      
      {/* Légende des itinéraires */}
      {geoJSONData && geoJSONData.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-4">
          {geoJSONData.map((feature, idx) => {
            const metadata = feature._metadata;
            const routeType = (metadata?.type as keyof typeof routeColors) || 'default';
            const color = metadata ? routeColors[routeType] : defaultColors[idx % defaultColors.length];
            
            return (
              <div key={idx} className="flex items-center">
                <span 
                  className="inline-block w-5 h-5 mr-2 rounded-sm" 
                  style={{ backgroundColor: color }}
                ></span>
                <span className="text-sm">
                  {metadata ? (
                    `${routeType === 'fastest' ? 'Le plus rapide' : 
                      routeType === 'cheapest' ? 'Le plus économique' : 
                      'Minimum de péages'} (${metadata.toll_count} péage${metadata.toll_count !== 1 ? 's' : ''})`
                  ) : (
                    `Itinéraire ${idx + 1}`
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
      
      <div 
        className="relative w-full h-96 sm:h-[500px] lg:h-[600px]" 
        style={{ 
          minHeight: '400px' // Sécurité supplémentaire
        }}
      >
        <MapContainer
          center={position}
          zoom={13}
          className="absolute inset-0 w-full h-full rounded-lg"
          style={{ 
            minHeight: '400px' // Hauteur minimale pour mobile
          }}
        >
          <MapAutoFit geoJSONData={geoJSONData} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {geoJSONData && geoJSONData.map && geoJSONData.map((feature, idx) => {
            const metadata = feature._metadata;
            const routeType = (metadata?.type as keyof typeof routeColors) || 'default';
            const color = metadata ? routeColors[routeType] : defaultColors[idx % defaultColors.length];
            
            return (
              <GeoJSON
                key={idx}
                data={feature}
                style={() => ({
                  color: color,
                  weight: 5,
                  opacity: 0.7
                })}
              >
                {metadata && (
                  <Tooltip sticky>
                    <div className="text-sm font-bold mb-1">
                      {routeType === 'fastest' ? 'Le plus rapide' : 
                       routeType === 'cheapest' ? 'Le plus économique' : 
                       'Minimum de péages'}
                    </div>
                    <div className="text-xs grid grid-cols-2 gap-x-3 gap-y-1">
                      <span>Durée:</span>
                      <span className="font-semibold">{formatDuration(metadata.duration)}</span>
                      
                      <span>Coût:</span>
                      <span className="font-semibold">{metadata.cost.toFixed(2)} €</span>
                      
                      <span>Péages:</span>
                      <span className="font-semibold">{metadata.toll_count}</span>
                    </div>
                  </Tooltip>
                )}
              </GeoJSON>
            );
          })}
          {tolls && tolls.map((toll) => <TollMarker key={toll.id} toll={toll} />)}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapView;