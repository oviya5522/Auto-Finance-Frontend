// src/pages/collection/CollectionManagement.jsx

import {
  CheckCircle2,
  Clock3,
  Eye,
  IndianRupee,
  Search,
  XCircle,
  LogOut,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCollections,
  approveCollection,
  rejectCollection,
} from "../../services/collectionStorage";

import {
  getSession,
  logout,
} from "../../services/authStorage";

import {
  useNavigate,
} from "react-router-dom";

const CollectionManagement = () => {
  const navigate =
    useNavigate();

  const [
    collections,
    setCollections,
  ] = useState(
    () => getCollections()
  );

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("All");

  const [
    selectedCollection,
    setSelectedCollection,
  ] = useState(null);

  const [
    rejectRemarks,
    setRejectRemarks,
  ] = useState("");

  /* =====================================================
     SYNC
  ====================================================== */

  useEffect(() => {
    const reload = () => {
      setCollections(
        getCollections()
      );
    };

    reload();

    window.addEventListener(
      "auto-finance:data-updated",
      reload
    );

    window.addEventListener(
      "storage",
      reload
    );

    return () => {
      window.removeEventListener(
        "auto-finance:data-updated",
        reload
      );

      window.removeEventListener(
        "storage",
        reload
      );
    };
  }, []);

  /* =====================================================
     METRICS
  ====================================================== */

  const pendingCollections =
    useMemo(() => {
      return collections.filter(
        (item) =>
          normalize(
            item?.status
          ) === "pending"
      );
    }, [collections]);

  const approvedCollections =
    useMemo(() => {
      return collections.filter(
        (item) =>
          normalize(
            item?.status
          ) === "approved"
      );
    }, [collections]);

  const rejectedCollections =
    useMemo(() => {
      return collections.filter(
        (item) =>
          normalize(
            item?.status
          ) === "rejected"
      );
    }, [collections]);

  const approvedAmount =
    approvedCollections.reduce(
      (sum, item) =>
        sum +
        Number(
          item?.amount || 0
        ),
      0
    );

  const pendingAmount =
    pendingCollections.reduce(
      (sum, item) =>
        sum +
        Number(
          item?.amount || 0
        ),
      0
    );

  /* =====================================================
     FILTER
  ====================================================== */

  const filteredCollections =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      return collections.filter(
        (item) => {
          const searchable =
            [
              item?.id,
              item?.staffName,
              item?.customerName,
              item?.customerId,
              item?.loanNumber,
              item?.paymentMode,
              item?.location,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            !query ||
            searchable.includes(
              query
            );

          const matchesStatus =
            statusFilter ===
              "All" ||
            normalize(
              item?.status
            ) ===
              statusFilter
                .toLowerCase();

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      collections,
      search,
      statusFilter,
    ]);

  /* =====================================================
     APPROVE
  ====================================================== */

  const handleApprove = (
    collection
  ) => {
    const session =
      getSession();

    approveCollection(
      collection.id,
      session
    );

    setSelectedCollection(
      null
    );
  };

  /* =====================================================
     REJECT
  ====================================================== */

  const handleReject = (
    collection
  ) => {
    const session =
      getSession();

    rejectCollection(
      collection.id,
      session,
      rejectRemarks
    );

    setRejectRemarks("");

    setSelectedCollection(
      null
    );
  };

  /* =====================================================
     LOGOUT
  ====================================================== */

  const handleLogout = () => {
    logout();

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <div
      className="
        min-h-full
        bg-[#F6F8F7]
        px-3
        py-3
        sm:px-4
        lg:px-5
      "
    >
      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wide text-[#0B6B43]">
            Auto Finance
          </p>

          <h1 className="mt-0.5 text-[21px] font-extrabold text-[#17221D]">
            Collection Management
          </h1>

          <p className="mt-1 text-[10px] text-slate-400">
            Review and approve staff-submitted collections
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="
            inline-flex
            h-9
            items-center
            justify-center
            gap-1.5
            self-start
            rounded-lg
            border
            border-slate-200
            bg-white
            px-3
            text-[9px]
            font-bold
            text-slate-500
            hover:bg-slate-50
            sm:self-auto
          "
        >
          <LogOut size={13} />
          Logout
        </button>
      </div>

      {/* KPI */}

      <div
        className="
          mt-4
          grid
          grid-cols-1
          gap-2.5
          sm:grid-cols-2
          lg:grid-cols-4
        "
      >
        <CollectionMetric
          icon={Clock3}
          label="Pending Approval"
          count={
            pendingCollections.length
          }
          amount={
            pendingAmount
          }
          tone="amber"
        />

        <CollectionMetric
          icon={CheckCircle2}
          label="Approved"
          count={
            approvedCollections.length
          }
          amount={
            approvedAmount
          }
          tone="green"
        />

        <CollectionMetric
          icon={XCircle}
          label="Rejected"
          count={
            rejectedCollections.length
          }
          amount={0}
          tone="red"
        />

        <CollectionMetric
          icon={IndianRupee}
          label="Approved Earnings"
          count=""
          amount={
            approvedAmount
          }
          tone="blue"
        />
      </div>

      {/* FILTER */}

      <div
        className="
          mt-3
          rounded-xl
          border
          border-slate-200
          bg-white
          p-2.5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-2
            lg:flex-row
            lg:items-center
          "
        >
          <div className="relative min-w-0 flex-1">
            <Search
              size={13}
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
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search collection, staff, customer, loan..."
              className="
                h-9
                w-full
                rounded-lg
                border
                border-slate-200
                pl-8
                pr-3
                text-[10px]
                font-semibold
                outline-none
                focus:border-[#9CCEB1]
              "
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="
              h-9
              rounded-lg
              border
              border-slate-200
              bg-white
              px-3
              text-[9px]
              font-bold
              text-slate-600
            "
          >
            <option>
              All
            </option>

            <option>
              Pending
            </option>

            <option>
              Approved
            </option>

            <option>
              Rejected
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}

      <div
        className="
          mt-3
          overflow-hidden
          rounded-xl
          border
          border-slate-200
          bg-white
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-4
            py-3
          "
        >
          <div>
            <h2 className="text-[12px] font-extrabold text-[#17221D]">
              Collections
            </h2>

            <p className="mt-0.5 text-[8px] text-slate-400">
              {
                filteredCollections.length
              }{" "}
              records
            </p>
          </div>

          <span className="rounded-full bg-[#EAF5EF] px-2.5 py-1 text-[8px] font-bold text-[#0B5D3B]">
            Approved ₹
            {money(
              approvedAmount
            )}
          </span>
        </div>

        {filteredCollections.length ===
        0 ? (
          <div className="px-5 py-14 text-center">
            <IndianRupee
              size={22}
              className="mx-auto text-slate-300"
            />

            <p className="mt-2 text-[11px] font-bold text-slate-500">
              No collections found
            </p>

            <p className="mt-1 text-[8px] text-slate-400">
              Staff-submitted collections will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] border-collapse">
              <thead className="bg-[#F8FAF9]">
                <tr>
                  <TableHead>
                    Collection ID
                  </TableHead>

                  <TableHead>
                    Staff
                  </TableHead>

                  <TableHead>
                    Customer
                  </TableHead>

                  <TableHead>
                    Loan
                  </TableHead>

                  <TableHead>
                    Amount
                  </TableHead>

                  <TableHead>
                    Payment
                  </TableHead>

                  <TableHead>
                    Location
                  </TableHead>

                  <TableHead>
                    Status
                  </TableHead>

                  <TableHead>
                    Action
                  </TableHead>
                </tr>
              </thead>

              <tbody>
                {filteredCollections.map(
                  (collection) => (
                    <tr
                      key={
                        collection.id
                      }
                      className="border-b border-slate-100 hover:bg-[#FAFCFB]"
                    >
                      <td className="px-4 py-3">
                        <p className="text-[9px] font-bold text-[#0B6B43]">
                          {
                            collection.id
                          }
                        </p>

                        <p className="mt-0.5 text-[7px] text-slate-400">
                          {formatDate(
                            collection.submittedAt
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-[9px] font-bold text-[#253252]">
                          {
                            collection.staffName
                          }
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-[9px] font-bold text-[#253252]">
                          {
                            collection.customerName
                          }
                        </p>

                        <p className="mt-0.5 text-[7px] text-slate-400">
                          {
                            collection.customerId ||
                            "—"
                          }
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-[9px] font-bold text-[#253252]">
                          {
                            collection.loanNumber
                          }
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-[11px] font-extrabold text-[#17221D]">
                          ₹
                          {money(
                            collection.amount
                          )}
                        </p>

                        <p className="mt-0.5 text-[7px] text-slate-400">
                          Due ₹
                          {money(
                            collection.dueAmount
                          )}
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-[9px] font-semibold text-[#253252]">
                          {
                            collection.paymentMode
                          }
                        </p>
                      </td>

                      <td className="max-w-[160px] px-4 py-3">
                        <p className="truncate text-[8px] font-semibold text-[#253252]">
                          {
                            collection.location ||
                            "—"
                          }
                        </p>
                      </td>

                      <td className="px-4 py-3">
                        <CollectionStatus
                          status={
                            collection.status
                          }
                        />
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedCollection(
                              collection
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            gap-1
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-2.5
                            py-1.5
                            text-[8px]
                            font-bold
                            text-slate-600
                            hover:bg-slate-50
                          "
                        >
                          <Eye size={11} />
                          View
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW MODAL */}

      {selectedCollection && (
        <div
          className="
            fixed
            inset-0
            z-[700]
            flex
            items-center
            justify-center
            bg-slate-950/45
            p-4
            backdrop-blur-[3px]
          "
          onClick={() =>
            setSelectedCollection(
              null
            )
          }
        >
          <div
            className="
              w-full
              max-w-[560px]
              overflow-hidden
              rounded-2xl
              bg-white
              shadow-2xl
            "
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className="
                flex
                items-center
                justify-between
                border-b
                border-slate-100
                px-5
                py-3.5
              "
            >
              <div>
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
                  Collection
                </p>

                <h2 className="mt-0.5 text-[16px] font-extrabold text-[#17221D]">
                  {
                    selectedCollection.id
                  }
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedCollection(
                    null
                  )
                }
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  hover:bg-slate-50
                "
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div
                className="
                  rounded-xl
                  bg-[#F2FAF5]
                  px-4
                  py-3
                "
              >
                <p className="text-[8px] font-bold uppercase text-[#0B6B43]">
                  Collection Amount
                </p>

                <p className="mt-1 text-2xl font-extrabold text-[#0B6B43]">
                  ₹
                  {money(
                    selectedCollection.amount
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Info
                  label="Staff"
                  value={
                    selectedCollection.staffName
                  }
                />

                <Info
                  label="Customer"
                  value={
                    selectedCollection.customerName
                  }
                />

                <Info
                  label="Loan"
                  value={
                    selectedCollection.loanNumber
                  }
                />

                <Info
                  label="Payment Mode"
                  value={
                    selectedCollection.paymentMode
                  }
                />

                <Info
                  label="Due Amount"
                  value={`₹${money(
                    selectedCollection.dueAmount
                  )}`}
                />

                <Info
                  label="Location"
                  value={
                    selectedCollection.location
                  }
                />

                <Info
                  label="Submitted"
                  value={formatDateTime(
                    selectedCollection.submittedAt
                  )}
                />

                <Info
                  label="Status"
                  value={
                    selectedCollection.status
                  }
                />

                <div className="col-span-2">
                  <Info
                    label="Remarks"
                    value={
                      selectedCollection.remarks
                    }
                  />
                </div>
              </div>

              {normalize(
                selectedCollection.status
              ) ===
                "pending" && (
                <>
                  <textarea
                    value={
                      rejectRemarks
                    }
                    onChange={(
                      event
                    ) =>
                      setRejectRemarks(
                        event.target
                          .value
                      )
                    }
                    rows={3}
                    className="
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-slate-200
                      px-3
                      py-2
                      text-[10px]
                      outline-none
                      focus:border-red-300
                    "
                    placeholder="Optional rejection remarks"
                  />

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleReject(
                          selectedCollection
                        )
                      }
                      className="
                        flex
                        h-9
                        flex-1
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        bg-red-50
                        text-[9px]
                        font-bold
                        text-red-600
                        hover:bg-red-100
                      "
                    >
                      <XCircle
                        size={13}
                      />
                      Reject
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleApprove(
                          selectedCollection
                        )
                      }
                      className="
                        flex
                        h-9
                        flex-1
                        items-center
                        justify-center
                        gap-1.5
                        rounded-lg
                        bg-[#0B6B43]
                        text-[9px]
                        font-bold
                        text-white
                        hover:bg-[#095B3B]
                      "
                    >
                      <CheckCircle2
                        size={13}
                      />
                      Approve
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* =========================================================
   COMPONENTS
========================================================= */

const CollectionMetric = ({
  icon: Icon,
  label,
  count,
  amount,
  tone,
}) => {
  const tones = {
    green: {
      bg: "bg-[#F1FAF4]",
      icon: "bg-[#DDF1E5] text-[#0B6B43]",
      text: "text-[#0B6B43]",
    },

    amber: {
      bg: "bg-[#FFF8ED]",
      icon: "bg-[#FFF0CE] text-[#D88B12]",
      text: "text-[#B86D00]",
    },

    red: {
      bg: "bg-[#FFF4F4]",
      icon: "bg-[#FDE2E2] text-[#D92D3A]",
      text: "text-[#D92D3A]",
    },

    blue: {
      bg: "bg-[#F1F6FE]",
      icon: "bg-[#E1ECFD] text-[#4779D8]",
      text: "text-[#4779D8]",
    },
  };

  const current =
    tones[tone] ||
    tones.green;

  return (
    <div
      className={`
        rounded-xl
        border
        border-slate-200
        ${current.bg}
        px-3.5
        py-3
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
            {label}
          </p>

          {count !== "" && (
            <p
              className={`
                mt-1
                text-[20px]
                font-extrabold
                ${current.text}
              `}
            >
              {count}
            </p>
          )}

          <p
            className={`
              mt-1
              text-[11px]
              font-bold
              ${current.text}
            `}
          >
            ₹
            {money(
              amount
            )}
          </p>
        </div>

        <div
          className={`
            flex
            h-8
            w-8
            items-center
            justify-center
            rounded-lg
            ${current.icon}
          `}
        >
          <Icon size={15} />
        </div>
      </div>
    </div>
  );
};

const CollectionStatus = ({
  status,
}) => {
  const normalized =
    normalize(status);

  const classes =
    normalized ===
    "approved"
      ? "bg-[#EAF5EF] text-[#0B6B43]"
      : normalized ===
        "rejected"
      ? "bg-red-50 text-red-600"
      : "bg-[#FFF4DE] text-[#B86D00]";

  return (
    <span
      className={`
        inline-flex
        rounded-full
        px-2
        py-1
        text-[7px]
        font-extrabold
        ${classes}
      `}
    >
      {status}
    </span>
  );
};

const TableHead = ({
  children,
}) => (
  <th
    className="
      whitespace-nowrap
      px-4
      py-2.5
      text-left
      text-[8px]
      font-bold
      uppercase
      tracking-wide
      text-slate-400
    "
  >
    {children}
  </th>
);

const Info = ({
  label,
  value,
}) => (
  <div className="min-w-0">
    <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 break-words text-[10px] font-bold text-[#253252]">
      {value || "—"}
    </p>
  </div>
);

const normalize = (
  value
) =>
  String(value || "")
    .trim()
    .toLowerCase();

const money = (
  value
) =>
  Number(
    value || 0
  ).toLocaleString(
    "en-IN",
    {
      maximumFractionDigits: 2,
    }
  );

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const formatDateTime = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
};

export default CollectionManagement;