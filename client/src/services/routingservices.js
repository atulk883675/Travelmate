import api from "./api";

export const calculateRoute = async (startLocation, endLocation) => {
  const response = await api.get("/maps/route/calculate", {
    params: {
      startLatitude: startLocation.latitude,
      startLongitude: startLocation.longitude,
      endLatitude: endLocation.latitude,
      endLongitude: endLocation.longitude,
    },
  });

  return response.data;
};