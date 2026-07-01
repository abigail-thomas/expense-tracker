import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import SubscriptionOverview from "../../components/Subscription/SubscriptionOverview";
import SubscriptionList from "../../components/Subscription/SubscriptionList";
import AddSubscriptionForm from "../../components/Subscription/AddSubscriptionForm";
import Modal from "../../components/Modal";
import DeleteAlert from "../../components/DeleteAlert";

import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const Subscriptions = () => {
  useUserAuth();

  const [subscriptions, setSubscriptions] = useState([]);
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editSubscription, setEditSubscription] = useState(null);
  const [openDeleteAlert, setOpenDeleteAlert] = useState({ show: false, data: null });

  const fetchSubscriptions = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SUBSCRIPTION.GET_ALL);
      if (response.data) setSubscriptions(response.data);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
    }
  };

  // Shared validation for add + edit. Returns an error message, or null if valid.
  const validate = ({ name, amount, method, fund, creditCard }) => {
    if (!name.trim()) return "Name is required.";
    if (!amount || isNaN(amount) || Number(amount) <= 0)
      return "Amount should be a valid number greater than 0.";
    if (method === "debit" && !fund) return "Select which fund to charge from.";
    if (method === "credit" && !creditCard) return "Select which credit card to charge.";
    return null;
  };

  const buildPayload = (sub) => ({
    name: sub.name,
    amount: sub.amount,
    frequency: sub.frequency,
    startDate: sub.startDate || undefined,
    icon: sub.icon,
    method: sub.method,
    fund: sub.fund || null,
    creditCard: sub.creditCard || null,
    notes: sub.notes,
    active: sub.active,
  });

  const handleAdd = async (sub) => {
    const error = validate(sub);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.SUBSCRIPTION.ADD, buildPayload(sub));
      setOpenAddModal(false);
      toast.success("Subscription added successfully");
      fetchSubscriptions();
    } catch (error) {
      console.error("Error adding subscription:", error);
      toast.error(error.response?.data?.message || "Failed to add subscription.");
    }
  };

  const handleUpdate = async (sub) => {
    const error = validate(sub);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      await axiosInstance.put(
        API_PATHS.SUBSCRIPTION.UPDATE(editSubscription._id),
        buildPayload(sub)
      );
      setEditSubscription(null);
      toast.success("Subscription updated successfully");
      fetchSubscriptions();
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast.error(error.response?.data?.message || "Failed to update subscription.");
    }
  };

  // Map a stored subscription (with populated fund/card) to editable form values.
  const toFormValues = (s) => ({
    name: s.name || "",
    amount: s.amount ?? "",
    frequency: s.frequency || "monthly",
    startDate: s.startDate ? s.startDate.slice(0, 10) : "",
    icon: s.icon || "",
    method: s.method || "debit",
    fund: s.fund?._id || s.fund || "",
    creditCard: s.creditCard?._id || s.creditCard || "",
    notes: s.notes || "",
    active: s.active ?? true,
  });

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(API_PATHS.SUBSCRIPTION.DELETE(id));
      setOpenDeleteAlert({ show: false, data: null });
      toast.success("Subscription deleted successfully");
      fetchSubscriptions();
    } catch (error) {
      console.error("Error deleting subscription:", error);
      toast.error("Failed to delete subscription.");
    }
  };

  const handleToggleActive = async (sub) => {
    try {
      await axiosInstance.put(API_PATHS.SUBSCRIPTION.UPDATE(sub._id), {
        active: !sub.active,
      });
      toast.success(sub.active ? "Subscription paused" : "Subscription resumed");
      fetchSubscriptions();
    } catch (error) {
      console.error("Error toggling subscription:", error);
      toast.error("Failed to update subscription.");
    }
  };

  const handleChargeNow = async (sub) => {
    try {
      await axiosInstance.post(API_PATHS.SUBSCRIPTION.CHARGE_NOW(sub._id));
      toast.success(`Charged ${sub.name}`);
      fetchSubscriptions();
    } catch (error) {
      console.error("Error charging subscription:", error);
      toast.error(error.response?.data?.message || "Failed to charge subscription.");
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.SUBSCRIPTION.GET_ALL);
        if (active && response.data) setSubscriptions(response.data);
      } catch (error) {
        console.error("Failed to fetch subscriptions:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DashboardLayout activeMenu="Subscriptions">
      <div className="my-5 mx-auto">
        <div className="grid grid-cols-1 gap-6">
          <SubscriptionOverview
            subscriptions={subscriptions}
            onAddSubscription={() => setOpenAddModal(true)}
          />

          <SubscriptionList
            subscriptions={subscriptions}
            onEdit={(sub) => setEditSubscription(sub)}
            onDelete={(id) => setOpenDeleteAlert({ show: true, data: id })}
            onToggleActive={handleToggleActive}
            onChargeNow={handleChargeNow}
          />
        </div>

        <Modal
          isOpen={openAddModal}
          onClose={() => setOpenAddModal(false)}
          title="Add Subscription"
        >
          <AddSubscriptionForm onAddSubscription={handleAdd} />
        </Modal>

        <Modal
          isOpen={!!editSubscription}
          onClose={() => setEditSubscription(null)}
          title="Edit Subscription"
        >
          {editSubscription && (
            <AddSubscriptionForm
              onAddSubscription={handleUpdate}
              initialValues={toFormValues(editSubscription)}
              submitLabel="Save Changes"
            />
          )}
        </Modal>

        <Modal
          isOpen={openDeleteAlert.show}
          onClose={() => setOpenDeleteAlert({ show: false, data: null })}
          title="Delete Subscription"
        >
          <DeleteAlert
            content="Are you sure you want to delete this subscription? Past charges will remain."
            onDelete={() => handleDelete(openDeleteAlert.data)}
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default Subscriptions;
