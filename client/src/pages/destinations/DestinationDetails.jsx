
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Loader2,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Compass,
  Mountain,
  Globe,
  Navigation,
  RefreshCw,
} from "lucide-react";

import {
  getDestinationById,
  getSavedDestinations,
  saveDestination,
  removeSavedDestination,
} from "../../services/destinationservices";

import DestinationMap from "../../components/trips/DestinationMap";
import WeatherCard from "../../components/trips/WeatherCard";
import NearbyAttractions from "../../components/attractions/NearbyAttractions";

import "./DestinationDetails.css";

const DestinationDetails = () => {
  const { destinationId } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDestinationDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getDestinationById(destinationId);

        setDestination(data.destination);

        const savedData = await getSavedDestinations();
        const saved = savedData.destinations || [];

        const alreadySaved = saved.some(
          (item) =>
            (typeof item === "string" ? item : item._id) ===
            data.destination._id
        );

        setIsSaved(alreadySaved);
      } catch (err) {
        console.error("Error fetching destination details:", err);

        setError(
          err.response?.data?.message ||
          "Unable to load destination details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDestinationDetails();
  }, [destinationId]);

  // Save or unsave destination
  const handleSaveToggle = async () => {
    try {
      setSaving(true);

      if (isSaved) {
        await removeSavedDestination(destination._id);
        setIsSaved(false);
      } else {
        await saveDestination(destination._id);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("Error updating saved destination:", err);

      alert(
        err.response?.data?.message ||
        "Unable to update saved destination."
      );
    } finally {
      setSaving(false);
    }
  };

  // Navigate to Create Trip with selected destination
  const handlePlanTrip = () => {
    navigate("/create-trip", {
      state: {
        selectedDestination: {
          destinationId: destination._id,
          name: destination.name,
          country: destination.country,
          latitude: destination.latitude,
          longitude: destination.longitude,
        },
      },
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className="dd-page">
        <div className="dd-status">
          <Loader2 size={36} className="dd-spinner" />
          <h3>Discovering destination...</h3>
          <p>Getting everything ready for your exploration.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !destination) {
    return (
      <div className="dd-page">
        <div className="dd-status dd-error-state">
          <div className="dd-status-icon">
            <MapPin size={28} />
          </div>

          <h3>Destination unavailable</h3>
          <p>{error || "Destination not found."}</p>

          <button
            className="dd-primary-button"
            onClick={() => navigate("/destinations")}
          >
            <ArrowLeft size={17} />
            Back to Destinations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dd-page">

      {/* Back navigation */}
      <button
        className="dd-back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={17} />
        Go Back
      </button>

      {/* Destination hero */}
      <section className="dd-hero">

        {destination.imageUrl ? (
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="dd-hero-image"
          />
        ) : (
          <div className="dd-hero-placeholder">
            <Mountain size={75} />
          </div>
        )}

        <div className="dd-hero-overlay" />

        <div className="dd-hero-content">
          <span className="dd-hero-tag">
            <Compass size={15} />
            EXPLORE INDIA
          </span>

          <span className="dd-category-badge">
            {destination.category || "Destination"}
          </span>

          <h1>{destination.name}</h1>

          <div className="dd-location">
            <MapPin size={17} />
            <span>
              {destination.state}
              {destination.state && destination.country ? ", " : ""}
              {destination.country}
            </span>
          </div>

          <p>
            Discover the beauty, experiences and attractions
            that make {destination.name} worth exploring.
          </p>

          <div className="dd-hero-actions">
            <button
              className="dd-plan-button"
              onClick={handlePlanTrip}
            >
              <CalendarDays size={18} />
              Plan a Trip
              <ArrowRight size={17} />
            </button>

            <button
              className={`dd-save-button ${isSaved ? "is-saved" : ""}`}
              onClick={handleSaveToggle}
              disabled={saving}
            >
              {saving ? (
                <Loader2 size={18} className="dd-spinner" />
              ) : isSaved ? (
                <BookmarkCheck size={18} />
              ) : (
                <Bookmark size={18} />
              )}

              {saving
                ? "Updating..."
                : isSaved
                  ? "Saved"
                  : "Save Destination"}
            </button>
          </div>
        </div>
      </section>

      {/* Destination overview */}
      <section className="dd-overview-section">
        <div className="dd-section-heading">
          <div>
            <span className="dd-section-kicker">
              GET TO KNOW THE PLACE
            </span>
            <h2>About {destination.name}</h2>
          </div>
        </div>

        <div className="dd-overview-grid">
          <div className="dd-about-card">
            <div className="dd-about-icon">
              <Compass size={22} />
            </div>

            <h3>About this destination</h3>

            <p>
              {destination.description ||
                `Discover the attractions and experiences of ${destination.name}.`}
            </p>
          </div>

          <div className="dd-info-card">
            <div className="dd-info-icon">
              <CalendarDays size={22} />
            </div>

            <span>BEST TIME TO VISIT</span>

            <h3>
              {destination.bestTimeToVisit || "Not specified"}
            </h3>

            <p>
              Choose your travel dates based on the recommended
              visiting season.
            </p>
          </div>

          <div className="dd-info-card">
            <div className="dd-info-icon">
              <Globe size={22} />
            </div>

            <span>DESTINATION</span>

            <h3>{destination.state || destination.country}</h3>

            <p>
              {destination.country || "India"}
            </p>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="dd-feature-section">
        <div className="dd-section-heading">
          <div>
            <span className="dd-section-kicker">
              FIND YOUR WAY
            </span>
            <h2>Explore on Map</h2>
            <p>
              Get a geographical view of {destination.name}.
            </p>
          </div>

          <div className="dd-section-icon">
            <Navigation size={21} />
          </div>
        </div>

        <div className="dd-feature-panel dd-map-panel">
          <DestinationMap
            latitude={destination.latitude}
            longitude={destination.longitude}
            destination={destination.name}
          />
        </div>
      </section>

      {/* Weather */}
      <section className="dd-feature-section">
        <div className="dd-section-heading">
          <div>
            <span className="dd-section-kicker">
              CHECK THE CONDITIONS
            </span>
            <h2>Weather Information</h2>
            <p>
              Get weather information before planning your visit.
            </p>
          </div>

          <div className="dd-section-icon">
            <Globe size={21} />
          </div>
        </div>

        <div className="dd-feature-panel dd-weather-panel">
          <WeatherCard
            latitude={destination.latitude}
            longitude={destination.longitude}
            destination={destination.name}
          />
        </div>
      </section>

      {/* Nearby attractions */}
      <section className="dd-feature-section dd-attractions-section">
        <div className="dd-section-heading">
          <div>
            <span className="dd-section-kicker">
              EXPLORE MORE AROUND YOU
            </span>
            <h2>Nearby Attractions</h2>
            <p>
              Discover interesting places around {destination.name}.
            </p>
          </div>

          <div className="dd-section-icon">
            <MapPin size={21} />
          </div>
        </div>

        <div className="dd-feature-panel dd-attractions-panel">
          <NearbyAttractions
            latitude={destination.latitude}
            longitude={destination.longitude}
          />
        </div>
      </section>

      {/* Bottom planning CTA */}
      <section className="dd-bottom-cta">
        <div className="dd-cta-icon">
          <Compass size={32} />
        </div>

        <div className="dd-cta-content">
          <h2>Ready to explore {destination.name}?</h2>
          <p>
            Turn this destination into your next travel adventure.
          </p>
        </div>

        <button
          className="dd-plan-button"
          onClick={handlePlanTrip}
        >
          Plan Your Trip
          <ArrowRight size={17} />
        </button>
      </section>

      <div className="dd-footer">
        <Compass size={16} />
        Discover places. Create memories. Travel more.
      </div>
    </div>
  );
};

export default DestinationDetails;
