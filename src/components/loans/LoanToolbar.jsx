// src/components/loans/LoanToolbar.jsx

import {
  Search,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";

const LoanToolbar = ({
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
}) => {
  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    setLoanTypeFilter("All Loan Types");
    setDueFilter("All Due Status");
    setDateFilter("");
    setSortBy("recent");
  };

  return (
    <div
      className="
        mt-2
        rounded-xl
        border
        border-slate-200
        bg-white
        p-2.5
        shadow-sm
      "
    >
      <div
        className="
          flex
          flex-col
          gap-2
          xl:flex-row
          xl:items-center
        "
      >
        {/* SEARCH */}

        <div className="relative min-w-0 flex-1">
          <Search
            size={15}
            strokeWidth={2}
            className="
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search customer, loan number, ID or vehicle..."
            className="
              h-9
              w-full
              rounded-lg
              border
              border-slate-200
              bg-white
              pl-9
              pr-3
              text-[10px]
              text-[#17221D]
              outline-none
              transition
              duration-150
              placeholder:text-slate-400
              focus:border-[#0B5D3B]
              focus:ring-2
              focus:ring-[#0B5D3B]/10
            "
          />
        </div>

        {/* FILTERS */}

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              "All Status",
              "Active",
              "Pending",
              "Overdue",
              "Closed",
              "Seized",
              "Written Off",
            ]}
          />

          <FilterSelect
            value={loanTypeFilter}
            onChange={setLoanTypeFilter}
            options={[
              "All Loan Types",
              "Flat",
              "Reducing",
            ]}
          />

          <FilterSelect
            value={dueFilter}
            onChange={setDueFilter}
            options={[
              "All Due Status",
              "Due",
              "Overdue",
              "Completed",
            ]}
          />

          {/* DATE */}

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
              bg-white
              px-2.5
              text-[10px]
              text-slate-600
              outline-none
              transition
              duration-150
              focus:border-[#0B5D3B]
              focus:ring-2
              focus:ring-[#0B5D3B]/10
            "
            aria-label="Filter by due date"
          />

          {/* SORT */}

          <FilterSelect
            value={sortBy}
            onChange={setSortBy}
            options={[
              "Sort: Recent",
              "Sort: Due Soon",
              "Sort: Amount High",
              "Sort: Outstanding High",
              "Sort: Customer",
            ]}
            values={[
              "recent",
              "dueSoon",
              "amountHigh",
              "outstandingHigh",
              "customer",
            ]}
          />

          {/* RESET */}

          <button
            type="button"
            onClick={resetFilters}
            className="
              inline-flex
              h-9
              shrink-0
              items-center
              justify-center
              gap-1.5
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-[10px]
              font-semibold
              text-slate-500
              transition
              duration-150
              hover:border-slate-300
              hover:bg-slate-50
              hover:text-[#17221D]
            "
          >
            <RotateCcw
              size={12}
              strokeWidth={2}
            />

            Reset
          </button>
        </div>
      </div>

      {/* FILTER STATUS */}

      
    </div>
  );
};

/* =========================================================
   FILTER SELECT
========================================================= */

const FilterSelect = ({
  value,
  onChange,
  options = [],
  values,
}) => {
  const hasCustomValues =
    Array.isArray(values);

  return (
    <select
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="
        h-9
        min-w-[120px]
        rounded-lg
        border
        border-slate-200
        bg-white
        px-2.5
        text-[10px]
        font-medium
        text-slate-600
        outline-none
        transition
        duration-150
        focus:border-[#0B5D3B]
        focus:ring-2
        focus:ring-[#0B5D3B]/10
      "
    >
      {options.map(
        (option, index) => (
          <option
            key={option}
            value={
              hasCustomValues
                ? values[index]
                : option
            }
          >
            {option}
          </option>
        )
      )}
    </select>
  );
};

export default LoanToolbar;