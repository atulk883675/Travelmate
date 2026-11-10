import express from "express";
import { findNearbyAttractions } from "../controllers/nearby.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, findNearbyAttractions);

export default router;
