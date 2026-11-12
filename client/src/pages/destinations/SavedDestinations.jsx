import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookmarkCheck,
  MapPin,
  Loader2,
  Trash2,
  Compass,
  CalendarDays,
  RefreshCw,
  Mountain,
} from "lucide-react";

import {
  getSavedDestinations,
  removeSavedDestination,
} from "../../services/destinationservices";

import "./SavedDestinations.css";

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
    <div className="saved-destinations-page">

      {/* Back navigation */}
      <button
        className="sv-back-button"
        onClick={() => navigate("/destinations")}
      >
        <ArrowLeft size={17} />
        Explore States
      </button>

      {/* Hero section */}
      <section className="sv-hero">
        <div className="sv-hero-decoration sv-decoration-one" />
        <div className="sv-hero-decoration sv-decoration-two" />

        <div className="sv-hero-content">
          <span className="sv-eyebrow">
            <BookmarkCheck size={15} />
            YOUR PERSONAL COLLECTION
          </span>

          <h1>Saved Destinations</h1>

          <p>
            Your travel wishlist, all in one place.
            Keep track of the places you dream of visiting
            and start planning your next adventure.
          </p>

          {!loading && !error && (
            <div className="sv-hero-stat">
              <BookmarkCheck size={17} />
              <strong>{destinations.length}</strong>
              <span>
                {destinations.length === 1
                  ? "Place saved"
                  : "Places saved"}
              </span>
            </div>
          )}
        </div>

        <div className="sv-hero-art">
          <div className="sv-bookmark-circle">
            <Compass size={66} strokeWidth={1.2} />
          </div>

          <span className="sv-floating-bookmark">
            <BookmarkCheck size={22} />
          </span>
        </div>
      </section>

      {/* Loading state */}
      {loading && (
        <div className="sv-status">
          <Loader2 size={34} className="sv-spinner" />
          <h3>Loading your collection...</h3>
          <p>Gathering your saved travel destinations.</p>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="sv-status sv-error-state">
          <div className="sv-status-icon">
            <BookmarkCheck size={28} />
          </div>

          <h3>Couldn't load your collection</h3>
          <p>{error}</p>

          <button
            className="sv-primary-button"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && destinations.length === 0 && (
        <div className="sv-empty-state">
          <div className="sv-empty-art">
            <BookmarkCheck size={43} />
            <span>
              <MapPin size={19} />
            </span>
          </div>

          <span className="sv-section-kicker">
            YOUR NEXT ADVENTURE STARTS HERE
          </span>

          <h2>No saved destinations yet</h2>

          <p>
            You haven't bookmarked any places. Explore India,
            discover amazing destinations and save the ones
            you'd love to visit.
          </p>

          <button
            className="sv-primary-button"
            onClick={() => navigate("/destinations")}
          >
            Explore Destinations
            <ArrowRight size={17} />
          </button>
        </div>
      )}

      {/* Saved destinations */}
      {!loading && !error && destinations.length > 0 && (
        <section className="sv-collection-section">

          <div className="sv-section-heading">
            <div>
              <span className="sv-section-kicker">
                PLACES YOU LOVE
              </span>

              <h2>Your Travel Wishlist</h2>

              <p>
                All the destinations you've bookmarked for future adventures.
              </p>
            </div>

            <span className="sv-results-count">
              {destinations.length}{" "}
              {destinations.length === 1 ? "PLACE" : "PLACES"}
            </span>
          </div>

          <div className="sv-destination-grid">
            {destinations.map((destination) => {
              const isRemoving = removingId === destination._id;

              return (
                <article
                  className="sv-destination-card"
                  key={destination._id}
                >
                  {/* Destination image */}
                  <div className="sv-card-image-wrapper">
                    {destination.imageUrl ? (
                      <img
                        src={destination.imageUrl}
                        alt={destination.name}
                        className="sv-card-image"
                      />
                    ) : (
                      <div className="sv-image-placeholder">
                        <Mountain size={42} />
                        <span>{destination.name}</span>
                      </div>
                    )}

                    <span className="sv-category-badge">
                      {destination.category || "Destination"}
                    </span>

                    <div className="sv-saved-indicator">
                      <BookmarkCheck size={15} />
                      Saved
                    </div>
                  </div>

                  {/* Card details */}
                  <div className="sv-card-content">
                    <h3>{destination.name}</h3>

                    <p className="sv-card-description">
                      {destination.description}
                    </p>

                    <div className="sv-info-row">
                      <MapPin size={16} />
                      <div>
                        <small>LOCATION</small>
                        <strong>
                          {destination.state || "India"}
                        </strong>
                      </div>
                    </div>

                    <div className="sv-info-row">
                      <CalendarDays size={16} />
                      <div>
                        <small>BEST TIME TO VISIT</small>
                        <strong>
                          {destination.bestTimeToVisit || "Not specified"}
                        </strong>
                      </div>
                    </div>

                    <div className="sv-card-actions">
                      <button
                        type="button"
                        className="sv-view-button"
                        onClick={() =>
                          navigate(`/destination/${destination._id}`)
                        }
                      >
                        View Details
                        <ArrowRight size={16} />
                      </button>

                      <button
                        type="button"
                        className="sv-remove-button"
                        onClick={() => handleRemove(destination._id)}
                        disabled={isRemoving}
                        aria-label={`Remove ${destination.name} from saved destinations`}
                      >
                        {isRemoving ? (
                          <Loader2
                            size={17}
                            className="sv-spinner"
                          />
                        ) : (
                          <Trash2 size={17} />
                        )}
                        <span>
                          {isRemoving ? "Removing..." : "Remove"}
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <div className="sv-footer">
        <Compass size={16} />
        Your wishlist today. Your adventures tomorrow.
      </div>
    </div>
  );
};

export default SavedDestinations;
