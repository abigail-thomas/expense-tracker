import {
  LuLayoutDashboard,
  LuHandCoins,
  LuWalletMinimal,
  LuChartColumnBig,
  LuRepeat,
  LuLandPlot,
  LuLogOut,
} from "react-icons/lu";

// Items shown in the dashboard side menu
export const SIDE_MENU_DATA = [
  {
    id: "01",
    label: "Dashboard",
    icon: LuLayoutDashboard,
    path: "/dashboard",
  },
  {
    id: "02",
    label: "Income",
    icon: LuWalletMinimal,
    path: "/income",
  },
  {
    id: "03",
    label: "Expense",
    icon: LuHandCoins,
    path: "/expense",
  },
  {
    id: "04",
    label: "Subscriptions",
    icon: LuRepeat,
    path: "/subscriptions",
  },
  {
    id: "05",
    label: "Insights",
    icon: LuChartColumnBig,
    path: "/insights",
  },
  {
    id: "06",
    label: "Goals",
    icon: LuLandPlot,
    path: "/goals",
  },
  {
    id: "07",
    label: "Logout",
    icon: LuLogOut,
    path: "logout",
  },
];

// Selectable billing frequencies for a subscription. `perMonth` normalizes each
// to a monthly figure for the estimated-monthly-total summary (weekly/biweekly
// approximated from a 52-week year).
export const SUBSCRIPTION_FREQUENCIES = [
  { value: "weekly", label: "Weekly", perMonth: 52 / 12 },
  { value: "biweekly", label: "Biweekly", perMonth: 26 / 12 },
  { value: "monthly", label: "Monthly", perMonth: 1 },
  { value: "quarterly", label: "Quarterly", perMonth: 1 / 3 },
  { value: "annually", label: "Annually", perMonth: 1 / 12 },
];

// Human label for a stored frequency value.
export const getFrequencyLabel = (value) =>
  SUBSCRIPTION_FREQUENCIES.find((f) => f.value === value)?.label || value;
