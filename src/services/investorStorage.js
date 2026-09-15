const INVESTORS_KEY = "auto_finance_investors";
const TRANSACTIONS_KEY = "auto_finance_investor_transactions";

const readArray = (key) => {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch (error) {
    console.error(`Failed to read ${key}:`, error);
    return [];
  }
};

const writeArray = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("fleetopz:data-updated"));
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const roundMoney = (value) =>
  Math.round((toNumber(value) + Number.EPSILON) * 100) / 100;

const nextId = (items, prefix, field = "id") => {
  const highest = items.reduce((max, item) => {
    const match = String(item?.[field] || "").match(
      new RegExp(`^${prefix}-(\\d+)$`)
    );
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);

  return `${prefix}-${String(highest + 1).padStart(4, "0")}`;
};

const emitUpdate = () => {
  window.dispatchEvent(new CustomEvent("auto-finance:data-updated"));
};

export const getInvestors = () => readArray(INVESTORS_KEY);

export const getInvestorTransactions = (investorId) =>
  readArray(TRANSACTIONS_KEY).filter(
    (transaction) =>
      !investorId || String(transaction?.investorId) === String(investorId)
  );

export const getInvestorById = (investorId) =>
  getInvestors().find(
    (investor) => String(investor?.id) === String(investorId)
  ) || null;

export const getInvestorFundingSummary = (investorId) => {
  const transactions = getInvestorTransactions(investorId);
  const totalInvested = roundMoney(
    transactions
      .filter((transaction) => transaction.type === "Investment")
      .reduce((total, transaction) => total + toNumber(transaction.amount), 0)
  );
  const allocatedAmount = roundMoney(
    transactions
      .filter((transaction) => transaction.type === "Loan Allocation")
      .reduce((total, transaction) => total + toNumber(transaction.amount), 0)
  );
  const availableBalance = roundMoney(
    Math.max(0, totalInvested - allocatedAmount)
  );

  return {
    totalInvested,
    allocatedAmount,
    availableBalance,
  };
};

export const getInvestorSummaries = () =>
  getInvestors().map((investor) => {
    const totalInvested = roundMoney(
      getInvestorTransactions(investor.id)
        .filter((transaction) => transaction.type === "Investment")
        .reduce((total, transaction) => total + toNumber(transaction.amount), 0)
    );

    return {
      ...investor,
      investment: {
        ...(investor.investment || {}),
        totalInvested,
      },
    };
  });

export const getFundingSummary = () => {
  const transactions = readArray(TRANSACTIONS_KEY);
  const totalInvested = roundMoney(
    transactions
      .filter((transaction) => transaction.type === "Investment")
      .reduce((total, transaction) => total + toNumber(transaction.amount), 0)
  );
  const distributedToLoans = roundMoney(
    transactions
      .filter((transaction) => transaction.type === "Loan Allocation")
      .reduce((total, transaction) => total + toNumber(transaction.amount), 0)
  );

  return {
    totalInvestors: getInvestors().length,
    totalInvestment: totalInvested,
    distributedToLoans,
    availableInvestmentBalance: roundMoney(
      Math.max(0, totalInvested - distributedToLoans)
    ),
  };
};

export const getInvestmentPoolSummary = getFundingSummary;

export const getNextInvestorTransactionId = () =>
  nextId(readArray(TRANSACTIONS_KEY), "ITX");

const validateInvestor = (input) => {
  const name = String(input?.name || "").trim();
  const amount = Number(input?.investment?.initialAmount);

  if (!name) {
    throw new Error("Investor name is required.");
  }

  if (!String(input?.mobileNumber || "").trim()) {
    throw new Error("Investor mobile number is required.");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Initial investment amount must be greater than zero.");
  }

  if (!input?.investment?.investmentDate) {
    throw new Error("Investment date is required.");
  }

  if (input?.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(input.pan.trim())) {
    throw new Error("Enter a valid PAN.");
  }

  if (
    input?.bankDetails?.ifsc &&
    !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(input.bankDetails.ifsc.trim())
  ) {
    throw new Error("Enter a valid IFSC code.");
  }

  if (
    input?.bankDetails?.accountNumber &&
    !/^\d{6,20}$/.test(input.bankDetails.accountNumber.trim())
  ) {
    throw new Error("Enter a valid bank account number.");
  }
};

export const createInvestor = (input) => {
  validateInvestor(input);
  const investors = getInvestors();
  const transactions = readArray(TRANSACTIONS_KEY);
  const now = new Date().toISOString();
  const id = nextId(investors, "INV");
  const transactionId = nextId(transactions, "ITX");
  const amount = roundMoney(input.investment.initialAmount);
  const investor = {
    id,
    name: String(input.name).trim(),
    mobileNumber: String(input.mobileNumber || "").trim(),
    email: String(input.email || "").trim(),
    address: String(input.address || "").trim(),
    city: String(input.city || "").trim(),
    state: String(input.state || "").trim(),
    pincode: String(input.pincode || "").trim(),
    investorType: input.investorType || "Individual",
    pan: String(input.pan || "").trim().toUpperCase(),
    bankDetails: {
      accountName: String(input.bankDetails?.accountName || "").trim(),
      accountNumber: String(input.bankDetails?.accountNumber || "").trim(),
      ifsc: String(input.bankDetails?.ifsc || "").trim().toUpperCase(),
    },
    investment: {
      initialAmount: amount,
      totalInvested: amount,
      allocatedAmount: 0,
      availableBalance: amount,
      investmentDate: input.investment.investmentDate,
      referenceNumber: String(input.investment.referenceNumber || "").trim(),
      investmentMode: input.investment.investmentMode || "Bank Transfer",
    },
    status: "Active",
    remarks: String(input.remarks || "").trim(),
    createdAt: now,
    updatedAt: now,
  };
  const transaction = {
    id: transactionId,
    investorId: id,
    type: "Investment",
    amount,
    date: input.investment.investmentDate,
    reference: investor.investment.referenceNumber,
    notes: investor.remarks || "Initial investment",
  };

  writeArray(INVESTORS_KEY, [...investors, investor]);
  writeArray(TRANSACTIONS_KEY, [...transactions, transaction]);
  emitUpdate();
  return investor;
};

export const addInvestorInvestment = ({
  investorId,
  amount,
  date,
  reference = "",
  investmentMode = "Bank Transfer",
  notes = "Additional investment",
}) => {
  const value = Number(amount);
  if (!getInvestorById(investorId)) {
    throw new Error("Investor not found.");
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Investment amount must be greater than zero.");
  }
  if (!date) {
    throw new Error("Investment date is required.");
  }

  const transactions = readArray(TRANSACTIONS_KEY);
  const transaction = {
    id: nextId(transactions, "ITX"),
    investorId,
    type: "Investment",
    amount: roundMoney(value),
    date,
    reference,
    investmentMode,
    notes,
  };
  writeArray(TRANSACTIONS_KEY, [...transactions, transaction]);
  emitUpdate();
  return transaction;
};

export const allocateInvestmentPoolToLoan = ({
  amount,
  loanId,
  loanNumber,
  date = new Date().toISOString(),
  transactionId = getNextInvestorTransactionId(),
}) => {
  const value = Number(amount);
  const summary = getFundingSummary();
  const transactions = readArray(TRANSACTIONS_KEY);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Loan amount must be greater than zero.");
  }
  if (summary.availableInvestmentBalance < value) {
    throw new Error(
      `Insufficient investment balance. Available funding: ₹${summary.availableInvestmentBalance.toLocaleString("en-IN")}.`
    );
  }
  if (!loanId || !loanNumber) {
    throw new Error("Loan identity is required for funding allocation.");
  }
  if (
    transactions.some(
      (transaction) =>
        transaction.type === "Loan Allocation" &&
        String(transaction.loanId) === String(loanId)
    )
  ) {
    throw new Error("This loan already has an investor funding allocation.");
  }
  if (transactions.some((transaction) => transaction.id === transactionId)) {
    throw new Error("Funding transaction ID already exists.");
  }

  const transaction = {
    id: transactionId,
    type: "Loan Allocation",
    amount: roundMoney(value),
    loanId,
    loanNumber,
    date,
    notes: "Loan disbursement",
  };
  writeArray(TRANSACTIONS_KEY, [...transactions, transaction]);
  emitUpdate();
  return transaction;
};

export const allocateInvestorToLoan = (input) =>
  allocateInvestmentPoolToLoan(input);

export const getInvestorFundedLoans = (investorId) =>
  getInvestorTransactions(investorId).filter(
    (transaction) => transaction.type === "Loan Allocation"
  );
