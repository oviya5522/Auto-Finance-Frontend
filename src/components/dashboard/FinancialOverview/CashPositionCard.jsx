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
        px-3.5
        py-3
        transition
        duration-200
        hover:border-slate-300
      "
    >
      <div className="flex items-center gap-3">
        {/* ICON */}

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
          <WalletCards
            size={18}
            strokeWidth={2}
            className="text-[#0B5D3B]"
          />
        </div>

        {/* TITLE */}

        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#17221D]">
            Total Cashing
          </p>

          <p className="mt-0.5 text-[9px] text-slate-400">
            Current total
          </p>
        </div>
      </div>

      {/* VALUE */}

      <p className="mt-3 text-[21px] font-semibold leading-none tracking-tight text-[#0B5D3B]">
        ₹
        {safeValue.toLocaleString(
          "en-IN",
          {
            maximumFractionDigits: 2,
          }
        )}
      </p>

      <p className="mt-1.5 text-[9px] text-slate-400">
        {safeValue > 0
          ? "Total cashing recorded"
          : "No cashing data available"}
      </p>
    </section>
  );
};

export default CashPositionCard;