import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { calculateRoute } from "../controllers/routing.controller.js";

const router = express.Router();

router.get("/calculate", protect, calculateRoute);

export default router;