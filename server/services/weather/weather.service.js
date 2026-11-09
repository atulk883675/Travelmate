const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

export const getWeather = async (latitude, longitude) => {
  // Validate coordinates
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid geographical coordinates.");
  }

  // Prepare API parameters
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),

    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m",

    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset",

    timezone: "auto",
    forecast_days: "7",
  });

  // Make API request
  const response = await fetch(
    `${WEATHER_API_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Weather service is currently unavailable.");
  }

  const data = await response.json();

  if (!data.current || !data.daily) {
    throw new Error("Invalid weather data received.");
  }

  return {
    location: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    },

    current: data.current,

    forecast: data.daily,
  };
};
