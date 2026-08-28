// src/Components/customers/onboarding/ReviewStep.jsx

import {
  User,
  ShieldCheck,
  Car,
  IndianRupee,
  CheckCircle2,
} from "lucide-react";

const ReviewStep = ({
  data = {},
  onEdit,
}) => {
  const customer = data.customer || {};
  const personal = customer.personal || {};
  const kyc = customer.kyc || {};
  const documents = customer.documents || {};

  const vehicle = data.vehicle || {};
  const rc = data.rc || {};

  const loan = data.loan || {};
  const interest = loan.interest || {};
  const repayment = loan.repayment || {};
  const calculation = loan.calculation || {};

  const money = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
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

  const documentCount =
    documents.uploads?.filter(
      (item) => item?.fileName
    ).length || 0;

  const vehicleName = [
    vehicle.brand,
    vehicle.model,
    vehicle.variant,
  ]
    .filter(Boolean)
    .join(" ") || "—";

  return (
    <div className="space-y-2">

      {/* =================================================
          CUSTOMER
      ================================================== */}

      <ReviewSection
        icon={User}
        title="Customer Information"
        onEdit={() => onEdit?.(1)}
      >
        <ReviewGrid columns="4">

          <ReviewItem
            label="Name"
            value={personal.name}
          />

          <ReviewItem
            label="Mobile"
            value={personal.mobileNumber}
          />

          <ReviewItem
            label="Area"
            value={personal.area}
          />

          <ReviewItem
            label="Profession"
            value={personal.profession}
          />

        </ReviewGrid>
      </ReviewSection>


      {/* =================================================
          KYC
      ================================================== */}

      <ReviewSection
        icon={ShieldCheck}
        title="KYC & Documents"
        onEdit={() => onEdit?.(2)}
      >
        <ReviewGrid columns="4">

          <ReviewItem
            label="Aadhaar"
            value={
              kyc.aadhaarNumber
                ? maskAadhaar(
                    kyc.aadhaarNumber
                  )
                : "—"
            }
          />

          <ReviewItem
            label="Driving Licence"
            value={
              kyc.drivingLicenceNumber
            }
          />

          <ReviewItem
            label="PAN"
            value={kyc.panNumber}
          />

          <ReviewItem
            label="Documents"
            value={
              documentCount > 0
                ? `${documentCount} uploaded`
                : "None"
            }
            success={
              documentCount >= 2
            }
          />

        </ReviewGrid>
      </ReviewSection>


      {/* =================================================
          VEHICLE
      ================================================== */}

      <ReviewSection
        icon={Car}
        title="Vehicle & RC"
        onEdit={() => onEdit?.(3)}
      >
        <ReviewGrid columns="4">

          <ReviewItem
            label="Vehicle"
            value={vehicleName}
          />

          <ReviewItem
            label="Type"
            value={vehicle.vehicleType}
          />

          <ReviewItem
            label="Registration"
            value={rc.registrationNumber}
          />

          <ReviewItem
            label="Manufacturing Year"
            value={
              vehicle.manufacturingYear
            }
          />

        </ReviewGrid>
      </ReviewSection>


      {/* =================================================
          LOAN
      ================================================== */}

      <ReviewSection
        icon={IndianRupee}
        title="Loan Details"
        onEdit={() => onEdit?.(5)}
      >
        <ReviewGrid columns="4">

          <ReviewItem
            label="Loan Amount"
            value={`₹${money(
              loan.loanAmount
            )}`}
            highlight
          />

          <ReviewItem
            label="Interest Type"
            value={
              interest.type || "—"
            }
          />

          <ReviewItem
            label="Interest Rate"
            value={
              interest.rate
                ? `${interest.rate}%`
                : "—"
            }
          />

          <ReviewItem
            label="Tenure"
            value={
              repayment.tenure
                ? `${repayment.tenure} ${
                    repayment.tenureUnit ||
                    "Months"
                  }`
                : "—"
            }
          />

          <ReviewItem
            label="Interest Amount"
            value={`₹${money(
              calculation.interestAmount ??
                calculation.interest ??
                0
            )}`}
          />

          <ReviewItem
            label={
              repayment.method ===
              "Principal"
                ? "First Payment"
                : "EMI"
            }
            value={`₹${money(
              repayment.method ===
              "Principal"
                ? calculation.firstPayment ||
                  0
                : calculation.emiAmount ||
                  0
            )}`}
            highlight
          />

          <ReviewItem
            label="Total Payable"
            value={`₹${money(
              calculation.totalDue
            )}`}
            highlight
          />

          <ReviewItem
            label="First Due Date"
            value={
              loan.firstDueDate
                ? formatDate(
                    loan.firstDueDate
                  )
                : "—"
            }
          />

        </ReviewGrid>
      </ReviewSection>


      {/* =================================================
          FINAL READY STATUS
      ================================================== */}

      <div
        className="
          flex
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
        <CheckCircle2
          size={15}
          className="shrink-0 text-[#0B5D3B]"
        />

        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-[#17221D]">
            Ready to create customer
          </p>

          <p className="text-[9px] text-slate-400">
            Review the above information before confirming.
          </p>
        </div>
      </div>

    </div>
  );
};


/* =========================================================
   SECTION
========================================================= */

const ReviewSection = ({
  icon: Icon,
  title,
  onEdit,
  children,
}) => {
  return (
    <section
      className="
        rounded-lg
        border
        border-slate-200
        bg-white
      "
    >

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
            text-[11px]
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
            text-[9px]
            font-semibold
            text-[#0B5D3B]
            hover:underline
          "
        >
          Edit
        </button>

      </div>

      <div className="px-3 py-2">
        {children}
      </div>

    </section>
  );
};


/* =========================================================
   GRID
========================================================= */

const ReviewGrid = ({
  children,
  columns = "4",
}) => {
  return (
    <div
      className={`
        grid
        grid-cols-2
        gap-x-3
        gap-y-2
        ${
          columns === "4"
            ? "md:grid-cols-4"
            : "md:grid-cols-3"
        }
      `}
    >
      {children}
    </div>
  );
};


/* =========================================================
   ITEM
========================================================= */

const ReviewItem = ({
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
          text-[8px]
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
          text-[11px]
          font-semibold

          ${
            success
              ? "text-[#0B5D3B]"
              : highlight
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