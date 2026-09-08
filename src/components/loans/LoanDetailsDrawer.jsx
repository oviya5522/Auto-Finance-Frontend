import { X, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";

import LoanOverview from "./LoanOverview";
import LoanCustomerSection from "./LoanCustomerSection";
import LoanVehicleSection from "./LoanVehicleSection";
import LoanRepaymentProgress from "./LoanRepaymentProgress";
import LoanRepaymentSchedule from "./LoanRepaymentSchedule";
import LoanPaymentHistory from "./LoanPaymentHistory";
import LoanDocuments from "./LoanDocuments";
import LoanActivityTimeline from "./LoanActivityTimeline";

const LoanDetailsDrawer = ({
  loan,
  onClose,
}) => {
  const navigate = useNavigate();
  return (
    <div className="fixed inset-0 z-[160] bg-slate-950/35">

      <div className="absolute inset-y-0 right-0 flex w-full max-w-[760px] flex-col bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-[17px] font-semibold text-[#17221D]">
              {loan?.loanNumber || "Loan Details"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {loan?.customerName || "Customer"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/reloan?loanId=${encodeURIComponent(
                    loan?.id || loan?.loanNumber || ""
                  )}`
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B6B43] px-3 py-2 text-[10px] font-extrabold text-white hover:bg-[#095B3B]"
            >
              <RefreshCw size={13} />
              Re-loan
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">

          <LoanOverview loan={loan} />

          <LoanCustomerSection loan={loan} />

          <LoanVehicleSection loan={loan} />

          <LoanRepaymentProgress loan={loan} />

          <LoanRepaymentSchedule loan={loan} />

          <LoanPaymentHistory loan={loan} />

          <LoanDocuments loan={loan} />

          <LoanActivityTimeline loan={loan} />

        </div>
      </div>

    </div>
  );
};

export default LoanDetailsDrawer;