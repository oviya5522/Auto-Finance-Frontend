// src/services/collectionStorage.js

import {
  getCustomers,
  saveCustomers,
} from "./customerStorage";

const COLLECTION_STORAGE_KEY =
  "auto_finance_collections";

const DATA_UPDATED_EVENT =
  "auto-finance:data-updated";

/* =========================================================
   READ
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
   SAVE COLLECTIONS
========================================================= */

const saveCollections = (
  collections
) => {
  localStorage.setItem(
    COLLECTION_STORAGE_KEY,
    JSON.stringify(collections)
  );

  window.dispatchEvent(
    new CustomEvent(
      DATA_UPDATED_EVENT
    )
  );
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
   DATE KEY
========================================================= */

const getDateKey = (
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
    ).padStart(2, "0"),
    String(
      date.getDate()
    ).padStart(2, "0"),
  ].join("-");
};

/* =========================================================
   ID GENERATOR
========================================================= */

const createCollectionId = (
  collections
) => {
  const highest =
    collections.reduce(
      (max, item) => {
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
          Number(match[1])
        );
      },
      0
    );

  return `COL-${String(
    highest + 1
  ).padStart(4, "0")}`;
};

/* =========================================================
   CREATE COLLECTION
========================================================= */

export const addCollection = (
  collection
) => {
  const collections =
    getCollections();

  const now =
    new Date().toISOString();

  const newCollection = {
    ...collection,

    id:
      collection?.id ||
      createCollectionId(
        collections
      ),

    status:
      "Pending",

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
  };

  /*
   * Keep collection history in
   * chronological creation order.
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
  updates
) => {
  const collections =
    getCollections();

  const updated =
    collections.map(
      (item) =>
        item.id === collectionId
          ? {
              ...item,
              ...updates,
            }
          : item
    );

  saveCollections(updated);

  return updated.find(
    (item) =>
      item.id === collectionId
  );
};

/* =========================================================
   FIND CUSTOMER LOAN
========================================================= */

const findCustomerLoan = (
  customers,
  collection
) => {
  const collectionLoanId =
    collection?.loanId || "";

  const collectionLoanNumber =
    collection?.loanNumber || "";

  const customerId =
    collection?.customerId || "";

  for (
    const customer of customers
  ) {
    const customerMatches =
      !customerId ||
      String(
        customer?.customer?.id ||
          ""
      ) ===
        String(customerId);

    if (
      !customerMatches
    ) {
      continue;
    }

    const loan =
      customer?.loan;

    if (!loan) {
      continue;
    }

    const loanId =
      loan?.id || "";

    const loanNumber =
      loan?.loanNumber ||
      "";

    const loanMatches =
      (
        collectionLoanId &&
        String(loanId) ===
          String(
            collectionLoanId
          )
      ) ||
      (
        collectionLoanNumber &&
        String(
          loanNumber
        ) ===
          String(
            collectionLoanNumber
          )
      );

    if (loanMatches) {
      return {
        customer,
        loan,
      };
    }
  }

  /*
   * Fallback:
   * find by loan ID / number even if
   * customerId wasn't stored.
   */
  for (
    const customer of customers
  ) {
    const loan =
      customer?.loan;

    if (!loan) {
      continue;
    }

    const loanId =
      loan?.id || "";

    const loanNumber =
      loan?.loanNumber ||
      "";

    const loanMatches =
      (
        collectionLoanId &&
        String(loanId) ===
          String(
            collectionLoanId
          )
      ) ||
      (
        collectionLoanNumber &&
        String(
          loanNumber
        ) ===
          String(
            collectionLoanNumber
          )
      );

    if (loanMatches) {
      return {
        customer,
        loan,
      };
    }
  }

  return null;
};

/* =========================================================
   FIND REPAYMENT ROW
========================================================= */

const findRepaymentRowIndex = (
  schedule,
  collection
) => {
  if (
    !Array.isArray(
      schedule
    )
  ) {
    return -1;
  }

  const scheduleId =
    collection?.scheduleId ||
    "";

  const collectionDueDate =
    getDateKey(
      collection?.dueDate
    );

  /*
   * 1. Match schedule ID
   */
  if (scheduleId) {
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

    if (index >= 0) {
      return index;
    }
  }

  /*
   * 2. Match loan installment number
   */
  const installment =
    collection?.installment;

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
            getDateKey(
              row?.dueDate
            ) ===
              collectionDueDate
          );
        }
      );

    if (index >= 0) {
      return index;
    }
  }

  /*
   * 3. Fallback to due date
   */
  if (
    collectionDueDate
  ) {
    const index =
      schedule.findIndex(
        (row) =>
          getDateKey(
            row?.dueDate
          ) ===
          collectionDueDate &&
          ![
            "paid",
            "completed",
            "closed",
            "settled",
          ].includes(
            normalize(
              row?.status
            )
          )
      );

    if (index >= 0) {
      return index;
    }
  }

  return -1;
};

/* =========================================================
   UPDATE REAL LOAN AFTER APPROVAL
========================================================= */

const applyCollectionToLoan = (
  collection
) => {
  const customers =
    getCustomers();

  const match =
    findCustomerLoan(
      customers,
      collection
    );

  if (!match) {
    console.warn(
      "Loan not found for approved collection:",
      collection
    );

    return {
      updated: false,
      reason:
        "loan_not_found",
    };
  }

  const {
    customer,
    loan,
  } = match;

  const schedule =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? [
          ...loan.repaymentSchedule,
        ]
      : [];

  const rowIndex =
    findRepaymentRowIndex(
      schedule,
      collection
    );

  if (
    rowIndex < 0
  ) {
    console.warn(
      "Repayment row not found for approved collection:",
      collection
    );

    return {
      updated: false,
      reason:
        "schedule_row_not_found",
    };
  }

  const currentRow =
    schedule[rowIndex];

  const installmentAmount =
    Number(
      currentRow?.paymentAmount ??
        currentRow?.emiAmount ??
        currentRow?.amount ??
        0
    );

  const previousPaidAmount =
    Number(
      currentRow?.paidAmount ||
        0
    );

  const collectionAmount =
    Number(
      collection?.amount ||
        0
    );

  /*
   * Protect against accidental duplicate
   * approval.
   */
  const alreadyRecorded =
    Array.isArray(
      loan?.paymentHistory
    ) &&
    loan.paymentHistory.some(
      (payment) =>
        payment?.collectionId ===
        collection?.id
    );

  if (
    alreadyRecorded
  ) {
    return {
      updated: false,
      reason:
        "already_recorded",
    };
  }

  const newPaidAmount =
    Math.min(
      installmentAmount,
      previousPaidAmount +
        collectionAmount
    );

  const remainingBalance =
    Math.max(
      installmentAmount -
        newPaidAmount,
      0
    );

  let newStatus =
    "Pending";

  if (
    remainingBalance <=
    0
  ) {
    newStatus =
      "Paid";
  } else if (
    newPaidAmount > 0
  ) {
    newStatus =
      "Partially Paid";
  } else {
    newStatus =
      normalize(
        currentRow?.status
      ) ===
        "overdue"
      ? "Overdue"
      : "Pending";
  }

  /*
   * Update repayment row.
   */
  schedule[rowIndex] = {
    ...currentRow,

    paidAmount:
      newPaidAmount,

    balance:
      remainingBalance,

    status:
      newStatus,

    paidAt:
      remainingBalance <= 0
        ? new Date().toISOString()
        : currentRow?.paidAt ||
          null,
  };

  /*
   * Keep payment history.
   */
  const paymentHistory =
    Array.isArray(
      loan?.paymentHistory
    )
      ? [
          ...loan.paymentHistory,
        ]
      : [];

  paymentHistory.push({
    id:
      `PAY-${collection.id}`,

    collectionId:
      collection.id,

    loanId:
      loan?.id ||
      collection?.loanId ||
      "",

    loanNumber:
      loan?.loanNumber ||
      collection?.loanNumber ||
      "",

    scheduleId:
      currentRow?.id ||
      collection?.scheduleId ||
      "",

    installment:
      collection?.installment ??
      currentRow?.installmentNumber ??
      currentRow?.installmentNo ??
      rowIndex + 1,

    amount:
      collectionAmount,

    paymentAmount:
      collectionAmount,

    dueAmount:
      installmentAmount,

    dueDate:
      currentRow?.dueDate ||
      collection?.dueDate ||
      "",

    date:
      collection?.collectedDate ||
      new Date().toISOString(),

    paymentDate:
      collection?.collectedDate ||
      new Date().toISOString(),

    paidAt:
      new Date().toISOString(),

    paymentMode:
      collection?.paymentMode ||
      "",

    mode:
      collection?.paymentMode ||
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

    status:
      "Approved",
  });

  /*
   * Update loan object.
   */
  const updatedLoan = {
    ...loan,

    repaymentSchedule:
      schedule,

    paymentHistory,

    updatedAt:
      new Date().toISOString(),
  };

  /*
   * Update customer record.
   */
  const updatedCustomers =
    customers.map(
      (item) =>
        item === customer
          ? {
              ...item,
              loan:
                updatedLoan,
              updatedAt:
                new Date().toISOString(),
            }
          : item
    );

  /*
   * Save loan/customer first.
   *
   * customerStorage.saveCustomers()
   * also sends the Auto Finance
   * data-updated event.
   */
  saveCustomers(
    updatedCustomers
  );

  return {
    updated: true,
    customer:
      customer,
    loan:
      updatedLoan,
  };
};

/* =========================================================
   APPROVE
========================================================= */

export const approveCollection = (
  collectionId,
  admin
) => {
  const collections =
    getCollections();

  const existing =
    collections.find(
      (item) =>
        item.id ===
        collectionId
    );

  if (!existing) {
    return null;
  }

  /*
   * Already approved:
   * do nothing.
   */
  if (
    normalize(
      existing.status
    ) ===
    "approved"
  ) {
    return existing;
  }

  const approvedAt =
    new Date().toISOString();

  /*
   * First update collection status.
   */
  const updatedCollections =
    collections.map(
      (item) =>
        item.id ===
        collectionId
          ? {
              ...item,

              status:
                "Approved",

              approvedAt,

              approvedBy:
                admin?.name ||
                admin?.username ||
                "Admin",

              rejectedAt:
                null,

              rejectedBy:
                null,

              rejectionRemarks:
                "",
            }
          : item
    );

  /*
   * Save collection record.
   */
  localStorage.setItem(
    COLLECTION_STORAGE_KEY,
    JSON.stringify(
      updatedCollections
    )
  );

  /*
   * Now apply approved amount
   * to the real loan.
   */
  const updatedCollection =
    updatedCollections.find(
      (item) =>
        item.id ===
        collectionId
    );

  const loanUpdate =
    applyCollectionToLoan(
      updatedCollection
    );

  /*
   * If loan update could not happen,
   * still keep collection approved,
   * but log it clearly.
   */
  if (
    !loanUpdate?.updated &&
    loanUpdate?.reason !==
      "already_recorded"
  ) {
    console.warn(
      "Collection approved but loan was not updated:",
      loanUpdate
    );
  }

  /*
   * Trigger the app-wide refresh.
   */
  window.dispatchEvent(
    new CustomEvent(
      DATA_UPDATED_EVENT
    )
  );

  return {
    ...updatedCollection,

    loanUpdate,
  };
};

/* =========================================================
   REJECT
========================================================= */

export const rejectCollection = (
  collectionId,
  admin,
  remarks = ""
) => {
  return updateCollection(
    collectionId,
    {
      status:
        "Rejected",

      rejectedAt:
        new Date().toISOString(),

      rejectedBy:
        admin?.name ||
        admin?.username ||
        "Admin",

      rejectionRemarks:
        remarks,

      approvedAt:
        null,

      approvedBy:
        null,
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

  saveCollections(
    collections.filter(
      (item) =>
        item.id !==
        collectionId
    )
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
        (total, item) =>
          total +
          Number(
            item?.amount ||
              0
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
        (total, item) =>
          total +
          Number(
            item?.amount ||
              0
          ),
        0
      );
  };