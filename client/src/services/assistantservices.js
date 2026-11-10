import api from "./api";

// Send a message to the AI Travel Assistant
export const chatWithAssistant = async (tripId, message) => {
  const response = await api.post(`/assistant/${tripId}/chat`, {
    message,
  });

  return response.data;
};

// Apply AI-generated itinerary changes
export const applyAssistantChanges = async (tripId, itinerary) => {
  const response = await api.put(`/assistant/${tripId}/apply`, {
    itinerary,
  });

  return response.data;
};