import React from "react";
import moment from "moment";
import {
  LuPencil,
  LuTrash2,
  LuAlarmClockCheck,
  LuClockAlert,
  LuHourglass,
  LuCircleCheck,
  LuCirclePlus,
  LuX,
} from "react-icons/lu";

import { addThousandsSeparator } from "../../utils/helper";
import { getIconOption } from "../../utils/transactionIcons";

// Status icon + progress-bar color per goal status. The status now reads as a
// single colored icon (label kept as a tooltip) rather than a text pill.
const STATUS_STYLES = {
  reached: { Icon: LuCircleCheck, color: "text-green-600", bar: "bg-green-500" },
  ontrack: { Icon: LuAlarmClockCheck, color: "text-primary", bar: "bg-primary" },
  behind: { Icon: LuClockAlert, color: "text-amber-600", bar: "bg-amber-500" },
  overdue: { Icon: LuHourglass, color: "text-rose-600", bar: "bg-rose-500" },
};

// A single savings goal: progress bar, saved/target, pace, and status.
const GoalCard = ({
  goal,
  progress,
  onEdit,
  onDelete,
  onAddFunds,
  onDeleteContribution,
}) => {
  const Icon = getIconOption(goal.icon)?.Icon;
  const styles = STATUS_STYLES[progress.status.key] || STATUS_STYLES.ontrack;
  const StatusIcon = styles.Icon;
  const pctLabel = Math.round(progress.pct * 100);
  const barWidth = Math.min(100, Math.max(0, progress.pct * 100));

  // Deposits, newest first.
  const deposits = [...(goal.contributions || [])].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

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
              Target {moment.utc(goal.targetDate).format("MMM D, YYYY")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusIcon
            className={`text-xl ${styles.color}`}
            title={progress.status.label}
            aria-label={progress.status.label}
          />
          <span className="sr-only">{progress.status.label}</span>
          <button
            type="button"
            onClick={onAddFunds}
            className="text-gray-400 hover:text-primary p-1"
            aria-label="Add funds"
            title="Add funds"
          >
            <LuCirclePlus />
          </button>
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
            {progress.actualPerMonth != null
              ? `$${addThousandsSeparator(progress.actualPerMonth)}`
              : "—"}
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

      {/* Deposit history */}
      {deposits.length > 0 ? (
        <div className="mt-5 border-t border-gray-50 pt-3">
          <p className="text-xs text-gray-400 mb-1.5">Deposits</p>
          <ul className="max-h-32 overflow-y-auto text-sm divide-y divide-gray-50">
            {deposits.map((c) => (
              <li
                key={c._id}
                className="flex items-center justify-between py-1.5 group"
              >
                <span className="text-gray-500">
                  {moment.utc(c.date).format("MMM D, YYYY")}
                  {c.note ? (
                    <span className="text-gray-400"> · {c.note}</span>
                  ) : null}
                </span>
                <span className="flex items-center gap-2">
                  <span
                    className={`font-medium ${
                      c.amount < 0 ? "text-rose-600" : "text-gray-800"
                    }`}
                  >
                    {c.amount < 0 ? "-$" : "+$"}
                    {addThousandsSeparator(Math.abs(c.amount))}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteContribution(c._id)}
                    className="text-gray-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove deposit"
                    title="Remove deposit"
                  >
                    <LuX />
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {goal.note ? (
        <p className="text-xs text-gray-400 mt-4 border-t border-gray-50 pt-3">
          {goal.note}
        </p>
      ) : null}
    </div>
  );
};

export default GoalCard;
