// src/components/dashboard/PortfolioRisk/PortfolioSummary.jsx

import {
  IndianRupee,
  WalletCards,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";

const PortfolioSummary = ({
  totalOutstanding = 0,
  activeLoans = 0,
  overdueAmount = 0,
  overdueLoanCount = 0,
}) => {
  // NPA is not available in the current data source.
  const npaPercentage = 0;

  return (
    <div className="grid grid-cols-2 gap-2">
      <PortfolioMetric
        icon={IndianRupee}
        label="Principal Outstanding"
        value={formatMoney(
          totalOutstanding
        )}
        tone="green"
      />

      <PortfolioMetric
        icon={WalletCards}
        label="Active Loans"
        value={Number(
          activeLoans || 0
        ).toLocaleString("en-IN")}
        tone="neutral"
      />

      <PortfolioMetric
        icon={AlertTriangle}
        label="Overdue Amount"
        value={formatMoney(
          overdueAmount
        )}
        tone={
          Number(
            overdueAmount || 0
          ) > 0
            ? "danger"
            : "neutral"
        }
        note={`${Number(
          overdueLoanCount || 0
        ).toLocaleString("en-IN")} overdue`}
      />

      <PortfolioMetric
        icon={ShieldCheck}
        label="NPA %"
        value={`${npaPercentage}%`}
        tone="neutral"
        note="Not tracked"
      />
    </div>
  );
};

const PortfolioMetric = ({
  icon: Icon,
  label,
  value,
  note,
  tone = "neutral",
}) => {
  const styles = {
    green: {
      iconBg: "bg-[#EAF5EF]",
      iconText: "text-[#0B5D3B]",
      valueText: "text-[#0B5D3B]",
    },

    neutral: {
      iconBg: "bg-slate-50",
      iconText: "text-slate-700",
      valueText: "text-[#17221D]",
    },

    danger: {
      iconBg: "bg-red-50",
      iconText: "text-red-700",
      valueText: "text-red-700",
    },
  };

  const current =
    styles[tone] ||
    styles.neutral;

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3
        py-2.5
      "
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg
            ${current.iconBg}
          `}
        >
          <Icon
            size={17}
            strokeWidth={2}
            className={current.iconText}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[9px] font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p
            className={`
              mt-0.5
              truncate
              text-[17px]
              font-semibold
              leading-tight
              tracking-tight
              ${current.valueText}
            `}
          >
            {value}
          </p>

          {note && (
            <p className="mt-0.5 truncate text-[8px] text-slate-400">
              {note}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const formatMoney = (value) => {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

export default PortfolioSummary;