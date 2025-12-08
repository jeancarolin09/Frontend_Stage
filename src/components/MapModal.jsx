import React, { useEffect } from 'react';
import { X, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// --- Fix icône Leaflet ---
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Composant pour centrer la carte sur le marqueur ---
const FlyToMarker = ({ position }) => {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.setView(position, 15, { animate: true });
    }
  }, [position, map]);
  return null;
};

const MapModal = ({ latitude, longitude, locationName, onClose }) => {
  const lat = latitude ? parseFloat(latitude) : 48.8566; // Paris par défaut
  const lng = longitude ? parseFloat(longitude) : 2.3522;
  const position = [lat, lng];
  const name = locationName || 'Position non spécifiée';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto backdrop-blur-lg bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl md:max-w-3xl overflow-hidden relative">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg text-gray-700 hover:bg-gray-100 transition"
        >
          <X size={24} />
        </button>

        {/* En-tête */}
        <div className="p-4 border-b flex items-center gap-2">
          <MapPin size={24} className="text-purple-600" />
          <h3 className="text-xl font-bold text-gray-800">Localisation de l'événement</h3>
        </div>

        {/* Carte Leaflet */}
        <div className="w-full h-[50vh]">
          <MapContainer
            center={position}
            zoom={15}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={position}>
              <Popup>
                <div style={{ textAlign: 'center' }}>
                  <strong>{name}</strong>
                  <br />
                  Lat: {lat.toFixed(5)}, Lng: {lng.toFixed(5)}
                </div>
              </Popup>
            </Marker>
            <FlyToMarker position={position} />
          </MapContainer>
        </div>

        {/* Pied de page */}
        <div className="p-4 bg-gray-50 text-center text-sm text-gray-700">
          <p>
            <strong>{name}</strong>
            <br />
            Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
