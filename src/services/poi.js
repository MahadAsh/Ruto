// POI (Points of Interest) service using OpenTripMap API
class POIService {
  constructor() {
    this.apiKey = process.env.REACT_APP_OPENTRIPMAP_API_KEY;
    this.baseUrl = "https://api.opentripmap.com/0.1/en/places";
  }

  async getPOIsAlongRoute(routeWaypoints, radiusKm = 35) {
    console.log("Searching for POIs along route with waypoints:", routeWaypoints);
    
    if (!this.apiKey) {
      console.warn("OpenTripMap API key not found, using fallback POI data");
      return this.getFallbackPOIs(routeWaypoints);
    }

    try {
      const allPOIs = [];
      const seenPOIs = new Set(); // To avoid duplicates

      // Use all waypoints except the very first one to get better distribution
      const searchWaypoints = routeWaypoints.slice(1); // Remove only the first waypoint
      console.log(`Searching POIs at ${searchWaypoints.length} waypoints (excluding start only)`);

      // Get POIs for each waypoint along the route
      for (let i = 0; i < searchWaypoints.length; i++) {
        const waypoint = searchWaypoints[i];
        console.log(`Searching POIs near waypoint ${i + 1}/${searchWaypoints.length}:`, waypoint);
        
        const pois = await this.getPOIsNearLocation(waypoint, radiusKm);
        console.log(`Found ${pois.length} POIs near this waypoint`);
        
        // Filter out duplicates and add to collection
        for (const poi of pois) {
          const poiKey = `${poi.name}-${poi.location.lat.toFixed(3)}-${poi.location.lng.toFixed(3)}`;
          if (!seenPOIs.has(poiKey)) {
            seenPOIs.add(poiKey);
            allPOIs.push(poi);
          }
        }
      }

      // Remove duplicates based on coordinates
      const uniquePOIs = this.removeDuplicatePOIs(allPOIs);

      // Filter POIs that are actually close to the route path - more lenient distance
      const routeNearPOIs = this.filterPOIsNearRoute(uniquePOIs, routeWaypoints, 25);
      console.log(`POIs near route: ${routeNearPOIs.length} out of ${uniquePOIs.length} total`);

      // Sort by rating and limit results, but ensure good distribution
      const sortedPOIs = routeNearPOIs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      
      // Take top POIs but ensure we don't have too many from the same area
      const finalPOIs = [];
      const areaGroups = new Map(); // Group POIs by approximate area
      
      for (const poi of sortedPOIs) {
        // Use a larger area grouping to allow more POIs per region
        const areaKey = `${Math.round(poi.location.lat * 5) / 5}-${Math.round(poi.location.lng * 5) / 5}`;
        
        if (!areaGroups.has(areaKey)) {
          areaGroups.set(areaKey, []);
        }
        
        const areaPOIs = areaGroups.get(areaKey);
        if (areaPOIs.length < 5) { // Increased max POIs per area
          areaPOIs.push(poi);
          finalPOIs.push(poi);
        }
        
        if (finalPOIs.length >= 25) break; // Increased total POI limit
      }
      
      console.log(`Final POI distribution: ${finalPOIs.length} POIs across ${areaGroups.size} areas`);
      console.log("POI locations:", finalPOIs.map(poi => `${poi.name}: ${poi.location.lat.toFixed(4)}, ${poi.location.lng.toFixed(4)}`));
      return finalPOIs;
    } catch (error) {
      console.error("POI discovery error:", error);
      return this.getFallbackPOIs(routeWaypoints);
    }
  }

  async getPOIsNearLocation(coordinates, radiusKm = 10) {
    const radiusMeters = radiusKm * 1000;

    try {
      // Get list of POIs
      const listResponse = await fetch(
        `${this.baseUrl}/radius?radius=${radiusMeters}&lon=${coordinates.lng}&lat=${coordinates.lat}&kinds=interesting_places,cultural,natural,historic,architecture,museums,sport,amusements&format=json&limit=50&apikey=${this.apiKey}`
      );

      if (!listResponse.ok) {
        throw new Error(`POI API error: ${listResponse.status}`);
      }

      const poisList = await listResponse.json();
      console.log("OpenTripMap response:", poisList);

      // Handle different response formats
      let features = [];
      if (poisList.features) {
        // Standard format with features array
        features = poisList.features;
        console.log("Using standard features format, found", features.length, "POIs");
      } else if (Array.isArray(poisList)) {
        // Direct array format
        features = poisList;
        console.log("Using direct array format, found", features.length, "POIs");
      } else {
        console.log("No features found in OpenTripMap response, response type:", typeof poisList);
        console.log("Response structure:", poisList);
        return [];
      }

      // Get detailed information for each POI
      if (features.length > 0) {
        console.log("First POI object structure:", features[0]);
      }
      
      const detailedPOIs = await Promise.allSettled(
        features
          .slice(0, 10)
          .map((poi) => this.getPOIDetails(poi.properties?.xid || poi.xid))
      );

      return detailedPOIs
        .filter((result) => result.status === "fulfilled" && result.value)
        .map((result) => result.value);
    } catch (error) {
      console.error("Error fetching POIs near location:", error);
      return [];
    }
  }

  async getPOIDetails(xid) {
    try {
      const response = await fetch(
        `${this.baseUrl}/xid/${xid}?apikey=${this.apiKey}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data.name || !data.point) {
        return null;
      }

      return {
        id: data.xid,
        name: data.name,
        summary:
          data.wikipedia_extracts?.text ||
          data.info?.descr ||
          "Interesting place to visit",
        type: this.mapPOIKind(data.kinds),
        location: {
          lat: data.point.lat,
          lng: data.point.lon,
        },
        rating: data.rate || Math.random() * 5, // Fallback random rating
        image: data.preview?.source || data.image || null,
        wikipedia: data.wikipedia,
        website: data.url,
        address: data.address?.formatted || "",
      };
    } catch (error) {
      console.error("Error fetching POI details:", error);
      return null;
    }
  }

  mapPOIKind(kinds) {
    if (!kinds) return "Attraction";

    const kindMap = {
      museums: "Museum",
      cultural: "Cultural Site",
      natural: "Nature",
      historic: "Historical Site",
      architecture: "Architecture",
      religion: "Religious Site",
      sport: "Sports & Recreation",
      amusements: "Entertainment",
    };

    for (const [key, value] of Object.entries(kindMap)) {
      if (kinds.includes(key)) {
        return value;
      }
    }

    return "Attraction";
  }

  removeDuplicatePOIs(pois) {
    const seen = new Set();
    return pois.filter((poi) => {
      const key = `${poi.location.lat.toFixed(4)},${poi.location.lng.toFixed(
        4
      )}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Filter POIs that are actually close to the route path
  filterPOIsNearRoute(pois, routeWaypoints, maxDistanceKm = 10) {
    if (!routeWaypoints || routeWaypoints.length < 2) {
      return pois;
    }

    return pois.filter(poi => {
      // Check if POI is close to any segment of the route
      for (let i = 0; i < routeWaypoints.length - 1; i++) {
        const routeStart = routeWaypoints[i];
        const routeEnd = routeWaypoints[i + 1];
        
        // Calculate distance from POI to route segment
        const distance = this.distanceToRouteSegment(
          poi.location,
          routeStart,
          routeEnd
        );
        
        if (distance <= maxDistanceKm) {
          return true; // POI is close to this route segment
        }
      }
      return false; // POI is not close to any route segment
    });
  }

  // Calculate distance from a point to a route segment
  distanceToRouteSegment(point, routeStart, routeEnd) {
    const A = point.lat - routeStart.lat;
    const B = point.lng - routeStart.lng;
    const C = routeEnd.lat - routeStart.lat;
    const D = routeEnd.lng - routeStart.lng;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
      // Route segment is a point, calculate direct distance
      return this.calculateDistance(point, routeStart);
    }

    let param = dot / lenSq;
    param = Math.max(0, Math.min(1, param)); // Clamp to segment

    const projLat = routeStart.lat + param * C;
    const projLng = routeStart.lng + param * D;

    return this.calculateDistance(point, { lat: projLat, lng: projLng });
  }

  // Fallback POI data when API is not available
  getFallbackPOIs(waypoints) {
    // Enhanced fallback POI data for Pakistani routes
    const fallbackPOIs = [
      {
        id: "faisal-mosque",
        name: "Faisal Mosque",
        summary:
          "Iconic modern mosque and one of the largest in the world, featuring stunning contemporary Islamic architecture.",
        type: "Religious Site",
        location: { lat: 33.7294, lng: 73.0386 },
        rating: 4.8,
        route: ["Islamabad", "Rawalpindi"],
      },
      {
        id: "daman-e-koh",
        name: "Daman-e-Koh",
        summary:
          "Scenic viewpoint in the Margalla Hills offering panoramic views of Islamabad and surrounding valleys.",
        type: "Nature",
        location: { lat: 33.742, lng: 73.0835 },
        rating: 4.6,
        route: ["Islamabad", "Murree"],
      },
      {
        id: "badshahi-mosque",
        name: "Badshahi Mosque",
        summary:
          "Magnificent 17th-century Mughal mosque, one of the largest in the world with stunning red sandstone architecture.",
        type: "Religious Site",
        location: { lat: 31.5889, lng: 74.3107 },
        rating: 4.9,
        route: ["Lahore"],
      },
      {
        id: "lahore-fort",
        name: "Lahore Fort",
        summary:
          "Historic Mughal fortress complex featuring palaces, gardens, and museums showcasing centuries of history.",
        type: "Historical Site",
        location: { lat: 31.5888, lng: 74.3142 },
        rating: 4.7,
        route: ["Lahore"],
      },
      {
        id: "shalimar-gardens",
        name: "Shalimar Gardens",
        summary:
          "UNESCO World Heritage Mughal garden with terraced lawns, fountains, and pavilions from the 17th century.",
        type: "Cultural Site",
        location: { lat: 31.5827, lng: 74.3755 },
        rating: 4.5,
        route: ["Lahore"],
      },
      {
        id: "deosai-plains",
        name: "Deosai Plains",
        summary:
          'High-altitude plateau known as "Land of Giants" with stunning wildflower blooms and wildlife viewing.',
        type: "Nature",
        location: { lat: 35.0289, lng: 75.0731 },
        rating: 4.9,
        route: ["Skardu", "Gilgit"],
      },
      {
        id: "shangrila-resort",
        name: "Shangrila Resort",
        summary:
          "Beautiful lakeside resort in Skardu offering stunning views of Lower Kachura Lake and surrounding mountains.",
        type: "Nature",
        location: { lat: 35.2433, lng: 75.5089 },
        rating: 4.4,
        route: ["Skardu"],
      },
      {
        id: "k2-base-camp",
        name: "K2 Base Camp Trek",
        summary:
          "World-renowned trekking destination leading to the base of K2, the second highest mountain in the world.",
        type: "Adventure",
        location: { lat: 35.8825, lng: 76.5133 },
        rating: 5.0,
        route: ["Skardu", "Askole"],
      },
    ];

    // Filter POIs based on proximity to waypoints
    return fallbackPOIs.filter((poi) => {
      return waypoints.some((waypoint) => {
        const distance = this.calculateDistance(waypoint, poi.location);
        return distance <= 100; // Within 100km
      });
    });
  }

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
}

POIService = new POIService();
export default POIService;
