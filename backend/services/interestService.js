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

// The "Savings" fund earns auto-interest via the tiered rates above even when
// no per-fund APY is set. Matched by name OR category (case-insensitive) so it
// works whether the fund was seeded with category "Savings" or just named
// "Savings" in the UI (where the category/notes field is often left blank).
export const isTieredSavings = (fund) =>
  [fund.category, fund.name].some(
    (v) => (v || "").trim().toLowerCase() === "savings"
  );

// Mongo filter matching the same rule, for querying eligible funds.
const SAVINGS_MATCH = {
  $or: [
    { category: { $regex: /^\s*savings\s*$/i } },
    { name: { $regex: /^\s*savings\s*$/i } },
  ],
};

// Interest earned on `balance` held for `days` at a flat annual rate. `apy` is
// a *percent* (e.g. 3.65 for 3.65% APY) as stored on the fund. APY is an
// effective annual rate, so a partial period is (1 + apy)^(days/365) - 1.
export const computeFlatInterest = (balance, days, apy) =>
  balance * (Math.pow(1 + apy / 100, days / 365) - 1);

// Format a percent for display, trimming trailing zeros (5.00 -> "5",
// 0.10 -> "0.1", 3.65 -> "3.65").
const fmtPct = (n) => Number(n.toFixed(2)).toString();

// Short, human-readable interest-rate label for a fund, or null if it earns no
// interest. Mirrors the eligibility/rate logic in postMonthlyInterest so the UI
// badge stays in sync with what actually accrues: a per-fund APY shows a single
// rate (like a CD); the tiered "Savings" fund shows each tier's rate.
export const describeInterest = (fund) => {
  if (fund.apy > 0) return `${fmtPct(fund.apy)}% APY`;
  if (isTieredSavings(fund)) {
    const rates = SAVINGS_INTEREST_TIERS.map((t) => `${fmtPct(t.apy * 100)}%`);
    return `${rates.join(" / ")} APY`;
  }
  return null;
};

// Verbose, tooltip-friendly breakdown of a fund's interest, or null if none.
// A per-fund APY reads as a single line; the tiered "Savings" fund spells out
// each tier ("5% on the first $1,000, 0.1% above"). Maturity is appended by the
// UI, which owns date formatting.
export const describeInterestDetail = (fund) => {
  if (fund.apy > 0) return `${fmtPct(fund.apy)}% APY`;
  if (isTieredSavings(fund)) {
    let lower = 0;
    const parts = SAVINGS_INTEREST_TIERS.map((t) => {
      const rate = `${fmtPct(t.apy * 100)}%`;
      let scope;
      if (t.upTo === Infinity) {
        scope = lower === 0 ? "APY" : "above";
      } else if (lower === 0) {
        scope = `on the first $${t.upTo.toLocaleString("en-US")}`;
      } else {
        scope = `from $${lower.toLocaleString("en-US")} to $${t.upTo.toLocaleString("en-US")}`;
      }
      lower = t.upTo;
      return `${rate} ${scope}`;
    });
    return parts.join(", ");
  }
  return null;
};

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

  // Number of days this fund accrues interest in this month, capped at its
  // maturity date: full month if open-ended or maturing later; 0 once it has
  // matured before the month began; prorated in the maturity month itself.
  const accrualDays = (fund) => {
    if (!fund.maturityDate) return daysInMonth;
    const m = new Date(fund.maturityDate);
    if (m <= monthStart) return 0;
    if (m >= nextMonthStart) return daysInMonth;
    return Math.min(daysInMonth, m.getUTCDate());
  };

  // Eligible funds: any fund with a positive per-fund APY, plus the tiered
  // "Savings" fund (matched by name or category).
  const funds = await Fund.find({
    $or: [{ apy: { $gt: 0 } }, ...SAVINGS_MATCH.$or],
  });
  const posted = [];

  for (const fund of funds) {
    if (fund.balance <= 0) continue;

    const days = accrualDays(fund);
    if (days <= 0) continue; // matured — no more interest

    // Idempotency guard — don't double-post if the scheduler ticks again this
    // month (or the server restarts).
    const already = await Income.findOne({
      userId: fund.userId,
      fund: fund._id,
      source: "Interest",
      date: { $gte: monthStart, $lt: nextMonthStart },
    });
    if (already) continue;

    // A per-fund APY earns a flat rate on the whole balance; otherwise fall
    // back to the tiered Savings rates.
    const rawInterest =
      fund.apy > 0
        ? computeFlatInterest(fund.balance, days, fund.apy)
        : isTieredSavings(fund)
        ? computeTieredInterest(fund.balance, days)
        : 0;
    const amount = Math.round(rawInterest * 100) / 100;
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
