import React from "react";

// Custom legend renderer for the pie chart.
const CustomLegend = ({ payload }) => {
  if (!payload) return null;
  return (
    <div className="flex flex-wrap justify-center gap-4 mt-4 space-x-6">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center space-x-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-700 font-medium">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default CustomLegend;
