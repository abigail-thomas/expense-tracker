import React from "react";

// Grid of preset icons the user picks from (replaces the free-form emoji picker).
// `options` is the list to show (expense categories or income sources).
const IconPicker = ({ options = [], selected, onSelect }) => {
  return (
    <div className="mb-6">
      <label className="text-[13px] text-slate-800">Categories</label>

      <div className="grid grid-cols-3 gap-3 mt-2">
        {options.map((option) => {
          const isActive = selected === option.key;
          return (
            <button
              type="button"
              key={option.key}
              onClick={() => onSelect(option.key)}
              aria-pressed={isActive}
              className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-lg border transition-colors cursor-pointer ${
                isActive
                  ? "border-primary bg-purple-50 text-primary"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <option.Icon className="text-2xl" />
              <span className="text-xs font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default IconPicker;
