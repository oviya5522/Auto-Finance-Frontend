// src/pages/customers/CustomerPage.jsx

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Users,
  UserCheck,
  IndianRupee,
  Search,
  Plus,
  Eye,
  MoreVertical,
  SlidersHorizontal,
  ArrowUpDown,
  UserRound,
} from "lucide-react";

import {
  getCustomers,
  getOutstandingAmount,
} from "../../services/customerStorage";

const CustomerPage = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const [openMenuId, setOpenMenuId] = useState(null);

  /* =====================================================
     LOAD CUSTOMERS
  ====================================================== */

  const loadCustomers = () => {
    try {
      const storedCustomers = getCustomers();

      setCustomers(
        Array.isArray(storedCustomers)
          ? storedCustomers
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load customers:",
        error
      );

      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();

    const handleUpdate = () => {
      loadCustomers();
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
  }, []);

  /* =====================================================
     HELPERS
  ====================================================== */

  const money = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );
  };

  const getVehicleName = (customer) => {
    const vehicle = customer?.vehicle || {};

    return (
      [
        vehicle.brand,
        vehicle.model,
        vehicle.variant,
      ]
        .filter(Boolean)
        .join(" ") || "Not assigned"
    );
  };

  const getRegistrationNumber = (
    customer
  ) => {
    return (
      customer?.rc?.registrationNumber ||
      ""
    );
  };

  /* =====================================================
     STATS
  ====================================================== */

  const stats = useMemo(() => {
    const totalCustomers =
      customers.length;

    const activeCustomers =
      customers.filter(
        (customer) =>
          customer.customer?.status ===
          "Active"
      ).length;

    const totalOutstanding =
      customers.reduce(
        (total, customer) =>
          total +
          getOutstandingAmount(
            customer.loan
          ),
        0
      );

    return {
      totalCustomers,
      activeCustomers,
      totalOutstanding,
    };
  }, [customers]);

  /* =====================================================
     FILTER + SEARCH + SORT
  ====================================================== */

  const filteredCustomers = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    const filtered = customers.filter(
      (customer) => {
        const personal =
          customer.customer?.personal ||
          {};

        const loan =
          customer.loan || {};

        const registration =
          getRegistrationNumber(
            customer
          );

        const vehicleName =
          getVehicleName(
            customer
          );

        const matchesSearch =
          !query ||
          personal.name
            ?.toLowerCase()
            .includes(query) ||
          personal.mobileNumber
            ?.toLowerCase()
            .includes(query) ||
          customer.customer?.id
            ?.toLowerCase()
            .includes(query) ||
          customer.customer
            ?.customerNumber
            ?.toLowerCase()
            .includes(query) ||
          vehicleName
            .toLowerCase()
            .includes(query) ||
          registration
            .toLowerCase()
            .includes(query) ||
          loan.loanNumber
            ?.toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "All" ||
          customer.customer?.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );

    return [...filtered].sort(
      (a, b) => {
        const aPersonal =
          a.customer?.personal || {};

        const bPersonal =
          b.customer?.personal || {};

        let aValue = "";
        let bValue = "";

        switch (sortBy) {
          case "outstanding":
            aValue =
              getOutstandingAmount(
                a.loan
              );
            bValue =
              getOutstandingAmount(
                b.loan
              );
            break;

          case "loan":
            aValue =
              Number(
                a.loan?.loanAmount || 0
              );
            bValue =
              Number(
                b.loan?.loanAmount || 0
              );
            break;

          default:
            aValue = (
              aPersonal.name || ""
            ).toLowerCase();

            bValue = (
              bPersonal.name || ""
            ).toLowerCase();
        }

        if (
          typeof aValue === "number" &&
          typeof bValue === "number"
        ) {
          return sortOrder === "asc"
            ? aValue - bValue
            : bValue - aValue;
        }

        return sortOrder === "asc"
          ? String(aValue).localeCompare(
              String(bValue)
            )
          : String(bValue).localeCompare(
              String(aValue)
            );
      }
    );
  }, [
    customers,
    search,
    statusFilter,
    sortBy,
    sortOrder,
  ]);

  /* =====================================================
     NAVIGATION
  ====================================================== */

  const handleAddCustomer = () => {
    navigate(
      "/customers/onboarding"
    );
  };

  const handleSort = (value) => {
    if (sortBy === value) {
      setSortOrder((previous) =>
        previous === "asc"
          ? "desc"
          : "asc"
      );
      return;
    }

    setSortBy(value);
    setSortOrder("asc");
  };

  /* =====================================================
     LOADING
  ====================================================== */

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#F8FAF9]">
        <p className="text-sm text-slate-500">
          Loading customers...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAF9] p-4 sm:p-5 lg:p-6">

      {/* =================================================
          PAGE HEADER
      ================================================== */}

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="min-w-0">

          <h1 className="text-[22px] font-semibold tracking-tight text-[#17221D] sm:text-[24px]">
            Customers
          </h1>

          <p className="mt-0.5 text-xs text-[#68756E] sm:text-sm">
            Manage customer information and vehicle finance records
          </p>

        </div>

        <button
          type="button"
          onClick={handleAddCustomer}
          className="
            inline-flex
            h-10
            w-fit
            items-center
            justify-center
            gap-2
            rounded-lg
            bg-[#0B5D3B]
            px-3.5
            text-xs
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-[#084A30]
          "
        >
          <Plus size={16} />
          Add Customer
        </button>

      </div>


      {/* =================================================
          SUMMARY
      ================================================== */}

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

        <StatCard
          label="Total Customers"
          value={stats.totalCustomers}
          icon={Users}
        />

        <StatCard
          label="Active Customers"
          value={stats.activeCustomers}
          icon={UserCheck}
          green
        />

        <StatCard
          label="Total Outstanding"
          value={`₹${money(
            stats.totalOutstanding
          )}`}
          icon={IndianRupee}
          gold
          emphasize
        />

      </div>


      {/* =================================================
          TOOLBAR
      ================================================== */}

      <div className="mb-3 rounded-xl border border-slate-200 bg-white p-2.5">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">

          {/* SEARCH */}

          <div className="relative min-w-0 flex-1">

            <Search
              size={16}
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search by name, mobile, customer ID, vehicle..."
              className="
                h-9
                w-full
                rounded-lg
                border
                border-slate-200
                bg-white
                pl-9
                pr-3
                text-xs
                text-slate-700
                placeholder:text-slate-400
                outline-none
                transition
                focus:border-[#0B5D3B]
                focus:ring-1
                focus:ring-[#0B5D3B]
              "
            />

          </div>


          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-xs
              font-medium
              text-slate-600
              outline-none
              focus:border-[#0B5D3B]
            "
          >
            <option value="All">
              All Status
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>


          {/* FILTER BUTTON */}

          <button
            type="button"
            className="
              inline-flex
              h-9
              items-center
              justify-center
              gap-1.5
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-xs
              font-medium
              text-slate-500
              hover:border-slate-300
              hover:text-slate-700
            "
          >
            <SlidersHorizontal
              size={14}
            />
            <span className="hidden md:inline">
              Filter
            </span>
          </button>


          {/* SORT */}

          <div className="relative">

            <button
              type="button"
              onClick={() =>
                handleSort("name")
              }
              className="
                inline-flex
                h-9
                items-center
                justify-center
                gap-1.5
                rounded-lg
                border
                border-slate-200
                bg-white
                px-3
                text-xs
                font-medium
                text-slate-500
                hover:border-slate-300
                hover:text-slate-700
              "
              title="Sort customers"
            >
              <ArrowUpDown size={14} />
              <span className="hidden md:inline">
                Sort
              </span>
            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          CUSTOMER COUNT
      ================================================== */}

      <div className="mb-2 flex items-center justify-between px-1">

        <p className="text-[11px] font-medium text-slate-400">
          {filteredCustomers.length}{" "}
          {filteredCustomers.length ===
          1
            ? "customer"
            : "customers"}
        </p>

      </div>


      {/* =================================================
          DESKTOP TABLE
      ================================================== */}

      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">

        <div className="overflow-x-auto">

          <table className="w-full min-w-[930px]">

            <thead className="border-b border-slate-200 bg-[#F8FAF9]">

              <tr>

                <TableHeader>
                  Customer
                </TableHeader>

                <TableHeader>
                  Contact
                </TableHeader>

                <TableHeader>
                  Vehicle
                </TableHeader>

                <TableHeader align="right">
                  Loan Amount
                </TableHeader>

                <TableHeader align="right">
                  Outstanding
                </TableHeader>

                <TableHeader align="center">
                  Status
                </TableHeader>

                <TableHeader align="center">
                  Action
                </TableHeader>

              </tr>

            </thead>


            <tbody>

              {filteredCustomers.length ===
              0 ? (
                <EmptyRow
                  onAdd={handleAddCustomer}
                />
              ) : (
                filteredCustomers.map(
                  (customer) => (
                    <CustomerTableRow
                      key={
                        customer.customer
                          ?.id
                      }
                      customer={
                        customer
                      }
                      money={money}
                      getVehicleName={
                        getVehicleName
                      }
                      getRegistrationNumber={
                        getRegistrationNumber
                      }
                      onView={() =>
                        navigate(
                          `/customers/${customer.customer?.id}`
                        )
                      }
                    />
                  )
                )
              )}

            </tbody>

          </table>

        </div>

      </div>


      {/* =================================================
          MOBILE CARDS
      ================================================== */}

      <div className="space-y-2.5 md:hidden">

        {filteredCustomers.length ===
        0 ? (
          <div className="rounded-xl border border-slate-200 bg-white">
            <EmptyContent
              onAdd={handleAddCustomer}
            />
          </div>
        ) : (
          filteredCustomers.map(
            (customer) => (
              <CustomerMobileCard
                key={
                  customer.customer?.id
                }
                customer={customer}
                money={money}
                getVehicleName={
                  getVehicleName
                }
                getRegistrationNumber={
                  getRegistrationNumber
                }
                onView={() =>
                  navigate(
                    `/customers/${customer.customer?.id}`
                  )
                }
              />
            )
          )
        )}

      </div>

    </div>
  );
};


/* =========================================================
   STAT CARD
========================================================= */

const StatCard = ({
  label,
  value,
  icon: Icon,
  green = false,
  gold = false,
  emphasize = false,
}) => {
  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        px-4
        py-3.5
      "
    >
      <div className="flex items-center justify-between">

        <div className="min-w-0">

          <p className="text-[11px] font-medium text-slate-500">
            {label}
          </p>

          <p
            className={`
              mt-1.5
              truncate
              text-[21px]
              font-semibold
              tracking-tight
              ${
                emphasize || green
                  ? "text-[#0B5D3B]"
                  : "text-[#17221D]"
              }
            `}
          >
            {value}
          </p>

        </div>


        <div
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-lg

            ${
              gold
                ? "bg-[#FBF4DD]"
                : "bg-[#EAF5EF]"
            }
          `}
        >
          <Icon
            size={17}
            className={
              gold
                ? "text-[#D4A72C]"
                : "text-[#0B5D3B]"
            }
          />
        </div>

      </div>
    </div>
  );
};


/* =========================================================
   DESKTOP TABLE ROW
========================================================= */

const CustomerTableRow = ({
  customer,
  money,
  getVehicleName,
  getRegistrationNumber,
  onView,
}) => {
  const personal =
    customer.customer?.personal ||
    {};

  const vehicle =
    customer.vehicle || {};

  const loan =
    customer.loan || {};

  const outstanding =
    getOutstandingAmount(loan);

  const vehicleName =
    getVehicleName(customer);

  const registration =
    getRegistrationNumber(customer);

  return (
    <tr
      onDoubleClick={onView}
      className="
        cursor-pointer
        border-b
        border-slate-100
        last:border-0
        transition-colors
        hover:bg-[#FAFCFB]
      "
    >

      {/* CUSTOMER */}

      <td className="px-4 py-3">

        <div className="flex items-center gap-2.5">

          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#EAF5EF]
              text-xs
              font-semibold
              text-[#0B5D3B]
            "
          >
            {personal.name
              ?.charAt(0)
              ?.toUpperCase() || "C"}
          </div>

          <div className="min-w-0">

            <p className="truncate text-xs font-semibold text-[#17221D]">
              {personal.name ||
                "Unnamed Customer"}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-slate-400">
              {customer.customer
                ?.customerNumber ||
                customer.customer?.id ||
                "—"}
            </p>

          </div>

        </div>

      </td>


      {/* CONTACT */}

      <td className="px-4 py-3">

        <p className="text-xs text-slate-600">
          {personal.mobileNumber ||
            "—"}
        </p>

      </td>


      {/* VEHICLE */}

      <td className="px-4 py-3">

        <p
          className={`
            truncate
            text-xs
            font-medium
            ${
              vehicleName ===
              "Not assigned"
                ? "text-slate-400"
                : "text-slate-700"
            }
          `}
        >
          {vehicleName}
        </p>

        {registration && (
          <p className="mt-0.5 text-[10px] uppercase text-slate-400">
            {registration}
          </p>
        )}

      </td>


      {/* LOAN */}

      <td className="px-4 py-3 text-right">

        <p className="text-xs font-medium text-slate-700">
          ₹{money(
            loan.loanAmount
          )}
        </p>

      </td>


      {/* OUTSTANDING */}

      <td className="px-4 py-3 text-right">

        <p className="text-xs font-semibold text-[#0B5D3B]">
          ₹{money(outstanding)}
        </p>

      </td>


      {/* STATUS */}

      <td className="px-4 py-3 text-center">

        <StatusBadge
          status={
            customer.customer
              ?.status || "Unknown"
          }
        />

      </td>


      {/* ACTION */}

      <td className="px-4 py-3">

        <div className="flex items-center justify-center gap-1.5">

          <button
            type="button"
            onClick={onView}
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-md
              border
              border-slate-200
              text-slate-500
              transition
              hover:border-[#0B5D3B]
              hover:text-[#0B5D3B]
            "
            title="View customer"
          >
            <Eye size={14} />
          </button>


          <button
            type="button"
            className="
              flex
              h-7
              w-7
              items-center
              justify-center
              rounded-md
              border
              border-slate-200
              text-slate-400
              transition
              hover:border-slate-300
              hover:text-slate-700
            "
            title="More"
          >
            <MoreVertical size={14} />
          </button>

        </div>

      </td>

    </tr>
  );
};


/* =========================================================
   MOBILE CARD
========================================================= */

const CustomerMobileCard = ({
  customer,
  money,
  getVehicleName,
  getRegistrationNumber,
  onView,
}) => {
  const personal =
    customer.customer?.personal ||
    {};

  const loan =
    customer.loan || {};

  const vehicleName =
    getVehicleName(customer);

  const registration =
    getRegistrationNumber(customer);

  const outstanding =
    getOutstandingAmount(loan);

  return (
    <div
      className="
        rounded-xl
        border
        border-slate-200
        bg-white
        p-3.5
      "
    >

      <div className="flex items-start gap-3">

        <div
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-[#EAF5EF]
            text-xs
            font-semibold
            text-[#0B5D3B]
          "
        >
          {personal.name
            ?.charAt(0)
            ?.toUpperCase() || "C"}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-2">

            <div className="min-w-0">

              <p className="truncate text-xs font-semibold text-[#17221D]">
                {personal.name ||
                  "Unnamed Customer"}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-400">
                {customer.customer
                  ?.customerNumber ||
                  customer.customer?.id ||
                  "—"}
              </p>

            </div>

            <StatusBadge
              status={
                customer.customer
                  ?.status || "Unknown"
              }
            />

          </div>

        </div>

      </div>


      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">

        <MobileDetail
          label="Mobile"
          value={
            personal.mobileNumber ||
            "—"
          }
        />

        <MobileDetail
          label="Vehicle"
          value={vehicleName}
          muted={
            vehicleName ===
            "Not assigned"
          }
        />

        <MobileDetail
          label="Loan Amount"
          value={`₹${money(
            loan.loanAmount
          )}`}
        />

        <MobileDetail
          label="Outstanding"
          value={`₹${money(
            outstanding
          )}`}
          green
        />

        {registration && (
          <MobileDetail
            label="Registration"
            value={registration}
          />
        )}

      </div>


      <button
        type="button"
        onClick={onView}
        className="
          mt-3
          flex
          h-8
          w-full
          items-center
          justify-center
          gap-1.5
          rounded-lg
          border
          border-slate-200
          text-[11px]
          font-semibold
          text-slate-600
          hover:border-[#0B5D3B]
          hover:text-[#0B5D3B]
        "
      >
        <Eye size={13} />
        View Customer
      </button>

    </div>
  );
};


/* =========================================================
   MOBILE DETAIL
========================================================= */

const MobileDetail = ({
  label,
  value,
  muted = false,
  green = false,
}) => {
  return (
    <div className="min-w-0">

      <p className="text-[9px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p
        className={`
          mt-0.5
          truncate
          text-[11px]
          font-medium
          ${
            muted
              ? "text-slate-400"
              : green
              ? "text-[#0B5D3B]"
              : "text-slate-700"
          }
        `}
      >
        {value}
      </p>

    </div>
  );
};


/* =========================================================
   STATUS
========================================================= */

const StatusBadge = ({
  status,
}) => {
  const active =
    status === "Active";

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2
        py-1
        text-[9px]
        font-semibold

        ${
          active
            ? "bg-[#EAF5EF] text-[#0B5D3B]"
            : "bg-slate-100 text-slate-500"
        }
      `}
    >
      {status}
    </span>
  );
};


/* =========================================================
   EMPTY DESKTOP ROW
========================================================= */

const EmptyRow = ({
  onAdd,
}) => {
  return (
    <tr>
      <td
        colSpan={7}
        className="px-6 py-14"
      >
        <EmptyContent
          onAdd={onAdd}
        />
      </td>
    </tr>
  );
};


/* =========================================================
   EMPTY CONTENT
========================================================= */

const EmptyContent = ({
  onAdd,
}) => {
  return (
    <div className="flex flex-col items-center text-center">

      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF5EF]">

        <UserRound
          size={19}
          className="text-[#0B5D3B]"
        />

      </div>

      <h3 className="mt-3 text-sm font-semibold text-[#17221D]">
        No customers found
      </h3>

      <p className="mt-1 max-w-xs text-xs text-slate-400">
        Add a customer to start managing customer and vehicle finance records.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="
          mt-3
          inline-flex
          items-center
          gap-1.5
          rounded-lg
          bg-[#0B5D3B]
          px-3.5
          py-2
          text-[11px]
          font-semibold
          text-white
          hover:bg-[#084A30]
        "
      >
        <Plus size={14} />
        Add Customer
      </button>

    </div>
  );
};


/* =========================================================
   TABLE HEADER
========================================================= */

const TableHeader = ({
  children,
  align = "left",
}) => {
  return (
    <th
      className={`
        whitespace-nowrap
        px-4
        py-2.5
        text-[9px]
        font-semibold
        uppercase
        tracking-[0.08em]
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
};

export default CustomerPage;