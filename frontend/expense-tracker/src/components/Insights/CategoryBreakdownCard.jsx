import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuChartPie, LuArrowRight } from "react-icons/lu";

import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getIconOption } from "../../utils/transactionIcons";
import {
  addThousandsSeparator,
  prepareCategoryBreakdown,
  monthBounds,
} from "../../utils/helper";

// Insights card: compact "top spending categories this month" preview. Clicking
// anywhere opens the full breakdown page. Fetches its own data so the Insights
// page stays a simple card container.
const CategoryBreakdownCard = () => {
  const navigate = useNavigate();
  const [expense, setExpense] = useState([]);

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

  const { total, categories } = useMemo(
    () => prepareCategoryBreakdown(expense, monthBounds()),
    [expense]
  );

  const topCategories = categories.slice(0, 4);
  const hasData = categories.length > 0;

  return (
    <button
      type="button"
      onClick={() => navigate("/insights/category-breakdown")}
      className="card text-left w-full hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center text-xl text-white bg-primary rounded-full">
            <LuChartPie />
          </div>
          <div>
            <h5 className="text-lg font-medium">Spending by Category</h5>
            <p className="text-xs text-gray-400 mt-0.5">
              Where your money went this month.
            </p>
          </div>
        </div>
        <LuArrowRight className="text-gray-400 text-lg" />
      </div>

      {hasData ? (
        <>
          <div className="mt-5 space-y-3">
            {topCategories.map((c) => {
              const Icon = getIconOption(c.icon)?.Icon;
              return (
                <div key={c.icon}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-gray-700">
                      {Icon && (
                        <span className="w-7 h-7 flex items-center justify-center text-primary bg-purple-50 rounded-full">
                          <Icon />
                        </span>
                      )}
                      {c.category}
                    </span>
                    <span className="font-medium text-gray-800">
                      ${addThousandsSeparator(c.amount)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.round(c.share * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-sm text-gray-500 mt-4">
            This month's spend:{" "}
            <span className="font-semibold text-gray-800">
              ${addThousandsSeparator(total)}
            </span>
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-400 mt-6">
          No spending recorded this month yet — add some expenses to see your
          top categories here.
        </p>
      )}
    </button>
  );
};

export default CategoryBreakdownCard;
