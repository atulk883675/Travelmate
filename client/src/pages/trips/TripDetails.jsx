import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTripById } from "../../services/tripservices";

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return <p>Loading trip details...</p>;
  }

  if (error) {
    return (
      <div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!trip) {
    return <p>Trip not found.</p>;
  }

  return (
    <div className="trip-details-page">
      <button onClick={() => navigate("/dashboard")}>
        ← Back to Dashboard
      </button>

      <h1>{trip.title}</h1>

      <h2>
        {trip.destination?.name}, {trip.destination?.country}
      </h2>

      <p>Starting Location: {trip.startingLocation}</p>

      <p>
        Start Date: {new Date(trip.startDate).toLocaleDateString("en-IN")}
      </p>

      <p>
        End Date: {new Date(trip.endDate).toLocaleDateString("en-IN")}
      </p>

      <p>
        Travelers: {trip.travelers?.adults} Adults,{" "}
        {trip.travelers?.children} Children
      </p>

      <p>
        Budget: {trip.budgetPlan?.currency}{" "}
        {trip.budgetPlan?.totalAmount?.toLocaleString("en-IN")}
      </p>

      <p>Travel Style: {trip.preferences?.travelStyle}</p>

      <p>Travel Pace: {trip.preferences?.pace}</p>

      <p>Status: {trip.status}</p>
    </div>
  );
}

export default TripDetails;