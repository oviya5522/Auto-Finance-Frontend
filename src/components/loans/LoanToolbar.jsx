import {
  Search,
  RotateCcw,
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
    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-2.5">

      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">

        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search customer, loan number, customer ID, vehicle..."
            className="h-9 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-[11px] outline-none focus:border-[#0B5D3B]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
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
          onChange={(e) =>
            setLoanTypeFilter(
              e.target.value
            )
          }
          className="h-9 rounded-lg border border-slate-200 px-2.5 text-[10px]"
        >
          <option>All Loan Types</option>
          <option>Flat</option>
          <option>Reducing</option>
        </select>

        <select
          value={dueFilter}
          onChange={(e) =>
            setDueFilter(e.target.value)
          }
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
          onChange={(e) =>
            setDateFilter(e.target.value)
          }
          className="h-9 rounded-lg border border-slate-200 px-2.5 text-[10px]"
        />

        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          className="h-9 rounded-lg border border-slate-200 px-2.5 text-[10px]"
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
          onClick={resetFilters}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 text-[10px] text-slate-500 hover:text-slate-700"
        >
          <RotateCcw size={12} />
          Reset
        </button>

      </div>
    </div>
  );
};

export default LoanToolbar;