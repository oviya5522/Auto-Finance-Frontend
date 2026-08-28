// src/Components/customers/onboarding/LoanDetailsStep.jsx

import { useEffect, useMemo, useState } from "react";

import {
  IndianRupee,
  Calculator,
  CalendarDays,
  ReceiptText,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";

import {
  calculateLoan,
  calculateDownPayment,
} from "../../../services/loanCalculator";

import SummaryCard from "./SummaryCard";


const LoanDetailsStep = ({
  data = {},
  onChange,
}) => {
  const loan = data.loan || {};

  const interest = loan.interest || {};
  const repayment = loan.repayment || {};
  const charges = loan.charges || {};
  const collection = loan.collection || {};

  const [showCharges, setShowCharges] =
    useState(false);

  const [showInitialPayment, setShowInitialPayment] =
    useState(false);


  /* =====================================================
     UPDATE LOAN
  ====================================================== */

  const updateLoan = (field, value) => {
    onChange({
      ...data,

      loan: {
        ...loan,
        [field]: value,
      },
    });
  };


  /* =====================================================
     UPDATE INTEREST
  ====================================================== */

  const updateInterest = (field, value) => {
    onChange({
      ...data,

      loan: {
        ...loan,

        interest: {
          ...interest,
          [field]: value,
        },
      },
    });
  };


  /* =====================================================
     UPDATE REPAYMENT
  ====================================================== */

  const updateRepayment = (field, value) => {
    onChange({
      ...data,

      loan: {
        ...loan,

        repayment: {
          ...repayment,
          [field]: value,
        },
      },
    });
  };


  /* =====================================================
     UPDATE CHARGES
  ====================================================== */

  const updateCharges = (field, value) => {
    onChange({
      ...data,

      loan: {
        ...loan,

        charges: {
          ...charges,
          [field]: value,
        },
      },
    });
  };


  /* =====================================================
     UPDATE COLLECTION
  ====================================================== */

  const updateCollection = (field, value) => {
    onChange({
      ...data,

      loan: {
        ...loan,

        collection: {
          ...collection,
          [field]: value,
        },
      },
    });
  };


  /* =====================================================
     LIVE CALCULATION
  ====================================================== */

  const calculation = useMemo(() => {
    return calculateLoan({
      principal: loan.loanAmount,
      rate: interest.rate,
      tenure: repayment.tenure,
      tenureUnit: repayment.tenureUnit,
      interestType: interest.type,
      repaymentMethod: repayment.method,
      frequency: repayment.frequency,
    });
  }, [
    loan.loanAmount,
    interest.rate,
    interest.type,
    repayment.method,
    repayment.tenure,
    repayment.tenureUnit,
    repayment.frequency,
  ]);


  /* =====================================================
     DOWN PAYMENT
  ====================================================== */

  const downPayment = useMemo(() => {
    return calculateDownPayment({
      vehicleAmount: loan.vehicleAmount,
      loanAmount: loan.loanAmount,
    });
  }, [
    loan.vehicleAmount,
    loan.loanAmount,
  ]);


  /* =====================================================
     STORE CALCULATED VALUES
  ====================================================== */

  useEffect(() => {
    const calculatedValues = {
      principal:
        calculation.principal || 0,

      interestAmount:
        calculation.interestAmount ??
        calculation.interest ??
        0,

      totalDue:
        calculation.totalDue || 0,

      emiAmount:
        calculation.emiAmount || 0,

      numberOfPayments:
        calculation.paymentCount ||
        calculation.numberOfPayments ||
        0,

      principalPerPayment:
        calculation.principalPerPayment || 0,

      interestPerPayment:
        calculation.interestPerPayment || 0,

      firstPayment:
        calculation.firstPayment || 0,

      lastPayment:
        calculation.lastPayment || 0,

      paymentAmount:
        calculation.paymentAmount || 0,
    };

    const currentCalculation =
      loan.calculation || {};

    const changed =
      currentCalculation.principal !==
        calculatedValues.principal ||

      currentCalculation.interestAmount !==
        calculatedValues.interestAmount ||

      currentCalculation.totalDue !==
        calculatedValues.totalDue ||

      currentCalculation.emiAmount !==
        calculatedValues.emiAmount ||

      currentCalculation.numberOfPayments !==
        calculatedValues.numberOfPayments ||

      currentCalculation.principalPerPayment !==
        calculatedValues.principalPerPayment ||

      currentCalculation.interestPerPayment !==
        calculatedValues.interestPerPayment ||

      currentCalculation.firstPayment !==
        calculatedValues.firstPayment ||

      currentCalculation.lastPayment !==
        calculatedValues.lastPayment ||

      currentCalculation.paymentAmount !==
        calculatedValues.paymentAmount ||

      loan.downPayment !== downPayment;

    if (!changed) {
      return;
    }

    onChange({
      ...data,

      loan: {
        ...loan,

        downPayment,

        calculation: calculatedValues,
      },
    });
  }, [
    calculation.principal,
    calculation.interest,
    calculation.interestAmount,
    calculation.totalDue,
    calculation.emiAmount,
    calculation.paymentCount,
    calculation.numberOfPayments,
    calculation.principalPerPayment,
    calculation.interestPerPayment,
    calculation.firstPayment,
    calculation.lastPayment,
    calculation.paymentAmount,
    downPayment,
  ]);


  /* =====================================================
     HELPERS
  ====================================================== */

  const money = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );
  };


  const paymentAmount =
    repayment.method === "Principal"
      ? calculation.firstPayment || 0
      : calculation.emiAmount || 0;


  const interestAmount =
    calculation.interestAmount ??
    calculation.interest ??
    0;


  const numberOfPayments =
    calculation.paymentCount ||
    calculation.numberOfPayments ||
    0;


  return (
    <div className="space-y-3">

      {/* =================================================
          LOAN DETAILS
      ================================================== */}

      <CompactSection
        icon={IndianRupee}
        title="Loan Details"
        subtitle="Loan amount and initial repayment date"
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

          <FormField label="Vehicle Amount">
            <MoneyInput
              value={loan.vehicleAmount}
              placeholder="Vehicle amount"
              onChange={(value) =>
                updateLoan(
                  "vehicleAmount",
                  value
                )
              }
            />
          </FormField>


          <FormField label="Loan Amount">
            <MoneyInput
              value={loan.loanAmount}
              placeholder="Loan amount"
              onChange={(value) =>
                updateLoan(
                  "loanAmount",
                  value
                )
              }
            />
          </FormField>


          <FormField label="Down Payment">
            <div className="relative">

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                ₹
              </span>

              <input
                type="text"
                readOnly
                value={money(downPayment)}
                className="
                  h-[38px]
                  w-full
                  rounded-md
                  border
                  border-slate-200
                  bg-slate-50
                  px-3
                  pl-7
                  text-xs
                  font-medium
                  text-slate-500
                  outline-none
                "
              />

            </div>
          </FormField>


          <FormField label="First Due Date">
            <input
              type="date"
              value={loan.firstDueDate || ""}
              onChange={(e) =>
                updateLoan(
                  "firstDueDate",
                  e.target.value
                )
              }
              className={inputClass}
            />
          </FormField>

        </div>
      </CompactSection>


      {/* =================================================
          INTEREST & REPAYMENT
      ================================================== */}

      <CompactSection
        icon={Calculator}
        title="Interest & Repayment"
        subtitle="Choose the interest and repayment method"
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

          <FormField label="Interest Type">
            <select
              value={
                interest.type || "Flat"
              }
              onChange={(e) =>
                updateInterest(
                  "type",
                  e.target.value
                )
              }
              className={inputClass}
            >
              <option value="Flat">
                Flat
              </option>

              <option value="Reducing">
                Reducing Balance
              </option>
            </select>
          </FormField>


          <FormField label="Interest Rate">
            <div className="relative">

              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={
                  interest.rate ?? ""
                }
                onChange={(e) =>
                  updateInterest(
                    "rate",
                    e.target.value
                  )
                }
                className={`${inputClass} pr-8`}
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                %
              </span>

            </div>
          </FormField>


          <FormField label="Repayment Method">
            <select
              value={
                repayment.method || "EMI"
              }
              onChange={(e) =>
                updateRepayment(
                  "method",
                  e.target.value
                )
              }
              className={inputClass}
            >
              <option value="EMI">
                EMI Based
              </option>

              <option value="Principal">
                Principal Based
              </option>
            </select>
          </FormField>


          <FormField label="Payment Frequency">
            <select
              value={
                repayment.frequency ||
                "Monthly"
              }
              onChange={(e) =>
                updateRepayment(
                  "frequency",
                  e.target.value
                )
              }
              className={inputClass}
            >
              <option value="Daily">
                Daily
              </option>

              <option value="Weekly">
                Weekly
              </option>

              <option value="Monthly">
                Monthly
              </option>
            </select>
          </FormField>


          {/* TENURE */}

          <FormField label="Tenure">

            <div className="flex gap-2">

              <input
                type="number"
                min="1"
                placeholder="24"
                value={
                  repayment.tenure ?? ""
                }
                onChange={(e) =>
                  updateRepayment(
                    "tenure",
                    e.target.value
                  )
                }
                className="
                  h-[38px]
                  min-w-0
                  flex-1
                  rounded-md
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-xs
                  font-medium
                  text-slate-700
                  placeholder:text-slate-400
                  outline-none
                  focus:border-[#0B5D3B]
                  focus:ring-1
                  focus:ring-[#0B5D3B]
                "
              />

              <select
                value={
                  repayment.tenureUnit ||
                  "Months"
                }
                onChange={(e) =>
                  updateRepayment(
                    "tenureUnit",
                    e.target.value
                  )
                }
                className="
                  h-[38px]
                  w-[110px]
                  rounded-md
                  border
                  border-slate-200
                  bg-white
                  px-3
                  text-xs
                  text-slate-700
                  outline-none
                  focus:border-[#0B5D3B]
                  focus:ring-1
                  focus:ring-[#0B5D3B]
                "
              >
                <option value="Months">
                  Months
                </option>

                <option value="Years">
                  Years
                </option>

                <option value="Weeks">
                  Weeks
                </option>

                <option value="Days">
                  Days
                </option>

              </select>

            </div>

          </FormField>

        </div>
      </CompactSection>


      {/* =================================================
          CALCULATION + REPAYMENT SUMMARY
      ================================================== */}

      <section className="rounded-xl border border-[#D8E9DF] bg-[#F6FBF8]">

        <div className="flex items-center justify-between border-b border-[#D8E9DF] px-4 py-2.5">

          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF5EF]">

              <Calculator
                size={16}
                className="text-[#0B5D3B]"
              />

            </div>

            <div>

              <h3 className="text-sm font-semibold text-[#17221D]">
                Loan Calculation & Repayment Summary
              </h3>

              <p className="text-[11px] text-slate-400">
                Automatically calculated from loan inputs
              </p>

            </div>

          </div>

          <span className="rounded-full bg-[#EAF5EF] px-2.5 py-1 text-[10px] font-semibold text-[#0B5D3B]">
            Live
          </span>

        </div>


        <div className="grid grid-cols-2 gap-2.5 p-3 sm:grid-cols-3 lg:grid-cols-6">

          <SummaryCard
            label="Principal"
            value={`₹${money(
              calculation.principal
            )}`}
          />


          <SummaryCard
            label="Interest"
            value={`₹${money(
              interestAmount
            )}`}
          />


          <SummaryCard
            label="Total Payable"
            value={`₹${money(
              calculation.totalDue
            )}`}
            highlight
          />


          <SummaryCard
            label={
              repayment.method === "Principal"
                ? "First Payment"
                : "EMI Amount"
            }
            value={`₹${money(
              paymentAmount
            )}`}
            highlight
          />


          <SummaryCard
            label="Number of Payments"
            value={numberOfPayments}
          />


          <SummaryCard
            label="First Due Date"
            value={
              loan.firstDueDate
                ? formatDate(
                    loan.firstDueDate
                  )
                : "—"
            }
          />

        </div>

      </section>


      {/* =================================================
          ADDITIONAL CHARGES COLLAPSED
      ================================================== */}

      <CollapsibleHeader
        icon={ReceiptText}
        title="Additional Charges"
        subtitle="Optional charges and adjustments"
        open={showCharges}
        onClick={() =>
          setShowCharges(
            (previous) => !previous
          )
        }
      />

      {showCharges && (

        <CompactSectionBody>

          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

            <FormField label="Advance EMI">
              <MoneyInput
                value={
                  charges.advanceEmi
                }
                placeholder="0.00"
                onChange={(value) =>
                  updateCharges(
                    "advanceEmi",
                    value
                  )
                }
              />
            </FormField>


            <FormField label="Document Charge">
              <MoneyInput
                value={
                  charges.documentCharge
                }
                placeholder="0.00"
                onChange={(value) =>
                  updateCharges(
                    "documentCharge",
                    value
                  )
                }
              />
            </FormField>


            <FormField label="Insurance Amount">
              <MoneyInput
                value={
                  charges.insuranceAmount
                }
                placeholder="0.00"
                onChange={(value) =>
                  updateCharges(
                    "insuranceAmount",
                    value
                  )
                }
              />
            </FormField>


            <FormField label="Fine Amount">
              <MoneyInput
                value={
                  charges.fineAmount
                }
                placeholder="0.00"
                onChange={(value) =>
                  updateCharges(
                    "fineAmount",
                    value
                  )
                }
              />
            </FormField>


            <FormField label="Difference Initial">
              <MoneyInput
                value={
                  charges.differenceInitial
                }
                placeholder="0.00"
                onChange={(value) =>
                  updateCharges(
                    "differenceInitial",
                    value
                  )
                }
              />
            </FormField>


            <FormField label="Default Interest">
              <MoneyInput
                value={
                  charges.defaultInterest
                }
                placeholder="0.00"
                onChange={(value) =>
                  updateCharges(
                    "defaultInterest",
                    value
                  )
                }
              />
            </FormField>


            <FormField label="Grace Days">
              <input
                type="number"
                min="0"
                value={
                  charges.graceDays ?? ""
                }
                onChange={(e) =>
                  updateCharges(
                    "graceDays",
                    e.target.value
                  )
                }
                className={inputClass}
                placeholder="0"
              />
            </FormField>

          </div>

        </CompactSectionBody>
      )}


      {/* =================================================
          INITIAL PAYMENT COLLAPSED
      ================================================== */}

      <CollapsibleHeader
        icon={CreditCard}
        title="Initial Payment"
        subtitle="Record payment collected at loan creation"
        open={showInitialPayment}
        onClick={() =>
          setShowInitialPayment(
            (previous) => !previous
          )
        }
      />

      {showInitialPayment && (

        <CompactSectionBody>

          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

            <FormField label="Pay Mode">
              <select
                value={
                  collection.payMode || ""
                }
                onChange={(e) =>
                  updateCollection(
                    "payMode",
                    e.target.value
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select payment mode
                </option>

                <option value="Cash">
                  Cash
                </option>

                <option value="UPI">
                  UPI
                </option>

                <option value="Bank Transfer">
                  Bank Transfer
                </option>

                <option value="Cheque">
                  Cheque
                </option>

                <option value="Card">
                  Card
                </option>
              </select>
            </FormField>


            <FormField label="Receipt Amount">

              <MoneyInput
                value={
                  collection.receiptAmount
                }
                placeholder="0.00"
                onChange={(value) =>
                  updateCollection(
                    "receiptAmount",
                    value
                  )
                }
              />

            </FormField>


            <FormField label="Receipt Mode">

              <select
                value={
                  collection.receiptMode || ""
                }
                onChange={(e) =>
                  updateCollection(
                    "receiptMode",
                    e.target.value
                  )
                }
                className={inputClass}
              >
                <option value="">
                  Select receipt mode
                </option>

                <option value="Cash">
                  Cash
                </option>

                <option value="UPI">
                  UPI
                </option>

                <option value="Bank">
                  Bank
                </option>

                <option value="Cheque">
                  Cheque
                </option>
              </select>

            </FormField>


            <FormField label="Remarks">

              <input
                type="text"
                placeholder="Payment remarks"
                value={
                  loan.remarks || ""
                }
                onChange={(e) =>
                  updateLoan(
                    "remarks",
                    e.target.value
                  )
                }
                className={inputClass}
              />

            </FormField>

          </div>

        </CompactSectionBody>
      )}

    </div>
  );
};


/* =========================================================
   COLLAPSIBLE HEADER
========================================================= */

const CollapsibleHeader = ({
  icon: Icon,
  title,
  subtitle,
  open,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        border
        border-slate-200
        bg-white
        px-4
        py-3
        text-left
        transition
        hover:border-slate-300
      "
    >

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EF]">

        <Icon
          size={16}
          className="text-[#0B5D3B]"
        />

      </div>


      <div className="min-w-0 flex-1">

        <h3 className="text-sm font-semibold text-[#17221D]">
          {title}
        </h3>

        <p className="text-[11px] text-slate-400">
          {subtitle}
        </p>

      </div>


      {open ? (
        <ChevronUp
          size={17}
          className="shrink-0 text-slate-400"
        />
      ) : (
        <ChevronDown
          size={17}
          className="shrink-0 text-slate-400"
        />
      )}

    </button>
  );
};


/* =========================================================
   COMPACT SECTION
========================================================= */

const CompactSection = ({
  icon: Icon,
  title,
  subtitle,
  children,
}) => {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">

      <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-2.5">

        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF5EF]">

          <Icon
            size={16}
            className="text-[#0B5D3B]"
          />

        </div>


        <div>

          <h3 className="text-sm font-semibold text-[#17221D]">
            {title}
          </h3>

          <p className="text-[11px] text-slate-400">
            {subtitle}
          </p>

        </div>

      </div>


      <div className="p-4">
        {children}
      </div>

    </section>
  );
};


/* =========================================================
   COMPACT SECTION BODY
========================================================= */

const CompactSectionBody = ({
  children,
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      {children}
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
    <div className="min-w-0">

      <label className="mb-1 block text-[11px] font-medium text-slate-600">
        {label}
      </label>

      {children}

    </div>
  );
};


/* =========================================================
   MONEY INPUT
========================================================= */

const MoneyInput = ({
  value,
  placeholder,
  onChange,
}) => {
  return (
    <div className="relative">

      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
        ₹
      </span>

      <input
        type="number"
        min="0"
        step="0.01"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={`${inputClass} pl-7`}
      />

    </div>
  );
};


/* =========================================================
   INPUT STYLE
========================================================= */

const inputClass = `
  h-[38px]
  w-full
  rounded-md
  border
  border-slate-200
  bg-white
  px-3
  text-xs
  text-slate-700
  placeholder:text-slate-400
  outline-none
  transition

  focus:border-[#0B5D3B]
  focus:ring-1
  focus:ring-[#0B5D3B]
`;


/* =========================================================
   DATE FORMAT
========================================================= */

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


export default LoanDetailsStep;