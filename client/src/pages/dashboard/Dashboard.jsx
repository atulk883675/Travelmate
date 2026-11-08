import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyTrips } from "../../services/tripservices";
import TripCard from "../../components/trips/TripCard";

function Dashboard() {
  // Authentication context
  const { user, logout } = useAuth();

  // Trip-related states
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch trips from backend
  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyTrips();

      setTrips(data.trips);
    } catch (error) {
      console.error("Failed to fetch trips:", error);

      setError(
        error.response?.data?.message ||
        "Unable to load your trips."
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch trips when Dashboard loads
  useEffect(() => {
    fetchTrips();
  }, []);

  // Dashboard UI
  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {user?.name || "Traveler"}!</h1>
          <p>{user?.email}</p>
        </div>

        <button onClick={logout}>
          Logout
        </button>
      </header>

      {/* Trips Section */}
      <section className="dashboard-trips">

        <div className="trips-heading">
          <h2>My Trips</h2>

          <button
            onClick={() => {
              window.location.href = "/create-trip";
            }}
          >
            + Create New Trip
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <p>Loading your trips...</p>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && trips.length === 0 && (
          <div className="empty-trips">
            <h3>No trips yet!</h3>
            <p>
              Start planning your next adventure with TravelMate AI.
            </p>

            <button
              onClick={() => {
                window.location.href = "/create-trip";
              }}
            >
              Create Your First Trip
            </button>
          </div>
        )}

        {/* Trip Count */}
        {!loading && !error && trips.length > 0 && (
          <>
            <p>Total Trips: {trips.length}</p>

            {/* Temporary trip list */}
            <div className="trips-list">
              {trips.map((trip) => (
               <TripCard
                key={trip._id}
                trip={trip}
              />
              ))}
            </div>
          </>
        )}

      </section>
    </div>
  );
}

export default Dashboard;

