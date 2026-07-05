import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuHandCoins } from "react-icons/lu";
import { IoMdCard } from "react-icons/io";

import DashboardLayout from "../../components/layouts/DashboardLayout";
import InfoCard from "../../components/Cards/InfoCard";
import FinanceOverview from "../../components/Dashboard/FinanceOverview";
import RecentTransactions from "../../components/Dashboard/RecentTransactions";
import FundsOverview from "../../components/Fund/FundsOverview";
import CreditCardsOverview from "../../components/CreditCard/CreditCardsOverview";

import { useUserAuth } from "../../hooks/useUserAuth";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { addThousandsSeparator } from "../../utils/helper";

const Home = () => {
  useUserAuth();

  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  // Bumped whenever a panel mutates funds/cards so sibling panels re-fetch.
  const [reloadSignal, setReloadSignal] = useState(0);

  const fetchDashboardData = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.DASHBOARD.GET_DATA);
      if (response.data) setDashboardData(response.data);
    } catch (error) {
      console.error("Something went wrong fetching dashboard data:", error);
    }
  };

  // Refresh dashboard totals and tell both panels to reload.
  const handlePanelChange = () => {
    fetchDashboardData();
    setReloadSignal((s) => s + 1);
  };

  useEffect(() => {
    // Fetch-on-mount: setState runs only after the awaited request resolves,
    // so this is not the synchronous cascade the rule guards against.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="my-5 mx-auto">
        {/* Summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InfoCard
            icon={<IoMdCard />}
            label="Total Balance"
            value={addThousandsSeparator(dashboardData?.totalBalance || 0)}
            color="bg-primary"
          />
          <InfoCard
            icon={<LuHandCoins />}
            label="Total Due"
            value={addThousandsSeparator(dashboardData?.totalDue || 0)}
            color="bg-violet-300"
          />
        </div>

        {/* Funds + Credit Cards panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <FundsOverview onChange={handlePanelChange} reloadSignal={reloadSignal} />
          <CreditCardsOverview
            onChange={handlePanelChange}
            reloadSignal={reloadSignal}
          />
        </div>

        {/* Recent activity + funds breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <RecentTransactions
            transactions={dashboardData?.recentTransactions}
            onSeeMore={() => navigate("/expense")}
          />

          <FinanceOverview funds={dashboardData?.funds || []} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Home;
