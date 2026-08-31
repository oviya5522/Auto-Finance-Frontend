/* =========================================================
   DASHBOARD HELPERS

   Dashboard-only calculations and formatting.
   These helpers should NOT create or modify business data.
========================================================= */

/* =========================================================
   DATE HELPERS
========================================================= */

export const isSameDay = (dateValue, targetDate = new Date()) => {
  if (!dateValue) {
    return false;
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return (
    date.getFullYear() === targetDate.getFullYear() &&
    date.getMonth() === targetDate.getMonth() &&
    date.getDate() === targetDate.getDate()
  );
};

export const formatDashboardDate = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const formatDashboardTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/* =========================================================
   MONEY
========================================================= */

export const formatDashboardMoney = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

/* =========================================================
   LOAN STATUS
========================================================= */

export const normalizeLoanStatus = (status) => {
  return String(status || "")
    .trim()
    .toLowerCase();
};

export const isActiveLoan = (loan) => {
  return normalizeLoanStatus(loan?.status) === "active";
};

export const isClosedLoan = (loan) => {
  return normalizeLoanStatus(loan?.status) === "closed";
};

/* =========================================================
   REPAYMENT SCHEDULE
========================================================= */

export const getLoanSchedule = (loan) => {
  return Array.isArray(loan?.repaymentSchedule)
    ? loan.repaymentSchedule
    : [];
};

export const getNextDuePayment = (loan) => {
  const schedule = getLoanSchedule(loan);

  return (
    schedule.find((row) => {
      const status = String(row?.status || "").toLowerCase();

      return (
        status === "pending" ||
        status === "overdue" ||
        status === "partially paid"
      );
    }) || null
  );
};

export const getOverduePayments = (loan) => {
  const schedule = getLoanSchedule(loan);

  return schedule.filter(
    (row) =>
      String(row?.status || "").toLowerCase() ===
      "overdue"
  );
};

export const getOverduePaymentCount = (loan) => {
  return getOverduePayments(loan).length;
};

export const hasOverduePayments = (loan) => {
  return getOverduePaymentCount(loan) > 0;
};

/* =========================================================
   DUE TODAY
========================================================= */

export const getDuePaymentsToday = (loans = []) => {
  const rows = [];

  loans.forEach((loan) => {
    const schedule = getLoanSchedule(loan);

    schedule.forEach((row) => {
      const status = String(
        row?.status || ""
      ).toLowerCase();

      if (
        status !== "pending" &&
        status !== "overdue" &&
        status !== "partially paid"
      ) {
        return;
      }

      if (isSameDay(row?.dueDate)) {
        rows.push({
          loan,
          scheduleRow: row,
        });
      }
    });
  });

  return rows;
};

/* =========================================================
   UPCOMING PAYMENTS
========================================================= */

export const getUpcomingDuePayments = (
  loans = [],
  days = 7
) => {
  const today = new Date();

  const endDate = new Date(today);

  endDate.setDate(
    endDate.getDate() + days
  );

  const rows = [];

  loans.forEach((loan) => {
    const schedule = getLoanSchedule(loan);

    schedule.forEach((row) => {
      const status = String(
        row?.status || ""
      ).toLowerCase();

      if (
        status !== "pending" &&
        status !== "overdue" &&
        status !== "partially paid"
      ) {
        return;
      }

      const dueDate = new Date(
        row?.dueDate || 0
      );

      if (Number.isNaN(dueDate.getTime())) {
        return;
      }

      if (
        dueDate >= today &&
        dueDate <= endDate
      ) {
        rows.push({
          loan,
          scheduleRow: row,
        });
      }
    });
  });

  return rows.sort((a, b) => {
    const aDate = new Date(
      a.scheduleRow?.dueDate || 0
    ).getTime();

    const bDate = new Date(
      b.scheduleRow?.dueDate || 0
    ).getTime();

    return aDate - bDate;
  });
};

/* =========================================================
   LOAN AMOUNTS
========================================================= */

export const getLoanAmount = (loan) => {
  return Number(
    loan?.loanAmount || 0
  );
};

export const getDownPayment = (loan) => {
  return Number(
    loan?.downPayment || 0
  );
};

export const getEmiAmount = (loan) => {
  return Number(
    loan?.calculation?.emiAmount ??
      loan?.emiAmount ??
      loan?.calculation?.paymentAmount ??
      0
  );
};

/* =========================================================
   RECENT RECORDS
========================================================= */

export const getRecordTimestamp = (record) => {
  return new Date(
    record?.updatedAt ||
      record?.createdAt ||
      record?.customer?.updatedAt ||
      record?.customer?.createdAt ||
      0
  ).getTime();
};

export const sortRecentRecords = (records = []) => {
  return [...records].sort(
    (a, b) =>
      getRecordTimestamp(b) -
      getRecordTimestamp(a)
  );
};

export const getRecentRecords = (
  records = [],
  limit = 5
) => {
  return sortRecentRecords(
    records
  ).slice(0, limit);
};

/* =========================================================
   CUSTOMER DISPLAY
========================================================= */

export const getDashboardCustomerName = (
  customer
) => {
  return (
    customer?.customer?.personal?.name ||
    customer?.customerName ||
    "Unnamed Customer"
  );
};

export const getDashboardCustomerId = (
  customer
) => {
  return (
    customer?.customer?.customerNumber ||
    customer?.customer?.id ||
    customer?.customerNumber ||
    "—"
  );
};

export const getDashboardCustomerMobile = (
  customer
) => {
  return (
    customer?.customer?.personal
      ?.mobileNumber ||
    customer?.mobileNumber ||
    "—"
  );
};

/* =========================================================
   VEHICLE DISPLAY
========================================================= */

export const getDashboardVehicleName = (
  loan
) => {
  const vehicle = loan?.vehicle || {};

  return (
    [
      vehicle.brand,
      vehicle.model,
      vehicle.variant,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Vehicle not assigned"
  );
};

export const getDashboardRegistration = (
  loan
) => {
  return (
    loan?.vehicle?.registrationNumber ||
    loan?.rc?.registrationNumber ||
    "No registration"
  );
};

/* =========================================================
   STATUS COUNTS
========================================================= */

export const countLoansByStatus = (
  loans = [],
  status
) => {
  const normalizedStatus =
    String(status || "")
      .trim()
      .toLowerCase();

  return loans.filter(
    (loan) =>
      normalizeLoanStatus(
        loan?.status
      ) === normalizedStatus
  ).length;
};

/* =========================================================
   DASHBOARD ATTENTION
========================================================= */

export const getAttentionSummary = (
  loans = []
) => {
  const dueToday =
    getDuePaymentsToday(loans);

  const overdue =
    loans.filter(
      (loan) =>
        hasOverduePayments(loan)
    );

  const pendingLoans =
    loans.filter((loan) => {
      const status =
        normalizeLoanStatus(
          loan?.status
        );

      return (
        status === "pending"
      );
    });

  return {
    dueTodayCount:
      dueToday.length,

    overdueCount:
      overdue.length,

    pendingLoanCount:
      pendingLoans.length,
  };
};

/* =========================================================
   DASHBOARD TOTALS
========================================================= */

export const calculateTotalLoanAmount = (
  loans = []
) => {
  return loans.reduce(
    (total, loan) =>
      total +
      getLoanAmount(loan),
    0
  );
};

export const calculateTotalDownPayment = (
  loans = []
) => {
  return loans.reduce(
    (total, loan) =>
      total +
      getDownPayment(loan),
    0
  );
};

/* =========================================================
   UPCOMING DUE TOTAL
========================================================= */

export const calculateDueAmount = (
  rows = []
) => {
  return rows.reduce(
    (total, item) =>
      total +
      Number(
        item?.scheduleRow
          ?.paymentAmount ||
          item?.scheduleRow
          ?.emiAmount ||
          0
      ),
    0
  );
};