// src/hooks/dashboard/useDashboardData.js

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCustomers,
  getLoans,
  getOutstandingAmount,
} from "../../services/customerStorage";

import {
  getExpenses,
} from "../../services/expenseStorage";

import {
  getCollections,
} from "../../services/collectionStorage";

const useDashboardData = () => {
  const [customers, setCustomers] =
    useState([]);

  const [loans, setLoans] =
    useState([]);

  const [expenses, setExpenses] =
    useState([]);

  const [collections, setCollections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  /* =====================================================
     LOAD
  ====================================================== */

  const loadDashboardData =
    useCallback(() => {
      try {
        const storedCustomers =
          getCustomers();

        const storedLoans =
          getLoans();

        const storedExpenses =
          getExpenses();

        const storedCollections =
          getCollections();

        setCustomers(
          Array.isArray(
            storedCustomers
          )
            ? storedCustomers
            : []
        );

        setLoans(
          Array.isArray(
            storedLoans
          )
            ? storedLoans
            : []
        );

        setExpenses(
          Array.isArray(
            storedExpenses
          )
            ? storedExpenses
            : []
        );

        setCollections(
          Array.isArray(
            storedCollections
          )
            ? storedCollections
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load dashboard data:",
          error
        );

        setCustomers([]);
        setLoans([]);
        setExpenses([]);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    }, []);

  /* =====================================================
     DATA UPDATE LISTENER

     Auto Finance only.
  ====================================================== */

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => {
      loadDashboardData();
    };

    window.addEventListener(
      "auto-finance:data-updated",
      handleUpdate
    );

    window.addEventListener(
      "storage",
      handleUpdate
    );

    return () => {
      window.removeEventListener(
        "auto-finance:data-updated",
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

  const totalCustomers =
    customers.length;

  const totalLoans =
    loans.length;

  const activeLoans =
    loans.filter(
      (loan) =>
        String(
          loan?.status || ""
        )
          .trim()
          .toLowerCase() ===
        "active"
    ).length;

  const closedLoans =
    loans.filter(
      (loan) =>
        String(
          loan?.status || ""
        )
          .trim()
          .toLowerCase() ===
        "closed"
    ).length;

  const pendingLoans =
    loans.filter(
      (loan) =>
        String(
          loan?.status || ""
        )
          .trim()
          .toLowerCase() ===
        "pending"
    ).length;

  /* =====================================================
     OUTSTANDING
  ====================================================== */

  const totalOutstanding =
    useMemo(() => {
      return loans.reduce(
        (total, loan) =>
          total +
          Number(
            getOutstandingAmount(
              loan
            ) || 0
          ),
        0
      );
    }, [loans]);

  /* =====================================================
     DATE HELPERS
  ====================================================== */

  const todayStart =
    useMemo(() => {
      const date =
        new Date();

      date.setHours(
        0,
        0,
        0,
        0
      );

      return date;
    }, []);

  const todayEnd =
    useMemo(() => {
      const date =
        new Date();

      date.setHours(
        23,
        59,
        59,
        999
      );

      return date;
    }, []);

  const todayKey =
    useMemo(() => {
      return [
        todayStart.getFullYear(),

        String(
          todayStart.getMonth() + 1
        ).padStart(2, "0"),

        String(
          todayStart.getDate()
        ).padStart(2, "0"),
      ].join("-");
    }, [todayStart]);

  /* =====================================================
     LOCAL DATE PARSER
  ====================================================== */

  const parseScheduleDate =
    useCallback(
      (value) => {
        if (!value) {
          return null;
        }

        const raw =
          String(value);

        const match =
          raw.match(
            /^(\d{4})-(\d{2})-(\d{2})/
          );

        if (match) {
          const [
            ,
            year,
            month,
            day,
          ] = match;

          return new Date(
            Number(year),
            Number(month) - 1,
            Number(day)
          );
        }

        const date =
          new Date(value);

        return Number.isNaN(
          date.getTime()
        )
          ? null
          : date;
      },
      []
    );

  const getDayStart =
    useCallback(
      (value) => {
        const date =
          value instanceof Date
            ? new Date(value)
            : parseScheduleDate(
                value
              );

        if (!date) {
          return null;
        }

        date.setHours(
          0,
          0,
          0,
          0
        );

        return date;
      },
      [parseScheduleDate]
    );

  const getDateKey =
    useCallback(
      (value) => {
        const date =
          getDayStart(value);

        if (!date) {
          return "";
        }

        return [
          date.getFullYear(),

          String(
            date.getMonth() + 1
          ).padStart(2, "0"),

          String(
            date.getDate()
          ).padStart(2, "0"),
        ].join("-");
      },
      [getDayStart]
    );

  /* =====================================================
     REPAYMENT HELPERS
  ====================================================== */

  const getSchedule =
    useCallback(
      (loan) => {
        return Array.isArray(
          loan?.repaymentSchedule
        )
          ? loan.repaymentSchedule
          : [];
      },
      []
    );

  const getRowAmount =
    useCallback(
      (row) => {
        return Number(
          row?.paymentAmount ??
            row?.emiAmount ??
            row?.amount ??
            0
        );
      },
      []
    );


const todayScheduledDueAmount = useMemo(() => {
  return loans.reduce((total, loan) => {
    const schedule = getSchedule(loan);

    return (
      total +
      schedule.reduce((sum, row) => {
        const dueDate = getDateKey(
          row?.dueDate
        );

        if (dueDate !== todayKey) {
          return sum;
        }

        return (
          sum +
          getRowAmount(row)
        );
      }, 0)
    );
  }, 0);
}, [
  loans,
  getSchedule,
  getDateKey,
  getRowAmount,
  todayKey,
]);

  const normalizePaymentStatus =
    useCallback(
      (status) => {
        return String(
          status || ""
        )
          .trim()
          .toLowerCase();
      },
      []
    );

  const isCompletedPaymentStatus =
    useCallback(
      (status) => {
        const normalized =
          normalizePaymentStatus(
            status
          );

        return (
          normalized ===
            "paid" ||
          normalized ===
            "completed" ||
          normalized ===
            "closed" ||
          normalized ===
            "settled"
        );
      },
      [normalizePaymentStatus]
    );

  const isOpenPaymentStatus =
    useCallback(
      (status) => {
        const normalized =
          normalizePaymentStatus(
            status
          );

        return (
          normalized ===
            "pending" ||
          normalized ===
            "due" ||
          normalized ===
            "due today" ||
          normalized ===
            "overdue" ||
          normalized ===
            "partially paid" ||
          normalized ===
            "partially-paid" ||
          normalized ===
            "partial"
        );
      },
      [normalizePaymentStatus]
    );

  /* =====================================================
     APPROVED COLLECTIONS
  ====================================================== */

  const approvedCollections =
    useMemo(() => {
      return collections.filter(
        (collection) =>
          normalizePaymentStatus(
            collection?.status
          ) ===
          "approved"
      );
    }, [
      collections,
      normalizePaymentStatus,
    ]);

  /* =====================================================
     PENDING COLLECTIONS
  ====================================================== */

  const pendingCollections =
    useMemo(() => {
      return collections.filter(
        (collection) =>
          normalizePaymentStatus(
            collection?.status
          ) ===
          "pending"
      );
    }, [
      collections,
      normalizePaymentStatus,
    ]);

  const pendingCollectionCount =
    pendingCollections.length;

  const pendingCollectionAmount =
    useMemo(() => {
      return pendingCollections.reduce(
        (total, collection) =>
          total +
          Number(
            collection?.amount ||
              0
          ),
        0
      );
    }, [pendingCollections]);

  /* =====================================================
     APPROVED COLLECTION TOTAL
  ====================================================== */

  const approvedCollectionAmount =
    useMemo(() => {
      return approvedCollections.reduce(
        (total, collection) =>
          total +
          Number(
            collection?.amount ||
              0
          ),
        0
      );
    }, [approvedCollections]);

  /* =====================================================
     APPROVED AMOUNT FOR ONE INSTALLMENT
  ====================================================== */

  const getApprovedAmountForRow =
    useCallback(
      (loan, row) => {
        const loanId =
          loan?.id ||
          loan?.loanNumber ||
          "";

        const scheduleId =
          row?.id ||
          "";

        const dueDate =
          getDateKey(
            row?.dueDate
          );

        return approvedCollections
          .filter(
            (collection) => {
              const collectionLoanId =
                collection?.loanId ||
                collection?.loanNumber ||
                "";

              const collectionScheduleId =
                collection?.scheduleId ||
                "";

              const collectionDueDate =
                getDateKey(
                  collection?.dueDate
                );

              /*
               * Best match:
               * repayment schedule ID.
               */
              if (
                scheduleId &&
                collectionScheduleId
              ) {
                return (
                  String(
                    collectionScheduleId
                  ) ===
                  String(
                    scheduleId
                  )
                );
              }

              /*
               * Fallback:
               * loan + due date.
               */
              return (
                String(
                  collectionLoanId
                ) ===
                  String(
                    loanId
                  ) &&
                collectionDueDate ===
                  dueDate
              );
            }
          )
          .reduce(
            (total, collection) =>
              total +
              Number(
                collection?.amount ||
                  0
              ),
            0
          );
      },
      [
        approvedCollections,
        getDateKey,
      ]
    );

  /* =====================================================
     NEW LOANS TODAY
  ====================================================== */

  const newLoansToday =
    useMemo(() => {
      return loans.filter(
        (loan) => {
          const createdAt =
            new Date(
              loan?.createdAt ||
                0
            );

          if (
            Number.isNaN(
              createdAt.getTime()
            )
          ) {
            return false;
          }

          return (
            createdAt >=
              todayStart &&
            createdAt <=
              todayEnd
          );
        }
      ).length;
    }, [
      loans,
      todayStart,
      todayEnd,
    ]);

  /* =====================================================
     OVERDUE RULE

     Unpaid installment with a due date
     before today.
  ====================================================== */

  const isOverdueScheduleRow =
    useCallback(
      (row) => {
        const status =
          normalizePaymentStatus(
            row?.status
          );

        if (
          isCompletedPaymentStatus(
            status
          )
        ) {
          return false;
        }

        const dueDate =
          getDayStart(
            row?.dueDate
          );

        if (!dueDate) {
          return false;
        }

        return (
          dueDate.getTime() <
          todayStart.getTime()
        );
      },
      [
        normalizePaymentStatus,
        isCompletedPaymentStatus,
        getDayStart,
        todayStart,
      ]
    );

  /* =====================================================
     TODAY'S EMI DUE

     Remaining unpaid amount.
  ====================================================== */

  const dueToday =
    useMemo(() => {
      const rows = [];

      loans.forEach(
        (loan) => {
          const schedule =
            getSchedule(loan);

          schedule.forEach(
            (row) => {
              const status =
                normalizePaymentStatus(
                  row?.status
                );

              if (
                isCompletedPaymentStatus(
                  status
                )
              ) {
                return;
              }

              const dueDate =
                getDayStart(
                  row?.dueDate
                );

              if (!dueDate) {
                return;
              }

              if (
                getDateKey(
                  dueDate
                ) !==
                todayKey
              ) {
                return;
              }

              const scheduledAmount =
                getRowAmount(
                  row
                );

              const approvedAmount =
                getApprovedAmountForRow(
                  loan,
                  row
                );

              const remainingAmount =
                Math.max(
                  scheduledAmount -
                    approvedAmount,
                  0
                );

              if (
                remainingAmount <=
                0
              ) {
                return;
              }

              rows.push({
                loan,

                scheduleRow: {
                  ...row,

                  remainingAmount,
                },
              });
            }
          );
        }
      );

      return rows;
    }, [
      loans,
      getSchedule,
      normalizePaymentStatus,
      isCompletedPaymentStatus,
      getDayStart,
      getDateKey,
      getRowAmount,
      getApprovedAmountForRow,
      todayKey,
    ]);

  const emiDueCount =
    dueToday.length;

  const emiDueAmount =
    useMemo(() => {
      return dueToday.reduce(
        (total, item) =>
          total +
          Number(
            item?.scheduleRow
              ?.remainingAmount ||
              0
          ),
        0
      );
    }, [dueToday]);

  /* =====================================================
     OVERDUE PAYMENTS

     Current remaining overdue only.
  ====================================================== */

  const overduePayments =
    useMemo(() => {
      const rows = [];

      loans.forEach(
        (loan) => {
          const schedule =
            getSchedule(loan);

          schedule.forEach(
            (row) => {
              const status =
                normalizePaymentStatus(
                  row?.status
                );

              if (
                isCompletedPaymentStatus(
                  status
                )
              ) {
                return;
              }

              const dueDate =
                getDayStart(
                  row?.dueDate
                );

              if (!dueDate) {
                return;
              }

              if (
                dueDate.getTime() >=
                todayStart.getTime()
              ) {
                return;
              }

              const scheduledAmount =
                getRowAmount(
                  row
                );

              const approvedAmount =
                getApprovedAmountForRow(
                  loan,
                  row
                );

              const remainingAmount =
                Math.max(
                  scheduledAmount -
                    approvedAmount,
                  0
                );

              if (
                remainingAmount <=
                0
              ) {
                return;
              }

              const overdueDays =
                Math.max(
                  1,
                  Math.floor(
                    (
                      todayStart.getTime() -
                      dueDate.getTime()
                    ) /
                      (
                        1000 *
                        60 *
                        60 *
                        24
                      )
                  )
                );

              rows.push({
                loan,

                scheduleRow: {
                  ...row,

                  remainingAmount,

                  overdueDays,
                },

                overdueDays,
              });
            }
          );
        }
      );

      return rows.sort(
        (a, b) => {
          const aDate =
            getDayStart(
              a?.scheduleRow
                ?.dueDate
            );

          const bDate =
            getDayStart(
              b?.scheduleRow
                ?.dueDate
            );

          return (
            (aDate?.getTime() ||
              0) -
            (bDate?.getTime() ||
              0)
          );
        }
      );
    }, [
      loans,
      getSchedule,
      normalizePaymentStatus,
      isCompletedPaymentStatus,
      getDayStart,
      getRowAmount,
      getApprovedAmountForRow,
      todayStart,
    ]);

  /* =====================================================
     UNIQUE OVERDUE LOANS
  ====================================================== */

  const overdueLoanIds =
    useMemo(() => {
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

  /* =====================================================
     CURRENT OVERDUE AMOUNT

     Only remaining amount.
  ====================================================== */

  const overdueAmount =
    useMemo(() => {
      return overduePayments.reduce(
        (total, item) =>
          total +
          Number(
            item?.scheduleRow
              ?.remainingAmount ||
              0
          ),
        0
      );
    }, [overduePayments]);

  /* =====================================================
     TODAY'S APPROVED COLLECTION
  ====================================================== */

  const todayCollectionAmount =
    useMemo(() => {
      return approvedCollections
        .filter(
          (collection) => {
            const collectedDate =
              getDateKey(
                collection?.collectedDate ||
                  collection?.collectionDate ||
                  collection?.submittedAt ||
                  collection?.approvedAt
              );

            return (
              collectedDate ===
              todayKey
            );
          }
        )
        .reduce(
          (total, collection) =>
            total +
            Number(
              collection?.amount ||
                0
            ),
          0
        );
    }, [
      approvedCollections,
      getDateKey,
      todayKey,
    ]);

  /* =====================================================
     TODAY NORMAL COLLECTION
  ====================================================== */

  const todayDueCollectionAmount =
    useMemo(() => {
      return approvedCollections
        .filter(
          (collection) => {
            const collectedDate =
              getDateKey(
                collection?.collectedDate ||
                  collection?.collectionDate ||
                  collection?.submittedAt ||
                  collection?.approvedAt
              );

            const dueDate =
              getDateKey(
                collection?.dueDate
              );

            return (
              collectedDate ===
                todayKey &&
              dueDate ===
                todayKey
            );
          }
        )
        .reduce(
          (total, collection) =>
            total +
            Number(
              collection?.amount ||
                0
            ),
          0
        );
    }, [
      approvedCollections,
      getDateKey,
      todayKey,
    ]);

  /* =====================================================
     OVERDUE COLLECTION MADE TODAY
  ====================================================== */

  const overdueCollectionTodayAmount =
    useMemo(() => {
      return approvedCollections
        .filter(
          (collection) => {
            const collectedDate =
              getDateKey(
                collection?.collectedDate ||
                  collection?.collectionDate ||
                  collection?.submittedAt ||
                  collection?.approvedAt
              );

            const dueDate =
              getDateKey(
                collection?.dueDate
              );

            if (
              !collectedDate ||
              !dueDate
            ) {
              return false;
            }

            return (
              collectedDate ===
                todayKey &&
              dueDate <
                collectedDate
            );
          }
        )
        .reduce(
          (total, collection) =>
            total +
            Number(
              collection?.amount ||
                0
            ),
          0
        );
    }, [
      approvedCollections,
      getDateKey,
      todayKey,
    ]);

  /* =====================================================
     ORIGINAL OVERDUE AMOUNT FOR TODAY

     IMPORTANT FIX.

     Current overdue decreases when Staff collection
     is approved.

     For accuracy, we reconstruct the amount that was
     overdue before today's approved overdue recovery:

        Original overdue
        =
        Current remaining overdue
        +
        Today's approved overdue collection
  ====================================================== */

const originalOverdueAmount = useMemo(() => {
  return (
    overdueAmount +
    overdueCollectionTodayAmount
  );
}, [
  overdueAmount,
  overdueCollectionTodayAmount,
]);

  /* =====================================================
     TODAY COLLECTION ACCURACY
  ====================================================== */

  const todayCollectionAccuracy =
    useMemo(() => {
      if (
        todayScheduledDueAmount <=
        0
      ) {
        return 0;
      }

      return Math.min(
        100,
        (
          todayDueCollectionAmount /
          todayScheduledDueAmount
        ) * 100
      );
    }, [
      todayDueCollectionAmount,
      todayScheduledDueAmount,
    ]);

  /* =====================================================
     OVERDUE RECOVERY ACCURACY

     IMPORTANT:
     Use ORIGINAL overdue as denominator.

     Do NOT use current overdueAmount here.
  ====================================================== */
const overdueCollectionAccuracy =
  useMemo(() => {
    if (
      originalOverdueAmount <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      (
        overdueCollectionTodayAmount /
        originalOverdueAmount
      ) * 100
    );
  }, [
    overdueCollectionTodayAmount,
    originalOverdueAmount,
  ]);

  /* =====================================================
     COLLECTION VS DUE

     The UI can display current overdue,
     while accuracy uses original overdue.
  ====================================================== */
const collectionVsDue = useMemo(() => {
  return {
    today: {
      due:
        todayScheduledDueAmount,

      collected:
        todayDueCollectionAmount,

      accuracy:
        todayScheduledDueAmount > 0
          ? Math.min(
              100,
              (
                todayDueCollectionAmount /
                todayScheduledDueAmount
              ) * 100
            )
          : 0,
    },

    overdue: {
      /*
       * IMPORTANT:
       * Do NOT use current overdueAmount here.
       * current overdue can become ₹0 after payment.
       *
       * The card must compare:
       * original overdue vs collected overdue.
       */
      due:
        originalOverdueAmount,

      collected:
        overdueCollectionTodayAmount,

      accuracy:
        overdueCollectionAccuracy,
    },
  };
}, [
  todayScheduledDueAmount,
  todayDueCollectionAmount,

  originalOverdueAmount,
  overdueCollectionTodayAmount,
  overdueCollectionAccuracy,
]);

  /* =====================================================
     CASH / BANK / UPI

     ALL APPROVED COLLECTIONS.
  ====================================================== */

  const cashBankUpi =
    useMemo(() => {
      return approvedCollections.reduce(
        (totals, collection) => {
          const mode =
            String(
              collection?.paymentMode ||
                ""
            )
              .trim()
              .toLowerCase();

          const amount =
            Number(
              collection?.amount ||
                0
            );

          if (
            mode === "cash"
          ) {
            totals.cash +=
              amount;
          }

          if (
            mode === "bank"
          ) {
            totals.bank +=
              amount;
          }

          if (
            mode === "upi"
          ) {
            totals.upi +=
              amount;
          }

          return totals;
        },
        {
          cash: 0,
          bank: 0,
          upi: 0,
        }
      );
    }, [
      approvedCollections,
    ]);

  /* =====================================================
     CASH POSITION
  ====================================================== */

  const cashPosition =
    useMemo(() => {
      return (
        cashBankUpi.cash +
        cashBankUpi.bank +
        cashBankUpi.upi
      );
    }, [cashBankUpi]);

  /* =====================================================
     UPCOMING DUE

     Future unpaid installments only.
  ====================================================== */

  const upcomingDueLoans =
    useMemo(() => {
      const rows = [];

      loans.forEach(
        (loan) => {
          const schedule =
            getSchedule(loan);

          const futurePayments =
            schedule.filter(
              (row) => {
                const status =
                  normalizePaymentStatus(
                    row?.status
                  );

                if (
                  isCompletedPaymentStatus(
                    status
                  )
                ) {
                  return false;
                }

                const dueDate =
                  getDayStart(
                    row?.dueDate
                  );

                if (!dueDate) {
                  return false;
                }

                if (
                  dueDate.getTime() <=
                  todayStart.getTime()
                ) {
                  return false;
                }

                const scheduledAmount =
                  getRowAmount(
                    row
                  );

                const approvedAmount =
                  getApprovedAmountForRow(
                    loan,
                    row
                  );

                const remainingAmount =
                  Math.max(
                    scheduledAmount -
                      approvedAmount,
                    0
                  );

                return (
                  remainingAmount >
                  0
                );
              }
            );

          const nextPayment =
            futurePayments.sort(
              (a, b) => {
                const aDate =
                  getDayStart(
                    a?.dueDate
                  );

                const bDate =
                  getDayStart(
                    b?.dueDate
                  );

                return (
                  (aDate?.getTime() ||
                    0) -
                  (bDate?.getTime() ||
                    0)
                );
              }
            )[0];

          if (
            !nextPayment
          ) {
            return;
          }

          const remainingAmount =
            Math.max(
              getRowAmount(
                nextPayment
              ) -
                getApprovedAmountForRow(
                  loan,
                  nextPayment
                ),
              0
            );

          rows.push({
            loan,

            scheduleRow: {
              ...nextPayment,

              remainingAmount,
            },
          });
        }
      );

      return rows.sort(
        (a, b) => {
          const aDate =
            getDayStart(
              a?.scheduleRow
                ?.dueDate
            );

          const bDate =
            getDayStart(
              b?.scheduleRow
                ?.dueDate
            );

          return (
            (aDate?.getTime() ||
              0) -
            (bDate?.getTime() ||
              0)
          );
        }
      );
    }, [
      loans,
      getSchedule,
      normalizePaymentStatus,
      isCompletedPaymentStatus,
      getDayStart,
      getRowAmount,
      getApprovedAmountForRow,
      todayStart,
    ]);

  /* =====================================================
     OVERDUE + PENDING
  ====================================================== */

  const overduePendingCount =
    overdueLoanCount +
    pendingLoans;

  /* =====================================================
     CLOSED LOANS TODAY
  ====================================================== */

  const closedLoansToday =
    useMemo(() => {
      return loans.filter(
        (loan) => {
          const status =
            normalizePaymentStatus(
              loan?.status
            );

          if (
            status !==
            "closed"
          ) {
            return false;
          }

          const updatedAt =
            new Date(
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
            updatedAt >=
              todayStart &&
            updatedAt <=
              todayEnd
          );
        }
      ).length;
    }, [
      loans,
      todayStart,
      todayEnd,
      normalizePaymentStatus,
    ]);

  /* =====================================================
     FOLLOW-UP QUEUE

     Fully collected installments are removed.
  ====================================================== */

  const followUpQueue =
    useMemo(() => {
      const rows = [];

      overduePayments.forEach(
        ({
          loan,
          scheduleRow,
          overdueDays,
        }) => {
          rows.push({
            loan,

            scheduleRow,

            days:
              overdueDays,

            isOverdue:
              true,
          });
        }
      );

      dueToday.forEach(
        ({
          loan,
          scheduleRow,
        }) => {
          rows.push({
            loan,

            scheduleRow,

            days: 0,

            isOverdue:
              false,
          });
        }
      );

      return rows.sort(
        (a, b) => {
          if (
            a.isOverdue &&
            !b.isOverdue
          ) {
            return -1;
          }

          if (
            !a.isOverdue &&
            b.isOverdue
          ) {
            return 1;
          }

          if (
            a.isOverdue &&
            b.isOverdue
          ) {
            return (
              (b.days || 0) -
              (a.days || 0)
            );
          }

          const aDate =
            getDayStart(
              a?.scheduleRow
                ?.dueDate
            );

          const bDate =
            getDayStart(
              b?.scheduleRow
                ?.dueDate
            );

          return (
            (aDate?.getTime() ||
              0) -
            (bDate?.getTime() ||
              0)
          );
        }
      );
    }, [
      overduePayments,
      dueToday,
      getDayStart,
    ]);

  /* =====================================================
     RECENT LOANS
  ====================================================== */

  const recentLoans =
    useMemo(() => {
      return [...loans]
        .sort((a, b) => {
          const aDate =
            new Date(
              a?.updatedAt ||
                a?.createdAt ||
                0
            ).getTime();

          const bDate =
            new Date(
              b?.updatedAt ||
                b?.createdAt ||
                0
            ).getTime();

          return (
            bDate - aDate
          );
        })
        .slice(0, 5);
    }, [loans]);

  /* =====================================================
     RECENT CUSTOMERS
  ====================================================== */

  const recentCustomers =
    useMemo(() => {
      return [...customers]
        .sort((a, b) => {
          const aDate =
            new Date(
              a?.customer
                ?.updatedAt ||
                a?.customer
                  ?.createdAt ||
                0
            ).getTime();

          const bDate =
            new Date(
              b?.customer
                ?.updatedAt ||
                b?.customer
                  ?.createdAt ||
                0
            ).getTime();

          return (
            bDate - aDate
          );
        })
        .slice(0, 5);
    }, [customers]);

  /* =====================================================
     RECENT ACTIONS
  ====================================================== */

  const recentActions =
    useMemo(() => {
      const actions = [];

      customers.forEach(
        (customer) => {
          if (
            customer?.customer
              ?.createdAt
          ) {
            actions.push({
              id:
                `customer-created-${customer.customer.id}`,

              type:
                "customer_created",

              title:
                "Customer created",

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
        }
      );

      loans.forEach(
        (loan) => {
          if (
            loan?.createdAt
          ) {
            actions.push({
              id:
                `loan-created-${loan.id || loan.loanNumber}`,

              type:
                "loan_created",

              title:
                "Loan created",

              description:
                loan?.loanNumber ||
                "Loan",

              timestamp:
                loan.createdAt,

              loan,
            });
          }
        }
      );

      overduePayments.forEach(
        ({
          loan,
          scheduleRow,
        }) => {
          actions.push({
            id:
              `overdue-${loan?.id || loan?.loanNumber}-${scheduleRow?.dueDate}`,

            type:
              "overdue",

            title:
              "EMI overdue",

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
              b.timestamp ||
                0
            ).getTime() -
            new Date(
              a.timestamp ||
                0
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
     PENDING ACTIONS
  ====================================================== */

  const pendingActions =
    0;

  /* =====================================================
     PTP
  ====================================================== */

  const ptpDue =
    useMemo(
      () => ({
        count: 0,
        amount: 0,
      }),
      []
    );

  /* =====================================================
     EXPENSES

     ONLY PAID expenses affect dashboard totals.
  ====================================================== */

  const isPaidExpense =
    useCallback(
      (expense) => {
        return (
          normalizePaymentStatus(
            expense?.status
          ) ===
          "paid"
        );
      },
      [normalizePaymentStatus]
    );

  const totalExpenseAmount =
    useMemo(() => {
      return expenses
        .filter(
          isPaidExpense
        )
        .reduce(
          (total, expense) =>
            total +
            Number(
              expense?.amount ||
                0
            ),
          0
        );
    }, [
      expenses,
      isPaidExpense,
    ]);

  const todayExpenseAmount =
    useMemo(() => {
      return expenses
        .filter(
          (expense) => {
            if (
              !isPaidExpense(
                expense
              )
            ) {
              return false;
            }

            return (
              getDateKey(
                expense?.date
              ) ===
              todayKey
            );
          }
        )
        .reduce(
          (total, expense) =>
            total +
            Number(
              expense?.amount ||
                0
            ),
          0
        );
    }, [
      expenses,
      isPaidExpense,
      getDateKey,
      todayKey,
    ]);

  const currentMonthExpenseAmount =
    useMemo(() => {
      const year =
        todayStart.getFullYear();

      const month =
        todayStart.getMonth();

      return expenses
        .filter(
          (expense) => {
            if (
              !isPaidExpense(
                expense
              )
            ) {
              return false;
            }

            const date =
              parseScheduleDate(
                expense?.date
              );

            if (!date) {
              return false;
            }

            return (
              date.getFullYear() ===
                year &&
              date.getMonth() ===
                month
            );
          }
        )
        .reduce(
          (total, expense) =>
            total +
            Number(
              expense?.amount ||
                0
            ),
          0
        );
    }, [
      expenses,
      isPaidExpense,
      parseScheduleDate,
      todayStart,
    ]);

  const pendingExpenseRecords =
    useMemo(() => {
      return expenses.filter(
        (expense) =>
          normalizePaymentStatus(
            expense?.status
          ) ===
          "pending"
      );
    }, [
      expenses,
      normalizePaymentStatus,
    ]);

  const pendingExpenseCount =
    pendingExpenseRecords.length;

  const pendingExpenseAmount =
    useMemo(() => {
      return pendingExpenseRecords.reduce(
        (total, expense) =>
          total +
          Number(
            expense?.amount ||
              0
          ),
        0
      );
    }, [
      pendingExpenseRecords,
    ]);

  /* =====================================================
     RETURN
  ====================================================== */

  return {
    loading,

    customers,
    loans,
    expenses,
    collections,

    /* Basic */
    totalCustomers,
    totalLoans,
    activeLoans,
    closedLoans,
    pendingLoans,

    /* Outstanding */
    totalOutstanding,

    /* Loans */
    newLoansToday,

    dueToday,
    emiDueCount,
    emiDueAmount,

    todayScheduledDueAmount,

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

    /* Financial Overview */
    collectionVsDue,
    cashBankUpi,
    cashPosition,
    pendingActions,

    /* Collection */
    approvedCollections,
    pendingCollections,

    approvedCollectionAmount,

    todayCollectionAmount,
    todayDueCollectionAmount,
    overdueCollectionTodayAmount,

    originalOverdueAmount,
    overdueCollectionAccuracy,

    pendingCollectionCount,
    pendingCollectionAmount,

    /* Expense */
    totalExpenseAmount,
    todayExpenseAmount,
    currentMonthExpenseAmount,

    pendingExpenseCount,
    pendingExpenseAmount,

    /* PTP */
    ptpDue,

    /* Reload */
    reloadDashboard:
      loadDashboardData,
  };
};

export default useDashboardData;