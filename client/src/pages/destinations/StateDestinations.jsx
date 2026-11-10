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

  // Search and category filtering
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

      {/* Loading State */}
      {loading && (
        <div className="explorer-status">
          <Loader2 className="spinner" size={32} />
          <p>Loading destinations...</p>
        </div>
      )}

      {/* Error State */}
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

      {/* Destination Section */}
      {!loading && !error && destinations.length > 0 && (
        <>
          {/* Section Heading */}
          <div className="region-results-info">
            <h2>Popular Destinations</h2>

            <span>
              {filteredDestinations.length} of{" "}
              {destinations.length} places found
            </span>
          </div>

          {/* Search and Category Filters */}
          <div className="destination-filters">

            {/* Search */}
            <input
              type="text"
              placeholder="Search destinations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value)
              }
            >
              <option value="all">All Categories</option>
              <option value="mountain">Mountain</option>
              <option value="beach">Beach</option>
              <option value="city">City</option>
              <option value="historical">Historical</option>
              <option value="nature">Nature</option>
              <option value="adventure">Adventure</option>
            </select>

            {/* Sorting Dropdown */}
            <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            >
            <option value="az">Name: A–Z</option>
            <option value="za">Name: Z–A</option>
            </select> 

          </div>

          {/* No Matching Destinations */}
          {filteredDestinations.length === 0 ? (
            <div className="explorer-status">
              <h3>No matching destinations found</h3>

              <p>
                Try changing your search or category.
              </p>
            </div>
          ) : (

            /* Destination Cards */
            <div className="destination-grid">

              {filteredDestinations.map((destination) => (
                <div
                  className="destination-card"
                  key={destination._id}
                >

                  {/* Destination Image */}
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

                    {/* Category */}
                    <span className="destination-category">
                      {destination.category}
                    </span>

                    {/* Destination Name */}
                    <h3
                      onClick={() =>
                        navigate(
                          `/destination/${destination._id}`
                        )
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {destination.name}
                    </h3>

                    {/* Save / Unsave Button */}
                    <button
                      className="save-destination-button"
                      onClick={() =>
                        handleSaveToggle(destination._id)
                      }
                      disabled={savingId === destination._id}
                    >
                      {savingId === destination._id ? (
                        <Loader2
                          size={18}
                          className="spinner"
                        />
                      ) : savedIds.includes(destination._id) ? (
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

                    {/* Description */}
                    <p>{destination.description}</p>

                    {/* View Details */}
                    <button
                      onClick={() =>
                        navigate(
                          `/destination/${destination._id}`
                        )
                      }
                    >
                      View Details
                    </button>

                    {/* Best Time to Visit */}
                    <div className="destination-best-time">
                      <strong>Best time to visit:</strong>

                      <span>
                        {destination.bestTimeToVisit}
                      </span>
                    </div>

                  </div>
                </div>
              ))}

            </div>
          )}

        </>
      )}

    </div>
  );
};

export default StateDestinations;
