// src/components/customers/onboarding/LoanDetailsStep.jsx

import { useEffect, useMemo, useState } from "react";

import {
  IndianRupee,
  Calculator,
  ReceiptText,
  CreditCard,
  CheckCircle2,
} from "lucide-react";

import {
  calculateLoan,
  calculateDownPayment,
} from "../../../services/loanCalculator";

import SummaryCard from "./SummaryCard";

const TABS = [
  {
    id: "loan",
    label: "Loan Details",
    icon: IndianRupee,
  },
  {
    id: "repayment",
    label: "Interest & Repayment",
    icon: Calculator,
  },
  {
    id: "charges",
    label: "Charges",
    icon: ReceiptText,
  },
  {
    id: "payment",
    label: "Initial Payment",
    icon: CreditCard,
  },
];

const LoanDetailsStep = ({ data = {}, onChange }) => {
  const loan = data.loan || {};

  const interest = loan.interest || {};
  const repayment = loan.repayment || {};
  const charges = loan.charges || {};
  const collection = loan.collection || {};

  const [activeTab, setActiveTab] = useState("loan");

  /*
   * =========================================================
   * UPDATE HELPERS
   * =========================================================
   */

  const updateLoan = (field, value) => {
    onChange({
      ...data,
      loan: {
        ...loan,
        [field]: value,
      },
    });
  };

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

  /*
   * =========================================================
   * INTEREST TYPE
   * =========================================================
   */

  const handleInterestTypeChange = (event) => {
    const type = event.target.value;

    const method =
      type === "Reducing" &&
      repayment.method === "Principal"
        ? "Principal"
        : "EMI";

    onChange({
      ...data,
      loan: {
        ...loan,
        interest: {
          ...interest,
          type,
        },
        repayment: {
          ...repayment,
          method,
        },
      },
    });
  };

  /*
   * =========================================================
   * CALCULATION
   * =========================================================
   */

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

  /*
   * =========================================================
   * DOWN PAYMENT
   * =========================================================
   */

  const downPayment = useMemo(() => {
    return calculateDownPayment({
      vehicleAmount: loan.vehicleAmount,
      loanAmount: loan.loanAmount,
    });
  }, [
    loan.vehicleAmount,
    loan.loanAmount,
  ]);

  /*
   * =========================================================
   * STORE CALCULATED VALUES
   * =========================================================
   */

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
        interest.type === "Reducing" &&
        repayment.method === "EMI"
          ? calculation.emiAmount || 0
          : interest.type === "Flat"
          ? calculation.paymentAmount || 0
          : null,

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
    interest.type,
    repayment.method,
    downPayment,
  ]);

  /*
   * =========================================================
   * DISPLAY
   * =========================================================
   */

  const money = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );
  };

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

  const interestAmount =
    calculation.interestAmount ??
    calculation.interest ??
    0;

  const numberOfPayments =
    calculation.paymentCount ||
    calculation.numberOfPayments ||
    0;

  const paymentAmount =
    interest.type === "Flat"
      ? calculation.paymentAmount || 0
      : repayment.method === "Principal"
      ? calculation.firstPayment || 0
      : calculation.emiAmount || 0;

  const paymentLabel =
    interest.type === "Flat"
      ? "Payment"
      : repayment.method === "Principal"
      ? "First Payment"
      : "EMI Amount";

  /*
   * =========================================================
   * TAB CONTENT
   * =========================================================
   */

  const renderLoanTab = () => {
    return (
      <CompactSection
        icon={IndianRupee}
        title="Loan Details"
        subtitle="Vehicle finance amount and initial due date"
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
    );
  };

  const renderRepaymentTab = () => {
    return (
      <CompactSection
        icon={Calculator}
        title="Interest & Repayment"
        subtitle="Configure how the loan will be calculated"
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

          <FormField label="Interest Type">
            <select
              value={
                interest.type || "Flat"
              }
              onChange={
                handleInterestTypeChange
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

          {interest.type ===
            "Reducing" && (
            <FormField label="Repayment Method">
              <select
                value={
                  repayment.method ||
                  "EMI"
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
          )}

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

          <FormField label="Tenure">
            <div className="grid w-full grid-cols-[minmax(0,1fr)_110px] gap-2">

              <input
                type="number"
                min="1"
                placeholder="12"
                value={
                  repayment.tenure ?? ""
                }
                onChange={(e) =>
                  updateRepayment(
                    "tenure",
                    e.target.value
                  )
                }
                className={inputClass}
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
                className={inputClass}
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
    );
  };

  const renderChargesTab = () => {
    return (
      <CompactSection
        icon={ReceiptText}
        title="Additional Charges"
        subtitle="Optional fees and adjustments"
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

          <FormField label="Advance EMI">
            <MoneyInput
              value={charges.advanceEmi}
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
              value={charges.documentCharge}
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
              value={charges.insuranceAmount}
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
              value={charges.fineAmount}
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
              value={charges.differenceInitial}
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
              value={charges.defaultInterest}
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
      </CompactSection>
    );
  };

  const renderPaymentTab = () => {
    return (
      <CompactSection
        icon={CreditCard}
        title="Initial Payment"
        subtitle="Record payment collected during loan creation"
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

          <FormField label="Pay Mode">
            <select
              value={
                collection.payMode ||
                ""
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
                collection.receiptMode ||
                ""
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
              value={loan.remarks || ""}
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
      </CompactSection>
    );
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

  return (
    <div className="space-y-3">

      {/* =================================================
          TABS
      ================================================== */}

      <div className="rounded-xl border border-slate-200 bg-white p-1.5">

        <div className="grid grid-cols-2 gap-1 sm:grid-cols-4">

          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active =
              activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`
                  flex
                  min-h-[58px]
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  px-3
                  py-2
                  text-left
                  transition

                  ${
                    active
                      ? "bg-[#EAF5EF] text-[#0B5D3B]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }
                `}
              >
                <Icon
                  size={15}
                  className="shrink-0"
                />

                <div className="min-w-0">
                  <p
                    className={`text-[10px] font-semibold ${
                      active
                        ? "text-[#0B5D3B]"
                        : "text-slate-600"
                    }`}
                  >
                    {tab.label}
                  </p>

                  <p className="mt-0.5 hidden text-[8px] text-slate-400 sm:block">
                    {tab.id === "loan" &&
                      "Amount & due date"}

                    {tab.id === "repayment" &&
                      "Rate & tenure"}

                    {tab.id === "charges" &&
                      "Fees & adjustments"}

                    {tab.id === "payment" &&
                      "Opening collection"}
                  </p>
                </div>

              </button>
            );
          })}

        </div>

      </div>

      {/* =================================================
          ACTIVE TAB
      ================================================== */}

      {activeTab === "loan" &&
        renderLoanTab()}

      {activeTab === "repayment" &&
        renderRepaymentTab()}

      {activeTab === "charges" &&
        renderChargesTab()}

      {activeTab === "payment" &&
        renderPaymentTab()}

      {/* =================================================
          LIVE CALCULATION SUMMARY
      ================================================== */}

      <section className="rounded-xl border border-[#D8E9DF] bg-[#F6FBF8]">

        <div className="flex items-center justify-between gap-3 border-b border-[#D8E9DF] px-4 py-2.5">

          <div className="flex items-center gap-2.5">

            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF5EF]">
              <Calculator
                size={16}
                className="text-[#0B5D3B]"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#17221D]">
                Loan Calculation
              </h3>

              <p className="text-[10px] text-slate-400">
                Automatically updated from the loan inputs
              </p>
            </div>

          </div>

          <span className="inline-flex items-center gap-1 rounded-full bg-[#EAF5EF] px-2.5 py-1 text-[9px] font-semibold text-[#0B5D3B]">
            <CheckCircle2 size={12} />
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
            label={paymentLabel}
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

    </div>
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

export default LoanDetailsStep;