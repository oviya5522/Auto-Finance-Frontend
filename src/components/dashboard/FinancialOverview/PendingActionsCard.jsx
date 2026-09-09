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
        h-full
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        py-3
        transition
        duration-200
        hover:border-slate-300
        sm:px-4
        sm:py-3.5
      "
    >
      <div className="flex flex-wrap items-center justify-between gap-3 sm:flex-nowrap sm:gap-4">
        {/* LEFT */}

        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
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
              sm:h-10
              sm:w-10
            "
          >
            <ClipboardList
              size={18}
              strokeWidth={2}
              className="text-[#0B5D3B] sm:hidden"
            />
            <ClipboardList
              size={19}
              strokeWidth={2}
              className="hidden text-[#0B5D3B] sm:block"
            />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[10.5px] font-semibold text-[#17221D] sm:text-[11px]">
              Pending Actions
            </p>

            <p className="mt-0.5 truncate text-[8.5px] text-slate-400 sm:text-[9px]">
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
              text-[22px]
              font-semibold
              leading-none
              tracking-tight
              sm:text-[24px]
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