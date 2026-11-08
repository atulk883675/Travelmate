
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  getTripById,
  generateTripItinerary,
} from "../../services/tripservices";

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  // Store trip information
  const [trip, setTrip] = useState(null);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  // Fetch trip details from MongoDB
  useEffect(() => {
    const fetchTrip = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getTripById(tripId);

        setTrip(data.trip);
      } catch (error) {
        console.error("Failed to fetch trip:", error);

        setError(
          error.response?.data?.message ||
          "Unable to load trip details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTrip();
  }, [tripId]);

  // Generate itinerary using Gemini AI
  const handleGenerateItinerary = async () => {
    try {
      setGenerating(true);
      setError("");

      const response = await generateTripItinerary(tripId);

      setTrip((prev) => ({
        ...prev,
        itinerary: response.itinerary,
      }));

    } catch (error) {
      console.error("Itinerary generation failed:", error);

      setError(
        error.response?.data?.message ||
        "Unable to generate itinerary."
      );
    } finally {
      setGenerating(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Loading screen
  if (loading) {
    return <p>Loading trip details...</p>;
  }

  // Error screen
  if (error && !trip) {
    return (
      <div className="trip-details-page">
        <h2>Something went wrong</h2>
        <p>{error}</p>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Trip not found
  if (!trip) {
    return <p>Trip not found.</p>;
  }

  return (
    <div className="trip-details-page">

      {/* Back button */}
      <button onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      {/* Trip information */}
      <section className="trip-info">
        <h1>{trip.title}</h1>

        <h2>
          {trip.destination?.name}, {trip.destination?.country}
        </h2>

        <p>
          Starting Location: {trip.startingLocation}
        </p>

        <p>
          Start Date: {formatDate(trip.startDate)}
        </p>

        <p>
          End Date: {formatDate(trip.endDate)}
        </p>

        <p>
          Travelers: {trip.travelers?.adults} Adults,{" "}
          {trip.travelers?.children} Children
        </p>

        <p>
          Budget: {trip.budgetPlan?.currency}{" "}
          {trip.budgetPlan?.totalAmount?.toLocaleString("en-IN")}
        </p>

        <p>
          Travel Style: {trip.preferences?.travelStyle}
        </p>

        <p>
          Travel Pace: {trip.preferences?.pace}
        </p>

        <p>
          Status: {trip.status}
        </p>
      </section>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Generate itinerary */}
      <section className="itinerary-section">

        <div className="itinerary-heading">
          <h2>Your Travel Itinerary</h2>

          <button
            onClick={handleGenerateItinerary}
            disabled={generating}
          >
            {generating
              ? "Generating Itinerary..."
              : trip.itinerary?.length > 0
                ? "Regenerate Itinerary"
                : "Generate Itinerary"}
          </button>
        </div>

        {/* Generation loading message */}
        {generating && (
          <p>
            Gemini AI is preparing your personalized itinerary.
            Please wait...
          </p>
        )}

        {/* Empty itinerary */}
        {!generating && (!trip.itinerary || trip.itinerary.length === 0) && (
          <div className="empty-itinerary">
            <h3>No itinerary generated yet!</h3>
            <p>
              Click Generate Itinerary to plan your adventure
              with TravelMate AI.
            </p>
          </div>
        )}

        {/* Display generated itinerary */}
        {!generating && trip.itinerary?.length > 0 && (
          <div className="itinerary-days">

            {trip.itinerary.map((day) => (
              <div
                key={day._id || day.dayNumber}
                className="itinerary-day"
              >
                <div className="itinerary-day-header">
                  <h3>
                    Day {day.dayNumber}: {day.title}
                  </h3>

                  <span>
                    {formatDate(day.date)}
                  </span>
                </div>

                <p className="day-summary">
                  {day.summary}
                </p>

                <div className="activities-list">

                  {day.activities.map((activity, index) => (
                    <div
                      key={activity._id || index}
                      className="activity-card"
                    >
                      <h4>{activity.name}</h4>

                      <p>{activity.description}</p>

                      <p>
                        <strong>Time:</strong>{" "}
                        {activity.startTime} - {activity.endTime}
                      </p>

                      <p>
                        <strong>Location:</strong>{" "}
                        {activity.location}
                      </p>

                      <p>
                        <strong>Estimated Cost:</strong>{" "}
                        {trip.budgetPlan?.currency}{" "}
                        {activity.estimatedCost?.toLocaleString("en-IN")}
                      </p>
                    </div>
                  ))}

                </div>
              </div>
            ))}

          </div>
        )}

      </section>
    </div>
  );
}

export default TripDetails;
