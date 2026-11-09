import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Trip from "../models/Trip.js";

import {
  createExpenseSchema,
  updateExpenseSchema,
} from "../validators/expense.validator.js";

// 1. Create Expense
export const createExpense = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Validate Trip ID
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    // Validate request body
    const validationResult = createExpenseSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense data.",
        errors: validationResult.error.issues,
      });
    }

    // Check whether trip belongs to logged-in user
    const trip = await Trip.findOne({
      _id: tripId,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    // Create expense
    const expense = await Expense.create({
      ...validationResult.data,
      tripId: trip._id,
      userId: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully.",
      expense,
    });
  } catch (error) {
    console.error("Create Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create expense.",
    });
  }
};

// 2. Get All Expenses of a Trip
export const getTripExpenses = async (req, res) => {
  try {
    const { tripId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    // Verify trip ownership
    const trip = await Trip.findOne({
      _id: tripId,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const expenses = await Expense.find({
      tripId: trip._id,
      userId: req.user._id,
    }).sort({ date: -1 });

    return res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    console.error("Get Expenses Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve expenses.",
    });
  }
};

// 3. Update Expense
export const updateExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(tripId) ||
      !mongoose.Types.ObjectId.isValid(expenseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip or expense ID.",
      });
    }

    const validationResult = updateExpenseSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid expense data.",
        errors: validationResult.error.issues,
      });
    }

    // Verify trip ownership
    const trip = await Trip.findOne({
      _id: tripId,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const expense = await Expense.findOneAndUpdate(
      {
        _id: expenseId,
        tripId: trip._id,
        userId: req.user._id,
      },
      validationResult.data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
      expense,
    });
  } catch (error) {
    console.error("Update Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update expense.",
    });
  }
};

// 4. Delete Expense
export const deleteExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(tripId) ||
      !mongoose.Types.ObjectId.isValid(expenseId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip or expense ID.",
      });
    }

    // Verify trip ownership
    const trip = await Trip.findOne({
      _id: tripId,
      userId: req.user._id,
    });

    if (!trip) {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    const expense = await Expense.findOneAndDelete({
      _id: expenseId,
      tripId: trip._id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Expense Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete expense.",
    });
  }
};