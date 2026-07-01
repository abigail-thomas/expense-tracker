import React, { useState } from "react";
import Input from "../Inputs/Input";
import IconPicker from "../IconPicker";
import { GOAL_ICON_PALETTE } from "../../utils/transactionIcons";

// Form for adding or editing a savings goal (used inside a Modal).
const AddGoalForm = ({ onAddGoal, initialValues, submitLabel = "Add Goal" }) => {
  const [goal, setGoal] = useState(() => ({
    name: "",
    targetAmount: "",
    targetDate: "",
    startDate: "",
    startingAmount: "",
    icon: "home",
    note: "",
    ...initialValues,
  }));

  const handleChange = (key, value) =>
    setGoal((prev) => ({ ...prev, [key]: value }));

  return (
    <div>
      <IconPicker
        options={GOAL_ICON_PALETTE}
        selected={goal.icon}
        onSelect={(iconKey) => handleChange("icon", iconKey)}
      />

      <Input
        value={goal.name}
        onChange={({ target }) => handleChange("name", target.value)}
        label="Goal name"
        placeholder="Save $4k, Emergency fund, Vacation, etc"
        type="text"
      />

      <Input
        value={goal.targetAmount}
        onChange={({ target }) => handleChange("targetAmount", target.value)}
        label="Target amount"
        placeholder="4000"
        type="number"
      />

      <Input
        value={goal.targetDate}
        onChange={({ target }) => handleChange("targetDate", target.value)}
        label="Target date"
        placeholder=""
        type="date"
      />

      <Input
        value={goal.startingAmount}
        onChange={({ target }) => handleChange("startingAmount", target.value)}
        label="Already saved (optional)"
        placeholder="0"
        type="number"
      />

      <Input
        value={goal.startDate}
        onChange={({ target }) => handleChange("startDate", target.value)}
        label="Count savings from (optional — defaults to today)"
        placeholder=""
        type="date"
      />

      <div className="mt-3">
        <label className="text-[13px] text-slate-800">Note (optional)</label>
        <div className="input-box">
          <textarea
            value={goal.note}
            onChange={({ target }) => handleChange("note", target.value)}
            placeholder="What is this goal for?"
            rows={2}
            className="w-full bg-transparent outline-none resize-none"
          />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          className="add-btn add-btn-fill"
          onClick={() => onAddGoal(goal)}
        >
          {submitLabel}
        </button>
      </div>
    </div>
  );
};

export default AddGoalForm;
