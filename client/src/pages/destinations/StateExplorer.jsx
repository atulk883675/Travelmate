import { useEffect, useState } from "react";
import { MapPin, Search, Loader2 } from "lucide-react";

import { getDestinationRegions } from "../../services/destinationservices";

import { useNavigate } from "react-router-dom";

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
      <div className="state-explorer-header">
        <span className="explorer-tag">EXPLORE INDIA</span>

        <h1>Discover Incredible India</h1>

        <p>
          Choose a state or Union Territory and explore
          its amazing travel destinations.
        </p>

        <div className="state-search">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search states and Union Territories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="explorer-status">
          <Loader2 className="spinner" size={32} />
          <p>Loading regions...</p>
        </div>
      ) : error ? (
        <div className="explorer-status error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="region-results-info">
            <h2>Explore by State</h2>
            <span>{filteredRegions.length} regions found</span>
          </div>

          {filteredRegions.length === 0 ? (
            <div className="explorer-status">
              <p>No matching states found.</p>
            </div>
          ) : (
            <div className="regions-grid">
              {filteredRegions.map((region) => (
                <div
                  className="region-card"
                  key={region.state}
                  onClick={() =>
                   navigate(`/destinations/${encodeURIComponent(region.state)}`)
                  }
                >
                  <div className="region-card-icon">
                    <MapPin size={24} />
                  </div>

                  <div className="region-card-content">
                    <h3>{region.state}</h3>

                    <p>
                      {region.destinationCount} destinations
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StateExplorer;
