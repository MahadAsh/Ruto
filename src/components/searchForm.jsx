import { useState } from "react";

export default function SearchForm({ onSearch, loading = false }) {
  const [startLocation, setStartLocation] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!startLocation || !destination) return;
    onSearch(startLocation, destination);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Start Location Field */}
      <div className="px-4 pt-4">
        <label htmlFor="start-location" className="sr-only">
          Starting Location
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[#4e7a97]">
            <i className="lni lni-search" />
          </div>
          <input
            id="start-location"
            type="text"
            placeholder="Starting Location"
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#e7eef3] text-[#0e161b] placeholder:text-[#4e7a97] focus:outline-none focus:ring-2 focus:ring-[#1993e5]"
            value={startLocation}
            onChange={(e) => setStartLocation(e.target.value)}
          />
        </div>
      </div>

      {/* Destination Field */}
      <div className="px-4">
        <label htmlFor="destination" className="sr-only">
          Destination
        </label>
        <div className="relative flex items-center">
          <div className="absolute left-4 text-[#4e7a97]">
            <i className="lni lni-search" />
          </div>
          <input
            id="destination"
            type="text"
            placeholder="Destination"
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#e7eef3] text-[#0e161b] placeholder:text-[#4e7a97] focus:outline-none focus:ring-2 focus:ring-[#1993e5]"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex px-4 justify-center">
        <button
          type="submit"
          disabled={loading || !startLocation || !destination}
          className="bg-gradient-to-r from-purple-600 to-orange-800 border-0 rounded-full inline-flex items-center justify-center py-3 px-7 text-center text-base font-medium text-white hover:from-purple-700 hover:to-orange-900 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Planning Route...' : 'Generate Route'}
        </button>
      </div>
    </form>
  );
}
