import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTripBudget } from "../../services/budgetservices";
import BudgetOverview from "../../components/trips/BudgetOverview";
import ExpenseChart from "../../components/trips/ExpenseChart";
import ExpenseForm from "../../components/trips/ExpenseForm";
import ExpenseList from "../../components/trips/ExpenseList";
import {
  getTripExpenses,
  deleteExpense,
} from "../../services/expenseservices";

import {
  getTripById,
  generateTripItinerary,
  updateTripItinerary
} from "../../services/tripservices";

function TripDetails() {
  const { tripId } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editedItinerary, setEditedItinerary] = useState([]);
  const [error, setError] = useState("");

  const [budget, setBudget] = useState(null);
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetError, setBudgetError] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null); 

  const [expenseMessage, setExpenseMessage] = useState("");

  // Fetch trip details
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

  useEffect(() => {
   if (tripId) {
    fetchBudget();
   }
  }, [tripId]);

  useEffect(() => {
   if (tripId) {
    fetchExpenses();
   }
  }, [tripId]);

  // Generate or regenerate itinerary
  const handleGenerateItinerary = async () => {
    try {
      setGenerating(true);
      setEditing(false);
      setEditedItinerary([]);
      setError("");

      const response = await generateTripItinerary(tripId);

      setTrip((prev) => ({
        ...prev,
        itinerary: response.itinerary
      }));

    } catch (error) {
      console.error("Itinerary generation failed:", error);

      setError(
        error.response?.data?.message ||
        "Unable to generate itinerary."
      );

    } finally {
      setGenerating(false);
    }
  };

  // Start editing
  const handleEditItinerary = () => {
    setEditedItinerary(
      JSON.parse(JSON.stringify(trip.itinerary))
    );

    setEditing(true);
    setError("");
  };

  // Update activity fields
  const handleActivityChange = (
    dayIndex,
    activityIndex,
    field,
    value
  ) => {
    const updated = [...editedItinerary];

    updated[dayIndex] = {
      ...updated[dayIndex],
      activities: [...updated[dayIndex].activities]
    };

    updated[dayIndex].activities[activityIndex] = {
      ...updated[dayIndex].activities[activityIndex],
      [field]: value
    };

    setEditedItinerary(updated);
  };

  // Update day fields
  const handleDayChange = (dayIndex, field, value) => {
    const updated = [...editedItinerary];

    updated[dayIndex] = {
      ...updated[dayIndex],
      [field]: value
    };

    setEditedItinerary(updated);
  };

  // Add new activity
  const handleAddActivity = (dayIndex) => {
    const updated = [...editedItinerary];

    updated[dayIndex] = {
      ...updated[dayIndex],
      activities: [
        ...updated[dayIndex].activities,
        {
          name: "",
          description: "",
          startTime: "12:00",
          endTime: "13:00",
          location: "",
          estimatedCost: 0
        }
      ]
    };

    setEditedItinerary(updated);
    setError("");
  };

  // Delete activity
  const handleDeleteActivity = (dayIndex, activityIndex) => {
    const updated = [...editedItinerary];

    if (updated[dayIndex].activities.length === 1) {
      setError(
        "Each day must have at least one activity."
      );
      return;
    }

    updated[dayIndex] = {
      ...updated[dayIndex],
      activities: updated[dayIndex].activities.filter(
        (_, index) => index !== activityIndex
      )
    };

    setEditedItinerary(updated);
    setError("");
  };

  // Save updated itinerary
  const handleSaveItinerary = async () => {
    try {
      setSaving(true);
      setError("");

      const response = await updateTripItinerary(
        tripId,
        editedItinerary
      );

      setTrip((prev) => ({
        ...prev,
        itinerary: response.itinerary
      }));

      setEditedItinerary(response.itinerary);
      setEditing(false);

    } catch (error) {
      console.error("Failed to save itinerary:", error);

      setError(
        error.response?.data?.message ||
        "Unable to save itinerary."
      );

    } finally {
      setSaving(false);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditedItinerary([]);
    setEditing(false);
    setError("");
  };

  const fetchBudget = async () => {
  try {
    setBudgetLoading(true);
    setBudgetError("");

    const response = await getTripBudget(tripId);

    setBudget(response.budget);
  } catch (error) {
    console.error("Budget fetch error:", error);

    setBudgetError(
      error.response?.data?.message ||
      "Failed to load budget information."
    );
  } finally {
    setBudgetLoading(false);
  }
  };

  const fetchExpenses = async () => {
  try {
    setExpensesLoading(true);

    const response = await getTripExpenses(tripId);

    setExpenses(response.expenses);
  } catch (error) {
    console.error("Fetch Expenses Error:", error);
  } finally {
    setExpensesLoading(false);
  }
  };

  const refreshExpenseData = async () => {
  await Promise.all([
    fetchExpenses(),
    fetchBudget(),
  ]);
  };

  const handleDeleteExpense = async (expenseId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this expense?"
  );

  if (!confirmed) return;

  try {
    await deleteExpense(tripId, expenseId);
    await refreshExpenseData();

    setExpenseMessage("Expense deleted successfully!");
  } catch (error) {
    console.error("Delete Expense Error:", error);
    setExpenseMessage("Failed to delete expense.");
  }
  };

  // Format dates
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Format date for HTML date input
  const formatInputDate = (date) => {
    const parsedDate = new Date(date);

    const year = parsedDate.getFullYear();
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
    const day = String(parsedDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Loading state
  if (loading) {
    return <p>Loading trip details...</p>;
  }

  // Error state
  if (error && !trip) {
    return (
      <div className="trip-details-page">
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

      {/* Back button */}
      <button
        onClick={() => navigate("/dashboard")}
        disabled={saving || generating}
      >
        ← Back to Dashboard
      </button>

      {/* Trip information */}
      <section className="trip-info">
        <h1>{trip.title}</h1>

        <h2>
          {trip.destination?.name}, {trip.destination?.country}
        </h2>

        <p>Starting Location: {trip.startingLocation}</p>

        <p>Start Date: {formatDate(trip.startDate)}</p>

        <p>End Date: {formatDate(trip.endDate)}</p>

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
      </section>

      {/* Error message */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <BudgetOverview
        budget={budget}
        loading={budgetLoading}
        error={budgetError}
      />

      <ExpenseChart
        categoryBreakdown={budget?.categoryBreakdown}
        currency={budget?.currency || "INR"}
      />

      {/* Expense Management */}
      <section className="expense-management-section">

      {expenseMessage && (
       <p className="expense-message">
       {expenseMessage}
       </p>
      )}  

      <div className="expense-management-heading">
      <h2>Manage Expenses</h2>

      <button
      type="button"
      onClick={() => setShowExpenseForm(!showExpenseForm)}
      >
      {showExpenseForm ? "Close Form" : "+ Add Expense"}
      </button>
      </div>

      {showExpenseForm && (
       <ExpenseForm
        tripId={tripId}
        expense={selectedExpense}
        onExpenseAdded={async () => {
         await refreshExpenseData();

         setExpenseMessage(
         selectedExpense
         ? "Expense updated successfully!"
         : "Expense added successfully!"
         );

         setShowExpenseForm(false);
         setSelectedExpense(null);
         }}
         onCancel={() => {
         setShowExpenseForm(false);
         setSelectedExpense(null);
         }}
        />
      )}

      <ExpenseList
       expenses={expenses}
       loading={expensesLoading}
       onEdit={(expense) => {
        setSelectedExpense(expense);
        setShowExpenseForm(true);
       }}
       onDelete={handleDeleteExpense}
       currency={budget?.currency || "INR"}
      />

      </section>

      {/* Itinerary section */}
      <section className="itinerary-section">

        {/* Heading and action buttons */}
        <div className="itinerary-heading">

          <h2>Your Travel Itinerary</h2>

          {!editing ? (
            <div>
              <button
                onClick={handleEditItinerary}
                disabled={
                  !trip.itinerary?.length ||
                  generating ||
                  saving
                }
              >
                Edit Itinerary
              </button>

              <button
                onClick={handleGenerateItinerary}
                disabled={generating || saving}
              >
                {generating
                  ? "Generating Itinerary..."
                  : trip.itinerary?.length > 0
                    ? "Regenerate Itinerary"
                    : "Generate Itinerary"}
              </button>
            </div>
          ) : (
            <div>
              <button
                onClick={handleSaveItinerary}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>

              <button
                onClick={handleCancelEdit}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          )}

        </div>

        {/* Gemini loading message */}
        {generating && (
          <p>
            Gemini AI is preparing your personalized itinerary.
            Please wait...
          </p>
        )}

        {/* Empty itinerary */}
        {!generating &&
          (!trip.itinerary || trip.itinerary.length === 0) && (
            <div className="empty-itinerary">
              <h3>No itinerary generated yet!</h3>

              <p>
                Click Generate Itinerary to plan your adventure
                with TravelMate AI.
              </p>
            </div>
          )}

        {/* Display itinerary */}
        {!generating && trip.itinerary?.length > 0 && (
          <div className="itinerary-days">

            {(editing ? editedItinerary : trip.itinerary).map(
              (day, dayIndex) => (

                <div
                  key={day._id || day.dayNumber}
                  className="itinerary-day"
                >

                  {/* Day header */}
                  <div className="itinerary-day-header">
                    <h3>Day {day.dayNumber}</h3>
                  </div>

                  {/* Day title, date and summary */}
                  {editing ? (
                    <>

                      <label>Day Title</label>

                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) =>
                          handleDayChange(
                            dayIndex,
                            "title",
                            e.target.value
                          )
                        }
                        placeholder="Day title"
                      />

                      <label>Day Date</label>

                      <input
                        type="date"
                        value={formatInputDate(day.date)}
                        onChange={(e) =>
                          handleDayChange(
                            dayIndex,
                            "date",
                            e.target.value
                          )
                        }
                      />

                      <label>Day Summary</label>

                      <textarea
                        value={day.summary}
                        onChange={(e) =>
                          handleDayChange(
                            dayIndex,
                            "summary",
                            e.target.value
                          )
                        }
                        placeholder="Day summary"
                      />

                    </>
                  ) : (
                    <>

                      <h3>{day.title}</h3>

                      <span>
                        {formatDate(day.date)}
                      </span>

                      <p className="day-summary">
                        {day.summary}
                      </p>

                    </>
                  )}

                  {/* Activities list */}
                  <div className="activities-list">

                    {day.activities.map(
                      (activity, activityIndex) => (

                        <div
                          key={activity._id || activityIndex}
                          className="activity-card"
                        >

                          {editing ? (
                            <>

                              <label>Activity Name</label>

                              <input
                                type="text"
                                value={activity.name}
                                onChange={(e) =>
                                  handleActivityChange(
                                    dayIndex,
                                    activityIndex,
                                    "name",
                                    e.target.value
                                  )
                                }
                                placeholder="Activity name"
                              />

                              <label>Description</label>

                              <textarea
                                value={activity.description}
                                onChange={(e) =>
                                  handleActivityChange(
                                    dayIndex,
                                    activityIndex,
                                    "description",
                                    e.target.value
                                  )
                                }
                                placeholder="Description"
                              />

                              <label>Start Time</label>

                              <input
                                type="time"
                                value={activity.startTime}
                                onChange={(e) =>
                                  handleActivityChange(
                                    dayIndex,
                                    activityIndex,
                                    "startTime",
                                    e.target.value
                                  )
                                }
                              />

                              <label>End Time</label>

                              <input
                                type="time"
                                value={activity.endTime}
                                onChange={(e) =>
                                  handleActivityChange(
                                    dayIndex,
                                    activityIndex,
                                    "endTime",
                                    e.target.value
                                  )
                                }
                              />

                              <label>Location</label>

                              <input
                                type="text"
                                value={activity.location}
                                onChange={(e) =>
                                  handleActivityChange(
                                    dayIndex,
                                    activityIndex,
                                    "location",
                                    e.target.value
                                  )
                                }
                                placeholder="Location"
                              />

                              <label>Estimated Cost</label>

                              <input
                                type="number"
                                min="0"
                                value={activity.estimatedCost}
                                onChange={(e) =>
                                  handleActivityChange(
                                    dayIndex,
                                    activityIndex,
                                    "estimatedCost",
                                    Number(e.target.value)
                                  )
                                }
                                placeholder="Estimated cost"
                              />

                              {/* Delete activity */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteActivity(
                                    dayIndex,
                                    activityIndex
                                  )
                                }
                              >
                                Delete Activity
                              </button>

                            </>
                          ) : (
                            <>

                              <h4>{activity.name}</h4>

                              <p>{activity.description}</p>

                              <p>
                                <strong>Time:</strong>{" "}
                                {activity.startTime} - {activity.endTime}
                              </p>

                              <p>
                                <strong>Location:</strong>{" "}
                                {activity.location}
                              </p>

                              <p>
                                <strong>Estimated Cost:</strong>{" "}
                                {trip.budgetPlan?.currency}{" "}
                                {activity.estimatedCost?.toLocaleString(
                                  "en-IN"
                                )}
                              </p>

                            </>
                          )}

                        </div>
                      )
                    )}

                    {/* Add activity button */}
                    {editing && (
                      <button
                        type="button"
                        onClick={() => handleAddActivity(dayIndex)}
                      >
                        + Add Activity
                      </button>
                    )}

                  </div>
                </div>
              )
            )}

          </div>
        )}

      </section>
    </div>
  );
}

export default TripDetails;
