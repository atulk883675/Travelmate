import { getDrivingRoute } from "../services/maps/routing.service.js";

export const calculateRoute = async (req, res) => {
  try {
    const {
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
    } = req.query;

    const coordinates = [
      startLatitude,
      startLongitude,
      endLatitude,
      endLongitude,
    ];

    // Check that all coordinates are provided
    if (coordinates.some(
      (value) => value === undefined || value === ""
    )) {
      return res.status(400).json({
        success: false,
        message: "All starting and ending coordinates are required.",
      });
    }

    // Convert coordinates to numbers
    const [startLat, startLng, endLat, endLng] =
      coordinates.map(Number);

    // Validate coordinate values
    if (
      ![startLat, startLng, endLat, endLng].every(Number.isFinite) ||
      startLat < -90 || startLat > 90 ||
      endLat < -90 || endLat > 90 ||
      startLng < -180 || startLng > 180 ||
      endLng < -180 || endLng > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates provided.",
      });
    }

    const route = await getDrivingRoute(
      startLat,
      startLng,
      endLat,
      endLng
    );

    return res.status(200).json({
      success: true,
      route,
    });

  } catch (error) {
    console.error("Route Calculation Error:", error);

    return res.status(502).json({
      success: false,
      message: error.message || "Failed to calculate route.",
    });
  }
};