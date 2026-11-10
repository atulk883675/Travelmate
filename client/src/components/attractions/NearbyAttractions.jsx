import { useEffect, useState } from "react";
import {
  MapPin,
  ExternalLink,
  Loader2,
  Compass,
} from "lucide-react";

import { getNearbyAttractions } from "../../services/nearbyservices";

const NearbyAttractions = ({ latitude, longitude }) => {
  const [attractions, setAttractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttractions = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getNearbyAttractions(
          latitude,
          longitude
        );

        setAttractions(response.attractions || []);
      } catch (err) {
        console.error("Nearby Attractions Error:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load nearby attractions."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAttractions();
  }, [latitude, longitude]);

  if (loading) {
    return (
      <div className="explorer-status">
        <Loader2 className="spinner" size={28} />
        <p>Discovering nearby attractions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="explorer-status error">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <section className="nearby-attractions">
      <div className="nearby-attractions-header">
        <Compass size={24} />
        <div>
          <h2>Nearby Attractions</h2>
          <p>Discover interesting places around this destination.</p>
        </div>
      </div>

      {attractions.length === 0 ? (
        <div className="explorer-status">
          <p>No nearby attractions found.</p>
        </div>
      ) : (
        <>
          <p className="attractions-count">
            {attractions.length} places discovered nearby
          </p>

          <div className="attractions-grid">
            {attractions.map((attraction) => (
              <div
                className="attraction-card"
                key={attraction.id}
              >
                <div className="attraction-card-icon">
                  <MapPin size={24} />
                </div>

                <div className="attraction-card-content">
                  <h3>{attraction.name}</h3>

                  <span className="destination-category">
                    {attraction.category.replaceAll("_", " ")}
                  </span>

                  {attraction.address && (
                    <p>{attraction.address}</p>
                  )}

                  {attraction.website && (
                    <a
                      href={attraction.website}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Visit Website <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default NearbyAttractions;
