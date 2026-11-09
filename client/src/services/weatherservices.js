import api from "./api";

export const getDestinationWeather = async (latitude, longitude) => {
  const response = await api.get("/weather", {
    params: {
      latitude,
      longitude,
    },
  });

  return response.data;
};
