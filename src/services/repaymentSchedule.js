// src/services/repaymentSchedule.js

/*
 * =========================================================
 * REPAYMENT SCHEDULE
 *
 * Supported calculation modes:
 *
 * 1. Flat Interest
 * 2. Reducing Balance + EMI Based
 * 3. Reducing Balance + Principal Based
 *
 * IMPORTANT:
 * Flat Interest is ONE calculation type.
 * repaymentMethod is ignored for Flat.
 * =========================================================
 */


/* =========================================================
   COMMON HELPERS
========================================================= */

export const roundMoney = (value) => {
  return (
    Math.round(
      (Number(value) + Number.EPSILON) * 100
    ) / 100
  );
};


const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};


const normalizeFrequency = (
  frequency = "Monthly"
) => {
  const value = String(
    frequency
  ).toLowerCase();

  if (value === "daily") {
    return "Daily";
  }

  if (value === "weekly") {
    return "Weekly";
  }

  return "Monthly";
};


/* =========================================================
   TENURE
========================================================= */

/*
 * Convert tenure to years.
 */
const tenureToYears = (
  tenure,
  tenureUnit
) => {
  const value = toNumber(tenure);

  if (value <= 0) {
    return 0;
  }

  switch (
    String(
      tenureUnit || "Months"
    ).toLowerCase()
  ) {
    case "year":
    case "years":
      return value;

    case "week":
    case "weeks":
      return value / 52;

    case "day":
    case "days":
      return value / 365;

    case "month":
    case "months":
    default:
      return value / 12;
  }
};


/*
 * Calculate number of payment periods.
 *
 * These rules MUST match loanCalculator.js.
 */
const getPaymentCount = ({
  tenure = 0,
  tenureUnit = "Months",
  frequency = "Monthly",
}) => {
  const years = tenureToYears(
    tenure,
    tenureUnit
  );

  if (years <= 0) {
    return 0;
  }

  const normalizedFrequency =
    normalizeFrequency(
      frequency
    );

  let count;

  switch (normalizedFrequency) {
    case "Daily":
      count = years * 365;
      break;

    case "Weekly":
      count = years * 52;
      break;

    case "Monthly":
    default:
      count = years * 12;
      break;
  }

  return Math.max(
    1,
    Math.round(count)
  );
};


/* =========================================================
   PERIODIC INTEREST RATE
========================================================= */

const getPeriodicRate = ({
  annualRate = 0,
  frequency = "Monthly",
}) => {
  const rate =
    toNumber(annualRate);

  if (rate <= 0) {
    return 0;
  }

  switch (
    normalizeFrequency(
      frequency
    )
  ) {
    case "Daily":
      return rate / 365 / 100;

    case "Weekly":
      return rate / 52 / 100;

    case "Monthly":
    default:
      return rate / 12 / 100;
  }
};


/* =========================================================
   DUE DATE
========================================================= */

const getNextDueDate = (
  firstDueDate,
  frequency,
  periodIndex
) => {
  if (!firstDueDate) {
    return "";
  }

  const date =
    new Date(firstDueDate);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  switch (
    normalizeFrequency(
      frequency
    )
  ) {
    case "Daily":
      date.setDate(
        date.getDate() +
          periodIndex
      );
      break;

    case "Weekly":
      date.setDate(
        date.getDate() +
          periodIndex * 7
      );
      break;

    case "Monthly":
    default:
      date.setMonth(
        date.getMonth() +
          periodIndex
      );
      break;
  }

  return date
    .toISOString()
    .split("T")[0];
};


/* =========================================================
   1. FLAT INTEREST
========================================================= */

const generateFlatSchedule = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
  firstDueDate,
}) => {
  const P =
    toNumber(principal);

  const R =
    toNumber(rate);

  const paymentCount =
    getPaymentCount({
      tenure,
      tenureUnit,
      frequency,
    });

  if (
    P <= 0 ||
    paymentCount <= 0
  ) {
    return [];
  }

  const years =
    tenureToYears(
      tenure,
      tenureUnit
    );

  /*
   * Flat Interest:
   *
   * Interest
   * = P × R × Years / 100
   */

  const totalInterest =
    P * R * years / 100;

  const principalPerPayment =
    P / paymentCount;

  const interestPerPayment =
    totalInterest /
    paymentCount;

  const schedule = [];

  let remainingBalance = P;

  for (
    let period = 1;
    period <= paymentCount;
    period += 1
  ) {
    const openingBalance =
      remainingBalance;

    /*
     * Final payment absorbs
     * principal rounding.
     */
    const principalAmount =
      period === paymentCount
        ? remainingBalance
        : principalPerPayment;

    /*
     * Final payment absorbs
     * interest rounding.
     */
    const interestPaidBefore =
      schedule.reduce(
        (sum, row) =>
          sum +
          Number(row.interest || 0),
        0
      );

    const interestAmount =
      period === paymentCount
        ? Math.max(
            totalInterest -
              interestPaidBefore,
            0
          )
        : interestPerPayment;

    const paymentAmount =
      principalAmount +
      interestAmount;

    remainingBalance =
      Math.max(
        remainingBalance -
          principalAmount,
        0
      );

    schedule.push({
      installmentNumber:
        period,

      dueDate:
        getNextDueDate(
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
          remainingBalance
        ),

      status: "Pending",
    });
  }

  return schedule;
};


/* =========================================================
   2. REDUCING BALANCE + EMI
========================================================= */

const generateReducingEmiSchedule = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
  firstDueDate,
}) => {
  const P =
    toNumber(principal);

  const paymentCount =
    getPaymentCount({
      tenure,
      tenureUnit,
      frequency,
    });

  const periodicRate =
    getPeriodicRate({
      annualRate: rate,
      frequency,
    });

  if (
    P <= 0 ||
    paymentCount <= 0
  ) {
    return [];
  }

  let emi;

  /*
   * Zero interest:
   *
   * EMI = Principal / Payments
   */
  if (periodicRate === 0) {
    emi =
      P / paymentCount;
  } else {
    /*
     * Standard reducing EMI:
     *
     * EMI =
     * P × r × (1+r)^n
     * -------------------
     * (1+r)^n - 1
     */

    const factor =
      Math.pow(
        1 + periodicRate,
        paymentCount
      );

    emi =
      P *
      periodicRate *
      factor /
      (factor - 1);
  }

  const schedule = [];

  let remainingBalance = P;

  for (
    let period = 1;
    period <= paymentCount;
    period += 1
  ) {
    const openingBalance =
      remainingBalance;

    const interestAmount =
      openingBalance *
      periodicRate;

    /*
     * Normally:
     *
     * Principal
     * = EMI - Interest
     */
    let principalAmount =
      emi -
      interestAmount;

    /*
     * Final payment absorbs
     * rounding difference.
     */
    if (
      period === paymentCount
    ) {
      principalAmount =
        remainingBalance;
    }

    const paymentAmount =
      principalAmount +
      interestAmount;

    remainingBalance =
      Math.max(
        remainingBalance -
          principalAmount,
        0
      );

    schedule.push({
      installmentNumber:
        period,

      dueDate:
        getNextDueDate(
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
          remainingBalance
        ),

      status: "Pending",
    });
  }

  return schedule;
};


/* =========================================================
   3. REDUCING BALANCE + PRINCIPAL
========================================================= */

const generateReducingPrincipalSchedule = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
  firstDueDate,
}) => {
  const P =
    toNumber(principal);

  const paymentCount =
    getPaymentCount({
      tenure,
      tenureUnit,
      frequency,
    });

  const periodicRate =
    getPeriodicRate({
      annualRate: rate,
      frequency,
    });

  if (
    P <= 0 ||
    paymentCount <= 0
  ) {
    return [];
  }

  /*
   * Fixed principal each period.
   */
  const fixedPrincipal =
    P / paymentCount;

  const schedule = [];

  let remainingBalance = P;

  for (
    let period = 1;
    period <= paymentCount;
    period += 1
  ) {
    const openingBalance =
      remainingBalance;

    /*
     * Interest is calculated
     * on remaining balance.
     */
    const interestAmount =
      openingBalance *
      periodicRate;

    /*
     * Final payment absorbs
     * rounding difference.
     */
    const principalAmount =
      period === paymentCount
        ? remainingBalance
        : fixedPrincipal;

    const paymentAmount =
      principalAmount +
      interestAmount;

    remainingBalance =
      Math.max(
        remainingBalance -
          principalAmount,
        0
      );

    schedule.push({
      installmentNumber:
        period,

      dueDate:
        getNextDueDate(
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
          remainingBalance
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
  /*
   * Flat is ONE calculation type.
   *
   * repaymentMethod is intentionally
   * ignored.
   */
  if (
    String(
      interestType || "Flat"
    ).toLowerCase() === "flat"
  ) {
    return generateFlatSchedule({
      principal,
      rate,
      tenure,
      tenureUnit,
      frequency,
      firstDueDate,
    });
  }

  /*
   * Reducing Balance.
   */
  if (
    String(
      repaymentMethod || "EMI"
    ).toLowerCase() ===
      "principal" ||
    String(
      repaymentMethod || "EMI"
    ).toLowerCase() ===
      "principal based"
  ) {
    return generateReducingPrincipalSchedule({
      principal,
      rate,
      tenure,
      tenureUnit,
      frequency,
      firstDueDate,
    });
  }

  /*
   * Default:
   * Reducing Balance + EMI
   */
  return generateReducingEmiSchedule({
    principal,
    rate,
    tenure,
    tenureUnit,
    frequency,
    firstDueDate,
  });
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
        Number(
          row.principal || 0
        );

      totals.interest +=
        Number(
          row.interest || 0
        );

      totals.totalPayable +=
        Number(
          row.paymentAmount || 0
        );

      return totals;
    },
    {
      principal: 0,
      interest: 0,
      totalPayable: 0,
    }
  );
};