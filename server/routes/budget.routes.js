import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
  getTripBudget,
} from "../controllers/budget.controller.js";

const router = express.Router();

// Get calculated budget summary for a trip
router.get("/:tripId", protect, getTripBudget);

export default router;