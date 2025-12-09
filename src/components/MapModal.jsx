import React, { useEffect, useRef, useState } from 'react';
import { X, MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// --- Fix icône Leaflet ---
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- Icône personnalisée de l'utilisateur ---
const userIcon = L.divIcon({
  className: "custom-user-icon",
  html: `<div style="background:#3b82f6;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 6px rgba(0,0,0,0.3)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// --- Routing Component ---
const RoutingMachine = ({ userPos, eventPos }) => {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!map || !userPos || !eventPos) return;

    if (controlRef.current) {
      map.removeControl(controlRef.current);
    }

    const control = L.Routing.control({
      waypoints: [
        L.latLng(userPos[0], userPos[1]),
        L.latLng(eventPos[0], eventPos[1])
      ],
      lineOptions: {
        styles: [{ color: '#3b82f6', weight: 5, opacity: 0.7 }]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      showAlternatives: false
    }).addTo(map);

    controlRef.current = control;

    return () => {
      if (controlRef.current) map.removeControl(controlRef.current);
    };
  }, [map, userPos, eventPos]);

  return null;
};

// --- Composant ---
const MapModal = ({ latitude, longitude, locationName, onClose }) => {
  const [userPos, setUserPos] = useState(null);

  const eventLat = latitude ? parseFloat(latitude) : 48.8566;
  const eventLng = longitude ? parseFloat(longitude) : 2.3522;
  const eventPos = [eventLat, eventLng];

  // 📍 Récupération de la position réelle de l'utilisateur
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        alert("Impossible d'obtenir votre position.");
      },
      { enableHighAccuracy: true }
    );
  }, []);

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-lg bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl md:max-w-3xl overflow-hidden relative">

        {/* ❌ Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100"
        >
          <X size={24} />
        </button>

        {/* 🗺️ MAP */}
        <MapContainer
          center={eventPos}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: "450px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* ⭐ Marqueur du lieu */}
          <Marker position={eventPos}>
            <Popup>
              📍 <strong>{locationName || "Lieu"}</strong>
            </Popup>
          </Marker>

          {/* ⭐ Position réelle user */}
          {userPos && (
            <Marker position={userPos} icon={userIcon}>
              <Popup>
                <Navigation className="w-5 h-5 text-blue-500" />
                <strong>Votre position</strong>
              </Popup>
            </Marker>
          )}

          {/* 🟦 Routing */}
          {userPos && (
            <RoutingMachine userPos={userPos} eventPos={eventPos} />
          )}
        </MapContainer>

        {/* 📌 Infos */}
        <div className="p-4 text-center text-gray-600 text-sm">
          Position du lieu :
          <br />
          <span className="font-semibold">{eventLat.toFixed(6)}</span> / 
          <span className="font-semibold">{eventLng.toFixed(6)}</span>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
