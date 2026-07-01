import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuTrendingUp, LuTrendingDown, LuScale } from "react-icons/lu";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import InfoCard from "../../components/Cards/InfoCard";
import IncomeExpenseBarChart from "../../components/Charts/IncomeExpenseBarChart";

import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import {
  addThousandsSeparator,
  filterByAccount,
  prepareIncomeVsExpense,
} from "../../utils/helper";

const TYPE_OPTIONS = [
  { key: "all", label: "Income & Expense" },
  { key: "income", label: "Income only" },
  { key: "expense", label: "Expense only" },
];

const RANGE_OPTIONS = [6, 12];

// Render a dollar amount, prefixing a minus sign outside the "$" for negatives.
const money = (value) =>
  `${value < 0 ? "-$" : "$"}${addThousandsSeparator(Math.abs(value))}`;

// Full Income vs Expense breakdown: filterable monthly chart + summary + table.
const IncomeVsExpense = () => {
  useUserAuth();

  const navigate = useNavigate();
  const [income, setIncome] = useState([]);
  const [expense, setExpense] = useState([]);
  const [funds, setFunds] = useState([]);
  const [cards, setCards] = useState([]);

  const [type, setType] = useState("all");
  const [account, setAccount] = useState("all");
  const [months, setMonths] = useState(12);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [incomeRes, expenseRes, fundsRes, cardsRes] = await Promise.all([
          axiosInstance.get(API_PATHS.INCOME.GET_ALL_INCOME),
          axiosInstance.get(API_PATHS.EXPENSE.GET_ALL_EXPENSE),
          axiosInstance.get(API_PATHS.FUND.GET_ALL),
          axiosInstance.get(API_PATHS.CREDIT_CARD.GET_ALL),
        ]);
        if (!active) return;
        setIncome(incomeRes.data || []);
        setExpense(expenseRes.data || []);
        setFunds(fundsRes.data || []);
        setCards(cardsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch insights data:", error);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // A credit-card account only makes sense for expenses; if one is selected and
  // the user switches to "Income only" the account resets to keep results sane.
  const handleTypeChange = (nextType) => {
    setType(nextType);
    if (nextType === "income" && account.startsWith("card:")) setAccount("all");
  };

  const data = useMemo(() => {
    const incomeFiltered =
      type === "expense" ? [] : filterByAccount(income, account, "income");
    const expenseFiltered =
      type === "income" ? [] : filterByAccount(expense, account, "expense");
    return prepareIncomeVsExpense(incomeFiltered, expenseFiltered, months);
  }, [income, expense, type, account, months]);

  const totals = useMemo(
    () =>
      data.reduce(
        (acc, d) => {
          acc.income += d.income;
          acc.expense += d.expense;
          return acc;
        },
        { income: 0, expense: 0 }
      ),
    [data]
  );
  const net = totals.income - totals.expense;
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  return (
    <DashboardLayout activeMenu="Insights">
      <div className="my-5 mx-auto">
        <button
          type="button"
          onClick={() => navigate("/insights")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-4"
        >
          <LuArrowLeft /> Back to Insights
        </button>

        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoCard
            icon={<LuTrendingUp />}
            label="Total Income"
            value={addThousandsSeparator(totals.income)}
            color="bg-green-500"
          />
          <InfoCard
            icon={<LuTrendingDown />}
            label="Total Expense"
            value={addThousandsSeparator(totals.expense)}
            color="bg-rose-500"
          />
          <InfoCard
            icon={<LuScale />}
            label="Net"
            value={`${net < 0 ? "-" : ""}${addThousandsSeparator(Math.abs(net))}`}
            color={net >= 0 ? "bg-primary" : "bg-rose-400"}
          />
        </div>

        {/* Chart + filters */}
        <div className="card mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h5 className="text-lg font-medium">Income vs Expense</h5>
              <p className="text-xs text-gray-400 mt-0.5">
                Monthly breakdown — compare what came in against what went out.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Type toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => handleTypeChange(opt.key)}
                    className={`text-xs px-3 py-1.5 rounded-md ${
                      type === opt.key
                        ? "bg-white text-primary shadow-sm font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Account dropdown */}
              <select
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-primary"
              >
                <option value="all">All accounts</option>
                {funds.length > 0 && (
                  <optgroup label="Funds">
                    {funds.map((f) => (
                      <option key={f._id} value={`fund:${f._id}`}>
                        {f.name}
                      </option>
                    ))}
                  </optgroup>
                )}
                {cards.length > 0 && (
                  <optgroup label="Credit Cards">
                    {cards.map((c) => (
                      <option key={c._id} value={`card:${c._id}`}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {/* Range toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {RANGE_OPTIONS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`text-xs px-3 py-1.5 rounded-md ${
                      months === m
                        ? "bg-white text-primary shadow-sm font-medium"
                        : "text-gray-500"
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {hasData ? (
            <IncomeExpenseBarChart data={data} height={340} />
          ) : (
            <p className="text-sm text-gray-400 mt-6">
              No transactions match these filters for the selected period.
            </p>
          )}
        </div>

        {/* Monthly breakdown table */}
        <div className="card mt-6">
          <h5 className="text-lg font-medium mb-4">Monthly breakdown</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Month</th>
                  <th className="py-2 px-4 font-medium text-right">Income</th>
                  <th className="py-2 px-4 font-medium text-right">Expense</th>
                  <th className="py-2 pl-4 font-medium text-right">Net</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.month} className="border-b border-gray-50">
                    <td className="py-2.5 pr-4 text-gray-700">{row.month}</td>
                    <td className="py-2.5 px-4 text-right text-green-600">
                      ${addThousandsSeparator(row.income)}
                    </td>
                    <td className="py-2.5 px-4 text-right text-rose-600">
                      ${addThousandsSeparator(row.expense)}
                    </td>
                    <td
                      className={`py-2.5 pl-4 text-right font-medium ${
                        row.net >= 0 ? "text-gray-800" : "text-rose-600"
                      }`}
                    >
                      {money(row.net)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default IncomeVsExpense;
