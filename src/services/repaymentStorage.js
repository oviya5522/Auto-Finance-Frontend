// src/services/repaymentStorage.js

import {
  getCustomers,
  saveCustomers,
} from "./customerStorage";

/* =========================================================
   CONSTANTS
========================================================= */

export const REPAYMENT_STATUS = {
  PENDING: "Pending",
  PARTIALLY_PAID: "Partially Paid",
  PAID: "Paid",
  OVERDUE: "Overdue",
  CLOSED: "Closed",
  FORECLOSED: "Foreclosed",
};

export const PAYMENT_ALLOCATION_TYPE = {
  PENALTY: "Penalty",
  INTEREST: "Interest",
  OVERDUE_INTEREST: "Overdue Interest",
  CURRENT_INTEREST: "Current Interest",
  ADVANCE_INTEREST: "Advance Interest",
  PRINCIPAL: "Principal",
  OVERDUE_PRINCIPAL: "Overdue Principal",
  CURRENT_PRINCIPAL: "Current Principal",
  ADVANCE_PRINCIPAL: "Advance Principal",
  OVERDUE: "Overdue",
  CURRENT_DUE: "Current Due",
  ADVANCE: "Advance",
  EXCESS: "Excess",
};

export const DEFAULT_ALLOCATION_ORDER = [
  PAYMENT_ALLOCATION_TYPE.PENALTY,
  PAYMENT_ALLOCATION_TYPE.OVERDUE_INTEREST,
  PAYMENT_ALLOCATION_TYPE.OVERDUE_PRINCIPAL,
  PAYMENT_ALLOCATION_TYPE.CURRENT_INTEREST,
  PAYMENT_ALLOCATION_TYPE.CURRENT_PRINCIPAL,
  PAYMENT_ALLOCATION_TYPE.ADVANCE_INTEREST,
  PAYMENT_ALLOCATION_TYPE.ADVANCE_PRINCIPAL,
  PAYMENT_ALLOCATION_TYPE.EXCESS,
];

/* =========================================================
   EVENT
========================================================= */

const DATA_UPDATED_EVENT =
  "auto-finance:data-updated";

/* =========================================================
   BASIC HELPERS
========================================================= */

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const nowIso = () =>
  new Date().toISOString();

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

export const roundMoney = (value) => {
  return (
    Math.round(
      (toNumber(value) + Number.EPSILON) *
        100
    ) / 100
  );
};

const emitDataUpdated = () => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      DATA_UPDATED_EVENT
    )
  );
};

/* =========================================================
   DATE HELPERS
========================================================= */

export const parseLocalDate = (
  value
) => {
  if (!value) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    const date =
      new Date(value);

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

  if (match) {
    return new Date(
      Number(match[1]),
      Number(match[2]) - 1,
      Number(match[3])
    );
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
};

export const startOfDay = (
  value
) => {
  const date =
    parseLocalDate(value);

  if (!date) {
    return null;
  }

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
};

export const getDateKey = (
  value
) => {
  const date =
    startOfDay(value);

  if (!date) {
    return "";
  }

  return [
    date.getFullYear(),
    String(
      date.getMonth() + 1
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
};

export const getTodayKey = () =>
  getDateKey(
    new Date()
  );

const compareDates = (
  a,
  b
) => {
  const aDate =
    startOfDay(a);

  const bDate =
    startOfDay(b);

  return (
    (aDate?.getTime() ??
      Number.MAX_SAFE_INTEGER) -
    (bDate?.getTime() ??
      Number.MAX_SAFE_INTEGER)
  );
};

/* =========================================================
   LOAN STATUS HELPERS
========================================================= */

export const isForeclosedLoan = (
  loan
) => {
  return (
    normalize(
      loan?.status
    ) ===
    "foreclosed"
  );
};

export const isClosedLoan = (
  loan
) => {
  const status =
    normalize(
      loan?.status
    );

  return [
    "closed",
    "paid",
    "paid off",
    "paid_off",
    "settled",
  ].includes(
    status
  );
};

export const isLoanClosedLike = (
  loan
) => {
  return (
    isClosedLoan(loan) ||
    isForeclosedLoan(loan)
  );
};

export const isOpenLoan = (
  loan
) => {
  return !isLoanClosedLike(
    loan
  );
};

export const isCompletedScheduleStatus = (
  status
) => {
  return [
    "paid",
    "completed",
    "closed",
    "settled",
    "foreclosed",
  ].includes(
    normalize(status)
  );
};

export const isOpenScheduleStatus = (
  status
) => {
  return [
    "pending",
    "overdue",
    "due",
    "due today",
    "partially paid",
    "partially-paid",
    "partial",
  ].includes(
    normalize(status)
  );
};

/* =========================================================
   LOAN IDENTIFIERS
========================================================= */

export const getLoanId = (
  loan
) => {
  return (
    loan?.id ||
    loan?.loanNumber ||
    ""
  );
};

export const getLoanNumber = (
  loan
) => {
  return (
    loan?.loanNumber ||
    ""
  );
};

export const getCustomerId = (
  customerRecord
) => {
  return (
    customerRecord
      ?.customer?.id ||
    customerRecord
      ?.customer?.customerId ||
    customerRecord
      ?.customer?.customerNumber ||
    ""
  );
};

/* =========================================================
   FIND CUSTOMER + LOAN
========================================================= */

export const findCustomerLoan = ({
  customerId = "",
  loanId = "",
  loanNumber = "",
} = {}) => {
  const customers =
    getCustomers();

  /* -------------------------------------------------------
     Customer + Loan
  ------------------------------------------------------- */

  for (
    const customerRecord of customers
  ) {
    const recordCustomerId =
      getCustomerId(
        customerRecord
      );

    const customerMatches =
      !customerId ||
      String(
        recordCustomerId
      ) ===
        String(customerId);

    if (
      !customerMatches
    ) {
      continue;
    }

    const loans = [
      customerRecord?.loan,
      ...(Array.isArray(customerRecord?.loans)
        ? customerRecord.loans
        : []),
    ].filter(Boolean);

    const loan = loans.find((item) =>
      (
        loanId &&
        String(item?.id || "") ===
          String(loanId)
      ) ||
      (
        loanNumber &&
        String(item?.loanNumber || "") ===
          String(loanNumber)
      )
    );

    if (loan) {
      return {
        customer:
          customerRecord,
        loan,
      };
    }
  }

  /* -------------------------------------------------------
     Loan only
  ------------------------------------------------------- */

  for (
    const customerRecord of customers
  ) {
    const loans = [
      customerRecord?.loan,
      ...(Array.isArray(customerRecord?.loans)
        ? customerRecord.loans
        : []),
    ].filter(Boolean);

    const loan = loans.find((item) =>
      (
        loanId &&
        String(item?.id || "") ===
          String(loanId)
      ) ||
      (
        loanNumber &&
        String(item?.loanNumber || "") ===
          String(loanNumber)
      )
    );

    if (loan) {
      return {
        customer:
          customerRecord,
        loan,
      };
    }
  }

  return null;
};

/* =========================================================
   COLLECTION HELPERS
========================================================= */

export const getCollectionAmount = (
  collection
) => {
  return roundMoney(
    collection?.amount ??
      0
  );
};

export const getCollectionPenalty = (
  collection
) => {
  return roundMoney(
    collection?.penaltyAmount ??
      0
  );
};

/* =========================================================
   PENALTY CONFIGURATION
========================================================= */

/*
 * Preferred structure:
 *
 * loan.charges.penalty = {
 *   enabled: true,
 *   type: "Fixed",
 *   amount: 100,
 *   graceDays: 5,
 *   maxAmount: 500
 * }
 *
 * Supported:
 *
 * Fixed
 *     One penalty amount after grace period.
 *
 * Per Day
 *     penalty amount × penalty days.
 *
 * Example:
 *
 * Due Date       = 1st
 * Grace Days     = 5
 *
 * Day 1-5        = ₹0 penalty
 * Day 6          = penalty starts
 * Day 7          = one more per-day amount
 * ...
 *
 * IMPORTANT:
 * penaltyPaidAmount is now tracked per installment.
 */

export const getPenaltyConfig = (
  loan
) => {
  const charges =
    loan?.charges ||
    {};

  const penalty =
    charges?.penalty ||
    {};

  const graceDays =
    Math.max(
      0,
      Math.floor(
        toNumber(
          penalty?.graceDays ??
            charges?.graceDays ??
            0
        )
      )
    );

  const enabled =
    penalty?.enabled !==
    false;

  const rawType =
    penalty?.type ||
    "Fixed";

  const type =
    normalize(rawType) ===
    "per day"
      ? "Per Day"
      : "Fixed";

  const amount =
    Math.max(
      0,
      roundMoney(
        penalty?.amount ??
          charges?.defaultInterest ??
          0
      )
    );

  const maxAmount =
    Math.max(
      0,
      roundMoney(
        penalty?.maxAmount ??
          0
      )
    );

  return {
    enabled,
    graceDays,
    type,
    amount,
    maxAmount,
  };
};

/* =========================================================
   OVERDUE DAYS
========================================================= */

export const getOverdueDays = (
  dueDate,
  referenceDate = new Date()
) => {
  const due =
    startOfDay(
      dueDate
    );

  const today =
    startOfDay(
      referenceDate
    );

  if (
    !due ||
    !today
  ) {
    return 0;
  }

  if (
    due.getTime() >=
    today.getTime()
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (
        today.getTime() -
        due.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    )
  );
};

/* =========================================================
   SCHEDULE COMPONENT HELPERS
========================================================= */

const getOriginalPrincipal = (
  row
) => {
  return roundMoney(
    row?.principal ??
      0
  );
};

const getOriginalInterest = (
  row
) => {
  return roundMoney(
    row?.interest ??
      0
  );
};

const getStoredPaidInterest = (
  row
) => {
  return roundMoney(
    row?.paidInterest ??
      0
  );
};

const getStoredPaidPrincipal = (
  row
) => {
  return roundMoney(
    row?.paidPrincipal ??
      0
  );
};

const getLegacyPaidAmount = (
  row
) => {
  return roundMoney(
    row?.paidAmount ??
      0
  );
};

/*
 * Existing records may only contain:
 *
 * paidAmount
 *
 * For those old records we reconstruct
 * the component allocation using:
 *
 * Interest first
 * Principal second
 */
const derivePaidInterest = (
  row
) => {
  const explicit =
    row?.paidInterest;

  if (
    explicit !==
      undefined &&
    explicit !== null
  ) {
    return roundMoney(
      Math.min(
        getOriginalInterest(
          row
        ),
        Math.max(
          toNumber(
            explicit
          ),
          0
        )
      )
    );
  }

  const legacyPaid =
    getLegacyPaidAmount(
      row
    );

  return roundMoney(
    Math.min(
      getOriginalInterest(
        row
      ),
      legacyPaid
    )
  );
};

const derivePaidPrincipal = (
  row
) => {
  const explicit =
    row?.paidPrincipal;

  if (
    explicit !==
      undefined &&
    explicit !== null
  ) {
    return roundMoney(
      Math.min(
        getOriginalPrincipal(
          row
        ),
        Math.max(
          toNumber(
            explicit
          ),
          0
        )
      )
    );
  }

  const legacyPaid =
    getLegacyPaidAmount(
      row
    );

  const interestPaid =
    derivePaidInterest(
      row
    );

  return roundMoney(
    Math.min(
      getOriginalPrincipal(
        row
      ),
      Math.max(
        legacyPaid -
          interestPaid,
        0
      )
    )
  );
};

export const getSchedulePrincipalRemaining = (
  row
) => {
  return roundMoney(
    Math.max(
      getOriginalPrincipal(
        row
      ) -
        derivePaidPrincipal(
          row
        ),
      0
    )
  );
};

export const getScheduleInterestRemaining = (
  row
) => {
  return roundMoney(
    Math.max(
      getOriginalInterest(
        row
      ) -
        derivePaidInterest(
          row
        ),
      0
    )
  );
};

export const getSchedulePrincipalPaidAmount = (
  row
) => {
  return derivePaidPrincipal(
    row
  );
};

export const getScheduleInterestPaidAmount = (
  row
) => {
  return derivePaidInterest(
    row
  );
};

/* =========================================================
   SCHEDULE AMOUNTS
========================================================= */

export const getScheduleAmount = (
  row
) => {
  const explicitPayment =
    row?.paymentAmount ??
    row?.emiAmount ??
    row?.amount;

  if (
    explicitPayment !==
      undefined &&
    explicitPayment !==
      null
  ) {
    return roundMoney(
      explicitPayment
    );
  }

  return roundMoney(
    getOriginalPrincipal(
      row
    ) +
      getOriginalInterest(
        row
      )
  );
};

export const getSchedulePaidAmount = (
  row
) => {
  const explicit =
    row?.paidAmount;

  if (
    explicit !==
      undefined &&
    explicit !== null
  ) {
    return roundMoney(
      Math.max(
        toNumber(explicit),
        0
      )
    );
  }

  return roundMoney(
    derivePaidInterest(
      row
    ) +
      derivePaidPrincipal(
        row
      )
  );
};

export const getScheduleRemainingAmount = (
  row
) => {
  const explicitRemaining =
    row?.remainingAmount ??
    row?.balance;

  /*
   * For enhanced schedules we prefer
   * principal + interest component balances.
   */
  const enhanced =
    row?.principal !==
      undefined ||
    row?.interest !==
      undefined;

  if (
    enhanced
  ) {
    return roundMoney(
      Math.max(
        getScheduleInterestRemaining(
          row
        ) +
          getSchedulePrincipalRemaining(
            row
          ),
        0
      )
    );
  }

  if (
    explicitRemaining !==
      undefined &&
    explicitRemaining !==
      null
  ) {
    return roundMoney(
      Math.max(
        toNumber(
          explicitRemaining
        ),
        0
      )
    );
  }

  return roundMoney(
    Math.max(
      getScheduleAmount(
        row
      ) -
        getSchedulePaidAmount(
          row
        ),
      0
    )
  );
};

export const getScheduleDisplayStatus = (
  row,
  referenceDate = new Date()
) => {
  const remainingAmount =
    getScheduleRemainingAmount(
      row
    );

  const paidAmount =
    getSchedulePaidAmount(
      row
    );

  if (
    remainingAmount <= 0
  ) {
    return "Paid";
  }

  if (
    paidAmount > 0
  ) {
    return "Partially Paid";
  }

  if (
    String(
      row?.status || ""
    )
      .trim()
      .toLowerCase() ===
      "overdue" ||
    getOverdueDays(
      row?.dueDate,
      referenceDate
    ) > 0
  ) {
    return "Overdue";
  }

  return "Pending";
};

/* =========================================================
   PENALTY CALCULATION
========================================================= */

export const calculatePenaltyForInstallment =
  ({
    loan,
    scheduleRow,
    referenceDate = new Date(),
  } = {}) => {
    const baseRemaining =
      getScheduleRemainingAmount(
        scheduleRow
      );

    const dueDate =
      scheduleRow?.dueDate;

    const config =
      getPenaltyConfig(
        loan
      );

    const overdueDays =
      getOverdueDays(
        dueDate,
        referenceDate
      );

    const alreadyPaidPenalty =
      Math.max(
        0,
        roundMoney(
          scheduleRow
            ?.penaltyPaidAmount ??
            0
        )
      );

    if (
      baseRemaining <= 0 ||
      !config.enabled ||
      overdueDays <=
        config.graceDays
    ) {
      return {
        overdueDays,
        graceDays:
          config.graceDays,
        penaltyDays: 0,
        penaltyAmount: 0,
        grossPenaltyAmount: 0,
        penaltyPaidAmount:
          alreadyPaidPenalty,
        penaltyType:
          config.type,
        penaltyRate:
          config.amount,
        penaltyDue: 0,
      };
    }

    /*
     * Example:
     *
     * grace = 5
     * overdue = 6
     *
     * penaltyDays = 1
     *
     * So penalty starts on day 6.
     */
    const penaltyDays =
      Math.max(
        0,
        overdueDays -
          config.graceDays
      );

    let grossPenaltyAmount =
      0;

    if (
      normalize(
        config.type
      ) ===
      "per day"
    ) {
      grossPenaltyAmount =
        config.amount *
        penaltyDays;
    } else {
      /*
       * Fixed:
       * one penalty amount after grace.
       */
      grossPenaltyAmount =
        config.amount;
    }

    if (
      config.maxAmount > 0
    ) {
      grossPenaltyAmount =
        Math.min(
          grossPenaltyAmount,
          config.maxAmount
        );
    }

    /*
     * IMPORTANT:
     *
     * Already paid penalty is deducted.
     *
     * This prevents charging the same
     * penalty repeatedly.
     */
    const penaltyDue =
      roundMoney(
        Math.max(
          grossPenaltyAmount -
            alreadyPaidPenalty,
          0
        )
      );

    return {
      overdueDays,
      graceDays:
        config.graceDays,
      penaltyDays,
      penaltyAmount:
        penaltyDue,
      grossPenaltyAmount:
        roundMoney(
          grossPenaltyAmount
        ),
      penaltyPaidAmount:
        alreadyPaidPenalty,
      penaltyType:
        config.type,
      penaltyRate:
        config.amount,
      penaltyDue,
    };
  };

/* =========================================================
   NORMALIZE SCHEDULE
========================================================= */

export const normalizeSchedule = (
  loan
) => {
  const schedule =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];

  return schedule.map(
    (
      row,
      index
    ) => {
      const principal =
        getOriginalPrincipal(
          row
        );

      const interest =
        getOriginalInterest(
          row
        );

      /*
       * Enhanced component tracking.
       */
      const paidInterest =
        derivePaidInterest(
          row
        );

      const paidPrincipal =
        derivePaidPrincipal(
          row
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

      const paymentAmount =
        roundMoney(
          principal +
            interest
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

      let status =
        normalize(
          row?.status
        );

      if (
        remainingAmount <=
          0 &&
        paymentAmount > 0
      ) {
        status =
          "paid";
      } else if (
        paidAmount > 0 &&
        remainingAmount > 0
      ) {
        status =
          "partially paid";
      } else if (
        !isOpenScheduleStatus(
          status
        )
      ) {
        status =
          "pending";
      }

      let displayStatus =
        REPAYMENT_STATUS.PENDING;

      if (
        status ===
          "partially paid" ||
        status ===
          "partially-paid"
      ) {
        displayStatus =
          REPAYMENT_STATUS.PARTIALLY_PAID;
      } else if (
        status ===
        "paid"
      ) {
        displayStatus =
          REPAYMENT_STATUS.PAID;
      } else if (
        status ===
        "overdue"
      ) {
        displayStatus =
          REPAYMENT_STATUS.OVERDUE;
      } else {
        displayStatus =
          REPAYMENT_STATUS.PENDING;
      }

      return {
        ...row,

        installmentNumber:
          row?.installmentNumber ??
          row?.installmentNo ??
          index + 1,

        paymentAmount,

        principal,

        interest,

        /*
         * New component tracking.
         */
        paidInterest,

        paidPrincipal,

        remainingInterest,

        remainingPrincipal,

        /*
         * Combined fields.
         */
        paidAmount,

        balance:
          remainingAmount,

        remainingAmount,

        /*
         * Penalty tracking.
         */
        penaltyPaidAmount:
          roundMoney(
            row?.penaltyPaidAmount ??
              0
          ),

        status:
          displayStatus,
      };
    }
  );
};

/* =========================================================
   OPEN SCHEDULE
========================================================= */

export const getOpenScheduleRows = (
  loan
) => {
  return normalizeSchedule(
    loan
  )
    .filter(
      (row) =>
        getScheduleRemainingAmount(
          row
        ) > 0
    )
    .sort(
      (a, b) =>
        compareDates(
          a?.dueDate,
          b?.dueDate
        )
    );
};

/* =========================================================
   REPAYMENT BUCKETS
========================================================= */

export const getRepaymentBuckets = (
  loan,
  referenceDate = new Date()
) => {
  const today =
    startOfDay(
      referenceDate
    );

  if (
    !today ||
    isLoanClosedLike(
      loan
    )
  ) {
    return {
      overdue: [],
      currentDue: [],
      future: [],
    };
  }

  const rows =
    getOpenScheduleRows(
      loan
    );

  const overdue = [];
  const currentDue = [];
  const future = [];

  rows.forEach(
    (row) => {
      const dueDate =
        startOfDay(
          row?.dueDate
        );

      if (!dueDate) {
        return;
      }

      if (
        dueDate.getTime() <
        today.getTime()
      ) {
        overdue.push(
          row
        );
      } else if (
        dueDate.getTime() ===
        today.getTime()
      ) {
        currentDue.push(
          row
        );
      } else {
        future.push(
          row
        );
      }
    }
  );

  return {
    overdue,
    currentDue,
    future,
  };
};

/* =========================================================
   PENALTY SUMMARY
========================================================= */

export const getOutstandingPenaltySummary =
  (
    loan,
    referenceDate = new Date()
  ) => {
    const {
      overdue,
    } =
      getRepaymentBuckets(
        loan,
        referenceDate
      );

    return overdue.reduce(
      (
        total,
        row
      ) => {
        const penalty =
          calculatePenaltyForInstallment(
            {
              loan,
              scheduleRow:
                row,
              referenceDate,
            }
          );

        return {
          amount:
            roundMoney(
              total.amount +
                penalty.penaltyAmount
            ),

          rows:
            total.rows.concat({
              ...row,
              ...penalty,
            }),
        };
      },
      {
        amount: 0,
        rows: [],
      }
    );
  };

/* =========================================================
   OUTSTANDING
========================================================= */

export const getScheduleOutstanding =
  (
    loan
  ) => {
    return roundMoney(
      getOpenScheduleRows(
        loan
      ).reduce(
        (
          total,
          row
        ) =>
          total +
          getScheduleRemainingAmount(
            row
          ),
        0
      )
    );
  };

export const getLoanPaymentOutstanding =
  getScheduleOutstanding;

/* =========================================================
   COMPONENT OUTSTANDING
========================================================= */

export const getLoanInterestOutstanding =
  (
    loan
  ) => {
    return roundMoney(
      getOpenScheduleRows(
        loan
      ).reduce(
        (
          total,
          row
        ) =>
          total +
          getScheduleInterestRemaining(
            row
          ),
        0
      )
    );
  };

export const getLoanPrincipalOutstanding =
  (
    loan
  ) => {
    return roundMoney(
      getOpenScheduleRows(
        loan
      ).reduce(
        (
          total,
          row
        ) =>
          total +
          getSchedulePrincipalRemaining(
            row
          ),
        0
      )
    );
  };

/* =========================================================
   PRINCIPAL OUTSTANDING
========================================================= */

export const getPrincipalOutstanding =
  (
    loan
  ) => {
    const componentOutstanding =
      getLoanPrincipalOutstanding(
        loan
      );

    /*
     * Preferred source:
     * schedule component balance.
     */
    if (
      componentOutstanding > 0
    ) {
      return componentOutstanding;
    }

    const calculation =
      loan?.calculation ||
      {};

    const principal =
      toNumber(
        calculation?.principal ??
          loan?.loanAmount ??
          0
      );

    return roundMoney(
      Math.max(
        principal,
        0
      )
    );
  };

/* =========================================================
   LOAN CLOSURE
========================================================= */

export const shouldCloseLoan = (
  loan
) => {
  if (
    isForeclosedLoan(
      loan
    )
  ) {
    return false;
  }

  return (
    getScheduleOutstanding(
      loan
    ) <= 0
  );
};

/* =========================================================
   ALLOCATION INTERNAL
========================================================= */

const makeAllocation = ({
  type,
  amount,
  row,
} = {}) => {
  return {
    type,
    amount:
      roundMoney(amount),

    scheduleId:
      row?.id || "",

    installment:
      row?.installmentNumber ??
      row?.installmentNo ??
      "",

    dueDate:
      row?.dueDate || "",
  };
};

const allocateComponentToRows = ({
  rows = [],
  remaining = 0,
  component = "interest",
  type = PAYMENT_ALLOCATION_TYPE.CURRENT_INTEREST,
} = {}) => {
  let workingRemaining =
    roundMoney(
      remaining
    );

  const allocations = [];

  for (
    const row of rows
  ) {
    if (
      workingRemaining <=
      0
    ) {
      break;
    }

    const componentRemaining =
      component ===
      "interest"
        ? getScheduleInterestRemaining(
            row
          )
        : getSchedulePrincipalRemaining(
            row
          );

    if (
      componentRemaining <=
      0
    ) {
      continue;
    }

    const amount =
      roundMoney(
        Math.min(
          workingRemaining,
          componentRemaining
        )
      );

    if (
      amount <= 0
    ) {
      continue;
    }

    workingRemaining =
      roundMoney(
        workingRemaining -
          amount
      );

    allocations.push(
      makeAllocation({
        type,
        amount,
        row,
      })
    );
  }

  return {
    remaining:
      workingRemaining,

    allocations,
  };
};

/* =========================================================
   PAYMENT ALLOCATION
========================================================= */

/*
 * IMPORTANT BUSINESS RULE
 *
 * Normal:
 *
 *   Interest
 *   Principal
 *
 * Overdue:
 *
 *   Penalty
 *   Interest
 *   Principal
 *
 * Advance:
 *
 *   Earlier open due rows are satisfied first.
 *   Then future installments are consumed:
 *
 *   Interest
 *   Principal
 *
 * Example:
 *
 * EMI = ₹2,000
 * Interest = ₹500
 * Principal = ₹1,500
 *
 * Payment = ₹1,000
 *
 * Interest = ₹500
 * Principal = ₹500
 *
 *
 * Overdue example:
 *
 * EMI = ₹2,000
 * Penalty = ₹200
 * Interest = ₹500
 * Principal = ₹1,500
 *
 * Payment = ₹1,000
 *
 * Penalty = ₹200
 * Interest = ₹500
 * Principal = ₹300
 *
 *
 * Advance example:
 *
 * No current due
 * Payment = ₹3,000
 *
 * Next EMI = ₹2,000
 * Second EMI = ₹2,000
 *
 * Allocation:
 *
 * First EMI:
 * interest + principal = ₹2,000
 *
 * Second EMI:
 * remaining ₹1,000
 * goes to interest first.
 */

export const buildPaymentAllocation =
  ({
    loan,
    paymentAmount,
    paymentPenaltyAmount = 0,
    referenceDate = new Date(),
    allowAdvance = true,
    allowPrincipalPayment = false,
  } = {}) => {
    const totalPayment =
      roundMoney(
        paymentAmount
      );

    if (
      totalPayment <=
      0
    ) {
      return {
        totalPayment: 0,
        allocated: 0,
        remaining: 0,
        penalty: 0,
        overdue: 0,
        currentDue: 0,
        advance: 0,
        principal: 0,
        excess: 0,
        interest: 0,
        items: [],
        calculatedPenalty: 0,
        suppliedPenalty:
          roundMoney(
            paymentPenaltyAmount
          ),
        penaltyRows: [],
        paymentType:
          "Payment",
      };
    }

    if (
      isLoanClosedLike(
        loan
      )
    ) {
      return {
        totalPayment,

        allocated: 0,

        remaining:
          totalPayment,

        penalty: 0,
        overdue: 0,
        currentDue: 0,
        advance: 0,
        principal: 0,
        excess:
          totalPayment,

        interest: 0,

        items: [],

        calculatedPenalty:
          0,

        suppliedPenalty:
          roundMoney(
            paymentPenaltyAmount
          ),

        penaltyRows: [],

        paymentType:
          "Payment",
      };
    }

    const {
      overdue,
      currentDue,
      future,
    } =
      getRepaymentBuckets(
        loan,
        referenceDate
      );

    const orderedRows = [
      ...overdue,
      ...currentDue,
      ...(allowAdvance
        ? future
        : []),
    ].sort(
      (a, b) =>
        compareDates(
          a?.dueDate,
          b?.dueDate
        )
    );

    const penaltyRows =
      overdue
        .map((row) => {
          const penalty =
            calculatePenaltyForInstallment({
              loan,
              scheduleRow: row,
              referenceDate,
            });

          return {
            row,
            ...penalty,
          };
        })
        .filter(
          (item) =>
            toNumber(
              item?.penaltyAmount
            ) > 0
        );

    const calculatedPenalty =
      roundMoney(
        penaltyRows.reduce(
          (
            total,
            item
          ) =>
            total +
            toNumber(
              item?.penaltyAmount
            ),
          0
        )
      );

    const suppliedPenalty =
      roundMoney(
        paymentPenaltyAmount
      );

    const effectivePenalty =
      Math.max(
        calculatedPenalty,
        suppliedPenalty
      );

    let remaining =
      totalPayment;

    const items = [];

    let penaltyAllocated =
      0;

    let overdueInterestAllocated =
      0;

    let overduePrincipalAllocated =
      0;

    let currentInterestAllocated =
      0;

    let currentPrincipalAllocated =
      0;

    let advanceInterestAllocated =
      0;

    let advancePrincipalAllocated =
      0;

    const penaltySummaryRows = [];

    for (const row of orderedRows) {
      if (
        remaining <= 0
      ) {
        break;
      }

      const rowPenalty =
        calculatePenaltyForInstallment({
          loan,
          scheduleRow: row,
          referenceDate,
        });

      const penaltyRemaining =
        roundMoney(
          Math.max(
            toNumber(
              rowPenalty?.penaltyAmount ||
                0
            ),
            0
          )
        );

      if (
        penaltyRemaining > 0 &&
        remaining > 0
      ) {
        const penaltyValue =
          roundMoney(
            Math.min(
              remaining,
              penaltyRemaining
            )
          );

        if (
          penaltyValue > 0
        ) {
          remaining =
            roundMoney(
              remaining -
                penaltyValue
            );

          penaltyAllocated =
            roundMoney(
              penaltyAllocated +
                penaltyValue
            );

          penaltySummaryRows.push({
            scheduleId:
              row?.id || "",
            installment:
              row?.installmentNumber ??
              row?.installmentNo ??
              "",
            dueDate:
              row?.dueDate || "",
            penaltyAmount:
              penaltyValue,
          });

          items.push({
            type:
              PAYMENT_ALLOCATION_TYPE.PENALTY,
            amount:
              penaltyValue,
            penaltyRows: [
              {
                scheduleId:
                  row?.id || "",
                installment:
                  row?.installmentNumber ??
                  row?.installmentNo ??
                  "",
                dueDate:
                  row?.dueDate || "",
                penaltyAmount:
                  penaltyValue,
              },
            ],
            scheduleId:
              row?.id || "",
            installment:
              row?.installmentNumber ??
              row?.installmentNo ??
              "",
            dueDate:
              row?.dueDate || "",
            status:
              "Allocated",
          });
        }
      }

      if (
        remaining <= 0
      ) {
        continue;
      }

      const interestRemaining =
        getScheduleInterestRemaining(
          row
        );

      if (
        interestRemaining > 0 &&
        remaining > 0
      ) {
        const interestValue =
          roundMoney(
            Math.min(
              remaining,
              interestRemaining
            )
          );

        if (
          interestValue > 0
        ) {
          remaining =
            roundMoney(
              remaining -
                interestValue
            );

          const isOverdueRow =
            overdue.some(
              (item) =>
                String(
                  item?.id ||
                    item?.dueDate ||
                    ""
                ) ===
                  String(
                    row?.id ||
                      row?.dueDate ||
                      ""
                  )
            );

          const isCurrentDueRow =
            currentDue.some(
              (item) =>
                String(
                  item?.id ||
                    item?.dueDate ||
                    ""
                ) ===
                  String(
                    row?.id ||
                      row?.dueDate ||
                      ""
                  )
            );

          if (
            isOverdueRow
          ) {
            overdueInterestAllocated =
              roundMoney(
                overdueInterestAllocated +
                  interestValue
              );
          } else if (
            isCurrentDueRow
          ) {
            currentInterestAllocated =
              roundMoney(
                currentInterestAllocated +
                  interestValue
              );
          } else {
            advanceInterestAllocated =
              roundMoney(
                advanceInterestAllocated +
                  interestValue
              );
          }

          items.push({
            type:
              isOverdueRow
                ? PAYMENT_ALLOCATION_TYPE.OVERDUE_INTEREST
                : isCurrentDueRow
                ? PAYMENT_ALLOCATION_TYPE.CURRENT_INTEREST
                : PAYMENT_ALLOCATION_TYPE.ADVANCE_INTEREST,
            amount:
              interestValue,
            scheduleId:
              row?.id || "",
            installment:
              row?.installmentNumber ??
              row?.installmentNo ??
              "",
            dueDate:
              row?.dueDate || "",
            status:
              "Allocated",
          });
        }
      }

      if (
        remaining <= 0
      ) {
        continue;
      }

      const principalRemaining =
        getSchedulePrincipalRemaining(
          row
        );

      if (
        principalRemaining > 0 &&
        remaining > 0
      ) {
        const principalValue =
          roundMoney(
            Math.min(
              remaining,
              principalRemaining
            )
          );

        if (
          principalValue > 0
        ) {
          remaining =
            roundMoney(
              remaining -
                principalValue
            );

          const isOverdueRow =
            overdue.some(
              (item) =>
                String(
                  item?.id ||
                    item?.dueDate ||
                    ""
                ) ===
                  String(
                    row?.id ||
                      row?.dueDate ||
                      ""
                  )
            );

          const isCurrentDueRow =
            currentDue.some(
              (item) =>
                String(
                  item?.id ||
                    item?.dueDate ||
                    ""
                ) ===
                  String(
                    row?.id ||
                      row?.dueDate ||
                      ""
                  )
            );

          if (
            isOverdueRow
          ) {
            overduePrincipalAllocated =
              roundMoney(
                overduePrincipalAllocated +
                  principalValue
              );
          } else if (
            isCurrentDueRow
          ) {
            currentPrincipalAllocated =
              roundMoney(
                currentPrincipalAllocated +
                  principalValue
              );
          } else {
            advancePrincipalAllocated =
              roundMoney(
                advancePrincipalAllocated +
                  principalValue
              );
          }

          items.push({
            type:
              isOverdueRow
                ? PAYMENT_ALLOCATION_TYPE.OVERDUE_PRINCIPAL
                : isCurrentDueRow
                ? PAYMENT_ALLOCATION_TYPE.CURRENT_PRINCIPAL
                : PAYMENT_ALLOCATION_TYPE.ADVANCE_PRINCIPAL,
            amount:
              principalValue,
            scheduleId:
              row?.id || "",
            installment:
              row?.installmentNumber ??
              row?.installmentNo ??
              "",
            dueDate:
              row?.dueDate || "",
            status:
              "Allocated",
          });
        }
      }
    }

    const excess =
      roundMoney(
        Math.max(
          remaining,
          0
        )
      );

    if (
      excess > 0
    ) {
      items.push({
        type:
          PAYMENT_ALLOCATION_TYPE.EXCESS,
        amount:
          excess,
      });
    }

    const interestAllocated =
      roundMoney(
        overdueInterestAllocated +
          currentInterestAllocated +
          advanceInterestAllocated
      );

    const principalAllocated =
      roundMoney(
        overduePrincipalAllocated +
          currentPrincipalAllocated +
          advancePrincipalAllocated
      );

    const overdueAllocated =
      roundMoney(
        overdueInterestAllocated +
          overduePrincipalAllocated
      );

    const currentDueAllocated =
      roundMoney(
        currentInterestAllocated +
          currentPrincipalAllocated
      );

    const advanceAllocated =
      roundMoney(
        advanceInterestAllocated +
          advancePrincipalAllocated
      );

    const allocated =
      roundMoney(
        totalPayment -
          excess
      );

    const allocation = {
      totalPayment,

      allocated,

      remaining:
        excess,

      penalty:
        roundMoney(
          penaltyAllocated
        ),

      interest:
        interestAllocated,

      overdueInterest:
        roundMoney(
          overdueInterestAllocated
        ),

      overduePrincipal:
        roundMoney(
          overduePrincipalAllocated
        ),

      currentInterest:
        roundMoney(
          currentInterestAllocated
        ),

      currentPrincipal:
        roundMoney(
          currentPrincipalAllocated
        ),

      advanceInterest:
        roundMoney(
          advanceInterestAllocated
        ),

      advancePrincipal:
        roundMoney(
          advancePrincipalAllocated
        ),

      overdue:
        overdueAllocated,

      currentDue:
        currentDueAllocated,

      advance:
        advanceAllocated,

      principal:
        principalAllocated,

      excess,

      items,

      calculatedPenalty,

      suppliedPenalty,

      effectivePenalty,

      penaltyRows,
    };

    return {
      ...allocation,

      paymentType:
        getPaymentTypeFromAllocation(
          allocation
        ),
    };
  };

/* =========================================================
   FIND SCHEDULE ROW
========================================================= */

const findScheduleIndex = ({
  schedule,
  scheduleId,
  installment,
  dueDate,
} = {}) => {
  if (
    !Array.isArray(
      schedule
    )
  ) {
    return -1;
  }

  /*
   * 1. ID
   */
  if (
    scheduleId
  ) {
    const index =
      schedule.findIndex(
        (row) =>
          String(
            row?.id || ""
          ) ===
          String(
            scheduleId
          )
      );

    if (
      index >= 0
    ) {
      return index;
    }
  }

  /*
   * 2. Installment + date
   */
  if (
    installment !==
      undefined &&
    installment !==
      null &&
    installment !== ""
  ) {
    const index =
      schedule.findIndex(
        (row) => {
          const rowInstallment =
            row?.installmentNumber ??
            row?.installmentNo;

          return (
            String(
              rowInstallment
            ) ===
              String(
                installment
              ) &&
            (
              !dueDate ||
              getDateKey(
                row?.dueDate
              ) ===
                getDateKey(
                  dueDate
                )
            )
          );
        }
      );

    if (
      index >= 0
    ) {
      return index;
    }
  }

  /*
   * 3. Due date
   */
  if (
    dueDate
  ) {
    const index =
      schedule.findIndex(
        (row) =>
          getDateKey(
            row?.dueDate
          ) ===
            getDateKey(
              dueDate
            ) &&
          getScheduleRemainingAmount(
            row
          ) > 0
      );

    if (
      index >= 0
    ) {
      return index;
    }
  }

  return -1;
};

/* =========================================================
   APPLY ALLOCATION TO SCHEDULE
========================================================= */

const applyAllocationToSchedule = ({
  schedule,
  allocationItems = [],
  referenceDate = new Date(),
} = {}) => {
  const nextSchedule =
    Array.isArray(
      schedule
    )
      ? schedule.map(
          (row) => ({
            ...row,
          })
        )
      : [];

  const appliedItems = [];

  allocationItems.forEach(
    (allocation) => {
      const type =
        allocation?.type;

      /*
       * -----------------------------------------------------
       * EXCESS
       * -----------------------------------------------------
       */
      if (
        type ===
        PAYMENT_ALLOCATION_TYPE.EXCESS
      ) {
        return;
      }

      /*
       * -----------------------------------------------------
       * PENALTY
       *
       * Penalty is tracked against
       * the matching overdue row.
       *
       * If one collection contains penalties
       * for multiple overdue installments,
       * distribute the payment oldest-first.
       * -----------------------------------------------------
       */
      if (
        type ===
        PAYMENT_ALLOCATION_TYPE.PENALTY
      ) {
        let penaltyRemaining =
          roundMoney(
            allocation?.amount ||
              0
          );

        const penaltyRows =
          Array.isArray(
            allocation?.penaltyRows
          )
            ? allocation.penaltyRows
            : [];

        for (
          const penaltyRow of penaltyRows
        ) {
          if (
            penaltyRemaining <=
            0
          ) {
            break;
          }

          const index =
            findScheduleIndex({
              schedule:
                nextSchedule,

              scheduleId:
                penaltyRow?.scheduleId,

              installment:
                penaltyRow?.installment,

              dueDate:
                penaltyRow?.dueDate,
            });

          if (
            index < 0
          ) {
            continue;
          }

          const row =
            nextSchedule[
              index
            ];

          const storedPenaltyDue =
            roundMoney(
              row?.penaltyDue
            );

          const allocationPenaltyDue =
            roundMoney(
              penaltyRow?.penaltyAmount
            );

          const penaltyDue =
            Math.max(
              storedPenaltyDue > 0
                ? storedPenaltyDue
                : allocationPenaltyDue,
              0
            );

          /*
           * If penaltyDue was not stored,
           * calculate it from the current row.
           */
          const calculatedPenalty =
            penaltyDue > 0
              ? penaltyDue
              : calculatePenaltyForInstallment(
                  {
                    loan: null,
                    scheduleRow:
                      row,
                    referenceDate,
                  }
                )
                  .penaltyAmount;

          const amount =
            roundMoney(
              Math.min(
                penaltyRemaining,
                Math.max(
                  calculatedPenalty,
                  0
                )
              )
            );

          if (
            amount <=
            0
          ) {
            continue;
          }

          penaltyRemaining =
            roundMoney(
              penaltyRemaining -
                amount
            );

          const previousPenaltyPaid =
            roundMoney(
              row?.penaltyPaidAmount ??
                0
            );

          const newPenaltyPaid =
            roundMoney(
              previousPenaltyPaid +
                amount
            );

          nextSchedule[
            index
          ] = {
            ...row,

            penaltyPaidAmount:
              newPenaltyPaid,

            lastPenaltyPaymentAt:
              nowIso(),
          };

          appliedItems.push({
            ...allocation,

            amount,

            type:
              PAYMENT_ALLOCATION_TYPE.PENALTY,

            scheduleIndex:
              index,

            scheduleId:
              row?.id ||
              penaltyRow?.scheduleId ||
              "",

            installment:
              row?.installmentNumber ??
              row?.installmentNo ??
              penaltyRow?.installment ??
              index + 1,

            dueDate:
              row?.dueDate ||
              penaltyRow?.dueDate ||
              "",

            penaltyAmount:
              amount,

            previousPenaltyPaid,

            newPenaltyPaid,
          });
        }

        return;
      }

      /*
       * -----------------------------------------------------
       * NORMAL COMPONENT ALLOCATION
       * -----------------------------------------------------
       */

      const index =
        findScheduleIndex({
          schedule:
            nextSchedule,

          scheduleId:
            allocation?.scheduleId,

          installment:
            allocation?.installment,

          dueDate:
            allocation?.dueDate,
        });

      if (
        index < 0
      ) {
        return;
      }

      const row =
        nextSchedule[
          index
        ];

      const originalPrincipal =
        getOriginalPrincipal(
          row
        );

      const originalInterest =
        getOriginalInterest(
          row
        );

      const previousPaidInterest =
        derivePaidInterest(
          row
        );

      const previousPaidPrincipal =
        derivePaidPrincipal(
          row
        );

      const previousRemainingInterest =
        getScheduleInterestRemaining(
          row
        );

      const previousRemainingPrincipal =
        getSchedulePrincipalRemaining(
          row
        );

      const amount =
        roundMoney(
          Math.min(
            toNumber(
              allocation?.amount
            ),
            roundMoney(
              previousRemainingInterest +
                previousRemainingPrincipal
            )
          )
        );

      if (
        amount <= 0
      ) {
        return;
      }

      /*
       * Allocation type decides
       * whether this amount is interest
       * or principal.
       */
      const isInterestAllocation =
        [
          PAYMENT_ALLOCATION_TYPE.OVERDUE_INTEREST,
          PAYMENT_ALLOCATION_TYPE.CURRENT_INTEREST,
          PAYMENT_ALLOCATION_TYPE.ADVANCE_INTEREST,
        ].includes(type);

      const isPrincipalAllocation =
        [
          PAYMENT_ALLOCATION_TYPE.OVERDUE_PRINCIPAL,
          PAYMENT_ALLOCATION_TYPE.CURRENT_PRINCIPAL,
          PAYMENT_ALLOCATION_TYPE.ADVANCE_PRINCIPAL,
          PAYMENT_ALLOCATION_TYPE.PRINCIPAL,
        ].includes(type);

      let interestAdded = 0;
      let principalAdded = 0;

      if (
        isInterestAllocation
      ) {
        interestAdded =
          roundMoney(
            Math.min(
              amount,
              previousRemainingInterest
            )
          );
      } else if (
        isPrincipalAllocation
      ) {
        principalAdded =
          roundMoney(
            Math.min(
              amount,
              previousRemainingPrincipal
            )
          );
      } else {
        /*
         * Compatibility:
         * generic Overdue / Current Due /
         * Advance allocations use:
         *
         * Interest first -> Principal.
         */
        interestAdded =
          roundMoney(
            Math.min(
              amount,
              previousRemainingInterest
            )
          );

        principalAdded =
          roundMoney(
            Math.min(
              amount -
                interestAdded,
              previousRemainingPrincipal
            )
          );
      }

      if (
        interestAdded <= 0 &&
        principalAdded <= 0
      ) {
        return;
      }

      const newPaidInterest =
        roundMoney(
          Math.min(
            originalInterest,
            previousPaidInterest +
              interestAdded
          )
        );

      const newPaidPrincipal =
        roundMoney(
          Math.min(
            originalPrincipal,
            previousPaidPrincipal +
              principalAdded
          )
        );

      const newRemainingInterest =
        roundMoney(
          Math.max(
            originalInterest -
              newPaidInterest,
            0
          )
        );

      const newRemainingPrincipal =
        roundMoney(
          Math.max(
            originalPrincipal -
              newPaidPrincipal,
            0
          )
        );

      const newPaidAmount =
        roundMoney(
          newPaidInterest +
            newPaidPrincipal
        );

      const newRemainingAmount =
        roundMoney(
          newRemainingInterest +
            newRemainingPrincipal
        );

      let nextStatus =
        REPAYMENT_STATUS.PENDING;

      if (
        newRemainingAmount <=
        0
      ) {
        nextStatus =
          REPAYMENT_STATUS.PAID;
      } else if (
        newPaidAmount > 0
      ) {
        nextStatus =
          REPAYMENT_STATUS.PARTIALLY_PAID;
      } else if (
        isOverdueOpenRow(
          row,
          referenceDate
        )
      ) {
        nextStatus =
          REPAYMENT_STATUS.OVERDUE;
      }

      const paidAt =
        newRemainingAmount <=
        0
          ? nowIso()
          : row?.paidAt ||
            null;

      const updatedRow =
        {
          ...row,

          paidInterest:
            newPaidInterest,

          paidPrincipal:
            newPaidPrincipal,

          remainingInterest:
            newRemainingInterest,

          remainingPrincipal:
            newRemainingPrincipal,

          paidAmount:
            newPaidAmount,

          balance:
            newRemainingAmount,

          remainingAmount:
            newRemainingAmount,

          status:
            nextStatus,

          paidAt,

          lastPaymentAt:
            nowIso(),
        };

      nextSchedule[
        index
      ] = updatedRow;

      appliedItems.push({
        ...allocation,

        amount:
          roundMoney(
            interestAdded +
              principalAdded
          ),

        scheduleIndex:
          index,

        scheduleId:
          row?.id ||
          allocation?.scheduleId ||
          "",

        installment:
          row?.installmentNumber ??
          row?.installmentNo ??
          allocation?.installment ??
          index + 1,

        dueDate:
          row?.dueDate ||
          allocation?.dueDate ||
          "",

        interestApplied:
          roundMoney(
            interestAdded
          ),

        principalApplied:
          roundMoney(
            principalAdded
          ),

        previousPaidInterest,

        previousPaidPrincipal,

        newPaidInterest,

        newPaidPrincipal,

        previousRemainingInterest,

        previousRemainingPrincipal,

        newRemainingInterest,

        newRemainingPrincipal,

        newPaid:
          newPaidAmount,

        newRemaining:
          newRemainingAmount,
      });
    }
  );

  return {
    schedule:
      nextSchedule,

    appliedItems,
  };
};

/* =========================================================
   PAYMENT TYPE
========================================================= */

export const getPaymentTypeFromAllocation =
  (
    allocation
  ) => {
    if (
      !allocation
    ) {
      return "Payment";
    }

    const hasPenalty =
      toNumber(
        allocation.penalty
      ) > 0;

    const hasOverdue =
      toNumber(
        allocation.overdue
      ) > 0;

    const hasCurrent =
      toNumber(
        allocation.currentDue
      ) > 0;

    const hasAdvance =
      toNumber(
        allocation.advance
      ) > 0;

    const hasPrincipal =
      toNumber(
        allocation.principal
      ) > 0;

    const hasInterest =
      toNumber(
        allocation.interest
      ) > 0;

    const hasExcess =
      toNumber(
        allocation.excess
      ) > 0;

    if (
      hasOverdue &&
      hasCurrent &&
      hasAdvance
    ) {
      return hasPenalty
        ? "Penalty + Overdue + Due + Advance"
        : "Overdue + Due + Advance";
    }

    if (
      hasOverdue &&
      hasCurrent
    ) {
      return hasPenalty
        ? "Penalty + Overdue + Due"
        : "Overdue + Due";
    }

    if (
      hasOverdue &&
      hasAdvance
    ) {
      return hasPenalty
        ? "Penalty + Overdue + Advance"
        : "Overdue + Advance";
    }

    if (
      hasCurrent &&
      hasAdvance
    ) {
      return hasPenalty
        ? "Penalty + Due + Advance"
        : "Due + Advance";
    }

    if (
      hasPenalty &&
      hasOverdue
    ) {
      return "Penalty + Overdue Payment";
    }

    if (
      hasPenalty &&
      hasCurrent
    ) {
      return "Penalty + Due Payment";
    }

    if (
      hasPenalty &&
      hasInterest
    ) {
      return "Penalty + Interest Payment";
    }

    if (
      hasOverdue
    ) {
      return "Overdue Payment";
    }

    if (
      hasCurrent
    ) {
      return "Due Payment";
    }

    if (
      hasAdvance
    ) {
      return "Advance Payment";
    }

    if (
      hasInterest &&
      hasPrincipal
    ) {
      return "Interest + Principal Payment";
    }

    if (
      hasInterest
    ) {
      return "Interest Payment";
    }

    if (
      hasPrincipal
    ) {
      return "Principal Payment";
    }

    if (
      hasPenalty
    ) {
      return "Penalty Payment";
    }

    if (
      hasExcess
    ) {
      return "Excess Payment";
    }

    return "Payment";
  };

/* =========================================================
   LOAN STATUS AFTER REPAYMENT
========================================================= */

export const deriveLoanStatusAfterRepayment =
  (
    loan,
    schedule,
    referenceDate = new Date()
  ) => {
    const currentStatus =
      normalize(
        loan?.status
      );

    /*
     * Foreclosure remains terminal.
     */
    if (
      currentStatus ===
      "foreclosed"
    ) {
      return REPAYMENT_STATUS.FORECLOSED;
    }

    const remaining =
      schedule.reduce(
        (
          total,
          row
        ) =>
          total +
          getScheduleRemainingAmount(
            row
          ),
        0
      );

    if (
      roundMoney(
        remaining
      ) <= 0
    ) {
      return REPAYMENT_STATUS.CLOSED;
    }

    /*
     * Any open overdue installment.
     */
    const hasOverdue =
      schedule.some(
        (row) =>
          isOverdueOpenRow(
            row,
            referenceDate
          )
      );

    if (
      hasOverdue
    ) {
      return REPAYMENT_STATUS.OVERDUE;
    }

    /*
     * Partial state.
     */
    const hasPartial =
      schedule.some(
        (row) => {
          const paid =
            getSchedulePaidAmount(
              row
            );

          const remaining =
            getScheduleRemainingAmount(
              row
            );

          return (
            paid > 0 &&
            remaining > 0
          );
        }
      );

    if (
      hasPartial
    ) {
      return REPAYMENT_STATUS.PARTIALLY_PAID;
    }

    if (
      currentStatus ===
      "pending"
    ) {
      return REPAYMENT_STATUS.PENDING;
    }

    return (
      loan?.status ||
      "Active"
    );
  };

/* =========================================================
   OVERDUE OPEN ROW
========================================================= */

const isOverdueOpenRow = (
  row,
  referenceDate = new Date()
) => {
  const status =
    normalize(
      row?.status
    );

  if (
    isCompletedScheduleStatus(
      status
    )
  ) {
    return false;
  }

  const dueDate =
    startOfDay(
      row?.dueDate
    );

  const today =
    startOfDay(
      referenceDate
    );

  if (
    !dueDate ||
    !today
  ) {
    return false;
  }

  return (
    dueDate.getTime() <
      today.getTime() &&
    getScheduleRemainingAmount(
      row
    ) > 0
  );
};

/* =========================================================
   PAYMENT HISTORY
========================================================= */

const createPaymentHistoryEntry =
  ({
    loan,
    collection,
    allocation,
    paymentIndex,
    totalPayment,
  } = {}) => {
    const now =
      nowIso();

    const type =
      allocation?.type ||
      "";

    const allocationAmount =
      roundMoney(
        allocation?.amount ??
          0
      );

    const isPenalty =
      type ===
      PAYMENT_ALLOCATION_TYPE.PENALTY;

    const isInterest =
      [
        PAYMENT_ALLOCATION_TYPE.OVERDUE_INTEREST,
        PAYMENT_ALLOCATION_TYPE.CURRENT_INTEREST,
        PAYMENT_ALLOCATION_TYPE.ADVANCE_INTEREST,
      ].includes(
        type
      );

    const isPrincipal =
      [
        PAYMENT_ALLOCATION_TYPE.OVERDUE_PRINCIPAL,
        PAYMENT_ALLOCATION_TYPE.CURRENT_PRINCIPAL,
        PAYMENT_ALLOCATION_TYPE.ADVANCE_PRINCIPAL,
        PAYMENT_ALLOCATION_TYPE.PRINCIPAL,
      ].includes(
        type
      );

    return {
      id:
        `PAY-${collection?.id || now}-${paymentIndex}`,

      collectionId:
        collection?.id ||
        "",

      loanId:
        loan?.id ||
        collection?.loanId ||
        "",

      loanNumber:
        loan?.loanNumber ||
        collection?.loanNumber ||
        "",

      scheduleId:
        allocation?.scheduleId ||
        collection?.scheduleId ||
        "",

      installment:
        allocation?.installment ??
        collection?.installment ??
        "",

      dueDate:
        allocation?.dueDate ||
        collection?.dueDate ||
        "",

      /*
       * THIS ROW'S ALLOCATION ONLY.
       */
      amount:
        allocationAmount,

      allocationAmount,

      /*
       * ORIGINAL COLLECTION TOTAL.
       */
      totalPaymentAmount:
        roundMoney(
          totalPayment
        ),

      paymentAmount:
        allocationAmount,

      allocationType:
        type,

      /*
       * Penalty.
       */
      amountTowardPenalty:
        isPenalty
          ? allocationAmount
          : 0,

      /*
       * Interest.
       */
      amountTowardInterest:
        isInterest
          ? allocationAmount
          : roundMoney(
              allocation
                ?.interestApplied ??
                0
            ),

      /*
       * Principal.
       */
      amountTowardPrincipal:
        isPrincipal
          ? allocationAmount
          : roundMoney(
              allocation
                ?.principalApplied ??
                0
            ),

      /*
       * Combined component compatibility.
       */
      amountTowardDue:
        [
          PAYMENT_ALLOCATION_TYPE.OVERDUE,
          PAYMENT_ALLOCATION_TYPE.CURRENT_DUE,
        ].includes(
          type
        )
          ? allocationAmount
          : 0,

      amountTowardAdvance:
        [
          PAYMENT_ALLOCATION_TYPE.ADVANCE,
          PAYMENT_ALLOCATION_TYPE.ADVANCE_INTEREST,
          PAYMENT_ALLOCATION_TYPE.ADVANCE_PRINCIPAL,
        ].includes(
          type
        )
          ? allocationAmount
          : 0,

      amountExcess:
        type ===
        PAYMENT_ALLOCATION_TYPE.EXCESS
          ? allocationAmount
          : 0,

      /*
       * Separate allocation components.
       */
      interestApplied:
        roundMoney(
          allocation
            ?.interestApplied ??
            (
              isInterest
                ? allocationAmount
                : 0
            )
        ),

      principalApplied:
        roundMoney(
          allocation
            ?.principalApplied ??
            (
              isPrincipal
                ? allocationAmount
                : 0
            )
        ),

      penaltyApplied:
        isPenalty
          ? allocationAmount
          : 0,

      dueAmount:
        roundMoney(
          collection?.dueAmount ||
            0
        ),

      penaltyAmount:
        roundMoney(
          collection?.penaltyAmount ||
            0
        ),

      date:
        collection?.collectedDate ||
        collection?.collectionDate ||
        now,

      paymentDate:
        collection?.collectedDate ||
        collection?.collectionDate ||
        now,

      paidAt:
        now,

      paymentMode:
        collection?.paymentMode ||
        collection?.payMode ||
        "",

      mode:
        collection?.paymentMode ||
        collection?.payMode ||
        "",

      collectedBy:
        collection?.staffName ||
        "",

      staffId:
        collection?.staffId ||
        "",

      location:
        collection?.location ||
        "",

      remarks:
        collection?.remarks ||
        "",

      paymentSequence:
        paymentIndex + 1,

      status:
        "Approved",
    };
  };

/* =========================================================
   PROCESS REPAYMENT
========================================================= */

/*
 * Called after Admin approves a collection.
 *
 * IMPORTANT:
 *
 * Staff never directly changes the loan.
 *
 * Staff:
 *   create Pending collection
 *
 * Admin:
 *   approve
 *
 * Then:
 *   processRepayment()
 *
 * Only after this function succeeds
 * should collectionStorage mark the
 * collection as Approved / Processed.
 */

export const processRepayment = ({
  collection,
  allocationOptions = {},
} = {}) => {
  if (
    !collection
  ) {
    return {
      success: false,
      reason:
        "collection_required",
    };
  }

  const match =
    findCustomerLoan({
      customerId:
        collection?.customerId ||
        "",

      loanId:
        collection?.loanId ||
        "",

      loanNumber:
        collection?.loanNumber ||
        "",
    });

  if (
    !match
  ) {
    return {
      success: false,
      reason:
        "loan_not_found",
    };
  }

  const {
    customer,
    loan,
  } = match;

  if (
    isLoanClosedLike(
      loan
    )
  ) {
    return {
      success: false,

      reason:
        isForeclosedLoan(
          loan
        )
          ? "loan_foreclosed"
          : "loan_closed",

      loanStatus:
        loan?.status,
    };
  }

  const paymentAmount =
    getCollectionAmount(
      collection
    );

  if (
    paymentAmount <=
    0
  ) {
    return {
      success: false,
      reason:
        "invalid_payment_amount",
    };
  }

  /*
   * Existing payment history.
   */
  const existingPaymentHistory =
    Array.isArray(
      loan?.paymentHistory
    )
      ? [
          ...loan.paymentHistory,
        ]
      : [];

  const alreadyProcessed =
    existingPaymentHistory.some(
      (payment) =>
        String(
          payment?.collectionId ||
            ""
        ) ===
        String(
          collection?.id ||
            ""
        )
    );

  if (
    alreadyProcessed
  ) {
    return {
      success: false,
      reason:
        "already_processed",
      loan,
    };
  }

  /*
   * Normalize old and new schedules.
   */
  const normalizedSchedule =
    normalizeSchedule(
      loan
    );

  const workingLoan = {
    ...loan,

    repaymentSchedule:
      normalizedSchedule,
  };

  /*
   * Build allocation.
   */
  const allocation =
    buildPaymentAllocation({
      loan:
        workingLoan,

      paymentAmount,

      paymentPenaltyAmount:
        getCollectionPenalty(
          collection
        ),

      referenceDate:
        new Date(),

      allowAdvance:
        allocationOptions
          ?.allowAdvance !==
        false,

      allowPrincipalPayment:
        allocationOptions
          ?.allowPrincipalPayment ===
        true,
    });

  /*
   * Apply allocation.
   */
  const scheduleResult =
    applyAllocationToSchedule({
      schedule:
        normalizedSchedule,

      allocationItems:
        allocation.items,

      referenceDate:
        new Date(),
    });

  const nextSchedule =
    scheduleResult.schedule;

  /*
   * IMPORTANT SAFETY:
   *
   * Verify that every non-excess
   * amount has actually been posted.
   */
  const expectedAllocated =
    roundMoney(
      allocation.penalty +
        allocation.interest +
        allocation.principal
    );

  const actuallyApplied =
    roundMoney(
      scheduleResult.appliedItems
        .reduce(
          (
            total,
            item
          ) =>
            total +
            toNumber(
              item?.amount
            ),
          0
        )
    );

  /*
   * Penalty allocations are included
   * in appliedItems after this engine.
   */
  if (
    roundMoney(
      actuallyApplied
    ) <
    roundMoney(
      expectedAllocated
    ) &&
    allocation.excess <=
      0
  ) {
    return {
      success: false,
      reason:
        "repayment_allocation_incomplete",
      expectedAllocated,
      actuallyApplied,
      allocation,
    };
  }

  /*
   * Build payment history.
   */
  const nextPaymentHistory =
    [
      ...existingPaymentHistory,
    ];

  scheduleResult.appliedItems.forEach(
    (
      appliedAllocation
    ) => {
      const entry =
        createPaymentHistoryEntry({
          loan:
            workingLoan,

          collection,

          allocation:
            appliedAllocation,

          paymentIndex:
            nextPaymentHistory.length,

          totalPayment:
            paymentAmount,
        });

      nextPaymentHistory.push(
        entry
      );
    }
  );

  /*
   * Excess audit.
   */
  if (
    allocation.excess >
    0
  ) {
    const excessEntry =
      createPaymentHistoryEntry({
        loan:
          workingLoan,

        collection,

        allocation: {
          type:
            PAYMENT_ALLOCATION_TYPE.EXCESS,

          amount:
            allocation.excess,
        },

        paymentIndex:
          nextPaymentHistory.length,

        totalPayment:
          paymentAmount,
      });

    nextPaymentHistory.push(
      excessEntry
    );
  }

  /*
   * If there is a supplied penalty but
   * no matching penalty row, preserve audit.
   *
   * This should normally not happen.
   */
  const penaltyHistoryAmount =
    roundMoney(
      scheduleResult.appliedItems
        .filter(
          (item) =>
            item?.type ===
            PAYMENT_ALLOCATION_TYPE.PENALTY
        )
        .reduce(
          (
            total,
            item
          ) =>
            total +
            toNumber(
              item?.amount
            ),
          0
        )
    );

  if (
    allocation.penalty >
      0 &&
    penaltyHistoryAmount <
      allocation.penalty
  ) {
    const missingPenalty =
      roundMoney(
        allocation.penalty -
          penaltyHistoryAmount
      );

    if (
      missingPenalty >
      0
    ) {
      nextPaymentHistory.push(
        createPaymentHistoryEntry({
          loan:
            workingLoan,

          collection,

          allocation: {
            type:
              PAYMENT_ALLOCATION_TYPE.PENALTY,

            amount:
              missingPenalty,
          },

          paymentIndex:
            nextPaymentHistory.length,

          totalPayment:
            paymentAmount,
        })
      );
    }
  }

  /*
   * Repayment metadata.
   */
  const repaymentMeta = {
    paymentType:
      allocation.paymentType ||
      getPaymentTypeFromAllocation(
        allocation
      ),

    totalPayment:
      paymentAmount,

    penalty:
      allocation.penalty,

    interest:
      allocation.interest,

    overdueInterest:
      allocation.overdueInterest,

    overduePrincipal:
      allocation.overduePrincipal,

    currentInterest:
      allocation.currentInterest,

    currentPrincipal:
      allocation.currentPrincipal,

    advanceInterest:
      allocation.advanceInterest,

    advancePrincipal:
      allocation.advancePrincipal,

    overdue:
      allocation.overdue,

    currentDue:
      allocation.currentDue,

    advance:
      allocation.advance,

    principal:
      allocation.principal,

    excess:
      allocation.excess,

    allocated:
      allocation.allocated,

    allocationItems:
      allocation.items,

    calculatedPenalty:
      allocation.calculatedPenalty,

    suppliedPenalty:
      allocation.suppliedPenalty,

    effectivePenalty:
      allocation.effectivePenalty,

    processedAt:
      nowIso(),
  };

  /*
   * New loan status.
   */
  const nextStatus =
    deriveLoanStatusAfterRepayment(
      loan,
      nextSchedule,
      new Date()
    );

  /*
   * Component totals after payment.
   */
  const outstanding =
    getScheduleOutstanding({
      ...loan,
      repaymentSchedule:
        nextSchedule,
    });

  const principalOutstanding =
    getLoanPrincipalOutstanding({
      ...loan,
      repaymentSchedule:
        nextSchedule,
    });

  const interestOutstanding =
    getLoanInterestOutstanding({
      ...loan,
      repaymentSchedule:
        nextSchedule,
    });

  /*
   * Update loan.
   */
  const updatedLoan = {
    ...loan,

    repaymentSchedule:
      nextSchedule,

    paymentHistory:
      nextPaymentHistory,

    repayment: {
      ...(loan?.repayment ||
        {}),

      lastPaymentAt:
        nowIso(),

      lastPaymentAmount:
        paymentAmount,

      lastPaymentType:
        repaymentMeta.paymentType,

      lastAllocation:
        repaymentMeta,

      lastPenaltyPaid:
        allocation.penalty,

      lastInterestPaid:
        allocation.interest,

      lastPrincipalPaid:
        allocation.principal,

      outstanding,

      principalOutstanding,

      interestOutstanding,
    },

    updatedAt:
      nowIso(),

    status:
      nextStatus,
  };

  /*
   * IMPORTANT FIX:
   *
   * Update the exact customer record
   * from the same array we originally
   * looked up.
   *
   * We do NOT compare object references
   * from two different getCustomers()
   * calls.
   */
  const customers =
    getCustomers();

  let customerUpdated =
    false;

  const updatedCustomers =
    customers.map(
      (item) => {
        const sameCustomer =
          getCustomerId(
            item
          ) &&
          getCustomerId(
            item
          ) ===
            getCustomerId(
              customer
            );

        const itemLoan = item?.loan;
        const historicalLoans = Array.isArray(item?.loans)
          ? item.loans
          : [];
        const matchesLoan = (candidate) =>
          (
            loan?.id &&
            candidate?.id &&
            String(candidate.id) === String(loan.id)
          ) ||
          (
            loan?.loanNumber &&
            candidate?.loanNumber &&
            String(candidate.loanNumber) === String(loan.loanNumber)
          );
        const sameLoan =
          matchesLoan(itemLoan) ||
          historicalLoans.some(matchesLoan);

        if (
          !sameCustomer &&
          !sameLoan
        ) {
          return item;
        }

        customerUpdated =
          true;

        const updatedHistory = historicalLoans.map((candidate) =>
          matchesLoan(candidate) ? updatedLoan : candidate
        );

        return {
          ...item,

          ...(matchesLoan(itemLoan)
            ? { loan: updatedLoan }
            : { loans: updatedHistory }),

          updatedAt:
            nowIso(),
        };
      }
    );

  if (
    !customerUpdated
  ) {
    return {
      success: false,
      reason:
        "customer_update_failed",
    };
  }

  saveCustomers(
    updatedCustomers
  );

  emitDataUpdated();

  return {
    success: true,

    customer,

    previousLoan:
      loan,

    loan:
      updatedLoan,

    schedule:
      nextSchedule,

    allocation,

    allocationItems:
      scheduleResult.appliedItems,

    repayment:
      repaymentMeta,

    loanStatus:
      nextStatus,

    outstanding,

    principalOutstanding,

    interestOutstanding,
  };
};

/* =========================================================
   PREVIEW REPAYMENT
========================================================= */

export const previewRepayment = ({
  loan,
  amount,
  penaltyAmount = 0,
  allocationOptions = {},
} = {}) => {
  if (!loan) {
    return {
      success: false,
      reason:
        "loan_required",
    };
  }

  if (
    isLoanClosedLike(
      loan
    )
  ) {
    return {
      success: false,

      reason:
        isForeclosedLoan(
          loan
        )
          ? "loan_foreclosed"
          : "loan_closed",

      loanStatus:
        loan?.status,
    };
  }

  const paymentAmount =
    roundMoney(
      amount
    );

  if (
    paymentAmount <=
    0
  ) {
    return {
      success: false,
      reason:
        "invalid_payment_amount",
    };
  }

  const allocation =
    buildPaymentAllocation({
      loan,

      paymentAmount,

      paymentPenaltyAmount:
        penaltyAmount,

      referenceDate:
        new Date(),

      allowAdvance:
        allocationOptions
          ?.allowAdvance !==
        false,

      allowPrincipalPayment:
        allocationOptions
          ?.allowPrincipalPayment ===
        true,
    });

  const buckets =
    getRepaymentBuckets(
      loan
    );

  const currentOutstanding =
    getScheduleOutstanding(
      loan
    );

  const projectedOutstanding =
    roundMoney(
      Math.max(
        currentOutstanding -
          (
            allocation.interest +
            allocation.principal
          ),
        0
      )
    );

  return {
    success: true,

    amount:
      paymentAmount,

    paymentType:
      allocation.paymentType,

    currentOutstanding,

    projectedOutstanding,

    penalty:
      allocation.penalty,

    interest:
      allocation.interest,

    principal:
      allocation.principal,

    overdue:
      allocation.overdue,

    currentDue:
      allocation.currentDue,

    advance:
      allocation.advance,

    excess:
      allocation.excess,

    allocated:
      allocation.allocated,

    allocation,

    buckets,
  };
};

/* =========================================================
   FULL SETTLEMENT PREVIEW
========================================================= */

export const previewFullSettlement = (
  loan
) => {
  if (!loan) {
    return {
      success: false,
      reason:
        "loan_required",
    };
  }

  if (
    isLoanClosedLike(
      loan
    )
  ) {
    return {
      success: false,

      reason:
        isForeclosedLoan(
          loan
        )
          ? "loan_foreclosed"
          : "loan_closed",
    };
  }

  const outstanding =
    getScheduleOutstanding(
      loan
    );

  const penaltySummary =
    getOutstandingPenaltySummary(
      loan
    );

  const settlementAmount =
    roundMoney(
      outstanding +
        penaltySummary.amount
    );

  return {
    ...previewRepayment({
      loan,

      amount:
        settlementAmount,

      penaltyAmount:
        penaltySummary.amount,

      allocationOptions: {
        allowAdvance:
          true,

        allowPrincipalPayment:
          false,
      },
    }),

    settlementAmount,

    penaltySummary,
  };
};

/* =========================================================
   FULL SETTLEMENT
========================================================= */

export const processFullSettlement =
  ({
    collection,
  } = {}) => {
    if (
      !collection
    ) {
      return {
        success: false,
        reason:
          "collection_required",
      };
    }

    const match =
      findCustomerLoan({
        customerId:
          collection?.customerId ||
          "",

        loanId:
          collection?.loanId ||
          "",

        loanNumber:
          collection?.loanNumber ||
          "",
      });

    if (
      !match
    ) {
      return {
        success: false,
        reason:
          "loan_not_found",
      };
    }

    const {
      loan,
    } = match;

    if (
      isForeclosedLoan(
        loan
      )
    ) {
      return {
        success: false,
        reason:
          "loan_foreclosed",
      };
    }

    if (
      isClosedLoan(
        loan
      )
    ) {
      return {
        success: false,
        reason:
          "loan_closed",
      };
    }

    const outstanding =
      getScheduleOutstanding(
        loan
      );

    const penaltySummary =
      getOutstandingPenaltySummary(
        loan
      );

    const expectedAmount =
      roundMoney(
        outstanding +
          penaltySummary.amount
      );

    const receivedAmount =
      getCollectionAmount(
        collection
      );

    if (
      receivedAmount <
      expectedAmount
    ) {
      return {
        success: false,

        reason:
          "settlement_amount_insufficient",

        expectedAmount,

        receivedAmount,
      };
    }

    const result =
      processRepayment({
        collection: {
          ...collection,

          status:
            "Approved",

          amount:
            receivedAmount,

          penaltyAmount:
            penaltySummary.amount,
        },

        allocationOptions: {
          allowAdvance:
            true,

          allowPrincipalPayment:
            false,
        },
      });

    if (
      !result?.success
    ) {
      return result;
    }

    if (
      getScheduleOutstanding(
        result.loan
      ) <= 0
    ) {
      const customers =
        getCustomers();

      let updated =
        false;

      const updatedCustomers =
        customers.map(
          (record) => {
            const recordLoan =
              record?.loan;

            const loanMatches =
              (
                collection?.loanId &&
                String(
                  recordLoan?.id ||
                    ""
                ) ===
                  String(
                    collection.loanId
                  )
              ) ||
              (
                collection?.loanNumber &&
                String(
                  recordLoan
                    ?.loanNumber ||
                    ""
                ) ===
                  String(
                    collection.loanNumber
                  )
              );

            if (
              !loanMatches
            ) {
              return record;
            }

            updated =
              true;

            return {
              ...record,

              loan: {
                ...recordLoan,

                status:
                  REPAYMENT_STATUS.CLOSED,

                updatedAt:
                  nowIso(),
              },

              updatedAt:
                nowIso(),
            };
          }
        );

      if (
        updated
      ) {
        saveCustomers(
          updatedCustomers
        );

        emitDataUpdated();
      }

      return {
        ...result,

        loan: {
          ...result.loan,

          status:
            REPAYMENT_STATUS.CLOSED,
        },

        loanStatus:
          REPAYMENT_STATUS.CLOSED,
      };
    }

    return result;
  };

/* =========================================================
   FORECLOSE LOAN
========================================================= */

export const forecloseLoan = (
  loanIdentifier,
  foreclosureData = {}
) => {
  const customers =
    getCustomers();

  const loanId =
    loanIdentifier
      ?.loanId ||
    "";

  const loanNumber =
    loanIdentifier
      ?.loanNumber ||
    "";

  const now =
    nowIso();

  let found =
    false;

  const updatedCustomers =
    customers.map(
      (
        record
      ) => {
        const loan =
          record?.loan;

        if (
          !loan
        ) {
          return record;
        }

        const matches =
          (
            loanId &&
            String(
              loan?.id ||
                ""
            ) ===
              String(
                loanId
              )
          ) ||
          (
            loanNumber &&
            String(
              loan?.loanNumber ||
                ""
            ) ===
              String(
                loanNumber
              )
          );

        if (
          !matches
        ) {
          return record;
        }

        found =
          true;

        return {
          ...record,

          loan: {
            ...loan,

            status:
              REPAYMENT_STATUS.FORECLOSED,

            foreclosure: {
              ...(loan?.foreclosure ||
                {}),

              ...foreclosureData,

              status:
                REPAYMENT_STATUS.FORECLOSED,

              foreclosedAt:
                foreclosureData
                  ?.foreclosedAt ||
                now,

              updatedAt:
                now,
            },

            updatedAt:
              now,
          },

          updatedAt:
            now,
        };
      }
    );

  if (
    !found
  ) {
    return null;
  }

  saveCustomers(
    updatedCustomers
  );

  emitDataUpdated();

  return (
    updatedCustomers.find(
      (
        record
      ) => {
        const loan =
          record?.loan;

        return (
          (
            loanId &&
            String(
              loan?.id ||
                ""
            ) ===
              String(
                loanId
              )
          ) ||
          (
            loanNumber &&
            String(
              loan?.loanNumber ||
                ""
            ) ===
              String(
                loanNumber
              )
          )
        );
      }
    ) || null
  );
};

/* =========================================================
   VEHICLE SALE -> FORECLOSED
========================================================= */

export const forecloseLoanForVehicleSale =
  ({
    vehicleId = "",
    loanId = "",
    loanNumber = "",
    saleId = "",
    salePrice = 0,
    saleExpenses = 0,
    recoveryAmount = 0,
    deficiency = 0,
    surplus = 0,
    completedBy =
      "Admin",
  } = {}) => {
    const customers =
      getCustomers();

    const now =
      nowIso();

    let updatedRecord =
      null;

    const updatedCustomers =
      customers.map(
        (
          record
        ) => {
          const vehicle =
            record?.vehicle ||
            record?.loan?.vehicle ||
            {};

          const loan =
            record?.loan;

          if (
            !loan
          ) {
            return record;
          }

          const storedVehicleId =
            vehicle?.id ||
            vehicle?.vehicleId ||
            "";

          const matches =
            (
              vehicleId &&
              String(
                storedVehicleId
              ) ===
                String(
                  vehicleId
                )
            ) ||
            (
              loanId &&
              String(
                loan?.id ||
                  ""
              ) ===
                String(
                  loanId
                )
            ) ||
            (
              loanNumber &&
              String(
                loan?.loanNumber ||
                  ""
              ) ===
                String(
                  loanNumber
                )
            );

          if (
            !matches
          ) {
            return record;
          }

          const nextLoan = {
            ...loan,

            status:
              REPAYMENT_STATUS.FORECLOSED,

            foreclosure: {
              ...(loan?.foreclosure ||
                {}),

              status:
                REPAYMENT_STATUS.FORECLOSED,

              vehicleId:
                vehicleId ||
                storedVehicleId,

              saleId:
                saleId ||
                "",

              salePrice:
                roundMoney(
                  salePrice
                ),

              saleExpenses:
                roundMoney(
                  saleExpenses
                ),

              recoveryAmount:
                roundMoney(
                  recoveryAmount
                ),

              deficiency:
                roundMoney(
                  deficiency
                ),

              surplus:
                roundMoney(
                  surplus
                ),

              completedBy:
                completedBy ||
                "Admin",

              foreclosedAt:
                now,

              updatedAt:
                now,
            },

            updatedAt:
              now,
          };

          const nextVehicle =
            vehicle
              ? {
                  ...vehicle,

                  status:
                    vehicle?.status ||
                    "Sold",
                }
              : vehicle;

          updatedRecord = {
            ...record,

            loan:
              nextLoan,

            vehicle:
              record?.vehicle
                ? nextVehicle
                : record?.vehicle,

            updatedAt:
              now,
          };

          return updatedRecord;
        }
      );

    if (
      !updatedRecord
    ) {
      return null;
    }

    saveCustomers(
      updatedCustomers
    );

    emitDataUpdated();

    return {
      ...updatedRecord,

      loan:
        updatedRecord.loan,
    };
  };

/* =========================================================
   LOAN REPAYMENT STATE
========================================================= */

export const getLoanRepaymentState =
  (
    loan,
    referenceDate = new Date()
  ) => {
    if (
      isLoanClosedLike(
        loan
      )
    ) {
      return {
        status:
          loan?.status ||
          "Closed",

        outstanding: 0,

        principalOutstanding:
          0,

        interestOutstanding:
          0,

        overdueAmount: 0,

        currentDueAmount: 0,

        futureAmount: 0,

        penaltyAmount: 0,

        overdueCount: 0,

        currentDueCount: 0,

        futureCount: 0,

        penaltyRows: [],

        isClosed:
          isClosedLoan(
            loan
          ),

        isForeclosed:
          isForeclosedLoan(
            loan
          ),
      };
    }

    const {
      overdue,
      currentDue,
      future,
    } =
      getRepaymentBuckets(
        loan,
        referenceDate
      );

    const penaltySummary =
      getOutstandingPenaltySummary(
        loan,
        referenceDate
      );

    const outstanding =
      getScheduleOutstanding(
        loan
      );

    const principalOutstanding =
      getLoanPrincipalOutstanding(
        loan
      );

    const interestOutstanding =
      getLoanInterestOutstanding(
        loan
      );

    const totalOverdue =
      roundMoney(
        overdue.reduce(
          (
            total,
            row
          ) =>
            total +
            getScheduleRemainingAmount(
              row
            ),
          0
        )
      );

    const currentDueAmount =
      roundMoney(
        currentDue.reduce(
          (
            total,
            row
          ) =>
            total +
            getScheduleRemainingAmount(
              row
            ),
          0
        )
      );

    const futureAmount =
      roundMoney(
        future.reduce(
          (
            total,
            row
          ) =>
            total +
            getScheduleRemainingAmount(
              row
            ),
          0
        )
      );

    return {
      status:
        loan?.status ||
        "Active",

      outstanding,

      principalOutstanding,

      interestOutstanding,

      overdueAmount:
        totalOverdue,

      currentDueAmount:

        currentDueAmount,

      futureAmount:
        futureAmount,

      penaltyAmount:
        roundMoney(
          penaltySummary.amount
        ),

      totalOverduePayable:
        roundMoney(
          totalOverdue +
            penaltySummary.amount
        ),

      overdueCount:
        overdue.length,

      currentDueCount:
        currentDue.length,

      futureCount:
        future.length,

      penaltyRows:
        penaltySummary.rows,

      isClosed:
        isClosedLoan(
          loan
        ),

      isForeclosed:
        isForeclosedLoan(
          loan
        ),
    };
  };

/* =========================================================
   DUE TODAY
========================================================= */

export const getDueTodayState = (
  loan,
  referenceDate = new Date()
) => {
  if (
    isLoanClosedLike(
      loan
    )
  ) {
    return {
      count: 0,
      amount: 0,
      interestAmount: 0,
      principalAmount: 0,
      rows: [],
    };
  }

  const todayKey =
    getDateKey(
      referenceDate
    );

  const rows =
    getOpenScheduleRows(
      loan
    ).filter(
      (row) =>
        getDateKey(
          row?.dueDate
        ) ===
        todayKey
    );

  const amount =
    roundMoney(
      rows.reduce(
        (
          total,
          row
        ) =>
          total +
          getScheduleRemainingAmount(
            row
          ),
        0
      )
    );

  const interestAmount =
    roundMoney(
      rows.reduce(
        (
          total,
          row
        ) =>
          total +
          getScheduleInterestRemaining(
            row
          ),
        0
      )
    );

  const principalAmount =
    roundMoney(
      rows.reduce(
        (
          total,
          row
        ) =>
          total +
          getSchedulePrincipalRemaining(
            row
          ),
        0
      )
    );

  return {
    count:
      rows.length,

    amount,

    interestAmount,

    principalAmount,

    rows,
  };
};

/* =========================================================
   OVERDUE STATE
========================================================= */

export const getOverdueState = (
  loan,
  referenceDate = new Date()
) => {
  if (
    isLoanClosedLike(
      loan
    )
  ) {
    return {
      count: 0,
      amount: 0,
      interestAmount: 0,
      principalAmount: 0,
      penaltyAmount: 0,
      totalPayable: 0,
      rows: [],
    };
  }

  const {
    overdue,
  } =
    getRepaymentBuckets(
      loan,
      referenceDate
    );

  const rows =
    overdue.map(
      (row) => {
        const penalty =
          calculatePenaltyForInstallment(
            {
              loan,
              scheduleRow:
                row,
              referenceDate,
            }
          );

        const amount =
          getScheduleRemainingAmount(
            row
          );

        const interestAmount =
          getScheduleInterestRemaining(
            row
          );

        const principalAmount =
          getSchedulePrincipalRemaining(
            row
          );

        return {
          ...row,

          amount,

          interestAmount,

          principalAmount,

          overdueDays:
            getOverdueDays(
              row?.dueDate,
              referenceDate
            ),

          ...penalty,

          totalPayable:
            roundMoney(
              amount +
                penalty.penaltyAmount
            ),
        };
      }
    );

  const amount =
    roundMoney(
      rows.reduce(
        (
          total,
          row
        ) =>
          total +
          toNumber(
            row?.amount
          ),
        0
      )
    );

  const interestAmount =
    roundMoney(
      rows.reduce(
        (
          total,
          row
        ) =>
          total +
          toNumber(
            row?.interestAmount
          ),
        0
      )
    );

  const principalAmount =
    roundMoney(
      rows.reduce(
        (
          total,
          row
        ) =>
          total +
          toNumber(
            row?.principalAmount
          ),
        0
      )
    );

  const penaltyAmount =
    roundMoney(
      rows.reduce(
        (
          total,
          row
        ) =>
          total +
          toNumber(
            row?.penaltyAmount
          ),
        0
      )
    );

  return {
    count:
      rows.length,

    amount,

    interestAmount,

    principalAmount,

    penaltyAmount,

    totalPayable:
      roundMoney(
        amount +
          penaltyAmount
      ),

    rows,
  };
};

/* =========================================================
   FUTURE / ADVANCE
========================================================= */

export const getFutureRepaymentState = (
  loan,
  referenceDate = new Date()
) => {
  if (
    isLoanClosedLike(
      loan
    )
  ) {
    return {
      count: 0,
      amount: 0,
      interestAmount: 0,
      principalAmount: 0,
      rows: [],
    };
  }

  const {
    future,
  } =
    getRepaymentBuckets(
      loan,
      referenceDate
    );

  const amount =
    roundMoney(
      future.reduce(
        (
          total,
          row
        ) =>
          total +
          getScheduleRemainingAmount(
            row
          ),
        0
      )
    );

  const interestAmount =
    roundMoney(
      future.reduce(
        (
          total,
          row
        ) =>
          total +
          getScheduleInterestRemaining(
            row
          ),
        0
      )
    );

  const principalAmount =
    roundMoney(
      future.reduce(
        (
          total,
          row
        ) =>
          total +
          getSchedulePrincipalRemaining(
            row
          ),
        0
      )
    );

  return {
    count:
      future.length,

    amount,

    interestAmount,

    principalAmount,

    rows:
      future,
  };
};

/* =========================================================
   CUSTOMER SEARCH / REPAYMENT DETAIL
========================================================= */

/*
 * Staff search can use:
 *
 * Customer ID
 * Customer Name
 * Loan Number
 *
 * This helper returns the compact
 * information required by Staff UI.
 */

export const searchRepaymentCustomers =
  (
    query = ""
  ) => {
    const customers =
      getCustomers();

    const normalizedQuery =
      normalize(
        query
      );

    if (
      !normalizedQuery
    ) {
      return [];
    }

    return customers
      .map(
        (
          record
        ) => {
          const customer =
            record?.customer ||
            {};

          const loan =
            record?.loan ||
            {};

          const customerId =
            getCustomerId(
              record
            );

          const customerName =
            customer?.personal
              ?.name ||
            loan?.customerName ||
            "Customer";

          const mobile =
            customer?.personal
              ?.mobileNumber ||
            loan?.mobileNumber ||
            "";

          const loanNumber =
            getLoanNumber(
              loan
            );

          const searchable =
            [
              customerId,
              customerName,
              mobile,
              loanNumber,
              loan?.id,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          if (
            !searchable.includes(
              normalizedQuery
            )
          ) {
            return null;
          }

          const repaymentState =
            getLoanRepaymentState(
              loan
            );

          const dueToday =
            getDueTodayState(
              loan
            );

          const overdue =
            getOverdueState(
              loan
            );

          const future =
            getFutureRepaymentState(
              loan
            );

          return {
            customerId,

            customerName,

            mobile,

            loanId:
              loan?.id ||
              "",

            loanNumber,

            loanAmount:
              roundMoney(
                loan?.loanAmount ??
                  loan?.calculation
                    ?.principal ??
                  0
              ),

            outstanding:
              repaymentState.outstanding,

            principalOutstanding:
              repaymentState.principalOutstanding,

            interestOutstanding:
              repaymentState.interestOutstanding,

            todayDueAmount:
              dueToday.amount,

            overdueAmount:
              overdue.amount,

            penaltyAmount:
              overdue.penaltyAmount,

            overdueTotalPayable:
              overdue.totalPayable,

            futureAmount:
              future.amount,

            status:
              repaymentState.status,

            loan,
          };
        }
      )
      .filter(Boolean)
      .sort(
        (a, b) =>
          a.customerName.localeCompare(
            b.customerName
          )
      );
  };

/* =========================================================
   REPAYMENT DETAIL FOR STAFF
========================================================= */

export const getRepaymentDetail = (
  loan,
  referenceDate = new Date()
) => {
  if (!loan) {
    return null;
  }

  const repaymentState =
    getLoanRepaymentState(
      loan,
      referenceDate
    );

  const dueToday =
    getDueTodayState(
      loan,
      referenceDate
    );

  const overdue =
    getOverdueState(
      loan,
      referenceDate
    );

  const future =
    getFutureRepaymentState(
      loan,
      referenceDate
    );

  return {
    customerName:
      loan?.customerName ||
      "Customer",

    loanId:
      loan?.id ||
      "",

    loanNumber:
      loan?.loanNumber ||
      "",

    loanAmount:
      roundMoney(
        loan?.loanAmount ??
          loan?.calculation
            ?.principal ??
          0
      ),

    outstanding:
      repaymentState.outstanding,

    principalOutstanding:
      repaymentState.principalOutstanding,

    interestOutstanding:
      repaymentState.interestOutstanding,

    status:
      repaymentState.status,

    todayDue,

    overdue,

    future,

    hasTodayDue:
      dueToday.amount > 0,

    hasOverdue:
      overdue.amount > 0,

    hasAdvance:
      future.amount > 0,

    /*
     * Staff can choose:
     *
     * Due
     * Overdue
     * Advance
     */
    defaultMode:
      overdue.amount > 0
        ? "Overdue"
        : dueToday.amount > 0
        ? "Today Due"
        : "Advance",
  };
};

/* =========================================================
   NORMAL REPAYMENT GUARD
========================================================= */

export const canAcceptNormalRepayment =
  (
    loan
  ) => {
    if (
      !loan
    ) {
      return false;
    }

    if (
      isForeclosedLoan(
        loan
      )
    ) {
      return false;
    }

    if (
      isClosedLoan(
        loan
      )
    ) {
      return false;
    }

    return true;
  };

/* =========================================================
   COMPATIBILITY EXPORTS
========================================================= */

export const getRepaymentOutstanding =
  getScheduleOutstanding;

export const getPenaltyAmount = (
  loan,
  scheduleRow,
  referenceDate
) => {
  return calculatePenaltyForInstallment(
    {
      loan,
      scheduleRow,
      referenceDate,
    }
  ).penaltyAmount;
};

export const getTodayRepaymentState = (
  loan
) => {
  return {
    due:
      getDueTodayState(
        loan
      ),

    overdue:
      getOverdueState(
        loan
      ),

    future:
      getFutureRepaymentState(
        loan
      ),
  };
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  REPAYMENT_STATUS,

  PAYMENT_ALLOCATION_TYPE,

  DEFAULT_ALLOCATION_ORDER,

  parseLocalDate,
  startOfDay,
  getDateKey,
  getTodayKey,

  isForeclosedLoan,
  isClosedLoan,
  isLoanClosedLike,
  isOpenLoan,

  getLoanId,
  getLoanNumber,
  getCustomerId,
  findCustomerLoan,

  getScheduleAmount,
  getSchedulePaidAmount,
  getScheduleRemainingAmount,

  getSchedulePrincipalRemaining,
  getScheduleInterestRemaining,
  getSchedulePrincipalPaidAmount,
  getScheduleInterestPaidAmount,

  getPenaltyConfig,
  getOverdueDays,
  calculatePenaltyForInstallment,

  normalizeSchedule,
  getOpenScheduleRows,
  getRepaymentBuckets,

  getOutstandingPenaltySummary,

  getScheduleOutstanding,
  getLoanPaymentOutstanding,

  getLoanInterestOutstanding,
  getLoanPrincipalOutstanding,

  getPrincipalOutstanding,

  shouldCloseLoan,

  buildPaymentAllocation,
  getPaymentTypeFromAllocation,

  processRepayment,
  previewRepayment,

  previewFullSettlement,
  processFullSettlement,

  forecloseLoan,
  forecloseLoanForVehicleSale,

  getLoanRepaymentState,
  getDueTodayState,
  getOverdueState,
  getFutureRepaymentState,

  searchRepaymentCustomers,
  getRepaymentDetail,

  canAcceptNormalRepayment,

  getRepaymentOutstanding,
  getPenaltyAmount,
  getTodayRepaymentState,
};