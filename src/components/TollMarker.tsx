import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import tollIconUrl from '../assets/toll-icon.svg';

type Toll = {
    id: number;
    nom: string;
    autoroute: string;
    longitude: number;
    latitude: number;
};

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
                {toll.autoroute && <p>Autoroute : {toll.autoroute}</p>}
                <p>Longitude : {toll.longitude}</p>
                <p>Latitude : {toll.latitude}</p>
                <p>ID : {toll.id}</p>
            </div>
        </Popup>
    </Marker>
);

export default TollMarker;