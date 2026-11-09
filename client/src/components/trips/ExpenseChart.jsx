import React from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#3B82F6",
  "#16A34A",
  "#F59E0B",
  "#8B5CF6",
  "#EC4899",
  "#64748B",
];

const ExpenseChart = ({ categoryBreakdown, currency = "INR" }) => {

  // Convert category object into chart data
  const chartData = Object.entries(categoryBreakdown || {})
    .map(([category, amount]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: amount,
    }))
    .filter((item) => item.value > 0);

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (chartData.length === 0) {
    return (
      <section className="expense-chart-section">
        <h2>Expense Breakdown</h2>
        <p>No expenses recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="expense-chart-section">

      <h2>Expense Breakdown</h2>

      <div className="expense-chart-container">

        <ResponsiveContainer width="100%" height={320}>
          <PieChart>

            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={105}
              label
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value) => formatAmount(value)}
            />

            <Legend />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </section>
  );
};

export default ExpenseChart;