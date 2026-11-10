import { useNavigate } from "react-router-dom";
import { deleteTrip } from "../../services/tripservices";

function TripCard({ trip, onDelete }) {
  const navigate = useNavigate();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${trip.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteTrip(trip._id);

      alert("Trip deleted successfully!");

      if (onDelete) {
        onDelete(trip._id);
      }
    } catch (error) {
      console.error("Failed to delete trip:", error);

      alert(
        error.response?.data?.message ||
        "Unable to delete trip. Please try again."
      );
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="trip-card">

      <div className="trip-card-header">
        <h3>{trip.title}</h3>

        <span className="trip-status">
          {trip.status}
        </span>
      </div>

      <div className="trip-card-body">
        <h2>
          {trip.destination?.name},{" "}
          {trip.destination?.country}
        </h2>

        <p>
          Starting from: {trip.startingLocation}
        </p>

        <p>
          {formatDate(trip.startDate)} -{" "}
          {formatDate(trip.endDate)}
        </p>

        <p>
          Travelers: {trip.travelers?.adults} Adults,{" "}
          {trip.travelers?.children} Children
        </p>

        <p>
          Budget: {trip.budgetPlan?.currency}{" "}
          {trip.budgetPlan?.totalAmount?.toLocaleString("en-IN")}
        </p>
      </div>

      <div className="trip-card-footer">
        <button
          type="button"
          onClick={() => navigate(`/trips/${trip._id}`)}
        >
          View Details
        </button>

        <button
          type="button"
          onClick={handleDelete}
        >
          Delete Trip
        </button>
      </div>

    </div>
  );
}

export default TripCard;
