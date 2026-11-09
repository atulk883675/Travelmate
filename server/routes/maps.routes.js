import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { searchDestination } from "../controllers/maps.controller.js";

const router = express.Router();

// Search for a destination
router.get("/search", protect, searchDestination);

export default router;