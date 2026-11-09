import React, { useState } from "react";
import { searchDestination } from "../../services/mapservices";

const DestinationSearch = ({ onLocationSelect }) => {
  const [query, setQuery] = useState("");
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      setError("Please enter a destination.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setLocations([]);

      const response = await searchDestination(query);

      setLocations(response.locations || []);

      if (response.locations?.length === 0) {
        setError("No matching destinations found.");
      }
    } catch (error) {
      console.error("Destination Search Error:", error);
      setError(
        error.response?.data?.message ||
        "Failed to search destinations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (location) => {
    onLocationSelect(location);
  };

  return (
    <section className="destination-search">
      <h2>Explore Destinations</h2>

      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a destination, e.g. Srinagar, India"
        />

        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}

      <div className="destination-results">
        {locations.map((location, index) => (
          <div className="destination-result-card" key={`${location.latitude}-${location.longitude}-${index}`}>
            <div>
              <h3>{location.name}</h3>
              <p>
                Latitude: {location.latitude.toFixed(4)} |
                Longitude: {location.longitude.toFixed(4)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleSelect(location)}
            >
              View on Map
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DestinationSearch;