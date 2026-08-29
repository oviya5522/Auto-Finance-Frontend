import {
  getPaidEmiCount,
  money,
} from "../../utils/loan/loanHelpers";

const LoanRepaymentProgress = ({
  loan,
}) => {
  const schedule =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];

  const paidEmis =
    getPaidEmiCount(loan);

  const totalEmis =
    schedule.length ||
    loan?.calculation?.numberOfPayments ||
    0;

  const progress =
    totalEmis
      ? Math.round(
          (paidEmis / totalEmis) * 100
        )
      : 0;

  return (
    <section className="mb-5">

      <h3 className="mb-2.5 text-[12px] font-semibold">
        Repayment Progress
      </h3>

      <div className="rounded-xl border border-slate-200 p-3.5">

        <div className="flex items-center justify-between">
          <p className="text-[17px] font-semibold">
            {paidEmis} of {totalEmis} EMIs paid
          </p>

          <span className="text-sm font-semibold text-[#0B5D3B]">
            {progress}%
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#0B5D3B]"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

      </div>
    </section>
  );
};

export default LoanRepaymentProgress;