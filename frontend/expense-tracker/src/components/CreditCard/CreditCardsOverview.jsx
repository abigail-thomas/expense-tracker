import React, { useEffect, useState } from "react";
import {
  LuPlus,
  LuPencil,
  LuTrash2,
  LuCheck,
  LuX,
  LuEllipsis,
  LuInfo,
  LuWallet,
  LuClockAlert,
} from "react-icons/lu";
import toast from "react-hot-toast";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { CREDIT_ICON_PALETTE, getIconOption } from "../../utils/transactionIcons";
import { addThousandsSeparator, getCreditCardDueInfo } from "../../utils/helper";

const DEFAULT_ICON = CREDIT_ICON_PALETTE[0].key;

// Show the "payment due soon" alert when the due day is this many days away or less.
const DUE_SOON_DAYS = 3;

const REWARDS_TOOLTIP =
  "Per-category reward rates (e.g. 3% dining, 1% everything else) are coming soon. For now a single flat rate applies to all purchases on this card.";

// Dashboard panel to manage credit cards: balance vs limit, available credit,
// cash-back rewards, plus add / edit / delete and a "Make Payment" (fund → card).
const CreditCardsOverview = ({ onChange, reloadSignal }) => {
  const [cards, setCards] = useState([]);
  const [funds, setFunds] = useState([]);
  // editor: null | { id?, name, icon, limit, balance, rewardRate }
  const [editor, setEditor] = useState(null);
  // payment: null | { cardId, fundId, amount }
  const [payment, setPayment] = useState(null);

  const loadCards = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.CREDIT_CARD.GET_ALL);
      setCards(res.data || []);
    } catch (error) {
      console.error("Failed to load credit cards:", error);
    }
  };

  const loadFunds = async () => {
    try {
      const res = await axiosInstance.get(API_PATHS.FUND.GET_ALL);
      setFunds(res.data || []);
    } catch (error) {
      console.error("Failed to load funds:", error);
    }
  };

  useEffect(() => {
    // Fetch-on-mount/refresh: setState runs only after the awaited requests
    // resolve, so this is not the synchronous cascade the rule guards against.
    /* eslint-disable react-hooks/set-state-in-effect */
    loadCards();
    loadFunds();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [reloadSignal]);

  const openAdd = () =>
    setEditor({ name: "", icon: DEFAULT_ICON, limit: "", balance: "", rewardRate: "", dueDay: "" });
  const openEdit = (card) =>
    setEditor({
      id: card._id,
      name: card.name,
      icon: card.icon || DEFAULT_ICON,
      limit: String(card.limit ?? 0),
      balance: String(card.balance ?? 0),
      rewardRate: String(card.rewardRate ?? 0),
      dueDay: card.dueDay ? String(card.dueDay) : "",
    });
  const closeEditor = () => setEditor(null);

  const num = (v) => (v === "" ? 0 : Number(v));

  const saveEditor = async () => {
    const name = editor.name.trim();
    if (!name) {
      toast.error("Name is required.");
      return;
    }
    for (const f of ["limit", "balance", "rewardRate"]) {
      if (editor[f] !== "" && isNaN(Number(editor[f]))) {
        toast.error(`${f} must be a number.`);
        return;
      }
    }
    if (editor.dueDay !== "") {
      const d = Number(editor.dueDay);
      if (!Number.isInteger(d) || d < 1 || d > 31) {
        toast.error("Due day must be a whole number between 1 and 31.");
        return;
      }
    }

    const body = {
      name,
      icon: editor.icon,
      limit: num(editor.limit),
      balance: num(editor.balance),
      rewardRate: num(editor.rewardRate),
      dueDay: editor.dueDay === "" ? null : Number(editor.dueDay),
    };

    try {
      if (editor.id) {
        await axiosInstance.put(API_PATHS.CREDIT_CARD.UPDATE(editor.id), body);
        toast.success("Card updated");
      } else {
        await axiosInstance.post(API_PATHS.CREDIT_CARD.ADD, body);
        toast.success("Card added");
      }
      closeEditor();
      await loadCards();
      onChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save card.");
    }
  };

  const deleteCard = async (card) => {
    try {
      await axiosInstance.delete(API_PATHS.CREDIT_CARD.DELETE(card._id));
      toast.success("Card deleted");
      await loadCards();
      onChange?.();
    } catch {
      toast.error("Failed to delete card.");
    }
  };

  const openPayment = (card) =>
    setPayment({ cardId: card._id, fundId: funds[0]?._id || "", amount: "" });
  const closePayment = () => setPayment(null);

  const submitPayment = async () => {
    const amount = Number(payment.amount);
    if (!amount || isNaN(amount) || amount <= 0) {
      toast.error("Enter a payment amount greater than 0.");
      return;
    }
    if (!payment.fundId) {
      toast.error("Choose a fund to pay from.");
      return;
    }
    try {
      await axiosInstance.post(API_PATHS.CREDIT_CARD.PAY(payment.cardId), {
        amount,
        fundId: payment.fundId,
      });
      toast.success("Payment made");
      closePayment();
      await loadCards();
      onChange?.();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to make payment.");
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <h5 className="text-lg font-medium">Credit Cards</h5>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1 text-xs font-medium text-primary bg-purple-50 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <LuPlus /> Add Card
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {cards.map((card) => {
          const option = getIconOption(card.icon);
          const limit = card.limit || 0;
          const balance = card.balance || 0;
          const available = limit - balance;
          const utilization = limit > 0 ? Math.min(100, (balance / limit) * 100) : 0;
          const dueInfo = getCreditCardDueInfo(card.dueDay);
          const dueSoon = dueInfo && dueInfo.daysUntil <= DUE_SOON_DAYS;
          const dueLabel =
            dueInfo &&
            (dueInfo.daysUntil === 0
              ? "Payment due today"
              : dueInfo.daysUntil === 1
              ? "Payment due tomorrow"
              : `Payment due in ${dueInfo.daysUntil} days`);
          return (
            <div
              key={card._id}
              className="group p-3 rounded-lg border border-gray-100 hover:bg-gray-100/40"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center text-lg text-gray-800 bg-gray-100 rounded-full">
                    {option ? <option.Icon /> : <LuEllipsis />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm text-gray-700 font-medium">{card.name}</p>
                      {dueSoon && (
                        <span
                          title={dueLabel}
                          className="flex items-center gap-1 text-[11px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full"
                        >
                          <LuClockAlert className="text-xs" />
                          {dueInfo.daysUntil === 0
                            ? "Due today"
                            : dueInfo.daysUntil === 1
                            ? "Due tomorrow"
                            : `Due in ${dueInfo.daysUntil}d`}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      ${addThousandsSeparator(balance)} of $
                      {addThousandsSeparator(limit)} used
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => openPayment(card)}
                    className="text-xs font-medium text-primary bg-purple-50 px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    Pay
                  </button>
                  <button
                    type="button"
                    onClick={() => openEdit(card)}
                    aria-label={`Edit ${card.name}`}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-primary cursor-pointer"
                  >
                    <LuPencil className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCard(card)}
                    aria-label={`Delete ${card.name}`}
                    className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full text-gray-500 hover:text-red-500 cursor-pointer"
                  >
                    <LuTrash2 className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Utilization bar */}
              <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${utilization}%` }}
                />
              </div>

              <div className="flex items-center justify-between mt-2 text-xs">
                <span className="text-gray-500">
                  ${addThousandsSeparator(available)} available
                </span>
                <span className="text-green-600 font-medium">
                  ${addThousandsSeparator(card.rewardsEarned || 0)} rewards
                </span>
              </div>

              {/* Inline payment form */}
              {payment?.cardId === card._id && (
                <div className="mt-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-[13px] font-medium text-slate-800 mb-2">
                    Make a payment
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={payment.fundId}
                      onChange={(e) =>
                        setPayment({ ...payment, fundId: e.target.value })
                      }
                      className="flex-1 text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none"
                    >
                      <option value="">Pay from…</option>
                      {funds.map((f) => (
                        <option key={f._id} value={f._id}>
                          {f.name} (${addThousandsSeparator(f.balance || 0)})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={payment.amount}
                      onChange={(e) =>
                        setPayment({ ...payment, amount: e.target.value })
                      }
                      placeholder="Amount"
                      className="flex-1 text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none"
                    />
                  </div>
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={closePayment}
                      className="flex items-center gap-1 text-xs font-medium text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <LuX /> Cancel
                    </button>
                    <button
                      type="button"
                      onClick={submitPayment}
                      className="flex items-center gap-1 text-xs font-medium text-white bg-primary px-3 py-1.5 rounded-lg cursor-pointer"
                    >
                      <LuWallet /> Pay
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {cards.length === 0 && (
          <p className="text-sm text-gray-400">
            No credit cards yet — add one to track balances and rewards.
          </p>
        )}
      </div>

      {editor && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-[13px] font-medium text-slate-800 mb-2">
            {editor.id ? "Edit card" : "New card"}
          </p>

          <input
            type="text"
            value={editor.name}
            onChange={(e) => setEditor({ ...editor, name: e.target.value })}
            placeholder="Card name (e.g. Chase Sapphire)"
            className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none mb-3"
          />

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[11px] text-slate-500">Credit limit</label>
              <input
                type="number"
                value={editor.limit}
                onChange={(e) => setEditor({ ...editor, limit: e.target.value })}
                placeholder="0"
                className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500">Balance owed</label>
              <input
                type="number"
                value={editor.balance}
                onChange={(e) => setEditor({ ...editor, balance: e.target.value })}
                placeholder="0"
                className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div>
              <label className="text-[11px] text-slate-500 flex items-center gap-1">
                Cash-back rate (%)
                <span title={REWARDS_TOOLTIP} className="cursor-help">
                  <LuInfo className="text-xs text-gray-400" />
                </span>
              </label>
              <input
                type="number"
                step="0.1"
                value={editor.rewardRate}
                onChange={(e) => setEditor({ ...editor, rewardRate: e.target.value })}
                placeholder="e.g. 1.5"
                className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500">Payment due day</label>
              <input
                type="number"
                min="1"
                max="31"
                step="1"
                value={editor.dueDay}
                onChange={(e) => setEditor({ ...editor, dueDay: e.target.value })}
                placeholder="Day of month (1-31)"
                className="w-full text-sm bg-white rounded px-3 py-2 border border-slate-200 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-3">
            {CREDIT_ICON_PALETTE.map((opt) => {
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

export default CreditCardsOverview;
