// src/pages/loan/LoanManagement.jsx

import { useEffect, useMemo, useState } from "react";

import {
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  TrendingUp,
  AlertTriangle,
  Eye,
  FileText,
} from "lucide-react";

import useDashboardData from "../../hooks/dashboard/useDashboardData";
import useLoanFilters from "../../hooks/loans/seLoanFilters";

import LoanManagementDetails from "../../components/loans/LoanManagementDetails";
import LoanRepaymentCalendar from "../../components/loans/LoanRepaymentCalendar";
import LoanRepaymentScheduleModal from "../../components/loans/LoanRepaymentScheduleModal";
import {
  getSchedulePaidAmount,
} from "../../services/repaymentStorage";

const LoanManagement = () => {
  const {
    emiDueCount,
    emiDueAmount,

    overdueLoanCount,
    overdueAmount,

    loans,

    approvedCollections = [],

    todayCollectionAmount = 0,
    todayScheduledDueAmount = 0,

    collectionVsDue,
  } = useDashboardData();

  /* =====================================================
     CREATE DISPLAY LOANS

     Important:
     The stored repaymentSchedule may still say
     "Pending" / "Overdue" after admin approves a
     collection.

     Here we calculate the remaining amount from
     approved collections and create a display copy.

     Original stored loan data is NOT mutated.
  ====================================================== */
const displayLoans = useMemo(() => {
  return loans.map((loan) => {
    /*
     * FORECLOSED / CLOSED / PAID_OFF loans must not
     * generate any active repayment dues.
     */
    const loanStatus = String(
      loan?.status || ""
    )
      .trim()
      .toUpperCase();

    const isForeclosed =
      loanStatus === "FORECLOSED" ||
      loanStatus === "CLOSED" ||
      loanStatus === "PAID_OFF";

    /*
     * Keep the loan visible in All Loans, but remove
     * its active repayment schedule from the collection
     * workflow once it is closed/foreclosed.
     */
    if (isForeclosed) {
      return {
        ...loan,

        repaymentSchedule: [],

        paymentHistory: Array.isArray(
          loan?.paymentHistory
        )
          ? loan.paymentHistory
          : [],
      };
    }

    const schedule = Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];

    const updatedSchedule = schedule.map(
      (row) => {
        const scheduledAmount =
          getRowAmount(row);

        const approvedAmount =
          getApprovedAmountForRow(
            loan,
            row,
            approvedCollections
          );

        const paidAmount =
          Math.max(
            getSchedulePaidAmount(
              row
            ),
            approvedAmount
          );

        const remainingAmount =
          Math.max(
            scheduledAmount -
              paidAmount,
            0
          );

        const originalStatus =
          normalizeStatus(
            row?.status
          );

        let displayStatus =
          originalStatus;

        /*
         * Fully collected installment.
         */
        if (
          remainingAmount <= 0 &&
          scheduledAmount > 0
        ) {
          displayStatus = "Paid";
        } else if (
          paidAmount > 0 &&
          remainingAmount > 0
        ) {
          displayStatus =
            "Partially Paid";
        } else if (
          isDateOverdue(
            row?.dueDate
          ) &&
          isOpenStatus(
            originalStatus
          )
        ) {
          displayStatus = "Overdue";
        }

        return {
          ...row,

          /*
           * Keep original amount.
           */
          paymentAmount:
            row?.paymentAmount ??
            row?.emiAmount ??
            row?.amount ??
            0,

          /*
           * Derived values.
           */
          approvedAmount,
          remainingAmount,

          /*
           * Display status.
           */
          status:
            displayStatus,

          /*
           * Helpful for schedule/detail UI.
           */
          paidAmount,

          balance:
            remainingAmount,
        };
      }
    );

    /*
     * Build a display payment history
     * without mutating original loan.
     */
    const paymentHistory =
      buildDisplayPaymentHistory(
        loan,
        approvedCollections
      );

    return {
      ...loan,

      repaymentSchedule:
        updatedSchedule,

      paymentHistory,
    };
  });
}, [
  loans,
  approvedCollections,
]);
  /* =====================================================
     FILTERS
  ====================================================== */

  const {
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
  } = useLoanFilters(
    displayLoans
  );

  /* =====================================================
     RESET FILTERS
  ====================================================== */

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setLoanTypeFilter("All Loan Types");
    setDueFilter("All Due Status");
    setDateFilter("");
    setSortBy("recent");
  };

  /* =====================================================
     UPCOMING DUE
  ====================================================== */

  const upcomingDue =
    useMemo(() => {
      return calculateUpcomingDue(
        displayLoans
      );
    }, [displayLoans]);

  /* =====================================================
     UI STATE
  ====================================================== */

  const [
    selectedLoan,
    setSelectedLoan,
  ] = useState(null);

  const [
    calendarLoan,
    setCalendarLoan,
  ] = useState(null);

  const [
    scheduleLoan,
    setScheduleLoan,
  ] = useState(null);

  /* =====================================================
     KEEP SELECTED LOAN IN SYNC

     When an admin approves a collection:
     - loans reload
     - displayLoans is rebuilt
     - selected loan gets latest values
  ====================================================== */

  useEffect(() => {
    if (!selectedLoan) {
      return;
    }

    const loanId =
      selectedLoan?.id ||
      selectedLoan?.loanNumber;

    const latestLoan =
      displayLoans.find(
        (loan) =>
          String(
            loan?.id ||
              loan?.loanNumber
          ) ===
          String(loanId)
      );

    if (latestLoan) {
      setSelectedLoan(
        latestLoan
      );
    } else {
      setSelectedLoan(null);
    }
  }, [
    displayLoans,
    selectedLoan,
  ]);

  /* =====================================================
     KPI CARDS
  ====================================================== */

  const collectionAccuracy =
    Number(
      collectionVsDue?.today
        ?.accuracy || 0
    );

  const cards = [
    {
      icon: IndianRupee,
      label: "Today's Collection",
      value: formatMoney(
        todayCollectionAmount
      ),
      note:
        todayScheduledDueAmount > 0
          ? `${formatPercent(
              collectionAccuracy
            )} collected`
          : "No collection due today",
      tone: "green",
    },

    {
      icon: CalendarClock,
      label: "Today's Due",
      value: formatMoney(
        emiDueAmount
      ),
      note: `${emiDueCount.toLocaleString(
        "en-IN"
      )} EMI due`,
      tone: "neutral",
    },

    {
      icon: AlertTriangle,
      label: "Overdue Amount",
      value: formatMoney(
        overdueAmount
      ),
      note: `${overdueLoanCount.toLocaleString(
        "en-IN"
      )} overdue`,
      tone: "danger",
    },

    {
      icon: TrendingUp,
      label: "Upcoming Due (7 Days)",
      value: formatMoney(
        upcomingDue.amount
      ),
      note: `${upcomingDue.count.toLocaleString(
        "en-IN"
      )} upcoming`,
      tone: "neutral",
    },

    {
      icon: CheckCircle2,
      label: "Collection Efficiency",
      value:
        todayScheduledDueAmount >
        0
          ? formatPercent(
              collectionAccuracy
            )
          : "0%",
      note:
        todayScheduledDueAmount >
        0
          ? "Today's collection"
          : "No collection due today",
      tone: "green",
    },
  ];

  /* =====================================================
     LOAN MANAGEMENT TABS
  ====================================================== */

  const tabs = useMemo(() => {
    return [
      {
        key: "all",
        label: "All Loans",
        loans: filteredLoans,
      },

      {
        key: "today",
        label: "Today's Due",
        loans:
          filteredLoans.filter(
            (loan) =>
              hasRemainingDueToday(
                loan
              )
          ),
      },

      {
        key: "overdue",
        label: "Overdue",
        loans:
          filteredLoans.filter(
            (loan) =>
              hasRemainingOverdue(
                loan
              )
          ),
      },

      {
        key: "upcoming",
        label: "Upcoming Due",
        loans:
          filteredLoans.filter(
            (loan) =>
              hasUpcomingRemainingDue(
                loan
              )
          ),
      },

      {
        key: "paid",
        label: "Paid Today",
        loans:
          filteredLoans.filter(
            (loan) =>
              isPaidToday(loan)
          ),
      },
    ];
  }, [filteredLoans]);

  /* =====================================================
     MAIN RENDER
  ====================================================== */

  return (
    <div
      className="
        min-h-full
        bg-[#F7F9F8]
        px-3
        py-3
        sm:px-4
        sm:py-4
        lg:px-5
        lg:py-5
      "
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <header className="mb-4">
        <h1
          className="
            text-[22px]
            font-semibold
            tracking-tight
            text-[#17221D]
            sm:text-[24px]
          "
        >
          Loan Management
        </h1>

        <p className="mt-1 text-[12px] text-slate-500">
          Manage EMI collections, track dues and monitor
          loan status.
        </p>
      </header>

      {/* =================================================
          KPI CARDS
      ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-2.5
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-5
        "
      >
        {cards.map((card) => (
          <ManagementKpiCard
            key={card.label}
            {...card}
          />
        ))}
      </div>

      {/* =================================================
          FILTERS
      ================================================== */}

      <div
        className="
          mt-3
          rounded-xl
          border
          border-slate-200
          bg-white
          p-2.5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2
            lg:flex-row
            lg:items-center
          "
        >
          <div className="relative min-w-0 flex-1">
            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search customer, loan number, vehicle..."
              className="
                h-9
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                text-[12px]
                outline-none
                focus:border-[#0B5D3B]
                focus:ring-1
                focus:ring-[#0B5D3B]
              "
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              px-2.5
              text-[10px]
            "
          >
            <option>
              All Status
            </option>

            <option>
              Active
            </option>

            <option>
              Pending
            </option>

            <option>
              Overdue
            </option>

            <option>
              Closed
            </option>

            <option>
              Seized
            </option>
<option>
  Foreclosed
</option>
            <option>
              Written Off
            </option>
          </select>

          <select
            value={
              loanTypeFilter
            }
            onChange={(event) =>
              setLoanTypeFilter(
                event.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              px-2.5
              text-[10px]
            "
          >
            <option>
              All Loan Types
            </option>

            <option>
              Flat
            </option>

            <option>
              Reducing
            </option>
          </select>

          <select
            value={dueFilter}
            onChange={(event) =>
              setDueFilter(
                event.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              px-2.5
              text-[10px]
            "
          >
            <option>
              All Due Status
            </option>

            <option>
              Due
            </option>

            <option>
              Overdue
            </option>

            <option>
              Completed
            </option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(event) =>
              setDateFilter(
                event.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              px-2.5
              text-[10px]
            "
          />

          <select
            value={sortBy}
            onChange={(event) =>
              setSortBy(
                event.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              px-2.5
              text-[10px]
            "
          >
            <option value="recent">
              Sort: Recent
            </option>

            <option value="dueSoon">
              Sort: Due Soon
            </option>

            <option value="amountHigh">
              Sort: Amount High
            </option>

            <option value="outstandingHigh">
              Sort: Outstanding High
            </option>

            <option value="customer">
              Sort: Customer
            </option>
          </select>

          <button
            type="button"
            onClick={
              handleResetFilters
            }
            className="
              inline-flex
              h-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-[10px]
              font-semibold
              text-slate-500
              transition
              hover:border-[#A8D0BD]
              hover:bg-[#F6FBF8]
              hover:text-[#0B5D3B]
            "
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* =================================================
          TABS
      ================================================== */}

      <LoanManagementTabs
        tabs={tabs}
        selectedLoan={selectedLoan}
        onSelectLoan={
          setSelectedLoan
        }
        onCalendar={
          setCalendarLoan
        }
        onSchedule={
          setScheduleLoan
        }
      />

      {/* =================================================
          CALENDAR
      ================================================== */}

      {calendarLoan && (
        <LoanRepaymentCalendar
          loan={calendarLoan}
          onClose={() =>
            setCalendarLoan(
              null
            )
          }
        />
      )}

      {/* =================================================
          SCHEDULE
      ================================================== */}

      {scheduleLoan && (
        <LoanRepaymentScheduleModal
          loan={scheduleLoan}
          onClose={() =>
            setScheduleLoan(
              null
            )
          }
        />
      )}
    </div>
  );
};

/* =========================================================
   KPI CARD
========================================================= */

const ManagementKpiCard = ({
  icon: Icon,
  label,
  value,
  note,
  tone = "neutral",
}) => {
  const styles = {
    green: {
      iconBg: "bg-[#EAF5EF]",
      iconText:
        "text-[#0B5D3B]",
      valueText:
        "text-[#0B5D3B]",
    },

    neutral: {
      iconBg:
        "bg-slate-50",
      iconText:
        "text-slate-600",
      valueText:
        "text-[#17221D]",
    },

    danger: {
      iconBg:
        "bg-red-50",
      iconText:
        "text-red-700",
      valueText:
        "text-red-700",
    },
  };

  const current =
    styles[tone] ||
    styles.neutral;

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3.5
        py-3
        shadow-sm
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="
              truncate
              text-[9px]
              font-medium
              uppercase
              tracking-[0.05em]
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className={`
              mt-1
              truncate
              text-[20px]
              font-semibold
              leading-none
              tracking-tight
              ${current.valueText}
            `}
          >
            {value}
          </p>

          <p
            className="
              mt-1.5
              truncate
              text-[9px]
              text-slate-400
            "
          >
            {note}
          </p>
        </div>

        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${current.iconBg}
          `}
        >
          <Icon
            size={17}
            strokeWidth={2}
            className={
              current.iconText
            }
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TABS
========================================================= */

const LoanManagementTabs = ({
  tabs,
  selectedLoan,
  onSelectLoan,
  onCalendar,
  onSchedule,
}) => {
  const [
    activeTab,
    setActiveTab,
  ] = useState("all");

  const activeTabData =
    tabs.find(
      (tab) =>
        tab.key ===
        activeTab
    ) ||
    tabs[0];

  return (
    <>
      {/* TAB BAR */}

      <div
        className="
          mt-3
          flex
          items-center
          gap-5
          overflow-x-auto
          border-b
          border-slate-200
        "
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() =>
              setActiveTab(
                tab.key
              )
            }
            className={`
              relative
              shrink-0
              whitespace-nowrap
              pb-2.5
              text-[10px]
              font-semibold
              transition
              ${
                activeTab ===
                tab.key
                  ? "text-[#0B5D3B]"
                  : "text-slate-400 hover:text-slate-600"
              }
            `}
          >
            {tab.label}

            <span
              className={`
                ml-1.5
                rounded-full
                px-1.5
                py-0.5
                text-[8px]
                font-semibold
                ${
                  activeTab ===
                  tab.key
                    ? "bg-[#EAF5EF] text-[#0B5D3B]"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              {
                tab.loans.length
              }
            </span>

            {activeTab ===
              tab.key && (
              <span
                className="
                  absolute
                  bottom-0
                  left-0
                  right-0
                  h-[2px]
                  rounded-full
                  bg-[#0B5D3B]
                "
              />
            )}
          </button>
        ))}
      </div>

      {/* CONTENT */}

      <div
        className="
          mt-3
          flex
          flex-col
          gap-3
          xl:flex-row
          xl:items-start
        "
      >
        <div className="min-w-0 flex-1">
          <LoanManagementTable
            loans={
              activeTabData.loans
            }
            selectedLoan={
              selectedLoan
            }
            onSelectLoan={
              onSelectLoan
            }
            onCalendar={
              onCalendar
            }
            onSchedule={
              onSchedule
            }
          />
        </div>

        {selectedLoan && (
          <LoanManagementDetails
            loan={
              selectedLoan
            }
            onClose={() =>
              onSelectLoan(null)
            }
          />
        )}
      </div>
    </>
  );
};

/* =========================================================
   TABLE
========================================================= */

const LoanManagementTable = ({
  loans = [],
  selectedLoan,
  onSelectLoan,
  onCalendar,
  onSchedule,
}) => {
  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const rowsPerPage = 5;

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        loans.length /
          rowsPerPage
      )
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [loans]);

  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);

  const startIndex =
    loans.length === 0
      ? 0
      : (currentPage - 1) *
        rowsPerPage;

  const endIndex =
    Math.min(
      startIndex +
        rowsPerPage,
      loans.length
    );

  const paginatedLoans =
    loans.slice(
      startIndex,
      endIndex
    );

  if (!loans.length) {
    return (
      <div
        className="
          mt-3
          rounded-xl
          border
          border-slate-200
          bg-white
          px-6
          py-12
          text-center
        "
      >
        <p className="text-[12px] font-semibold text-[#17221D]">
          No loans found
        </p>

        <p className="mt-1 text-[9px] text-slate-400">
          Loans matching this view
          will appear here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        mt-3
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
      "
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="bg-[#F8FAF9]">
            <tr className="border-b border-slate-200">
              <TableHeader>
                Loan / Customer
              </TableHeader>

              <TableHeader>
                Due Date
              </TableHeader>

              <TableHeader>
                EMI Details
              </TableHeader>

              <TableHeader align="right">
                Outstanding
              </TableHeader>

              <TableHeader align="right">
                Due Amount
              </TableHeader>

              <TableHeader>
                Status
              </TableHeader>

              <TableHeader align="center">
                Actions
              </TableHeader>
            </tr>
          </thead>

          <tbody>
            {paginatedLoans.map(
              (loan) => (
                <LoanManagementRow
                  key={
                    loan?.id ||
                    loan?.loanNumber
                  }
                  loan={
                    loan
                  }
                  selected={
                    String(
                      selectedLoan?.id ||
                        selectedLoan?.loanNumber
                    ) ===
                    String(
                      loan?.id ||
                        loan?.loanNumber
                    )
                  }
                  onClick={() =>
                    onSelectLoan(
                      loan
                    )
                  }
                  onCalendar={
                    onCalendar
                  }
                  onSchedule={
                    onSchedule
                  }
                />
              )
            )}
          </tbody>
        </table>
      </div>

      <LoanManagementPagination
        currentPage={
          currentPage
        }
        totalPages={
          totalPages
        }
        totalItems={
          loans.length
        }
        startIndex={
          startIndex
        }
        endIndex={
          endIndex
        }
        onPrevious={() =>
          setCurrentPage(
            (page) =>
              Math.max(
                page - 1,
                1
              )
          )
        }
        onNext={() =>
          setCurrentPage(
            (page) =>
              Math.min(
                page + 1,
                totalPages
              )
          )
        }
        onPageChange={
          setCurrentPage
        }
      />
    </div>
  );
};

/* =========================================================
   TABLE ROW
========================================================= */

const LoanManagementRow = ({
  loan,
  selected,
  onClick,
  onCalendar,
  onSchedule,
}) => {
  const customerName =
    loan?.customerName ||
    loan?.customer?.personal
      ?.name ||
    "Unnamed Customer";

  const vehicleName =
    [
      loan?.vehicle?.brand,
      loan?.vehicle?.model,
      loan?.vehicle?.variant,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Vehicle not assigned";

  const nextDue =
    getNextRemainingDue(
      loan
    );

  const emi =
    getEmi(loan);

  const outstanding =
    getLoanOutstanding(
      loan
    );

  const dueAmount =
    Number(
      nextDue
        ?.remainingAmount ??
        nextDue
          ?.paymentAmount ??
        nextDue
          ?.emiAmount ??
        nextDue
          ?.amount ??
        0
    );

  const overdueCount =
    getRemainingOverdueCount(
      loan
    );

  const dueStatus =
    getDisplayDueStatus(
      loan
    );

  return (
    <tr
      onClick={onClick}
      className={`
        cursor-pointer
        border-b
        border-slate-100
        transition-colors
        hover:bg-[#FAFCFB]
        ${
          selected
            ? "bg-[#F1F7F3]"
            : ""
        }
      `}
    >
      {/* LOAN / CUSTOMER */}

      <td className="px-2.5 py-2.5">
        <p className="text-[12px] font-semibold text-[#0B5D3B]">
          {
            loan?.loanNumber ||
            "—"
          }
        </p>

        <p className="mt-0.5 text-[12px] font-semibold text-[#17221D]">
          {
            customerName
          }
        </p>

        <p className="mt-0.5 max-w-[170px] truncate text-[9px] text-slate-400">
          {
            vehicleName
          }
        </p>
      </td>

      {/* DUE DATE */}

      <td className="px-3.5 py-3">
        <div
          className={`
            text-[10px]
            font-semibold
            ${
              dueStatus ===
              "Overdue"
                ? "text-red-600"
                : "text-[#17221D]"
            }
          `}
        >
          {formatDate(
            nextDue?.dueDate
          )}
        </div>

        <p
          className={`
            mt-0.5
            text-[9px]
            font-medium
            ${
              dueStatus ===
              "Overdue"
                ? "text-red-400"
                : "text-slate-400"
            }
          `}
        >
          {getDueMessage(
            nextDue?.dueDate,
            dueStatus
          )}
        </p>
      </td>

      {/* EMI DETAILS */}

      <td className="px-3.5 py-3">
        <p className="text-[12px] font-semibold text-[#17221D]">
          EMI: ₹
          {formatNumber(
            emi
          )}
        </p>

        <p className="mt-0.5 text-[9px] text-slate-400">
          Tenure:{" "}
          {getTenure(
            loan
          )}
        </p>
      </td>

      {/* OUTSTANDING */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[12px] font-semibold text-[#17221D]">
          ₹
          {formatNumber(
            outstanding
          )}
        </span>
      </td>

      {/* REMAINING DUE */}

      <td className="px-3.5 py-3 text-right">
        <span
          className={`
            text-[12px]
            font-semibold
            ${
              dueStatus ===
              "Overdue"
                ? "text-red-600"
                : dueStatus ===
                    "Due"
                  ? "text-amber-600"
                  : "text-[#0B5D3B]"
            }
          `}
        >
          ₹
          {formatNumber(
            dueAmount
          )}
        </span>
      </td>

      {/* STATUS */}

      <td className="px-3.5 py-3">
        <ManagementStatus
          loan={loan}
          dueStatus={
            dueStatus
          }
          overdueCount={
            overdueCount
          }
        />
      </td>

      {/* ACTIONS */}

      <td className="px-3.5 py-3">
        <div className="flex items-center justify-center gap-1.5">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onClick?.();
            }}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-500
              transition
              hover:border-[#0B5D3B]
              hover:text-[#0B5D3B]
            "
            title="View Loan"
          >
            <Eye size={14} />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCalendar?.(
                loan
              );
            }}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-500
              transition
              hover:border-[#0B5D3B]
              hover:text-[#0B5D3B]
            "
            title="Repayment Calendar"
          >
            <CalendarDays
              size={14}
            />
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSchedule?.(
                loan
              );
            }}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-500
              transition
              hover:border-[#0B5D3B]
              hover:text-[#0B5D3B]
            "
            title="Repayment Schedule"
          >
            <FileText
              size={14}
            />
          </button>
        </div>
      </td>
    </tr>
  );
};

/* =========================================================
   STATUS
========================================================= */

const ManagementStatus = ({
  loan,
  dueStatus,
  overdueCount,
}) => {
  const rawStatus = normalizeStatus(
    loan?.status
  );

  let label = "Active";
  let classes =
    "bg-[#EAF5EF] text-[#0B5D3B]";

  /* =====================================================
     FORECLOSED
     Highest priority because a sold vehicle must end
     with the related loan shown as Foreclosed.
  ====================================================== */

  if (
    rawStatus === "foreclosed"
  ) {
    label = "Foreclosed";

    classes =
      "bg-violet-50 text-violet-700";
  }

  /* =====================================================
     CLOSED / PAID
  ====================================================== */

  else if (
    rawStatus === "closed" ||
    rawStatus === "paid" ||
    rawStatus === "paid_off"
  ) {
    label = "Paid";

    classes =
      "bg-emerald-50 text-emerald-700";
  }

  /* =====================================================
     OVERDUE
  ====================================================== */

  else if (
    overdueCount > 0 ||
    dueStatus === "Overdue"
  ) {
    label = "Overdue";

    classes =
      "bg-red-50 text-red-700";
  }

  /* =====================================================
     COMPLETED
  ====================================================== */

  else if (
    dueStatus === "Completed"
  ) {
    label = "Paid";

    classes =
      "bg-emerald-50 text-emerald-700";
  }

  /* =====================================================
     DUE
  ====================================================== */

  else if (
    dueStatus === "Due"
  ) {
    const nextDue =
      getNextRemainingDue(loan);

    const dueDate =
      parseLocalDate(
        nextDue?.dueDate
      );

    if (dueDate) {
      const today =
        getTodayStart();

      const dueStart =
        getDayStart(
          dueDate
        );

      const diffDays =
        Math.round(
          (
            dueStart.getTime() -
            today.getTime()
          ) /
            (
              1000 *
              60 *
              60 *
              24
            )
        );

      if (diffDays === 0) {
        label = "Due Today";
      } else if (diffDays === 1) {
        label = "Due Tomorrow";
      } else if (diffDays > 1) {
        label =
          `Due in ${diffDays} days`;
      } else {
        label = "Due";
      }
    } else {
      label = "Due";
    }

    classes =
      "bg-amber-50 text-amber-700";
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
      {label}
    </span>
  );
};

/* =========================================================
   PAGINATION
========================================================= */

const LoanManagementPagination = ({
  currentPage,
  totalPages,
  totalItems,
  startIndex,
  endIndex,
  onPrevious,
  onNext,
  onPageChange,
}) => {
  const pages =
    Array.from(
      {
        length:
          totalPages,
      },
      (_, index) =>
        index + 1
    );

  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-between
        gap-2
        border-t
        border-slate-100
        px-2.5
        py-2.5
      "
    >
      <p className="text-[9px] text-slate-400">
        Showing{" "}
        <span className="font-semibold text-slate-600">
          {totalItems === 0
            ? 0
            : startIndex + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-600">
          {endIndex}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-600">
          {totalItems}
        </span>{" "}
        entries
      </p>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={
            onPrevious
          }
          disabled={
            currentPage ===
            1
          }
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-md
            border
            border-slate-200
            text-slate-500
            transition
            hover:border-[#A8D0BD]
            hover:bg-[#F6FBF8]
            hover:text-[#0B5D3B]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          aria-label="Previous page"
        >
          ‹
        </button>

        {pages.map(
          (page) => (
            <button
              key={page}
              type="button"
              onClick={() =>
                onPageChange(
                  page
                )
              }
              className={`
                flex
                h-7
                min-w-7
                items-center
                justify-center
                rounded-md
                px-1.5
                text-[9px]
                font-semibold
                ${
                  currentPage ===
                  page
                    ? "bg-[#0B5D3B] text-white"
                    : "border border-slate-200 text-slate-500 hover:border-[#A8D0BD] hover:bg-[#F6FBF8] hover:text-[#0B5D3B]"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={
            currentPage ===
            totalPages
          }
          className="
            flex
            h-7
            w-7
            items-center
            justify-center
            rounded-md
            border
            border-slate-200
            text-slate-500
            transition
            hover:border-[#A8D0BD]
            hover:bg-[#F6FBF8]
            hover:text-[#0B5D3B]
            disabled:cursor-not-allowed
            disabled:opacity-40
          "
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   DISPLAY DUE MESSAGE
========================================================= */

const getDueMessage = (
  dueDate,
  dueStatus
) => {
  if (
    !dueDate
  ) {
    return "No due date";
  }

  const due =
    parseLocalDate(
      dueDate
    );

  if (!due) {
    return "No due date";
  }

  const today =
    getTodayStart();

  const dueStart =
    getDayStart(
      due
    );

  if (
    dueStatus ===
    "Overdue"
  ) {
    const days = Math.max(
      1,
      Math.round(
        (today.getTime() -
          dueStart.getTime()) /
          (1000 *
            60 *
            60 *
            24)
      )
    );

    return `Overdue by ${days} day${
      days === 1
        ? ""
        : "s"
    }`;
  }

  const days = Math.max(
    0,
    Math.round(
      (dueStart.getTime() -
        today.getTime()) /
        (1000 *
          60 *
          60 *
          24)
    )
  );

  if (
    days === 0
  ) {
    return "Due Today";
  }

  if (
    days === 1
  ) {
    return "Due Tomorrow";
  }

  return `Due in ${days} days`;
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
        px-3.5
        py-2.5
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.04em]
        text-slate-400
        ${
          align ===
          "right"
            ? "text-right"
            : align ===
                "center"
              ? "text-center"
              : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
};

/* =========================================================
   UPCOMING DUE
========================================================= */

const calculateUpcomingDue = (
  loans = []
) => {
  const today =
    getTodayStart();

  const end =
    new Date(today);

  end.setDate(
    end.getDate() + 7
  );

  let count = 0;
  let amount = 0;

  loans.forEach(
    (loan) => {
      const schedule =
        Array.isArray(
          loan?.repaymentSchedule
        )
          ? loan.repaymentSchedule
          : [];

      schedule.forEach(
        (row) => {
          const remaining =
            Number(
              row?.remainingAmount ??
                row?.paymentAmount ??
                row?.emiAmount ??
                row?.amount ??
                0
            );

          if (
            remaining <= 0
          ) {
            return;
          }

          const dueDate =
            parseLocalDate(
              row?.dueDate
            );

          if (!dueDate) {
            return;
          }

          const due =
            getDayStart(
              dueDate
            );

          if (
            due > today &&
            due <= end
          ) {
            count += 1;
            amount +=
              remaining;
          }
        }
      );
    }
  );

  return {
    count,
    amount,
  };
};

/* =========================================================
   LOAN STATUS HELPERS
========================================================= */

const isForeclosedLoan = (loan) => {
  const status = String(
    loan?.status || ""
  )
    .trim()
    .toUpperCase();

  return (
    status === "FORECLOSED" ||
    status === "CLOSED" ||
    status === "PAID_OFF"
  );
};

/* =========================================================
   DATE / DUE HELPERS
========================================================= */

const hasRemainingDueToday = (
  loan
) => {
  const schedule =
    getRemainingSchedule(
      loan
    );

  const today =
    getTodayStart();

  return schedule.some(
    (row) => {
      const date =
        parseLocalDate(
          row?.dueDate
        );

      return (
        date &&
        getDayStart(
          date
        ).getTime() ===
          today.getTime()
      );
    }
  );
};

const hasRemainingOverdue = (
  loan
) => {
  const schedule =
    getRemainingSchedule(
      loan
    );

  const today =
    getTodayStart();

  return schedule.some(
    (row) => {
      const date =
        parseLocalDate(
          row?.dueDate
        );

      return (
        date &&
        getDayStart(
          date
        ).getTime() <
          today.getTime()
      );
    }
  );
};

const hasUpcomingRemainingDue = (
  loan
) => {
  const schedule =
    getRemainingSchedule(
      loan
    );

  const today =
    getTodayStart();

  const end =
    new Date(today);

  end.setDate(
    end.getDate() + 7
  );

  return schedule.some(
    (row) => {
      const date =
        parseLocalDate(
          row?.dueDate
        );

      if (!date) {
        return false;
      }

      const due =
        getDayStart(
          date
        );

      return (
        due > today &&
        due <= end
      );
    }
  );
};

const getRemainingSchedule = (loan) => {
  if (isForeclosedLoan(loan)) {
    return [];
  }

  const schedule =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];

  return schedule.filter(
    (row) =>
      Number(
        row?.remainingAmount ??
          row?.paymentAmount ??
          row?.emiAmount ??
          row?.amount ??
          0
      ) > 0
  );
};

const getNextRemainingDue = (
  loan
) => {
  const schedule =
    getRemainingSchedule(
      loan
    );

  if (!schedule.length) {
    return null;
  }

  return [
    ...schedule,
  ].sort(
    (a, b) => {
      const aDate =
        parseLocalDate(
          a?.dueDate
        );

      const bDate =
        parseLocalDate(
          b?.dueDate
        );

      return (
        (aDate?.getTime() ||
          0) -
        (bDate?.getTime() ||
          0)
      );
    }
  )[0];
};

const getRemainingOverdueCount = (
  loan
) => {
  return getRemainingSchedule(
    loan
  ).filter(
    (row) =>
      isDateOverdue(
        row?.dueDate
      )
  ).length;
};

const getDisplayDueStatus = (
  loan
) => {
  const remaining =
    getRemainingSchedule(
      loan
    );

  if (!remaining.length) {
    return "Completed";
  }

  if (
    remaining.some(
      (row) =>
        isDateOverdue(
          row?.dueDate
        )
    )
  ) {
    return "Overdue";
  }

  return "Due";
};

const isDateOverdue = (
  value
) => {
  const date =
    parseLocalDate(
      value
    );

  if (!date) {
    return false;
  }

  return (
    getDayStart(
      date
    ).getTime() <
    getTodayStart().getTime()
  );
};

/* =========================================================
   PAID TODAY
========================================================= */

const isPaidToday = (
  loan
) => {
  const today =
    getTodayStart();

  const history =
    Array.isArray(
      loan?.paymentHistory
    )
      ? loan.paymentHistory
      : [];

  return history.some(
    (payment) => {
      const date =
        parseLocalDate(
          payment?.date ||
            payment?.paidAt ||
            payment?.paymentDate
        );

      return (
        date &&
        getDayStart(
          date
        ).getTime() ===
          today.getTime()
      );
    }
  );
};

/* =========================================================
   LOAN HELPERS
========================================================= */

const getEmi = (
  loan
) => {
  if (
    loan?.repayment?.method ===
    "Principal"
  ) {
    return (
      loan?.repaymentSchedule?.[0]
        ?.paymentAmount ||
      loan?.calculation
        ?.paymentAmount ||
      loan?.emiAmount ||
      0
    );
  }

  return (
    loan?.calculation
      ?.emiAmount ||
    loan?.emiAmount ||
    0
  );
};

const getTenure = (
  loan
) => {
  const repayment =
    loan?.repayment ||
    {};

  const tenure =
    repayment?.tenure ??
    repayment?.numberOfPayments ??
    loan?.calculation
      ?.numberOfPayments ??
    "";

  const unit =
    repayment?.tenureUnit ||
    loan?.tenureUnit ||
    "months";

  return tenure
    ? `${tenure} ${unit}`
    : "—";
};

const getLoanOutstanding = (
  loan
) => {
  const totalDue =
    Number(
      loan?.calculation
        ?.totalDue ||
        loan?.totalDue ||
        0
    );

  const paid =
    Array.isArray(
      loan?.paymentHistory
    )
      ? loan.paymentHistory.reduce(
          (sum, payment) =>
            sum +
            Number(
              payment?.amount ||
                0
            ),
          0
        )
      : 0;

  return Math.max(
    totalDue - paid,
    0
  );
};

/* =========================================================
   REMAINING COLLECTION HELPERS
========================================================= */

const getApprovedAmountForRow = (
  loan,
  row,
  approvedCollections = []
) => {
  const loanId =
    loan?.id ||
    loan?.loanNumber ||
    "";

  const scheduleId =
    row?.id ||
    "";

  const dueDate =
    getLocalDateKey(
      row?.dueDate
    );

  return approvedCollections
    .filter(
      (collection) => {
        const collectionLoanId =
          collection?.loanId ||
          collection?.loanNumber ||
          "";

        const collectionScheduleId =
          collection?.scheduleId ||
          "";

        const collectionDueDate =
          getLocalDateKey(
            collection?.dueDate
          );

        /*
         * Best matching method.
         */
        if (
          scheduleId &&
          collectionScheduleId
        ) {
          return (
            String(
              collectionScheduleId
            ) ===
            String(
              scheduleId
            )
          );
        }

        /*
         * Fallback.
         */
        return (
          String(
            collectionLoanId
          ) ===
            String(
              loanId
            ) &&
          collectionDueDate ===
            dueDate
        );
      }
    )
    .reduce(
      (
        total,
        collection
      ) =>
        total +
        Number(
          collection?.amount ||
            0
        ),
      0
    );
};

const getRowAmount = (
  row
) => {
  return Number(
    row?.paymentAmount ??
      row?.emiAmount ??
      row?.amount ??
      0
  );
};

/* =========================================================
   DISPLAY PAYMENT HISTORY

   Adds approved collection records to the loan's
   display history without mutating storage.
========================================================= */

const buildDisplayPaymentHistory = (
  loan,
  approvedCollections = []
) => {
  const existingHistory =
    Array.isArray(
      loan?.paymentHistory
    )
      ? loan.paymentHistory
      : [];

  const loanId =
    loan?.id ||
    loan?.loanNumber ||
    "";

  const relatedApproved =
    approvedCollections.filter(
      (collection) => {
        const collectionLoanId =
          collection?.loanId ||
          collection?.loanNumber ||
          "";

        return (
          String(
            collectionLoanId
          ) ===
          String(loanId)
        );
      }
    );

  /*
   * Avoid duplicating collection entries
   * that are already represented in paymentHistory.
   */
  const newEntries =
    relatedApproved
      .filter(
        (collection) => {
          const collectionId =
            collection?.id;

          return !existingHistory.some(
            (payment) =>
              payment?.collectionId ===
              collectionId
          );
        }
      )
      .map(
        (collection) => ({
          id:
            `collection-${collection.id}`,

          collectionId:
            collection.id,

          amount:
            Number(
              collection?.amount ||
                0
            ),

          date:
            collection?.approvedAt ||
            collection?.collectedDate ||
            collection?.collectionDate ||
            collection?.submittedAt ||
            "",

          paidAt:
            collection?.approvedAt ||
            collection?.collectedDate ||
            collection?.collectionDate ||
            collection?.submittedAt ||
            "",

          paymentDate:
            collection?.approvedAt ||
            collection?.collectedDate ||
            collection?.collectionDate ||
            collection?.submittedAt ||
            "",

          paymentMode:
            collection?.paymentMode ||
            "",

          mode:
            collection?.paymentMode ||
            "",

          remarks:
            collection?.remarks ||
            "Approved collection",

          source:
            "collection",
        })
      );

  return [
    ...existingHistory,
    ...newEntries,
  ].sort(
    (a, b) => {
      const aDate =
        parseLocalDate(
          a?.date ||
            a?.paidAt ||
            a?.paymentDate
        );

      const bDate =
        parseLocalDate(
          b?.date ||
            b?.paidAt ||
            b?.paymentDate
        );

      return (
        (bDate?.getTime() ||
          0) -
        (aDate?.getTime() ||
          0)
      );
    }
  );
};

/* =========================================================
   DATE HELPERS
========================================================= */

const getTodayStart = () => {
  const date =
    new Date();

  date.setHours(
    0,
    0,
    0,
    0
  );

  return date;
};

const getDayStart = (
  value
) => {
  const date =
    value instanceof Date
      ? new Date(value)
      : parseLocalDate(
          value
        );

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

const parseLocalDate = (
  value
) => {
  if (!value) {
    return null;
  }

  const raw =
    String(value);

  const match =
    raw.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (match) {
    return new Date(
      Number(
        match[1]
      ),
      Number(
        match[2]
      ) - 1,
      Number(
        match[3]
      )
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

const getLocalDateKey = (
  value
) => {
  const date =
    parseLocalDate(
      value
    );

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

const normalizeStatus = (
  value
) => {
  return String(
    value || ""
  )
    .trim()
    .toLowerCase();
};

const isOpenStatus = (
  value
) => {
  const status =
    normalizeStatus(
      value
    );

  return (
    status ===
      "pending" ||
    status === "due" ||
    status ===
      "overdue" ||
    status ===
      "partially paid" ||
    status ===
      "partially-paid"
  );
};

/* =========================================================
   FORMATTERS
========================================================= */

const formatMoney = (
  value
) => {
  return `₹${Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatNumber = (
  value
) => {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
};

const formatPercent = (
  value
) => {
  return `${Number(
    value || 0
  ).toFixed(0)}%`;
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    parseLocalDate(
      value
    );

  if (!date) {
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

export default LoanManagement;