import React, { useEffect, useState } from "react";
import { LuEllipsis } from "react-icons/lu";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getIconOption } from "../../utils/transactionIcons";
import { addThousandsSeparator } from "../../utils/helper";

// Lets the user pick which credit card a purchase goes on.
// Selection-only — cards are created/edited in the dashboard Credit Cards panel.
const CreditCardSelector = ({ label = "Credit card", selectedId, onSelect }) => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.CREDIT_CARD.GET_ALL);
        if (active) setCards(res.data || []);
      } catch (error) {
        console.error("Failed to load credit cards:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mb-4">
      <label className="text-[13px] text-slate-800 dark:text-gray-200">{label}</label>

      <div className="grid grid-cols-3 gap-3 mt-2">
        {cards.map((card) => {
          const option = getIconOption(card.icon);
          const isActive = selectedId === card._id;
          const available = (card.limit || 0) - (card.balance || 0);
          return (
            <button
              key={card._id}
              type="button"
              onClick={() => onSelect(card)}
              aria-pressed={isActive}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-lg border transition-colors cursor-pointer ${
                isActive
                  ? "border-primary bg-purple-50 dark:bg-purple-500/10 text-primary"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40"
              }`}
            >
              {option ? (
                <option.Icon className="text-2xl" />
              ) : (
                <LuEllipsis className="text-2xl" />
              )}
              <span className="text-xs font-medium text-center break-words">
                {card.name}
              </span>
              <span className="text-[11px] text-gray-400">
                ${addThousandsSeparator(available)} left
              </span>
            </button>
          );
        })}

        {cards.length === 0 && (
          <p className="col-span-3 text-xs text-gray-400 py-2">
            No credit cards yet — add one from the dashboard.
          </p>
        )}
      </div>
    </div>
  );
};

export default CreditCardSelector;
