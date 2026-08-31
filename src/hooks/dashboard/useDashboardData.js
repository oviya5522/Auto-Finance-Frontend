import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getCustomers,
  getLoans,
  getOutstandingAmount,
} from "../../services/customerStorage";

const useDashboardData = () => {
  const [customers, setCustomers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     LOAD
  ====================================================== */

  const loadDashboardData = useCallback(() => {
    try {
      const storedCustomers = getCustomers();
      const storedLoans = getLoans();

      setCustomers(
        Array.isArray(storedCustomers)
          ? storedCustomers
          : []
      );

      setLoans(
        Array.isArray(storedLoans)
          ? storedLoans
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load dashboard data:",
        error
      );

      setCustomers([]);
      setLoans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
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
  }, [loadDashboardData]);

  /* =====================================================
     BASIC COUNTS
  ====================================================== */

  const totalCustomers = customers.length;

  const totalLoans = loans.length;

  const activeLoans = loans.filter(
    (loan) =>
      String(loan?.status || "").toLowerCase() ===
      "active"
  ).length;

  const closedLoans = loans.filter(
    (loan) =>
      String(loan?.status || "").toLowerCase() ===
      "closed"
  ).length;

  const pendingLoans = loans.filter(
    (loan) =>
      String(loan?.status || "").toLowerCase() ===
      "pending"
  ).length;

  /* =====================================================
     OUTSTANDING
     Uses EXISTING shared calculation.
  ====================================================== */

  const totalOutstanding = useMemo(() => {
    return loans.reduce(
      (total, loan) =>
        total +
        Number(
          getOutstandingAmount(loan) || 0
        ),
      0
    );
  }, [loans]);

  /* =====================================================
     DATE HELPERS
  ====================================================== */

  const todayStart = useMemo(() => {
    const date = new Date();

    date.setHours(
      0,
      0,
      0,
      0
    );

    return date;
  }, []);

  const todayEnd = useMemo(() => {
    const date = new Date();

    date.setHours(
      23,
      59,
      59,
      999
    );

    return date;
  }, []);

  /* =====================================================
     NEW LOANS TODAY
  ====================================================== */

  const newLoansToday = useMemo(() => {
    return loans.filter((loan) => {
      const createdAt = new Date(
        loan?.createdAt || 0
      );

      if (
        Number.isNaN(
          createdAt.getTime()
        )
      ) {
        return false;
      }

      return (
        createdAt >= todayStart &&
        createdAt <= todayEnd
      );
    }).length;
  }, [
    loans,
    todayStart,
    todayEnd,
  ]);

  /* =====================================================
     REPAYMENT ROW NORMALIZATION
  ====================================================== */

  const getSchedule = (loan) => {
    return Array.isArray(
      loan?.repaymentSchedule
    )
      ? loan.repaymentSchedule
      : [];
  };

  const isOpenPaymentStatus = (
    status
  ) => {
    const normalized = String(
      status || ""
    ).toLowerCase();

    return (
      normalized === "pending" ||
      normalized === "overdue" ||
      normalized === "partially paid"
    );
  };

  /* =====================================================
     TODAY'S EMI DUE
  ====================================================== */

  const dueToday = useMemo(() => {
    const rows = [];

    loans.forEach((loan) => {
      const schedule = getSchedule(
        loan
      );

      schedule.forEach((row) => {
        if (
          !isOpenPaymentStatus(
            row?.status
          )
        ) {
          return;
        }

        const dueDate = new Date(
          row?.dueDate || 0
        );

        if (
          Number.isNaN(
            dueDate.getTime()
          )
        ) {
          return;
        }

        dueDate.setHours(
          0,
          0,
          0,
          0
        );

        if (
          dueDate.getTime() ===
          todayStart.getTime()
        ) {
          rows.push({
            loan,
            scheduleRow: row,
          });
        }
      });
    });

    return rows;
  }, [
    loans,
    todayStart,
  ]);

  const emiDueCount =
    dueToday.length;

  const emiDueAmount = useMemo(() => {
    return dueToday.reduce(
      (total, item) =>
        total +
        Number(
          item?.scheduleRow?.paymentAmount ||
            item?.scheduleRow?.emiAmount ||
            item?.scheduleRow?.amount ||
            0
        ),
      0
    );
  }, [dueToday]);

  /* =====================================================
     OVERDUE
  ====================================================== */

  const overduePayments = useMemo(() => {
    const rows = [];

    loans.forEach((loan) => {
      const schedule = getSchedule(
        loan
      );

      schedule.forEach((row) => {
        const status = String(
          row?.status || ""
        ).toLowerCase();

        if (status === "overdue") {
          rows.push({
            loan,
            scheduleRow: row,
          });
        }
      });
    });

    return rows;
  }, [loans]);

  const overdueLoanIds = useMemo(() => {
    return new Set(
      overduePayments.map(
        ({ loan }) =>
          loan?.id ||
          loan?.loanNumber
      )
    );
  }, [overduePayments]);

  const overdueLoanCount =
    overdueLoanIds.size;

  const overdueAmount = useMemo(() => {
    return overduePayments.reduce(
      (total, item) =>
        total +
        Number(
          item?.scheduleRow?.paymentAmount ||
            item?.scheduleRow?.emiAmount ||
            item?.scheduleRow?.amount ||
            0
        ),
      0
    );
  }, [overduePayments]);

  /* =====================================================
     UPCOMING PAYMENTS
  ====================================================== */

  const upcomingDueLoans = useMemo(() => {
    const rows = [];

    loans.forEach((loan) => {
      const schedule = getSchedule(
        loan
      );

      const nextPayment =
        schedule.find((row) =>
          isOpenPaymentStatus(
            row?.status
          )
        );

      if (!nextPayment) {
        return;
      }

      const dueDate = new Date(
        nextPayment?.dueDate || 0
      );

      if (
        Number.isNaN(
          dueDate.getTime()
        )
      ) {
        return;
      }

      rows.push({
        loan,
        scheduleRow:
          nextPayment,
      });
    });

    return rows.sort((a, b) => {
      return (
        new Date(
          a?.scheduleRow?.dueDate || 0
        ).getTime() -
        new Date(
          b?.scheduleRow?.dueDate || 0
        ).getTime()
      );
    });
  }, [loans]);

  /* =====================================================
     OVERDUE + PENDING
  ====================================================== */

  const overduePendingCount =
    overdueLoanCount +
    pendingLoans;

  /* =====================================================
     CLOSED / SETTLED CREATED TODAY
     ====================================================== */

  const closedLoansToday = useMemo(() => {
    return loans.filter((loan) => {
      const status = String(
        loan?.status || ""
      ).toLowerCase();

      if (status !== "closed") {
        return false;
      }

      const updatedAt = new Date(
        loan?.updatedAt ||
          loan?.createdAt ||
          0
      );

      if (
        Number.isNaN(
          updatedAt.getTime()
        )
      ) {
        return false;
      }

      return (
        updatedAt >= todayStart &&
        updatedAt <= todayEnd
      );
    }).length;
  }, [
    loans,
    todayStart,
    todayEnd,
  ]);

  /* =====================================================
     FOLLOW-UP QUEUE
     Current data supports due/overdue records.
  ====================================================== */

  const followUpQueue = useMemo(() => {
    const rows = [];

    loans.forEach((loan) => {
      const schedule = getSchedule(
        loan
      );

      schedule.forEach((row) => {
        const status = String(
          row?.status || ""
        ).toLowerCase();

        if (
          status !== "overdue" &&
          status !== "pending"
        ) {
          return;
        }

        const dueDate = new Date(
          row?.dueDate || 0
        );

        if (
          Number.isNaN(
            dueDate.getTime()
          )
        ) {
          return;
        }

        const now = new Date();

        const difference =
          now.getTime() -
          dueDate.getTime();

        const days = Math.max(
          0,
          Math.floor(
            difference /
              (1000 *
                60 *
                60 *
                24)
          )
        );

        rows.push({
          loan,
          scheduleRow: row,
          days,
        });
      });
    });

    return rows.sort((a, b) => {
      const overdueA =
        String(
          a?.scheduleRow?.status || ""
        ).toLowerCase() ===
        "overdue";

      const overdueB =
        String(
          b?.scheduleRow?.status || ""
        ).toLowerCase() ===
        "overdue";

      if (
        overdueA &&
        !overdueB
      ) {
        return -1;
      }

      if (
        !overdueA &&
        overdueB
      ) {
        return 1;
      }

      return b.days - a.days;
    });
  }, [loans]);

  /* =====================================================
     RECENT LOANS
  ====================================================== */

  const recentLoans = useMemo(() => {
    return [...loans]
      .sort((a, b) => {
        const aDate = new Date(
          a?.updatedAt ||
            a?.createdAt ||
            0
        ).getTime();

        const bDate = new Date(
          b?.updatedAt ||
            b?.createdAt ||
            0
        ).getTime();

        return bDate - aDate;
      })
      .slice(0, 5);
  }, [loans]);

  /* =====================================================
     RECENT CUSTOMERS
  ====================================================== */

  const recentCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => {
        const aDate = new Date(
          a?.customer?.updatedAt ||
            a?.customer?.createdAt ||
            0
        ).getTime();

        const bDate = new Date(
          b?.customer?.updatedAt ||
            b?.customer?.createdAt ||
            0
        ).getTime();

        return bDate - aDate;
      })
      .slice(0, 5);
  }, [customers]);

  /* =====================================================
     RECENT ACTIONS
     Only actions supported by existing records.
  ====================================================== */

  const recentActions = useMemo(() => {
    const actions = [];

    customers.forEach((customer) => {
      if (
        customer?.customer?.createdAt
      ) {
        actions.push({
          id:
            `customer-created-${
              customer.customer.id
            }`,
          type: "customer_created",
          title: "Customer created",
          description:
            customer?.customer
              ?.personal?.name ||
            customer?.customer
              ?.customerNumber ||
            "Customer",
          timestamp:
            customer.customer
              .createdAt,
          customer,
        });
      }
    });

    loans.forEach((loan) => {
      if (
        loan?.createdAt
      ) {
        actions.push({
          id:
            `loan-created-${
              loan.id ||
              loan.loanNumber
            }`,
          type: "loan_created",
          title: "Loan created",
          description:
            loan?.loanNumber ||
            "Loan",
          timestamp:
            loan.createdAt,
          loan,
        });
      }
    });

    overduePayments.forEach(
      ({
        loan,
        scheduleRow,
      }) => {
        actions.push({
          id:
            `overdue-${
              loan?.id ||
              loan?.loanNumber
            }-${
              scheduleRow?.dueDate
            }`,
          type: "overdue",
          title: "EMI overdue",
          description:
            loan?.loanNumber ||
            "Loan",
          timestamp:
            scheduleRow?.dueDate,
          loan,
          scheduleRow,
        });
      }
    );

    return actions
      .sort((a, b) => {
        return (
          new Date(
            b.timestamp || 0
          ).getTime() -
          new Date(
            a.timestamp || 0
          ).getTime()
        );
      })
      .slice(0, 10);
  }, [
    customers,
    loans,
    overduePayments,
  ]);

  /* =====================================================
     UNSUPPORTED MODULES
     No fake business data.
  ====================================================== */

  const collectionVsDue = useMemo(
    () => ({
      collected: 0,
      due: emiDueAmount,
    }),
    [emiDueAmount]
  );

  const cashBankUpi = {
    cash: 0,
    bank: 0,
    upi: 0,
  };

  const cashPosition = 0;

  const pendingActions = 0;

  const ptpDue = {
    count: 0,
    amount: 0,
  };

  const expenses = 0;

  /* =====================================================
     RETURN
  ====================================================== */

  return {
    loading,

    customers,
    loans,

    totalCustomers,
    totalLoans,
    activeLoans,
    closedLoans,
    pendingLoans,

    totalOutstanding,

    newLoansToday,

    dueToday,
    emiDueCount,
    emiDueAmount,

    overduePayments,
    overdueLoanCount,
    overdueAmount,

    overduePendingCount,

    upcomingDueLoans,

    closedLoansToday,

    followUpQueue,

    recentLoans,
    recentCustomers,
    recentActions,

    collectionVsDue,
    cashBankUpi,
    cashPosition,
    pendingActions,

    ptpDue,
    expenses,

    reloadDashboard:
      loadDashboardData,
  };
};

export default useDashboardData;