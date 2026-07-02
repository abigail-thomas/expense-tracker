import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import ExpenseOverview from "../../components/Expense/ExpenseOverview";
import ExpenseList from "../../components/Expense/ExpenseList";
import AddExpenseForm from "../../components/Expense/AddExpenseForm";
import Last30DaysExpenses from "../../components/Dashboard/Last30DaysExpenses";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/DeleteAlert";

import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { getRecentByDays } from "../../utils/helper";

const Expense = () => {
  useUserAuth();

  const [expenseData, setExpenseData] = useState([]);
  const [openAddExpenseModal, setOpenAddExpenseModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });

  const fetchExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
      if (response.data) setExpenseData(response.data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    }
  };

  // Shared validation for add + edit. Returns an error message, or null if valid.
  const validateExpense = ({ category, amount, date, method, fund, creditCard }) => {
    if (!category.trim()) return "Category is required.";
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return "Amount should be a valid number greater than 0.";
    if (!date) return "Date is required.";
    if (method === "debit" && !fund) return "Select which fund to withdraw from.";
    if (method === "credit" && !creditCard)
      return "Select which credit card to charge.";
    return null;
  };

  const buildPayload = ({ category, name, amount, date, icon, method, fund, creditCard, notes }) => ({
    category,
    name,
    amount,
    date,
    icon,
    method,
    fund: fund || null,
    creditCard: creditCard || null,
    notes,
  });

  const handleAddExpense = async (expense) => {
    const error = validateExpense(expense);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.EXPENSE.ADD_EXPENSE, buildPayload(expense));
      setOpenAddExpenseModal(false);
      toast.success("Expense added successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.error("Error adding expense:", error);
      toast.error("Failed to add expense.");
    }
  };

  const handleUpdateExpense = async (expense) => {
    const error = validateExpense(expense);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await axiosInstance.put(
        API_PATHS.EXPENSE.UPDATE_EXPENSE(editExpense._id),
        buildPayload(expense)
      );
      setEditExpense(null);
      toast.success("Expense updated successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.error("Error updating expense:", error);
      toast.error(error.response?.data?.message || "Failed to update expense.");
    }
  };

  // Map a stored expense (with populated fund/card) to editable form values.
  const toFormValues = (e) => ({
    category: e.category || "",
    name: e.name || "",
    amount: e.amount ?? "",
    date: e.date ? e.date.slice(0, 10) : "",
    icon: e.icon || "",
    method: e.method || "debit",
    fund: e.fund?._id || e.fund || "",
    creditCard: e.creditCard?._id || e.creditCard || "",
    notes: e.notes || "",
  });

  const deleteExpense = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.EXPENSE.DELETE_EXPENSE(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Expense deleted successfully");
      fetchExpenseDetails();
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense.");
    }
  };

  const handleDownloadExpenseDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.EXPENSE.DOWNLOAD_EXPENSE, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "expense_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading expense details:", error);
      toast.error("Failed to download expense details.");
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE);
        if (active && response.data) setExpenseData(response.data);
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout activeMenu="Expense">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <ExpenseOverview
            transactions={expenseData}
            onAddExpense={() => setOpenAddExpenseModal(true)}
          />

          <Last30DaysExpenses data={getRecentByDays(expenseData, 30)} />

          <ExpenseList
            transactions={expenseData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadExpenseDetails}
            onEdit={(expense) => setEditExpense(expense)}
          />
        </div>

        <Modal
          isOpen={openAddExpenseModal}
          onClose={() => setOpenAddExpenseModal(false)}
          title="Add Expense"
        >
          <AddExpenseForm onAddExpense={handleAddExpense} />
        </Modal>

        <Modal
          isOpen={!!editExpense}
          onClose={() => setEditExpense(null)}
          title="Edit Expense"
        >
          {editExpense && (
            <AddExpenseForm
              onAddExpense={handleUpdateExpense}
              initialValues={toFormValues(editExpense)}
              submitLabel="Save Changes"
            />
          )}
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Expense"
        >
          <DeleteAlert
            content="Are you sure you want to delete this expense entry?"
            onDelete={() => deleteExpense(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Expense;
