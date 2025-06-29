import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import tollIconUrl from '../assets/toll-icon.svg';
import type { Toll } from '../types/Toll'; // ou './types/Toll' selon l'emplacement du fichier

// Ajout des nouveaux champs dans Toll : operator, type, distance_route

type TollMarkerProps = {
    toll: Toll;
};

const TollMarker: React.FC<TollMarkerProps> = ({ toll }) => (
    <Marker
        position={[toll.latitude, toll.longitude]}
        icon={L.icon({
            iconUrl: tollIconUrl,
            iconSize: [25, 25],
            iconAnchor: [12, 25],
            popupAnchor: [0, -25],
        })}
    >
        <Popup>
            <div className="text-sm">
                <p className="font-semibold">{toll.nom || 'Péage sans nom'}</p>
                {toll.operator && <p>Opérateur : {toll.operator}</p>}
                {toll.autoroute && <p>Autoroute : {toll.autoroute}</p>}
                {toll.type && <p>Type : {toll.type === 'ouvert' ? 'Ouvert' : 'Fermé'}</p>}
                {typeof toll.distance_route === 'number' && (
                  <p>Distance à la route : {toll.distance_route.toLocaleString()} m</p>
                )}
                <p>Longitude : {toll.longitude}</p>
                <p>Latitude : {toll.latitude}</p>
            </div>
        </Popup>
    </Marker>
);

export default TollMarker;