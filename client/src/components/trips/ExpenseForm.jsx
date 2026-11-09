import React, { useEffect, useState } from "react";

import {
  createExpense,
  updateExpense,
} from "../../services/expenseservices";

const getInitialFormData = () => ({
  title: "",
  category: "food",
  amount: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
});

const ExpenseForm = ({
  tripId,
  expense,
  onExpenseAdded,
  onCancel,
}) => {
  const [formData, setFormData] = useState(getInitialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load selected expense when editing
  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title,
        category: expense.category,
        amount: expense.amount,
        date: new Date(expense.date).toISOString().split("T")[0],
        notes: expense.notes || "",
      });
    } else {
      setFormData(getInitialFormData());
    }

    setError("");
  }, [expense]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const expenseData = {
        ...formData,
        amount: Number(formData.amount),
      };

      if (expense) {
        await updateExpense(
          tripId,
          expense._id,
          expenseData
        );
      } else {
        await createExpense(tripId, expenseData);
      }

      if (onExpenseAdded) {
        await onExpenseAdded();
      }

    } catch (error) {
      console.error("Expense Save Error:", error);

      setError(
        error.response?.data?.message ||
        "Failed to save expense. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-form-container">
      <h2>{expense ? "Edit Expense" : "Add New Expense"}</h2>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Expense Title</label>

          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="accommodation">Accommodation</option>
            <option value="transportation">Transportation</option>
            <option value="food">Food</option>
            <option value="activities">Activities</option>
            <option value="shopping">Shopping</option>
            <option value="miscellaneous">Miscellaneous</option>
          </select>
        </div>

        <div className="form-group">
          <label>Amount</label>

          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label>Expense Date</label>

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Notes</label>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            maxLength={500}
          />
        </div>

        <div className="expense-form-actions">
          <button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : expense
                ? "Update Expense"
                : "Add Expense"}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>

      </form>
    </div>
  );
};

export default ExpenseForm;