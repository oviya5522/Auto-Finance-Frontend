// src/components/dashboard/FinancialOverview/FinancialOverview.jsx

import CollectionVsDueCard from "./CollectionVsDueCard";
import CashBankUpiCard from "./CashBankUpiCard";
import PendingActionsCard from "./PendingActionsCard";
import CashPositionCard from "./CashPositionCard";

const FinancialOverview = ({
  collectionVsDue = {},
  cashBankUpi = {},
  cashPosition = 0,
  pendingActions = 0,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      {/* HEADER */}

      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-2.5">
        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#0B5D3B]" />

        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-[#17221D]">
            Financial Overview
          </h2>

          <p className="mt-0.5 text-[9px] text-slate-400">
            Today / selected period
          </p>
        </div>
      </div>

      {/* CARDS */}

     <div className="grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-2 xl:grid-cols-4">
       <CollectionVsDueCard
  collected={
    collectionVsDue?.collected ?? 0
  }
  due={
    collectionVsDue?.due ?? 0
  }
/>

<CashBankUpiCard
  cash={cashBankUpi?.cash ?? 0}
  bank={cashBankUpi?.bank ?? 0}
  upi={cashBankUpi?.upi ?? 0}
/>

<CashPositionCard
  value={cashPosition}
/>

<PendingActionsCard
  count={pendingActions ?? 0}
/>
      </div>
    </section>
  );
};

export default FinancialOverview;