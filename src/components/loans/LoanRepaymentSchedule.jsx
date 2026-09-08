import {
  formatDate,
  money,
} from "../../utils/loan/loanHelpers";
import {
  getScheduleAmount,
  getSchedulePaidAmount,
  getScheduleRemainingAmount,
  getScheduleDisplayStatus,
} from "../../services/repaymentStorage";

const LoanRepaymentSchedule = ({
  loan,
}) => {
  const schedule =
    Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];

  return (
    <section className="mb-5">

      <h3 className="mb-2.5 text-[12px] font-semibold">
        Repayment Schedule
      </h3>

      <div className="overflow-auto rounded-lg border border-slate-200">

        <table className="w-full min-w-[700px]">

          <thead className="bg-[#F8FAF9]">
            <tr>
              <th>EMI</th>
              <th>Due Date</th>
              <th>EMI</th>
              <th>Principal</th>
              <th>Interest</th>
              <th>Paid</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            {schedule.map(
              (row, index) => (
                <tr
                  key={
                    row.id ||
                    index
                  }
                  className="border-t border-slate-100"
                >
                  <td>{index + 1}</td>
                  <td>
                    {formatDate(row.dueDate)}
                  </td>
                  <td>
                    ₹{money(
                      getScheduleAmount(
                        row
                      )
                    )}
                  </td>
                  <td>
                    ₹{money(
                      row.principal
                    )}
                  </td>
                  <td>
                    ₹{money(
                      row.interest
                    )}
                  </td>
                  <td>
                    ₹{money(
                      getSchedulePaidAmount(
                        row
                      )
                    )}
                  </td>
                  <td>
                    ₹{money(
                      getScheduleRemainingAmount(
                        row
                      )
                    )}
                  </td>
                  <td>
                    {getScheduleDisplayStatus(
                      row
                    )}
                  </td>
                </tr>
              )
            )}

          </tbody>
        </table>
      </div>
    </section>
  );
};

export default LoanRepaymentSchedule;