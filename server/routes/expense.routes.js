import express from "express";

import { protect } from "../middleware/auth.middleware.js";

import {
  createExpense,
  getTripExpenses,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";

const router = express.Router();

// Create an expense for a trip
router.post("/:tripId", protect, createExpense);

// Get all expenses of a trip
router.get("/:tripId", protect, getTripExpenses);

// Update a particular expense
router.put("/:tripId/:expenseId", protect, updateExpense);

// Delete a particular expense
router.delete("/:tripId/:expenseId", protect, deleteExpense);

export default router;