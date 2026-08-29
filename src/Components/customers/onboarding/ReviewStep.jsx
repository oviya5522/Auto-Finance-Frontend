// src/components/customers/onboarding/ReviewStep.jsx

import {
  User,
  ShieldCheck,
  Car,
  Users,
  IndianRupee,
  CheckCircle2,
  CalendarDays,
  ChevronRight,
} from "lucide-react";

const ReviewStep = ({
  data = {},
  onEdit,
  onViewSchedule,
}) => {
  const customer = data.customer || {};
  const personal = customer.personal || {};
  const kyc = customer.kyc || {};
  const documents = customer.documents || {};

  const vehicle = data.vehicle || {};
  const rc = data.rc || {};

  const guarantor = data.guarantor || {};

  const loan = data.loan || {};
  const interest = loan.interest || {};
  const repayment = loan.repayment || {};
  const calculation = loan.calculation || {};

  /* =====================================================
     HELPERS
  ====================================================== */

  const money = (value) => {
    return Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

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

  const documentCount =
    documents.uploads?.filter(
      (item) => item?.fileName
    ).length || 0;

  const vehicleName =
    [
      vehicle.brand,
      vehicle.model,
      vehicle.variant,
    ]
      .filter(Boolean)
      .join(" ") || "—";

  const guarantorExists =
    guarantor.hasGuarantor === true;

  const interestAmount =
    calculation.interestAmount ??
    calculation.interest ??
    0;

  const paymentAmount =
    repayment.method === "Principal"
      ? calculation.firstPayment || 0
      : calculation.emiAmount ||
        calculation.paymentAmount ||
        0;

  const paymentLabel =
    repayment.method === "Principal"
      ? "First Payment"
      : "EMI";

  const tenure =
    repayment.tenure
      ? `${repayment.tenure} ${
          repayment.tenureUnit || "Months"
        }`
      : "—";

  const paymentCount =
    calculation.numberOfPayments ||
    calculation.paymentCount ||
    loan.repaymentSchedule?.length ||
    0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">

      

      {/* =================================================
          COMPACT INFORMATION GRID
      ================================================= */}

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 md:grid-cols-2">

        {/* =================================================
            CUSTOMER
        ================================================= */}

        <ReviewCard
          icon={User}
          title="Customer"
          onEdit={() => onEdit?.(1)}
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">

            <ReviewValue
              label="Name"
              value={personal.name}
            />

            <ReviewValue
              label="Mobile"
              value={personal.mobileNumber}
            />

            <ReviewValue
              label="Profession"
              value={personal.profession}
            />

            <ReviewValue
              label="Area"
              value={personal.area}
            />

          </div>
        </ReviewCard>

        {/* =================================================
            KYC
        ================================================= */}

        <ReviewCard
          icon={ShieldCheck}
          title="KYC & Documents"
          onEdit={() => onEdit?.(2)}
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">

            <ReviewValue
              label="Aadhaar"
              value={
                kyc.aadhaarNumber
                  ? maskAadhaar(
                      kyc.aadhaarNumber
                    )
                  : "—"
              }
            />

            <ReviewValue
              label="PAN"
              value={kyc.panNumber}
            />

            <ReviewValue
              label="Driving Licence"
              value={
                kyc.drivingLicenceNumber
              }
            />

            <ReviewValue
              label="Documents"
              value={
                documentCount
                  ? `${documentCount} uploaded`
                  : "None"
              }
              success={
                documentCount >= 2
              }
            />

          </div>
        </ReviewCard>

        {/* =================================================
            VEHICLE
        ================================================= */}

        <ReviewCard
          icon={Car}
          title="Vehicle"
          onEdit={() => onEdit?.(3)}
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">

            <ReviewValue
              label="Vehicle"
              value={vehicleName}
            />

            <ReviewValue
              label="Registration"
              value={
                rc.registrationNumber
              }
            />

            <ReviewValue
              label="Type"
              value={
                vehicle.vehicleType
              }
            />

            <ReviewValue
              label="Year"
              value={
                vehicle.manufacturingYear
              }
            />

          </div>
        </ReviewCard>

        {/* =================================================
            GUARANTOR
        ================================================= */}

        <ReviewCard
          icon={Users}
          title="Guarantor"
          onEdit={() => onEdit?.(4)}
        >
          {guarantorExists ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">

              <ReviewValue
                label="Name"
                value={
                  guarantor.personal?.name
                }
              />

              <ReviewValue
                label="Mobile"
                value={
                  guarantor.personal
                    ?.mobileNumber
                }
              />

              <ReviewValue
                label="Profession"
                value={
                  guarantor.personal
                    ?.profession
                }
              />

              <ReviewValue
                label="Area"
                value={
                  guarantor.personal?.area
                }
              />

            </div>
          ) : (
            <div className="flex h-[52px] items-center">
              <div>
                <p className="text-[10px] font-semibold text-[#17221D]">
                  No guarantor
                </p>

                <p className="mt-0.5 text-[8px] text-slate-400">
                  Proceeding without a guarantor
                </p>
              </div>
            </div>
          )}
        </ReviewCard>
      </div>

      {/* =================================================
          LOAN CARD
      ================================================= */}

      <div className="mt-2 shrink-0">
        <ReviewCard
          icon={IndianRupee}
          title="Loan Details"
          onEdit={() => onEdit?.(5)}
        >
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">

            <ReviewValue
              label="Loan Amount"
              value={`₹${money(
                loan.loanAmount
              )}`}
              highlight
            />

            <ReviewValue
              label="Down Payment"
              value={`₹${money(
                loan.downPayment
              )}`}
            />

            <ReviewValue
              label="Interest"
              value={
                interest.type || "—"
              }
            />

            <ReviewValue
              label="Rate"
              value={
                interest.rate
                  ? `${interest.rate}%`
                  : "—"
              }
            />

            <ReviewValue
              label={paymentLabel}
              value={`₹${money(
                paymentAmount
              )}`}
              highlight
            />

            <ReviewValue
              label="Tenure"
              value={tenure}
            />

            <ReviewValue
              label="Interest Amount"
              value={`₹${money(
                interestAmount
              )}`}
            />

            <ReviewValue
              label="Total Payable"
              value={`₹${money(
                calculation.totalDue
              )}`}
              highlight
            />

          </div>

          {/* =================================================
              SCHEDULE ROW
          ================================================= */}

          <button
            type="button"
            onClick={onViewSchedule}
            className="
              mt-2
              flex
              w-full
              items-center
              justify-between
              rounded-lg
              border
              border-[#D8E9DF]
              bg-[#F7FBF8]
              px-3
              py-2
              text-left
              transition
              hover:border-[#A8D0BD]
            "
          >
            <div className="flex min-w-0 items-center gap-2.5">

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
                "
              >
                <CalendarDays
                  size={13}
                  className="text-[#0B5D3B]"
                />
              </div>

              <div className="min-w-0">

                <p className="text-[10px] font-semibold text-[#17221D]">
                  Repayment Schedule
                </p>

                <p className="text-[8px] text-slate-400">
                  {paymentCount} payments
                  {loan.firstDueDate
                    ? ` • First due ${formatDate(
                        loan.firstDueDate
                      )}`
                    : ""}
                </p>

              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1">

              <span className="text-[9px] font-semibold text-[#0B5D3B]">
                View
              </span>

              <ChevronRight
                size={12}
                className="text-[#0B5D3B]"
              />

            </div>
          </button>
        </ReviewCard>
      </div>

      {/* =================================================
          READY STATUS
      ================================================= */}

      <div
        className="
          mt-2
          flex
          shrink-0
          items-center
          gap-2
          rounded-lg
          border
          border-[#D8E9DF]
          bg-[#F6FBF8]
          px-3
          py-2
        "
      >
        <div
          className="
            flex
            h-6
            w-6
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#EAF5EF]
          "
        >
          <CheckCircle2
            size={13}
            className="text-[#0B5D3B]"
          />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-semibold leading-tight text-[#17221D]">
            Ready to create customer
          </p>

          <p className="text-[8px] leading-tight text-slate-400">
            All required information has been reviewed.
          </p>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   REVIEW CARD
========================================================= */

const ReviewCard = ({
  icon: Icon,
  title,
  onEdit,
  children,
}) => {
  return (
    <section
      className="
        min-h-0
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
          gap-2
          border-b
          border-slate-100
          px-3
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
          "
        >
          <Icon
            size={14}
            className="text-[#0B5D3B]"
          />
        </div>

        <h3
          className="
            flex-1
            text-[10px]
            font-semibold
            text-[#17221D]
          "
        >
          {title}
        </h3>

        <button
          type="button"
          onClick={onEdit}
          className="
            rounded-md
            px-1.5
            py-1
            text-[8px]
            font-semibold
            text-[#0B5D3B]
            transition
            hover:bg-[#EAF5EF]
          "
        >
          Edit
        </button>
      </div>

      {/* BODY */}

      <div className="p-3">
        {children}
      </div>
    </section>
  );
};

/* =========================================================
   REVIEW VALUE
========================================================= */

const ReviewValue = ({
  label,
  value,
  highlight = false,
  success = false,
}) => {
  return (
    <div className="min-w-0">

      <p
        className="
          truncate
          text-[7px]
          font-medium
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
          text-[10px]
          font-semibold
          ${
            success || highlight
              ? "text-[#0B5D3B]"
              : "text-[#17221D]"
          }
        `}
      >
        {value || "—"}
      </p>

    </div>
  );
};

/* =========================================================
   MASK AADHAAR
========================================================= */

const maskAadhaar = (value) => {
  const digits = String(value || "");

  if (digits.length < 4) {
    return digits;
  }

  return `XXXX XXXX ${digits.slice(-4)}`;
};

export default ReviewStep;