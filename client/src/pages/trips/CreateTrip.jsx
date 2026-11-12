import { useState } from "react";
import { useLocation } from "react-router-dom";
import {
  MapPin,
  Search,
  CalendarDays,
  Users,
  Wallet,
  Compass,
  Sparkles,
  Mountain,
  CheckCircle2,
  ArrowRight,
  LoaderCircle,
  Plane,
} from "lucide-react";

import api from "../../services/api";
import { getDestinations } from "../../services/destinationservices";
import { searchDestination } from "../../services/mapservices";

import "./CreateTrip.css";

import { useNavigate } from "react-router-dom";

const initialFormData = {
  title: "",
  destination: "",
  country: "",
  startingLocation: "",
  startDate: "",
  endDate: "",
  adults: 1,
  children: 0,
  totalAmount: 0,
  currency: "INR",
  travelStyle: "moderate",
  interests: "",
  pace: "balanced",
};

function CreateTrip() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedDestination = location.state?.selectedDestination;

  const [formData, setFormData] = useState(() => ({
    ...initialFormData,
    destination: selectedDestination?.name || "",
    country: selectedDestination?.country || "",
  }));

  const [destinationReference, setDestinationReference] = useState(
    selectedDestination || null
  );

  const [destinationResults, setDestinationResults] = useState([]);
  const [searchSource, setSearchSource] = useState("");
  const [searchingDestinations, setSearchingDestinations] = useState(false);
  const [destinationSearchError, setDestinationSearchError] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "destination") {
      setDestinationReference(null);
      setDestinationResults([]);
      setDestinationSearchError("");
      setSearchSource("");
    }
  };

  // Search MongoDB first, then OpenStreetMap.
  const handleDestinationSearch = async () => {
    if (!formData.destination.trim()) {
      setDestinationSearchError("Please enter a destination.");
      setDestinationResults([]);
      return;
    }

    try {
      setSearchingDestinations(true);
      setDestinationSearchError("");
      setDestinationResults([]);
      setSearchSource("");

      const databaseResponse = await getDestinations({
        search: formData.destination.trim(),
      });

      const databaseResults = databaseResponse.destinations || [];

      if (databaseResults.length > 0) {
        setDestinationResults(databaseResults);
        setSearchSource("database");
        return;
      }

      const mapResponse = await searchDestination(
        formData.destination.trim()
      );

      const mapResults = mapResponse.locations || [];

      if (mapResults.length > 0) {
        setDestinationResults(mapResults);
        setSearchSource("geocoding");
      } else {
        setDestinationSearchError(
          "No matching destination found. Try another location."
        );
      }
    } catch (error) {
      console.error("Destination Search Error:", error);

      setDestinationSearchError(
        error.response?.data?.message ||
          "Unable to search destinations. Please try again."
      );
    } finally {
      setSearchingDestinations(false);
    }
  };

  const handleSelectDestination = (result) => {
    let selected;

    if (searchSource === "database") {
      selected = {
        destinationId: result._id,
        name: result.name,
        country: result.country || "",
        latitude: Number(result.latitude),
        longitude: Number(result.longitude),
      };
    } else {
      selected = {
        destinationId: null,
        name: result.name,
        country: result.country || "",
        latitude: Number(result.latitude),
        longitude: Number(result.longitude),
      };
    }

    setDestinationReference(selected);

    setFormData((prevData) => ({
      ...prevData,
      destination: selected.name,
      country: selected.country || prevData.country,
    }));

    setDestinationResults([]);
    setDestinationSearchError("");
    setSearchSource("");
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      alert("Please enter a trip title");
      return false;
    }

    if (!formData.destination.trim()) {
      alert("Please enter a destination");
      return false;
    }

    if (!formData.startingLocation.trim()) {
      alert("Please enter your starting location");
      return false;
    }

    if (!formData.startDate || !formData.endDate) {
      alert("Please select both travel dates");
      return false;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("End date cannot be before start date");
      return false;
    }

    if (Number(formData.adults) < 1) {
      alert("At least one adult is required");
      return false;
    }

    if (
      Number(formData.children) < 0 ||
      Number(formData.totalAmount) < 0
    ) {
      alert("Children and budget cannot be negative");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  if (!validateForm()) return;

  try {
    setLoading(true);

    const tripData = {
      title: formData.title,

      destination: {
        destinationId: destinationReference?.destinationId || null,
        name: formData.destination,
        country: formData.country,
        latitude: destinationReference?.latitude ?? null,
        longitude: destinationReference?.longitude ?? null,
      },

      startingLocation: formData.startingLocation,
      startDate: formData.startDate,
      endDate: formData.endDate,

      travelers: {
        adults: Number(formData.adults),
        children: Number(formData.children),
      },

      budgetPlan: {
        totalAmount: Number(formData.totalAmount),
        currency: formData.currency,
      },

      preferences: {
        travelStyle: formData.travelStyle,
        interests: formData.interests
          .split(",")
          .map((interest) => interest.trim())
          .filter(Boolean),
        pace: formData.pace,
      },
    };

    // Create trip through backend API
    const response = await api.post("/trips", tripData);

    console.log("Trip Created:", response.data);

    // Extract newly created trip
    const createdTrip = response.data.trip;

    // Verify trip ID before navigation
    if (!createdTrip?._id) {
      throw new Error("Trip created, but trip ID was not returned.");
    }

    // Navigate to Trip Details page
    navigate(`/trips/${createdTrip._id}`);

  } catch (error) {
    console.error("Trip creation failed:", error);

    setError(
      error.response?.data?.message ||
        error.message ||
        "Something went wrong while creating your trip."
    );
  } finally {
    setLoading(false);
  }
  };

  return (
    <div className="create-trip-page">

      {/* Page Introduction */}
      <section className="create-trip-hero">
        <div className="create-trip-hero-content">
          <div className="create-trip-eyebrow">
            <Sparkles size={15} />
            DESIGN YOUR NEXT JOURNEY
          </div>

          <h2>
            Let's plan an
            <span> unforgettable adventure.</span>
          </h2>

          <p>
            Tell us where you want to go, who is coming along,
            and what kind of experience you are looking for.
          </p>
        </div>

        <div className="create-trip-hero-art">
          <Mountain size={105} strokeWidth={1.1} />
          <span>YOUR JOURNEY BEGINS HERE</span>
        </div>
      </section>

      <form className="create-trip-form" onSubmit={handleSubmit}>

        {/* Basic Trip Information */}
        <section className="create-form-section">
          <div className="create-form-section-heading">
            <div className="create-form-section-icon">
              <Compass size={21} />
            </div>
            <div>
              <span>STEP 01</span>
              <h3>Trip Information</h3>
              <p>Give your adventure a name and choose where to go.</p>
            </div>
          </div>

          <div className="create-form-grid">
            <div className="create-form-group create-form-full">
              <label htmlFor="title">Trip Title</label>
              <input
                id="title"
                type="text"
                name="title"
                placeholder="e.g. Himalayan Summer Escape"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="create-form-group create-form-full">
              <label htmlFor="destination">Destination</label>

              <div className="create-destination-search">
                <div className="create-input-with-icon">
                  <MapPin size={18} />
                  <input
                    id="destination"
                    type="text"
                    name="destination"
                    placeholder="Search for a city or destination..."
                    value={formData.destination}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleDestinationSearch}
                  disabled={searchingDestinations}
                >
                  {searchingDestinations ? (
                    <LoaderCircle size={17} className="create-spinning" />
                  ) : (
                    <Search size={17} />
                  )}
                  {searchingDestinations ? "Searching" : "Search"}
                </button>
              </div>

              <p className="create-form-hint">
                Search our destination catalogue or discover other places
                using OpenStreetMap.
              </p>

              {destinationSearchError && (
                <p className="create-form-error">
                  {destinationSearchError}
                </p>
              )}

              {destinationResults.length > 0 && (
                <div className="create-destination-results">
                  <div className="create-results-heading">
                    <span>
                      {searchSource === "database"
                        ? "TRAVELMATE DESTINATIONS"
                        : "OPENSTREETMAP RESULTS"}
                    </span>
                    <span>{destinationResults.length} found</span>
                  </div>

                  {destinationResults.map((result, index) => (
                    <div
                      className="create-destination-result"
                      key={
                        result._id ||
                        `${result.latitude}-${result.longitude}-${index}`
                      }
                    >
                      <div className="create-result-icon">
                        <MapPin size={18} />
                      </div>

                      <div className="create-result-details">
                        <strong>{result.name}</strong>
                        <span>
                          {result.country || "Country not available"}
                        </span>
                        <small>
                          {Number(result.latitude).toFixed(4)},{" "}
                          {Number(result.longitude).toFixed(4)}
                        </small>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleSelectDestination(result)}
                      >
                        Select
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {destinationReference && (
                <div className="create-selected-destination">
                  <CheckCircle2 size={18} />
                  <div>
                    <strong>Destination selected</strong>
                    <span>
                      Weather coordinates are available for this destination.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="create-form-group">
              <label htmlFor="country">Country</label>
              <input
                id="country"
                type="text"
                name="country"
                placeholder="e.g. India"
                value={formData.country}
                onChange={handleChange}
              />
            </div>

            <div className="create-form-group">
              <label htmlFor="startingLocation">Starting Location</label>
              <input
                id="startingLocation"
                type="text"
                name="startingLocation"
                placeholder="e.g. Dehradun"
                value={formData.startingLocation}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        {/* Travel Dates */}
        <section className="create-form-section">
          <div className="create-form-section-heading">
            <div className="create-form-section-icon">
              <CalendarDays size={21} />
            </div>
            <div>
              <span>STEP 02</span>
              <h3>When Are You Travelling?</h3>
              <p>Choose the dates for your upcoming journey.</p>
            </div>
          </div>

          <div className="create-form-grid">
            <div className="create-form-group">
              <label htmlFor="startDate">Start Date</label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="create-form-group">
              <label htmlFor="endDate">End Date</label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || undefined}
                required
              />
            </div>
          </div>
        </section>

        {/* Travelers */}
        <section className="create-form-section">
          <div className="create-form-section-heading">
            <div className="create-form-section-icon">
              <Users size={21} />
            </div>
            <div>
              <span>STEP 03</span>
              <h3>Who's Coming Along?</h3>
              <p>Tell us how many people are joining the trip.</p>
            </div>
          </div>

          <div className="create-form-grid">
            <div className="create-form-group">
              <label htmlFor="adults">Adults</label>
              <input
                id="adults"
                type="number"
                name="adults"
                min="1"
                value={formData.adults}
                onChange={handleChange}
                required
              />
            </div>

            <div className="create-form-group">
              <label htmlFor="children">Children</label>
              <input
                id="children"
                type="number"
                name="children"
                min="0"
                value={formData.children}
                onChange={handleChange}
              />
            </div>
          </div>
        </section>

        {/* Budget */}
        <section className="create-form-section">
          <div className="create-form-section-heading">
            <div className="create-form-section-icon">
              <Wallet size={21} />
            </div>
            <div>
              <span>STEP 04</span>
              <h3>Set Your Budget</h3>
              <p>Decide how much you want to spend on this adventure.</p>
            </div>
          </div>

          <div className="create-form-grid">
            <div className="create-form-group">
              <label htmlFor="totalAmount">Total Budget</label>
              <input
                id="totalAmount"
                type="number"
                name="totalAmount"
                min="0"
                value={formData.totalAmount}
                onChange={handleChange}
              />
            </div>

            <div className="create-form-group">
              <label htmlFor="currency">Currency</label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="create-form-section">
          <div className="create-form-section-heading">
            <div className="create-form-section-icon">
              <Sparkles size={21} />
            </div>
            <div>
              <span>STEP 05</span>
              <h3>Your Travel Style</h3>
              <p>Customize the kind of experience you prefer.</p>
            </div>
          </div>

          <div className="create-form-grid">
            <div className="create-form-group">
              <label htmlFor="travelStyle">Travel Style</label>
              <select
                id="travelStyle"
                name="travelStyle"
                value={formData.travelStyle}
                onChange={handleChange}
              >
                <option value="budget">Budget</option>
                <option value="moderate">Moderate</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div className="create-form-group">
              <label htmlFor="pace">Travel Pace</label>
              <select
                id="pace"
                name="pace"
                value={formData.pace}
                onChange={handleChange}
              >
                <option value="relaxed">Relaxed</option>
                <option value="balanced">Balanced</option>
                <option value="packed">Packed</option>
              </select>
            </div>

            <div className="create-form-group create-form-full">
              <label htmlFor="interests">Interests</label>
              <input
                id="interests"
                type="text"
                name="interests"
                placeholder="e.g. Nature, Adventure, Food, Photography"
                value={formData.interests}
                onChange={handleChange}
              />
              <p className="create-form-hint">
                Separate multiple interests with commas.
              </p>
            </div>
          </div>
        </section>

        {/* Submission Feedback */}
        {error && (
          <div className="create-submit-error">
            {error}
          </div>
        )}

        {success && (
          <div className="create-submit-success">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {/* Submit */}
        <div className="create-trip-submit-area">
          <div>
            <Plane size={22} />
            <div>
              <strong>Ready for your next adventure?</strong>
              <span>Your journey is just one step away.</span>
            </div>
          </div>

          <button
            type="submit"
            className="create-trip-submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <LoaderCircle size={18} className="create-spinning" />
                Creating Trip...
              </>
            ) : (
              <>
                Create My Trip
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateTrip;
