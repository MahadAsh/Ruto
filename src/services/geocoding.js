// Geocoding service to convert city names to coordinates
class GeocodingService {
  constructor() {
    this.cache = new Map();
  }

  async getCoordinates(locationName) {
    // Check cache first
    if (this.cache.has(locationName.toLowerCase())) {
      return this.cache.get(locationName.toLowerCase());
    }

    try {
      // Using OpenStreetMap Nominatim API (free, no API key required)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          locationName
        )}&limit=1&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Geocoding request failed");
      }

      const data = await response.json();

      if (data.length === 0) {
        throw new Error(`Location "${locationName}" not found`);
      }

      const result = {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };

      // Cache the result
      this.cache.set(locationName.toLowerCase(), result);

      return result;
    } catch (error) {
      console.error("Geocoding error:", error);

      // Fallback to hardcoded coordinates for common Pakistani cities
      const fallbackCoordinates = {
        islamabad: {
          lat: 33.6844,
          lng: 73.0479,
          displayName: "Islamabad, Pakistan",
        },
        lahore: { lat: 31.5204, lng: 74.3587, displayName: "Lahore, Pakistan" },
        karachi: {
          lat: 24.8607,
          lng: 67.0011,
          displayName: "Karachi, Pakistan",
        },
        peshawar: {
          lat: 34.015,
          lng: 71.5249,
          displayName: "Peshawar, Pakistan",
        },
        skardu: { lat: 35.2971, lng: 75.6333, displayName: "Skardu, Pakistan" },
        gilgit: { lat: 35.9197, lng: 74.3089, displayName: "Gilgit, Pakistan" },
        murree: { lat: 33.9062, lng: 73.3903, displayName: "Murree, Pakistan" },
        faisalabad: {
          lat: 31.4504,
          lng: 73.135,
          displayName: "Faisalabad, Pakistan",
        },
        rawalpindi: {
          lat: 33.5651,
          lng: 73.0169,
          displayName: "Rawalpindi, Pakistan",
        },
        multan: { lat: 30.1575, lng: 71.5249, displayName: "Multan, Pakistan" },
      };

      const fallback = fallbackCoordinates[locationName.toLowerCase()];
      if (fallback) {
        this.cache.set(locationName.toLowerCase(), fallback);
        return fallback;
      }

      throw error;
    }
  }

  // Get coordinates for multiple locations
  async getMultipleCoordinates(locations) {
    const results = await Promise.allSettled(
      locations.map((location) => this.getCoordinates(location))
    );

    return results.map((result, index) => ({
      location: locations[index],
      success: result.status === "fulfilled",
      data: result.status === "fulfilled" ? result.value : null,
      error: result.status === "rejected" ? result.reason.message : null,
    }));
  }
}

const geocodingService = new GeocodingService();
export default geocodingService;
