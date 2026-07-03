import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import moment from "moment";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import Input from "../../components/Inputs/Input";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import Modal from "../../components/Modal";

import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/UserContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import uploadImage from "../../utils/uploadImage";
import { validateEmail } from "../../utils/helper";

const Profile = () => {
  useUserAuth();
  const { user, updateUser, clearUser } = useContext(UserContext);
  const navigate = useNavigate();

  // Account details form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState(null); // newly picked File, if any
  const [savingProfile, setSavingProfile] = useState(false);

  // Change password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Delete account (danger zone)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Seed the account form once the user loads (useUserAuth fetches it async).
  // Guarding on the user id means we seed once and don't clobber edits — nor
  // re-seed after a save updates the same user in context.
  const [seededId, setSeededId] = useState(null);
  const userId = user?._id || user?.id || null;
  if (user && seededId !== userId) {
    setSeededId(userId);
    setFullName(user.fullName || "");
    setEmail(user.email || "");
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Please enter your name.");
      return;
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setSavingProfile(true);
    try {
      // Keep the existing photo unless a new file was picked.
      let profileImageUrl = user?.profileImageUrl || "";
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || profileImageUrl;
      }

      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        fullName: fullName.trim(),
        email,
        profileImageUrl,
      });

      updateUser(res.data);
      setProfilePic(null); // fall back to showing the saved photo
      toast.success("Profile updated.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }

    setChangingPassword(true);
    try {
      await axiosInstance.put(API_PATHS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password updated.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const closeDeleteModal = () => {
    if (deletingAccount) return; // don't dismiss mid-request
    setShowDeleteModal(false);
    setDeletePassword("");
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();

    if (!deletePassword) {
      toast.error("Please enter your password to confirm.");
      return;
    }

    setDeletingAccount(true);
    try {
      await axiosInstance.delete(API_PATHS.AUTH.DELETE_ACCOUNT, {
        data: { password: deletePassword },
      });

      // Account and all its data are gone — tear down the session and leave.
      localStorage.clear();
      clearUser();
      toast.success("Your account has been deleted.");
      navigate("/login");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
      setDeletingAccount(false);
    }
  };

  return (
    <DashboardLayout activeMenu="Profile">
      <div className="my-5 mx-auto">
        <h2 className="text-xl font-semibold mb-5">Profile</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account details */}
          <div className="card flex flex-col">
          <h5 className="text-lg font-medium mb-4">Account details</h5>

          <form onSubmit={handleSaveProfile} className="flex flex-col grow">
            <ProfilePhotoSelector
              image={profilePic}
              setImage={setProfilePic}
              initialPreview={user?.profileImageUrl || null}
            />

            <Input
              value={fullName}
              onChange={({ target }) => setFullName(target.value)}
              label="Full Name"
              placeholder="John Doe"
              type="text"
            />
            <Input
              value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              placeholder="john@example.com"
              type="text"
            />

            {user?.createdAt && (
              <p className="text-[13px] text-slate-500 dark:text-gray-400 mb-4">
                Member since {moment(user.createdAt).format("MMMM D, YYYY")}
              </p>
            )}

            <button
              type="submit"
              className="btn-primary mt-auto"
              disabled={savingProfile}
            >
              {savingProfile ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card flex flex-col">
          <h5 className="text-lg font-medium mb-4">Change password</h5>

          <form onSubmit={handleChangePassword} className="flex flex-col grow">
            <Input
              value={currentPassword}
              onChange={({ target }) => setCurrentPassword(target.value)}
              label="Current Password"
              placeholder="Enter current password"
              type="password"
            />
            <Input
              value={newPassword}
              onChange={({ target }) => setNewPassword(target.value)}
              label="New Password"
              placeholder="Minimum of 8 characters"
              type="password"
            />
            <Input
              value={confirmPassword}
              onChange={({ target }) => setConfirmPassword(target.value)}
              label="Confirm New Password"
              placeholder="Re-enter new password"
              type="password"
            />

            <button
              type="submit"
              className="btn-primary mt-auto"
              disabled={changingPassword}
            >
              {changingPassword ? "Updating..." : "Update password"}
            </button>
          </form>
        </div>
        </div>

        {/* Danger zone */}
        <div className="card mt-6 border border-red-200 dark:border-red-900/50">
          <h5 className="text-lg font-medium text-red-600 dark:text-red-400 mb-1">Danger zone</h5>
          <p className="text-[13px] text-slate-500 dark:text-gray-400 mb-4">
            Permanently delete your account and all of your data — income,
            expenses, funds, subscriptions, credit cards and goals. This cannot
            be undone.
          </p>
          <button
            type="button"
            className="add-btn add-btn-fill !bg-red-500 !text-white !border-red-500 hover:!bg-red-600"
            onClick={() => setShowDeleteModal(true)}
          >
            Delete account
          </button>
        </div>
      </div>

      <Modal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        title="Delete account"
      >
        <form onSubmit={handleDeleteAccount}>
          <p className="text-sm text-slate-600 dark:text-gray-300 mb-4">
            This will permanently delete your account and every record tied to
            it. This action cannot be undone. Enter your password to confirm.
          </p>
          <Input
            value={deletePassword}
            onChange={({ target }) => setDeletePassword(target.value)}
            label="Password"
            placeholder="Enter your password"
            type="password"
          />
          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              className="add-btn"
              onClick={closeDeleteModal}
              disabled={deletingAccount}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-btn add-btn-fill !bg-red-500 !text-white !border-red-500 hover:!bg-red-600"
              disabled={deletingAccount}
            >
              {deletingAccount ? "Deleting..." : "Delete my account"}
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
};

export default Profile;
