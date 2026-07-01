import React from "react";
import moment from "moment";
import { LuPencil, LuTrash2 } from "react-icons/lu";

import { addThousandsSeparator } from "../../utils/helper";
import { getIconOption } from "../../utils/transactionIcons";

// Badge + progress-bar colors per goal status.
const STATUS_STYLES = {
  reached: { badge: "bg-green-100 text-green-700", bar: "bg-green-500" },
  ontrack: { badge: "bg-purple-100 text-primary", bar: "bg-primary" },
  behind: { badge: "bg-amber-100 text-amber-700", bar: "bg-amber-500" },
  overdue: { badge: "bg-rose-100 text-rose-700", bar: "bg-rose-500" },
};

// A single savings goal: progress bar, saved/target, pace, and status.
const GoalCard = ({ goal, progress, onEdit, onDelete }) => {
  const Icon = getIconOption(goal.icon)?.Icon;
  const styles = STATUS_STYLES[progress.status.key] || STATUS_STYLES.ontrack;
  const pctLabel = Math.round(progress.pct * 100);
  const barWidth = Math.min(100, Math.max(0, progress.pct * 100));

  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 flex items-center justify-center text-xl text-white bg-primary rounded-full">
            {Icon ? <Icon /> : null}
          </div>
          <div>
            <h5 className="text-lg font-medium">{goal.name}</h5>
            <p className="text-xs text-gray-400 mt-0.5">
              Target {moment(goal.targetDate).format("MMM D, YYYY")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles.badge}`}
          >
            {progress.status.label}
          </span>
          <button
            type="button"
            onClick={onEdit}
            className="text-gray-400 hover:text-primary p-1"
            aria-label="Edit goal"
          >
            <LuPencil />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="text-gray-400 hover:text-rose-500 p-1"
            aria-label="Delete goal"
          >
            <LuTrash2 />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-700">
            <span className="font-semibold text-gray-900">
              ${addThousandsSeparator(progress.saved)}
            </span>{" "}
            of ${addThousandsSeparator(progress.target)}
          </span>
          <span className="text-gray-500">{pctLabel}%</span>
        </div>
        <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${styles.bar}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
      </div>

      {/* Pace details */}
      <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
        <div>
          <p className="text-xs text-gray-400">Still to save</p>
          <p className="font-medium text-gray-800">
            ${addThousandsSeparator(progress.remaining)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Needed / month</p>
          <p className="font-medium text-gray-800">
            ${addThousandsSeparator(progress.requiredPerMonth)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Your pace / month</p>
          <p className="font-medium text-gray-800">
            ${addThousandsSeparator(progress.actualPerMonth)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Projected finish</p>
          <p className="font-medium text-gray-800">
            {progress.status.key === "reached"
              ? "Reached 🎉"
              : progress.projectedDate
              ? moment(progress.projectedDate).format("MMM D, YYYY")
              : "—"}
          </p>
        </div>
      </div>

      {goal.note ? (
        <p className="text-xs text-gray-400 mt-4 border-t border-gray-50 pt-3">
          {goal.note}
        </p>
      ) : null}
    </div>
  );
};

export default GoalCard;
