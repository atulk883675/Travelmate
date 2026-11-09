const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export const searchLocation = async (query) => {
  if (!query || !query.trim()) {
    throw new Error("Location name is required.");
  }

  const params = new URLSearchParams({
    q: query.trim(),
    format: "jsonv2",
    limit: "5",
    addressdetails: "1",
  });

  const response = await fetch(
    `${NOMINATIM_URL}?${params.toString()}`,
    {
      headers: {
        "User-Agent": "TravelMate/1.0",
        "Accept": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error("Location search service is currently unavailable.");
  }

  const results = await response.json();

  return results.map((place) => ({
    name: place.display_name,
    latitude: Number(place.lat),
    longitude: Number(place.lon),
    type: place.type,
  }));
};