import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { generateTripItinerary } from "../controllers/itinerary.controller.js";

const router = express.Router();

router.post("/:tripId/generate", protect, generateTripItinerary);

export default router;