import moment from "moment";
import { getIconOption } from "./transactionIcons";

// Basic email format validation
export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// Return initials from a full name, e.g. "Jane Doe" -> "JD"
export const getInitials = (name) => {
  if (!name) return "";
  const words = name.trim().split(" ");
  const initials = words.slice(0, 2).map((w) => w[0]).join("");
  return initials.toUpperCase();
};

// Format a number with thousands separators, always showing 2 decimals,
// e.g. 12345.6 -> "12,345.60", 1000 -> "1,000.00", -36.519999999999996 -> "-36.52"
export const addThousandsSeparator = (num) => {
  if (num === null || num === undefined || isNaN(num)) return "";
  // Round to exactly 2 decimals; toFixed always keeps trailing zeros.
  const [integerPart, fractionalPart] = Number(num).toFixed(2).split(".");
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${formattedInteger}.${fractionalPart}`;
};

// Given a credit card's `dueDay` (day of month, 1-31), work out the next
// occurrence of that day and how many days away it is. Returns null when no
// due day is set. `daysUntil` is 0 on the due day itself. The due day is
// clamped to each month's length, so a dueDay of 31 lands on Feb 28/29.
export const getCreditCardDueInfo = (dueDay) => {
  const day = Number(dueDay);
  if (!Number.isInteger(day) || day < 1 || day > 31) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Last day of the given month (month is 0-indexed).
  const clampToMonth = (year, month) =>
    Math.min(day, new Date(year, month + 1, 0).getDate());

  const year = now.getFullYear();
  const month = now.getMonth();
  const dueThisMonth = clampToMonth(year, month);

  let due;
  if (dueThisMonth >= now.getDate()) {
    due = new Date(year, month, dueThisMonth);
  } else {
    due = new Date(year, month + 1, clampToMonth(year, month + 1));
  }

  const daysUntil = Math.round((due - now) / (24 * 60 * 60 * 1000));
  return { due, daysUntil };
};

// Prepare expense transactions for the bar chart on the Expense page.
// Group by the chosen icon category (e.g. "Appointments") and sum amounts,
// rather than showing one bar per expense title.
export const prepareExpenseBarChartData = (data = []) => {
  const byIcon = new Map();

  data.forEach((item) => {
    const iconKey = item?.icon || "other";
    const label = getIconOption(iconKey)?.label || "Other";
    const amount = Number(item?.amount) || 0;

    const existing = byIcon.get(iconKey);
    if (existing) {
      existing.amount += amount;
    } else {
      byIcon.set(iconKey, { category: label, amount, icon: iconKey });
    }
  });

  return Array.from(byIcon.values());
};

// Prepare income transactions for the bar chart on the Income page
export const prepareIncomeBarChartData = (data = []) => {
  const bySource = new Map();
  data.forEach((item) => {
    const source = item?.source || "Other";
    const amount = Number(item?.amount) || 0;
    const existing = bySource.get(source);
    if (existing) {
      existing.amount += amount;
    } else {
      bySource.set(source, { source, amount, icon:
        item?.icon });
    }
  });
  return Array.from(bySource.values());
};

// Prepare expense transactions for the line chart on the dashboard
export const prepareExpenseLineChartData = (data = []) => {
  // Consolidate all expenses on the same calendar day into a single point,
  // summing their amounts. Keep the earliest transaction's category as a label.
  const byDay = new Map();
  data.forEach((item) => {
    const key = moment.utc(item?.date).format("YYYY-MM-DD");
    const bucket = byDay.get(key);
    if (bucket) {
      bucket.amount += item?.amount || 0;
    } else {
      byDay.set(key, {
        date: item?.date,
        month: moment.utc(item?.date).format("Do MMM"),
        amount: item?.amount || 0,
        category: item?.category,
      });
    }
  });
  return [...byDay.values()]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(({ month, amount, category }) => ({ month, amount, category }));
};

// Filter a transaction list to entries within the last N days.
export const getRecentByDays = (list = [], days = 30) => {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return list.filter((t) => new Date(t?.date).getTime() >= cutoff);
};

// Monthly income totals for the last `months` calendar months (oldest -> newest).
export const prepareIncomeTrends = (incomeList = [], months = 6) => {
  const now = new Date();
  const buckets = [];
  const indexByKey = new Map();
  for (let i = months - 1; i >= 0; i--) {
    // Build each month bucket in UTC so it lines up with the UTC month keys
    // computed for the transactions below, regardless of local timezone.
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    indexByKey.set(key, buckets.length);
    buckets.push({ month: moment.utc(d).format("MMM YYYY"), amount: 0 });
  }
  incomeList.forEach((inc) => {
    const d = new Date(inc?.date);
    // Dates are stored as UTC midnight of the entered calendar day; read UTC
    // parts so a day doesn't slip into the previous month in local time.
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const idx = indexByKey.get(key);
    if (idx !== undefined) buckets[idx].amount += inc?.amount || 0;
  });
  return buckets;
};

// Monthly income vs. expense totals for the last `months` calendar months
// (oldest -> newest). Returns { month, income, expense, net } per bucket, where
// net = income - expense. Uses the same UTC month-bucketing as
// prepareIncomeTrends so entered calendar days don't slip across month
// boundaries in local time.
export const prepareIncomeVsExpense = (incomeList = [], expenseList = [], months = 12) => {
  const now = new Date();
  const buckets = [];
  const indexByKey = new Map();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    indexByKey.set(key, buckets.length);
    buckets.push({ month: moment.utc(d).format("MMM YYYY"), income: 0, expense: 0, net: 0 });
  }

  const addTo = (list, field) => {
    list.forEach((item) => {
      const d = new Date(item?.date);
      const key = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
      const idx = indexByKey.get(key);
      if (idx !== undefined) buckets[idx][field] += Number(item?.amount) || 0;
    });
  };
  addTo(incomeList, "income");
  addTo(expenseList, "expense");

  buckets.forEach((b) => {
    b.net = b.income - b.expense;
  });
  return buckets;
};

// Classify a month's balance from its income vs. expense. A month counts as
// "balanced" when the gap is within 10% of that month's income (or, with no
// income, when nothing was spent). Otherwise it's a surplus (income > expense)
// or a deficit. Returns { key, label } for badge display.
export const balanceStatus = (income = 0, expense = 0) => {
  const net = income - expense;
  const tolerance = income * 0.1;
  if (Math.abs(net) <= tolerance) return { key: "balanced", label: "Balanced" };
  return net > 0
    ? { key: "surplus", label: "Surplus" }
    : { key: "deficit", label: "Deficit" };
};

// Apply the Insights "account" filter to a transaction list. `account` is one
// of "all", "fund:<id>" or "card:<id>"; `kind` is "income" or "expense".
//  - "all": list unchanged.
//  - "fund:<id>": income or debit-expense tied to that fund (credit expenses,
//    which have no fund, are excluded).
//  - "card:<id>": only credit expenses charged to that card; income (which is
//    never tied to a card) yields an empty list.
export const filterByAccount = (list = [], account = "all", kind = "expense") => {
  if (!account || account === "all") return list;
  const [type, id] = account.split(":");

  if (type === "fund") {
    return list.filter((t) => {
      if (kind === "expense" && t?.method === "credit") return false;
      return (t?.fund?._id || t?.fund) === id;
    });
  }
  if (type === "card") {
    if (kind !== "expense") return [];
    return list.filter(
      (t) => t?.method === "credit" && (t?.creditCard?._id || t?.creditCard) === id
    );
  }
  return list;
};

// Income sources received in 2+ distinct months, with stats, sorted by total.
export const detectRecurringIncome = (incomeList = []) => {
  const bySource = new Map();
  incomeList.forEach((inc) => {
    const d = new Date(inc?.date);
    const monthKey = `${d.getUTCFullYear()}-${d.getUTCMonth()}`;
    const key = inc?.source || "Unknown";
    const stat =
      bySource.get(key) ||
      { source: key, icon: inc?.icon || "", total: 0, payments: 0, months: new Set() };
    stat.total += inc?.amount || 0;
    stat.payments += 1;
    stat.months.add(monthKey);
    if (!stat.icon && inc?.icon) stat.icon = inc.icon;
    bySource.set(key, stat);
  });
  return [...bySource.values()]
    .filter((s) => s.months.size >= 2)
    .map((s) => ({
      source: s.source,
      icon: s.icon,
      payments: s.payments,
      months: s.months.size,
      total: s.total,
      average: s.total / s.payments,
    }))
    .sort((a, b) => b.total - a.total);
};
