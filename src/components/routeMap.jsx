// src/components/mapDisplay.jsx
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import { useEffect, useRef } from "react";

// Fix for marker icons
const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// City coordinates database
const cityCoordinates = {
  islamabad: [33.6844, 73.0479],
  lahore: [31.5204, 74.3587],
  karachi: [24.8607, 67.0011],
  peshawar: [34.015, 71.5249],
  // Add more cities as needed
};

export default function MapDisplay({ pois = [], start, destination }) {
  const mapRef = useRef();
  const routingControlRef = useRef(null);

  // Set up route visualization
  useEffect(() => {
    if (!mapRef.current || !start || !destination) return;

    const map = mapRef.current;
    const startCoords =
      cityCoordinates[start.toLowerCase()] || cityCoordinates["islamabad"];
    const destCoords =
      cityCoordinates[destination.toLowerCase()] || cityCoordinates["lahore"];

    // Remove previous route if exists
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create new route
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(startCoords[0], startCoords[1]),
        L.latLng(destCoords[0], destCoords[1]),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "#1993e5", weight: 5 }],
      },
    }).addTo(map);

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [start, destination]);

  // Calculate map center
  const getCenter = () => {
    if (pois.length > 0) return [pois[0].location.lat, pois[0].location.lng];
    if (start && destination) {
      const startCoords =
        cityCoordinates[start.toLowerCase()] || cityCoordinates["islamabad"];
      const destCoords =
        cityCoordinates[destination.toLowerCase()] || cityCoordinates["lahore"];
      return [
        (startCoords[0] + destCoords[0]) / 2,
        (startCoords[1] + destCoords[1]) / 2,
      ];
    }
    return [30.3753, 69.3451]; // Center of Pakistan
  };

  return (
    <div className="h-96 w-full">
      <MapContainer
        center={getCenter()}
        zoom={pois.length > 0 ? 9 : start && destination ? 7 : 5}
        className="h-full rounded-xl"
        whenCreated={(map) => {
          mapRef.current = map;
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {pois.map((poi) => (
          <Marker
            key={`${poi.location.lat}-${poi.location.lng}`}
            position={[poi.location.lat, poi.location.lng]}
            icon={markerIcon}
          >
            <Popup>
              <div className="popup-content min-w-[200px]">
                <h3 className="font-bold text-lg">{poi.name}</h3>
                <p className="text-sm mt-1">{poi.summary}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
