import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getMyTrips } from "../../services/tripservices";
import TripCard from "../../components/trips/TripCard";

function Dashboard() {
  const { user, logout } = useAuth();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search and sorting states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

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

  useEffect(() => {
    fetchTrips();
  }, []);

  // Search and sort trips
  const filteredTrips = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // First, filter trips according to the search query
    const result = trips.filter((trip) => {
      const title = String(trip.title || "");
      const destination = String(trip.destination || "");
      const startingLocation = String(trip.startingLocation || "");

      return (
        title.toLowerCase().includes(query) ||
        destination.toLowerCase().includes(query) ||
        startingLocation.toLowerCase().includes(query)
      );
    });

    // Then, sort the filtered trips by starting date
    result.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [trips, searchQuery, sortOrder]);

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
  <div>
    <h1>Welcome, {user?.name || "Traveler"}!</h1>
    <p>{user?.email}</p>
  </div>

  <div className="dashboard-header-actions">
    <button
      onClick={() => {
        window.location.href = "/destinations";
      }}
    >
      Explore Destinations
    </button>

    <button onClick={logout}>
      Logout
    </button>
  </div>
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
        {loading && <p>Loading your trips...</p>}

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

        {/* Search, Sorting and Trip List */}
        {!loading && !error && trips.length > 0 && (
          <>
            <p>Total Trips: {trips.length}</p>

            <div className="trip-controls">

              {/* Search */}
              <input
                type="text"
                placeholder="Search by title, destination or starting location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              {/* Sorting */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">
                  Newest First
                </option>

                <option value="oldest">
                  Oldest First
                </option>
              </select>

            </div>

            {/* Filtered Trip Count */}
            <p>
              Showing {filteredTrips.length} of {trips.length} trips
            </p>

            {/* Trip List */}
            {filteredTrips.length > 0 ? (
              <div className="trips-list">
                {filteredTrips.map((trip) => (
                 <TripCard
                  key={trip._id}
                  trip={trip}
                  onDelete={(deletedTripId) => {
                  setTrips((previousTrips) =>
                  previousTrips.filter(
                  (item) => item._id !== deletedTripId
                  )
                  );
                }}
                />
                ))}
              </div>
            ) : (
              <div className="empty-trips">
                <h3>No matching trips found</h3>
                <p>
                  Try searching with another destination or trip name.
                </p>
              </div>
            )}
          </>
        )}

      </section>
    </div>
  );
}

export default Dashboard;
