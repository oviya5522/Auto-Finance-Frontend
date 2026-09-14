// src/pages/customers/CustomerPaymentHistoryModal.jsx

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  X,
} from "lucide-react";

/* =========================================================
   HELPERS
========================================================= */

const toNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

const money = (value) =>
  Number(
    toNumber(value)
  ).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  );

const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

/* =========================================================
   STATUS
========================================================= */

const getPaymentStatus = (payment) => {
  const raw = normalize(
    payment?.status ||
      payment?.paymentStatus ||
      payment?.state
  );

  if (
    raw === "approved" ||
    raw === "paid" ||
    raw === "completed" ||
    raw === "settled"
  ) {
    return "Approved";
  }

  if (raw === "pending") {
    return "Pending";
  }

  if (raw === "rejected") {
    return "Rejected";
  }

  if (raw === "reversed") {
    return "Reversed";
  }

  return "Recorded";
};

const getStatusClasses = (status) => {
  switch (status) {
    case "Approved":
      return "border-emerald-100 bg-emerald-50 text-emerald-700";

    case "Pending":
      return "border-amber-100 bg-amber-50 text-amber-700";

    case "Rejected":
      return "border-red-100 bg-red-50 text-red-700";

    case "Reversed":
      return "border-violet-100 bg-violet-50 text-violet-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
};

/* =========================================================
   DATE
========================================================= */

const getPaymentDate = (payment) =>
  payment?.date ||
  payment?.paidAt ||
  payment?.paymentDate ||
  payment?.createdAt ||
  "";

/* =========================================================
   GROUP PAYMENT HISTORY
========================================================= */

const getPaymentGroupKey = (
  payment,
  index
) => {
  if (payment?.collectionId) {
    return `collection-${payment.collectionId}`;
  }

  const receipt =
    payment?.receiptNumber ||
    payment?.receiptNo ||
    "";

  if (receipt) {
    return `receipt-${receipt}`;
  }

  const loanId =
    payment?.loanId ||
    payment?.loanNumber ||
    "";

  const date =
    getPaymentDate(payment);

  const installment =
    payment?.installmentNumber ??
    payment?.installmentNo ??
    payment?.installment ??
    "";

  return [
    "legacy",
    loanId,
    date,
    installment,
    index,
  ].join("-");
};

const groupPaymentHistory = (
  paymentHistory
) => {
  const groups = new Map();

  paymentHistory.forEach(
    (payment, index) => {
      const key =
        getPaymentGroupKey(
          payment,
          index
        );

      const existing =
        groups.get(key);

      if (existing) {
        existing.records.push(payment);

        if (
          !existing.paymentDate &&
          getPaymentDate(payment)
        ) {
          existing.paymentDate =
            getPaymentDate(payment);
        }

        if (
          !existing.paymentMode &&
          (
            payment?.paymentMode ||
            payment?.payMode ||
            payment?.mode
          )
        ) {
          existing.paymentMode =
            payment?.paymentMode ||
            payment?.payMode ||
            payment?.mode;
        }

        if (
          !existing.receiptNumber &&
          (
            payment?.receiptNumber ||
            payment?.receiptNo
          )
        ) {
          existing.receiptNumber =
            payment?.receiptNumber ||
            payment?.receiptNo;
        }

        if (
          !existing.loanNumber &&
          (
            payment?.loanNumber ||
            payment?.loanId
          )
        ) {
          existing.loanNumber =
            payment?.loanNumber ||
            payment?.loanId;
        }

        if (
          (
            existing.installment === "—" ||
            existing.installment === ""
          ) &&
          (
            payment?.installmentNumber !== undefined ||
            payment?.installmentNo !== undefined ||
            payment?.installment !== undefined
          )
        ) {
          existing.installment =
            payment?.installmentNumber ??
            payment?.installmentNo ??
            payment?.installment ??
            "—";
        }

        return;
      }

      groups.set(key, {
        key,

        collectionId:
          payment?.collectionId || "",

        records: [payment],

        paymentDate:
          getPaymentDate(payment),

        paymentMode:
          payment?.paymentMode ||
          payment?.payMode ||
          payment?.mode ||
          "—",

        receiptNumber:
          payment?.receiptNumber ||
          payment?.receiptNo ||
          payment?.collectionId ||
          payment?.id ||
          `PAY-${String(
            index + 1
          ).padStart(3, "0")}`,

        installment:
          payment?.installmentNumber ??
          payment?.installmentNo ??
          payment?.installment ??
          "—",

        loanNumber:
          payment?.loanNumber ||
          payment?.loanId ||
          "—",
      });
    }
  );

  return Array.from(
    groups.values()
  );
};

/* =========================================================
   ROUND
========================================================= */

const round = (value) =>
  Math.round(
    (
      toNumber(value) +
      Number.EPSILON
    ) *
      100
  ) / 100;

/* =========================================================
   AGGREGATE PAYMENT
========================================================= */

const aggregatePaymentGroup = (
  group
) => {
  const records =
    Array.isArray(
      group?.records
    )
      ? group.records
      : [];

  const totalPaymentRecord =
    records.find(
      (payment) =>
        toNumber(
          payment?.totalPaymentAmount
        ) > 0
    );

  const totalAmount =
    totalPaymentRecord
      ? toNumber(
          totalPaymentRecord?.totalPaymentAmount
        )
      : records.reduce(
          (sum, payment) =>
            sum +
            toNumber(
              payment?.amount
            ),
          0
        );

  const penalty =
    records.reduce(
      (sum, payment) =>
        sum +
        toNumber(
          payment?.amountTowardPenalty ??
            payment?.penaltyApplied
        ),
      0
    );

  const interest =
    records.reduce(
      (sum, payment) =>
        sum +
        toNumber(
          payment?.amountTowardInterest ??
            payment?.interestApplied
        ),
      0
    );

  const principal =
    records.reduce(
      (sum, payment) =>
        sum +
        toNumber(
          payment?.amountTowardPrincipal ??
            payment?.principalApplied
        ),
      0
    );

  const due =
    records.reduce(
      (sum, payment) =>
        sum +
        toNumber(
          payment?.amountTowardDue
        ),
      0
    );

  const advance =
    records.reduce(
      (sum, payment) =>
        sum +
        toNumber(
          payment?.amountTowardAdvance
        ),
      0
    );

  const excess =
    records.reduce(
      (sum, payment) =>
        sum +
        toNumber(
          payment?.amountExcess
        ),
      0
    );

  const base =
    records[0] || {};

  const status =
    records.some(
      (payment) =>
        getPaymentStatus(
          payment
        ) === "Approved"
    )
      ? "Approved"
      : getPaymentStatus(base);

  const remarks =
    records
      .map(
        (payment) =>
          payment?.remarks
      )
      .find(Boolean);

  const location =
    records
      .map(
        (payment) =>
          payment?.location
      )
      .find(Boolean);

  const approvedBy =
    records
      .map(
        (payment) =>
          payment?.approvedBy
      )
      .find(Boolean);

  const reversedBy =
    records
      .map(
        (payment) =>
          payment?.reversedBy
      )
      .find(Boolean);

  return {
    ...base,

    id:
      group?.collectionId ||
      base?.id,

    collectionId:
      group?.collectionId ||
      base?.collectionId ||
      "",

    amount:
      round(totalAmount),

    totalPaymentAmount:
      round(totalAmount),

    paymentDate:
      group?.paymentDate ||
      getPaymentDate(base),

    date:
      group?.paymentDate ||
      getPaymentDate(base),

    paymentMode:
      group?.paymentMode ||
      "—",

    mode:
      group?.paymentMode ||
      "—",

    receiptNumber:
      group?.receiptNumber ||
      "—",

    installment:
      group?.installment ??
      "—",

    loanNumber:
      group?.loanNumber ||
      "—",

    paymentType:
      base?.paymentType ||
      base?.type ||
      "Repayment",

    status,

    amountTowardPenalty:
      round(penalty),

    amountTowardInterest:
      round(interest),

    amountTowardPrincipal:
      round(principal),

    amountTowardDue:
      round(due),

    amountTowardAdvance:
      round(advance),

    amountExcess:
      round(excess),

    remarks,

    location,

    approvedBy,

    reversedBy,
  };
};

/* =========================================================
   PAYMENT CARD
========================================================= */

const PaymentHistoryItem = ({
  payment,
  index,
}) => {
  const amount =
    toNumber(
      payment?.amount
    );

  const status =
    payment?.status ||
    "Recorded";

  const paymentType =
    payment?.paymentType ||
    "Repayment";

  return (
    <article
      className="
        overflow-hidden
        rounded-2xl
        border
        border-slate-200
        bg-white
        shadow-sm
        transition
        duration-200
        hover:border-[#CBE4D5]
        hover:shadow-md
      "
    >
      <div
        className="
          flex
          flex-col
          gap-4
          px-4
          py-4
          lg:flex-row
          lg:items-center
          lg:gap-5
        "
      >
        {/* =================================================
            PAYMENT IDENTITY
        ================================================== */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
            lg:w-[250px]
            lg:shrink-0
          "
        >
          <div
            className="
              flex
              h-11
              w-11
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-[#EAF5EF]
              text-[#0B6B43]
            "
          >
            <IndianRupee
              size={19}
              strokeWidth={2.2}
            />
          </div>

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                flex
                flex-wrap
                items-center
                gap-2
              "
            >
              <p
                className="
                  truncate
                  text-[14px]
                  font-extrabold
                  text-[#17221D]
                "
              >
                {paymentType}
              </p>

              <span
                className={`
                  inline-flex
                  shrink-0
                  rounded-full
                  border
                  px-2
                  py-1
                  text-[9px]
                  font-extrabold
                  ${getStatusClasses(
                    status
                  )}
                `}
              >
                {status}
              </span>
            </div>

            <p
              className="
                mt-1
                truncate
                text-[10px]
                font-semibold
                text-slate-400
              "
            >
              #{index + 1}
              {" · "}
              {payment?.receiptNumber ||
                payment?.collectionId ||
                "Payment"}
            </p>
          </div>
        </div>

        {/* =================================================
            DATE / MODE / INSTALLMENT
        ================================================== */}

        <div
          className="
            grid
            flex-1
            grid-cols-2
            gap-x-5
            gap-y-3
            sm:grid-cols-4
            lg:min-w-0
          "
        >
          <CompactInfo
            icon={CalendarDays}
            label="Date"
            value={formatDateTime(
              payment?.paymentDate ||
                payment?.date
            )}
          />

          <CompactInfo
            icon={Clock3}
            label="Mode"
            value={
              payment?.paymentMode ||
              payment?.mode ||
              "—"
            }
          />

          <CompactInfo
            label="Installment"
            value={
              payment?.installment ??
              "—"
            }
          />

          <CompactInfo
            label="Loan"
            value={
              payment?.loanNumber ||
              payment?.loanId ||
              "—"
            }
          />
        </div>

        {/* =================================================
            AMOUNT
        ================================================== */}

        <div
          className="
            shrink-0
            rounded-xl
            border
            border-[#D9EDE1]
            bg-[#F1FAF4]
            px-4
            py-3
            lg:min-w-[155px]
            lg:text-right
          "
        >
          <p
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-wide
              text-[#5C806E]
            "
          >
            Total Payment
          </p>

          <p
            className="
              mt-1
              text-[21px]
              font-extrabold
              tracking-tight
              text-[#0B6B43]
            "
          >
            ₹
            {money(amount)}
          </p>
        </div>
      </div>

      {/* =================================================
          PAYMENT BREAKDOWN
      ================================================== */}

      <div
        className="
          border-t
          border-slate-100
          bg-[#F8FAF9]
          px-4
          py-3
        "
      >
        <div
          className="
            flex
            flex-wrap
            items-center
            gap-x-6
            gap-y-2
          "
        >
          <BreakdownValue
            label="Penalty"
            value={
              payment?.amountTowardPenalty
            }
            tone="amber"
          />

          <BreakdownValue
            label="Due"
            value={
              payment?.amountTowardDue
            }
            tone="green"
          />

          <BreakdownValue
            label="Interest"
            value={
              payment?.amountTowardInterest
            }
            tone="blue"
          />

          <BreakdownValue
            label="Principal"
            value={
              payment?.amountTowardPrincipal
            }
            tone="violet"
          />

          <BreakdownValue
            label="Advance"
            value={
              payment?.amountTowardAdvance
            }
            tone="indigo"
          />

          <BreakdownValue
            label="Excess"
            value={
              payment?.amountExcess
            }
            tone="slate"
          />
        </div>
      </div>

      {/* =================================================
          OPTIONAL EXTRA INFO
      ================================================== */}

      {(
        payment?.remarks ||
        payment?.location ||
        payment?.approvedBy ||
        payment?.reversedBy
      ) && (
        <div
          className="
            grid
            gap-2
            border-t
            border-slate-100
            bg-white
            px-4
            py-3
            sm:grid-cols-2
          "
        >
          {payment?.remarks && (
            <HistoryText
              label="Remarks"
              value={
                payment.remarks
              }
            />
          )}

          {payment?.location && (
            <HistoryText
              label="Collection Location"
              value={
                payment.location
              }
            />
          )}

          {payment?.approvedBy && (
            <HistoryText
              label="Approved By"
              value={
                payment.approvedBy
              }
            />
          )}

          {payment?.reversedBy && (
            <HistoryText
              label="Reversed By"
              value={
                payment.reversedBy
              }
            />
          )}
        </div>
      )}
    </article>
  );
};

/* =========================================================
   COMPACT INFO
========================================================= */

const CompactInfo = ({
  icon: Icon,
  label,
  value,
}) => (
  <div
    className="
      min-w-0
    "
  >
    <div
      className="
        flex
        items-center
        gap-1.5
      "
    >
      {Icon ? (
        <Icon
          size={12}
          className="shrink-0 text-[#0B6B43]"
        />
      ) : null}

      <p
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        {label}
      </p>
    </div>

    <p
      className="
        mt-1
        truncate
        text-[11px]
        font-extrabold
        text-[#253252]
      "
      title={value}
    >
      {value || "—"}
    </p>
  </div>
);

/* =========================================================
   BREAKDOWN VALUE
========================================================= */

const BreakdownValue = ({
  label,
  value,
  tone = "slate",
}) => {
  const toneClasses = {
    amber:
      "text-amber-700",
    green:
      "text-[#0B6B43]",
    blue:
      "text-blue-700",
    violet:
      "text-violet-700",
    indigo:
      "text-indigo-700",
    slate:
      "text-slate-700",
  };

  return (
    <div
      className="
        flex
        items-center
        gap-2
      "
    >
      <span
        className="
          text-[9px]
          font-bold
          uppercase
          tracking-wide
          text-slate-400
        "
      >
        {label}
      </span>

      <span
        className={`
          text-[12px]
          font-extrabold
          ${toneClasses[tone] || toneClasses.slate}
        `}
      >
        ₹
        {money(value)}
      </span>
    </div>
  );
};

/* =========================================================
   HISTORY TEXT
========================================================= */

const HistoryText = ({
  label,
  value,
}) => (
  <div
    className="
      rounded-xl
      border
      border-slate-100
      bg-[#F8FAF9]
      px-3
      py-2.5
    "
  >
    <p
      className="
        text-[8px]
        font-bold
        uppercase
        tracking-wide
        text-slate-400
      "
    >
      {label}
    </p>

    <p
      className="
        mt-1
        break-words
        text-[10px]
        font-semibold
        text-[#253252]
      "
    >
      {value}
    </p>
  </div>
);

/* =========================================================
   MAIN MODAL
========================================================= */

const CustomerPaymentHistoryModal = ({
  customer,
  loan,
  paymentHistory = [],
  onClose,
}) => {
  const customerName =
    customer?.customer?.personal?.name ||
    customer?.customer?.customerName ||
    "Customer";

  const customerNumber =
    customer?.customer?.customerNumber ||
    customer?.customer?.id ||
    "—";

  const loanNumber =
    loan?.loanNumber ||
    "—";

  const groupedPayments =
    groupPaymentHistory(
      paymentHistory
    );

  const payments =
    groupedPayments.map(
      aggregatePaymentGroup
    );

  const totalPaid =
    payments.reduce(
      (sum, payment) =>
        sum +
        toNumber(
          payment?.amount
        ),
      0
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-[500]
        flex
        items-center
        justify-center
        bg-slate-950/45
        p-3
        backdrop-blur-[3px]
        sm:p-5
      "
      onClick={
        onClose
      }
    >
      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-[1120px]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-[#F7FAF8]
          shadow-[0_28px_100px_rgba(15,23,42,0.25)]
        "
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div
          className="
            shrink-0
            border-b
            border-slate-200
            bg-white
            px-4
            py-4
            sm:px-5
          "
        >
          <div
            className="
              flex
              items-start
              justify-between
              gap-4
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-10
                  w-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#EAF5EF]
                  text-[#0B6B43]
                "
              >
                <CheckCircle2
                  size={19}
                />
              </div>

              <div
                className="
                  min-w-0
                "
              >
                <h2
                  className="
                    text-[18px]
                    font-extrabold
                    tracking-tight
                    text-[#17221D]
                  "
                >
                  Payment History
                </h2>

                <p
                  className="
                    mt-1
                    truncate
                    text-[11px]
                    font-medium
                    text-slate-400
                  "
                >
                  {customerName}
                  {" · "}
                  {customerNumber}
                  {" · "}
                  Loan {loanNumber}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-xl
                border
                border-slate-200
                bg-white
                text-slate-400
                transition
                hover:border-slate-300
                hover:bg-slate-50
                hover:text-slate-700
              "
              aria-label="Close payment history"
            >
              <X
                size={17}
              />
            </button>
          </div>

          <div
            className="
              mt-4
              grid
              grid-cols-2
              gap-2
              sm:grid-cols-3
            "
          >
            <HeaderStat
              label="Payments"
              value={
                payments.length
              }
            />

            <HeaderStat
              label="Total Paid"
              value={`₹${money(
                totalPaid
              )}`}
              green
            />

            <HeaderStat
              label="Account"
              value={
                loan?.status ||
                "Active"
              }
              green
            />
          </div>
        </div>

        {/* CONTENT */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            p-3
            sm:p-4
          "
        >
          {payments.length ===
          0 ? (
            <div
              className="
                flex
                min-h-[280px]
                items-center
                justify-center
                rounded-2xl
                border
                border-dashed
                border-slate-200
                bg-white
                px-5
                text-center
              "
            >
              <div>
                <div
                  className="
                    mx-auto
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-2xl
                    bg-slate-50
                    text-slate-400
                  "
                >
                  <Clock3
                    size={21}
                  />
                </div>

                <p
                  className="
                    mt-3
                    text-[14px]
                    font-extrabold
                    text-[#17221D]
                  "
                >
                  No payment history available
                </p>

                <p
                  className="
                    mx-auto
                    mt-1
                    max-w-sm
                    text-[11px]
                    leading-5
                    text-slate-400
                  "
                >
                  Payments recorded against this
                  customer loan will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div
              className="
                space-y-3
              "
            >
              {payments.map(
                (
                  payment,
                  index
                ) => (
                  <PaymentHistoryItem
                    key={
                      payment?.collectionId ||
                      payment?.id ||
                      index
                    }
                    payment={
                      payment
                    }
                    index={
                      index
                    }
                  />
                )
              )}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div
          className="
            shrink-0
            border-t
            border-slate-200
            bg-white
            px-4
            py-3
            text-right
            sm:px-5
          "
        >
          <button
            type="button"
            onClick={
              onClose
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-4
              text-[10px]
              font-extrabold
              text-slate-600
              transition
              hover:bg-slate-50
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   HEADER STAT
========================================================= */

const HeaderStat = ({
  label,
  value,
  green = false,
}) => (
  <div
    className="
      rounded-xl
      border
      border-slate-100
      bg-[#F8FAF9]
      px-3
      py-2.5
    "
  >
    <p
      className="
        text-[8px]
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
        truncate
        text-[15px]
        font-extrabold
        ${
          green
            ? "text-[#0B6B43]"
            : "text-[#17221D]"
        }
      `}
    >
      {value}
    </p>
  </div>
);

export default CustomerPaymentHistoryModal;