import api from "./api";

export const getNearbyAttractions = async (
  latitude,
  longitude,
  radius = 2000
) => {
  const response = await api.get("/nearby", {
    params: {
      latitude,
      longitude,
      radius,
    },
  });

  return response.data;
};
