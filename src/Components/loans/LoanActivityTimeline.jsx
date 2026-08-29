import {
  formatDate,
} from "../../utils/loan/loanHelpers";

const LoanActivityTimeline = ({
  loan,
}) => {
  const events = [
    {
      label: "Loan created",
      date: loan?.createdAt,
    },
    {
      label: "Loan approved",
      date: loan?.approvedAt,
    },
    {
      label: "Vehicle financed",
      date: loan?.disbursedAt,
    },
  ];

  return (
    <section className="mb-5">

      <h3 className="mb-2.5 text-[12px] font-semibold">
        Activity Timeline
      </h3>

      <div className="space-y-3">

        {events.map(
          (event) => (
            <div
              key={event.label}
              className="flex gap-3"
            >
              <div className="mt-1 h-2 w-2 rounded-full bg-[#0B5D3B]" />

              <div>
                <p className="text-[10px] font-medium">
                  {event.label}
                </p>

                <p className="text-[9px] text-slate-400">
                  {event.date
                    ? formatDate(
                        event.date
                      )
                    : "Not recorded"}
                </p>
              </div>
            </div>
          )
        )}

      </div>
    </section>
  );
};

export default LoanActivityTimeline;