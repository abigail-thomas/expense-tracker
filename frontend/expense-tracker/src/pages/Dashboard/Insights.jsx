import React from "react";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeVsExpenseCard from "../../components/Insights/IncomeVsExpenseCard";
import CategoryBreakdownCard from "../../components/Insights/CategoryBreakdownCard";

import { useUserAuth } from "../../hooks/useUserAuth";

// Insights hub — a grid of analytical cards. More cards will be added over time.
const Insights = () => {
  useUserAuth();

  return (
    <DashboardLayout activeMenu="Insights">
      <div className="my-5 mx-auto">
        <h2 className="text-xl font-semibold mb-1">Insights</h2>
        <p className="text-sm text-gray-400 mb-6">
          Dig into how your money moves. Click a card for a full breakdown.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <IncomeVsExpenseCard />
          <CategoryBreakdownCard />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Insights;
