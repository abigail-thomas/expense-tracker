import React, { useState } from "react";
import { LuDownload } from "react-icons/lu";
import moment from "moment";
import TransactionInfoCard from "../Cards/TransactionInfoCard";

// How many entries to show before the user expands the full list.
const PREVIEW_COUNT = 5;

// List of all expense entries with download + per-item delete. Shows only the
// most recent few by default, with a toggle to reveal the rest.
const ExpenseList = ({ transactions, onDelete, onDownload, onEdit }) => {
  const [showAll, setShowAll] = useState(false);

  const all = transactions || [];
  const visible = showAll ? all : all.slice(0, PREVIEW_COUNT);
  const hasMore = all.length > PREVIEW_COUNT;

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">All Expenses</h5>
        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {visible.map((expense) => (
          <TransactionInfoCard
            key={expense._id}
            title={expense.name || expense.category}
            icon={expense.icon}
            date={moment.utc(expense.date).format("Do MMM YYYY")}
            amount={expense.amount}
            notes={expense.notes}
            method={expense.method}
            fundName={expense.fund?.name}
            cardName={expense.creditCard?.name}
            recurring={!!expense.subscription}
            type="expense"
            onEdit={onEdit ? () => onEdit(expense) : undefined}
            onDelete={() => onDelete(expense._id)}
          />
        ))}
        {all.length === 0 && (
          <p className="text-sm text-gray-400 mt-4">No expenses yet.</p>
        )}
      </div>

      {hasMore && (
        <button
          type="button"
          className="text-sm font-medium text-primary hover:underline mt-4"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "Show less" : `Show all (${all.length})`}
        </button>
      )}
    </div>
  );
};

export default ExpenseList;
