// src/components/dashboard/PortfolioRisk/AgingBuckets.jsx

import {
  AlertTriangle,
} from "lucide-react";

const AgingBuckets = ({
  loans = [],
}) => {
  const buckets =
    calculateAgingBuckets(loans);

  const totalOverdue =
    buckets.reduce(
      (total, bucket) =>
        total + bucket.count,
      0
    );

  const totalAmount =
    buckets.reduce(
      (total, bucket) =>
        total + bucket.amount,
      0
    );

  return (
    <section
      className="
        h-full
        min-h-0
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3.5
        py-2.5
      "
    >
      {/* HEADER */}

      <div className="flex items-center justify-between gap-2">
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
              bg-red-50
            "
          >
            <AlertTriangle
              size={17}
              strokeWidth={2}
              className="text-red-700"
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold text-[#17221D]">
              Aging
            </h3>

            <p className="text-[9px] text-slate-400">
              Overdue distribution
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-[14px] font-semibold leading-none text-red-700">
            {totalOverdue}
          </p>

          <p className="mt-0.5 text-[9px] font-medium text-slate-400">
            ₹
            {totalAmount.toLocaleString(
              "en-IN",
              {
                maximumFractionDigits: 2,
              }
            )}
          </p>
        </div>
      </div>

      {/* DONUT + LEGEND */}

      <div
        className="
          mt-2.5
          flex
          min-h-0
          items-center
          gap-4
        "
      >
        <DonutChart
          buckets={buckets}
          total={totalOverdue}
        />

        <div className="min-w-0 flex-1">
          {buckets.map(
            (bucket) => (
              <LegendRow
                key={bucket.key}
                bucket={bucket}
                total={totalOverdue}
              />
            )
          )}
        </div>
      </div>
    </section>
  );
};

/* =========================================================
   DONUT
========================================================= */

const DonutChart = ({
  buckets,
  total,
}) => {
  const radius = 42;

  const circumference =
    2 * Math.PI * radius;

  let accumulated = 0;

  const segments = buckets.map(
    (bucket) => {
      const percentage =
        total > 0
          ? bucket.count / total
          : 0;

      const length =
        percentage *
        circumference;

      const offset =
        -accumulated;

      accumulated += length;

      return {
        ...bucket,
        length,
        offset,
      };
    }
  );

  return (
    <div
      className="
        relative
        flex
        h-[132px]
        w-[132px]
        shrink-0
        items-center
        justify-center
      "
    >
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
        aria-label="Overdue aging distribution"
      >
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="13"
          className="text-slate-100"
        />

        {segments.map(
          (segment) => (
            <circle
              key={segment.key}
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="13"
              strokeLinecap="butt"
              strokeDasharray={`${segment.length} ${circumference}`}
              strokeDashoffset={segment.offset}
              className={`
                ${getSegmentColor(
                  segment.key
                )}
                transition-all
                duration-500
              `}
            />
          )
        )}
      </svg>

      {/* CENTER */}

      <div
        className="
          absolute
          inset-0
          flex
          flex-col
          items-center
          justify-center
          text-center
        "
      >
        <span className="text-[22px] font-bold leading-none text-[#17221D]">
          {total}
        </span>

        <span className="mt-0.5 text-[9px] font-medium text-slate-400">
          overdue
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   LEGEND
========================================================= */

const LegendRow = ({
  bucket,
  total,
}) => {
  const percentage =
    total > 0
      ? Math.round(
          (bucket.count / total) *
            100
        )
      : 0;

  return (
    <div
      className="
        flex
        items-center
        justify-between
        gap-2
        py-1.5
      "
    >
      <div className="flex min-w-0 items-center gap-2">
        <span
          className={`
            h-2.5
            w-2.5
            shrink-0
            rounded-full
            ${getLegendColor(
              bucket.key
            )}
          `}
        />

        <span className="truncate text-[10px] font-medium text-slate-600">
          {bucket.label}
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="text-[11px] font-semibold text-[#17221D]">
          {bucket.count}
        </span>

        <span className="text-[9px] font-medium text-slate-400">
          {percentage}%
        </span>

        <span className="text-[9px] font-medium text-slate-400">
          ₹
          {Number(
            bucket.amount || 0
          ).toLocaleString(
            "en-IN",
            {
              maximumFractionDigits: 2,
            }
          )}
        </span>
      </div>
    </div>
  );
};

/* =========================================================
   COLORS
========================================================= */

const getSegmentColor = (
  key
) => {
  switch (key) {
    case "1-30":
      return "text-amber-400";

    case "31-60":
      return "text-amber-600";

    case "61-90":
      return "text-red-400";

    case "90+":
      return "text-red-700";

    default:
      return "text-slate-300";
  }
};

const getLegendColor = (
  key
) => {
  switch (key) {
    case "1-30":
      return "bg-amber-400";

    case "31-60":
      return "bg-amber-600";

    case "61-90":
      return "bg-red-400";

    case "90+":
      return "bg-red-700";

    default:
      return "bg-slate-300";
  }
};

/* =========================================================
   CALCULATE AGING
========================================================= */

const calculateAgingBuckets = (
  loans = []
) => {
  const buckets = [
    {
      key: "1-30",
      label: "1–30 Days",
      count: 0,
      amount: 0,
    },
    {
      key: "31-60",
      label: "31–60 Days",
      count: 0,
      amount: 0,
    },
    {
      key: "61-90",
      label: "61–90 Days",
      count: 0,
      amount: 0,
    },
    {
      key: "90+",
      label: "90+ Days",
      count: 0,
      amount: 0,
    },
  ];

  const now = new Date();

  loans.forEach((loan) => {
    const schedule =
      Array.isArray(
        loan?.repaymentSchedule
      )
        ? loan.repaymentSchedule
        : [];

    schedule.forEach((row) => {
      const status = String(
        row?.status || ""
      ).toLowerCase();

      if (status !== "overdue") {
        return;
      }

      const dueDate = new Date(
        row?.dueDate || 0
      );

      if (
        Number.isNaN(
          dueDate.getTime()
        )
      ) {
        return;
      }

      const days = Math.max(
        0,
        Math.floor(
          (now.getTime() -
            dueDate.getTime()) /
            (1000 *
              60 *
              60 *
              24)
        )
      );

      const amount = Number(
        row?.paymentAmount ||
          row?.emiAmount ||
          row?.amount ||
          0
      );

      if (days <= 30) {
        buckets[0].count += 1;
        buckets[0].amount += amount;
      } else if (days <= 60) {
        buckets[1].count += 1;
        buckets[1].amount += amount;
      } else if (days <= 90) {
        buckets[2].count += 1;
        buckets[2].amount += amount;
      } else {
        buckets[3].count += 1;
        buckets[3].amount += amount;
      }
    });
  });

  return buckets;
};

export default AgingBuckets;