// src/pages/staff/StaffCollection.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  Phone,
  Receipt,
  Search,
  UserRound,
   LogOut,
  X,
} from "lucide-react";

import {
  getLoans,
} from "../../services/customerStorage";

import {
  addCollection,
  getCollections,
} from "../../services/collectionStorage";

/* =========================================================
   MAIN
========================================================= */

const StaffCollection = () => {
      const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("auto_finance_auth");

    navigate("/login", {
      replace: true,
    });
  };
  const [loans, setLoans] =
    useState(() => getLoans());

  const [collections, setCollections] =
    useState(() => getCollections());

  const [search, setSearch] =
    useState("");

  const [
    selectedPayment,
    setSelectedPayment,
  ] = useState(null);

  const [amount, setAmount] =
    useState("");

  const [paymentMode, setPaymentMode] =
    useState("Cash");

  const [location, setLocation] =
    useState("");

  const [remarks, setRemarks] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  /* =====================================================
     LOAD / SYNC
  ====================================================== */

  useEffect(() => {
    const reloadData = () => {
      setLoans(
        Array.isArray(getLoans())
          ? getLoans()
          : []
      );

      setCollections(
        Array.isArray(getCollections())
          ? getCollections()
          : []
      );
    };

    reloadData();

    window.addEventListener(
      "auto-finance:data-updated",
      reloadData
    );

    window.addEventListener(
      "storage",
      reloadData
    );

    return () => {
      window.removeEventListener(
        "auto-finance:data-updated",
        reloadData
      );

      window.removeEventListener(
        "storage",
        reloadData
      );
    };
  }, []);

  /* =====================================================
     DATE HELPERS
  ====================================================== */

  const getTodayKey = () => {
    const today =
      new Date();

    return [
      today.getFullYear(),
      String(
        today.getMonth() + 1
      ).padStart(2, "0"),
      String(
        today.getDate()
      ).padStart(2, "0"),
    ].join("-");
  };

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

  const getDateKey = (
    value
  ) => {
    const date =
      parseLocalDate(value);

    if (!date) {
      return "";
    }

    return [
      date.getFullYear(),
      String(
        date.getMonth() + 1
      ).padStart(2, "0"),
      String(
        date.getDate()
      ).padStart(2, "0"),
    ].join("-");
  };

  /* =====================================================
     STATUS
  ====================================================== */

  const normalize =
    (value) =>
      String(value || "")
        .trim()
        .toLowerCase();

  const isCompletedStatus = (
    status
  ) => {
    const value =
      normalize(status);

    return (
      value === "paid" ||
      value === "completed" ||
      value === "closed" ||
      value === "settled"
    );
  };

  const isBlockingCollection =
    (collection) => {
      const status =
        normalize(
          collection?.status
        );

      return (
        status === "pending" ||
        status === "approved"
      );
    };

  /* =====================================================
     AMOUNT
  ====================================================== */

  const getPaymentAmount = (
    row
  ) => {
    return Number(
      row?.paymentAmount ??
        row?.emiAmount ??
        row?.amount ??
        0
    );
  };

  /* =====================================================
     CUSTOMER
  ====================================================== */

  const getCustomerName = (
    loan
  ) => {
    return (
      loan?.customerName ||
      loan?.customer?.personal
        ?.name ||
      "Customer"
    );
  };

  const getCustomerMobile = (
    loan
  ) => {
    return (
      loan?.mobileNumber ||
      loan?.customer?.personal
        ?.mobileNumber ||
      ""
    );
  };

  const getLoanId = (
    loan
  ) => {
    return (
      loan?.id ||
      loan?.loanNumber ||
      ""
    );
  };

  const getLoanNumber = (
    loan
  ) => {
    return (
      loan?.loanNumber ||
      "Loan"
    );
  };

  /* =====================================================
     COLLECTION MATCH
     
     Same installment is blocked while:
     Pending / Approved
     
     Rejected does not block.
  ====================================================== */

  const hasExistingCollection =
    (
      loan,
      scheduleRow
    ) => {
      const loanId =
        getLoanId(loan);

      const scheduleId =
        scheduleRow?.id ||
        "";

      const dueDate =
        getDateKey(
          scheduleRow?.dueDate
        );

      return collections.some(
        (collection) => {
          if (
            !isBlockingCollection(
              collection
            )
          ) {
            return false;
          }

          const collectionLoanId =
            collection?.loanId ||
            collection?.loanNumber ||
            "";

          const collectionScheduleId =
            collection?.scheduleId ||
            "";

          const collectionDueDate =
            getDateKey(
              collection?.dueDate
            );

          /*
           * Best match:
           * schedule ID
           */
          if (
            scheduleId &&
            collectionScheduleId
          ) {
            return (
              String(
                collectionScheduleId
              ) ===
              String(
                scheduleId
              )
            );
          }

          /*
           * Fallback:
           * loan + due date
           */
          return (
            String(
              collectionLoanId
            ) ===
              String(loanId) &&
            collectionDueDate ===
              dueDate
          );
        }
      );
    };

  /* =====================================================
     COLLECTIBLE INSTALLMENTS
     
     Includes:
     - today's unpaid installment
     - overdue unpaid installment
     
     Excludes:
     - paid
     - completed
     - already submitted
  ====================================================== */

  const collectibleRows =
    useMemo(() => {
      const today =
        getTodayKey();

      const todayDate =
        parseLocalDate(today);

      if (!todayDate) {
        return [];
      }

      todayDate.setHours(
        0,
        0,
        0,
        0
      );

      const rows = [];

      loans.forEach(
        (loan) => {
          const schedule =
            Array.isArray(
              loan?.repaymentSchedule
            )
              ? loan.repaymentSchedule
              : [];

          schedule.forEach(
            (scheduleRow) => {
              const status =
                normalize(
                  scheduleRow?.status
                );

              if (
                isCompletedStatus(
                  status
                )
              ) {
                return;
              }

              const dueDate =
                parseLocalDate(
                  scheduleRow?.dueDate
                );

              if (!dueDate) {
                return;
              }

              dueDate.setHours(
                0,
                0,
                0,
                0
              );

              /*
               * Future installments are not
               * shown in Staff daily collection.
               */
              if (
                dueDate.getTime() >
                todayDate.getTime()
              ) {
                return;
              }

              /*
               * Same installment already
               * submitted/approved.
               */
              if (
                hasExistingCollection(
                  loan,
                  scheduleRow
                )
              ) {
                return;
              }

              const amount =
                getPaymentAmount(
                  scheduleRow
                );

              if (
                amount <= 0
              ) {
                return;
              }

              const overdue =
                dueDate.getTime() <
                todayDate.getTime();

              const overdueDays =
                overdue
                  ? Math.max(
                      1,
                      Math.floor(
                        (
                          todayDate.getTime() -
                          dueDate.getTime()
                        ) /
                          (
                            1000 *
                            60 *
                            60 *
                            24
                          )
                      )
                    )
                  : 0;

              rows.push({
                loan,

                scheduleRow,

                amount,

                overdue,

                overdueDays,
              });
            }
          );
        }
      );

      return rows.sort(
        (a, b) => {
          /*
           * Overdue first
           */
          if (
            a.overdue &&
            !b.overdue
          ) {
            return -1;
          }

          if (
            !a.overdue &&
            b.overdue
          ) {
            return 1;
          }

          /*
           * Older due dates first
           */
          const aDate =
            parseLocalDate(
              a?.scheduleRow
                ?.dueDate
            );

          const bDate =
            parseLocalDate(
              b?.scheduleRow
                ?.dueDate
            );

          return (
            (aDate?.getTime() ||
              0) -
            (bDate?.getTime() ||
              0)
          );
        }
      );
    }, [
      loans,
      collections,
    ]);

  /* =====================================================
     SEARCH
  ====================================================== */

  const filteredRows =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return collectibleRows;
      }

      return collectibleRows.filter(
        ({
          loan,
          scheduleRow,
        }) => {
          const text = [
            getCustomerName(
              loan
            ),
            getCustomerMobile(
              loan
            ),
            getLoanNumber(
              loan
            ),
            scheduleRow
              ?.installmentNumber,
            scheduleRow
              ?.installmentNo,
          ]
            .filter(
              Boolean
            )
            .join(" ")
            .toLowerCase();

          return text.includes(
            query
          );
        }
      );
    }, [
      collectibleRows,
      search,
    ]);

  /* =====================================================
     SUMMARY
  ====================================================== */

  const todayDueCount =
    collectibleRows.filter(
      (item) =>
        !item.overdue
    ).length;

  const overdueCount =
    collectibleRows.filter(
      (item) =>
        item.overdue
    ).length;

  const todayDueAmount =
    collectibleRows
      .filter(
        (item) =>
          !item.overdue
      )
      .reduce(
        (total, item) =>
          total +
          item.amount,
        0
      );

  const overdueAmount =
    collectibleRows
      .filter(
        (item) =>
          item.overdue
      )
      .reduce(
        (total, item) =>
          total +
          item.amount,
        0
      );

  /* =====================================================
     SELECT
  ====================================================== */

  const openCollection =
    (item) => {
      setSelectedPayment(
        item
      );

      setAmount(
        item?.amount
          ? String(
              item.amount
            )
          : ""
      );

      setPaymentMode(
        "Cash"
      );

      setLocation("");
      setRemarks("");
      setMessage("");
      setError("");
    };

  const closeCollection =
    () => {
      setSelectedPayment(
        null
      );

      setAmount("");
      setPaymentMode(
        "Cash"
      );
      setLocation("");
      setRemarks("");
      setMessage("");
      setError("");
    };

  /* =====================================================
     SUBMIT COLLECTION
  ====================================================== */

  const handleSubmit =
    (event) => {
      event.preventDefault();

      setMessage("");
      setError("");

      if (
        !selectedPayment
      ) {
        return;
      }

      const numericAmount =
        Number(
          amount || 0
        );

      const scheduledAmount =
        Number(
          selectedPayment.amount ||
            0
        );

      if (
        numericAmount <= 0
      ) {
        setError(
          "Enter a valid collection amount."
        );

        return;
      }

      if (
        numericAmount >
        scheduledAmount
      ) {
        setError(
          `Collection cannot exceed ₹${money(
            scheduledAmount
          )}.`
        );

        return;
      }

      const loan =
        selectedPayment.loan;

      const scheduleRow =
        selectedPayment
          .scheduleRow;

      /*
       * Double-check before saving.
       */
      if (
        hasExistingCollection(
          loan,
          scheduleRow
        )
      ) {
        setError(
          "This installment has already been submitted for collection."
        );

        closeCollection();

        return;
      }

      const newCollection =
        addCollection({
          customerId:
            loan?.customerId ||
            loan?.customer
              ?.id ||
            "",

          customerName:
            getCustomerName(
              loan
            ),

          loanId:
            loan?.id ||
            "",

          loanNumber:
            loan?.loanNumber ||
            "",

          scheduleId:
            scheduleRow?.id ||
            "",

          installment:
            scheduleRow
              ?.installmentNumber ??
            scheduleRow
              ?.installmentNo ??
            "",

          dueDate:
            scheduleRow?.dueDate ||
            "",

          collectedDate:
            getTodayKey(),

          dueAmount:
            scheduledAmount,

          amount:
            numericAmount,

          paymentMode,

          location:
            location.trim(),

          remarks:
            remarks.trim(),

          status:
            "Pending",
        });

      setMessage(
        `Collection ${newCollection.id} submitted successfully.`
      );

      /*
       * Refresh immediately.
       * This removes the submitted installment
       * from the Staff page.
       */
      setCollections(
        getCollections()
      );

      setLoans(
        getLoans()
      );

      setSelectedPayment(
        null
      );

      setAmount("");
      setPaymentMode(
        "Cash"
      );
      setLocation("");
      setRemarks("");
    };

  /* =====================================================
     RENDER
  ====================================================== */

  return (
    <div
      className="
        min-h-full
        bg-[#F6F8F7]
        p-3
        sm:p-4
        lg:p-5
      "
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          mb-4
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <h1
            className="
              text-[22px]
              font-extrabold
              tracking-tight
              text-[#17221D]
            "
          >
            Staff Collection
          </h1>

          <p
            className="
              mt-1
              text-[10px]
              font-medium
              text-slate-400
            "
          >
            Today's customer collections
          </p>
        </div>

      <div className="flex items-center gap-2">
  {/* AVAILABLE TODAY */}

  <div
    className="
      rounded-lg
      bg-[#EAF5EF]
      px-3
      py-2
    "
  >
    <p className="text-[8px] font-semibold text-[#0B6B43]">
      Available Today
    </p>

    <p className="mt-0.5 text-[11px] font-extrabold text-[#0B6B43]">
      {collectibleRows.length} collections
    </p>
  </div>

  {/* LOGOUT */}

  <button
    type="button"
    onClick={handleLogout}
    className="
      inline-flex
      h-9
      items-center
      gap-1.5
      rounded-lg
      border
      border-slate-200
      bg-white
      px-3
      text-[10px]
      font-semibold
      text-slate-600
      transition
      hover:border-red-200
      hover:bg-red-50
      hover:text-red-600
    "
  >
    <LogOut
      size={14}
      strokeWidth={2}
    />
    Logout
  </button>
</div>
      </div>

      {/* =================================================
          SUCCESS / ERROR
      ================================================== */}

      {message && (
        <div
          className="
            mb-3
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-[#CFE8D9]
            bg-[#F0FAF4]
            px-3
            py-2.5
          "
        >
          <CheckCircle2
            size={15}
            className="shrink-0 text-[#0B6B43]"
          />

          <p className="text-[9px] font-semibold text-[#0B6B43]">
            {message}
          </p>
        </div>
      )}

      {error && (
        <div
          className="
            mb-3
            flex
            items-center
            gap-2
            rounded-lg
            border
            border-red-200
            bg-red-50
            px-3
            py-2.5
          "
        >
          <AlertCircle
            size={15}
            className="shrink-0 text-red-600"
          />

          <p className="text-[9px] font-semibold text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* =================================================
          SUMMARY CARDS
      ================================================== */}

      <div
        className="
          mb-3
          grid
          grid-cols-1
          gap-2.5
          sm:grid-cols-3
        "
      >
        <SummaryCard
          icon={IndianRupee}
          label="Today's Due"
          value={formatMoney(
            todayDueAmount
          )}
          note={`${todayDueCount} collections`}
          tone="green"
        />

        <SummaryCard
          icon={Clock3}
          label="Overdue"
          value={formatMoney(
            overdueAmount
          )}
          note={`${overdueCount} overdue`}
          tone="red"
        />

        <SummaryCard
          icon={Receipt}
          label="Total to Collect"
          value={formatMoney(
            todayDueAmount +
              overdueAmount
          )}
          note={`${collectibleRows.length} open collections`}
          tone="blue"
        />
      </div>

      {/* =================================================
          SEARCH
      ================================================== */}

      <div
        className="
          mb-3
          rounded-xl
          border
          border-slate-200
          bg-white
          p-2.5
        "
      >
        <div className="relative">
          <Search
            size={13}
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              -translate-y-1/2
              text-slate-400
            "
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search customer, mobile, loan number..."
            className="
              h-9
              w-full
              rounded-lg
              border
              border-slate-200
              bg-white
              pl-8
              pr-3
              text-[10px]
              font-semibold
              text-[#17221D]
              outline-none
              focus:border-[#9CCEB1]
              focus:ring-1
              focus:ring-[#DCEFE4]
            "
          />
        </div>
      </div>

      {/* =================================================
          COLLECTION LIST
      ================================================== */}

      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
          shadow-sm
        "
      >
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
          <div>
            <h2 className="text-[12px] font-extrabold text-[#17221D]">
              Today's Collection List
            </h2>

            <p className="mt-0.5 text-[8px] text-slate-400">
              Submitted collections disappear from this list
            </p>
          </div>

          <span
            className="
              rounded-full
              bg-[#EAF5EF]
              px-2.5
              py-1
              text-[8px]
              font-bold
              text-[#0B5D3B]
            "
          >
            {filteredRows.length}
          </span>
        </div>

        {filteredRows.length ===
        0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRows.map(
              (item) => (
                <CollectionRow
                  key={`${getLoanId(
                    item.loan
                  )}-${item.scheduleRow?.id || item.scheduleRow?.dueDate}`}
                  item={item}
                  onCollect={() =>
                    openCollection(
                      item
                    )
                  }
                />
              )
            )}
          </div>
        )}
      </div>

      {/* =================================================
          COLLECTION MODAL
      ================================================== */}

      {selectedPayment && (
        <CollectionModal
          item={
            selectedPayment
          }
          amount={amount}
          setAmount={
            setAmount
          }
          paymentMode={
            paymentMode
          }
          setPaymentMode={
            setPaymentMode
          }
          location={
            location
          }
          setLocation={
            setLocation
          }
          remarks={
            remarks
          }
          setRemarks={
            setRemarks
          }
          onClose={
            closeCollection
          }
          onSubmit={
            handleSubmit
          }
        />
      )}
    </div>
  );
};

/* =========================================================
   COLLECTION ROW
========================================================= */

const CollectionRow = ({
  item,
  onCollect,
}) => {
  const {
    loan,
    scheduleRow,
    amount,
    overdue,
    overdueDays,
  } = item;

  const customerName =
    loan?.customerName ||
    loan?.customer?.personal
      ?.name ||
    "Customer";

  const mobile =
    loan?.mobileNumber ||
    loan?.customer?.personal
      ?.mobileNumber ||
    "";

  const loanNumber =
    loan?.loanNumber ||
    "Loan";

  const installment =
    scheduleRow
      ?.installmentNumber ??
    scheduleRow
      ?.installmentNo ??
    "—";

  return (
    <div
      className="
        flex
        flex-col
        gap-3
        px-4
        py-3.5
        transition
        hover:bg-[#FAFCFB]
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      {/* CUSTOMER */}

      <div className="flex min-w-0 items-center gap-3">
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-full
            ${
              overdue
                ? "bg-red-50 text-red-600"
                : "bg-[#EAF5EF] text-[#0B6B43]"
            }
          `}
        >
          <UserRound
            size={17}
          />
        </div>

        <div className="min-w-0">
          <p className="truncate text-[11px] font-extrabold text-[#17221D]">
            {customerName}
          </p>

          <div className="mt-1 flex items-center gap-3">
            <span className="text-[8px] font-semibold text-slate-400">
              {loanNumber}
            </span>

            {mobile && (
              <span className="flex items-center gap-1 text-[8px] font-medium text-slate-400">
                <Phone
                  size={9}
                />
                {mobile}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MIDDLE */}

      <div className="grid grid-cols-3 gap-5">
        <InfoBlock
          label="Installment"
          value={`#${installment}`}
        />

        <InfoBlock
          label="Due Date"
          value={formatDisplayDate(
            scheduleRow?.dueDate
          )}
        />

        <InfoBlock
          label={
            overdue
              ? "Overdue"
              : "Due Amount"
          }
          value={
            overdue
              ? `${overdueDays} Days`
              : formatMoney(
                  amount
                )
          }
          danger={
            overdue
          }
        />
      </div>

      {/* AMOUNT + BUTTON */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-4
          sm:justify-end
        "
      >
        <div className="text-right">
          <p className="text-[8px] font-semibold text-slate-400">
            Collect
          </p>

          <p
            className={`
              mt-0.5
              text-[14px]
              font-extrabold
              ${
                overdue
                  ? "text-red-600"
                  : "text-[#0B6B43]"
              }
            `}
          >
            {formatMoney(
              amount
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={onCollect}
          className={`
            inline-flex
            h-9
            items-center
            gap-1.5
            rounded-lg
            px-3
            text-[9px]
            font-extrabold
            text-white
            shadow-sm
            transition
            hover:-translate-y-[1px]
            ${
              overdue
                ? "bg-red-600 hover:bg-red-700"
                : "bg-[#0B6B43] hover:bg-[#095B3B]"
            }
          `}
        >
          <IndianRupee
            size={12}
          />
          Collect
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  note,
  tone = "green",
}) => {
  const styles = {
    green: {
      bg: "bg-[#F1FAF4]",
      icon: "bg-[#DDF1E5] text-[#0B6B43]",
      value: "text-[#0B6B43]",
    },

    red: {
      bg: "bg-[#FFF4F4]",
      icon: "bg-[#FDE2E2] text-red-600",
      value: "text-red-600",
    },

    blue: {
      bg: "bg-[#F1F6FE]",
      icon: "bg-[#E1ECFD] text-blue-600",
      value: "text-blue-600",
    },
  };

  const current =
    styles[tone] ||
    styles.green;

  return (
    <div
      className={`
        rounded-xl
        border
        border-slate-200
        ${current.bg}
        px-3.5
        py-3
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          <p
            className={`
              mt-1
              text-[19px]
              font-extrabold
              tracking-tight
              ${current.value}
            `}
          >
            {value}
          </p>

          <p className="mt-1 text-[8px] font-medium text-slate-400">
            {note}
          </p>
        </div>

        <div
          className={`
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            ${current.icon}
          `}
        >
          <Icon
            size={15}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MODAL
========================================================= */

const CollectionModal = ({
  item,
  amount,
  setAmount,
  paymentMode,
  setPaymentMode,
  location,
  setLocation,
  remarks,
  setRemarks,
  onClose,
  onSubmit,
}) => {
  const loan =
    item?.loan || {};

  const scheduleRow =
    item?.scheduleRow ||
    {};

  const customerName =
    loan?.customerName ||
    loan?.customer?.personal
      ?.name ||
    "Customer";

  const dueAmount =
    Number(
      item?.amount || 0
    );

  const isOverdue =
    Boolean(
      item?.overdue
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-[700]
        flex
        items-center
        justify-center
        bg-slate-950/45
        p-4
        backdrop-blur-[3px]
      "
      onClick={onClose}
    >
      <div
        className="
          w-full
          max-w-[560px]
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-white
          shadow-[0_25px_90px_rgba(15,23,42,0.28)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-5
            py-3.5
          "
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                ${
                  isOverdue
                    ? "bg-red-50 text-red-600"
                    : "bg-[#EAF5EF] text-[#0B6B43]"
                }
              `}
            >
              <Receipt
                size={15}
              />
            </div>

            <div>
              <h2 className="text-[13px] font-extrabold text-[#17221D]">
                Record Collection
              </h2>

              <p className="mt-0.5 text-[8px] text-slate-400">
                {customerName} ·{" "}
                {loan?.loanNumber ||
                  "Loan"}
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
              items-center
              justify-center
              rounded-lg
              text-slate-400
              hover:bg-slate-50
              hover:text-slate-700
            "
          >
            <X
              size={16}
            />
          </button>
        </div>

        {/* SUMMARY */}

        <div
          className={`
            mx-5
            mt-4
            rounded-xl
            px-4
            py-3
            ${
              isOverdue
                ? "bg-red-50"
                : "bg-[#F2FAF5]"
            }
          `}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className={`
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-wide
                  ${
                    isOverdue
                      ? "text-red-600"
                      : "text-[#0B6B43]"
                  }
                `}
              >
                {isOverdue
                  ? "Overdue Collection"
                  : "Today's EMI"}
              </p>

              <p className="mt-1 text-[18px] font-extrabold text-[#17221D]">
                {formatMoney(
                  dueAmount
                )}
              </p>
            </div>

            <div className="text-right">
              <p className="text-[8px] font-semibold text-slate-400">
                Due Date
              </p>

              <p className="mt-1 text-[9px] font-bold text-[#17221D]">
                {formatDisplayDate(
                  scheduleRow?.dueDate
                )}
              </p>
            </div>
          </div>
        </div>

        {/* FORM */}

        <form
          onSubmit={
            onSubmit
          }
          className="p-5"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* AMOUNT */}

            <FormField label="Collected Amount">
              <div className="relative">
                <span
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-[11px]
                    font-bold
                    text-slate-400
                  "
                >
                  ₹
                </span>

                <input
                  type="number"
                  min="0"
                  max={dueAmount}
                  step="0.01"
                  value={
                    amount
                  }
                  onChange={(
                    event
                  ) =>
                    setAmount(
                      event.target
                        .value
                    )
                  }
                  required
                  className={`${inputClass} pl-7`}
                  placeholder="0.00"
                />
              </div>
            </FormField>

            {/* PAYMENT MODE */}

            <FormField label="Payment Mode">
              <select
                value={
                  paymentMode
                }
                onChange={(
                  event
                ) =>
                  setPaymentMode(
                    event.target
                      .value
                  )
                }
                className={
                  inputClass
                }
              >
                <option>
                  Cash
                </option>
                <option>
                  Bank
                </option>
                <option>
                  UPI
                </option>
                <option>
                  Card
                </option>
              </select>
            </FormField>

            {/* LOCATION */}

            <div className="sm:col-span-2">
              <FormField label="Collection Location">
                <div className="relative">
                  <MapPin
                    size={13}
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-slate-400
                    "
                  />

                  <input
                    type="text"
                    value={
                      location
                    }
                    onChange={(
                      event
                    ) =>
                      setLocation(
                        event.target
                          .value
                      )
                    }
                    placeholder="Customer location / area"
                    className={`${inputClass} pl-8`}
                  />
                </div>
              </FormField>
            </div>

            {/* REMARKS */}

            <div className="sm:col-span-2">
              <FormField label="Remarks">
                <textarea
                  value={
                    remarks
                  }
                  onChange={(
                    event
                  ) =>
                    setRemarks(
                      event.target
                        .value
                    )
                  }
                  rows={3}
                  placeholder="Optional collection remarks"
                  className={`
                    ${inputClass}
                    h-auto
                    min-h-[72px]
                    resize-none
                    py-2.5
                  `}
                />
              </FormField>
            </div>
          </div>

          {/* INFO */}

          <div
            className="
              mt-4
              rounded-lg
              bg-slate-50
              px-3
              py-2.5
            "
          >
            <p className="text-[8px] font-semibold text-slate-500">
              This collection will be submitted to Admin for approval.
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              It will not be counted in Dashboard financial totals until approved.
            </p>
          </div>

          {/* FOOTER */}

          <div
            className="
              mt-4
              flex
              items-center
              justify-end
              gap-2
              border-t
              border-slate-100
              pt-4
            "
          >
            <button
              type="button"
              onClick={onClose}
              className="
                h-9
                rounded-lg
                border
                border-slate-200
                px-4
                text-[9px]
                font-bold
                text-slate-500
                hover:bg-slate-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`
                inline-flex
                h-9
                items-center
                gap-1.5
                rounded-lg
                px-4
                text-[9px]
                font-extrabold
                text-white
                shadow-sm
                ${
                  isOverdue
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-[#0B6B43] hover:bg-[#095B3B]"
                }
              `}
            >
              <CheckCircle2
                size={12}
              />

              Submit Collection
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   FORM FIELD
========================================================= */

const FormField = ({
  label,
  children,
}) => {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>

      {children}
    </label>
  );
};

const inputClass = `
  h-9
  w-full
  rounded-lg
  border
  border-slate-200
  bg-white
  px-3
  text-[10px]
  font-semibold
  text-[#253252]
  outline-none
  transition
  focus:border-[#9CCEB1]
  focus:ring-1
  focus:ring-[#DCEFE4]
`;

/* =========================================================
   INFO BLOCK
========================================================= */

const InfoBlock = ({
  label,
  value,
  danger = false,
}) => {
  return (
    <div>
      <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`
          mt-1
          whitespace-nowrap
          text-[9px]
          font-bold
          ${
            danger
              ? "text-red-600"
              : "text-[#253252]"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   EMPTY
========================================================= */

const EmptyState = () => {
  return (
    <div className="px-5 py-14 text-center">
      <div
        className="
          mx-auto
          flex
          h-12
          w-12
          items-center
          justify-center
          rounded-xl
          bg-[#EAF5EF]
          text-[#0B6B43]
        "
      >
        <CheckCircle2
          size={20}
        />
      </div>

      <p className="mt-3 text-[12px] font-extrabold text-[#17221D]">
        No collections pending
      </p>

      <p className="mt-1 text-[9px] text-slate-400">
        All available customer installments have been submitted or completed.
      </p>
    </div>
  );
};

/* =========================================================
   MONEY
========================================================= */

const formatMoney = (
  value
) => {
  return `₹${Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

/* =========================================================
   DATE
========================================================= */

const formatDisplayDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    parseDate(value);

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

const parseDate = (
  value
) => {
  const raw =
    String(value || "");

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

export default StaffCollection;