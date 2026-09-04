import { useMemo, useState } from "react";

import {
  getLoanDueStatus,
  getLoanType,
  getCustomerName,
  getCustomerId,
  getCustomerMobile,
  getVehicleName,
  getRegistration,
  getNextDue,
  getDisplayLoanStatus,
  getLoanOutstanding,
} from "../../utils/loan/loanHelpers";

/* =========================================================
   HELPERS
========================================================= */

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

/**
 * Parse YYYY-MM-DD as LOCAL date.
 * Prevents timezone shifting.
 */
const parseLocalDate = (value) => {
  if (!value) {
    return null;
  }

  const raw = String(value);

  const match = raw.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (match) {
    const [, year, month, day] = match;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
};

const getDayStart = (value) => {
  const date =
    value instanceof Date
      ? new Date(value)
      : parseLocalDate(value);

  if (!date) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
};

/**
 * A repayment row is overdue when:
 * - it is not paid/completed
 * - AND due date is before today
 *
 * This does NOT depend only on row.status === "Overdue".
 */
const isOverdueScheduleRow = (row) => {
  const status = normalize(row?.status);

  if (
    status === "paid" ||
    status === "completed" ||
    status === "closed" ||
    status === "settled"
  ) {
    return false;
  }

  if (status === "overdue") {
    return true;
  }

  if (
    ![
      "pending",
      "partially paid",
      "partially-paid",
      "partial",
    ].includes(status)
  ) {
    return false;
  }

  const dueDate = getDayStart(row?.dueDate);

  if (!dueDate) {
    return false;
  }

  const today = new Date();

  today.setHours(0, 0, 0, 0);

  return (
    dueDate.getTime() <
    today.getTime()
  );
};

/**
 * Calculates the real due status of the loan.
 */
const getActualLoanDueStatus = (loan) => {
  const schedule = Array.isArray(
    loan?.repaymentSchedule
  )
    ? loan.repaymentSchedule
    : [];

  const hasOverdue = schedule.some(
    (row) => isOverdueScheduleRow(row)
  );

  if (hasOverdue) {
    return "Overdue";
  }

  const hasPending = schedule.some(
    (row) => {
      const status = normalize(
        row?.status
      );

      if (
        ![
          "pending",
          "partially paid",
          "partially-paid",
          "partial",
        ].includes(status)
      ) {
        return false;
      }

      const dueDate = getDayStart(
        row?.dueDate
      );

      if (!dueDate) {
        return false;
      }

      return true;
    }
  );

  if (hasPending) {
    return "Due";
  }

  return "Completed";
};

/**
 * Find the nearest unpaid/open repayment.
 * Overdue repayments are deliberately considered first.
 */
const getActualNextDue = (loan) => {
  const schedule = Array.isArray(
    loan?.repaymentSchedule
  )
    ? loan.repaymentSchedule
    : [];

  const openRows = schedule.filter(
    (row) => {
      const status = normalize(
        row?.status
      );

      return [
        "pending",
        "overdue",
        "partially paid",
        "partially-paid",
        "partial",
      ].includes(status);
    }
  );

  if (!openRows.length) {
    return null;
  }

  return (
    [...openRows].sort((a, b) => {
      const aDate =
        getDayStart(a?.dueDate)
          ?.getTime() ?? 0;

      const bDate =
        getDayStart(b?.dueDate)
          ?.getTime() ?? 0;

      return aDate - bDate;
    })[0] || null
  );
};

/**
 * Loan master status + real repayment status.
 *
 * Important:
 * An Active loan can still be Overdue because
 * its EMI due date has passed.
 */
const getEffectiveStatus = (loan) => {
  const actualDueStatus =
    getActualLoanDueStatus(loan);

  const masterStatus =
    getDisplayLoanStatus(loan);

  if (
    actualDueStatus === "Overdue"
  ) {
    return "Overdue";
  }

  return masterStatus;
};

/* =========================================================
   HOOK
========================================================= */

const useLoanFilters = (
  loans = []
) => {
  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [loanTypeFilter, setLoanTypeFilter] =
    useState("All Loan Types");

  const [dueFilter, setDueFilter] =
    useState("All Due Status");

  const [dateFilter, setDateFilter] =
    useState("");

  const [sortBy, setSortBy] =
    useState("recent");

  const safeLoans = Array.isArray(
    loans
  )
    ? loans
    : [];

  const filteredLoans = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    let result = safeLoans.filter(
      (loan) => {
        /* =================================================
           SEARCH
        ================================================== */

        const searchableText = [
          loan?.loanNumber,

          getCustomerName(loan),

          getCustomerId(loan),

          getCustomerMobile(loan),

          getVehicleName(loan),

          getRegistration(loan),

          loan?.vehicle?.registrationNumber,

          loan?.vehicle?.registration,

          loan?.customerNumber,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !query ||
          searchableText.includes(
            query
          );

        /* =================================================
           STATUS
        ================================================== */

        const effectiveStatus =
          getEffectiveStatus(loan);

        const masterStatus =
          getDisplayLoanStatus(loan);

        const matchesStatus =
          statusFilter === "All Status" ||
          effectiveStatus ===
            statusFilter ||
          masterStatus ===
            statusFilter;

        /* =================================================
           LOAN TYPE
        ================================================== */

        const matchesLoanType =
          loanTypeFilter ===
            "All Loan Types" ||
          normalize(
            getLoanType(loan)
          ) ===
            normalize(
              loanTypeFilter
            );

        /* =================================================
           DUE STATUS
        ================================================== */

        const actualDueStatus =
          getActualLoanDueStatus(
            loan
          );

        const matchesDue =
          dueFilter ===
            "All Due Status" ||
          actualDueStatus ===
            dueFilter;

        /* =================================================
           DATE FILTER
        ================================================== */

        let matchesDate = true;

        if (dateFilter) {
          const schedule = Array.isArray(
            loan?.repaymentSchedule
          )
            ? loan.repaymentSchedule
            : [];

          matchesDate = schedule.some(
            (row) => {
              const rowDate =
                getDayStart(
                  row?.dueDate
                );

              if (!rowDate) {
                return false;
              }

              const formatted =
                [
                  rowDate.getFullYear(),
                  String(
                    rowDate.getMonth() +
                      1
                  ).padStart(2, "0"),
                  String(
                    rowDate.getDate()
                  ).padStart(2, "0"),
                ].join("-");

              return (
                formatted === dateFilter
              );
            }
          );
        }

        return (
          matchesSearch &&
          matchesStatus &&
          matchesLoanType &&
          matchesDue &&
          matchesDate
        );
      }
    );

    /* =====================================================
       SORT
    ===================================================== */

    result = [...result].sort(
      (a, b) => {
        /* -----------------------------------------------
           AMOUNT HIGH
        ------------------------------------------------ */

        if (sortBy === "amountHigh") {
          return (
            Number(
              b?.loanAmount || 0
            ) -
            Number(
              a?.loanAmount || 0
            )
          );
        }

        /* -----------------------------------------------
           OUTSTANDING HIGH
        ------------------------------------------------ */

        if (
          sortBy ===
          "outstandingHigh"
        ) {
          return (
            Number(
              getLoanOutstanding(b) ||
                0
            ) -
            Number(
              getLoanOutstanding(a) ||
                0
            )
          );
        }

        /* -----------------------------------------------
           CUSTOMER
        ------------------------------------------------ */

        if (
          sortBy === "customer"
        ) {
          return getCustomerName(
            a
          ).localeCompare(
            getCustomerName(b)
          );
        }

        /* -----------------------------------------------
           DUE SOON
        ------------------------------------------------ */

        if (
          sortBy === "dueSoon"
        ) {
          const aDate =
            getActualNextDue(a);

          const bDate =
            getActualNextDue(b);

          const aTime =
            getDayStart(
              aDate?.dueDate
            )?.getTime() ??
            Number.MAX_SAFE_INTEGER;

          const bTime =
            getDayStart(
              bDate?.dueDate
            )?.getTime() ??
            Number.MAX_SAFE_INTEGER;

          return (
            aTime - bTime
          );
        }

        /* -----------------------------------------------
           RECENT
        ------------------------------------------------ */

        const aTime =
          new Date(
            a?.updatedAt ||
              a?.createdAt ||
              0
          ).getTime();

        const bTime =
          new Date(
            b?.updatedAt ||
              b?.createdAt ||
              0
          ).getTime();

        return (
          bTime - aTime
        );
      }
    );

    return result;
  }, [
    safeLoans,
    search,
    statusFilter,
    loanTypeFilter,
    dueFilter,
    dateFilter,
    sortBy,
  ]);

  return {
    filteredLoans,

    search,
    setSearch,

    statusFilter,
    setStatusFilter,

    loanTypeFilter,
    setLoanTypeFilter,

    dueFilter,
    setDueFilter,

    dateFilter,
    setDateFilter,

    sortBy,
    setSortBy,
  };
};

export default useLoanFilters;