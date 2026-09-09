// src/components/dashboard/FinancialOverview/CashPositionCard.jsx

import {
  WalletCards,
} from "lucide-react";

const CashPositionCard = ({
  value = 0,
}) => {
  const safeValue = Number(
    value || 0
  );

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
        sm:px-3.5
      "
    >
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* ICON */}

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
            sm:h-9
            sm:w-9
          "
        >
          <WalletCards
            size={17}
            strokeWidth={2}
            className="text-[#0B5D3B] sm:hidden"
          />
          <WalletCards
            size={18}
            strokeWidth={2}
            className="hidden text-[#0B5D3B] sm:block"
          />
        </div>

        {/* TITLE */}

        <div className="min-w-0">
          <p className="truncate text-[10.5px] font-semibold text-[#17221D] sm:text-[11px]">
            Total Cashing
          </p>

          <p className="mt-0.5 text-[8.5px] text-slate-400 sm:text-[9px]">
            Current total
          </p>
        </div>
      </div>

      {/* VALUE */}

      <p className="mt-2.5 truncate text-[19px] font-semibold leading-none tracking-tight text-[#0B5D3B] sm:mt-3 sm:text-[21px]">
        ₹
        {safeValue.toLocaleString(
          "en-IN",
          {
            maximumFractionDigits: 2,
          }
        )}
      </p>

      <p className="mt-1.5 text-[8.5px] text-slate-400 sm:text-[9px]">
        {safeValue > 0
          ? "Total cashing recorded"
          : "No cashing data available"}
      </p>
    </section>
  );
};

export default CashPositionCard;