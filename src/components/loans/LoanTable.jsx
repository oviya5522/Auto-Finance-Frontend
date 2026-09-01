// src/components/loans/LoanTable.jsx

import { useEffect, useMemo, useState } from "react";

import { ClipboardList } from "lucide-react";

import LoanTableRow from "./LoanTableRow";

const LoanTable = ({
  loans = [],
  onViewLoan,
}) => {
  /* =====================================================
     SINGLE OPEN ACTION MENU
  ====================================================== */

  const [openMenuId, setOpenMenuId] =
    useState(null);

  const [menuPosition, setMenuPosition] =
    useState({
      top: 0,
      left: 0,
    });

  /* =====================================================
     LOAN IDS
  ====================================================== */

  const loanIds = useMemo(
    () =>
      loans
        .map(
          (loan) =>
            loan?.id ||
            loan?.loanNumber
        )
        .filter(Boolean),
    [loans]
  );

  /* =====================================================
     KEEP OPEN MENU VALID
  ====================================================== */

  useEffect(() => {
    setOpenMenuId((current) =>
      current &&
      loanIds.includes(current)
        ? current
        : null
    );
  }, [loanIds]);

  /* =====================================================
     CLOSE MENU ON OUTSIDE CLICK
  ====================================================== */

  useEffect(() => {
    const handleDocumentClick = () => {
      setOpenMenuId(null);
    };

    document.addEventListener(
      "click",
      handleDocumentClick
    );

    return () => {
      document.removeEventListener(
        "click",
        handleDocumentClick
      );
    };
  }, []);

  /* =====================================================
     CLOSE MENU ON SCROLL
  ====================================================== */

  useEffect(() => {
    const handleScroll = () => {
      setOpenMenuId(null);
    };

    window.addEventListener(
      "scroll",
      handleScroll,
      true
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll,
        true
      );
    };
  }, []);

  return (
    <section
      className="
        mt-2.5
        w-full
        overflow-hidden
        rounded-xl
        border
        border-slate-200
        bg-white
        shadow-sm
      "
    >
      {/* =================================================
          TABLE HEADER
      ================================================== */}

      <div
        className="
          flex
          items-center
          justify-between
          gap-3
          border-b
          border-slate-100
          px-3.5
          py-3
        "
      >
        <div className="flex min-w-0 items-center gap-2.5">
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
            <ClipboardList
              size={16}
              strokeWidth={2}
              className="text-[#0B5D3B]"
            />
          </div>

          <div className="min-w-0">
            <h2 className="text-[12px] font-semibold text-[#17221D]">
              Loan Accounts
            </h2>

            <p className="mt-0.5 text-[9px] text-slate-400">
              Loan details and repayment status
            </p>
          </div>
        </div>

        <span className="shrink-0 rounded-full bg-slate-50 px-2.5 py-1 text-[9px] font-medium text-slate-500">
          {loans.length.toLocaleString(
            "en-IN"
          )}{" "}
          records
        </span>
      </div>

      {/* =================================================
          TABLE
      ================================================== */}

      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1280px] border-collapse">
          <thead className="bg-[#F8FAF9]">
            <tr className="border-b border-slate-200">
              <TableHeader className="w-[120px]">
                Loan Number
              </TableHeader>

              <TableHeader className="w-[165px]">
                Customer
              </TableHeader>

              <TableHeader className="w-[165px]">
                Vehicle
              </TableHeader>

              <TableHeader
                align="right"
                className="w-[115px]"
              >
                Loan Amount
              </TableHeader>

              <TableHeader
                align="right"
                className="w-[105px]"
              >
                Interest Rate
              </TableHeader>

              <TableHeader
                align="right"
                className="w-[105px]"
              >
                EMI Amount
              </TableHeader>

              <TableHeader className="w-[90px]">
                Tenure
              </TableHeader>

              <TableHeader className="w-[110px]">
                Start Date
              </TableHeader>

              <TableHeader className="w-[115px]">
                Maturity Date
              </TableHeader>

              <TableHeader
                align="right"
                className="w-[120px]"
              >
                Outstanding
              </TableHeader>

              <TableHeader className="w-[100px]">
                Status
              </TableHeader>

              <TableHeader
                align="center"
                className="w-[75px]"
              >
                Actions
              </TableHeader>
            </tr>
          </thead>

          <tbody>
            {loans.length > 0 ? (
              loans.map((loan) => {
                const id =
                  loan?.id ||
                  loan?.loanNumber;

                return (
                  <LoanTableRow
                    key={id}
                    loan={loan}
                    onViewLoan={onViewLoan}
                    openMenuId={
                      openMenuId
                    }
                    setOpenMenuId={
                      setOpenMenuId
                    }
                    menuPosition={
                      menuPosition
                    }
                    setMenuPosition={
                      setMenuPosition
                    }
                  />
                );
              })
            ) : (
              <EmptyTableState />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

/* =========================================================
   TABLE HEADER
========================================================= */

const TableHeader = ({
  children,
  align = "left",
  className = "",
}) => {
  return (
    <th
      className={`
        whitespace-nowrap
        px-3
        py-3
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.04em]
        text-slate-400
        ${className}
        ${
          align === "right"
            ? "text-right"
            : align === "center"
            ? "text-center"
            : "text-left"
        }
      `}
    >
      {children}
    </th>
  );
};

/* =========================================================
   EMPTY STATE
========================================================= */

const EmptyTableState = () => {
  return (
    <tr>
      <td
        colSpan={12}
        className="px-6 py-12 text-center"
      >
        <div className="mx-auto max-w-[280px]">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
            <ClipboardList
              size={18}
              className="text-slate-400"
            />
          </div>

          <p className="mt-3 text-[12px] font-semibold text-[#17221D]">
            No loans found
          </p>

          <p className="mt-1 text-[10px] leading-5 text-slate-400">
            Loans matching your current filters
            will appear here.
          </p>
        </div>
      </td>
    </tr>
  );
};

export default LoanTable;