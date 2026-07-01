import Subscription from "../models/Subscription.js";
import { createExpenseWithEffects } from "./expenseService.js";

// Cap on how many missed periods a single subscription can backfill in one run.
// Guards against a runaway loop if a start date is set far in the past.
const MAX_CATCHUP = 60;

// Advance `fromDate` by exactly one billing period of `frequency`, in UTC.
// Month-based periods clamp the day to the target month's length, so a charge
// anchored on the 31st lands on the last day of shorter months (e.g. Feb 28).
export const computeNextChargeDate = (fromDate, frequency) => {
  const d = new Date(fromDate);

  if (frequency === "weekly" || frequency === "biweekly") {
    const days = frequency === "weekly" ? 7 : 14;
    return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
  }

  const monthsToAdd =
    frequency === "quarterly" ? 3 : frequency === "annually" ? 12 : 1; // default monthly

  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const targetMonthDays = new Date(
    Date.UTC(year, month + monthsToAdd + 1, 0)
  ).getUTCDate();
  const clampedDay = Math.min(day, targetMonthDays);

  return new Date(
    Date.UTC(
      year,
      month + monthsToAdd,
      clampedDay,
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    )
  );
};

// Post a single charge for `sub` dated `chargeDate`: create the expense (which
// applies the fund/card balance effect) and advance the subscription's schedule.
// Persists and returns the created Expense.
export const chargeSubscriptionOnce = async (sub, chargeDate = new Date()) => {
  const expense = await createExpenseWithEffects({
    userId: sub.userId,
    icon: sub.icon,
    category: sub.name,
    amount: sub.amount,
    method: sub.method,
    fund: sub.fund,
    creditCard: sub.creditCard,
    notes: sub.notes,
    date: chargeDate,
    subscription: sub._id,
  });

  sub.lastChargedAt = chargeDate;
  sub.nextChargeDate = computeNextChargeDate(chargeDate, sub.frequency);
  await sub.save();

  return expense;
};

// Post every charge that is due for all active subscriptions. For each one,
// backfill one expense per elapsed period (capped at MAX_CATCHUP) until its
// next charge date is in the future. Persisting after each period means a
// repeated tick (or a server restart) never double-charges. Returns the number
// of expenses posted.
export const runDueSubscriptions = async (now = new Date()) => {
  const due = await Subscription.find({
    active: true,
    nextChargeDate: { $lte: now },
  });

  let posted = 0;
  for (const sub of due) {
    let guard = 0;
    while (sub.nextChargeDate <= now && guard < MAX_CATCHUP) {
      await chargeSubscriptionOnce(sub, sub.nextChargeDate);
      posted += 1;
      guard += 1;
    }
    if (guard >= MAX_CATCHUP && sub.nextChargeDate <= now) {
      console.warn(
        `Subscription ${sub._id} hit the ${MAX_CATCHUP}-period backfill cap; ` +
          `remaining periods will post on the next run.`
      );
    }
  }

  return posted;
};

// Background scheduler. Checks hourly (plus once at startup) and posts any due
// charges. The per-period backfill covers downtime, so a missed period is
// caught up on the next boot.
//
// NOTE: only fires while the server is running. A production deployment would
// use a durable scheduler (e.g. a cron service).
export const startSubscriptionScheduler = () => {
  const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly

  const tick = async () => {
    try {
      const posted = await runDueSubscriptions();
      if (posted > 0) {
        console.log(`Auto-charged ${posted} subscription payment(s).`);
      }
    } catch (err) {
      console.error("Subscription scheduler error:", err.message);
    }
  };

  tick();
  setInterval(tick, CHECK_INTERVAL_MS);
};
