// Base URL of the backend API. Override in .env with VITE_API_BASE_URL.
export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Centralised list of every API endpoint the frontend talks to.
export const API_PATHS = {
  AUTH: {
    LOGIN: "/api/v1/auth/login",
    REGISTER: "/api/v1/auth/register",
    GET_USER_INFO: "/api/v1/auth/getUser",
    UPDATE_PROFILE: "/api/v1/auth/profile",
    CHANGE_PASSWORD: "/api/v1/auth/change-password",
    DELETE_ACCOUNT: "/api/v1/auth/account",
    FORGOT_PASSWORD: "/api/v1/auth/forgot-password",
    RESET_PASSWORD: "/api/v1/auth/reset-password",
  },
  DASHBOARD: {
    GET_DATA: "/api/v1/dashboard",
  },
  INCOME: {
    ADD_INCOME: "/api/v1/income/add",
    GET_ALL_INCOME: "/api/v1/income/get",
    UPDATE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DELETE_INCOME: (incomeId) => `/api/v1/income/${incomeId}`,
    DOWNLOAD_INCOME: "/api/v1/income/downloadexcel",
  },
  INCOME_SOURCE: {
    GET_ALL: "/api/v1/income-source/get",
    ADD: "/api/v1/income-source/add",
    UPDATE: (id) => `/api/v1/income-source/${id}`,
    DELETE: (id) => `/api/v1/income-source/${id}`,
  },
  EXPENSE: {
    ADD_EXPENSE: "/api/v1/expense/add",
    GET_ALL_EXPENSE: "/api/v1/expense/get",
    UPDATE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DELETE_EXPENSE: (expenseId) => `/api/v1/expense/${expenseId}`,
    DOWNLOAD_EXPENSE: "/api/v1/expense/downloadexcel",
  },
  EXPENSE_CATEGORY: {
    GET_ALL: "/api/v1/expense-category/get",
    ADD: "/api/v1/expense-category/add",
    UPDATE: (id) => `/api/v1/expense-category/${id}`,
    DELETE: (id) => `/api/v1/expense-category/${id}`,
  },
  FUND: {
    GET_ALL: "/api/v1/fund/get",
    ADD: "/api/v1/fund/add",
    UPDATE: (id) => `/api/v1/fund/${id}`,
    DELETE: (id) => `/api/v1/fund/${id}`,
  },
  SUBSCRIPTION: {
    GET_ALL: "/api/v1/subscription/get",
    ADD: "/api/v1/subscription/add",
    UPDATE: (id) => `/api/v1/subscription/${id}`,
    DELETE: (id) => `/api/v1/subscription/${id}`,
    CHARGE_NOW: (id) => `/api/v1/subscription/${id}/charge`,
  },
  SUBSCRIPTION_CATEGORY: {
    GET_ALL: "/api/v1/subscription-category/get",
    ADD: "/api/v1/subscription-category/add",
    UPDATE: (id) => `/api/v1/subscription-category/${id}`,
    DELETE: (id) => `/api/v1/subscription-category/${id}`,
  },
  GOAL: {
    GET_ALL: "/api/v1/goal/get",
    ADD: "/api/v1/goal/add",
    UPDATE: (id) => `/api/v1/goal/${id}`,
    DELETE: (id) => `/api/v1/goal/${id}`,
    ADD_CONTRIBUTION: (id) => `/api/v1/goal/${id}/contribution`,
    DELETE_CONTRIBUTION: (id, contributionId) =>
      `/api/v1/goal/${id}/contribution/${contributionId}`,
  },
  GOAL_CATEGORY: {
    GET_ALL: "/api/v1/goal-category/get",
    ADD: "/api/v1/goal-category/add",
    UPDATE: (id) => `/api/v1/goal-category/${id}`,
    DELETE: (id) => `/api/v1/goal-category/${id}`,
  },
  CREDIT_CARD: {
    GET_ALL: "/api/v1/credit-card/get",
    ADD: "/api/v1/credit-card/add",
    UPDATE: (id) => `/api/v1/credit-card/${id}`,
    DELETE: (id) => `/api/v1/credit-card/${id}`,
    PAY: (id) => `/api/v1/credit-card/${id}/pay`,
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/v1/auth/upload-image",
  },
};
