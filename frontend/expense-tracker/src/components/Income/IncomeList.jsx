import React from "react";
import { LuDownload } from "react-icons/lu";
import moment from "moment";
import TransactionInfoCard from "../Cards/TransactionInfoCard";

// List of all income entries with download + per-item delete.
const IncomeList = ({ transactions, onDelete, onDownload, onEdit }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">Income Sources</h5>
        <button className="card-btn" onClick={onDownload}>
          <LuDownload className="text-base" /> Download
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2">
        {transactions?.map((income) => (
          <TransactionInfoCard
            key={income._id}
            title={income.source}
            icon={income.icon}
            date={moment.utc(income.date).format("Do MMM YYYY")}
            amount={income.amount}
            notes={income.notes}
            fundName={income.fund?.name}
            type="income"
            onEdit={onEdit ? () => onEdit(income) : undefined}
            onDelete={() => onDelete(income._id)}
          />
        ))}
        {(!transactions || transactions.length === 0) && (
          <p className="text-sm text-gray-400 mt-4">No income sources yet.</p>
        )}
      </div>
    </div>
  );
};

export default IncomeList;
