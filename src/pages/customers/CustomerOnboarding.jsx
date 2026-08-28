// src/pages/customers/CustomerOnboarding.jsx

import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  X,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
  FileText,
  Car,
  Users,
  IndianRupee,
  ClipboardCheck,
} from "lucide-react";

import CustomerInfoStep from "../../Components/customers/onboarding/CustomerInfoStep";
import KycDocumentsStep from "../../Components/customers/onboarding/KycDocumentsStep";
import VehicleRcStep from "../../Components/customers/onboarding/VehicleRcStep";
import GuarantorStep from "../../Components/customers/onboarding/GuarantorStep";
import LoanDetailsStep from "../../Components/customers/onboarding/LoanDetailsStep";
import ReviewStep from "../../Components/customers/onboarding/ReviewStep";
import { generateRepaymentSchedule } from "../../services/repaymentSchedule";
import { saveCustomer } from "../../services/customerStorage";
import RepaymentScheduleModal from "../../Components/loans/RepaymentScheduleModal";
import {
  createEmptyCustomer,
} from "../../data/schemas/customerSchema";

const steps = [
  {
    id: 1,
    title: "Customer",
    shortTitle: "Customer",
    icon: User,
  },
  {
    id: 2,
    title: "KYC & Documents",
    shortTitle: "KYC",
    icon: FileText,
  },
  {
    id: 3,
    title: "Vehicle & RC",
    shortTitle: "Vehicle",
    icon: Car,
  },
  {
    id: 4,
    title: "Guarantor",
    shortTitle: "Guarantor",
    icon: Users,
  },
  {
    id: 5,
    title: "Loan & Due Details",
    shortTitle: "Loan",
    icon: IndianRupee,
  },
  {
    id: 6,
    title: "Review",
    shortTitle: "Review",
    icon: ClipboardCheck,
  },
];

const STEP_DESCRIPTIONS = {
  1: "Basic customer and contact details",
  2: "Verify identity and required documents",
  3: "Vehicle registration and RC information",
  4: "Optional guarantor information",
  5: "Loan amount, interest and repayment details",
  6: "Verify all information before creating the customer",
};

const CustomerOnboarding = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [showRepaymentSchedule, setShowRepaymentSchedule] =
  useState(false);

const [createdLoan, setCreatedLoan] = useState(null);
  

  /*
   * Create a fresh onboarding object once.
   * Today's date is automatically assigned.
   */
  const [formData, setFormData] = useState(() => {
    const customer = createEmptyCustomer();

    const today = new Date()
      .toISOString()
      .split("T")[0];

    customer.customer.personal.date = today;

    return customer;
  });

  /*
   * Step validation state.
   *
   * Step 2 starts invalid because the user must
   * select and upload at least 2 documents.
   *
   * Other steps remain enabled temporarily until
   * their own validation is implemented.
   */
  const [stepValidity, setStepValidity] = useState({
    1: true,
    2: false,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  /*
   * Current step information.
   */
  const currentStepInfo = useMemo(
    () => steps[currentStep - 1],
    [currentStep]
  );

  /*
   * --------------------------------------------------------
   * CLOSE
   * --------------------------------------------------------
   */

  const handleClose = useCallback(() => {
    navigate("/customers");
  }, [navigate]);

  /*
   * --------------------------------------------------------
   * STEP VALIDITY
   * --------------------------------------------------------
   */

  const updateStepValidity = useCallback(
    (step, valid) => {
      setStepValidity((previous) => {
        if (previous[step] === valid) {
          return previous;
        }

        return {
          ...previous,
          [step]: valid,
        };
      });
    },
    []
  );

  /*
   * Stable KYC validation callback.
   */
  const handleKycValidation = useCallback(
    (valid) => {
      updateStepValidity(2, valid);
    },
    [updateStepValidity]
  );

//   const handleVehicleValidation = useCallback(
//   (valid) => {
//     updateStepValidity(3, valid);
//   },
//   [updateStepValidity]
// );

  /*
   * --------------------------------------------------------
   * NEXT
   * --------------------------------------------------------
   */


  const handleNext = useCallback(() => {
    const currentStepIsValid =
      stepValidity[currentStep] === true;

    if (!currentStepIsValid) {
      return;
    }

    if (currentStep < steps.length) {
      setCurrentStep(
        (previous) => previous + 1
      );
    }
  }, [currentStep, stepValidity]);

  /*
   * --------------------------------------------------------
   * BACK
   * --------------------------------------------------------
   */

  const handleBack = useCallback(() => {
    if (currentStep === 1) {
      handleClose();
      return;
    }

    setCurrentStep(
      (previous) => previous - 1
    );
  }, [currentStep, handleClose]);

  /*
   * --------------------------------------------------------
   * STEP CLICK
   * --------------------------------------------------------
   *
   * Only completed/current steps can be opened.
   */

  const handleStepClick = useCallback(
    (stepId) => {
      if (stepId <= currentStep) {
        setCurrentStep(stepId);
      }
    },
    [currentStep]
  );

  /*
   * --------------------------------------------------------
   * CUSTOMER PERSONAL UPDATE
   * --------------------------------------------------------
   */

  const updateCustomerPersonal = useCallback(
    (data) => {
      setFormData((previous) => ({
        ...previous,

        customer: {
          ...previous.customer,

          personal: {
            ...previous.customer.personal,
            ...data,
          },
        },
      }));
    },
    []
  );

  /*
   * --------------------------------------------------------
   * CUSTOMER KYC / DOCUMENT UPDATE
   * --------------------------------------------------------
   */

  const updateCustomerKyc = useCallback(
    (data) => {
      setFormData((previous) => ({
        ...previous,

        customer: {
          ...previous.customer,
          ...data,
        },
      }));
    },
    []
  );

  /*
   * --------------------------------------------------------
   * VEHICLE / RC UPDATE
   * --------------------------------------------------------
   */

  const updateVehicleData = useCallback(
    (data) => {
      setFormData((previous) => ({
        ...previous,

        vehicle: data.vehicle,
        rc: data.rc,
      }));
    },
    []
  );

  /*
   * --------------------------------------------------------
   * GUARANTOR UPDATE
   * --------------------------------------------------------
   */

  const updateGuarantorData = useCallback(
    (data) => {
      setFormData((previous) => ({
        ...previous,

        guarantor: data.guarantor,
      }));
    },
    []
  );

  /*
   * --------------------------------------------------------
   * LOAN UPDATE
   * --------------------------------------------------------
   */

  const updateLoanData = useCallback(
    (data) => {
      setFormData((previous) => ({
        ...previous,

        loan: data.loan,
      }));
    },
    []
  );
const handleCreateCustomer = () => {
  try {
    const now = new Date().toISOString();
    const timestamp = Date.now();

    const customerId = `CUS-${timestamp}`;
    const loanId = `LOAN-${timestamp}`;

    const customerNumber =
      `CUST-${String(timestamp).slice(-6)}`;

    const loanNumber =
      `LN-${String(timestamp).slice(-6)}`;

    const loan = formData.loan || {};

    /* ---------------------------------------------
       GENERATE REPAYMENT SCHEDULE
    --------------------------------------------- */

    const repaymentSchedule =
      generateRepaymentSchedule({
        principal: Number(
          loan.loanAmount || 0
        ),

        rate: Number(
          loan.interest?.rate || 0
        ),

        tenure: Number(
          loan.repayment?.tenure || 0
        ),

        tenureUnit:
          loan.repayment?.tenureUnit ||
          "Months",

        interestType:
          loan.interest?.type ||
          "Flat",

        repaymentMethod:
          loan.repayment?.method ||
          "EMI",

        frequency:
          loan.repayment?.frequency ||
          "Monthly",

        firstDueDate:
          loan.firstDueDate || "",
      });

    /* ---------------------------------------------
       CREATE FINAL CUSTOMER OBJECT
    --------------------------------------------- */

    const finalCustomer = {
      ...formData,

      customer: {
        ...formData.customer,

        id: customerId,
        customerNumber,

        createdAt:
          formData.customer.createdAt ||
          now,

        updatedAt: now,

        status: "Active",
      },

      loan: {
        ...loan,

        id: loanId,
        loanNumber,

        repaymentSchedule,

        status: "Active",

        createdAt: now,
      },
    };

    /* ---------------------------------------------
       SAVE TO LOCAL STORAGE
    --------------------------------------------- */

    saveCustomer(finalCustomer);

    /* ---------------------------------------------
       UPDATE LOCAL STATE
    --------------------------------------------- */

    setFormData(finalCustomer);
    setCreatedLoan(finalCustomer.loan);

    /* ---------------------------------------------
       OPEN REPAYMENT SCHEDULE
    --------------------------------------------- */

    setShowRepaymentSchedule(true);

    console.log(
      "Customer created successfully:",
      finalCustomer
    );

  } catch (error) {
    console.error(
      "Create Customer failed:",
      error
    );

    alert(
      `Unable to create customer.\n\n${
        error?.message ||
        "Unknown error"
      }`
    );
  }
};

  /*
   * --------------------------------------------------------
   * RENDER CURRENT STEP
   * --------------------------------------------------------
   */

  const renderCurrentStep = () => {
    switch (currentStep) {
      /*
       * STEP 1
       */
      case 1:
        return (
          <CustomerInfoStep
            data={
              formData.customer.personal
            }
            onChange={
              updateCustomerPersonal
            }
          />
        );

      /*
       * STEP 2
       */
      case 2:
        return (
          <KycDocumentsStep
            data={formData.customer}
            onChange={
              updateCustomerKyc
            }
            onValidationChange={
              handleKycValidation
            }
          />
        );

      /*
       * STEP 3
       */
     case 3:
  return (
    <VehicleRcStep
      data={{
        vehicle: formData.vehicle,
        rc: formData.rc,
      }}
      onChange={updateVehicleData}
    />
  );

      /*
       * STEP 4
       */
      case 4:
        return (
          <GuarantorStep
            data={{
              guarantor:
                formData.guarantor,
            }}
            onChange={
              updateGuarantorData
            }
          />
        );

      /*
       * STEP 5
       */
      case 5:
        return (
          <LoanDetailsStep
            data={{
              loan: formData.loan,
            }}
            onChange={
              updateLoanData
            }
          />
        );

      /*
       * STEP 6
       */
      case 6:
        return (
          <ReviewStep
            data={formData}
            onEdit={setCurrentStep}
          />
        );

      default:
        return null;
    }
  };

  /*
   * --------------------------------------------------------
   * CURRENT STEP VALIDITY
   * --------------------------------------------------------
   */

  const canContinue =
    stepValidity[currentStep] === true;

  return (
    <>
      {/* =====================================================
          OVERLAY
      ====================================================== */}

      <div
        className="
          fixed
          inset-0
          z-[100]
          flex
          items-center
          justify-center
          bg-slate-950/45
          p-4
          backdrop-blur-[3px]
        "
      >
        {/* =================================================
            MODAL
        ================================================== */}

        <div
          className="
            flex
            h-[min(820px,calc(100vh-32px))]
            w-full
            max-w-[920px]
            flex-col
            overflow-hidden
            rounded-2xl
            bg-white
            shadow-2xl
            ring-1
            ring-black/5
          "
        >
          {/* =================================================
              HEADER
          ================================================= */}

          <header
            className="
              shrink-0
              border-b
              border-slate-100
              px-6
              py-4
            "
          >
            <div className="flex items-center justify-between gap-4">
              {/* Left */}

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
                  <User
                    size={20}
                    className="text-[#0B5D3B]"
                  />
                </div>

                <div className="min-w-0">
                  <h1
                    className="
                      truncate
                      text-[17px]
                      font-semibold
                      text-[#17221D]
                    "
                  >
                    Customer Onboarding
                  </h1>

                  <p
                    className="
                      mt-0.5
                      truncate
                      text-xs
                      text-slate-500
                    "
                  >
                    Create customer and initial
                    vehicle finance record
                  </p>
                </div>
              </div>

              {/* Right */}

              <div className="flex shrink-0 items-center gap-2">
                <span
                  className="
                    rounded-full
                    bg-[#EAF5EF]
                    px-3
                    py-1
                    text-[11px]
                    font-semibold
                    text-[#0B5D3B]
                  "
                >
                  Step {currentStep} of{" "}
                  {steps.length}
                </span>

                <button
                  type="button"
                  onClick={handleClose}
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    text-slate-400
                    transition
                    hover:bg-slate-100
                    hover:text-slate-700
                  "
                  aria-label="Close onboarding"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </header>

          {/* =================================================
              STEPPER
          ================================================== */}

          <div
            className="
              shrink-0
              border-b
              border-slate-100
              px-6
              py-3
            "
          >
            <div className="flex items-center">
              {steps.map((step, index) => {
                const Icon = step.icon;

                const completed =
                  step.id < currentStep;

                const active =
                  step.id === currentStep;

                return (
                  <div
                    key={step.id}
                    className="
                      flex
                      min-w-0
                      flex-1
                      items-center
                    "
                  >
                    <button
                      type="button"
                      disabled={
                        step.id > currentStep
                      }
                      onClick={() =>
                        handleStepClick(
                          step.id
                        )
                      }
                      className="
                        group
                        flex
                        min-w-0
                        flex-col
                        items-center
                        gap-1
                        disabled:cursor-default
                      "
                    >
                      {/* Circle */}

                      <div
                        className={`
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-full
                          border
                          transition

                          ${
                            completed
                              ? "border-[#0B5D3B] bg-[#0B5D3B] text-white"
                              : active
                              ? "border-[#0B5D3B] bg-white text-[#0B5D3B] ring-4 ring-[#EAF5EF]"
                              : "border-slate-200 bg-white text-slate-400"
                          }
                        `}
                      >
                        {completed ? (
                          <Check
                            size={15}
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Icon size={15} />
                        )}
                      </div>

                      {/* Label */}

                      <span
                        className={`
                          hidden
                          truncate
                          text-[10px]
                          font-medium
                          sm:block

                          ${
                            active ||
                            completed
                              ? "text-[#17221D]"
                              : "text-slate-400"
                          }
                        `}
                      >
                        {step.shortTitle}
                      </span>
                    </button>

                    {/* Connector */}

                    {index <
                      steps.length - 1 && (
                      <div
                        className={`
                          mx-2
                          mt-[-15px]
                          h-px
                          min-w-[10px]
                          flex-1

                          ${
                            completed
                              ? "bg-[#0B5D3B]"
                              : "bg-slate-200"
                          }
                        `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* =================================================
              STEP TITLE
          ================================================== */}

          <div
            className="
              shrink-0
              px-6
              pb-2
              pt-3
            "
          >
            <h2
              className="
                text-[15px]
                font-semibold
                text-[#17221D]
              "
            >
              {currentStepInfo.title}
            </h2>

            <p
              className="
                mt-0.5
                text-[11px]
                text-slate-400
              "
            >
              {STEP_DESCRIPTIONS[currentStep]}
            </p>
          </div>

          {/* =================================================
              FORM AREA
          ================================================== */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-6
              pb-4
              pt-2
            "
          >
            {renderCurrentStep()}
          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <footer
            className="
              flex
              shrink-0
              items-center
              justify-between
              border-t
              border-slate-100
              bg-white
              px-6
              py-3
            "
          >
            {/* Back */}

            <button
              type="button"
              onClick={handleBack}
              className="
                inline-flex
                items-center
                gap-1.5
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3.5
                py-2
                text-xs
                font-medium
                text-slate-600
                transition
                hover:border-slate-300
                hover:text-slate-800
              "
            >
              <ArrowLeft size={14} />

              {currentStep === 1
                ? "Cancel"
                : "Back"}
            </button>

            {/* Continue / Create */}

            {currentStep <
            steps.length ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canContinue}
                className={`
                  inline-flex
                  items-center
                  gap-1.5
                  rounded-lg
                  px-4
                  py-2
                  text-xs
                  font-semibold
                  text-white
                  shadow-sm
                  transition

                  ${
                    canContinue
                      ? "bg-[#0B5D3B] hover:bg-[#084A30]"
                      : "cursor-not-allowed bg-slate-300"
                  }
                `}
              >
                Continue
                <ArrowRight size={14} />
              </button>
            ) : (
 <button
  type="button"
  onClick={handleCreateCustomer}
  className="
    inline-flex
    items-center
    gap-1.5
    rounded-lg
    bg-[#0B5D3B]
    px-4
    py-2
    text-xs
    font-semibold
    text-white
    shadow-sm
    transition
    hover:bg-[#084A30]
  "
>
  <Check size={14} />
  Create Customer
</button>
            )}
          </footer>
        </div>
      </div>
     {showRepaymentSchedule && createdLoan && (
  <RepaymentScheduleModal
    loan={createdLoan}
    customer={formData.customer.personal}
    schedule={
      createdLoan.repaymentSchedule || []
    }
    onClose={() => {
      setShowRepaymentSchedule(false);
      navigate("/customers");
    }}
  />
)}
    </>
  );
};

export default CustomerOnboarding;