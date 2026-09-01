import {
  X,
  FileText,
  CheckCircle2,
  Clock3,
  AlertTriangle,
} from "lucide-react";

const LoanRepaymentScheduleModal = ({
  loan,
  onClose,
}) => {
  if (!loan) {
    return null;
  }

  const schedule =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];

  const customerName =
    loan?.customerName ||
    loan?.customer?.personal?.name ||
    "Unnamed Customer";

  const loanNumber =
    loan?.loanNumber || "—";

  const summary =
    calculateSummary(schedule);

  return (
    <div
      className="
        fixed
        inset-0
        z-[500]
        flex
        items-center
        justify-center
        bg-slate-950/40
        p-3
        backdrop-blur-[2px]
        sm:p-5
      "
      onClick={onClose}
    >
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-[1000px]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-2xl
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            px-4
            py-3
            sm:px-5
          "
        >
          <div className="flex min-w-0 items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                rounded-lg
                bg-[#EAF5EF]
              "
            >
              <FileText
                size={17}
                className="text-[#0B5D3B]"
              />
            </div>

            <div className="min-w-0">
              <h2 className="truncate text-[14px] font-semibold text-[#17221D]">
                Repayment Schedule
              </h2>

              <p className="mt-0.5 truncate text-[9px] text-slate-400">
                {loanNumber} • {customerName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-50
              hover:text-slate-700
            "
            aria-label="Close repayment schedule"
          >
            <X size={16} />
          </button>
        </div>

        {/* =================================================
            SUMMARY
        ================================================== */}

        <div
          className="
            grid
            shrink-0
            grid-cols-2
            gap-2
            border-b
            border-slate-100
            bg-[#FBFCFB]
            p-3
            sm:grid-cols-4
            sm:px-5
          "
        >
          <SummaryCard
            label="Total EMI"
            value={`₹${formatMoney(
              summary.totalEmi
            )}`}
            tone="green"
          />

          <SummaryCard
            label="Principal"
            value={`₹${formatMoney(
              summary.totalPrincipal
            )}`}
            tone="neutral"
          />

          <SummaryCard
            label="Interest"
            value={`₹${formatMoney(
              summary.totalInterest
            )}`}
            tone="purple"
          />

          <SummaryCard
            label="Completed"
            value={`${summary.paidCount}/${summary.totalCount}`}
            tone="blue"
          />
        </div>

        {/* =================================================
            TABLE
        ================================================== */}

        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-full min-w-[850px] border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8FAF9]">
              <tr className="border-b border-slate-200">
                <TableHeader>
                  #
                </TableHeader>

                <TableHeader>
                  Due Date
                </TableHeader>

                <TableHeader align="right">
                  Principal
                </TableHeader>

                <TableHeader align="right">
                  Interest
                </TableHeader>

                <TableHeader align="right">
                  EMI Amount
                </TableHeader>

                <TableHeader>
                  Balance
                </TableHeader>

                <TableHeader>
                  Status
                </TableHeader>
              </tr>
            </thead>

            <tbody>
              {schedule.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-14 text-center"
                  >
                    <p className="text-[11px] font-semibold text-[#17221D]">
                      No repayment schedule
                    </p>

                    <p className="mt-1 text-[9px] text-slate-400">
                      No repayment entries are available for this loan.
                    </p>
                  </td>
                </tr>
              ) : (
                schedule.map(
                  (row, index) => (
                    <RepaymentRow
                      key={
                        row?.id ||
                        `${loanNumber}-${index}`
                      }
                      row={row}
                      index={index}
                    />
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            flex-wrap
            items-center
            justify-between
            gap-2
            border-t
            border-slate-100
            bg-white
            px-4
            py-3
            sm:px-5
          "
        >
          <div className="flex flex-wrap items-center gap-3">
            <Legend
              icon={CheckCircle2}
              color="text-emerald-600"
              label="Paid"
            />

            <Legend
              icon={Clock3}
              color="text-blue-600"
              label="Pending"
            />

            <Legend
              icon={AlertTriangle}
              color="text-red-600"
              label="Overdue"
            />
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              py-1.5
              text-[10px]
              font-semibold
              text-slate-600
              transition
              hover:border-slate-300
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
   REPAYMENT ROW
========================================================= */

const RepaymentRow = ({
  row,
  index,
}) => {
  const status =
    String(
      row?.status || "Pending"
    )
      .trim()
      .toLowerCase();

  const principal =
    Number(
      row?.principal ||
        row?.principalAmount ||
        row?.principalComponent ||
        0
    );

  const interest =
    Number(
      row?.interest ||
        row?.interestAmount ||
        row?.interestComponent ||
        0
    );

  const emi =
    Number(
      row?.paymentAmount ||
        row?.emiAmount ||
        row?.amount ||
        principal + interest ||
        0
    );

  const balance =
    Number(
      row?.remainingBalance ||
        row?.balance ||
        row?.closingBalance ||
        0
    );

  const isPaid =
    status === "paid" ||
    status === "completed";

  const isOverdue =
    status === "overdue";

  const statusConfig =
    isPaid
      ? {
          label: "Paid",
          classes:
            "bg-emerald-50 text-emerald-700",
          icon: CheckCircle2,
        }
      : isOverdue
      ? {
          label: "Overdue",
          classes:
            "bg-red-50 text-red-700",
          icon: AlertTriangle,
        }
      : {
          label: "Pending",
          classes:
            "bg-blue-50 text-blue-700",
          icon: Clock3,
        };

  const StatusIcon =
    statusConfig.icon;

  return (
    <tr
      className={`
        border-b
        border-slate-100
        transition
        ${
          isPaid
            ? "bg-[#FAFCFB]"
            : isOverdue
            ? "bg-red-50/30"
            : "bg-white"
        }
        hover:bg-slate-50
      `}
    >
      {/* NUMBER */}

      <td className="px-3.5 py-2.5">
        <span className="text-[10px] font-semibold text-slate-500">
          {row?.installmentNumber ||
            row?.installmentNo ||
            index + 1}
        </span>
      </td>

      {/* DUE DATE */}

      <td className="px-3.5 py-2.5">
        <p
          className={`
            text-[10px]
            font-semibold
            ${
              isOverdue
                ? "text-red-600"
                : "text-slate-700"
            }
          `}
        >
          {formatDate(
            row?.dueDate
          )}
        </p>
      </td>

      {/* PRINCIPAL */}

      <td className="px-3.5 py-2.5 text-right">
        <span className="text-[10px] font-medium text-slate-700">
          ₹
          {formatMoney(
            principal
          )}
        </span>
      </td>

      {/* INTEREST */}

      <td className="px-3.5 py-2.5 text-right">
        <span className="text-[10px] font-medium text-slate-700">
          ₹
          {formatMoney(
            interest
          )}
        </span>
      </td>

      {/* EMI */}

      <td className="px-3.5 py-2.5 text-right">
        <span
          className={`
            text-[10px]
            font-semibold
            ${
              isPaid
                ? "text-emerald-700"
                : "text-[#17221D]"
            }
          `}
        >
          ₹
          {formatMoney(emi)}
        </span>
      </td>

      {/* BALANCE */}

      <td className="px-3.5 py-2.5">
        <span className="text-[10px] text-slate-600">
          {balance > 0
            ? `₹${formatMoney(
                balance
              )}`
            : "—"}
        </span>
      </td>

      {/* STATUS */}

      <td className="px-3.5 py-2.5">
        <span
          className={`
            inline-flex
            items-center
            gap-1
            whitespace-nowrap
            rounded-full
            px-2.5
            py-1
            text-[9px]
            font-semibold
            ${statusConfig.classes}
          `}
        >
          <StatusIcon size={11} />

          {statusConfig.label}
        </span>
      </td>
    </tr>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  label,
  value,
  tone = "neutral",
}) => {
  const config = {
    green: {
      bg: "bg-[#EAF5EF]",
      text: "text-[#0B5D3B]",
    },
    blue: {
      bg: "bg-[#EAF2FF]",
      text: "text-[#3974C9]",
    },
    purple: {
      bg: "bg-[#F0ECFF]",
      text: "text-[#6D5BD0]",
    },
    neutral: {
      bg: "bg-slate-50",
      text: "text-[#17221D]",
    },
  };

  const current =
    config[tone] ||
    config.neutral;

  return (
    <div
      className={`
        rounded-lg
        ${current.bg}
        px-3
        py-2.5
      `}
    >
      <p className="text-[8px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-[12px]
          font-semibold
          ${current.text}
        `}
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   LEGEND
========================================================= */

const Legend = ({
  icon: Icon,
  color,
  label,
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <Icon
        size={12}
        className={color}
      />

      <span className="text-[8px] font-medium text-slate-500">
        {label}
      </span>
    </div>
  );
};

/* =========================================================
   TABLE HEADER
========================================================= */

const TableHeader = ({
  children,
  align = "left",
}) => {
  return (
    <th
      className={`
        whitespace-nowrap
        px-3.5
        py-2.5
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.04em]
        text-slate-400
        ${
          align === "right"
            ? "text-right"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
};

/* =========================================================
   SUMMARY CALCULATION
========================================================= */

const calculateSummary = (
  schedule
) => {
  let totalEmi = 0;
  let totalPrincipal = 0;
  let totalInterest = 0;
  let paidCount = 0;

  schedule.forEach(
    (row) => {
      const principal =
        Number(
          row?.principal ||
            row?.principalAmount ||
            row?.principalComponent ||
            0
        );

      const interest =
        Number(
          row?.interest ||
            row?.interestAmount ||
            row?.interestComponent ||
            0
        );

      const emi =
        Number(
          row?.paymentAmount ||
            row?.emiAmount ||
            row?.amount ||
            principal + interest ||
            0
        );

      const status =
        String(
          row?.status || ""
        ).toLowerCase();

      totalPrincipal +=
        principal;

      totalInterest +=
        interest;

      totalEmi += emi;

      if (
        status === "paid" ||
        status === "completed"
      ) {
        paidCount += 1;
      }
    }
  );

  return {
    totalEmi,
    totalPrincipal,
    totalInterest,
    paidCount,
    totalCount:
      schedule.length,
  };
};

/* =========================================================
   FORMATTERS
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

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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

export default LoanRepaymentScheduleModal;