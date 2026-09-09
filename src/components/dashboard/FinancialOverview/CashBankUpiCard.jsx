// src/components/dashboard/FinancialOverview/CashBankUpiCard.jsx

import {
  Building2,
} from "lucide-react";

const CashBankUpiCard = ({
  cash = 0,
  bank = 0,
  upi = 0,
}) => {
  const total =
    Number(cash || 0) +
    Number(bank || 0) +
    Number(upi || 0);

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
      {/* HEADER */}

      <div className="flex items-center gap-2.5 sm:gap-3">
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
          <Building2
            size={18}
            strokeWidth={2}
            className="text-[#0B5D3B] sm:hidden"
          />
          <Building2
            size={19}
            strokeWidth={2}
            className="hidden text-[#0B5D3B] sm:block"
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[10.5px] font-semibold text-[#17221D] sm:text-[11px]">
            Cash / Bank / UPI
          </p>

          <p className="mt-0.5 text-[8.5px] text-slate-400 sm:text-[9px]">
            Available balance
          </p>
        </div>
      </div>

      {/* BALANCES */}

      <div className="mt-3 grid grid-cols-3 divide-x divide-slate-100">
        <Amount
          label="Cash"
          value={cash}
        />

        <Amount
          label="Bank"
          value={bank}
        />

        <Amount
          label="UPI"
          value={upi}
        />
      </div>

      {/* TOTAL */}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-1 border-t border-slate-100 pt-2.5">
        <span className="text-[8.5px] font-medium text-slate-400 sm:text-[9px]">
          Total available
        </span>

        <span className="text-[13px] font-semibold text-[#17221D] sm:text-[14px]">
          ₹
          {total.toLocaleString(
            "en-IN",
            {
              maximumFractionDigits: 2,
            }
          )}
        </span>
      </div>

      {total === 0 && (
        <p className="mt-1 text-[8.5px] text-slate-400 sm:text-[9px]">
          No collection account data
        </p>
      )}
    </section>
  );
};

/* =========================================================
   AMOUNT
========================================================= */

const Amount = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-0 px-1.5 first:pl-0 last:pr-0 sm:px-2">
      <p className="truncate text-[8.5px] font-medium text-slate-400 sm:text-[9px]">
        {label}
      </p>

      <p className="mt-1 truncate text-[12px] font-semibold text-[#17221D] sm:text-[14px]">
        ₹
        {Number(value || 0).toLocaleString(
          "en-IN",
          {
            maximumFractionDigits: 2,
          }
        )}
      </p>
    </div>
  );
};

export default CashBankUpiCard;