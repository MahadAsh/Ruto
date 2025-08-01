// Routing service using OpenRouteService API
class RoutingService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENROUTE_API_KEY;
    this.baseUrl = "https://api.openrouteservice.org/v2";
  }

  async getRoute(startCoords, endCoords, profile = "driving-car") {
    if (!this.apiKey) {
      console.warn(
        "OpenRouteService API key not found, trying alternative routing"
      );
      return this.tryAlternativeRouting(startCoords, endCoords);
    }

    try {
      console.log("Sending coordinates to OpenRouteService:", {
        start: [startCoords.lng, startCoords.lat],
        end: [endCoords.lng, endCoords.lat]
      });
      
      const response = await fetch(`${this.baseUrl}/directions/${profile}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        },
        body: JSON.stringify({
          coordinates: [
            [startCoords.lng, startCoords.lat],
            [endCoords.lng, endCoords.lat],
          ],
          format: "geojson",
          instructions: true,
          geometry_simplify: false,
          continue_straight: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Routing API error ${response.status}:`, errorText);
        throw new Error(`Routing API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("OpenRouteService response:", data);
      console.log("Response structure:", {
        hasFeatures: !!data.features,
        featuresLength: data.features?.length,
        hasGeometry: !!data.geometry,
        geometryType: data.geometry?.type,
        coordinatesLength: data.geometry?.coordinates?.length
      });

      // Check if response has features or if it's a direct route object
      if (data.features && data.features.length > 0) {
        // Standard GeoJSON format
        const route = data.features[0];
        const geometry = route.geometry.coordinates;

        return {
          coordinates: geometry.map((coord) => [coord[1], coord[0]]), // Convert [lng, lat] to [lat, lng]
          distance: route.properties.segments[0].distance, // in meters
          duration: route.properties.segments[0].duration, // in seconds
          instructions: route.properties.segments[0].steps || [],
          bbox: this.calculateBoundingBox(geometry),
        };
      } else if (data.geometry && data.geometry.coordinates) {
        // Direct route object format
        const geometry = data.geometry.coordinates;
        
        return {
          coordinates: geometry.map((coord) => [coord[1], coord[0]]), // Convert [lng, lat] to [lat, lng]
          distance: data.properties?.segments?.[0]?.distance || this.calculateDistance(
            { lat: geometry[0][1], lng: geometry[0][0] },
            { lat: geometry[geometry.length - 1][1], lng: geometry[geometry.length - 1][0] }
          ) * 1000,
          duration: data.properties?.segments?.[0]?.duration || this.calculateDistance(
            { lat: geometry[0][1], lng: geometry[0][0] },
            { lat: geometry[geometry.length - 1][1], lng: geometry[geometry.length - 1][0] }
          ) * 60,
          instructions: data.properties?.segments?.[0]?.steps || [],
          bbox: this.calculateBoundingBox(geometry),
        };
      } else {
        console.error("No route features found in response:", data);
        console.log("Trying OSRM as fallback...");
        return this.tryAlternativeRouting(startCoords, endCoords);
      }
    } catch (error) {
      console.error("OpenRouteService error:", error);
      return this.tryAlternativeRouting(startCoords, endCoords);
    }
  }

  // Fallback routing when API is not available
  getFallbackRoute(startCoords, endCoords) {
    // Generate a more realistic route path with intermediate points
    const coordinates = this.generateRealisticRoute(startCoords, endCoords);
    
    // Calculate approximate distance using Haversine formula
    const distance = this.calculateDistance(startCoords, endCoords);
    const duration = distance * 60; // Rough estimate: 1 km per minute

    return {
      coordinates,
      distance: distance * 1000, // Convert to meters
      duration,
      instructions: [
        {
          instruction: `Head towards ${endCoords.displayName || "destination"}`,
        },
      ],
      bbox: this.calculateBoundingBox(
        coordinates.map((coord) => [coord[1], coord[0]])
      ),
    };
  }

  // Try alternative routing services
  async tryAlternativeRouting(startCoords, endCoords) {
    console.log("Trying alternative routing services...");
    
    // Try OSRM (Open Source Routing Machine) - completely free and uses real road data
    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson&steps=true`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log("OSRM response:", data);
        
        if (data.routes && data.routes[0] && data.routes[0].geometry) {
          const geometry = data.routes[0].geometry.coordinates;
          const coordinates = geometry.map(coord => [coord[1], coord[0]]); // Convert [lng, lat] to [lat, lng]
          
          return {
            coordinates,
            distance: data.routes[0].distance,
            duration: data.routes[0].duration,
            instructions: data.routes[0].legs?.[0]?.steps || [],
            bbox: this.calculateBoundingBox(geometry),
          };
        }
      }
    } catch (error) {
      console.log("OSRM failed:", error);
    }
    
    // Try GraphHopper as backup
    try {
      const response = await fetch(
        `https://graphhopper.com/api/1/route?point=${startCoords.lat},${startCoords.lng}&point=${endCoords.lat},${endCoords.lng}&vehicle=car&key=free&instructions=true&calc_points=true&points_encoded=false`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log("GraphHopper response:", data);
        
        if (data.paths && data.paths[0] && data.paths[0].points) {
          const points = data.paths[0].points.coordinates;
          const coordinates = points.map(coord => [coord[1], coord[0]]); // Convert [lng, lat] to [lat, lng]
          
          return {
            coordinates,
            distance: data.paths[0].distance,
            duration: data.paths[0].time / 1000, // Convert to seconds
            instructions: data.paths[0].instructions || [],
            bbox: this.calculateBoundingBox(points),
          };
        }
      }
    } catch (error) {
      console.log("GraphHopper failed:", error);
    }
    
    // If all else fails, use realistic fallback
    console.log("Using realistic fallback route");
    return this.getFallbackRoute(startCoords, endCoords);
  }

  // Generate a more realistic route path
  generateRealisticRoute(startCoords, endCoords) {
    const coordinates = [];
    const steps = 20; // Number of intermediate points
    
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      
      // Linear interpolation with some curve
      const lat = startCoords.lat + (endCoords.lat - startCoords.lat) * ratio;
      const lng = startCoords.lng + (endCoords.lng - startCoords.lng) * ratio;
      
      // Add some realistic curve (simulating road curves)
      const curve = Math.sin(ratio * Math.PI) * 0.01; // Small curve
      const curvedLat = lat + curve;
      const curvedLng = lng + curve;
      
      coordinates.push([curvedLat, curvedLng]);
    }
    
    return coordinates;
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLng = this.toRad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) *
        Math.cos(this.toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  toRad(deg) {
    return deg * (Math.PI / 180);
  }

  calculateBoundingBox(coordinates) {
    const lats = coordinates.map((coord) => coord[1]);
    const lngs = coordinates.map((coord) => coord[0]);

    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }

  // Get route waypoints for POI discovery
  getRouteWaypoints(routeCoordinates, intervalKm = 20) {
    if (!routeCoordinates || routeCoordinates.length < 2) {
      return [];
    }

    const waypoints = [];
    
    // Calculate total route distance
    let totalRouteDistance = 0;
    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const current = {
        lat: routeCoordinates[i][0],
        lng: routeCoordinates[i][1],
      };
      const next = {
        lat: routeCoordinates[i + 1][0],
        lng: routeCoordinates[i + 1][1],
      };
      totalRouteDistance += this.calculateDistance(current, next);
    }

    console.log(`Total route distance: ${totalRouteDistance.toFixed(1)} km`);

    // Calculate number of waypoints based on route length - more waypoints for longer routes
    const numWaypoints = Math.max(8, Math.min(20, Math.floor(totalRouteDistance / intervalKm)));
    console.log(`Generating ${numWaypoints} waypoints along route`);

    // Generate evenly distributed waypoints
    for (let i = 0; i < numWaypoints; i++) {
      const ratio = i / (numWaypoints - 1);
      const targetDistance = totalRouteDistance * ratio;
      
      // Find the coordinate at this distance along the route
      let currentDistance = 0;
      let waypoint = null;
      
      for (let j = 0; j < routeCoordinates.length - 1; j++) {
        const current = {
          lat: routeCoordinates[j][0],
          lng: routeCoordinates[j][1],
        };
        const next = {
          lat: routeCoordinates[j + 1][0],
          lng: routeCoordinates[j + 1][1],
        };
        
        const segmentDistance = this.calculateDistance(current, next);
        
        if (currentDistance + segmentDistance >= targetDistance) {
          // Interpolate between current and next point
          const segmentRatio = (targetDistance - currentDistance) / segmentDistance;
          waypoint = {
            lat: current.lat + (next.lat - current.lat) * segmentRatio,
            lng: current.lng + (next.lng - current.lng) * segmentRatio,
          };
          break;
        }
        
        currentDistance += segmentDistance;
      }
      
      if (waypoint) {
        waypoints.push(waypoint);
      }
    }

    console.log(`Generated waypoints:`, waypoints.map((wp, i) => `${i}: ${wp.lat.toFixed(4)}, ${wp.lng.toFixed(4)}`));
    return waypoints;
  }
}

const routingService = new RoutingService();
export default routingService;
