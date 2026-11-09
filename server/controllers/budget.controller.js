import mongoose from "mongoose";
import { calculateTripBudget } from "../services/budget/budget.service.js";

export const getTripBudget = async (req, res) => {
  try {
    const { tripId } = req.params;

    // Step 1: Validate Trip ID
    if (!mongoose.Types.ObjectId.isValid(tripId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trip ID.",
      });
    }

    // Step 2: Calculate budget
    const budgetSummary = await calculateTripBudget(
      tripId,
      req.user._id
    );

    // Step 3: Return budget summary
    return res.status(200).json({
      success: true,
      message: "Budget calculated successfully.",
      budget: budgetSummary,
    });

  } catch (error) {
    console.error("Get Trip Budget Error:", error);

    if (error.message === "Trip not found.") {
      return res.status(404).json({
        success: false,
        message: "Trip not found.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to calculate trip budget.",
    });
  }
};