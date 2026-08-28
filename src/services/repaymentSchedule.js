// src/services/repaymentSchedule.js

/*
|--------------------------------------------------------------------------
| Repayment Schedule Generator
|--------------------------------------------------------------------------
|
| Generates period-by-period repayment rows after the loan is confirmed.
|
| Supported:
| - Flat + EMI
| - Flat + Principal
| - Reducing + EMI
| - Reducing + Principal
|
|--------------------------------------------------------------------------
*/


/* =========================================================
   HELPERS
========================================================= */

export const roundMoney = (value) => {
  return Math.round(
    (Number(value) + Number.EPSILON) * 100
  ) / 100;
};


/* =========================================================
   TENURE -> PAYMENT COUNT
========================================================= */

const getPaymentCount = ({
  tenure = 0,
  tenureUnit = "Months",
  frequency = "Monthly",
}) => {
  const value = Number(tenure) || 0;

  if (value <= 0) {
    return 0;
  }

  let months = value;

  switch (tenureUnit) {
    case "Years":
      months = value * 12;
      break;

    case "Weeks":
      months = value / 4.345;
      break;

    case "Days":
      months = value / 30.4375;
      break;

    case "Months":
    default:
      months = value;
      break;
  }

  switch (frequency) {
    case "Daily":
      return Math.max(
        1,
        Math.round(months * 30.4375)
      );

    case "Weekly":
      return Math.max(
        1,
        Math.round(months * 4.345)
      );

    case "Monthly":
    default:
      return Math.max(
        1,
        Math.round(months)
      );
  }
};


/* =========================================================
   PERIODIC INTEREST RATE
========================================================= */

const getPeriodicRate = ({
  annualRate = 0,
  frequency = "Monthly",
}) => {
  const rate = Number(annualRate) || 0;

  if (rate <= 0) {
    return 0;
  }

  switch (frequency) {
    case "Daily":
      return rate / 100 / 365;

    case "Weekly":
      return rate / 100 / 52;

    case "Monthly":
    default:
      return rate / 100 / 12;
  }
};


/* =========================================================
   DUE DATE
========================================================= */

const getNextDueDate = (
  date,
  frequency,
  period
) => {
  const nextDate = new Date(date);

  if (Number.isNaN(nextDate.getTime())) {
    return "";
  }

  switch (frequency) {
    case "Daily":
      nextDate.setDate(
        nextDate.getDate() + period
      );
      break;

    case "Weekly":
      nextDate.setDate(
        nextDate.getDate() + period * 7
      );
      break;

    case "Monthly":
    default:
      nextDate.setMonth(
        nextDate.getMonth() + period
      );
      break;
  }

  /*
   * Store as YYYY-MM-DD
   */
  return nextDate
    .toISOString()
    .split("T")[0];
};


/* =========================================================
   FLAT + EMI
========================================================= */

const generateFlatEMI = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
  firstDueDate,
}) => {
  const loanAmount = Number(principal) || 0;

  const paymentCount = getPaymentCount({
    tenure,
    tenureUnit,
    frequency,
  });

  if (
    loanAmount <= 0 ||
    paymentCount <= 0
  ) {
    return [];
  }

  const months =
    tenureUnit === "Years"
      ? Number(tenure) * 12
      : tenureUnit === "Weeks"
      ? Number(tenure) / 4.345
      : tenureUnit === "Days"
      ? Number(tenure) / 30.4375
      : Number(tenure);

  const years = months / 12;

  const totalInterest =
    loanAmount *
    ((Number(rate) || 0) / 100) *
    years;

  const totalPayable =
    loanAmount + totalInterest;

  const paymentAmount =
    totalPayable / paymentCount;

  const principalPerPayment =
    loanAmount / paymentCount;

  const interestPerPayment =
    totalInterest / paymentCount;

  const schedule = [];

  let remainingBalance = loanAmount;

  for (
    let period = 1;
    period <= paymentCount;
    period++
  ) {
    /*
     * Last payment absorbs rounding difference.
     */
    const principalAmount =
      period === paymentCount
        ? remainingBalance
        : principalPerPayment;

    const interestAmount =
      period === paymentCount
        ? totalInterest -
          schedule.reduce(
            (sum, row) =>
              sum + row.interest,
            0
          )
        : interestPerPayment;

    const amount =
      principalAmount +
      interestAmount;

    remainingBalance -=
      principalAmount;

    schedule.push({
      installmentNumber: period,

      dueDate: getNextDueDate(
        firstDueDate,
        frequency,
        period - 1
      ),

      openingBalance:
        roundMoney(
          remainingBalance +
            principalAmount
        ),

      principal:
        roundMoney(
          principalAmount
        ),

      interest:
        roundMoney(
          interestAmount
        ),

      paymentAmount:
        roundMoney(amount),

      closingBalance:
        roundMoney(
          Math.max(
            remainingBalance,
            0
          )
        ),

      status: "Pending",
    });
  }

  return schedule;
};


/* =========================================================
   REDUCING + EMI
========================================================= */

const generateReducingEMI = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
  firstDueDate,
}) => {
  const loanAmount = Number(principal) || 0;
  const annualRate = Number(rate) || 0;

  const paymentCount = getPaymentCount({
    tenure,
    tenureUnit,
    frequency,
  });

  if (
    loanAmount <= 0 ||
    paymentCount <= 0
  ) {
    return [];
  }

  const periodicRate =
    getPeriodicRate({
      annualRate,
      frequency,
    });

  let paymentAmount;

  if (periodicRate === 0) {
    paymentAmount =
      loanAmount / paymentCount;
  } else {
    const factor = Math.pow(
      1 + periodicRate,
      paymentCount
    );

    paymentAmount =
      loanAmount *
      periodicRate *
      factor /
      (factor - 1);
  }

  const schedule = [];

  let remainingBalance =
    loanAmount;

  for (
    let period = 1;
    period <= paymentCount;
    period++
  ) {
    const openingBalance =
      remainingBalance;

    const interestAmount =
      openingBalance *
      periodicRate;

    let principalAmount =
      paymentAmount -
      interestAmount;

    /*
     * Last payment absorbs rounding.
     */
    if (period === paymentCount) {
      principalAmount =
        remainingBalance;
    }

    const actualPayment =
      principalAmount +
      interestAmount;

    remainingBalance -=
      principalAmount;

    schedule.push({
      installmentNumber: period,

      dueDate: getNextDueDate(
        firstDueDate,
        frequency,
        period - 1
      ),

      openingBalance:
        roundMoney(
          openingBalance
        ),

      principal:
        roundMoney(
          principalAmount
        ),

      interest:
        roundMoney(
          interestAmount
        ),

      paymentAmount:
        roundMoney(
          actualPayment
        ),

      closingBalance:
        roundMoney(
          Math.max(
            remainingBalance,
            0
          )
        ),

      status: "Pending",
    });
  }

  return schedule;
};


/* =========================================================
   FLAT + PRINCIPAL BASED
========================================================= */

const generateFlatPrincipal = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
  firstDueDate,
}) => {
  const loanAmount = Number(principal) || 0;

  const paymentCount = getPaymentCount({
    tenure,
    tenureUnit,
    frequency,
  });

  if (
    loanAmount <= 0 ||
    paymentCount <= 0
  ) {
    return [];
  }

  const months =
    tenureUnit === "Years"
      ? Number(tenure) * 12
      : tenureUnit === "Weeks"
      ? Number(tenure) / 4.345
      : tenureUnit === "Days"
      ? Number(tenure) / 30.4375
      : Number(tenure);

  const years = months / 12;

  const totalInterest =
    loanAmount *
    ((Number(rate) || 0) / 100) *
    years;

  const principalPerPayment =
    loanAmount / paymentCount;

  const interestPerPayment =
    totalInterest / paymentCount;

  const schedule = [];

  let remainingBalance =
    loanAmount;

  for (
    let period = 1;
    period <= paymentCount;
    period++
  ) {
    const principalAmount =
      period === paymentCount
        ? remainingBalance
        : principalPerPayment;

    const interestAmount =
      period === paymentCount
        ? totalInterest -
          schedule.reduce(
            (sum, row) =>
              sum + row.interest,
            0
          )
        : interestPerPayment;

    const paymentAmount =
      principalAmount +
      interestAmount;

    remainingBalance -=
      principalAmount;

    schedule.push({
      installmentNumber: period,

      dueDate: getNextDueDate(
        firstDueDate,
        frequency,
        period - 1
      ),

      openingBalance:
        roundMoney(
          remainingBalance +
            principalAmount
        ),

      principal:
        roundMoney(
          principalAmount
        ),

      interest:
        roundMoney(
          interestAmount
        ),

      paymentAmount:
        roundMoney(
          paymentAmount
        ),

      closingBalance:
        roundMoney(
          Math.max(
            remainingBalance,
            0
          )
        ),

      status: "Pending",
    });
  }

  return schedule;
};


/* =========================================================
   REDUCING + PRINCIPAL BASED
========================================================= */

const generateReducingPrincipal = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
  firstDueDate,
}) => {
  const loanAmount = Number(principal) || 0;
  const annualRate = Number(rate) || 0;

  const paymentCount = getPaymentCount({
    tenure,
    tenureUnit,
    frequency,
  });

  if (
    loanAmount <= 0 ||
    paymentCount <= 0
  ) {
    return [];
  }

  const periodicRate =
    getPeriodicRate({
      annualRate,
      frequency,
    });

  const principalPerPayment =
    loanAmount / paymentCount;

  const schedule = [];

  let remainingBalance =
    loanAmount;

  for (
    let period = 1;
    period <= paymentCount;
    period++
  ) {
    const openingBalance =
      remainingBalance;

    const interestAmount =
      openingBalance *
      periodicRate;

    const principalAmount =
      period === paymentCount
        ? remainingBalance
        : principalPerPayment;

    const paymentAmount =
      principalAmount +
      interestAmount;

    remainingBalance -=
      principalAmount;

    schedule.push({
      installmentNumber: period,

      dueDate: getNextDueDate(
        firstDueDate,
        frequency,
        period - 1
      ),

      openingBalance:
        roundMoney(
          openingBalance
        ),

      principal:
        roundMoney(
          principalAmount
        ),

      interest:
        roundMoney(
          interestAmount
        ),

      paymentAmount:
        roundMoney(
          paymentAmount
        ),

      closingBalance:
        roundMoney(
          Math.max(
            remainingBalance,
            0
          )
        ),

      status: "Pending",
    });
  }

  return schedule;
};


/* =========================================================
   MASTER FUNCTION
========================================================= */

export const generateRepaymentSchedule = ({
  principal = 0,
  rate = 0,
  tenure = 0,
  tenureUnit = "Months",
  interestType = "Flat",
  repaymentMethod = "EMI",
  frequency = "Monthly",
  firstDueDate = "",
}) => {

  const params = {
    principal,
    rate,
    tenure,
    tenureUnit,
    frequency,
    firstDueDate,
  };

  /*
   * Flat
   */
  if (
    interestType === "Flat" &&
    repaymentMethod === "EMI"
  ) {
    return generateFlatEMI(params);
  }

  if (
    interestType === "Flat" &&
    repaymentMethod === "Principal"
  ) {
    return generateFlatPrincipal(params);
  }

  /*
   * Reducing
   */
  if (
    interestType === "Reducing" &&
    repaymentMethod === "EMI"
  ) {
    return generateReducingEMI(params);
  }

  if (
    interestType === "Reducing" &&
    repaymentMethod === "Principal"
  ) {
    return generateReducingPrincipal(params);
  }

  return [];
};


/* =========================================================
   SCHEDULE TOTALS
========================================================= */

export const calculateScheduleTotals = (
  schedule = []
) => {
  return schedule.reduce(
    (totals, row) => {
      totals.principal +=
        Number(row.principal) || 0;

      totals.interest +=
        Number(row.interest) || 0;

      totals.totalPayable +=
        Number(row.paymentAmount) || 0;

      return totals;
    },
    {
      principal: 0,
      interest: 0,
      totalPayable: 0,
    }
  );
};