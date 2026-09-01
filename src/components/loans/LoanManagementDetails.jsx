import {
  X,
  UserRound,
  Phone,
  CreditCard,
  CalendarDays,
  IndianRupee,
  FileText,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";


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
    loan?.loanNumber || "—";

  const emi = getEmi(loan);

  const outstanding =
    getOutstanding(loan);

  const nextDue =
    getNextDue(loan);

  const dueAmount =
    Number(
      nextDue?.paymentAmount ||
        nextDue?.emiAmount ||
        nextDue?.amount ||
        emi ||
        0
    );

  const overdueDays =
    getOverdueDays(
      nextDue?.dueDate
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
          <h3 className="text-[12px] font-semibold text-[#17221D]">
            Loan Summary
          </h3>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#0B5D3B]">
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
              <X size={14} />
            </button>
          </div>
        </div>

        {/* CUSTOMER */}

        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
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
                className="text-[#0B5D3B]"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[11px] font-semibold text-[#17221D]">
                {customerName}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-slate-400">
                {mobile}
              </p>

              <p className="mt-0.5 truncate text-[9px] text-slate-500">
                {getVehicleName(loan)}
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
          EMI OVERVIEW
      ================================================== */}

      <section
        className="
          mt-3
          rounded-xl
          border
          border-slate-200
          bg-white
          px-4
          py-3
        "
      >
        <div className="flex items-center gap-2">
          <CreditCard
            size={14}
            strokeWidth={2}
            className="text-[#0B5D3B]"
          />

          <h3 className="text-[12px] font-semibold text-[#17221D]">
            EMI Overview
          </h3>
        </div>

        <div className="mt-3 space-y-2.5">
          <DetailRow
            label="EMI Amount"
            value={`₹${formatMoney(emi)}`}
          />

          <DetailRow
            label="Due Date"
            value={formatDate(
              nextDue?.dueDate
            )}
          />

          <DetailRow
            label="Outstanding Amount"
            value={`₹${formatMoney(
              outstanding
            )}`}
          />

          <DetailRow
            label="Due Amount"
            value={`₹${formatMoney(
              dueAmount
            )}`}
            valueClass="text-red-600"
          />

          <DetailRow
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
        </div>
      </section>

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
          py-3
        "
      >
        <div className="flex items-center gap-2 px-0.5">
          <FileText
            size={14}
            strokeWidth={2}
            className="text-[#0B5D3B]"
          />

          <h3 className="text-[12px] font-semibold text-[#17221D]">
            Quick Actions
          </h3>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
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
   DETAIL ROW
========================================================= */

const DetailRow = ({
  label,
  value,
  valueClass = "text-[#17221D]",
}) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[10px] font-medium text-slate-500">
        {label}
      </span>

      <span
        className={`
          text-[10px]
          font-semibold
          ${valueClass}
        `}
      >
        {value}
      </span>
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
        min-h-[66px]
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
          size={14}
          strokeWidth={2}
          className={iconColor}
        />
      </span>

      <span className="leading-tight text-[8px] font-semibold text-slate-600">
        {label}
      </span>
    </button>
  );
};

/* =========================================================
   HELPERS
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

const getNextDue = (
  loan
) => {
  const schedule =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];

  return (
    schedule.find(
      (row) =>
        [
          "pending",
          "overdue",
          "partially paid",
        ].includes(
          String(
            row?.status || ""
          ).toLowerCase()
        )
    ) || null
  );
};

const getEmi = (
  loan
) => {
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

const getOutstanding = (
  loan
) => {
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

const getOverdueDays = (
  dueDate
) => {
  if (!dueDate) {
    return 0;
  }

  const due =
    new Date(dueDate);

  if (
    Number.isNaN(
      due.getTime()
    )
  ) {
    return 0;
  }

  const now =
    new Date();

  const difference =
    Math.floor(
      (now.getTime() -
        due.getTime()) /
        (1000 *
          60 *
          60 *
          24)
    );

  return Math.max(
    difference,
    0
  );
};

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

export default LoanManagementDetails;