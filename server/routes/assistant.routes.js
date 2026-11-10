import express from "express";

import { chatWithAssistant , applyAssistantChanges } from "../controllers/assistant.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:tripId/chat", protect, chatWithAssistant);
router.put("/:tripId/apply", protect, applyAssistantChanges);

export default router;
