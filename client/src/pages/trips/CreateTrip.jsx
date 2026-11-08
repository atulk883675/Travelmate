import { useState } from "react";
import api from "../../services/api";

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
  // Step 1: Store all form values
  const [formData, setFormData] = useState(initialFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Step 2: Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
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

   if (Number(formData.children) < 0 || Number(formData.totalAmount) < 0) {
    alert("Children and budget cannot be negative");
    return false;
   }

   return true;
  };

// Step 3: Handle form submission
 const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");
  setSuccess("");

  const isValid = validateForm();

  if (!isValid) {
    return;
  }

  try {
    setLoading(true);

    const tripData = {
      title: formData.title,
      destination: {
        name: formData.destination,
        country: formData.country,
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

    const response = await api.post("/trips", tripData);

    console.log("Trip Created:", response.data);

    setSuccess("Your trip has been created successfully!");

    setFormData(initialFormData);

  } catch (error) {
    console.error("Trip creation failed:", error);

    setError(
      error.response?.data?.message ||
      "Something went wrong while creating your trip."
    );

  } finally {
    setLoading(false);
  }
 };

  // Step 4: Display the form
  return (
    <div className="create-trip-page">
      <div className="create-trip-header">
        <h1>Plan Your Next Adventure</h1>
        <p>
          Tell us about your trip and let TravelMate AI
          help you create an amazing journey.
        </p>
      </div>

      <form className="create-trip-form" onSubmit={handleSubmit}>
        <section className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label>Trip Title</label>
            <input type="text" name="title" placeholder="e.g. Summer Vacation"
              value={formData.title} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Destination</label>
            <input type="text" name="destination" placeholder="e.g. Manali"
              value={formData.destination} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Country</label>
            <input type="text" name="country" placeholder="e.g. India"
              value={formData.country} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Starting Location</label>
            <input type="text" name="startingLocation" placeholder="e.g. Dehradun"
              value={formData.startingLocation} onChange={handleChange} />
          </div>
        </section>

        <section className="form-section">
          <h2>Travel Dates</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" name="startDate"
                value={formData.startDate} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input type="date" name="endDate"
                value={formData.endDate} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Travelers</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Adults</label>
              <input type="number" name="adults" min="1"
                value={formData.adults} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Children</label>
              <input type="number" name="children" min="0"
                value={formData.children} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Budget</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Total Budget</label>
              <input type="number" name="totalAmount" min="0"
                value={formData.totalAmount} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label>Currency</label>
              <select name="currency" value={formData.currency}
                onChange={handleChange}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2>Travel Preferences</h2>

          <div className="form-group">
            <label>Travel Style</label>
            <select name="travelStyle" value={formData.travelStyle}
              onChange={handleChange}>
              <option value="budget">Budget</option>
              <option value="moderate">Moderate</option>
              <option value="luxury">Luxury</option>
            </select>
          </div>

          <div className="form-group">
            <label>Interests</label>
            <input type="text" name="interests"
              placeholder="e.g. Nature, Adventure, Food"
              value={formData.interests} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Travel Pace</label>
            <select name="pace" value={formData.pace}
              onChange={handleChange}>
              <option value="relaxed">Relaxed</option>
              <option value="balanced">Balanced</option>
              <option value="packed">Packed</option>
            </select>
          </div>
        </section>
        
        {error && (
          <div className="error-message">
          {error}
          </div>
        )}

        {success && (
         <div className="success-message">
         {success}
         </div>
        )}

        <button
         type="submit"
         className="create-trip-button"
         disabled={loading}
        >
         {loading ? "Creating Trip..." : "Create Trip"}
        </button>
      </form>
    </div>
  );
}

export default CreateTrip;
