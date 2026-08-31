// src/components/dashboard/PortfolioRisk/PortfolioRisk.jsx

import {
  Activity,
} from "lucide-react";

import PortfolioSummary from "./PortfolioSummary";
import AgingBuckets from "./AgingBuckets";
import RecoveryPipeline from "./RecoveryPipeline";

const PortfolioRisk = ({
  totalOutstanding = 0,
  activeLoans = 0,
  overdueAmount = 0,
  overdueLoanCount = 0,
  loans = [],
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
      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          flex
          items-center
          gap-2.5
          border-b
          border-slate-100
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#EAF5EF]
          "
        >
          <Activity
            size={18}
            strokeWidth={2}
            className="text-[#0B5D3B]"
          />
        </div>

        <div className="min-w-0">
          <h2 className="text-[13px] font-semibold text-[#17221D]">
            Current Portfolio & Risk
          </h2>

          <p className="mt-0.5 text-[9px] text-slate-400">
            Portfolio health and overdue risk
          </p>
        </div>
      </div>

      {/* =================================================
          MAIN PORTFOLIO LAYOUT

          LEFT:
          4 compact metrics in 2 x 2

          RIGHT:
          Aging + Recovery on the same line
      ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          p-4
          xl:grid-cols-[0.85fr_1.75fr]
        "
      >
        {/* =============================================
            LEFT — PORTFOLIO METRICS
        ============================================== */}

        <div className="min-w-0">
          <PortfolioSummary
            totalOutstanding={
              totalOutstanding
            }
            activeLoans={
              activeLoans
            }
            overdueAmount={
              overdueAmount
            }
            overdueLoanCount={
              overdueLoanCount
            }
            loans={loans}
          />
        </div>

        {/* =============================================
            RIGHT — VISUALIZATIONS

            Aging + Recovery stay side-by-side.
        ============================================== */}

        <div
          className="
            grid
            min-w-0
            grid-cols-2
            gap-3
          "
        >
          <AgingBuckets
            loans={loans}
          />

          <RecoveryPipeline
            recovery={{
              total: 0,
              contacted: 0,
              promised: 0,
              recovered: 0,
              recoveredAmount: 0,
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default PortfolioRisk;