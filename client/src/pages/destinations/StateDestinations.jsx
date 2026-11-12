import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Loader2,
  Bookmark,
  BookmarkCheck,
  Search,
  Compass,
  CalendarDays,
  SlidersHorizontal,
  Mountain,
  RefreshCw,
} from "lucide-react";

import {
  getDestinations,
  getSavedDestinations,
  saveDestination,
  removeSavedDestination,
} from "../../services/destinationservices";

import "./StateDestinations.css";

const StateDestinations = () => {
  const { state } = useParams();
  const navigate = useNavigate();

  // Destination states
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Saved destination states
  const [savedIds, setSavedIds] = useState([]);
  const [savingId, setSavingId] = useState(null);

  // Search and filter states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("az");

  // Fetch destinations and saved destinations
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
          console.error(
            "Error fetching saved destinations:",
            savedError
          );
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

  // Search, category filtering and sorting
  const filteredDestinations = destinations
    .filter((destination) => {
      const destinationName = String(destination.name || "");

      const matchesSearch = destinationName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        destination.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const nameA = String(a.name || "");
      const nameB = String(b.name || "");

      return sortOrder === "az"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  // Save or unsave destination
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

  const handleViewDetails = (destinationId) => {
    navigate(`/destination/${destinationId}`);
  };

  return (
    <div className="state-destinations-page">

      {/* Back navigation */}
      <button
        className="sd-back-button"
        onClick={() => navigate("/destinations")}
      >
        <ArrowLeft size={17} />
        Back to States
      </button>

      {/* Hero */}
      <section className="sd-hero">
        <div className="sd-hero-decoration sd-decoration-one" />
        <div className="sd-hero-decoration sd-decoration-two" />

        <div className="sd-hero-content">
          <span className="sd-eyebrow">
            <Compass size={15} />
            EXPLORE INDIA
          </span>

          <h1>{state}</h1>

          <p>
            Discover amazing places, unforgettable experiences
            and hidden gems waiting to be explored in {state}.
          </p>

          {!loading && !error && (
            <div className="sd-hero-stat">
              <MapPin size={17} />
              <strong>{destinations.length}</strong>
              <span>
                {destinations.length === 1
                  ? "Destination to explore"
                  : "Destinations to explore"}
              </span>
            </div>
          )}
        </div>

        <div className="sd-hero-art">
          <div className="sd-compass-circle">
            <Mountain size={70} strokeWidth={1.2} />
          </div>
          <span className="sd-floating-pin">
            <MapPin size={22} />
          </span>
        </div>
      </section>

      {/* Loading */}
      {loading && (
        <div className="sd-status">
          <Loader2 size={34} className="sd-spinner" />
          <h3>Finding amazing places...</h3>
          <p>Loading destinations in {state}.</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="sd-status sd-error-state">
          <div className="sd-status-icon">
            <MapPin size={28} />
          </div>

          <h3>Unable to load destinations</h3>
          <p>{error}</p>

          <button
            className="sd-primary-button"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      )}

      {/* Empty destination list */}
      {!loading && !error && destinations.length === 0 && (
        <div className="sd-status">
          <div className="sd-status-icon">
            <Compass size={29} />
          </div>

          <h3>No destinations available yet</h3>
          <p>
            There are currently no destinations listed for {state}.
          </p>

          <button
            className="sd-secondary-button"
            onClick={() => navigate("/destinations")}
          >
            <ArrowLeft size={16} />
            Explore Other States
          </button>
        </div>
      )}

      {/* Destination catalogue */}
      {!loading && !error && destinations.length > 0 && (
        <>
          <section className="sd-catalogue-section">

            {/* Section heading */}
            <div className="sd-section-heading">
              <div>
                <span className="sd-section-kicker">
                  FIND YOUR NEXT STOP
                </span>
                <h2>Popular Destinations</h2>
                <p>
                  Explore the places that make {state} special.
                </p>
              </div>

              <span className="sd-results-count">
                {filteredDestinations.length} of {destinations.length} places
              </span>
            </div>

            {/* Filters */}
            <div className="sd-filter-panel">
              <div className="sd-search-box">
                <Search size={19} />
                <input
                  type="text"
                  placeholder="Search destinations..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch("")}
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="sd-filter-control">
                <SlidersHorizontal size={17} />

                <select
                  value={selectedCategory}
                  onChange={(e) =>
                    setSelectedCategory(e.target.value)
                  }
                  aria-label="Filter by category"
                >
                  <option value="all">All Categories</option>
                  <option value="mountain">Mountain</option>
                  <option value="beach">Beach</option>
                  <option value="city">City</option>
                  <option value="historical">Historical</option>
                  <option value="nature">Nature</option>
                  <option value="adventure">Adventure</option>
                </select>
              </div>

              <div className="sd-filter-control">
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  aria-label="Sort destinations"
                >
                  <option value="az">Name: A–Z</option>
                  <option value="za">Name: Z–A</option>
                </select>
              </div>
            </div>

            {/* No matching destinations */}
            {filteredDestinations.length === 0 ? (
              <div className="sd-status sd-no-results">
                <div className="sd-status-icon">
                  <Search size={27} />
                </div>

                <h3>No matching destinations found</h3>
                <p>
                  Try changing your search or selected category.
                </p>

                <button
                  className="sd-secondary-button"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("all");
                    setSortOrder("az");
                  }}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              /* Destination cards */
              <div className="sd-destination-grid">
                {filteredDestinations.map((destination) => {
                  const isSaved = savedIds.includes(destination._id);
                  const isSaving = savingId === destination._id;

                  return (
                    <article
                      className="sd-destination-card"
                      key={destination._id}
                    >
                      {/* Image */}
                      <div className="sd-card-image-wrapper">
                        {destination.imageUrl ? (
                          <img
                            src={destination.imageUrl}
                            alt={destination.name}
                            className="sd-card-image"
                          />
                        ) : (
                          <div className="sd-image-placeholder">
                            <Mountain size={42} />
                            <span>Explore {destination.name}</span>
                          </div>
                        )}

                        <span className="sd-category-badge">
                          {destination.category || "Destination"}
                        </span>

                        <button
                          type="button"
                          className={`sd-save-button ${isSaved ? "is-saved" : ""}`}
                          onClick={() =>
                            handleSaveToggle(destination._id)
                          }
                          disabled={isSaving}
                          aria-label={
                            isSaved
                              ? "Remove saved destination"
                              : "Save destination"
                          }
                        >
                          {isSaving ? (
                            <Loader2 size={18} className="sd-spinner" />
                          ) : isSaved ? (
                            <BookmarkCheck size={19} />
                          ) : (
                            <Bookmark size={19} />
                          )}
                        </button>
                      </div>

                      {/* Card content */}
                      <div className="sd-card-content">
                        <h3>{destination.name}</h3>

                        <p className="sd-card-description">
                          {destination.description}
                        </p>

                        <div className="sd-best-time">
                          <CalendarDays size={16} />
                          <div>
                            <small>BEST TIME TO VISIT</small>
                            <strong>
                              {destination.bestTimeToVisit || "Not specified"}
                            </strong>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="sd-view-button"
                          onClick={() =>
                            handleViewDetails(destination._id)
                          }
                        >
                          Explore Destination
                          <ArrowRight size={17} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      <div className="sd-footer">
        <Compass size={16} />
        Explore more. Travel farther. Make memories.
      </div>
    </div>
  );
};

export default StateDestinations;
