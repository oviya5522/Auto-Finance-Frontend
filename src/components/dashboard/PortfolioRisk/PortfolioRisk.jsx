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

  /* =====================================================
     COLLECTION DATA
  ====================================================== */

  overduePayments = [],
  overdueCollectionTodayAmount = 0,
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
          <h2
            className="
              text-[13px]
              font-semibold
              text-[#17221D]
            "
          >
            Current Portfolio & Risk
          </h2>

          <p
            className="
              mt-0.5
              text-[9px]
              text-slate-400
            "
          >
            Portfolio health and overdue risk
          </p>
        </div>
      </div>

      {/* =================================================
          MAIN PORTFOLIO LAYOUT

          LEFT:
          Portfolio summary

          RIGHT:
          Aging + Recovery Pipeline
      ================================================== */}

      <div
        className="
          grid
          min-w-0
          grid-cols-1
          gap-3
          p-3
          lg:gap-3
          lg:p-3.5
          xl:grid-cols-[minmax(330px,0.9fr)_minmax(0,2fr)]
          2xl:grid-cols-[minmax(350px,0.85fr)_minmax(0,2.15fr)]
        "
      >
        {/* =============================================
            LEFT
            PORTFOLIO SUMMARY
        ============================================== */}

        <div
          className="
            min-w-0
            w-full
          "
        >
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

            loans={
              loans
            }
          />
        </div>

        {/* =============================================
            RIGHT
            AGING + RECOVERY

            Always side-by-side on XL.
        ============================================== */}

        <div
          className="
            grid
            min-w-0
            w-full
            grid-cols-1
            gap-3
            xl:grid-cols-2
          "
        >
          {/* ===========================================
              AGING
          ============================================ */}

          <div
            className="
              min-w-0
              w-full
            "
          >
            <AgingBuckets
              loans={
                loans
              }
            />
          </div>

          {/* ===========================================
              RECOVERY PIPELINE
          ============================================ */}

          <div
            className="
              min-w-0
              w-full
            "
          >
            <RecoveryPipeline
              recovery={{
                /*
                 * Current overdue count.
                 */
                total:
                  overdueLoanCount,

                /*
                 * Current overdue records.
                 */
                contacted:
                  overduePayments.length,

                /*
                 * Pending recovery stage.
                 */
                promised: 0,

                /*
                 * Approved overdue collections
                 * made today.
                 */
                recovered:
                  overdueCollectionTodayAmount,

                /*
                 * Recovered amount.
                 */
                recoveredAmount:
                  overdueCollectionTodayAmount,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioRisk;