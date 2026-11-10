import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";

import {
  getDestinations,
  getSavedDestinations,
  saveDestination,
  removeSavedDestination,
} from "../../services/destinationservices";

const StateDestinations = () => {
  const { state } = useParams();
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [savedIds, setSavedIds] = useState([]);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDestinations({
          state: state,
        });

        setDestinations(data.destinations || []);

        // Fetch destinations already saved by the user
        try {
         const savedData = await getSavedDestinations();

         const saved = savedData.destinations || [];

         setSavedIds(
           saved.map((destination) =>
           typeof destination === "string"
           ? destination
           : destination._id
           )
         );
        } catch (savedError) {
          console.error("Error fetching saved destinations:", savedError);
        } 
      } catch (err) {
        console.error("Error fetching destinations:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load destinations. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDestinations();
  }, [state]);

  const handleSaveToggle = async (destinationId) => {
  try {
    setSavingId(destinationId);

    const isSaved = savedIds.includes(destinationId);

    if (isSaved) {
      await removeSavedDestination(destinationId);

      setSavedIds((previous) =>
        previous.filter((id) => id !== destinationId)
      );
    } else {
      await saveDestination(destinationId);

      setSavedIds((previous) => [
        ...previous,
        destinationId,
      ]);
    }
  } catch (error) {
    console.error("Error updating saved destination:", error);

    alert(
      error.response?.data?.message ||
      "Unable to update saved destination."
    );
  } finally {
    setSavingId(null);
  }
  };

  return (
    <div className="state-explorer">

      {/* Back Button */}
      <button
        className="back-button"
        onClick={() => navigate("/destinations")}
      >
        <ArrowLeft size={18} />
        Back to States
      </button>

      {/* Page Heading */}
      <div className="state-explorer-header">
        <span className="explorer-tag">
          EXPLORE INDIA
        </span>

        <h1>{state}</h1>

        <p>
          Discover amazing places, experiences and
          attractions in {state}.
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="explorer-status">
          <Loader2 className="spinner" size={32} />
          <p>Loading destinations...</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="explorer-status error">
          <p>{error}</p>

          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && destinations.length === 0 && (
        <div className="explorer-status">
          <p>No destinations found for {state}.</p>
        </div>
      )}

      {/* Destination Cards */}
      {!loading && !error && destinations.length > 0 && (
        <>
          <div className="region-results-info">
            <h2>Popular Destinations</h2>

            <span>
              {destinations.length} places found
            </span>
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

                  <button
                   className="save-destination-button"
                   onClick={() => handleSaveToggle(destination._id)}
                   disabled={savingId === destination._id}
                   >
                   {savedIds.includes(destination._id) ? (
                   <>
                   <BookmarkCheck size={18} />
                   Saved
                   </>
                   ) : (
                   <>
                   <Bookmark size={18} />
                   Save
                   </>
                   )}
                  </button>

                  <p>{destination.description}</p>

                  <div className="destination-best-time">
                    <strong>Best time to visit:</strong>
                    <span>{destination.bestTimeToVisit}</span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
};

export default StateDestinations;
