import {
  getOutstandingAmount,
} from "../../services/customerStorage";

export const money = (value) =>
  Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

export const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export const getCustomerName = (loan) =>
  loan?.customerName ||
  loan?.customer?.personal?.name ||
  "Unnamed Customer";

export const getCustomerId = (loan) =>
  loan?.customerNumber ||
  loan?.customerId ||
  loan?.customer?.customerNumber ||
  loan?.customer?.id ||
  "—";

export const getCustomerMobile = (loan) =>
  loan?.mobileNumber ||
  loan?.customer?.personal?.mobileNumber ||
  "";

export const getVehicleName = (loan) =>
  [
    loan?.vehicle?.brand,
    loan?.vehicle?.model,
    loan?.vehicle?.variant,
  ]
    .filter(Boolean)
    .join(" ") ||
  "Vehicle not assigned";

export const getRegistration = (loan) =>
  loan?.vehicle?.registrationNumber ||
  loan?.rc?.registrationNumber ||
  "No registration";

export const getLoanType = (loan) =>
  loan?.interest?.type ||
  loan?.interestType ||
  "Flat";

export const getLoanOutstanding = (loan) =>
  getOutstandingAmount(loan);

export const getDisplayLoanStatus = (loan) => {
  const status =
    String(loan?.status || "Pending").trim();

  if (status === "Draft") return "Pending";

  return status;
};

export const getLoanDueStatus = (loan) => {
  const schedule = Array.isArray(
    loan?.repaymentSchedule
  )
    ? loan.repaymentSchedule
    : [];

  if (
    schedule.some(
      (row) =>
        row.status === "Overdue"
    )
  ) {
    return "Overdue";
  }

  if (
    schedule.some(
      (row) =>
        row.status === "Pending" ||
        row.status === "Partially Paid"
    )
  ) {
    return "Due";
  }

  return "Completed";
};

export const getNextDue = (loan) => {
  const schedule = Array.isArray(
    loan?.repaymentSchedule
  )
    ? loan.repaymentSchedule
    : [];

  return (
    schedule.find(
      (row) =>
        row.status === "Pending" ||
        row.status === "Overdue" ||
        row.status === "Partially Paid"
    ) ||
    null
  );
};

export const getEmi = (loan) => {
  if (
    loan?.repayment?.method ===
    "Principal"
  ) {
    return (
      loan?.repaymentSchedule?.[0]
        ?.paymentAmount ||
      loan?.calculation?.paymentAmount ||
      loan?.emiAmount ||
      0
    );
  }

  return (
    loan?.calculation?.emiAmount ||
    loan?.emiAmount ||
    0
  );
};

export const getTenure = (loan) => {
  const repayment =
    loan?.repayment || {};

  const tenure =
    repayment.tenure ??
    repayment.numberOfPayments ??
    loan?.calculation
      ?.numberOfPayments ??
    "";

  const unit =
    repayment.tenureUnit ||
    loan?.tenureUnit ||
    "months";

  return tenure
    ? `${tenure} ${unit}`
    : "—";
};

export const getOverdueCount = (loan) => {
  const schedule = Array.isArray(
    loan?.repaymentSchedule
  )
    ? loan.repaymentSchedule
    : [];

  return schedule.filter(
    (row) =>
      row.status === "Overdue"
  ).length;
};

export const getPaidEmiCount = (loan) => {
  const schedule = Array.isArray(
    loan?.repaymentSchedule
  )
    ? loan.repaymentSchedule
    : [];

  return schedule.filter(
    (row) =>
      row.status === "Paid"
  ).length;
};

export const getLoanKey = (loan) =>
  loan?.id ||
  loan?.loanNumber ||
  `${loan?.customerNumber || ""}-${loan?.firstDueDate || ""}`;