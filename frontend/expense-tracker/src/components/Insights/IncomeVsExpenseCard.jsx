import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChartColumnBig, LuArrowRight } from "react-icons/lu";

import IncomeExpenseBarChart from "../Charts/IncomeExpenseBarChart";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  addThousandsSeparator,
  balanceStatus,
  prepareIncomeVsExpense,
} from "../../utils/helper";

// Tailwind classes for each balance status badge.
const STATUS_STYLES = {
  balanced: "bg-gray-100 text-gray-600",
  surplus: "bg-green-100 text-green-700",
  deficit: "bg-rose-100 text-rose-700",
};

// Insights card: compact last-6-months Income vs Expense preview. Clicking
// anywhere on the card opens the full breakdown page. Fetches its own data so
// the Insights page can stay a simple card container.
const IncomeVsExpenseCard = () => {
  const navigate = useNavigate();
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [incomeRes, expenseRes] = await Promise.all([
          axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME),
          axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE),
        ]);
        if (!active) return;
        setIncome(incomeRes.data || []);
        setExpense(expenseRes.data || []);
      } catch (error) {
        console.error("Failed to fetch income vs expense data:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const data = useMemo(
    () => prepareIncomeVsExpense(income, expense, 6),
    [income, expense]
  );

  const hasData = data.some((d) => d.income > 0 || d.expense > 0);
  const current = data[data.length - 1] || { income: 0, expense: 0, net: 0 };
  const status = balanceStatus(current.income, current.expense);

  return (
    <button
      type="button"
      onClick={() => navigate("/insights/income-vs-expense")}
      className="card text-left w-full hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center text-xl text-white bg-primary rounded-full">
            <LuChartColumnBig />
          </div>
          <div>
            <h5 className="text-lg font-medium">Income vs Expense</h5>
            <p className="text-xs text-gray-400 mt-0.5">
              Monthly balance across the last 6 months.
            </p>
          </div>
        </div>
        <LuArrowRight className="text-gray-400 text-lg" />
      </div>

      {hasData ? (
        <>
          <IncomeExpenseBarChart data={data} height={220} />
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500">
              This month's net:{" "}
              <span
                className={`font-semibold ${
                  current.net >= 0 ? "text-green-600" : "text-rose-600"
                }`}
              >
                {current.net < 0 ? "-$" : "$"}
                {addThousandsSeparator(Math.abs(current.net))}
              </span>
            </p>
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                STATUS_STYLES[status.key]
              }`}
            >
              {status.label}
            </span>
          </div>
        </>
      ) : (
        <p className="text-sm text-gray-400 mt-6">
          Not enough data yet — add some income and expenses to compare them here.
        </p>
      )}
    </button>
  );
};

export default IncomeVsExpenseCard;
