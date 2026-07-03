// Monogram (initials-avatar) preference options, shared by the Monogram
// component and the Settings page. Kept out of the component file so fast
// refresh works (component files should export only components).

// Curated palette — a fixed set (not a free color picker) so the white
// initials always stay legible against the background.
export const MONOGRAM_COLORS = [
  "#875cf5", // purple (default / theme)
  "#4f46e5", // indigo
  "#2563eb", // blue
  "#0891b2", // cyan
  "#059669", // emerald
  "#ca8a04", // amber
  "#ea580c", // orange
  "#dc2626", // red
  "#db2777", // pink
  "#475569", // slate
];

export const MONOGRAM_CASES = [
  { value: "upper", label: "UPPER" },
  { value: "lower", label: "lower" },
];

export const MONOGRAM_TEXT_SIZES = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export const MONOGRAM_DEFAULTS = {
  monogramColor: "#875cf5",
  monogramCase: "upper",
  monogramTextSize: "md",
};
