// Main route service that orchestrates all other services
import geocodingService from "./geocoding";
import routingService from "./routing";
import poiService from "./poi";
import aiSummarizerService from "./aiSummarizer";

class RouteService {
  async planRoute(startLocation, endLocation) {
    try {
      // Step 1: Get coordinates for start and end locations
      console.log("🗺️ Getting coordinates...");
      const [startCoords, endCoords] = await Promise.all([
        geocodingService.getCoordinates(startLocation),
        geocodingService.getCoordinates(endLocation),
      ]);

      console.log("Coordinates found:", { startCoords, endCoords });

      // Step 2: Get the route between locations
      console.log("Calculating route...");
      const route = await routingService.getRoute(startCoords, endCoords);

      console.log("Route calculated:", {
        distance: `${(route.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(route.duration / 60)} minutes`,
        coordinates: route.coordinates.length,
      });

      // Step 3: Get waypoints along the route for POI discovery
      console.log("Finding waypoints along route...");
      const waypoints = routingService.getRouteWaypoints(route.coordinates, 30); // Every 30km

      console.log(`Found ${waypoints.length} waypoints for POI discovery`);

      // Step 4: Discover POIs along the route
      console.log("Discovering points of interest...");
      const pois = await poiService.getPOIsAlongRoute(waypoints, 15); // 15km radius

      console.log(`Found ${pois.length} points of interest`);

      // Step 5: Generate AI summaries for POIs
      console.log("Generating AI summaries...");
      const poisWithAI = await aiSummarizerService.summarizeMultiplePOIs(pois);

      console.log("AI summaries generated");

      // Step 6: Generate route tips
      console.log("Generating route tips...");
      const routeTips = await aiSummarizerService.generateRouteTips(
        startLocation,
        endLocation,
        poisWithAI
      );

      return {
        success: true,
        route: {
          start: {
            name: startLocation,
            coordinates: startCoords,
            displayName: startCoords.displayName,
          },
          end: {
            name: endLocation,
            coordinates: endCoords,
            displayName: endCoords.displayName,
          },
          geometry: route.coordinates,
          distance: route.distance,
          duration: route.duration,
          instructions: route.instructions,
          bbox: route.bbox,
        },
        pois: poisWithAI,
        routeTips,
        waypoints,
        metadata: {
          totalPOIs: poisWithAI.length,
          routeDistance: `${(route.distance / 1000).toFixed(1)} km`,
          estimatedDuration: `${Math.round(route.duration / 60)} minutes`,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Route planning error:", error);

      return {
        success: false,
        error: error.message,
        fallback: await this.getFallbackRoute(startLocation, endLocation),
      };
    }
  }

  async getFallbackRoute(startLocation, endLocation) {
    try {
      // Try to get at least coordinates and basic route
      const [startCoords, endCoords] = await Promise.all([
        geocodingService.getCoordinates(startLocation),
        geocodingService.getCoordinates(endLocation),
      ]);

      const route = await routingService.getRoute(startCoords, endCoords);
      const waypoints = routingService.getRouteWaypoints(route.coordinates, 50);
      const pois = await poiService.getPOIsAlongRoute(waypoints, 20);

      return {
        route: {
          start: { name: startLocation, coordinates: startCoords },
          end: { name: endLocation, coordinates: endCoords },
          geometry: route.coordinates,
          distance: route.distance,
          duration: route.duration,
        },
        pois,
        routeTips: aiSummarizerService.getFallbackRouteTips(
          startLocation,
          endLocation
        ),
        metadata: {
          fallbackMode: true,
          totalPOIs: pois.length,
        },
      };
    } catch (error) {
      console.error("Fallback route error:", error);
      throw new Error(
        "Unable to plan route. Please check your internet connection and try again."
      );
    }
  }

  // Quick search for nearby POIs without full route planning
  async searchNearbyPOIs(location, radiusKm = 20) {
    try {
      const coordinates = await geocodingService.getCoordinates(location);
      const pois = await poiService.getPOIsNearLocation(coordinates, radiusKm);
      const poisWithAI = await aiSummarizerService.summarizeMultiplePOIs(pois);

      return {
        success: true,
        location: {
          name: location,
          coordinates,
          displayName: coordinates.displayName,
        },
        pois: poisWithAI,
        metadata: {
          totalPOIs: poisWithAI.length,
          searchRadius: `${radiusKm} km`,
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error("Nearby POI search error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Validate API keys and service availability
  async validateServices() {
    console.log("🔍 Testing API connectivity...");
    
    const results = {
      openRouteService: false,
      openTripMap: false,
      deepSeek: false,
      openAI: false
    };

    // Test OpenRouteService
    if (process.env.REACT_APP_OPENROUTE_API_KEY) {
      try {
        const testResponse = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
          method: "POST",
          headers: {
            Authorization: process.env.REACT_APP_OPENROUTE_API_KEY,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coordinates: [[2.320041, 48.8588897], [4.8320114, 45.7578137]],
            format: "geojson"
          })
        });
        results.openRouteService = testResponse.ok;
        console.log(`OpenRouteService: ${testResponse.ok ? '✅ Working' : '❌ Error ' + testResponse.status}`);
      } catch (error) {
        console.log(`OpenRouteService: ❌ Error - ${error.message}`);
      }
    } else {
      console.log("OpenRouteService: ⚠️ No API key");
    }

    // Test OpenTripMap
    if (process.env.REACT_APP_OPENTRIPMAP_API_KEY) {
      try {
        const testResponse = await fetch(
          `https://api.opentripmap.com/0.1/en/places/radius?radius=1000&lon=2.320041&lat=48.8588897&kinds=interesting_places&format=json&limit=1&apikey=${process.env.REACT_APP_OPENTRIPMAP_API_KEY}`
        );
        results.openTripMap = testResponse.ok;
        console.log(`OpenTripMap: ${testResponse.ok ? '✅ Working' : '❌ Error ' + testResponse.status}`);
      } catch (error) {
        console.log(`OpenTripMap: ❌ Error - ${error.message}`);
      }
    } else {
      console.log("OpenTripMap: ⚠️ No API key");
    }

    // Test DeepSeek
    if (process.env.REACT_APP_DEEPSEEK_API_KEY) {
      try {
        const testResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_DEEPSEEK_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 10
          })
        });
        results.deepSeek = testResponse.ok;
        console.log(`DeepSeek: ${testResponse.ok ? '✅ Working' : '❌ Error ' + testResponse.status}`);
      } catch (error) {
        console.log(`DeepSeek: ❌ Error - ${error.message}`);
      }
    } else {
      console.log("DeepSeek: ⚠️ No API key");
    }

    // Test OpenAI
    if (process.env.REACT_APP_OPENAI_API_KEY) {
      try {
        const testResponse = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: "Hello" }],
            max_tokens: 10
          })
        });
        results.openAI = testResponse.ok;
        console.log(`OpenAI: ${testResponse.ok ? '✅ Working' : '❌ Error ' + testResponse.status}`);
      } catch (error) {
        console.log(`OpenAI: ❌ Error - ${error.message}`);
      }
    } else {
      console.log("OpenAI: ⚠️ No API key");
    }

    return results;
  }
}

const routeService = new RouteService();
export default routeService;
