
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookmarkCheck,
  MapPin,
  Loader2,
  Trash2,
} from "lucide-react";

import {
  getSavedDestinations,
  removeSavedDestination,
} from "../../services/destinationservices";

const SavedDestinations = () => {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    const fetchSavedDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getSavedDestinations();

        setDestinations(data.destinations || []);
      } catch (err) {
        console.error("Error fetching saved destinations:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load saved destinations."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSavedDestinations();
  }, []);

  const handleRemove = async (destinationId) => {
    try {
      setRemovingId(destinationId);

      await removeSavedDestination(destinationId);

      setDestinations((previous) =>
        previous.filter(
          (destination) => destination._id !== destinationId
        )
      );
    } catch (err) {
      console.error("Error removing destination:", err);

      alert(
        err.response?.data?.message ||
        "Unable to remove saved destination."
      );
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="state-explorer">
      <button
        className="back-button"
        onClick={() => navigate("/destinations")}
      >
        <ArrowLeft size={18} />
        Explore States
      </button>

      <div className="state-explorer-header">
        <span className="explorer-tag">YOUR COLLECTION</span>
        <h1>Saved Destinations</h1>
        <p>
          All your bookmarked destinations, together in one place.
        </p>
      </div>

      {loading && (
        <div className="explorer-status">
          <Loader2 className="spinner" size={32} />
          <p>Loading saved destinations...</p>
        </div>
      )}

      {!loading && error && (
        <div className="explorer-status error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && destinations.length === 0 && (
        <div className="explorer-status">
          <BookmarkCheck size={40} />
          <h2>No saved destinations yet</h2>
          <p>Explore India and bookmark places you want to visit.</p>
          <button onClick={() => navigate("/destinations")}>
            Explore Destinations
          </button>
        </div>
      )}

      {!loading && !error && destinations.length > 0 && (
        <>
          <div className="region-results-info">
            <h2>Your Bookmarks</h2>
            <span>{destinations.length} places saved</span>
          </div>

          <div className="destination-grid">
            {destinations.map((destination) => (
              <div
                className="destination-card"
                key={destination._id}
              >
                {destination.imageUrl ? (
                  <img
                    src={destination.imageUrl}
                    alt={destination.name}
                    className="destination-card-image"
                  />
                ) : (
                  <div className="destination-image-placeholder">
                    <MapPin size={35} />
                  </div>
                )}

                <div className="destination-card-content">
                  <span className="destination-category">
                    {destination.category}
                  </span>

                  <h3>{destination.name}</h3>

                  <p>{destination.description}</p>

                  <div className="destination-best-time">
                    <strong>State:</strong>
                    <span>{destination.state}</span>
                  </div>

                  <div className="destination-best-time">
                    <strong>Best time to visit:</strong>
                    <span>{destination.bestTimeToVisit}</span>
                  </div>

                  <button
                    className="save-destination-button"
                    onClick={() => handleRemove(destination._id)}
                    disabled={removingId === destination._id}
                  >
                    {removingId === destination._id ? (
                      <Loader2 size={18} className="spinner" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SavedDestinations;
