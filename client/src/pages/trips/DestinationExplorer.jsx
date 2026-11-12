import React, { useState } from "react";
import {
  Compass,
  MapPin,
  Navigation,
  Search,
  LocateFixed,
  CheckCircle2,
  LoaderCircle,
  Mountain,
  ArrowRight,
  Route,
} from "lucide-react";

import DestinationSearch from "../../components/trips/DestinationSearch";
import DestinationMap from "../../components/trips/DestinationMap";
import { searchDestination } from "../../services/mapservices";
import WeatherCard from "../../components/trips/WeatherCard";

import "./DestinationExplorer.css";

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

      {/* Hero */}
      <section className="de-hero">
        <div className="de-hero-decoration de-decoration-one" />
        <div className="de-hero-decoration de-decoration-two" />

        <div className="de-hero-content">
          <span className="de-eyebrow">
            <Compass size={15} />
            DISCOVER YOUR NEXT ADVENTURE
          </span>

          <h1>
            Explore the
            <span> World.</span>
          </h1>

          <p>
            Find incredible destinations, check local weather,
            and discover the route that takes you there.
          </p>

          <div className="de-hero-features">
            <span><MapPin size={15} /> Discover places</span>
            <span><CloudIcon /> Live weather</span>
            <span><Route size={15} /> Plan your route</span>
          </div>
        </div>

        <div className="de-hero-illustration">
          <div className="de-compass-circle">
            <Compass size={76} strokeWidth={1.2} />
            <span className="de-compass-north">N</span>
          </div>
          <div className="de-floating-pin">
            <MapPin size={23} />
          </div>
          <div className="de-floating-mountain">
            <Mountain size={31} />
          </div>
        </div>
      </section>

      {/* Starting location */}
      <section className="de-search-section">
        <div className="de-section-heading">
          <div>
            <span className="de-section-kicker">STEP 01</span>
            <h2><Navigation size={22} /> Where are you starting from?</h2>
            <p>Choose your starting point for route calculation.</p>
          </div>
        </div>

        <div className="de-search-panel">
          <form onSubmit={handleStartSearch} className="de-start-form">
            <div className="de-input-wrapper">
              <MapPin size={19} />
              <input
                type="text"
                value={startQuery}
                onChange={(e) => setStartQuery(e.target.value)}
                placeholder="Enter city, landmark or starting location..."
              />
            </div>

            <button
              type="submit"
              className="de-search-button"
              disabled={searchingStart}
            >
              {searchingStart ? (
                <>
                  <LoaderCircle size={17} className="de-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search size={17} />
                  Search Location
                </>
              )}
            </button>
          </form>

          {startError && (
            <div className="de-error-message">
              {startError}
            </div>
          )}

          {/* Starting location search results */}
          {startResults.length > 0 && (
            <div className="de-start-results">
              <h3>Matching locations</h3>

              {startResults.map((location, index) => (
                <div
                  key={`${location.latitude}-${location.longitude}-${index}`}
                  className="de-start-result"
                >
                  <div className="de-result-icon">
                    <MapPin size={18} />
                  </div>

                  <div className="de-result-info">
                    <strong>{location.name}</strong>
                    <span>
                      {location.latitude}, {location.longitude}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectStart(location)}
                  >
                    Select <ArrowRight size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Selected starting location */}
          {startLocation && (
            <div className="de-selected-start">
              <div className="de-selected-check">
                <CheckCircle2 size={19} />
              </div>

              <div>
                <small>YOUR STARTING POINT</small>
                <strong>{startLocation.name}</strong>
              </div>

              <span className="de-selected-badge">Selected</span>
            </div>
          )}
        </div>
      </section>

      {/* Destination search */}
      <section className="de-search-section">
        <div className="de-section-heading">
          <div>
            <span className="de-section-kicker">STEP 02</span>
            <h2><Compass size={22} /> Where do you want to go?</h2>
            <p>Search for a destination you would love to explore.</p>
          </div>
        </div>

        <div className="de-destination-search-panel">
          <DestinationSearch
            onLocationSelect={handleDestinationSelect}
          />
        </div>
      </section>

      {/* Selected destination */}
      {selectedLocation && (
        <section className="de-exploration-section">
          <div className="de-selected-destination-heading">
            <div>
              <span className="de-section-kicker">YOUR SELECTED DESTINATION</span>

              <h2>
                <MapPin size={23} />
                {selectedLocation.name}
              </h2>

              <p>
                Explore the weather and plan your journey to this destination.
              </p>
            </div>

            <span className="de-destination-ready">
              <CheckCircle2 size={15} /> Destination selected
            </span>
          </div>

          {/* Weather */}
          <div className="de-exploration-card">
            <div className="de-card-heading">
              <div className="de-card-heading-icon">
                <CloudIcon />
              </div>
              <div>
                <h3>Destination Weather</h3>
                <p>Check the weather conditions before travelling.</p>
              </div>
            </div>

            <WeatherCard
              latitude={selectedLocation.latitude}
              longitude={selectedLocation.longitude}
              destination={selectedLocation.name}
            />
          </div>

          {/* Map */}
          <div className="de-exploration-card de-map-card">
            <div className="de-card-heading">
              <div className="de-card-heading-icon">
                <Route size={21} />
              </div>
              <div>
                <h3>Explore the Route</h3>
                <p>
                  View your destination and calculate the route
                  from your selected starting point.
                </p>
              </div>
            </div>

            <DestinationMap
              latitude={selectedLocation.latitude}
              longitude={selectedLocation.longitude}
              destination={selectedLocation.name}
              startLocation={startLocation}
            />
          </div>
        </section>
      )}

      {/* Empty state */}
      {!selectedLocation && (
        <div className="de-discovery-empty">
          <div className="de-empty-icon">
            <Compass size={34} />
          </div>
          <h3>Your next adventure starts here</h3>
          <p>
            Search and select a destination above to see its weather
            and explore the route on the map.
          </p>
        </div>
      )}

      <div className="de-footer">
        <Compass size={16} />
        Explore more. Travel farther. Make memories.
      </div>
    </div>
  );
};

function CloudIcon() {
  return <span className="de-cloud-icon">☁</span>;
}

export default DestinationExplorer;
