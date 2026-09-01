// src/pages/loan/Loan.jsx

import {
  useEffect,
  useState,
} from "react";

import {
  Download,
  Plus,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import LoanToolbar from "../../components/loans/LoanToolbar";
import LoanKpiCards from "../../components/loans/LoanKpiCards";
import LoanTable from "../../components/loans/LoanTable";
import LoanDetailsDrawer from "../../components/loans/LoanDetailsDrawer";
import LoanSummaryOverview from "../../components/loans/LoanSummaryOverview";

import useLoans from "../../hooks/loans/useLoans";
import useLoanFilters from "../../hooks/loans/seLoanFilters";

const LoanPage = () => {
  const navigate = useNavigate();

  /* =====================================================
     LOAN DATA
  ====================================================== */

  const {
    loans,
    loading,
    reloadLoans,
  } = useLoans();

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
  } = useLoanFilters(loans);

  /* =====================================================
     UI STATE
  ====================================================== */

  const [
    selectedLoan,
    setSelectedLoan,
  ] = useState(null);

  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);

  /* =====================================================
     PAGINATION
     
     7 LOANS PER PAGE
  ====================================================== */

  const loansPerPage = 7;

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredLoans.length /
        loansPerPage
    )
  );

  /* =====================================================
     RESET PAGINATION WHEN FILTERS CHANGE
  ====================================================== */

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    statusFilter,
    loanTypeFilter,
    dueFilter,
    dateFilter,
    sortBy,
  ]);

  /* =====================================================
     KEEP PAGE VALID
  ====================================================== */

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

  /* =====================================================
     PAGINATED LOANS
  ====================================================== */

  const startIndex =
    filteredLoans.length === 0
      ? 0
      : (currentPage - 1) *
        loansPerPage;

  const endIndex = Math.min(
    startIndex + loansPerPage,
    filteredLoans.length
  );

  const paginatedLoans =
    filteredLoans.slice(
      startIndex,
      endIndex
    );

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-full
          items-center
          justify-center
          bg-[#F7F9F8]
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-[#EAF5EF]
            "
          >
            <div
              className="
                h-5
                w-5
                animate-spin
                rounded-full
                border-2
                border-slate-200
                border-t-[#0B5D3B]
              "
            />
          </div>

          <p className="mt-2 text-[12px] font-medium text-slate-500">
            Loading loans...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN
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
          PAGE HEADER
      ================================================== */}

      <header className="mb-4">
        <div
          className="
            flex
            flex-col
            gap-3
            lg:flex-row
            lg:items-end
            lg:justify-between
          "
        >
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1
                className="
                  truncate
                  text-[22px]
                  font-semibold
                  tracking-tight
                  text-[#17221D]
                  sm:text-[24px]
                "
              >
                Loans
              </h1>

              <span
                className="
                  shrink-0
                  rounded-full
                  bg-[#EAF5EF]
                  px-2
                  py-1
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-wide
                  text-[#0B5D3B]
                "
              >
                Portfolio
              </span>
            </div>

            <p className="mt-1 text-[11px] text-slate-500 sm:text-[12px]">
              View and manage all loan accounts and repayment details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* EXPORT */}

            <button
              type="button"
              onClick={() => {
                // Export intentionally not implemented yet.
              }}
              className="
                inline-flex
                h-9
                items-center
                gap-1.5
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                text-[10px]
                font-semibold
                text-slate-600
                transition
                duration-200
                hover:border-slate-300
                hover:bg-slate-50
              "
            >
              <Download
                size={14}
                strokeWidth={2}
              />

              Export
            </button>

            {/* NEW LOAN */}

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/customers/onboarding"
                )
              }
              className="
                inline-flex
                h-9
                items-center
                gap-1.5
                rounded-lg
                bg-[#0B5D3B]
                px-3.5
                text-[10px]
                font-semibold
                text-white
                shadow-sm
                transition
                duration-200
                hover:bg-[#084A30]
              "
            >
              <Plus
                size={14}
                strokeWidth={2.3}
              />

              New Loan
            </button>
          </div>
        </div>
      </header>

      {/* =================================================
          KPI CARDS
      ================================================== */}

      <LoanKpiCards
        loans={loans}
      />

      {/* =================================================
          FILTER TOOLBAR
      ================================================== */}

      <div className="mt-3">
        {/* MOBILE FILTER BUTTON */}

        <div className="mb-2 flex justify-end lg:hidden">
          <button
            type="button"
            onClick={() =>
              setFiltersOpen(
                (previous) =>
                  !previous
              )
            }
            className="
              inline-flex
              h-8
              items-center
              gap-1.5
              rounded-lg
              border
              border-slate-200
              bg-white
              px-2.5
              text-[9px]
              font-semibold
              text-slate-600
              transition
              hover:border-[#A8D0BD]
              hover:bg-[#F6FBF8]
              hover:text-[#0B5D3B]
            "
          >
            <SlidersHorizontal
              size={13}
              strokeWidth={2}
            />

            {filtersOpen
              ? "Hide Filters"
              : "Filters"}
          </button>
        </div>

        {/* DESKTOP */}

        <div className="hidden lg:block">
          <LoanToolbar
            search={search}
            setSearch={setSearch}
            statusFilter={
              statusFilter
            }
            setStatusFilter={
              setStatusFilter
            }
            loanTypeFilter={
              loanTypeFilter
            }
            setLoanTypeFilter={
              setLoanTypeFilter
            }
            dueFilter={dueFilter}
            setDueFilter={
              setDueFilter
            }
            dateFilter={
              dateFilter
            }
            setDateFilter={
              setDateFilter
            }
            sortBy={sortBy}
            setSortBy={setSortBy}
          />
        </div>

        {/* MOBILE / TABLET */}

        {filtersOpen && (
          <div className="lg:hidden">
            <LoanToolbar
              search={search}
              setSearch={setSearch}
              statusFilter={
                statusFilter
              }
              setStatusFilter={
                setStatusFilter
              }
              loanTypeFilter={
                loanTypeFilter
              }
              setLoanTypeFilter={
                setLoanTypeFilter
              }
              dueFilter={
                dueFilter
              }
              setDueFilter={
                setDueFilter
              }
              dateFilter={
                dateFilter
              }
              setDateFilter={
                setDateFilter
              }
              sortBy={sortBy}
              setSortBy={
                setSortBy
              }
            />
          </div>
        )}
      </div>

      {/* =================================================
          TABLE COUNT
      ================================================== */}

      <div className="mt-3 flex items-center justify-between px-1">
        <p className="text-[10px] text-slate-400">
          Showing{" "}
          <span className="font-semibold text-slate-600">
            {filteredLoans.length ===
            0
              ? 0
              : startIndex + 1}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-600">
            {endIndex}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-600">
            {filteredLoans.length}
          </span>{" "}
          loans
        </p>
      </div>

      {/* =================================================
          LOAN TABLE
      ================================================== */}

      <LoanTable
        loans={paginatedLoans}
        onViewLoan={
          setSelectedLoan
        }
      />

      {/* =================================================
          PAGINATION
      ================================================== */}

      {filteredLoans.length >
        0 && (
        <LoanPagination
          currentPage={
            currentPage
          }
          totalPages={
            totalPages
          }
          totalItems={
            filteredLoans.length
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
      )}

      {/* =================================================
          LOAN SUMMARY
      ================================================== */}

      <LoanSummaryOverview
        loans={loans}
      />

      {/* =================================================
          LOAN DETAILS DRAWER
      ================================================== */}

      {selectedLoan && (
        <LoanDetailsDrawer
          loan={
            selectedLoan
          }
          onClose={() =>
            setSelectedLoan(
              null
            )
          }
          onDataChanged={() => {
            reloadLoans();
          }}
        />
      )}
    </div>
  );
};

/* =========================================================
   LOAN PAGINATION
========================================================= */

const LoanPagination = ({
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
    (_, index) =>
      index + 1
  );

  return (
    <div
      className="
        mt-3
        flex
        flex-col
        gap-2
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        py-2.5
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      {/* COUNT */}

      <p className="text-[9px] text-slate-400">
        Showing{" "}
        <span className="font-semibold text-slate-600">
          {startIndex + 1}
        </span>{" "}
        to{" "}
        <span className="font-semibold text-slate-600">
          {endIndex}
        </span>{" "}
        of{" "}
        <span className="font-semibold text-slate-600">
          {totalItems}
        </span>{" "}
        loans
      </p>

      {/* CONTROLS */}

      <div className="flex items-center gap-1">
        {/* PREVIOUS */}

        <button
          type="button"
          onClick={
            onPrevious
          }
          disabled={
            currentPage === 1
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
          <ChevronLeft
            size={13}
            strokeWidth={2}
          />
        </button>

        {/* PAGE NUMBERS */}

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
                transition
                ${
                  page ===
                  currentPage
                    ? "bg-[#0B5D3B] text-white"
                    : "border border-slate-200 text-slate-500 hover:border-[#A8D0BD] hover:bg-[#F6FBF8] hover:text-[#0B5D3B]"
                }
              `}
            >
              {page}
            </button>
          )
        )}

        {/* NEXT */}

        <button
          type="button"
          onClick={
            onNext
          }
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
          <ChevronRight
            size={13}
            strokeWidth={2}
          />
        </button>
      </div>
    </div>
  );
};

export default LoanPage;