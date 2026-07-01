import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { LuPlus, LuLandPlot } from "react-icons/lu";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeExpenseBarChart from "../../components/Charts/IncomeExpenseBarChart";
import GoalCard from "../../components/Goal/GoalCard";
import AddGoalForm from "../../components/Goal/AddGoalForm";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/DeleteAlert";

import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  addThousandsSeparator,
  prepareIncomeVsExpense,
  computeGoalProgress,
} from "../../utils/helper";

const Goals = () => {
  useUserAuth();

  const [goals, setGoals] = useState([]);
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });

  const fetchGoals = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.GOAL.GET_ALL);
      if (res.data) setGoals(res.data);
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [goalsRes, incomeRes, expenseRes] = await Promise.all([
          axiosInstance.get(API_PATHS.GOAL.GET_ALL),
          axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME),
          axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE),
        ]);
        if (!active) return;
        setGoals(goalsRes.data || []);
        setIncome(incomeRes.data || []);
        setExpense(expenseRes.data || []);
      } catch (error) {
        console.error("Failed to fetch goals data:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Savings-pace panel data — last 6 months of net saved.
  const pace = useMemo(() => {
    const series = prepareIncomeVsExpense(income, expense, 6);
    const totals = series.reduce(
      (acc, m) => {
        acc.income += m.income;
        acc.expense += m.expense;
        return acc;
      },
      { income: 0, expense: 0 }
    );
    const netSaved = totals.income - totals.expense;
    const months = series.length || 1;
    return {
      series,
      netSaved,
      avgPerMonth: netSaved / months,
      savingsRate: totals.income > 0 ? netSaved / totals.income : 0,
      hasData: series.some((m) => m.income > 0 || m.expense > 0),
    };
  }, [income, expense]);

  const validate = ({ name, targetAmount, targetDate }) => {
    if (!name.trim()) return "Goal name is required.";
    if (!targetAmount || isNaN(targetAmount) || Number(targetAmount) <= 0)
      return "Target amount should be a valid number greater than 0.";
    if (!targetDate) return "Target date is required.";
    return null;
  };

  const buildPayload = (goal) => ({
    name: goal.name,
    targetAmount: goal.targetAmount,
    targetDate: goal.targetDate,
    startDate: goal.startDate || undefined,
    startingAmount: goal.startingAmount === "" ? 0 : goal.startingAmount,
    icon: goal.icon,
    note: goal.note,
  });

  const handleAdd = async (goal) => {
    const error = validate(goal);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.GOAL.ADD, buildPayload(goal));
      setOpenAddModal(false);
      toast.success("Goal added successfully");
      fetchGoals();
    } catch (error) {
      console.error("Error adding goal:", error);
      toast.error(error.response?.data?.message || "Failed to add goal.");
    }
  };

  const handleUpdate = async (goal) => {
    const error = validate(goal);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      await axiosInstance.put(API_PATHS.GOAL.UPDATE(editGoal._id), buildPayload(goal));
      setEditGoal(null);
      toast.success("Goal updated successfully");
      fetchGoals();
    } catch (error) {
      console.error("Error updating goal:", error);
      toast.error(error.response?.data?.message || "Failed to update goal.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.GOAL.DELETE(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Goal deleted successfully");
      fetchGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal.");
    }
  };

  // Map a stored goal to editable form values (dates as YYYY-MM-DD).
  const toFormValues = (g) => ({
    name: g.name || "",
    targetAmount: g.targetAmount ?? "",
    targetDate: g.targetDate ? g.targetDate.slice(0, 10) : "",
    startDate: g.startDate ? g.startDate.slice(0, 10) : "",
    startingAmount: g.startingAmount ?? "",
    icon: g.icon || "home",
    note: g.note || "",
  });

  return (
    <DashboardLayout activeMenu="Goals">
      <div className="my-5 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold mb-1">Goals</h2>
            <p className="text-sm text-gray-400">
              Track how your saving is pacing toward each target.
            </p>
          </div>
          <button
            type="button"
            className="add-btn add-btn-fill flex items-center gap-1.5"
            onClick={() => setOpenAddModal(true)}
          >
            <LuPlus className="text-lg" /> Add Goal
          </button>
        </div>

        {/* Savings pace panel */}
        <div className="card">
          <h5 className="text-lg font-medium">Your savings pace</h5>
          <p className="text-xs text-gray-400 mt-0.5">
            Net saved (income − expenses) over the last 6 months.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">Avg saved / month</p>
              <p className="text-lg font-semibold text-gray-800">
                {pace.avgPerMonth < 0 ? "-$" : "$"}
                {addThousandsSeparator(Math.abs(pace.avgPerMonth))}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">Net saved (6 mo)</p>
              <p className="text-lg font-semibold text-gray-800">
                {pace.netSaved < 0 ? "-$" : "$"}
                {addThousandsSeparator(Math.abs(pace.netSaved))}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-400">Savings rate</p>
              <p className="text-lg font-semibold text-gray-800">
                {(pace.savingsRate * 100).toFixed(1)}%
              </p>
            </div>
          </div>

          {pace.hasData ? (
            <IncomeExpenseBarChart data={pace.series} height={260} />
          ) : (
            <p className="text-sm text-gray-400 mt-6">
              Not enough data yet — add income and expenses to see your pace.
            </p>
          )}
        </div>

        {/* Goal cards */}
        {goals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal._id}
                goal={goal}
                progress={computeGoalProgress(goal, income, expense)}
                onEdit={() => setEditGoal(goal)}
                onDelete={() => setOpenDeleteAlert({ show: true, data: goal._id })}
              />
            ))}
          </div>
        ) : (
          <div className="card mt-6 text-center py-12">
            <div className="w-14 h-14 mx-auto flex items-center justify-center text-2xl text-primary bg-purple-50 rounded-full">
              <LuLandPlot />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              No goals yet. Create one — e.g. "Save $4,000 by Dec 31" — to start
              tracking your progress.
            </p>
          </div>
        )}

        <Modal
          isOpen={openAddModal}
          onClose={() => setOpenAddModal(false)}
          title="Add Goal"
        >
          <AddGoalForm onAddGoal={handleAdd} />
        </Modal>

        <Modal
          isOpen={!!editGoal}
          onClose={() => setEditGoal(null)}
          title="Edit Goal"
        >
          {editGoal && (
            <AddGoalForm
              onAddGoal={handleUpdate}
              initialValues={toFormValues(editGoal)}
              submitLabel="Save Changes"
            />
          )}
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Goal"
        >
          <DeleteAlert
            content="Are you sure you want to delete this goal?"
            onDelete={() => handleDelete(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Goals;
