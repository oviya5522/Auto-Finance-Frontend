// src/components/dashboard/KeyActivity/NewLoansCard.jsx

import {
  FilePlus2,
} from "lucide-react";

const NewLoansCard = ({
  count = 0,
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
            bg-[#EAF5EF]
          "
        >
          <FilePlus2
            size={18}
            strokeWidth={2}
            className="text-[#0B5D3B]"
          />
        </div>

        {/* CONTENT */}

        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-[#17221D]">
            New Loans
          </p>

          <p className="mt-0.5 text-[21px] font-semibold leading-none tracking-tight text-[#0B5D3B]">
            {Number(count || 0).toLocaleString(
              "en-IN"
            )}
          </p>

          <p className="mt-1 text-[9px] text-slate-400">
            Created today
          </p>
        </div>
      </div>
    </div>
  );
};

export default NewLoansCard;