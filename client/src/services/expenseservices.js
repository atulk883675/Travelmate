import api from "./api";

// Get all expenses of a trip
export const getTripExpenses = async (tripId) => {
  const response = await api.get(`/expenses/${tripId}`);
  return response.data;
};

// Create a new expense
export const createExpense = async (tripId, expenseData) => {
  const response = await api.post(
    `/expenses/${tripId}`,
    expenseData
  );

  return response.data;
};

// Update an existing expense
export const updateExpense = async (
  tripId,
  expenseId,
  expenseData
) => {
  const response = await api.put(
    `/expenses/${tripId}/${expenseId}`,
    expenseData
  );

  return response.data;
};

// Delete an expense
export const deleteExpense = async (tripId, expenseId) => {
  const response = await api.delete(
    `/expenses/${tripId}/${expenseId}`
  );

  return response.data;
};