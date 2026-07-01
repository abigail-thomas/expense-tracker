import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import IncomeOverview from "../../components/Income/IncomeOverview";
import IncomeList from "../../components/Income/IncomeList";
import AddIncomeForm from "../../components/Income/AddIncomeForm";
import RecentIncomeWithChart from "../../components/Dashboard/RecentIncomeWithChart";
import RecurringIncomeTrends from "../../components/Dashboard/RecurringIncomeTrends";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/DeleteAlert";

import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  getRecentByDays,
  prepareIncomeTrends,
  detectRecurringIncome,
} from "../../utils/helper";

const Income = () => {
  useUserAuth();

  const [incomeData, setIncomeData] = useState([]);
  const [openAddIncomeModal, setOpenAddIncomeModal] = useState(false);
  const [editIncome, setEditIncome] = useState(null);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });

  const fetchIncomeDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);
      if (response.data) setIncomeData(response.data);
    } catch (error) {
      console.error("Failed to fetch income:", error);
    }
  };

  // Shared validation for add + edit. Returns an error message, or null if valid.
  const validateIncome = ({ source, amount, date, fund }) => {
    if (!source.trim()) return "Source is required.";
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return "Amount should be a valid number greater than 0.";
    if (!date) return "Date is required.";
    if (!fund) return "Select which fund to deposit into.";
    return null;
  };

  const buildPayload = ({ source, amount, date, icon, fund, notes }) => ({
    source,
    amount,
    date,
    icon,
    fund,
    notes,
  });

  const handleAddIncome = async (income) => {
    const error = validateIncome(income);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await axiosInstance.post(API_PATHS.INCOME.ADD_INCOME, buildPayload(income));
      setOpenAddIncomeModal(false);
      toast.success("Income added successfully");
      fetchIncomeDetails();
    } catch (error) {
      console.error("Error adding income:", error);
      toast.error("Failed to add income.");
    }
  };

  const handleUpdateIncome = async (income) => {
    const error = validateIncome(income);
    if (error) {
      toast.error(error);
      return;
    }

    try {
      await axiosInstance.put(
        API_PATHS.INCOME.UPDATE_INCOME(editIncome._id),
        buildPayload(income)
      );
      setEditIncome(null);
      toast.success("Income updated successfully");
      fetchIncomeDetails();
    } catch (error) {
      console.error("Error updating income:", error);
      toast.error(error.response?.data?.message || "Failed to update income.");
    }
  };

  // Map a stored income (with populated fund) to editable form values.
  const toFormValues = (i) => ({
    source: i.source || "",
    amount: i.amount ?? "",
    date: i.date ? i.date.slice(0, 10) : "",
    icon: i.icon || "",
    fund: i.fund?._id || i.fund || "",
    notes: i.notes || "",
  });

  const deleteIncome = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.INCOME.DELETE_INCOME(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Income deleted successfully");
      fetchIncomeDetails();
    } catch (error) {
      console.error("Error deleting income:", error);
      toast.error("Failed to delete income.");
    }
  };

  const handleDownloadIncomeDetails = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.INCOME.DOWNLOAD_INCOME, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "income_details.xlsx");
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading income details:", error);
      toast.error("Failed to download income details.");
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME);
        if (active && response.data) setIncomeData(response.data);
      } catch (error) {
        console.error("Failed to fetch income:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout activeMenu="Income">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <IncomeOverview
            transactions={incomeData}
            onAddIncome={() => setOpenAddIncomeModal(true)}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RecentIncomeWithChart
              data={getRecentByDays(incomeData, 60).slice(0, 4)}
              totalIncome={incomeData.reduce((sum, i) => sum + (i.amount || 0), 0)}
            />

            <RecurringIncomeTrends
              trends={prepareIncomeTrends(incomeData)}
              recurring={detectRecurringIncome(incomeData)}
            />
          </div>

          <IncomeList
            transactions={incomeData}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onDownload={handleDownloadIncomeDetails}
            onEdit={(income) => setEditIncome(income)}
          />
        </div>

        <Modal
          isOpen={openAddIncomeModal}
          onClose={() => setOpenAddIncomeModal(false)}
          title="Add Income"
        >
          <AddIncomeForm onAddIncome={handleAddIncome} />
        </Modal>

        <Modal
          isOpen={!!editIncome}
          onClose={() => setEditIncome(null)}
          title="Edit Income"
        >
          {editIncome && (
            <AddIncomeForm
              onAddIncome={handleUpdateIncome}
              initialValues={toFormValues(editIncome)}
              submitLabel="Save Changes"
            />
          )}
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Income"
        >
          <DeleteAlert
            content="Are you sure you want to delete this income entry?"
            onDelete={() => deleteIncome(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Income;
