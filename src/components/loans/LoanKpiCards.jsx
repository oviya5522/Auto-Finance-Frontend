import {
  WalletCards,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
} from "lucide-react";

import {
  getLoanDueStatus,
  getLoanOutstanding,
  money,
  getDisplayLoanStatus,
} from "../../utils/loan/loanHelpers";

const LoanKpiCards = ({ loans }) => {
  const totalLoans =
    loans.length;

  const activeLoans =
    loans.filter(
      (loan) =>
        getDisplayLoanStatus(loan) ===
        "Active"
    ).length;

  const overdueLoans =
    loans.filter(
      (loan) =>
        getLoanDueStatus(loan) ===
        "Overdue"
    ).length;

  const totalOutstanding =
    loans.reduce(
      (sum, loan) =>
        sum +
        getLoanOutstanding(loan),
      0
    );

  const cards = [
    {
      icon: WalletCards,
      label: "Total Loans",
      value: totalLoans,
      supporting: "All loan records",
    },
    {
      icon: CheckCircle2,
      label: "Active Loans",
      value: activeLoans,
      supporting: "Currently servicing",
    },
    {
      icon: AlertTriangle,
      label: "Overdue Loans",
      value: overdueLoans,
      supporting: "Needs collection attention",
    },
    {
      icon: IndianRupee,
      label: "Total Outstanding",
      value: `₹${money(
        totalOutstanding
      )}`,
      supporting: "Remaining loan amount",
    },
  ];

  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] text-slate-500">
                  {card.label}
                </p>

                <p className="mt-1 text-[19px] font-semibold text-[#17221D]">
                  {card.value}
                </p>

                <p className="mt-1 text-[9px] text-slate-400">
                  {card.supporting}
                </p>
              </div>

              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF5EF] text-[#0B5D3B]">
                <Icon size={15} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LoanKpiCards;