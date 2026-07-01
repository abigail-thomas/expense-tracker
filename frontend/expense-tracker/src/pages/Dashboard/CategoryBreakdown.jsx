import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuWallet, LuCalendarDays, LuChartPie } from "react-icons/lu";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import InfoCard from "../../components/Cards/InfoCard";
import CustomPieChart from "../../components/Charts/CustomPieChart";

import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { CHART_PALETTE as COLORS } from "../../utils/chartColors";
import { getIconOption } from "../../utils/transactionIcons";
import {
  addThousandsSeparator,
  prepareCategoryBreakdown,
  prepareCategoryTable,
  monthBounds,
  yearBounds,
} from "../../utils/helper";

const PERIOD_OPTIONS = [
  { key: "month", label: "This Month" },
  { key: "year", label: "This Year" },
];

// Full category breakdown: how much is spent in each category (grouped by icon)
// this month vs. this year. Frontend-only — aggregates the raw expense list.
const CategoryBreakdown = () => {
  useUserAuth();

  const navigate = useNavigate();
  const [expense, setExpense] = useState([]);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
        if (!active) return;
        setExpense(res.data || []);
      } catch (error) {
        console.error("Failed to fetch category breakdown data:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const table = useMemo(() => prepareCategoryTable(expense), [expense]);

  const breakdown = useMemo(
    () =>
      prepareCategoryBreakdown(
        expense,
        period === "month" ? monthBounds() : yearBounds()
      ),
    [expense, period]
  );

  const pieData = useMemo(
    () => breakdown.categories.map((c) => ({ name: c.category, amount: c.amount })),
    [breakdown]
  );

  const monthlyAvg = table.elapsedMonths
    ? table.yearTotal / table.elapsedMonths
    : 0;
  const hasData = table.rows.length > 0;

  return (
    <DashboardLayout activeMenu="Insights">
      <div className="my-5 mx-auto">
        <button
          type="button"
          onClick={() => navigate("/insights")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <LuArrowLeft /> Back to Insights
        </button>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<LuWallet />}
            label="Spent this month"
            value={addThousandsSeparator(table.monthTotal)}
            color="bg-rose-500"
          />
          <InfoCard
            icon={<LuCalendarDays />}
            label="Spent this year"
            value={addThousandsSeparator(table.yearTotal)}
            color="bg-primary"
          />
          <InfoCard
            icon={<LuChartPie />}
            label="Monthly average (this year)"
            value={addThousandsSeparator(monthlyAvg)}
            color="bg-orange-500"
          />
        </div>

        {/* Category share chart + period toggle */}
        <div className="card mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h5 className="text-lg font-medium">Spending by Category</h5>
              <p className="text-xs text-gray-400 mt-0.5">
                Where your money went — grouped by category.
              </p>
            </div>

            <div className="flex bg-gray-100 rounded-lg p-1">
              {PERIOD_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setPeriod(opt.key)}
                  className={`text-xs px-3 py-1.5 rounded-md ${
                    period === opt.key
                      ? "bg-white text-primary shadow-sm font-medium"
                      : "text-gray-500"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {pieData.length > 0 ? (
            <CustomPieChart
              data={pieData}
              label={period === "month" ? "This Month" : "This Year"}
              totalAmount={`$${addThousandsSeparator(breakdown.total)}`}
              colors={COLORS}
              showTextAnchor
            />
          ) : (
            <p className="text-sm text-gray-400 mt-6">
              No spending recorded for {period === "month" ? "this month" : "this year"} yet.
            </p>
          )}
        </div>

        {/* Month vs. year breakdown table */}
        <div className="card mt-6">
          <h5 className="text-lg font-medium mb-4">Month vs. year</h5>
          {hasData ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-gray-100">
                    <th className="py-2 pr-4 font-medium">Category</th>
                    <th className="py-2 px-4 font-medium text-right">This month</th>
                    <th className="py-2 px-4 font-medium text-right">This year</th>
                    <th className="py-2 px-4 font-medium text-right">Monthly avg</th>
                    <th className="py-2 pl-4 font-medium text-right">% of year</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row) => {
                    const Icon = getIconOption(row.icon)?.Icon;
                    return (
                      <tr key={row.icon} className="border-b border-gray-50">
                        <td className="py-2.5 pr-4 text-gray-700">
                          <span className="flex items-center gap-2">
                            {Icon && (
                              <span className="w-7 h-7 flex items-center justify-center text-primary bg-purple-50 rounded-full">
                                <Icon />
                              </span>
                            )}
                            {row.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-700">
                          ${addThousandsSeparator(row.month)}
                        </td>
                        <td className="py-2.5 px-4 text-right font-medium text-gray-800">
                          ${addThousandsSeparator(row.year)}
                        </td>
                        <td className="py-2.5 px-4 text-right text-gray-500">
                          ${addThousandsSeparator(row.monthlyAvg)}
                        </td>
                        <td className="py-2.5 pl-4 text-right text-gray-500">
                          {(row.yearShare * 100).toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No expenses recorded yet — add some to see your category breakdown.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CategoryBreakdown;
