// src/components/loans/LoanManagementDetails.jsx

import {
  X,
  UserRound,
  CreditCard,
  IndianRupee,
  FileText,
  CalendarDays,
  MessageSquare,
  MoreHorizontal,
  ShieldCheck,
} from "lucide-react";

/* =========================================================
   MAIN
========================================================= */

const LoanManagementDetails = ({
  loan,
  onClose,
}) => {
  if (!loan) {
    return null;
  }

  const customerName =
    loan?.customerName ||
    loan?.customer?.personal?.name ||
    "Unnamed Customer";

  const mobile =
    loan?.mobileNumber ||
    loan?.customer?.personal?.mobileNumber ||
    "—";

  const loanNumber =
    loan?.loanNumber ||
    "—";

  const loanStatus =
    getLoanStatus(loan);

  const foreclosed =
    isForeclosedLoan(loan);

  const closed =
    isClosedLoan(loan);

  const loanClosed =
    foreclosed ||
    closed;

  const vehicleName =
    getVehicleName(loan);

  /*
   * Closed / Foreclosed / Paid Off
   * loans should never show an active
   * EMI or outstanding balance.
   */
  const emi =
    loanClosed
      ? 0
      : getEmi(loan);

  const outstanding =
    loanClosed
      ? 0
      : getOutstanding(loan);

  const nextDue =
    loanClosed
      ? null
      : getNextDue(loan);

  const dueAmount =
    loanClosed
      ? 0
      : Number(
          nextDue?.paymentAmount ??
            nextDue?.emiAmount ??
            nextDue?.amount ??
            nextDue?.balance ??
            emi ??
            0
        );

  const overdueDays =
    loanClosed
      ? 0
      : getOverdueDays(
          nextDue?.dueDate
        );

  const overdueSchedule =
    loanClosed
      ? []
      : getOverdueSchedule(
          loan
        );

  const totalOverdueAmount =
    loanClosed
      ? 0
      : overdueSchedule.reduce(
          (sum, row) =>
            sum +
            Number(
              row?.balance ??
                row?.remainingAmount ??
                row?.paymentAmount ??
                row?.emiAmount ??
                row?.amount ??
                0
            ),
          0
        );

  return (
    <aside
      className="
        w-full
        shrink-0
        lg:w-[350px]
        xl:w-[360px]
      "
    >
      {/* =================================================
          LOAN SUMMARY
      ================================================== */}

      <section
        className="
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-4
            py-3
          "
        >
          <h3
            className="
              text-[13px]
              font-bold
              text-[#17221D]
            "
          >
            Loan Summary
          </h3>

          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <span
              className="
                text-[12px]
                font-bold
                text-[#0B5D3B]
              "
            >
              {loanNumber}
            </span>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-7
                w-7
                items-center
                justify-center
                rounded-md
                text-slate-400
                transition
                hover:bg-slate-50
                hover:text-slate-700
              "
              aria-label="Close"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* CUSTOMER */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            px-4
            py-3.5
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
                rounded-full
                bg-[#EAF5EF]
              "
            >
              <UserRound
                size={18}
                strokeWidth={2}
                className="
                  text-[#0B5D3B]
                "
              />
            </div>

            <div className="min-w-0">
              <p
                className="
                  truncate
                  text-[12px]
                  font-bold
                  text-[#17221D]
                "
              >
                {customerName}
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[10px]
                  text-slate-400
                "
              >
                {mobile}
              </p>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[10px]
                  font-medium
                  text-slate-500
                "
              >
                {vehicleName}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="
              shrink-0
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              py-2
              text-[10px]
              font-semibold
              text-[#0B5D3B]
              transition
              hover:border-[#A8D0BD]
              hover:bg-[#F6FBF8]
            "
          >
            View Loan
          </button>
        </div>
      </section>

      {/* =================================================
          LOAN STATUS
      ================================================== */}

      <section
        className={`
          mt-3
          rounded-xl
          border
          px-4
          py-3.5
          ${
            foreclosed
              ? "border-orange-200 bg-orange-50/60"
              : closed
                ? "border-emerald-200 bg-emerald-50/60"
                : "border-slate-200 bg-white"
          }
        `}
      >
        <div
          className="
            flex
            items-start
            gap-3
          "
        >
          <div
            className={`
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              ${
                foreclosed
                  ? "bg-orange-100 text-orange-600"
                  : closed
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-100 text-slate-600"
              }
            `}
          >
            {foreclosed ? (
              <ShieldCheck
                size={17}
                strokeWidth={2}
              />
            ) : (
              <CreditCard
                size={17}
                strokeWidth={2}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-[0.06em]
                text-slate-400
              "
            >
              Loan Status
            </p>

            <p
              className={`
                mt-0.5
                truncate
                text-[14px]
                font-bold
                ${
                  foreclosed
                    ? "text-orange-600"
                    : closed
                      ? "text-emerald-600"
                      : "text-[#17221D]"
                }
              `}
            >
              {loanStatus}
            </p>

            <p
              className="
                mt-1
                text-[9px]
                leading-4
                text-slate-500
              "
            >
              {foreclosed
                ? "This loan has been foreclosed and is no longer part of the normal collection cycle."
                : closed
                  ? "This loan has been closed and no further EMI collection is required."
                  : "This loan is currently active and remains part of the normal collection cycle."}
            </p>

            <div
              className="
                mt-3
                grid
                grid-cols-2
                gap-3
                border-t
                border-black/5
                pt-3
              "
            >
              <div>
                <p
                  className="
                    text-[8px]
                    font-medium
                    text-slate-400
                  "
                >
                  Current Status
                </p>

                <span
                  className={`
                    mt-1
                    inline-flex
                    rounded-full
                    px-2
                    py-1
                    text-[8px]
                    font-bold
                    ${
                      foreclosed
                        ? "bg-orange-100 text-orange-700"
                        : closed
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-700"
                    }
                  `}
                >
                  {loanStatus}
                </span>
              </div>

              <div className="text-right">
                <p
                  className="
                    text-[8px]
                    font-medium
                    text-slate-400
                  "
                >
                  Outstanding
                </p>

                <p
                  className="
                    mt-1
                    text-[12px]
                    font-bold
                    text-[#0B5D3B]
                  "
                >
                  ₹{formatMoney(outstanding)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          QUICK ACTIVE LOAN INFO
      ================================================== */}

      {!loanClosed && (
        <section
          className="
            mt-3
            rounded-xl
            border
            border-slate-200
            bg-white
            px-4
            py-3.5
          "
        >
          <div
            className="
              flex
              items-center
              gap-2
            "
          >
            <CreditCard
              size={14}
              strokeWidth={2}
              className="text-[#0B5D3B]"
            />

            <h3
              className="
                text-[13px]
                font-bold
                text-[#17221D]
              "
            >
              EMI Snapshot
            </h3>
          </div>

          <div
            className="
              mt-3
              grid
              grid-cols-2
              gap-x-4
              gap-y-3
            "
          >
            <CompactMetric
              label="EMI Amount"
              value={`₹${formatMoney(emi)}`}
            />

            <CompactMetric
              label="Due Date"
              value={formatDate(
                nextDue?.dueDate
              )}
            />

            <CompactMetric
              label="Due Amount"
              value={`₹${formatMoney(
                dueAmount
              )}`}
              valueClass={
                dueAmount > 0
                  ? "text-red-600"
                  : "text-slate-500"
              }
            />

            <CompactMetric
              label="Overdue Days"
              value={
                overdueDays > 0
                  ? `${overdueDays} Days`
                  : "0 Days"
              }
              valueClass={
                overdueDays > 0
                  ? "text-red-600"
                  : "text-slate-500"
              }
            />

            <CompactMetric
              label="Overdue Amount"
              value={`₹${formatMoney(
                totalOverdueAmount
              )}`}
              valueClass={
                totalOverdueAmount > 0
                  ? "text-red-600"
                  : "text-slate-500"
              }
            />

            <CompactMetric
              label="Loan Outstanding"
              value={`₹${formatMoney(
                outstanding
              )}`}
              valueClass="text-[#0B5D3B]"
            />
          </div>
        </section>
      )}


      {/* =================================================
          QUICK ACTIONS
      ================================================== */}

      <section
        className="
          mt-3
          rounded-xl
          border
          border-slate-200
          bg-white
          px-3.5
          py-3.5
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
            px-0.5
          "
        >
          <FileText
            size={14}
            strokeWidth={2}
            className="text-[#0B5D3B]"
          />

          <h3
            className="
              text-[13px]
              font-bold
              text-[#17221D]
            "
          >
            Quick Actions
          </h3>
        </div>

        <div
          className="
            mt-3
            grid
            grid-cols-2
            gap-2
          "
        >
          {!loanClosed && (
            <>
              <QuickActionButton
                icon={IndianRupee}
                label="Record Payment"
                iconBg="bg-[#EAF5EF]"
                iconColor="text-[#0B5D3B]"
              />

              <QuickActionButton
                icon={CalendarDays}
                label="View Schedule"
                iconBg="bg-[#EAF2FF]"
                iconColor="text-[#3974C9]"
              />

              <QuickActionButton
                icon={MessageSquare}
                label="Send Reminder"
                iconBg="bg-[#F0ECFF]"
                iconColor="text-[#6D5BD0]"
              />
            </>
          )}

          <QuickActionButton
            icon={CreditCard}
            label="Payment History"
            iconBg="bg-[#FFF6DE]"
            iconColor="text-[#D4A72C]"
          />

          <QuickActionButton
            icon={FileText}
            label="Add Note"
            iconBg="bg-[#E5F7F5]"
            iconColor="text-[#159A91]"
          />

          <QuickActionButton
            icon={MoreHorizontal}
            label="More Actions"
            iconBg="bg-slate-100"
            iconColor="text-slate-500"
          />
        </div>
      </section>
    </aside>
  );
};

/* =========================================================
   COMPACT METRIC
========================================================= */

const CompactMetric = ({
  label,
  value,
  valueClass = "text-[#17221D]",
}) => {
  return (
    <div
      className="
        min-w-0
      "
    >
      <p
        className="
          text-[8px]
          font-medium
          text-slate-400
        "
      >
        {label}
      </p>

      <p
        className={`
          mt-0.5
          truncate
          text-[11px]
          font-bold
          ${valueClass}
        `}
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   QUICK ACTION BUTTON
========================================================= */

const QuickActionButton = ({
  icon: Icon,
  label,
  iconBg,
  iconColor,
}) => {
  return (
    <button
      type="button"
      className="
        flex
        min-h-[64px]
        flex-col
        items-center
        justify-center
        gap-2
        rounded-lg
        border
        border-slate-200
        bg-white
        px-2
        py-2
        text-center
        transition
        duration-150
        hover:-translate-y-0.5
        hover:border-slate-300
        hover:bg-slate-50
        hover:shadow-sm
      "
    >
      <span
        className={`
          flex
          h-8
          w-8
          items-center
          justify-center
          rounded-lg
          ${iconBg}
        `}
      >
        <Icon
          size={15}
          strokeWidth={2}
          className={iconColor}
        />
      </span>

      <span
        className="
          leading-tight
          text-[9px]
          font-semibold
          text-slate-600
        "
      >
        {label}
      </span>
    </button>
  );
};

/* =========================================================
   STATUS HELPERS
========================================================= */

const normalizeStatus = (
  value
) => {
  return String(
    value || ""
  )
    .trim()
    .toUpperCase()
    .replace(/[-\s]+/g, "_");
};

const isForeclosedLoan = (
  loan
) => {
  const status =
    normalizeStatus(
      loan?.status
    );

  return (
    status === "FORECLOSED" ||
    status === "FORECLOSE"
  );
};

const isClosedLoan = (
  loan
) => {
  const status =
    normalizeStatus(
      loan?.status
    );

  return (
    status === "CLOSED" ||
    status === "PAID_OFF" ||
    status === "PAIDOFF"
  );
};

const getLoanStatus = (
  loan
) => {
  const raw =
    loan?.status ||
    "Active";

  const normalized =
    normalizeStatus(raw);

  if (
    normalized ===
    "FORECLOSED"
  ) {
    return "Foreclosed";
  }

  if (
    normalized ===
      "CLOSED" ||
    normalized ===
      "PAID_OFF" ||
    normalized ===
      "PAIDOFF"
  ) {
    return "Closed";
  }

  if (
    normalized ===
    "ACTIVE"
  ) {
    return "Active";
  }

  if (
    normalized ===
    "OVERDUE"
  ) {
    return "Overdue";
  }

  if (
    normalized ===
    "PENDING"
  ) {
    return "Pending";
  }

  return String(raw);
};

/* =========================================================
   VEHICLE
========================================================= */

const getVehicleName = (
  loan
) => {
  return (
    [
      loan?.vehicle?.brand,
      loan?.vehicle?.model,
      loan?.vehicle?.variant,
    ]
      .filter(Boolean)
      .join(" ") ||
    "Vehicle not assigned"
  );
};

/* =========================================================
   NEXT DUE
========================================================= */

const getNextDue = (
  loan
) => {
  if (
    isForeclosedLoan(loan) ||
    isClosedLoan(loan)
  ) {
    return null;
  }

  const schedule =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];

  let best = null;

  schedule.forEach(
    (row) => {
      const rowStatus =
        String(
          row?.status || ""
        )
          .trim()
          .toLowerCase()
          .replace(/[-_]+/g, " ");

      if (
        [
          "paid",
          "completed",
          "closed",
          "settled",
          "foreclosed",
          "cancelled",
        ].includes(
          rowStatus
        )
      ) {
        return;
      }

      const dueDate =
        parseLocalDate(
          row?.dueDate
        );

      if (!dueDate) {
        return;
      }

      const amount =
        Number(
          row?.balance ??
            row?.remainingAmount ??
            row?.paymentAmount ??
            row?.emiAmount ??
            row?.amount ??
            0
        );

      if (
        amount <= 0
      ) {
        return;
      }

      if (
        !best ||
        dueDate.getTime() <
          best.dueDate.getTime()
      ) {
        best = {
          dueDate,
          amount,

          paymentAmount:
            row?.paymentAmount,

          emiAmount:
            row?.emiAmount,

          remainingAmount:
            row?.remainingAmount,

          balance:
            row?.balance,
        };
      }
    }
  );

  return best;
};

/* =========================================================
   EMI
========================================================= */

const getEmi = (
  loan
) => {
  if (
    isForeclosedLoan(loan) ||
    isClosedLoan(loan)
  ) {
    return 0;
  }

  if (
    loan?.repayment?.method ===
    "Principal"
  ) {
    return (
      loan?.repaymentSchedule?.[0]
        ?.paymentAmount ||
      loan?.calculation
        ?.paymentAmount ||
      0
    );
  }

  return (
    loan?.calculation
      ?.emiAmount ||
    loan?.emiAmount ||
    0
  );
};

/* =========================================================
   OUTSTANDING
========================================================= */

const getOutstanding = (
  loan
) => {
  if (
    isForeclosedLoan(loan) ||
    isClosedLoan(loan)
  ) {
    return 0;
  }

  const totalDue =
    Number(
      loan?.calculation
        ?.totalDue ||
        loan?.totalDue ||
        0
    );

  const paid =
    Array.isArray(
      loan?.paymentHistory
    )
      ? loan.paymentHistory.reduce(
          (sum, payment) =>
            sum +
            Number(
              payment?.amount ||
                0
            ),
          0
        )
      : 0;

  return Math.max(
    totalDue - paid,
    0
  );
};

/* =========================================================
   OVERDUE DAYS
========================================================= */

const getOverdueDays = (
  dueDate
) => {
  if (!dueDate) {
    return 0;
  }

  const due =
    parseLocalDate(
      dueDate
    );

  if (!due) {
    return 0;
  }

  due.setHours(
    0,
    0,
    0,
    0
  );

  const now =
    new Date();

  now.setHours(
    0,
    0,
    0,
    0
  );

  const difference =
    Math.floor(
      (
        now.getTime() -
        due.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    );

  return Math.max(
    difference,
    0
  );
};

/* =========================================================
   OVERDUE SCHEDULE
========================================================= */

const getOverdueSchedule = (
  loan
) => {
  if (
    isForeclosedLoan(loan) ||
    isClosedLoan(loan)
  ) {
    return [];
  }

  const schedule =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];

  const today =
    new Date();

  today.setHours(
    0,
    0,
    0,
    0
  );

  return schedule.filter(
    (row) => {
      const status =
        String(
          row?.status || ""
        )
          .trim()
          .toLowerCase()
          .replace(/[-_]+/g, " ");

      if (
        [
          "paid",
          "completed",
          "closed",
          "settled",
          "foreclosed",
          "cancelled",
        ].includes(
          status
        )
      ) {
        return false;
      }

      if (
        ![
          "pending",
          "overdue",
          "partially paid",
        ].includes(status)
      ) {
        return false;
      }

      if (
        !row?.dueDate
      ) {
        return false;
      }

      const dueDate =
        parseLocalDate(
          row.dueDate
        );

      if (!dueDate) {
        return false;
      }

      dueDate.setHours(
        0,
        0,
        0,
        0
      );

      return (
        dueDate.getTime() <
        today.getTime()
      );
    }
  );
};

/* =========================================================
   DATE PARSER
========================================================= */

const parseLocalDate = (
  value
) => {
  if (!value) {
    return null;
  }

  const raw =
    String(value);

  const match =
    raw.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (match) {
    const [
      ,
      year,
      month,
      day,
    ] = match;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day)
    );
  }

  const date =
    new Date(value);

  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;
};

/* =========================================================
   MONEY
========================================================= */

const formatMoney = (
  value
) => {
  return Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );
};

/* =========================================================
   DATE
========================================================= */

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    value instanceof Date
      ? value
      : parseLocalDate(
          value
        );

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

export default LoanManagementDetails;