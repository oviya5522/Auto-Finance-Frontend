// src/components/customers/onboarding/LoanDetailsStep.jsx

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  IndianRupee,
  Calculator,
  ReceiptText,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

import {
  calculateLoan,
  calculateDownPayment,
} from "../../../services/loanCalculator";

import SummaryCard from "./SummaryCard";

/* =========================================================
   TABS
========================================================= */

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

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_PENALTY = {
  enabled: true,
  type: "Fixed",
  amount: 0,
  graceDays: 0,
  maxAmount: 0,
};

/* =========================================================
   MAIN
========================================================= */

const LoanDetailsStep = ({
  data = {},
  onChange,
}) => {
  const loan =
    data?.loan || {};

  const interest =
    loan?.interest || {};

  const repayment =
    loan?.repayment || {};

  const charges =
    loan?.charges || {};

  const collection =
    loan?.collection || {};

  /*
   * New customer-specific overdue rule.
   *
   * This is the important configuration
   * that will later be read by:
   *
   * StaffCollection
   * repaymentStorage
   * CollectionManagement
   *
   * Structure:
   *
   * charges.penalty = {
   *   enabled,
   *   type,
   *   amount,
   *   graceDays,
   *   maxAmount
   * }
   */
  const penalty = {
    ...DEFAULT_PENALTY,
    ...(charges?.penalty || {}),
  };

  const [
    activeTab,
    setActiveTab,
  ] = useState("loan");

  /* =========================================================
     UPDATE HELPERS
  ========================================================= */

  const updateLoan = (
    field,
    value
  ) => {
    onChange({
      ...data,

      loan: {
        ...loan,
        [field]: value,
      },
    });
  };

  const updateInterest = (
    field,
    value
  ) => {
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

  const updateRepayment = (
    field,
    value
  ) => {
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

  const updateCharges = (
    field,
    value
  ) => {
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

  /*
   * Update only the nested penalty
   * configuration.
   */
  const updatePenalty = (
    field,
    value
  ) => {
    onChange({
      ...data,

      loan: {
        ...loan,

        charges: {
          ...charges,

          penalty: {
            ...DEFAULT_PENALTY,
            ...(charges?.penalty || {}),
            [field]: value,
          },
        },
      },
    });
  };

  const updateCollection = (
    field,
    value
  ) => {
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

  /* =========================================================
     INTEREST TYPE
  ========================================================= */

  const handleInterestTypeChange = (
    event
  ) => {
    const type =
      event.target.value;

    const method =
      type === "Reducing" &&
      repayment.method ===
        "Principal"
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

  /* =========================================================
     CALCULATION
  ========================================================= */

  const calculation =
    useMemo(() => {
      return calculateLoan({
        principal:
          loan.loanAmount,

        rate:
          interest.rate,

        tenure:
          repayment.tenure,

        tenureUnit:
          repayment.tenureUnit,

        interestType:
          interest.type,

        repaymentMethod:
          repayment.method,

        frequency:
          repayment.frequency,
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

  /* =========================================================
     DOWN PAYMENT
  ========================================================= */

  const downPayment =
    useMemo(() => {
      return calculateDownPayment({
        vehicleAmount:
          loan.vehicleAmount,

        loanAmount:
          loan.loanAmount,
      });
    }, [
      loan.vehicleAmount,
      loan.loanAmount,
    ]);

  /* =========================================================
     STORE CALCULATED VALUES
  ========================================================= */

  useEffect(() => {
    const calculatedValues = {
      principal:
        calculation?.principal ||
        0,

      interestAmount:
        calculation?.interestAmount ??
        calculation?.interest ??
        0,

      totalDue:
        calculation?.totalDue ||
        0,

      emiAmount:
        interest.type ===
          "Reducing" &&
        repayment.method ===
          "EMI"
          ? calculation?.emiAmount ||
            0
          : interest.type ===
            "Flat"
          ? calculation?.paymentAmount ||
            0
          : null,

      numberOfPayments:
        calculation?.paymentCount ||
        calculation?.numberOfPayments ||
        0,

      principalPerPayment:
        calculation?.principalPerPayment ||
        0,

      interestPerPayment:
        calculation?.interestPerPayment ||
        0,

      firstPayment:
        calculation?.firstPayment ||
        0,

      lastPayment:
        calculation?.lastPayment ||
        0,

      paymentAmount:
        calculation?.paymentAmount ||
        0,
    };

    const currentCalculation =
      loan?.calculation || {};

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

      Number(
        loan?.downPayment || 0
      ) !==
        Number(
          downPayment || 0
        );

    if (!changed) {
      return;
    }

    onChange({
      ...data,

      loan: {
        ...loan,

        downPayment,

        calculation:
          calculatedValues,
      },
    });
  }, [
    calculation?.principal,
    calculation?.interest,
    calculation?.interestAmount,
    calculation?.totalDue,
    calculation?.emiAmount,
    calculation?.paymentCount,
    calculation?.numberOfPayments,
    calculation?.principalPerPayment,
    calculation?.interestPerPayment,
    calculation?.firstPayment,
    calculation?.lastPayment,
    calculation?.paymentAmount,
    interest.type,
    repayment.method,
    downPayment,
  ]);

  /* =========================================================
     DISPLAY HELPERS
  ========================================================= */

  const money = (
    value
  ) => {
    return Number(
      value || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
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
      parseLocalDate(value);

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

  const interestAmount =
    calculation?.interestAmount ??
    calculation?.interest ??
    0;

  const numberOfPayments =
    calculation?.paymentCount ||
    calculation?.numberOfPayments ||
    0;

  const paymentAmount =
    interest.type === "Flat"
      ? calculation?.paymentAmount ||
        0
      : repayment.method ===
        "Principal"
      ? calculation?.firstPayment ||
        0
      : calculation?.emiAmount ||
        0;

  const paymentLabel =
    interest.type === "Flat"
      ? "Payment"
      : repayment.method ===
        "Principal"
      ? "First Payment"
      : "EMI Amount";

  const penaltyEnabled =
    penalty.enabled !== false;

  const penaltyType =
    penalty.type ||
    "Fixed";

  const penaltyAmount =
    Number(
      penalty.amount || 0
    );

  const penaltyGraceDays =
    Math.max(
      0,
      Math.floor(
        Number(
          penalty.graceDays || 0
        )
      )
    );

  const penaltyMaxAmount =
    Number(
      penalty.maxAmount || 0
    );

  /* =========================================================
     LOAN TAB
  ========================================================= */

  const renderLoanTab = () => {
    return (
      <CompactSection
        icon={
          IndianRupee
        }
        title="Loan Details"
        subtitle="Vehicle finance amount and initial due date"
      >
        <div
          className="
            grid
            grid-cols-1
            gap-x-4
            gap-y-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <FormField label="Vehicle Amount">
            <MoneyInput
              value={
                loan?.vehicleAmount
              }
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
              value={
                loan?.loanAmount
              }
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
              <span
                className="
                  absolute
                  left-3
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  text-slate-400
                "
              >
                ₹
              </span>

              <input
                type="text"
                readOnly
                value={money(
                  downPayment
                )}
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
              value={
                loan?.firstDueDate ||
                ""
              }
              onChange={(event) =>
                updateLoan(
                  "firstDueDate",
                  event.target.value
                )
              }
              className={
                inputClass
              }
            />
          </FormField>
        </div>
      </CompactSection>
    );
  };

  /* =========================================================
     REPAYMENT TAB
  ========================================================= */

  const renderRepaymentTab = () => {
    return (
      <CompactSection
        icon={
          Calculator
        }
        title="Interest & Repayment"
        subtitle="Configure how the loan will be calculated"
      >
        <div
          className="
            grid
            grid-cols-1
            gap-x-4
            gap-y-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <FormField label="Interest Type">
            <select
              value={
                interest?.type ||
                "Flat"
              }
              onChange={
                handleInterestTypeChange
              }
              className={
                inputClass
              }
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
                  interest?.rate ??
                  ""
                }
                onChange={(event) =>
                  updateInterest(
                    "rate",
                    event.target.value
                  )
                }
                className={`${inputClass} pr-8`}
              />

              <span
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-xs
                  text-slate-400
                "
              >
                %
              </span>
            </div>
          </FormField>

          {interest?.type ===
            "Reducing" && (
            <FormField label="Repayment Method">
              <select
                value={
                  repayment?.method ||
                  "EMI"
                }
                onChange={(
                  event
                ) =>
                  updateRepayment(
                    "method",
                    event.target.value
                  )
                }
                className={
                  inputClass
                }
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
                repayment?.frequency ||
                "Monthly"
              }
              onChange={(event) =>
                updateRepayment(
                  "frequency",
                  event.target.value
                )
              }
              className={
                inputClass
              }
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
            <div
              className="
                grid
                w-full
                grid-cols-[minmax(0,1fr)_110px]
                gap-2
              "
            >
              <input
                type="number"
                min="1"
                placeholder="12"
                value={
                  repayment?.tenure ??
                  ""
                }
                onChange={(event) =>
                  updateRepayment(
                    "tenure",
                    event.target.value
                  )
                }
                className={
                  inputClass
                }
              />

              <select
                value={
                  repayment?.tenureUnit ||
                  "Months"
                }
                onChange={(event) =>
                  updateRepayment(
                    "tenureUnit",
                    event.target.value
                  )
                }
                className={
                  inputClass
                }
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

  /* =========================================================
     CHARGES TAB
  ========================================================= */

  const renderChargesTab = () => {
    return (
      <CompactSection
        icon={
          ReceiptText
        }
        title="Additional Charges"
        subtitle="Configure loan fees and the customer's overdue penalty rule"
      >
        {/* =================================================
            NORMAL CHARGES
        ================================================= */}

        <div
          className="
            grid
            grid-cols-1
            gap-x-4
            gap-y-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <FormField label="Advance EMI">
            <MoneyInput
              value={
                charges?.advanceEmi
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
                charges?.documentCharge
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
                charges?.insuranceAmount
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
                charges?.fineAmount
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
                charges?.differenceInitial
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

          {/*
           * Kept for compatibility with
           * your existing schema.
           *
           * New penalty calculation should use
           * charges.penalty.amount.
           */}
          <FormField label="Default Interest">
            <MoneyInput
              value={
                charges?.defaultInterest
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
        </div>

        {/* =================================================
            PENALTY CONFIGURATION
        ================================================= */}

        <section
          className="
            mt-5
            rounded-xl
            border
            border-orange-100
            bg-orange-50/60
            p-4
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
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
                bg-orange-100
                text-orange-600
              "
            >
              <AlertTriangle
                size={17}
              />
            </div>

            <div className="min-w-0">
              <h4
                className="
                  text-[12px]
                  font-extrabold
                  text-[#17221D]
                "
              >
                Overdue Penalty Rule
              </h4>

              <p
                className="
                  mt-0.5
                  text-[9px]
                  leading-4
                  text-slate-500
                "
              >
                Set this customer's grace
                period and the penalty that
                will be added after the grace
                period expires.
              </p>
            </div>
          </div>

          <div
            className="
              mt-4
              grid
              grid-cols-1
              gap-x-4
              gap-y-3
              sm:grid-cols-2
              lg:grid-cols-4
            "
          >
            {/* ENABLED */}

            <FormField label="Penalty Enabled">
              <select
                value={
                  penaltyEnabled
                    ? "Yes"
                    : "No"
                }
                onChange={(event) =>
                  updatePenalty(
                    "enabled",
                    event.target.value ===
                      "Yes"
                  )
                }
                className={
                  inputClass
                }
              >
                <option value="Yes">
                  Yes
                </option>

                <option value="No">
                  No
                </option>
              </select>
            </FormField>

            {/* GRACE DAYS */}

            <FormField label="Grace Days">
              <input
                type="number"
                min="0"
                step="1"
                value={
                  penaltyGraceDays
                }
                disabled={
                  !penaltyEnabled
                }
                onChange={(event) =>
                  updatePenalty(
                    "graceDays",
                    Math.max(
                      0,
                      Math.floor(
                        Number(
                          event.target
                            .value || 0
                        )
                      )
                    )
                  )
                }
                className={`
                  ${inputClass}
                  ${
                    !penaltyEnabled
                      ? "cursor-not-allowed bg-slate-50 text-slate-400"
                      : ""
                  }
                `}
                placeholder="5"
              />

              <p
                className="
                  mt-1
                  text-[7px]
                  text-slate-400
                "
              >
                Example: overdue 5 days =
                no penalty when grace is 5.
              </p>
            </FormField>

            {/* PENALTY TYPE */}

            <FormField label="Penalty Type">
              <select
                value={
                  penaltyType
                }
                disabled={
                  !penaltyEnabled
                }
                onChange={(event) =>
                  updatePenalty(
                    "type",
                    event.target.value
                  )
                }
                className={`
                  ${inputClass}
                  ${
                    !penaltyEnabled
                      ? "cursor-not-allowed bg-slate-50 text-slate-400"
                      : ""
                  }
                `}
              >
                <option value="Fixed">
                  Fixed
                </option>

                <option value="Per Day">
                  Per Day
                </option>
              </select>
            </FormField>

            {/* PENALTY AMOUNT */}

            <FormField label="Penalty Amount">
              <MoneyInput
                value={
                  penaltyAmount
                }
                placeholder="100"
                disabled={
                  !penaltyEnabled
                }
                onChange={(value) =>
                  updatePenalty(
                    "amount",
                    Math.max(
                      0,
                      Number(
                        value || 0
                      )
                    )
                  )
                }
              />
            </FormField>

            {/* MAXIMUM PENALTY */}

            <FormField label="Maximum Penalty">
              <MoneyInput
                value={
                  penaltyMaxAmount
                }
                placeholder="500"
                disabled={
                  !penaltyEnabled
                }
                onChange={(value) =>
                  updatePenalty(
                    "maxAmount",
                    Math.max(
                      0,
                      Number(
                        value || 0
                      )
                    )
                  )
                }
              />

              <p
                className="
                  mt-1
                  text-[7px]
                  text-slate-400
                "
              >
                0 = no maximum.
              </p>
            </FormField>
          </div>

          {/* =================================================
              RULE PREVIEW
          ================================================= */}

          <div
            className="
              mt-4
              rounded-lg
              border
              border-orange-100
              bg-white
              px-3
              py-3
            "
          >
            <p
              className="
                text-[8px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Rule Preview
            </p>

            {!penaltyEnabled ? (
              <p
                className="
                  mt-1
                  text-[10px]
                  font-extrabold
                  text-slate-500
                "
              >
                Penalty is disabled for
                this customer.
              </p>
            ) : (
              <>
                <p
                  className="
                    mt-1
                    text-[10px]
                    font-extrabold
                    text-[#17221D]
                  "
                >
                  No penalty for the first{" "}
                  {penaltyGraceDays}{" "}
                  overdue day
                  {penaltyGraceDays ===
                  1
                    ? ""
                    : "s"}
                  .
                </p>

                <p
                  className="
                    mt-1
                    text-[9px]
                    leading-4
                    text-slate-500
                  "
                >
                  After the grace period,{" "}
                  {penaltyType ===
                  "Per Day"
                    ? `₹${money(
                        penaltyAmount
                      )} is added for each penalty day`
                    : `a fixed ₹${money(
                        penaltyAmount
                      )} penalty is added`}
                  {penaltyMaxAmount >
                    0 &&
                    `, up to ₹${money(
                      penaltyMaxAmount
                    )}.`}
                </p>

                <div
                  className="
                    mt-3
                    grid
                    grid-cols-1
                    gap-2
                    sm:grid-cols-3
                  "
                >
                  <PenaltyInfo
                    label="Grace Period"
                    value={`${penaltyGraceDays} days`}
                  />

                  <PenaltyInfo
                    label="Penalty Type"
                    value={
                      penaltyType
                    }
                  />

                  <PenaltyInfo
                    label="Penalty Amount"
                    value={`₹${money(
                      penaltyAmount
                    )}`}
                  />
                </div>
              </>
            )}
          </div>

          {/* =================================================
              BUSINESS EXAMPLE
          ================================================= */}

          {penaltyEnabled &&
            penaltyAmount >
              0 && (
              <div
                className="
                  mt-3
                  rounded-lg
                  bg-orange-100/60
                  px-3
                  py-2.5
                "
              >
                <p
                  className="
                    text-[8px]
                    font-bold
                    text-orange-700
                  "
                >
                  Example
                </p>

                <p
                  className="
                    mt-1
                    text-[8px]
                    leading-4
                    text-orange-700/80
                  "
                >
                  With{" "}
                  {penaltyGraceDays}{" "}
                  grace days, if the
                  installment becomes
                  overdue and remains unpaid
                  beyond that period, the
                  penalty is automatically
                  calculated when Staff
                  records the payment.
                </p>
              </div>
            )}
        </section>

        {/* =================================================
            LEGACY GRACE DAYS SYNC
        ================================================= */}

        <div className="mt-3">
          <p
            className="
              text-[7px]
              leading-4
              text-slate-400
            "
          >
            The legacy{" "}
            <span className="font-semibold">
              charges.graceDays
            </span>{" "}
            field is kept for compatibility.
            The active repayment rule is stored
            in{" "}
            <span className="font-semibold">
              charges.penalty
            </span>
            .
          </p>
        </div>
      </CompactSection>
    );
  };

  /* =========================================================
     INITIAL PAYMENT TAB
  ========================================================= */

  const renderPaymentTab = () => {
    return (
      <CompactSection
        icon={
          CreditCard
        }
        title="Initial Payment"
        subtitle="Record payment collected during loan creation"
      >
        <div
          className="
            grid
            grid-cols-1
            gap-x-4
            gap-y-3
            sm:grid-cols-2
            lg:grid-cols-4
          "
        >
          <FormField label="Pay Mode">
            <select
              value={
                collection?.payMode ||
                ""
              }
              onChange={(event) =>
                updateCollection(
                  "payMode",
                  event.target.value
                )
              }
              className={
                inputClass
              }
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
                collection?.receiptAmount
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
                collection?.receiptMode ||
                ""
              }
              onChange={(event) =>
                updateCollection(
                  "receiptMode",
                  event.target.value
                )
              }
              className={
                inputClass
              }
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
                loan?.remarks ||
                ""
              }
              onChange={(event) =>
                updateLoan(
                  "remarks",
                  event.target.value
                )
              }
              className={
                inputClass
              }
            />
          </FormField>
        </div>
      </CompactSection>
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="space-y-3">
      {/* =================================================
          TABS
      ================================================= */}

      <div
        className="
          rounded-xl
          border
          border-slate-200
          bg-white
          p-1.5
        "
      >
        <div
          className="
            grid
            grid-cols-2
            gap-1
            sm:grid-cols-4
          "
        >
          {TABS.map(
            (tab) => {
              const Icon =
                tab.icon;

              const active =
                activeTab ===
                tab.id;

              return (
                <button
                  key={
                    tab.id
                  }
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
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
                      className={`
                        text-[10px]
                        font-semibold
                        ${
                          active
                            ? "text-[#0B5D3B]"
                            : "text-slate-600"
                        }
                      `}
                    >
                      {
                        tab.label
                      }
                    </p>

                    <p
                      className="
                        mt-0.5
                        hidden
                        text-[8px]
                        text-slate-400
                        sm:block
                      "
                    >
                      {tab.id ===
                        "loan" &&
                        "Amount & due date"}

                      {tab.id ===
                        "repayment" &&
                        "Rate & tenure"}

                      {tab.id ===
                        "charges" &&
                        "Fees, grace & penalty"}

                      {tab.id ===
                        "payment" &&
                        "Opening collection"}
                    </p>
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* =================================================
          ACTIVE TAB
      ================================================= */}

      {activeTab ===
        "loan" &&
        renderLoanTab()}

      {activeTab ===
        "repayment" &&
        renderRepaymentTab()}

      {activeTab ===
        "charges" &&
        renderChargesTab()}

      {activeTab ===
        "payment" &&
        renderPaymentTab()}

      {/* =================================================
          LIVE CALCULATION SUMMARY
      ================================================= */}

      <section
        className="
          rounded-xl
          border
          border-[#D8E9DF]
          bg-[#F6FBF8]
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-b
            border-[#D8E9DF]
            px-4
            py-2.5
          "
        >
          <div
            className="
              flex
              items-center
              gap-2.5
            "
          >
            <div
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                bg-[#EAF5EF]
              "
            >
              <Calculator
                size={16}
                className="text-[#0B5D3B]"
              />
            </div>

            <div>
              <h3
                className="
                  text-sm
                  font-semibold
                  text-[#17221D]
                "
              >
                Loan Calculation
              </h3>

              <p
                className="
                  text-[10px]
                  text-slate-400
                "
              >
                Automatically updated
                from the loan inputs
              </p>
            </div>
          </div>

          <span
            className="
              inline-flex
              items-center
              gap-1
              rounded-full
              bg-[#EAF5EF]
              px-2.5
              py-1
              text-[9px]
              font-semibold
              text-[#0B5D3B]
            "
          >
            <CheckCircle2
              size={12}
            />

            Live
          </span>
        </div>

        <div
          className="
            grid
            grid-cols-2
            gap-2.5
            p-3
            sm:grid-cols-3
            lg:grid-cols-6
          "
        >
          <SummaryCard
            label="Principal"
            value={`₹${money(
              calculation?.principal
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
              calculation?.totalDue
            )}`}
            highlight
          />

          <SummaryCard
            label={
              paymentLabel
            }
            value={`₹${money(
              paymentAmount
            )}`}
            highlight
          />

          <SummaryCard
            label="Number of Payments"
            value={
              numberOfPayments
            }
          />

          <SummaryCard
            label="First Due Date"
            value={
              loan?.firstDueDate
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
    <section
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
      "
    >
      <div
        className="
          flex
          items-center
          gap-2.5
          border-b
          border-slate-100
          px-4
          py-2.5
        "
      >
        <div
          className="
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            bg-[#EAF5EF]
          "
        >
          <Icon
            size={16}
            className="text-[#0B5D3B]"
          />
        </div>

        <div>
          <h3
            className="
              text-sm
              font-semibold
              text-[#17221D]
            "
          >
            {title}
          </h3>

          <p
            className="
              text-[11px]
              text-slate-400
            "
          >
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
      <label
        className="
          mb-1
          block
          text-[11px]
          font-medium
          text-slate-600
        "
      >
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
  disabled = false,
}) => {
  return (
    <div className="relative">
      <span
        className="
          absolute
          left-3
          top-1/2
          -translate-y-1/2
          text-xs
          text-slate-400
        "
      >
        ₹
      </span>

      <input
        type="number"
        min="0"
        step="0.01"
        disabled={
          disabled
        }
        placeholder={
          placeholder
        }
        value={
          value ?? ""
        }
        onChange={(event) =>
          onChange(
            event.target
              .value
          )
        }
        className={`
          ${inputClass}
          pl-7
          ${
            disabled
              ? "cursor-not-allowed bg-slate-50 text-slate-400"
              : ""
          }
        `}
      />
    </div>
  );
};

/* =========================================================
   PENALTY INFO
========================================================= */

const PenaltyInfo = ({
  label,
  value,
}) => {
  return (
    <div
      className="
        rounded-md
        border
        border-[#DDEDE3]
        bg-white
        px-2.5
        py-2
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
          truncate
          text-[9px]
          font-bold
          text-[#17221D]
        "
      >
        {value}
      </p>
    </div>
  );
};

/* =========================================================
   DATE
========================================================= */

const parseLocalDate = (
  value
) => {
  if (!value) {
    return null;
  }

  if (
    value instanceof Date
  ) {
    const date =
      new Date(
        value.getTime()
      );

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date;
  }

  const raw =
    String(value);

  const match =
    raw.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

  if (match) {
    return new Date(
      Number(
        match[1]
      ),
      Number(
        match[2]
      ) - 1,
      Number(
        match[3]
      )
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