import { useState, useEffect } from "react";
import Header from "./components/header";
import HeroBanner from "./components/heroBanner";
import SearchForm from "./components/searchForm";
import MapDisplay from "./components/mapDisplay";
import Footer from "./components/footer";
import About from "./components/about";
import POIList from "./components/POIList";
import routeService from "./services/routeService";
import Contact from "./components/contact";

export default function App() {
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Test API connectivity on app start
  useEffect(() => {
    routeService.validateServices();
  }, []);

  const handleSearch = async (start, destination) => {
    console.log("Planning route:", start, "to", destination);

    setLoading(true);
    setError(null);
    setRouteData(null);

    try {
      const result = await routeService.planRoute(start, destination);

      if (result.success) {
        setRouteData({
          start: result.route.start.name,
          destination: result.route.end.name,
          pois: result.pois,
          route: result.route,
          routeTips: result.routeTips,
          metadata: result.metadata,
        });
        console.log("Route planning completed successfully");
      } else {
        // Use fallback data if available
        if (result.fallback) {
          setRouteData({
            start: result.fallback.route.start.name,
            destination: result.fallback.route.end.name,
            pois: result.fallback.pois,
            route: result.fallback.route,
            routeTips: result.fallback.routeTips,
            metadata: result.fallback.metadata,
            fallbackMode: true,
          });
          setError("Using offline data due to connectivity issues");
        } else {
          throw new Error(result.error || "Failed to plan route");
        }
      }
    } catch (err) {
      console.error("Route planning failed:", err);
      setError(err.message || "Failed to plan route. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-slate-10 overflow-x-hidden"
      style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}
    >
      <Header />
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-20 flex flex-1 justify-center py-8">
          <div className="flex flex-col max-w-[960px] flex-1">
            <HeroBanner />
            <SearchForm onSearch={handleSearch} loading={loading} />

            {/* Loading State */}
            {loading && (
              <div className="px-4 py-8 text-center">
                <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-gradient-to-r from-purple-600 to-orange-800">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Planning your route...
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="px-4 py-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-400"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {error}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results Section - Only shown after search */}
            {routeData && !loading && (
              <>
                {/* Map Display */}
                <div className="px-4 py-4">
                  <MapDisplay
                    pois={routeData.pois}
                    start={routeData.start}
                    destination={routeData.destination}
                    routeCoordinates={routeData.route?.geometry || []}
                  />
                </div>

                {/* Route Tips */}
                {routeData.routeTips && (
                  <div className="px-4 py-4 pt-12">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 ">
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">
                        💡 Travel Tips
                      </h4>
                      <p className="text-blue-800">{routeData.routeTips}</p>
                    </div>
                  </div>
                )}

                {/* Route Metadata */}
                {routeData.metadata && (
                  <div className="px-4 py-2">
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {routeData.metadata.routeDistance && (
                        <span>
                          📏 Distance: {routeData.metadata.routeDistance}
                        </span>
                      )}
                      {routeData.metadata.estimatedDuration && (
                        <span>
                          ⏱️ Duration: {routeData.metadata.estimatedDuration}
                        </span>
                      )}
                      {routeData.fallbackMode && (
                        <span className="text-orange-600">⚠️ Offline Mode</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Suggested POIs list */}
                <div className="px-4 py-6">
                  <h3 className="text-xl font-bold mb-3">
                    Suggested Stops ({routeData.pois.length})
                  </h3>
                  <POIList pois={routeData.pois} />
                </div>
              </>
            )}
          </div>
        </div>
        <About />
        <Contact />
        <Footer />
      </div>
    </div>
  );
}
