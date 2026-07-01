import React, { useMemo } from "react";
import { LuPlus } from "react-icons/lu";
import CustomBarChart from "../Charts/CustomBarChart";
import { prepareIncomeBarChartData } from "../../utils/helper";

// Header + bar chart for the Income page, with an "Add Income" button.
const IncomeOverview = ({ transactions, onAddIncome }) => {
  const chartData = useMemo(
    () => prepareIncomeBarChartData(transactions),
    [transactions]
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg font-medium">Income Overview</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Track your earnings over time and analyse your income trends.
          </p>
        </div>

        <button className="add-btn" onClick={onAddIncome}>
          <LuPlus className="text-lg" />
          Add Income
        </button>
      </div>

      <CustomBarChart data={chartData} xKey="source" />
    </div>
  );
};

export default IncomeOverview;
