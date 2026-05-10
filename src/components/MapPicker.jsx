import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader, Navigation, MapPin } from 'lucide-react';
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
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Icône personnalisée pour la position de l'utilisateur
const userIcon = L.divIcon({
    className: 'custom-user-icon',
    html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

// --- Composant de Routing ---
const RoutingMachine = ({ userPos, eventPos }) => {
    const map = useMap();
    const routingControlRef = useRef(null);
    const cleanupTimeoutRef = useRef(null);

    useEffect(() => {
        if (!map || !userPos || !eventPos) return;

        // Vérifier que les positions sont différentes
        if (userPos[0] === eventPos[0] && userPos[1] === eventPos[1]) return;

        // Nettoyer l'ancien timeout si existant
        if (cleanupTimeoutRef.current) {
            clearTimeout(cleanupTimeoutRef.current);
        }

        // Supprimer l'ancien contrôle avec un délai
        const oldControl = routingControlRef.current;
        if (oldControl) {
            routingControlRef.current = null;
            cleanupTimeoutRef.current = setTimeout(() => {
                try {
                    if (map.hasLayer(oldControl)) {
                        map.removeControl(oldControl);
                    }
                } catch (e) {
                    // Ignorer l'erreur silencieusement
                }
            }, 100);
        }

        // Créer un nouveau contrôle de routing
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userPos[0], userPos[1]),
                L.latLng(eventPos[0], eventPos[1])
            ],
            router: L.Routing.osrmv1({
                serviceUrl: "https://router.project-osrm.org/route/v1"
            }),
            lineOptions: {
                styles: [{ color: '#3b82f6', opacity: 0.7, weight: 5 }],
                addWaypoints: false
            },
            createMarker: () => null,
            draggableWaypoints: false,
            addWaypoints: false,
            routeWhileDragging: false,
            show: false,
            fitSelectedRoutes: false,
            showAlternatives: false
        });

        routingControl.on('routesfound', (e) => {
            const routes = e.routes;
            const summary = routes[0].summary;
            const distance = (summary.totalDistance / 1000).toFixed(2);
            const time = Math.round(summary.totalTime / 60);
            console.log(`Distance: ${distance} km, Temps: ${time} min`);
        });

        routingControl.on('routingerror', (e) => {
            console.error("Erreur de routing:", e);
        });

        try {
            routingControl.addTo(map);
            routingControlRef.current = routingControl;
        } catch (e) {
            console.error("Erreur lors de l'ajout du routing:", e);
        }

        // Nettoyage lors du démontage
        return () => {
            if (cleanupTimeoutRef.current) {
                clearTimeout(cleanupTimeoutRef.current);
            }
            if (routingControlRef.current) {
                const ctrl = routingControlRef.current;
                routingControlRef.current = null;
                setTimeout(() => {
                    try {
                        if (map.hasLayer(ctrl)) {
                            map.removeControl(ctrl);
                        }
                    } catch (e) {
                        // Ignorer
                    }
                }, 100);
            }
        };
    }, [map, userPos, eventPos]);

    return null;
};

// --- Marqueur d'événement draggable ---
const EventMarker = ({ position, onPositionChange }) => {
    const markerRef = useRef(null);

    const eventHandlers = useMemo(() => ({
        dragend() {
            const marker = markerRef.current;
            if (marker) {
                const latlng = marker.getLatLng();
                onPositionChange([latlng.lat, latlng.lng]);
            }
        }
    }), [onPositionChange]);

    return (
        <Marker
            draggable
            position={position}
            eventHandlers={eventHandlers}
            ref={markerRef}
        >
            <Popup>
                <div style={{ textAlign: 'center' }}>
                    <MapPin className="w-5 h-5 mx-auto mb-2 text-red-500" />
                    <strong>Position de l'événement</strong><br />
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        Lat: {position[0].toFixed(5)}<br />
                        Lng: {position[1].toFixed(5)}
                    </span>
                    <div style={{ marginTop: '8px', fontSize: '0.75rem', color: '#9ca3af' }}>
                        Glissez le marqueur ou cliquez sur la carte
                    </div>
                </div>
            </Popup>
        </Marker>
    );
};

// --- Gestionnaire de clics sur la carte ---
const MapClickHandler = ({ onLocationChange }) => {
    useMapEvents({
        click(e) {
            onLocationChange([e.latlng.lat, e.latlng.lng]);
        }
    });
    return null;
};

// --- Composant MapPicker principal ---
const MapPicker = ({ onLocationChange, initialLatitude, initialLongitude }) => {
    const DEFAULT_POSITION = [48.8566, 2.3522]; // Paris par défaut
    const hasInitialCoords = initialLatitude && initialLongitude;
    const initialCoords = hasInitialCoords
        ? [parseFloat(initialLatitude), parseFloat(initialLongitude)]
        : DEFAULT_POSITION;

    const [eventPosition, setEventPosition] = useState(initialCoords);
    const [userPosition, setUserPosition] = useState(null);
    const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(!hasInitialCoords);
    const [distance, setDistance] = useState(null);

    // Géolocalisation de l'utilisateur - TOUJOURS récupérer la position réelle
    useEffect(() => {
        if (navigator.geolocation) {
            setIsLoadingGeolocation(true);
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    // console.log(lat, lng);
                    const userPos = [lat, lng];

                    setUserPosition(userPos);
                    
                    // Si pas de coordonnées initiales, initialiser l'événement à la position de l'user
                    if (!hasInitialCoords) {
                        setEventPosition(userPos);
                        onLocationChange(lat.toFixed(8), lng.toFixed(8));
                    }
                    setIsLoadingGeolocation(false);
                },
                (error) => {
                    console.error("Erreur de géolocalisation:", error);
                    alert("Impossible d'obtenir votre position. Veuillez autoriser la géolocalisation dans votre navigateur.");
                    setUserPosition(DEFAULT_POSITION);
                    setIsLoadingGeolocation(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            alert("La géolocalisation n'est pas supportée par votre navigateur.");
            setUserPosition(DEFAULT_POSITION);
            setIsLoadingGeolocation(false);
        }
    }, [hasInitialCoords, onLocationChange]);

    // Calculer la distance
    useEffect(() => {
        if (userPosition && eventPosition) {
            const R = 6371; // Rayon de la Terre en km
            const dLat = (eventPosition[0] - userPosition[0]) * Math.PI / 180;
            const dLon = (eventPosition[1] - userPosition[1]) * Math.PI / 180;
            const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(userPosition[0] * Math.PI / 180) * Math.cos(eventPosition[0] * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            const dist = R * c;
            setDistance(dist.toFixed(2));
        }
    }, [userPosition, eventPosition]);

    const handleEventPositionChange = (newPosition) => {
        setEventPosition(newPosition);
        onLocationChange(newPosition[0].toFixed(8), newPosition[1].toFixed(8));
    };

    if (isLoadingGeolocation) {
        return (
            <div style={{ height: '400px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '0.75rem', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                <Loader className="w-8 h-8 animate-spin text-blue-500 mb-4" />
                <p className="text-gray-600 font-medium">Localisation en cours...</p>
                <p className="text-gray-400 text-sm mt-2">Veuillez autoriser l'accès à votre position</p>
            </div>
        );
    }

    return (
        <div style={{ width: '100%' }}>
            {/* Informations sur la distance */}
            {distance && (
                <div style={{ 
                    padding: '12px 16px', 
                    marginBottom: '12px', 
                    backgroundColor: '#eff6ff', 
                    borderRadius: '0.5rem', 
                    border: '1px solid #bfdbfe',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <Navigation className="w-5 h-5 text-blue-600" />
                    <div>
                        <span style={{ fontWeight: '600', color: '#1e40af' }}>Distance estimée : </span>
                        <span style={{ color: '#3b82f6' }}>{distance} km</span>
                        <span style={{ fontSize: '0.875rem', color: '#6b7280', marginLeft: '8px' }}>
                            (à vol d'oiseau)
                        </span>
                    </div>
                </div>
            )}

            {/* Instructions */}
            <div style={{ 
                padding: '8px 12px', 
                marginBottom: '12px', 
                backgroundColor: '#fef3c7', 
                borderRadius: '0.5rem', 
                fontSize: '0.875rem',
                color: '#92400e'
            }}>
                💡 Cliquez sur la carte ou déplacez le marqueur bleu pour définir la position de l'événement
            </div>

            {/* Carte */}
            <MapContainer
                center={eventPosition}
                zoom={hasInitialCoords ? 13 : 15}
                scrollWheelZoom={true}
                style={{ height: '400px', width: '100%', borderRadius: '0.75rem', border: '2px solid #e5e7eb' }}
            >
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Marqueur de l'utilisateur */}
                {userPosition && (
                    <Marker position={userPosition} icon={userIcon}>
                        <Popup>
                            <div style={{ textAlign: 'center' }}>
                                <Navigation className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                                <strong>Votre position</strong><br />
                                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                    Lat: {userPosition[0].toFixed(5)}<br />
                                    Lng: {userPosition[1].toFixed(5)}
                                </span>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Marqueur de l'événement */}
                <EventMarker 
                    position={eventPosition} 
                    onPositionChange={handleEventPositionChange}
                />

                {/* Gestionnaire de clics */}
                <MapClickHandler onLocationChange={handleEventPositionChange} />

                {/* Routing */}
                {userPosition && eventPosition && (
                    <RoutingMachine userPos={userPosition} eventPos={eventPosition} />
                )}
            </MapContainer>

            {/* Coordonnées actuelles */}
            <div style={{ 
                marginTop: '12px', 
                padding: '12px', 
                backgroundColor: '#f9fafb', 
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                color: '#4b5563'
            }}>
                <strong>Coordonnées de l'événement :</strong><br />
                Latitude: {eventPosition[0].toFixed(6)} | Longitude: {eventPosition[1].toFixed(6)}
            </div>
        </div>
    );
};

export default MapPicker;