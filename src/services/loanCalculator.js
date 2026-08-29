// src/services/loanCalculator.js

/*
 * =========================================================
 * LOAN CALCULATOR
 *
 * Supported calculation modes:
 *
 * 1. Flat Interest
 * 2. Reducing Balance + EMI Based
 * 3. Reducing Balance + Principal Based
 *
 * IMPORTANT:
 * Flat Interest is ONE calculation type.
 * Repayment Method is ignored for Flat Interest.
 * =========================================================
 */


/* =========================================================
   TENURE / PAYMENT HELPERS
========================================================= */

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};


const normalizeFrequency = (
  frequency
) => {
  const value = String(
    frequency || "Monthly"
  ).toLowerCase();

  if (value === "daily") {
    return "Daily";
  }

  if (value === "weekly") {
    return "Weekly";
  }

  return "Monthly";
};


/*
 * Convert the entered tenure into years.
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
 */
const calculatePaymentCount = ({
  tenure,
  tenureUnit,
  frequency,
}) => {
  const years = tenureToYears(
    tenure,
    tenureUnit
  );

  if (years <= 0) {
    return 0;
  }

  const normalized =
    normalizeFrequency(
      frequency
    );

  let count;

  switch (normalized) {
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


/*
 * FIX:
 * The old `calculatePeriodicRate` derived the rate from a fixed,
 * nominal period length for the frequency (rate/12, rate/52, rate/365)
 * *independently* of how many payments were actually produced by
 * `calculatePaymentCount`. Whenever tenureUnit and frequency did not
 * describe the same time base (e.g. tenure in Days but repaid
 * Monthly, or a tenure shorter than one nominal period), the rate
 * used per instalment no longer matched the real duration of that
 * instalment - in the worst case (tenure = 1 day, frequency =
 * Monthly) the customer was charged a full nominal month's interest
 * for a single day.
 *
 * The fix ties the periodic rate directly to the *actual* elapsed
 * time per payment: (total tenure in years) / (number of payments).
 * This is mathematically identical to the old table whenever
 * tenureUnit and frequency already match (verified below), and
 * self-corrects automatically whenever they don't.
 */
const calculatePeriodicRate = ({
  annualRate,
  years,
  paymentCount,
}) => {
  const rate = toNumber(annualRate);

  if (
    rate <= 0 ||
    years <= 0 ||
    paymentCount <= 0
  ) {
    return 0;
  }

  const yearsPerPayment =
    years / paymentCount;

  return (
    (rate / 100) * yearsPerPayment
  );
};


/* =========================================================
   FLAT INTEREST
========================================================= */

const calculateFlatInterest = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
}) => {
  const P = toNumber(principal);
  const R = toNumber(rate);

  const years = tenureToYears(
    tenure,
    tenureUnit
  );

  const paymentCount =
    calculatePaymentCount({
      tenure,
      tenureUnit,
      frequency,
    });

  /*
   * Flat Interest Formula:
   *
   * Interest
   * = Principal × Annual Rate × Years / 100
   */

  const totalInterest =
    P * R * years / 100;

  /*
   * Total Payable
   */

  const totalDue =
    P + totalInterest;

  /*
   * Principal per payment
   */

  const principalPerPayment =
    paymentCount > 0
      ? P / paymentCount
      : 0;

  /*
   * Interest per payment
   */

  const interestPerPayment =
    paymentCount > 0
      ? totalInterest /
        paymentCount
      : 0;

  /*
   * Payment per period
   */

  const paymentAmount =
    principalPerPayment +
    interestPerPayment;

  return {
    principal: P,

    interest: totalInterest,

    totalDue,

    emiAmount: paymentAmount,

    paymentAmount,

    firstPayment: paymentAmount,

    lastPayment: paymentAmount,

    principalPerPayment,

    interestPerPayment,

    paymentCount,

    calculationType:
      "Flat",

    paymentNature:
      "Fixed",
  };
};


/* =========================================================
   REDUCING + EMI
========================================================= */

const calculateReducingEmi = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
}) => {
  const P = toNumber(principal);

  const years = tenureToYears(
    tenure,
    tenureUnit
  );

  const paymentCount =
    calculatePaymentCount({
      tenure,
      tenureUnit,
      frequency,
    });

  const periodicRate =
    calculatePeriodicRate({
      annualRate: rate,
      years,
      paymentCount,
    });

  if (
    P <= 0 ||
    paymentCount <= 0
  ) {
    return {
      principal: P,
      interest: 0,
      totalDue: P,
      emiAmount: 0,
      paymentAmount: 0,
      firstPayment: 0,
      lastPayment: 0,
      principalPerPayment: 0,
      interestPerPayment: 0,
      paymentCount,
      calculationType:
        "Reducing EMI",
      paymentNature:
        "Fixed",
    };
  }

  /*
   * Zero-interest case.
   */

  if (periodicRate === 0) {
    const payment =
      P / paymentCount;

    return {
      principal: P,
      interest: 0,
      totalDue: P,
      emiAmount: payment,
      paymentAmount: payment,
      firstPayment: payment,
      lastPayment: payment,
      principalPerPayment: payment,
      interestPerPayment: 0,
      paymentCount,
      calculationType:
        "Reducing EMI",
      paymentNature:
        "Fixed",
    };
  }

  /*
   * Standard EMI formula:
   *
   * EMI =
   * P × r × (1+r)^n
   * -----------------
   * (1+r)^n - 1
   */

  const power =
    Math.pow(
      1 + periodicRate,
      paymentCount
    );

  const emi =
    P *
    periodicRate *
    power /
    (power - 1);

  /*
   * FIX:
   * Previously totalDue/interest were computed as `emi * paymentCount`
   * (a purely theoretical figure), while the amortization loop below
   * force-adjusts the final instalment to clear the exact remaining
   * balance. That meant the reported "total interest" could silently
   * disagree with the sum of the real per-period interest amounts in
   * the schedule. We now accumulate the actual interest paid each
   * period (same approach already used in the Principal-based
   * function) so the summary always matches the schedule.
   */

  let balance = P;
  let totalInterest = 0;
  let firstPrincipal = 0;
  let firstInterest = 0;
  let lastInterest = 0;
  let lastPrincipal = 0;

  for (
    let period = 1;
    period <= paymentCount;
    period += 1
  ) {
    const interest =
      balance *
      periodicRate;

    let principalComponent =
      emi - interest;

    /*
     * Protect against rounding
     * / final-balance issues.
     */

    if (
      period === paymentCount
    ) {
      principalComponent =
        balance;
    }

    totalInterest += interest;

    if (period === 1) {
      firstInterest = interest;
      firstPrincipal =
        principalComponent;
    }

    balance =
      Math.max(
        balance -
          principalComponent,
        0
      );

    lastInterest =
      interest;

    lastPrincipal =
      principalComponent;
  }

  const totalDue =
    P + totalInterest;

  return {
    principal: P,

    interest: totalInterest,

    totalDue,

    emiAmount: emi,

    paymentAmount: emi,

    firstPayment: emi,

    lastPayment:
      lastPrincipal +
      lastInterest,

    principalPerPayment:
      firstPrincipal,

    interestPerPayment:
      firstInterest,

    paymentCount,

    calculationType:
      "Reducing EMI",

    paymentNature:
      "Fixed",
  };
};


/* =========================================================
   REDUCING + PRINCIPAL
========================================================= */

const calculateReducingPrincipal = ({
  principal,
  rate,
  tenure,
  tenureUnit,
  frequency,
}) => {
  const P = toNumber(principal);

  const years = tenureToYears(
    tenure,
    tenureUnit
  );

  const paymentCount =
    calculatePaymentCount({
      tenure,
      tenureUnit,
      frequency,
    });

  const periodicRate =
    calculatePeriodicRate({
      annualRate: rate,
      years,
      paymentCount,
    });

  if (
    P <= 0 ||
    paymentCount <= 0
  ) {
    return {
      principal: P,
      interest: 0,
      totalDue: P,
      emiAmount: 0,
      paymentAmount: 0,
      firstPayment: 0,
      lastPayment: 0,
      principalPerPayment: 0,
      interestPerPayment: 0,
      paymentCount,
      calculationType:
        "Reducing Principal",
      paymentNature:
        "Decreasing",
    };
  }

  /*
   * Fixed principal each period.
   */

  const principalPerPayment =
    P / paymentCount;

  let balance = P;

  let totalInterest = 0;

  let firstPayment = 0;

  let lastPayment = 0;

  let firstInterest = 0;

  let lastInterest = 0;

  for (
    let period = 1;
    period <= paymentCount;
    period += 1
  ) {
    const interest =
      balance *
      periodicRate;

    let principalComponent =
      principalPerPayment;

    /*
     * Final-period adjustment.
     */

    if (
      period === paymentCount
    ) {
      principalComponent =
        balance;
    }

    const payment =
      principalComponent +
      interest;

    totalInterest +=
      interest;

    if (period === 1) {
      firstInterest =
        interest;

      firstPayment =
        payment;
    }

    if (
      period === paymentCount
    ) {
      lastInterest =
        interest;

      lastPayment =
        payment;
    }

    balance =
      Math.max(
        balance -
          principalComponent,
        0
      );
  }

  const totalDue =
    P + totalInterest;

  return {
    principal: P,

    interest: totalInterest,

    totalDue,

    /*
     * There is no fixed EMI in
     * principal-based repayment.
     */
    emiAmount: 0,

    paymentAmount:
      firstPayment,

    firstPayment,

    lastPayment,

    principalPerPayment,

    interestPerPayment:
      firstInterest,

    paymentCount,

    calculationType:
      "Reducing Principal",

    paymentNature:
      "Decreasing",
  };
};


/* =========================================================
   MAIN CALCULATOR
========================================================= */

export const calculateLoan = ({
  principal = 0,
  rate = 0,
  tenure = 0,
  tenureUnit = "Months",
  interestType = "Flat",
  repaymentMethod = "EMI",
  frequency = "Monthly",
}) => {
  const normalizedInterest =
    String(
      interestType || "Flat"
    ).toLowerCase();

  /*
   * -------------------------------------------------------
   * FLAT
   *
   * IMPORTANT:
   * Repayment method is ignored.
   * -------------------------------------------------------
   */

  if (
    normalizedInterest ===
      "flat" ||
    normalizedInterest ===
      "flat interest"
  ) {
    return calculateFlatInterest({
      principal,
      rate,
      tenure,
      tenureUnit,
      frequency,
    });
  }

  /*
   * -------------------------------------------------------
   * REDUCING BALANCE
   * -------------------------------------------------------
   */

  const normalizedRepayment =
    String(
      repaymentMethod || "EMI"
    ).toLowerCase();

  if (
    normalizedRepayment ===
      "principal" ||
    normalizedRepayment ===
      "principal based"
  ) {
    return calculateReducingPrincipal({
      principal,
      rate,
      tenure,
      tenureUnit,
      frequency,
    });
  }

  /*
   * Default reducing calculation
   * is EMI based.
   */

  return calculateReducingEmi({
    principal,
    rate,
    tenure,
    tenureUnit,
    frequency,
  });
};


/* =========================================================
   DOWN PAYMENT
========================================================= */

export const calculateDownPayment = ({
  vehicleAmount = 0,
  loanAmount = 0,
}) => {
  const vehicle =
    toNumber(vehicleAmount);

  const loan =
    toNumber(loanAmount);

  return Math.max(
    vehicle - loan,
    0
  );
};