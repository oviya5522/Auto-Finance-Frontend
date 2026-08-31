// src/components/dashboard/KeyActivity/ExpensesCard.jsx

import {
  ReceiptText,
} from "lucide-react";

const ExpensesCard = ({
  amount = 0,
}) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        py-3
        transition
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
            bg-[#F0EBF8]
          "
        >
          <ReceiptText
            size={18}
            strokeWidth={2}
            className="text-[#5B3B8C]"
          />
        </div>

        {/* CONTENT */}

        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-[#17221D]">
            Expenses
          </p>

          <p className="mt-0.5 text-[21px] font-semibold leading-none tracking-tight text-[#5B3B8C]">
            ₹
            {Number(amount || 0).toLocaleString(
              "en-IN",
              {
                maximumFractionDigits: 2,
              }
            )}
          </p>

          <p className="mt-1 truncate text-[9px] text-slate-400">
            {Number(amount || 0) > 0
              ? "Recorded expenses"
              : "No expense module data"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExpensesCard;