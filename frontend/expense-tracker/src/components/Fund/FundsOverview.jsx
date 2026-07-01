import React, { useEffect, useState } from "react";
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuCheck,
  LuX,
  LuEllipsis,
  LuInfo,
} from "react-icons/lu";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { FUND_ICON_PALETTE, getIconOption } from "../../utils/transactionIcons";
import { addThousandsSeparator } from "../../utils/helper";

const DEFAULT_ICON = FUND_ICON_PALETTE[0].key;

// Maturity badge text/state for a fund, or null if it has no maturity date.
// Compares by calendar day (UTC) so a same-day maturity reads as "matured".
const maturityInfo = (fund) => {
  if (!fund.maturityDate) return null;
  const iso = fund.maturityDate.slice(0, 10);
  const [y, m, d] = iso.split("-").map(Number);
  const label = `${m}/${d}/${y}`;
  const todayUTC = new Date();
  const today = Date.UTC(
    todayUTC.getUTCFullYear(),
    todayUTC.getUTCMonth(),
    todayUTC.getUTCDate()
  );
  const matured = Date.UTC(y, m - 1, d) <= today;
  return { matured, label };
};

// Small "i" icon with a hover/focus tooltip. Tailwind-only (no tooltip lib):
// the bubble is shown via a named group so it doesn't react to hovering the row.
// `detail` is the rate breakdown (green); `maturity` is the CD maturity (amber).
// Both render on a white card, matching the inline colors they replaced.
const InfoTip = ({ detail, maturity }) => {
  const aria = [
    detail,
    maturity && `${maturity.matured ? "Matured" : "Matures"} ${maturity.label}`,
  ]
    .filter(Boolean)
    .join(", ");
  return (
    <span className="group/tip relative ml-1.5 inline-flex align-middle">
      <LuInfo
        tabIndex={0}
        aria-label={aria}
        className="text-sm text-gray-400 cursor-help outline-none hover:text-gray-500"
      />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-normal opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100 group-focus-within/tip:opacity-100"
      >
        {detail && (
          <span className="block font-medium text-emerald-600">{detail}</span>
        )}
        {maturity && (
          <span className="block text-amber-600">
            {maturity.matured ? "Matured" : "Matures"} {maturity.label}
          </span>
        )}
      </span>
    </span>
  );
};

// Dashboard panel that lists the user's funds with balances and lets them
// set balances / add / rename / delete funds. Calls `onChange` after any
// mutation so the parent can refresh dashboard totals.
const FundsOverview = ({ onChange, reloadSignal }) => {
  const [funds, setFunds] = useState([]);
  // editor: null when closed; otherwise { id?, name, icon, balance }.
  const [editor, setEditor] = useState(null);

  const loadFunds = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.FUND.GET_ALL);
      setFunds(res.data || []);
    } catch (error) {
      console.error("Failed to load funds:", error);
    }
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await axiosInstance.get(API_PATHS.FUND.GET_ALL);
        if (active) setFunds(res.data || []);
      } catch (error) {
        console.error("Failed to load funds:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, [reloadSignal]);

  const total = funds.reduce((sum, f) => sum + (f.balance || 0), 0);

  const openAdd = () =>
    setEditor({
      name: "",
      category: "",
      icon: DEFAULT_ICON,
      balance: "",
      apy: "",
      maturityDate: "",
    });
  const openEdit = (fund) =>
    setEditor({
      id: fund._id,
      name: fund.name,
      category: fund.category || "",
      icon: fund.icon || DEFAULT_ICON,
      balance: String(fund.balance ?? 0),
      apy: fund.apy ? String(fund.apy) : "",
      // ISO date -> "YYYY-MM-DD" for the <input type="date">.
      maturityDate: fund.maturityDate ? fund.maturityDate.slice(0, 10) : "",
    });
  const closeEditor = () => setEditor(null);

  const saveEditor = async () => {
    const name = editor.name.trim();
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    if (editor.balance !== "" && isNaN(Number(editor.balance))) {
      toast.error("Balance must be a number.");
      return;
    }
    if (editor.apy !== "" && (isNaN(Number(editor.apy)) || Number(editor.apy) < 0)) {
      toast.error("APY must be a non-negative number.");
      return;
    }
    const balance = editor.balance === "" ? 0 : Number(editor.balance);
    const apy = editor.apy === "" ? 0 : Number(editor.apy);
    const maturityDate = editor.maturityDate; // "" clears it on the backend

    try {
      const category = editor.category.trim();
      if (editor.id) {
        await axiosInstance.put(API_PATHS.FUND.UPDATE(editor.id), {
          name,
          category,
          icon: editor.icon,
          balance,
          apy,
          maturityDate,
        });
        toast.success("Fund updated");
      } else {
        await axiosInstance.post(API_PATHS.FUND.ADD, {
          name,
          category,
          icon: editor.icon,
          balance,
          apy,
          maturityDate,
        });
        toast.success("Fund added");
      }
      closeEditor();
      await loadFunds();
      onChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save fund.");
    }
  };

  const deleteFund = async (fund) => {
    try {
      await axiosInstance.delete(API_PATHS.FUND.DELETE(fund._id));
      toast.success("Fund deleted");
      await loadFunds();
      onChange?.();
    } catch {
      toast.error("Failed to delete fund.");
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">Funds</h5>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1 text-xs font-medium text-primary bg-purple-50 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <LuPlus /> Add Fund
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {funds.map((fund) => {
          const option = getIconOption(fund.icon);
          const maturity = maturityInfo(fund);
          // Interest rate + maturity live in the tooltip only (not on the row).
          const hasTip = Boolean(fund.interestDetail || maturity);
          return (
            <div
              key={fund._id}
              className="group flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-gray-100/60"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center text-lg text-gray-800 bg-gray-100 rounded-full">
                  {option ? <option.Icon /> : <LuEllipsis />}
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium flex items-center">
                    {fund.name}
                    {hasTip && (
                      <InfoTip detail={fund.interestDetail} maturity={maturity} />
                    )}
                  </p>
                  {fund.category && (
                    <p className="text-xs text-gray-400">{fund.category}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-800">
                  ${addThousandsSeparator(fund.balance || 0)}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openEdit(fund)}
                    aria-label={`Edit ${fund.name}`}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-primary cursor-pointer"
                  >
                    <LuPencil className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFund(fund)}
                    aria-label={`Delete ${fund.name}`}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-red-500 cursor-pointer"
                  >
                    <LuTrash2 className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {funds.length === 0 && (
          <p className="text-sm text-gray-400">No funds yet.</p>
        )}
      </div>

      {funds.length > 0 && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500">Total</p>
          <p className="text-base font-bold text-gray-800">
            ${addThousandsSeparator(total)}
          </p>
        </div>
      )}

      {editor && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-[13px] font-medium text-slate-800 mb-2">
            {editor.id ? "Edit fund" : "New fund"}
          </p>

          <input
            type="text"
            value={editor.name}
            onChange={(e) => setEditor({ ...editor, name: e.target.value })}
            placeholder="Fund name"
            className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none mb-3"
          />

          <input
            type="text"
            value={editor.category}
            onChange={(e) => setEditor({ ...editor, category: e.target.value })}
            placeholder="Notes (optional)"
            className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none mb-3"
          />

          <input
            type="number"
            value={editor.balance}
            onChange={(e) => setEditor({ ...editor, balance: e.target.value })}
            placeholder="Balance"
            className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none mb-3"
          />

          <div className="relative mb-3">
            <input
              type="number"
              step="0.01"
              min="0"
              value={editor.apy}
              onChange={(e) => setEditor({ ...editor, apy: e.target.value })}
              placeholder="APY (e.g. 3.65)"
              className="w-full text-sm bg-white rounded px-3 py-2 pr-8 border border-slate-200 outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 pointer-events-none">
              %
            </span>
          </div>
          <p className="text-xs text-gray-400 -mt-2 mb-3">
            Optional. Earns monthly interest at this rate (e.g. a CD or savings
            account).
          </p>

          <label className="block text-xs font-medium text-slate-600 mb-1">
            Maturity date
          </label>
          <input
            type="date"
            value={editor.maturityDate}
            onChange={(e) =>
              setEditor({ ...editor, maturityDate: e.target.value })
            }
            className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none mb-1"
          />
          <p className="text-xs text-gray-400 mb-3">
            Optional. For CDs — interest stops accruing once this date is
            reached. Leave blank for an open-ended account.
          </p>

          <div className="grid grid-cols-6 gap-2 mb-3">
            {FUND_ICON_PALETTE.map((opt) => {
              const active = editor.icon === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setEditor({ ...editor, icon: opt.key })}
                  title={opt.label}
                  className={`flex items-center justify-center py-2 rounded-lg border cursor-pointer ${
                    active
                      ? "border-primary bg-purple-50 text-primary"
                      : "border-gray-200 text-gray-600 hover:bg-white"
                  }`}
                >
                  <opt.Icon className="text-lg" />
                </button>
              );
            })}
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={closeEditor}
              className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <LuX /> Cancel
            </button>
            <button
              type="button"
              onClick={saveEditor}
              className="flex items-center gap-1 text-xs font-medium text-white bg-primary px-3 py-1.5 rounded-lg cursor-pointer"
            >
              <LuCheck /> Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundsOverview;
