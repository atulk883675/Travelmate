import express from "express";

import { createTrip , getMyTrips, getTripById, updateTrip, deleteTrip,} from "../controllers/trip.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import validate from "../middleware/validation.middleware.js";

import { createTripSchema } from "../validators/trip.validator.js";

const router = express.Router();

// Create a new trip
router.post(
  "/",
  protect,
  validate(createTripSchema),
  createTrip
);

// Get all trips of logged-in user
router.get("/", protect, getMyTrips);

// Get a specific trip
router.get("/:tripId", protect, getTripById);

router.put("/:tripId", protect, validate(createTripSchema), updateTrip);

router.delete("/:tripId", protect, deleteTrip);

export default router;
