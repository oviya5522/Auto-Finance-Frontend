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
  getOverdueCount,
  getDisplayLoanStatus,
  getLoanDueStatus,
} from "../../utils/loan/loanHelpers";

const LoanTableRow = ({
  loan,
  selected = false,
  onSelect,
  onViewLoan,
  openMenuId,
  setOpenMenuId,
  menuPosition,
  setMenuPosition,
}) => {
  const loanId =
    loan.id ||
    loan.loanNumber;

  const nextDue =
    getNextDue(loan);

  const overdue =
    getOverdueCount(loan);

  const customerName =
    getCustomerName(loan);

  /* =====================================================
     CHECKBOX
  ====================================================== */

  const handleSelect = (event) => {
    event.stopPropagation();

    onSelect?.();
  };

  /* =====================================================
     MENU TOGGLE
  ====================================================== */

  const handleMenuToggle = (event) => {
    event.stopPropagation();

    const rect =
      event.currentTarget.getBoundingClientRect();

    const menuWidth = 230;
    const menuHeight = 340;
    const gap = 6;

    let left =
      rect.right - menuWidth;

    let top =
      rect.bottom + gap;

    /* -----------------------------------------
       Horizontal safety
    ----------------------------------------- */

    left = Math.max(
      8,
      Math.min(
        left,
        window.innerWidth -
          menuWidth -
          8
      )
    );

    /* -----------------------------------------
       Open above when bottom space is not enough
    ----------------------------------------- */

    if (
      top + menuHeight >
      window.innerHeight - 8
    ) {
      top =
        rect.top -
        menuHeight -
        gap;
    }

    /* -----------------------------------------
       Vertical safety
    ----------------------------------------- */

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

    /* -----------------------------------------
       ONE MENU AT A TIME
    ----------------------------------------- */

    setOpenMenuId((current) =>
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
        transition
        hover:bg-[#FAFCFB]
      "
    >

      {/* =================================================
          CHECKBOX
      ================================================= */}

      <td className="w-10 px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={handleSelect}
          className="
            h-4
            w-4
            cursor-pointer
            rounded
            border-slate-300
            accent-[#0B5D3B]
          "
          aria-label={`Select ${
            loan.loanNumber ||
            "loan"
          }`}
        />
      </td>

      {/* =================================================
          LOAN NUMBER
      ================================================= */}

      <td className="px-3.5 py-3">
        <p className="text-[11px] font-semibold text-[#17221D]">
          {loan.loanNumber ||
            "—"}
        </p>
      </td>

      {/* =================================================
          CUSTOMER
      ================================================= */}

      <td className="px-3.5 py-3">
        <p className="text-[11px] font-semibold text-[#17221D]">
          {customerName}
        </p>

        <p className="mt-0.5 text-[9px] text-slate-400">
          {getCustomerId(loan)}

          {getCustomerMobile(loan)
            ? ` • ${getCustomerMobile(
                loan
              )}`
            : ""}
        </p>
      </td>

      {/* =================================================
          VEHICLE
      ================================================= */}

      <td className="px-3.5 py-3">
        <p className="text-[11px] font-medium text-slate-700">
          {getRegistration(loan) ||
            "No registration"}
        </p>

        <p className="mt-0.5 text-[9px] text-slate-400">
          {getVehicleName(loan)}
        </p>
      </td>

      {/* =================================================
          LOAN AMOUNT
      ================================================= */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[11px] font-medium text-slate-700">
          ₹{money(loan.loanAmount)}
        </span>
      </td>

      {/* =================================================
          DOWN PAYMENT
      ================================================= */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[11px] text-slate-700">
          ₹{money(loan.downPayment)}
        </span>
      </td>

      {/* =================================================
          EMI
      ================================================= */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[11px] font-semibold text-[#0B5D3B]">
          ₹{money(getEmi(loan))}
        </span>
      </td>

      {/* =================================================
          TENURE
      ================================================= */}

      <td className="px-3.5 py-3 text-[10px] text-slate-700">
        {getTenure(loan)}
      </td>

      {/* =================================================
          NEXT DUE
      ================================================= */}

      <td className="px-3.5 py-3">
        <div className="flex items-center gap-1.5 whitespace-nowrap">
          <CalendarDays
            size={12}
            className="shrink-0 text-slate-400"
          />

          <span className="text-[10px] text-slate-600">
            {formatDate(
              nextDue?.dueDate
            )}
          </span>
        </div>
      </td>

      {/* =================================================
          OUTSTANDING
      ================================================= */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[11px] font-semibold text-[#17221D]">
          ₹
          {money(
            getLoanOutstanding(loan)
          )}
        </span>
      </td>

      {/* =================================================
          OVERDUE
      ================================================= */}

      <td className="px-3.5 py-3 text-center">
        <span
          className={`
            inline-flex
            min-w-7
            items-center
            justify-center
            rounded-full
            px-2
            py-1
            text-[9px]
            font-semibold
            ${
              overdue > 0
                ? "bg-red-50 text-red-600"
                : "bg-slate-50 text-slate-500"
            }
          `}
        >
          {overdue}
        </span>
      </td>

      {/* =================================================
          STATUS
      ================================================= */}

      <td className="px-3.5 py-3">
        <LoanStatus
          status={getDisplayLoanStatus(
            loan
          )}
          dueStatus={getLoanDueStatus(
            loan
          )}
        />
      </td>

      {/* =================================================
          ACTIONS
      ================================================= */}

      <td className="px-3.5 py-3">
        <div className="flex justify-center">

          <button
            type="button"
            onClick={handleMenuToggle}
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
                openMenuId === loanId
                  ? "border-[#0B5D3B] text-[#0B5D3B] shadow-sm"
                  : "border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700"
              }
            `}
            title="More Actions"
            aria-label="More Actions"
            aria-expanded={
              openMenuId === loanId
            }
          >
            <MoreVertical size={15} />
          </button>

          {openMenuId === loanId && (
            <LoanActionMenu
              loan={loan}
              position={menuPosition}
              onClose={() =>
                setOpenMenuId(null)
              }
              onView={() => {
                setOpenMenuId(null);

                onViewLoan(loan);
              }}
            />
          )}

        </div>
      </td>

    </tr>
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
    String(status || "")
      .toLowerCase();

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
    normalized === "overdue" ||
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
    normalized === "written off"
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