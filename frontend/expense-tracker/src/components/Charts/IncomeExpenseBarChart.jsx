import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { addThousandsSeparator } from "../../utils/helper";

const INCOME_COLOR = "#16a34a"; // emerald — money in
const EXPENSE_COLOR = "#f43f5e"; // rose — money out

// Tooltip for the grouped chart: shows Income, Expense and the resulting Net
// for the hovered month.
const IncomeExpenseTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0]?.payload || {};
  const net = point.net ?? (point.income || 0) - (point.expense || 0);
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 border border-gray-200 dark:border-gray-700">
      <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">{label}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Income:{" "}
        <span className="font-medium" style={{ color: INCOME_COLOR }}>
          ${addThousandsSeparator(point.income || 0)}
        </span>
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Expense:{" "}
        <span className="font-medium" style={{ color: EXPENSE_COLOR }}>
          ${addThousandsSeparator(point.expense || 0)}
        </span>
      </p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Net:{" "}
        <span
          className="font-semibold"
          style={{ color: net >= 0 ? INCOME_COLOR : EXPENSE_COLOR }}
        >
          {net < 0 ? "-$" : "$"}
          {addThousandsSeparator(Math.abs(net))}
        </span>
      </p>
    </div>
  );
};

// Grouped bar chart with two bars per month: Income then Expense. `data` is the
// output of prepareIncomeVsExpense(). `height` lets the compact card preview be
// shorter than the full detail page.
const IncomeExpenseBarChart = ({ data = [], height = 300, showLegend = true }) => {
  return (
    <div className="bg-white dark:bg-gray-800 mt-6">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} barGap={4}>
          <CartesianGrid stroke="none" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#555" }} stroke="none" />
          <YAxis tick={{ fontSize: 12, fill: "#555" }} stroke="none" />
          <Tooltip content={<IncomeExpenseTooltip />} cursor={{ fill: "transparent" }} />
          {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
          <Bar dataKey="income" name="Income" fill={INCOME_COLOR} radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" name="Expense" fill={EXPENSE_COLOR} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseBarChart;
