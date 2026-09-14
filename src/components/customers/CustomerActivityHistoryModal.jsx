import {
  Activity,
  CheckCircle2,
  Clock3,
  X,
} from "lucide-react";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const ActivityRow = ({
  title,
  description,
  date,
  tone = "green",
}) => {
  const toneMap = {
    green: "bg-[#EAF5EF] text-[#0B6B43]",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="flex gap-3 rounded-xl border border-slate-100 bg-white p-3.5">
      <div
        className={`
          flex h-9 w-9 shrink-0 items-center justify-center
          rounded-lg ${toneMap[tone] || toneMap.green}
        `}
      >
        <Activity size={15} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-extrabold text-[#17221D]">
            {title}
          </p>

          <span className="text-[8px] font-semibold text-slate-400">
            {formatDate(date)}
          </span>
        </div>

        <p className="mt-1 text-[9px] leading-4 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
};

const CustomerActivityHistoryModal = ({
  customer,
  paymentHistory = [],
  repaymentSchedule = [],
  isTerminalLoan = false,
  onClose,
}) => {
  const events = [];

  if (customer?.customer?.createdAt) {
    events.push({
      id: "customer-created",
      title: "Customer Created",
      description: "Customer record was created.",
      date: customer.customer.createdAt,
      tone: "green",
    });
  }

  if (customer?.loan?.createdAt) {
    events.push({
      id: "loan-created",
      title: "Loan Created",
      description: `Loan ${
        customer?.loan?.loanNumber || ""
      } was created.`,
      date: customer.loan.createdAt,
      tone: "blue",
    });
  }

  paymentHistory.forEach((payment, index) => {
    events.push({
      id: payment?.id || `payment-${index}`,
      title: "Payment Received",
      description: `Payment of ₹${money(
        payment?.amount
      )} was recorded.`,
      date:
        payment?.date ||
        payment?.paidAt ||
        payment?.paymentDate,
      tone: "green",
    });
  });

  if (!isTerminalLoan) {
    repaymentSchedule
      .filter((row) => {
        const status = String(
          row?.status || ""
        )
          .trim()
          .toLowerCase();

        if (
          ["paid", "completed", "closed", "settled"].includes(
            status
          )
        ) {
          return false;
        }

        if (!row?.dueDate) return false;

        const due = new Date(row.dueDate);
        const today = new Date();

        due.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return due < today;
      })
      .forEach((row, index) => {
        events.push({
          id: `overdue-${index}-${row?.dueDate}`,
          title: "EMI Overdue",
          description: `₹${money(
            row?.remainingAmount ??
              row?.balance ??
              row?.paymentAmount ??
              row?.emiAmount ??
              row?.amount ??
              0
          )} is overdue.`,
          date: row?.dueDate,
          tone: "red",
        });
      });
  }

  events.sort(
    (a, b) =>
      new Date(b.date || 0).getTime() -
      new Date(a.date || 0).getTime()
  );

  return (
    <div
      className="
        fixed inset-0 z-[600]
        flex items-center justify-center
        bg-slate-950/45 p-3
        backdrop-blur-[3px]
        sm:p-5
      "
      onClick={onClose}
    >
      <div
        className="
          flex max-h-[88vh] w-full max-w-[760px]
          flex-col overflow-hidden
          rounded-2xl border border-slate-200
          bg-[#F7FAF8]
          shadow-[0_25px_80px_rgba(15,23,42,0.25)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EAF5EF] text-[#0B6B43]">
              <Activity size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="text-[17px] font-extrabold text-[#17221D]">
                Customer Activity
              </h2>

              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                {customer?.customer?.personal?.name ||
                  "Customer"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9 shrink-0 items-center
              justify-center rounded-lg border
              border-slate-200 bg-white
              text-slate-400 transition
              hover:bg-slate-50 hover:text-slate-700
            "
          >
            <X size={17} />
          </button>
        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-2 gap-2 border-b border-slate-200 bg-white p-3 sm:grid-cols-3">
          <SummaryItem
            label="Activities"
            value={events.length}
          />

          <SummaryItem
            label="Payments"
            value={paymentHistory.length}
            green
          />

          <SummaryItem
            label="Loan"
            value={
              customer?.loan?.loanNumber || "—"
            }
            green
          />
        </div>

        {/* ACTIVITY LIST */}

        <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {events.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white text-center">
              <div>
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-400">
                  <Clock3 size={19} />
                </div>

                <p className="mt-3 text-[12px] font-extrabold text-[#17221D]">
                  No activity available
                </p>

                <p className="mt-1 text-[9px] text-slate-400">
                  Customer and loan activity will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {events.map((event) => (
                <ActivityRow
                  key={event.id}
                  {...event}
                />
              ))}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="border-t border-slate-200 bg-white px-4 py-3 text-right">
          <button
            type="button"
            onClick={onClose}
            className="
              h-9 rounded-lg border border-slate-200
              bg-white px-4 text-[10px]
              font-extrabold text-slate-600
              transition hover:bg-slate-50
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const SummaryItem = ({
  label,
  value,
  green = false,
}) => (
  <div className="rounded-xl border border-slate-100 bg-[#F8FAF9] px-3 py-2.5">
    <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p
      className={`mt-1 truncate text-[14px] font-extrabold ${
        green ? "text-[#0B6B43]" : "text-[#17221D]"
      }`}
    >
      {value}
    </p>
  </div>
);

export default CustomerActivityHistoryModal;