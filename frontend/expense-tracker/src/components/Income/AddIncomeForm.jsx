import React, { useState } from "react";
import Input from "../Inputs/Input";
import EditableCategorySelector from "../Inputs/EditableCategorySelector";
import FundSelector from "../Fund/FundSelector";
import Modal from "../Modal";
import { API_PATHS } from "../../utils/apiPaths";
import { INCOME_ICON_PALETTE } from "../../utils/transactionIcons";

// Form for adding or editing an income entry (used inside a Modal).
const AddIncomeForm = ({ onAddIncome, initialValues, submitLabel = "Add Income" }) => {
  const [income, setIncome] = useState(() => ({
    source: "",
    amount: "",
    date: "",
    icon: "",
    fund: "",
    notes: "",
    ...initialValues,
  }));

  const handleChange = (key, value) =>
    setIncome((prev) => ({ ...prev, [key]: value }));

  const handleSelectSource = ({ name, icon }) =>
    setIncome((prev) => ({ ...prev, source: name, icon }));

  return (
    <div>
      <EditableCategorySelector
        label="Income Source"
        manageTitle="Manage income sources"
        itemNoun="source"
        api={API_PATHS.INCOME_SOURCE}
        iconPalette={INCOME_ICON_PALETTE}
        max={9}
        selectBy="name"
        selectedValue={income.source}
        onSelect={handleSelectSource}
        ModalComponent={Modal}
      />

      <Input
        value={income.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount"
        placeholder=""
        type="number"
      />

      <FundSelector
        label="Deposit into"
        selectedId={income.fund}
        onSelect={(fund) => handleChange("fund", fund._id)}
      />

      <Input
        value={income.date}
        onChange={({ target }) => handleChange("date", target.value)}
        label="Date"
        placeholder=""
        type="date"
      />

      <div className="mt-3">
        <label className="text-[13px] text-slate-800 dark:text-gray-200">Notes (optional)</label>
        <div className="input-box">
          <textarea
            value={income.notes}
            onChange={({ target }) => handleChange("notes", target.value)}
            placeholder="Invoice #, client, project, etc"
            rows={2}
            className="w-full bg-transparent outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddIncome(income)}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default AddIncomeForm;
