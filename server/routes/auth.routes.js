import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  logoutAll,
} from "../controllers/auth.controller.js";

import { protect } from "../middleware/auth.middleware.js";

import validate from "../middleware/validation.middleware.js";

import {
    registerSchema,
    loginSchema
} from "../validators/auth.validator.js";

const router = express.Router();

// POST /api/v1/auth/register
router.post(
    "/register",
    validate(registerSchema),
    register
);

// POST /api/v1/auth/login
router.post(
    "/login",
    validate(loginSchema),
    login
);

// POST /api/v1/auth/logout
router.post("/logout", logout);

router.get("/me", protect, getMe);

router.post("/logout-all", protect, logoutAll);

export default router;
