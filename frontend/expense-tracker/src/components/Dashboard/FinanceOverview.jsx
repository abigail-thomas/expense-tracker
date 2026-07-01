import React from "react";
import CustomPieChart from "../Charts/CustomPieChart";
import { addThousandsSeparator } from "../../utils/helper";
import { CHART_PALETTE as COLORS } from "../../utils/chartColors";

// map the icon user selects to the corresponding category, ex: select the piggy bank and it falls under a savings account.
const ICON_CATEGORY = {
  landmark: "Checking",
  piggybank: "Savings",
  cash: "Cash",
  other: "Other",
};



// Donut chart breaking down the user's balance across their funds/accounts.
// Funds are grouped by category so that multiple funds sharing a category
// (e.g. two funds under "Other") show up as a single slice. Funds without a
// category fall back to their own name so each still appears individually.
const FinanceOverview = ({ funds = [] }) => {
  const groups = new Map();
  funds.forEach((fund) => {
    const key = ICON_CATEGORY[fund.icon] || "Other";
    groups.set(key, (groups.get(key) || 0) + (fund.balance || 0));
  });

  const balanceData = Array.from(groups, ([name, amount]) => ({ name, amount }));

  const total = balanceData.reduce((sum, f) => sum + f.amount, 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">Financial Overview</h5>
      </div>

      {balanceData.length === 0 ? (
        <p className="text-sm text-gray-400 mt-6">No funds to display yet.</p>
      ) : (
        <CustomPieChart
          data={balanceData}
          label="Total Balance"
          totalAmount={`$${addThousandsSeparator(total)}`}
          colors={COLORS}
          showTextAnchor
        />
      )}
    </div>
  );
};

export default FinanceOverview;
