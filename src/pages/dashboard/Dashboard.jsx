// src/pages/dashboard/Dashboard.jsx

import {
  Bell,
  ClipboardList,
  PhoneCall,
  Plus,
  UserPlus,
  WalletCards,
  X,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useDashboardData from "../../hooks/dashboard/useDashboardData";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import FinancialOverview from "../../components/dashboard/FinancialOverview/FinancialOverview";
import KeyActivity from "../../components/dashboard/KeyActivity/KeyActivity";
import PortfolioRisk from "../../components/dashboard/PortfolioRisk/PortfolioRisk";

const Dashboard = () => {
  const navigate = useNavigate();

  const [quickActionsOpen, setQuickActionsOpen] =
    useState(false);

  const {
  loading,
  loans,

  totalCustomers,
  totalLoans,

  activeLoans,
  closedLoans,

  overdueLoanCount,
  overdueAmount,

  totalOutstanding,

  newLoansToday,

  emiDueCount,
  emiDueAmount,

  pendingLoans,

  followUpQueue,
  recentActions,

  collectionVsDue,
  cashBankUpi,
  cashPosition,
  pendingActions,

  ptpDue,
  expenses,
} = useDashboardData();


  /* =====================================================
     TODAY'S FOLLOW-UP
     Only records due today.
     Maximum 3 records.
  ====================================================== */

  const todayFollowUps = Array.isArray(
    followUpQueue
  )
    ? followUpQueue
        .filter(
          ({ scheduleRow }) =>
            isDueToday(
              scheduleRow?.dueDate
            )
        )
        .slice(0, 3)
    : [];

  /* =====================================================
     RECENT ATTENTION / ACTIONS
  ====================================================== */

  const recentAttention =
    Array.isArray(recentActions)
      ? recentActions
          .filter(
            (action) =>
              action?.type === "overdue" ||
              action?.type === "loan_created" ||
              action?.type === "customer_created"
          )
          .slice(0, 3)
      : [];

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <div
        className="
          flex
          h-full
          min-h-0
          items-center
          justify-center
          bg-[#F7F9F8]
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-full
              bg-[#EAF5EF]
            "
          >
            <div
              className="
                h-5
                w-5
                animate-spin
                rounded-full
                border-2
                border-slate-200
                border-t-[#0B5D3B]
              "
            />
          </div>

          <p className="mt-2 text-sm font-medium text-slate-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* =====================================================
     MAIN
  ====================================================== */

  return (
    <div
      className="
        relative
        flex
        h-full
        min-h-0
        flex-col
        overflow-hidden
        bg-[#F7F9F8]
      "
    >
      {/* =================================================
          HEADER
      ================================================== */}

      <DashboardHeader
        customerCount={totalCustomers}
        loanCount={totalLoans}
      />

      {/* =================================================
          CONTENT

          Desktop:
          No page scroll.

          Mobile:
          Allow vertical scrolling only when necessary.
      ================================================== */}

      <main
        className="
          min-h-0
          flex-1
          overflow-hidden
          px-3
          py-3
          sm:px-4
          lg:px-5
          max-md:overflow-y-auto
        "
      >
        <div
          className="
            flex
            min-h-0
            flex-col
            gap-3
          "
        >
          {/* =================================================
              FINANCIAL OVERVIEW
          ================================================== */}
<FinancialOverview
  collectionVsDue={
    collectionVsDue
  }
  cashBankUpi={
    cashBankUpi
  }
  cashPosition={
    cashPosition
  }
  pendingActions={
    pendingActions
  }
/>

          {/* =================================================
              KEY ACTIVITY

              DISPLAY ONLY.
              Clicking does nothing.
          ================================================== */}

          <KeyActivity
            newLoansToday={
              newLoansToday
            }

            emiDueCount={
              emiDueCount
            }

            emiDueAmount={
              emiDueAmount
            }

            overdueCount={
              overdueLoanCount
            }

            overdueAmount={
              overdueAmount
            }

            pendingCount={
              pendingLoans
            }

            ptpDueCount={
              ptpDue?.count || 0
            }

            ptpDueAmount={
              ptpDue?.amount || 0
            }

            closedLoans={
              closedLoans
            }

            closedAmount={0}

            expenses={
              expenses
            }
          />

          {/* =================================================
              CURRENT PORTFOLIO & RISK

              Single main section.
          ================================================== */}

          <div className="min-h-0">
            <PortfolioRisk
              totalOutstanding={
                totalOutstanding
              }
              activeLoans={
                activeLoans
              }
              overdueAmount={
                overdueAmount
              }
              overdueLoanCount={
                overdueLoanCount
              }
              loans={loans}
            />
          </div>
        </div>
      </main>

      {/* =================================================
          FLOATING QUICK ACTION
      ================================================== */}

     <div
  className="
    pointer-events-none
    absolute
    right-4
    top-1/2
    z-50
    -translate-y-1/2
    sm:right-5
  "
>
        {/* =================================================
            POPOVER
        ================================================== */}

        {quickActionsOpen && (
          <div
            className="
              pointer-events-auto
              absolute
              bottom-16
              right-0
              w-[300px]
              max-w-[calc(100vw-24px)]
              overflow-hidden
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-2xl
              ring-1
              ring-black/5
            "
          >
            {/* MENU HEADER */}

            <div
              className="
                border-b
                border-slate-100
                px-4
                py-3
              "
            >
              <div className="flex items-center gap-2.5">
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
                  <ClipboardList
                    size={16}
                    strokeWidth={2}
                    className="text-[#0B5D3B]"
                  />
                </div>

                <div>
                  <p className="text-[11px] font-semibold text-[#17221D]">
                    Quick Actions
                  </p>

                  <p className="mt-0.5 text-[8px] text-slate-400">
                    Finance operations & attention
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                PRIMARY ACTIONS
            ================================================== */}

            <div className="grid grid-cols-2 gap-2 p-3">
              <QuickActionButton
                icon={UserPlus}
                label="Add Customer"
                onClick={() =>
                  navigate(
                    "/customers/onboarding"
                  )
                }
              />

              <QuickActionButton
                icon={WalletCards}
                label="Create New Loan"
                onClick={() =>
                  navigate(
                    "/customers/onboarding"
                  )
                }
              />

              <QuickActionButton
                icon={WalletCards}
                label="Record Payment"
                disabled
              />

              <QuickActionButton
                icon={PhoneCall}
                label="View Due / Follow-up"
                onClick={() =>
                  navigate("/loan")
                }
              />
            </div>

            {/* =================================================
                TODAY'S FOLLOW-UP
            ================================================== */}

            <div
              className="
                border-t
                border-slate-100
                px-3
                py-3
              "
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PhoneCall
                    size={13}
                    strokeWidth={2}
                    className="text-[#0B5D3B]"
                  />

                  <p className="text-[9px] font-semibold text-[#17221D]">
                    Today&apos;s Follow-up
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/loan")
                  }
                  className="text-[8px] font-semibold text-[#0B5D3B] hover:underline"
                >
                  View All
                </button>
              </div>

              {todayFollowUps.length === 0 ? (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-[8px] text-slate-400">
                  No follow-ups today
                </p>
              ) : (
                <div className="space-y-1.5">
                  {todayFollowUps.map(
                    ({
                      loan,
                      scheduleRow,
                    }) => (
                      <div
                        key={`${loan?.id || loan?.loanNumber}-${scheduleRow?.dueDate}`}
                        className="
                          flex
                          items-center
                          justify-between
                          gap-2
                          rounded-lg
                          bg-slate-50
                          px-3
                          py-2
                        "
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[9px] font-semibold text-[#17221D]">
                            {getCustomerName(
                              loan
                            )}
                          </p>

                          <p className="mt-0.5 text-[8px] text-slate-400">
                            {loan?.loanNumber ||
                              "Loan"}
                          </p>
                        </div>

                        <div className="shrink-0 text-right">
                          <p className="text-[9px] font-semibold text-[#17221D]">
                            ₹
                            {getPaymentAmount(
                              scheduleRow
                            ).toLocaleString(
                              "en-IN"
                            )}
                          </p>

                          <p
                            className={`
                              mt-0.5
                              text-[7px]
                              font-semibold
                              ${
                                String(
                                  scheduleRow?.status ||
                                    ""
                                ).toLowerCase() ===
                                "overdue"
                                  ? "text-red-700"
                                  : "text-[#0B5D3B]"
                              }
                            `}
                          >
                            {scheduleRow?.status ||
                              "Pending"}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* =================================================
                RECENT ACTIONS
            ================================================== */}

            <div
              className="
                border-t
                border-slate-100
                px-3
                py-3
              "
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell
                    size={13}
                    strokeWidth={2}
                    className="text-[#0B5D3B]"
                  />

                  <p className="text-[9px] font-semibold text-[#17221D]">
                    Recent Actions
                  </p>
                </div>
              </div>

              {recentAttention.length === 0 ? (
                <p className="rounded-lg bg-slate-50 px-3 py-2 text-[8px] text-slate-400">
                  No recent actions
                </p>
              ) : (
                <div className="space-y-1.5">
                  {recentAttention.map(
                    (action) => (
                      <button
                        key={action.id}
                        type="button"
                        onClick={() => {
                          if (
                            action?.type ===
                            "customer_created"
                          ) {
                            navigate(
                              "/customers"
                            );
                            return;
                          }

                          navigate(
                            "/loan"
                          );
                        }}
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          gap-2
                          rounded-lg
                          bg-slate-50
                          px-3
                          py-2
                          text-left
                          transition
                          hover:bg-[#F1F7F3]
                        "
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[9px] font-semibold text-[#17221D]">
                            {action?.title ||
                              "Recent activity"}
                          </p>

                          <p className="mt-0.5 truncate text-[8px] text-slate-400">
                            {action?.description ||
                              "Recent system activity"}
                          </p>
                        </div>

                        <span
                          className="
                            shrink-0
                            text-[8px]
                            font-semibold
                            text-[#0B5D3B]
                          "
                        >
                          View
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================
            FLOATING BUTTON
        ================================================== */}

        <div className="pointer-events-auto relative">
          {!quickActionsOpen && (
            <span
              className="
                absolute
                inset-0
                animate-ping
                rounded-full
                bg-[#0B5D3B]/20
              "
            />
          )}

          <button
            type="button"
            onClick={() =>
              setQuickActionsOpen(
                (previous) =>
                  !previous
              )
            }
            className="
              relative
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-[#0B5D3B]
              text-white
              shadow-lg
              ring-4
              ring-white
              transition
              duration-200
              hover:scale-105
              hover:bg-[#084A30]
            "
            aria-label={
              quickActionsOpen
                ? "Close quick actions"
                : "Open quick actions"
            }
          >
            {quickActionsOpen ? (
              <X
                size={20}
                strokeWidth={2}
              />
            ) : (
              <Plus
                size={21}
                strokeWidth={2.3}
              />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   QUICK ACTION BUTTON
========================================================= */

const QuickActionButton = ({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`
        flex
        items-center
        gap-2
        rounded-xl
        border
        border-slate-200
        px-2.5
        py-2.5
        text-left
        transition
        duration-150

        ${
          disabled
            ? "cursor-not-allowed opacity-45"
            : "hover:border-[#CFE5D8] hover:bg-[#F6FBF8]"
        }
      `}
    >
      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-lg
          bg-[#EAF5EF]
        "
      >
        <Icon
          size={15}
          strokeWidth={2}
          className="text-[#0B5D3B]"
        />
      </div>

      <span className="min-w-0 truncate text-[9px] font-semibold text-[#17221D]">
        {label}
      </span>
    </button>
  );
};

/* =========================================================
   DATE
========================================================= */

const isDueToday = (
  value
) => {
  if (!value) {
    return false;
  }

  const dueDate = new Date(
    value
  );

  if (
    Number.isNaN(
      dueDate.getTime()
    )
  ) {
    return false;
  }

  const today = new Date();

  return (
    dueDate.getFullYear() ===
      today.getFullYear() &&
    dueDate.getMonth() ===
      today.getMonth() &&
    dueDate.getDate() ===
      today.getDate()
  );
};

/* =========================================================
   DISPLAY HELPERS
========================================================= */

const getCustomerName = (
  loan
) => {
  return (
    loan?.customer?.personal?.name ||
    loan?.customer?.customerName ||
    loan?.customerName ||
    "Customer"
  );
};

const getPaymentAmount = (
  scheduleRow
) => {
  return Number(
    scheduleRow?.paymentAmount ||
      scheduleRow?.emiAmount ||
      scheduleRow?.amount ||
      0
  );
};

export default Dashboard;