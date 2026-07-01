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
      ? "bg-green-50 text-green-500"
      : "bg-red-50 text-red-500";

  // Prefer a preset icon; fall back to a raw string (legacy emoji data) or a default.
  const iconOption = getIconOption(icon);
  const PresetIcon = iconOption?.Icon;

  return (
    <div className="group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60">
      <div className="w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
        {PresetIcon ? (
          <PresetIcon />
        ) : icon ? (
          <span className="text-2xl">{icon}</span>
        ) : (
          <LuUtensils />
        )}
      </div>

      <div className="flex-1 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-700 font-medium">{title}</p>
            {recurring && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-primary">
                Recurring
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">{date}</p>
          {(method || fundName || cardName) && (
            <p className="text-xs text-gray-500 mt-1 capitalize">
              {[method, fundName || cardName].filter(Boolean).join(" · ")}
            </p>
          )}
          {notes && (
            <p className="text-xs text-gray-500 mt-1 italic">{notes}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              className="text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onEdit}
              aria-label="Edit"
            >
              <LuPencil className="text-base" />
            </button>
          )}
          {!hideDeleteBtn && (
            <button
              className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={onDelete}
            >
              <LuTrash2 className="text-lg" />
            </button>
          )}

          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}
          >
            <h6 className="text-xs font-medium">
              {type === "income" ? "+" : "-"} ${addThousandsSeparator(amount)}
            </h6>
            {type === "income" ? (
              <LuTrendingUp />
            ) : (
              <LuTrendingDown />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionInfoCard;
