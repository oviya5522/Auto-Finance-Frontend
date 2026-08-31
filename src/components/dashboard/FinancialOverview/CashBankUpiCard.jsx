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
          <Building2
            size={19}
            strokeWidth={2}
            className="text-[#0B5D3B]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#17221D]">
            Cash / Bank / UPI
          </p>

          <p className="mt-0.5 text-[9px] text-slate-400">
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

      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="text-[9px] font-medium text-slate-400">
          Total available
        </span>

        <span className="text-[14px] font-semibold text-[#17221D]">
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
        <p className="mt-1 text-[9px] text-slate-400">
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
    <div className="min-w-0 px-2 first:pl-0 last:pr-0">
      <p className="text-[9px] font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-[14px] font-semibold text-[#17221D]">
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