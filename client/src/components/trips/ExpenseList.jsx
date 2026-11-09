import React from "react";

const ExpenseList = ({
  expenses,
  loading,
  onEdit,
  onDelete,
  currency = "INR",
}) => {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalExpenses = expenses?.length || 0;

  const totalSpending = (expenses || []).reduce(
   (total, expense) => total + expense.amount,
   0
  );

  if (loading) {
    return <p>Loading expenses...</p>;
  }

  if (!expenses || expenses.length === 0) {
    return (
      <section className="expense-list-section">
        <h2>Your Expenses</h2>
        <p>No expenses recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="expense-list-section">
      <h2>Your Expenses</h2>

      <div className="expense-summary">

      <div className="expense-summary-card">
       <h4>Total Expenses</h4>
       <h2>{totalExpenses}</h2>
      </div>

      <div className="expense-summary-card">
      <h4>Total Spending</h4>
      <h2>{formatAmount(totalSpending)}</h2>
      </div>

      </div>

      <div className="expense-list">
        {expenses.map((expense) => (
          <div className="expense-item" key={expense._id}>
            <div className="expense-item-details">
              <h3>{expense.title}</h3>

              <p>
                Category: {expense.category}
              </p>

              <p>
                Date: {formatDate(expense.date)}
              </p>

              {expense.notes && (
                <p>Notes: {expense.notes}</p>
              )}
            </div>

            <div className="expense-item-actions">
              <h3>{formatAmount(expense.amount)}</h3>

              <button
                type="button"
                onClick={() => onEdit(expense)}
              >
                Edit
              </button>

              <button
                type="button"
                onClick={() => onDelete(expense._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExpenseList;