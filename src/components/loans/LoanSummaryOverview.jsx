// src/components/loans/LoanSummaryOverview.jsx

import {
  IndianRupee,
  WalletCards,
  TrendingDown,
  Percent,
  CalendarClock,
  Calculator,
} from "lucide-react";

import {
  getLoanOutstanding,
  getEmi,
} from "../../utils/loan/loanHelpers";

const LoanSummaryOverview = ({
  loans = [],
}) => {
  const safeLoans = Array.isArray(
    loans
  )
    ? loans
    : [];

  const totalLoanAmount =
    safeLoans.reduce(
      (sum, loan) =>
        sum +
        Number(
          loan?.loanAmount || 0
        ),
      0
    );

  const totalOutstanding =
    safeLoans.reduce(
      (sum, loan) =>
        sum +
        getLoanOutstanding(
          loan
        ),
      0
    );

  const totalCollected =
    Math.max(
      totalLoanAmount -
        totalOutstanding,
      0
    );

  const loansWithRate =
    safeLoans.filter(
      (loan) =>
        Number.isFinite(
          Number(
            loan?.interest?.rate ??
              loan?.interestRate ??
              loan?.calculation
                ?.interestRate
          )
        )
    );

  const averageRate =
    loansWithRate.length > 0
      ? loansWithRate.reduce(
          (sum, loan) =>
            sum +
            Number(
              loan?.interest?.rate ??
                loan?.interestRate ??
                loan?.calculation
                  ?.interestRate ??
                0
            ),
          0
        ) /
        loansWithRate.length
      : 0;

  const loansWithTenure =
    safeLoans.filter(
      (loan) => {
        const value =
          loan?.repayment?.tenure ??
          loan?.repayment
            ?.numberOfPayments ??
          loan?.calculation
            ?.numberOfPayments;

        return (
          Number.isFinite(
            Number(value)
          ) &&
          Number(value) > 0
        );
      }
    );

  const averageTenure =
    loansWithTenure.length > 0
      ? loansWithTenure.reduce(
          (sum, loan) =>
            sum +
            Number(
              loan?.repayment?.tenure ??
                loan?.repayment
                  ?.numberOfPayments ??
                loan?.calculation
                  ?.numberOfPayments ??
                0
            ),
          0
        ) /
        loansWithTenure.length
      : 0;

  const tenureUnit =
    safeLoans.find(
      (loan) =>
        loan?.repayment?.tenureUnit ||
        loan?.tenureUnit
    )?.repayment?.tenureUnit ||
    safeLoans.find(
      (loan) =>
        loan?.repayment?.tenureUnit ||
        loan?.tenureUnit
    )?.tenureUnit ||
    "months";

  const loansWithEmi =
    safeLoans.filter(
      (loan) =>
        Number(
          getEmi(loan)
        ) > 0
    );

  const averageEmi =
    loansWithEmi.length > 0
      ? loansWithEmi.reduce(
          (sum, loan) =>
            sum +
            Number(
              getEmi(loan)
            ),
          0
        ) /
        loansWithEmi.length
      : 0;

  const metrics = [
    {
      icon: IndianRupee,
      label: "Total Loan Amount",
      value: formatMoney(
        totalLoanAmount
      ),
      note: "Original loan value",
      tone: "green",
    },
    {
      icon: WalletCards,
      label: "Total Outstanding",
      value: formatMoney(
        totalOutstanding
      ),
      note: "Remaining payable",
      tone: "green",
    },
    {
      icon: TrendingDown,
      label: "Total Collected",
      value: formatMoney(
        totalCollected
      ),
      note: "Derived from payments",
      tone: "neutral",
    },
    {
      icon: Percent,
      label: "Average Interest",
      value:
        averageRate > 0
          ? `${averageRate.toFixed(
              2
            )}%`
          : "—",
      note:
        loansWithRate.length > 0
          ? `${loansWithRate.length} loans with rate`
          : "Rate data unavailable",
      tone: "neutral",
    },
    {
      icon: CalendarClock,
      label: "Average Tenure",
      value:
        averageTenure > 0
          ? `${averageTenure.toFixed(
              averageTenure % 1 === 0
                ? 0
                : 1
            )}`
          : "—",
      note:
        averageTenure > 0
          ? tenureUnit
          : "Tenure data unavailable",
      tone: "neutral",
    },
    {
      icon: Calculator,
      label: "Average EMI",
      value:
        averageEmi > 0
          ? formatMoney(
              averageEmi
            )
          : "—",
      note:
        loansWithEmi.length > 0
          ? "Average scheduled EMI"
          : "EMI data unavailable",
      tone: "green",
    },
  ];

  return (
    <section
      className="
        mt-3
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* HEADER */}

      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div>
          <h2 className="text-[12px] font-semibold text-[#17221D]">
            Loan Summary Overview
          </h2>

          <p className="mt-0.5 text-[9px] text-slate-400">
            Portfolio summary derived from current loan records
          </p>
        </div>

        <span className="rounded-full bg-[#EAF5EF] px-2.5 py-1 text-[8px] font-semibold text-[#0B5D3B]">
          {safeLoans.length.toLocaleString(
            "en-IN"
          )}{" "}
          loans
        </span>
      </div>

      {/* METRICS */}

      <div
        className="
          grid
          grid-cols-1
          gap-2
          p-3
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-6
        "
      >
        {metrics.map(
          (metric) => (
            <SummaryMetric
              key={metric.label}
              {...metric}
            />
          )
        )}
      </div>
    </section>
  );
};

/* =========================================================
   METRIC
========================================================= */

const SummaryMetric = ({
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
      iconText: "text-slate-600",
      valueText: "text-[#17221D]",
    },
  };

  const current =
    styles[tone] ||
    styles.neutral;

  return (
    <div
      className="
        rounded-lg
        border
        border-slate-100
        bg-[#FCFDFC]
        px-3
        py-2.5
      "
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[8px] font-medium uppercase tracking-[0.04em] text-slate-400">
            {label}
          </p>

          <p
            className={`
              mt-1
              truncate
              text-[17px]
              font-semibold
              leading-none
              tracking-tight
              ${current.valueText}
            `}
          >
            {value}
          </p>

          <p className="mt-1 text-[8px] text-slate-400">
            {note}
          </p>
        </div>

        <div
          className={`
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-md
            ${current.iconBg}
          `}
        >
          <Icon
            size={14}
            strokeWidth={2}
            className={current.iconText}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MONEY
========================================================= */

const formatMoney = (
  value
) => {
  return `₹${Number(
    value || 0
  ).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

export default LoanSummaryOverview;