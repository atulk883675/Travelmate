
import { useEffect, useState } from "react";
import {
  MapPin,
  Search,
  Loader2,
  Compass,
  ArrowRight,
  Mountain,
  Map,
  RefreshCw,
} from "lucide-react";

import { getDestinationRegions } from "../../services/destinationservices";
import { useNavigate } from "react-router-dom";

import "./StateExplorer.css";

const StateExplorer = () => {
  const navigate = useNavigate();

  const [regions, setRegions] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all states and Union Territories
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDestinationRegions();
        setRegions(data.regions || []);
      } catch (err) {
        console.error("Error fetching regions:", err);
        setError(
          err.response?.data?.message ||
          "Unable to load destinations. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, []);

  // Filter regions based on search input
  const filteredRegions = regions.filter((region) =>
    region.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="state-explorer">

      {/* Hero Section */}
      <section className="se-hero">
        <div className="se-hero-decoration se-hero-decoration-one" />
        <div className="se-hero-decoration se-hero-decoration-two" />

        <div className="se-hero-content">
          <span className="se-eyebrow">
            <Compass size={15} />
            EXPLORE INDIA
          </span>

          <h1>
            Discover
            <span> Incredible India.</span>
          </h1>

          <p>
            From the mighty Himalayas to tropical coastlines,
            explore the beauty, culture and adventures waiting
            across every corner of India.
          </p>

          <div className="se-hero-stats">
            <div>
              <strong>{regions.length || "—"}</strong>
              <span>States & UTs</span>
            </div>

            <div className="se-stat-divider" />

            <div>
              <strong>
                {regions.reduce(
                  (total, region) =>
                    total + (Number(region.destinationCount) || 0),
                  0
                ) || "—"}
              </strong>
              <span>Destinations</span>
            </div>
          </div>
        </div>

        <div className="se-hero-art">
          <div className="se-art-circle">
            <Map size={78} strokeWidth={1.1} />
          </div>
          <span className="se-art-pin se-art-pin-one">
            <MapPin size={20} />
          </span>
          <span className="se-art-pin se-art-pin-two">
            <Mountain size={21} />
          </span>
          <span className="se-art-label">INCREDIBLE INDIA</span>
        </div>
      </section>

      {/* Search Section */}
      <section className="se-discovery-section">
        <div className="se-section-heading">
          <div>
            <span className="se-section-kicker">START EXPLORING</span>
            <h2>Where would you like to go?</h2>
            <p>
              Select a state or Union Territory to discover its
              travel destinations.
            </p>
          </div>
        </div>

        <div className="se-search-wrapper">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search states and Union Territories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button
              type="button"
              className="se-clear-search"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
      </section>

      {/* Results */}
      {loading ? (
        <div className="se-status">
          <Loader2 className="se-spinner" size={34} />
          <h3>Discovering India...</h3>
          <p>Loading states and Union Territories.</p>
        </div>
      ) : error ? (
        <div className="se-status se-error-state">
          <div className="se-status-icon">
            <MapPin size={27} />
          </div>
          <h3>Unable to load destinations</h3>
          <p>{error}</p>

          <button
            type="button"
            className="se-retry-button"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="se-results-heading">
            <div>
              <span className="se-section-kicker">DESTINATION DIRECTORY</span>
              <h2>Explore by Region</h2>
            </div>

            <span className="se-results-count">
              {filteredRegions.length}{" "}
              {filteredRegions.length === 1 ? "region" : "regions"} found
            </span>
          </div>

          {filteredRegions.length === 0 ? (
            <div className="se-status se-empty-state">
              <div className="se-status-icon">
                <Search size={27} />
              </div>
              <h3>No matching regions found</h3>
              <p>
                Try searching with another state or Union Territory name.
              </p>

              <button
                type="button"
                className="se-retry-button"
                onClick={() => setSearch("")}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <div className="regions-grid">
              {filteredRegions.map((region) => (
                <button
                  type="button"
                  className="region-card"
                  key={region.state}
                  onClick={() =>
                    navigate(
                      `/destinations/${encodeURIComponent(region.state)}`
                    )
                  }
                >
                  <div className="region-card-icon">
                    <MapPin size={22} />
                  </div>

                  <div className="region-card-content">
                    <h3>{region.state}</h3>

                    <p>
                      {region.destinationCount}{" "}
                      {region.destinationCount === 1
                        ? "destination"
                        : "destinations"}
                    </p>
                  </div>

                  <span className="region-card-arrow">
                    <ArrowRight size={18} />
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer */}
      {!loading && !error && (
        <div className="se-footer">
          <Compass size={16} />
          Every region has a story. Find yours.
        </div>
      )}
    </div>
  );
};

export default StateExplorer;
