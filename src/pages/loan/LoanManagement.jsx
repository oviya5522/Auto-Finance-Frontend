// src/pages/loan/LoanManagement.jsx

// src/pages/loan/LoanManagement.jsx

import { useEffect, useState } from "react";

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

const LoanManagement = () => {
  const { emiDueCount, emiDueAmount, overdueLoanCount, overdueAmount, loans } =
    useDashboardData();

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
  } = useLoanFilters(loans);
  const handleResetFilters = () => {
  setSearch("");
  setStatusFilter("All Status");
  setLoanTypeFilter("All Loan Types");
  setDueFilter("All Due Status");
  setDateFilter("");
  setSortBy("recent");
};

  const upcomingDue = calculateUpcomingDue(loans);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [calendarLoan, setCalendarLoan] = useState(null);

  const [scheduleLoan, setScheduleLoan] = useState(null);
  const cards = [
    {
      icon: IndianRupee,
      label: "Today's Collection",
      value: "—",
      note: "Collection data not implemented",
      tone: "green",
    },
    {
      icon: CalendarClock,
      label: "Today's Due",
      value: formatMoney(emiDueAmount),
      note: `${emiDueCount.toLocaleString("en-IN")} EMI due`,
      tone: "neutral",
    },
    {
      icon: AlertTriangle,
      label: "Overdue Amount",
      value: formatMoney(overdueAmount),
      note: `${overdueLoanCount.toLocaleString("en-IN")} overdue`,
      tone: "danger",
    },
    {
      icon: TrendingUp,
      label: "Upcoming Due (7 Days)",
      value: formatMoney(upcomingDue.amount),
      note: `${upcomingDue.count.toLocaleString("en-IN")} upcoming`,
      tone: "neutral",
    },
    {
      icon: CheckCircle2,
      label: "Collection Efficiency",
      value: "—",
      note: "Not implemented",
      tone: "green",
    },
  ];

  const tabs = [
    {
      key: "all",
      label: "All Loans",
      loans: filteredLoans,
    },
    {
      key: "today",
      label: "Today's Due",
      loans: filteredLoans.filter((loan) => isDueToday(loan)),
    },
    {
      key: "overdue",
      label: "Overdue",
      loans: filteredLoans.filter(
        (loan) => getLoanDueStatus(loan) === "Overdue",
      ),
    },
    {
      key: "upcoming",
      label: "Upcoming Due",
      loans: filteredLoans.filter((loan) => isUpcomingDue(loan)),
    },
    {
      key: "paid",
      label: "Paid Today",
      loans: filteredLoans.filter((loan) => isPaidToday(loan)),
    },
  ];

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
          PAGE HEADER
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

        <p className="mt-1 text-[12px] text-slate-500 sm:text-[12px]">
          Manage EMI collections, track dues and monitor loan status.
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
          <ManagementKpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* =================================================
          FILTERS
      ================================================== */}

      <div className="mt-3 rounded-xl border border-slate-200 bg-white p-2.5">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-[10px]"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Overdue</option>
            <option>Closed</option>
            <option>Seized</option>
            <option>Written Off</option>
          </select>

          <select
            value={loanTypeFilter}
            onChange={(event) => setLoanTypeFilter(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-[10px]"
          >
            <option>All Loan Types</option>
            <option>Flat</option>
            <option>Reducing</option>
          </select>

          <select
            value={dueFilter}
            onChange={(event) => setDueFilter(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-[10px]"
          >
            <option>All Due Status</option>
            <option>Due</option>
            <option>Overdue</option>
            <option>Completed</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-[10px]"
          />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2.5 text-[10px]"
          >
            <option value="recent">Sort: Recent</option>
            <option value="dueSoon">Sort: Due Soon</option>
            <option value="amountHigh">Sort: Amount High</option>
            <option value="outstandingHigh">Sort: Outstanding High</option>
            <option value="customer">Sort: Customer</option>
          </select>

          <button
  type="button"
  onClick={handleResetFilters}
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
  onSelectLoan={setSelectedLoan}
  onCalendar={setCalendarLoan}
  onSchedule={setScheduleLoan}
/>

{calendarLoan && (
  <LoanRepaymentCalendar
    loan={calendarLoan}
    onClose={() =>
      setCalendarLoan(null)
    }
  />
)}

{scheduleLoan && (
  <LoanRepaymentScheduleModal
    loan={scheduleLoan}
    onClose={() =>
      setScheduleLoan(null)
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
      iconText: "text-[#0B5D3B]",
      valueText: "text-[#0B5D3B]",
    },
    neutral: {
      iconBg: "bg-slate-50",
      iconText: "text-slate-600",
      valueText: "text-[#17221D]",
    },
    danger: {
      iconBg: "bg-red-50",
      iconText: "text-red-700",
      valueText: "text-red-700",
    },
  };

  const current = styles[tone] || styles.neutral;

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
          <p className="truncate text-[9px] font-medium uppercase tracking-[0.05em] text-slate-400">
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

          <p className="mt-1.5 truncate text-[9px] text-slate-400">{note}</p>
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
          <Icon size={17} strokeWidth={2} className={current.iconText} />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   TABS
========================================================= */

/* =========================================================
   TABS + TABLE
========================================================= */

const LoanManagementTabs = ({
  tabs,
  selectedLoan,
  onSelectLoan,
  onCalendar,
  onSchedule,
}) => {
  const [activeTab, setActiveTab] = useState("all");

  const activeTabData = tabs.find((tab) => tab.key === activeTab) || tabs[0];

  return (
    <>
      {/* =================================================
          TABS
      ================================================== */}

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
            onClick={() => setActiveTab(tab.key)}
            className={`
              relative
              shrink-0
              whitespace-nowrap
              pb-2.5
              text-[10px]
              font-semibold
              transition
              ${
                activeTab === tab.key
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
                  activeTab === tab.key
                    ? "bg-[#EAF5EF] text-[#0B5D3B]"
                    : "bg-slate-100 text-slate-500"
                }
              `}
            >
              {tab.loans.length}
            </span>

            {activeTab === tab.key && (
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
      <div className="mt-3 flex flex-col gap-3 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1">
          <LoanManagementTable
            loans={activeTabData.loans}
            selectedLoan={selectedLoan}
            onSelectLoan={onSelectLoan}
            onCalendar={onCalendar}
            onSchedule={onSchedule}
          />
        </div>

        {selectedLoan && (
          <LoanManagementDetails
            loan={selectedLoan}
            onClose={() => onSelectLoan(null)}
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
  const [currentPage, setCurrentPage] = useState(1);

  const rowsPerPage = 5;

  const totalPages = Math.max(1, Math.ceil(loans.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [loans]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startIndex = loans.length === 0 ? 0 : (currentPage - 1) * rowsPerPage;

  const endIndex = Math.min(startIndex + rowsPerPage, loans.length);

  const paginatedLoans = loans.slice(startIndex, endIndex);

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
          Loans matching this view will appear here.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* =================================================
          TABLE
      ================================================== */}

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
                
                <TableHeader>Loan / Customer</TableHeader>

                <TableHeader>Due Date</TableHeader>

                <TableHeader>EMI Details</TableHeader>

                <TableHeader align="right">Outstanding</TableHeader>

                <TableHeader align="right">Due Amount</TableHeader>

                <TableHeader>Status</TableHeader>

                <TableHeader align="center">Actions</TableHeader>
              </tr>
            </thead>

            <tbody>
              {paginatedLoans.map((loan) => (
                <LoanManagementRow
                  key={loan?.id || loan?.loanNumber}
                  loan={loan}
                  selected={selectedLoan?.id === loan?.id}
                  onClick={() => onSelectLoan(loan)}
                  onCalendar={onCalendar}
                  onSchedule={onSchedule}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* =================================================
            PAGINATION
        ================================================== */}

        <LoanManagementPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={loans.length}
          startIndex={startIndex}
          endIndex={endIndex}
          onPrevious={() => setCurrentPage((page) => Math.max(page - 1, 1))}
          onNext={() =>
            setCurrentPage((page) => Math.min(page + 1, totalPages))
          }
          onPageChange={setCurrentPage}
        />
      </div>
    </>
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
    loan?.customerName || loan?.customer?.personal?.name || "Unnamed Customer";

  const customerNumber = loan?.customerNumber || loan?.customerId || "—";

  const vehicleName =
    [loan?.vehicle?.brand, loan?.vehicle?.model, loan?.vehicle?.variant]
      .filter(Boolean)
      .join(" ") || "Vehicle not assigned";

  const nextDue = getNextDue(loan);

  const emi = getEmi(loan);

  const outstanding = getLoanOutstanding(loan);

  const dueAmount = Number(
    nextDue?.paymentAmount || nextDue?.emiAmount || nextDue?.amount || emi || 0,
  );

  const overdueCount = getOverdueCount(loan);

  const dueStatus = getLoanDueStatus(loan);

  return (
    <tr
      onClick={onClick}
      className={`
    cursor-pointer
    border-b
    border-slate-100
    transition-colors
    hover:bg-[#FAFCFB]
    ${selected ? "bg-[#F1F7F3]" : ""}
  `}
    >

      {/* LOAN / CUSTOMER */}

      <td className="px-2.5 py-2.5">
        <p className="text-[12px] font-semibold text-[#0B5D3B]">
          {loan?.loanNumber || "—"}
        </p>

        <p className="mt-0.5 text-[12px] font-semibold text-[#17221D]">
          {customerName}
        </p>

        <p className="mt-0.5 max-w-[170px] truncate text-[9px] text-slate-400">
          {vehicleName}
        </p>
      </td>

      {/* DUE DATE */}

      <td className="px-3.5 py-3">
        <div
          className={`
            text-[10px]
            font-semibold
            ${dueStatus === "Overdue" ? "text-red-600" : "text-[#17221D]"}
          `}
        >
          {formatDate(nextDue?.dueDate)}
        </div>

        <p
          className={`
            mt-0.5
            text-[9px]
            font-medium
            ${dueStatus === "Overdue" ? "text-red-400" : "text-slate-400"}
          `}
        >
          {getDueMessage(nextDue?.dueDate, dueStatus)}
        </p>
      </td>

      {/* EMI DETAILS */}

      <td className="px-3.5 py-3">
        <p className="text-[12px] font-semibold text-[#17221D]">
          EMI: ₹{formatNumber(emi)}
        </p>

        <p className="mt-0.5 text-[9px] text-slate-400">
          Tenure: {getTenure(loan)}
        </p>
      </td>

      {/* OUTSTANDING */}

      <td className="px-3.5 py-3 text-right">
        <span className="text-[12px] font-semibold text-[#17221D]">
          ₹{formatNumber(outstanding)}
        </span>
      </td>

      {/* DUE AMOUNT */}

      <td className="px-3.5 py-3 text-right">
        <span
          className={`
            text-[12px]
            font-semibold
            ${
              dueStatus === "Overdue"
                ? "text-red-600"
                : dueStatus === "Due"
                  ? "text-amber-600"
                  : "text-[#0B5D3B]"
            }
          `}
        >
          ₹{formatNumber(dueAmount)}
        </span>
      </td>

      {/* STATUS */}

      <td className="px-3.5 py-3">
        <ManagementStatus
          loan={loan}
          dueStatus={dueStatus}
          overdueCount={overdueCount}
        />
      </td>

      {/* ACTIONS */}
      <td className="px-3.5 py-3">
        <div className="flex items-center justify-center gap-1.5">
          {/* VIEW */}
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

          {/* CALENDAR */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onCalendar?.(loan);
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
            <CalendarDays size={14} />
          </button>

          {/* REPAYMENT SCHEDULE */}
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSchedule?.(loan);
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
            <FileText size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
};

/* =========================================================
   STATUS
========================================================= */

const ManagementStatus = ({ loan, dueStatus, overdueCount }) => {
  const rawStatus = String(loan?.status || "")
    .trim()
    .toLowerCase();

  let label = "Active";
  let classes = "bg-[#EAF5EF] text-[#0B5D3B]";

  /* OVERDUE */
  if (dueStatus === "Overdue" || rawStatus === "overdue" || overdueCount > 0) {
    label = "Overdue";
    classes = "bg-red-50 text-red-700";
  } else if (rawStatus === "closed" || rawStatus === "paid") {

  /* CLOSED / PAID */
    label = "Paid";
    classes = "bg-emerald-50 text-emerald-700";
  } else if (dueStatus === "Due" || rawStatus === "pending") {

  /* PENDING / DUE */
    const nextDue = getNextDue(loan);

    const dueDate = nextDue?.dueDate ? new Date(nextDue.dueDate) : null;

    if (dueDate && !Number.isNaN(dueDate.getTime())) {
      const now = new Date();

      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const dueStart = new Date(
        dueDate.getFullYear(),
        dueDate.getMonth(),
        dueDate.getDate(),
      );

      const diffDays = Math.ceil(
        (dueStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays === 0) {
        label = "Due Today";
        classes = "bg-amber-50 text-amber-700";
      } else if (diffDays === 1) {
        label = "Due Tomorrow";
        classes = "bg-amber-50 text-amber-700";
      } else if (diffDays > 1) {
        label = `Due in ${diffDays} days`;
        classes = "bg-sky-50 text-sky-700";
      } else {
        label = "Due";
        classes = "bg-amber-50 text-amber-700";
      }
    } else {
      label = "Due";
      classes = "bg-amber-50 text-amber-700";
    }
  } else {

  /* ACTIVE */
    label = "Active";
    classes = "bg-[#EAF5EF] text-[#0B5D3B]";
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
  const pages = Array.from(
    {
      length: totalPages,
    },
    (_, index) => index + 1,
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
      {/* COUNT */}

      <p className="text-[9px] text-slate-400">
        Showing{" "}
        <span className="font-semibold text-slate-600">{startIndex + 1}</span>{" "}
        to <span className="font-semibold text-slate-600">{endIndex}</span> of{" "}
        <span className="font-semibold text-slate-600">{totalItems}</span>{" "}
        entries
      </p>

      {/* CONTROLS */}

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrevious}
          disabled={currentPage === 1}
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
        >
          ‹
        </button>

        {pages.map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
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
                  currentPage === page
                    ? "bg-[#0B5D3B] text-white"
                    : "border border-slate-200 text-slate-500 hover:border-[#A8D0BD] hover:bg-[#F6FBF8] hover:text-[#0B5D3B]"
                }
              `}
          >
            {page}
          </button>
        ))}

        <button
          type="button"
          onClick={onNext}
          disabled={currentPage === totalPages}
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
        >
          ›
        </button>
      </div>
    </div>
  );
};

const getDueMessage = (dueDate, dueStatus) => {
  if (!dueDate) {
    return "No due date";
  }

  if (dueStatus === "Overdue") {
    const due = new Date(dueDate);

    const now = new Date();

    const days = Math.max(
      0,
      Math.floor((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24)),
    );

    return `Overdue by ${days} day${days === 1 ? "" : "s"}`;
  }

  const due = new Date(dueDate);

  const now = new Date();

  const days = Math.max(
    0,
    Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  if (days === 0) {
    return "Due Today";
  }

  if (days === 1) {
    return "Due Tomorrow";
  }

  return `Due in ${days} days`;
};
/* =========================================================
   TABLE HEADER
========================================================= */

const TableHeader = ({ children, align = "left" }) => {
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
          align === "right"
            ? "text-right"
            : align === "center"
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
   STATUS
========================================================= */

const LoanStatus = ({ loan }) => {
  const status = String(loan?.status || "Pending");

  const dueStatus = getLoanDueStatus(loan);

  const normalized = status.toLowerCase();

  let classes = "bg-slate-100 text-slate-500";

  if (normalized === "active") {
    classes = "bg-[#EAF5EF] text-[#0B5D3B]";
  } else if (normalized === "closed") {
    classes = "bg-slate-100 text-slate-600";
  } else if (normalized === "overdue" || dueStatus === "Overdue") {
    classes = "bg-red-50 text-red-600";
  } else if (normalized === "pending") {
    classes = "bg-amber-50 text-amber-700";
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
      {status}
    </span>
  );
};

/* =========================================================
   UPCOMING DUE
========================================================= */

const calculateUpcomingDue = (loans = []) => {
  const now = new Date();

  const end = new Date(now);

  end.setDate(end.getDate() + 7);

  let count = 0;
  let amount = 0;

  loans.forEach((loan) => {
    const schedule = Array.isArray(loan?.repaymentSchedule)
      ? loan.repaymentSchedule
      : [];

    schedule.forEach((row) => {
      if (String(row?.status || "").toLowerCase() !== "pending") {
        return;
      }

      const dueDate = new Date(row?.dueDate || 0);

      if (Number.isNaN(dueDate.getTime())) {
        return;
      }

      if (dueDate >= now && dueDate <= end) {
        count += 1;

        amount += Number(
          row?.paymentAmount || row?.emiAmount || row?.amount || 0,
        );
      }
    });
  });

  return {
    count,
    amount,
  };
};

const isDueToday = (loan) => {
  const today = new Date();

  const schedule = Array.isArray(loan?.repaymentSchedule)
    ? loan.repaymentSchedule
    : [];

  return schedule.some((row) => {
    if (String(row?.status || "").toLowerCase() !== "pending") {
      return false;
    }

    const date = new Date(row?.dueDate || 0);

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  });
};

const isUpcomingDue = (loan) => {
  const now = new Date();

  const end = new Date(now);

  end.setDate(end.getDate() + 7);

  const schedule = Array.isArray(loan?.repaymentSchedule)
    ? loan.repaymentSchedule
    : [];

  return schedule.some((row) => {
    if (String(row?.status || "").toLowerCase() !== "pending") {
      return false;
    }

    const date = new Date(row?.dueDate || 0);

    return !Number.isNaN(date.getTime()) && date >= now && date <= end;
  });
};

const isPaidToday = (loan) => {
  const today = new Date();

  const history = Array.isArray(loan?.paymentHistory)
    ? loan.paymentHistory
    : [];

  return history.some((payment) => {
    const date = new Date(
      payment?.date || payment?.paidAt || payment?.paymentDate || 0,
    );

    return (
      !Number.isNaN(date.getTime()) &&
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  });
};

/* =========================================================
   LOAN HELPERS
========================================================= */

const getLoanDueStatus = (loan) => {
  const schedule = Array.isArray(loan?.repaymentSchedule)
    ? loan.repaymentSchedule
    : [];

  if (
    schedule.some(
      (row) => String(row?.status || "").toLowerCase() === "overdue",
    )
  ) {
    return "Overdue";
  }

  if (
    schedule.some((row) =>
      ["pending", "partially paid"].includes(
        String(row?.status || "").toLowerCase(),
      ),
    )
  ) {
    return "Due";
  }

  return "Completed";
};

const getNextDue = (loan) => {
  const schedule = Array.isArray(loan?.repaymentSchedule)
    ? loan.repaymentSchedule
    : [];

  return (
    schedule.find((row) =>
      ["pending", "overdue", "partially paid"].includes(
        String(row?.status || "").toLowerCase(),
      ),
    ) || null
  );
};

const getOverdueCount = (loan) => {
  const schedule = Array.isArray(loan?.repaymentSchedule)
    ? loan.repaymentSchedule
    : [];

  return schedule.filter(
    (row) => String(row?.status || "").toLowerCase() === "overdue",
  ).length;
};

const getLoanType = (loan) => {
  return loan?.interest?.type || loan?.interestType || "Flat";
};

const getEmi = (loan) => {
  if (loan?.repayment?.method === "Principal") {
    return (
      loan?.repaymentSchedule?.[0]?.paymentAmount ||
      loan?.calculation?.paymentAmount ||
      0
    );
  }

  return loan?.calculation?.emiAmount || loan?.emiAmount || 0;
};

const getTenure = (loan) => {
  const repayment = loan?.repayment || {};

  const tenure =
    repayment?.tenure ??
    repayment?.numberOfPayments ??
    loan?.calculation?.numberOfPayments ??
    "";

  const unit = repayment?.tenureUnit || loan?.tenureUnit || "months";

  return tenure ? `${tenure} ${unit}` : "—";
};

const getLoanOutstanding = (loan) => {
  const totalDue = Number(loan?.calculation?.totalDue || loan?.totalDue || 0);

  const paid = Array.isArray(loan?.paymentHistory)
    ? loan.paymentHistory.reduce(
        (sum, payment) => sum + Number(payment?.amount || 0),
        0,
      )
    : 0;

  return Math.max(totalDue - paid, 0);
};

/* =========================================================
   FORMATTERS
========================================================= */

const formatMoney = (value) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
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

export default LoanManagement;
