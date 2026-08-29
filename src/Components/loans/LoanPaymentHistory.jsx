import {
  formatDate,
  money,
} from "../../utils/loan/loanHelpers";

const LoanPaymentHistory = ({
  loan,
}) => {
  const payments =
    Array.isArray(
      loan?.paymentHistory
    )
      ? loan.paymentHistory
      : [];

  return (
    <section className="mb-5">

      <h3 className="mb-2.5 text-[12px] font-semibold">
        Payment History
      </h3>

      <div className="divide-y rounded-xl border border-slate-200">

        {payments.length ? (
          payments.map(
            (payment, index) => (
              <div
                key={
                  payment.id ||
                  index
                }
                className="flex items-center justify-between px-3.5 py-3"
              >
                <div>
                  <p className="text-[11px] font-semibold">
                    ₹{money(
                      payment.amount
                    )}
                  </p>

                  <p className="text-[9px] text-slate-400">
                    {formatDate(
                      payment.paymentDate
                    )}{" "}
                    •{" "}
                    {payment.receiptNumber ||
                      "No receipt"}
                  </p>
                </div>

                <p className="text-[9px] text-slate-500">
                  {payment.mode ||
                    payment.paymentMode ||
                    "—"}
                </p>
              </div>
            )
          )
        ) : (
          <div className="px-4 py-7 text-center text-[10px] text-slate-400">
            No payment history recorded.
          </div>
        )}

      </div>
    </section>
  );
};

export default LoanPaymentHistory;