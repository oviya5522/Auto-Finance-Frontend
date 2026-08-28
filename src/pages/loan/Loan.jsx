// src/pages/customers/Loan.jsx

import { useEffect, useMemo, useState } from "react";

import {
  Search,
  IndianRupee,
  Users,
  CalendarDays,
  WalletCards,
  Eye,
  ChevronRight,
  X,
} from "lucide-react";

import {
  getLoans,
  getOutstandingAmount,
} from "../../services/customerStorage";

const LoanPage = () => {
  const [loans, setLoans] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedLoan, setSelectedLoan] = useState(null);

  /* =====================================================
     LOAD LOANS
  ====================================================== */

  const loadLoans = () => {
    const storedLoans = getLoans();

    setLoans(storedLoans);
  };

  useEffect(() => {
    loadLoans();

    const handleStorageUpdate = () => {
      loadLoans();
    };

    window.addEventListener(
      "fleetopz:data-updated",
      handleStorageUpdate
    );

    window.addEventListener(
      "storage",
      handleStorageUpdate
    );

    return () => {
      window.removeEventListener(
        "fleetopz:data-updated",
        handleStorageUpdate
      );

      window.removeEventListener(
        "storage",
        handleStorageUpdate
      );
    };
  }, []);

  /* =====================================================
     FILTER
  ====================================================== */

  const filteredLoans = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return loans;
    }

    return loans.filter((loan) => {
      return (
        loan.customerName
          ?.toLowerCase()
          .includes(query) ||
        loan.customerNumber
          ?.toLowerCase()
          .includes(query) ||
        loan.loanNumber
          ?.toLowerCase()
          .includes(query) ||
        loan.vehicle?.registrationNumber
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [loans, search]);

  /* =====================================================
     SUMMARY
  ====================================================== */

  const totalLoans =
    loans.length;

  const activeLoans =
    loans.filter(
      (loan) =>
        loan.status === "Active"
    ).length;

  const totalLoanAmount =
    loans.reduce(
      (sum, loan) =>
        sum +
        Number(
          loan.loanAmount || 0
        ),
      0
    );

  const totalOutstanding =
  loans.reduce(
    (total, loan) =>
      total +
      getOutstandingAmount(loan),
    0
  );
  /* =====================================================
     FORMAT
  ====================================================== */

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

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* =====================================================
     NEXT PAYMENT
  ====================================================== */

  const getNextDue = (loan) => {
    const schedule =
      loan.repaymentSchedule || [];

    const pending =
      schedule.find(
        (row) =>
          row.status === "Pending"
      );

    return pending || schedule[0] || null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] px-6 py-6">

      {/* =================================================
          HEADER
      ================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-[24px] font-semibold text-[#17221D]">
            Loan Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage customer loans and repayment information
          </p>
        </div>

      </div>


      {/* =================================================
          SUMMARY CARDS
      ================================================== */}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

        <SummaryCard
          icon={WalletCards}
          label="Total Loans"
          value={totalLoans}
        />

        <SummaryCard
          icon={Users}
          label="Active Loans"
          value={activeLoans}
          highlight
        />

        <SummaryCard
          icon={IndianRupee}
          label="Total Loan Amount"
          value={`₹${money(
            totalLoanAmount
          )}`}
        />

        <SummaryCard
          icon={IndianRupee}
          label="Total Outstanding"
          value={`₹${money(
            totalOutstanding
          )}`}
          gold
        />

      </div>


      {/* =================================================
          SEARCH
      ================================================== */}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3">

        <div className="relative">

          <Search
            size={17}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            placeholder="Search by customer, loan number, customer ID or vehicle..."
            className="
              h-11
              w-full
              rounded-lg
              border
              border-slate-200
              bg-white
              pl-10
              pr-4
              text-sm
              text-slate-700
              placeholder:text-slate-400
              outline-none
              transition
              focus:border-[#0B5D3B]
              focus:ring-1
              focus:ring-[#0B5D3B]
            "
          />

        </div>

      </div>


      {/* =================================================
          LOAN TABLE
      ================================================== */}

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[1050px] border-collapse">

            <thead className="bg-[#F8FAF9]">

              <tr className="border-b border-slate-200">

                <TableHeader>
                  Loan
                </TableHeader>

                <TableHeader>
                  Customer
                </TableHeader>

                <TableHeader>
                  Vehicle
                </TableHeader>

                <TableHeader align="right">
                  Loan Amount
                </TableHeader>

                <TableHeader align="right">
                  EMI
                </TableHeader>

                <TableHeader>
                  First Due
                </TableHeader>

                <TableHeader align="right">
                  Outstanding
                </TableHeader>

                <TableHeader>
                  Status
                </TableHeader>

                <TableHeader>
                  Action
                </TableHeader>

              </tr>

            </thead>


            <tbody>

              {filteredLoans.length > 0 ? (

                filteredLoans.map((loan) => {

                  const nextDue =
                    getNextDue(loan);

                  const outstanding =
  getOutstandingAmount(loan);

                  const vehicleName =
                    [
                      loan.vehicle?.brand,
                      loan.vehicle?.model,
                    ]
                      .filter(Boolean)
                      .join(" ") ||
                    "—";

                  const emi =
                    loan.calculation
                      ?.emiAmount ||
                    loan.emiAmount ||
                    0;

                  return (
                    <tr
                      key={
                        loan.id ||
                        loan.loanNumber
                      }
                      className="
                        border-b
                        border-slate-100
                        last:border-0
                        hover:bg-[#FAFCFB]
                      "
                    >

                      {/* LOAN */}

                      <TableCell>

                        <div>
                          <p className="text-xs font-semibold text-[#17221D]">
                            {loan.loanNumber ||
                              "—"}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {loan.customerNumber ||
                              "—"}
                          </p>
                        </div>

                      </TableCell>


                      {/* CUSTOMER */}

                      <TableCell>

                        <div>
                          <p className="text-xs font-semibold text-[#17221D]">
                            {loan.customerName ||
                              "Unnamed Customer"}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {loan.mobileNumber ||
                              "—"}
                          </p>
                        </div>

                      </TableCell>


                      {/* VEHICLE */}

                      <TableCell>

                        <div>

                          <p className="text-xs font-medium text-slate-700">
                            {vehicleName}
                          </p>

                          <p className="mt-0.5 text-[10px] uppercase text-slate-400">
                            {loan.vehicle
                              ?.registrationNumber ||
                              "No registration"}
                          </p>

                        </div>

                      </TableCell>


                      {/* LOAN AMOUNT */}

                      <TableCell align="right">

                        <span className="text-xs font-semibold text-[#17221D]">
                          ₹
                          {money(
                            loan.loanAmount
                          )}
                        </span>

                      </TableCell>


                      {/* EMI */}

                      <TableCell align="right">

                        <span className="text-xs font-semibold text-[#0B5D3B]">
                          ₹
                          {money(emi)}
                        </span>

                      </TableCell>


                      {/* FIRST DUE */}

                      <TableCell>

                        <div className="flex items-center gap-1.5">

                          <CalendarDays
                            size={13}
                            className="text-slate-400"
                          />

                          <span className="text-xs text-slate-600">
                            {formatDate(
                              loan.firstDueDate
                            )}
                          </span>

                        </div>

                      </TableCell>


                      {/* OUTSTANDING */}

                      <TableCell align="right">

                        <span className="text-xs font-semibold text-[#17221D]">
                          ₹
                          {money(
                            outstanding
                          )}
                        </span>

                      </TableCell>


                      {/* STATUS */}

                      <TableCell>

                        <StatusBadge
                          status={
                            loan.status ||
                            "Draft"
                          }
                        />

                      </TableCell>


                      {/* ACTION */}

                      <TableCell>

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedLoan(
                              loan
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            gap-1
                            rounded-lg
                            border
                            border-slate-200
                            px-2.5
                            py-1.5
                            text-[11px]
                            font-medium
                            text-slate-600
                            transition
                            hover:border-[#0B5D3B]
                            hover:text-[#0B5D3B]
                          "
                        >
                          <Eye size={13} />
                          View
                          <ChevronRight
                            size={12}
                          />
                        </button>

                      </TableCell>

                    </tr>
                  );
                })

              ) : (

                <tr>

                  <td
                    colSpan={9}
                    className="px-6 py-20 text-center"
                  >

                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#EAF5EF]">

                      <WalletCards
                        size={19}
                        className="text-[#0B5D3B]"
                      />

                    </div>

                    <p className="mt-3 text-sm font-semibold text-[#17221D]">
                      No loans yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Create a customer with a loan to see it here.
                    </p>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          LOAN DETAILS MODAL
      ================================================== */}

      {selectedLoan && (
        <LoanDetailsModal
          loan={selectedLoan}
          onClose={() =>
            setSelectedLoan(null)
          }
          money={money}
          formatDate={formatDate}
          getNextDue={getNextDue}
        />
      )}

    </div>
  );
};


/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  highlight = false,
  gold = false,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs text-slate-500">
            {label}
          </p>

          <p
            className={`
              mt-2
              text-xl
              font-semibold
              ${
                highlight
                  ? "text-[#0B5D3B]"
                  : gold
                  ? "text-[#0B5D3B]"
                  : "text-[#17221D]"
              }
            `}
          >
            {value}
          </p>

        </div>

        <div
          className={`
            flex
            h-9
            w-9
            items-center
            justify-center
            rounded-lg
            ${
              gold
                ? "bg-[#FBF4DD]"
                : "bg-[#EAF5EF]"
            }
          `}
        >
          <Icon
            size={17}
            className={
              gold
                ? "text-[#D4A72C]"
                : "text-[#0B5D3B]"
            }
          />
        </div>

      </div>

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
}) => {
  return (
    <td
      className={`
        px-4
        py-3
        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </td>
  );
};


/* =========================================================
   STATUS
========================================================= */

const StatusBadge = ({
  status,
}) => {
  const active =
    status === "Active";

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2.5
        py-1
        text-[10px]
        font-semibold

        ${
          active
            ? "bg-[#EAF5EF] text-[#0B5D3B]"
            : "bg-slate-100 text-slate-500"
        }
      `}
    >
      {status}
    </span>
  );
};


/* =========================================================
   LOAN DETAILS MODAL
========================================================= */

const LoanDetailsModal = ({
  loan,
  onClose,
  money,
  formatDate,
  getNextDue,
}) => {
  const nextDue =
    getNextDue(loan);

  const calculation =
    loan.calculation || {};

  const repayment =
    loan.repayment || {};

  const customerName =
    loan.customerName ||
    "Customer";

  const vehicleName =
    [
      loan.vehicle?.brand,
      loan.vehicle?.model,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Vehicle";

  return (
    <div
      className="
        fixed
        inset-0
        z-[150]
        flex
        items-center
        justify-center
        bg-slate-950/45
        p-4
        backdrop-blur-[3px]
      "
    >

      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-[850px]
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-2xl
        "
      >

        {/* HEADER */}

        <header
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
            py-4
          "
        >

          <div>

            <h2 className="text-[17px] font-semibold text-[#17221D]">
              {loan.loanNumber ||
                "Loan Details"}
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              {customerName}
              {" • "}
              {vehicleName}
            </p>

          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-100
              hover:text-slate-700
            "
          >
            <X size={18} />
          </button>

        </header>


        {/* CONTENT */}

        <div
          className="
            min-h-0
            overflow-y-auto
            p-5
          "
        >

          {/* BASIC */}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">

            <DetailBox
              label="Loan Amount"
              value={`₹${money(
                loan.loanAmount
              )}`}
            />

            <DetailBox
              label="Principal"
              value={`₹${money(
                calculation.principal
              )}`}
            />

            <DetailBox
              label="Interest"
              value={`₹${money(
                calculation.interestAmount
              )}`}
            />

            <DetailBox
              label="Total Payable"
              value={`₹${money(
                calculation.totalDue
              )}`}
              highlight
            />

            <DetailBox
              label={
                repayment.method ===
                "Principal"
                  ? "First Payment"
                  : "EMI"
              }
              value={`₹${money(
                repayment.method ===
                "Principal"
                  ? loan.repaymentSchedule?.[0]
                      ?.paymentAmount
                  : calculation.emiAmount
              )}`}
              highlight
            />

            <DetailBox
              label="Payments"
              value={
                calculation.numberOfPayments ||
                loan.repaymentSchedule?.length ||
                "—"
              }
            />

            <DetailBox
              label="Interest Type"
              value={
                loan.interest?.type ||
                "—"
              }
            />

            <DetailBox
              label="Tenure"
              value={`
                ${repayment.tenure || "—"}
                ${repayment.tenureUnit || ""}
              `}
            />

          </div>


          {/* NEXT DUE */}

          <div className="mt-4 rounded-xl border border-[#D8E9DF] bg-[#F6FBF8] p-4">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EAF5EF]">

                <CalendarDays
                  size={17}
                  className="text-[#0B5D3B]"
                />

              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Next Due
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[#17221D]">
                  {nextDue
                    ? formatDate(
                        nextDue.dueDate
                      )
                    : "No schedule"}
                </p>
              </div>

              <div className="ml-auto text-right">

                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Amount
                </p>

                <p className="mt-0.5 text-sm font-semibold text-[#0B5D3B]">
                  ₹
                  {money(
                    nextDue?.paymentAmount ||
                      0
                  )}
                </p>

              </div>

            </div>

          </div>


          {/* LOAN INFO */}

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">

            <DetailBox
              label="First Due Date"
              value={
                loan.firstDueDate
                  ? formatDate(
                      loan.firstDueDate
                    )
                  : "—"
              }
            />

            <DetailBox
              label="Payment Frequency"
              value={
                repayment.frequency ||
                "—"
              }
            />

          </div>

        </div>

      </div>

    </div>
  );
};


/* =========================================================
   DETAIL BOX
========================================================= */

const DetailBox = ({
  label,
  value,
  highlight = false,
}) => {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">

      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-sm
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

export default LoanPage;