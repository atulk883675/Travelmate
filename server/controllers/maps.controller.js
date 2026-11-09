import { searchLocation } from "../services/maps/geocoding.service.js";

export const searchDestination = async (req, res) => {
  try {
    const { query } = req.query;

    // Validate the search query
    if (!query || !query.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please provide a destination to search.",
      });
    }

    // Search for the destination
    const locations = await searchLocation(query);

    return res.status(200).json({
      success: true,
      count: locations.length,
      locations,
    });

  } catch (error) {
    console.error("Destination Search Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search for the destination.",
    });
  }
};