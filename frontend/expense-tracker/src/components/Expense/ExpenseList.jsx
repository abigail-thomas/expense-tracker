import React from "react";
import { LuDownload } from "react-icons/lu";
import moment from "moment";
import TransactionInfoCard from "../Cards/TransactionInfoCard";

// List of all expense entries with download + per-item delete.
const ExpenseList = ({ transactions, onDelete, onDownload, onEdit }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">All Expenses</h5>
        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transactions?.map((expense) => (
          <TransactionInfoCard
            key={expense._id}
            title={expense.category}
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
        {(!transactions || transactions.length === 0) && (
          <p className="text-sm text-gray-400 mt-4">No expenses yet.</p>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
