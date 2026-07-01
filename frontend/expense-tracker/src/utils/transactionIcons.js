import {
  LuUtensils,
  LuFuel,
  LuShoppingCart,
  LuCalendarCheck,
  LuPlane,
  LuEllipsis,
  LuCoffee,
  LuMonitor,
  LuCode,
  LuBanknote,
  LuLaptop,
  LuGlobe,
  LuHeadset,
  LuBriefcase,
  LuWallet,
  LuDollarSign,
  LuGift,
  LuBuilding2,
  LuLandmark,
  LuPiggyBank,
  LuCreditCard,
  LuStar,
  LuTvMinimalPlay,
  LuDumbbell,
  LuMusic,
  LuLayoutGrid,
  LuHouse,
  LuCog,
} from "react-icons/lu";

// Preset icons used across the app. `key` is stored on a record's `icon` field
// (a stable string); `Icon` is the component used to render it everywhere.

// Fixed expense categories (not user-editable).
export const EXPENSE_ICON_OPTIONS = [
  { key: "food", label: "Food", Icon: LuUtensils },
  { key: "gas", label: "Gas", Icon: LuFuel },
  { key: "groceries", label: "Groceries", Icon: LuShoppingCart },
  { key: "appointments", label: "Appointments", Icon: LuCalendarCheck },
  { key: "travel", label: "Travel", Icon: LuPlane },
  { key: "other", label: "Other", Icon: LuEllipsis },
];

// Category icons for subscriptions (recurring expenses).
export const SUBSCRIPTION_ICON_OPTIONS = [
  { key: "streaming", label: "Streaming Service", Icon: LuTvMinimalPlay },
  { key: "gym", label: "Gym", Icon: LuDumbbell },
  { key: "music", label: "Music & Podcasts", Icon: LuMusic },
  { key: "ecommerce", label: "E-commerce", Icon: LuLaptop },
  { key: "apps", label: "Apps", Icon: LuLayoutGrid },
  { key: "rent", label: "Rent", Icon: LuHouse },
  { key: "utilities", label: "Utilities", Icon: LuCog },
  { key: "other", label: "Other", Icon: LuEllipsis },
];

// Icon palette a user can pick from when creating/editing their own income source.
export const INCOME_ICON_PALETTE = [
  { key: "coffee", label: "Coffee", Icon: LuCoffee },
  { key: "monitor", label: "Monitor", Icon: LuMonitor },
  { key: "code", label: "Code", Icon: LuCode },
  { key: "banknote", label: "Banknote", Icon: LuBanknote },
  { key: "laptop", label: "Laptop", Icon: LuLaptop },
  { key: "globe", label: "Web", Icon: LuGlobe },
  { key: "headset", label: "Support", Icon: LuHeadset },
  { key: "briefcase", label: "Business", Icon: LuBriefcase },
  { key: "building", label: "Company", Icon: LuBuilding2 },
  { key: "wallet", label: "Wallet", Icon: LuWallet },
  { key: "dollar", label: "Cash", Icon: LuDollarSign },
  { key: "gift", label: "Gift", Icon: LuGift },
  { key: "other", label: "Other", Icon: LuEllipsis },
];

// Icon palette a user can pick from when creating/editing a fund (account).
export const FUND_ICON_PALETTE = [
  { key: "landmark", label: "Bank", Icon: LuLandmark },
  { key: "piggybank", label: "Savings", Icon: LuPiggyBank },
  { key: "wallet", label: "Wallet", Icon: LuWallet },
  { key: "creditcard", label: "Card", Icon: LuCreditCard },
  { key: "banknote", label: "Cash", Icon: LuBanknote },
  { key: "other", label: "Other", Icon: LuEllipsis },
];

// Icon palette a user can pick from when creating/editing a credit card.
export const CREDIT_ICON_PALETTE = [
  { key: "creditcard", label: "Card", Icon: LuCreditCard },
  { key: "wallet", label: "Wallet", Icon: LuWallet },
  { key: "gift", label: "Rewards", Icon: LuGift },
  { key: "star", label: "Points", Icon: LuStar },
  { key: "banknote", label: "Cash", Icon: LuBanknote },
  { key: "other", label: "Other", Icon: LuEllipsis },
];

const ALL_ICON_OPTIONS = [
  ...EXPENSE_ICON_OPTIONS,
  ...SUBSCRIPTION_ICON_OPTIONS,
  ...INCOME_ICON_PALETTE,
  ...FUND_ICON_PALETTE,
  ...CREDIT_ICON_PALETTE,
];

// Look up a preset by its stored key (searches expense categories + income palette).
// Returns undefined for unknown/empty keys.
export const getIconOption = (key) =>
  ALL_ICON_OPTIONS.find((option) => option.key === key);
