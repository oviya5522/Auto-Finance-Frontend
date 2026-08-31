// src/components/dashboard/KeyActivity/OverduePendingCard.jsx

import {
  AlertTriangle,
} from "lucide-react";

const OverduePendingCard = ({
  overdueCount = 0,
  pendingCount = 0,
  amount = 0,
}) => {
  const total =
    Number(overdueCount || 0) +
    Number(pendingCount || 0);

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
            bg-red-50
          "
        >
          <AlertTriangle
            size={18}
            strokeWidth={2}
            className="text-red-700"
          />
        </div>

        {/* CONTENT */}

        <div className="min-w-0">
          <p className="truncate text-[10px] font-semibold text-[#17221D]">
            Overdue / Pending
          </p>

          <p className="mt-0.5 text-[21px] font-semibold leading-none tracking-tight text-red-700">
            {total.toLocaleString("en-IN")}
          </p>

          <p className="mt-1 truncate text-[10px] font-semibold text-red-700">
            ₹
            {Number(amount || 0).toLocaleString(
              "en-IN",
              {
                maximumFractionDigits: 2,
              }
            )}
          </p>

          <p className="mt-0.5 truncate text-[9px] text-slate-400">
            {Number(overdueCount || 0)} overdue
            {" · "}
            {Number(pendingCount || 0)} pending
          </p>
        </div>
      </div>
    </div>
  );
};

export default OverduePendingCard;