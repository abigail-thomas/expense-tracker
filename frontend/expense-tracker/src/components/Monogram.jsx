import React from "react";
import { getInitials } from "../utils/helper";
import { MONOGRAM_DEFAULTS } from "../utils/monogram";

// Text-size classes tuned for the standard w-20 (80px) avatar.
const SIZE_TEXT = { sm: "text-xl", md: "text-2xl", lg: "text-3xl" };

// Initials-based avatar shown when a user has no profile photo. Color, case,
// and text size come from the user's saved preferences.
const Monogram = ({
  name,
  color = MONOGRAM_DEFAULTS.monogramColor,
  textCase = MONOGRAM_DEFAULTS.monogramCase,
  textSize = MONOGRAM_DEFAULTS.monogramTextSize,
  className = "",
}) => {
  const base = getInitials(name || ""); // already uppercased
  const initials = textCase === "lower" ? base.toLowerCase() : base;

  return (
    <div
      className={`w-20 h-20 flex items-center justify-center rounded-full text-white font-medium ${
        SIZE_TEXT[textSize] || SIZE_TEXT.md
      } ${className}`}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
};

export default Monogram;
