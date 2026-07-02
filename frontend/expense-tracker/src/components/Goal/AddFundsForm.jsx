import React, { useState } from "react";
import Input from "../Inputs/Input";

// Form for depositing into (or withdrawing from) a goal envelope.
// A negative amount records a withdrawal.
const AddFundsForm = ({ onAddFunds, submitLabel = "Add Funds" }) => {
  const [funds, setFunds] = useState({ amount: "", date: "", note: "" });

  const handleChange = (key, value) =>
    setFunds((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <Input
        value={funds.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount (use a negative number to withdraw)"
        placeholder="500"
        type="number"
      />

      <Input
        value={funds.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Date (optional — defaults to today)"
        placeholder=""
        type="date"
      />

      <div className="mt-3">
        <label className="text-[13px] text-slate-800">Note (optional)</label>
        <div className="input-box">
          <textarea
            value={funds.note}
            onChange={({ target }) => handleChange("note", target.value)}
            placeholder="e.g. Paycheck, tax refund"
            rows={2}
            className="w-full bg-transparent outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddFunds(funds)}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default AddFundsForm;
