import PropTypes from "prop-types";

export default function POIList({ pois = [] }) {
  if (!pois.length) {
    return (
      <div className="text-center text-gray-500 py-8">No points of interest found.</div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto space-y-3 py-2 px-1">
      {pois.map((poi, index) => (
        <div
          key={poi.id || index}
          className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-bold text-lg text-gray-900">{poi.name}</h4>
            {poi.rating && typeof poi.rating === 'number' && (
              <div className="flex items-center text-sm text-yellow-600">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"/>
                </svg>
                <span className="ml-1">{poi.rating.toFixed(1)}</span>
              </div>
            )}
          </div>
          
          {/* AI Summary or regular summary */}
          <p className="text-sm text-gray-700 mb-3 leading-relaxed">
            {poi.aiSummary || poi.summary}
          </p>
          
          <div className="flex flex-wrap gap-2 items-center">
            {poi.type && (
              <span className="inline-block px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                {poi.type}
              </span>
            )}
            
            {poi.address && (
              <span className="text-xs text-gray-500 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {poi.address}
              </span>
            )}
          </div>
          
          {/* External links */}
          {(poi.wikipedia || poi.website) && (
            <div className="mt-3 flex gap-2">
              {poi.wikipedia && (
                <a
                  href={poi.wikipedia}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Wikipedia
                </a>
              )}
              {poi.website && (
                <a
                  href={poi.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Website
                </a>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

POIList.propTypes = {
  pois: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      summary: PropTypes.string,
      type: PropTypes.string,
      location: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number,
      }),
    })
  ),
};
