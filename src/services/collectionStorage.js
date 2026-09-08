// src/services/collectionStorage.js

import {
  getCustomers,
} from "./customerStorage";

import {
  processRepayment,
} from "./repaymentStorage";

/* =========================================================
   STORAGE
========================================================= */

const COLLECTION_STORAGE_KEY =
  "auto_finance_collections";

const DATA_UPDATED_EVENT =
  "auto-finance:data-updated";

/* =========================================================
   COLLECTION STATUS
========================================================= */

export const COLLECTION_STATUS = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  REVERSED: "Reversed",
};

/* =========================================================
   PAYMENT TYPE
========================================================= */

export const COLLECTION_PAYMENT_TYPE = {
  DUE: "Due Payment",
  OVERDUE: "Overdue Payment",
  ADVANCE: "Advance Payment",
  DUE_ADVANCE: "Due + Advance",
  OVERDUE_ADVANCE:
    "Overdue + Advance",
  OVERDUE_DUE_ADVANCE:
    "Overdue + Due + Advance",
  FULL_SETTLEMENT: "Full Settlement",
  PRINCIPAL: "Principal Payment",
  PENALTY: "Penalty Payment",
  EXCESS: "Excess Payment",
};

/* =========================================================
   STORAGE READ
========================================================= */

export const getCollections = () => {
  try {
    const stored =
      localStorage.getItem(
        COLLECTION_STORAGE_KEY
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
      "Failed to read collections:",
      error
    );

    return [];
  }
};

/* =========================================================
   EVENT
========================================================= */

const dispatchUpdate = () => {
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
   SAVE
========================================================= */

const saveCollections = (
  collections
) => {
  localStorage.setItem(
    COLLECTION_STORAGE_KEY,
    JSON.stringify(
      Array.isArray(
        collections
      )
        ? collections
        : []
    )
  );

  dispatchUpdate();
};

/* =========================================================
   NORMALIZE
========================================================= */

const normalize = (
  value
) => {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase();
};

/* =========================================================
   NUMBER
========================================================= */

const toNumber = (
  value
) => {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : 0;
};

const roundMoney = (
  value
) => {
  return (
    Math.round(
      (
        toNumber(value) +
        Number.EPSILON
      ) * 100
    ) / 100
  );
};

/* =========================================================
   DATE HELPERS
========================================================= */

export const getDateKey = (
  value
) => {
  if (!value) {
    return "";
  }

  const raw =
    String(value);

  const match =
    raw.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }

  const date =
    new Date(value);

  if (
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
   DATE PARSE
========================================================= */

const parseLocalDate = (
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

/* =========================================================
   DATE RANGE NORMALIZATION
========================================================= */

const startOfDay = (
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

const endOfDay = (
  value
) => {
  const date =
    parseLocalDate(value);

  if (!date) {
    return null;
  }

  date.setHours(
    23,
    59,
    59,
    999
  );

  return date;
};

/* =========================================================
   ID
========================================================= */

const createCollectionId = (
  collections
) => {
  const highest =
    collections.reduce(
      (
        max,
        item
      ) => {
        const match =
          String(
            item?.id || ""
          ).match(
            /^COL-(\d+)$/
          );

        if (!match) {
          return max;
        }

        return Math.max(
          max,
          Number(
            match[1]
          )
        );
      },
      0
    );

  return `COL-${String(
    highest + 1
  ).padStart(
    4,
    "0"
  )}`;
};

/* =========================================================
   CREATE COLLECTION
========================================================= */

export const addCollection = (
  collection = {}
) => {
  const collections =
    getCollections();

  const now =
    new Date().toISOString();

  const amount =
    roundMoney(
      collection?.amount
    );

  const dueAmount =
    roundMoney(
      collection?.dueAmount
    );

  const penaltyAmount =
    roundMoney(
      collection?.penaltyAmount
    );

  const totalPayable =
    roundMoney(
      collection?.totalPayable ??
        dueAmount +
          penaltyAmount
    );

  const newCollection = {
    ...collection,

    id:
      collection?.id ||
      createCollectionId(
        collections
      ),

    status:
      COLLECTION_STATUS.PENDING,

    submittedAt:
      collection?.submittedAt ||
      now,

    collectedDate:
      collection?.collectedDate ||
      now,

    approvedAt:
      null,

    approvedBy:
      null,

    rejectedAt:
      null,

    rejectedBy:
      null,

    rejectionRemarks:
      "",

    reversedAt:
      null,

    reversedBy:
      null,

    reversalReason:
      "",

    amount,

    dueAmount,

    penaltyAmount,

    totalPayable,

    repaymentProcessed:
      false,

    repaymentProcessedAt:
      null,

    repaymentProcessingStatus:
      "Pending",

    repaymentError:
      "",

    paymentType:
      collection?.paymentType ||
      "Payment",

    amountTowardDue:
      roundMoney(
        collection?.amountTowardDue
      ),

    amountTowardPenalty:
      roundMoney(
        collection?.amountTowardPenalty
      ),

    amountTowardAdvance:
      roundMoney(
        collection?.amountTowardAdvance
      ),

    amountTowardPrincipal:
      roundMoney(
        collection?.amountTowardPrincipal
      ),

    amountExcess:
      roundMoney(
        collection?.amountExcess
      ),

    allocation:
      collection?.allocation ||
      null,

    repayment:
      collection?.repayment ||
      null,

    overdueDays:
      toNumber(
        collection?.overdueDays
      ),

    graceDays:
      toNumber(
        collection?.graceDays
      ),

    penaltyDays:
      toNumber(
        collection?.penaltyDays
      ),

    penaltyType:
      collection?.penaltyType ||
      "Fixed",

    penaltyRate:
      toNumber(
        collection?.penaltyRate
      ),

    createdAt:
      collection?.createdAt ||
      now,

    updatedAt:
      now,
  };

  /*
   * APPEND ONLY.
   * Historical collection records
   * must never be overwritten.
   */
  saveCollections([
    ...collections,
    newCollection,
  ]);

  return newCollection;
};

/* =========================================================
   UPDATE COLLECTION
========================================================= */

export const updateCollection = (
  collectionId,
  updates = {}
) => {
  const collections =
    getCollections();

  let result = null;

  const updated =
    collections.map(
      (item) => {
        if (
          String(
            item?.id
          ) !==
          String(
            collectionId
          )
        ) {
          return item;
        }

        result = {
          ...item,
          ...updates,
          updatedAt:
            new Date().toISOString(),
        };

        return result;
      }
    );

  saveCollections(
    updated
  );

  return result;
};

/* =========================================================
   FIND CUSTOMER + LOAN
========================================================= */

const findCustomerLoan = (
  customers,
  collection
) => {
  const collectionLoanId =
    collection?.loanId ||
    "";

  const collectionLoanNumber =
    collection?.loanNumber ||
    "";

  const customerId =
    collection?.customerId ||
    "";

  /*
   * First attempt:
   * Customer + Loan
   */
  for (
    const customer of customers
  ) {
    const storedCustomerId =
      customer?.customer?.id ||
      customer?.customer?.customerId ||
      customer?.customer?.customerNumber ||
      "";

    if (
      customerId &&
      String(
        storedCustomerId
      ) !==
        String(
          customerId
        )
    ) {
      continue;
    }

    const loans = [
      customer?.loan,
      ...(
        Array.isArray(
          customer?.loans
        )
          ? customer.loans
          : []
      ),
    ].filter(Boolean);

    const loan =
      loans.find(
        (candidate) => {
          const matchesId =
            Boolean(
              collectionLoanId
            ) &&
            String(
              candidate?.id ||
                ""
            ) ===
              String(
                collectionLoanId
              );

          const matchesNumber =
            Boolean(
              collectionLoanNumber
            ) &&
            String(
              candidate?.loanNumber ||
                ""
            ) ===
              String(
                collectionLoanNumber
              );

          return (
            matchesId ||
            matchesNumber
          );
        }
      );

    if (loan) {
      return {
        customer,
        loan,
      };
    }
  }

  /*
   * Fallback:
   * Search by loan alone.
   */
  for (
    const customer of customers
  ) {
    const loans = [
      customer?.loan,
      ...(
        Array.isArray(
          customer?.loans
        )
          ? customer.loans
          : []
      ),
    ].filter(Boolean);

    const loan =
      loans.find(
        (candidate) =>
          (
            collectionLoanId &&
            String(
              candidate?.id ||
                ""
            ) ===
              String(
                collectionLoanId
              )
          ) ||
          (
            collectionLoanNumber &&
            String(
              candidate?.loanNumber ||
                ""
            ) ===
              String(
                collectionLoanNumber
              )
          )
      );

    if (loan) {
      return {
        customer,
        loan,
      };
    }
  }

  return null;
};

/* =========================================================
   GET COLLECTION BY ID
========================================================= */

export const getCollectionById = (
  collectionId
) => {
  return (
    getCollections().find(
      (item) =>
        String(
          item?.id
        ) ===
        String(
          collectionId
        )
    ) || null
  );
};

/* =========================================================
   DUPLICATE PROCESSING GUARD
========================================================= */

const wasRepaymentProcessed = (
  collection,
  loan
) => {
  if (
    normalize(
      collection?.repaymentProcessingStatus
    ) ===
    "processed"
  ) {
    return true;
  }

  if (
    collection?.repaymentProcessed ===
    true
  ) {
    return true;
  }

  if (
    !Array.isArray(
      loan?.paymentHistory
    )
  ) {
    return false;
  }

  return loan.paymentHistory.some(
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
};

/* =========================================================
   APPROVE COLLECTION
========================================================= */

export const approveCollection = (
  collectionId,
  admin
) => {
  const existing =
    getCollectionById(
      collectionId
    );

  if (!existing) {
    return null;
  }

  /*
   * Already approved and processed.
   */
  if (
    normalize(
      existing.status
    ) ===
      "approved" &&
    normalize(
      existing.repaymentProcessingStatus
    ) ===
      "processed"
  ) {
    return existing;
  }

  /*
   * Only Pending collections
   * may be approved.
   */
  if (
    normalize(
      existing.status
    ) !==
    "pending"
  ) {
    return existing;
  }

  /*
   * Locate customer + loan.
   */
  const customers =
    getCustomers();

  const match =
    findCustomerLoan(
      customers,
      existing
    );

  if (!match) {
    return updateCollection(
      existing.id,
      {
        repaymentProcessingStatus:
          "Failed",

        repaymentError:
          "Loan not found for this collection.",

        updatedAt:
          new Date().toISOString(),
      }
    );
  }

  const {
    loan,
  } = match;

  /*
   * Duplicate protection.
   */
  if (
    wasRepaymentProcessed(
      existing,
      loan
    )
  ) {
    const repaired =
      updateCollection(
        existing.id,
        {
          status:
            COLLECTION_STATUS.APPROVED,

          approvedAt:
            existing.approvedAt ||
            new Date().toISOString(),

          approvedBy:
            existing.approvedBy ||
            admin?.name ||
            admin?.username ||
            "Admin",

          repaymentProcessed:
            true,

          repaymentProcessingStatus:
            "Processed",

          repaymentProcessedAt:
            existing.repaymentProcessedAt ||
            new Date().toISOString(),

          repaymentError:
            "",
        }
      );

    return repaired;
  }

  /* =======================================================
     PROCESS REPAYMENT
  ======================================================== */

  let repaymentResult =
    null;

  try {
    /*
     * processRepayment expects an
     * approved collection snapshot.
     *
     * Do not mutate the real record
     * until repayment processing
     * succeeds.
     */
    repaymentResult =
      processRepayment({
        collection: {
          ...existing,

          status:
            COLLECTION_STATUS.APPROVED,
        },

        allocationOptions: {
          allowAdvance:
            true,

          allowPrincipalPayment:
            false,
        },
      });
  } catch (error) {
    console.error(
      "Failed to process approved collection:",
      error
    );

    return updateCollection(
      existing.id,
      {
        repaymentProcessingStatus:
          "Failed",

        repaymentError:
          error?.message ||
          "Repayment processing failed.",
      }
    );
  }

  /* =======================================================
     REPAYMENT FAILED
  ======================================================== */

  if (
    !repaymentResult?.success
  ) {
    console.error(
      "Repayment processing failed:",
      repaymentResult
    );

    return updateCollection(
      existing.id,
      {
        repaymentProcessingStatus:
          "Failed",

        repaymentError:
          getRepaymentErrorMessage(
            repaymentResult
          ),
      }
    );
  }

  /* =======================================================
     REPAYMENT SUCCESS
  ======================================================== */

  const approvedAt =
    new Date().toISOString();

  const approvedBy =
    admin?.name ||
    admin?.username ||
    "Admin";

  const allocation =
    repaymentResult?.allocation ||
    {};

  const repaymentMeta =
    repaymentResult?.repayment ||
    {};

  const currentCollections =
    getCollections();

  const updatedCollections =
    currentCollections.map(
      (item) => {
        if (
          String(
            item?.id
          ) !==
          String(
            existing.id
          )
        ) {
          return item;
        }

        return {
          ...item,

          status:
            COLLECTION_STATUS.APPROVED,

          approvedAt,

          approvedBy,

          rejectedAt:
            null,

          rejectedBy:
            null,

          rejectionRemarks:
            "",

          repaymentProcessed:
            true,

          repaymentProcessingStatus:
            "Processed",

          repaymentProcessedAt:
            approvedAt,

          repaymentError:
            "",

          paymentType:
            repaymentMeta?.paymentType ||
            item?.paymentType ||
            "Payment",

          amountTowardDue:
            roundMoney(
              allocation?.overdue +
                allocation?.currentDue
            ),

          amountTowardPenalty:
            roundMoney(
              allocation?.penalty
            ),

          amountTowardAdvance:
            roundMoney(
              allocation?.advance
            ),

          amountTowardPrincipal:
            roundMoney(
              allocation?.principal
            ),

          amountExcess:
            roundMoney(
              allocation?.excess
            ),

          allocation: {
            ...allocation,

            items:
              Array.isArray(
                allocation?.items
              )
                ? allocation.items
                : [],
          },

          repayment:
            repaymentMeta,

          repaymentLoanStatus:
            repaymentResult?.loanStatus ||
            repaymentResult?.loan?.status ||
            null,

          repaymentOutstanding:
            roundMoney(
              repaymentResult?.outstanding
            ),

          updatedAt:
            new Date().toISOString(),
        };
      }
    );

  saveCollections(
    updatedCollections
  );

  const finalCollection =
    updatedCollections.find(
      (item) =>
        String(
          item?.id
        ) ===
        String(
          existing.id
        )
    );

  return {
    ...finalCollection,

    loanUpdate:
      repaymentResult,

    repayment:
      repaymentResult,
  };
};

/* =========================================================
   REPAYMENT ERROR MESSAGE
========================================================= */

const getRepaymentErrorMessage = (
  result
) => {
  if (!result) {
    return (
      "Unknown repayment processing error."
    );
  }

  switch (
    result?.reason
  ) {
    case "collection_required":
      return (
        "Collection record is required."
      );

    case "collection_not_approved":
      return (
        "Collection must be approved before repayment posting."
      );

    case "loan_not_found":
      return (
        "Loan not found for this collection."
      );

    case "loan_closed":
      return (
        "This loan is already closed."
      );

    case "loan_foreclosed":
      return (
        "This loan is already foreclosed."
      );

    case "invalid_payment_amount":
      return (
        "Invalid collection amount."
      );

    case "already_processed":
      return (
        "This collection has already been processed."
      );

    case "settlement_amount_insufficient":
      return (
        "The settlement amount is insufficient."
      );

    default:
      return (
        result?.reason ||
        "Repayment processing failed."
      );
  }
};

/* =========================================================
   REJECT COLLECTION
========================================================= */

export const rejectCollection = (
  collectionId,
  admin,
  remarks = ""
) => {
  const existing =
    getCollectionById(
      collectionId
    );

  if (!existing) {
    return null;
  }

  /*
   * Only Pending can be rejected.
   */
  if (
    normalize(
      existing.status
    ) !==
    "pending"
  ) {
    return existing;
  }

  return updateCollection(
    collectionId,
    {
      status:
        COLLECTION_STATUS.REJECTED,

      rejectedAt:
        new Date().toISOString(),

      rejectedBy:
        admin?.name ||
        admin?.username ||
        "Admin",

      rejectionRemarks:
        remarks || "",

      approvedAt:
        null,

      approvedBy:
        null,

      repaymentProcessed:
        false,

      repaymentProcessingStatus:
        "Rejected",

      repaymentError:
        "",
    }
  );
};

/* =========================================================
   REVERSE COLLECTION
========================================================= */

/*
 * Audit state only.
 *
 * Does not change the loan.
 * A dedicated repayment reversal
 * process should be used for actual
 * financial reversal.
 */

export const reverseCollection = (
  collectionId,
  admin,
  reason = ""
) => {
  const existing =
    getCollectionById(
      collectionId
    );

  if (!existing) {
    return null;
  }

  if (
    normalize(
      existing.status
    ) !==
    "approved"
  ) {
    return existing;
  }

  return updateCollection(
    collectionId,
    {
      status:
        COLLECTION_STATUS.REVERSED,

      reversedAt:
        new Date().toISOString(),

      reversedBy:
        admin?.name ||
        admin?.username ||
        "Admin",

      reversalReason:
        reason || "",
    }
  );
};

/* =========================================================
   DELETE
========================================================= */

export const deleteCollection = (
  collectionId
) => {
  const collections =
    getCollections();

  const existing =
    collections.find(
      (item) =>
        String(
          item?.id
        ) ===
        String(
          collectionId
        )
    );

  if (!existing) {
    return false;
  }

  /*
   * Approved records cannot be
   * silently deleted.
   */
  if (
    normalize(
      existing.status
    ) ===
    "approved"
  ) {
    console.warn(
      "Approved collection cannot be deleted. Use reverseCollection()."
    );

    return false;
  }

  saveCollections(
    collections.filter(
      (item) =>
        String(
          item?.id
        ) !==
        String(
          collectionId
        )
    )
  );

  return true;
};

/* =========================================================
   PENDING
========================================================= */

export const getPendingCollections =
  () => {
    return getCollections().filter(
      (item) =>
        normalize(
          item?.status
        ) ===
        "pending"
    );
  };

/* =========================================================
   APPROVED
========================================================= */

export const getApprovedCollections =
  () => {
    return getCollections().filter(
      (item) =>
        normalize(
          item?.status
        ) ===
        "approved"
    );
  };

/* =========================================================
   REJECTED
========================================================= */

export const getRejectedCollections =
  () => {
    return getCollections().filter(
      (item) =>
        normalize(
          item?.status
        ) ===
        "rejected"
    );
  };

/* =========================================================
   REVERSED
========================================================= */

export const getReversedCollections =
  () => {
    return getCollections().filter(
      (item) =>
        normalize(
          item?.status
        ) ===
        "reversed"
    );
  };

/* =========================================================
   APPROVED TOTAL
========================================================= */

export const getApprovedCollectionTotal =
  () => {
    return getCollections()
      .filter(
        (item) =>
          normalize(
            item?.status
          ) ===
          "approved"
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
      );
  };

/* =========================================================
   PENDING TOTAL
========================================================= */

export const getPendingCollectionTotal =
  () => {
    return getCollections()
      .filter(
        (item) =>
          normalize(
            item?.status
          ) ===
          "pending"
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
      );
  };

/* =========================================================
   REJECTED TOTAL
========================================================= */

export const getRejectedCollectionTotal =
  () => {
    return getCollections()
      .filter(
        (item) =>
          normalize(
            item?.status
          ) ===
          "rejected"
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
      );
  };

/* =========================================================
   TODAY APPROVED TOTAL
========================================================= */

export const getTodayApprovedCollectionTotal =
  () => {
    const today =
      getDateKey(
        new Date()
      );

    return getCollections()
      .filter(
        (item) => {
          if (
            normalize(
              item?.status
            ) !==
            "approved"
          ) {
            return false;
          }

          return (
            getDateKey(
              item?.approvedAt ||
                item?.collectedDate
            ) ===
            today
          );
        }
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
      );
  };

/* =========================================================
   COLLECTIONS FOR LOAN
========================================================= */

export const getCollectionsForLoan =
  (
    loanId,
    loanNumber
  ) => {
    return getCollections().filter(
      (item) => {
        const matchesId =
          Boolean(
            loanId
          ) &&
          String(
            item?.loanId ||
              ""
          ) ===
            String(
              loanId
            );

        const matchesNumber =
          Boolean(
            loanNumber
          ) &&
          String(
            item?.loanNumber ||
              ""
          ) ===
            String(
              loanNumber
            );

        return (
          matchesId ||
          matchesNumber
        );
      }
    );
  };

/* =========================================================
   COLLECTIONS FOR CUSTOMER
========================================================= */

export const getCollectionsForCustomer =
  (
    customerId
  ) => {
    return getCollections().filter(
      (item) =>
        String(
          item?.customerId ||
            ""
        ) ===
        String(
          customerId ||
            ""
        )
    );
  };

/* =========================================================
   STATUS COUNTS
========================================================= */

export const getCollectionStatusCounts =
  () => {
    const collections =
      getCollections();

    return {
      total:
        collections.length,

      pending:
        collections.filter(
          (item) =>
            normalize(
              item?.status
            ) ===
            "pending"
        ).length,

      approved:
        collections.filter(
          (item) =>
            normalize(
              item?.status
            ) ===
            "approved"
        ).length,

      rejected:
        collections.filter(
          (item) =>
            normalize(
              item?.status
            ) ===
            "rejected"
        ).length,

      reversed:
        collections.filter(
          (item) =>
            normalize(
              item?.status
            ) ===
            "reversed"
        ).length,
    };
  };

/* =========================================================
   COLLECTION AMOUNT
========================================================= */

export const getCollectionAmount = (
  collection
) => {
  return roundMoney(
    collection?.amount
  );
};

/* =========================================================
   COLLECTION PENALTY
========================================================= */

export const getCollectionPenalty =
  (
    collection
  ) => {
    return roundMoney(
      collection?.penaltyAmount
    );
  };

/* =========================================================
   VALIDATE COLLECTION
========================================================= */

export const validateCollection = (
  collection
) => {
  if (!collection) {
    return {
      valid: false,
      reason:
        "collection_required",
    };
  }

  const amount =
    getCollectionAmount(
      collection
    );

  if (
    amount <= 0
  ) {
    return {
      valid: false,
      reason:
        "invalid_payment_amount",
    };
  }

  if (
    !collection?.loanId &&
    !collection?.loanNumber
  ) {
    return {
      valid: false,
      reason:
        "loan_identifier_required",
    };
  }

  return {
    valid: true,
    reason: "",
  };
};

/* =========================================================
   HISTORICAL COLLECTION REPORT DATE
========================================================= */

/*
 * Date used for historical reporting.
 *
 * Priority:
 *
 * 1. collectedDate
 * 2. approvedAt
 * 3. submittedAt
 * 4. createdAt
 */

export const getCollectionReportDate = (
  collection
) => {
  return (
    collection?.collectedDate ||
    collection?.approvedAt ||
    collection?.submittedAt ||
    collection?.createdAt ||
    ""
  );
};

/* =========================================================
   COLLECTION DATE RANGE MATCH
========================================================= */

const collectionMatchesDateRange = (
  collection,
  startDate,
  endDate
) => {
  const reportDate =
    parseLocalDate(
      getCollectionReportDate(
        collection
      )
    );

  if (!reportDate) {
    return false;
  }

  const start =
    startDate
      ? startOfDay(
          startDate
        )
      : null;

  const end =
    endDate
      ? endOfDay(
          endDate
        )
      : null;

  if (
    start &&
    reportDate.getTime() <
      start.getTime()
  ) {
    return false;
  }

  if (
    end &&
    reportDate.getTime() >
      end.getTime()
  ) {
    return false;
  }

  return true;
};

/* =========================================================
   COLLECTION HISTORY
========================================================= */

/*
 * Returns historical collection
 * records without modifying storage.
 *
 * Supported filters:
 *
 * startDate
 * endDate
 * status
 * customerId
 * loanId
 * loanNumber
 * search
 * approvedOnly
 */

export const getCollectionHistory = ({
  startDate = "",
  endDate = "",
  status = "",
  customerId = "",
  loanId = "",
  loanNumber = "",
  search = "",
  customerName = "",
  approvedOnly = false,
} = {}) => {
  const collections =
    getCollections();

  const query =
    normalize(
      search ||
        customerName
    );

  return collections
    .filter(
      (collection) => {
        /*
         * DATE RANGE
         */
        if (
          startDate ||
          endDate
        ) {
          if (
            !collectionMatchesDateRange(
              collection,
              startDate,
              endDate
            )
          ) {
            return false;
          }
        }

        /*
         * STATUS
         */
        if (
          status &&
          normalize(
            collection?.status
          ) !==
            normalize(
              status
            )
        ) {
          return false;
        }

        /*
         * APPROVED ONLY
         */
        if (
          approvedOnly &&
          normalize(
            collection?.status
          ) !==
            "approved"
        ) {
          return false;
        }

        /*
         * CUSTOMER ID
         */
        if (
          customerId &&
          String(
            collection?.customerId ||
              ""
          ) !==
            String(
              customerId
            )
        ) {
          return false;
        }

        /*
         * LOAN ID
         */
        if (
          loanId &&
          String(
            collection?.loanId ||
              ""
          ) !==
            String(
              loanId
            )
        ) {
          return false;
        }

        /*
         * LOAN NUMBER
         */
        if (
          loanNumber &&
          normalize(
            collection?.loanNumber
          ) !==
            normalize(
              loanNumber
            )
        ) {
          return false;
        }

        /*
         * GENERIC SEARCH
         */
        if (query) {
          const searchableText = [
            collection?.id,
            collection?.customerName,
            collection?.customerId,
            collection?.mobileNumber,
            collection?.loanNumber,
            collection?.loanId,
            collection?.paymentType,
            collection?.paymentMode,
            collection?.staffName,
            collection?.location,
            collection?.remarks,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          if (
            !searchableText.includes(
              query
            )
          ) {
            return false;
          }
        }

        return true;
      }
    )
    .sort(
      (
        a,
        b
      ) => {
        const aDate =
          parseLocalDate(
            getCollectionReportDate(
              a
            )
          );

        const bDate =
          parseLocalDate(
            getCollectionReportDate(
              b
            )
          );

        return (
          (
            bDate?.getTime() ||
            0
          ) -
          (
            aDate?.getTime() ||
            0
          )
        );
      }
    );
};

/* =========================================================
   COLLECTION HISTORY BY DATE RANGE
========================================================= */

export const getCollectionHistoryByDateRange =
  (
    startDate,
    endDate,
    options = {}
  ) => {
    return getCollectionHistory({
      ...options,
      startDate,
      endDate,
    });
  };

/* =========================================================
   COLLECTION HISTORY SUMMARY
========================================================= */

export const getCollectionHistorySummary =
  ({
    startDate = "",
    endDate = "",
    status = "",
    customerId = "",
    loanId = "",
    loanNumber = "",
    search = "",
    customerName = "",
    approvedOnly = false,
  } = {}) => {
    const records =
      getCollectionHistory({
        startDate,
        endDate,
        status,
        customerId,
        loanId,
        loanNumber,
        search,
        customerName,
        approvedOnly,
      });

    const totalAmount =
      records.reduce(
        (
          total,
          item
        ) =>
          total +
          toNumber(
            item?.amount
          ),
        0
      );

    const approvedRecords =
      records.filter(
        (item) =>
          normalize(
            item?.status
          ) ===
          "approved"
      );

    const pendingRecords =
      records.filter(
        (item) =>
          normalize(
            item?.status
          ) ===
          "pending"
      );

    const rejectedRecords =
      records.filter(
        (item) =>
          normalize(
            item?.status
          ) ===
          "rejected"
      );

    const reversedRecords =
      records.filter(
        (item) =>
          normalize(
            item?.status
          ) ===
          "reversed"
      );

    const approvedAmount =
      approvedRecords.reduce(
        (
          total,
          item
        ) =>
          total +
          toNumber(
            item?.amount
          ),
        0
      );

    const pendingAmount =
      pendingRecords.reduce(
        (
          total,
          item
        ) =>
          total +
          toNumber(
            item?.amount
          ),
        0
      );

    const rejectedAmount =
      rejectedRecords.reduce(
        (
          total,
          item
        ) =>
          total +
          toNumber(
            item?.amount
          ),
        0
      );

    const reversedAmount =
      reversedRecords.reduce(
        (
          total,
          item
        ) =>
          total +
          toNumber(
            item?.amount
          ),
        0
      );

    const totalPenalty =
      records.reduce(
        (
          total,
          item
        ) =>
          total +
          toNumber(
            item?.penaltyAmount
          ),
        0
      );

    /*
     * Total due component.
     *
     * Prefer the actual allocation's
     * overdue + currentDue values.
     * Fall back to amountTowardDue.
     */
    const totalDue =
      records.reduce(
        (
          total,
          item
        ) => {
          const allocation =
            item?.allocation ||
            {};

          const allocatedDue =
            toNumber(
              allocation?.overdue
            ) +
            toNumber(
              allocation?.currentDue
            );

          return (
            total +
            (
              allocatedDue > 0
                ? allocatedDue
                : toNumber(
                    item?.amountTowardDue
                  )
            )
          );
        },
        0
      );

    const totalAdvance =
      records.reduce(
        (
          total,
          item
        ) =>
          total +
          toNumber(
            item?.amountTowardAdvance
          ),
        0
      );

    const totalPrincipal =
      records.reduce(
        (
          total,
          item
        ) =>
          total +
          toNumber(
            item?.amountTowardPrincipal
          ),
        0
      );

    const totalExcess =
      records.reduce(
        (
          total,
          item
        ) =>
          total +
          toNumber(
            item?.amountExcess
          ),
        0
      );

    /*
     * Customer-wise totals.
     */
    const byCustomerMap =
      new Map();

    records.forEach(
      (item) => {
        const customerId =
          String(
            item?.customerId ||
              "NO-ID"
          );

        const customerName =
          item?.customerName ||
          "Customer";

        const key =
          `${customerId}__${customerName}`;

        const existing =
          byCustomerMap.get(
            key
          ) || {
            customerId:
              item?.customerId ||
              "",

            customerName:
              customerName,

            amount:
              0,

            count:
              0,
          };

        existing.amount +=
          toNumber(
            item?.amount
          );

        existing.count += 1;

        byCustomerMap.set(
          key,
          existing
        );
      }
    );

    const uniqueCustomers =
      new Set(
        records
          .map(
            (item) =>
              item?.customerId
          )
          .filter(Boolean)
      );

    /*
     * Customer ID may not always exist.
     * Use a customer+loan fallback
     * for unique reporting.
     */
    const customerCount =
      uniqueCustomers.size ||
      new Set(
        records.map(
          (item) =>
            item?.customerName ||
            ""
        )
      ).size;

    const uniqueLoans =
      new Set(
        records
          .map(
            (item) =>
              item?.loanId ||
              item?.loanNumber
          )
          .filter(Boolean)
      );

    const averageCollection =
      records.length >
      0
        ? totalAmount /
          records.length
        : 0;

    return {
      startDate,
      endDate,

      recordCount:
        records.length,

      /*
       * Compatibility alias used
       * by some existing UI code.
       */
      totalRecords:
        records.length,

      totalAmount:
        roundMoney(
          totalAmount
        ),

      approvedCount:
        approvedRecords.length,

      approvedAmount:
        roundMoney(
          approvedAmount
        ),

      pendingCount:
        pendingRecords.length,

      pendingAmount:
        roundMoney(
          pendingAmount
        ),

      rejectedCount:
        rejectedRecords.length,

      rejectedAmount:
        roundMoney(
          rejectedAmount
        ),

      reversedCount:
        reversedRecords.length,

      reversedAmount:
        roundMoney(
          reversedAmount
        ),

      totalPenalty:
        roundMoney(
          totalPenalty
        ),

      totalDue:
        roundMoney(
          totalDue
        ),

      totalAdvance:
        roundMoney(
          totalAdvance
        ),

      totalPrincipal:
        roundMoney(
          totalPrincipal
        ),

      totalExcess:
        roundMoney(
          totalExcess
        ),

      customerCount,

      loanCount:
        uniqueLoans.size,

      averageCollection:
        roundMoney(
          averageCollection
        ),

      /*
       * Customer-wise reporting.
       */
      byCustomer:
        Array.from(
          byCustomerMap.values()
        ).sort(
          (a, b) =>
            b.amount -
            a.amount
        ),

      records,
    };
  };

/* =========================================================
   MONTHLY COLLECTION SUMMARY
========================================================= */

/*
 * Returns totals grouped by month.
 *
 * Example:
 *
 * [
 *   {
 *     month: "2026-09",
 *     total: 50000,
 *     count: 12
 *   }
 * ]
 */

export const getMonthlyCollectionSummary =
  ({
    status = "Approved",
    year = null,
  } = {}) => {
    const collections =
      getCollections();

    const grouped =
      {};

    collections.forEach(
      (collection) => {
        if (
          status &&
          normalize(
            collection?.status
          ) !==
            normalize(
              status
            )
        ) {
          return;
        }

        const reportDate =
          parseLocalDate(
            getCollectionReportDate(
              collection
            )
          );

        if (!reportDate) {
          return;
        }

        const reportYear =
          reportDate.getFullYear();

        if (
          year !== null &&
          year !== undefined &&
          Number(year) !==
            reportYear
        ) {
          return;
        }

        const monthKey =
          `${reportYear}-${String(
            reportDate.getMonth() + 1
          ).padStart(
            2,
            "0"
          )}`;

        if (
          !grouped[
            monthKey
          ]
        ) {
          grouped[
            monthKey
          ] = {
            month:
              monthKey,

            total:
              0,

            count:
              0,

            penalty:
              0,

            due:
              0,

            advance:
              0,

            principal:
              0,

            excess:
              0,
          };
        }

        grouped[
          monthKey
        ].total +=
          toNumber(
            collection?.amount
          );

        grouped[
          monthKey
        ].count +=
          1;

        grouped[
          monthKey
        ].penalty +=
          toNumber(
            collection?.amountTowardPenalty
          );

        /*
         * Prefer allocation overdue +
         * currentDue when available.
         */
        const allocation =
          collection?.allocation ||
          {};

        const allocationDue =
          toNumber(
            allocation?.overdue
          ) +
          toNumber(
            allocation?.currentDue
          );

        grouped[
          monthKey
        ].due +=
          allocationDue > 0
            ? allocationDue
            : toNumber(
                collection?.amountTowardDue
              );

        grouped[
          monthKey
        ].advance +=
          toNumber(
            collection?.amountTowardAdvance
          );

        grouped[
          monthKey
        ].principal +=
          toNumber(
            collection?.amountTowardPrincipal
          );

        grouped[
          monthKey
        ].excess +=
          toNumber(
            collection?.amountExcess
          );
      }
    );

    return Object.values(
      grouped
    )
      .map(
        (item) => ({
          ...item,

          total:
            roundMoney(
              item.total
            ),

          penalty:
            roundMoney(
              item.penalty
            ),

          due:
            roundMoney(
              item.due
            ),

          advance:
            roundMoney(
              item.advance
            ),

          principal:
            roundMoney(
              item.principal
            ),

          excess:
            roundMoney(
              item.excess
            ),
        })
      )
      .sort(
        (
          a,
          b
        ) =>
          b.month.localeCompare(
            a.month
          )
      );
  };

/* =========================================================
   LIFETIME COLLECTION SUMMARY
========================================================= */

export const getLifetimeCollectionSummary =
  () => {
    return getCollectionHistorySummary(
      {
        status:
          COLLECTION_STATUS.APPROVED,
      }
    );
  };

/* =========================================================
   THIS MONTH COLLECTION SUMMARY
========================================================= */

export const getThisMonthCollectionSummary =
  () => {
    const today =
      new Date();

    const firstDay =
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );

    const lastDay =
      new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0
      );

    return getCollectionHistorySummary({
      startDate:
        getDateKey(
          firstDay
        ),

      endDate:
        getDateKey(
          lastDay
        ),

      status:
        COLLECTION_STATUS.APPROVED,
    });
  };

/* =========================================================
   YESTERDAY COLLECTION SUMMARY
========================================================= */

export const getYesterdayCollectionSummary =
  () => {
    const today =
      new Date();

    today.setDate(
      today.getDate() - 1
    );

    const date =
      getDateKey(
        today
      );

    return getCollectionHistorySummary({
      startDate:
        date,

      endDate:
        date,

      status:
        COLLECTION_STATUS.APPROVED,
    });
  };

/* =========================================================
   TODAY COLLECTION SUMMARY
========================================================= */

export const getTodayCollectionSummary =
  () => {
    const today =
      getDateKey(
        new Date()
      );

    return getCollectionHistorySummary({
      startDate:
        today,

      endDate:
        today,

      status:
        COLLECTION_STATUS.APPROVED,
    });
  };

/* =========================================================
   LEGACY COMPATIBILITY
========================================================= */

export const getApprovedCollectionAmount =
  getApprovedCollectionTotal;

export const getPendingCollectionAmount =
  getPendingCollectionTotal;

export const getCollectionByLoanId = (
  loanId
) => {
  return getCollectionsForLoan(
    loanId,
    ""
  );
};

/* =========================================================
   DEFAULT EXPORT
========================================================= */

export default {
  COLLECTION_STATUS,
  COLLECTION_PAYMENT_TYPE,

  getCollections,
  addCollection,
  updateCollection,

  getCollectionById,

  approveCollection,
  rejectCollection,
  reverseCollection,
  deleteCollection,

  getPendingCollections,
  getApprovedCollections,
  getRejectedCollections,
  getReversedCollections,

  getApprovedCollectionTotal,
  getPendingCollectionTotal,
  getRejectedCollectionTotal,
  getTodayApprovedCollectionTotal,

  getCollectionsForLoan,
  getCollectionsForCustomer,

  getCollectionStatusCounts,

  getCollectionAmount,
  getCollectionPenalty,

  validateCollection,

  getApprovedCollectionAmount,
  getPendingCollectionAmount,
  getCollectionByLoanId,

  getDateKey,

  getCollectionReportDate,
  getCollectionHistory,
  getCollectionHistoryByDateRange,
  getCollectionHistorySummary,
  getMonthlyCollectionSummary,
  getLifetimeCollectionSummary,
  getThisMonthCollectionSummary,
  getYesterdayCollectionSummary,
  getTodayCollectionSummary,
};