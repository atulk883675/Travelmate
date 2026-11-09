import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getDestinationWeather } from "../controllers/weather.controller.js";

const router = express.Router();

// Get weather information for a destination
router.get("/", protect, getDestinationWeather);

export default router;
