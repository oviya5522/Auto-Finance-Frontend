// src/components/dashboard/FinancialOverview/PendingActionsCard.jsx

import {
  ClipboardList,
} from "lucide-react";

const PendingActionsCard = ({
  count = 0,
}) => {
  const safeCount = Number(
    count || 0
  );

  const hasPendingActions =
    safeCount > 0;

  return (
    <section
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
      <div className="flex items-center justify-between gap-4">
        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-3">
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
            <ClipboardList
              size={19}
              strokeWidth={2}
              className="text-[#0B5D3B]"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#17221D]">
              Pending Actions
            </p>

            <p className="mt-0.5 truncate text-[9px] text-slate-400">
              {hasPendingActions
                ? "Actions requiring attention"
                : "No pending action data"}
            </p>
          </div>
        </div>

        {/* RIGHT — VALUE */}

        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`
              text-[24px]
              font-semibold
              leading-none
              tracking-tight
              ${
                hasPendingActions
                  ? "text-[#0B5D3B]"
                  : "text-[#17221D]"
              }
            `}
          >
            {safeCount.toLocaleString(
              "en-IN"
            )}
          </span>

          <span
            className={`
              h-2
              w-2
              rounded-full
              ${
                hasPendingActions
                  ? "bg-amber-500"
                  : "bg-slate-300"
              }
            `}
          />
        </div>
      </div>
    </section>
  );
};

export default PendingActionsCard;