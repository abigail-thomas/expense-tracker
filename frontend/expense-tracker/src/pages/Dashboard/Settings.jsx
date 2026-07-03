import React, { useContext, useState } from "react";
import toast from "react-hot-toast";
import { LuSun, LuMoon, LuCheck } from "react-icons/lu";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import Monogram from "../../components/Monogram";
import {
  MONOGRAM_COLORS,
  MONOGRAM_CASES,
  MONOGRAM_TEXT_SIZES,
  MONOGRAM_DEFAULTS,
} from "../../utils/monogram";

import { useUserAuth } from "../../hooks/useUserAuth";
import { UserContext } from "../../context/UserContext";
import { ThemeContext } from "../../context/ThemeContext";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";

const Settings = () => {
  useUserAuth();
  const { user, updateUser } = useContext(UserContext);
  const { theme, setTheme } = useContext(ThemeContext);

  // Monogram (avatar) preferences — edited locally, saved on demand.
  const [monogramColor, setMonogramColor] = useState(
    MONOGRAM_DEFAULTS.monogramColor
  );
  const [monogramCase, setMonogramCase] = useState(
    MONOGRAM_DEFAULTS.monogramCase
  );
  const [monogramTextSize, setMonogramTextSize] = useState(
    MONOGRAM_DEFAULTS.monogramTextSize
  );
  const [savingMonogram, setSavingMonogram] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);

  // Seed the monogram controls once the user loads (same guard as Profile).
  const [seededId, setSeededId] = useState(null);
  const userId = user?._id || user?.id || null;
  if (user && seededId !== userId) {
    setSeededId(userId);
    setMonogramColor(user.monogramColor || MONOGRAM_DEFAULTS.monogramColor);
    setMonogramCase(user.monogramCase || MONOGRAM_DEFAULTS.monogramCase);
    setMonogramTextSize(
      user.monogramTextSize || MONOGRAM_DEFAULTS.monogramTextSize
    );
  }

  // Theme applies instantly (ThemeContext) and is persisted so it follows the
  // user across devices. Local state stays the source of truth if the save
  // fails, so the UI never fights the toggle.
  const handleSelectTheme = async (next) => {
    if (next === theme || savingTheme) return;
    setTheme(next);
    setSavingTheme(true);
    try {
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        theme: next,
      });
      updateUser(res.data);
    } catch {
      toast.error("Couldn't save your theme, but it's applied on this device.");
    } finally {
      setSavingTheme(false);
    }
  };

  const handleSaveMonogram = async () => {
    setSavingMonogram(true);
    try {
      const res = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, {
        monogramColor,
        monogramCase,
        monogramTextSize,
      });
      updateUser(res.data);
      toast.success("Avatar updated.");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Something went wrong. Please try again."
      );
    } finally {
      setSavingMonogram(false);
    }
  };

  const themeOptions = [
    { value: "light", label: "Light", icon: LuSun },
    { value: "dark", label: "Dark", icon: LuMoon },
  ];

  return (
    <DashboardLayout activeMenu="Settings">
      <div className="my-5 mx-auto">
        <h2 className="text-xl font-semibold mb-5">Settings</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Appearance / theme */}
          <div className="card">
            <h5 className="text-lg font-medium mb-1">Appearance</h5>
            <p className="text-[13px] text-slate-500 dark:text-gray-400 mb-4">
              Choose how the app looks. This is saved to your account.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {themeOptions.map((opt) => {
                const selected = theme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectTheme(opt.value)}
                    className={`flex items-center justify-center gap-2 py-3 rounded-lg border text-sm font-medium transition-colors ${
                      selected
                        ? "border-primary bg-purple-50 text-primary dark:bg-purple-500/15"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <opt.icon className="text-lg" />
                    {opt.label}
                    {selected && <LuCheck className="text-base" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Monogram / avatar */}
          <div className="card">
            <h5 className="text-lg font-medium mb-1">Avatar</h5>
            <p className="text-[13px] text-slate-500 dark:text-gray-400 mb-4">
              Customize the initials avatar shown when you don't have a profile
              photo.
            </p>

            <div className="flex items-center gap-4 mb-5">
              {/* Live preview */}
              <Monogram
                name={user?.fullName || ""}
                color={monogramColor}
                textCase={monogramCase}
                textSize={monogramTextSize}
              />
              <div className="text-[13px] text-slate-500 dark:text-gray-400">
                Live preview
                {user?.profileImageUrl && (
                  <p className="mt-1">
                    You currently have a photo set, so this avatar is hidden
                    until you remove it.
                  </p>
                )}
              </div>
            </div>

            {/* Color */}
            <label className="text-[13px] text-slate-800 dark:text-gray-300">
              Color
            </label>
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {MONOGRAM_COLORS.map((color) => {
                const selected = color === monogramColor;
                return (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select color ${color}`}
                    onClick={() => setMonogramColor(color)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                      selected
                        ? "ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800"
                        : ""
                    }`}
                    style={{ backgroundColor: color }}
                  >
                    {selected && <LuCheck className="text-white text-sm" />}
                  </button>
                );
              })}
            </div>

            {/* Case */}
            <label className="text-[13px] text-slate-800 dark:text-gray-300">
              Case
            </label>
            <div className="grid grid-cols-2 gap-3 mt-2 mb-4">
              {MONOGRAM_CASES.map((opt) => {
                const selected = monogramCase === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMonogramCase(opt.value)}
                    className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selected
                        ? "border-primary bg-purple-50 text-primary dark:bg-purple-500/15"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Text size */}
            <label className="text-[13px] text-slate-800 dark:text-gray-300">
              Text size
            </label>
            <div className="grid grid-cols-3 gap-3 mt-2 mb-5">
              {MONOGRAM_TEXT_SIZES.map((opt) => {
                const selected = monogramTextSize === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMonogramTextSize(opt.value)}
                    className={`py-2 rounded-lg border text-sm font-medium transition-colors ${
                      selected
                        ? "border-primary bg-purple-50 text-primary dark:bg-purple-500/15"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleSaveMonogram}
              disabled={savingMonogram}
            >
              {savingMonogram ? "Saving..." : "Save avatar"}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
