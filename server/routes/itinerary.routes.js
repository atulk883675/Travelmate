import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { generateTripItinerary , updateTripItinerary} from "../controllers/itinerary.controller.js";

const router = express.Router();

router.post("/:tripId/generate", protect, generateTripItinerary);
router.put("/:tripId", protect, updateTripItinerary);

export default router;