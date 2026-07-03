import React from "react";
import {
  LuUtensils,
  LuTrendingUp,
  LuTrendingDown,
  LuTrash2,
  LuPencil,
} from "react-icons/lu";
import { getIconOption } from "../../utils/transactionIcons";
import { addThousandsSeparator } from "../../utils/helper";

// A single transaction row: preset icon, title, date, amount, optional delete button.
const TransactionInfoCard = ({
  title,
  icon,
  date,
  amount,
  notes,
  method, // "debit" | "credit" (expenses only)
  fundName, // name of the fund the money moved to/from
  cardName, // name of the credit card (credit expenses)
  recurring, // true when this expense was auto-posted by a subscription
  type, // "income" | "expense"
  hideDeleteBtn,
  onDelete,
  onEdit,
}) => {
  const getAmountStyles = () =>
    type === "income"
      ? "bg-green-50 dark:bg-green-500/10 text-green-500 dark:text-green-400"
      : "bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400";

  // Prefer a preset icon; fall back to a raw string (legacy emoji data) or a default.
  const iconOption = getIconOption(icon);
  const PresetIcon = iconOption?.Icon;

  return (
    <div className="group relative flex items-start gap-3 sm:gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60 dark:hover:bg-gray-700/40">
      <div className="shrink-0 w-12 h-12 flex items-center justify-center text-xl text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/50 rounded-full">
        {PresetIcon ? (
          <PresetIcon />
        ) : icon ? (
          <span className="text-2xl">{icon}</span>
        ) : (
          <LuUtensils />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Title + amount on one line; amount stays pinned to the right. */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-700 dark:text-gray-200 font-medium">{title}</p>
            {recurring && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-500/10 text-primary">
                Recurring
              </span>
            )}
          </div>

          <div
            className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}
          >
            <h6 className="text-xs font-medium whitespace-nowrap">
              {type === "income" ? "+" : "-"} ${addThousandsSeparator(amount)}
            </h6>
            {type === "income" ? <LuTrendingUp /> : <LuTrendingDown />}
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-1">{date}</p>

        {/* Meta (account / notes) on the left; edit & delete on the right. */}
        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="min-w-0">
            {(method || fundName || cardName || notes) && (
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {[method, fundName || cardName].filter(Boolean).join(" · ")}
                {notes && (
                  <>
                    {(method || fundName || cardName) && " — "}
                    <span className="italic normal-case">{notes}</span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            {onEdit && (
              <button
                className="text-gray-400 hover:text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={onEdit}
                aria-label="Edit"
              >
                <LuPencil className="text-base" />
              </button>
            )}
            {!hideDeleteBtn && (
              <button
                className="text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={onDelete}
                aria-label="Delete"
              >
                <LuTrash2 className="text-lg" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfoCard;
