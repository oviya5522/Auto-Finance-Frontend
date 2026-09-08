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
 *
 * Flat Interest is ONE calculation type.
 * repaymentMethod is ignored for Flat.
 *
 * Every schedule row stores separate:
 *
 *   principal
 *   interest
 *   paidPrincipal
 *   paidInterest
 *   remainingPrincipal
 *   remainingInterest
 *   penaltyPaidAmount
 *
 * This allows the repayment engine to process:
 *
 * Normal:
 *   Interest -> Principal
 *
 * Overdue:
 *   Penalty -> Interest -> Principal
 *
 * Partial payments are supported.
 * =========================================================
 */


/* =========================================================
   COMMON HELPERS
========================================================= */

export const roundMoney = (
  value
) => {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return 0;
  }

  return (
    Math.round(
      (
        number +
        Number.EPSILON
      ) * 100
    ) / 100
  );
};


const toNumber = (
  value
) => {
  const number =
    Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};


/* =========================================================
   FREQUENCY
========================================================= */

export const normalizeFrequency = (
  frequency = "Monthly"
) => {
  const value =
    String(
      frequency
    )
      .trim()
      .toLowerCase();

  if (
    value === "daily"
  ) {
    return "Daily";
  }

  if (
    value === "weekly"
  ) {
    return "Weekly";
  }

  return "Monthly";
};


/* =========================================================
   TENURE
========================================================= */

/*
 * Convert tenure into years.
 *
 * Examples:
 *
 * 12 Months = 1 year
 * 52 Weeks  = 1 year
 * 365 Days  = 1 year
 * 2 Years   = 2 years
 */

export const tenureToYears = (
  tenure,
  tenureUnit
) => {
  const value =
    toNumber(
      tenure
    );

  if (
    value <= 0
  ) {
    return 0;
  }

  switch (
    String(
      tenureUnit ||
        "Months"
    )
      .trim()
      .toLowerCase()
  ) {
    case "year":
    case "years":
      return value;

    case "week":
    case "weeks":
      return (
        value / 52
      );

    case "day":
    case "days":
      return (
        value / 365
      );

    case "month":
    case "months":
    default:
      return (
        value / 12
      );
  }
};


/* =========================================================
   PAYMENT COUNT
========================================================= */

export const getPaymentCount = ({
  tenure = 0,
  tenureUnit = "Months",
  frequency = "Monthly",
} = {}) => {
  const years =
    tenureToYears(
      tenure,
      tenureUnit
    );

  if (
    years <= 0
  ) {
    return 0;
  }

  let count;

  switch (
    normalizeFrequency(
      frequency
    )
  ) {
    case "Daily":
      count =
        years * 365;
      break;

    case "Weekly":
      count =
        years * 52;
      break;

    case "Monthly":
    default:
      count =
        years * 12;
      break;
  }

  return Math.max(
    1,
    Math.round(
      count
    )
  );
};


/* =========================================================
   PERIODIC INTEREST RATE
========================================================= */

export const getPeriodicRate = ({
  annualRate = 0,
  frequency = "Monthly",
} = {}) => {
  const rate =
    toNumber(
      annualRate
    );

  if (
    rate <= 0
  ) {
    return 0;
  }

  switch (
    normalizeFrequency(
      frequency
    )
  ) {
    case "Daily":
      return (
        rate /
        365 /
        100
      );

    case "Weekly":
      return (
        rate /
        52 /
        100
      );

    case "Monthly":
    default:
      return (
        rate /
        12 /
        100
      );
  }
};


/* =========================================================
   LOCAL DATE HELPERS
========================================================= */

/*
 * Using local-date construction avoids the common:
 *
 * YYYY-MM-DD
 *
 * -> UTC
 *
 * -> previous day in some timezones
 *
 * problem.
 */

const parseLocalDate = (
  value
) => {
  if (
    !value
  ) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    const date =
      new Date(
        value
      );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }

  const raw =
    String(value);

  const match =
    raw.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (
    match
  ) {
    return new Date(
      Number(
        match[1]
      ),
      Number(
        match[2]
      ) - 1,
      Number(
        match[3]
      )
    );
  }

  const date =
    new Date(
      value
    );

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
};


const formatLocalDate = (
  date
) => {
  if (
    !date ||
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return [
    date.getFullYear(),

    String(
      date.getMonth() + 1
    ).padStart(
      2,
      "0"
    ),

    String(
      date.getDate()
    ).padStart(
      2,
      "0"
    ),
  ].join("-");
};


/* =========================================================
   DUE DATE
========================================================= */

/*
 * First due date is installment #1.
 *
 * Example monthly:
 *
 * First due = 2026-01-10
 *
 * EMI 1 = 2026-01-10
 * EMI 2 = 2026-02-10
 * EMI 3 = 2026-03-10
 */

export const getNextDueDate = (
  firstDueDate,
  frequency,
  periodIndex
) => {
  if (
    !firstDueDate
  ) {
    return "";
  }

  const date =
    parseLocalDate(
      firstDueDate
    );

  if (
    !date
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

  return formatLocalDate(
    date
  );
};


/* =========================================================
   SCHEDULE ROW FACTORY
========================================================= */

const createScheduleRow = ({
  installmentNumber,
  dueDate,
  openingBalance,
  principal,
  interest,
  paymentAmount,
  closingBalance,
} = {}) => {
  const normalizedPrincipal =
    roundMoney(
      principal
    );

  const normalizedInterest =
    roundMoney(
      interest
    );

  const normalizedPaymentAmount =
    roundMoney(
      paymentAmount ??
        (
          normalizedPrincipal +
          normalizedInterest
        )
    );

  const normalizedOpeningBalance =
    roundMoney(
      openingBalance
    );

  const normalizedClosingBalance =
    roundMoney(
      Math.max(
        closingBalance,
        0
      )
    );

  return {
    installmentNumber,

    dueDate,

    /*
     * Schedule values.
     */
    openingBalance:
      normalizedOpeningBalance,

    principal:
      normalizedPrincipal,

    interest:
      normalizedInterest,

    paymentAmount:
      normalizedPaymentAmount,

    closingBalance:
      normalizedClosingBalance,

    /*
     * Repayment tracking.
     *
     * Initially nothing is paid.
     */
    paidPrincipal: 0,

    paidInterest: 0,

    remainingPrincipal:
      normalizedPrincipal,

    remainingInterest:
      normalizedInterest,

    paidAmount: 0,

    remainingAmount:
      roundMoney(
        normalizedPrincipal +
          normalizedInterest
      ),

    /*
     * Penalty is calculated later
     * from the loan's penalty settings.
     *
     * It is kept per installment so
     * already-paid penalty is not
     * charged repeatedly.
     */
    penaltyAmount: 0,

    penaltyPaidAmount: 0,

    penaltyDue: 0,

    /*
     * Dates / audit.
     */
    paidAt: null,

    lastPaymentAt: null,

    lastPenaltyPaymentAt:
      null,

    /*
     * Initial status.
     */
    status: "Pending",
  };
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
    toNumber(
      principal
    );

  const R =
    toNumber(
      rate
    );

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
   * Flat interest:
   *
   * P × R × Years / 100
   */
  const totalInterest =
    P *
    R *
    years /
    100;

  const principalPerPayment =
    P /
    paymentCount;

  const interestPerPayment =
    totalInterest /
    paymentCount;

  const schedule = [];

  let remainingPrincipal =
    roundMoney(
      P
    );

  let accumulatedInterest =
    0;

  for (
    let period = 1;
    period <= paymentCount;
    period += 1
  ) {
    const openingBalance =
      roundMoney(
        remainingPrincipal
      );

    /*
     * Final installment absorbs
     * principal rounding.
     */
    const principalAmount =
      period ===
      paymentCount
        ? roundMoney(
            remainingPrincipal
          )
        : roundMoney(
            principalPerPayment
          );

    /*
     * Final installment absorbs
     * interest rounding.
     */
    const interestAmount =
      period ===
      paymentCount
        ? roundMoney(
            Math.max(
              totalInterest -
                accumulatedInterest,
              0
            )
          )
        : roundMoney(
            interestPerPayment
          );

    const paymentAmount =
      roundMoney(
        principalAmount +
          interestAmount
      );

    accumulatedInterest =
      roundMoney(
        accumulatedInterest +
          interestAmount
      );

    remainingPrincipal =
      roundMoney(
        Math.max(
          remainingPrincipal -
            principalAmount,
          0
        )
      );

    const closingBalance =
      roundMoney(
        remainingPrincipal
      );

    schedule.push(
      createScheduleRow({
        installmentNumber:
          period,

        dueDate:
          getNextDueDate(
            firstDueDate,
            frequency,
            period - 1
          ),

        openingBalance,

        principal:
          principalAmount,

        interest:
          interestAmount,

        paymentAmount,

        closingBalance,
      })
    );
  }

  return schedule;
};


/* =========================================================
   2. REDUCING BALANCE + EMI
========================================================= */

const generateReducingEmiSchedule =
  ({
    principal,
    rate,
    tenure,
    tenureUnit,
    frequency,
    firstDueDate,
  }) => {
    const P =
      toNumber(
        principal
      );

    const paymentCount =
      getPaymentCount({
        tenure,
        tenureUnit,
        frequency,
      });

    const periodicRate =
      getPeriodicRate({
        annualRate:
          rate,
        frequency,
      });

    if (
      P <= 0 ||
      paymentCount <= 0
    ) {
      return [];
    }

    let emi = 0;

    /*
     * Zero interest.
     */
    if (
      periodicRate === 0
    ) {
      emi =
        P /
        paymentCount;
    } else {
      /*
       * Standard EMI formula:
       *
       * EMI =
       *
       * P × r × (1+r)^n
       * -----------------
       * (1+r)^n - 1
       */
      const factor =
        Math.pow(
          1 +
            periodicRate,
          paymentCount
        );

      emi =
        P *
        periodicRate *
        factor /
        (factor - 1);
    }

    const schedule = [];

    let remainingBalance =
      roundMoney(
        P
      );

    for (
      let period = 1;
      period <=
      paymentCount;
      period += 1
    ) {
      const openingBalance =
        roundMoney(
          remainingBalance
        );

      /*
       * Interest is always calculated
       * on the opening principal balance.
       */
      let interestAmount =
        openingBalance *
        periodicRate;

      /*
       * Standard principal:
       *
       * EMI - Interest
       */
      let principalAmount =
        emi -
        interestAmount;

      /*
       * Final EMI absorbs rounding.
       */
      if (
        period ===
        paymentCount
      ) {
        principalAmount =
          remainingBalance;
      }

      /*
       * Prevent tiny negative
       * floating-point values.
       */
      principalAmount =
        Math.max(
          principalAmount,
          0
        );

      interestAmount =
        Math.max(
          interestAmount,
          0
        );

      /*
       * Final payment may need
       * to absorb rounding.
       */
      principalAmount =
        Math.min(
          principalAmount,
          remainingBalance
        );

      /*
       * Rebuild payment from
       * actual components.
       */
      const paymentAmount =
        roundMoney(
          principalAmount +
            interestAmount
        );

      remainingBalance =
        roundMoney(
          Math.max(
            remainingBalance -
              principalAmount,
            0
          )
        );

      const closingBalance =
        roundMoney(
          remainingBalance
        );

      schedule.push(
        createScheduleRow({
          installmentNumber:
            period,

          dueDate:
            getNextDueDate(
              firstDueDate,
              frequency,
              period - 1
            ),

          openingBalance,

          principal:
            principalAmount,

          interest:
            interestAmount,

          paymentAmount,

          closingBalance,
        })
      );
    }

    return schedule;
  };


/* =========================================================
   3. REDUCING BALANCE + PRINCIPAL BASED
========================================================= */

const generateReducingPrincipalSchedule =
  ({
    principal,
    rate,
    tenure,
    tenureUnit,
    frequency,
    firstDueDate,
  }) => {
    const P =
      toNumber(
        principal
      );

    const paymentCount =
      getPaymentCount({
        tenure,
        tenureUnit,
        frequency,
      });

    const periodicRate =
      getPeriodicRate({
        annualRate:
          rate,
        frequency,
      });

    if (
      P <= 0 ||
      paymentCount <= 0
    ) {
      return [];
    }

    /*
     * Fixed principal component.
     */
    const fixedPrincipal =
      P /
      paymentCount;

    const schedule = [];

    let remainingBalance =
      roundMoney(
        P
      );

    for (
      let period = 1;
      period <=
      paymentCount;
      period += 1
    ) {
      const openingBalance =
        roundMoney(
          remainingBalance
        );

      /*
       * Interest is calculated
       * on current outstanding principal.
       */
      const interestAmount =
        Math.max(
          openingBalance *
            periodicRate,
          0
        );

      /*
       * Final period absorbs
       * principal rounding.
       */
      const principalAmount =
        period ===
        paymentCount
          ? remainingBalance
          : Math.min(
              roundMoney(
                fixedPrincipal
              ),
              remainingBalance
            );

      const paymentAmount =
        roundMoney(
          principalAmount +
            interestAmount
        );

      remainingBalance =
        roundMoney(
          Math.max(
            remainingBalance -
              principalAmount,
            0
          )
        );

      const closingBalance =
        roundMoney(
          remainingBalance
        );

      schedule.push(
        createScheduleRow({
          installmentNumber:
            period,

          dueDate:
            getNextDueDate(
              firstDueDate,
              frequency,
              period - 1
            ),

          openingBalance,

          principal:
            principalAmount,

          interest:
            interestAmount,

          paymentAmount,

          closingBalance,
        })
      );
    }

    return schedule;
  };


/* =========================================================
   MASTER SCHEDULE GENERATOR
========================================================= */

export const generateRepaymentSchedule =
  ({
    principal = 0,
    rate = 0,
    tenure = 0,
    tenureUnit = "Months",
    interestType = "Flat",
    repaymentMethod = "EMI",
    frequency = "Monthly",
    firstDueDate = "",
  } = {}) => {
    const normalizedInterestType =
      String(
        interestType ||
          "Flat"
      )
        .trim()
        .toLowerCase();

    const normalizedRepaymentMethod =
      String(
        repaymentMethod ||
          "EMI"
      )
        .trim()
        .toLowerCase();

    /*
     * -----------------------------------------------------
     * FLAT
     * -----------------------------------------------------
     *
     * Flat interest has one calculation
     * method. repaymentMethod is ignored.
     */
    if (
      normalizedInterestType ===
      "flat"
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
     * -----------------------------------------------------
     * REDUCING + PRINCIPAL
     * -----------------------------------------------------
     */
    if (
      normalizedRepaymentMethod ===
        "principal" ||
      normalizedRepaymentMethod ===
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
     * -----------------------------------------------------
     * REDUCING + EMI
     * -----------------------------------------------------
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
   SCHEDULE RE-NORMALIZATION
========================================================= */

/*
 * Useful for existing loans created before
 * component-level repayment tracking existed.
 *
 * Existing row:
 *
 * {
 *   principal,
 *   interest,
 *   paymentAmount,
 *   paidAmount
 * }
 *
 * becomes:
 *
 * {
 *   paidInterest,
 *   paidPrincipal,
 *   remainingInterest,
 *   remainingPrincipal,
 *   ...
 * }
 */

export const normalizeRepaymentSchedule =
  (
    schedule = []
  ) => {
    if (
      !Array.isArray(
        schedule
      )
    ) {
      return [];
    }

    return schedule.map(
      (
        row,
        index
      ) => {
        const principal =
          roundMoney(
            row?.principal ??
              row?.principalAmount ??
              0
          );

        const interest =
          roundMoney(
            row?.interest ??
              row?.interestAmount ??
              0
          );

        const paymentAmount =
          roundMoney(
            row?.paymentAmount ??
              row?.emiAmount ??
              row?.amount ??
              principal +
                interest
          );

        /*
         * Existing explicit values
         * are preserved.
         */
        let paidInterest =
          row?.paidInterest;

        let paidPrincipal =
          row?.paidPrincipal;

        const legacyPaidAmount =
          roundMoney(
            row?.paidAmount ??
              0
          );

        /*
         * Migration rule:
         *
         * Interest is paid first.
         * Remaining historical paid amount
         * goes toward principal.
         */
        if (
          paidInterest ===
            undefined ||
          paidInterest ===
            null
        ) {
          paidInterest =
            Math.min(
              interest,
              legacyPaidAmount
            );
        }

        paidInterest =
          roundMoney(
            Math.max(
              paidInterest,
              0
            )
          );

        if (
          paidPrincipal ===
            undefined ||
          paidPrincipal ===
            null
        ) {
          paidPrincipal =
            Math.min(
              principal,
              Math.max(
                legacyPaidAmount -
                  paidInterest,
                0
              )
            );
        }

        paidPrincipal =
          roundMoney(
            Math.max(
              paidPrincipal,
              0
            )
          );

        paidInterest =
          roundMoney(
            Math.min(
              paidInterest,
              interest
            )
          );

        paidPrincipal =
          roundMoney(
            Math.min(
              paidPrincipal,
              principal
            )
          );

        const remainingInterest =
          roundMoney(
            Math.max(
              interest -
                paidInterest,
              0
            )
          );

        const remainingPrincipal =
          roundMoney(
            Math.max(
              principal -
                paidPrincipal,
              0
            )
          );

        const paidAmount =
          roundMoney(
            paidInterest +
              paidPrincipal
          );

        const remainingAmount =
          roundMoney(
            remainingInterest +
              remainingPrincipal
          );

        /*
         * Preserve existing status where
         * meaningful, otherwise derive it.
         */
        let status =
          row?.status ||
          "Pending";

        const normalizedStatus =
          String(
            status
          )
            .trim()
            .toLowerCase();

        if (
          remainingAmount <= 0 &&
          paymentAmount > 0
        ) {
          status =
            "Paid";
        } else if (
          paidAmount > 0 &&
          remainingAmount > 0
        ) {
          status =
            "Partially Paid";
        } else if (
          normalizedStatus ===
            "overdue"
        ) {
          status =
            "Overdue";
        } else {
          status =
            "Pending";
        }

        return {
          ...row,

          installmentNumber:
            row?.installmentNumber ??
            row?.installmentNo ??
            index + 1,

          /*
           * Core schedule.
           */
          principal,

          interest,

          paymentAmount,

          openingBalance:
            roundMoney(
              row?.openingBalance ??
                0
            ),

          closingBalance:
            roundMoney(
              row?.closingBalance ??
                remainingPrincipal
            ),

          /*
           * Component payment state.
           */
          paidPrincipal,

          paidInterest,

          remainingPrincipal,

          remainingInterest,

          paidAmount,

          remainingAmount,

          balance:
            remainingAmount,

          /*
           * Penalty state.
           */
          penaltyAmount:
            roundMoney(
              row?.penaltyAmount ??
                0
            ),

          penaltyPaidAmount:
            roundMoney(
              row?.penaltyPaidAmount ??
                0
            ),

          penaltyDue:
            roundMoney(
              row?.penaltyDue ??
                0
            ),

          /*
           * Audit.
           */
          paidAt:
            row?.paidAt ??
            null,

          lastPaymentAt:
            row?.lastPaymentAt ??
            null,

          lastPenaltyPaymentAt:
            row?.lastPenaltyPaymentAt ??
            null,

          status,
        };
      }
    );
  };


/* =========================================================
   SCHEDULE TOTALS
========================================================= */

export const calculateScheduleTotals = (
  schedule = []
) => {
  const totals =
    schedule.reduce(
      (
        result,
        row
      ) => {
        result.principal +=
          toNumber(
            row?.principal
          );

        result.interest +=
          toNumber(
            row?.interest
          );

        result.totalPayable +=
          toNumber(
            row?.paymentAmount
          );

        result.paidPrincipal +=
          toNumber(
            row?.paidPrincipal
          );

        result.paidInterest +=
          toNumber(
            row?.paidInterest
          );

        result.paidAmount +=
          toNumber(
            row?.paidAmount
          );

        result.remainingPrincipal +=
          toNumber(
            row?.remainingPrincipal
          );

        result.remainingInterest +=
          toNumber(
            row?.remainingInterest
          );

        result.remainingAmount +=
          toNumber(
            row?.remainingAmount
          );

        result.penaltyPaidAmount +=
          toNumber(
            row?.penaltyPaidAmount
          );

        return result;
      },
      {
        principal: 0,
        interest: 0,
        totalPayable: 0,

        paidPrincipal: 0,
        paidInterest: 0,
        paidAmount: 0,

        remainingPrincipal: 0,
        remainingInterest: 0,
        remainingAmount: 0,

        penaltyPaidAmount: 0,
      }
    );

  return {
    principal:
      roundMoney(
        totals.principal
      ),

    interest:
      roundMoney(
        totals.interest
      ),

    totalPayable:
      roundMoney(
        totals.totalPayable
      ),

    paidPrincipal:
      roundMoney(
        totals.paidPrincipal
      ),

    paidInterest:
      roundMoney(
        totals.paidInterest
      ),

    paidAmount:
      roundMoney(
        totals.paidAmount
      ),

    remainingPrincipal:
      roundMoney(
        totals.remainingPrincipal
      ),

    remainingInterest:
      roundMoney(
        totals.remainingInterest
      ),

    remainingAmount:
      roundMoney(
        totals.remainingAmount
      ),

    penaltyPaidAmount:
      roundMoney(
        totals.penaltyPaidAmount
      ),
  };
};


/* =========================================================
   GET SCHEDULE PAYMENT COUNT
========================================================= */

export const getSchedulePaymentCount = (
  schedule = []
) => {
  return Array.isArray(
    schedule
  )
    ? schedule.length
    : 0;
};


/* =========================================================
   GET SCHEDULE OUTSTANDING
========================================================= */

export const getRepaymentScheduleOutstanding =
  (
    schedule = []
  ) => {
    return roundMoney(
      (
        Array.isArray(
          schedule
        )
          ? schedule
          : []
      ).reduce(
        (
          total,
          row
        ) =>
          total +
          toNumber(
            row?.remainingAmount ??
              row?.balance
          ),
        0
      )
    );
  };


/* =========================================================
   GET SCHEDULE PRINCIPAL OUTSTANDING
========================================================= */

export const getRepaymentSchedulePrincipalOutstanding =
  (
    schedule = []
  ) => {
    return roundMoney(
      (
        Array.isArray(
          schedule
        )
          ? schedule
          : []
      ).reduce(
        (
          total,
          row
        ) =>
          total +
          toNumber(
            row?.remainingPrincipal ??
              row?.principal
          ),
        0
      )
    );
  };


/* =========================================================
   GET SCHEDULE INTEREST OUTSTANDING
========================================================= */

export const getRepaymentScheduleInterestOutstanding =
  (
    schedule = []
  ) => {
    return roundMoney(
      (
        Array.isArray(
          schedule
        )
          ? schedule
          : []
      ).reduce(
        (
          total,
          row
        ) =>
          total +
          toNumber(
            row?.remainingInterest ??
              row?.interest
          ),
        0
      )
    );
  };


/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  roundMoney,

  normalizeFrequency,

  tenureToYears,

  getPaymentCount,

  getPeriodicRate,

  getNextDueDate,

  generateRepaymentSchedule,

  normalizeRepaymentSchedule,

  calculateScheduleTotals,

  getSchedulePaymentCount,

  getRepaymentScheduleOutstanding,

  getRepaymentSchedulePrincipalOutstanding,

  getRepaymentScheduleInterestOutstanding,
};