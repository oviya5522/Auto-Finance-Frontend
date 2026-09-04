// src/components/dashboard/FinancialOverview/FinancialOverview.jsx

import CollectionVsDueCard from "./CollectionVsDueCard";
import CashBankUpiCard from "./CashBankUpiCard";
import CashPositionCard from "./CashPositionCard";
import PendingActionsCard from "./PendingActionsCard";

const FinancialOverview = ({
  collectionVsDue = {
    today: {
      due: 0,
      collected: 0,
      accuracy: 0,
    },
    overdue: {
      due: 0,
      collected: 0,
      accuracy: 0,
    },
  },

  cashBankUpi = {
    cash: 0,
    bank: 0,
    upi: 0,
  },

  cashPosition = 0,

  pendingActions = 0,
}) => {
  return (
    <section
      className="
        w-full
        min-w-0
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
      "
    >
      {/* =================================================
          HEADER
      ================================================== */}

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
            Financial Overview
          </h2>

          <p
            className="
              mt-0.5
              text-[9px]
              text-slate-400
            "
          >
            Approved collection and finance position
          </p>
        </div>
      </div>

      {/* =================================================
          EQUAL HEIGHT CARDS
      ================================================== */}

      <div
        className="
          grid
          min-w-0
          grid-cols-1
          gap-2
          p-2.5
          sm:grid-cols-2
          xl:grid-cols-4
          xl:items-stretch
        "
      >
        {/* COLLECTION VS DUE */}

        <div
          className="
            flex
            min-w-0
            h-full
            min-h-[190px]
            [&>*]:h-full
            [&>*]:w-full
          "
        >
          <CollectionVsDueCard
            collectionVsDue={
              collectionVsDue
            }
          />
        </div>

        {/* CASH / BANK / UPI */}

        <div
          className="
            flex
            min-w-0
            h-full
            min-h-[190px]
            [&>*]:h-full
            [&>*]:w-full
          "
        >
          <CashBankUpiCard
            cash={Number(
              cashBankUpi?.cash || 0
            )}
            bank={Number(
              cashBankUpi?.bank || 0
            )}
            upi={Number(
              cashBankUpi?.upi || 0
            )}
          />
        </div>

        {/* TOTAL CASHING */}

        <div
          className="
            flex
            min-w-0
            h-full
            min-h-[190px]
            [&>*]:h-full
            [&>*]:w-full
          "
        >
          <CashPositionCard
            value={Number(
              cashPosition || 0
            )}
          />
        </div>

        {/* PENDING ACTIONS */}

        <div
          className="
            flex
            min-w-0
            h-full
            min-h-[190px]
            [&>*]:h-full
            [&>*]:w-full
          "
        >
          <PendingActionsCard
            count={Number(
              pendingActions || 0
            )}
          />
        </div>
      </div>
    </section>
  );
};

export default FinancialOverview;