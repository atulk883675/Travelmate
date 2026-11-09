import api from "./api";

export const searchDestination = async (query) => {
  const response = await api.get("/maps/search", {
    params: {
      query,
    },
  });

  return response.data;
};