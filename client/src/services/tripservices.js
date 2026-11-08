import api from "./api";

// Fetch all trips of the logged-in user
export const getMyTrips = async () => {
  const response = await api.get("/trips");

  return response.data;
};

export const getTripById = async (tripId) => {
  const response = await api.get(`/trips/${tripId}`);
  return response.data;
};