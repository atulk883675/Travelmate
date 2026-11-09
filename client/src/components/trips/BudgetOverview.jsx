import React from "react";

const BudgetOverview = ({ budget, loading, error }) => {
  if (loading) {
    return <p>Loading budget information...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (!budget) {
    return <p>Budget information is unavailable.</p>;
  }

  const {
    currency,
    plannedBudget,
    estimatedExpenses,
    actualExpenses,
    remainingBudget,
    budgetUtilization,
    isOverBudget,
  } = budget;

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <section className="budget-overview">
      <h2>Budget Overview</h2>

      <div className="budget-cards">

        <div className="budget-card">
          <h4>Total Budget</h4>
          <h2>{formatAmount(plannedBudget)}</h2>
        </div>

        <div className="budget-card">
          <h4>Estimated Expenses</h4>
          <h2>{formatAmount(estimatedExpenses)}</h2>
        </div>

        <div className="budget-card">
          <h4>Actual Expenses</h4>
          <h2>{formatAmount(actualExpenses)}</h2>
        </div>

        <div className="budget-card">
          <h4>Remaining Budget</h4>
          <h2>{formatAmount(remainingBudget)}</h2>
        </div>

      </div>

      <div className="budget-progress-section">
        <div className="budget-progress-heading">
          <h3>Budget Utilization</h3>
          <span>{budgetUtilization}%</span>
        </div>

        <div className="budget-progress-track">
          <div
            className={`budget-progress-fill ${
              isOverBudget ? "over-budget" : ""
            }`}
            style={{
              width: `${Math.min(budgetUtilization, 100)}%`,
            }}
          />
        </div>

        <p>
          {isOverBudget
            ? "You have exceeded your planned budget."
            : "You are within your planned budget."}
        </p>
      </div>
    </section>
  );
};

export default BudgetOverview;