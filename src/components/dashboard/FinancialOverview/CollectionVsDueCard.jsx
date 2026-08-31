// src/components/dashboard/FinancialOverview/CollectionVsDueCard.jsx

import {
  IndianRupee,
} from "lucide-react";

const CollectionVsDueCard = ({
  collected = 0,
  due = 0,
}) => {
  const safeCollected = Number(
    collected || 0
  );

  const safeDue = Number(
    due || 0
  );

  const efficiency =
    safeDue > 0
      ? Math.min(
          100,
          Math.round(
            (safeCollected / safeDue) *
              100
          )
        )
      : 0;

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        px-4
        py-3.5
        transition
        duration-200
        hover:border-slate-300
      "
    >
      {/* HEADER */}

      <div className="flex items-center gap-3">
        <div
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            bg-[#EAF5EF]
          "
        >
          <IndianRupee
            size={19}
            strokeWidth={2}
            className="text-[#0B5D3B]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#17221D]">
            Collection vs Due
          </p>

          <p className="mt-0.5 text-[9px] text-slate-400">
            Today
          </p>
        </div>
      </div>

      {/* AMOUNT */}

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-[21px] font-semibold tracking-tight text-[#17221D]">
          ₹
          {safeCollected.toLocaleString(
            "en-IN",
            {
              maximumFractionDigits: 2,
            }
          )}
        </span>

        <span className="text-[12px] text-slate-300">
          /
        </span>

        <span className="text-[12px] font-medium text-slate-500">
          ₹
          {safeDue.toLocaleString(
            "en-IN",
            {
              maximumFractionDigits: 2,
            }
          )}
        </span>
      </div>

      {/* PROGRESS */}

      <div className="mt-3">
        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="
              h-full
              rounded-full
              bg-[#0B5D3B]
              transition-all
              duration-500
            "
            style={{
              width: `${efficiency}%`,
            }}
          />
        </div>

        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[9px] text-slate-400">
            Collection efficiency
          </span>

          <span className="text-[10px] font-semibold text-[#0B5D3B]">
            {efficiency}%
          </span>
        </div>
      </div>

      {/* EMPTY / ZERO SOURCE */}

      {safeDue === 0 && (
        <p className="mt-1.5 text-[9px] text-slate-400">
          No collection data available
        </p>
      )}
    </div>
  );
};

export default CollectionVsDueCard;