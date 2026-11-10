import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Loader2,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
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

  if (loading) {
    return (
      <div className="explorer-status">
        <Loader2 className="spinner" size={32} />
        <p>Loading destination details...</p>
      </div>
    );
  }

  if (error || !destination) {
    return (
      <div className="explorer-status error">
        <p>{error || "Destination not found."}</p>
        <button onClick={() => navigate("/destinations")}>
          Back to Destinations
        </button>
      </div>
    );
  }

  return (
    <div className="state-explorer">
      <button
        className="back-button"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        Go Back
      </button>

      <div className="state-explorer-header">
        <span className="explorer-tag">
          EXPLORE INDIA
        </span>

        <h1>{destination.name}</h1>

        <p>
          {destination.state}, {destination.country}
        </p>
      </div>

      {destination.imageUrl ? (
        <img
          src={destination.imageUrl}
          alt={destination.name}
          className="destination-card-image"
        />
      ) : (
        <div className="destination-image-placeholder">
          <MapPin size={50} />
        </div>
      )}

      <div className="destination-card-content">
        <span className="destination-category">
          {destination.category}
        </span>

        <h2>About {destination.name}</h2>

        <p>{destination.description}</p>

        <div className="destination-best-time">
          <CalendarDays size={18} />
          <strong>Best time to visit:</strong>
          <span>{destination.bestTimeToVisit}</span>
        </div>

        <div className="destination-best-time">
          <MapPin size={18} />
          <strong>Coordinates:</strong>
          <span>
            {destination.latitude}, {destination.longitude}
          </span>
        </div>

        <div className="destination-details-map">
          <h2>Explore on Map</h2>

          <DestinationMap
          latitude={destination.latitude}
          longitude={destination.longitude}
          destination={destination.name}
          />
        </div>

        <div className="destination-details-weather">
         <WeatherCard
         latitude={destination.latitude}
         longitude={destination.longitude}
         destination={destination.name}
         />
        </div>

        <NearbyAttractions
         latitude={destination.latitude}
         longitude={destination.longitude}
        />

        <button
          className="save-destination-button"
          onClick={handleSaveToggle}
          disabled={saving}
        >
          {isSaved ? (
            <>
              <BookmarkCheck size={18} />
              Saved
            </>
          ) : (
            <>
              <Bookmark size={18} />
              Save Destination
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DestinationDetails;
