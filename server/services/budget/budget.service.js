import Expense from "../../models/Expense.js";
import Trip from "../../models/Trip.js";

export const calculateTripBudget = async (tripId, userId) => {
  // Step 1: Find the trip belonging to the user
  const trip = await Trip.findOne({
    _id: tripId,
    userId,
  });

  if (!trip) {
    throw new Error("Trip not found.");
  }

  // Step 2: Calculate total estimated activity expenses
  let estimatedExpenses = 0;

  trip.itinerary.forEach((day) => {
    day.activities.forEach((activity) => {
      estimatedExpenses += activity.estimatedCost || 0;
    });
  });

  // Step 3: Retrieve actual expenses
  const expenses = await Expense.find({
    tripId: trip._id,
    userId,
  });

  // Step 4: Calculate total actual spending
  const actualExpenses = expenses.reduce(
    (total, expense) => total + expense.amount,
    0
  );

  // Step 5: Get planned budget
  const plannedBudget = trip.budgetPlan.totalAmount || 0;

  // Step 6: Calculate remaining budget
  const remainingBudget = plannedBudget - actualExpenses;

  // Step 7: Calculate budget utilization percentage
  const budgetUtilization =
    plannedBudget > 0
      ? Number(((actualExpenses / plannedBudget) * 100).toFixed(2))
      : 0;

  // Step 8: Calculate category-wise actual spending
  const categoryBreakdown = {};

  expenses.forEach((expense) => {
    const category = expense.category;

    categoryBreakdown[category] =
      (categoryBreakdown[category] || 0) + expense.amount;
  });

  // Step 9: Return budget summary
  return {
    currency: trip.budgetPlan.currency,
    plannedBudget,
    estimatedExpenses,
    actualExpenses,
    remainingBudget,
    budgetUtilization,
    isOverBudget: actualExpenses > plannedBudget,
    categoryBreakdown,
  };
};