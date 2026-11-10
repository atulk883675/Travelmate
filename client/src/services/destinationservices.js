import api from "./api";

// Fetch all states and Union Territories
export const getDestinationRegions = async () => {
  const response = await api.get("/destinations/states");
  return response.data;
};

// Fetch destinations, optionally filtered by state
export const getDestinations = async (params = {}) => {
  const response = await api.get("/destinations", {
    params,
  });

  return response.data;
};

// Save a destination
export const saveDestination = async (destinationId) => {
  const response = await api.post(
    `/destinations/${destinationId}/save`
  );

  return response.data;
};

// Remove a saved destination
export const removeSavedDestination = async (destinationId) => {
  const response = await api.delete(
    `/destinations/${destinationId}/save`
  );

  return response.data;
};

// Fetch saved destinations
export const getSavedDestinations = async () => {
  const response = await api.get("/destinations/saved");
  return response.data;
};


export const getDestinationById = async (destinationId) => {
  const response = await api.get(`/destinations/${destinationId}`);
  return response.data;
};

