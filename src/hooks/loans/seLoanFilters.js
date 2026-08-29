import { useEffect, useMemo, useState } from "react";

import {
  getLoanDueStatus,
  getLoanType,
  getCustomerName,
  getCustomerId,
  getCustomerMobile,
  getVehicleName,
  getRegistration,
  getNextDue,
  getDisplayLoanStatus,
  getLoanOutstanding,
} from "../../utils/loan/loanHelpers";

const useLoanFilters = (loans) => {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All Status");

  const [loanTypeFilter, setLoanTypeFilter] =
    useState("All Loan Types");

  const [dueFilter, setDueFilter] =
    useState("All Due Status");

  const [dateFilter, setDateFilter] =
    useState("");

  const [sortBy, setSortBy] =
    useState("recent");

  const filteredLoans = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    let result = loans.filter((loan) => {

      const searchableText = [
        loan?.loanNumber,
        getCustomerName(loan),
        getCustomerId(loan),
        getCustomerMobile(loan),
        getVehicleName(loan),
        getRegistration(loan),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query ||
        searchableText.includes(query);

      const status =
        getDisplayLoanStatus(loan);

      const dueStatus =
        getLoanDueStatus(loan);

      const matchesStatus =
        statusFilter === "All Status" ||
        status === statusFilter;

      const matchesLoanType =
        loanTypeFilter === "All Loan Types" ||
        getLoanType(loan) === loanTypeFilter;

      const matchesDue =
        dueFilter === "All Due Status" ||
        dueStatus === dueFilter;

      const nextDue =
        getNextDue(loan);

      const matchesDate =
        !dateFilter ||
        String(nextDue?.dueDate || "")
          .startsWith(dateFilter);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesLoanType &&
        matchesDue &&
        matchesDate
      );
    });

    result = [...result].sort((a, b) => {

      if (sortBy === "amountHigh") {
        return (
          Number(b.loanAmount || 0) -
          Number(a.loanAmount || 0)
        );
      }

      if (sortBy === "outstandingHigh") {
        return (
          getLoanOutstanding(b) -
          getLoanOutstanding(a)
        );
      }

      if (sortBy === "customer") {
        return getCustomerName(a).localeCompare(
          getCustomerName(b)
        );
      }

      if (sortBy === "dueSoon") {
        const aDate = new Date(
          getNextDue(a)?.dueDate ||
            "2999-12-31"
        ).getTime();

        const bDate = new Date(
          getNextDue(b)?.dueDate ||
            "2999-12-31"
        ).getTime();

        return aDate - bDate;
      }

      return 0;
    });

    return result;
  }, [
    loans,
    search,
    statusFilter,
    loanTypeFilter,
    dueFilter,
    dateFilter,
    sortBy,
  ]);

  useEffect(() => {
    // Reset pagination later when pagination is extracted.
  }, [
    search,
    statusFilter,
    loanTypeFilter,
    dueFilter,
    dateFilter,
    sortBy,
  ]);

  return {
    filteredLoans,

    search,
    setSearch,

    statusFilter,
    setStatusFilter,

    loanTypeFilter,
    setLoanTypeFilter,

    dueFilter,
    setDueFilter,

    dateFilter,
    setDateFilter,

    sortBy,
    setSortBy,
  };
};

export default useLoanFilters;