// src/Components/customers/loans/RepaymentScheduleModal.jsx

import {
  X,
  CalendarDays,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";

import {
  calculateScheduleTotals,
} from "../../services/repaymentSchedule";

const RepaymentScheduleModal = ({
  loan = {},
  customer = {},
  schedule = [],
  onClose,
}) => {
  const calculation = loan.calculation || {};
  const repayment = loan.repayment || {};

  const totals = calculateScheduleTotals(
    schedule
  );

  const money = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatDate = (value) => {
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

  const firstPayment =
    repayment.method === "Principal"
      ? schedule[0]?.paymentAmount || 0
      : calculation.emiAmount || 0;

  const totalInterest =
    calculation.interestAmount ??
    totals.interest ??
    0;

  const totalPayable =
    calculation.totalDue ??
    totals.totalPayable ??
    0;

  return (
    <div
      className="
        fixed
        inset-0
        z-[200]
        flex
        items-center
        justify-center
        bg-slate-950/45
        p-4
        backdrop-blur-[3px]
      "
    >
      {/* =====================================================
          MODAL
      ====================================================== */}

      <div
        className="
          flex
          h-[min(820px,calc(100vh-32px))]
          w-full
          max-w-[1050px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
          ring-1
          ring-black/5
        "
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            px-6
            py-4
          "
        >
          <div className="flex items-center gap-3">
            <div
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-[#EAF5EF]
              "
            >
              <CalendarDays
                size={19}
                className="text-[#0B5D3B]"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-semibold text-[#17221D]">
                Repayment Schedule
              </h2>

              <p className="mt-0.5 truncate text-xs text-slate-500">
                {customer.name || "Customer"}

                {loan.loanNumber
                  ? ` • ${loan.loanNumber}`
                  : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-100
              hover:text-slate-700
            "
            aria-label="Close repayment schedule"
          >
            <X size={18} />
          </button>
        </header>

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <div
          className="
            grid
            shrink-0
            grid-cols-2
            gap-2
            border-b
            border-slate-100
            bg-[#F8FAF9]
            px-6
            py-3
            sm:grid-cols-3
            lg:grid-cols-6
          "
        >
          <SummaryItem
            label="Principal"
            value={`₹${money(
              calculation.principal ??
                totals.principal
            )}`}
          />

          <SummaryItem
            label="Interest"
            value={`₹${money(
              totalInterest
            )}`}
          />

          <SummaryItem
            label="Total Payable"
            value={`₹${money(
              totalPayable
            )}`}
            highlight
          />

          <SummaryItem
            label={
              repayment.method === "Principal"
                ? "First Payment"
                : "EMI"
            }
            value={`₹${money(
              firstPayment
            )}`}
            highlight
          />

          <SummaryItem
            label="Payments"
            value={
              schedule.length || "—"
            }
          />

          <SummaryItem
            label="First Due"
            value={
              loan.firstDueDate
                ? formatDate(
                    loan.firstDueDate
                  )
                : "—"
            }
          />
        </div>

        {/* =====================================================
            TABLE AREA
            ONLY THIS AREA SCROLLS
        ====================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-auto
          "
        >
          {schedule.length > 0 ? (
            <table
              className="
                w-full
                min-w-[900px]
                border-collapse
              "
            >
              {/* TABLE HEADER */}

              <thead
                className="
                  sticky
                  top-0
                  z-10
                  bg-[#F8FAF9]
                "
              >
                <tr className="border-b border-slate-200">

                  <TableHeader>
                    No.
                  </TableHeader>

                  <TableHeader>
                    Due Date
                  </TableHeader>

                  <TableHeader align="right">
                    Opening Balance
                  </TableHeader>

                  <TableHeader align="right">
                    Principal
                  </TableHeader>

                  <TableHeader align="right">
                    Interest
                  </TableHeader>

                  <TableHeader align="right">
                    Payment
                  </TableHeader>

                  <TableHeader align="right">
                    Closing Balance
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                </tr>
              </thead>

              {/* TABLE BODY */}

              <tbody>
                {schedule.map((row) => (
                  <tr
                    key={
                      row.installmentNumber
                    }
                    className="
                      border-b
                      border-slate-100
                      transition
                      hover:bg-[#FAFCFB]
                    "
                  >
                    <TableCell>
                      {String(
                        row.installmentNumber
                      ).padStart(2, "0")}
                    </TableCell>

                    <TableCell>
                      {formatDate(
                        row.dueDate
                      )}
                    </TableCell>

                    <TableCell align="right">
                      ₹
                      {money(
                        row.openingBalance
                      )}
                    </TableCell>

                    <TableCell
                      align="right"
                      highlight
                    >
                      ₹
                      {money(
                        row.principal
                      )}
                    </TableCell>

                    <TableCell align="right">
                      ₹
                      {money(
                        row.interest
                      )}
                    </TableCell>

                    <TableCell
                      align="right"
                      highlight
                    >
                      ₹
                      {money(
                        row.paymentAmount
                      )}
                    </TableCell>

                    <TableCell align="right">
                      ₹
                      {money(
                        row.closingBalance
                      )}
                    </TableCell>

                    <TableCell>
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1
                          rounded-full
                          bg-slate-100
                          px-2
                          py-1
                          text-[10px]
                          font-medium
                          text-slate-500
                        "
                      >
                        <CheckCircle2
                          size={10}
                        />

                        {row.status ||
                          "Pending"}
                      </span>
                    </TableCell>
                  </tr>
                ))}
              </tbody>

              {/* TABLE TOTAL */}

              <tfoot>
                <tr
                  className="
                    border-t-2
                    border-[#D8E9DF]
                    bg-[#F6FBF8]
                  "
                >
                  <td
                    colSpan={3}
                    className="
                      px-4
                      py-3
                      text-xs
                      font-semibold
                      text-[#17221D]
                    "
                  >
                    Total
                  </td>

                  <td
                    className="
                      px-4
                      py-3
                      text-right
                      text-xs
                      font-semibold
                      text-[#0B5D3B]
                    "
                  >
                    ₹
                    {money(
                      totals.principal
                    )}
                  </td>

                  <td
                    className="
                      px-4
                      py-3
                      text-right
                      text-xs
                      font-semibold
                      text-[#0B5D3B]
                    "
                  >
                    ₹
                    {money(
                      totals.interest
                    )}
                  </td>

                  <td
                    className="
                      px-4
                      py-3
                      text-right
                      text-xs
                      font-semibold
                      text-[#0B5D3B]
                    "
                  >
                    ₹
                    {money(
                      totals.totalPayable
                    )}
                  </td>

                  <td
                    className="
                      px-4
                      py-3
                      text-right
                      text-xs
                      font-semibold
                      text-[#17221D]
                    "
                  >
                    ₹0
                  </td>

                  <td />
                </tr>
              </tfoot>
            </table>
          ) : (
            <div
              className="
                flex
                h-full
                min-h-[280px]
                items-center
                justify-center
              "
            >
              <div className="text-center">

                <div
                  className="
                    mx-auto
                    flex
                    h-11
                    w-11
                    items-center
                    justify-center
                    rounded-full
                    bg-slate-100
                  "
                >
                  <CalendarDays
                    size={19}
                    className="text-slate-400"
                  />
                </div>

                <p className="mt-3 text-sm font-medium text-slate-600">
                  No repayment schedule
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  A repayment schedule has not been generated yet.
                </p>

              </div>
            </div>
          )}
        </div>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <footer
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-t
            border-slate-100
            bg-white
            px-6
            py-3
          "
        >
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <IndianRupee size={13} />

            <span>
              {repayment.method ===
              "Principal"
                ? "Principal-based repayment"
                : "EMI-based repayment"}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              py-2
              text-xs
              font-semibold
              text-slate-600
              transition
              hover:border-slate-300
              hover:text-slate-800
            "
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
};


/* =========================================================
   SUMMARY ITEM
========================================================= */

const SummaryItem = ({
  label,
  value,
  highlight = false,
}) => {
  return (
    <div
      className="
        min-w-0
        rounded-lg
        bg-white
        px-3
        py-2
      "
    >
      <p className="truncate text-[9px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`
          mt-1
          truncate
          text-xs
          font-semibold

          ${
            highlight
              ? "text-[#0B5D3B]"
              : "text-[#17221D]"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
};


/* =========================================================
   TABLE HEADER
========================================================= */

const TableHeader = ({
  children,
  align = "left",
}) => {
  return (
    <th
      className={`
        whitespace-nowrap
        px-4
        py-3
        text-[10px]
        font-semibold
        uppercase
        tracking-wide
        text-slate-400

        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
};


/* =========================================================
   TABLE CELL
========================================================= */

const TableCell = ({
  children,
  align = "left",
  highlight = false,
}) => {
  return (
    <td
      className={`
        whitespace-nowrap
        px-4
        py-2.5
        text-xs

        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }

        ${
          highlight
            ? "font-semibold text-[#0B5D3B]"
            : "font-medium text-slate-600"
        }
      `}
    >
      {children}
    </td>
  );
};

export default RepaymentScheduleModal;