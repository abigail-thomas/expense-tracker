import React, { useMemo } from "react";
import CustomPieChart from "../Charts/CustomPieChart";
import { addThousandsSeparator } from "../../utils/helper";

import { CHART_PALETTE as COLORS } from "../../utils/chartColors";

// Donut chart of the last 60 days of income, broken down by source.
const RecentIncomeWithChart = ({ data, totalIncome }) => {
  const chartData = useMemo(
    () =>
      (data || []).map((item) => ({
        name: item?.source,
        amount: item?.amount,
      })),
    [data]
  );


  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">Last 60 Days Income</h5>
      </div>

      <CustomPieChart
        data={chartData}
        label="Total Income"
        totalAmount={`$${addThousandsSeparator(totalIncome)}`}
        colors={COLORS}
        showTextAnchor
      />
    </div>
  );
};

export default RecentIncomeWithChart;
