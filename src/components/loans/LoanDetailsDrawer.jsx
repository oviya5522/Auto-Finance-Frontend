import {
  X,
  RefreshCw,
  ChevronDown,
  IndianRupee,
  CalendarDays,
  ShieldCheck,
  Clock3,
  CarFront,
  UserRound,
  ReceiptText,
  FileText,
  Activity,
  Maximize2,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import LoanOverview from "./LoanOverview";
import LoanCustomerSection from "./LoanCustomerSection";
import LoanVehicleSection from "./LoanVehicleSection";
import LoanRepaymentProgress from "./LoanRepaymentProgress";
import LoanRepaymentSchedule from "./LoanRepaymentSchedule";
import LoanDocuments from "./LoanDocuments";
import LoanActivityTimeline from "./LoanActivityTimeline";

/* =========================================================
   HELPERS
========================================================= */

const money = (value) =>
  `₹${Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  )}`;

const normalize = (value) =>
  String(
    value || ""
  )
    .trim()
    .toLowerCase();

const getStatusClass = (
  status
) => {
  const normalized =
    normalize(status);

  if (
    normalized === "active"
  ) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "overdue"
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  if (
    normalized === "closed" ||
    normalized === "paid" ||
    normalized === "settled"
  ) {
    return "border-slate-200 bg-slate-100 text-slate-600";
  }

  if (
    normalized === "foreclosed"
  ) {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
};

/* =========================================================
   MAIN
========================================================= */

const LoanDetailsDrawer = ({
  loan,
  onClose,
}) => {
  const navigate =
    useNavigate();

  const [
    openSection,
    setOpenSection,
  ] = useState("overview");

  const [
    scheduleOpen,
    setScheduleOpen,
  ] = useState(false);

  /* =======================================================
     BODY LOCK
  ====================================================== */

  useEffect(() => {
    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, []);

  /* =======================================================
     ESCAPE
  ====================================================== */

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          if (scheduleOpen) {
            setScheduleOpen(false);
            return;
          }

          onClose?.();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    onClose,
    scheduleOpen,
  ]);

  /* =======================================================
     VALUES
  ====================================================== */

  const loanNumber =
    loan?.loanNumber ||
    "Loan Details";

  const customerName =
    loan?.customerName ||
    loan?.customer?.personal
      ?.name ||
    loan?.customer?.name ||
    "Customer";

  const customerId =
    loan?.customerId ||
    loan?.customer?.id ||
    loan?.customer?.customerId ||
    "—";

  const status =
    loan?.status ||
    loan?.loanStatus ||
    "Active";

  const loanAmount =
    loan?.loanAmount ??
    loan?.calculation
      ?.principal ??
    0;

  const outstanding =
    loan?.outstandingAmount ??
    loan?.calculation
      ?.outstanding ??
    0;

  const tenure =
    loan?.tenure ??
    loan?.loanTenure ??
    loan?.calculation
      ?.tenure ??
    "";

  const tenureUnit =
    loan?.tenureUnit ||
    loan?.calculation
      ?.tenureUnit ||
    "Months";

  const frequency =
    loan?.frequency ||
    loan?.paymentFrequency ||
    loan?.calculation
      ?.frequency ||
    loan?.repayment
      ?.frequency ||
    "Monthly";

  const installmentCount =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule.length
      : 0;

  /* =======================================================
     TOGGLE
  ====================================================== */

  const toggleSection = (
    section
  ) => {
    setOpenSection(
      (current) =>
        current === section
          ? null
          : section
    );
  };

  /* =======================================================
     OPEN SCHEDULE
  ====================================================== */

  const openSchedule = () => {
    setScheduleOpen(true);
  };

  const closeSchedule = () => {
    setScheduleOpen(false);
  };

  return (
    <>
      {/* =====================================================
          BACKDROP
      ====================================================== */}

      <div
        className="
          fixed
          inset-0
          z-[160]
          bg-slate-950/45
          backdrop-blur-[2px]
        "
        onClick={onClose}
      >
        {/* =================================================
            DRAWER
        ================================================== */}

        <aside
          className="
            absolute
            inset-y-0
            right-0
            flex
            w-full
            max-w-[820px]
            flex-col
            overflow-hidden
            border-l
            border-slate-200
            bg-[#F7FAF8]
            shadow-[-20px_0_60px_rgba(15,23,42,0.16)]
          "
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              shrink-0
              border-b
              border-slate-200
              bg-white
            "
          >
            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                px-4
                py-3.5
                sm:px-5
                sm:py-4
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
                  <ReceiptText
                    size={18}
                  />
                </div>

                <div className="min-w-0">
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      gap-2
                    "
                  >
                    <h2
                      className="
                        truncate
                        text-[16px]
                        font-extrabold
                        text-[#17221D]
                        sm:text-[18px]
                      "
                    >
                      {loanNumber}
                    </h2>

                    <span
                      className={`
                        inline-flex
                        shrink-0
                        rounded-full
                        border
                        px-2
                        py-1
                        text-[8px]
                        font-extrabold
                        ${getStatusClass(
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
                      text-[9px]
                      font-medium
                      text-slate-400
                      sm:text-[10px]
                    "
                  >
                    {customerName}
                    {" • "}
                    {customerId}
                  </p>
                </div>
              </div>

              <div
                className="
                  flex
                  shrink-0
                  items-center
                  gap-2
                "
              >
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/reloan?loanId=${encodeURIComponent(
                        loan?.id ||
                          loan?.loanNumber ||
                          ""
                      )}`
                    )
                  }
                  className="
                    inline-flex
                    h-9
                    items-center
                    gap-1.5
                    rounded-lg
                    bg-[#0B6B43]
                    px-3
                    text-[9px]
                    font-extrabold
                    text-white
                    shadow-sm
                    transition
                    hover:bg-[#095B3B]
                    sm:px-3.5
                  "
                >
                  <RefreshCw
                    size={13}
                  />

                  <span className="hidden sm:inline">
                    Re-loan
                  </span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-slate-200
                    bg-white
                    text-slate-400
                    transition
                    hover:bg-slate-50
                    hover:text-slate-700
                  "
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* =================================================
                QUICK LOAN SUMMARY
            ================================================== */}

            <div
              className="
                grid
                grid-cols-2
                gap-2
                border-t
                border-slate-100
                px-4
                py-2.5
                sm:grid-cols-4
                sm:px-5
              "
            >
              <SummaryCard
                icon={IndianRupee}
                label="Loan Amount"
                value={money(
                  loanAmount
                )}
              />

              <SummaryCard
                icon={IndianRupee}
                label="Outstanding"
                value={money(
                  outstanding
                )}
                highlight
              />

              <SummaryCard
                icon={CalendarDays}
                label="Tenure"
                value={
                  tenure
                    ? `${tenure} ${tenureUnit}`
                    : "—"
                }
              />

              <SummaryCard
                icon={Clock3}
                label="Frequency"
                value={
                  frequency
                }
              />
            </div>
          </div>

          {/* =================================================
              DRAWER CONTENT
          ================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              overscroll-contain
              px-3
              py-3
              sm:px-4
              sm:py-4
              lg:px-5
              lg:py-5
            "
          >
            <div
              className="
                mx-auto
                w-full
                max-w-[760px]
                space-y-2.5
              "
            >
              {/* =================================================
                  OVERVIEW
              ================================================== */}

              <AccordionSection
                icon={ReceiptText}
                title="Loan Overview"
                subtitle="Loan amount, status and financial summary"
                open={
                  openSection ===
                  "overview"
                }
                onClick={() =>
                  toggleSection(
                    "overview"
                  )
                }
              >
                <LoanOverview
                  loan={loan}
                />
              </AccordionSection>

              {/* =================================================
                  CUSTOMER
              ================================================== */}

              <AccordionSection
                icon={UserRound}
                title="Customer"
                subtitle="Customer identity and information"
                open={
                  openSection ===
                  "customer"
                }
                onClick={() =>
                  toggleSection(
                    "customer"
                  )
                }
              >
                <LoanCustomerSection
                  loan={loan}
                />
              </AccordionSection>

              {/* =================================================
                  VEHICLE
              ================================================== */}

              <AccordionSection
                icon={CarFront}
                title="Vehicle"
                subtitle="Vehicle and collateral information"
                open={
                  openSection ===
                  "vehicle"
                }
                onClick={() =>
                  toggleSection(
                    "vehicle"
                  )
                }
              >
                <LoanVehicleSection
                  loan={loan}
                />
              </AccordionSection>

              {/* =================================================
                  REPAYMENT
              ================================================== */}

              <AccordionSection
                icon={ShieldCheck}
                title="Repayment"
                subtitle="Repayment progress and configuration"
                open={
                  openSection ===
                  "repayment"
                }
                onClick={() =>
                  toggleSection(
                    "repayment"
                  )
                }
                accent="green"
              >
                <LoanRepaymentProgress
                  loan={loan}
                />

                <div
                  className="
                    mt-3
                    grid
                    grid-cols-2
                    gap-2
                    sm:grid-cols-3
                  "
                >
                  <SmallInfo
                    label="Interest Type"
                    value={
                      loan?.interest?.type ||
                      loan?.interestType ||
                      loan?.calculation
                        ?.interestType ||
                      "—"
                    }
                  />

                  <SmallInfo
                    label="Repayment Method"
                    value={
                      loan?.repayment
                        ?.method ||
                      loan?.repaymentMethod ||
                      loan?.calculation
                        ?.repaymentMethod ||
                      "—"
                    }
                  />

                  <SmallInfo
                    label="Frequency"
                    value={
                      loan?.repayment
                        ?.frequency ||
                      frequency
                    }
                  />

                  <SmallInfo
                    label="Tenure"
                    value={
                      tenure
                        ? `${tenure} ${tenureUnit}`
                        : "—"
                    }
                  />

                  <SmallInfo
                    label="Interest Rate"
                    value={
                      loan?.interest?.rate !==
                        undefined &&
                      loan?.interest?.rate !==
                        null
                        ? `${loan.interest.rate}%`
                        : "—"
                    }
                  />

                  <SmallInfo
                    label="Installments"
                    value={
                      installmentCount ||
                      "—"
                    }
                  />
                </div>
              </AccordionSection>

              {/* =================================================
                  REPAYMENT SCHEDULE
              ================================================== */}

              <button
                type="button"
                onClick={openSchedule}
                className="
                  group
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-2xl
                  border
                  border-slate-200
                  bg-white
                  px-4
                  py-3.5
                  text-left
                  shadow-sm
                  transition
                  duration-200
                  hover:-translate-y-[1px]
                  hover:border-[#B9DCC6]
                  hover:bg-[#FBFEFC]
                  hover:shadow-md
                  sm:px-5
                "
              >
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
                    text-[#0B6B43]
                  "
                >
                  <CalendarDays
                    size={16}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >
                    <h3
                      className="
                        text-[11px]
                        font-extrabold
                        text-[#17221D]
                        sm:text-[12px]
                      "
                    >
                      Repayment Schedule
                    </h3>

                    {installmentCount >
                      0 && (
                      <span
                        className="
                          rounded-full
                          bg-slate-100
                          px-2
                          py-0.5
                          text-[7px]
                          font-extrabold
                          text-slate-500
                        "
                      >
                        {
                          installmentCount
                        }{" "}
                        installments
                      </span>
                    )}
                  </div>

                  <p
                    className="
                      mt-0.5
                      text-[8px]
                      font-medium
                      text-slate-400
                      sm:text-[9px]
                    "
                  >
                    Open the full repayment schedule
                    in a separate view
                  </p>
                </div>

                <div
                  className="
                    flex
                    h-8
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-lg
                    border
                    border-[#B9DCC6]
                    bg-[#F4FAF6]
                    px-2.5
                    text-[8px]
                    font-extrabold
                    text-[#0B6B43]
                    transition
                    group-hover:bg-[#EAF5EF]
                  "
                >
                  <Maximize2
                    size={12}
                  />
                  Open
                </div>
              </button>

              {/* =================================================
                  DOCUMENTS
              ================================================== */}

              <AccordionSection
                icon={FileText}
                title="Documents"
                subtitle="Loan and customer documents"
                open={
                  openSection ===
                  "documents"
                }
                onClick={() =>
                  toggleSection(
                    "documents"
                  )
                }
              >
                <LoanDocuments
                  loan={loan}
                />
              </AccordionSection>

              {/* =================================================
                  ACTIVITY
              ================================================== */}

              <AccordionSection
                icon={Activity}
                title="Activity"
                subtitle="Recent loan activity and history"
                open={
                  openSection ===
                  "activity"
                }
                onClick={() =>
                  toggleSection(
                    "activity"
                  )
                }
              >
                <LoanActivityTimeline
                  loan={loan}
                />
              </AccordionSection>

              <div className="h-3" />
            </div>
          </div>
        </aside>
      </div>

      {/* =====================================================
          REPAYMENT SCHEDULE POPUP
      ====================================================== */}

      {scheduleOpen && (
        <RepaymentScheduleModal
          loan={loan}
          onClose={closeSchedule}
        />
      )}
    </>
  );
};

/* =========================================================
   REPAYMENT SCHEDULE MODAL
========================================================= */

const RepaymentScheduleModal = ({
  loan,
  onClose,
}) => {
  const scheduleCount =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule.length
      : 0;

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          onClose();
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [onClose]);

  return (
    <div
      className="
        fixed
        inset-0
        z-[220]
        flex
        items-center
        justify-center
        bg-slate-950/55
        p-3
        backdrop-blur-[3px]
        sm:p-5
      "
      onClick={onClose}
    >
      <div
        className="
          flex
          h-[92vh]
          w-full
          max-w-[1150px]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-slate-200
          bg-[#F7FAF8]
          shadow-[0_30px_100px_rgba(15,23,42,0.3)]
        "
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        {/* =================================================
            MODAL HEADER
        ================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            justify-between
            gap-3
            border-b
            border-slate-200
            bg-white
            px-4
            py-3.5
            sm:px-5
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
              <CalendarDays
                size={18}
              />
            </div>

            <div className="min-w-0">
              <h2
                className="
                  truncate
                  text-[15px]
                  font-extrabold
                  text-[#17221D]
                  sm:text-[17px]
                "
              >
                Repayment Schedule
              </h2>

              <p
                className="
                  mt-0.5
                  truncate
                  text-[8px]
                  font-medium
                  text-slate-400
                  sm:text-[9px]
                "
              >
                {loan?.loanNumber ||
                  "Loan"}{" "}
                •{" "}
                {loan?.customerName ||
                  "Customer"}
                {scheduleCount > 0 &&
                  ` • ${scheduleCount} installments`}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-400
              transition
              hover:bg-slate-50
              hover:text-slate-700
            "
          >
            <X size={17} />
          </button>
        </div>

        {/* =================================================
            SCHEDULE CONTENT
        ================================================== */}

        <div
          className="
            min-h-0
            flex-1
            overflow-auto
            p-3
            sm:p-4
            lg:p-5
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
            "
          >
            <LoanRepaymentSchedule
              loan={loan}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   ACCORDION
========================================================= */

const AccordionSection = ({
  icon: Icon,
  title,
  subtitle,
  open,
  onClick,
  children,
  accent = "slate",
}) => {
  const styles = {
    slate: {
      iconBg:
        "bg-slate-100",
      iconText:
        "text-slate-600",
      border:
        "border-slate-200",
    },

    green: {
      iconBg:
        "bg-[#EAF5EF]",
      iconText:
        "text-[#0B6B43]",
      border:
        "border-[#CFE8D9]",
    },

    blue: {
      iconBg:
        "bg-blue-50",
      iconText:
        "text-blue-600",
      border:
        "border-blue-100",
    },
  };

  const style =
    styles[accent] ||
    styles.slate;

  return (
    <section
      className={`
        overflow-hidden
        rounded-2xl
        border
        bg-white
        transition-all
        duration-200
        ${
          open
            ? style.border
            : "border-slate-200"
        }
      `}
    >
      <button
        type="button"
        onClick={onClick}
        className="
          flex
          w-full
          items-center
          gap-3
          px-4
          py-3.5
          text-left
          transition
          hover:bg-[#FAFCFB]
          sm:px-5
        "
        aria-expanded={open}
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
            ${style.iconBg}
            ${style.iconText}
          `}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className="
              text-[11px]
              font-extrabold
              text-[#17221D]
              sm:text-[12px]
            "
          >
            {title}
          </h3>

          <p
            className="
              mt-0.5
              truncate
              text-[8px]
              font-medium
              text-slate-400
              sm:text-[9px]
            "
          >
            {subtitle}
          </p>
        </div>

        <ChevronDown
          size={16}
          className={`
            shrink-0
            text-slate-400
            transition-transform
            duration-200
            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {open && (
        <div
          className="
            border-t
            border-slate-100
            bg-[#FCFDFC]
            p-3
            sm:p-4
          "
        >
          {children}
        </div>
      )}
    </section>
  );
};

/* =========================================================
   SUMMARY CARD
========================================================= */

const SummaryCard = ({
  icon: Icon,
  label,
  value,
  highlight = false,
}) => (
  <div
    className="
      flex
      min-w-0
      items-center
      gap-2
      rounded-lg
      border
      border-slate-100
      bg-[#FAFCFB]
      px-2.5
      py-2
    "
  >
    <div
      className="
        flex
        h-7
        w-7
        shrink-0
        items-center
        justify-center
        rounded-md
        bg-[#EAF5EF]
        text-[#0B6B43]
      "
    >
      <Icon size={12} />
    </div>

    <div className="min-w-0">
      <p
        className="
          truncate
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
          mt-0.5
          truncate
          text-[9px]
          font-extrabold
          sm:text-[10px]
          ${
            highlight
              ? "text-[#0B6B43]"
              : "text-[#17221D]"
          }
        `}
      >
        {value}
      </p>
    </div>
  </div>
);

/* =========================================================
   SMALL INFO
========================================================= */

const SmallInfo = ({
  label,
  value,
}) => (
  <div
    className="
      rounded-xl
      border
      border-slate-200
      bg-white
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
      {label}
    </p>

    <p
      className="
        mt-1
        break-words
        text-[10px]
        font-extrabold
        leading-tight
        text-[#253252]
      "
    >
      {value}
    </p>
  </div>
);

export default LoanDetailsDrawer;