import Fund from "../models/Fund.js";
import Income from "../models/Income.js";

// Auto-interest for savings funds.
//
// For now the rate structure is hardcoded (tiered APY, applied to the portion
// of the balance that falls within each tier). This mirrors a real tiered
// savings account: a high rate on a small base balance, a low rate above it.
//
// FUTURE: store these tiers per-fund so users can configure their own rates,
// and replace SAVINGS_INTEREST_TIERS below with the fund's own config.
export const SAVINGS_INTEREST_TIERS = [
  { upTo: 1000, apy: 0.05 }, // first $1,000 at 5.00% APY
  { upTo: Infinity, apy: 0.001 }, // remainder at 0.10% APY
];

// Funds with this category earn auto-interest (the default seeded "Savings"
// fund has category "Savings"). Kept as the eligibility rule until per-fund
// interest config exists.
const INTEREST_FUND_CATEGORY = "Savings";

// Interest earned on `balance` held for `days`, applying each tier's APY only
// to the slice of the balance within that tier. APY is an *effective annual*
// rate, so a partial period is (1 + apy)^(days/365) - 1.
export const computeTieredInterest = (
  balance,
  days,
  tiers = SAVINGS_INTEREST_TIERS
) => {
  let remaining = balance;
  let lower = 0;
  let interest = 0;

  for (const tier of tiers) {
    if (remaining <= 0) break;
    const portion = Math.min(remaining, tier.upTo - lower);
    if (portion > 0) {
      interest += portion * (Math.pow(1 + tier.apy, days / 365) - 1);
      remaining -= portion;
    }
    lower = tier.upTo;
  }

  return interest;
};

// True when `now` (in UTC) falls on the final calendar day of its month.
export const isLastDayOfMonth = (now = new Date()) => {
  const daysInMonth = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)
  ).getUTCDate();
  return now.getUTCDate() === daysInMonth;
};

// Post one month's interest into every eligible savings fund, based on its
// current balance and the number of days in `now`'s month. Idempotent: skips
// any fund that already has an "Interest" income posted within this month.
// Returns the list of Income documents it created.
export const postMonthlyInterest = async (now = new Date()) => {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const monthStart = new Date(Date.UTC(year, month, 1));
  const nextMonthStart = new Date(Date.UTC(year, month + 1, 1));
  // Date interest is credited: last day of the month, at noon UTC so it can't
  // slip into an adjacent month when read back in another timezone.
  const postDate = new Date(Date.UTC(year, month, daysInMonth, 12, 0, 0));

  const funds = await Fund.find({ category: INTEREST_FUND_CATEGORY });
  const posted = [];

  for (const fund of funds) {
    if (fund.balance <= 0) continue;

    // Idempotency guard — don't double-post if the scheduler ticks again this
    // month (or the server restarts).
    const already = await Income.findOne({
      userId: fund.userId,
      fund: fund._id,
      source: "Interest",
      date: { $gte: monthStart, $lt: nextMonthStart },
    });
    if (already) continue;

    const amount = Math.round(computeTieredInterest(fund.balance, daysInMonth) * 100) / 100;
    if (amount <= 0) continue;

    const income = await Income.create({
      userId: fund.userId,
      icon: "banknote",
      source: "Interest",
      amount,
      fund: fund._id,
      notes: `Auto interest for ${monthStart.toLocaleString("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      })}`,
      date: postDate,
    });

    await Fund.updateOne({ _id: fund._id }, { $inc: { balance: amount } });
    posted.push(income);
  }

  return posted;
};

// Start the background scheduler. Checks hourly and posts interest on the last
// day of the month (the idempotency guard means the repeated hourly checks that
// day still post exactly once). Also checks once at startup.
//
// NOTE: this only fires while the server is running. If the process is down for
// the entire final day of a month, that month's interest won't post. A
// production deployment would use a durable scheduler (e.g. a cron service).
export const startInterestScheduler = () => {
  const CHECK_INTERVAL_MS = 60 * 60 * 1000; // hourly

  const tick = async () => {
    try {
      if (!isLastDayOfMonth()) return;
      const posted = await postMonthlyInterest();
      if (posted.length > 0) {
        console.log(`Auto-interest posted to ${posted.length} savings fund(s).`);
      }
    } catch (err) {
      console.error("Interest scheduler error:", err.message);
    }
  };

  tick();
  setInterval(tick, CHECK_INTERVAL_MS);
};
