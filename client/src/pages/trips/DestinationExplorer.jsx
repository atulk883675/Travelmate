import React, { useState } from "react";
import DestinationSearch from "../../components/trips/DestinationSearch";
import DestinationMap from "../../components/trips/DestinationMap";
import { searchDestination } from "../../services/mapservices";
import WeatherCard from "../../components/trips/WeatherCard";

const DestinationExplorer = () => {
  const [selectedLocation, setSelectedLocation] = useState(() => {
  const saved = sessionStorage.getItem("travelmate_destination");
  return saved ? JSON.parse(saved) : null;
  });

  const [startLocation, setStartLocation] = useState(() => {
  const saved = sessionStorage.getItem("travelmate_start_location");
  return saved ? JSON.parse(saved) : null;
  });

  const [startQuery, setStartQuery] = useState("");
  const [startResults, setStartResults] = useState([]);
  

  const [searchingStart, setSearchingStart] = useState(false);
  const [startError, setStartError] = useState("");

  const handleStartSearch = async (e) => {
    e.preventDefault();

    if (!startQuery.trim()) {
      setStartError("Please enter a starting location.");
      return;
    }

    try {
      setSearchingStart(true);
      setStartError("");
      setStartResults([]);

      const response = await searchDestination(startQuery);

      setStartResults(response.locations || []);

      if (!response.locations?.length) {
        setStartError("No matching starting locations found.");
      }
    } catch (error) {
      console.error("Starting Location Search Error:", error);
      setStartError("Failed to search starting location.");
    } finally {
      setSearchingStart(false);
    }
  };

  const handleSelectStart = (location) => {
  setStartLocation(location);
  sessionStorage.setItem(
    "travelmate_start_location",
    JSON.stringify(location)
  );

  setStartResults([]);
  setStartError("");
  };

 const handleDestinationSelect = (location) => {
  setSelectedLocation(location);
  sessionStorage.setItem(
    "travelmate_destination",
    JSON.stringify(location)
  );
  };

  return (
    <div className="destination-explorer-page">
      <h1>Destination Explorer</h1>

      <p>
        Search for destinations and calculate driving routes
        between locations.
      </p>

      <section className="starting-location-section">
        <h2>Starting Location</h2>

        <form onSubmit={handleStartSearch}>
          <input
            type="text"
            value={startQuery}
            onChange={(e) => setStartQuery(e.target.value)}
            placeholder="Enter starting location"
          />

          <button type="submit" disabled={searchingStart}>
            {searchingStart ? "Searching..." : "Search Starting Point"}
          </button>
        </form>

        {startError && (
          <p className="error-message">{startError}</p>
        )}

        {startResults.map((location, index) => (
          <div
            key={`${location.latitude}-${location.longitude}-${index}`}
            className="destination-result-card"
          >
            <p>{location.name}</p>

            <button
              type="button"
              onClick={() => handleSelectStart(location)}
            >
              Select Starting Point
            </button>
          </div>
        ))}

        {startLocation && (
          <p>
            Selected starting point: <strong>{startLocation.name}</strong>
          </p>
        )}
      </section>

      <DestinationSearch
        onLocationSelect={handleDestinationSelect}
      />

      {selectedLocation && (
       <div className="selected-destination">
       <h2>{selectedLocation.name}</h2>

        <WeatherCard
        latitude={selectedLocation.latitude}
        longitude={selectedLocation.longitude}
        destination={selectedLocation.name}
        />

        <DestinationMap
        latitude={selectedLocation.latitude}
        longitude={selectedLocation.longitude}
        destination={selectedLocation.name}
        startLocation={startLocation}
        />
        </div>
      )}
    </div>
  );
};

export default DestinationExplorer;