import React, { useMemo } from "react";
import CustomBarChart from "../Charts/CustomBarChart";
import { prepareExpenseBarChartData } from "../../utils/helper";

// Bar chart of expenses over the last 30 days (by category).
const Last30DaysExpenses = ({ data }) => {
  const chartData = useMemo(() => prepareExpenseBarChartData(data), [data]);

  return (
    <div className="card col-span-1">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">Last 30 Days Expenses</h5>
      </div>

      <CustomBarChart data={chartData} xKey="category" />
    </div>
  );
};

export default Last30DaysExpenses;
