import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

// Custom marker icons
const markerIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const startIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const endIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Component to fit map bounds
function MapBounds({ routeCoordinates, pois }) {
  const map = useMap();
  
  useEffect(() => {
    if (routeCoordinates && routeCoordinates.length > 0) {
      const bounds = L.latLngBounds(routeCoordinates);
      
      // Add POI locations to bounds
      pois.forEach(poi => {
        bounds.extend([poi.location.lat, poi.location.lng]);
      });
      
      // Add some padding
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, routeCoordinates, pois]);
  
  return null;
}

export default function MapDisplay({ pois = [], start, destination, routeCoordinates = [] }) {
  // Calculate center from route or POIs
  let mapCenter = [0, 0];
  let mapZoom = 2;
  
  if (routeCoordinates && routeCoordinates.length > 0) {
    // Use middle point of route
    const midIndex = Math.floor(routeCoordinates.length / 2);
    mapCenter = routeCoordinates[midIndex];
    mapZoom = 8;
  } else if (pois.length > 0) {
    mapCenter = [pois[0].location.lat, pois[0].location.lng];
    mapZoom = 9;
  }

  return (
    <div className="map-container h-96 w-full p-4">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        className="h-full rounded-xl"
        style={{ height: "400px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="Map data © OpenStreetMap contributors"
        />

        {/* Route Path */}
        {routeCoordinates && routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#3B82F6"
            weight={4}
            opacity={0.8}
          />
        )}

        {/* Start Marker */}
        {start && routeCoordinates && routeCoordinates.length > 0 && (
          <Marker
            position={routeCoordinates[0]}
            icon={startIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3 className="font-bold text-green-600">Start: {start}</h3>
              </div>
            </Popup>
          </Marker>
        )}

        {/* End Marker */}
        {destination && routeCoordinates && routeCoordinates.length > 0 && (
          <Marker
            position={routeCoordinates[routeCoordinates.length - 1]}
            icon={endIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3 className="font-bold text-red-600">Destination: {destination}</h3>
              </div>
            </Popup>
          </Marker>
        )}

        {/* POI Markers */}
        {pois.map((poi, index) => (
          <Marker
            key={`poi-${poi.id || index}`}
            position={[poi.location.lat, poi.location.lng]}
            icon={markerIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3 className="font-bold text-blue-600">{poi.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{poi.type}</p>
                <p className="text-sm">{poi.aiSummary || poi.summary}</p>
                {poi.rating && typeof poi.rating === 'number' && (
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm ml-1">{poi.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fit map to show entire route */}
        <MapBounds routeCoordinates={routeCoordinates} pois={pois} />
      </MapContainer>
    </div>
  );
}
