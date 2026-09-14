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
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="mb-2.5 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-[12px] font-extrabold text-[#17221D]">
            Payment History
          </h3>

          <p className="mt-0.5 text-[8px] text-slate-400">
            Complete repayment details for this loan
          </p>
        </div>

        {payments.length > 0 && (
          <span className="rounded-full bg-[#EAF5EF] px-2.5 py-1 text-[8px] font-extrabold text-[#0B5D3B]">
            {payments.length} Payment
            {payments.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {/* =====================================================
          PAYMENT LIST
      ====================================================== */}

      {payments.length ? (
        <div className="space-y-2.5">
          {payments.map(
            (payment, index) => {
              /*
               * Keep the existing payment data untouched.
               * The UI reads optional breakdown fields when
               * available and safely falls back to zero.
               */

              const totalAmount = Number(
                payment?.amount || 0
              );

              const penaltyAmount = Number(
                payment?.penaltyAmount ||
                  payment?.penalty ||
                  payment?.amountTowardPenalty ||
                  0
              );

              const interestAmount = Number(
                payment?.interestAmount ||
                  payment?.interest ||
                  payment?.amountTowardInterest ||
                  0
              );

              const principalAmount = Number(
                payment?.principalAmount ||
                  payment?.principal ||
                  payment?.amountTowardPrincipal ||
                  0
              );

              const advanceAmount = Number(
                payment?.advanceAmount ||
                  payment?.advance ||
                  payment?.amountTowardAdvance ||
                  0
              );

              const excessAmount = Number(
                payment?.excessAmount ||
                  payment?.excess ||
                  payment?.amountExcess ||
                  0
              );

              const paymentMode =
                payment?.mode ||
                payment?.paymentMode ||
                "—";

              const receiptNumber =
                payment?.receiptNumber ||
                "No receipt";

              const status =
                payment?.status ||
                payment?.paymentStatus ||
                "Completed";

              return (
                <div
                  key={
                    payment?.id ||
                    index
                  }
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                    transition
                    duration-200
                    hover:border-[#CFE5D8]
                    hover:shadow-md
                  "
                >
                  {/* =================================================
                      PAYMENT HEADER
                  ================================================== */}

                  <div
                    className="
                      flex
                      flex-col
                      gap-3
                      border-b
                      border-slate-100
                      bg-[#F8FAF9]
                      px-3.5
                      py-3
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                    "
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#EAF5EF]
                            text-[#0B6B43]
                          "
                        >
                          <span className="text-[11px] font-extrabold">
                            ₹
                          </span>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[10px] font-extrabold text-[#17221D]">
                            Payment #{index + 1}
                          </p>

                          <p className="mt-0.5 truncate text-[8px] text-slate-400">
                            {formatDate(
                              payment?.paymentDate
                            )}{" "}
                            •{" "}
                            {receiptNumber}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className="
                          rounded-full
                          bg-[#EAF5EF]
                          px-2
                          py-1
                          text-[7px]
                          font-extrabold
                          text-[#0B6B43]
                        "
                      >
                        {status}
                      </span>

                      <span
                        className="
                          rounded-lg
                          bg-white
                          px-2.5
                          py-1.5
                          text-[11px]
                          font-extrabold
                          text-[#17221D]
                          ring-1
                          ring-slate-100
                        "
                      >
                        ₹
                        {money(
                          totalAmount
                        )}
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      PAYMENT BREAKDOWN
                  ================================================== */}

                  <div className="p-3.5">
                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-2
                        sm:grid-cols-3
                        lg:grid-cols-5
                      "
                    >
                      <PaymentBreakdown
                        label="Penalty"
                        value={
                          penaltyAmount
                        }
                        tone="orange"
                      />

                      <PaymentBreakdown
                        label="Interest"
                        value={
                          interestAmount
                        }
                        tone="blue"
                      />

                      <PaymentBreakdown
                        label="Principal"
                        value={
                          principalAmount
                        }
                        tone="green"
                      />

                      <PaymentBreakdown
                        label="Advance"
                        value={
                          advanceAmount
                        }
                        tone="purple"
                      />

                      <PaymentBreakdown
                        label="Excess"
                        value={
                          excessAmount
                        }
                        tone="slate"
                      />
                    </div>

                    {/* =================================================
                        TOTAL / PAYMENT INFO
                    ================================================== */}

                    <div
                      className="
                        mt-2.5
                        grid
                        grid-cols-1
                        gap-2
                        sm:grid-cols-3
                      "
                    >
                      <div
                        className="
                          rounded-lg
                          border
                          border-[#CFE8D9]
                          bg-[#F0FAF4]
                          px-3
                          py-2.5
                        "
                      >
                        <p
                          className="
                            text-[7px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-[#0B6B43]/60
                          "
                        >
                          Total Payment
                        </p>

                        <p
                          className="
                            mt-1
                            text-[14px]
                            font-extrabold
                            text-[#0B6B43]
                          "
                        >
                          ₹
                          {money(
                            totalAmount
                          )}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-lg
                          border
                          border-slate-100
                          bg-slate-50
                          px-3
                          py-2.5
                        "
                      >
                        <p
                          className="
                            text-[7px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-400
                          "
                        >
                          Payment Mode
                        </p>

                        <p
                          className="
                            mt-1
                            text-[10px]
                            font-extrabold
                            text-[#253252]
                          "
                        >
                          {paymentMode}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-lg
                          border
                          border-slate-100
                          bg-slate-50
                          px-3
                          py-2.5
                        "
                      >
                        <p
                          className="
                            text-[7px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-400
                          "
                        >
                          Receipt
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-[10px]
                            font-extrabold
                            text-[#253252]
                          "
                        >
                          {receiptNumber}
                        </p>
                      </div>
                    </div>

                    {/* =================================================
                        BREAKDOWN TOTAL
                    ================================================== */}

                    <div
                      className="
                        mt-2.5
                        flex
                        flex-col
                        gap-2
                        rounded-lg
                        border
                        border-slate-100
                        bg-white
                        px-3
                        py-2.5
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                      "
                    >
                      <div>
                        <p
                          className="
                            text-[7px]
                            font-bold
                            uppercase
                            tracking-wide
                            text-slate-400
                          "
                        >
                          Payment Breakdown
                        </p>

                        <p
                          className="
                            mt-0.5
                            text-[8px]
                            text-slate-400
                          "
                        >
                          Penalty + Interest + Principal
                          + Advance + Excess
                        </p>
                      </div>

                      <p
                        className="
                          text-[12px]
                          font-extrabold
                          text-[#17221D]
                        "
                      >
                        ₹
                        {money(
                          totalAmount
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <div
          className="
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-8
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-lg
              bg-slate-50
              text-slate-400
            "
          >
            ₹
          </div>

          <p
            className="
              mt-2.5
              text-[10px]
              font-bold
              text-[#17221D]
            "
          >
            No payment history recorded.
          </p>

          <p
            className="
              mt-1
              text-[8px]
              text-slate-400
            "
          >
            Payment transactions will appear here
            once recorded.
          </p>
        </div>
      )}
    </section>
  );
};

/* =========================================================
   PAYMENT BREAKDOWN
========================================================= */

const PaymentBreakdown = ({
  label,
  value,
  tone = "slate",
}) => {
  const styles = {
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-700",
    },

    blue: {
      bg: "bg-blue-50",
      text: "text-blue-700",
    },

    green: {
      bg: "bg-[#EAF5EF]",
      text: "text-[#0B6B43]",
    },

    purple: {
      bg: "bg-purple-50",
      text: "text-purple-700",
    },

    slate: {
      bg: "bg-slate-50",
      text: "text-slate-700",
    },
  };

  const current =
    styles[tone] ||
    styles.slate;

  return (
    <div
      className={`
        rounded-lg
        ${current.bg}
        px-2.5
        py-2
      `}
    >
      <p
        className="
          text-[7px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-1
          text-[10px]
          font-extrabold
          ${current.text}
        `}
      >
        ₹
        {money(value)}
      </p>
    </div>
  );
};

export default LoanPaymentHistory;