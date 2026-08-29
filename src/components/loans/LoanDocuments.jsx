import {
  FileText,
} from "lucide-react";

const LoanDocuments = ({
  loan,
}) => {
  const documents = [
    "Loan Agreement",
    "KYC Documents",
    "RC",
    "Insurance",
    "Bank Statement",
    "Other Documents",
  ];

  return (
    <section className="mb-5">

      <h3 className="mb-2.5 text-[12px] font-semibold">
        Documents
      </h3>

      <div className="grid grid-cols-1 gap-2.5 md:grid-cols-2">

        {documents.map(
          (name) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <FileText
                  size={14}
                  className="text-slate-400"
                />

                <span className="text-[10px] font-medium">
                  {name}
                </span>
              </div>

              <div className="flex gap-1">
                <button className="text-[9px] text-slate-500">
                  View
                </button>

                <button className="text-[9px] text-slate-500">
                  Download
                </button>
              </div>
            </div>
          )
        )}

      </div>
    </section>
  );
};

export default LoanDocuments;