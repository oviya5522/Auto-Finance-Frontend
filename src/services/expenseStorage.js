// src/services/expenseStorage.js

const EXPENSE_STORAGE_KEY =
  "fleetopz_expenses";

/* =========================================================
   GET ALL EXPENSES
========================================================= */

export const getExpenses = () => {
  try {
    const stored =
      localStorage.getItem(
        EXPENSE_STORAGE_KEY
      );

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (error) {
    console.error(
      "Failed to read expenses:",
      error
    );

    return [];
  }
};

/* =========================================================
   SAVE ALL
========================================================= */

export const saveExpenses = (
  expenses
) => {
  localStorage.setItem(
    EXPENSE_STORAGE_KEY,
    JSON.stringify(expenses)
  );

  window.dispatchEvent(
    new CustomEvent(
      "fleetopz:data-updated"
    )
  );
};

/* =========================================================
   GENERATE EXPENSE ID
========================================================= */

const createExpenseId = (
  expenses
) => {
  const highestNumber =
    expenses.reduce(
      (max, expense) => {
        const match =
          String(
            expense?.id || ""
          ).match(
            /^EXP-(\d+)$/
          );

        if (!match) {
          return max;
        }

        return Math.max(
          max,
          Number(match[1])
        );
      },
      0
    );

  return `EXP-${String(
    highestNumber + 1
  ).padStart(4, "0")}`;
};

/* =========================================================
   ADD EXPENSE
========================================================= */

export const addExpense = (
  expense
) => {
  const expenses =
    getExpenses();

  const newExpense = {
    ...expense,
    id:
      expense?.id ||
      createExpenseId(
        expenses
      ),
    createdAt:
      expense?.createdAt ||
      new Date().toISOString(),
    updatedAt:
      new Date().toISOString(),
  };

  const updatedExpenses = [
    newExpense,
    ...expenses,
  ];

  saveExpenses(
    updatedExpenses
  );

  return newExpense;
};

/* =========================================================
   UPDATE EXPENSE
========================================================= */

export const updateExpense = (
  expenseId,
  updatedExpense
) => {
  const expenses =
    getExpenses();

  const updatedExpenses =
    expenses.map(
      (expense) =>
        expense.id === expenseId
          ? {
              ...expense,
              ...updatedExpense,
              id: expense.id,
              updatedAt:
                new Date().toISOString(),
            }
          : expense
    );

  saveExpenses(
    updatedExpenses
  );

  return updatedExpenses.find(
    (expense) =>
      expense.id === expenseId
  );
};

/* =========================================================
   DELETE EXPENSE
========================================================= */

export const deleteExpense = (
  expenseId
) => {
  const expenses =
    getExpenses();

  const updatedExpenses =
    expenses.filter(
      (expense) =>
        expense.id !== expenseId
    );

  saveExpenses(
    updatedExpenses
  );
};

/* =========================================================
   GET ONE
========================================================= */

export const getExpenseById = (
  expenseId
) => {
  const expenses =
    getExpenses();

  return (
    expenses.find(
      (expense) =>
        expense.id === expenseId
    ) || null
  );
};

/* =========================================================
   CLEAR ALL
========================================================= */

export const clearExpenses = () => {
  localStorage.removeItem(
    EXPENSE_STORAGE_KEY
  );

  window.dispatchEvent(
    new CustomEvent(
      "fleetopz:data-updated"
    )
  );
};