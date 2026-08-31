// src/components/dashboard/KeyActivity/KeyActivity.jsx

import NewLoansCard from "./NewLoansCard";
import EmiDueCard from "./EmiDueCard";
import OverduePendingCard from "./OverduePendingCard";
import PtpDueCard from "./PtpDueCard";
import ClosedSettledCard from "./ClosedSettledCard";
import ExpensesCard from "./ExpensesCard";

const KeyActivity = ({
  newLoansToday = 0,

  emiDueCount = 0,
  emiDueAmount = 0,

  overdueCount = 0,
  overdueAmount = 0,
  pendingCount = 0,

  ptpDueCount = 0,
  ptpDueAmount = 0,

  closedLoans = 0,
  closedAmount = 0,

  expenses = 0,
}) => {
  return (
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          items-center
          gap-2
          border-b
          border-slate-100
          px-4
          py-2.5
        "
      >
        <span
          className="
            h-2.5
            w-2.5
            shrink-0
            rounded-full
            bg-[#0B5D3B]
          "
        />

        <div className="min-w-0">
          <h2
            className="
              text-[13px]
              font-semibold
              text-[#17221D]
            "
          >
            Key Activity
          </h2>

          <p
            className="
              mt-0.5
              text-[9px]
              text-slate-400
            "
          >
            Today / selected period
          </p>
        </div>
      </div>

      {/* KPI ROW */}

      <div
        className="
          grid
          grid-cols-1
          gap-2
          p-2.5
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-6
        "
      >
        <NewLoansCard
          count={newLoansToday}
        />

        <EmiDueCard
          count={emiDueCount}
          amount={emiDueAmount}
        />

        <OverduePendingCard
          overdueCount={overdueCount}
          pendingCount={pendingCount}
          amount={overdueAmount}
        />

        <PtpDueCard
          count={ptpDueCount}
          amount={ptpDueAmount}
        />

        <ClosedSettledCard
          count={closedLoans}
          amount={closedAmount}
        />

        <ExpensesCard
          amount={expenses}
        />
      </div>
    </section>
  );
};

export default KeyActivity;