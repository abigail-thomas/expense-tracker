import React from "react";

// Summary card: icon + label + value, used for Balance / Income / Expense totals.
const InfoCard = ({ icon, label, value, color }) => {
  return (
    <div className="flex items-center gap-3 md:gap-6 bg-white dark:bg-gray-800 p-3 md:p-6 rounded-2xl shadow-md shadow-gray-100 dark:shadow-none border border-gray-200/50 dark:border-gray-700">
      <div
        className={`w-10 h-10 md:w-14 md:h-14 shrink-0 flex items-center justify-center text-[20px] md:text-[26px] text-white ${color} rounded-full drop-shadow-xl`}
      >
        {icon}
      </div>
      <div>
        <h6 className="text-sm text-gray-500 dark:text-gray-400 mb-0.5 md:mb-1">{label}</h6>
        <span className="text-xl md:text-[22px] font-semibold">${value}</span>
      </div>
    </div>
  );
};

export default InfoCard;
