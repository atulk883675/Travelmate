
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  MapPin,
  Plane,
  Search,
  SlidersHorizontal,
  Plus,
  LogOut,
  Sparkles,
  Mountain,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { getMyTrips } from "../../services/tripservices";
import TripCard from "../../components/trips/TripCard";

import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMyTrips();
      setTrips(data.trips || []);
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

  const filteredTrips = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const result = trips.filter((trip) => {
      const title = String(trip.title || "").toLowerCase();
      const destination = String(
        trip.destination?.name || ""
      ).toLowerCase();
      const country = String(
        trip.destination?.country || ""
      ).toLowerCase();
      const startingLocation = String(
        trip.startingLocation || ""
      ).toLowerCase();

      return (
        title.includes(query) ||
        destination.includes(query) ||
        country.includes(query) ||
        startingLocation.includes(query)
      );
    });

    result.sort((a, b) => {
      const dateA = new Date(a.startDate).getTime();
      const dateB = new Date(b.startDate).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [trips, searchQuery, sortOrder]);

  const upcomingTrips = trips.filter(
    (trip) => new Date(trip.endDate) >= new Date()
  ).length;

  const uniqueDestinations = new Set(
    trips.map((trip) =>
      String(trip.destination?.name || "").toLowerCase()
    ).filter(Boolean)
  ).size;

  return (
    <div className="dashboard-page">

      {/* Adventure Welcome Section */}
      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-eyebrow">
            <Sparkles size={15} />
            YOUR NEXT ADVENTURE STARTS HERE
          </div>

          <h2>
            Hey, {user?.name?.split(" ")[0] || "Traveler"}!
            <br />
            <span>Ready to explore?</span>
          </h2>

          <p>
            Every great journey begins with a plan.
            Discover new destinations and make your next trip unforgettable.
          </p>

          <div className="dashboard-hero-actions">
            <button
              className="dashboard-primary-button"
              onClick={() => navigate("/create-trip")}
            >
              <Plus size={18} />
              Plan a New Trip
            </button>

            <button
              className="dashboard-secondary-button"
              onClick={() => navigate("/destinations")}
            >
              <Compass size={18} />
              Explore Places
            </button>
          </div>
        </div>

        <div className="dashboard-hero-art">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />
          <Mountain className="hero-mountain-icon" strokeWidth={1.1} />
          <div className="hero-art-caption">
            <span>EXPLORE</span>
            <strong>BEYOND LIMITS</strong>
          </div>
        </div>

        <button
          className="dashboard-logout-button"
          onClick={logout}
          title="Logout"
        >
          <LogOut size={17} />
          <span>Logout</span>
        </button>
      </section>

      {/* Travel Statistics */}
      <section className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div className="stat-icon stat-icon-teal">
            <Plane size={21} />
          </div>
          <div>
            <span className="stat-label">TOTAL TRIPS</span>
            <h3>{trips.length}</h3>
            <p>Your planned journeys</p>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon stat-icon-orange">
            <MapPin size={21} />
          </div>
          <div>
            <span className="stat-label">DESTINATIONS</span>
            <h3>{uniqueDestinations}</h3>
            <p>Places on your list</p>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="stat-icon stat-icon-purple">
            <Compass size={21} />
          </div>
          <div>
            <span className="stat-label">UPCOMING TRIPS</span>
            <h3>{upcomingTrips}</h3>
            <p>Adventures ahead</p>
          </div>
        </div>
      </section>

      {/* My Trips */}
      <section className="dashboard-trips-section">
        <div className="dashboard-section-heading">
          <div>
            <span className="dashboard-section-eyebrow">
              YOUR TRAVEL COLLECTION
            </span>
            <h2>My Adventures</h2>
            <p>All your journeys, organized in one place.</p>
          </div>

          <button
            className="dashboard-create-button"
            onClick={() => navigate("/create-trip")}
          >
            <Plus size={17} />
            Create Trip
          </button>
        </div>

        {/* Search and Sorting */}
        {!loading && !error && trips.length > 0 && (
          <div className="dashboard-trip-controls">
            <div className="dashboard-search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search trips or destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="dashboard-sort-box">
              <SlidersHorizontal size={17} />
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="dashboard-message">
            <div className="dashboard-loader" />
            <p>Preparing your adventures...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="dashboard-error">
            <p>{error}</p>
            <button onClick={fetchTrips}>Try Again</button>
          </div>
        )}

        {/* No Trips */}
        {!loading && !error && trips.length === 0 && (
          <div className="dashboard-empty-state">
            <div className="empty-state-icon">
              <Compass size={35} />
            </div>

            <h3>Your adventure story starts here</h3>
            <p>
              You haven't planned any trips yet.
              Create your first journey and start exploring the world.
            </p>

            <button
              onClick={() => navigate("/create-trip")}
            >
              <Plus size={18} />
              Plan Your First Trip
            </button>
          </div>
        )}

        {/* Trip Results */}
        {!loading && !error && trips.length > 0 && (
          <>
            <div className="dashboard-results-info">
              <span>
                Showing <strong>{filteredTrips.length}</strong> of{" "}
                <strong>{trips.length}</strong> trips
              </span>
            </div>

            {filteredTrips.length > 0 ? (
              <div className="dashboard-trip-grid">
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
              <div className="dashboard-no-results">
                <Search size={27} />
                <h3>No matching adventures</h3>
                <p>
                  Try another trip name, destination or starting location.
                </p>
                <button onClick={() => setSearchQuery("")}>
                  Clear Search
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
