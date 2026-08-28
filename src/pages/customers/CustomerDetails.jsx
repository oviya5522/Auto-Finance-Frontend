// src/pages/customers/CustomerDetails.jsx

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  User,
  Car,
  IndianRupee,
  FileText,
} from "lucide-react";

import {
  getCustomerById,
} from "../../services/customerStorage";


const CustomerDetails = () => {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] =
    useState(null);


  /* =====================================================
     LOAD CUSTOMER
  ====================================================== */

  useEffect(() => {
    const loadCustomer = () => {
      const data =
        getCustomerById(customerId);

      setCustomer(data);
    };

    loadCustomer();

    const handleUpdate = () => {
      loadCustomer();
    };

    window.addEventListener(
      "fleetopz:data-updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "fleetopz:data-updated",
        handleUpdate
      );

      window.removeEventListener(
        "storage",
        handleUpdate
      );
    };
  }, [customerId]);


  /* =====================================================
     NOT FOUND
  ====================================================== */

  if (!customer) {
    return (
      <div className="min-h-full bg-[#F8FAF9] p-5">

        <button
          type="button"
          onClick={() =>
            navigate("/customers")
          }
          className="
            mb-3
            inline-flex
            items-center
            gap-1.5
            text-xs
            font-medium
            text-slate-500
            hover:text-[#0B5D3B]
          "
        >
          <ArrowLeft size={14} />
          Back to Customers
        </button>

        <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Customer not found
          </p>
        </div>

      </div>
    );
  }


  /* =====================================================
     DATA
  ====================================================== */

  const personal =
    customer.customer?.personal || {};

  const kyc =
    customer.customer?.kyc || {};

  const vehicle =
    customer.vehicle || {};

  const rc =
    customer.rc || {};

  const loan =
    customer.loan || {};

  const calculation =
    loan.calculation || {};


  /* =====================================================
     HELPERS
  ====================================================== */

  const money = (value) =>
    Number(value || 0).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    );


  const formatDate = (value) => {
    if (!value) {
      return "—";
    }

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


  const vehicleName =
    [
      vehicle.brand,
      vehicle.model,
      vehicle.variant,
    ]
      .filter(Boolean)
      .join(" ") || "—";


  return (
    <div className="min-h-full bg-[#F8FAF9] p-5">

      {/* =================================================
          HEADER
      ================================================== */}

      <div
        className="
          mb-4
          flex
          items-center
          justify-between
          gap-3
        "
      >

        <div className="flex min-w-0 items-center gap-2.5">

          <button
            type="button"
            onClick={() =>
              navigate("/customers")
            }
            className="
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-lg
              border
              border-slate-200
              bg-white
              text-slate-500
              transition
              hover:border-[#0B5D3B]
              hover:text-[#0B5D3B]
            "
          >
            <ArrowLeft size={15} />
          </button>


          <div className="min-w-0">

            <div className="flex items-center gap-2">

              <h1
                className="
                  truncate
                  text-[20px]
                  font-semibold
                  text-[#17221D]
                "
              >
                {personal.name ||
                  "Customer"}
              </h1>

              <span
                className="
                  rounded-full
                  bg-[#EAF5EF]
                  px-2
                  py-0.5
                  text-[9px]
                  font-semibold
                  text-[#0B5D3B]
                "
              >
                {customer.customer?.status ||
                  "Unknown"}
              </span>

            </div>

            <p className="mt-0.5 text-[11px] text-slate-400">
              {customer.customer?.customerNumber ||
                customer.customer?.id ||
                "—"}
            </p>

          </div>

        </div>


        <div className="hidden text-right sm:block">

          <p className="text-[9px] uppercase tracking-wide text-slate-400">
            Created
          </p>

          <p className="mt-0.5 text-[11px] font-medium text-slate-600">
            {formatDate(
              customer.customer?.createdAt
            )}
          </p>

        </div>

      </div>


      {/* =================================================
          CUSTOMER INFORMATION
      ================================================== */}

      <DetailSection
        icon={User}
        title="Customer Information"
      >
        <DetailGrid>

          <DetailItem
            label="Name"
            value={personal.name}
          />

          <DetailItem
            label="Mobile"
            value={personal.mobileNumber}
          />

          <DetailItem
            label="Profession"
            value={personal.profession}
          />

          <DetailItem
            label="Own House"
            value={
              personal.ownHouse === true
                ? "Yes"
                : personal.ownHouse === false
                ? "No"
                : "—"
            }
          />

          <DetailItem
            label="Address"
            value={personal.address}
            wide
          />

          <DetailItem
            label="Area"
            value={personal.area}
          />

          <DetailItem
            label="Landmark"
            value={personal.landmark}
          />

          <DetailItem
            label="Pincode"
            value={personal.pincode}
          />

        </DetailGrid>
      </DetailSection>


      {/* =================================================
          KYC
      ================================================== */}

      <DetailSection
        icon={FileText}
        title="KYC Information"
      >
        <DetailGrid>

          <DetailItem
            label="Aadhaar"
            value={
              kyc.aadhaarNumber
                ? maskAadhaar(
                    kyc.aadhaarNumber
                  )
                : "—"
            }
          />

          <DetailItem
            label="Driving Licence"
            value={
              kyc.drivingLicenceNumber
            }
          />

          <DetailItem
            label="PAN"
            value={kyc.panNumber}
          />

          <DetailItem
            label="Voter ID"
            value={
              kyc.voterIdNumber
            }
          />

        </DetailGrid>
      </DetailSection>


      {/* =================================================
          VEHICLE
      ================================================== */}

      <DetailSection
        icon={Car}
        title="Vehicle & RC"
      >
        <DetailGrid>

          <DetailItem
            label="Vehicle"
            value={vehicleName}
          />

          <DetailItem
            label="Vehicle Type"
            value={vehicle.vehicleType}
          />

          <DetailItem
            label="Colour"
            value={vehicle.colour}
          />

          <DetailItem
            label="Manufacturing Year"
            value={
              vehicle.manufacturingYear
            }
          />

          <DetailItem
            label="Registration Number"
            value={
              rc.registrationNumber
            }
          />

          <DetailItem
            label="RC Book Number"
            value={
              rc.rcBookNumber
            }
          />

          <DetailItem
            label="RTO Location"
            value={rc.location}
          />

          <DetailItem
            label="Chassis Number"
            value={rc.chassisNumber}
          />

          <DetailItem
            label="Engine Number"
            value={rc.engineNumber}
          />

          <DetailItem
            label="Insurance Company"
            value={
              rc.insurance?.companyName
            }
          />

          <DetailItem
            label="Policy Number"
            value={
              rc.insurance?.policyNumber
            }
          />

          <DetailItem
            label="Insurance Expiry"
            value={
              rc.insurance?.expiryDate
                ? formatDate(
                    rc.insurance.expiryDate
                  )
                : "—"
            }
          />

        </DetailGrid>
      </DetailSection>


      {/* =================================================
          LOAN
      ================================================== */}

      <DetailSection
        icon={IndianRupee}
        title="Loan Information"
      >
        <DetailGrid>

          <DetailItem
            label="Loan Number"
            value={loan.loanNumber}
          />

          <DetailItem
            label="Loan Amount"
            value={`₹${money(
              loan.loanAmount
            )}`}
          />

          <DetailItem
            label="Principal"
            value={`₹${money(
              calculation.principal
            )}`}
          />

          <DetailItem
            label="Interest"
            value={`₹${money(
              calculation.interestAmount ??
                calculation.interest
            )}`}
          />

          <DetailItem
            label="Total Payable"
            value={`₹${money(
              calculation.totalDue
            )}`}
            highlight
          />

          <DetailItem
            label={
              loan.repayment?.method ===
              "Principal"
                ? "First Payment"
                : "EMI"
            }
            value={`₹${money(
              loan.repayment?.method ===
              "Principal"
                ? calculation.firstPayment
                : calculation.emiAmount
            )}`}
            highlight
          />

          <DetailItem
            label="Interest Type"
            value={
              loan.interest?.type
            }
          />

          <DetailItem
            label="Interest Rate"
            value={
              loan.interest?.rate
                ? `${loan.interest.rate}%`
                : "—"
            }
          />

          <DetailItem
            label="Repayment Method"
            value={
              loan.repayment?.method
            }
          />

          <DetailItem
            label="Tenure"
            value={
              loan.repayment?.tenure
                ? `${loan.repayment.tenure} ${
                    loan.repayment.tenureUnit ||
                    "Months"
                  }`
                : "—"
            }
          />

          <DetailItem
            label="Frequency"
            value={
              loan.repayment?.frequency
            }
          />

          <DetailItem
            label="First Due Date"
            value={
              loan.firstDueDate
                ? formatDate(
                    loan.firstDueDate
                  )
                : "—"
            }
          />

        </DetailGrid>
      </DetailSection>

    </div>
  );
};


/* =========================================================
   SECTION
========================================================= */

const DetailSection = ({
  icon: Icon,
  title,
  children,
}) => {
  return (
    <section className="mb-2.5 rounded-lg border border-slate-200 bg-white">

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

        <h2 className="text-[12px] font-semibold text-[#17221D]">
          {title}
        </h2>

      </div>

      <div className="px-3 py-2.5">
        {children}
      </div>

    </section>
  );
};


/* =========================================================
   GRID
========================================================= */

const DetailGrid = ({
  children,
}) => {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
};


/* =========================================================
   ITEM
========================================================= */

const DetailItem = ({
  label,
  value,
  wide = false,
  highlight = false,
}) => {
  return (
    <div
      className={`
        min-w-0
        ${
          wide
            ? "col-span-2 sm:col-span-3 lg:col-span-4"
            : ""
        }
      `}
    >

      <p
        className="
          truncate
          text-[9px]
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
            highlight
              ? "text-[#0B5D3B]"
              : "text-[#17221D]"
          }
        `}
        title={value || "—"}
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


export default CustomerDetails;