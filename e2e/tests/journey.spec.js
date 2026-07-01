import { test, expect } from "@playwright/test";

// End-to-end user journeys for the expense tracker frontend.
// Each test runs in its own fresh browser context (default Playwright
// isolation), so localStorage/token do not leak between tests.

const PASSWORD = "password123"; // >= 8 chars (backend enforces this too)
// Any valid, non-empty date works — the add-income/expense forms require one.
const TXN_DATE = "2026-06-15";

// Unique per run so re-runs (backed by the same in-memory Mongo instance for
// the duration of a run) never collide on "Email already in use".
const uniqueEmail = () =>
  `user${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;

// Sign up a brand-new user and wait until the dashboard has loaded.
async function signUp(page, email) {
  await page.goto("/signup");
  await page.getByPlaceholder("John Doe").fill("Test User");
  await page.getByPlaceholder("john@example.com").fill(email);
  await page.getByPlaceholder("Minimum of 8 characters").fill(PASSWORD);
  await page.getByRole("button", { name: "Sign Up" }).click();

  await page.waitForURL(/\/dashboard/);
  // "Total Balance" is a static InfoCard label on the dashboard.
  await expect(
    page.getByRole("heading", { name: "Total Balance" })
  ).toBeVisible();
}

// Create a fund from the dashboard Funds panel. A fresh user has none, and
// income/debit-expense both require selecting an existing fund.
async function addFund(page, name) {
  await page.getByRole("button", { name: "Add Fund" }).click();
  await page.getByPlaceholder("Fund name").fill(name);
  // Leave balance blank -> defaults to 0 on the backend.
  await page.getByRole("button", { name: "Save" }).click();
  // The new fund shows up as a row in the Funds panel (the name can appear in
  // more than one panel, so just assert at least one is visible).
  await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
}

test.describe("expense tracker user journeys", () => {
  test("signs up and lands on the dashboard", async ({ page }) => {
    await signUp(page, uniqueEmail());

    await expect(page).toHaveURL(/\/dashboard/);
    // Post-login the navbar greets the user by name.
    await expect(page.getByText("Welcome, Test User")).toBeVisible();
  });

  test("logs out and logs back in", async ({ page }) => {
    const email = uniqueEmail();
    await signUp(page, email);

    // Log out via the side menu -> clears localStorage, redirects to /login.
    await page.getByRole("button", { name: "Logout" }).click();
    await page.waitForURL(/\/login/);
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();

    // Log back in with the same credentials.
    await page.getByPlaceholder("john@example.com").fill(email);
    await page.getByPlaceholder("Minimum of 8 characters").fill(PASSWORD);
    await page.getByRole("button", { name: "Login" }).click();

    await page.waitForURL(/\/dashboard/);
    await expect(
    page.getByRole("heading", { name: "Total Balance" })
  ).toBeVisible();
  });

  test("adds an income and an expense and sees dashboard totals", async ({
    page,
  }) => {
    await signUp(page, uniqueEmail());

    // A fund is required before income/debit-expense can be recorded.
    await addFund(page, "Checking");

    // --- Add income (source "Salary", amount 5000, into Checking) ---
    await page.getByRole("button", { name: "Income" }).click();
    await page.waitForURL(/\/income/);

    // Open the Add Income modal (overview button).
    await page.getByRole("button", { name: "Add Income" }).first().click();
    await expect(page.getByRole("heading", { name: "Add Income" })).toBeVisible();

    // No income sources exist yet -> create one via the dashed "Add" tile.
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await page.getByPlaceholder("Source name").fill("Salary");
    await page.getByRole("button", { name: "Save" }).click(); // auto-selects it

    // Amount is the only number input (role=spinbutton) in the modal.
    await page.getByRole("spinbutton").fill("5000");
    // Deposit into the Checking fund (button label includes the fund name).
    await page.getByRole("button", { name: /Checking/ }).click();
    // Date input has no accessible name; it is the only date field here.
    await page.locator('input[type="date"]').fill(TXN_DATE);

    // Submit. The overview button shares the "Add Income" label, so the modal's
    // submit button is the last one in the DOM.
    await page.getByRole("button", { name: "Add Income" }).last().click();
    // Modal closes only on a successful add.
    await expect(
      page.getByRole("heading", { name: "Add Income" })
    ).toBeHidden();

    // --- Add expense (category "Rent", amount 1500, debit from Checking) ---
    await page.getByRole("button", { name: "Expense" }).click();
    await page.waitForURL(/\/expense/);

    await page.getByRole("button", { name: "Add Expense" }).first().click();
    await expect(page.getByRole("heading", { name: "Add Expense" })).toBeVisible();

    await page.getByPlaceholder("Rent, Groceries, etc").fill("Rent");
    await page.getByRole("spinbutton").fill("1500");
    // "debit" is the default method -> Withdraw-from fund selector is shown.
    await page.getByRole("button", { name: /Checking/ }).click();
    await page.locator('input[type="date"]').fill(TXN_DATE);

    await page.getByRole("button", { name: "Add Expense" }).last().click();
    await expect(
      page.getByRole("heading", { name: "Add Expense" })
    ).toBeHidden();

    // --- Verify dashboard totals ---
    await page.getByRole("button", { name: "Dashboard" }).click();
    await page.waitForURL(/\/dashboard/);

    await expect(
    page.getByRole("heading", { name: "Total Balance" })
  ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Total Due" })
    ).toBeVisible();

    // Total Balance = sum of fund balances = 0 + 5,000 (income) - 1,500
    // (debit expense) = 3,500. Formatted via addThousandsSeparator (2 decimals).
    await expect(page.getByText("3,500.00").first()).toBeVisible();
    // Total Due = total expense = 1,500.
    await expect(page.getByText("1,500.00").first()).toBeVisible();
  });

  test("shows a 404 page for an unknown route", async ({ page }) => {
    await page.goto("/some-unknown-route");

    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toBeVisible();
  });

  test("redirects unauthenticated users away from a protected route", async ({
    page,
  }) => {
    // Fresh context => no token in localStorage. ProtectedRoute should bounce
    // us to /login.
    await page.goto("/income");

    await page.waitForURL(/\/login/);
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });
});
