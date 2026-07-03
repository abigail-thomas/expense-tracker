import React from "react";
import { LuRepeat, LuEllipsis } from "react-icons/lu";
import CustomBarChart from "../Charts/CustomBarChart";
import { getIconOption } from "../../utils/transactionIcons";
import { addThousandsSeparator } from "../../utils/helper";

// Dashboard card: monthly income trend (last 6 months) plus a breakdown of
// recurring income sources (those received in 2+ distinct months).
const RecurringIncomeTrends = ({ trends = [], recurring = [] }) => {
  const hasTrend = trends.some((t) => t.amount > 0);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">Recurring Income Trends</h5>
      </div>

      {hasTrend ? (
        <CustomBarChart data={trends} xKey="month" />
      ) : (
        <p className="text-sm text-gray-400 mt-6">
          Not enough income yet to show a monthly trend.
        </p>
      )}

      <div className="mt-4">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Recurring sources
        </p>

        {recurring.length === 0 ? (
          <p className="text-sm text-gray-400">
            No recurring income detected yet — sources received in 2+ months
            will show up here.
          </p>
        ) : (
          <div className="space-y-2">
            {recurring.map((item) => {
              const option = getIconOption(item.icon);
              const Icon = option?.Icon;
              return (
                <div
                  key={item.source}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-700/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center text-lg text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50 rounded-full">
                      {Icon ? <Icon /> : <LuEllipsis />}
                    </div>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">
                        {item.source}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                        <LuRepeat className="text-xs" />
                        {item.payments} payments · avg $
                        {addThousandsSeparator(item.average)}
                      </p>
                    </div>
                  </div>

                  <span className="text-sm font-semibold text-primary">
                    ${addThousandsSeparator(item.total)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringIncomeTrends;
