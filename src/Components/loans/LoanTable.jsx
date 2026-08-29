import { useEffect, useMemo, useState } from "react";

import {
  Square,
  Check,
  Minus,
} from "lucide-react";

import LoanTableRow from "./LoanTableRow";

const LoanTable = ({
  loans = [],
  onViewLoan,
}) => {
  /* =====================================================
     SELECTION
  ====================================================== */

  const [selectedIds, setSelectedIds] = useState([]);

  /* =====================================================
     SINGLE OPEN ACTION MENU
  ====================================================== */

  const [openMenuId, setOpenMenuId] = useState(null);

  const [menuPosition, setMenuPosition] = useState({
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
            loan.id || loan.loanNumber
        )
        .filter(Boolean),
    [loans]
  );

  /* =====================================================
     KEEP SELECTION VALID WHEN LOANS CHANGE
  ====================================================== */

  useEffect(() => {
    setSelectedIds((current) =>
      current.filter((id) =>
        loanIds.includes(id)
      )
    );

    setOpenMenuId((current) =>
      current && loanIds.includes(current)
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

  /* =====================================================
     SELECT ALL
  ====================================================== */

  const allSelected =
    loanIds.length > 0 &&
    selectedIds.length === loanIds.length;

  const someSelected =
    selectedIds.length > 0 &&
    selectedIds.length < loanIds.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }

    setSelectedIds(loanIds);
  };

  /* =====================================================
     SELECT INDIVIDUAL LOAN
  ====================================================== */

  const toggleSelectLoan = (id) => {
    setSelectedIds((current) => {
      if (current.includes(id)) {
        return current.filter(
          (item) => item !== id
        );
      }

      return [...current, id];
    });
  };

  /* =====================================================
     CLEAR SELECTION
  ====================================================== */

  const clearSelection = () => {
    setSelectedIds([]);
  };

  return (
<div className="mt-3 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* =================================================
          BULK ACTION BAR
      ================================================= */}

      {selectedIds.length > 0 && (
        <div
          className="
            flex
            items-center
            justify-between
            gap-3
            border-b
            border-slate-200
            bg-[#F8FAF9]
            px-4
            py-2.5
          "
        >
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#17221D]">
              {selectedIds.length} selected
            </span>

            <button
              type="button"
              onClick={clearSelection}
              className="
                rounded-md
                px-2
                py-1
                text-[10px]
                font-medium
                text-slate-500
                transition
                hover:bg-white
                hover:text-slate-700
              "
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              className="
                rounded-md
                border
                border-slate-200
                bg-white
                px-2.5
                py-1.5
                text-[10px]
                font-medium
                text-slate-600
                transition
                hover:border-slate-300
              "
            >
              Send Reminder
            </button>

            <button
              type="button"
              className="
                rounded-md
                border
                border-slate-200
                bg-white
                px-2.5
                py-1.5
                text-[10px]
                font-medium
                text-slate-600
                transition
                hover:border-slate-300
              "
            >
              Export Selected
            </button>
          </div>
        </div>
      )}

      {/* =================================================
          TABLE
      ================================================= */}

     <div className="overflow-x-hidden">
  <table className="w-full border-collapse">
          <thead className="bg-[#F8FAF9]">
            <tr className="border-b border-slate-200">

              {/* SELECT ALL */}
              <th
                className="
                  sticky
                  left-0
                  z-20
                  w-11
                  bg-[#F8FAF9]
                  px-3
                  py-2.5
                "
              >
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  aria-label={
                    allSelected
                      ? "Deselect all loans"
                      : "Select all loans"
                  }
                  className="
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded
                    border
                    border-slate-300
                    bg-white
                    text-[#0B5D3B]
                    transition
                    hover:border-[#0B5D3B]
                  "
                >
                  {allSelected ? (
                    <Check
                      size={13}
                      strokeWidth={2.5}
                    />
                  ) : someSelected ? (
                    <Minus
                      size={13}
                      strokeWidth={2.5}
                    />
                  ) : (
                    <Square
                      size={13}
                      className="text-transparent"
                    />
                  )}
                </button>
              </th>

              <TableHeader>
                Loan Number
              </TableHeader>

              <TableHeader>
                Customer
              </TableHeader>

              <TableHeader>
                Vehicle
              </TableHeader>

              <TableHeader align="right">
                Loan Amount
              </TableHeader>

              <TableHeader align="right">
                Down Payment
              </TableHeader>

              <TableHeader align="right">
                EMI
              </TableHeader>

              <TableHeader>
                Tenure
              </TableHeader>

              <TableHeader>
                Next Due Date
              </TableHeader>

              <TableHeader align="right">
                Outstanding
              </TableHeader>

              <TableHeader align="center">
                Overdue
              </TableHeader>

              <TableHeader>
                Status
              </TableHeader>

              <TableHeader align="center">
                Actions
              </TableHeader>

            </tr>
          </thead>

          <tbody>
            {loans.length ? (
              loans.map((loan) => {
                const id =
                  loan.id ||
                  loan.loanNumber;

                return (
                  <LoanTableRow
                    key={id}
                    loan={loan}
                    selected={selectedIds.includes(
                      id
                    )}
                    onSelect={() =>
                      toggleSelectLoan(id)
                    }
                    onViewLoan={onViewLoan}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                    menuPosition={menuPosition}
                    setMenuPosition={setMenuPosition}
                  />
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={13}
                  className="
                    px-6
                    py-16
                    text-center
                  "
                >
                  <p className="text-sm font-medium text-[#17221D]">
                    No loans found
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Loans matching your filters
                    will appear here.
                  </p>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
};

/* =========================================================
   TABLE HEADER
========================================================= */

const TableHeader = ({
  children,
  align = "left",
}) => (
  <th
    className={`
      whitespace-nowrap
      px-3.5
      py-2.5
      text-[9px]
      font-semibold
      uppercase
      tracking-wide
      text-slate-400
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

export default LoanTable;