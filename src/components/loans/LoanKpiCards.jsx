// src/components/loans/LoanKpiCards.jsx

import {
  WalletCards,
  CheckCircle2,
  IndianRupee,
  FileCheck2,
} from "lucide-react";

import {
  getLoanOutstanding,
  money,
  getDisplayLoanStatus,
} from "../../utils/loan/loanHelpers";

const LoanKpiCards = ({
  loans = [],
}) => {
  /* =====================================================
     REAL DATA CALCULATIONS
  ====================================================== */

  const totalLoans = loans.length;

  const activeLoans = loans.filter(
    (loan) =>
      getDisplayLoanStatus(
        loan
      ) === "Active"
  ).length;

  const closedLoans = loans.filter(
    (loan) =>
      getDisplayLoanStatus(
        loan
      ) === "Closed"
  ).length;

  const totalLoanAmount = loans.reduce(
    (sum, loan) =>
      sum +
      Number(
        loan?.loanAmount || 0
      ),
    0
  );

  const totalOutstanding = loans.reduce(
    (sum, loan) =>
      sum +
      getLoanOutstanding(loan),
    0
  );

  /* =====================================================
     KPI CARDS
  ====================================================== */

  const cards = [
    {
      icon: WalletCards,
      label: "Total Loans",
      value:
        totalLoans.toLocaleString(
          "en-IN"
        ),
      supporting: "All loan accounts",
      tone: "neutral",
    },

    {
      icon: CheckCircle2,
      label: "Active Loans",
      value:
        activeLoans.toLocaleString(
          "en-IN"
        ),
      supporting: "Currently servicing",
      tone: "green",
    },

    {
      icon: FileCheck2,
      label: "Closed Loans",
      value:
        closedLoans.toLocaleString(
          "en-IN"
        ),
      supporting: "Completed accounts",
      tone: "neutral",
    },

    {
      icon: IndianRupee,
      label: "Total Loan Amount",
      value: `₹${money(
        totalLoanAmount
      )}`,
      supporting: "Total disbursed amount",
      tone: "green",
    },

    {
      icon: IndianRupee,
      label: "Total Outstanding",
      value: `₹${money(
        totalOutstanding
      )}`,
      supporting: "Remaining payable",
      tone: "green",
    },
  ];

  return (
    <div
      className="
        mt-3
        grid
        grid-cols-1
        gap-2.5
        sm:grid-cols-2
        xl:grid-cols-5
      "
    >
      {cards.map(
        (card) => (
          <LoanKpiCard
            key={card.label}
            {...card}
          />
        )
      )}
    </div>
  );
};

/* =========================================================
   KPI CARD
========================================================= */

const LoanKpiCard = ({
  icon: Icon,
  label,
  value,
  supporting,
  tone = "neutral",
}) => {
  const styles = {
    neutral: {
      iconBg: "bg-slate-50",
      iconText: "text-slate-600",
      valueText: "text-[#17221D]",
    },

    green: {
      iconBg: "bg-[#EAF5EF]",
      iconText: "text-[#0B5D3B]",
      valueText: "text-[#0B5D3B]",
    },
  };

  const current =
    styles[tone] ||
    styles.neutral;

  return (
    <div
      className="
        group
        rounded-xl
        border
        border-slate-200
        bg-white
        px-3.5
        py-3
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:shadow-sm
      "
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p
            className="
              truncate
              text-[10px]
              font-medium
              uppercase
              tracking-[0.05em]
              text-slate-400
            "
          >
            {label}
          </p>

          <p
            className={`
              mt-1
              truncate
              text-[21px]
              font-semibold
              leading-none
              tracking-tight
              ${current.valueText}
            `}
          >
            {value}
          </p>

          <p className="mt-1.5 truncate text-[9px] text-slate-400">
            {supporting}
          </p>
        </div>

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
      </div>
    </div>
  );
};

export default LoanKpiCards;