import { getWeather } from "../services/weather/weather.service.js";

export const getDestinationWeather = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    // Check whether coordinates are provided
    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        message: "Latitude and longitude are required.",
      });
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    // Validate coordinates
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid geographical coordinates.",
      });
    }

    // Fetch weather information
    const weather = await getWeather(lat, lng);

    return res.status(200).json({
      success: true,
      message: "Weather information retrieved successfully.",
      weather,
    });

  } catch (error) {
    console.error("Weather Controller Error:", error);

    return res.status(502).json({
      success: false,
      message: error.message || "Failed to retrieve weather information.",
    });
  }
};
