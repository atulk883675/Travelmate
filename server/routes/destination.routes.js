import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
  getAllDestinations,
  getDestinationById,
  saveDestination,
  removeSavedDestination,
  getSavedDestinations,
  getDestinationRegions,
} from "../controllers/destination.controller.js";

const router = express.Router();

// Discover all destinations (with optional filters)
router.get("/", getAllDestinations);

// Get saved destinations of logged-in user
router.get("/saved", protect, getSavedDestinations);

// Save a destination
router.post("/:destinationId/save", protect, saveDestination);

// Remove a saved destination
router.delete("/:destinationId/save", protect, removeSavedDestination);

router.get("/states", getDestinationRegions);

// Get details of a destination
router.get("/:destinationId", getDestinationById);

export default router;
