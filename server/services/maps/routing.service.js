const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

export const getDrivingRoute = async (
  startLatitude,
  startLongitude,
  endLatitude,
  endLongitude
) => {
  const coordinates = [
    `${startLongitude},${startLatitude}`,
    `${endLongitude},${endLatitude}`,
  ].join(";");

  const url = `${OSRM_URL}/${coordinates}?overview=full&geometries=geojson`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Routing service is currently unavailable.");
  }

  const data = await response.json();

  if (data.code !== "Ok" || !data.routes?.length) {
    throw new Error("No driving route found between these locations.");
  }

  const route = data.routes[0];

  return {
    distance: Number((route.distance / 1000).toFixed(2)),
    duration: Number((route.duration / 60).toFixed(2)),
    geometry: route.geometry,
  };
};