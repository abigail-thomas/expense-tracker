import React from "react";
import { addThousandsSeparator } from "../../utils/helper";

// Shared tooltip used across the pie / bar / line charts.
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const label = item.name ?? item.payload?.category ?? item.payload?.source ?? item.payload?.month;
    return (
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-2 border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold text-purple-800 dark:text-purple-300 mb-1">{label}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Amount:{" "}
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            ${addThousandsSeparator(item.value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
