import React, { useMemo } from "react";
import { LuPlus } from "react-icons/lu";
import { addThousandsSeparator } from "../../utils/helper";
import { SUBSCRIPTION_FREQUENCIES } from "../../utils/data";

// Header for the Subscriptions page: an estimated monthly total across all
// active subscriptions (each normalized to a monthly figure) + an Add button.
const SubscriptionOverview = ({ subscriptions, onAddSubscription }) => {
  const { monthlyTotal, activeCount } = useMemo(() => {
    const perMonthByFreq = Object.fromEntries(
      SUBSCRIPTION_FREQUENCIES.map((f) => [f.value, f.perMonth])
    );
    const active = (subscriptions || []).filter((s) => s.active);
    const total = active.reduce(
      (sum, s) => sum + (Number(s.amount) || 0) * (perMonthByFreq[s.frequency] || 1),
      0
    );
    return { monthlyTotal: total, activeCount: active.length };
  }, [subscriptions]);

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-lg font-medium">Subscriptions</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Recurring expenses that auto-charge their account on schedule.
          </p>
        </div>

        <button className="add-btn" onClick={onAddSubscription}>
          <LuPlus className="text-lg" />
          Add Subscription
        </button>
      </div>

      <div className="mt-5">
        <p className="text-xs text-gray-400">
          Estimated monthly cost{activeCount ? ` (${activeCount} active)` : ""}
        </p>
        <h4 className="text-2xl font-medium text-gray-800 dark:text-gray-200 mt-1">
          ${addThousandsSeparator(monthlyTotal)}
        </h4>
      </div>
    </div>
  );
};

export default SubscriptionOverview;
