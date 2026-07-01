import React, { useState } from "react";
import Input from "../Inputs/Input";
import IconPicker from "../IconPicker";
import FundSelector from "../Fund/FundSelector";
import CreditCardSelector from "../CreditCard/CreditCardSelector";
import { EXPENSE_ICON_OPTIONS } from "../../utils/transactionIcons";

// Form for adding or editing an expense entry (used inside a Modal).
const AddExpenseForm = ({
  onAddExpense,
  initialValues,
  submitLabel = "Add Expense",
}) => {
  const [expense, setExpense] = useState(() => ({
    category: "",
    amount: "",
    date: "",
    icon: "",
    method: "debit",
    fund: "",
    creditCard: "",
    notes: "",
    ...initialValues,
  }));

  const handleChange = (key, value) =>
    setExpense((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <IconPicker
        options={EXPENSE_ICON_OPTIONS}
        selected={expense.icon}
        onSelect={(iconKey) => handleChange("icon", iconKey)}
      />

      <Input
        value={expense.category}
        onChange={({ target }) => handleChange("category", target.value)}
        label="Category"
        placeholder="Rent, Groceries, etc"
        type="text"
      />

      <Input
        value={expense.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount"
        placeholder=""
        type="number"
      />

      <div className="my-4">
        <label className="text-[13px] text-slate-800">Paid with</label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {["debit", "credit"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleChange("method", m)}
              aria-pressed={expense.method === m}
              className={`py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors cursor-pointer ${
                expense.method === m
                  ? "border-primary bg-purple-50 text-primary"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {expense.method === "debit" ? (
        <FundSelector
          label="Withdraw from"
          selectedId={expense.fund}
          onSelect={(fund) => handleChange("fund", fund._id)}
        />
      ) : (
        <CreditCardSelector
          label="Charge to"
          selectedId={expense.creditCard}
          onSelect={(card) => handleChange("creditCard", card._id)}
        />
      )}

      <Input
        value={expense.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Date"
        placeholder=""
        type="date"
      />

      <div className="mt-3">
        <label className="text-[13px] text-slate-800">Notes (optional)</label>
        <div className="input-box">
          <textarea
            value={expense.notes}
            onChange={({ target }) => handleChange("notes", target.value)}
            placeholder="Description, will be paid back, etc"
            rows={3}
            className="w-full bg-transparent outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddExpense(expense)}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default AddExpenseForm;
