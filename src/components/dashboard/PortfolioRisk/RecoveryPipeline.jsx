// src/components/dashboard/PortfolioRisk/RecoveryPipeline.jsx

import { TrendingUp } from "lucide-react";

const RecoveryPipeline = ({
  recovery = {},
}) => {
  const total = Number(
    recovery?.total || 0
  );

  const contacted = Number(
    recovery?.contacted || 0
  );

  const promised = Number(
    recovery?.promised || 0
  );

  const recovered = Number(
    recovery?.recovered || 0
  );

  const recoveredAmount = Number(
    recovery?.recoveredAmount || 0
  );

  const pipelineTotal =
    contacted +
    promised +
    recovered;

  return (
    <section
      className="
        h-full
        min-h-0
        bg-white
      "
    >
      {/* HEADER */}

      <div className="flex items-center gap-2.5">
        <div
          className="
            flex
            h-8
            w-8
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#EAF5EF]
          "
        >
          <TrendingUp
            size={17}
            strokeWidth={2}
            className="text-[#0B5D3B]"
          />
        </div>

        <div className="min-w-0">
          <h3 className="text-[13px] font-semibold text-[#17221D]">
            Recovery Pipeline
          </h3>

          <p className="text-[9px] text-slate-400">
            Recovery status
          </p>
        </div>
      </div>

      {/* MAIN VISUAL */}

      <div
        className="
          mt-2.5
          flex
          min-h-0
          items-center
          gap-4
        "
      >
        <RecoveryDonut
          total={total}
          contacted={contacted}
          promised={promised}
          recovered={recovered}
        />

        <div className="min-w-0 flex-1">
          <RecoveryRow
            dotClass="bg-slate-400"
            label="Total Overdue"
            value={total}
          />

          <RecoveryRow
            dotClass="bg-amber-500"
            label="Follow-up"
            value={contacted}
          />

          <RecoveryRow
            dotClass="bg-orange-500"
            label="PTP"
            value={promised}
          />

          <RecoveryRow
            dotClass="bg-[#0B5D3B]"
            label="Recovery"
            value={recovered}
            success
          />

          <div className="mt-2 border-t border-slate-100 pt-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[9px] font-medium text-slate-500">
                Recovered amount
              </span>

              <span className="text-[12px] font-semibold text-[#0B5D3B]">
                ₹
                {recoveredAmount.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 2,
                  }
                )}
              </span>
            </div>
          </div>

          {!total &&
            !pipelineTotal &&
            !recoveredAmount && (
              <p className="mt-1.5 text-[8px] text-slate-400">
                Recovery tracking not implemented
              </p>
            )}
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   DONUT
========================================================= */

const RecoveryDonut = ({
  total,
  contacted,
  promised,
  recovered,
}) => {
  const radius = 42;

  const circumference =
    2 * Math.PI * radius;

  const segments = [
    {
      value: contacted,
      className: "text-amber-500",
    },
    {
      value: promised,
      className: "text-orange-500",
    },
    {
      value: recovered,
      className: "text-[#0B5D3B]",
    },
  ];

  const segmentTotal =
    segments.reduce(
      (sum, item) =>
        sum + item.value,
      0
    );

  let accumulated = 0;

  return (
    <div
      className="
        relative
        flex
        h-[126px]
        w-[126px]
        shrink-0
        items-center
        justify-center
      "
    >
      <svg
        viewBox="0 0 120 120"
        className="
          h-full
          w-full
          -rotate-90
        "
      >
        {/* BASE */}

        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="13"
          className="text-slate-100"
        />

        {/* DATA */}

        {segments.map(
          (segment, index) => {
            const ratio =
              segmentTotal > 0
                ? segment.value /
                  segmentTotal
                : 0;

            const length =
              ratio * circumference;

            const offset =
              -accumulated;

            accumulated += length;

            return (
              <circle
                key={index}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="13"
                strokeLinecap="butt"
                strokeDasharray={`${length} ${circumference}`}
                strokeDashoffset={
                  offset
                }
                className={`
                  ${segment.className}
                  transition-all
                  duration-500
                `}
              />
            );
          }
        )}
      </svg>

      {/* CENTER */}

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[20px] font-semibold leading-none text-[#17221D]">
          {total}
        </span>

        <span className="mt-1 text-[8px] text-slate-400">
          overdue
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   ROW
========================================================= */

const RecoveryRow = ({
  dotClass,
  label,
  value,
  success = false,
}) => {
  return (
    <div className="mb-2 flex items-center justify-between gap-3 last:mb-0">
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`
            h-2
            w-2
            shrink-0
            rounded-full
            ${dotClass}
          `}
        />

        <span className="truncate text-[10px] font-medium text-slate-600">
          {label}
        </span>
      </div>

      <span
        className={`
          text-[11px]
          font-semibold
          ${
            success
              ? "text-[#0B5D3B]"
              : "text-[#17221D]"
          }
        `}
      >
        {Number(value || 0).toLocaleString(
          "en-IN"
        )}
      </span>
    </div>
  );
};

export default RecoveryPipeline;