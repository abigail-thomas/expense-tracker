import React from "react";
import moment from "moment";
import {
  LuUtensils,
  LuTrash2,
  LuPencil,
  LuPlay,
  LuPause,
  LuZap,
  LuCalendarClock,
} from "react-icons/lu";
import { getIconOption } from "../../utils/transactionIcons";
import { addThousandsSeparator } from "../../utils/helper";
import { getFrequencyLabel } from "../../utils/data";

// A single subscription row: icon, name, cadence + next charge, account, and
// per-item actions (charge now, pause/resume, edit, delete).
const SubscriptionRow = ({ sub, onEdit, onDelete, onToggleActive, onChargeNow }) => {
  const iconOption = getIconOption(sub.icon);
  const PresetIcon = iconOption?.Icon;
  const accountName = sub.fund?.name || sub.creditCard?.name;

  return (
    <div className="group relative flex items-start gap-3 sm:gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60">
      <div className="shrink-0 w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full">
        {PresetIcon ? <PresetIcon /> : sub.icon ? (
          <span className="text-2xl">{sub.icon}</span>
        ) : (
          <LuUtensils />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Title + amount on one line; amount stays pinned to the right. */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2 flex-wrap">
            <p className="text-sm text-gray-700 font-medium">{sub.name}</p>
            {!sub.active && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">
                Paused
              </span>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-50 text-red-500">
            <h6 className="text-xs font-medium whitespace-nowrap">
              - ${addThousandsSeparator(sub.amount)}
            </h6>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
          {getFrequencyLabel(sub.frequency)}
          {sub.active && sub.nextChargeDate && (
            <>
              <span className="hidden md:inline">
                {" "}
                · next {moment.utc(sub.nextChargeDate).format("Do MMM YYYY")}
              </span>
              <LuCalendarClock
                className="inline md:hidden text-gray-400"
                title={`Next charge ${moment
                  .utc(sub.nextChargeDate)
                  .format("Do MMM YYYY")}`}
              />
            </>
          )}
        </p>

        {/* Method / account + inline note on the left; actions on the right. */}
        <div className="flex items-end justify-between gap-2 mt-1">
          <div className="min-w-0">
            {(sub.method || accountName || sub.notes) && (
              <p className="text-xs text-gray-500 capitalize">
                {[sub.method, accountName].filter(Boolean).join(" · ")}
                {sub.notes && (
                  <>
                    {(sub.method || accountName) && " — "}
                    <span className="italic normal-case">{sub.notes}</span>
                  </>
                )}
              </p>
            )}
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              className="text-gray-400 hover:text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => onChargeNow(sub)}
              aria-label="Charge now"
              title="Charge now"
            >
              <LuZap className="text-base" />
            </button>
            <button
              className="text-gray-400 hover:text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => onToggleActive(sub)}
              aria-label={sub.active ? "Pause" : "Resume"}
              title={sub.active ? "Pause" : "Resume"}
            >
              {sub.active ? <LuPause className="text-base" /> : <LuPlay className="text-base" />}
            </button>
            <button
              className="text-gray-400 hover:text-primary opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => onEdit(sub)}
              aria-label="Edit"
            >
              <LuPencil className="text-base" />
            </button>
            <button
              className="text-gray-400 hover:text-red-500 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => onDelete(sub._id)}
              aria-label="Delete"
            >
              <LuTrash2 className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// List of all subscriptions with per-item actions.
const SubscriptionList = ({ subscriptions, onEdit, onDelete, onToggleActive, onChargeNow }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">All Subscriptions</h5>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {subscriptions?.map((sub) => (
          <SubscriptionRow
            key={sub._id}
            sub={sub}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            onChargeNow={onChargeNow}
          />
        ))}
        {(!subscriptions || subscriptions.length === 0) && (
          <p className="text-sm text-gray-400 mt-4">No subscriptions yet.</p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionList;
