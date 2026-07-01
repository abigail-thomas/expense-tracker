import Expense from "../models/Expense.js";
import Fund from "../models/Fund.js";
import CreditCard from "../models/CreditCard.js";

// Create an Expense and apply its effect on the chosen account, then return the
// created document. A debit expense withdraws from a Fund; a credit purchase
// adds to the amount owed on a CreditCard and accrues cash back at the card's
// flat rate. Neither touches the other.
//
// Shared by the manual add-expense endpoint and the recurring-subscription
// charger so both stay in sync. Assumes inputs are already validated.
export const createExpenseWithEffects = async ({
  userId,
  icon = "",
  category,
  amount,
  method,
  fund = null,
  creditCard = null,
  notes = "",
  date,
  subscription = null,
}) => {
  const payMethod = method === "credit" ? "credit" : "debit";

  // For a credit purchase, accrue cash back at the card's flat rate.
  let rewardEarned = 0;
  let card = null;
  if (payMethod === "credit" && creditCard) {
    card = await CreditCard.findOne({ _id: creditCard, userId });
    if (card) rewardEarned = (amount * (card.rewardRate || 0)) / 100;
  }

  const expense = await Expense.create({
    userId,
    icon,
    category,
    amount,
    method: payMethod,
    fund: payMethod === "debit" ? fund || null : null,
    creditCard: payMethod === "credit" ? creditCard || null : null,
    rewardEarned,
    subscription,
    notes,
    date: date ? new Date(date) : Date.now(),
  });

  if (payMethod === "debit" && fund) {
    await Fund.updateOne({ _id: fund, userId }, { $inc: { balance: -amount } });
  } else if (payMethod === "credit" && card) {
    await CreditCard.updateOne(
      { _id: card._id, userId },
      { $inc: { balance: amount, rewardsEarned: rewardEarned } }
    );
  }

  return expense;
};
