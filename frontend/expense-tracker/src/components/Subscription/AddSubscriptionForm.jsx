import React, { useState } from "react";
import Input from "../Inputs/Input";
import EditableCategorySelector from "../Inputs/EditableCategorySelector";
import FundSelector from "../Fund/FundSelector";
import CreditCardSelector from "../CreditCard/CreditCardSelector";
import Modal from "../Modal";
import { API_PATHS } from "../../utils/apiPaths";
import { SUBSCRIPTION_ICON_OPTIONS } from "../../utils/transactionIcons";
import { SUBSCRIPTION_FREQUENCIES } from "../../utils/data";

// Form for adding or editing a subscription (used inside a Modal).
const AddSubscriptionForm = ({
  onAddSubscription,
  initialValues,
  submitLabel = "Add Subscription",
}) => {
  const [sub, setSub] = useState(() => ({
    name: "",
    amount: "",
    frequency: "monthly",
    startDate: "",
    icon: "",
    method: "debit",
    fund: "",
    creditCard: "",
    notes: "",
    active: true,
    ...initialValues,
  }));

  const handleChange = (key, value) =>
    setSub((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <EditableCategorySelector
        label="Category"
        manageTitle="Manage subscription categories"
        itemNoun="category"
        api={API_PATHS.SUBSCRIPTION_CATEGORY}
        iconPalette={SUBSCRIPTION_ICON_OPTIONS}
        max={9}
        selectBy="icon"
        selectedValue={sub.icon}
        onSelect={({ icon }) => handleChange("icon", icon)}
        ModalComponent={Modal}
      />

      <Input
        value={sub.name}
        onChange={({ target }) => handleChange("name", target.value)}
        label="Name"
        placeholder="Netflix, Rent, Gym, etc"
        type="text"
      />

      <Input
        value={sub.amount}
        onChange={({ target }) => handleChange("amount", target.value)}
        label="Amount"
        placeholder=""
        type="number"
      />

      <div className="mt-3">
        <label className="text-[13px] text-slate-800 dark:text-gray-200">Billing frequency</label>
        <div className="input-box">
          <select
            value={sub.frequency}
            onChange={({ target }) => handleChange("frequency", target.value)}
            className="w-full bg-transparent outline-none"
          >
            {SUBSCRIPTION_FREQUENCIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="my-4">
        <label className="text-[13px] text-slate-800 dark:text-gray-200">Charge from</label>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {["debit", "credit"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleChange("method", m)}
              aria-pressed={sub.method === m}
              className={`py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors cursor-pointer ${
                sub.method === m
                  ? "border-primary bg-purple-50 dark:bg-purple-500/10 text-primary"
                  : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/40"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {sub.method === "debit" ? (
        <FundSelector
          label="Withdraw from"
          selectedId={sub.fund}
          onSelect={(fund) => handleChange("fund", fund._id)}
        />
      ) : (
        <CreditCardSelector
          label="Charge to"
          selectedId={sub.creditCard}
          onSelect={(card) => handleChange("creditCard", card._id)}
        />
      )}

      <Input
        value={sub.startDate}
        onChange={({ target }) => handleChange("startDate", target.value)}
        label="First charge date"
        placeholder=""
        type="date"
      />

      <div className="mt-3">
        <label className="text-[13px] text-slate-800 dark:text-gray-200">Notes (optional)</label>
        <div className="input-box">
          <textarea
            value={sub.notes}
            onChange={({ target }) => handleChange("notes", target.value)}
            placeholder="Plan tier, account, etc"
            rows={3}
            className="w-full bg-transparent outline-none resize-none"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 mt-4 text-[13px] text-slate-800 dark:text-gray-200 cursor-pointer">
        <input
          type="checkbox"
          checked={sub.active}
          onChange={({ target }) => handleChange("active", target.checked)}
          className="accent-primary"
        />
        Active (auto-charge on schedule)
      </label>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddSubscription(sub)}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default AddSubscriptionForm;
