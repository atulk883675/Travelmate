import { getNearbyAttractions } from "../services/maps/nearby.service.js";

export const findNearbyAttractions = async (req, res, next) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);
    const radius = Number(req.query.radius || 5000);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid latitude and longitude are required.",
      });
    }

    if (
      !Number.isInteger(radius) ||
      radius < 100 ||
      radius > 20000
    ) {
      return res.status(400).json({
        success: false,
        message: "Radius must be between 100 and 20000 metres.",
      });
    }

    const attractions = await getNearbyAttractions(
      latitude,
      longitude,
      radius
    );

    res.status(200).json({
      success: true,
      count: attractions.length,
      attractions,
    });
  } catch (error) {
    next(error);
  }
};
