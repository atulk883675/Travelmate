import api from "./api";

// Get budget summary of a trip
export const getTripBudget = async (tripId) => {
  const response = await api.get(`/budget/${tripId}`);

  return response.data;
};