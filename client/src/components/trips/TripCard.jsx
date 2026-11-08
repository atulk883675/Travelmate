import { useNavigate } from "react-router-dom";

function TripCard({ trip }) {
  const navigate = useNavigate();

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
      </div>

    </div>
  );
}

export default TripCard;
