import React, { useEffect, useState } from "react";
import { LuEllipsis } from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getIconOption } from "../../utils/transactionIcons";
import { addThousandsSeparator } from "../../utils/helper";

// Lets the user pick one of their funds when adding a transaction.
// Selection-only — funds are created/edited in the dashboard Funds panel.
const FundSelector = ({ label = "Fund", selectedId, onSelect }) => {
  const [funds, setFunds] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.FUND.GET_ALL);
        if (active) setFunds(res.data || []);
      } catch (error) {
        console.error("Failed to load funds:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mb-4">
      <label className="text-[13px] text-slate-800">{label}</label>

      <div className="grid grid-cols-3 gap-2 mt-2">
        {funds.map((fund) => {
          const option = getIconOption(fund.icon);
          const isActive = selectedId === fund._id;
          return (
            <button
              key={fund._id}
              type="button"
              onClick={() => onSelect(fund)}
              aria-pressed={isActive}
              className={`flex flex-col items-center justify-center gap-1 py-2 md:py-3 px-2 rounded-lg border transition-colors cursor-pointer ${
                isActive
                  ? "border-primary bg-purple-50 text-primary"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option ? (
                <option.Icon className="text-xl md:text-2xl" />
              ) : (
                <LuEllipsis className="text-xl md:text-2xl" />
              )}
              <span className="text-xs font-medium text-center break-words">
                {fund.name}
              </span>
              <span className="text-[11px] text-gray-400">
                ${addThousandsSeparator(fund.balance || 0)}
              </span>
            </button>
          );
        })}

        {funds.length === 0 && (
          <p className="col-span-3 text-xs text-gray-400 py-2">
            No funds yet — add one from the dashboard.
          </p>
        )}
      </div>
    </div>
  );
};

export default FundSelector;
