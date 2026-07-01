import { describe, it, expect } from "vitest";
import {
  addThousandsSeparator,
  validateEmail,
  getInitials,
  netSavingsBetween,
  balanceStatus,
} from "./helper";

describe("addThousandsSeparator (money display contract)", () => {
  it("always shows exactly 2 decimals", () => {
    expect(addThousandsSeparator(1000)).toBe("1,000.00");
    expect(addThousandsSeparator(12345.6)).toBe("12,345.60");
    expect(addThousandsSeparator(0)).toBe("0.00");
  });

  it("rounds floating-point noise to 2 decimals", () => {
    expect(addThousandsSeparator(-36.519999999999996)).toBe("-36.52");
    expect(addThousandsSeparator(2.567)).toBe("2.57");
    expect(addThousandsSeparator(2.564)).toBe("2.56");
  });

  it("groups thousands", () => {
    expect(addThousandsSeparator(1234567.89)).toBe("1,234,567.89");
  });

  it("returns empty string for non-numbers", () => {
    expect(addThousandsSeparator(null)).toBe("");
    expect(addThousandsSeparator(undefined)).toBe("");
    expect(addThousandsSeparator(NaN)).toBe("");
  });
});

describe("validateEmail", () => {
  it("accepts well-formed emails and rejects bad ones", () => {
    expect(validateEmail("a@b.com")).toBe(true);
    expect(validateEmail("no-at-sign")).toBe(false);
    expect(validateEmail("a@b")).toBe(false);
  });
});

describe("getInitials", () => {
  it("returns up to two uppercase initials", () => {
    expect(getInitials("Jane Doe")).toBe("JD");
    expect(getInitials("madonna")).toBe("M");
    expect(getInitials("")).toBe("");
  });
});

describe("netSavingsBetween", () => {
  it("sums income minus expense across the window", () => {
    const income = [{ amount: 100, date: "2024-01-10" }];
    const expense = [{ amount: 40, date: "2024-01-15" }];
    expect(netSavingsBetween(income, expense)).toBe(60);
  });

  it("excludes entries outside the window", () => {
    const income = [
      { amount: 100, date: "2024-01-10" },
      { amount: 999, date: "2023-01-10" },
    ];
    expect(
      netSavingsBetween(income, [], "2024-01-01", "2024-02-01")
    ).toBe(100);
  });
});

describe("balanceStatus", () => {
  it("classifies surplus, deficit, and balanced", () => {
    expect(balanceStatus(1000, 500).key).toBe("surplus");
    expect(balanceStatus(500, 1000).key).toBe("deficit");
    expect(balanceStatus(1000, 950).key).toBe("balanced");
  });
});
