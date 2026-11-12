
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, MapPin, CalendarDays, Users, Wallet,
  Compass, Clock, Sparkles, CloudSun, Pencil, Plus,
  RefreshCw, Save, X, Trash2, Route, CheckCircle2
} from "lucide-react";

import { getTripBudget } from "../../services/budgetservices";
import BudgetOverview from "../../components/trips/BudgetOverview";
import ExpenseChart from "../../components/trips/ExpenseChart";
import ExpenseForm from "../../components/trips/ExpenseForm";
import ExpenseList from "../../components/trips/ExpenseList";
import WeatherCard from "../../components/trips/WeatherCard";

import {
  getTripExpenses,
  deleteExpense,
} from "../../services/expenseservices";

import {
  getTripById,
  generateTripItinerary,
  updateTripItinerary
} from "../../services/tripservices";

import TravelAssistant from "../../components/assistant/TravelAssistant";
import {
  applyAssistantChanges as applyAssistantChangesRequest,
} from "../../services/assistantservices";

import "./TripDetails.css";

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

  const [assistantApplying, setAssistantApplying] = useState(false);
  const [assistantApplyMessage, setAssistantApplyMessage] = useState("");

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
    if (tripId) fetchBudget();
  }, [tripId]);

  useEffect(() => {
    if (tripId) fetchExpenses();
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

  // Start editing itinerary
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
      setError("Each day must have at least one activity.");
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

  // Apply AI assistant changes
  const handleApplyAssistantChanges = async (proposedItinerary) => {
    try {
      setAssistantApplying(true);
      setAssistantApplyMessage("");

      const response = await applyAssistantChangesRequest(
        tripId,
        proposedItinerary
      );

      setTrip((prev) => ({
        ...prev,
        itinerary: response.itinerary
      }));

      setAssistantApplyMessage(
        "AI itinerary changes applied successfully!"
      );

      return true;
    } catch (error) {
      console.error("Failed to apply AI changes:", error);

      setAssistantApplyMessage(
        error.response?.data?.message ||
        "Unable to apply AI itinerary changes."
      );

      return false;
    } finally {
      setAssistantApplying(false);
    }
  };

  // Fetch budget
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

  // Fetch expenses
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

  // Refresh expense and budget data
  const refreshExpenseData = async () => {
    await Promise.all([
      fetchExpenses(),
      fetchBudget(),
    ]);
  };

  // Delete expense
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
    return (
      <div className="trip-details-page trip-details-state">
        <div className="trip-details-loader" />
        <p>Preparing your adventure...</p>
      </div>
    );
  }

  // Error state
  if (error && !trip) {
    return (
      <div className="trip-details-page trip-details-state">
        <div className="trip-details-empty-icon">
          <Compass size={30} />
        </div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button
          className="td-primary-btn"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} /> Back to Dashboard
        </button>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="trip-details-page trip-details-state">
        <h2>Trip not found</h2>
        <button
          className="td-primary-btn"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const destinationName = trip.destination?.name || "Your destination";
  const destinationCountry = trip.destination?.country || "";
  const itineraryToDisplay = editing ? editedItinerary : trip.itinerary;

  return (
    <div className="trip-details-page">

      {/* Back navigation */}
      <button
        className="td-back-btn"
        onClick={() => navigate("/dashboard")}
        disabled={saving || generating}
      >
        <ArrowLeft size={17} />
        Back to My Adventures
      </button>

      {/* Trip hero */}
      <section className="td-hero">
        <div className="td-hero-overlay" />

        <div className="td-hero-content">
          <span className="td-eyebrow">
            <Compass size={15} /> YOUR NEXT ADVENTURE
          </span>

          <h1>{trip.title}</h1>

          <div className="td-hero-location">
            <MapPin size={18} />
            <span>
              {destinationName}
              {destinationCountry ? `, ${destinationCountry}` : ""}
            </span>
          </div>

          <div className="td-hero-dates">
            <CalendarDays size={16} />
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </div>
        </div>

        <div className="td-trip-status">
          {trip.status || "Planned"}
        </div>
      </section>

      {/* Trip overview */}
      <section className="td-overview-section">
        <div className="td-section-heading">
          <div>
            <span className="td-section-kicker">THE PLAN</span>
            <h2>Trip Overview</h2>
          </div>
          <p>Your adventure at a glance</p>
        </div>

        <div className="td-overview-grid">
          <div className="td-overview-card">
            <span className="td-overview-icon"><MapPin size={20} /></span>
            <div>
              <small>Starting location</small>
              <strong>{trip.startingLocation || "Not specified"}</strong>
            </div>
          </div>

          <div className="td-overview-card">
            <span className="td-overview-icon"><Users size={20} /></span>
            <div>
              <small>Travelers</small>
              <strong>
                {trip.travelers?.adults || 0} Adults,{" "}
                {trip.travelers?.children || 0} Children
              </strong>
            </div>
          </div>

          <div className="td-overview-card">
            <span className="td-overview-icon"><Wallet size={20} /></span>
            <div>
              <small>Planned budget</small>
              <strong>
                {trip.budgetPlan?.currency || "INR"}{" "}
                {trip.budgetPlan?.totalAmount?.toLocaleString("en-IN") || 0}
              </strong>
            </div>
          </div>

          <div className="td-overview-card">
            <span className="td-overview-icon"><Route size={20} /></span>
            <div>
              <small>Travel style</small>
              <strong>{trip.preferences?.travelStyle || "Not specified"}</strong>
            </div>
          </div>

          <div className="td-overview-card">
            <span className="td-overview-icon"><Clock size={20} /></span>
            <div>
              <small>Travel pace</small>
              <strong>{trip.preferences?.pace || "Not specified"}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Destination Weather */}
      <section className="td-weather-section">
        <div className="td-section-heading">
          <div>
            <span className="td-section-kicker">BE PREPARED</span>
            <h2><CloudSun size={23} /> Destination Weather</h2>
          </div>
          <p>Check the conditions before you go</p>
        </div>

        {trip.destination?.latitude != null &&
         trip.destination?.longitude != null ? (
          <WeatherCard
            latitude={trip.destination.latitude}
            longitude={trip.destination.longitude}
            destination={trip.destination.name}
          />
        ) : (
          <div className="td-weather-unavailable">
            <CloudSun size={25} />
            <div>
              <strong>Weather information is unavailable</strong>
              <p>
                This trip does not have destination coordinates.
                Selecting a destination from Explore Destinations
                enables this feature.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* General error */}
      {error && (
        <div className="td-alert td-alert-error">{error}</div>
      )}

      {/* Budget */}
      <section className="td-content-section">
        <div className="td-section-heading">
          <div>
            <span className="td-section-kicker">MONEY MATTERS</span>
            <h2>Trip Budget</h2>
          </div>
          <p>Keep your travel spending on track</p>
        </div>

        <div className="td-budget-panel">
          <BudgetOverview
            budget={budget}
            loading={budgetLoading}
            error={budgetError}
          />
        </div>

        <div className="td-chart-panel">
          <ExpenseChart
            categoryBreakdown={budget?.categoryBreakdown}
            currency={budget?.currency || "INR"}
          />
        </div>
      </section>

      {/* Expense Management */}
      <section className="td-content-section td-expense-section">
        <div className="td-section-heading td-expense-heading">
          <div>
            <span className="td-section-kicker">TRACK EVERY RUPEE</span>
            <h2>Manage Expenses</h2>
          </div>

          <button
            type="button"
            className="td-primary-btn"
            onClick={() => setShowExpenseForm(!showExpenseForm)}
          >
            {showExpenseForm ? <X size={17} /> : <Plus size={17} />}
            {showExpenseForm ? "Close Form" : "Add Expense"}
          </button>
        </div>

        {expenseMessage && (
          <div className="td-alert td-alert-success">
            {expenseMessage}
          </div>
        )}

        {showExpenseForm && (
          <div className="td-form-panel">
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
          </div>
        )}

        <div className="td-expense-list-panel">
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
        </div>
      </section>

      {/* AI Travel Assistant */}
      <section className="td-content-section td-assistant-section">
        <div className="td-section-heading">
          <div>
            <span className="td-section-kicker">YOUR TRAVEL COMPANION</span>
            <h2><Sparkles size={23} /> AI Travel Assistant</h2>
          </div>
          <p>Get help refining your travel plans</p>
        </div>

        {assistantApplyMessage && (
          <div className="td-alert td-alert-info">
            {assistantApplyMessage}
          </div>
        )}

        <TravelAssistant
          tripId={tripId}
          onApplyChanges={handleApplyAssistantChanges}
          applying={assistantApplying}
          applyMessage={assistantApplyMessage}
        />
      </section>

      {/* Itinerary */}
      <section className="td-content-section td-itinerary-section">
        <div className="td-section-heading td-itinerary-heading">
          <div>
            <span className="td-section-kicker">MAKE EVERY DAY COUNT</span>
            <h2><Route size={23} /> Your Travel Itinerary</h2>
            <p className="td-heading-description">
              Your day-by-day guide to exploring {destinationName}
            </p>
          </div>

          <div className="td-itinerary-actions">
            {!editing ? (
              <>
                <button
                  className="td-secondary-btn"
                  onClick={handleEditItinerary}
                  disabled={!trip.itinerary?.length || generating || saving}
                >
                  <Pencil size={16} /> Edit Itinerary
                </button>

                <button
                  className="td-primary-btn"
                  onClick={handleGenerateItinerary}
                  disabled={generating || saving}
                >
                  <RefreshCw size={16} />
                  {generating
                    ? "Generating..."
                    : trip.itinerary?.length > 0
                      ? "Regenerate"
                      : "Generate Itinerary"}
                </button>
              </>
            ) : (
              <>
                <button
                  className="td-primary-btn"
                  onClick={handleSaveItinerary}
                  disabled={saving}
                >
                  <Save size={16} />
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <button
                  className="td-secondary-btn"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  <X size={16} /> Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {generating && (
          <div className="td-generating">
            <div className="td-generating-spinner" />
            <div>
              <strong>Planning your adventure...</strong>
              <p>Gemini AI is preparing your personalized itinerary. Please wait.</p>
            </div>
          </div>
        )}

        {!generating &&
          (!trip.itinerary || trip.itinerary.length === 0) && (
            <div className="td-empty-itinerary">
              <div className="td-empty-icon"><Compass size={34} /></div>
              <h3>Your adventure is waiting!</h3>
              <p>
                You haven't generated an itinerary yet.
                Let TravelMate AI create a day-by-day plan for you.
              </p>
              <button
                className="td-primary-btn"
                onClick={handleGenerateItinerary}
                disabled={generating || saving}
              >
                <Sparkles size={17} /> Generate My Itinerary
              </button>
            </div>
          )}

        {!generating && trip.itinerary?.length > 0 && (
          <div className="td-itinerary-days">
            {itineraryToDisplay.map((day, dayIndex) => (
              <article
                key={day._id || day.dayNumber}
                className="td-day-card"
              >
                <div className="td-day-marker">
                  <span>{day.dayNumber}</span>
                </div>

                <div className="td-day-content">
                  <div className="td-day-topline">
                    <span className="td-day-label">
                      DAY {day.dayNumber}
                    </span>
                    {!editing && (
                      <span className="td-day-date">
                        <CalendarDays size={14} />
                        {formatDate(day.date)}
                      </span>
                    )}
                  </div>

                  {editing ? (
                    <div className="td-edit-fields">
                      <label>Day Title</label>
                      <input
                        type="text"
                        value={day.title}
                        onChange={(e) =>
                          handleDayChange(dayIndex, "title", e.target.value)
                        }
                        placeholder="Day title"
                      />

                      <label>Day Date</label>
                      <input
                        type="date"
                        value={formatInputDate(day.date)}
                        onChange={(e) =>
                          handleDayChange(dayIndex, "date", e.target.value)
                        }
                      />

                      <label>Day Summary</label>
                      <textarea
                        value={day.summary}
                        onChange={(e) =>
                          handleDayChange(dayIndex, "summary", e.target.value)
                        }
                        placeholder="Day summary"
                      />
                    </div>
                  ) : (
                    <>
                      <h3 className="td-day-title">{day.title}</h3>
                      <p className="td-day-summary">{day.summary}</p>
                    </>
                  )}

                  <div className="td-activities-list">
                    {day.activities.map((activity, activityIndex) => (
                      <div
                        key={activity._id || activityIndex}
                        className="td-activity-card"
                      >
                        {editing ? (
                          <div className="td-edit-fields">
                            <label>Activity Name</label>
                            <input
                              type="text"
                              value={activity.name}
                              onChange={(e) =>
                                handleActivityChange(
                                  dayIndex, activityIndex, "name", e.target.value
                                )
                              }
                              placeholder="Activity name"
                            />

                            <label>Description</label>
                            <textarea
                              value={activity.description}
                              onChange={(e) =>
                                handleActivityChange(
                                  dayIndex, activityIndex, "description", e.target.value
                                )
                              }
                              placeholder="Description"
                            />

                            <div className="td-edit-grid">
                              <div>
                                <label>Start Time</label>
                                <input
                                  type="time"
                                  value={activity.startTime}
                                  onChange={(e) =>
                                    handleActivityChange(
                                      dayIndex, activityIndex, "startTime", e.target.value
                                    )
                                  }
                                />
                              </div>
                              <div>
                                <label>End Time</label>
                                <input
                                  type="time"
                                  value={activity.endTime}
                                  onChange={(e) =>
                                    handleActivityChange(
                                      dayIndex, activityIndex, "endTime", e.target.value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <label>Location</label>
                            <input
                              type="text"
                              value={activity.location}
                              onChange={(e) =>
                                handleActivityChange(
                                  dayIndex, activityIndex, "location", e.target.value
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
                                  dayIndex, activityIndex, "estimatedCost",
                                  Number(e.target.value)
                                )
                              }
                              placeholder="Estimated cost"
                            />

                            <button
                              type="button"
                              className="td-delete-btn"
                              onClick={() =>
                                handleDeleteActivity(dayIndex, activityIndex)
                              }
                            >
                              <Trash2 size={15} /> Delete Activity
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="td-activity-heading">
                              <span className="td-activity-dot" />
                              <h4>{activity.name}</h4>
                            </div>

                            <p className="td-activity-description">
                              {activity.description}
                            </p>

                            <div className="td-activity-meta">
                              <span>
                                <Clock size={14} />
                                {activity.startTime} – {activity.endTime}
                              </span>
                              <span>
                                <MapPin size={14} />
                                {activity.location}
                              </span>
                              <span>
                                <Wallet size={14} />
                                {trip.budgetPlan?.currency || "INR"}{" "}
                                {activity.estimatedCost?.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {editing && (
                    <button
                      type="button"
                      className="td-add-activity-btn"
                      onClick={() => handleAddActivity(dayIndex)}
                    >
                      <Plus size={16} /> Add Activity
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="td-page-footer">
        <CheckCircle2 size={16} />
        Your adventure, organised with TravelMate
      </div>
    </div>
  );
}

export default TripDetails;
