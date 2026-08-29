import { useState } from "react";

import {
  Download,
  IndianRupee,
  Plus,
} from "lucide-react";

import LoanToolbar from "../../components/loans/LoanToolbar";
import LoanKpiCards from "../../components/loans/LoanKpiCards";
import LoanTable from "../../components/loans/LoanTable";
import LoanDetailsDrawer from "../../components/loans/LoanDetailsDrawer";

import useLoans from "../../hooks/loans/useLoans";
import useLoanFilters from "../../hooks/loans/seLoanFilters";

const LoanPage = () => {
  const {
    loans,
    loading,
    reloadLoans,
  } = useLoans();

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

  const [selectedLoan, setSelectedLoan] = useState(null);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F7F9F8]">
        <p className="text-sm text-slate-500">
          Loading loans...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F7F9F8] px-4 py-4 sm:px-5 lg:px-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">

        <div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[#17221D] sm:text-[24px]">
            Loan Management
          </h1>

          <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
            Manage customer loans, repayment schedules,
            outstanding amounts and loan status.
          </p>
        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-600"
            onClick={() => {
              // export handler can be moved to useLoans later
            }}
          >
            <Download size={14} />
            Export
          </button>

          <button
            type="button"
            onClick={() => {
              // connect to existing onboarding route
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0B5D3B] px-3.5 text-[11px] font-semibold text-white hover:bg-[#084A30]"
          >
            <Plus size={14} />
            New Loan
          </button>

        </div>
      </div>

      <LoanKpiCards loans={loans} />

      <LoanToolbar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        loanTypeFilter={loanTypeFilter}
        setLoanTypeFilter={setLoanTypeFilter}
        dueFilter={dueFilter}
        setDueFilter={setDueFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <LoanTable
        loans={filteredLoans}
        onViewLoan={setSelectedLoan}
      />

      {selectedLoan && (
        <LoanDetailsDrawer
          loan={selectedLoan}
          onClose={() => setSelectedLoan(null)}
          onDataChanged={() => {
            reloadLoans();
          }}
        />
      )}

    </div>
  );
};

export default LoanPage;