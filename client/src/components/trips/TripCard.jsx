import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  MapPin,
  Users,
  Wallet,
  ArrowRight,
  Trash2,
  Compass,
} from "lucide-react";

import { deleteTrip } from "../../services/tripservices";
import "./TripCard.css";

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
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const destinationName =
    trip.destination?.name || "Unknown destination";

  const country = trip.destination?.country;

  const budget = trip.budgetPlan?.totalAmount;

  return (
    <article className="tm-trip-card">
      <div className="tm-trip-card-top">
        <div className="tm-trip-icon">
          <Compass size={22} />
        </div>

        <span className={`tm-trip-status ${String(trip.status || "planned").toLowerCase()}`}>
          {trip.status || "Planned"}
        </span>
      </div>

      <div className="tm-trip-card-content">
        <p className="tm-trip-label">YOUR ADVENTURE</p>

        <h3 className="tm-trip-title">
          {trip.title}
        </h3>

        <div className="tm-trip-destination">
          <MapPin size={17} />
          <span>
            {destinationName}
            {country ? `, ${country}` : ""}
          </span>
        </div>

        <div className="tm-trip-details">
          <div className="tm-trip-detail">
            <CalendarDays size={17} />
            <div>
              <span className="tm-detail-label">TRAVEL DATES</span>
              <p>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </p>
            </div>
          </div>

          <div className="tm-trip-detail">
            <Users size={17} />
            <div>
              <span className="tm-detail-label">TRAVELERS</span>
              <p>
                {trip.travelers?.adults || 0} Adults,{" "}
                {trip.travelers?.children || 0} Children
              </p>
            </div>
          </div>

          <div className="tm-trip-detail">
            <Wallet size={17} />
            <div>
              <span className="tm-detail-label">TOTAL BUDGET</span>
              <p>
                {trip.budgetPlan?.currency || ""}{" "}
                {budget != null
                  ? Number(budget).toLocaleString("en-IN")
                  : "Not specified"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="tm-trip-card-footer">
        <button
          type="button"
          className="tm-view-trip-button"
          onClick={() => navigate(`/trips/${trip._id}`)}
        >
          View Details
          <ArrowRight size={17} />
        </button>

        <button
          type="button"
          className="tm-delete-trip-button"
          onClick={handleDelete}
          aria-label={`Delete ${trip.title}`}
          title="Delete trip"
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

export default TripCard;
