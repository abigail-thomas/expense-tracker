import React from "react";
import { addThousandsSeparator } from "../../utils/helper";

// Shared tooltip used across the pie / bar / line charts.
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const label = item.name ?? item.payload?.category ?? item.payload?.source ?? item.payload?.month;
    return (
      <div className="bg-white shadow-md rounded-lg p-2 border border-gray-200">
        <p className="text-xs font-semibold text-purple-800 mb-1"></p>
        <p className="text-sm text-gray-600">
          Amount:{" "}
          <span className="text-sm font-medium text-gray-900">
            ${addThousandsSeparator(item.value)}
          </span>
        </p>
      </div>
    );
  }
  return null;
};

export default CustomTooltip;
