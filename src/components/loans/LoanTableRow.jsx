// src/components/loans/LoanTableRow.jsx

import {
  CalendarDays,
  MoreVertical,
} from "lucide-react";

import LoanActionMenu from "./LoanActionMenu";

import {
  money,
  formatDate,
  getCustomerName,
  getCustomerId,
  getCustomerMobile,
  getVehicleName,
  getRegistration,
  getEmi,
  getTenure,
  getNextDue,
  getLoanOutstanding,
  getDisplayLoanStatus,
  getLoanDueStatus,
} from "../../utils/loan/loanHelpers";

const LoanTableRow = ({
  loan,
  onViewLoan,
  openMenuId,
  setOpenMenuId,
  menuPosition,
  setMenuPosition,
}) => {
  const loanId =
    loan?.id ||
    loan?.loanNumber;

  const customerName =
    getCustomerName(loan);

  const customerId =
    getCustomerId(loan);

  const customerMobile =
    getCustomerMobile(loan);

  const vehicleName =
    getVehicleName(loan);

  const registration =
    getRegistration(loan);

  const nextDue =
    getNextDue(loan);

  const emi =
    getEmi(loan);

  const outstanding =
    getLoanOutstanding(loan);

  const status =
    getDisplayLoanStatus(loan);

  const dueStatus =
    getLoanDueStatus(loan);

  const interestRate =
    Number(
      loan?.interest?.rate ??
        loan?.interestRate ??
        loan?.calculation?.interestRate ??
        0
    );

  /*
   * Try the most common date fields used by
   * the existing loan model.
   */
  const startDate =
    loan?.startDate ||
    loan?.loanStartDate ||
    loan?.disbursementDate ||
    loan?.createdAt;

  const maturityDate =
    loan?.maturityDate ||
    loan?.loanMaturityDate ||
    loan?.endDate ||
    loan?.repayment?.maturityDate;

  /* =====================================================
     ACTION MENU
  ====================================================== */

  const handleMenuToggle = (event) => {
    event.stopPropagation();

    const rect =
      event.currentTarget.getBoundingClientRect();

    const menuWidth = 230;
    const menuHeight = 340;
    const gap = 6;

    let left =
      rect.right -
      menuWidth;

    let top =
      rect.bottom +
      gap;

    /* Horizontal safety */

    left = Math.max(
      8,
      Math.min(
        left,
        window.innerWidth -
          menuWidth -
          8
      )
    );

    /* Open above when bottom space is insufficient */

    if (
      top + menuHeight >
      window.innerHeight - 8
    ) {
      top =
        rect.top -
        menuHeight -
        gap;
    }

    /* Vertical safety */

    top = Math.max(
      8,
      Math.min(
        top,
        window.innerHeight -
          menuHeight -
          8
      )
    );

    setMenuPosition({
      top,
      left,
    });

    setOpenMenuId(
      (current) =>
        current === loanId
          ? null
          : loanId
    );
  };

  return (
    <tr
      className="
        border-b
        border-slate-100
        transition-colors
        duration-150
        hover:bg-[#FAFCFB]
      "
    >
      {/* =================================================
          LOAN NUMBER
      ================================================== */}

      <td className="px-3.5 py-3">
        <p className="text-[11px] font-semibold text-[#17221D]">
          {loan?.loanNumber ||
            "—"}
        </p>
      </td>

      {/* =================================================
          CUSTOMER
      ================================================== */}

      <td className="px-3.5 py-3">
        <p className="max-w-[150px] truncate text-[11px] font-semibold text-[#17221D]">
          {customerName}
        </p>

        <p className="mt-0.5 max-w-[150px] truncate text-[9px] text-slate-400">
          {customerId}

          {customerMobile
            ? ` • ${customerMobile}`
            : ""}
        </p>
      </td>

      {/* =================================================
          VEHICLE
      ================================================== */}

      <td className="px-3.5 py-3">
        <p className="max-w-[150px] truncate text-[11px] font-medium text-slate-700">
          {registration}
        </p>

        <p className="mt-0.5 max-w-[150px] truncate text-[9px] text-slate-400">
          {vehicleName}
        </p>
      </td>

      {/* =================================================
          LOAN AMOUNT
      ================================================== */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[11px] font-medium text-slate-700">
          ₹
          {money(
            loan?.loanAmount
          )}
        </span>
      </td>

      {/* =================================================
          INTEREST RATE
      ================================================== */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[11px] font-medium text-slate-700">
          {interestRate
            ? `${interestRate}%`
            : "—"}
        </span>
      </td>

      {/* =================================================
          EMI AMOUNT
      ================================================== */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[11px] font-semibold text-[#0B5D3B]">
          ₹
          {money(emi)}
        </span>
      </td>

      {/* =================================================
          TENURE
      ================================================== */}

      <td className="px-3.5 py-3">
        <span className="whitespace-nowrap text-[10px] font-medium text-slate-700">
          {getTenure(loan)}
        </span>
      </td>

      {/* =================================================
          START DATE
      ================================================== */}

      <td className="px-3.5 py-3">
        <DateCell
          value={startDate}
        />
      </td>

      {/* =================================================
          MATURITY DATE
      ================================================== */}

      <td className="px-3.5 py-3">
        <DateCell
          value={maturityDate}
        />
      </td>

      {/* =================================================
          OUTSTANDING
      ================================================== */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[11px] font-semibold text-[#17221D]">
          ₹
          {money(
            outstanding
          )}
        </span>
      </td>

      {/* =================================================
          STATUS
      ================================================== */}

      <td className="px-3.5 py-3">
        <LoanStatus
          status={status}
          dueStatus={dueStatus}
        />
      </td>

      {/* =================================================
          ACTIONS
      ================================================== */}

      <td className="px-3.5 py-3">
        <div className="flex justify-center">
          <button
            type="button"
            onClick={
              handleMenuToggle
            }
            className={`
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              bg-white
              transition
              ${
                openMenuId ===
                loanId
                  ? "border-[#0B5D3B] text-[#0B5D3B] shadow-sm"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }
            `}
            title="More Actions"
            aria-label="More Actions"
            aria-expanded={
              openMenuId ===
              loanId
            }
          >
            <MoreVertical
              size={15}
            />
          </button>

          {openMenuId ===
            loanId && (
            <LoanActionMenu
              loan={loan}
              position={
                menuPosition
              }
              onClose={() =>
                setOpenMenuId(
                  null
                )
              }
              onView={() => {
                setOpenMenuId(
                  null
                );

                onViewLoan?.(loan);
              }}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

/* =========================================================
   DATE CELL
========================================================= */

const DateCell = ({
  value,
}) => {
  return (
    <div className="flex items-center gap-1.5 whitespace-nowrap">
      <CalendarDays
        size={12}
        strokeWidth={2}
        className="shrink-0 text-slate-400"
      />

      <span className="text-[10px] font-medium text-slate-600">
        {formatDate(value)}
      </span>
    </div>
  );
};

/* =========================================================
   LOAN STATUS
========================================================= */

const LoanStatus = ({
  status,
  dueStatus,
}) => {
  const normalized =
    String(
      status || ""
    ).toLowerCase();

  let classes =
    "bg-slate-100 text-slate-500";

  if (
    normalized === "active"
  ) {
    classes =
      "bg-[#EAF5EF] text-[#0B5D3B]";
  } else if (
    normalized === "pending"
  ) {
    classes =
      "bg-amber-50 text-amber-700";
  } else if (
    normalized ===
      "overdue" ||
    dueStatus === "Overdue"
  ) {
    classes =
      "bg-red-50 text-red-600";
  } else if (
    normalized === "closed"
  ) {
    classes =
      "bg-slate-100 text-slate-600";
  } else if (
    normalized === "seized"
  ) {
    classes =
      "bg-orange-50 text-orange-700";
  } else if (
    normalized ===
    "written off"
  ) {
    classes =
      "bg-red-50 text-red-700";
  }

  return (
    <span
      className={`
        inline-flex
        whitespace-nowrap
        rounded-full
        px-2.5
        py-1
        text-[9px]
        font-semibold
        ${classes}
      `}
    >
      {status || "Unknown"}
    </span>
  );
};

export default LoanTableRow;